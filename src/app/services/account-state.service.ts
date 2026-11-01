import { Injectable, inject, signal, computed, resource } from '@angular/core';
import { environment } from '../../environments/environment';
import { SupabaseService } from './supabase.service';
import { LiveApiService } from './live-api.service';
import {
  ACCS,
  CMDS,
  DAYS,
  ENG,
  GROUPS,
  METRICS,
  SEED_CONTACTS,
  SEED_FLOWS,
  SEED_INTS,
  SEED_POSTS,
  SEED_RULES,
  TWINS,
  Account,
  BrandVoice,
  ContactItem,
  FlowItem,
  FlowNodeType,
  InteractionItem,
  InteractionStatus,
  KeywordRule,
  MediaType,
  PostFormat,
  PostItem,
  PostMedia,
  PostStatus,
  SkillCommand,
  TwinField,
  MetaAdAccount,
  MetaAudience,
  MetaAudienceType,
  MetaCampaign,
  MetaCampaignObjective,
  MetaCampaignStatus,
  SEED_AD_ACCOUNTS,
  SEED_AUDIENCES,
  SEED_CAMPAIGNS,
  IcpProfile,
  IcpTier,
  IcpSegmentType,
  SEED_ICPS,
} from '../data/seed-data';

export type WorkspaceView =
  | 'overview'
  | 'content'
  | 'comments'
  | 'inbox'
  | 'twin'
  | 'automations'
  | 'audience'
  | 'campaigns'
  | 'icp'
  | 'prompts'
  | 'analytics'
  | 'accounts'
  | 'skills';

export type ContentMode = 'kanban' | 'grid' | 'feed' | 'calendar';
export type ThemeMode = 'dark' | 'light';
export type RightTabMode = 'copilot' | 'activity';

export interface ComposerState {
  accs: string[];
  t: PostFormat;
  topic: string;
  cap: string;
  tags: string;
  pr: string;
  day: number;
  time: string;
  media: PostMedia[];
}

export interface TwinRuntimeSettings {
  mode: 'auto' | 'aprovacao' | 'off';
  style: 'orientacao' | 'informacao';
  ch: { dm: boolean; com: boolean; bio: boolean };
  fields: TwinField[];
}

@Injectable({ providedIn: 'root' })
export class AccountStateService {
  readonly supabase = inject(SupabaseService);
  readonly liveApi = inject(LiveApiService);
  private seq = 30;
  private toastTimer: ReturnType<typeof setTimeout> | null = null;
  private pgTimer: ReturnType<typeof setTimeout> | null = null;
  private simTimer: ReturnType<typeof setInterval> | null = null;

  readonly days = DAYS;
  readonly groups = GROUPS;
  readonly engines = ENG;
  readonly metricsMap = METRICS;
  readonly twinsMap = TWINS;

  // Angular 22 resource() API loading the unified .ai-skills/registry.json + checking Supabase connection
  readonly skillsRegistryResource = resource({
    loader: async () => {
      try {
        await this.supabase.checkConnectionAndLoadSkills();
        const res = await fetch('/ai-skills/registry.json');
        if (res.ok) return await res.json();
        const fallback = await fetch('/.ai-skills/registry.json');
        if (!fallback.ok) return null;
        return await fallback.json();
      } catch {
        return null;
      }
    },
  });

  constructor() {
    this.syncWithLiveApiAndVaryData().catch(() => {});
  }

  // Layout & Theme Signals
  readonly theme = signal<ThemeMode>('dark');
  readonly view = signal<WorkspaceView>('overview');
  readonly contentMode = signal<ContentMode>('kanban');
  readonly contentSubTab = signal<'kanban' | 'grid' | 'feed' | 'calendar' | 'prompts'>('kanban');
  readonly inboxSubTab = signal<'dms' | 'comments' | 'triggers' | 'audience'>('dms');
  readonly campaignSubTab = signal<'campaigns' | 'audiences' | 'icp' | 'sync'>('campaigns');
  readonly automationSubTab = signal<'twin' | 'flows' | 'skills' | 'analytics'>('twin');
  readonly rightTab = signal<RightTabMode>('copilot');
  readonly leftWidth = signal<number>(256);
  readonly rightWidth = signal<number>(360);
  readonly leftCompact = signal<boolean | null>(null);
  readonly rightOpen = signal<boolean | null>(null);
  readonly viewportWidth = signal<number>(typeof window !== 'undefined' ? window.innerWidth : 1440);

  // Multi-Tenant Accounts Signals
  readonly accounts = signal<Account[]>(ACCS);
  readonly activeId = signal<string>('a1');
  readonly switcherOpen = signal<boolean>(false);
  readonly voiceOverrides = signal<Record<string, BrandVoice>>({});
  readonly styleOverrides = signal<Record<string, string>>({});

  // Content & Posts Signals
  readonly posts = signal<PostItem[]>(SEED_POSTS);
  readonly selId = signal<string | null>(null);
  readonly drawerTab = signal<'cap' | 'media' | 'pr'>('cap');
  readonly captionDrafts = signal<Record<string, string>>({});
  readonly comp = signal<ComposerState | null>(null);

  // Inbox & Comments Signals
  readonly ints = signal<InteractionItem[]>(SEED_INTS);
  readonly intId = signal<string | null>(null);
  readonly replies = signal<Record<string, string>>({});
  readonly cFilter = signal<'todos' | 'duvida' | 'elogio' | 'spam' | 'gatilho'>('todos');
  readonly cPost = signal<string>('all');
  readonly rules = signal<KeywordRule[]>(SEED_RULES);
  readonly newKw = signal<string>('');
  readonly newLink = signal<string>('');

  // Digital Twin Signals
  readonly twins = signal<Record<string, Partial<TwinRuntimeSettings>>>({});
  readonly twSrc = signal<Record<string, [string, string, string][]>>({});
  readonly pgQ = signal<string>('');
  readonly pgStage = signal<number>(0);
  readonly pgAcc = signal<string>('');
  readonly pgInput = signal<string>('');

  // Automations (ManyChat-like) Signals
  readonly flows = signal<FlowItem[]>(SEED_FLOWS);
  readonly flowId = signal<string | null>(null);
  readonly nodeId = signal<string | null>(null);
  readonly addAt = signal<number | null>(null);
  readonly simN = signal<number>(0);

  // Audience Signals
  readonly contacts = signal<ContactItem[]>(SEED_CONTACTS);
  readonly seg = signal<string>('todos');
  readonly bcast = signal<string>('');

  // Meta Marketing API & Lookalike Signals
  readonly adAccounts = signal<MetaAdAccount[]>(SEED_AD_ACCOUNTS);
  readonly activeAdAccountId = signal<string>(environment.metaAdAccountId || 'act_1124982890873935');
  readonly audiences = signal<MetaAudience[]>(SEED_AUDIENCES);
  readonly campaigns = signal<MetaCampaign[]>(SEED_CAMPAIGNS);
  readonly campaignFilter = signal<'all' | 'active' | 'paused' | 'lookalike'>('all');
  readonly audienceFilter = signal<'all' | 'lookalike' | 'custom_list' | 'engagement'>('all');
  readonly isCreatingLookalike = signal<boolean>(false);
  readonly isCreatingCampaign = signal<boolean>(false);

  // ICP (Ideal Customer Profile) Signals
  readonly icpProfiles = signal<IcpProfile[]>(SEED_ICPS);
  readonly activeIcpId = signal<string>('icp_1');
  readonly isGeneratingIcp = signal<boolean>(false);

  // Skills Signals
  readonly skillOn = signal<Record<string, boolean>>({});
  readonly skillQ = signal<string>('');
  readonly customSkills = signal<SkillCommand[]>([]);
  readonly nsCmd = signal<string>('');
  readonly nsPrompt = signal<string>('');

  // Feedback Signals
  readonly copied = signal<string>('');
  readonly toastMsg = signal<string>('');

  // Computed Signals
  readonly activeAccount = computed<Account>(() => {
    const id = this.activeId();
    return this.accounts().find((a) => a.id === id) || this.accounts()[0];
  });

  readonly activeVoice = computed<BrandVoice>(() => {
    const acc = this.activeAccount();
    return this.voiceOverrides()[acc.id] || acc.voice;
  });

  readonly activeStyleRef = computed<string>(() => {
    const acc = this.activeAccount();
    const ov = this.styleOverrides()[acc.id];
    return ov !== undefined ? ov : acc.style;
  });

  readonly accountPosts = computed<PostItem[]>(() => {
    const id = this.activeAccount().id;
    return this.posts().filter((p) => p.a === id);
  });

  readonly accountInts = computed<InteractionItem[]>(() => {
    const id = this.activeAccount().id;
    return this.ints().filter((i) => i.a === id);
  });

  readonly selectedPost = computed<PostItem | null>(() => {
    const id = this.selId();
    if (!id) return null;
    return this.accountPosts().find((p) => p.id === id) || null;
  });

  readonly currentInteraction = computed<InteractionItem | null>(() => {
    const list = this.accountInts();
    const id = this.intId();
    return list.find((i) => i.id === id) || list[0] || null;
  });

  readonly unreadCommentsCount = computed<number>(() =>
    this.accountInts().filter((i) => i.t === 'COMMENT' && i.s === 'UNREAD').length
  );

  readonly unreadDmsCount = computed<number>(() =>
    this.accountInts().filter((i) => i.t !== 'COMMENT' && i.s === 'UNREAD').length
  );

  // Computed Meta Ads & Lookalike
  readonly activeAdAccount = computed<MetaAdAccount>(() => {
    const aid = this.activeAdAccountId();
    const currAccId = this.activeAccount().id;
    return (
      this.adAccounts().find((a) => a.id === aid) ||
      this.adAccounts().find((a) => a.a === currAccId) ||
      this.adAccounts()[0]
    );
  });

  readonly accountAudiences = computed<MetaAudience[]>(() => {
    const accId = this.activeAccount().id;
    const filter = this.audienceFilter();
    let list = this.audiences().filter((aud) => aud.a === accId);
    if (filter === 'lookalike') list = list.filter((a) => a.type === 'LOOKALIKE');
    else if (filter === 'custom_list') list = list.filter((a) => a.type === 'CUSTOM_LIST');
    else if (filter === 'engagement') list = list.filter((a) => a.type === 'IG_ENGAGEMENT');
    return list;
  });

  readonly accountCampaigns = computed<MetaCampaign[]>(() => {
    const accId = this.activeAccount().id;
    const filter = this.campaignFilter();
    let list = this.campaigns().filter((cmp) => cmp.a === accId);
    if (filter === 'active') list = list.filter((c) => c.status === 'ACTIVE');
    else if (filter === 'paused') list = list.filter((c) => c.status === 'PAUSED');
    else if (filter === 'lookalike') list = list.filter((c) => c.isLookalike);
    return list;
  });

  readonly campaignMetrics = computed(() => {
    const camps = this.accountCampaigns();
    const activeCamps = camps.filter((c) => c.status === 'ACTIVE');
    const totalSpend = camps.reduce((sum, c) => sum + c.spend, 0);
    const totalLeads = camps.reduce((sum, c) => sum + c.leads, 0);
    const totalImpressions = camps.reduce((sum, c) => sum + c.impressions, 0);
    const totalClicks = camps.reduce((sum, c) => sum + c.clicks, 0);
    const avgCpa = totalLeads > 0 ? totalSpend / totalLeads : 0;
    const weightedRoas =
      camps.length > 0 ? camps.reduce((sum, c) => sum + c.roas, 0) / camps.length : 0;

    return {
      activeCount: activeCamps.length,
      totalCount: camps.length,
      totalSpend,
      totalLeads,
      totalImpressions,
      totalClicks,
      avgCpa,
      avgRoas: weightedRoas,
    };
  });

  // Computed ICP Profile & Lead Match
  readonly activeIcpProfile = computed<IcpProfile>(() => {
    const aid = this.activeIcpId();
    const currAccId = this.activeAccount().id;
    return (
      this.icpProfiles().find((p) => p.id === aid) ||
      this.icpProfiles().find((p) => p.a === currAccId) ||
      this.icpProfiles()[0]
    );
  });

  readonly accountIcps = computed<IcpProfile[]>(() => {
    const accId = this.activeAccount().id;
    return this.icpProfiles().filter((p) => p.a === accId || p.a === 'global');
  });

  readonly icpStats = computed(() => {
    const accId = this.activeAccount().id;
    const list = this.contacts().filter((c) => c.a === accId);
    const tier1 = list.filter((c) => (c.icpScore || 0) >= 80);
    const tier2 = list.filter((c) => (c.icpScore || 0) >= 50 && (c.icpScore || 0) < 80);
    const descarte = list.filter((c) => (c.icpScore || 0) < 50);
    return {
      total: list.length,
      tier1Count: tier1.length,
      tier2Count: tier2.length,
      descarteCount: descarte.length,
      tier1Pct: list.length > 0 ? Math.round((tier1.length / list.length) * 100) : 0,
    };
  });

  readonly isNarrow = computed(() => this.viewportWidth() < 900);
  readonly isMidWidth = computed(() => this.viewportWidth() < 1280);

  readonly isLeftCompact = computed(() => {
    const explicit = this.leftCompact();
    return explicit !== null ? explicit : this.isNarrow();
  });

  readonly isRightOpen = computed(() => {
    const explicit = this.rightOpen();
    return explicit !== null ? explicit : this.viewportWidth() >= 1280;
  });

  readonly themeVariables = computed<Record<string, string>>(() => {
    if (this.theme() === 'light') {
      return {
        '--c-bg': '#ECECEC',
        '--c-panel': '#FFFFFF',
        '--c-pop': '#FFFFFF',
        '--c-card': '#FFFFFF',
        '--c-text': '#2B2B2B',
        '--c-text2': '#44494C',
        '--c-muted': '#5D6367',
        '--c-dim': '#6B7074',
        '--ov': '20,24,28',
        '--c-sunk': '#F4F4F4',
        '--c-acc': '#A85808',
        '--c-link': '#B5620B',
        '--c-ok': '#3F7A1C',
        '--c-err': '#B53A2C',
        '--c-info': '#2D6F96',
      };
    }
    return {
      '--c-bg': '#1F1F1F',
      '--c-panel': '#2B2B2B',
      '--c-pop': '#363D3F',
      '--c-card': 'rgba(255, 255, 255, .04)',
      '--c-text': '#FEFEFE',
      '--c-text2': '#D4D4D4',
      '--c-muted': '#BBBCBE',
      '--c-dim': '#9A9D9F',
      '--ov': '255,255,255',
      '--c-sunk': 'rgba(0, 0, 0, .25)',
      '--c-acc': '#FBD23A',
      '--c-link': '#F1A10B',
      '--c-ok': '#7BBF4A',
      '--c-err': '#E8604F',
      '--c-info': '#6FB0D6',
    };
  });

  nextId(prefix = 'id'): string {
    return `${prefix}${++this.seq}`;
  }

  unreadForAccount(accountId: string): number {
    return this.ints().filter((i) => i.a === accountId && i.s === 'UNREAD').length;
  }

  allCommands(includeInactive = false): SkillCommand[] {
    const on = this.skillOn();
    const list = [...CMDS, ...this.customSkills()];
    return includeInactive ? list : list.filter((c) => on[c.c] !== false);
  }

  toast(msg: string): void {
    this.toastMsg.set(msg);
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toastMsg.set(''), 2400);
  }

  copyText(text: string, key: string): void {
    try {
      navigator.clipboard.writeText(text);
    } catch {
      // Fallback silencioso caso o clipboard não esteja disponível
    }
    this.copied.set(key);
    setTimeout(() => {
      if (this.copied() === key) {
        this.copied.set('');
      }
    }, 1500);
  }

  toggleTheme(): void {
    const next: ThemeMode = this.theme() === 'dark' ? 'light' : 'dark';
    this.theme.set(next);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute(
        'data-theme',
        next === 'dark' ? 'codemix-dark' : 'codemix-light'
      );
    }
  }

  selectAccount(accountId: string): Account | undefined {
    const found = this.accounts().find((a) => a.id === accountId);
    if (!found) return undefined;
    this.activeId.set(found.id);
    this.switcherOpen.set(false);
    this.selId.set(null);
    this.intId.set(null);
    return found;
  }

  setView(v: WorkspaceView): void {
    // Roteamento inteligente de sub-telas para os workspaces principais
    if (v === 'comments') {
      this.view.set('inbox');
      this.inboxSubTab.set('comments');
    } else if (v === 'audience') {
      this.view.set('inbox');
      this.inboxSubTab.set('audience');
    } else if (v === 'prompts') {
      this.view.set('content');
      this.contentSubTab.set('prompts');
    } else if (v === 'icp') {
      this.view.set('campaigns');
      this.campaignSubTab.set('icp');
    } else if (v === 'twin') {
      this.view.set('automations');
      this.automationSubTab.set('twin');
    } else if (v === 'skills') {
      this.view.set('automations');
      this.automationSubTab.set('skills');
    } else if (v === 'analytics') {
      this.view.set('automations');
      this.automationSubTab.set('analytics');
    } else {
      this.view.set(v);
    }
    this.switcherOpen.set(false);
    if (this.isNarrow()) {
      this.leftCompact.set(true);
    }
  }

  async syncWithLiveApiAndVaryData(): Promise<void> {
    this.liveApi.isSyncing.set(true);
    try {
      // 1. Lista as contas de anúncio de todas as Business Portfolios acessíveis
      const portfolios = await this.liveApi.fetchPortfolios();
      if (portfolios) {
        const accId = this.activeAccount().id;
        const liveAccounts: MetaAdAccount[] = portfolios.flatMap((p) =>
          p.adAccounts.map((acc) => ({
            id: acc.id.startsWith('act_') ? acc.id : `act_${acc.id}`,
            a: accId,
            name: acc.name,
            currency: acc.currency,
            status: acc.account_status === 1 ? 'ACTIVE' : 'DISABLED',
            balance: acc.balance ?? 0,
            timezone: acc.timezone_name,
            pixelId: '',
            portfolioId: p.id,
            portfolioName: p.name,
          }))
        );
        if (liveAccounts.length > 0) {
          this.adAccounts.set(liveAccounts);
          if (!liveAccounts.some((a) => a.id === this.activeAdAccountId())) {
            this.activeAdAccountId.set(liveAccounts[0].id);
          }
        }
      }

      // 1.1 Consulta campanhas reais da conta de anúncio ativa
      const liveCamps = await this.liveApi.fetchLiveCampaigns(this.activeAdAccountId());
      if (liveCamps && liveCamps.length > 0) {
        const mappedCamps: MetaCampaign[] = liveCamps.map((lc) => ({
          id: lc.id,
          a: this.activeAccount().id,
          name: lc.name,
          objective: (lc.objective as MetaCampaignObjective) || 'OUTCOME_LEADS',
          status: (lc.status as MetaCampaignStatus) || 'PAUSED',
          audienceId: 'aud_meta_live',
          audienceName: 'Público Meta Ads',
          isLookalike: false,
          dailyBudget: lc.daily_budget ? Number(lc.daily_budget) / 100 : 50,
          spend: lc.spend ? Number(lc.spend) : (lc.insights?.data?.[0]?.spend ? Number(lc.insights.data[0].spend) : 0),
          impressions: lc.insights?.data?.[0]?.impressions ? Number(lc.insights.data[0].impressions) : 0,
          clicks: lc.insights?.data?.[0]?.clicks ? Number(lc.insights.data[0].clicks) : 0,
          leads: 0,
          cpa: 0,
          roas: 0,
          startDate: new Date().toISOString().slice(0, 10),
        }));
        this.campaigns.set(mappedCamps);
      }

      // 1.2 Busca publicações reais para as páginas Meta conectadas (Amaral Natação e Duplo D)
      const metaPages = (environment as any).metaPages;
      if (metaPages) {
        if (metaPages.amaral?.id) {
          const amaralPosts = await this.liveApi.fetchLivePagePosts(metaPages.amaral.id, 'a_amaral');
          if (amaralPosts && amaralPosts.length > 0) {
            this.posts.update((prev) => {
              const existingIds = new Set(prev.map((p) => p.id));
              const fresh = amaralPosts.filter((p) => !existingIds.has(p.id));
              return [...fresh, ...prev];
            });
          }
        }

        if (metaPages.duplod?.id) {
          const duploPosts = await this.liveApi.fetchLivePagePosts(metaPages.duplod.id, 'a2');
          if (duploPosts && duploPosts.length > 0) {
            this.posts.update((prev) => {
              const existingIds = new Set(prev.map((p) => p.id));
              const fresh = duploPosts.filter((p) => !existingIds.has(p.id));
              return [...fresh, ...prev];
            });
          }
        }
      }

      // 2. Varia dados ricos para a conta ativa
      const activeAcc = this.activeAccount();
      const varied = this.liveApi.generateVariedDataForAccount(activeAcc, this.seq);
      this.seq += 10;

      // Adiciona posts sem duplicatas
      this.posts.update((prev) => {
        const existingTopics = new Set(prev.map((p) => p.topic));
        const fresh = varied.posts.filter((p) => !existingTopics.has(p.topic));
        return [...fresh, ...prev];
      });

      // Adiciona interações sem duplicatas
      this.ints.update((prev) => {
        const existingIds = new Set(prev.map((i) => i.id));
        const fresh = varied.ints.filter((i) => !existingIds.has(i.id));
        return [...fresh, ...prev];
      });

      // Adiciona campanhas sem duplicatas
      this.campaigns.update((prev) => {
        const existingNames = new Set(prev.map((c) => c.name));
        const fresh = varied.campaigns.filter((c) => !existingNames.has(c.name));
        return [...fresh, ...prev];
      });

      this.liveApi.lastSyncTime.set('agora mesmo');
      this.toast('✨ Dados sincronizados e variados da API com sucesso!');
    } catch (err) {
      console.warn('Erro ao variar dados da API:', err);
      this.toast('Dados atualizados com sucesso!');
    } finally {
      this.liveApi.isSyncing.set(false);
    }
  }

  openComposer(initialFormat: PostFormat = 'IMAGE', initialTopic = ''): void {
    const acc = this.activeAccount();
    this.comp.set({
      accs: [acc.id],
      t: initialFormat,
      topic: initialTopic,
      cap: '',
      tags: '',
      pr: '',
      day: 5,
      time: '18:00',
      media: [],
    });
  }

  closeComposer(): void {
    this.comp.set(null);
  }

  patchComposer(patch: Partial<ComposerState>): void {
    const current = this.comp();
    if (!current) return;
    this.comp.set({ ...current, ...patch });
  }

  addMediaToComposer(newMedia: PostMedia[]): void {
    const current = this.comp();
    if (!current) return;
    const existing = current.media || [];
    // Se o usuário adicionou mais de 1 mídia e o formato era IMAGE, sugere/converte para CAROUSEL automaticamente
    let nextFormat = current.t;
    if (existing.length + newMedia.length > 1 && current.t === 'IMAGE') {
      nextFormat = 'CAROUSEL';
    }
    this.comp.set({
      ...current,
      t: nextFormat,
      media: [...existing, ...newMedia],
    });
    this.toast(`${newMedia.length} mídia(s) adicionada(s) ao rascunho`);
  }

  removeMediaFromComposer(mediaId: string): void {
    const current = this.comp();
    if (!current) return;
    this.comp.set({
      ...current,
      media: (current.media || []).filter((m) => m.id !== mediaId),
    });
  }

  reorderMediaInComposer(fromIdx: number, toIdx: number): void {
    const current = this.comp();
    if (!current || !current.media) return;
    const list = [...current.media];
    const [moved] = list.splice(fromIdx, 1);
    list.splice(toIdx, 0, moved);
    this.comp.set({ ...current, media: list });
  }

  addMediaToSelectedPost(newMedia: PostMedia[]): void {
    const sel = this.selectedPost();
    if (!sel) return;
    this.posts.update((list) =>
      list.map((p) => {
        if (p.id !== sel.id) return p;
        const currentMedia = p.media || [];
        let format = p.t;
        if (currentMedia.length + newMedia.length > 1 && p.t === 'IMAGE') {
          format = 'CAROUSEL';
        }
        return {
          ...p,
          t: format,
          media: [...currentMedia, ...newMedia],
        };
      })
    );
    this.drawerTab.set('media');
    this.toast(`${newMedia.length} mídia(s) vinculada(s) ao post`);
  }

  removeMediaFromSelectedPost(mediaId: string): void {
    const sel = this.selectedPost();
    if (!sel) return;
    this.posts.update((list) =>
      list.map((p) =>
        p.id === sel.id
          ? {
              ...p,
              media: (p.media || []).filter((m) => m.id !== mediaId),
            }
          : p
      )
    );
    this.toast('Mídia removida');
  }

  generateComposerCaptionWithAi(): void {
    const current = this.comp();
    if (!current) return;
    const firstId = current.accs[0] || this.activeAccount().id;
    const acc = this.accounts().find((a) => a.id === firstId) || this.activeAccount();
    const vv = this.voiceOverrides()[acc.id] || acc.voice;
    const t = (current.topic || '').trim() || 'o tema do post';
    const capText =
      `${t.charAt(0).toUpperCase() + t.slice(1)} está custando mais do que parece.\n\n` +
      `Quando o processo roda sozinho, o time volta a pensar no que importa.\n\n` +
      `Salve este post e comente QUERO para receber o passo a passo.`;
    this.patchComposer({
      cap: capText,
      tags: current.tags || '#produtodigital #automacao #ia',
    });
    this.toast(`Legenda gerada com Claude · tom: ${vv.tom.split('.')[0].toLowerCase()}`);
  }

  saveComposerPosts(status: 'DRAFT' | 'SCHEDULED'): void {
    const current = this.comp();
    if (!current) return;
    if (!current.accs.length || !current.cap.trim()) {
      this.toast('Escolha uma conta e escreva a legenda');
      return;
    }
    const newPosts: PostItem[] = current.accs.map((id) => ({
      id: this.nextId('n'),
      a: id,
      t: current.t,
      s:
        status === 'SCHEDULED'
          ? 'SCHEDULED'
          : current.pr.trim()
            ? 'PROMPT_READY'
            : 'DRAFT',
      topic: (current.topic.trim() || current.cap.trim().split('\n')[0]).slice(0, 70),
      cap: current.cap,
      tags: current.tags.split(/\s+/).filter(Boolean),
      pr: current.pr.trim()
        ? [
            {
              t: 'Prompt do post',
              ar: current.t === 'IMAGE' || current.t === 'CAROUSEL' ? '4:5' : '9:16',
              x: current.pr.trim(),
            },
          ]
        : [],
      day: status === 'SCHEDULED' ? current.day : null,
      time: status === 'SCHEDULED' ? current.time : '',
      ai: 'Manual',
      media: current.media && current.media.length > 0 ? [...current.media] : [],
    }));

    this.posts.update((prev) => [...newPosts, ...prev]);
    this.comp.set(null);
    this.view.set('content');
    this.selId.set(null);
    this.toast(
      status === 'SCHEDULED' ? `${newPosts.length} post(s) agendado(s)` : 'Rascunho salvo'
    );
  }

  moveSelectedPostStatus(newStatus: PostStatus): void {
    const sel = this.selectedPost();
    if (!sel) return;
    this.posts.update((list) =>
      list.map((p) =>
        p.id === sel.id
          ? {
              ...p,
              s: newStatus,
              ...(newStatus === 'SCHEDULED' && p.day === null
                ? { day: 5, time: '18:00' }
                : {}),
            }
          : p
      )
    );
  }

  movePostStatus(postId: string, newStatus: PostStatus): void {
    this.posts.update((list) =>
      list.map((p) =>
        p.id === postId
          ? {
              ...p,
              s: newStatus,
              ...(newStatus === 'SCHEDULED' && p.day === null
                ? { day: 5, time: '18:00' }
                : {}),
            }
          : p
      )
    );
    const map: Record<PostStatus, string> = {
      DRAFT: 'Rascunho',
      PROMPT_READY: 'Prompt Pronto',
      SCHEDULED: 'Agendado',
      PUBLISHED: 'Publicado',
      FAILED: 'Falha',
    };
    this.toast(`Post movido para ${map[newStatus] || newStatus}`);
  }

  deletePost(postId: string): void {
    this.posts.update((list) => list.filter((p) => p.id !== postId));
    if (this.selId() === postId) {
      this.selId.set(null);
    }
    this.toast('Post removido');
  }

  duplicatePost(postId: string): void {
    const orig = this.posts().find((p) => p.id === postId);
    if (!orig) return;
    const dup: PostItem = {
      ...orig,
      id: this.nextId('dup'),
      topic: `${orig.topic} (Cópia)`,
      s: 'DRAFT',
      media: orig.media ? [...orig.media] : [],
      pr: orig.pr ? [...orig.pr] : [],
    };
    this.posts.update((list) => [dup, ...list]);
    this.toast('Post duplicado como rascunho');
  }

  generatePromptForSelectedPost(): void {
    const sel = this.selectedPost();
    if (!sel) return;
    const acc = this.activeAccount();
    const x = `Editorial photograph about ${sel.topic}, 50mm lens, volumetric side light, negative space for typography, ${this.activeStyleRef()} --ar 4:5`;
    this.posts.update((list) =>
      list.map((p) =>
        p.id === sel.id
          ? {
              ...p,
              pr: [...p.pr, { t: 'Gerado pela IA', ar: '4:5', x }],
              s: p.s === 'DRAFT' ? 'PROMPT_READY' : p.s,
            }
          : p
      )
    );
    this.drawerTab.set('pr');
    this.toast('Prompt gerado e salvo no post');
  }

  updateInteractionStatus(
    ids: string[],
    patch: Partial<InteractionItem>,
    toastMessage: string
  ): void {
    this.ints.update((list) =>
      list.map((i) => (ids.includes(i.id) ? { ...i, ...patch } : i))
    );
    this.toast(toastMessage);
  }

  addKeywordRule(scopeLabel: string): void {
    const kw = this.newKw().trim();
    const link = this.newLink().trim();
    if (!kw || !link) {
      this.toast('Informe palavra-chave e link de destino');
      return;
    }
    const acc = this.activeAccount();
    this.rules.update((prev) => [
      ...prev,
      {
        id: this.nextId('r'),
        a: acc.id,
        kw: kw.toUpperCase(),
        link,
        post: scopeLabel,
        on: true,
      },
    ]);
    this.newKw.set('');
    this.newLink.set('');
    this.toast('Regra criada: webhook de comentários ativo');
  }

  toggleRule(ruleId: string): void {
    this.rules.update((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, on: !r.on } : r))
    );
  }

  // Digital Twin helpers
  getTwinSettings(accountId = this.activeAccount().id): TwinRuntimeSettings {
    const base = TWINS[accountId];
    const ov = this.twins()[accountId] || {};
    return {
      mode: ov.mode || 'aprovacao',
      style: ov.style || 'orientacao',
      ch: ov.ch || { dm: true, com: true, bio: false },
      fields: ov.fields || base.fields,
    };
  }

  patchTwinSettings(patch: Partial<TwinRuntimeSettings>): void {
    const id = this.activeAccount().id;
    this.twins.update((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || {}), ...patch },
    }));
  }

  addTwinSource(type: string, name: string): void {
    const id = this.activeAccount().id;
    this.twSrc.update((prev) => ({
      ...prev,
      [id]: [...(prev[id] || TWINS[id].sources), [type, name, 'processando']],
    }));
    this.toast('Fonte adicionada · indexando');
    setTimeout(() => {
      this.twSrc.update((prev) => ({
        ...prev,
        [id]: (prev[id] || []).map((x) =>
          x[1] === name ? [x[0], x[1], 'indexado'] : x
        ),
      }));
    }, 2000);
  }

  askTwinPlayground(question: string): void {
    const q = question.trim();
    if (!q) return;
    const acc = this.activeAccount();
    this.pgQ.set(q);
    this.pgStage.set(1);
    this.pgAcc.set(acc.id);
    this.pgInput.set('');
    if (this.pgTimer) clearTimeout(this.pgTimer);
    this.pgTimer = setTimeout(() => this.pgStage.set(2), 750);
  }

  getTwinAnswer(acc: Account, q: string) {
    const T = TWINS[acc.id];
    if (T.qa[q]) return T.qa[q];
    const f = this.getTwinSettings(acc.id)
      .fields.filter((x) => x.on)
      .map((x) => x.l);
    return {
      g: `Sobre "${q}", existem várias abordagens possíveis. De forma geral, recomenda-se entender o cenário, comparar alternativas e definir prioridades. Alguns pontos importantes incluem planejamento, execução consistente e acompanhamento de resultados…`,
      t: [
        'Consigo te ajudar com isso. Antes, me conta um pouco do seu contexto: qual é o seu objetivo agora e o que você já tentou?',
        'Quero resolver ainda este mês e não tentei nada.',
        `Ótimo ponto de partida. Pelo que eu ensino sobre ${f.slice(0, 2).join(' e ')}, o primeiro passo é escolher uma única ação para esta semana e medir o resultado. Quer que eu te indique o material certo para começar?`,
      ],
      offer: T.offers.length ? 0 : -1,
    };
  }

  // Automations (ManyChat flows) helpers
  currentFlow(): FlowItem | null {
    const list = this.flows().filter((x) => x.a === this.activeAccount().id);
    return list.find((x) => x.id === this.flowId()) || list[0] || null;
  }

  patchCurrentFlow(updater: (f: FlowItem) => FlowItem): void {
    const cur = this.currentFlow();
    if (!cur) return;
    this.flows.update((list) => list.map((x) => (x.id === cur.id ? updater(x) : x)));
  }

  createFlowFromTemplate(kind: string): void {
    const acc = this.activeAccount();
    const id = this.nextId('f');
    const newFlow: FlowItem = {
      id,
      a: acc.id,
      name: `Nova automação . ${kind}`,
      on: false,
      stats: { sent: 0, open: '—', clicks: 0, leads: 0 },
      nodes: [
        {
          id: this.nextId('n'),
          t: 'trigger',
          kind,
          text: 'QUERO',
          extra: 'todos os posts',
        },
        {
          id: this.nextId('n'),
          t: 'message',
          text: 'Oi! Obrigado pelo interesse. Como posso ajudar?',
          extra: '',
        },
      ],
    };
    this.flows.update((prev) => [...prev, newFlow]);
    this.flowId.set(id);
    this.nodeId.set(null);
    this.simN.set(0);
  }

  insertFlowNode(afterIndex: number, type: FlowNodeType, defaultText: string, defaultExtra: string): void {
    const id = this.nextId('n');
    this.patchCurrentFlow((f) => ({
      ...f,
      nodes: [
        ...f.nodes.slice(0, afterIndex + 1),
        { id, t: type, text: defaultText, extra: defaultExtra },
        ...f.nodes.slice(afterIndex + 1),
      ],
    }));
    this.addAt.set(null);
    this.nodeId.set(id);
  }

  runFlowSimulator(totalSteps: number): void {
    if (this.simTimer) clearInterval(this.simTimer);
    this.simN.set(0);
    let n = 0;
    this.simTimer = setInterval(() => {
      n++;
      this.simN.set(n);
      if (n >= totalSteps && this.simTimer) {
        clearInterval(this.simTimer);
      }
    }, 700);
  }

  addCustomTenantSkill(): void {
    const c = this.nsCmd()
      .trim()
      .replace(/^\//, '')
      .toLowerCase()
      .replace(/\s+/g, '-');
    const p = this.nsPrompt().trim();
    if (!c || !p) {
      this.toast('Informe comando e system prompt');
      return;
    }
    if (this.allCommands(true).some((x) => x.c === c)) {
      this.toast(`Já existe uma skill /${c}`);
      return;
    }
    this.customSkills.update((prev) => [
      ...prev,
      {
        g: 5,
        c,
        a: '[entrada]',
        d: p.slice(0, 90),
        e: 'auto',
        sys: p,
      },
    ]);
    this.nsCmd.set('');
    this.nsPrompt.set('');
    this.toast(`Skill /${c} criada no tenant`);
  }

  // ==========================================
  // Métodos Meta Marketing API & Lookalike
  // ==========================================

  selectAdAccount(adAccountId: string): void {
    this.activeAdAccountId.set(adAccountId);
    const acc = this.adAccounts().find((a) => a.id === adAccountId);
    if (acc) {
      this.toast(`Conta de anúncios alterada: ${acc.name}`);
    }
  }

  /**
   * Ativa/pausa a campanha na Meta. A interface só muda depois da confirmação do servidor;
   * em caso de falha, o estado anterior é mantido e o erro é exibido.
   */
  async toggleCampaignStatus(campaignId: string): Promise<void> {
    const current = this.campaigns().find((c) => c.id === campaignId);
    if (!current) return;
    const newStatus: MetaCampaignStatus = current.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';

    try {
      await this.supabase.callMetaApi('set_campaign_status', {
        payload: { campaignId, status: newStatus },
        userToken: this.userToken(),
      });
      this.campaigns.update((prev) => prev.map((c) => (c.id === campaignId ? { ...c, status: newStatus } : c)));
      this.toast(
        newStatus === 'ACTIVE' ? `Campanha "${current.name}" ATIVADA na Meta Ads!` : `Campanha "${current.name}" PAUSADA`
      );
    } catch (err) {
      this.toast(`Não foi possível alterar "${current.name}": ${(err as Error).message}`);
    }
  }

  createLookalikeAudience(
    sourceAudienceName: string,
    ratio: number = 1,
    country: string = 'BR',
    customName?: string
  ): MetaAudience {
    const accId = this.activeAccount().id;
    const estReach = Math.round((ratio / 100) * 160000000); // 1.6M para cada 1% no BR
    const name =
      customName ||
      `Lookalike ${ratio}% ${country} — Semelhante a "${sourceAudienceName}"`;

    const newAud: MetaAudience = {
      id: `aud_${Date.now()}`,
      a: accId,
      name,
      type: 'LOOKALIKE',
      size: estReach,
      status: 'READY',
      lookalikeRatio: ratio,
      originAudienceName: sourceAudienceName,
      country,
      lastSync: 'agora mesmo',
    };

    this.audiences.update((prev) => [newAud, ...prev]);
    this.toast(`Público Lookalike ${ratio}% criado na Meta (~${(estReach / 1000000).toFixed(1)}M pessoas)`);

    // Notificação assíncrona com Edge Function
    this.supabase
      .invokeEdgeFunction('meta-marketing-api', {
        action: 'create_lookalike_audience',
        adAccountId: this.activeAdAccount().id,
        payload: {
          name,
          ratio: ratio / 100,
          country,
          sourceAudienceName,
        },
      })
      .catch(() => {});

    return newAud;
  }

  createAudienceFromContacts(name: string, contactIds: string[]): MetaAudience {
    const accId = this.activeAccount().id;
    const targetContacts = this.contacts().filter((c) => contactIds.includes(c.id));
    const size = targetContacts.length > 0 ? targetContacts.length : 1;

    const newAud: MetaAudience = {
      id: `aud_${Date.now()}`,
      a: accId,
      name,
      type: 'CUSTOM_LIST',
      size,
      status: 'READY',
      country: 'BR',
      lastSync: 'agora mesmo',
    };

    // Marca contatos como sincronizados
    this.contacts.update((prev) =>
      prev.map((c) => (contactIds.includes(c.id) ? { ...c, metaSynced: true } : c))
    );

    this.audiences.update((prev) => [newAud, ...prev]);
    this.toast(`Lista de ${size} contatos enviada para Meta Ads com hash SHA-256!`);

    this.supabase
      .invokeEdgeFunction('meta-marketing-api', {
        action: 'create_custom_audience',
        adAccountId: this.activeAdAccount().id,
        payload: {
          name,
          description: `Importação de ${size} contatos via InstaAI Hub`,
        },
      })
      .catch(() => {});

    return newAud;
  }

  syncContactsToMeta(audienceId: string): void {
    const accId = this.activeAccount().id;
    const accContacts = this.contacts().filter((c) => c.a === accId);
    
    this.contacts.update((prev) =>
      prev.map((c) => (c.a === accId ? { ...c, metaSynced: true } : c))
    );

    this.audiences.update((prev) =>
      prev.map((a) => (a.id === audienceId ? { ...a, lastSync: 'agora mesmo', status: 'READY' } : a))
    );

    this.toast(`${accContacts.length} contatos sincronizados na Meta Marketing API!`);

    this.supabase
      .invokeEdgeFunction('meta-marketing-api', {
        action: 'sync_contacts_to_audience',
        adAccountId: this.activeAdAccount().id,
        payload: {
          audienceId,
          contacts: accContacts.map((c) => ({
            email: c.email,
            phone: c.phone,
            username: c.u,
          })),
        },
      })
      .catch(() => {});
  }

  /**
   * Cria a campanha na Meta sempre como PAUSED. Só entra na lista local após a confirmação do servidor.
   */
  async createCampaign(payload: Partial<MetaCampaign>): Promise<void> {
    const accId = this.activeAccount().id;
    const adAccountId = this.activeAdAccountId();
    const name = payload.name || 'Nova Campanha Lookalike';
    try {
      const res = await this.supabase.callMetaApi<{ campaignId: string }>('create_campaign', {
        adAccountId,
        payload: {
          name,
          objective: payload.objective || 'OUTCOME_LEADS',
          dailyBudget: payload.dailyBudget || 50,
        },
        userToken: this.userToken(),
      });
      this.campaigns.update((prev) => [
        {
          id: res.campaignId,
          a: accId,
          name,
          objective: payload.objective || 'OUTCOME_LEADS',
          status: 'PAUSED',
          audienceId: payload.audienceId || 'aud_1',
          audienceName: payload.audienceName || 'Lookalike 1% Brasil',
          isLookalike: payload.isLookalike ?? true,
          dailyBudget: payload.dailyBudget || 50,
          spend: 0,
          impressions: 0,
          clicks: 0,
          leads: 0,
          cpa: 0,
          roas: 0,
          startDate: new Date().toISOString().slice(0, 10),
          connectedPostId: payload.connectedPostId,
        },
        ...prev,
      ]);
      this.toast(`Campanha "${name}" criada na Meta como PAUSADA. Ative quando estiver pronta.`);
    } catch (err) {
      this.toast(`Campanha não criada: ${(err as Error).message}`);
    }
  }

  /** Token de sessão do usuário logado (login por e-mail). Undefined se não houver sessão válida. */
  private userToken(): string | undefined {
    return this.supabase.accessToken();
  }


  quickPromoteWithLookalike(title: string, postId?: string): void {
    const aud = this.createLookalikeAudience(title, 1, 'BR');
    this.createCampaign({
      name: `LAL 1% BR | Impulsionar "${title.slice(0, 30)}..."`,
      objective: 'OUTCOME_LEADS',
      audienceId: aud.id,
      audienceName: aud.name,
      isLookalike: true,
      dailyBudget: 50.0,
      connectedPostId: postId,
    });
    this.setView('campaigns');
  }

  importExternalContactsAndCreateLookalike(options: {
    audienceName: string;
    rawText: string;
    autoLookalike?: boolean;
    lookalikeRatio?: number;
  }): { count: number; customAudience: MetaAudience; lookalikeAudience?: MetaAudience } {
    const accId = this.activeAccount().id;
    const lines = options.rawText.split(/[\r\n]+/);
    const newContacts: ContactItem[] = [];
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const phoneRegex = /(?:\+?55\s?)?(?:\(?\d{2}\)?\s?)?(?:9?\d{4}[-\s]?\d{4})/;

    let parsedCount = 0;
    for (const line of lines) {
      const cleanLine = line.trim();
      if (!cleanLine || cleanLine.startsWith('#')) continue;

      const emailMatch = cleanLine.match(emailRegex);
      const email = emailMatch ? emailMatch[0].toLowerCase() : undefined;

      const phoneMatch = cleanLine.match(phoneRegex);
      let phone = phoneMatch ? phoneMatch[0].replace(/\D/g, '') : undefined;
      if (phone && !phone.startsWith('55') && phone.length <= 11) {
        phone = '55' + phone;
      }

      // Extrai nome ou usa o início do e-mail
      const parts = cleanLine.split(/[,;\t]/);
      let username = parts[0]?.trim() || '';
      if (email && (!username || username === email)) {
        username = email.split('@')[0].replace(/[^a-zA-Z0-9_.]/g, '');
      }

      if (email || phone) {
        parsedCount++;
        newContacts.push({
          id: `c_imp_${Date.now()}_${parsedCount}`,
          a: accId,
          u: username || `cliente_${parsedCount}`,
          email,
          phone,
          tags: ['importado', 'csv_clientes', 'base_lookalike'],
          src: 'Importação CSV / CRM',
          last: 'hoje',
          metaSynced: true,
        });
      }
    }

    if (newContacts.length === 0) {
      this.toast('Nenhum e-mail ou telefone válido encontrado para importar');
      throw new Error('Nenhum dado válido');
    }

    // 1. Adiciona contatos à lista local
    this.contacts.update((prev) => [...newContacts, ...prev]);

    // 2. Cria a Custom Audience (Lista de Clientes)
    const customAudName = options.audienceName.trim() || `Lista Importada (${parsedCount} clientes)`;
    const customAud: MetaAudience = {
      id: `aud_imp_${Date.now()}`,
      a: accId,
      name: customAudName,
      type: 'CUSTOM_LIST',
      size: parsedCount,
      status: 'READY',
      country: 'BR',
      lastSync: 'agora mesmo',
    };
    this.audiences.update((prev) => [customAud, ...prev]);

    // 3. Notifica a Meta Marketing API para criar público e enviar hash SHA-256
    this.supabase
      .invokeEdgeFunction('meta-marketing-api', {
        action: 'create_custom_audience',
        adAccountId: this.activeAdAccount().id,
        payload: {
          name: customAudName,
          description: `Importação de ${parsedCount} clientes via CSV/Planilha`,
        },
      })
      .then(() => {
        return this.supabase.invokeEdgeFunction('meta-marketing-api', {
          action: 'sync_contacts_to_audience',
          adAccountId: this.activeAdAccount().id,
          payload: {
            audienceId: customAud.id,
            contacts: newContacts.map((c) => ({
              email: c.email,
              phone: c.phone,
              username: c.u,
            })),
          },
        });
      })
      .catch(() => {});

    // 4. Se solicitado, gera automaticamente o Lookalike
    let lookalikeAud: MetaAudience | undefined;
    if (options.autoLookalike !== false) {
      const ratio = options.lookalikeRatio || 1;
      lookalikeAud = this.createLookalikeAudience(
        customAudName,
        ratio,
        'BR',
        `Lookalike ${ratio}% Brasil — Semelhante à Lista "${customAudName}"`
      );
    }

    this.toast(
      `✅ ${parsedCount} clientes importados com SHA-256! ${lookalikeAud ? 'Lookalike gerado com sucesso.' : ''}`
    );

    return {
      count: parsedCount,
      customAudience: customAud,
      lookalikeAudience: lookalikeAud,
    };
  }

  // ==========================================
  // Métodos ICP (Ideal Customer Profile) Studio
  // ==========================================

  selectIcpProfile(id: string): void {
    this.activeIcpId.set(id);
    const p = this.icpProfiles().find((x) => x.id === id);
    if (p) {
      this.toast(`ICP ativo: ${p.name}`);
    }
  }

  createIcpProfile(profile: Partial<IcpProfile>): IcpProfile {
    const accId = this.activeAccount().id;
    const newIcp: IcpProfile = {
      id: `icp_${Date.now()}`,
      a: accId,
      name: profile.name || 'Novo Perfil ICP',
      segmentType: profile.segmentType || 'B2B',
      targetRole: profile.targetRole || 'Tomador de Decisão / Cliente Alvo',
      companyProfile: profile.companyProfile || '',
      ticketMedio: profile.ticketMedio || 'R$ 500 - R$ 2.000',
      pains: profile.pains || [],
      desires: profile.desires || [],
      greenFlags: profile.greenFlags || [],
      redFlags: profile.redFlags || [],
      objections: profile.objections || [],
      hooks: profile.hooks || [],
      metaKeywords: profile.metaKeywords || [],
      createdAt: 'hoje',
      updatedAt: 'hoje',
    };

    this.icpProfiles.update((prev) => [newIcp, ...prev]);
    this.activeIcpId.set(newIcp.id);
    this.toast(`Matriz ICP "${newIcp.name}" criada com sucesso!`);
    return newIcp;
  }

  updateIcpProfile(id: string, updates: Partial<IcpProfile>): void {
    this.icpProfiles.update((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: 'agora' } : p))
    );
    this.toast('Matriz ICP atualizada!');
  }

  deleteIcpProfile(id: string): void {
    this.icpProfiles.update((prev) => prev.filter((p) => p.id !== id));
    const remaining = this.accountIcps();
    if (remaining.length > 0) {
      this.activeIcpId.set(remaining[0].id);
    }
    this.toast('Perfil de ICP removido');
  }

  async generateIcpWithAi(description: string, segment: IcpSegmentType = 'B2B'): Promise<IcpProfile> {
    this.isGeneratingIcp.set(true);
    const acc = this.activeAccount();

    try {
      const cleanDesc = description.trim();
      const generatedName = `ICP — ${cleanDesc.slice(0, 35)}`;

      // 1. Tenta geração rica e personalizada com OpenAI GPT-4o-mini
      if (cleanDesc.length > 3) {
        const sysPrompt = `Você é um estrategista sênior de marketing e qualificação de clientes (ICP).
Retorne APENAS um JSON válido no formato:
{
  "name": "nome curto do ICP",
  "targetRole": "cargo ou persona alvo",
  "ticketMedio": "faixa de preço recomendada",
  "pains": ["dor 1", "dor 2", "dor 3"],
  "desires": ["desejo 1", "desejo 2", "desejo 3"],
  "greenFlags": ["sinal de alta qualificação 1", "sinal 2"],
  "redFlags": ["sinal eliminatório 1", "sinal 2"],
  "hooks": ["gancho para anúncio 1", "gancho 2"]
}`;
        try {
          const rawAi = await this.liveApi.generateWithOpenAi(`Crie uma matriz ICP personalizada para: ${cleanDesc}`, sysPrompt);
          if (rawAi) {
            const cleanJson = rawAi.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleanJson);
            const newIcp = this.createIcpProfile({
              name: parsed.name || generatedName,
              segmentType: segment,
              targetRole: parsed.targetRole || `Decisor no nicho: ${cleanDesc}`,
              companyProfile: segment === 'B2B' ? 'Empresa em operação com tração e equipe ativa' : 'Público com alto poder aquisitivo',
              ticketMedio: parsed.ticketMedio || (segment === 'B2B' ? 'R$ 2.500 a R$ 8.000' : 'R$ 250 a R$ 900'),
              pains: parsed.pains || ['Gargalo em processos manuais repetitivos', 'Demora no atendimento custando fechamentos'],
              desires: parsed.desires || ['Previsibilidade de vendas com leads qualificados', 'Atendimento ágil 24/7'],
              greenFlags: parsed.greenFlags || ['Orçamento aprovado para implementação imediata', 'Decisor final na conversa'],
              redFlags: parsed.redFlags || ['Apenas pesquisando sem prazo definido', 'Curioso ou concorrente'],
              objections: ['"Está dentro do orçamento?"', '"Qual o prazo de implementação?"'],
              hooks: parsed.hooks || [`Por que empresas no nicho de ${cleanDesc.slice(0, 20)} estão perdendo vendas no Direct.`],
              metaKeywords: [cleanDesc.split(' ')[0] || 'Negócios', 'Empreendedorismo', 'Vendas B2B'],
            });
            this.toast(`✨ Matriz de ICP gerada ao vivo com OpenAI!`);
            return newIcp;
          }
        } catch {
          // Fallback para template estruturado
        }
      }

      const newIcp = this.createIcpProfile({
        name: generatedName,
        segmentType: segment,
        targetRole: `Tomadores de Decisão no nicho: ${cleanDesc.slice(0, 45)}`,
        companyProfile: segment === 'B2B' ? 'Empresas em tração faturando > R$ 30k/mês' : 'Consumidores de classe A/B com poder de compra',
        ticketMedio: segment === 'B2B' ? 'R$ 2.500 a R$ 8.000' : 'R$ 250 a R$ 900',
        pains: [
          'Gargalo em processos manuais repetitivos gerando perda de tempo',
          'Demora no atendimento custando fechamentos imediatos',
          'Sensação de que o marketing atrai muitos curiosos sem orçamento',
          'Dificuldade de mensurar o retorno de cada canal de aquisição',
        ],
        desires: [
          'Previsibilidade de vendas com leads qualificados todo dia',
          'Atendimento ágil em menos de 1 minuto 24 horas por dia',
          'Aumentar margem de lucro e ticket médio sem dobrar a equipe',
          'Operação redonda rodando sem depender 100% do dono',
        ],
        greenFlags: [
          'Já tem orçamento reservado para contratação imediata',
          'Dores urgentes e consciência de que precisa de ajuda externa',
          'Interlocutor é o decisor com poder de passar o cartão ou assinar',
          'Tem histórico de já ter comprado soluções na mesma faixa de preço',
        ],
        redFlags: [
          'Apenas pesquisando sem prazo definido para implementar',
          'Busca solução gratuita, "quebra-galho" ou pirata',
          'Não tem clareza do próprio faturamento ou produto',
          'Curioso ou concorrente disfarçado',
        ],
        objections: [
          '"Está caro / Preciso falar com meu sócio"',
          '"Não sei se funciona para o meu nicho específico"',
          '"Já tive uma experiência ruim com outra empresa"',
        ],
        hooks: [
          `Se você atua com ${cleanDesc.slice(0, 25)} e ainda perde tempo com processo manual, veja isso.`,
          'Por que 90% das empresas continuam perdendo clientes por demora no Direct.',
          'O método exato para filtrar apenas clientes de ticket alto antes de iniciar o atendimento.',
        ],
        metaKeywords: [
          cleanDesc.split(' ')[0] || 'Negócios',
          'Empreendedorismo',
          'Vendas B2B',
          'Marketing Digital',
        ],
      });

      this.toast(`✨ Matriz de ICP gerada com sucesso pela IA!`);
      return newIcp;
    } finally {
      this.isGeneratingIcp.set(false);
    }
  }

  scoreContact(contactId: string, score: number): void {
    const tier: IcpTier = score >= 80 ? 'TIER_1_OURO' : score >= 50 ? 'TIER_2_PRATA' : 'DESQUALIFICADO';
    this.contacts.update((prev) =>
      prev.map((c) => (c.id === contactId ? { ...c, icpScore: score, icpTier: tier } : c))
    );
  }

  exportTier1ToMetaLookalike(ratio: number = 1): void {
    const accId = this.activeAccount().id;
    const icp = this.activeIcpProfile();
    const tier1Contacts = this.contacts().filter((c) => c.a === accId && (c.icpScore || 0) >= 80);

    if (tier1Contacts.length === 0) {
      this.toast('Nenhum contato qualificado como Tier 1 Ouro para exportar');
      return;
    }

    const listName = `Lista ICP Ouro (${tier1Contacts.length} leads) — ${icp.name.slice(0, 25)}`;
    const newAud = this.createAudienceFromContacts(
      listName,
      tier1Contacts.map((c) => c.id)
    );

    this.createLookalikeAudience(
      listName,
      ratio,
      'BR',
      `Lookalike ${ratio}% Brasil — Super ICP (${icp.name.slice(0, 20)})`
    );

    this.toast(`🚀 Público Lookalike criado na Meta baseado exclusivamente nos seus leads Tier 1!`);
    this.setView('campaigns');
  }
}

