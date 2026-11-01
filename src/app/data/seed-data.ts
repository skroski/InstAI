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
      regras: 'Sempre convidar para a aula experimental gratuita pelo WhatsApp (41) 98516-9970. Lembrar os 47 anos de tradição e as 7 piscinas aquecidas com ozônio.',
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
      regras: 'Sempre conectar design visual com usabilidade e resultados de negócios. Valorizar técnica, design systems e clareza de código.',
    },
    style:
      'sleek dark UI design canvas, subtle geometric grid overlay, neon coral and deep violet gradients (#ff477e, #7928ca), clean typography, modern tech aesthetic --style raw',
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
};

export const SEED_POSTS: PostItem[] = [
  ...REAL_META_POSTS,
];

export const TWINS: Record<string, TwinConfig> = {
  a_amaral: {
    kpi: [
      ['conversas 30d', '940'],
      ['resolvidas sem humano', '88%'],
      ['tempo de resposta', '2 s'],
      ['aulas agendadas', '142'],
    ],
    sources: [
      ['INSTAGRAM', '20 posts e carrosséis sincronizados', 'indexado'],
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
    kpi: [
      ['conversas 30d', '210'],
      ['resolvidas sem humano', '82%'],
      ['tempo de resposta', '3 s'],
      ['propostas geradas', '48'],
    ],
    sources: [
      ['INSTAGRAM', 'Posts e estudos de caso de UI/UX e desenvolvimento', 'indexado'],
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
};

export const SEED_FLOWS: FlowItem[] = [
  {
    id: 'f_amaral_1',
    a: 'a_amaral',
    name: 'Aula Experimental . Palavra AULA',
    on: true,
    stats: { sent: 248, open: '89%', clicks: 142, leads: 96 },
    nodes: [
      { id: 'n1', t: 'trigger', kind: 'comentário', text: 'AULA', extra: 'Qualquer post ou Reels sobre Natação' },
      { id: 'n2', t: 'message', text: 'Olá! Ficamos muito felizes com seu interesse na Amaral Natação! 🏊‍♂️ Temos 47 anos de tradição e 7 piscinas aquecidas com ozônio.', extra: '' },
      { id: 'n3', t: 'buttons', text: 'Para quem seria a aula experimental gratuita?', extra: 'Bebê / Criança, Hidroginástica, Natação Adulto' },
      { id: 'n4', t: 'condition', text: 'qualquer opção selecionada', extra: 'continuar' },
      { id: 'n5', t: 'tag', text: 'lead-aula-experimental', extra: '' },
      { id: 'n6', t: 'link', text: 'https://wa.me/5541985169970?text=Olá!%20Vim%20do%20Instagram%20e%20gostaria%20de%20agendar%20minha%20aula%20experimental%20gratuita!', extra: 'Agendar no WhatsApp' },
    ],
  },
  {
    id: 'f_amaral_2',
    a: 'a_amaral',
    name: 'Boas-vindas a menções de Stories',
    on: true,
    stats: { sent: 112, open: '94%', clicks: 35, leads: 28 },
    nodes: [
      { id: 'n7', t: 'trigger', kind: 'menção', text: 'qualquer menção', extra: 'stories' },
      { id: 'n8', t: 'message', text: 'Adoramos ver você na água com a gente! 💙 Compartilhamos momentos especiais nos nossos Stories.', extra: '' },
      { id: 'n9', t: 'delay', text: '15 min', extra: '' },
      { id: 'n10', t: 'ai', text: 'Agradecer a presença na Amaral e perguntar se a experiência de hoje na piscina foi agradável.', extra: 'Claude' },
    ],
  },
  {
    id: 'f_duplod_1',
    a: 'a2',
    name: 'Solicitação de Orçamento . Palavra PROJETO',
    on: true,
    stats: { sent: 94, open: '76%', clicks: 42, leads: 31 },
    nodes: [
      { id: 'n11', t: 'trigger', kind: 'comentário', text: 'PROJETO', extra: 'Reels ou Carrossel de UI/UX e Software' },
      { id: 'n12', t: 'message', text: 'Olá! Obrigado pelo interesse na Duplo D. Unimos design de interface de alto impacto com engenharia de software sob medida.', extra: '' },
      { id: 'n13', t: 'buttons', text: 'Qual o foco principal do seu projeto?', extra: 'UI/UX Design, Desenvolvimento Web, Ambos' },
      { id: 'n14', t: 'link', text: 'https://duplod.com.br/contato', extra: 'Enviar briefing' },
    ],
  },
  {
    id: 'f_duplod_2',
    a: 'a2',
    name: 'Agradecimento por menção em Stories',
    on: true,
    stats: { sent: 48, open: '82%', clicks: 16, leads: 12 },
    nodes: [
      { id: 'n15', t: 'trigger', kind: 'menção', text: 'qualquer menção', extra: 'stories' },
      { id: 'n16', t: 'message', text: 'Valeu demais pela menção! É sempre um prazer trocar ideia com a comunidade de design e tecnologia.', extra: '' },
      { id: 'n17', t: 'delay', text: '5 min', extra: '' },
      { id: 'n18', t: 'ai', text: 'Perguntar sobre o projeto que o usuário está desenvolvendo.', extra: 'Claude' },
    ],
  },
];

export const SEED_CONTACTS: ContactItem[] = [
  // --- Amaral Natação (a_amaral) ---
  { id: 'c_am_1', a: 'a_amaral', u: 'camila.rodrigues.cwb', email: 'camila.rodrigues@gmail.com', phone: '+5541991234567', tags: ['lead quente', 'tier_1', 'natacao_infantil'], src: 'AULA . Reels', last: 'hoje 10:24', metaSynced: true, icpScore: 96, icpTier: 'TIER_1_OURO' },
  { id: 'c_am_2', a: 'a_amaral', u: 'marcos.vinicius.eng', email: 'marcos.vinicius@curitibatech.com.br', phone: '+5541998765432', tags: ['lead quente', 'tier_1', 'natacao_adulto'], src: 'AULA . Reels', last: 'hoje 09:15', metaSynced: true, icpScore: 92, icpTier: 'TIER_1_OURO' },
  { id: 'c_am_3', a: 'a_amaral', u: 'fernanda.souza.saude', email: 'fernanda.souza@clinicas.com.br', phone: '+5541996543210', tags: ['lead quente', 'tier_1', 'hidroginastica'], src: 'dm', last: 'hoje 08:40', metaSynced: true, icpScore: 90, icpTier: 'TIER_1_OURO' },
  { id: 'c_am_4', a: 'a_amaral', u: 'juliana.silveira.mamae', email: 'juliana.silveira@outlook.com', phone: '+5541997891234', tags: ['lead quente', 'tier_1', 'bebes'], src: 'menção de story', last: 'ontem 17:30', metaSynced: true, icpScore: 95, icpTier: 'TIER_1_OURO' },
  { id: 'c_am_5', a: 'a_amaral', u: 'roberto.alencar.cwb', email: 'roberto.alencar@advocacia.com.br', phone: '+5541992345678', tags: ['aluno', 'tier_1'], src: 'comentário', last: 'ontem 14:10', metaSynced: true, icpScore: 88, icpTier: 'TIER_1_OURO' },
  { id: 'c_am_6', a: 'a_amaral', u: 'patricia.mello', email: 'patricia.mello@educacao.com.br', phone: '+5541988112233', tags: ['novo', 'tier_2'], src: 'comentário', last: 'ontem 11:20', metaSynced: false, icpScore: 75, icpTier: 'TIER_2_PRATA' },

  // --- Duplo D Design & Dev (a2) ---
  { id: 'c_dd_1', a: 'a2', u: 'lucas.prado.tech', email: 'lucas@vortexsoftware.io', phone: '+5511987654321', tags: ['lead quente', 'tier_1', 'saas_redesign'], src: 'PROJETO . Reels', last: 'hoje 11:15', metaSynced: true, icpScore: 95, icpTier: 'TIER_1_OURO' },
  { id: 'c_dd_2', a: 'a2', u: 'marina.castro.ux', email: 'marina@fintechalpha.com.br', phone: '+5511976543210', tags: ['lead quente', 'tier_1', 'design_system'], src: 'dm', last: 'hoje 09:50', metaSynced: true, icpScore: 92, icpTier: 'TIER_1_OURO' },
  { id: 'c_dd_3', a: 'a2', u: 'thiago.mendes.dev', email: 'thiago@inovasaas.com', phone: '+5541991122334', tags: ['cliente', 'tier_1'], src: 'comentário', last: 'ontem 18:20', metaSynced: true, icpScore: 89, icpTier: 'TIER_1_OURO' },
  { id: 'c_dd_4', a: 'a2', u: 'beatriz.lima.mkt', email: 'beatriz@scalegrowth.com.br', phone: '+5531988776655', tags: ['novo', 'tier_2', 'landing_page'], src: 'resposta story', last: 'ontem 15:40', metaSynced: false, icpScore: 78, icpTier: 'TIER_2_PRATA' },
];

export const SEED_INTS: InteractionItem[] = [
  // --- Amaral Natação (a_amaral) ---
  {
    id: 'i_am_1',
    cat: 'duvida',
    a: 'a_amaral',
    u: 'camila.rodrigues.cwb',
    t: 'DM',
    s: 'UNREAD',
    sent: 'positivo',
    time: '10:24',
    c: 'Olá! Meu filho tem 4 anos e tem muito medo de água. Como funciona a adaptação e a aula experimental de vocês?',
    media: 'Reels · Família na Piscina',
    ai: 'Olá Camila! Nosso método Gustavo Borges trabalha o acolhimento lúdico e respeita 100% o ritmo da criança, nas piscinas aquecidas com ozônio. Podemos agendar uma aula experimental gratuita para ele se divertir com nossos professores!',
  },
  {
    id: 'i_am_2',
    cat: 'duvida',
    a: 'a_amaral',
    u: 'marcos.vinicius.eng',
    t: 'COMMENT',
    s: 'UNREAD',
    sent: 'neutro',
    time: '09:15',
    c: 'Vocês têm horário de natação para adultos no começo da manhã? Antes das 8h?',
    media: 'Carrossel · Constância e Bem-Estar',
    ai: 'Bom dia Marcos! Sim! Temos turmas de natação adulto iniciando às 06h15 e 07h00. Nossas 7 piscinas são aquecidas. Quer receber a grade de horários completa pelo WhatsApp (41) 98516-9970?',
  },
  {
    id: 'i_am_3',
    cat: 'elogio',
    a: 'a_amaral',
    u: 'juliana.silveira.mamae',
    t: 'STORY_MENTION',
    s: 'AI_REPLIED',
    sent: 'positivo',
    time: 'Ontem 17:30',
    c: 'Mencionou você no story: "Melhor momento da semana com meu pequeno na @amaralnatacao 💙💦"',
    media: 'Story · Natação Bebês',
    ai: 'Ficamos muito felizes em ver essa conexão linda na água, Juliana! Obrigado pela confiança e carinho!',
  },
  {
    id: 'i_am_4',
    cat: 'duvida',
    a: 'a_amaral',
    u: 'fernanda.souza.saude',
    t: 'DM',
    s: 'UNREAD',
    sent: 'positivo',
    time: '08:40',
    c: 'Minha mãe tem 68 anos e indicação médica para hidroginástica por causa de artrose. A água é bem quentinha?',
    media: 'Post · Benefícios da Hidroginástica',
    ai: 'Olá Fernanda! Sim, a água das nossas piscinas de hidroginástica é rigorosamente aquecida e tratada com ozônio, o que alivia a pressão nas articulações sem irritar a pele. Convidamos sua mãe para fazer uma aula experimental gratuita com a gente no Mercês!',
  },

  // --- Duplo D Design & Dev (a2) ---
  {
    id: 'i_dd_1',
    cat: 'duvida',
    a: 'a2',
    u: 'lucas.prado.tech',
    t: 'DM',
    s: 'UNREAD',
    sent: 'positivo',
    time: '11:15',
    c: 'Fala time da Duplo D! Vimos o post sobre arquitetura de design system. Vocês pegam projetos de ponta a ponta (Figma até frontend em Angular/React)?',
    media: 'Carrossel · Arquitetura de Design System',
    ai: 'Fala Lucas! Com certeza. Nosso foco é exatamente a fusão entre UI/UX de alta fidelidade e engenharia de software limpa em Angular e Tailwind. Podemos agendar uma conversa técnica para entender sua demanda!',
  },
  {
    id: 'i_dd_2',
    cat: 'elogio',
    a: 'a2',
    u: 'marina.castro.ux',
    t: 'COMMENT',
    s: 'AI_REPLIED',
    sent: 'positivo',
    time: '09:50',
    c: 'A consistência do grid e da tipografia nos posts de vocês é uma aula aberta. Parabéns pelo trabalho!',
    media: 'Reels · Grids Modernos em Interfaces',
    ai: 'Muito obrigado, Marina! Valorizamos muito o rigor tipográfico e a precisão técnica no design. Fique ligada que vem mais conteúdo desse tipo por aí!',
  },
  {
    id: 'i_dd_3',
    cat: 'duvida',
    a: 'a2',
    u: 'beatriz.lima.mkt',
    t: 'DM',
    s: 'UNREAD',
    sent: 'neutro',
    time: 'Ontem 15:40',
    c: 'Olá! Quanto tempo em média vocês levam para desenvolver uma landing page institucional de alto padrão?',
    media: 'Post · Landing Pages que Convertem',
    ai: 'Olá Beatriz! Nossos sprints de landing page de alta conversão costumam durar de 2 a 3 semanas, cobrindo copy estruturada, UI visual e código otimizado com Core Web Vitals perfeitos. Vamos conversar pelo formulário de briefing?',
  },
];

export const SEED_RULES: KeywordRule[] = [
  {
    id: 'r_am_1',
    a: 'a_amaral',
    kw: 'AULA',
    link: 'https://wa.me/5541985169970?text=Olá!%20Vim%20pelo%20Instagram%20e%20gostaria%20de%20agendar%20minha%20aula%20experimental%20gratuita!',
    post: 'Todos os posts e Reels de Natação & Hidro',
    on: true,
  },
  {
    id: 'r_am_2',
    a: 'a_amaral',
    kw: 'EXPERIMENTAL',
    link: 'https://wa.me/5541985169970?text=Olá!%20Quero%20agendar%20uma%20aula%20experimental.',
    post: 'Carrossel · Família na Piscina',
    on: true,
  },
  {
    id: 'r_dd_1',
    a: 'a2',
    kw: 'ORCAMENTO',
    link: 'https://duplod.com.br/contato',
    post: 'Todos os posts de Design System e Desenvolvimento',
    on: true,
  },
  {
    id: 'r_dd_2',
    a: 'a2',
    kw: 'PROJETO',
    link: 'https://duplod.com.br/contato',
    post: 'Reels · Do Figma ao Código em Produção',
    on: true,
  },
];

export const SEED_AD_ACCOUNTS: MetaAdAccount[] = [
  {
    id: 'act_1124982890873935',
    a: 'a_amaral',
    name: 'Amaral Natação Ads',
    currency: 'BRL',
    status: 'ACTIVE',
    balance: 2450.0,
    timezone: 'America/Sao_Paulo',
    pixelId: 'px_amaral_meta_2026',
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
];

export const SEED_AUDIENCES: MetaAudience[] = [
  // --- Amaral Natação (a_amaral) ---
  {
    id: 'aud_amaral_1',
    a: 'a_amaral',
    name: 'Famílias com Crianças em Curitiba (Raio 10km Mercês/Batel)',
    type: 'SAVED_INTEREST',
    size: 240000,
    status: 'READY',
    country: 'BR',
    lastSync: 'hoje às 06:00',
  },
  {
    id: 'aud_amaral_2',
    a: 'a_amaral',
    name: 'Lookalike 1% Curitiba — Pais e Alunos Ativos',
    type: 'LOOKALIKE',
    size: 145000,
    status: 'READY',
    lookalikeRatio: 1,
    originAudienceName: 'Lista de Alunos & Leads Aula Experimental WhatsApp',
    country: 'BR',
    lastSync: 'ontem às 22:00',
  },
  {
    id: 'aud_amaral_3',
    a: 'a_amaral',
    name: 'Adultos 40+ Interessados em Hidroginástica e Natação (Curitiba)',
    type: 'SAVED_INTEREST',
    size: 180000,
    status: 'READY',
    country: 'BR',
    lastSync: 'hoje às 07:00',
  },

  // --- Duplo D Design & Dev (a2) ---
  {
    id: 'aud_duplo_1',
    a: 'a2',
    name: 'Lookalike 1% Brasil — Founders de Startups & Tech Leads',
    type: 'LOOKALIKE',
    size: 1650000,
    status: 'READY',
    lookalikeRatio: 1,
    originAudienceName: 'Clientes e Contatos Qualificados Duplo D',
    country: 'BR',
    lastSync: 'ontem às 18:00',
  },
  {
    id: 'aud_duplo_2',
    a: 'a2',
    name: 'Interesses em UI/UX, Design System, Software Architecture',
    type: 'SAVED_INTEREST',
    size: 890000,
    status: 'READY',
    country: 'BR',
    lastSync: 'hoje às 04:30',
  },
];

export const SEED_CAMPAIGNS: MetaCampaign[] = [
  // --- Amaral Natação (a_amaral) ---
  {
    id: 'cmp_amaral_1',
    a: 'a_amaral',
    name: 'Curitiba 10km | Aula Experimental Gratuita — Natação Infantil & Bebês',
    objective: 'OUTCOME_LEADS',
    status: 'ACTIVE',
    audienceId: 'aud_amaral_1',
    audienceName: 'Famílias com Crianças em Curitiba (Raio 10km Mercês/Batel)',
    isLookalike: false,
    dailyBudget: 50.0,
    spend: 450.0,
    impressions: 22400,
    clicks: 840,
    leads: 62,
    cpa: 7.25,
    roas: 6.4,
    startDate: '20/10/2026',
    connectedPostId: 'live_185387824832414_1544580937713912',
  },
  {
    id: 'cmp_amaral_2',
    a: 'a_amaral',
    name: 'Curitiba | Hidroginástica e Natação Adulto — 7 Piscinas Aquecidas',
    objective: 'OUTCOME_LEADS',
    status: 'ACTIVE',
    audienceId: 'aud_amaral_3',
    audienceName: 'Adultos 40+ Interessados em Hidroginástica e Natação (Curitiba)',
    isLookalike: false,
    dailyBudget: 40.0,
    spend: 320.0,
    impressions: 16800,
    clicks: 560,
    leads: 38,
    cpa: 8.42,
    roas: 5.8,
    startDate: '22/10/2026',
    connectedPostId: 'live_185387824832414_1540854498086556',
  },

  // --- Duplo D Design & Dev (a2) ---
  {
    id: 'cmp_duplo_1',
    a: 'a2',
    name: 'LAL 1% BR | Design System & Engenharia de Frontend para Startups',
    objective: 'OUTCOME_LEADS',
    status: 'ACTIVE',
    audienceId: 'aud_duplo_1',
    audienceName: 'Lookalike 1% Brasil — Founders de Startups & Tech Leads',
    isLookalike: true,
    dailyBudget: 60.0,
    spend: 480.0,
    impressions: 19800,
    clicks: 690,
    leads: 42,
    cpa: 11.42,
    roas: 5.1,
    startDate: '21/10/2026',
    connectedPostId: 'live_184846338220933_122108745308693893',
  },
  {
    id: 'cmp_duplo_2',
    a: 'a2',
    name: 'Captação | Redesign de Plataformas e Landing Pages de Alta Conversão',
    objective: 'OUTCOME_SALES',
    status: 'ACTIVE',
    audienceId: 'aud_duplo_2',
    audienceName: 'Interesses em UI/UX, Design System, Software Architecture',
    isLookalike: false,
    dailyBudget: 45.0,
    spend: 360.0,
    impressions: 14200,
    clicks: 480,
    leads: 29,
    cpa: 12.41,
    roas: 4.9,
    startDate: '24/10/2026',
    connectedPostId: 'live_184846338220933_122108520338693893',
  },
];

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
