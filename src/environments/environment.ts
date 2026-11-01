// Configuração pública usada no build de produção (Vercel).
// Tudo aqui vai para o bundle do navegador e o repositório é público:
// nunca coloque tokens, chaves secretas ou API keys neste arquivo.
// Tokens ficam nos secrets das Edge Functions do Supabase. Para desenvolvimento
// local com tokens, use environment.development.ts (fora do Git).
export const environment = {
  production: true,
  appName: 'InstAI',
  supabaseUrl: 'https://gmwdahnksiqukovcwwid.supabase.co',
  supabasePublishableKey: 'sb_publishable_bs2vlkBd-fPSf4mbAaP6vg_c9_GnacX',
  functionsBaseUrl: 'https://gmwdahnksiqukovcwwid.supabase.co/functions/v1',
  metaGraphApiVersion: 'v22.0',
  metaAdAccountId: 'act_1124982890873935',
  openaiApiKey: '',
  openaiModel: 'gpt-4o-mini',
  defaultTheme: 'codemix-dark',
  defaultAiEngine: 'auto' as const,
  metaPages: {
    amaral: {
      id: '185387824832414',
      name: 'Amaral Natação',
      user: 'amaralnatacao',
    },
    duplod: {
      id: '184846338220933',
      name: 'Duplo D Design & Desenvolvimento',
      user: 'duplod.oficial',
    },
    vetbots: {
      id: '134910416362221',
      name: 'VetBots',
      user: 'vetbots',
    },
  },
};
