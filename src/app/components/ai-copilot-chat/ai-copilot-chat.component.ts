import { Component, ElementRef, effect, inject, output, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountStateService } from '../../services/account-state.service';
import { AiOrchestratorService, EngineChoice } from '../../services/ai-orchestrator.service';
import { SkillCommand } from '../../data/seed-data';

@Component({
  selector: 'app-ai-copilot-chat',
  imports: [CommonModule, FormsModule],
  template: `
    <section class="copilot" aria-label="Painel lateral do copiloto">
      <!-- CABEÇALHO FIXO: abas, contexto e motor -->
      <header class="copilot-head">
        <div class="flex items-center gap-2">
          <div class="seg flex-1" role="tablist" aria-label="Seções do painel">
            <button
              type="button"
              role="tab"
              class="flex-1 flex items-center justify-center gap-1.5"
              [attr.aria-selected]="state.rightTab() === 'copilot'"
              [class.active]="state.rightTab() === 'copilot'"
              (click)="state.rightTab.set('copilot')">
              <span class="w-2 h-2 rounded-full bg-[#f6bc03]" aria-hidden="true"></span>
              <span>ai copilot</span>
            </button>
            <button
              type="button"
              role="tab"
              class="flex-1 flex items-center justify-center gap-1.5"
              [attr.aria-selected]="state.rightTab() === 'activity'"
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
            class="close-btn"
            aria-label="Fechar painel lateral"
            title="Fechar painel lateral"
            (click)="closeDock.emit()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        @if (state.rightTab() === 'copilot') {
          <div class="ctx-row">
            <span class="ctx-avatar" aria-hidden="true">{{ state.activeAccount().ini }}</span>
            <div class="min-w-0 flex-1">
              <div class="ctx-label">contexto</div>
              <div class="ctx-user">&#64;{{ state.activeAccount().user }}</div>
            </div>
            <span class="ctx-engine-note" [title]="ai.engineNote()">{{ ai.engineNote() }}</span>
          </div>

          <div class="engine-grid" role="radiogroup" aria-label="Motor de IA">
            @for (eng of engines; track eng.id) {
              <button
                type="button"
                role="radio"
                class="engine-btn"
                [class.active]="ai.engine() === eng.id"
                [attr.aria-checked]="ai.engine() === eng.id"
                (click)="ai.engine.set(eng.id)">
                <span
                  class="engine-dot"
                  [style.background]="ai.engine() === eng.id ? '#2b2b2b' : eng.dot"
                  aria-hidden="true"></span>
                <span>{{ eng.label }}</span>
              </button>
            }
          </div>
        }
      </header>

      @if (state.rightTab() === 'copilot') {
        <!-- ÁREA DE CONVERSA: única região com rolagem; cresce entre o cabeçalho e o compositor -->
        <div class="thread-wrap">
          <div
            #thread
            class="thread"
            role="log"
            aria-live="polite"
            aria-label="Conversa com o copiloto"
            (scroll)="onThreadScroll($event)">
            @for (m of ai.messages(); track m.id) {
              @if (m.role === 'sys') {
                <div class="sys-line">{{ m.text }}</div>
              } @else if (m.role === 'user') {
                <div class="msg msg-user">
                  <span class="msg-meta">você · &#64;{{ state.activeAccount().user }}</span>
                  <div class="bubble bubble-user">{{ m.text }}</div>
                </div>
              } @else {
                <div class="msg msg-ai">
                  <div class="msg-meta">
                    <span class="engine-tag">{{ m.engine || 'claude' }}</span>
                    @if (m.skill) {
                      <span class="skill-tag">{{ m.skill }}</span>
                    }
                    @if (!m.done) {
                      <span class="msg-live">gerando</span>
                    }
                  </div>

                  <div class="bubble bubble-ai">
                    @if (!m.done && !m.text) {
                      <span class="typing" role="status">
                        <span class="sr-only">Copiloto está respondendo</span>
                        <i></i><i></i><i></i>
                      </span>
                    } @else {
                      <div class="whitespace-pre-wrap">{{ m.text }}</div>
                    }

                    @if (m.done) {
                      <div class="msg-actions">
                        <button type="button" class="mini-btn" (click)="state.copyText(m.full || m.text, m.id)">
                          {{ state.copied() === m.id ? 'copiado!' : 'copiar' }}
                        </button>
                        @if (m.saveable) {
                          <button type="button" class="mini-btn mini-btn-acc" (click)="ai.saveMessageAsDraft(m)">
                            salvar como rascunho
                          </button>
                        }
                      </div>
                    }
                  </div>
                </div>
              }
            }
          </div>

          @if (showJump()) {
            <button type="button" class="jump-btn" (click)="jumpToLatest()">↓ ir para o fim</button>
          }
        </div>

        <!-- Atalhos de skills: rolagem horizontal própria, sem quebrar o layout -->
        <div class="chips" aria-label="Atalhos de skills">
          @for (chip of quickSkills; track chip) {
            <button type="button" class="skill-chip" (click)="ai.prefill(chip + ' ')">{{ chip }}</button>
          }
        </div>

        <!-- COMPOSITOR FIXO com paleta flutuante de skills acima -->
        <footer class="composer">
          @if (ai.isPaletteOpen()) {
            <div class="palette" role="listbox" aria-label="Catálogo de skills">
              <div class="palette-head">
                <span>Catálogo de Skills ({{ ai.filteredCommands().length }})</span>
                <span>↑↓ navegar · Enter inserir</span>
              </div>
              @for (s of ai.filteredCommands(); track s.c; let idx = $index) {
                <button
                  type="button"
                  role="option"
                  class="palette-item"
                  [class.is-sel]="idx === ai.selIdx()"
                  [attr.aria-selected]="idx === ai.selIdx()"
                  (click)="ai.pickCommand(s)">
                  <div class="min-w-0">
                    <div class="flex items-center gap-1.5 min-w-0">
                      <span class="palette-cmd">/{{ s.c }}</span>
                      <span class="palette-arg">{{ s.a }}</span>
                    </div>
                    <div class="palette-desc">{{ s.d }}</div>
                  </div>
                  <span class="chip orange shrink-0">{{ s.e }}</span>
                </button>
              }
            </div>
          }

          <div class="composer-box">
            <textarea
              rows="2"
              class="composer-input"
              aria-label="Mensagem para o copiloto"
              placeholder="Digite / para abrir as 18 skills ou peça ao Copilot..."
              [ngModel]="ai.input()"
              (ngModelChange)="ai.onInputChange($event)"
              (keydown)="onKeyDown($event)"></textarea>

            <div class="composer-bar">
              <div class="flex items-center gap-1.5 min-w-0 flex-1">
                <button type="button" class="slash-btn" (click)="ai.onInputChange('/')">/ skills</button>
                <span class="tone-note">tom: {{ state.activeVoice().tom.split('.')[0] }}</span>
              </div>
              <button
                type="button"
                class="send-btn"
                [disabled]="!ai.input().trim()"
                (click)="ai.send()">
                enviar ↵
              </button>
            </div>
          </div>
        </footer>
      } @else {
        <!-- ABA ATIVIDADE: rolagem própria -->
        <div class="scroll-pane">
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
                class="w-full text-left p-2.5 rounded-[6px] bg-[var(--c-bg-elev)] border border-[var(--c-border)] hover:border-[#f1a10b] transition-colors flex items-center justify-between cursor-pointer"
                (click)="state.setView('inbox')">
                <div>
                  <div class="text-xs font-semibold text-[var(--c-text)]">DMs aguardando resposta</div>
                  <div class="text-[11px] text-[var(--c-text-muted)]">Sugestão de IA pronta para envio</div>
                </div>
                <span class="nav-badge warn">{{ state.unreadDmsCount() }}</span>
              </button>
              <button
                type="button"
                class="w-full text-left p-2.5 rounded-[6px] bg-[var(--c-bg-elev)] border border-[var(--c-border)] hover:border-[#f1a10b] transition-colors flex items-center justify-between cursor-pointer"
                (click)="state.setView('comments')">
                <div>
                  <div class="text-xs font-semibold text-[var(--c-text)]">Comentários sem resposta</div>
                  <div class="text-[11px] text-[var(--c-text-muted)]">Moderação e gatilhos de DM</div>
                </div>
                <span class="nav-badge">{{ state.unreadCommentsCount() }}</span>
              </button>
            </div>
          </div>

          <div class="card-p">
            <div class="card-head">
              <div>
                <div class="card-title text-xs">próximas publicações</div>
                <div class="card-sub text-[11px]">fila da Graph API v22.0</div>
              </div>
            </div>
            <div class="flex flex-col gap-2">
              @for (post of state.accountPosts().slice(0, 4); track post.id) {
                <div class="p-2.5 rounded-[6px] bg-[var(--c-bg-elev)] border border-[var(--c-border)] flex items-start justify-between gap-2">
                  <div class="min-w-0">
                    <div class="flex items-center gap-1.5 mb-0.5">
                      <span class="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded-[2px] bg-[var(--c-surface)] text-[var(--c-acc)]">{{ post.t }}</span>
                      <span class="text-[10px] font-mono text-[var(--c-text-muted)]">{{ post.time || 'rascunho' }}</span>
                    </div>
                    <div class="text-xs font-medium text-[var(--c-text)] truncate">{{ post.topic }}</div>
                  </div>
                  <span class="chip orange shrink-0">{{ post.s }}</span>
                </div>
              }
            </div>
          </div>

          <div class="card-p">
            <div class="card-head">
              <div class="card-title text-xs">saúde da integração Meta</div>
              <span class="w-2 h-2 rounded-full bg-[var(--c-ok)]" aria-hidden="true"></span>
            </div>
            <div class="flex flex-col gap-2 text-xs">
              <div class="p-2 rounded-[6px] bg-[var(--c-bg-elev)] border border-[var(--c-border)]">
                <div class="font-medium text-[var(--c-text)]">Token OAuth · {{ state.activeAccount().st }}</div>
                <div class="text-[11px] text-[var(--c-text-muted)] mt-0.5">{{ state.activeAccount().days }} dias restantes · {{ state.activeAccount().perms }}/4 escopos ativos</div>
              </div>
              <div class="p-2 rounded-[6px] bg-[var(--c-bg-elev)] border border-[var(--c-border)]">
                <div class="font-medium text-[var(--c-text)]">Webhook X-Hub-Signature-256</div>
                <div class="text-[11px] text-[var(--c-text-muted)] mt-0.5">{{ state.activeAccount().wh ? 'Ativo e recebendo eventos em tempo real' : 'Reconexão necessária' }}</div>
              </div>
            </div>
          </div>
        </div>
      }
    </section>
  `,
  styles: [
    `
      /* Altura: o host ocupa o espaço que sobra no .right-rail; sem isso a conversa não tem limite e não rola */
      :host {
        display: flex;
        flex: 1 1 auto;
        min-width: 0;
        min-height: 0;
      }

      .copilot {
        display: flex;
        flex-direction: column;
        flex: 1 1 auto;
        width: 100%;
        min-height: 0;
        background: var(--c-panel);
        border-left: 1px solid var(--c-border);
      }

      .copilot :focus-visible {
        outline: 2px solid var(--c-link);
        outline-offset: 2px;
      }

      /* ---------- Cabeçalho ---------- */
      .copilot-head {
        flex: none;
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 12px 14px;
        border-bottom: 1px solid var(--c-border);
      }

      .close-btn {
        width: 30px;
        height: 30px;
        flex: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 1px solid rgba(var(--ov), 0.12);
        border-radius: 6px;
        background: rgba(var(--ov), 0.04);
        color: var(--c-text2);
        cursor: pointer;
        transition: background 120ms ease, color 120ms ease;
      }

      .close-btn svg {
        width: 14px;
        height: 14px;
      }

      .close-btn:hover {
        background: rgba(var(--ov), 0.09);
        color: var(--c-text);
      }

      .ctx-row {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
      }

      .ctx-avatar {
        width: 30px;
        height: 30px;
        flex: none;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 999px;
        background: linear-gradient(135deg, #5d6367, #363d3f);
        color: #fefefe;
        font: 600 11px/1 var(--font-display);
        box-shadow: 0 0 0 2px var(--c-panel), 0 0 0 3.5px #f1a10b;
      }

      .ctx-label {
        font: 600 10px/1 var(--font-display);
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--c-dim);
      }

      .ctx-user {
        margin-top: 3px;
        font: 500 13px/1.2 var(--font-mono);
        color: var(--c-text);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .ctx-engine-note {
        max-width: 40%;
        font: 400 10.5px/1.25 var(--font-mono);
        color: var(--c-dim);
        text-align: right;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .engine-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 4px;
        padding: 4px;
        border-radius: 8px;
        background: var(--c-bg-elev);
        border: 1px solid var(--c-border);
      }

      .engine-btn {
        height: 28px;
        min-width: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        border: 0;
        border-radius: 5px;
        background: transparent;
        color: var(--c-text-2);
        font-size: 11.5px;
        font-weight: 500;
        cursor: pointer;
        transition: background 120ms ease, color 120ms ease;
      }

      .engine-btn:hover {
        color: var(--c-text);
        background: rgba(var(--ov), 0.06);
      }

      .engine-btn.active {
        background: #f6bc03;
        color: #2b2b2b;
        font-weight: 600;
      }

      .engine-dot {
        width: 6px;
        height: 6px;
        flex: none;
        border-radius: 999px;
      }

      /* ---------- Conversa (única área com rolagem) ---------- */
      .thread-wrap {
        position: relative;
        flex: 1 1 auto;
        min-height: 0;
        display: flex;
        flex-direction: column;
      }

      .thread {
        flex: 1 1 auto;
        min-height: 0;
        overflow-y: auto;
        overscroll-behavior: contain;
        padding: 14px;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      .sys-line {
        padding: 6px 0;
        border-top: 1px dashed var(--c-border);
        border-bottom: 1px dashed var(--c-border);
        text-align: center;
        font: 400 10.5px/1.4 var(--font-mono);
        color: var(--c-text-muted);
      }

      .msg {
        display: flex;
        flex-direction: column;
        gap: 5px;
        max-width: 92%;
      }

      .msg-ai {
        align-items: flex-start;
      }

      .msg-user {
        align-self: flex-end;
        align-items: flex-end;
      }

      .msg-meta {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 6px;
        padding: 0 2px;
        font: 400 10px/1.2 var(--font-mono);
        color: var(--c-text-muted);
      }

      .engine-tag {
        padding: 2px 6px;
        border-radius: 3px;
        background: rgba(246, 188, 3, 0.16);
        color: var(--c-acc);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      .skill-tag {
        color: var(--c-link);
      }

      .msg-live {
        color: var(--c-acc);
      }

      .bubble {
        padding: 10px 12px;
        border: 1px solid var(--c-border);
        border-radius: 10px;
        font-size: 12.5px;
        line-height: 1.55;
        color: var(--c-text);
        word-break: break-word;
      }

      .bubble-ai {
        background: var(--c-card);
        border-top-left-radius: 3px;
      }

      .bubble-user {
        background: rgba(246, 188, 3, 0.12);
        border-color: rgba(241, 161, 11, 0.4);
        border-top-right-radius: 3px;
      }

      .msg-actions {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 6px;
        margin-top: 10px;
        padding-top: 8px;
        border-top: 1px solid var(--c-border);
      }

      .mini-btn {
        height: 24px;
        padding: 0 9px;
        border: 0;
        border-radius: 4px;
        background: var(--c-surface);
        color: var(--c-text-2);
        font-size: 11px;
        cursor: pointer;
        transition: background 120ms ease;
      }

      .mini-btn:hover {
        background: var(--c-surface-hover);
      }

      .mini-btn-acc {
        background: rgba(246, 188, 3, 0.14);
        color: var(--c-acc);
      }

      .mini-btn-acc:hover {
        background: rgba(246, 188, 3, 0.22);
      }

      .typing {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        height: 16px;
      }

      .typing i {
        width: 6px;
        height: 6px;
        border-radius: 999px;
        background: var(--c-acc);
        animation: cp-bounce 1s infinite ease-in-out;
      }

      .typing i:nth-child(2) {
        animation-delay: 0.15s;
      }

      .typing i:nth-child(3) {
        animation-delay: 0.3s;
      }

      @keyframes cp-bounce {
        0%,
        80%,
        100% {
          transform: translateY(0);
          opacity: 0.4;
        }
        40% {
          transform: translateY(-4px);
          opacity: 1;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .typing i {
          animation: none;
          opacity: 0.7;
        }
      }

      .jump-btn {
        position: absolute;
        left: 50%;
        bottom: 12px;
        transform: translateX(-50%);
        z-index: 2;
        height: 28px;
        padding: 0 12px;
        border: 1px solid rgba(241, 161, 11, 0.45);
        border-radius: 999px;
        background: var(--c-pop);
        color: var(--c-acc);
        font: 500 11px/1 var(--font-mono);
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
        cursor: pointer;
        white-space: nowrap;
      }

      /* ---------- Atalhos de skills ---------- */
      .chips {
        flex: none;
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 14px;
        overflow-x: auto;
        scrollbar-width: none;
        border-top: 1px solid var(--c-border);
      }

      .chips::-webkit-scrollbar {
        display: none;
      }

      .skill-chip {
        flex: none;
        height: 24px;
        padding: 0 9px;
        border: 1px solid var(--c-border);
        border-radius: 999px;
        background: var(--c-card);
        color: var(--c-acc);
        font: 500 11px/1 var(--font-mono);
        white-space: nowrap;
        cursor: pointer;
        transition: background 120ms ease, border-color 120ms ease;
      }

      .skill-chip:hover {
        background: var(--c-surface-hover);
        border-color: rgba(241, 161, 11, 0.45);
      }

      /* ---------- Compositor ---------- */
      .composer {
        flex: none;
        position: relative;
        padding: 10px 14px 14px;
        border-top: 1px solid var(--c-border);
      }

      .composer-box {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 10px;
        border: 1px solid var(--c-border-strong);
        border-radius: 10px;
        background: var(--c-bg-elev);
        transition: border-color 120ms ease, box-shadow 120ms ease;
      }

      .composer-box:focus-within {
        border-color: var(--c-link);
        box-shadow: 0 0 0 3px rgba(241, 161, 11, 0.25);
      }

      .composer-input {
        width: 100%;
        min-height: 40px;
        max-height: 160px;
        field-sizing: content;
        resize: none;
        overflow-y: auto;
        background: transparent;
        border: 0;
        outline: none;
        color: var(--c-text);
        font-family: inherit;
        font-size: 12.5px;
        line-height: 1.5;
      }

      .composer-input::placeholder {
        color: var(--c-text-muted);
      }

      .composer-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        min-width: 0;
      }

      .slash-btn {
        flex: none;
        height: 24px;
        padding: 0 8px;
        white-space: nowrap;
        border: 0;
        border-radius: 4px;
        background: var(--c-surface);
        color: var(--c-acc);
        font: 500 11px/1 var(--font-mono);
        cursor: pointer;
      }

      .tone-note {
        min-width: 0;
        font: 400 10px/1.2 var(--font-mono);
        color: var(--c-text-muted);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .send-btn {
        flex: none;
        height: 28px;
        padding: 0 12px;
        border: 1px solid #c96a0c;
        border-radius: 5px;
        background: var(--grad-brand);
        box-shadow: var(--shadow-button);
        color: #2b2b2b;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: filter 120ms ease, opacity 120ms ease;
      }

      .send-btn:hover:not(:disabled) {
        filter: brightness(1.05);
      }

      .send-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      /* Paleta de skills (abre acima do compositor) */
      .palette {
        position: absolute;
        left: 14px;
        right: 14px;
        bottom: calc(100% + 6px);
        z-index: 30;
        max-height: 256px;
        overflow-y: auto;
        overscroll-behavior: contain;
        padding: 6px;
        border: 1px solid var(--c-border-strong);
        border-radius: 8px;
        background: var(--c-pop);
        box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35);
      }

      .palette-head {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        padding: 4px 8px 6px;
        font: 500 10px/1.2 var(--font-mono);
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--c-text-muted);
      }

      .palette-head span:last-child {
        flex: none;
        white-space: nowrap;
      }

      .palette-item {
        width: 100%;
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 8px;
        padding: 8px 10px;
        border: 0;
        border-radius: 5px;
        background: transparent;
        color: inherit;
        text-align: left;
        cursor: pointer;
      }

      .palette-item:hover,
      .palette-item.is-sel {
        background: rgba(246, 188, 3, 0.16);
      }

      .palette-cmd {
        font: 600 12px/1.2 var(--font-mono);
        color: var(--c-acc);
      }

      .palette-arg {
        min-width: 0;
        font: 400 10.5px/1.2 var(--font-mono);
        color: var(--c-text-muted);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .palette-desc {
        margin-top: 2px;
        font-size: 11px;
        color: var(--c-text-2);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      /* ---------- Aba atividade ---------- */
      .scroll-pane {
        flex: 1 1 auto;
        min-height: 0;
        overflow-y: auto;
        overscroll-behavior: contain;
        padding: 14px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
    `,
  ],
})
export class AiCopilotChatComponent {
  readonly state = inject(AccountStateService);
  readonly ai = inject(AiOrchestratorService);

  readonly closeDock = output<void>();

  private readonly thread = viewChild<ElementRef<HTMLElement>>('thread');
  // Controla se a conversa deve acompanhar as novas mensagens (true) ou se o usuário subiu para ler o histórico
  private pinned = true;
  readonly showJump = signal(false);

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

  constructor() {
    effect(() => {
      const list = this.ai.messages();
      const tab = this.state.rightTab();
      const el = this.thread()?.nativeElement;

      // Ao enviar, a mensagem do usuário sempre reancora a conversa no fim
      if (list[list.length - 1]?.role === 'user') this.pinned = true;
      if (tab !== 'copilot' || !el || !this.pinned) return;

      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight;
      });
    });
  }

  onThreadScroll(event: Event): void {
    const el = event.target as HTMLElement;
    this.pinned = el.scrollHeight - el.scrollTop - el.clientHeight < 48;
    this.showJump.set(!this.pinned);
  }

  jumpToLatest(): void {
    const el = this.thread()?.nativeElement;
    if (!el) return;
    this.pinned = true;
    this.showJump.set(false);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollTo({ top: el.scrollHeight, behavior: reduceMotion ? 'auto' : 'smooth' });
  }

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
