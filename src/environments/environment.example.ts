export const environment = {
  production: false,
  appName: 'Codemix InstaAI Hub',
  supabaseUrl: 'https://your-project.supabase.co',
  supabasePublishableKey: '',
  functionsBaseUrl: 'https://your-project.supabase.co/functions/v1',
  metaGraphApiVersion: 'v22.0',
  metaAdAccountId: '',
  openaiApiKey: '',
  openaiModel: 'gpt-4o-mini',
  defaultTheme: 'codemix-dark',
  defaultAiEngine: 'auto' as const,
  metaPages: {
    amaral: {
      id: '',
      name: 'Amaral Natação',
      user: 'amaralnatacao',
    },
    duplod: {
      id: '',
      name: 'Duplo D Design & Desenvolvimento',
      user: 'duplod.oficial',
    },
  },
};

