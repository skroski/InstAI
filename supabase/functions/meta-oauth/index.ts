// Supabase Edge Function: meta-oauth
// Fluxo OAuth da Meta Graph API v22.0 + troca por Long-Lived Token (60 dias) e refresh automático

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1';
import { withCors } from '../_shared/cors.ts';

const GRAPH_VERSION = Deno.env.get('META_GRAPH_API_VERSION') || 'v22.0';

const corsHeaders = {
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
};

Deno.serve(withCors(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método não permitido' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Não autorizado' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const metaAppId = Deno.env.get('META_APP_ID');
    const metaAppSecret = Deno.env.get('META_APP_SECRET');
    const redirectUri = Deno.env.get('META_OAUTH_REDIRECT_URI');

    if (!supabaseUrl || !supabaseAnonKey || !metaAppId || !metaAppSecret || !redirectUri) {
      return new Response(
        JSON.stringify({ error: 'Configuração de ambiente incompleta no servidor' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Sessão inválida' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { action, code, tenantId, accountId } = body;

    if (action === 'exchange_code') {
      if (!code || !tenantId) {
        return new Response(JSON.stringify({ error: 'Parâmetros code e tenantId são obrigatórios' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 1. Troca authorization code por Short-Lived User Access Token
      const shortTokenUrl = new URL(`https://graph.facebook.com/${GRAPH_VERSION}/oauth/access_token`);
      shortTokenUrl.searchParams.set('client_id', metaAppId);
      shortTokenUrl.searchParams.set('redirect_uri', redirectUri);
      shortTokenUrl.searchParams.set('client_secret', metaAppSecret);
      shortTokenUrl.searchParams.set('code', String(code));

      const shortRes = await fetch(shortTokenUrl.toString());
      const shortData = await shortRes.json();
      if (!shortRes.ok || !shortData.access_token) {
        return new Response(JSON.stringify({ error: 'Falha ao trocar código OAuth na Meta' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 2. Troca por Long-Lived Token (60 dias)
      const longTokenUrl = new URL(`https://graph.facebook.com/${GRAPH_VERSION}/oauth/access_token`);
      longTokenUrl.searchParams.set('grant_type', 'fb_exchange_token');
      longTokenUrl.searchParams.set('client_id', metaAppId);
      longTokenUrl.searchParams.set('client_secret', metaAppSecret);
      longTokenUrl.searchParams.set('fb_exchange_token', shortData.access_token);

      const longRes = await fetch(longTokenUrl.toString());
      const longData = await longRes.json();
      const expiresInSec = Number(longData.expires_in) || 5184000; // 60 dias padrão
      const expiresAt = new Date(Date.now() + expiresInSec * 1000).toISOString();

      return new Response(
        JSON.stringify({
          status: 'connected',
          expires_at: expiresAt,
          days_remaining: Math.round(expiresInSec / 86400),
          account_id: accountId || null,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify({ error: 'Ação desconhecida' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Erro interno no processamento OAuth' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}));
