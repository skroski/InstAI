import { Component, inject } from '@angular/core';
import { AccountStateService } from '../../services/account-state.service';
import { AiOrchestratorService } from '../../services/ai-orchestrator.service';
import { CodemixButtonComponent } from '../codemix-button.component';
import { Account, AccountStatus, BrandVoice } from '../../data/seed-data';

@Component({
  selector: 'app-accounts-manager',
  imports: [CodemixButtonComponent],
  template: `
    <div
      class="grid gap-5 items-start"
      style="grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));"
    >
      <section class="flex flex-col gap-[10px]">
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
                <span style="color: var(--c-text);">
                  {{ a.st === 'erro' ? 'inválido' : a.days + ' de 60 dias' }}
                </span>
              </div>
              <div class="flex flex-col gap-[6px]">
                <span>permissões</span>
                <span class="mt-3" style="color: var(--c-text);">
                  {{ a.perms }}/4 concedidas
                </span>
              </div>
              <div class="flex flex-col gap-[6px]">
                <span>webhook</span>
                <span
                  class="mt-3"
                  [style.color]="a.wh ? 'var(--c-ok)' : 'var(--c-err)'"
                >
                  {{ a.wh ? 'ativo' : 'falha na assinatura' }}
                </span>
              </div>
            </div>

            @if (a.st !== 'ativo') {
              <div class="text-[13px]" style="color: var(--c-acc);">
                {{
                  a.st === 'erro'
                    ? 'Token inválido e permissões ausentes.'
                    : 'Token expira em ' + a.days + ' dias.'
                }}
                <button
                  type="button"
                  class="bg-transparent border-0 cursor-pointer underline text-[13px] p-0 ml-1"
                  style="color: var(--c-link);"
                  (click)="state.toast('Redirecionando para o OAuth da Meta…')"
                >
                  reconectar via oauth »
                </button>
              </div>
            }
          </div>
        }

        <button
          type="button"
          class="h-[44px] bg-transparent rounded-[6px] cursor-pointer text-[14px] cm-hover-ov8"
          style="border: 1px dashed rgba(var(--ov), .28); color: var(--c-acc);"
          (click)="state.toast('Redirecionando para o OAuth da Meta…')"
        >
          + conectar nova conta do Instagram
        </button>

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

        <cm-button
          variant="primary"
          [arrow]="true"
          (clicked)="state.toast('Tom de voz salvo em brand_voice_guidelines')"
        >
          salvar tom de voz
        </cm-button>
      </section>
    </div>
  `,
})
export class AccountsManagerComponent {
  readonly state = inject(AccountStateService);
  readonly copilot = inject(AiOrchestratorService);

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

  toneLabel(st: AccountStatus): string {
    return st === 'ativo' ? 'Ativo' : st === 'expirando' ? 'Expirando' : 'Erro';
  }

  toneColor(st: AccountStatus): string {
    return st === 'ativo'
      ? 'var(--c-ok)'
      : st === 'expirando'
        ? '#f1a10b'
        : 'var(--c-err)';
  }

  tokenWidthPct(a: Account): number {
    return Math.round((a.days / 60) * 100);
  }

  updateVoice(field: keyof BrandVoice, value: string): void {
    const accId = this.state.activeAccount().id;
    const current = this.state.activeVoice();
    this.state.voiceOverrides.update((prev) => ({
      ...prev,
      [accId]: { ...current, [field]: value },
    }));
  }
}

