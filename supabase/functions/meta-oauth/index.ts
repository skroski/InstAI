// Supabase Edge Function: meta-oauth
// Conecta contas do Instagram Business pela Meta (Graph API) para o usuário logado no painel.
//
// Ações (POST, sempre com o JWT do usuário no Authorization):
//   authorize_url -> { url }  endereço do diálogo de login da Meta, com `state` assinado
//   exchange_code -> troca o código por token de longa duração, descobre páginas + contas do
//                    Instagram e grava o token de cada página, CRIPTOGRAFADO, em ig_accounts.
//                    A resposta nunca contém token.
//
// Secrets necessários: META_APP_ID, META_APP_SECRET, META_OAUTH_REDIRECT_URI, TOKEN_ENCRYPTION_KEY.
// Opcional: META_OAUTH_SCOPES (lista separada por vírgula) e META_GRAPH_API_VERSION.
// Deploy sugerido: supabase functions deploy meta-oauth --no-verify-jwt
// (a função valida o usuário por conta própria com auth.getUser).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1';
import { withCors } from '../_shared/cors.ts';

const GRAPH_VERSION = Deno.env.get('META_GRAPH_API_VERSION') || 'v22.0';
const STATE_TTL_MS = 10 * 60 * 1000;
const DEFAULT_SCOPES = [
  'pages_show_list',
  'pages_read_engagement',
  'instagram_basic',
  'instagram_manage_comments',
  'instagram_manage_messages',
  'instagram_content_publish',
  'business_management',
];

const corsHeaders = {
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

// --- helpers de codificação / criptografia ------------------------------------------------

const enc = new TextEncoder();

const toB64Url = (bytes: Uint8Array): string =>
  btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const fromB64Url = (s: string): Uint8Array => {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/') + pad);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
};

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

// state = base64url(payload).base64url(assinatura); payload = userId|expiraEm|nonce
async function signState(userId: string, secret: string): Promise<string> {
  const nonce = toB64Url(crypto.getRandomValues(new Uint8Array(12)));
  const payload = enc.encode(`${userId}|${Date.now() + STATE_TTL_MS}|${nonce}`);
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', await hmacKey(secret), payload));
  return `${toB64Url(payload)}.${toB64Url(sig)}`;
}

async function verifyState(state: string, userId: string, secret: string): Promise<void> {
  const [p, s] = String(state).split('.');
  if (!p || !s) throw new HttpError(400, 'Parâmetro state inválido');
  const payload = fromB64Url(p);
  const ok = await crypto.subtle.verify('HMAC', await hmacKey(secret), fromB64Url(s), payload);
  if (!ok) throw new HttpError(400, 'Parâmetro state inválido');
  const [uid, expires] = new TextDecoder().decode(payload).split('|');
  if (uid !== userId) throw new HttpError(403, 'Este retorno da Meta pertence a outro usuário');
  if (!Number.isFinite(Number(expires)) || Date.now() > Number(expires)) {
    throw new HttpError(400, 'A tentativa de conexão expirou. Comece de novo.');
  }
}

// AES-GCM; o resultado (iv + texto cifrado, em base64) vai para ig_accounts.access_token_encrypted
async function encryptToken(plain: string, secret: string): Promise<string> {
  const keyBytes = await crypto.subtle.digest('SHA-256', enc.encode(secret));
  const key = await crypto.subtle.importKey('raw', keyBytes, 'AES-GCM', false, ['encrypt']);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(plain)));
  const out = new Uint8Array(iv.length + cipher.length);
  out.set(iv);
  out.set(cipher, iv.length);
  return btoa(String.fromCharCode(...out));
}

// --- Graph API ------------------------------------------------------------------------------

async function graph<T>(path: string, params: Record<string, string>): Promise<T> {
  const url = new URL(`https://graph.facebook.com/${GRAPH_VERSION}/${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString());
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.error) {
    // A mensagem da Meta ajuda a diagnosticar (redirect_uri diferente, código usado, etc.); não inclui tokens.
    throw new HttpError(400, `Meta: ${body.error?.message || res.status}`);
  }
  return body as T;
}

interface PageWithIg {
  id: string;
  name?: string;
  access_token?: string;
  instagram_business_account?: { id: string; username?: string; name?: string; profile_picture_url?: string };
}

Deno.serve(withCors(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Método não permitido' }, 405);

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new HttpError(401, 'Não autorizado');

    const env = {
      supabaseUrl: Deno.env.get('SUPABASE_URL'),
      anonKey: Deno.env.get('SUPABASE_ANON_KEY'),
      serviceKey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
      appId: Deno.env.get('META_APP_ID'),
      appSecret: Deno.env.get('META_APP_SECRET'),
      redirectUri: Deno.env.get('META_OAUTH_REDIRECT_URI'),
      encKey: Deno.env.get('TOKEN_ENCRYPTION_KEY'),
    };
    const missing = Object.entries(env).filter(([, v]) => !v).map(([k]) => k);
    if (missing.length) {
      throw new HttpError(500, `Configuração incompleta no servidor: ${missing.join(', ')}`);
    }

    const userClient = createClient(env.supabaseUrl!, env.anonKey!, { global: { headers: { Authorization: authHeader } } });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) throw new HttpError(401, 'Sessão inválida');
    const userId = userData.user.id;

    const body = await req.json().catch(() => ({}));

    // 1) Endereço do diálogo de login da Meta
    if (body.action === 'authorize_url') {
      const scopes = (Deno.env.get('META_OAUTH_SCOPES') || '').split(',').map((s) => s.trim()).filter(Boolean);
      const url = new URL(`https://www.facebook.com/${GRAPH_VERSION}/dialog/oauth`);
      url.searchParams.set('client_id', env.appId!);
      url.searchParams.set('redirect_uri', env.redirectUri!);
      url.searchParams.set('response_type', 'code');
      url.searchParams.set('scope', (scopes.length ? scopes : DEFAULT_SCOPES).join(','));
      url.searchParams.set('state', await signState(userId, env.appSecret!));
      return json({ url: url.toString() });
    }

    // 2) Troca o código, descobre as contas e guarda os tokens
    if (body.action === 'exchange_code') {
      const { code, state } = body;
      if (!code || !state) throw new HttpError(400, 'Parâmetros code e state são obrigatórios');
      await verifyState(String(state), userId, env.appSecret!);

      const admin = createClient(env.supabaseUrl!, env.serviceKey!);
      const { data: member } = await admin
        .from('tenant_members')
        .select('tenant_id')
        .eq('user_id', userId)
        .limit(1)
        .maybeSingle();
      if (!member?.tenant_id) {
        throw new HttpError(409, 'Seu usuário não está vinculado a nenhum tenant (tabela tenant_members).');
      }

      const short = await graph<{ access_token: string }>('oauth/access_token', {
        client_id: env.appId!,
        redirect_uri: env.redirectUri!,
        client_secret: env.appSecret!,
        code: String(code),
      });
      const long = await graph<{ access_token: string; expires_in?: number }>('oauth/access_token', {
        grant_type: 'fb_exchange_token',
        client_id: env.appId!,
        client_secret: env.appSecret!,
        fb_exchange_token: short.access_token,
      });
      const expiresInSec = Number(long.expires_in) || 5184000; // 60 dias
      const expiresAt = new Date(Date.now() + expiresInSec * 1000).toISOString();

      // Tokens de página obtidos de um token de usuário de longa duração
      const pages = await graph<{ data: PageWithIg[] }>('me/accounts', {
        fields: 'id,name,access_token,instagram_business_account{id,username,name,profile_picture_url}',
        limit: '100',
        access_token: long.access_token,
      });

      const accounts: Record<string, unknown>[] = [];
      const skipped: { page: string; reason: string }[] = [];

      for (const page of pages.data ?? []) {
        const ig = page.instagram_business_account;
        if (!ig || !page.access_token) {
          skipped.push({ page: page.name || page.id, reason: 'sem conta do Instagram Business vinculada' });
          continue;
        }
        // ig_user_id é único no banco: nunca "roubar" uma conta já conectada em outro tenant.
        const { data: existing } = await admin.from('ig_accounts').select('tenant_id').eq('ig_user_id', ig.id).maybeSingle();
        if (existing && existing.tenant_id !== member.tenant_id) {
          skipped.push({ page: page.name || page.id, reason: 'conta já conectada em outro tenant' });
          continue;
        }

        const { error: upsertErr } = await admin.from('ig_accounts').upsert(
          {
            tenant_id: member.tenant_id,
            ig_user_id: ig.id,
            username: ig.username || ig.id,
            name: ig.name || page.name || null,
            profile_picture_url: ig.profile_picture_url || null,
            fb_page_id: page.id,
            access_token_encrypted: await encryptToken(page.access_token, env.encKey!),
            token_expires_at: expiresAt,
            is_active: true,
          },
          { onConflict: 'ig_user_id' }
        );
        if (upsertErr) {
          skipped.push({ page: page.name || page.id, reason: 'falha ao gravar a conta' });
          continue;
        }
        accounts.push({
          ig_user_id: ig.id,
          username: ig.username || ig.id,
          name: ig.name || page.name || null,
          fb_page_id: page.id,
          expires_at: expiresAt,
          days_remaining: Math.round(expiresInSec / 86400),
        });
      }

      return json({ status: 'connected', accounts, skipped });
    }

    throw new HttpError(400, 'Ação desconhecida');
  } catch (err) {
    if (err instanceof HttpError) return json({ error: err.message }, err.status);
    return json({ error: 'Erro interno no processamento OAuth' }, 500);
  }
}));
