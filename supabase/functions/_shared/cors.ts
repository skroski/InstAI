// CORS compartilhado pelas Edge Functions.
// APP_URL aceita uma ou mais origens separadas por vírgula, ex.:
//   APP_URL=https://instaicode.vercel.app,https://meudominio.com.br
// As origens do ng serve local são sempre aceitas.

const DEV_ORIGINS = ['http://localhost:4200', 'http://127.0.0.1:4200'];

const ALLOWED_ORIGINS = new Set([
  ...(Deno.env.get('APP_URL') || '')
    .split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean),
  ...DEV_ORIGINS,
]);

// Devolve a origem do pedido quando ela está na lista; nas demais, o navegador bloqueia a resposta.
export function withCors(handler: (req: Request) => Response | Promise<Response>) {
  return async (req: Request): Promise<Response> => {
    const res = await handler(req);
    const headers = new Headers(res.headers);
    const origin = req.headers.get('Origin');
    if (origin && ALLOWED_ORIGINS.has(origin)) {
      headers.set('Access-Control-Allow-Origin', origin);
    } else {
      headers.delete('Access-Control-Allow-Origin');
    }
    headers.append('Vary', 'Origin');
    return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
  };
}
