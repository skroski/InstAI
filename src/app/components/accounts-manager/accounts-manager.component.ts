import { Component, computed, inject, signal } from '@angular/core';
import { AccountDraft, AccountStateService } from '../../services/account-state.service';
import { AiOrchestratorService } from '../../services/ai-orchestrator.service';
import { CodemixButtonComponent } from '../codemix-button.component';
import { LoginPanelComponent } from '../login-panel/login-panel.component';
import { Account, AccountStatus, BrandVoice } from '../../data/seed-data';

const blankDraft = (): AccountDraft => ({
  name: '',
  user: '',
  pageId: '',
  adAccountId: '',
  voice: { tom: '', pub: '', regras: '' },
  style: '',
});

@Component({
  selector: 'app-accounts-manager',
  imports: [CodemixButtonComponent, LoginPanelComponent],
  template: `
    <div
      class="grid gap-5 items-start"
      style="grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));"
    >
      <section class="flex flex-col gap-[10px]">
        <app-login-panel />

        @if (formFor() !== null) {
          <section
            class="rounded-[6px] p-4 flex flex-col gap-3"
            style="background: var(--c-card); border: 1px solid rgba(246,188,3,.5);"
          >
            <div class="text-[17px]">
              <span class="font-medium">
                {{ formFor() === 'new' ? 'nova conta de cliente' : 'editar cliente' }}
              </span>
            </div>

            <div
              class="grid gap-3"
              style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));"
            >
              <label class="flex flex-col gap-[6px]">
                <span
                  class="uppercase"
                  style="font: 600 11px/1 var(--font-display); letter-spacing: .08em; color: var(--c-dim);"
                >
                  nome do cliente
                </span>
                <input
                  type="text"
                  maxlength="60"
                  class="w-full rounded-[10px] py-[10px] px-3 text-[14px] cm-input-focus"
                  style="background: var(--c-sunk); border: 1px solid rgba(var(--ov), .09); color: var(--c-text);"
                  [value]="draft().name"
                  (input)="setField('name', $any($event.target).value)"
                />
              </label>

              <label class="flex flex-col gap-[6px]">
                <span
                  class="uppercase"
                  style="font: 600 11px/1 var(--font-display); letter-spacing: .08em; color: var(--c-dim);"
                >
                  @usuário do instagram
                </span>
                <input
                  type="text"
                  class="w-full rounded-[10px] py-[10px] px-3 text-[14px] cm-input-focus"
                  style="background: var(--c-sunk); border: 1px solid rgba(var(--ov), .09); color: var(--c-text);"
                  placeholder="@usuario"
                  [value]="draft().user"
                  (input)="setField('user', $any($event.target).value)"
                />
              </label>

              <label class="flex flex-col gap-[6px]">
                <span
                  class="uppercase"
                  style="font: 600 11px/1 var(--font-display); letter-spacing: .08em; color: var(--c-dim);"
                >
                  id da página do facebook
                </span>
                <input
                  type="text"
                  inputmode="numeric"
                  class="w-full rounded-[10px] py-[10px] px-3 text-[14px] cm-input-focus"
                  style="background: var(--c-sunk); border: 1px solid rgba(var(--ov), .09); color: var(--c-text);"
                  placeholder="opcional"
                  [value]="draft().pageId"
                  (input)="setField('pageId', $any($event.target).value)"
                />
              </label>

              <label class="flex flex-col gap-[6px]">
                <span
                  class="uppercase"
                  style="font: 600 11px/1 var(--font-display); letter-spacing: .08em; color: var(--c-dim);"
                >
                  conta de anúncios
                </span>
                <select
                  class="w-full rounded-[10px] py-[10px] px-3 text-[14px] cm-input-focus"
                  style="background: var(--c-sunk); border: 1px solid rgba(var(--ov), .09); color: var(--c-text);"
                  (change)="setField('adAccountId', $any($event.target).value)"
                >
                  <option value="" [selected]="draft().adAccountId === ''">sem conta de anúncios</option>
                  @for (ad of adOptions(); track ad.id) {
                    <option [value]="ad.id" [selected]="ad.id === draft().adAccountId">
                      {{ ad.name }} ({{ ad.id }})
                    </option>
                  }
                </select>
              </label>
            </div>

            <label class="flex flex-col gap-[6px]">
              <span
                class="uppercase"
                style="font: 600 11px/1 var(--font-display); letter-spacing: .08em; color: var(--c-dim);"
              >
                tom
              </span>
              <textarea
                rows="2"
                class="w-full resize-y rounded-[10px] py-[10px] px-3 text-[14px] cm-input-focus"
                style="background: var(--c-sunk); border: 1px solid rgba(var(--ov), .09); color: var(--c-text);"
                [value]="draft().voice.tom"
                (input)="setVoice('tom', $any($event.target).value)"
              ></textarea>
            </label>

            <label class="flex flex-col gap-[6px]">
              <span
                class="uppercase"
                style="font: 600 11px/1 var(--font-display); letter-spacing: .08em; color: var(--c-dim);"
              >
                público
              </span>
              <textarea
                rows="2"
                class="w-full resize-y rounded-[10px] py-[10px] px-3 text-[14px] cm-input-focus"
                style="background: var(--c-sunk); border: 1px solid rgba(var(--ov), .09); color: var(--c-text);"
                [value]="draft().voice.pub"
                (input)="setVoice('pub', $any($event.target).value)"
              ></textarea>
            </label>

            <label class="flex flex-col gap-[6px]">
              <span
                class="uppercase"
                style="font: 600 11px/1 var(--font-display); letter-spacing: .08em; color: var(--c-dim);"
              >
                regras
              </span>
              <textarea
                rows="2"
                class="w-full resize-y rounded-[10px] py-[10px] px-3 text-[14px] cm-input-focus"
                style="background: var(--c-sunk); border: 1px solid rgba(var(--ov), .09); color: var(--c-text);"
                [value]="draft().voice.regras"
                (input)="setVoice('regras', $any($event.target).value)"
              ></textarea>
            </label>

            <label class="flex flex-col gap-[6px]">
              <span
                class="uppercase"
                style="font: 600 11px/1 var(--font-display); letter-spacing: .08em; color: var(--c-dim);"
              >
                estilo visual
              </span>
              <textarea
                rows="2"
                class="w-full resize-y rounded-[10px] py-[10px] px-3 text-[14px] cm-input-focus"
                style="background: var(--c-sunk); border: 1px solid rgba(var(--ov), .09); color: var(--c-text);"
                [value]="draft().style"
                (input)="setField('style', $any($event.target).value)"
              ></textarea>
            </label>

            @if (formError()) {
              <div class="text-[13px]" style="color: var(--c-err);">{{ formError() }}</div>
            }

            <div class="flex items-center gap-3">
              <cm-button variant="primary" [arrow]="true" (clicked)="save()">
                {{ formFor() === 'new' ? 'cadastrar cliente' : 'salvar alterações' }}
              </cm-button>
              <button
                type="button"
                class="h-[36px] px-3 bg-transparent rounded-[4px] cursor-pointer text-[13px] cm-hover-ov8"
                style="border: 1px solid rgba(var(--ov), .18); color: var(--c-text);"
                (click)="closeForm()"
              >
                cancelar
              </button>
            </div>
          </section>
        }

        @for (a of state.accounts(); track a.id) {
          <div
            class="rounded-[6px] p-4 flex flex-col gap-[14px]"
            style="background: var(--c-card);"
            [style.border]="
              '1px solid ' +
              (a.id === state.activeAccount().id
                ? 'rgba(246,188,3,.5)'
                : 'rgba(var(--ov), .09)')
            "
          >
            <div class="flex flex-wrap items-center gap-3">
              <span
                class="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0"
                style="background: linear-gradient(135deg,#5d6367,#363d3f); font: 600 15px/1 var(--font-display);"
                [style.box-shadow]="
                  a.id === state.activeAccount().id
                    ? '0 0 0 2px var(--c-panel), 0 0 0 4px #f1a10b'
                    : 'none'
                "
              >
                {{ a.ini }}
              </span>
              <div class="flex-1 min-w-0">
                <div class="font-medium text-[15px]">@{{ a.user }}</div>
                <div class="text-[13px]" style="color: var(--c-muted);">{{ a.name }}</div>
              </div>
              <span class="flex items-center gap-[6px] text-[13px]">
                <span
                  class="w-2 h-2 rounded-full shrink-0"
                  [style.background]="toneColor(a.st)"
                ></span>
                {{ toneLabel(a.st) }}
              </span>
              <button
                type="button"
                class="h-7 px-3 rounded-[4px] cursor-pointer text-[13px]"
                [style.background]="
                  a.id === state.activeAccount().id
                    ? 'rgba(246,188,3,.16)'
                    : 'rgba(var(--ov), .06)'
                "
                [style.border]="
                  '1px solid ' +
                  (a.id === state.activeAccount().id
                    ? '#f1a10b'
                    : 'rgba(var(--ov), .18)')
                "
                [style.color]="
                  a.id === state.activeAccount().id
                    ? 'var(--c-acc)'
                    : 'var(--c-text)'
                "
                (click)="state.selectAccount(a.id)"
              >
                {{ a.id === state.activeAccount().id ? 'ativa' : 'usar contexto' }}
              </button>
            </div>

            <div class="flex flex-wrap items-center gap-4 text-[13px]">
              <button
                type="button"
                class="bg-transparent border-0 cursor-pointer underline text-[13px] p-0"
                style="color: var(--c-link);"
                (click)="openEdit(a)"
              >
                editar
              </button>
              @if (confirmRemoveId() === a.id) {
                <span style="color: var(--c-muted);">remover @{{ a.user }} do painel?</span>
                <button
                  type="button"
                  class="bg-transparent border-0 cursor-pointer underline text-[13px] p-0"
                  style="color: var(--c-err);"
                  (click)="remove(a)"
                >
                  confirmar
                </button>
                <button
                  type="button"
                  class="bg-transparent border-0 cursor-pointer underline text-[13px] p-0"
                  style="color: var(--c-muted);"
                  (click)="confirmRemoveId.set(null)"
                >
                  cancelar
                </button>
              } @else {
                <button
                  type="button"
                  class="bg-transparent border-0 cursor-pointer underline text-[13px] p-0 disabled:opacity-40 disabled:cursor-not-allowed"
                  style="color: var(--c-err);"
                  [disabled]="state.accounts().length <= 1"
                  [title]="state.accounts().length <= 1 ? 'Mantenha pelo menos um cliente cadastrado' : ''"
                  (click)="confirmRemoveId.set(a.id)"
                >
                  remover
                </button>
              }
            </div>

            <div
              class="grid gap-[14px] text-[13px]"
              style="grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); color: var(--c-muted);"
            >
              <div class="flex flex-col gap-[6px]">
                <span>long-lived token</span>
                <span
                  class="h-[6px] rounded-[2px] overflow-hidden block"
                  style="background: rgba(var(--ov), .1);"
                >
                  <span
                    class="block h-full"
                    [style.width.%]="tokenWidthPct(a)"
                    [style.background]="toneColor(a.st)"
                  ></span>
                </span>
                <span style="color: var(--c-text);">{{ tokenLabel(a) }}</span>
              </div>
              <div class="flex flex-col gap-[6px]">
                <span>permissões</span>
                <span class="mt-3" style="color: var(--c-text);">
                  {{ a.perms }}/4 concedidas
                </span>
              </div>
              <div class="flex flex-col gap-[6px]">
                <span>webhook</span>
                <span class="mt-3" [style.color]="webhookColor(a)">
                  {{ webhookLabel(a) }}
                </span>
              </div>
            </div>

            @if (a.st !== 'ativo') {
              <div class="text-[13px]" style="color: var(--c-acc);">
                {{ statusNote(a) }}
                <button
                  type="button"
                  class="bg-transparent border-0 cursor-pointer underline text-[13px] p-0 ml-1"
                  style="color: var(--c-link);"
                  (click)="connectViaOAuth()"
                >
                  {{ a.st === 'pendente' ? 'conectar via oauth »' : 'reconectar via oauth »' }}
                </button>
              </div>
            }
          </div>
        }

        @if (formFor() === null) {
          <button
            type="button"
            class="h-[44px] bg-transparent rounded-[6px] cursor-pointer text-[14px] cm-hover-ov8"
            style="border: 1px dashed rgba(var(--ov), .28); color: var(--c-acc);"
            (click)="openCreate()"
          >
            + nova conta de cliente
          </button>
        }

        <section
          class="rounded-[6px] p-4 flex flex-col gap-[10px]"
          style="background: var(--c-card); border: 1px solid rgba(var(--ov), .09);"
        >
          <div class="flex items-center">
            <div class="text-[17px]">
              <span class="font-medium">webhook</span>
              <span class="font-light" style="color: var(--c-muted);"> . eventos recentes</span>
            </div>
            <button
              type="button"
              class="ml-auto bg-transparent border-0 text-[13px] cursor-pointer"
              style="color: var(--c-link);"
              (click)="copilot.prefill('/debug-webhook ')"
            >
              /debug-webhook »
            </button>
          </div>
          @if (state.activeAccount().st === 'pendente') {
            <div class="text-[13px]" style="color: var(--c-muted);">
              Sem eventos: esta conta ainda não tem token da Meta.
            </div>
          } @else {
            @for (ev of webhookEvents; track ev.time + ev.ev) {
              <div
                class="flex items-center gap-[10px] text-[13px] py-[6px]"
                style="border-top: 1px solid rgba(var(--ov), .08);"
              >
                <span
                  class="w-2 h-2 rounded-full shrink-0"
                  [style.background]="ev.ok ? 'var(--c-ok)' : 'var(--c-err)'"
                ></span>
                <span style="font-family: var(--font-mono); color: var(--c-dim);">
                  {{ ev.time }}
                </span>
                <span class="min-w-[150px]">{{ ev.ev }}</span>
                <span style="color: var(--c-muted);">{{ ev.note }}</span>
              </div>
            }
          }
        </section>
      </section>

      <!-- Tom de Voz da Conta Ativa -->
      <section
        class="rounded-[6px] p-4 flex flex-col gap-3 sticky top-0"
        style="background: var(--c-card); border: 1px solid rgba(var(--ov), .09);"
      >
        <div class="text-[17px]">
          <span class="font-medium">tom de voz</span>
          <span class="font-light" style="color: var(--c-muted);">
            . @{{ state.activeAccount().user }}
          </span>
        </div>
        <div class="text-[13px]" style="color: var(--c-muted);">
          brand_voice_guidelines — injetado no topo de toda chamada do copiloto.
        </div>

        <label
          class="uppercase"
          style="font: 600 11px/1 var(--font-display); letter-spacing: .08em; color: var(--c-dim);"
        >
          tom
        </label>
        <textarea
          rows="2"
          class="w-full resize-y rounded-[10px] py-[10px] px-3 text-[14px] cm-input-focus"
          style="background: var(--c-sunk); border: 1px solid rgba(var(--ov), .09); color: var(--c-text);"
          [value]="state.activeVoice().tom"
          (input)="updateVoice('tom', $any($event.target).value)"
        ></textarea>

        <label
          class="uppercase"
          style="font: 600 11px/1 var(--font-display); letter-spacing: .08em; color: var(--c-dim);"
        >
          público
        </label>
        <textarea
          rows="2"
          class="w-full resize-y rounded-[10px] py-[10px] px-3 text-[14px] cm-input-focus"
          style="background: var(--c-sunk); border: 1px solid rgba(var(--ov), .09); color: var(--c-text);"
          [value]="state.activeVoice().pub"
          (input)="updateVoice('pub', $any($event.target).value)"
        ></textarea>

        <label
          class="uppercase"
          style="font: 600 11px/1 var(--font-display); letter-spacing: .08em; color: var(--c-dim);"
        >
          regras
        </label>
        <textarea
          rows="3"
          class="w-full resize-y rounded-[10px] py-[10px] px-3 text-[14px] cm-input-focus"
          style="background: var(--c-sunk); border: 1px solid rgba(var(--ov), .09); color: var(--c-text);"
          [value]="state.activeVoice().regras"
          (input)="updateVoice('regras', $any($event.target).value)"
        ></textarea>

        <div class="text-[12px]" style="color: var(--c-muted);">
          Salvo automaticamente neste navegador.
        </div>
      </section>
    </div>
  `,
})
export class AccountsManagerComponent {
  readonly state = inject(AccountStateService);
  readonly copilot = inject(AiOrchestratorService);

  readonly draft = signal<AccountDraft>(blankDraft());
  /** 'new' ao cadastrar, id da conta ao editar, null com o formulário fechado. */
  readonly formFor = signal<string | null>(null);
  readonly formError = signal('');
  readonly confirmRemoveId = signal<string | null>(null);

  /** Contas de anúncios que o formulário pode escolher: as livres ou as do próprio cliente. */
  readonly adOptions = computed(() => {
    const editing = this.formFor();
    return this.state.adAccounts().filter((ad) => !ad.a || ad.a === editing);
  });

  readonly webhookEvents = [
    { time: '10:03', ev: 'messages . DM', ok: true, note: '200 . 84 ms' },
    { time: '09:30', ev: 'comments . COMMENT', ok: true, note: '200 . 61 ms' },
    {
      time: '08:12',
      ev: 'comments . COMMENT',
      ok: false,
      note: '401 . assinatura X-Hub-Signature-256 inválida',
    },
    { time: '07:55', ev: 'mentions . STORY_MENTION', ok: true, note: '200 . 72 ms' },
  ];

  openCreate(): void {
    this.draft.set(blankDraft());
    this.formError.set('');
    this.formFor.set('new');
  }

  openEdit(a: Account): void {
    this.draft.set({
      name: a.name,
      user: a.user,
      pageId: a.pageId ?? '',
      adAccountId: a.adAccountId ?? '',
      voice: { ...a.voice },
      style: a.style,
    });
    this.formError.set('');
    this.formFor.set(a.id);
  }

  closeForm(): void {
    this.formFor.set(null);
    this.formError.set('');
  }

  setField(field: 'name' | 'user' | 'pageId' | 'adAccountId' | 'style', value: string): void {
    this.draft.update((d) => ({ ...d, [field]: value }));
  }

  setVoice(field: keyof BrandVoice, value: string): void {
    this.draft.update((d) => ({ ...d, voice: { ...d.voice, [field]: value } }));
  }

  save(): void {
    const editing = this.formFor();
    try {
      if (editing === 'new') {
        const acc = this.state.addAccount(this.draft());
        this.copilot.pushSystemContextChange(acc.user);
      } else if (editing) {
        const acc = this.state.updateAccount(editing, this.draft());
        this.state.toast(`Cliente "${acc.name}" atualizado`);
      }
      this.closeForm();
    } catch (err) {
      this.formError.set((err as Error).message);
    }
  }

  remove(a: Account): void {
    const wasActive = a.id === this.state.activeAccount().id;
    try {
      this.state.removeAccount(a.id);
      this.confirmRemoveId.set(null);
      if (wasActive) this.copilot.pushSystemContextChange(this.state.activeAccount().user);
    } catch (err) {
      this.state.toast((err as Error).message);
    }
  }

  connectViaOAuth(): void {
    void this.state.connectMetaAccount();
  }

  toneLabel(st: AccountStatus): string {
    return st === 'ativo'
      ? 'Ativo'
      : st === 'expirando'
        ? 'Expirando'
        : st === 'pendente'
          ? 'Pendente'
          : 'Erro';
  }

  toneColor(st: AccountStatus): string {
    return st === 'ativo'
      ? 'var(--c-ok)'
      : st === 'expirando'
        ? '#f1a10b'
        : st === 'pendente'
          ? 'var(--c-muted)'
          : 'var(--c-err)';
  }

  tokenWidthPct(a: Account): number {
    return Math.round((a.days / 60) * 100);
  }

  tokenLabel(a: Account): string {
    if (a.st === 'pendente') return 'sem token';
    if (a.st === 'erro') return 'inválido';
    return `${a.days} de 60 dias`;
  }

  webhookLabel(a: Account): string {
    if (a.st === 'pendente') return 'não configurado';
    return a.wh ? 'ativo' : 'falha na assinatura';
  }

  webhookColor(a: Account): string {
    if (a.st === 'pendente') return 'var(--c-muted)';
    return a.wh ? 'var(--c-ok)' : 'var(--c-err)';
  }

  statusNote(a: Account): string {
    if (a.st === 'pendente') {
      return 'Cadastrado, mas sem token da Meta. Conecte a conta para publicar e ler a caixa de entrada.';
    }
    if (a.st === 'erro') return 'Token inválido e permissões ausentes.';
    return `Token expira em ${a.days} dias.`;
  }

  updateVoice(field: keyof BrandVoice, value: string): void {
    const acc = this.state.activeAccount();
    this.state.patchAccount(acc.id, { voice: { ...acc.voice, [field]: value } });
  }
}
