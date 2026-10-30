import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountStateService } from '../../services/account-state.service';
import { AiOrchestratorService, EngineChoice } from '../../services/ai-orchestrator.service';
import { SkillCommand } from '../../data/seed-data';

@Component({
  selector: 'app-ai-copilot-chat',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col h-full bg-[var(--c-panel)] border-l border-[var(--c-border)] relative">
      <!-- Top Dock Header with Mode Switcher (AI Copilot vs Atividade) -->
      <div class="p-3 border-b border-[var(--c-border)] flex flex-col gap-2.5">
        <div class="flex items-center justify-between gap-2">
          <div class="seg flex-1">
            <button
              type="button"
              class="flex-1 flex items-center justify-center gap-1.5"
              [class.active]="state.rightTab() === 'copilot'"
              (click)="state.rightTab.set('copilot')">
              <span class="w-2 h-2 rounded-full bg-[#A855F7] shadow-[0_0_8px_#A855F7]"></span>
              <span>ai copilot</span>
            </button>
            <button
              type="button"
              class="flex-1 flex items-center justify-center gap-1.5"
              [class.active]="state.rightTab() === 'activity'"
              (click)="state.rightTab.set('activity')">
              <span>atividade</span>
              @if (state.unreadDmsCount() + state.unreadCommentsCount() > 0) {
                <span class="nav-badge warn">{{ state.unreadDmsCount() + state.unreadCommentsCount() }}</span>
              }
            </button>
          </div>
          <button
            type="button"
            class="icon-btn"
            style="width: 28px; height: 28px;"
            title="Fechar painel lateral"
            (click)="closeDock.emit()">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        @if (state.rightTab() === 'copilot') {
          <div class="flex items-center justify-between gap-2">
            <div class="text-[11px] text-[var(--c-text-muted)] truncate">
              Contexto: <strong class="text-[var(--c-text)] font-mono">&#64;{{ state.activeAccount().user }}</strong>
            </div>
            <span class="text-[10.5px] text-[var(--c-text-muted)] font-mono truncate">
              {{ ai.engineNote() }}
            </span>
          </div>

          <!-- Engine Selector -->
          <div class="grid grid-cols-4 gap-1 bg-[var(--c-bg-elev)] p-1 rounded-lg border border-[var(--c-border)]">
            @for (eng of engines; track eng.id) {
              <button
                type="button"
                class="py-1 px-1.5 rounded-md text-[11px] font-medium transition-all flex items-center justify-center gap-1 cursor-pointer"
                [class.bg-[var(--c-card)]]="ai.engine() === eng.id"
                [class.text-[var(--c-text)]]="ai.engine() === eng.id"
                [class.shadow-sm]="ai.engine() === eng.id"
                [class.text-[var(--c-text-muted)]]="ai.engine() !== eng.id"
                (click)="ai.engine.set(eng.id)">
                <span class="w-1.5 h-1.5 rounded-full" [style.background]="eng.dot"></span>
                <span>{{ eng.label }}</span>
              </button>
            }
          </div>
        }
      </div>

      <!-- TAB 1: AI COPILOT CHAT + SLASH COMMAND PALETTE -->
      @if (state.rightTab() === 'copilot') {
        <div class="flex-1 overflow-y-auto p-3.5 flex flex-col gap-3">
          @for (m of ai.messages(); track m.id) {
            @if (m.role === 'sys') {
              <div class="text-center text-[11px] font-mono text-[var(--c-text-muted)] py-1 border-y border-dashed border-[var(--c-border)]">
                {{ m.text }}
              </div>
            } @else {
              <div
                class="p-3 rounded-xl text-[12.5px] leading-relaxed border transition-all"
                [class.bg-[var(--c-card)]]="m.role === 'ai'"
                [class.border-[var(--c-border)]]="m.role === 'ai'"
                [class.bg-[rgba(114,9,183,0.12)]]="m.role === 'user'"
                [class.border-[rgba(168,85,247,0.35)]]="m.role === 'user'"
                [class.ml-5]="m.role === 'user'">
                <div class="flex items-center justify-between gap-2 mb-1.5 text-[10px] font-mono text-[var(--c-text-muted)]">
                  <span class="flex items-center gap-1.5">
                    @if (m.role === 'ai') {
                      <span class="px-1.5 py-0.5 rounded bg-[#7209B7]/25 text-[#D8B4FE] uppercase font-semibold">
                        {{ m.engine || 'claude' }}
                      </span>
                      @if (m.skill) {
                        <span class="text-[#00B4D8]">{{ m.skill }}</span>
                      }
                    } @else {
                      <span class="text-[var(--c-text-2)]">você · &#64;{{ state.activeAccount().user }}</span>
                    }
                  </span>
                  @if (m.role === 'ai' && !m.done) {
                    <span class="text-[#A855F7]">gerando...</span>
                  }
                </div>

                <div class="whitespace-pre-wrap text-[var(--c-text)] font-sans">{{ m.text }}</div>

                @if (m.role === 'ai' && m.done) {
                  <div class="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-[var(--c-border)]">
                    <button
                      type="button"
                      class="text-[11px] px-2 py-0.5 rounded bg-[var(--c-surface)] hover:bg-[var(--c-surface-hover)] text-[var(--c-text-2)] transition-colors cursor-pointer"
                      (click)="state.copyText(m.full || m.text, m.id)">
                      {{ state.copied() === m.id ? 'copiado!' : 'copiar' }}
                    </button>
                    @if (m.saveable) {
                      <button
                        type="button"
                        class="text-[11px] px-2 py-0.5 rounded bg-[#00B4D8]/15 hover:bg-[#00B4D8]/25 text-[#00B4D8] transition-colors cursor-pointer"
                        (click)="ai.saveMessageAsDraft(m)">
                        salvar como rascunho
                      </button>
                    }
                  </div>
                }
              </div>
            }
          }
        </div>

        <!-- Quick Slash Chips -->
        <div class="px-3 py-2 border-t border-[var(--c-border)] flex items-center gap-1.5 overflow-x-auto">
          @for (chip of quickSkills; track chip) {
            <button
              type="button"
              class="px-2 py-0.5 rounded-full text-[11px] font-mono bg-[var(--c-card)] hover:bg-[var(--c-surface-hover)] text-[#38BDF8] border border-[var(--c-border)] whitespace-nowrap transition-colors cursor-pointer"
              (click)="ai.prefill(chip + ' ')">
              {{ chip }}
            </button>
          }
        </div>

        <!-- Composer with Floating "/" Slash Command Palette -->
        <div class="p-3 border-t border-[var(--c-border)] relative">
          @if (ai.isPaletteOpen()) {
            <div class="absolute bottom-full left-3 right-3 mb-2 max-h-64 overflow-y-auto rounded-xl bg-[var(--c-bg-elev)] border border-[var(--c-border-strong)] shadow-2xl z-30 p-1.5">
              <div class="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-[var(--c-text-muted)] flex items-center justify-between">
                <span>Catálogo de Skills ({{ ai.filteredCommands().length }})</span>
                <span>↑↓ navegar · Enter inserir</span>
              </div>
              @for (s of ai.filteredCommands(); track s.c; let idx = $index) {
                <button
                  type="button"
                  class="w-full text-left px-2.5 py-2 rounded-lg flex items-start justify-between gap-2 transition-colors cursor-pointer"
                  [class.bg-[#00B4D8]/15]="idx === ai.selIdx()"
                  [class.hover:bg-[var(--c-surface)]]="idx !== ai.selIdx()"
                  (click)="ai.pickCommand(s)">
                  <div class="min-w-0">
                    <div class="flex items-center gap-1.5">
                      <span class="font-mono text-xs font-semibold text-[#38BDF8]">/{{ s.c }}</span>
                      <span class="text-[10.5px] font-mono text-[var(--c-text-muted)] truncate">{{ s.a }}</span>
                    </div>
                    <div class="text-[11px] text-[var(--c-text-2)] truncate mt-0.5">{{ s.d }}</div>
                  </div>
                  <span
                    class="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase shrink-0"
                    [class.bg-[#F77F00]/20]="s.e === 'claude'"
                    [class.text-[#FDBA74]]="s.e === 'claude'"
                    [class.bg-[#10B981]/20]="s.e === 'codex'"
                    [class.text-[#6EE7B7]]="s.e === 'codex'"
                    [class.bg-[#38BDF8]/20]="s.e === 'gemini'"
                    [class.text-[#7DD3FC]]="s.e === 'gemini'">
                    {{ s.e }}
                  </span>
                </button>
              }
            </div>
          }

          <div class="flex flex-col gap-2 bg-[var(--c-bg-elev)] border border-[var(--c-border-strong)] rounded-xl p-2.5 focus-within:border-[#00B4D8]">
            <textarea
              rows="2"
              class="w-full bg-transparent text-xs text-[var(--c-text)] placeholder-[var(--c-text-muted)] focus:outline-none resize-none font-sans"
              placeholder="Digite / para abrir as 18 skills ou peça ao Copilot..."
              [ngModel]="ai.input()"
              (ngModelChange)="ai.onInputChange($event)"
              (keydown)="onKeyDown($event)"></textarea>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5">
                <button
                  type="button"
                  class="px-2 py-0.5 rounded text-[11px] font-mono bg-[var(--c-surface)] hover:bg-[var(--c-surface-hover)] text-[#38BDF8] cursor-pointer"
                  (click)="ai.onInputChange('/')">
                  / skills
                </button>
                <span class="text-[10px] text-[var(--c-text-muted)] font-mono truncate max-w-[150px]">
                  tom: {{ state.activeVoice().tom.split('.')[0] }}
                </span>
              </div>
              <button
                type="button"
                class="px-3 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r from-[#0077B6] to-[#00B4D8] text-[#04161C] hover:brightness-110 transition-all cursor-pointer disabled:opacity-40"
                [disabled]="!ai.input().trim()"
                (click)="ai.send()">
                enviar ↵
              </button>
            </div>
          </div>
        </div>
      } @else {
        <!-- TAB 2: ATIVIDADE DA CONTA (Pendências, Próximas Publicações, Eventos) -->
        <div class="flex-1 overflow-y-auto p-3.5 flex flex-col gap-3">
          <div class="card-p">
            <div class="card-head">
              <div>
                <div class="card-title text-xs">pendências da conta</div>
                <div class="card-sub text-[11px]">&#64;{{ state.activeAccount().user }}</div>
              </div>
              <span class="chip orange">{{ state.unreadDmsCount() + state.unreadCommentsCount() }} itens</span>
            </div>
            <div class="flex flex-col gap-2">
              <button
                type="button"
                class="w-full text-left p-2.5 rounded-lg bg-[var(--c-bg-elev)] border border-[var(--c-border)] hover:border-[#00B4D8] transition-colors flex items-center justify-between cursor-pointer"
                (click)="state.setView('inbox')">
                <div>
                  <div class="text-xs font-semibold text-[var(--c-text)]">DMs aguardando resposta</div>
                  <div class="text-[11px] text-[var(--c-text-muted)]">Sugestão de IA pronta para envio</div>
                </div>
                <span class="nav-badge warn">{{ state.unreadDmsCount() }}</span>
              </button>
              <button
                type="button"
                class="w-full text-left p-2.5 rounded-lg bg-[var(--c-bg-elev)] border border-[var(--c-border)] hover:border-[#00B4D8] transition-colors flex items-center justify-between cursor-pointer"
                (click)="state.setView('comments')">
                <div>
                  <div class="text-xs font-semibold text-[var(--c-text)]">Comentários sem resposta</div>
                  <div class="text-[11px] text-[var(--c-text-muted)]">Moderação e gatilhos de DM</div>
                </div>
                <span class="nav-badge">{{ state.unreadCommentsCount() }}</span>
              </button>
            </div>
          </div>

          <!-- Próximas publicações -->
          <div class="card-p">
            <div class="card-head">
              <div>
                <div class="card-title text-xs">próximas publicações</div>
                <div class="card-sub text-[11px]">fila da Graph API v22.0</div>
              </div>
            </div>
            <div class="flex flex-col gap-2">
              @for (post of state.accountPosts().slice(0, 4); track post.id) {
                <div class="p-2.5 rounded-lg bg-[var(--c-bg-elev)] border border-[var(--c-border)] flex items-start justify-between gap-2">
                  <div class="min-w-0">
                    <div class="flex items-center gap-1.5 mb-0.5">
                      <span class="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-[var(--c-surface)] text-[#38BDF8]">{{ post.t }}</span>
                      <span class="text-[10px] font-mono text-[var(--c-text-muted)]">{{ post.time || 'rascunho' }}</span>
                    </div>
                    <div class="text-xs font-medium text-[var(--c-text)] truncate">{{ post.topic }}</div>
                  </div>
                  <span
                    class="text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0"
                    [class.bg-[#10B981]/15]="post.s === 'PUBLISHED'"
                    [class.text-[#34D399]]="post.s === 'PUBLISHED'"
                    [class.bg-[#38BDF8]/15]="post.s === 'SCHEDULED'"
                    [class.text-[#38BDF8]]="post.s === 'SCHEDULED'"
                    [class.bg-[#A855F7]/15]="post.s === 'PROMPT_READY'"
                    [class.text-[#C084FC]]="post.s === 'PROMPT_READY'"
                    [class.bg-[var(--c-surface)]]="post.s === 'DRAFT'"
                    [class.text-[var(--c-text-muted)]]="post.s === 'DRAFT'">
                    {{ post.s }}
                  </span>
                </div>
              }
            </div>
          </div>

          <!-- Status do Token & Webhook -->
          <div class="card-p">
            <div class="card-head">
              <div class="card-title text-xs">saúde da integração Meta</div>
              <span class="w-2 h-2 rounded-full bg-[#10B981]"></span>
            </div>
            <div class="flex flex-col gap-2 text-xs">
              <div class="p-2 rounded-lg bg-[var(--c-bg-elev)] border border-[var(--c-border)]">
                <div class="font-medium text-[var(--c-text)]">Token OAuth · {{ state.activeAccount().st }}</div>
                <div class="text-[11px] text-[var(--c-text-muted)] mt-0.5">{{ state.activeAccount().days }} dias restantes · {{ state.activeAccount().perms }}/4 escopos ativos</div>
              </div>
              <div class="p-2 rounded-lg bg-[var(--c-bg-elev)] border border-[var(--c-border)]">
                <div class="font-medium text-[var(--c-text)]">Webhook X-Hub-Signature-256</div>
                <div class="text-[11px] text-[var(--c-text-muted)] mt-0.5">{{ state.activeAccount().wh ? 'Ativo e recebendo eventos em tempo real' : 'Reconexão necessária' }}</div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class AiCopilotChatComponent {
  readonly state = inject(AccountStateService);
  readonly ai = inject(AiOrchestratorService);

  readonly closeDock = output<void>();

  readonly engines: { id: EngineChoice; label: string; dot: string }[] = [
    { id: 'auto', label: 'Auto', dot: '#A855F7' },
    { id: 'claude', label: 'Claude', dot: '#F77F00' },
    { id: 'codex', label: 'Codex', dot: '#10B981' },
    { id: 'gemini', label: 'Gemini', dot: '#38BDF8' },
  ];

  readonly quickSkills = [
    '/legenda-feed',
    '/carrossel',
    '/roteiro-reels',
    '/prompt-foto',
    '/responder-dm',
    '/auditoria-perfil',
  ];

  onKeyDown(event: KeyboardEvent): void {
    if (this.ai.isPaletteOpen()) {
      const list: SkillCommand[] = this.ai.filteredCommands();
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        this.ai.selIdx.update((i) => (list.length ? (i + 1) % list.length : 0));
        return;
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        this.ai.selIdx.update((i) => (list.length ? (i - 1 + list.length) % list.length : 0));
        return;
      }
      if ((event.key === 'Enter' || event.key === 'Tab') && list.length > 0) {
        event.preventDefault();
        this.ai.pickCommand(list[this.ai.selIdx()]);
        return;
      }
      if (event.key === 'Escape') {
        this.ai.palOff.set(true);
        return;
      }
    }

    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.ai.send();
    }
  }
}
