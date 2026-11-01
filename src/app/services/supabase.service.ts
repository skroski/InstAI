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
  refreshToken?: string;
  email: string;
  expiresAt: number; // epoch em ms
}

export type OAuthProvider = 'google' | 'facebook';

const SESSION_KEY = 'codemix_auth_session';
const PKCE_KEY = 'codemix_pkce_verifier';
/** Marca que uma conexão de conta pela Meta está em andamento (usada para não confundir os dois retornos de OAuth). */
export const META_OAUTH_KEY = 'codemix_meta_oauth_pending';
const OAUTH_PROVIDERS: OAuthProvider[] = ['google', 'facebook'];

const b64url = (bytes: Uint8Array): string =>
  btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  readonly url = environment.supabaseUrl;
  readonly publishableKey = environment.supabasePublishableKey;
  readonly functionsUrl = environment.functionsBaseUrl;
  readonly projectRef = 'gmwdahnksiqukovcwwid';

  readonly connectionState = signal<SupabaseConnectionState>('checking');
  readonly dbSkillsCount = signal<number>(0);

  // Sessão do usuário (código por e-mail ou OAuth). Fica só na aba: sessionStorage.
  readonly session = signal<AuthSession | null>(this.loadSession());

  /** Provedores OAuth realmente habilitados no projeto Supabase (lido de /auth/v1/settings). */
  readonly oauthProviders = signal<OAuthProvider[]>([]);

  private refreshTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.scheduleRefresh();
    void this.loadOAuthProviders();
  }

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
    this.scheduleRefresh();
  }

  /** Renova o token um pouco antes de expirar; sem refresh token, a sessão simplesmente termina. */
  private scheduleRefresh(): void {
    if (this.refreshTimer) clearTimeout(this.refreshTimer);
    this.refreshTimer = null;
    const s = this.session();
    if (!s?.refreshToken) return;
    const wait = Math.max(0, s.expiresAt - Date.now() - 90_000);
    this.refreshTimer = setTimeout(() => void this.refreshSession(), wait);
  }

  async refreshSession(): Promise<boolean> {
    const current = this.session();
    if (!current?.refreshToken) return false;
    try {
      const res = await fetch(`${this.url}/auth/v1/token?grant_type=refresh_token`, {
        method: 'POST',
        headers: this.authHeaders(),
        body: JSON.stringify({ refresh_token: current.refreshToken }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body.access_token) {
        this.setSession(null);
        return false;
      }
      this.storeTokens(body, current.email);
      return true;
    } catch {
      return false; // falha de rede: mantém a sessão e tenta de novo no próximo uso
    }
  }

  private storeTokens(body: any, fallbackEmail: string): void {
    this.setSession({
      accessToken: body.access_token,
      refreshToken: body.refresh_token,
      email: body.user?.email ?? fallbackEmail,
      expiresAt: Date.now() + Number(body.expires_in ?? 3600) * 1000,
    });
  }

  /** Token de acesso válido, ou undefined se não houver sessão ou ela estiver perto de expirar. */
  accessToken(): string | undefined {
    const s = this.session();
    if (!s) return undefined;
    if (Date.now() > s.expiresAt - 60_000) {
      if (s.refreshToken) void this.refreshSession();
      else this.setSession(null);
      return undefined;
    }
    return s.accessToken;
  }

  /** Envia o código por e-mail. Só contas já existentes no Supabase Auth recebem. */
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
    this.storeTokens(body, email);
  }

  signOut(): void {
    this.setSession(null);
  }

  // ----- OAuth (Google / Facebook) com PKCE -----

  private async loadOAuthProviders(): Promise<void> {
    try {
      const res = await fetch(`${this.url}/auth/v1/settings`, { headers: { apikey: this.publishableKey } });
      if (!res.ok) return;
      const body = await res.json();
      this.oauthProviders.set(OAUTH_PROVIDERS.filter((p) => body?.external?.[p] === true));
    } catch {
      // Sem rede: só o login por código fica disponível.
    }
  }

  /** Leva o usuário ao provedor. A URL de retorno precisa estar em Authentication > URL Configuration. */
  async startOAuth(provider: OAuthProvider): Promise<void> {
    if (!this.oauthProviders().includes(provider)) {
      throw new Error(`O login com ${provider === 'google' ? 'Google' : 'Facebook'} não está ativado neste projeto.`);
    }
    const bytes = crypto.getRandomValues(new Uint8Array(48));
    const verifier = b64url(bytes);
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
    try {
      sessionStorage.setItem(PKCE_KEY, verifier);
    } catch {
      throw new Error('O navegador bloqueou o armazenamento da aba, necessário para entrar com OAuth.');
    }
    const params = new URLSearchParams({
      provider,
      redirect_to: `${location.origin}/?auth=supabase`,
      code_challenge: b64url(new Uint8Array(digest)),
      code_challenge_method: 's256',
    });
    location.assign(`${this.url}/auth/v1/authorize?${params.toString()}`);
  }

  /**
   * Chamado ao abrir o app: se a URL volta de um OAuth do Supabase, troca o código pela sessão.
   * Devolve uma mensagem para o usuário, ou null quando não havia retorno de OAuth.
   */
  async completeOAuthRedirect(): Promise<string | null> {
    const params = new URLSearchParams(location.search);
    let verifier: string | null = null;
    let metaPending = false;
    try {
      verifier = sessionStorage.getItem(PKCE_KEY);
      metaPending = sessionStorage.getItem(META_OAUTH_KEY) === '1';
    } catch {
      /* sem storage */
    }

    // Se a URL de retorno não estiver na lista permitida do Supabase, ele volta para a Site URL sem
    // o marcador ?auth=supabase. Um código com verifier guardado por nós também é retorno nosso.
    const returnedWithCode = params.has('code') || params.has('error');
    const isSupabaseReturn = params.get('auth') === 'supabase' || (!!verifier && !metaPending && returnedWithCode);
    if (!isSupabaseReturn) return null;

    const clean = () => history.replaceState(null, '', location.pathname);
    try {
      sessionStorage.removeItem(PKCE_KEY);
    } catch {
      /* sem storage */
    }
    const err = params.get('error_description') || params.get('error');
    const code = params.get('code');
    clean();

    if (err) return `Login cancelado ou recusado: ${err}`;
    if (!code || !verifier) return 'Não foi possível concluir o login. Tente entrar de novo.';

    const res = await fetch(`${this.url}/auth/v1/token?grant_type=pkce`, {
      method: 'POST',
      headers: this.authHeaders(),
      body: JSON.stringify({ auth_code: code, code_verifier: verifier }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body.access_token) {
      return body.msg || body.error_description || 'O provedor não confirmou o login. Tente de novo.';
    }
    this.storeTokens(body, '');
    return `Login realizado como ${this.session()?.email || 'usuário'}`;
  }

  private authHeaders(): Record<string, string> {
    return { apikey: this.publishableKey, 'Content-Type': 'application/json' };
  }

  private async authErrorMessage(res: Response, fallback: string): Promise<string> {
    const body = await res.json().catch(() => ({}));
    const raw: string = body.msg || body.error_description || body.error || '';
    const code: string = body.error_code || '';
    if (res.status === 429 || code === 'over_email_send_rate_limit' || /rate limit/i.test(raw)) {
      return 'Muitas tentativas. Aguarde alguns minutos e tente de novo.';
    }
    if (code === 'otp_disabled' || /signups? not allowed|otp_disabled/i.test(raw)) {
      return 'Este e-mail não tem acesso. Peça ao administrador para cadastrá-lo no Supabase.';
    }
    if (code === 'otp_expired' || /expired|invalid/i.test(raw)) {
      return 'Código inválido ou expirado. Peça um novo código.';
    }
    return raw || fallback;
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

  /**
   * Chama a edge function meta-oauth com o token do usuário logado (a função confere a sessão
   * com auth.getUser; a chave pública não serve). Devolve o erro real do servidor.
   */
  async callMetaOAuth<T>(action: 'authorize_url' | 'exchange_code', payload: Record<string, unknown> = {}): Promise<T> {
    const token = this.accessToken();
    if (!token) throw new Error('Entre com seu e-mail ou com OAuth antes de conectar uma conta.');
    const res = await fetch(`${this.functionsUrl}/meta-oauth`, {
      method: 'POST',
      headers: { ...this.headers, Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action, ...payload }),
    });
    const body = await res.json().catch(() => ({}));
    if (res.status === 404) {
      throw new Error('A função meta-oauth ainda não foi publicada neste projeto do Supabase.');
    }
    if (!res.ok) throw new Error(body.error || `meta-oauth respondeu ${res.status}`);
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

