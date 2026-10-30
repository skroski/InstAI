import { Component, inject } from '@angular/core';
import { AccountStateService } from '../../services/account-state.service';
import { CodemixButtonComponent } from '../codemix-button.component';
import { InteractionItem, InteractionStatus, InteractionType, Sentiment } from '../../data/seed-data';

@Component({
  selector: 'app-unified-inbox',
  imports: [CodemixButtonComponent],
  template: `
    @if (state.accountInts().length === 0) {
      <div
        class="py-[60px] px-5 text-center flex flex-col gap-[6px]"
        style="color: var(--c-muted);"
      >
        <div class="text-[18px] font-medium" style="color: var(--c-text);">
          Sem interações para @{{ state.activeAccount().user }}
        </div>
        <div>
          {{
            state.activeAccount().st === 'erro'
              ? 'Token com erro: reconecte a conta para receber webhooks.'
              : 'Nenhuma DM ou comentário recente.'
          }}
        </div>
      </div>
    } @else {
      <div
        class="grid gap-4 items-start"
        style="grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));"
      >
        <!-- Lista lateral do Inbox -->
        <div class="flex flex-col gap-[6px]">
          @for (item of state.accountInts(); track item.id) {
            <button
              type="button"
              class="flex flex-col gap-[7px] items-start py-[10px] px-3 rounded-[6px] cursor-pointer w-full text-left"
              [style.background]="
                state.currentInteraction()?.id === item.id
                  ? 'rgba(246,188,3,.1)'
                  : 'var(--c-card)'
              "
              [style.border]="
                '1px solid ' +
                (state.currentInteraction()?.id === item.id
                  ? '#f1a10b'
                  : 'rgba(var(--ov), .09)')
              "
              style="color: var(--c-text);"
              (click)="state.intId.set(item.id)"
            >
              <span class="flex items-center gap-2 w-full">
                <span
                  class="w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0"
                  style="background: linear-gradient(135deg,#5d6367,#363d3f); font: 600 9px/1 var(--font-display);"
                >
                  {{ item.u[0].toUpperCase() }}
                </span>
                <span class="font-medium">@{{ item.u }}</span>
                <span class="ml-auto text-[12px]" style="color: var(--c-dim);">
                  {{ item.time }}
                </span>
              </span>
              <span
                class="text-[13px] leading-[1.35] line-clamp-2"
                style="color: var(--c-muted);"
              >
                {{ item.c }}
              </span>
              <span
                class="flex items-center gap-2 text-[12px]"
                style="color: var(--c-muted);"
              >
                <span
                  class="uppercase py-[3px] px-[6px] rounded-[2px]"
                  style="font: 600 10.5px/1 var(--font-display); letter-spacing: .08em; background: rgba(var(--ov), .1); color: var(--c-text);"
                >
                  {{ typeLabel(item.t) }}
                </span>
                <span
                  class="w-2 h-2 rounded-full shrink-0"
                  [style.background]="statusColor(item.s)"
                ></span>
                {{ statusLabel(item.s) }}
              </span>
            </button>
          }
        </div>

        <!-- Conversa Selecionada -->
        @if (state.currentInteraction(); as cur) {
          <section
            class="rounded-[6px] p-5 flex flex-col gap-4"
            style="background: var(--c-card); border: 1px solid rgba(var(--ov), .09);"
          >
            <div class="flex items-center gap-[10px] flex-wrap">
              <span class="text-[18px] font-medium">@{{ cur.u }}</span>
              <span
                class="uppercase py-[3px] px-[6px] rounded-[2px]"
                style="font: 600 10.5px/1 var(--font-display); letter-spacing: .08em; background: rgba(var(--ov), .1);"
              >
                {{ typeLabel(cur.t) }}
              </span>
              <span class="text-[13px]" style="color: var(--c-muted);">
                sentimento:
                <span [style.color]="sentimentColor(cur.sent)">{{ cur.sent }}</span>
              </span>
              <span class="ml-auto text-[13px]" style="color: var(--c-muted);">
                {{ statusLabel(cur.s) }}
              </span>
            </div>

            @if (cur.media) {
              <div class="text-[13px]" style="color: var(--c-dim);">em: {{ cur.media }}</div>
            }

            <div
              class="py-[14px] px-4 rounded-[10px] leading-[1.55] max-w-[560px]"
              style="background: rgba(var(--ov), .06);"
            >
              {{ cur.c }}
            </div>

            <!-- Card Sugestão da IA -->
            <div
              class="rounded-[6px] p-[14px] flex flex-col gap-[10px]"
              style="border: 1px solid rgba(241,161,11,.55); background: rgba(246,188,3,.05);"
            >
              <div class="flex items-center gap-2">
                <span
                  class="uppercase"
                  style="font: 600 11px/1 var(--font-display); letter-spacing: .08em; color: var(--c-acc);"
                >
                  sugestão da ia
                </span>
                <span class="text-[12.5px]" style="color: var(--c-dim);">
                  Gemini 2.5 Flash . regras de @{{ state.activeAccount().user }}
                </span>
              </div>
              <div class="leading-[1.55]">{{ cur.ai }}</div>
              <div class="flex gap-2">
                <button
                  type="button"
                  class="h-[30px] px-[14px] rounded-[4px] cursor-pointer cm-hover-ov12"
                  style="background: rgba(var(--ov), .08); border: 1px solid rgba(var(--ov), .2); color: var(--c-text);"
                  (click)="useAiSuggestion(cur)"
                >
                  usar sugestão
                </button>
              </div>
            </div>

            <textarea
              rows="4"
              placeholder="Escreva ou use a sugestão da IA…"
              class="w-full resize-y rounded-[10px] p-3 text-[14px] leading-[1.55] cm-input-focus"
              style="background: var(--c-sunk); border: 1px solid rgba(var(--ov), .09); color: var(--c-text);"
              [value]="replyValue(cur.id)"
              (input)="onReplyInput(cur.id, $any($event.target).value)"
            ></textarea>

            <div class="flex gap-2 items-center flex-wrap">
              <cm-button
                variant="primary"
                [arrow]="true"
                (clicked)="sendReply(cur)"
              >
                {{ cur.spam ? 'ocultar comentário' : 'enviar resposta' }}
              </cm-button>
              <cm-button
                variant="dark"
                (clicked)="escalate(cur)"
              >
                escalar p/ humano
              </cm-button>
              <cm-button
                variant="ghost"
                (clicked)="archive(cur)"
              >
                arquivar
              </cm-button>
            </div>
          </section>
        }
      </div>
    }
  `,
})
export class UnifiedInboxComponent {
  readonly state = inject(AccountStateService);

  typeLabel(t: InteractionType): string {
    return t === 'DM' ? 'DM' : t === 'COMMENT' ? 'Comentário' : 'Menção';
  }

  statusLabel(s: InteractionStatus): string {
    const map: Record<InteractionStatus, string> = {
      UNREAD: 'não lida',
      AI_REPLIED: 'respondida pela ia',
      HUMAN_ESCALATED: 'escalada',
      ARCHIVED: 'arquivada',
    };
    return map[s];
  }

  statusColor(s: InteractionStatus): string {
    const map: Record<InteractionStatus, string> = {
      UNREAD: '#f6bc03',
      AI_REPLIED: 'var(--c-ok)',
      HUMAN_ESCALATED: 'var(--c-info)',
      ARCHIVED: 'var(--c-dim)',
    };
    return map[s];
  }

  sentimentColor(sent: Sentiment): string {
    return sent === 'positivo'
      ? 'var(--c-ok)'
      : sent === 'negativo'
        ? 'var(--c-err)'
        : 'var(--c-muted)';
  }

  replyValue(id: string): string {
    return this.state.replies()[id] || '';
  }

  onReplyInput(id: string, val: string): void {
    this.state.replies.update((prev) => ({ ...prev, [id]: val }));
  }

  useAiSuggestion(cur: InteractionItem): void {
    this.state.replies.update((prev) => ({
      ...prev,
      [cur.id]: cur.spam ? '' : cur.ai,
    }));
  }

  sendReply(cur: InteractionItem): void {
    this.state.updateInteractionStatus(
      [cur.id],
      { s: 'AI_REPLIED' },
      cur.spam ? 'Comentário ocultado (hide=true)' : 'Resposta enviada via Graph API'
    );
  }

  escalate(cur: InteractionItem): void {
    this.state.updateInteractionStatus(
      [cur.id],
      { s: 'HUMAN_ESCALATED' },
      'Escalado para atendimento humano'
    );
  }

  archive(cur: InteractionItem): void {
    this.state.updateInteractionStatus([cur.id], { s: 'ARCHIVED' }, 'Arquivada');
  }
}

