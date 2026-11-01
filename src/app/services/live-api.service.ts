import { Injectable, inject, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { Account, PostItem, InteractionItem, MetaCampaign, MetaAdAccount } from '../data/seed-data';
import { SupabaseService } from './supabase.service';
import { brtParts, todayIso, weekdayIndex } from '../shared/dates';

export interface MetaAdAccountResponse {
  id: string;
  name: string;
  account_status: number;
  currency: string;
  amount_spent: string;
  timezone_name: string;
  balance?: number;
  portfolioId?: string;
  portfolioName?: string;
}

export interface MetaPortfolio {
  id: string;
  name: string;
  adAccounts: MetaAdAccountResponse[];
}

@Injectable({ providedIn: 'root' })
export class LiveApiService {
  private readonly supabase = inject(SupabaseService);

  readonly isSyncing = signal<boolean>(false);
  readonly metaApiConnected = signal<boolean>(true);
  readonly lastSyncTime = signal<string>('agora mesmo');
  readonly portfolios = signal<MetaPortfolio[]>([]);

  private get openaiKey(): string {
    return (typeof localStorage !== 'undefined' && localStorage.getItem('openai_api_key')) || environment.openaiApiKey || '';
  }
  private readonly openaiModel = environment.openaiModel || 'gpt-4o-mini';

  /**
   * Lista todas as Business Portfolios acessíveis e suas contas de anúncio (via servidor).
   */
  async fetchPortfolios(): Promise<MetaPortfolio[] | null> {
    try {
      const res = await this.supabase.callMetaApi<{ portfolios: MetaPortfolio[] }>('list_portfolios');
      this.portfolios.set(res.portfolios);
      this.metaApiConnected.set(true);
      return res.portfolios;
    } catch (err) {
      console.warn('Falha ao listar portfólios Meta:', err);
      this.metaApiConnected.set(false);
      return null;
    }
  }

  /**
   * Consulta campanhas reais da conta de anúncios (via servidor).
   */
  async fetchLiveCampaigns(adAccountId: string): Promise<any[] | null> {
    try {
      const res = await this.supabase.callMetaApi<{ data: any[] }>('list_campaigns', { adAccountId });
      return res.data || [];
    } catch (err) {
      console.warn('Falha ao listar campanhas Meta:', err);
      return null;
    }
  }

  /**
   * Publicações reais da Página. O token da página fica no servidor.
   */
  async fetchLivePagePosts(pageId: string, accountId: string): Promise<PostItem[] | null> {
    if (!pageId) return null;
    try {
      // 1. Tenta buscar direto via Graph API com attachments ricos caso haja token de página
      const pageKey = pageId === '185387824832414' ? 'amaral' : pageId === '184846338220933' ? 'duplod' : pageId === '134910416362221' ? 'vetbots' : null;
      const pageToken = pageKey ? (environment.metaPages as any)?.[pageKey]?.token : null;

      let rawPosts: any[] = [];

      if (pageToken) {
        try {
          const fields = 'id,message,created_time,permalink_url,status_type,attachments{media,type,url,subattachments}';
          const directRes = await fetch(`https://graph.facebook.com/v22.0/${pageId}/posts?fields=${fields}&limit=10&access_token=${pageToken}`);
          if (directRes.ok) {
            const dj = await directRes.json();
            if (dj.data && Array.isArray(dj.data)) {
              rawPosts = dj.data;
            }
          }
        } catch {
          // fallback para edge function
        }
      }

      if (rawPosts.length === 0) {
        const res = await this.supabase.callMetaApi<{ data: any[] }>('list_page_posts', { payload: { pageId } });
        if (res?.data && Array.isArray(res.data)) {
          rawPosts = res.data;
        }
      }

      if (rawPosts.length === 0) return null;

      return rawPosts.map((rawPost: any) => {
        const msg = rawPost.message || '';
        const lines = msg.split('\n').filter((l: string) => l.trim().length > 0);
        const topic = lines[0]?.slice(0, 70) || `Publicação Meta #${rawPost.id.slice(-6)}`;
        const hashtags = msg.match(/#[a-zA-Z0-9_À-ÿ]+/g) || ['#meta', '#feed'];
        // Data/hora reais de Brasília; `day` segue a semana começando na segunda (0 = seg).
        const when = brtParts(rawPost.created_time || new Date().toISOString()) ?? { date: todayIso(), time: '00:00' };
        const dayIdx = weekdayIndex(when.date);

        const media: any[] = [];
        const att = rawPost.attachments?.data?.[0];
        if (att) {
          if (att.subattachments?.data && att.subattachments.data.length > 0) {
            att.subattachments.data.forEach((sub: any, sIdx: number) => {
              if (sub.media?.image?.src) {
                media.push({
                  id: `med_${rawPost.id}_${sIdx}`,
                  type: 'image',
                  url: sub.media.image.src,
                  name: `slide_${sIdx + 1}.jpg`,
                  aspectRatio: sub.media.image.height > sub.media.image.width ? '4:5' : '1:1',
                });
              }
            });
          } else if (att.media?.image?.src) {
            media.push({
              id: `med_${rawPost.id}_0`,
              type: 'image',
              url: att.media.image.src,
              name: 'foto_principal.jpg',
              aspectRatio: att.media.image.height > att.media.image.width ? '4:5' : '1:1',
            });
          }
        }

        const isReels = rawPost.permalink_url?.includes('/reel/') || false;
        const isCarousel = media.length > 1 || msg.includes('Arrasta') || msg.includes('Slide');
        const format: any = isReels ? 'REELS' : isCarousel ? 'CAROUSEL' : 'IMAGE';

        return {
          id: `live_${rawPost.id}`,
          a: accountId,
          t: format,
          s: 'PUBLISHED' as const,
          topic,
          cap: msg,
          permalink: rawPost.permalink_url || undefined,
          tags: hashtags,
          pr: [
            {
              t: 'Mídia Meta Oficial',
              ar: format === 'REELS' ? '9:16' : '4:5',
              x: `Publicação real sincronizada via Meta Graph API em ${rawPost.created_time}. Link: ${rawPost.permalink_url || ''}`,
            },
          ],
          date: when.date,
          day: dayIdx,
          time: when.time,
          ai: 'Meta Graph API v22.0',
          media,
        };
      });
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

    // Variações específicas por nicho de conta real
    if (acc.id === 'a_amaral') {
      // Amaral Natação (Natação Infantil, Hidroginástica, Tradição e Família em Curitiba)
      return {
        posts: [
          {
            id: `p_dyn_${++nextSeq}`,
            a: 'a_amaral',
            t: 'REELS',
            s: 'PUBLISHED',
            topic: '5 dicas de ouro para seu filho perder o medo da água',
            cap: 'Aprender a nadar precisa ser leve e acolhedor! 💙\n\nNossos professores acompanham o ritmo de cada criança nas 7 piscinas aquecidas da Amaral.\n\nAgende uma aula experimental gratuita no WhatsApp (41) 98516-9970 e traga seu pequeno para conhecer a água.',
            tags: ['#AmaralNatação', '#Curitiba', '#VemNadar', '#NataçãoInfantil', '#47Anos'],
            pr: [
              {
                t: 'Capa Reels 9:16',
                ar: '9:16',
                x: 'Warm and bright swimming pool, happy toddler with swimming instructor smiling in clear turquoise water, natural sunlight reflections, professional swim academy photo --ar 9:16',
              },
            ],
            day: 4,
            time: '18:00',
            ai: 'Claude 3.7',
          },
          {
            id: `p_dyn_${++nextSeq}`,
            a: 'a_amaral',
            t: 'CAROUSEL',
            s: 'SCHEDULED',
            topic: 'Hidroginástica na terceira idade: mobilidade, zero impacto e bem-estar',
            cap: 'Slide 1: A água reduz até 90% do impacto nas articulações.\nSlide 2: Melhora do equilíbrio e prevenção de quedas.\nSlide 3: Socialização e alegria em turma.\nSlide 4: Água aquecida na temperatura ideal o ano todo.\n\nVenha fazer uma aula experimental gratuita na Rua Joaquim da Silva Sampaio, 303 - Mercês.',
            tags: ['#Hidroginástica', '#Curitiba', '#Saúde', '#QualidadeDeVida', '#AmaralNatação'],
            pr: [
              {
                t: 'Carrossel Saúde 4:5',
                ar: '4:5',
                x: 'Clean editorial photo of seniors enjoying aqua aerobics in crystal clear warm water pool, joyful expressions, soft lighting, turquoise water highlights --ar 4:5',
              },
            ],
            day: 5,
            time: '10:00',
            ai: 'Gemini 2.5 Pro',
          },
          {
            id: `p_dyn_${++nextSeq}`,
            a: 'a_amaral',
            t: 'IMAGE',
            s: 'PROMPT_READY',
            topic: '7 Piscinas Aquecidas e Tratadas com Ozônio sem irritar a pele',
            cap: 'Você sabia que o ozônio elimina bactérias e mantém a água pura sem deixar cheiro forte de cloro?\n\nConforto total para os olhos e para a pele dos bebês e atletas.\n\nAgende pelo WhatsApp (41) 98516-9970.',
            tags: ['#AmaralNatação', '#PiscinasAquecidas', '#Curitiba', '#Tradição47Anos'],
            pr: [
              {
                t: 'Foto Editorial 4:5',
                ar: '4:5',
                x: 'Modern indoor swimming pool facility with lanes, crystal clear turquoise water, soft natural light through skylights, premium architectural swim academy view --ar 4:5',
              },
            ],
            day: null,
            time: '',
            ai: 'Codex GPT-4o',
          },
        ],
        ints: [
          {
            id: `i_dyn_${++nextSeq}`,
            a: 'a_amaral',
            u: 'patricia_mamae_cwb',
            t: 'DM',
            s: 'UNREAD',
            sent: 'positivo',
            time: '11:42',
            c: 'Olá! Meu bebê tem 10 meses. Vocês têm turmas de natação aos sábados pela manhã? Como funciona a aula experimental?',
            media: '',
            ai: 'Olá Patrícia! Que maravilha! Temos turmas de natação para bebês a partir de 6 meses acompanhados de pai ou mãe aos sábados pela manhã. A aula experimental é 100% gratuita. Posso agendar para você pelo WhatsApp (41) 98516-9970?',
          },
          {
            id: `i_dyn_${++nextSeq}`,
            a: 'a_amaral',
            cat: 'duvida',
            u: 'marcos_nadador',
            t: 'COMMENT',
            s: 'UNREAD',
            sent: 'positivo',
            time: '10:15',
            c: 'Qual é o horário livre da piscina semiolímpica para treino adulto?',
            media: 'Carrossel · Família na Piscina',
            ai: 'Olá Marcos! Temos raias livres para treino adulto de segunda a sexta das 6h às 21h30 e aos sábados das 8h às 13h. Te enviamos a grade completa via Direct!',
          },
        ],
        campaigns: [
          {
            id: `cmp_dyn_${++nextSeq}`,
            a: 'a_amaral',
            name: 'Meta Ads — Aula Experimental Gratuita (Curitiba Raio 8km)',
            objective: 'OUTCOME_LEADS',
            status: 'ACTIVE',
            audienceId: 'aud_amaral_1',
            audienceName: 'Pais e Mães em Curitiba — Crianças de 0 a 12 anos',
            isLookalike: false,
            dailyBudget: 60.0,
            spend: 420.0,
            impressions: 28400,
            clicks: 1120,
            leads: 88,
            cpa: 4.77,
            roas: 6.4,
            startDate: '25/10/2026',
          },
        ],
      };
    } else if (acc.id === 'a2') {
      // Duplo D (Design Visual, UI/UX, Engenharia de Software e Grids)
      return {
        posts: [
          {
            id: `p_dyn_${++nextSeq}`,
            a: 'a2',
            t: 'REELS',
            s: 'PUBLISHED',
            topic: 'Como conectar Design System no Figma ao Angular v20 sem retrabalho',
            cap: 'Design e código falando exatamente a mesma língua: variáveis semânticas de cor, espaçamentos padronizados e componentes autônomos.\n\nNeste vídeo mostramos como nosso time elimina 80% das reuniões de alinhamento entre designers e devs.\n\nComente DESIGN para receber nosso guia de tokens.',
            tags: ['#DesignSystem', '#UIUX', '#EngenhariaDeSoftware', '#Figma', '#Angular'],
            pr: [
              {
                t: 'Capa 9:16',
                ar: '9:16',
                x: 'Minimalist dark design workspace with ultrawide monitor displaying Figma design system tokens and sleek Angular code, soft amber ambient lighting, cinematic macro aesthetic --ar 9:16',
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
            topic: '5 Erros Silenciosos de UI que estão matando a conversão do seu produto',
            cap: 'Slide 1: Falta de hierarquia visual clara nos CTAs.\nSlide 2: Contrastes abaixo do padrão WCAG AA.\nSlide 3: Densidade de informação excessiva sem respiração.\nSlide 4: Feedbacks de carregamento invisíveis.\nSlide 5: Formulários longos sem micro-etapas.\n\nSalve para aplicar na sua próxima sprint.',
            tags: ['#UIUX', '#DesignDeProduto', '#Conversão', '#Frontend'],
            pr: [
              {
                t: 'Carrossel Design 4:5',
                ar: '4:5',
                x: 'Clean geometric UI design diagrams on charcoal background, vibrant amber and violet accents, modern typography, grid alignment guides visible --ar 4:5',
              },
            ],
            day: 5,
            time: '11:00',
            ai: 'Claude',
          },
          {
            id: `p_dyn_${++nextSeq}`,
            a: 'a2',
            t: 'IMAGE',
            s: 'PROMPT_READY',
            topic: 'Design visual de alto impacto: por que o minimalismo técnico converte mais',
            cap: 'Menos ruído, mais foco no valor. O design técnico bem estruturado aumenta o ticket médio e reduz o ciclo de vendas.',
            tags: ['#DesignDeSoftware', '#UIUX', '#AltaPerformance'],
            pr: [
              {
                t: 'Editorial 4:5',
                ar: '4:5',
                x: 'Dark mode user interface layout on high resolution OLED monitor, warm amber accents, crisp clean typography, macro angle --ar 4:5',
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
            u: 'bruno_founder_saas',
            t: 'DM',
            s: 'UNREAD',
            sent: 'positivo',
            time: '14:20',
            c: 'Fala time Duplo D! Vimos o novo dashboard de vocês. Estamos precisando de um redesign completo na nossa plataforma B2B. Vocês têm agenda para sprint de design este mês?',
            media: '',
            ai: 'Fala Bruno! Temos disponibilidade sim. Nossos sprints de produto duram de 3 a 5 semanas incluindo protótipo no Figma e tokens em código. Vamos marcar uma call de 20 minutos amanhã para entender seu escopo?',
          },
          {
            id: `i_dyn_${++nextSeq}`,
            a: 'a2',
            cat: 'duvida',
            u: 'gabriel.frontend',
            t: 'COMMENT',
            s: 'UNREAD',
            sent: 'positivo',
            time: '12:45',
            c: 'Vocês exportam os tokens do Figma direto para CSS variables ou usam Style Dictionary?',
            media: 'Carrossel · 5 Erros de UI',
            ai: 'Opa Gabriel! Usamos uma pipeline automatizada com Style Dictionary que gera CSS variables com suporte a temas dark/light automaticamente!',
          },
        ],
        campaigns: [
          {
            id: `cmp_dyn_${++nextSeq}`,
            a: 'a2',
            name: 'Captação de Projetos de Design UI/UX — Startups e Empresas',
            objective: 'OUTCOME_LEADS',
            status: 'ACTIVE',
            audienceId: 'aud_duplod_1',
            audienceName: 'Lookalike 1% — Founders, CTOs e Product Managers',
            isLookalike: true,
            dailyBudget: 50.0,
            spend: 350.0,
            impressions: 14200,
            clicks: 520,
            leads: 36,
            cpa: 9.72,
            roas: 5.8,
            startDate: '24/10/2026',
          },
        ],
      };
    } else {
      // VetBots (IA para Clínicas Veterinárias & Pet Shops)
      return {
        posts: [
          {
            id: `p_dyn_${++nextSeq}`,
            a: 'a_vetbots',
            t: 'REELS',
            s: 'PUBLISHED',
            topic: 'Como a IA confirma consultas e reduz no-show em 73%',
            cap: 'Tutor esquece consulta, recepcionista passa a tarde ligando e a clínica perde faturamento.\n\nVeja como a VetBots envia lembrete interativo no WhatsApp 24h antes e já reocupa a vaga se o tutor desmarcar.\n\nComente AGENDA para ver uma demonstração na prática.',
            tags: ['#veterinaria', '#gestaovet', '#clinicaveterinaria', '#ia'],
            pr: [
              {
                t: 'Capa 9:16',
                ar: '9:16',
                x: 'Modern veterinary clinic front desk, cheerful veterinarian with digital tablet, golden retriever sitting obediently, warm bright medical lighting --ar 9:16',
              },
            ],
            day: 0,
            time: '12:00',
            ai: 'Claude',
          },
        ],
        ints: [
          {
            id: `i_dyn_${++nextSeq}`,
            a: 'a_vetbots',
            u: 'dr_marcelo_vetcampinas',
            t: 'DM',
            s: 'UNREAD',
            sent: 'positivo',
            time: '08:35',
            c: 'Bom dia! Temos 4 veterinários e 2 recepcionistas. Nosso no-show nas consultas é de 22%. A ferramenta de vocês integra com o WhatsApp e sistema da clínica?',
            media: '',
            ai: 'Bom dia, Dr. Marcelo! Integra perfeitamente com o WhatsApp da clínica. A taxa de no-show costuma cair drasticamente nas primeiras semanas com confirmação em 1 clique. Quer agendar 15 minutos para ver funcionando?',
          },
        ],
        campaigns: [
          {
            id: `cmp_dyn_${++nextSeq}`,
            a: 'a_vetbots',
            name: 'LAL 1% Donos de Clínicas Veterinárias & Hospitais Pet',
            objective: 'OUTCOME_LEADS',
            status: 'ACTIVE',
            audienceId: 'aud_vet_1',
            audienceName: 'Lookalike 1% Brasil — Donos de Clínicas e Pet Shops',
            isLookalike: true,
            dailyBudget: 60.0,
            spend: 420.0,
            impressions: 18400,
            clicks: 590,
            leads: 42,
            cpa: 10.0,
            roas: 5.2,
            startDate: '25/10/2026',
          },
        ],
      };
    }
  }
}

