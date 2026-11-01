import { Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { Account, PostItem, InteractionItem, MetaCampaign, MetaAdAccount } from '../data/seed-data';

export interface MetaAdAccountResponse {
  id: string;
  name: string;
  account_status: number;
  currency: string;
  amount_spent: string;
  timezone_name: string;
}

@Injectable({ providedIn: 'root' })
export class LiveApiService {
  readonly isSyncing = signal<boolean>(false);
  readonly metaApiConnected = signal<boolean>(true);
  readonly lastSyncTime = signal<string>('agora mesmo');
  readonly liveAdAccount = signal<MetaAdAccountResponse | null>(null);

  private get metaToken(): string {
    return (typeof localStorage !== 'undefined' && localStorage.getItem('meta_system_user_token')) || environment.metaSystemUserToken || '';
  }
  private readonly defaultAdAccountId = environment.metaAdAccountId;
  private get openaiKey(): string {
    return (typeof localStorage !== 'undefined' && localStorage.getItem('openai_api_key')) || environment.openaiApiKey || '';
  }
  private readonly openaiModel = environment.openaiModel || 'gpt-4o-mini';

  /**
   * Consulta os dados reais da Conta de Anúncios na Meta Graph API v22.0 / v26.0
   */
  async fetchLiveAdAccount(adAccountId = this.defaultAdAccountId): Promise<MetaAdAccountResponse | null> {
    if (!this.metaToken || !adAccountId) return null;
    try {
      const url = `https://graph.facebook.com/v22.0/${adAccountId}?fields=id,name,account_status,currency,amount_spent,timezone_name&access_token=${this.metaToken}`;
      const res = await fetch(url, { method: 'GET' });
      if (!res.ok) {
        console.warn('Meta Graph API request status:', res.status);
        return null;
      }
      const data = (await res.json()) as MetaAdAccountResponse;
      this.liveAdAccount.set(data);
      this.metaApiConnected.set(true);
      return data;
    } catch (err) {
      console.warn('Erro ao conectar com Meta Graph API:', err);
      return null;
    }
  }

  /**
   * Consulta campanhas reais na Meta Marketing API
   */
  async fetchLiveCampaigns(adAccountId = this.defaultAdAccountId): Promise<any[] | null> {
    if (!this.metaToken || !adAccountId) return null;
    try {
      const url = `https://graph.facebook.com/v22.0/${adAccountId}/campaigns?fields=id,name,status,objective,daily_budget,spend,insights{impressions,clicks,cpc,spend}&access_token=${this.metaToken}`;
      const res = await fetch(url, { method: 'GET' });
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || [];
    } catch {
      return null;
    }
  }

  /**
   * Geração direta com OpenAI GPT-4o-mini para textos variados e ricos
   */
  async generateWithOpenAi(prompt: string, systemPrompt = 'Você é um estrategista de conteúdo para Instagram.'): Promise<string | null> {
    if (!this.openaiKey) return null;
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.openaiKey}`,
        },
        body: JSON.stringify({
          model: this.openaiModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
          max_tokens: 600,
          temperature: 0.7,
        }),
      });

      if (!res.ok) return null;
      const data = await res.json();
      return data.choices?.[0]?.message?.content?.trim() || null;
    } catch (err) {
      console.warn('Erro ao chamar OpenAI:', err);
      return null;
    }
  }

  /**
   * Gera variações dinâmicas e realistas de dados para qualquer conta
   */
  generateVariedDataForAccount(acc: Account, currentSeq: number): {
    posts: PostItem[];
    ints: InteractionItem[];
    campaigns: MetaCampaign[];
  } {
    let nextSeq = currentSeq;

    // Variações específicas por nicho de conta
    if (acc.id === 'a1') {
      // Codemix Web (SaaS, Agentes IA, Supabase)
      return {
        posts: [
          {
            id: `p_dyn_${++nextSeq}`,
            a: 'a1',
            t: 'REELS',
            s: 'PUBLISHED',
            topic: 'Como orquestrar 3 agentes de IA no n8n sem travar',
            cap: 'Três agentes conversando entre si: um extrai dados da conversa no Direct, o segundo valida o ICP no Supabase e o terceiro fecha o agendamento no Google Calendar.\n\nResultado: 0 intervenções humanas para qualificar 40 leads por dia.\n\nComente AGENTE para ver o diagrama completo deste fluxo.',
            tags: ['#ia', '#automacao', '#n8n', '#supabase', '#saas'],
            pr: [
              {
                t: 'Capa Reels 9:16',
                ar: '9:16',
                x: '3D floating node network on charcoal #1e1e1e, warm amber glowing lines (#F1A10B), technical schematic overlay, depth of field --ar 9:16',
              },
            ],
            day: 1,
            time: '12:00',
            ai: 'Claude 3.7',
          },
          {
            id: `p_dyn_${++nextSeq}`,
            a: 'a1',
            t: 'CAROUSEL',
            s: 'SCHEDULED',
            topic: 'Arquitetura Multi-Tenant com Supabase RLS sem vazamentos',
            cap: 'Como garantir isolamento de dados com 1 linha de SQL.\n\nSlide 1: O risco de vazar dados entre clientes.\nSlide 2: A convenção de tenant_id.\nSlide 3: Criando a policy com auth.uid().\nSlide 4: Teste de invasão controlado.\nSlide 5: Performance e índices parciais.\n\nSalve este carrossel para sua próxima sprint.',
            tags: ['#supabase', '#postgres', '#multitenant', '#software'],
            pr: [
              {
                t: 'Capa do Carrossel',
                ar: '4:5',
                x: 'Minimal technical database schema layout on charcoal background, single vibrant amber accent line, typography safe zone --ar 4:5 --style raw',
              },
            ],
            day: 4,
            time: '18:30',
            ai: 'Gemini 2.5 Pro',
          },
          {
            id: `p_dyn_${++nextSeq}`,
            a: 'a1',
            t: 'IMAGE',
            s: 'PROMPT_READY',
            topic: 'Por que chatbots de botões estão matando sua conversão',
            cap: 'Seu cliente não quer navegar em um menu de telefone nos anos 90 dentro do Instagram.\n\nEle quer fazer uma pergunta natural e receber uma resposta precisa em 3 segundos.\n\nÉ isso que nossa Versão Digital com IA faz para a Codemix.',
            tags: ['#experienciadousuario', '#atendimento', '#ia'],
            pr: [
              {
                t: 'Editorial 4:5',
                ar: '4:5',
                x: 'Editorial studio photo of high-tech modern smartphone screen displaying intelligent conversational flow, warm soft amber glow on metallic edges, dark luxury atmosphere --ar 4:5',
              },
            ],
            day: null,
            time: '',
            ai: 'Codex GPT-4o',
          },
          {
            id: `p_dyn_${++nextSeq}`,
            a: 'a1',
            t: 'STORIES',
            s: 'PUBLISHED',
            topic: 'Bastidores: deploy da Graph API v22.0 no Vercel',
            cap: 'Sequência de 4 stories mostrando o log do build e os webhooks chegando em tempo real.',
            tags: ['#bastidores', '#dev'],
            pr: [],
            day: 0,
            time: '09:15',
            ai: 'Claude',
          },
          {
            id: `p_dyn_${++nextSeq}`,
            a: 'a1',
            t: 'REELS',
            s: 'DRAFT',
            topic: 'Quanto custa rodar agentes de IA em produção por mês?',
            cap: 'Abrindo nossa fatura real: OpenAI, Anthropic, Gemini e Vercel para 50.000 requisições mensais. O valor vai te surpreender.',
            tags: ['#custos', '#saas', '#ia'],
            pr: [],
            day: null,
            time: '',
            ai: 'Claude',
          },
        ],
        ints: [
          {
            id: `i_dyn_${++nextSeq}`,
            a: 'a1',
            u: 'thiago.cto_fintech',
            t: 'DM',
            s: 'UNREAD',
            sent: 'positivo',
            time: '11:42',
            c: 'Fala time Codemix! Vimos o case de RLS com Supabase. Queremos implementar agentes de triagem para nosso app financeiro. Vocês têm disponibilidade de agenda nesta semana?',
            media: '',
            ai: 'Olá Thiago! Temos disponibilidade sim. Nossa agenda para novos projetos de IA está aberta na quinta às 15h ou sexta às 10h. Qual horário fica melhor para você?',
          },
          {
            id: `i_dyn_${++nextSeq}`,
            a: 'a1',
            cat: 'duvida',
            u: 'marcos.devlead',
            t: 'COMMENT',
            s: 'UNREAD',
            sent: 'neutro',
            time: '10:15',
            c: 'Vocês usam webhook do Instagram direto no Supabase Edge Functions ou passam por fila no RabbitMQ / Redis?',
            media: 'Reels · Como orquestrar 3 agentes de IA no n8n',
            ai: 'Opa Marcos! Recebemos no Edge Function com validação de assinatura HMAC SHA-256 e gravamos em tabela de buffer com pg_notify para consumo assíncrono. Zero perda de eventos!',
          },
          {
            id: `i_dyn_${++nextSeq}`,
            a: 'a1',
            cat: 'gatilho',
            u: 'juliana.growth',
            t: 'COMMENT',
            s: 'UNREAD',
            sent: 'positivo',
            time: '09:04',
            c: 'AGENTE',
            media: 'Reels · Como orquestrar 3 agentes de IA no n8n',
            ai: 'Oi Juliana! Acabei de enviar o diagrama completo do fluxo direto no seu Direct!',
          },
          {
            id: `i_dyn_${++nextSeq}`,
            a: 'a1',
            cat: 'spam',
            u: 'seguidores_promocao_top',
            t: 'COMMENT',
            s: 'UNREAD',
            sent: 'negativo',
            time: '08:20',
            c: 'Turbine seu insta com seguidores reais! 10k por 29 reais clique no link da bio',
            media: 'Carrossel · Arquitetura Multi-Tenant',
            ai: 'Spam detectado automaticamente. Sugestão: ocultar e bloquear.',
            spam: true,
          },
        ],
        campaigns: [
          {
            id: `cmp_dyn_${++nextSeq}`,
            a: 'a1',
            name: 'LAL 1% BR — Founders & CTOs Interessados em Agentes IA',
            objective: 'OUTCOME_LEADS',
            status: 'ACTIVE',
            audienceId: 'aud_1',
            audienceName: 'Lookalike 1% Brasil — Leads Quentes de DMs & Comentários',
            isLookalike: true,
            dailyBudget: 80.0,
            spend: 540.0,
            impressions: 22400,
            clicks: 810,
            leads: 56,
            cpa: 9.64,
            roas: 5.2,
            startDate: '25/10/2026',
          },
          {
            id: `cmp_dyn_${++nextSeq}`,
            a: 'a1',
            name: 'Remarketing 30d — Engajados que comentaram AGENTE',
            objective: 'OUTCOME_SALES',
            status: 'ACTIVE',
            audienceId: 'aud_2',
            audienceName: 'Lista VIP — Leads Inbox & Palavra "AGENTE"',
            isLookalike: false,
            dailyBudget: 45.0,
            spend: 315.0,
            impressions: 6200,
            clicks: 390,
            leads: 34,
            cpa: 9.26,
            roas: 6.8,
            startDate: '26/10/2026',
          },
        ],
      };
    } else if (acc.id === 'a2') {
      // Duplo D (Moda Feminina Atemporal & Alfaiataria)
      return {
        posts: [
          {
            id: `p_dyn_${++nextSeq}`,
            a: 'a2',
            t: 'REELS',
            s: 'PUBLISHED',
            topic: 'O segredo da alfaiataria que não amassa na mala de viagem',
            cap: 'Você viaja a trabalho e as roupas chegam amassadas? O segredo está na gramatura da lã fria mista com viscose estruturada.\n\nDemonstramos 3 peças da nova coleção que saem da mala direto para a sua reunião.\n\nComente LOOK para receber a curadoria com desconto exclusivo.',
            tags: ['#alfaiataria', '#modafeminina', '#estiloatemporal', '#elegancia'],
            pr: [
              {
                t: 'Capa 9:16',
                ar: '9:16',
                x: 'Elegant woman in tailored slate blazer, high-end hotel lobby, natural warm window light, cinematic film grain, shallow depth of field --ar 9:16',
              },
            ],
            day: 2,
            time: '19:30',
            ai: 'Claude',
          },
          {
            id: `p_dyn_${++nextSeq}`,
            a: 'a2',
            t: 'CAROUSEL',
            s: 'SCHEDULED',
            topic: 'Guarda-Roupa Cápsula de Outono: 5 peças, 15 combinações',
            cap: 'Slide 1: A calça pantalona de linho encorpado.\nSlide 2: A camisa de seda pura off-white.\nSlide 3: O blazer oversized grafite.\nSlide 4: A saia midi plissada vinho.\nSlide 5: O trench coat atemporal.\n\nMenos excesso, mais presença.',
            tags: ['#guardaroupacapsula', '#outono', '#consultoriadeestilo'],
            pr: [
              {
                t: 'Carrossel Moda 4:5',
                ar: '4:5',
                x: 'High-fashion editorial flatlay of premium linen and silk clothing on textured neutral stone, warm shadows, minimalist vogue aesthetic --ar 4:5',
              },
            ],
            day: 5,
            time: '11:00',
            ai: 'Gemini',
          },
          {
            id: `p_dyn_${++nextSeq}`,
            a: 'a2',
            t: 'IMAGE',
            s: 'PROMPT_READY',
            topic: 'Nova Coleção: O corte impecável do linho puro',
            cap: 'Textura que respira, caimento que veste com autoridade e conforto.\n\nDisponível do 36 ao 46 no nosso e-commerce com frete cortesia para todo o Brasil.',
            tags: ['#linhopuro', '#modapremium', '#duplod'],
            pr: [
              {
                t: 'Foto Editorial',
                ar: '4:5',
                x: 'Detailed macro shot of fine linen garment texture, burgundy accent button, luxury tailoring atelier ambiance, soft side lighting --ar 4:5',
              },
            ],
            day: null,
            time: '',
            ai: 'Claude',
          },
        ],
        ints: [
          {
            id: `i_dyn_${++nextSeq}`,
            a: 'a2',
            u: 'camila.andrade_adv',
            t: 'DM',
            s: 'UNREAD',
            sent: 'positivo',
            time: '10:50',
            c: 'Olá! Amei o blazer grafite do Reels. Vocês ainda têm o tamanho 40 disponível para entrega em Curitiba?',
            media: '',
            ai: 'Olá, Camila! Temos sim o tamanho 40 em estoque a pronta entrega. Para Curitiba o prazo do sedex é de 2 dias úteis. Posso te enviar o link de compra com frete grátis?',
          },
          {
            id: `i_dyn_${++nextSeq}`,
            a: 'a2',
            cat: 'duvida',
            u: 'renata_boutique',
            t: 'COMMENT',
            s: 'UNREAD',
            sent: 'positivo',
            time: '09:25',
            c: 'Vocês trabalham com pedidos no atacado para revenda em loja multimarcas?',
            media: 'Carrossel · Guarda-Roupa Cápsula de Outono',
            ai: 'Olá Renata! Trabalhamos sim com lojistas selecionados. Vou te chamar no Direct com nosso catálogo B2B e condições comerciais!',
          },
        ],
        campaigns: [
          {
            id: `cmp_dyn_${++nextSeq}`,
            a: 'a2',
            name: 'Meta Ads | Lookalike 1% Compradoras de Moda Premium A/B',
            objective: 'OUTCOME_SALES',
            status: 'ACTIVE',
            audienceId: 'aud_duplo_1',
            audienceName: 'Lookalike 1% Brasil — Compradoras Ticket > R$ 500',
            isLookalike: true,
            dailyBudget: 75.0,
            spend: 525.0,
            impressions: 26800,
            clicks: 940,
            leads: 68,
            cpa: 7.72,
            roas: 7.4,
            startDate: '23/10/2026',
          },
        ],
      };
    } else if (acc.id === 'a3') {
      // VetBots (IA para Clínicas Veterinárias & Pet Shops)
      return {
        posts: [
          {
            id: `p_dyn_${++nextSeq}`,
            a: 'a3',
            t: 'REELS',
            s: 'PUBLISHED',
            topic: 'Como nossa IA confirmou 84 consultas em 1 sábado sem recepção',
            cap: 'Sábado de manhã é o caos na clínica: tutor chegando, vacina atrasada e telefone tocando sem parar.\n\nEnquanto a equipe focava nos animais, nosso bot confirmou os horários de segunda-feira e reagendou 6 desistências automaticamente.\n\nComente CLINICA para ver a demonstração ao vivo.',
            tags: ['#veterinaria', '#clinicavet', '#petshop', '#gestaovet'],
            pr: [
              {
                t: 'Capa Reels',
                ar: '9:16',
                x: 'Modern clean veterinary hospital reception, friendly golden retriever looking happy, digital tablet showing appointment calendar, soft teal illumination --ar 9:16',
              },
            ],
            day: 3,
            time: '18:00',
            ai: 'Claude',
          },
          {
            id: `p_dyn_${++nextSeq}`,
            a: 'a3',
            t: 'CAROUSEL',
            s: 'SCHEDULED',
            topic: '5 motivos pelos quais tutores faltam à consulta veterinária',
            cap: '1. Esquecimento simples da data.\n2. Incerteza se precisava de jejum.\n3. Dificuldade de remarcar por telefone.\n4. Falta de lembrete 2h antes.\n5. Trânsito sem opção de avisar rápido.\n\nA VetBots resolve os 5 pontos no WhatsApp automático.',
            tags: ['#vetcare', '#gestaoclinica', '#softwareveterinario'],
            pr: [
              {
                t: 'Carrossel 4:5',
                ar: '4:5',
                x: 'Infographic slides on clean medical teal background, cute stylized 3D veterinary dog icon, clean typography with high readability --ar 4:5',
              },
            ],
            day: 6,
            time: '10:30',
            ai: 'Gemini',
          },
        ],
        ints: [
          {
            id: `i_dyn_${++nextSeq}`,
            a: 'a3',
            u: 'dr_marcelo_vetcampinas',
            t: 'DM',
            s: 'UNREAD',
            sent: 'positivo',
            time: '08:35',
            c: 'Bom dia! Temos 4 veterinários e 2 recepcionistas. Nosso no-show nas consultas é de 22%. A ferramenta de vocês integra com o SimplesVet ou Vetwork?',
            media: '',
            ai: 'Bom dia, Dr. Marcelo! Integra perfeitamente via webhook com SimplesVet e Vetwork. Em nossos clientes a taxa de no-show costuma cair para menos de 4% nas primeiras 3 semanas. Quer agendar 15 minutos para eu te mostrar funcionando?',
          },
        ],
        campaigns: [
          {
            id: `cmp_dyn_${++nextSeq}`,
            a: 'a3',
            name: 'LAL 1% Donos de Clínicas Veterinárias & Hospitais Pet',
            objective: 'OUTCOME_LEADS',
            status: 'ACTIVE',
            audienceId: 'aud_vet_1',
            audienceName: 'Lookalike 1% Brasil — Donos de Clínicas e Pet Shops',
            isLookalike: true,
            dailyBudget: 65.0,
            spend: 455.0,
            impressions: 19800,
            clicks: 620,
            leads: 44,
            cpa: 10.34,
            roas: 4.9,
            startDate: '22/10/2026',
          },
        ],
      };
    } else {
      // e:agency (Branding & Performance)
      return {
        posts: [
          {
            id: `p_dyn_${++nextSeq}`,
            a: 'a4',
            t: 'CAROUSEL',
            s: 'PUBLISHED',
            topic: 'Anatomia de um Redesign de Marca que aumentou conversão em 42%',
            cap: 'Identidade visual não é só estética decorativa. É clareza de proposta de valor.\n\nMostramos o case completo da fintech Nexus: da tipografia ao design system de produto.\n\nLink do estudo completo na bio.',
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
        ],
        ints: [
          {
            id: `i_dyn_${++nextSeq}`,
            a: 'a4',
            u: 'bruno_founder_saas',
            t: 'DM',
            s: 'UNREAD',
            sent: 'positivo',
            time: '11:10',
            c: 'Parabéns pelo trabalho na Nexus! Estamos fechando nossa rodada Seed e precisamos redesenhar nossa marca antes de escalar. Qual é o lead time médio de vocês?',
            media: '',
            ai: 'Fala Bruno! Nosso sprint de branding e design system leva entre 3 a 5 semanas para entrega completa com tokens de código. Vamos marcar uma call de diagnóstico de 20 min amanhã?',
          },
        ],
        campaigns: [
          {
            id: `cmp_dyn_${++nextSeq}`,
            a: 'a4',
            name: 'Captação de Projetos de Branding B2B — Startups & Scaleups',
            objective: 'OUTCOME_LEADS',
            status: 'ACTIVE',
            audienceId: 'aud_eagency_1',
            audienceName: 'Público Qualificado — Startups e Investidores',
            isLookalike: false,
            dailyBudget: 50.0,
            spend: 350.0,
            impressions: 12500,
            clicks: 410,
            leads: 28,
            cpa: 12.5,
            roas: 5.8,
            startDate: '24/10/2026',
          },
        ],
      };
    }
  }
}

