import { REAL_META_POSTS } from './real-posts';

export type AccountStatus = 'ativo' | 'expirando' | 'erro' | 'pendente';

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
  adAccountId?: string; // conta de anúncios principal deste cliente (ver MetaAdAccount.a)
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
  day: number | null; // 0 = segunda … 6 = domingo (legado; a data real fica em `date`)
  date?: string; // YYYY-MM-DD, horário de Brasília
  time: string; // HH:MM
  ai: string;
  media?: PostMedia[];
  permalink?: string; // URL pública da publicação na Meta (quando já publicada)
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

// Configuração vazia para contas novas. Usada quando a conta não tem TWINS próprio.
export const EMPTY_TWIN: TwinConfig = {
  kpi: [],
  sources: [],
  fields: [],
  out: '',
  offers: [],
  presets: [],
  qa: {},
};

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

export type MetaAudienceType = 'CUSTOM_LIST' | 'LOOKALIKE' | 'IG_ENGAGEMENT' | 'SAVED_INTEREST';

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

// Valores vazios para contas novas: sem isso, a conta herdaria os dados do Amaral.
export const EMPTY_METRICS: AccountMetrics = { k: [], f: [], h: [], p: [] };

export const ACCS: Account[] = [
  {
    id: 'a_amaral',
    pageId: '185387824832414',
    adAccountId: 'act_1124982890873935',
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
      regras: 'Sempre convidar para a aula experimental gratuita pelo WhatsApp (41) 98516-9970. Lembrar os 47 anos de tradição e as 7 piscinas aquecidas com ozônio.',
    },
    style:
      'crystal clear swimming pool water caustics, soft turquoise and royal blue highlights (#0077b6, #00b4d8), natural sun rays piercing water, warm family smiles, premium swim academy editorial --style raw',
  },
  {
    id: 'a2',
    pageId: '184846338220933',
    adAccountId: 'act_891826527522907',
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
      regras: 'Sempre conectar design visual com usabilidade e resultados de negócios. Valorizar técnica, design systems e clareza de código.',
    },
    style:
      'sleek dark UI design canvas, subtle geometric grid overlay, neon coral and deep violet gradients (#ff477e, #7928ca), clean typography, modern tech aesthetic --style raw',
  },
  {
    id: 'a_vetbots',
    pageId: '134910416362221',
    user: 'vetbots',
    name: 'VetBots',
    ini: 'VB',
    st: 'ativo',
    days: 60,
    perms: 4,
    wh: true,
    voice: {
      tom: 'Próximo, prático e confiável. Fala com o gestor da clínica sem jargão, com dado concreto e sem promessa exagerada.',
      pub: 'Donos de clínicas e hospitais veterinários que querem automatizar atendimento, agendamento e recepção.',
      regras: 'Nunca substituir o veterinário: orientações de saúde sempre remetem à consulta presencial. Focar em redução de faltas e automação humanizada no WhatsApp.',
    },
    style:
      'editorial photography, strong natural window light at late afternoon, shallow depth of field, petrol blue and warm light wood tones, cream walls, golden retriever, candid genuine expression, premium veterinary clinic --style raw',
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

export const METRICS: Record<string, AccountMetrics> = {};

export const SEED_POSTS: PostItem[] = [
  ...REAL_META_POSTS,
];

export const TWINS: Record<string, TwinConfig> = {
  a_amaral: {
    kpi: [],
    sources: [
      ['HISTÓRIA', '47 anos de tradição na água em Curitiba', 'indexado'],
      ['INFRA', '7 piscinas aquecidas e tratadas com ozônio', 'indexado'],
      ['MÉTODO', 'Metodologia Gustavo Borges e acompanhamento por níveis', 'indexado'],
      ['WHATSAPP', 'Canal oficial (41) 98516-9970', 'indexado'],
      ['LOCALIZAÇÃO', 'Rua Joaquim da Silva Sampaio, 303 - Mercês, Curitiba', 'indexado'],
    ],
    fields: [
      { l: 'natação infantil', on: true },
      { l: 'natação bebês', on: true },
      { l: 'hidroginástica', on: true },
      { l: 'natação adulto', on: true },
      { l: 'aula experimental gratuita', on: true },
      { l: 'metodologia Gustavo Borges', on: true },
      { l: 'piscinas aquecidas com ozônio', on: true },
      { l: 'avaliação médica', on: false },
    ],
    out: 'Para orientações médicas individuais ou atestados clínicos específicos, consulte seu médico. Sobre nossas turmas, estrutura e agendamento de aula experimental, posso te ajudar agora mesmo!',
    offers: [
      {
        n: 'Aula Experimental Gratuita',
        k: 'aula_experimental',
        link: 'https://wa.me/5541985169970?text=Olá!%20Vim%20pelo%20Instagram%20e%20gostaria%20de%20agendar%20uma%20aula%20experimental%20gratuita!',
        when: 'pede para agendar ou conhecer a escola',
      },
      {
        n: 'Grade de Horários e Matrícula',
        k: 'matricula',
        link: 'https://wa.me/5541985169970?text=Olá!%20Gostaria%20de%20receber%20a%20grade%20de%20horários%20e%20valores.',
        when: 'pergunta sobre horários, turmas e mensalidades',
      },
    ],
    presets: [
      'Como funciona a aula experimental gratuita?',
      'A partir de qual idade a criança pode iniciar?',
      'Como é o tratamento da água das piscinas?',
    ],
    qa: {
      'Como funciona a aula experimental gratuita?': {
        g: 'A Amaral oferece uma aula experimental gratuita para você ou seu filho conhecerem nossa estrutura, professores e método. Basta agendar pelo WhatsApp informando a faixa etária e o melhor período.',
        t: [
          'A aula experimental é 100% gratuita e guiada pelos nossos professores especialistas. Qual é a idade do aluno que vai nadar?',
          'É para meu filho de 4 anos.',
          'Perfeito! Na natação infantil trabalhamos adaptação lúdica e segurança aquática na piscina aquecida. Vamos agendar para essa semana? Nosso WhatsApp direto da recepção é (41) 98516-9970.',
        ],
        offer: 0,
      },
      'A partir de qual idade a criança pode iniciar?': {
        g: 'Recebemos bebês a partir dos 6 meses na natação para bebês com água aquecida e tratamento suave com ozônio, acompanhados pelos pais, promovendo vínculo e desenvolvimento motor.',
        t: [
          'A partir de 6 meses de vida! Nossas piscinas são tratadas com ozônio e mantidas na temperatura ideal para os pequenos. Quer conhecer o horário da natação para bebês?',
          'Sim, preferencialmente aos sábados de manhã.',
          'Temos turmas especiais aos sábados! Te convido para vir fazer uma aula experimental com ele. Posso te enviar o link do WhatsApp para garantir a vaga?',
        ],
        offer: 0,
      },
      'Como é o tratamento da água das piscinas?': {
        g: 'Nossas 7 piscinas contam com sistema avançado de ozônio, que reduz drasticamente o uso de cloro, não agride os olhos, não resseca a pele e é ideal para quem tem alergias respiratórias.',
        t: [
          'Temos 7 piscinas aquecidas com tratamento por ozônio. A água é cristalina, sem aquele cheiro forte de cloro e super gentil com olhos, cabelo e pele de crianças e adultos!',
          'Minha filha tem rinite e pele sensível, isso ajuda?',
          'Com certeza! O ozônio é a melhor tecnologia para quem tem sensibilidade ou alergias. Venha conhecer nosso espaço no bairro Mercês!',
        ],
        offer: 1,
      },
    },
  },
  a2: {
    kpi: [],
    sources: [
      ['DESIGN SYSTEM', 'Diretrizes de tipografia, grids e componentes', 'indexado'],
      ['SERVIÇOS', 'Design de Interfaces, Desenvolvimento Web, Automações e IA', 'indexado'],
      ['CONTATO', 'contato@duplod.com.br', 'indexado'],
    ],
    fields: [
      { l: 'UI/UX Design', on: true },
      { l: 'Design System', on: true },
      { l: 'Desenvolvimento Web', on: true },
      { l: 'Sistemas Sob Medida', on: true },
      { l: 'Landing Pages de Alta Conversão', on: true },
      { l: 'Automação & Integrações', on: true },
      { l: 'Suporte de TI básico', on: false },
    ],
    out: 'Nosso foco é exclusivamente em design estratégico de interfaces, engenharia de software e produtos digitais. Não realizamos manutenção de hardware ou suporte técnico básico.',
    offers: [
      {
        n: 'Diagnóstico de Design & Código',
        k: 'diagnostico',
        link: 'https://duplod.com.br/contato',
        when: 'solicita orçamento ou avaliação de projeto',
      },
    ],
    presets: ['Como contratar um projeto com a Duplo D?', 'Vocês desenvolvem o código ou só o design?'],
    qa: {
      'Como contratar um projeto com a Duplo D?': {
        g: 'Trabalhamos com projetos sob medida que combinam excelência visual em UI/UX e engenharia de software moderna. Iniciamos com um alinhamento estratégico de escopo.',
        t: [
          'Desenvolvemos produtos digitais ponta a ponta: do Figma ao código em produção. Qual é o escopo do seu projeto atual?',
          'Precisamos refazer nossa plataforma web e criar um design system.',
          'Excelente! É exatamente nossa especialidade. Podemos agendar uma call de 20 minutos para entender suas metas e desenhar a proposta técnica.',
        ],
        offer: 0,
      },
      'Vocês desenvolvem o código ou só o design?': {
        g: 'A Duplo D une Design e Dev no mesmo DNA: criamos desde a arquitetura de informação e protótipo interativo até o frontend em Angular/React, banco de dados e integrações.',
        t: [
          'Entregamos os dois! Cuidamos da experiência no Figma e desenvolvemos o frontend e integrações completas, garantindo que o design saia fiel e com altíssima performance.',
          'Maravilha! Como funciona para enviarmos nosso briefing?',
          'Basta enviar pelo nosso canal direto que estruturamos o plano do sprint!',
        ],
        offer: 0,
      },
    },
  },
  a_vetbots: {
    kpi: [],
    sources: [
      ['PRODUTO', 'VetBots I.A. Atendimento, Agendamentos e Fila Presencial', 'indexado'],
      ['SUPORTE', 'WhatsApp Comercial (41) 99823-4643', 'indexado'],
    ],
    fields: [
      { l: 'automação whatsapp veterinária', on: true },
      { l: 'agendamentos inteligentes', on: true },
      { l: 'redução de no-show', on: true },
      { l: 'fila presencial inteligente', on: true },
      { l: 'triagem e lembretes', on: true },
      { l: 'diagnóstico clínico', on: false },
    ],
    out: 'A VetBots é focada na gestão de atendimento e automação para clínicas veterinárias. Não realizamos consultas médicas ou diagnósticos veterinários.',
    offers: [
      {
        n: 'Demonstração VetBots I.A.',
        k: 'demonstracao',
        link: 'https://wa.me/5541998234643?text=Olá!%20Gostaria%20de%20agendar%20uma%20demonstração%20da%20VetBots%20I.A.',
        when: 'pergunta sobre como funciona ou quer testar na clínica',
      },
      {
        n: 'Fila Presencial Inteligente Grátis',
        k: 'fila_gratis',
        link: 'https://wa.me/5541998234643?text=Quero%20baixar%20a%20Fila%20Presencial%20Inteligente%20grátis',
        when: 'menciona fila de espera ou tv na recepção',
      },
    ],
    presets: [
      'Como a VetBots reduz as faltas nas consultas?',
      'A IA se integra ao WhatsApp da clínica?',
      'Como funciona a fila presencial na TV?',
    ],
    qa: {
      'Como a VetBots reduz as faltas nas consultas?': {
        g: 'Enviamos lembretes interativos e automáticos no WhatsApp confirmando 24h e 2h antes da consulta. O tutor confirma com 1 clique e, caso desmarque, a recepção é avisada imediatamente.',
        t: [
          'Nosso sistema envia lembretes interativos com confirmação em 1 clique pelo WhatsApp, reduzindo o no-show em até 70%. Quer ver funcionando?',
          'Sim! Como fazemos para testar na nossa clínica?',
          'Posso te passar para nosso time de implantação agora mesmo no WhatsApp (41) 99823-4643!',
        ],
        offer: 0,
      },
      'A IA se integra ao WhatsApp da clínica?': {
        g: 'Sim! A VetBots conecta diretamente ao número oficial da sua clínica, respondendo dúvidas frequentes, agendando consultas e direcionando casos urgentes para a recepção humana.',
        t: [
          'Conecta direto ao WhatsApp da clínica! A IA faz a triagem 24h e passa para a equipe humana sempre que necessário.',
          'E se o tutor fizer uma pergunta médica?',
          'A IA é treinada para nunca dar diagnósticos: ela acolhe o tutor e orienta a trazer o paciente imediatamente para a consulta presencial.',
        ],
        offer: 0,
      },
    },
  },
};

export const SEED_FLOWS: FlowItem[] = [];

export const SEED_CONTACTS: ContactItem[] = [];

export const SEED_INTS: InteractionItem[] = [];

export const SEED_RULES: KeywordRule[] = [];

export const SEED_AD_ACCOUNTS: MetaAdAccount[] = [
  {
    id: 'act_1124982890873935',
    a: 'a_amaral',
    name: 'Amaral Natação Ads',
    currency: 'BRL',
    status: 'ACTIVE',
    balance: 0,
    timezone: 'America/Sao_Paulo',
    pixelId: '',
  },
  {
    id: 'act_891826527522907',
    a: 'a2',
    name: 'Anúncios Duplo D',
    currency: 'BRL',
    status: 'ACTIVE',
    balance: 0,
    timezone: 'America/Sao_Paulo',
    pixelId: '',
  },
];

export const SEED_AUDIENCES: MetaAudience[] = [];

export const SEED_CAMPAIGNS: MetaCampaign[] = [];

export const SEED_ICPS: IcpProfile[] = [
  // --- Amaral Natação (a_amaral) ---
  {
    id: 'icp_amaral_infantil',
    a: 'a_amaral',
    name: 'Pais e Mães de Curitiba (Natação Infantil & Bebês)',
    segmentType: 'B2C',
    targetRole: 'Mães e pais de crianças entre 6 meses e 12 anos em Curitiba',
    companyProfile: 'Famílias residentes em Curitiba (bairros Mercês, Batel, Champagnat, Bigorrilho, Centro) que priorizam segurança aquática e desenvolvimento motor',
    ticketMedio: 'R$ 290 a R$ 520 / mês',
    pains: [
      'Preocupação constante com a segurança da criança perto de piscinas e praias',
      'Crianças com excesso de tempo em telas e falta de atividade física aeróbica',
      'Receio de piscinas frias ou com cloro excessivo que provocam alergias e rinite',
      'Trauma ou medo da água por experiências negativas anteriores',
    ],
    desires: [
      'Criança segura, confiante e adaptada ao ambiente aquático',
      'Ambiente acolhedor, familiar e professores carinhosos e pacientes',
      'Água tratada com ozônio, sem cheiro forte de cloro e com temperatura agradável',
      'Metodologia estruturada que reconhece o progresso da criança (níveis e toucas)',
    ],
    greenFlags: [
      'Reside em Curitiba em raio de até 10km do bairro Mercês',
      'Prioriza qualidade da água e infraestrutura segura',
      'Busca aula experimental para conhecer antes de matricular',
      'Valoriza tradição e equipe experiente (47 anos de história)',
    ],
    redFlags: [
      'Reside fora da região metropolitana de Curitiba',
      'Busca apenas mensalidade de baixo custo sem considerar estrutura ou segurança',
    ],
    objections: [
      '"E se meu filho chorar ou tiver medo de entrar na água?"',
      '"A água é aquecida de verdade durante o inverno de Curitiba?"',
      '"O tratamento da água irrita os olhos ou a pele?"',
    ],
    hooks: [
      'Segurança aquática não é luxo, é proteção para a vida toda.',
      'Por que o tratamento com ozônio nas nossas 7 piscinas faz toda a diferença para crianças com rinite e alergia.',
      'Agende uma aula experimental gratuita na escola de natação mais tradicional de Curitiba.',
    ],
    metaKeywords: [
      'Natação infantil Curitiba',
      'Natação para bebês',
      'Escola de natação Mercês',
      'Metodologia Gustavo Borges Curitiba',
      'Piscinas aquecidas com ozônio',
    ],
    createdAt: '20/10/2026',
    updatedAt: '31/10/2026',
  },
  {
    id: 'icp_amaral_hidro',
    a: 'a_amaral',
    name: 'Adultos e Terceira Idade (Hidroginástica e Natação Adulto)',
    segmentType: 'B2C',
    targetRole: 'Adultos 35+ e idosos em busca de condicionamento físico sem impacto nas articulações',
    companyProfile: 'Pessoas com recomendação médica (ortopedia/cardiologia) ou que buscam bem-estar, melhora da postura e condicionamento físico em Curitiba',
    ticketMedio: 'R$ 250 a R$ 480 / mês',
    pains: [
      'Dores articulares, lombalgia ou artrose que impedem musculação pesada',
      'Sedentarismo e cansaço excessivo no dia a dia',
      'Sensação de frio ou desconforto em academias convencionais',
      'Dificuldade de encontrar turmas com ritmo adequado e professores dedicados',
    ],
    desires: [
      'Melhora da flexibilidade, mobilidade e disposição diária',
      'Ambiente tranquilo, amigável e focado na saúde',
      'Orientação individualizada respeitando limitações físicas',
      'Horários flexíveis no início da manhã, tarde ou noite',
    ],
    greenFlags: [
      'Recomendação médica para atividade aquática sem impacto',
      'Busca constância e qualidade de vida',
      'Interesse na aula experimental gratuita para testar o ritmo',
    ],
    redFlags: [
      'Procura treinamento de halterofilismo ou esportes de alto impacto',
    ],
    objections: [
      '"Tenho vergonha porque faz muito tempo que não pratico atividade física"',
      '"Será que a hidroginástica não é só para idosos?"',
    ],
    hooks: [
      'O exercício perfeito para quem quer se movimentar sem sobrecarregar joelhos e coluna.',
      'Descubra como a hidroginástica nas piscinas aquecidas da Amaral transforma sua disposição diária.',
    ],
    metaKeywords: [
      'Hidroginástica Curitiba',
      'Natação adulto Curitiba',
      'Exercício sem impacto',
      'Academia com piscina Mercês',
    ],
    createdAt: '20/10/2026',
    updatedAt: '31/10/2026',
  },

  // --- Duplo D Design & Dev (a2) ---
  {
    id: 'icp_duplo_tech',
    a: 'a2',
    name: 'Founders & Líderes Técnicos (SaaS & Plataformas Digitais)',
    segmentType: 'B2B',
    targetRole: 'Founders, CTOs, Tech Leads e Product Managers de Startups e Scale-ups',
    companyProfile: 'Empresas de tecnologia com produto validado que precisam de UI/UX de nível global e frontend em Angular/React de alta performance',
    ticketMedio: 'R$ 8.000 a R$ 35.000 / projeto',
    pains: [
      'Interface antiga ou amadora que afasta investidores e clientes corporativos',
      'Abismo de comunicação entre o time que cria no Figma e o time que coda',
      'Falta de Design System organizado, gerando retrabalho constante de código',
      'Performance lenta e baixa pontuação de Core Web Vitals',
    ],
    desires: [
      'Design System em tokens de código perfeitamente integrado ao repositório',
      'Interfaces modernas, fluidas e com alta taxa de retenção de usuários',
      'Time parceiro que entende tanto de estética quanto de arquitetura frontend',
      'Acelerar a entrega do roadmap sem inchar a folha interna',
    ],
    greenFlags: [
      'Produto já fatura ou captou rodada de investimento',
      'Decisor técnico ou de produto diretamente envolvido na contratação',
      'Valoriza código limpo, componentização e design system',
    ],
    redFlags: [
      'Procura apenas um "desenhista de telas" sem entender engenharia',
      'Orçamento informal sem escopo definido',
    ],
    objections: [
      '"Qual o tempo médio de entrega dos sprints?"',
      '"Como vocês lidam com a integração ao nosso repositório Git?"',
    ],
    hooks: [
      'Seu produto pode ter a melhor tecnologia do mundo, mas se o design for amador, seu cliente não confia.',
      'Como unimos Figma e código frontend no mesmo padrão para eliminar o retrabalho entre design e dev.',
    ],
    metaKeywords: [
      'Design System Angular',
      'UI UX SaaS',
      'Desenvolvimento frontend sob medida',
      'Redesign de software web',
      'Consultoria UI UX',
    ],
    createdAt: '21/10/2026',
    updatedAt: '31/10/2026',
  },
  {
    id: 'icp_duplo_pme',
    a: 'a2',
    name: 'Empresas e Profissionais em Escala (Landing Pages & Marca)',
    segmentType: 'B2B',
    targetRole: 'Diretores de Marketing, CEOs e Empreendedores',
    companyProfile: 'Negócios consolidados que precisam de nova presença digital de alto impacto para converter mais leads de tráfego pago e orgânico',
    ticketMedio: 'R$ 4.500 a R$ 12.000 / projeto',
    pains: [
      'Landing page atual com taxa de conversão baixa e visual defasado',
      'Perda de investimento em anúncios do Meta Ads por conta de página lenta',
      'Inconsistência entre a qualidade do serviço prestado e a imagem transmitida no site',
    ],
    desires: [
      'Página com carregamento ultrarrápido (95+ no Google PageSpeed)',
      'Design exclusivo que transmita autoridade imediata no primeiro segundo',
      'Estrutura pensada para conversão de leads diretamente no WhatsApp ou CRM',
    ],
    greenFlags: [
      'Já investe em tráfego pago (Meta Ads / Google Ads)',
      'Tem clareza do produto e público-alvo',
      'Busca resultado e autoridade digital',
    ],
    redFlags: [
      'Busca templates genéricos do WordPress de R$ 200',
    ],
    objections: [
      '"Quanto tempo leva para ir ao ar?"',
      '"A página já vem otimizada para celular e SEO?"',
    ],
    hooks: [
      'Você está pagando caro no clique do anúncio para mandar o lead para uma página lenta e genérica?',
      'A anatomia de uma landing page que converte cliques em reuniões reais.',
    ],
    metaKeywords: [
      'Landing page de alta conversão',
      'Desenvolvimento de sites modernos',
      'Performance web',
      'Identidade visual tech',
    ],
    createdAt: '21/10/2026',
    updatedAt: '31/10/2026',
  },
];
