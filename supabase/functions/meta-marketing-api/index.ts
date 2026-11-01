// Supabase Edge Function: meta-marketing-api
// Proxy seguro para a Meta Graph API. O token do System User fica somente em secrets do Supabase
// e nunca chega ao navegador. Um System User com acesso a várias Business Portfolios enxerga
// todas as contas de anúncio delas via /me/businesses.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1';
import { withCors } from '../_shared/cors.ts';

const GRAPH_VERSION = Deno.env.get('META_GRAPH_API_VERSION') || 'v22.0';
const GRAPH_BASE_URL = `https://graph.facebook.com/${GRAPH_VERSION}`;

const corsHeaders = {
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
};

const WRITE_ACTIONS = new Set([
  'create_campaign',
  'set_campaign_status',
  'create_custom_audience',
  'create_lookalike_audience',
  'sync_contacts_to_audience',
]);

const CAMPAIGN_OBJECTIVES = new Set([
  'OUTCOME_LEADS',
  'OUTCOME_ENGAGEMENT',
  'OUTCOME_TRAFFIC',
  'OUTCOME_SALES',
  'OUTCOME_AWARENESS',
]);

class HttpError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
  }
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function systemToken(): string {
  const token = Deno.env.get('META_SYSTEM_USER_TOKEN') || '';
  if (!token) throw new HttpError(500, 'META_SYSTEM_USER_TOKEN não configurado nos secrets do Supabase');
  return token;
}

// Chamada à Graph API. O token vai no header Authorization, nunca na URL.
async function graph<T = any>(
  path: string,
  options: { method?: 'GET' | 'POST'; params?: Record<string, string>; body?: unknown; token?: string } = {}
): Promise<T> {
  const url = new URL(`${GRAPH_BASE_URL}/${path.replace(/^\//, '')}`);
  for (const [k, v] of Object.entries(options.params || {})) url.searchParams.set(k, v);

  const res = await fetch(url.toString(), {
    method: options.method || 'GET',
    headers: {
      Authorization: `Bearer ${options.token || systemToken()}`,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json();
  if (!res.ok || data.error) {
    const msg = data?.error?.message || `Graph API respondeu ${res.status}`;
    throw new HttpError(res.status === 400 || res.status === 403 ? 422 : 502, msg);
  }
  return data as T;
}

// Percorre todas as páginas de uma listagem da Graph API (limite de segurança incluído).
async function graphList<T = any>(path: string, fields: string, maxPages = 10): Promise<T[]> {
  const out: T[] = [];
  let page = await graph<{ data: T[]; paging?: { next?: string } }>(path, { params: { fields, limit: '100' } });
  out.push(...(page.data || []));
  for (let i = 1; page.paging?.next && i < maxPages; i++) {
    const res = await fetch(page.paging.next, { headers: { Authorization: `Bearer ${systemToken()}` } });
    page = await res.json();
    out.push(...(page.data || []));
  }
  return out;
}

function assertId(value: unknown, kind: 'act' | 'numeric'): string {
  const str = String(value ?? '').trim();
  const ok = kind === 'act' ? /^act_\d+$/.test(str) : /^\d+$/.test(str);
  if (!ok) throw new HttpError(400, `Identificador inválido: ${kind === 'act' ? 'act_<id>' : '<id numérico>'}`);
  return str;
}

// Uma conta só é acessível se o System User tiver acesso a ela (via alguma Business Portfolio).
async function assertAccountAccess(actId: string): Promise<void> {
  await graph(actId, { params: { fields: 'id' } });
}

// Ações de escrita exigem usuário autenticado no Supabase e presente na allowlist META_ALLOWED_EMAILS.
async function assertWriteAllowed(req: Request): Promise<void> {
  const authHeader = req.headers.get('Authorization') || '';
  const jwt = authHeader.replace(/^Bearer\s+/i, '');
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
  const allowed = (Deno.env.get('META_ALLOWED_EMAILS') || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (!jwt || jwt === anonKey || allowed.length === 0) {
    throw new HttpError(401, 'Ação de escrita exige login de usuário autorizado');
  }
  const supabase = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: `Bearer ${jwt}` } } });
  const { data, error } = await supabase.auth.getUser(jwt);
  const email = data?.user?.email?.toLowerCase();
  if (error || !email || !allowed.includes(email)) {
    throw new HttpError(403, 'Usuário sem permissão para alterar campanhas');
  }
}

// --- Ações de leitura ---------------------------------------------------------

// Lista todas as Business Portfolios acessíveis e as contas de anúncio de cada uma.
async function listPortfolios() {
  const businesses = await graphList<{ id: string; name: string }>('me/businesses', 'id,name');
  const seen = new Set<string>();
  const result = [];

  for (const biz of businesses) {
    const [owned, client] = await Promise.all([
      graphList(`${biz.id}/owned_ad_accounts`, 'id,name,account_status,currency,timezone_name,balance,amount_spent'),
      graphList(`${biz.id}/client_ad_accounts`, 'id,name,account_status,currency,timezone_name,balance,amount_spent'),
    ]);
    const adAccounts = [...owned, ...client]
      .filter((acc: any) => !seen.has(acc.id) && seen.add(acc.id))
      .map((acc: any) => ({
        id: acc.id,
        name: acc.name,
        account_status: acc.account_status,
        currency: acc.currency,
        timezone_name: acc.timezone_name,
        balance: acc.balance ? Number(acc.balance) / 100 : 0,
        amount_spent: acc.amount_spent ? Number(acc.amount_spent) / 100 : 0,
        portfolioId: biz.id,
        portfolioName: biz.name,
      }));
    result.push({ id: biz.id, name: biz.name, adAccounts });
  }
  return result;
}

async function listCampaigns(actId: string) {
  await assertAccountAccess(actId);
  return graphList(
    `${actId}/campaigns`,
    'id,name,status,effective_status,objective,daily_budget,lifetime_budget,insights.date_preset(last_30d){spend,impressions,clicks,actions}'
  );
}

// Publicações da página. O token da página é obtido no servidor e não é devolvido ao cliente.
async function listPagePosts(pageId: string) {
  const pages = await graphList<{ id: string; access_token: string }>('me/accounts', 'id,access_token');
  const page = pages.find((p) => p.id === pageId);
  if (!page) throw new HttpError(403, 'Página não acessível pelo System User');
  return graph(`${pageId}/posts`, {
    params: { fields: 'id,message,created_time,permalink_url', limit: '10' },
    token: page.access_token,
  }).then((r: any) => r.data || []);
}

// --- Ações de escrita ---------------------------------------------------------

// Campanhas são sempre criadas PAUSED: nada entra no ar sem ação explícita do usuário.
async function createCampaign(actId: string, payload: any) {
  await assertAccountAccess(actId);
  const objective = String(payload?.objective || 'OUTCOME_LEADS');
  if (!CAMPAIGN_OBJECTIVES.has(objective)) throw new HttpError(400, `Objetivo inválido: ${objective}`);
  const name = String(payload?.name || '').trim();
  if (!name) throw new HttpError(400, 'Nome da campanha é obrigatório');

  const body: Record<string, unknown> = {
    name,
    objective,
    status: 'PAUSED',
    special_ad_categories: [],
  };
  if (payload?.dailyBudget) {
    // dailyBudget chega em reais; a Graph API espera centavos.
    body.daily_budget = Math.round(Number(payload.dailyBudget) * 100);
  }
  return graph(`${actId}/campaigns`, { method: 'POST', body });
}

async function setCampaignStatus(campaignId: string, status: string) {
  if (status !== 'ACTIVE' && status !== 'PAUSED') throw new HttpError(400, 'Status inválido');
  const campaign = await graph(campaignId, { params: { fields: 'account_id' } });
  await assertAccountAccess(`act_${campaign.account_id}`);
  return graph(campaignId, { method: 'POST', body: { status } });
}

// --- Handler ------------------------------------------------------------------

Deno.serve(withCors(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return json({ error: 'Método não permitido' }, 405);
  }

  try {
    const body = await req.json();
    const { action, adAccountId, payload } = body ?? {};

    if (WRITE_ACTIONS.has(action)) {
      await assertWriteAllowed(req);
    }

    switch (action) {
      case 'list_portfolios':
        return json({ success: true, portfolios: await listPortfolios() });

      case 'list_campaigns':
        return json({ success: true, data: await listCampaigns(assertId(adAccountId, 'act')) });

      case 'list_page_posts':
        return json({ success: true, data: await listPagePosts(assertId(payload?.pageId, 'numeric')) });

      case 'create_campaign': {
        const data = await createCampaign(assertId(adAccountId, 'act'), payload);
        return json({ success: true, campaignId: data.id, status: 'PAUSED' });
      }

      case 'set_campaign_status': {
        const campaignId = assertId(payload?.campaignId, 'numeric');
        await setCampaignStatus(campaignId, String(payload?.status));
        return json({ success: true, campaignId, status: payload.status });
      }

      default:
        // Audiências (custom/lookalike/sync) continuam fora desta revisão e serão tratadas
        // na etapa de públicos: não respondem mais com sucesso simulado.
        return json({ error: `Ação inválida ou ainda não disponível: ${action}` }, 400);
    }
  } catch (err: unknown) {
    if (err instanceof HttpError) return json({ success: false, error: err.message }, err.status);
    const msg = err instanceof Error ? err.message : 'Erro interno';
    return json({ success: false, error: msg }, 500);
  }
}));
