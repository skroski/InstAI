// Supabase Edge Function: ai-router
// Roteador Multi-LLM (Claude 3.7 Sonnet, OpenAI Codex/GPT-4o e Gemini 2.5 Pro/Flash)
// Injeta automaticamente brand_voice_guidelines da conta ativa no system prompt da Skill

const ALLOWED_ORIGIN = Deno.env.get('APP_URL') || 'http://localhost:4200';

const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
};

interface AccountContext {
  username: string;
  name: string;
  brand_voice_guidelines: {
    tom?: string;
    pub?: string;
    regras?: string;
  };
  style_reference?: string;
}

interface RouterRequest {
  engine: 'claude' | 'codex' | 'gemini' | 'auto';
  slashCommand?: string;
  prompt: string;
  systemPrompt?: string;
  accountContext: AccountContext;
}

function resolveEngine(requested: string, slashCommand?: string): 'claude' | 'codex' | 'gemini' {
  if (requested === 'claude' || requested === 'codex' || requested === 'gemini') {
    return requested;
  }
  const cmd = (slashCommand || '').replace(/^\//, '');
  if (['prompt-foto', 'prompt-carrossel', 'prompt-capa-reels', 'prompt-estetico', 'responder-dm', 'moderar-comentarios', 'auditoria-perfil'].includes(cmd)) {
    return 'gemini';
  }
  if (['automacao-gatilho', 'conta-trocar', 'conta-status', 'publicar-agora', 'debug-webhook'].includes(cmd)) {
    return 'codex';
  }
  return 'claude';
}

function buildSystemPrompt(req: RouterRequest): string {
  const ctx = req.accountContext;
  const v = ctx?.brand_voice_guidelines || {};
  return [
    `Você é o Copiloto de IA da conta @${ctx?.username || 'conta'} (${ctx?.name || 'Instagram'}) no Codemix Insta-AI Hub.`,
    `Responda estritamente em Português do Brasil (pt-BR).`,
    `--- BRAND VOICE GUIDELINES ---`,
    `Tom de voz: ${v.tom || 'Profissional e direto.'}`,
    `Público-alvo: ${v.pub || 'Seguidores e clientes da marca.'}`,
    `Regras inquebráveis: ${v.regras || 'Sem promessas irreais.'}`,
    ctx?.style_reference ? `Style Reference Visual: ${ctx.style_reference}` : '',
    req.systemPrompt ? `--- INSTRUÇÃO DA SKILL (${req.slashCommand || 'chat'}) ---\n${req.systemPrompt}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

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
    const body = (await req.json()) as RouterRequest;
    const targetEngine = resolveEngine(body.engine || 'auto', body.slashCommand);
    const fullSystem = buildSystemPrompt(body);

    // Roteamento para o provedor selecionado quando a chave está configurada no ambiente
    if (targetEngine === 'claude') {
      const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
      const model = Deno.env.get('ANTHROPIC_DEFAULT_MODEL') || 'claude-3-7-sonnet-latest';
      if (apiKey && !apiKey.endsWith('...')) {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            model,
            max_tokens: 1024,
            system: fullSystem,
            messages: [{ role: 'user', content: body.prompt }],
          }),
        });
        const data = await res.json();
        return new Response(
          JSON.stringify({
            engine: 'claude',
            model,
            text: data?.content?.[0]?.text || '',
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    if (targetEngine === 'codex') {
      const apiKey = Deno.env.get('OPENAI_API_KEY');
      const model = Deno.env.get('OPENAI_CODEX_MODEL') || 'gpt-4o';
      if (apiKey && !apiKey.endsWith('...')) {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: fullSystem },
              { role: 'user', content: body.prompt },
            ],
          }),
        });
        const data = await res.json();
        return new Response(
          JSON.stringify({
            engine: 'codex',
            model,
            text: data?.choices?.[0]?.message?.content || '',
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    if (targetEngine === 'gemini') {
      const apiKey = Deno.env.get('GEMINI_API_KEY');
      const model = Deno.env.get('GEMINI_PRO_MODEL') || 'gemini-2.5-pro';
      if (apiKey && !apiKey.endsWith('...')) {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
          {
            method: 'POST',
            headers: {
              'x-goog-api-key': apiKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: fullSystem }] },
              contents: [{ role: 'user', parts: [{ text: body.prompt }] }],
            }),
          }
        );
        const data = await res.json();
        return new Response(
          JSON.stringify({
            engine: 'gemini',
            model,
            text: data?.candidates?.[0]?.content?.parts?.[0]?.text || '',
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(
      JSON.stringify({
        engine: targetEngine,
        slashCommand: body.slashCommand || null,
        status: 'ready',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch {
    return new Response(JSON.stringify({ error: 'Erro ao rotear requisição de IA' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

