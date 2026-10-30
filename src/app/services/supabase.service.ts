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

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  readonly url = environment.supabaseUrl;
  readonly publishableKey = environment.supabasePublishableKey;
  readonly functionsUrl = environment.functionsBaseUrl;
  readonly projectRef = 'gmwdahnksiqukovcwwid';

  readonly connectionState = signal<SupabaseConnectionState>('checking');
  readonly dbSkillsCount = signal<number>(0);

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

  async invokeEdgeFunction<T>(
    functionName: 'ai-router' | 'meta-oauth' | 'meta-webhook' | 'ig-publisher',
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

