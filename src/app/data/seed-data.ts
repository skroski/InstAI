export type AccountStatus = 'ativo' | 'expirando' | 'erro';

export interface BrandVoice {
  tom: string;
  pub: string;
  regras: string;
}

export interface Account {
  id: string;
  user: string;
  name: string;
  ini: string;
  st: AccountStatus;
  days: number;
  perms: number;
  wh: boolean;
  voice: BrandVoice;
  style: string;
}

export type PostFormat = 'IMAGE' | 'CAROUSEL' | 'REELS' | 'STORIES';
export type PostStatus = 'DRAFT' | 'PROMPT_READY' | 'SCHEDULED' | 'PUBLISHED' | 'FAILED';

export interface ImagePrompt {
  t: string;
  ar: string;
  x: string;
}

export interface PostItem {
  id: string;
  a: string;
  t: PostFormat;
  s: PostStatus;
  topic: string;
  cap: string;
  tags: string[];
  pr: ImagePrompt[];
  day: number | null;
  time: string;
  ai: string;
}

export interface TwinField {
  l: string;
  on: boolean;
}

export interface TwinOffer {
  n: string;
  k: string;
  link: string;
  when: string;
}

export interface TwinQA {
  g: string;
  t: string[];
  offer: number;
}

export interface TwinConfig {
  kpi: [string, string][];
  sources: [string, string, string][];
  fields: TwinField[];
  out: string;
  offers: TwinOffer[];
  presets: string[];
  qa: Record<string, TwinQA>;
}

export type FlowNodeType =
  | 'trigger'
  | 'message'
  | 'buttons'
  | 'delay'
  | 'condition'
  | 'tag'
  | 'ai'
  | 'link'
  | 'handoff';

export interface FlowNode {
  id: string;
  t: FlowNodeType;
  kind?: string;
  text: string;
  extra: string;
}

export interface FlowItem {
  id: string;
  a: string;
  name: string;
  on: boolean;
  stats: {
    sent: number;
    open: string;
    clicks: number;
    leads: number;
  };
  nodes: FlowNode[];
}

export interface ContactItem {
  id: string;
  a: string;
  u: string;
  tags: string[];
  src: string;
  last: string;
}

export type InteractionType = 'DM' | 'COMMENT' | 'STORY_MENTION';
export type InteractionStatus = 'UNREAD' | 'AI_REPLIED' | 'HUMAN_ESCALATED' | 'ARCHIVED';
export type CommentCategory = 'duvida' | 'elogio' | 'spam' | 'gatilho';
export type Sentiment = 'positivo' | 'neutro' | 'negativo';

export interface InteractionItem {
  id: string;
  a: string;
  u: string;
  t: InteractionType;
  s: InteractionStatus;
  sent: Sentiment;
  time: string;
  c: string;
  media: string;
  ai: string;
  cat?: CommentCategory;
  spam?: boolean;
  esc?: boolean;
  hidden?: boolean;
  dm?: boolean;
}

export interface KeywordRule {
  id: string;
  a: string;
  kw: string;
  link: string;
  post: string;
  on: boolean;
}

export interface SkillCommand {
  g: number;
  c: string;
  a: string;
  d: string;
  e: 'claude' | 'codex' | 'gemini' | 'auto';
  sys?: string;
}

export interface AccountMetrics {
  k: [string, string, string][];
  f: [string, number][];
  h: string[];
  p: string[];
}

export const ACCS: Account[] = [
  {
    id: 'a1',
    user: 'codemix.web',
    name: 'Codemix — Soluções Web',
    ini: 'CW',
    st: 'ativo',
    days: 41,
    perms: 4,
    wh: true,
    voice: {
      tom: 'Direto, prático, primeira pessoa. Sem hype; termos técnicos em inglês.',
      pub: 'Donos de negócio e gestores que querem lançar produto digital com agentes de IA.',
      regras: 'Nunca prometer prazo sem escopo. Sem emojis. Citar a stack quando relevante.',
    },
    style:
      'flat charcoal #2b2b2b background, amber-to-orange splash symbol (#FFCB05 → #F58220) at 6% opacity bleeding off one edge, generous negative space for headline type, matte editorial finish, no people --style raw',
  },
  {
    id: 'a2',
    user: 'duplod.oficial',
    name: 'Duplo D',
    ini: 'DD',
    st: 'expirando',
    days: 6,
    perms: 4,
    wh: true,
    voice: {
      tom: 'Acolhedor e elegante, frases curtas.',
      pub: 'Mulheres de 25 a 45 anos que buscam moda atemporal.',
      regras: 'Sempre mencionar o catálogo no CTA. Sem gírias.',
    },
    style:
      'soft natural window light, burgundy #ab2930 and plum #441556 accents on slate #647883 neutrals, film grain, 85mm lens, shallow depth of field --style raw',
  },
  {
    id: 'a3',
    user: 'vetbots.ia',
    name: 'VetBots',
    ini: 'VB',
    st: 'ativo',
    days: 52,
    perms: 4,
    wh: true,
    voice: {
      tom: 'Próximo e descontraído, com empatia por tutores.',
      pub: 'Donos de clínicas veterinárias e petshops.',
      regras: 'Nunca dar diagnóstico. Sintomas graves: transbordo humano imediato.',
    },
    style:
      '3D mascot dog on deep teal #032930 background, copper #bf7b40 rim light, soft studio lighting, clean product-render look --style raw',
  },
  {
    id: 'a4',
    user: 'eagency.design',
    name: 'e:agency',
    ini: 'EA',
    st: 'erro',
    days: 0,
    perms: 1,
    wh: false,
    voice: {
      tom: 'Criativo e objetivo.',
      pub: 'Agências e anunciantes.',
      regras: 'Sem promessas de resultado.',
    },
    style: 'high-contrast editorial layouts, cool blue-grey palette, geometric composition --style raw',
  },
];

export const CMDS: SkillCommand[] = [
  { g: 1, c: 'legenda-feed', a: '[tema] [objetivo]', d: '3 variações de legenda: AIDA, storytelling e direta, com CTA.', e: 'claude' },
  { g: 1, c: 'carrossel', a: '[tema] [num_slides]', d: 'Carrossel slide a slide: gancho, conteúdo, resumo salvável e CTA.', e: 'claude' },
  { g: 1, c: 'roteiro-reels', a: '[ideia] [duracao_segundos]', d: 'Roteiro com tempo, fala e legenda da publicação.', e: 'claude' },
  { g: 1, c: 'sequencia-stories', a: '[objetivo]', d: '5 a 7 stories com enquete, reação rápida e link no último frame.', e: 'claude' },
  { g: 1, c: 'calendario', a: '[dias] [pilares]', d: 'Matriz editorial por funil, pronta para salvar como DRAFT.', e: 'claude' },
  { g: 1, c: 'hashtags', a: '[nicho] [localizacao]', d: '5 a 15 hashtags qualificadas + palavras-chave de SEO.', e: 'claude' },
  { g: 2, c: 'prompt-foto', a: '[conceito] [aspect_ratio]', d: 'Prompts fotográficos PT/EN para Midjourney v6, Flux.1 e Imagen 3.', e: 'gemini' },
  { g: 2, c: 'prompt-carrossel', a: '[id_do_post]', d: 'Direção de arte e prompts consistentes para cada página.', e: 'gemini' },
  { g: 2, c: 'prompt-capa-reels', a: '[titulo_gancho]', d: 'Capa 9:16 com safe zone 4:5 para tipografia.', e: 'gemini' },
  { g: 2, c: 'prompt-estetico', a: '[referencia_marca]', d: 'Sufixo de estilo padrão (Style Reference) da conta.', e: 'gemini' },
  { g: 3, c: 'responder-dm', a: '[contexto_opcional]', d: 'Sugere resposta humanizada ou aciona transbordo humano.', e: 'gemini' },
  { g: 3, c: 'moderar-comentarios', a: '[post_id] [filtro]', d: 'Oculta spam, responde em lote e envia Private Reply.', e: 'gemini' },
  { g: 3, c: 'automacao-gatilho', a: '[palavra_chave] [link_destino]', d: 'Responde no Direct quando alguém comenta a palavra-chave.', e: 'codex' },
  { g: 4, c: 'conta-trocar', a: '[@username]', d: 'Alterna o contexto ativo do chat e da interface.', e: 'codex' },
  { g: 4, c: 'conta-status', a: '', d: 'Saúde dos tokens, permissões e webhook de todas as contas.', e: 'codex' },
  { g: 4, c: 'auditoria-perfil', a: '[@username]', d: 'Engajamento, melhor horário e formato campeão em 30 dias.', e: 'gemini' },
  { g: 4, c: 'publicar-agora', a: '[post_id]', d: 'Fluxo /media → /media_publish para post com mídia vinculada.', e: 'codex' },
  { g: 4, c: 'debug-webhook', a: '[payload_id]', d: 'Valida X-Hub-Signature-256 e sugere correção de payload ou SQL.', e: 'codex' },
];

export const GROUPS: Record<number, string> = {
  1: 'Conteúdo & copywriting',
  2: 'Prompts de imagem',
  3: 'Atendimento & moderação',
  4: 'Operação & multi-contas',
  5: 'Skills do tenant',
};

export const ENG: Record<string, string> = {
  claude: 'Claude 3.7 Sonnet',
  codex: 'Codex · GPT-4o',
  gemini: 'Gemini 2.5 Pro',
  auto: 'Auto Router',
};

export const DAYS = ['seg 26', 'ter 27', 'qua 28', 'qui 29', 'sex 30', 'sáb 31', 'dom 01'];

export const METRICS: Record<string, AccountMetrics> = {
  a1: {
    k: [
      ['engajamento', '4,8%', '+0,6 pp'],
      ['alcance 30d', '86,2 mil', '+12%'],
      ['seguidores', '12,4 mil', '+310'],
      ['salvamentos', '1.240', '+18%'],
    ],
    f: [
      ['Carrossel', 72],
      ['Reels', 58],
      ['Imagem', 34],
      ['Stories', 21],
    ],
    h: ['ter 12h', 'qui 19h', 'sáb 10h'],
    p: [
      'Publicar 2 carrosséis por semana: retêm 72% contra 34% de imagem única.',
      'Concentrar Reels de terça a quinta, entre 12h e 19h.',
      'Ativar /automacao-gatilho com a palavra AGENTE nos Reels de maior alcance.',
    ],
  },
  a2: {
    k: [
      ['engajamento', '3,1%', '+0,2 pp'],
      ['alcance 30d', '24,8 mil', '+4%'],
      ['seguidores', '5,9 mil', '+84'],
      ['salvamentos', '410', '+7%'],
    ],
    f: [
      ['Reels', 64],
      ['Carrossel', 49],
      ['Imagem', 38],
      ['Stories', 27],
    ],
    h: ['qua 20h', 'sex 12h', 'dom 11h'],
    p: [
      'Priorizar Reels de lookbook: 64% de retenção.',
      'Renovar o token em até 6 dias para não pausar o agendamento.',
      'Usar caixinhas nos Stories para alimentar o calendário.',
    ],
  },
  a3: {
    k: [
      ['engajamento', '6,2%', '+1,1 pp'],
      ['alcance 30d', '132 mil', '+21%'],
      ['seguidores', '18,7 mil', '+940'],
      ['salvamentos', '2.380', '+26%'],
    ],
    f: [
      ['Reels', 81],
      ['Carrossel', 66],
      ['Imagem', 41],
      ['Stories', 33],
    ],
    h: ['seg 19h', 'qua 12h', 'sáb 09h'],
    p: [
      'Reels com mascote lideram retenção: replicar o formato semanal.',
      'Responder DMs em até 1h: 7 pendentes hoje.',
      'Criar carrossel de perguntas frequentes dos tutores.',
    ],
  },
};

export const SEED_POSTS: PostItem[] = [
  {
    id: 'p1',
    a: 'a1',
    t: 'REELS',
    s: 'DRAFT',
    topic: '3 sinais de que seu produto precisa de um agente de IA',
    cap: 'Seu time responde a mesma pergunta 20 vezes por dia?\n\nSe sim, o problema não é equipe. É processo.\n\nSão 3 sinais de que um agente de IA já faria diferença no seu produto. Assista até o fim.\n\nQuer ver como eu monto isso? Comente AGENTE.',
    tags: ['#ia', '#automacao', '#n8n', '#supabase'],
    pr: [],
    day: null,
    time: '',
    ai: 'Claude',
  },
  {
    id: 'p2',
    a: 'a1',
    t: 'CAROUSEL',
    s: 'PROMPT_READY',
    topic: 'Do briefing ao deploy: meu fluxo com agentes',
    cap: 'Briefing, UI/UX, código, SEO e GEO. O fluxo completo em 7 slides.\n\nSalve para consultar na hora de montar o seu produto.\n\nDúvida sobre alguma etapa? Responda este post.',
    tags: ['#produtodigital', '#typescript', '#uiux'],
    pr: [
      {
        t: 'Slide 1 · capa',
        ar: '4:5',
        x: 'Flat charcoal #2b2b2b background, oversized amber-to-orange splash symbol bleeding off the right edge at 6% opacity, negative space on the left for headline typography, matte editorial look, no people --ar 4:5 --style raw',
      },
      {
        t: 'Slides 2–6 · conteúdo',
        ar: '4:5',
        x: 'Minimal technical diagram on charcoal, thin amber lines, monospaced labels, soft vignette, consistent margins for text overlay --ar 4:5 --style raw',
      },
      {
        t: 'Slide 7 · CTA',
        ar: '4:5',
        x: 'Charcoal gradient field with a single amber highlight bar across the lower third, empty centre for call-to-action type --ar 4:5 --style raw',
      },
    ],
    day: null,
    time: '',
    ai: 'Gemini',
  },
  {
    id: 'p3',
    a: 'a1',
    t: 'IMAGE',
    s: 'SCHEDULED',
    topic: 'Supabase RLS sem dor: multi-tenant na prática',
    cap: 'Multi-tenant sem vazar dado entre clientes: RLS com tenant_id em toda tabela e auth.uid() nas policies.\n\nSalve para a próxima migration.',
    tags: ['#supabase', '#postgres', '#saas'],
    pr: [
      {
        t: 'Imagem única',
        ar: '4:5',
        x: 'Dark graphite desk, laptop showing a schema diagram out of focus, warm amber key light, 35mm, shallow depth of field --ar 4:5',
      },
    ],
    day: 5,
    time: '18:00',
    ai: 'Claude',
  },
  {
    id: 'p4',
    a: 'a1',
    t: 'STORIES',
    s: 'PUBLISHED',
    topic: 'Bastidores: TypeScript + n8n + Supabase',
    cap: 'Sequência de 5 stories mostrando o setup do dia.',
    tags: [],
    pr: [],
    day: 1,
    time: '12:30',
    ai: 'Claude',
  },
  {
    id: 'p5',
    a: 'a1',
    t: 'IMAGE',
    s: 'FAILED',
    topic: 'Case UtJuris: rede social jurídica',
    cap: 'Como a UtJuris organiza conteúdo jurídico com gerenciador próprio.',
    tags: ['#case', '#utjuris'],
    pr: [],
    day: 3,
    time: '09:00',
    ai: 'Claude',
  },
  {
    id: 'p6',
    a: 'a3',
    t: 'REELS',
    s: 'SCHEDULED',
    topic: 'Como a IA confirma consulta sem a recepção atender',
    cap: 'A recepção atende tutor, telefone e balcão ao mesmo tempo. Veja como o agente confirma consultas sozinho.\n\nQuer na sua clínica? Comente AGENDA.',
    tags: ['#vet', '#clinicaveterinaria', '#ia'],
    pr: [
      {
        t: 'Capa 9:16',
        ar: '9:16',
        x: '3D dog mascot waving, deep teal #032930 background, copper rim light, central safe zone for title --ar 9:16',
      },
    ],
    day: 4,
    time: '19:00',
    ai: 'Claude',
  },
  {
    id: 'p7',
    a: 'a3',
    t: 'CAROUSEL',
    s: 'DRAFT',
    topic: '5 perguntas que o tutor faz antes de agendar',
    cap: '',
    tags: [],
    pr: [],
    day: null,
    time: '',
    ai: 'Claude',
  },
  {
    id: 'p8',
    a: 'a3',
    t: 'IMAGE',
    s: 'PUBLISHED',
    topic: 'Lembrete: vacina antirrábica',
    cap: 'Vacina em dia protege o seu pet e a sua família. Agende pelo link.',
    tags: ['#vacina', '#pet'],
    pr: [],
    day: 0,
    time: '10:00',
    ai: 'Claude',
  },
  {
    id: 'p9',
    a: 'a2',
    t: 'IMAGE',
    s: 'DRAFT',
    topic: 'Lançamento da linha de outono',
    cap: '',
    tags: [],
    pr: [],
    day: null,
    time: '',
    ai: 'Claude',
  },
  {
    id: 'p10',
    a: 'a2',
    t: 'STORIES',
    s: 'SCHEDULED',
    topic: 'Caixinha: pergunte ao Duplo D',
    cap: 'Caixinha de perguntas sobre combinações.',
    tags: [],
    pr: [],
    day: 5,
    time: '11:00',
    ai: 'Claude',
  },
  {
    id: 'p11',
    a: 'a4',
    t: 'IMAGE',
    s: 'PUBLISHED',
    topic: 'Branding que vende: bastidores',
    cap: 'Bastidores do processo de branding.',
    tags: [],
    pr: [],
    day: 2,
    time: '15:00',
    ai: 'Claude',
  },
];

export const TWINS: Record<string, TwinConfig> = {
  a1: {
    kpi: [
      ['conversas 30d', '1.284'],
      ['resolvidas sem humano', '87%'],
      ['tempo de resposta', '4 s'],
      ['ofertas clicadas', '212'],
    ],
    sources: [
      ['POSTS', '142 legendas e roteiros do Instagram', 'indexado'],
      ['PDF', 'Processo de desenvolvimento com agentes.pdf', 'indexado'],
      ['SITE', 'codemix.com.br', 'indexado'],
      ['VÍDEO', 'Transcrições de 12 Reels', 'processando'],
      ['FAQ', '38 perguntas frequentes', 'indexado'],
    ],
    fields: [
      { l: 'produto digital', on: true },
      { l: 'agentes de IA', on: true },
      { l: 'automação com n8n', on: true },
      { l: 'Supabase', on: true },
      { l: 'UI/UX', on: true },
      { l: 'SEO e GEO', on: true },
      { l: 'jurídico', on: false },
      { l: 'finanças pessoais', on: false },
    ],
    out: 'Esse assunto foge do que eu domino. Posso te ajudar com produto digital, agentes de IA e automação.',
    offers: [
      {
        n: 'Guia: primeiro agente com n8n',
        k: 'material',
        link: 'codemix.com.br/guia',
        when: 'pede por onde começar',
      },
      {
        n: 'Diagnóstico de produto com IA',
        k: 'mentoria',
        link: 'codemix.com.br/diagnostico',
        when: 'descreve um projeto',
      },
    ],
    presets: ['Como colocar IA no meu produto?', 'Quanto tempo leva um MVP?', 'Vale usar Supabase?'],
    qa: {
      'Como colocar IA no meu produto?': {
        g: 'Integrar IA em um produto envolve várias etapas: 1. Defina o problema que a IA vai resolver. 2. Escolha um modelo (GPT, Claude, Gemini). 3. Prepare e limpe os dados. 4. Integre via API. 5. Monitore custos, latência e qualidade. Também é importante considerar privacidade, governança e…',
        t: [
          'Dá pra começar pequeno e já ter resultado. Antes, me conta: o seu produto já está no ar e qual tarefa mais toma tempo do seu time hoje?',
          'Já está no ar. O suporte responde as mesmas dúvidas o dia todo.',
          'Então o primeiro agente é de suporte: ele lê a sua base de ajuda no Supabase, responde no chat e passa para humano quando não souber. Em 2 a 3 semanas isso roda. Quer o fluxo que eu uso no n8n?',
        ],
        offer: 0,
      },
      'Quanto tempo leva um MVP?': {
        g: 'O tempo para desenvolver um MVP varia bastante, geralmente entre 2 e 6 meses, dependendo da complexidade, do tamanho da equipe, das tecnologias escolhidas e da clareza dos requisitos. Metodologias ágeis podem ajudar a…',
        t: [
          'Depende do que entra no MVP de verdade. Qual é a única coisa que o usuário precisa conseguir fazer no primeiro dia?',
          'Agendar um horário e receber confirmação.',
          'Isso cabe em 4 a 6 semanas: login, agenda e confirmação automática. O resto fica para depois do uso real. Quer montar esse escopo comigo no diagnóstico?',
        ],
        offer: 1,
      },
      'Vale usar Supabase?': {
        g: 'Supabase é uma alternativa open source ao Firebase que oferece banco Postgres, autenticação, storage e funções. Entre as vantagens estão… entre as desvantagens estão… a escolha depende do seu caso de uso.',
        t: [
          'Na maioria dos produtos que eu faço, sim. Ele vai atender várias empresas ou um único cliente?',
          'Várias empresas, multi-tenant.',
          'Então encaixa bem: RLS com tenant_id em cada tabela isola os dados sem código extra. Tenho um post explicando as policies, te mando o link.',
        ],
        offer: -1,
      },
    },
  },
  a2: {
    kpi: [
      ['conversas 30d', '342'],
      ['resolvidas sem humano', '74%'],
      ['tempo de resposta', '5 s'],
      ['ofertas clicadas', '58'],
    ],
    sources: [
      ['POSTS', '86 legendas do Instagram', 'indexado'],
      ['PDF', 'Catálogo outono 2026.pdf', 'indexado'],
      ['FAQ', '21 perguntas frequentes', 'indexado'],
    ],
    fields: [
      { l: 'moda atemporal', on: true },
      { l: 'combinações', on: true },
      { l: 'cuidados com peças', on: true },
      { l: 'tamanhos', on: true },
    ],
    out: 'Sobre isso eu não consigo ajudar, mas posso te mostrar combinações e peças do catálogo.',
    offers: [
      {
        n: 'Consultoria de estilo',
        k: 'mentoria',
        link: 'duplod.com.br/estilo',
        when: 'pede ajuda para montar looks',
      },
    ],
    presets: ['Como montar um look para o trabalho?', 'Qual tamanho escolher?'],
    qa: {},
  },
  a3: {
    kpi: [
      ['conversas 30d', '2.106'],
      ['resolvidas sem humano', '91%'],
      ['tempo de resposta', '3 s'],
      ['ofertas clicadas', '344'],
    ],
    sources: [
      ['POSTS', '203 legendas do Instagram', 'indexado'],
      ['SITE', 'vetbots.com.br', 'indexado'],
      ['PDF', 'Protocolo de atendimento.pdf', 'indexado'],
      ['FAQ', '54 perguntas de tutores', 'indexado'],
    ],
    fields: [
      { l: 'agendamento', on: true },
      { l: 'gestão de clínica', on: true },
      { l: 'atendimento ao tutor', on: true },
      { l: 'diagnóstico', on: false },
    ],
    out: 'Não posso orientar sobre diagnóstico. Para sintomas, fale com o veterinário da sua clínica.',
    offers: [
      {
        n: 'Demonstração da VetBots',
        k: 'demo',
        link: 'vetbots.com.br/demo',
        when: 'pergunta sobre a clínica',
      },
    ],
    presets: ['Como reduzir faltas nas consultas?', 'A IA substitui a recepção?'],
    qa: {},
  },
  a4: {
    kpi: [
      ['conversas 30d', '—'],
      ['resolvidas sem humano', '—'],
      ['tempo de resposta', '—'],
      ['ofertas clicadas', '—'],
    ],
    sources: [],
    fields: [
      { l: 'branding', on: true },
      { l: 'publicidade', on: true },
    ],
    out: '',
    offers: [],
    presets: ['O que faz uma marca forte?'],
    qa: {},
  },
};

export const SEED_FLOWS: FlowItem[] = [
  {
    id: 'f1',
    a: 'a1',
    name: 'Material do Reels . AGENTE',
    on: true,
    stats: { sent: 184, open: '71%', clicks: 38, leads: 41 },
    nodes: [
      { id: 'n1', t: 'trigger', kind: 'comentário', text: 'AGENTE', extra: 'Reels · 3 sinais de que seu produto precisa de um agente' },
      { id: 'n2', t: 'message', text: 'Oi! Aqui está o material sobre agentes de IA, como combinado.', extra: '' },
      { id: 'n3', t: 'buttons', text: 'Quer ver como aplico isso no seu produto?', extra: 'Quero conversar, Só o material' },
      { id: 'n4', t: 'condition', text: 'clicou em "Quero conversar"', extra: 'encerrar' },
      { id: 'n5', t: 'tag', text: 'lead-quente', extra: '' },
      { id: 'n6', t: 'handoff', text: 'Lead pediu conversa. Retornar em até 1h.', extra: '' },
    ],
  },
  {
    id: 'f2',
    a: 'a1',
    name: 'Boas-vindas às menções de story',
    on: true,
    stats: { sent: 62, open: '84%', clicks: 12, leads: 9 },
    nodes: [
      { id: 'n7', t: 'trigger', kind: 'menção', text: 'qualquer menção', extra: 'stories' },
      { id: 'n8', t: 'message', text: 'Obrigado pela menção! Vamos compartilhar nos nossos stories.', extra: '' },
      { id: 'n9', t: 'delay', text: '10 min', extra: '' },
      { id: 'n10', t: 'ai', text: 'Pergunte qual desafio do produto digital a pessoa enfrenta.', extra: 'Claude' },
    ],
  },
  {
    id: 'f3',
    a: 'a3',
    name: 'Demonstração por palavra AGENDA',
    on: true,
    stats: { sent: 97, open: '78%', clicks: 51, leads: 33 },
    nodes: [
      { id: 'n11', t: 'trigger', kind: 'comentário', text: 'AGENDA', extra: 'Reels · Como a IA confirma consulta' },
      { id: 'n12', t: 'message', text: 'Oi! Vamos agendar uma demonstração para a sua clínica.', extra: '' },
      { id: 'n13', t: 'buttons', text: 'Qual o melhor período?', extra: 'Manhã, Tarde' },
      { id: 'n14', t: 'link', text: 'vetbots.com.br/demo', extra: 'agendar demonstração' },
    ],
  },
  {
    id: 'f4',
    a: 'a2',
    name: 'Catálogo por resposta de story',
    on: false,
    stats: { sent: 0, open: '—', clicks: 0, leads: 0 },
    nodes: [
      { id: 'n15', t: 'trigger', kind: 'resposta de story', text: 'CATÁLOGO', extra: 'stories' },
      { id: 'n16', t: 'message', text: 'Que bom ter você por aqui! Segue o nosso catálogo.', extra: '' },
      { id: 'n17', t: 'link', text: 'duplod.com.br/catalogo', extra: 'ver catálogo' },
    ],
  },
];

export const SEED_CONTACTS: ContactItem[] = [
  { id: 'c1', a: 'a1', u: 'marina.lopes.dev', tags: ['lead quente'], src: 'AGENTE . Reels', last: 'hoje 09:12' },
  { id: 'c2', a: 'a1', u: 'lucas.prod', tags: ['lead quente', 'novo'], src: 'AGENTE . Reels', last: 'hoje 05:55' },
  { id: 'c3', a: 'a1', u: 'clinica.horizonte', tags: ['cliente'], src: 'menção de story', last: 'ontem' },
  { id: 'c4', a: 'a1', u: 'rafa.tech', tags: ['novo'], src: 'comentário', last: 'hoje 08:40' },
  { id: 'c5', a: 'a1', u: 'dev.carla', tags: ['novo'], src: 'comentário', last: 'hoje 07:30' },
  { id: 'c6', a: 'a3', u: 'tutor.bia', tags: ['cliente'], src: 'dm', last: 'hoje 10:03' },
  { id: 'c7', a: 'a3', u: 'petshop.sol', tags: ['lead quente'], src: 'AGENDA . Reels', last: 'hoje 09:30' },
  { id: 'c8', a: 'a3', u: 'clinica.pet.sul', tags: ['lead quente', 'novo'], src: 'comentário', last: 'hoje 08:05' },
  { id: 'c9', a: 'a2', u: 'loja.centro', tags: ['lead quente'], src: 'dm', last: 'hoje 11:20' },
];

export const SEED_INTS: InteractionItem[] = [
  {
    id: 'i1',
    a: 'a1',
    u: 'marina.lopes.dev',
    t: 'DM',
    s: 'UNREAD',
    sent: 'positivo',
    time: '09:12',
    c: 'Oi! Vi o reels sobre agentes de IA. Vocês fazem integração com WhatsApp também? Tenho um SaaS de agendamento.',
    media: '',
    ai: 'Oi, Marina! Faço sim: agentes integrados ao WhatsApp com n8n + Supabase. Me conta em duas linhas como é o fluxo de agendamento hoje? Com isso te passo um caminho e um prazo realista.',
  },
  {
    id: 'i2',
    cat: 'duvida',
    a: 'a1',
    u: 'rafa.tech',
    t: 'COMMENT',
    s: 'UNREAD',
    sent: 'neutro',
    time: '08:40',
    c: 'Qual a diferença pra usar só o ChatGPT?',
    media: 'Reels · 3 sinais de que seu produto precisa de um agente',
    ai: 'Boa pergunta, Rafa! O chat só conversa. Um agente acessa seus dados e executa ações: agenda, consulta, atualiza. Posso detalhar em um post.',
  },
  {
    id: 'i3',
    cat: 'spam',
    a: 'a1',
    u: 'promo.seguidores22',
    t: 'COMMENT',
    s: 'UNREAD',
    sent: 'negativo',
    time: '07:55',
    c: 'Ganhe seguidores rápido!! link na bio',
    media: 'Carrossel · Do briefing ao deploy',
    ai: 'Spam detectado. Ação sugerida: ocultar comentário (hide=true), sem resposta pública.',
    spam: true,
  },
  {
    id: 'i4',
    a: 'a1',
    u: 'clinica.horizonte',
    t: 'STORY_MENTION',
    s: 'AI_REPLIED',
    sent: 'positivo',
    time: 'ontem',
    c: 'Mencionou você em um story.',
    media: '',
    ai: 'Obrigado pela menção! Vamos compartilhar nos nossos stories.',
  },
  {
    id: 'i5',
    a: 'a3',
    u: 'tutor.bia',
    t: 'DM',
    s: 'UNREAD',
    sent: 'neutro',
    time: '10:03',
    c: 'Meu cachorro está com febre, consigo consulta hoje?',
    media: '',
    ai: 'Sinto muito pelo Thor! Vou avisar a equipe agora para atendê-la com prioridade. Pode me passar seu telefone?',
    esc: true,
  },
  {
    id: 'i6',
    cat: 'duvida',
    a: 'a3',
    u: 'petshop.sol',
    t: 'COMMENT',
    s: 'UNREAD',
    sent: 'positivo',
    time: '09:30',
    c: 'Quero saber os planos!',
    media: 'Reels · Como a IA confirma consulta',
    ai: 'Oi! Te mandei os planos por DM agora mesmo.',
  },
  {
    id: 'i7',
    a: 'a2',
    u: 'loja.centro',
    t: 'DM',
    s: 'UNREAD',
    sent: 'positivo',
    time: '11:20',
    c: 'Vocês têm representantes no Paraná?',
    media: '',
    ai: 'Olá! Temos sim. Me conta sua cidade e a loja que você tem para indicarmos o contato regional.',
  },
  {
    id: 'i8',
    cat: 'elogio',
    a: 'a1',
    u: 'dev.carla',
    t: 'COMMENT',
    s: 'UNREAD',
    sent: 'positivo',
    time: '07:30',
    c: 'Conteúdo excelente, salvei para mostrar ao time!',
    media: 'Carrossel · Do briefing ao deploy',
    ai: 'Obrigado, Carla! Fico feliz que seja útil para o time. Se quiser, abro a etapa de SEO e GEO em um próximo post.',
  },
  {
    id: 'i9',
    cat: 'duvida',
    a: 'a1',
    u: 'startup.nuvem',
    t: 'COMMENT',
    s: 'UNREAD',
    sent: 'neutro',
    time: '06:48',
    c: 'Isso funciona com Supabase self-hosted?',
    media: 'Reels · 3 sinais de que seu produto precisa de um agente',
    ai: 'Funciona, sim. O agente acessa o Postgres por API ou conexão direta, hospedado onde você preferir. Te explico a arquitetura por DM?',
  },
  {
    id: 'i10',
    cat: 'spam',
    a: 'a1',
    u: 'agente.quero',
    t: 'COMMENT',
    s: 'UNREAD',
    sent: 'negativo',
    time: '06:10',
    c: 'Compre seguidores baratos, acesse bit.ly/xxx',
    media: 'Reels · 3 sinais de que seu produto precisa de um agente',
    ai: 'Spam detectado. Ação sugerida: ocultar comentário.',
  },
  {
    id: 'i11',
    cat: 'gatilho',
    a: 'a1',
    u: 'lucas.prod',
    t: 'COMMENT',
    s: 'UNREAD',
    sent: 'positivo',
    time: '05:55',
    c: 'AGENTE',
    media: 'Reels · 3 sinais de que seu produto precisa de um agente',
    ai: 'Oi, Lucas! Te enviei o material por DM.',
  },
  {
    id: 'i12',
    cat: 'elogio',
    a: 'a3',
    u: 'clinica.pet.sul',
    t: 'COMMENT',
    s: 'UNREAD',
    sent: 'positivo',
    time: '08:05',
    c: 'Que ideia boa, queremos testar!',
    media: 'Reels · Como a IA confirma consulta',
    ai: 'Que bom, equipe! Te chamei por DM para combinar um teste.',
  },
];

export const SEED_RULES: KeywordRule[] = [
  {
    id: 'r1',
    a: 'a1',
    kw: 'AGENTE',
    link: 'codemix.com.br/agentes',
    post: 'Reels · 3 sinais de que seu produto precisa de um agente',
    on: true,
  },
  {
    id: 'r2',
    a: 'a3',
    kw: 'AGENDA',
    link: 'vetbots.com.br/demo',
    post: 'Reels · Como a IA confirma consulta',
    on: true,
  },
];

