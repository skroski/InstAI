import { REAL_META_POSTS } from './real-posts';

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
  pageId?: string;
}

export type PostFormat = 'IMAGE' | 'CAROUSEL' | 'REELS' | 'STORIES';
export type PostStatus = 'DRAFT' | 'PROMPT_READY' | 'SCHEDULED' | 'PUBLISHED' | 'FAILED';

export type MediaType = 'image' | 'video';

export interface PostMedia {
  id: string;
  url: string; // Data URL (base64) ou Object URL ou HTTP URL
  type: MediaType;
  name: string;
  size?: number; // em bytes
  aspectRatio?: '1:1' | '4:5' | '9:16' | '16:9';
  thumbnailUrl?: string; // Capa/frame gerado para vídeos
}

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
  media?: PostMedia[];
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

export type IcpTier = 'TIER_1_OURO' | 'TIER_2_PRATA' | 'DESQUALIFICADO';

export interface ContactItem {
  id: string;
  a: string;
  u: string;
  tags: string[];
  src: string;
  last: string;
  email?: string;
  phone?: string;
  metaSynced?: boolean;
  icpScore?: number; // 0 - 100
  icpTier?: IcpTier;
}

export type IcpSegmentType = 'B2B' | 'B2C' | 'D2C' | 'SERVICOS';

export interface IcpProfile {
  id: string;
  a: string; // id da conta ig ou 'global'
  name: string;
  segmentType: IcpSegmentType;
  targetRole: string; // Perfil / Cargo / Persona
  companyProfile: string; // Porte / Faturamento / Cenário
  ticketMedio: string; // Faixa de preço / LTV
  pains: string[]; // Dores crônicas
  desires: string[]; // Desejos & Transformação
  greenFlags: string[]; // Sinais de alta qualificação (Tier 1)
  redFlags: string[]; // Sinais eliminatórios (Curiosos)
  objections: string[]; // Principais barreiras de compra
  hooks: string[]; // Ganchos recomendados para anúncios Meta
  metaKeywords: string[]; // Interesses para refinamento na Meta
  createdAt: string;
  updatedAt: string;
}

export interface MetaAdAccount {
  id: string; // Ex: 'act_1029384756'
  a: string; // id da conta ig vinculada
  name: string;
  currency: string;
  status: 'ACTIVE' | 'DISABLED' | 'PENDING';
  balance: number; // R$
  timezone: string;
  pixelId: string;
  portfolioId?: string; // Business Portfolio (Meta) à qual a conta pertence
  portfolioName?: string;
}

export type MetaAudienceType = 'CUSTOM_LIST' | 'LOOKALIKE' | 'IG_ENGAGEMENT';

export interface MetaAudience {
  id: string;
  a: string;
  name: string;
  type: MetaAudienceType;
  size: number;
  status: 'READY' | 'SYNCING' | 'ERROR';
  lookalikeRatio?: number; // 1 = 1%, 2 = 2%, etc.
  originAudienceName?: string;
  country?: string;
  lastSync: string;
}

export type MetaCampaignObjective = 'OUTCOME_LEADS' | 'OUTCOME_ENGAGEMENT' | 'OUTCOME_TRAFFIC' | 'OUTCOME_SALES';
export type MetaCampaignStatus = 'ACTIVE' | 'PAUSED' | 'ARCHIVED';

export interface MetaCampaign {
  id: string;
  a: string;
  name: string;
  objective: MetaCampaignObjective;
  status: MetaCampaignStatus;
  audienceId: string;
  audienceName: string;
  isLookalike: boolean;
  dailyBudget: number; // R$
  spend: number;
  impressions: number;
  clicks: number;
  leads: number;
  cpa: number; // R$ por lead
  roas: number;
  startDate: string;
  connectedPostId?: string;
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
    id: 'a_amaral',
    pageId: '185387824832414',
    user: 'amaralnatacao',
    name: 'Amaral Natação',
    ini: 'AN',
    st: 'ativo',
    days: 60,
    perms: 4,
    wh: true,
    voice: {
      tom: 'Acolhedor, motivador e familiar. Enfatiza constância, bem-estar, segurança aquática e respeito ao ritmo de cada aluno.',
      pub: 'Pais, mães, famílias, adultos e idosos que buscam natação infantil, hidroginástica ou prática esportiva em Curitiba.',
      regras: 'Sempre convidar para a aula experimental gratuita pelo WhatsApp (41) 98516-9970. Lembrar os 47 anos de tradição e as 7 piscinas.',
    },
    style:
      'crystal clear swimming pool water caustics, soft turquoise and royal blue highlights (#0077b6, #00b4d8), natural sun rays piercing water, warm family smiles, premium swim academy editorial --style raw',
  },
  {
    id: 'a2',
    pageId: '184846338220933',
    user: 'duplod.oficial',
    name: 'Duplo D Design & Dev',
    ini: 'DD',
    st: 'ativo',
    days: 60,
    perms: 4,
    wh: true,
    voice: {
      tom: 'Estratégico, moderno, autoritativo e inspirador sobre design visual, grids e engenharia de software.',
      pub: 'Empreendedores, designers, desenvolvedores e marcas que buscam interfaces de alto impacto, automações e produtos digitais.',
      regras: 'Sempre conectar design visual com usabilidade e resultados de negócios. Valorizar técnica e clareza.',
    },
    style:
      'sleek dark UI design canvas, subtle geometric grid overlay, neon coral and deep violet gradients (#ff477e, #7928ca), clean typography, modern tech aesthetic --style raw',
  },
  {
    id: 'a1',
    user: 'codemix.web',
    name: 'Codemix — Soluções Web',
    ini: 'CW',
    st: 'ativo',
    days: 60,
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
  a_amaral: {
    k: [
      ['seguidores', '11,4 mil', '11.380'],
      ['alcance 30d', '94,6 mil', '+18%'],
      ['engajamento', '5,2%', '+0,8 pp'],
      ['salvamentos', '1.820', '+24%'],
    ],
    f: [
      ['Carrossel', 78],
      ['Reels', 62],
      ['Imagem', 41],
      ['Stories', 35],
    ],
    h: ['qui 20h', 'qua 18h', 'sáb 10h'],
    p: [
      'Carrosséis educativos sobre técnica de nado e adaptação infantil geram 78% mais salvamentos.',
      'Concentrar posts de família e rotina às quintas e sextas.',
      'Reforçar o convite para aula experimental gratuita via WhatsApp (41) 98516-9970.',
    ],
  },
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
      ['seguidores', '614', '614'],
      ['alcance 30d', '18,4 mil', '+6%'],
      ['engajamento', '4,3%', '+0,5 pp'],
      ['salvamentos', '390', '+11%'],
    ],
    f: [
      ['Carrossel', 71],
      ['Reels', 54],
      ['Imagem', 38],
      ['Stories', 22],
    ],
    h: ['sex 19h', 'ter 18h', 'dom 11h'],
    p: [
      'Carrosséis técnicos sobre grids, tipografia e design visual retêm 71% dos leitores.',
      'Publicar estudos de caso práticos de código e design.',
      'Manter estilo visual consistente de acordo com o Brand Voice.',
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
  ...REAL_META_POSTS,
  // --- CODEMIX WEB (@codemix.web - B2B SaaS & IA) ---
  {
    id: 'p1',
    a: 'a1',
    t: 'REELS',
    s: 'PUBLISHED',
    topic: '3 sinais de que seu produto precisa de um agente de IA',
    cap: 'Seu time responde a mesma pergunta 20 vezes por dia?\n\nSe sim, o problema não é equipe. É processo.\n\nNeste Reels mostro 3 sinais clássicos de que um agente de IA orquestrado com n8n e Supabase resolve seu gargalo de atendimento em 1 semana.\n\nQuer ver a arquitetura completa? Comente AGENTE que envio no seu Direct.',
    tags: ['#ia', '#automacao', '#n8n', '#supabase', '#saas'],
    pr: [
      {
        t: 'Capa Reels 9:16',
        ar: '9:16',
        x: '3D floating node network on charcoal #1e1e1e, warm amber glowing lines (#F1A10B), technical schematic overlay, depth of field --ar 9:16',
      },
    ],
    day: 1,
    time: '12:30',
    ai: 'Claude 3.7',
    media: [
      {
        id: 'med_p1_1',
        type: 'video',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        name: 'reels_agente_ia.mp4',
        aspectRatio: '9:16',
        thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=720&q=80',
      },
    ],
  },
  {
    id: 'p2',
    a: 'a1',
    t: 'CAROUSEL',
    s: 'SCHEDULED',
    topic: 'Do briefing ao deploy: meu fluxo com agentes',
    cap: 'Briefing, UI/UX, código, SEO e GEO. O fluxo completo em 7 slides.\n\nSlide 1: O problema do retrabalho entre design e código.\nSlide 2: Como estruturar prompts técnicos no Gemini 2.5.\nSlide 3: Validação de schemas JSON no Codex.\nSlide 4: Integração contínua com Vercel e Supabase.\nSlide 5: Testes de ponta a ponta com Playwright.\nSlide 6: Resultados: 4x mais velocidade de entrega.\nSlide 7: CTA: Salve este post e comente FLUXO para o template.\n\nDúvida sobre alguma etapa? Deixe nos comentários!',
    tags: ['#produtodigital', '#typescript', '#uiux', '#engenharia'],
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
    day: 4,
    time: '18:00',
    ai: 'Gemini 2.5',
    media: [
      {
        id: 'med_p2_1',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
        name: 'slide1_briefing.jpg',
        aspectRatio: '4:5',
      },
      {
        id: 'med_p2_2',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
        name: 'slide2_arquitetura.jpg',
        aspectRatio: '4:5',
      },
      {
        id: 'med_p2_3',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
        name: 'slide3_deploy.jpg',
        aspectRatio: '4:5',
      },
    ],
  },
  {
    id: 'p3',
    a: 'a1',
    t: 'IMAGE',
    s: 'PROMPT_READY',
    topic: 'Supabase RLS sem dor: multi-tenant na prática',
    cap: 'Multi-tenant sem vazar dado entre clientes: RLS com tenant_id em toda tabela e auth.uid() nas policies.\n\nQuando você projeta para escalar, segurança não é um pós-lançamento, é o alicerce.\n\nSalve para a sua próxima sprint.',
    tags: ['#supabase', '#postgres', '#saas', '#seguranca'],
    pr: [
      {
        t: 'Imagem única',
        ar: '4:5',
        x: 'Dark graphite desk, laptop showing a schema diagram out of focus, warm amber key light, 35mm, shallow depth of field --ar 4:5',
      },
    ],
    day: null,
    time: '',
    ai: 'Claude',
    media: [
      {
        id: 'med_p3_1',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
        name: 'supabase_rls.jpg',
        aspectRatio: '4:5',
      },
    ],
  },
  {
    id: 'p4',
    a: 'a1',
    t: 'STORIES',
    s: 'PUBLISHED',
    topic: 'Bastidores: TypeScript + n8n + Supabase em Produção',
    cap: 'Sequência de 5 stories mostrando o setup do dia, monitoramento de webhooks e testes com Meta Graph API.',
    tags: ['#bastidores', '#devlife'],
    pr: [],
    day: 0,
    time: '09:00',
    ai: 'Claude',
    media: [
      {
        id: 'med_p4_1',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=720&q=80',
        name: 'stories_bastidores.jpg',
        aspectRatio: '9:16',
      },
    ],
  },
  {
    id: 'p5',
    a: 'a1',
    t: 'REELS',
    s: 'DRAFT',
    topic: 'Chatbot comum vs Agente de IA: A Diferença de R$ 10.000',
    cap: 'Um chatbot responde com frases pré-programadas e irrita o cliente. Um agente de IA consulta seu banco em milissegundos, executa ações e fecha negócios.\n\nVeja a comparação lado a lado neste vídeo.',
    tags: ['#agentesdeia', '#negocios', '#conversao'],
    pr: [],
    day: null,
    time: '',
    ai: 'Claude',
  },

  // --- DUPLO D (@duplod.oficial - Moda Feminina Atemporal) ---
  {
    id: 'p6',
    a: 'a2',
    t: 'REELS',
    s: 'PUBLISHED',
    topic: 'O segredo da alfaiataria que não amassa na mala',
    cap: 'Você viaja a trabalho e as roupas chegam amassadas? O segredo está na gramatura e na mistura nobre de fibras naturais com elastano estruturado.\n\nDemonstramos 3 peças da Coleção Cápsula que saem da mala direto para a sua reunião.\n\nComente LOOK para receber a curadoria com frete cortesia.',
    tags: ['#alfaiataria', '#modafeminina', '#estiloatemporal', '#elegancia'],
    pr: [
      {
        t: 'Capa Reels 9:16',
        ar: '9:16',
        x: 'Elegant woman in tailored slate blazer, luxury hotel lobby, natural warm window light, cinematic film grain, shallow depth of field --ar 9:16',
      },
    ],
    day: 2,
    time: '19:30',
    ai: 'Claude',
  },
  {
    id: 'p7',
    a: 'a2',
    t: 'CAROUSEL',
    s: 'SCHEDULED',
    topic: 'Guarda-Roupa Cápsula: 5 peças, 15 combinações elegantes',
    cap: 'Menos excesso, mais presença.\n\nSlide 1: A calça pantalona de linho encorpado.\nSlide 2: A camisa de seda pura off-white.\nSlide 3: O blazer oversized grafite.\nSlide 4: A saia midi plissada vinho.\nSlide 5: O trench coat atemporal.\n\nQual combinação você usaria amanhã? Comente abaixo.',
    tags: ['#guardaroupacapsula', '#outono', '#consultoriadeestilo'],
    pr: [
      {
        t: 'Carrossel 4:5',
        ar: '4:5',
        x: 'High-fashion editorial flatlay of premium linen and silk clothing on textured neutral stone, warm shadows, minimalist vogue aesthetic --ar 4:5',
      },
    ],
    day: 5,
    time: '11:00',
    ai: 'Gemini',
  },
  {
    id: 'p8',
    a: 'a2',
    t: 'IMAGE',
    s: 'PROMPT_READY',
    topic: 'Lançamento: O corte impecável do linho puro',
    cap: 'Textura que respira, caimento que veste com autoridade e conforto.\n\nDisponível do 36 ao 46 no nosso e-commerce com entrega prioritária.',
    tags: ['#linhopuro', '#modapremium', '#duplod'],
    pr: [
      {
        t: 'Foto Editorial 4:5',
        ar: '4:5',
        x: 'Detailed macro shot of fine linen garment texture, burgundy accent button, luxury tailoring atelier ambiance, soft side lighting --ar 4:5',
      },
    ],
    day: null,
    time: '',
    ai: 'Claude',
  },
  {
    id: 'p9',
    a: 'a2',
    t: 'STORIES',
    s: 'PUBLISHED',
    topic: 'Caixinha: Consultoria de Estilo com Duplo D',
    cap: 'Respondendo as dúvidas de combinação de sapatos e bolsas com nossas peças de alfaiataria.',
    tags: ['#stories', '#consultoria'],
    pr: [],
    day: 3,
    time: '14:00',
    ai: 'Claude',
  },

  // --- VETBOTS (@vetbots.ia - IA para Clínicas Veterinárias & Pet Shops) ---
  {
    id: 'p10',
    a: 'a3',
    t: 'REELS',
    s: 'PUBLISHED',
    topic: 'Como a IA confirmou 84 consultas em 1 sábado sem recepção',
    cap: 'Sábado de manhã é o horário de maior movimento na clínica: tutor chegando, vacina e telefone tocando.\n\nEnquanto a equipe veterinária focava no atendimento clínico, nosso bot confirmou os horários de segunda-feira e reagendou 6 desistências automaticamente.\n\nQuer testar na sua clínica? Comente AGENDA para receber o teste gratuito.',
    tags: ['#vet', '#clinicaveterinaria', '#gestaovet', '#ia'],
    pr: [
      {
        t: 'Capa 9:16',
        ar: '9:16',
        x: 'Modern clean veterinary hospital reception, friendly golden retriever looking happy, digital tablet showing appointment calendar, soft teal illumination --ar 9:16',
      },
    ],
    day: 3,
    time: '19:00',
    ai: 'Claude',
  },
  {
    id: 'p11',
    a: 'a3',
    t: 'CAROUSEL',
    s: 'SCHEDULED',
    topic: '5 motivos pelos quais tutores faltam à consulta veterinária',
    cap: '1. Esquecimento simples da data e horário.\n2. Incerteza se o exame precisava de jejum.\n3. Dificuldade de remarcar por telefone ocupado.\n4. Falta de lembrete 2h antes no WhatsApp.\n5. Trânsito sem opção de avisar rápido.\n\nA VetBots resolve os 5 pontos com mensagens automáticas e amigáveis.',
    tags: ['#gestaoclinica', '#veterinarios', '#noshow'],
    pr: [
      {
        t: 'Carrossel 4:5',
        ar: '4:5',
        x: 'Infographic slides on clean medical teal background, stylized 3D veterinary dog icon, clean typography with high readability --ar 4:5',
      },
    ],
    day: 6,
    time: '10:00',
    ai: 'Gemini',
  },
  {
    id: 'p12',
    a: 'a3',
    t: 'IMAGE',
    s: 'PUBLISHED',
    topic: 'Campanha de Vacinação Antirrábica & Polivalente',
    cap: 'Vacina em dia protege o seu pet e toda a sua família. Lembrete automático enviado para todos os tutores cadastrados na nossa clínica parceira.',
    tags: ['#vacinacao', '#saudepet', '#vetcare'],
    pr: [],
    day: 0,
    time: '10:00',
    ai: 'Claude',
  },

  // --- E:AGENCY (@eagency.design - Branding & Performance) ---
  {
    id: 'p13',
    a: 'a4',
    t: 'CAROUSEL',
    s: 'PUBLISHED',
    topic: 'Anatomia de um Redesign de Marca que aumentou conversão em 42%',
    cap: 'Identidade visual não é só estética decorativa. É clareza de proposta de valor.\n\nMostramos o case completo da fintech Nexus: da tipografia ao design system de produto.\n\nSlide 1: O diagnóstico da marca antiga.\nSlide 2: A nova paleta de alto contraste.\nSlide 3: O design system em tokens reutilizáveis.\nSlide 4: O impacto na taxa de conversão da landing page.\n\nLink do estudo completo na bio.',
    tags: ['#branding', '#designsystem', '#uiux', '#performance'],
    pr: [
      {
        t: 'Capa Carrossel',
        ar: '4:5',
        x: 'High contrast graphic design editorial magazine cover, geometric grid system, bold minimalist typography on cool slate background --ar 4:5',
      },
    ],
    day: 1,
    time: '14:00',
    ai: 'Claude',
  },
  {
    id: 'p14',
    a: 'a4',
    t: 'REELS',
    s: 'SCHEDULED',
    topic: '3 erros graves na tipografia de SaaS que você não percebe',
    cap: 'Usar fontes sem pesos suficientes, entrelinha muito apertada ou contraste insuficiente em modo escuro faz seu usuário cansar a vista e abandonar a página.\n\nVeja como corrigir isso em 3 passos rápidos.',
    tags: ['#tipografia', '#design', '#saasdesign'],
    pr: [
      {
        t: 'Capa 9:16',
        ar: '9:16',
        x: 'Minimalist typography art direction, large bold Helvetica-style letterforms, dark studio lighting with soft cyan edge light --ar 9:16',
      },
    ],
    day: 4,
    time: '16:30',
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
  // --- Codemix Web (a1) ---
  { id: 'c1', a: 'a1', u: 'marina.lopes.dev', email: 'marina.dev@techlead.io', phone: '+5511987654321', tags: ['lead quente', 'tier_1', 'saas'], src: 'AGENTE . Reels', last: 'hoje 09:12', metaSynced: true, icpScore: 94, icpTier: 'TIER_1_OURO' },
  { id: 'c2', a: 'a1', u: 'lucas.prod', email: 'lucas.product@techsaas.com', phone: '+5511976543210', tags: ['lead quente', 'tier_1', 'founder'], src: 'AGENTE . Reels', last: 'hoje 05:55', metaSynced: true, icpScore: 91, icpTier: 'TIER_1_OURO' },
  { id: 'c3', a: 'a1', u: 'clinica.horizonte', email: 'contato@clinicahorizonte.med.br', phone: '+5521998877665', tags: ['cliente', 'tier_1'], src: 'menção de story', last: 'ontem', metaSynced: true, icpScore: 88, icpTier: 'TIER_1_OURO' },
  { id: 'c4', a: 'a1', u: 'rafa.tech', email: 'rafael.tecnologia@outlook.com', phone: '+5531988776655', tags: ['novo', 'tier_2'], src: 'comentário', last: 'hoje 08:40', metaSynced: false, icpScore: 68, icpTier: 'TIER_2_PRATA' },
  { id: 'c5', a: 'a1', u: 'dev.carla', email: 'carla.costa.eng@gmail.com', phone: '+5541999881122', tags: ['novo', 'descarte'], src: 'comentário', last: 'hoje 07:30', metaSynced: false, icpScore: 35, icpTier: 'DESQUALIFICADO' },

  // --- Duplo D (a2) ---
  { id: 'c6', a: 'a2', u: 'loja.centro', email: 'comercial@lojacentrosp.com.br', phone: '+5511971112233', tags: ['lead quente', 'tier_1', 'atacado'], src: 'dm', last: 'hoje 11:20', metaSynced: true, icpScore: 92, icpTier: 'TIER_1_OURO' },
  { id: 'c7', a: 'a2', u: 'isabela.coutinho', email: 'isabela.coutinho@advocacia.com.br', phone: '+5511982223344', tags: ['cliente_vip', 'tier_1'], src: 'LOOK . Reels', last: 'ontem 18:40', metaSynced: true, icpScore: 96, icpTier: 'TIER_1_OURO' },
  { id: 'c8', a: 'a2', u: 'boutique.lumiere', email: 'contato@boutiquelumiere.com.br', phone: '+5541991122334', tags: ['lojista', 'tier_1'], src: 'comentário atacado', last: 'hoje 10:15', metaSynced: true, icpScore: 89, icpTier: 'TIER_1_OURO' },
  { id: 'c9', a: 'a2', u: 'patricia.albuquerque', email: 'patricia.albuquerque@gmail.com', phone: '+5521975556677', tags: ['consumidora', 'tier_2'], src: 'resposta story', last: 'ontem', metaSynced: false, icpScore: 74, icpTier: 'TIER_2_PRATA' },

  // --- VetBots (a3) ---
  { id: 'c10', a: 'a3', u: 'tutor.bia', email: 'beatriz.vet@hotmail.com', phone: '+5519987651234', tags: ['cliente', 'tier_1'], src: 'dm', last: 'hoje 10:03', metaSynced: true, icpScore: 92, icpTier: 'TIER_1_OURO' },
  { id: 'c11', a: 'a3', u: 'petshop.sol', email: 'financeiro@petshopsol.com.br', phone: '+5511991234567', tags: ['lead quente', 'tier_1', 'petshop'], src: 'AGENDA . Reels', last: 'hoje 09:30', metaSynced: true, icpScore: 90, icpTier: 'TIER_1_OURO' },
  { id: 'c12', a: 'a3', u: 'clinica.pet.sul', email: 'adm@petsul.com.br', phone: '+5551981223344', tags: ['lead quente', 'tier_2'], src: 'comentário', last: 'hoje 08:05', metaSynced: false, icpScore: 72, icpTier: 'TIER_2_PRATA' },
  { id: 'c13', a: 'a3', u: 'dr.marcelo.vet', email: 'marcelo@hospitalvetcampinas.com.br', phone: '+5519998811223', tags: ['hospital_vet', 'tier_1'], src: 'AGENDA . Reels', last: 'hoje 08:35', metaSynced: true, icpScore: 95, icpTier: 'TIER_1_OURO' },

  // --- e:agency (a4) ---
  { id: 'c14', a: 'a4', u: 'bruno_founder_saas', email: 'bruno@nexusfintech.io', phone: '+5511994445566', tags: ['lead quente', 'tier_1', 'branding'], src: 'dm', last: 'hoje 11:10', metaSynced: true, icpScore: 97, icpTier: 'TIER_1_OURO' },
  { id: 'c15', a: 'a4', u: 'agencia.vortex', email: 'diretoria@vortexmidia.com.br', phone: '+5531987778899', tags: ['parceria', 'tier_1'], src: 'comentário', last: 'ontem', metaSynced: true, icpScore: 86, icpTier: 'TIER_1_OURO' },
];

export const SEED_INTS: InteractionItem[] = [
  // --- Codemix Web (a1) ---
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

  // --- Duplo D (a2) ---
  {
    id: 'i7',
    a: 'a2',
    u: 'loja.centro',
    t: 'DM',
    s: 'UNREAD',
    sent: 'positivo',
    time: '11:20',
    c: 'Vocês têm representantes no Paraná? Queremos revender a linha de alfaiataria em Maringá e Curitiba.',
    media: '',
    ai: 'Olá! Temos sim. Atendemos lojistas multimarcas selecionados. Vou te enviar o catálogo B2B de outono e a tabela de atacado no seu e-mail!',
  },
  {
    id: 'i13',
    a: 'a2',
    u: 'isabela.coutinho',
    t: 'DM',
    s: 'UNREAD',
    sent: 'positivo',
    time: '10:45',
    c: 'Oi meninas! O blazer grafite veste tamanho padrão? Uso 38 na Zara.',
    media: '',
    ai: 'Olá Isabela! Nossa modelagem é padrão alfaiataria brasileira sob medida: o 38 veste perfeitamente busto até 90cm e cintura até 74cm. O tecido tem 2% de elastano para conforto!',
  },
  {
    id: 'i14',
    cat: 'gatilho',
    a: 'a2',
    u: 'patricia.albuquerque',
    t: 'COMMENT',
    s: 'UNREAD',
    sent: 'positivo',
    time: '09:10',
    c: 'LOOK',
    media: 'Reels · O segredo da alfaiataria que não amassa',
    ai: 'Olá Patricia! Te enviamos a seleção do lookbook e o cupom de frete grátis por Direct!',
  },
  {
    id: 'i15',
    cat: 'elogio',
    a: 'a2',
    u: 'boutique.lumiere',
    t: 'COMMENT',
    s: 'UNREAD',
    sent: 'positivo',
    time: '08:20',
    c: 'O caimento das peças de vocês é surreal de elegante. Parabéns pelo bom gosto!',
    media: 'Carrossel · Guarda-Roupa Cápsula',
    ai: 'Muito obrigada pelo carinho! Cada corte é pensado na mulher contemporânea.',
  },

  // --- VetBots (a3) ---
  {
    id: 'i5',
    a: 'a3',
    u: 'tutor.bia',
    t: 'DM',
    s: 'UNREAD',
    sent: 'neutro',
    time: '10:03',
    c: 'Meu cachorro está com febre e não quer comer, consigo consulta de urgência hoje?',
    media: '',
    ai: 'Sinto muito pelo seu pet, Beatriz! Como é caso de febre e prostração, avisei o plantonista agora. Pode trazer imediatamente à clínica que estamos de prontidão!',
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
    c: 'Quero saber os planos para pet shop com 3 consultórios!',
    media: 'Reels · Como a IA confirma consulta sem a recepção atender',
    ai: 'Oi! Te mandei os planos e a demonstração por DM agora mesmo.',
  },
  {
    id: 'i12',
    cat: 'gatilho',
    a: 'a3',
    u: 'clinica.pet.sul',
    t: 'COMMENT',
    s: 'UNREAD',
    sent: 'positivo',
    time: '08:05',
    c: 'AGENDA',
    media: 'Reels · Como a IA confirma consulta sem a recepção atender',
    ai: 'Que bom, equipe! Te enviei o link de demonstração gratuita por Direct.',
  },
  {
    id: 'i16',
    a: 'a3',
    u: 'dr.marcelo.vet',
    t: 'DM',
    s: 'UNREAD',
    sent: 'positivo',
    time: '07:45',
    c: 'Vocês têm case com redução de no-show em exames laboratoriais veterinários?',
    media: '',
    ai: 'Bom dia Dr. Marcelo! Temos sim: o Hospital Vet Sul reduziu no-show de exames de ultrassom de 28% para 3% apenas com confirmação interativa 4h antes.',
  },

  // --- e:agency (a4) ---
  {
    id: 'i17',
    a: 'a4',
    u: 'bruno_founder_saas',
    t: 'DM',
    s: 'UNREAD',
    sent: 'positivo',
    time: '11:10',
    c: 'Fala time da e:agency! Adoramos o redesign da Nexus. Estamos fechando rodada de captação e precisamos reformular nossa marca. Como funciona o onboarding de vocês?',
    media: '',
    ai: 'Fala Bruno! Nosso processo inicia com um sprint de diagnóstico de posicionamento de 5 dias, seguido por identidade visual e design system. Posso te enviar nossa apresentação de cases?',
  },
  {
    id: 'i18',
    cat: 'elogio',
    a: 'a4',
    u: 'agencia.vortex',
    t: 'COMMENT',
    s: 'UNREAD',
    sent: 'positivo',
    time: '09:50',
    c: 'A tipografia dessa capa ficou impecável! Excelente direção de arte.',
    media: 'Carrossel · Anatomia de um Redesign de Marca',
    ai: 'Valeu demais equipe Vortex! O segredo foi o equilíbrio entre peso editorial e respiro.',
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

export const SEED_AD_ACCOUNTS: MetaAdAccount[] = [
  {
    id: 'act_1124982890873935',
    a: 'a1',
    name: 'Anuncios Codemix',
    currency: 'BRL',
    status: 'ACTIVE',
    balance: 1450.0,
    timezone: 'America/Sao_Paulo',
    pixelId: 'px_codemix_meta_2026',
  },
  {
    id: 'act_891826527522907',
    a: 'a2',
    name: 'Anúncios Duplo D',
    currency: 'BRL',
    status: 'ACTIVE',
    balance: 890.0,
    timezone: 'America/Sao_Paulo',
    pixelId: 'px_duplod_meta_2026',
  },
  {
    id: 'act_8392019481',
    a: 'a3',
    name: 'VetBots Automações Ads',
    currency: 'BRL',
    status: 'ACTIVE',
    balance: 2310.0,
    timezone: 'America/Sao_Paulo',
    pixelId: 'px_1029384820193',
  },
];

export const SEED_AUDIENCES: MetaAudience[] = [
  // --- Codemix Web (a1) ---
  {
    id: 'aud_1',
    a: 'a1',
    name: 'Lookalike 1% Brasil — Leads Quentes de DMs & Comentários',
    type: 'LOOKALIKE',
    size: 1650000,
    status: 'READY',
    lookalikeRatio: 1,
    originAudienceName: 'Lista VIP — Leads Inbox & Palavra "AGENTE"',
    country: 'BR',
    lastSync: 'hoje às 06:30',
  },
  {
    id: 'aud_2',
    a: 'a1',
    name: 'Lista VIP — Leads Inbox & Palavra "AGENTE"',
    type: 'CUSTOM_LIST',
    size: 420,
    status: 'READY',
    country: 'BR',
    lastSync: 'hoje às 06:15',
  },
  {
    id: 'aud_3',
    a: 'a1',
    name: 'Engajamento IG 90 Dias — Comentários & Directs',
    type: 'IG_ENGAGEMENT',
    size: 24500,
    status: 'READY',
    country: 'BR',
    lastSync: 'ontem às 23:00',
  },
  {
    id: 'aud_4',
    a: 'a1',
    name: 'Lookalike 2% Brasil — Engajadores de Reels & Carrosséis',
    type: 'LOOKALIKE',
    size: 3300000,
    status: 'READY',
    lookalikeRatio: 2,
    originAudienceName: 'Engajamento IG 90 Dias — Comentários & Directs',
    country: 'BR',
    lastSync: 'ontem às 23:45',
  },

  // --- Duplo D (a2) ---
  {
    id: 'aud_duplo_1',
    a: 'a2',
    name: 'Lookalike 1% Brasil — Compradoras Moda Atemporal A/B',
    type: 'LOOKALIKE',
    size: 1600000,
    status: 'READY',
    lookalikeRatio: 1,
    originAudienceName: 'Lista de Clientes VIP — Ticket > R$ 500',
    country: 'BR',
    lastSync: 'hoje às 08:00',
  },
  {
    id: 'aud_duplo_2',
    a: 'a2',
    name: 'Lista de Clientes VIP — Ticket > R$ 500',
    type: 'CUSTOM_LIST',
    size: 680,
    status: 'READY',
    country: 'BR',
    lastSync: 'ontem às 19:00',
  },

  // --- VetBots (a3) ---
  {
    id: 'aud_5',
    a: 'a3',
    name: 'Lookalike 1% Brasil — Donos de Clínicas Veterinárias & Pet Shops',
    type: 'LOOKALIKE',
    size: 1620000,
    status: 'READY',
    lookalikeRatio: 1,
    originAudienceName: 'Leads Capturados — Automação Palavra "AGENDA"',
    country: 'BR',
    lastSync: 'hoje às 04:00',
  },
  {
    id: 'aud_vet_2',
    a: 'a3',
    name: 'Lista de Clínicas & Hospitais Veterinários Cadastrados',
    type: 'CUSTOM_LIST',
    size: 512,
    status: 'READY',
    country: 'BR',
    lastSync: 'hoje às 07:30',
  },

  // --- e:agency (a4) ---
  {
    id: 'aud_eagency_1',
    a: 'a4',
    name: 'Lookalike 1% Brasil — Founders de Startups & Tech Leads',
    type: 'LOOKALIKE',
    size: 1580000,
    status: 'READY',
    lookalikeRatio: 1,
    originAudienceName: 'Clientes de Branding e Design System',
    country: 'BR',
    lastSync: 'ontem às 16:00',
  },
];

export const SEED_CAMPAIGNS: MetaCampaign[] = [
  // --- Codemix Web (a1) ---
  {
    id: 'cmp_1',
    a: 'a1',
    name: 'LAL 1% BR | Agentes de IA para SaaS e Negócios Web',
    objective: 'OUTCOME_LEADS',
    status: 'ACTIVE',
    audienceId: 'aud_1',
    audienceName: 'Lookalike 1% Brasil — Leads Quentes de DMs & Comentários',
    isLookalike: true,
    dailyBudget: 60.0,
    spend: 420.5,
    impressions: 18450,
    clicks: 684,
    leads: 48,
    cpa: 8.76,
    roas: 4.85,
    startDate: '24/10/2026',
    connectedPostId: 'p1',
  },
  {
    id: 'cmp_2',
    a: 'a1',
    name: 'Remarketing | Lista de Contatos Capturados nas DMs',
    objective: 'OUTCOME_SALES',
    status: 'ACTIVE',
    audienceId: 'aud_2',
    audienceName: 'Lista VIP — Leads Inbox & Palavra "AGENTE"',
    isLookalike: false,
    dailyBudget: 35.0,
    spend: 210.0,
    impressions: 4890,
    clicks: 312,
    leads: 29,
    cpa: 7.24,
    roas: 6.2,
    startDate: '26/10/2026',
    connectedPostId: 'p2',
  },
  {
    id: 'cmp_3',
    a: 'a1',
    name: 'Escala LAL 2% | Reels Top Engajamento 3 Sinais',
    objective: 'OUTCOME_ENGAGEMENT',
    status: 'PAUSED',
    audienceId: 'aud_4',
    audienceName: 'Lookalike 2% Brasil — Engajadores de Reels & Carrosséis',
    isLookalike: true,
    dailyBudget: 100.0,
    spend: 950.0,
    impressions: 42100,
    clicks: 1420,
    leads: 62,
    cpa: 15.32,
    roas: 3.1,
    startDate: '15/10/2026',
    connectedPostId: 'p1',
  },

  // --- Duplo D (a2) ---
  {
    id: 'cmp_duplo_1',
    a: 'a2',
    name: 'LAL 1% BR | Alfaiataria Atemporal & Coleção Outono',
    objective: 'OUTCOME_SALES',
    status: 'ACTIVE',
    audienceId: 'aud_duplo_1',
    audienceName: 'Lookalike 1% Brasil — Compradoras Moda Atemporal A/B',
    isLookalike: true,
    dailyBudget: 75.0,
    spend: 525.0,
    impressions: 26800,
    clicks: 940,
    leads: 68,
    cpa: 7.72,
    roas: 7.4,
    startDate: '23/10/2026',
    connectedPostId: 'p6',
  },
  {
    id: 'cmp_duplo_2',
    a: 'a2',
    name: 'Remarketing | Carrinho & Directs Lookbook',
    objective: 'OUTCOME_SALES',
    status: 'ACTIVE',
    audienceId: 'aud_duplo_2',
    audienceName: 'Lista de Clientes VIP — Ticket > R$ 500',
    isLookalike: false,
    dailyBudget: 40.0,
    spend: 280.0,
    impressions: 8900,
    clicks: 420,
    leads: 35,
    cpa: 8.0,
    roas: 8.9,
    startDate: '25/10/2026',
    connectedPostId: 'p7',
  },

  // --- VetBots (a3) ---
  {
    id: 'cmp_4',
    a: 'a3',
    name: 'LAL 1% Clínicas | Confirmação de Consulta via IA',
    objective: 'OUTCOME_LEADS',
    status: 'ACTIVE',
    audienceId: 'aud_5',
    audienceName: 'Lookalike 1% Brasil — Donos de Clínicas Veterinárias & Pet Shops',
    isLookalike: true,
    dailyBudget: 50.0,
    spend: 350.0,
    impressions: 14900,
    clicks: 530,
    leads: 38,
    cpa: 9.21,
    roas: 5.1,
    startDate: '20/10/2026',
    connectedPostId: 'p10',
  },
  {
    id: 'cmp_vet_2',
    a: 'a3',
    name: 'Captação | Gestores Veterinários — Redução de No-Show',
    objective: 'OUTCOME_LEADS',
    status: 'ACTIVE',
    audienceId: 'aud_vet_2',
    audienceName: 'Lista de Clínicas & Hospitais Veterinários Cadastrados',
    isLookalike: false,
    dailyBudget: 45.0,
    spend: 315.0,
    impressions: 9800,
    clicks: 390,
    leads: 31,
    cpa: 10.16,
    roas: 4.8,
    startDate: '24/10/2026',
    connectedPostId: 'p11',
  },

  // --- e:agency (a4) ---
  {
    id: 'cmp_eagency_1',
    a: 'a4',
    name: 'LAL 1% BR | Captação de Projetos de Branding para Tech',
    objective: 'OUTCOME_LEADS',
    status: 'ACTIVE',
    audienceId: 'aud_eagency_1',
    audienceName: 'Lookalike 1% Brasil — Founders de Startups & Tech Leads',
    isLookalike: true,
    dailyBudget: 60.0,
    spend: 420.0,
    impressions: 16200,
    clicks: 510,
    leads: 32,
    cpa: 13.12,
    roas: 5.6,
    startDate: '21/10/2026',
    connectedPostId: 'p13',
  },
];

export const SEED_ICPS: IcpProfile[] = [
  {
    id: 'icp_1',
    a: 'a1',
    name: 'Tech Founders & Gestores de Produto (SaaS/Web)',
    segmentType: 'B2B',
    targetRole: 'Founders, CTOs, Tech Leads e Diretores de Operação',
    companyProfile: 'SaaS ou negócios digitais com faturamento > R$ 30k/mês e gargalo em suporte/DM',
    ticketMedio: 'R$ 3.500 a R$ 12.000 / projeto',
    pains: [
      'Equipe sobrecarregada respondendo dúvidas repetitivas no WhatsApp e Direct',
      'Perda de vendas por demora no atendimento de leads quentes',
      'Custo alto com atendentes humanos em tarefas que poderiam ser automatizadas',
      'Chatbots tradicionais engessados que irritam os clientes',
    ],
    desires: [
      'Operação de atendimento e qualificação 24/7 com inteligência artificial',
      'Leads qualificados e passados para o WhatsApp em menos de 1 minuto',
      'Redução de até 70% no custo operacional de suporte',
      'Escalar o faturamento sem precisar dobrar a equipe',
    ],
    greenFlags: [
      'Já possui faturamento e tração de clientes ativa',
      'Tem urgência e orçamento aprovado para implementação',
      'Usa stack moderna (Supabase, PostgreSQL, n8n, WhatsApp API)',
      'O interlocutor é o tomador de decisão final (Founder/Diretor)',
    ],
    redFlags: [
      'Ainda está na fase da ideia, sem produto ou clientes',
      'Busca soluções gratuitas ou "milagrosas"',
      'Não tem tempo nem interesse em alinhar os fluxos da empresa',
      'Curioso ou estudante sem intenção comercial',
    ],
    objections: [
      '"Já contratei bot antes e foi uma experiência horrível"',
      '"Tenho receio de a IA passar informações erradas de preço ou produto"',
      '"Quanto tempo leva para ficar pronto e funcionando?"',
    ],
    hooks: [
      'Se seu time gasta mais de 2 horas por dia respondendo o mesmo direct, você está queimando caixa.',
      'Como qualificamos leads no Instagram e passamos pro WhatsApp em 40 segundos.',
      'A diferença entre um chatbot burro de árvore de botões e um agente de IA conectado ao seu banco.',
    ],
    metaKeywords: [
      'Software as a service',
      'Automação de processos',
      'Inteligência Artificial',
      'Startups',
      'Empreendedorismo',
    ],
    createdAt: '24/10/2026',
    updatedAt: '31/10/2026',
  },
  {
    id: 'icp_2',
    a: 'a2',
    name: 'Mulheres Contemporâneas — Moda Atemporal',
    segmentType: 'D2C',
    targetRole: 'Mulheres de 28 a 48 anos, profissionais independentes, classe A/B',
    companyProfile: 'Consumidoras finais com alto padrão estético e busca por sofisticação',
    ticketMedio: 'R$ 380 a R$ 1.200 / pedido',
    pains: [
      'Roupas de fast-fashion que estragam na primeira lavagem',
      'Falta de tempo para pesquisar looks e ir a shoppings',
      'Dificuldade de encontrar roupas elegantes que sirvam para trabalho e eventos',
    ],
    desires: [
      'Guarda-roupa cápsula inteligente com peças que combinam entre si',
      'Elegância sem esforço no dia a dia',
      'Tecidos nobres de alta durabilidade e caimento impecável',
    ],
    greenFlags: [
      'Compra online com frequência e valoriza acabamento',
      'Já consome marcas de alfaiataria premium',
      'Prioriza qualidade e durabilidade sobre preço baixo',
    ],
    redFlags: [
      'Busca apenas descontos agressivos ou liquidação',
      'Prefere sintéticos de baixo custo descartáveis',
    ],
    objections: [
      '"E se o tamanho não der certo?"',
      '"O tecido é realmente tão bom quanto nas fotos?"',
    ],
    hooks: [
      '3 peças essenciais de alfaiataria que substituem 10 roupas de fast-fashion.',
      'Como montar um guarda-roupa sofisticado sem perder tempo toda manhã.',
    ],
    metaKeywords: [
      'Moda sustentável',
      'Alfaiataria feminina',
      'Estilo clássico',
      'Lojas de moda premium',
    ],
    createdAt: '20/10/2026',
    updatedAt: '31/10/2026',
  },
  {
    id: 'icp_3',
    a: 'a3',
    name: 'Veterinários e Gestores de Clínicas Pet',
    segmentType: 'B2B',
    targetRole: 'Médicos Veterinários Proprietários e Administradores de Clínicas',
    companyProfile: 'Clínicas veterinárias e pet shops com consultório faturando > R$ 40k/mês',
    ticketMedio: 'R$ 1.800 a R$ 4.500 / mês',
    pains: [
      'No-show (tutores que faltam consultas e exames sem avisar)',
      'Recepção sobrecarregada e atendimento desorganizado no WhatsApp',
      'Vacinas e vermífugos atrasados sem retorno automático dos tutores',
    ],
    desires: [
      'Agenda cheia com confirmação automática de consultas 24h antes',
      'Disparo automático de lembretes de vacina no WhatsApp dos tutores',
      'Recepção livre para acolher os pacientes presenciais',
    ],
    greenFlags: [
      'Clínica em funcionamento com mais de 1 veterinário',
      'Mais de 100 atendimentos por mês',
      'Desejo imediato de reduzir faltas e perdas de faturamento',
    ],
    redFlags: [
      'Veterinário autônomo sem consultório físico nem agenda fixa',
      'Sem nenhum volume de clientes atual',
    ],
    objections: [
      '"Os tutores mais velhos vão conseguir usar o WhatsApp?"',
      '"Integra com meu sistema veterinário atual?"',
    ],
    hooks: [
      'Quantas consultas sua clínica perdeu este mês porque o tutor simplesmente esqueceu?',
      'Como automatizar a confirmação de consultas da sua clínica e zerar o no-show.',
    ],
    metaKeywords: [
      'Medicina veterinária',
      'Clínica veterinária',
      'Pet shop',
      'Gestão de clínicas',
    ],
    createdAt: '18/10/2026',
    updatedAt: '31/10/2026',
  },
  {
    id: 'icp_4',
    a: 'a4',
    name: 'Founders e CMOs de Startups Tech',
    segmentType: 'B2B',
    targetRole: 'Founders, CMOs e VPs de Marketing de Startups em Captação',
    companyProfile: 'Startups Seed a Série A que precisam de branding e design system de alta conversão',
    ticketMedio: 'R$ 15.000 a R$ 45.000 / projeto',
    pains: [
      'Identidade visual genérica que não transmite a sofisticação da tecnologia',
      'Taxa de conversão baixa na landing page por falta de clareza e autoridade',
      'Design inconsistente entre marketing, site e app',
    ],
    desires: [
      'Marca de presença global pronta para rodadas com fundos internacionais',
      'Design System em tokens de código que acelera o time de produto em 3x',
      'Destaque frente à concorrência com posicionamento editorial marcante',
    ],
    greenFlags: [
      'Rodada de investimento captada ou faturamento > R$ 100k/mês',
      'Produto já validado precisando de escala',
      'Decisor principal envolvido no projeto',
    ],
    redFlags: [
      'Procura apenas um "logozinho rápido"',
      'Orçamento sem verba de consultoria profissional',
    ],
    objections: [
      '"Qual o prazo para termos os entregáveis prontos para o lançamento?"',
      '"Vocês entregam o código ou só os arquivos do Figma?"',
    ],
    hooks: [
      'Por que marcas tech com design amador perdem valuation antes da rodada.',
      'A diferença entre um design bonito e um Design System que vende.',
    ],
    metaKeywords: [
      'Venture Capital',
      'Startups',
      'Design System',
      'UI UX',
      'Branding Tech',
    ],
    createdAt: '22/10/2026',
    updatedAt: '31/10/2026',
  },
];



