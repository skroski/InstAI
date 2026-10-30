// Supabase Edge Function: meta-webhook
// Verificação GET (hub.challenge) + Recebimento POST em tempo real (DMs, comentários, menções)
// com validação criptográfica HMAC-SHA256 do cabeçalho X-Hub-Signature-256

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1';

const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Content-Type': 'application/json',
};

async function verifySignature(rawBody: string, signatureHeader: string | null, appSecret: string): Promise<boolean> {
  if (!signatureHeader || !signatureHeader.startsWith('sha256=')) {
    return false;
  }
  const receivedHex = signatureHeader.slice('sha256='.length).toLowerCase();
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(appSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sigBuf = await crypto.subtle.sign('HMAC', key, enc.encode(rawBody));
  const computedHex = Array.from(new Uint8Array(sigBuf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  if (receivedHex.length !== computedHex.length) return false;
  let diff = 0;
  for (let i = 0; i < computedHex.length; i++) {
    diff |= computedHex.charCodeAt(i) ^ receivedHex.charCodeAt(i);
  }
  return diff === 0;
}

Deno.serve(async (req: Request) => {
  const url = new URL(req.url);

  // 1. Desafio de verificação do Webhook da Meta (GET)
  if (req.method === 'GET') {
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');
    const verifyToken = Deno.env.get('META_WEBHOOK_VERIFY_TOKEN');

    if (mode === 'subscribe' && verifyToken && token === verifyToken && challenge) {
      return new Response(challenge, {
        status: 200,
        headers: { 'Content-Type': 'text/plain', 'X-Content-Type-Options': 'nosniff' },
      });
    }
    return new Response(JSON.stringify({ error: 'Verificação do webhook recusada' }), {
      status: 403,
      headers: securityHeaders,
    });
  }

  // 2. Recebimento de eventos (POST)
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método não permitido' }), {
      status: 405,
      headers: securityHeaders,
    });
  }

  const appSecret = Deno.env.get('META_APP_SECRET');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!appSecret || !supabaseUrl || !serviceRoleKey) {
    return new Response(JSON.stringify({ error: 'Configuração de servidor ausente' }), {
      status: 500,
      headers: securityHeaders,
    });
  }

  const rawBody = await req.text();
  const signature = req.headers.get('X-Hub-Signature-256');
  const isValid = await verifySignature(rawBody, signature, appSecret);

  if (!isValid) {
    return new Response(JSON.stringify({ error: 'Assinatura X-Hub-Signature-256 inválida' }), {
      status: 401,
      headers: securityHeaders,
    });
  }

  try {
    const payload = JSON.parse(rawBody);
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    let processed = 0;

    for (const entry of payload.entry || []) {
      const igUserId = String(entry.id || '');
      const { data: account } = await supabase
        .from('ig_accounts')
        .select('id, tenant_id')
        .eq('ig_user_id', igUserId)
        .maybeSingle();

      if (!account) continue;

      // Comentários e Menções (changes)
      for (const change of entry.changes || []) {
        const val = change.value || {};
        if (change.field === 'comments' && val.id) {
          await supabase.from('ig_interactions').upsert({
            tenant_id: account.tenant_id,
            ig_account_id: account.id,
            interaction_type: 'COMMENT',
            external_id: String(val.id),
            sender_ig_id: String(val.from?.id || 'unknown'),
            sender_username: String(val.from?.username || 'seguidor'),
            content: String(val.text || ''),
            media_id: String(val.media?.id || ''),
            status: 'UNREAD',
          });
          processed++;
        }
      }

      // Direct Messages (messaging)
      for (const msgEvent of entry.messaging || []) {
        if (msgEvent.message?.mid && !msgEvent.message?.is_echo) {
          await supabase.from('ig_interactions').upsert({
            tenant_id: account.tenant_id,
            ig_account_id: account.id,
            interaction_type: 'DM',
            external_id: String(msgEvent.message.mid),
            sender_ig_id: String(msgEvent.sender?.id || 'unknown'),
            sender_username: String(msgEvent.sender?.username || msgEvent.sender?.id || 'seguidor'),
            content: String(msgEvent.message.text || ''),
            status: 'UNREAD',
          });
          processed++;
        }
      }
    }

    return new Response(JSON.stringify({ received: true, processed }), {
      status: 200,
      headers: securityHeaders,
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Payload inválido' }), {
      status: 400,
      headers: securityHeaders,
    });
  }
});

