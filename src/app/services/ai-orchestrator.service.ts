import { Injectable, inject, signal, computed } from '@angular/core';
import { AccountStateService } from './account-state.service';
import { LiveApiService } from './live-api.service';
import { Account, ENG, PostFormat, SkillCommand } from '../data/seed-data';
import { platformLinks } from '../shared/platform-links';

export type EngineChoice = 'auto' | 'claude' | 'codex' | 'gemini';

export interface CopilotMessage {
  id: string;
  role: 'sys' | 'user' | 'ai';
  text: string;
  engine?: 'claude' | 'codex' | 'gemini';
  skill?: string;
  done?: boolean;
  saveable?: boolean;
  cmd?: string;
  args?: string;
  full?: string;
}

@Injectable({ providedIn: 'root' })
export class AiOrchestratorService {
  private readonly state = inject(AccountStateService);
  private readonly liveApi = inject(LiveApiService);
  private timers: Record<string, ReturnType<typeof setInterval>> = {};

  readonly engine = signal<EngineChoice>('auto');
  readonly input = signal<string>('');
  readonly selIdx = signal<number>(0);
  readonly palOff = signal<boolean>(false);

  readonly messages = signal<CopilotMessage[]>([
    { id: 'm1', role: 'sys', text: 'sessão iniciada . contexto @amaralnatacao' },
    {
      id: 'm2',
      role: 'ai',
      text: 'Olá! Sou o copiloto do hub. Digite / para abrir as skills ou descreva o que precisa para a conta ativa.',
      engine: 'claude',
      skill: 'boas-vindas',
      done: true,
      saveable: false,
    },
  ]);

  readonly filteredCommands = computed<SkillCommand[]>(() => {
    const v = this.input();
    if (!v.startsWith('/') || /\s/.test(v)) return [];
    const q = v.slice(1).toLowerCase();
    return this.state.allCommands(false).filter((c) => c.c.includes(q));
  });

  readonly isPaletteOpen = computed<boolean>(
    () => this.filteredCommands().length > 0 && !this.palOff()
  );

  readonly engineNote = computed<string>(() => {
    const e = this.engine();
    if (e === 'auto') return 'roteamento automático por skill';
    const desc =
      e === 'claude'
        ? 'copy & estratégia'
        : e === 'codex'
          ? 'json & payloads'
          : 'contexto longo & visual';
    return `${ENG[e]} . ${desc}`;
  });

  pushSystemContextChange(username: string): void {
    this.messages.update((prev) => [
      ...prev,
      {
        id: this.state.nextId('sys'),
        role: 'sys',
        text: `contexto alterado para @${username}`,
      },
    ]);
  }

  prefill(val: string): void {
    this.input.set(val);
    this.selIdx.set(0);
    this.palOff.set(true);
    this.state.rightTab.set('copilot');
    this.state.rightOpen.set(true);
  }

  pickCommand(cmd: SkillCommand): void {
    this.input.set(`/${cmd.c} `);
    this.selIdx.set(0);
    this.palOff.set(true);
  }

  onInputChange(value: string): void {
    this.input.set(value);
    this.selIdx.set(0);
    this.palOff.set(false);
  }

  async send(): Promise<void> {
    const raw = this.input().trim();
    if (!raw) return;

    let cmd = '';
    let args = '';
    let def: SkillCommand | undefined;

    if (raw.startsWith('/')) {
      const parts = raw.slice(1).split(/\s+/);
      cmd = parts[0];
      args = parts.slice(1).join(' ');
      def = this.state.allCommands(false).find((c) => c.c === cmd);
    }

    let acc = this.state.activeAccount();
    const engChoice = this.engine();
    const usedEngine: 'claude' | 'codex' | 'gemini' =
      engChoice === 'auto'
        ? def && def.e !== 'auto'
          ? def.e
          : 'claude'
        : engChoice;

    let full = '';
    if (raw.startsWith('/') && !def) {
      full = `Skill "/${cmd}" não encontrada ou inativa. Digite / para ver o catálogo.`;
    } else if (cmd === 'conta-trocar') {
      const targetUser = args.replace('@', '').trim();
      const targetAcc = this.state.accounts().find((x) => x.user === targetUser);
      if (targetAcc) {
        this.state.selectAccount(targetAcc.id);
        acc = targetAcc;
        full = `Contexto alterado para @${targetAcc.user} (${targetAcc.name}).\nTom de voz e regras da conta foram carregados.`;
      } else {
        full = `Conta "${args || '—'}" não encontrada. Disponíveis: ${this.state
          .accounts()
          .map((a) => '@' + a.user)
          .join(', ')}.`;
      }
    } else {
      // 1. Tenta resposta rica e variada ao vivo com OpenAI GPT-4o-mini
      const v = this.state.voiceOverrides()[acc.id] || acc.voice;
      const sysPrompt = `Você é o Copiloto de IA para a conta Instagram @${acc.user} (${acc.name}). Tom de voz: ${v.tom}. Regras: ${v.regras}. Responda em português com alta qualidade estratégica e criativa.`;
      const promptToUse = def
        ? `Execute o comando /${cmd} com os parâmetros: "${args || 'tema do nicho'}". Crie conteúdo pronto e variado para Instagram.`
        : raw;

      try {
        const liveAiResponse = await this.liveApi.generateWithOpenAi(promptToUse, sysPrompt);
        if (liveAiResponse && liveAiResponse.length > 20) {
          full = liveAiResponse;
        } else {
          full = this.generateSkillOutput(cmd, args, acc);
        }
      } catch {
        full = this.generateSkillOutput(cmd, args, acc);
      }
    }

    // Side effects for moderation & keyword automation skills
    if (def && cmd === 'moderar-comentarios') {
      const scope = this.getModerationScope(acc, args);
      if (scope.length > 0) {
        const ids = scope.map((x) => x.id);
        this.state.ints.update((list) =>
          list.map((i) =>
            ids.includes(i.id)
              ? i.cat === 'spam'
                ? { ...i, s: 'ARCHIVED', hidden: true }
                : { ...i, s: 'AI_REPLIED' }
              : i
          )
        );
      }
    }

    if (def && cmd === 'automacao-gatilho' && args.trim()) {
      const trigParts = args.trim().split(/\s+/);
      this.state.rules.update((prev) => [
        ...prev,
        {
          id: this.state.nextId('r'),
          a: acc.id,
          kw: trigParts[0].toUpperCase(),
          link: trigParts[1] || '(definir destino)',
          post: 'todos os posts',
          on: true,
        },
      ]);
    }

    const uid = this.state.nextId('u');
    const mid = this.state.nextId('m');

    const userMsg: CopilotMessage = { id: uid, role: 'user', text: raw };
    const aiMsg: CopilotMessage = {
      id: mid,
      role: 'ai',
      text: '',
      engine: usedEngine,
      skill: def ? `/${cmd}` : 'chat',
      done: false,
      saveable: !!def && def.g === 1,
      cmd,
      args,
      full,
    };

    this.messages.update((prev) => [...prev, userMsg, aiMsg]);
    this.input.set('');
    this.palOff.set(false);

    let n = 0;
    this.timers[mid] = setInterval(() => {
      n += 16;
      const done = n >= full.length;
      this.messages.update((list) =>
        list.map((m) =>
          m.id === mid ? { ...m, text: full.slice(0, n), done } : m
        )
      );
      if (done) {
        clearInterval(this.timers[mid]);
      }
    }, 20);
  }

  saveMessageAsDraft(m: CopilotMessage): void {
    const formatMap: Record<string, PostFormat> = {
      'legenda-feed': 'IMAGE',
      carrossel: 'CAROUSEL',
      'roteiro-reels': 'REELS',
      'sequencia-stories': 'STORIES',
    };
    const p = {
      id: this.state.nextId('p'),
      a: this.state.activeAccount().id,
      t: formatMap[m.cmd || ''] || ('IMAGE' as PostFormat),
      s: 'DRAFT' as const,
      topic: (m.args || m.skill || 'Novo rascunho').slice(0, 70),
      cap: m.full || m.text,
      tags: [],
      pr: [],
      day: null,
      time: '',
      ai: m.engine === 'codex' ? 'Codex' : m.engine === 'gemini' ? 'Gemini' : 'Claude',
    };
    this.state.posts.update((prev) => [p, ...prev]);
    this.state.view.set('content');
    this.state.selId.set(p.id);
    this.state.drawerTab.set('cap');
    this.state.toast('Rascunho salvo em conteúdo');
  }

  private getModerationScope(acc: Account, args: string) {
    const map: Record<string, string> = {
      duvidas: 'duvida',
      elogios: 'elogio',
      spam: 'spam',
      gatilhos: 'gatilho',
    };
    const tok = args
      .toLowerCase()
      .split(/\s+/)
      .map((t) => map[t])
      .find(Boolean);
    return this.state
      .ints()
      .filter(
        (i) =>
          i.a === acc.id &&
          i.t === 'COMMENT' &&
          i.s === 'UNREAD' &&
          (!tok || i.cat === tok)
      );
  }

  private generateSkillOutput(cmd: string, args: string, acc: Account): string {
    const v = this.state.voiceOverrides()[acc.id] || acc.voice;
    const styleRef = this.state.styleOverrides()[acc.id] ?? acc.style;
    const a = args.trim();
    const u = `@${acc.user}`;
    const tema = a || 'seu tema';
    const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
    const nums = a.match(/\d+/g);

    switch (cmd) {
      case 'legenda-feed':
        return `3 variações para ${u}\ntom aplicado: ${v.tom}\n\n① AIDA\n${cap(tema)} está custando mais do que parece.\nQuando o processo roda sozinho, o time volta a pensar em produto.\nEu monto isso com agentes, n8n e Supabase, sem enrolação.\nSalve este post e comente QUERO para receber o passo a passo.\n\n② Storytelling\nSemana passada um cliente me contou que perdia 3 horas por dia com ${tema}. Hoje isso leva 4 minutos. O que mudou foi o fluxo, não a equipe. Quer ver como?\n\n③ Direta\n${cap(tema)}: o que funciona na prática. Três ajustes, zero enrolação. Link na bio.`;

      case 'carrossel': {
        const lastNum = nums ? Number(nums[nums.length - 1]) : 7;
        const n = Math.max(4, Math.min(10, lastNum || 7));
        const t = a.replace(/\s*\d+\s*$/, '') || 'seu tema';
        let o = `Carrossel de ${n} slides · ${u}\n\nSlide 1 · Gancho\n"${cap(t)}: o erro que quase todo mundo comete."\n`;
        for (let i = 2; i <= n - 2; i++) {
          o += `\nSlide ${i} · Conteúdo\nPonto ${i - 1}: ação concreta, um exemplo e um número.\n`;
        }
        o += `\nSlide ${n - 1} · Resumo salvável\nOs ${n - 3} pontos em uma lista para guardar.\n\nSlide ${n} · CTA\nSalve, compartilhe e comente QUERO para receber o material.\n\nLegenda\n${cap(t)} em ${n} slides. Salve para aplicar depois.`;
        return o;
      }

      case 'roteiro-reels':
        return `Roteiro de Reels · ${u}\nideia: ${tema}\n\ntempo | cena | fala / texto em tela\n0–3s | hook visual | "Ninguém te conta isso sobre ${tema}."\n3–15s | retenção | três erros comuns, um corte a cada 2s\n15–30s | entrega | a solução em passo único, tela do produto\nfinal | loop | volta ao hook: "Agora você sabe."\n\nLegenda\n${cap(tema)} em 30 segundos. Comente AGENTE para o checklist.`;

      case 'sequencia-stories':
        return `Sequência de 6 stories · ${u}\nobjetivo: ${a || 'engajamento'}\n\n1 · Enquete: "Você já passou por isso?"\n2 · Contexto em 1 frase, texto grande\n3 · Reação rápida (slider)\n4 · Prova: print ou bastidor\n5 · Caixinha: "Qual sua maior dúvida?"\n6 · CTA com link estratégico no último frame`;

      case 'calendario':
        return `Calendário · ${nums ? nums[0] : 7} dias · ${u}\n\nseg | Reels | topo · gancho sobre ${tema}\nter | Carrossel | meio · passo a passo\nqua | Stories | caixinha de dúvidas\nqui | Feed | meio · caso real\nsex | Reels | fundo · demo do produto\nsáb | Stories | enquete leve\ndom | Feed | topo · reflexão da semana\n\nSalve como rascunho para criar os posts DRAFT.`;

      case 'hashtags':
        return `Hashtags · ${a || 'nicho'}\n\n#produtodigital #iaparanegocios #automacao #n8n #supabase #typescript #uiux #saas #agentesdeia #desenvolvimentoweb\n\nSEO nativo: "desenvolvimento de produto digital", "automação com IA", "agentes de IA para empresas"`;

      case 'prompt-foto': {
        const arMatch = a.match(/\d+:\d+/);
        const ar = arMatch ? arMatch[0] : '4:5';
        return `Prompt de foto · ${tema}\n\nEN\nEditorial photograph of ${tema}, 50mm lens, f/2.0, volumetric side light, matte texture, balanced composition with negative space ${styleRef} --ar ${ar}\n\nPT\nFotografia editorial de ${tema}, lente 50mm, luz lateral volumétrica, textura fosca, composição com respiro.\n\nSalvo em image_prompts. Status do post: PROMPT_READY.`;
      }

      case 'prompt-carrossel':
        return `Direção de arte do carrossel\npaleta: ${styleRef.split(',')[0]}\nconsistência: mesmo fundo, margens de 8%, tipografia posterior.\n\nPágina 1 · capa com respiro à esquerda\nPáginas 2–N · composição limpa, acento único\nÚltima · campo livre para CTA`;

      case 'prompt-capa-reels':
        return `Capa 9:16 · ${tema}\n\nVertical cover, subject in lower third, empty central safe zone (4:5 feed crop) for typography, ${styleRef} --ar 9:16`;

      case 'prompt-estetico':
        return `Style Reference · ${u}\n\n${styleRef}\n\nAnexado automaticamente em toda geração de prompt desta conta.`;

      case 'responder-dm': {
        const d = this.state
          .ints()
          .find((i) => i.a === acc.id && i.t === 'DM' && i.s === 'UNREAD');
        return d
          ? `DM aberta: @${d.u}\n"${d.c}"\n\nResposta sugerida (${v.tom.split('.')[0].toLowerCase()}):\n${d.ai}\n\n${
              d.esc
                ? 'Atenção: assunto sensível. Recomendo transbordo para humano.'
                : 'Pode enviar pelo Inbox em 1 clique.'
            }`
          : `Nenhuma DM não lida carregada para ${u}. O painel ainda não importa DMs do Instagram: veja o Direct em https://www.instagram.com/direct/inbox/`;
      }

      case 'moderar-comentarios':
        return `Moderação · ${u}\n\nO painel ainda não importa comentários do Instagram, então nada foi ocultado nem respondido.\nModere direto na plataforma: https://www.instagram.com/${acc.user}/`;

      case 'automacao-gatilho':
        return `Regra não criada · ${u}\nA automação por palavra-chave não está ligada ao Instagram neste painel, então nenhuma DM será enviada.\nGatilho pedido: comentário com "${a.split(' ')[0] || 'QUERO'}" → ${a.split(' ')[1] || '(informar destino)'}`;

      case 'conta-status':
        return (
          `Status salvo no painel · tenant Codemix\n\n` +
          this.state
            .accounts()
            .map((x) => `@${x.user} · ${x.st}`)
            .join('\n') +
          `\n\nNão é uma checagem ao vivo na Meta. Use Sincronizar para confirmar a conexão de cada conta.`
        );

      case 'auditoria-perfil':
        return `Auditoria · ${u} · 30 dias\n\nO painel ainda não busca insights da Meta, então não há números para auditar.\nVeja o desempenho real em: ${platformLinks(acc).businessHome ?? `https://www.instagram.com/${acc.user}/`}`;

      case 'publicar-agora':
        return `Post ${a || '(informe o id)'} sem mídia vinculada.\nAnexe a arte final no editor do post; depois executo /media → /media_publish.`;

      case 'debug-webhook':
        return `Payload ${a || 'último'} inspecionado\n\nX-Hub-Signature-256: válida\ncampo "entry[0].messaging" ausente no evento de comentário\n\ncorreção sugerida\nSELECT * FROM ig_interactions WHERE external_id = $1;`;

      default: {
        const cu = this.state.customSkills().find((x) => x.c === cmd);
        return cu
          ? `Skill do tenant /${cmd}\n\nsystem prompt aplicado:\n${cu.sys}\n\nentrada: ${a || '—'}\ncontexto: ${u}`
          : 'Skill executada.';
      }
    }
  }
}

