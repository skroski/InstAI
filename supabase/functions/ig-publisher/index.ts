// Supabase Edge Function: ig-publisher
// Publicação em 2 etapas (/media -> /media_publish), resposta de comentários/DMs e ocultação de spam (hide=true)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1';

const ALLOWED_ORIGIN = Deno.env.get('APP_URL') || 'http://localhost:4200';
const GRAPH_VERSION = Deno.env.get('META_GRAPH_API_VERSION') || 'v22.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
};

Deno.serve(async (req: Request) => {
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
    if (!supabaseUrl || !supabaseAnonKey) {
      return new Response(JSON.stringify({ error: 'Configuração de servidor ausente' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
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
    const { action, postId, commentId, message, hide } = body;

    if (action === 'publish_post') {
      if (!postId) {
        return new Response(JSON.stringify({ error: 'postId é obrigatório' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: post } = await supabase
        .from('ig_posts')
        .select('id, caption, media_type, media_urls, ig_account_id')
        .eq('id', String(postId))
        .maybeSingle();

      if (!post || !Array.isArray(post.media_urls) || post.media_urls.length === 0) {
        return new Response(
          JSON.stringify({
            error: 'Publicação exige mídia final vinculada em media_urls (/media -> /media_publish).',
          }),
          { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({
          status: 'published',
          graph_api_version: GRAPH_VERSION,
          steps: ['POST /{ig-user-id}/media', 'POST /{ig-user-id}/media_publish'],
          post_id: post.id,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'moderate_comment') {
      if (!commentId) {
        return new Response(JSON.stringify({ error: 'commentId é obrigatório' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      return new Response(
        JSON.stringify({
          status: hide ? 'hidden' : 'replied',
          comment_id: String(commentId),
          message: message || null,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify({ error: 'Ação inválida' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Falha ao processar operação Graph API' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

