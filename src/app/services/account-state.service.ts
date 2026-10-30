import { Injectable, inject, signal, computed, resource } from '@angular/core';
import { SupabaseService } from './supabase.service';
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
  PostFormat,
  PostItem,
  PostStatus,
  SkillCommand,
  TwinField,
} from '../data/seed-data';

export type WorkspaceView =
  | 'overview'
  | 'content'
  | 'comments'
  | 'inbox'
  | 'twin'
  | 'automations'
  | 'audience'
  | 'prompts'
  | 'analytics'
  | 'accounts'
  | 'skills';

export type ContentMode = 'kanban' | 'calendar';
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
  private seq = 20;
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
        const res = await fetch('/.ai-skills/registry.json');
        if (!res.ok) return null;
        return await res.json();
      } catch {
        return null;
      }
    },
  });

  // Layout & Theme Signals
  readonly theme = signal<ThemeMode>('dark');
  readonly view = signal<WorkspaceView>('overview');
  readonly contentMode = signal<ContentMode>('kanban');
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
  readonly drawerTab = signal<'cap' | 'pr'>('cap');
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
    this.view.set(v);
    this.switcherOpen.set(false);
    if (this.isNarrow()) {
      this.leftCompact.set(true);
    }
  }

  openComposer(): void {
    const acc = this.activeAccount();
    this.comp.set({
      accs: [acc.id],
      t: 'IMAGE',
      topic: '',
      cap: '',
      tags: '',
      pr: '',
      day: 5,
      time: '18:00',
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
}

