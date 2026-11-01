import { Component, inject, computed } from '@angular/core';
import { AccountStateService } from '../../services/account-state.service';
import { AiOrchestratorService } from '../../services/ai-orchestrator.service';
import { AccountStatus } from '../../data/seed-data';

@Component({
  selector: 'app-account-switcher',
  template: `
    <div class="relative flex flex-col gap-2">
      <button
        type="button"
        class="w-full flex items-center gap-[10px] py-2 px-[10px] rounded-[6px] cursor-pointer text-left cm-hover-ov8"
        style="background: rgba(var(--ov), .05); border: 1px solid rgba(var(--ov), .09); color: var(--c-text);"
        (click)="state.switcherOpen.set(!state.switcherOpen())"
      >
        <span
          class="w-[34px] h-[34px] rounded-full flex items-center justify-center text-white shrink-0"
          style="background: linear-gradient(135deg,#5d6367,#363d3f); font: 600 13px/1 var(--font-display); box-shadow: 0 0 0 2px var(--c-panel), 0 0 0 4px #f1a10b;"
        >
          {{ active().ini }}
        </span>
        <span class="flex-1 min-w-0 flex flex-col gap-[3px]">
          <span class="font-medium truncate">@{{ active().user }}</span>
          <span class="flex items-center gap-[6px] text-[12px]" style="color: var(--c-muted);">
            <span
              class="w-2 h-2 rounded-full shrink-0"
              [style.background]="toneColor(active().st)"
            ></span>
            token {{ toneLabel(active().st).toLowerCase() }}
          </span>
        </span>
        <span class="text-[11px]" style="color: var(--c-muted);">▾</span>
      </button>

      @if (state.switcherOpen()) {
        <div
          class="
            absolute top-[calc(100%-4px)] left-0 right-0 rounded-[6px]
            p-[6px] flex flex-col gap-[2px] z-20
          "
          style="background: var(--c-pop); border: 1px solid rgba(var(--ov), .2); box-shadow: 0 3px 10px rgba(0,0,0,.4);"
        >
          @for (a of state.accounts(); track a.id) {
            <button
              type="button"
              class="flex items-center gap-[10px] py-[7px] px-2 rounded-[4px] border-0 cursor-pointer"
              [style.background]="a.id === active().id ? 'rgba(246,188,3,.14)' : 'transparent'"
              style="color: var(--c-text);"
              (click)="onPickAccount(a.id)"
            >
              <span
                class="w-[30px] h-[30px] rounded-full flex items-center justify-center text-white shrink-0"
                style="background: linear-gradient(135deg,#5d6367,#363d3f); font: 600 11px/1 var(--font-display);"
                [style.box-shadow]="
                  a.id === active().id
                    ? '0 0 0 2px var(--c-panel), 0 0 0 4px #f1a10b'
                    : 'none'
                "
              >
                {{ a.ini }}
              </span>
              <span class="flex-1 min-w-0 flex flex-col gap-[2px] text-left">
                <span class="font-medium truncate">@{{ a.user }}</span>
                <span class="flex items-center gap-[6px] text-[12px]" style="color: var(--c-muted);">
                  <span
                    class="w-2 h-2 rounded-full shrink-0"
                    [style.background]="toneColor(a.st)"
                  ></span>
                  {{ toneLabel(a.st) }}
                </span>
              </span>
              @if (state.unreadForAccount(a.id) > 0) {
                <span
                  class="min-w-[20px] h-[20px] px-[6px] rounded-full text-center"
                  style="background: #f6bc03; color: #2b2b2b; font: 600 12px/20px var(--font-display);"
                >
                  {{ state.unreadForAccount(a.id) }}
                </span>
              }
            </button>
          }

          <button
            type="button"
            class="mt-1 py-2 px-[10px] bg-transparent rounded-[4px] cursor-pointer text-[13px] text-left cm-hover-ov8"
            style="border: 1px dashed rgba(var(--ov), .28); color: var(--c-acc);"
            (click)="openAccounts()"
          >
            + nova conta de cliente
          </button>
        </div>
      }
    </div>
  `,
})
export class AccountSwitcherComponent {
  readonly state = inject(AccountStateService);
  private readonly copilot = inject(AiOrchestratorService);

  readonly active = computed(() => this.state.activeAccount());

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

  onPickAccount(accountId: string): void {
    const picked = this.state.selectAccount(accountId);
    if (picked) {
      this.copilot.pushSystemContextChange(picked.user);
    }
  }

  openAccounts(): void {
    this.state.setView('accounts');
  }
}

