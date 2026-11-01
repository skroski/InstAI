import { Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';

export type SupabaseConnectionState = 'checking' | 'connected' | 'migration_pending' | 'offline';

export interface DbAiSkillRow {
  id?: string;
  tenant_id?: string | null;
  slash_command: string;
  name: string;
  category: string;
  preferred_engine: 'claude' | 'codex' | 'gemini' | 'auto';
  system_prompt: string;
  input_schema?: Record<string, unknown>;
  output_format?: string;
  is_active?: boolean;
}

export interface AuthSession {
  accessToken: string;
  email: string;
  expiresAt: number; // epoch em ms
}

const SESSION_KEY = 'codemix_auth_session';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  readonly url = environment.supabaseUrl;
  readonly publishableKey = environment.supabasePublishableKey;
  readonly functionsUrl = environment.functionsBaseUrl;
  readonly projectRef = 'gmwdahnksiqukovcwwid';

  readonly connectionState = signal<SupabaseConnectionState>('checking');
  readonly dbSkillsCount = signal<number>(0);

  // Sessão do usuário (login por e-mail com código). Fica só na aba: sessionStorage.
  readonly session = signal<AuthSession | null>(this.loadSession());

  private loadSession(): AuthSession | null {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      return raw ? (JSON.parse(raw) as AuthSession) : null;
    } catch {
      return null;
    }
  }

  private setSession(session: AuthSession | null): void {
    this.session.set(session);
    try {
      if (session) sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
      else sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // Sem storage disponível: a sessão vale só enquanto a página estiver aberta.
    }
  }

  /** Token de acesso válido, ou undefined se não houver sessão ou ela estiver perto de expirar. */
  accessToken(): string | undefined {
    const s = this.session();
    if (!s) return undefined;
    if (Date.now() > s.expiresAt - 60_000) {
      this.setSession(null);
      return undefined;
    }
    return s.accessToken;
  }

  /** Envia o código de 6 dígitos por e-mail. Só contas já existentes no Supabase Auth recebem. */
  async sendLoginCode(email: string): Promise<void> {
    const res = await fetch(`${this.url}/auth/v1/otp`, {
      method: 'POST',
      headers: this.authHeaders(),
      body: JSON.stringify({ email, create_user: false }),
    });
    if (!res.ok) throw new Error(await this.authErrorMessage(res, 'Não foi possível enviar o código'));
  }

  async verifyLoginCode(email: string, token: string): Promise<void> {
    const res = await fetch(`${this.url}/auth/v1/verify`, {
      method: 'POST',
      headers: this.authHeaders(),
      body: JSON.stringify({ type: 'email', email, token }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body.access_token) {
      throw new Error(await this.authErrorMessage(res, 'Código inválido ou expirado'));
    }
    this.setSession({
      accessToken: body.access_token,
      email: body.user?.email ?? email,
      expiresAt: Date.now() + Number(body.expires_in ?? 3600) * 1000,
    });
  }

  signOut(): void {
    this.setSession(null);
  }

  private authHeaders(): Record<string, string> {
    return { apikey: this.publishableKey, 'Content-Type': 'application/json' };
  }

  private async authErrorMessage(res: Response, fallback: string): Promise<string> {
    const body = await res.json().catch(() => ({}));
    return body.msg || body.error_description || body.error || fallback;
  }

  private get headers(): Record<string, string> {
    return {
      apikey: this.publishableKey,
      Authorization: `Bearer ${this.publishableKey}`,
      'Content-Type': 'application/json',
    };
  }

  async checkConnectionAndLoadSkills(): Promise<DbAiSkillRow[] | null> {
    if (typeof fetch === 'undefined') return null;
    try {
      const res = await fetch(
        `${this.url}/rest/v1/ai_skills?select=slash_command,name,category,preferred_engine,system_prompt,is_active&is_active=eq.true`,
        {
          method: 'GET',
          headers: this.headers,
        }
      );

      if (res.ok) {
        const rows = (await res.json()) as DbAiSkillRow[];
        this.connectionState.set('connected');
        this.dbSkillsCount.set(rows.length);
        return rows;
      }

      if (res.status === 404 || res.status === 400) {
        // PostgREST is reachable, but table ai_skills hasn't been created yet (migration pending)
        this.connectionState.set('migration_pending');
        return null;
      }

      this.connectionState.set('connected');
      return null;
    } catch {
      this.connectionState.set('offline');
      return null;
    }
  }

  async insertRow<T>(table: string, payload: Record<string, unknown>): Promise<T | null> {
    if (typeof fetch === 'undefined') return null;
    try {
      const res = await fetch(`${this.url}/rest/v1/${table}`, {
        method: 'POST',
        headers: {
          ...this.headers,
          Prefer: 'return=representation',
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) return null;
      const data = (await res.json()) as T[];
      return data[0] ?? null;
    } catch {
      return null;
    }
  }

  /**
   * Chama a edge function meta-marketing-api. Diferente de invokeEdgeFunction, devolve o erro
   * real do servidor (ex.: login necessário, conta fora do portfólio) em vez de null.
   */
  async callMetaApi<T>(
    action: string,
    options: { adAccountId?: string; payload?: Record<string, unknown>; userToken?: string } = {}
  ): Promise<T> {
    const headers = { ...this.headers, Authorization: `Bearer ${options.userToken || this.publishableKey}` };
    const res = await fetch(`${this.functionsUrl}/meta-marketing-api`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ action, adAccountId: options.adAccountId, payload: options.payload }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || body.success === false) {
      throw new Error(body.error || `Meta API respondeu ${res.status}`);
    }
    return body as T;
  }

  async invokeEdgeFunction<T>(
    functionName: 'ai-router' | 'meta-oauth' | 'meta-webhook' | 'ig-publisher' | 'meta-marketing-api',
    payload: Record<string, unknown>
  ): Promise<T | null> {
    if (typeof fetch === 'undefined') return null;
    try {
      const res = await fetch(`${this.functionsUrl}/${functionName}`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(payload),
      });
      if (!res.ok) return null;
      return (await res.json()) as T;
    } catch {
      return null;
    }
  }
}

