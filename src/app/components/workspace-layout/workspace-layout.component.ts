import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountStateService, WorkspaceView } from '../../services/account-state.service';
import { AiOrchestratorService } from '../../services/ai-orchestrator.service';
import { CodemixButtonComponent } from '../codemix-button.component';
import { AccountSwitcherComponent } from '../account-switcher/account-switcher.component';
import { ContentStudioComponent } from '../content-studio/content-studio.component';
import { UnifiedInboxComponent } from '../unified-inbox/unified-inbox.component';
import { AccountsManagerComponent } from '../accounts-manager/accounts-manager.component';
import { AiCopilotChatComponent } from '../ai-copilot-chat/ai-copilot-chat.component';
import { PostFormat, TWINS, METRICS } from '../../data/seed-data';

@Component({
  selector: 'app-workspace-layout',
  imports: [
    CommonModule,
    FormsModule,
    CodemixButtonComponent,
    AccountSwitcherComponent,
    ContentStudioComponent,
    UnifiedInboxComponent,
    AccountsManagerComponent,
    AiCopilotChatComponent,
  ],
  template: `
    <div
      class="workspace"
      [class.left-collapsed]="state.isLeftCompact()"
      [class.right-closed]="!state.isRightOpen()"
      [style]="state.themeVariables()"
      [style.--left-w.px]="state.leftWidth()"
      [style.--right-w.px]="state.rightWidth()">

      <!-- ==================== COLUNA ESQUERDA: NAVEGAÇÃO + CONTAS ==================== -->
      <aside class="sidebar">
        <!-- Brand Header -->
        <div class="brand">
          <div class="brand-logo">
            <img class="logo-full logo-dark" src="assets/logo-codemix-white.svg" alt="Codemix" />
            <img class="logo-full logo-light" src="assets/logo-codemix-color.png" alt="Codemix" />
            <img class="logo-mark" src="assets/mark-codemix-color.png" alt="Codemix" />
          </div>
          <span class="brand-tag">insta-ai</span>
        </div>

        @if (!state.isLeftCompact()) {
          <!-- Multi-Tenant Account Switcher -->
          <app-account-switcher />

          <!-- Primary CTA: Novo Post Multi-Conta -->
          <div class="px-1 my-1 w-full">
            <cm-button
              variant="primary"
              size="sm"
              [arrow]="true"
              [fullWidth]="true"
              (clicked)="state.openComposer()">
              <span>novo post</span>
            </cm-button>
          </div>
        } @else {
          <button
            type="button"
            class="w-9 h-9 rounded-full flex items-center justify-center text-white mx-auto my-1 cursor-pointer border-0"
            style="background: linear-gradient(135deg,#5d6367,#363d3f); font: 600 12px/1 var(--font-display); box-shadow: 0 0 0 2px var(--c-panel), 0 0 0 4px #f1a10b;"
            [title]="'@' + state.activeAccount().user"
            (click)="state.leftCompact.set(false)">
            {{ state.activeAccount().ini }}
          </button>
          <button
            type="button"
            class="w-10 h-9 rounded-[4px] flex items-center justify-center mx-auto mb-1 cursor-pointer text-lg font-bold leading-none"
            style="border: 1px solid #c96a0c; background: var(--grad-brand); color: #2b2b2b; box-shadow: var(--shadow-button);"
            title="Novo post"
            (click)="state.openComposer()">
            +
          </button>
        }

        <!-- Navigation Menu -->
        <div class="flex-1 overflow-y-auto flex flex-col gap-0.5 pr-0.5">
          <div class="nav-group-label">operação</div>

          <button type="button" class="nav-item" [class.active]="state.view() === 'overview'" (click)="state.setView('overview')">
            <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>
            <span class="nav-txt">visão geral</span>
          </button>

          <button type="button" class="nav-item" [class.active]="state.view() === 'content'" (click)="state.setView('content')">
            <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <span class="nav-txt">conteúdo</span>
            <span class="nav-badge">{{ state.accountPosts().length }}</span>
          </button>

          <button type="button" class="nav-item" [class.active]="state.view() === 'comments'" (click)="state.setView('comments')">
            <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            <span class="nav-txt">comentários</span>
            @if (state.unreadCommentsCount() > 0) {
              <span class="nav-badge warn">{{ state.unreadCommentsCount() }}</span>
            }
          </button>

          <button type="button" class="nav-item" [class.active]="state.view() === 'inbox'" (click)="state.setView('inbox')">
            <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <span class="nav-txt">inbox unificado</span>
            @if (state.unreadDmsCount() > 0) {
              <span class="nav-badge warn">{{ state.unreadDmsCount() }}</span>
            }
          </button>

          <div class="nav-group-label">automação & ia</div>

          <button type="button" class="nav-item" [class.active]="state.view() === 'twin'" (click)="state.setView('twin')">
            <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z"/><path d="M16 14h.01"/><path d="M8 14h.01"/><path d="M5 20a7 7 0 0 1 14 0"/></svg>
            <span class="nav-txt">versão digital</span>
            <span class="nav-badge ai">ON</span>
          </button>

          <button type="button" class="nav-item" [class.active]="state.view() === 'automations'" (click)="state.setView('automations')">
            <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/><circle cx="12" cy="18" r="3"/><path d="M8.5 7.5 11 15.5"/><path d="M15.5 7.5 13 15.5"/></svg>
            <span class="nav-txt">automações</span>
            <span class="nav-badge">{{ state.flows().length }}</span>
          </button>

          <button type="button" class="nav-item" [class.active]="state.view() === 'audience'" (click)="state.setView('audience')">
            <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span class="nav-txt">audiência</span>
            <span class="nav-badge">{{ accountContacts().length }}</span>
          </button>

          <button type="button" class="nav-item" [class.active]="state.view() === 'prompts'" (click)="state.setView('prompts')">
            <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            <span class="nav-txt">prompt studio</span>
            <span class="nav-badge ai">IA</span>
          </button>

          <button type="button" class="nav-item" [class.active]="state.view() === 'skills'" (click)="state.setView('skills')">
            <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
            <span class="nav-txt">skills & comandos /</span>
            <span class="nav-badge ai">{{ state.allCommands(true).length }}</span>
          </button>

          <div class="nav-group-label">inteligência</div>

          <button type="button" class="nav-item" [class.active]="state.view() === 'analytics'" (click)="state.setView('analytics')">
            <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            <span class="nav-txt">analytics</span>
          </button>

          <button type="button" class="nav-item" [class.active]="state.view() === 'accounts'" (click)="state.setView('accounts')">
            <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            <span class="nav-txt">contas & tom de voz</span>
          </button>
        </div>

        <!-- Sidebar Footer -->
        <div class="sidebar-foot">
          <div class="user-row">
            <div class="user-ava">CM</div>
            <div class="user-info">
              <div class="user-name">Codemix Studio</div>
              <div class="user-role">Tenant Pro · {{ state.accounts().length }} contas</div>
            </div>
            <button
              type="button"
              class="icon-btn"
              title="Alternar tema Claro/Escuro"
              (click)="state.toggleTheme()">
              @if (state.theme() === 'dark') {
                <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
              } @else {
                <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              }
            </button>
          </div>
        </div>

        <!-- Resize Handle Left -->
        <div class="resize-handle left" (mousedown)="startResizeLeft($event)" title="Arraste para redimensionar"></div>
      </aside>

      <!-- ==================== COLUNA CENTRAL: OPERAÇÃO INSTAGRAM ==================== -->
      <main class="main">
        <!-- Top Header -->
        <header class="main-head">
          <button
            type="button"
            class="icon-btn"
            title="Recolher/expandir menu lateral"
            (click)="state.leftCompact.set(!state.isLeftCompact())">
            <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
          </button>

          <div class="main-title">
            <span class="light">{{ currentHeader().l }}</span><span class="bold">{{ currentHeader().b }}</span>
            <span class="crumb">/ &#64;{{ state.activeAccount().user }}</span>
          </div>

          <div class="head-actions">
            @if (state.view() === 'content') {
              <div class="seg">
                <button type="button" [class.active]="state.contentMode() === 'kanban'" (click)="state.contentMode.set('kanban')">kanban</button>
                <button type="button" [class.active]="state.contentMode() === 'calendar'" (click)="state.contentMode.set('calendar')">calendário</button>
              </div>
            }

            <span class="chip green hidden md:inline-flex" title="Projeto Supabase conectado: https://gmwdahnksiqukovcwwid.supabase.co">
              <span class="w-1.5 h-1.5 rounded-full bg-[var(--c-ok)]"></span>
              Supabase · {{ state.supabase.projectRef }}
            </span>

            <span class="chip cyan hidden sm:inline-flex">
              <span class="w-1.5 h-1.5 rounded-full bg-[var(--c-info)]"></span>
              Graph API v22.0
            </span>

            <button
              type="button"
              class="icon-btn"
              [class.active]="state.isRightOpen() && state.rightTab() === 'copilot'"
              style="width: auto; padding: 0 11px; gap: 6px; font-size: 12px;"
              (click)="toggleRightDock('copilot')">
              <span class="w-2 h-2 rounded-full bg-[#f6bc03]"></span>
              <span>ai copilot</span>
            </button>

            <button
              type="button"
              class="icon-btn"
              [class.active]="state.isRightOpen() && state.rightTab() === 'activity'"
              style="width: auto; padding: 0 11px; gap: 6px; font-size: 12px;"
              (click)="toggleRightDock('activity')">
              <span class="w-1.5 h-1.5 rounded-full bg-[#f1a10b]"></span>
              <span>atividade</span>
            </button>
          </div>
        </header>

        <!-- Main Scrollable Viewport -->
        <div class="main-body relative">
          <!-- 1. VISÃO GERAL (OVERVIEW) -->
          @if (state.view() === 'overview') {
            <div class="flex flex-col gap-4">
              <div class="kpi-grid">
                @for (k of activeMetrics().k; track k[0]) {
                  <div class="kpi">
                    <div class="kpi-top"><span>{{ k[0] }}</span><span class="kpi-delta">{{ k[2] }}</span></div>
                    <div class="kpi-val">{{ k[1] }}</div>
                    <div class="kpi-sub">últimos 30 dias · &#64;{{ state.activeAccount().user }}</div>
                  </div>
                }
              </div>

              <div class="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
                <div class="card-p lg:col-span-2">
                  <div class="card-head">
                    <div>
                      <div class="card-title">pipeline editorial da semana</div>
                      <div class="card-sub">rascunhos, prompts prontos e agendados para &#64;{{ state.activeAccount().user }}</div>
                    </div>
                    <cm-button variant="ghost" size="sm" (clicked)="state.setView('content')">ver estúdio »</cm-button>
                  </div>
                  <div class="flex flex-col gap-2">
                    @for (p of state.accountPosts().slice(0, 4); track p.id) {
                      <div class="p-3 rounded-[6px] bg-[var(--c-bg-elev)] border border-[var(--c-border)] flex items-center justify-between gap-3">
                        <div class="min-w-0">
                          <div class="flex items-center gap-2 mb-1">
                            <span class="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded-[2px] bg-[var(--c-surface)] text-[var(--c-acc)]">{{ p.t }}</span>
                            <span class="text-xs font-semibold text-[var(--c-text)] truncate">{{ p.topic }}</span>
                          </div>
                          <div class="text-[11.5px] text-[var(--c-text-2)] truncate">{{ p.cap || 'Sem legenda definida' }}</div>
                        </div>
                        <div class="flex items-center gap-2 shrink-0">
                          <span class="text-[11px] font-mono text-[var(--c-text-muted)]">{{ p.time || 'rascunho' }}</span>
                          <span class="chip orange">{{ p.s }}</span>
                        </div>
                      </div>
                    }
                  </div>
                </div>

                <!-- Atalhos de Skills / Copilot -->
                <div class="card-p">
                  <div class="card-head">
                    <div>
                      <div class="card-title">ações rápidas com IA</div>
                      <div class="card-sub">aciona o Multi-Engine Router</div>
                    </div>
                    <span class="chip purple">{{ state.allCommands(true).length }} skills</span>
                  </div>
                  <div class="flex flex-col gap-2">
                    <button
                      type="button"
                      class="p-2.5 rounded-[6px] bg-[var(--c-bg-elev)] border border-[var(--c-border)] hover:border-[#f1a10b] text-left transition-all cursor-pointer"
                      (click)="runSlashSkill('/calendario 7 topo-meio-fundo')">
                      <div class="font-mono text-xs text-[var(--c-acc)] font-semibold">/calendario 7 dias</div>
                      <div class="text-[11px] text-[var(--c-text-2)] mt-0.5">Gerar matriz editorial completa para a semana</div>
                    </button>
                    <button
                      type="button"
                      class="p-2.5 rounded-[6px] bg-[var(--c-bg-elev)] border border-[var(--c-border)] hover:border-[#f1a10b] text-left transition-all cursor-pointer"
                      (click)="runSlashSkill('/carrossel Agentes de IA em producao 7')">
                      <div class="font-mono text-xs text-[var(--c-acc)] font-semibold">/carrossel 7 slides</div>
                      <div class="text-[11px] text-[var(--c-text-2)] mt-0.5">Estruturar carrossel de retenção + legenda AIDA</div>
                    </button>
                    <button
                      type="button"
                      class="p-2.5 rounded-[6px] bg-[var(--c-bg-elev)] border border-[var(--c-border)] hover:border-[#f1a10b] text-left transition-all cursor-pointer"
                      (click)="runSlashSkill('/prompt-foto Editorial minimalista Codemix 4:5')">
                      <div class="font-mono text-xs text-[var(--c-acc)] font-semibold">/prompt-foto 4:5</div>
                      <div class="text-[11px] text-[var(--c-text-2)] mt-0.5">Gerar prompt técnico 4:5 para Midjourney v6 / Flux</div>
                    </button>
                    <button
                      type="button"
                      class="p-2.5 rounded-[6px] bg-[var(--c-bg-elev)] border border-[var(--c-border)] hover:border-[#f1a10b] text-left transition-all cursor-pointer"
                      (click)="runSlashSkill('/auditoria-perfil')">
                      <div class="font-mono text-xs text-[var(--c-acc)] font-semibold">/auditoria-perfil</div>
                      <div class="text-[11px] text-[var(--c-text-2)] mt-0.5">Diagnóstico de bio, destaques e mix com Gemini 2.5 Pro</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          }

          <!-- 2. CONTEÚDO (KANBAN + CALENDÁRIO) -->
          @if (state.view() === 'content') {
            <app-content-studio />
          }

          <!-- 3. COMENTÁRIOS (GESTÃO INTELIGENTE + REGRAS DE GATILHO) -->
          @if (state.view() === 'comments') {
            <div class="flex flex-col gap-4">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div class="flex items-center gap-1.5 flex-wrap">
                  @for (f of commentFilters; track f.id) {
                    <button
                      type="button"
                      class="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer"
                      [style.background]="state.cFilter() === f.id ? 'rgba(246,188,3,.16)' : 'var(--c-card)'"
                      [style.color]="state.cFilter() === f.id ? 'var(--c-acc)' : 'var(--c-text-2)'"
                      [style.border-color]="state.cFilter() === f.id ? '#f1a10b' : 'var(--c-border)'"
                      (click)="state.cFilter.set(f.id)">
                      {{ f.label }}
                    </button>
                  }
                </div>
                <div class="flex items-center gap-2">
                  <cm-button variant="ghost" size="sm" (clicked)="hideSpamComments()">
                    ocultar spam
                  </cm-button>
                  <cm-button variant="primary" size="sm" (clicked)="batchApproveComments()">
                    aprovar e responder pendentes com IA ({{ state.unreadCommentsCount() }})
                  </cm-button>
                </div>
              </div>

              <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div class="lg:col-span-2 flex flex-col gap-2.5">
                  @for (c of filteredComments(); track c.id) {
                    <div class="card-p flex flex-col gap-2.5">
                      <div class="flex items-center justify-between gap-2">
                        <div class="flex items-center gap-2">
                          <span class="font-mono text-xs font-semibold text-[var(--c-text)]">&#64;{{ c.u }}</span>
                          <span class="text-[11px] text-[var(--c-text-muted)]">{{ c.media }} · {{ c.time }}</span>
                        </div>
                        <div class="flex items-center gap-1.5">
                          <span class="chip cyan">{{ c.cat || 'comentario' }}</span>
                          <span class="chip orange">{{ c.s }}</span>
                        </div>
                      </div>

                      <div class="text-sm text-[var(--c-text)]">{{ c.c }}</div>

                      <div class="p-2.5 rounded-[6px] bg-[rgba(246,188,3,0.06)] border border-[#f1a10b]/45 flex items-center justify-between gap-3">
                        <div class="text-xs text-[var(--c-text-2)]">
                          <strong class="text-[var(--c-acc)] font-mono">Sugestão IA:</strong> {{ c.ai }}
                        </div>
                        @if (c.s === 'UNREAD') {
                          <cm-button
                            variant="primary"
                            size="sm"
                            (clicked)="state.updateInteractionStatus([c.id], { s: 'AI_REPLIED' }, 'Comentário respondido com IA')">
                            aprovar e responder
                          </cm-button>
                        }
                      </div>
                    </div>
                  }
                </div>

                <!-- Regras de Gatilho Comentário -> DM -->
                <div class="card-p h-fit flex flex-col gap-3">
                  <div class="card-head">
                    <div>
                      <div class="card-title">gatilhos comentário → DM</div>
                      <div class="card-sub">Private Replies API (ManyChat-style)</div>
                    </div>
                  </div>
                  <div class="flex flex-col gap-2">
                    @for (r of accountRules(); track r.id) {
                      <div class="p-3 rounded-[6px] bg-[var(--c-bg-elev)] border border-[var(--c-border)]">
                        <div class="flex items-center justify-between mb-1">
                          <span class="font-mono text-xs font-bold text-[var(--c-acc)]">palavra: "{{ r.kw }}"</span>
                          <input
                            type="checkbox"
                            class="toggle toggle-xs toggle-primary"
                            [checked]="r.on"
                            (change)="state.toggleRule(r.id)" />
                        </div>
                        <div class="text-[11px] text-[var(--c-text-2)]">Escopo: {{ r.post }}</div>
                        <div class="text-[11px] text-[var(--c-text-muted)] font-mono">Destino: {{ r.link }}</div>
                      </div>
                    }
                  </div>

                  <div class="pt-2 border-t border-[var(--c-border)] flex flex-col gap-2">
                    <input
                      type="text"
                      class="w-full px-2.5 py-1.5 rounded-[6px] bg-[var(--c-bg-elev)] border border-[var(--c-border)] text-xs text-[var(--c-text)] cm-input-focus"
                      placeholder="Palavra-chave (ex: AGENTE)"
                      [ngModel]="state.newKw()"
                      (ngModelChange)="state.newKw.set($event)" />
                    <input
                      type="text"
                      class="w-full px-2.5 py-1.5 rounded-[6px] bg-[var(--c-bg-elev)] border border-[var(--c-border)] text-xs text-[var(--c-text)] cm-input-focus"
                      placeholder="Link para enviar por DM"
                      [ngModel]="state.newLink()"
                      (ngModelChange)="state.newLink.set($event)" />
                    <cm-button variant="primary" size="sm" [fullWidth]="true" (clicked)="state.addKeywordRule('todos os posts')">
                      + criar gatilho de DM
                    </cm-button>
                  </div>
                </div>
              </div>
            </div>
          }

          <!-- 4. INBOX UNIFICADO (DMs + COMENTÁRIOS + STORY MENTIONS) -->
          @if (state.view() === 'inbox') {
            <app-unified-inbox />
          }

          <!-- 5. VERSÃO DIGITAL (DIGITAL TWIN) -->
          @if (state.view() === 'twin') {
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div class="card-p flex flex-col gap-3">
                <div class="card-head">
                  <div>
                    <div class="card-title">configuração da Versão Digital (Gêmeo de IA)</div>
                    <div class="card-sub">treinado na memória e tom de voz de &#64;{{ state.activeAccount().user }}</div>
                  </div>
                  <span class="chip green">ON</span>
                </div>

                <div class="grid grid-cols-2 gap-2">
                  @for (metric of activeTwin().kpi; track metric[0]) {
                    <div class="p-2.5 rounded-[6px] bg-[var(--c-bg-elev)] border border-[var(--c-border)]">
                      <div class="text-[10px] font-mono uppercase text-[var(--c-text-muted)]">{{ metric[0] }}</div>
                      <div class="text-base font-bold text-[var(--c-text)] mt-0.5">{{ metric[1] }}</div>
                    </div>
                  }
                </div>

                <div>
                  <div class="text-xs font-semibold mb-2">domínios autorizados de resposta</div>
                  <div class="flex flex-wrap gap-1.5">
                    @for (f of state.getTwinSettings().fields; track f.l) {
                      <span class="chip" [class.green]="f.on" [class.orange]="!f.on">
                        {{ f.l }} ({{ f.on ? 'ativo' : 'bloqueado' }})
                      </span>
                    }
                  </div>
                </div>

                <div>
                  <div class="text-xs font-semibold mb-2">fontes de treinamento sincronizadas</div>
                  <div class="flex flex-col gap-1.5">
                    @for (src of activeTwin().sources; track src[1]) {
                      <div class="p-2.5 rounded-[6px] bg-[var(--c-bg-elev)] border border-[var(--c-border)] flex items-center justify-between text-xs">
                        <div>
                          <span class="font-mono text-[10px] text-[var(--c-acc)] mr-2">{{ src[0] }}</span>
                          <span class="text-[var(--c-text)]">{{ src[1] }}</span>
                        </div>
                        <span class="chip green">{{ src[2] }}</span>
                      </div>
                    }
                  </div>
                </div>
              </div>

              <!-- Comparador IA Genérica vs Sua Versão Digital -->
              <div class="card-p flex flex-col gap-3">
                <div class="card-head">
                  <div>
                    <div class="card-title">simulador & comparador da Versão Digital</div>
                    <div class="card-sub">teste uma pergunta e compare com uma IA genérica</div>
                  </div>
                </div>

                <div class="flex flex-wrap gap-1.5">
                  @for (p of activeTwin().presets; track p) {
                    <button
                      type="button"
                      class="px-2.5 py-1 rounded-[4px] text-xs bg-[var(--c-bg-elev)] border border-[var(--c-border)] hover:border-[#f1a10b] text-[var(--c-text-2)] cursor-pointer"
                      (click)="state.askTwinPlayground(p)">
                      {{ p }}
                    </button>
                  }
                </div>

                @if (state.pgQ()) {
                  @let ans = state.getTwinAnswer(state.activeAccount(), state.pgQ());
                  <div class="p-3 rounded-[6px] bg-[#e8604f]/10 border border-[#e8604f]/35">
                    <div class="text-[10px] font-mono uppercase text-[var(--c-err)] mb-1">IA Genérica (Sem Brand Voice)</div>
                    <div class="text-xs text-[var(--c-text-2)]">{{ ans.g }}</div>
                  </div>
                  <div class="p-3 rounded-[6px] bg-[#7bbf4a]/10 border border-[#7bbf4a]/35 flex flex-col gap-2">
                    <div class="text-[10px] font-mono uppercase text-[var(--c-ok)]">✓ Sua Versão Digital (&#64;{{ state.activeAccount().user }})</div>
                    @for (step of ans.t; track step) {
                      <div class="text-xs text-[var(--c-text)] p-2 rounded-[4px] bg-[var(--c-bg-elev)]">{{ step }}</div>
                    }
                  </div>
                }

                <div class="mt-1">
                  <div class="text-xs font-semibold mb-2">ofertas e links de conversão no Direct</div>
                  <div class="flex flex-col gap-2">
                    @for (o of activeTwin().offers; track o.n) {
                      <div class="p-2.5 rounded-[6px] bg-[var(--c-bg-elev)] border border-[var(--c-border)] flex items-center justify-between">
                        <div>
                          <div class="text-xs font-semibold text-[var(--c-text)]">{{ o.n }}</div>
                          <div class="text-[11px] text-[var(--c-text-muted)]">Quando: {{ o.when }} → {{ o.link }}</div>
                        </div>
                        <span class="chip orange">{{ o.k }}</span>
                      </div>
                    }
                  </div>
                </div>
              </div>
            </div>
          }

          <!-- 6. AUTOMAÇÕES (MANYCHAT-STYLE FLOW BUILDER) -->
          @if (state.view() === 'automations') {
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div class="flex flex-col gap-2.5">
                @for (fl of accountFlows(); track fl.id) {
                  <div
                    class="card-p cursor-pointer transition-all"
                    [style.border-color]="state.currentFlow()?.id === fl.id ? '#f1a10b' : 'var(--c-border)'"
                    (click)="state.flowId.set(fl.id)">
                    <div class="flex items-center justify-between mb-1">
                      <span class="text-xs font-semibold text-[var(--c-text)]">{{ fl.name }}</span>
                      <span class="chip" [class.green]="fl.on" [class.orange]="!fl.on">
                        {{ fl.on ? 'ativo' : 'pausado' }}
                      </span>
                    </div>
                    <div class="grid grid-cols-4 gap-2 pt-2 mt-2 border-t border-[var(--c-border)] text-center">
                      <div>
                        <div class="text-xs font-bold">{{ fl.stats.sent }}</div>
                        <div class="text-[10px] text-[var(--c-text-muted)]">envios</div>
                      </div>
                      <div>
                        <div class="text-xs font-bold">{{ fl.stats.open }}</div>
                        <div class="text-[10px] text-[var(--c-text-muted)]">abertura</div>
                      </div>
                      <div>
                        <div class="text-xs font-bold">{{ fl.stats.clicks }}</div>
                        <div class="text-[10px] text-[var(--c-text-muted)]">cliques</div>
                      </div>
                      <div>
                        <div class="text-xs font-bold text-[var(--c-ok)]">{{ fl.stats.leads }}</div>
                        <div class="text-[10px] text-[var(--c-text-muted)]">leads</div>
                      </div>
                    </div>
                  </div>
                }
                <cm-button variant="secondary" size="sm" [fullWidth]="true" (clicked)="state.createFlowFromTemplate('comentário')">
                  + nova automação de Direct
                </cm-button>
              </div>

              @if (state.currentFlow(); as flow) {
                <div class="card-p lg:col-span-2 flex flex-col gap-3">
                  <div class="card-head">
                    <div>
                      <div class="card-title">{{ flow.name }}</div>
                      <div class="card-sub">{{ flow.nodes.length }} etapas configuradas</div>
                    </div>
                    <cm-button
                      variant="primary"
                      size="sm"
                      (clicked)="state.runFlowSimulator(flow.nodes.length)">
                      simular disparo
                    </cm-button>
                  </div>

                  <div class="flex flex-col gap-2.5">
                    @for (node of flow.nodes; track node.id; let i = $index) {
                      <div class="p-3.5 rounded-[6px] bg-[var(--c-bg-elev)] border border-[var(--c-border)] flex items-start gap-3">
                        <div class="w-7 h-7 rounded-[4px] bg-[#f6bc03]/15 text-[var(--c-acc)] font-mono text-xs font-bold flex items-center justify-center shrink-0">
                          {{ i + 1 }}
                        </div>
                        <div class="flex-1">
                          <div class="flex items-center justify-between">
                            <span class="text-xs font-semibold text-[var(--c-text)] uppercase font-mono">{{ node.t }}</span>
                            @if (node.kind) {
                              <span class="chip orange">{{ node.kind }}</span>
                            }
                          </div>
                          <div class="text-xs text-[var(--c-text)] mt-1">{{ node.text }}</div>
                          @if (node.extra) {
                            <div class="text-[11px] text-[var(--c-text-muted)] font-mono mt-0.5">{{ node.extra }}</div>
                          }
                        </div>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          }

          <!-- 7. AUDIÊNCIA & CRM SOCIAL -->
          @if (state.view() === 'audience') {
            <div class="card-p">
              <div class="card-head">
                <div>
                  <div class="card-title">base de leads qualificados via Direct & Comentários</div>
                  <div class="card-sub">contatos capturados pelas automações de &#64;{{ state.activeAccount().user }}</div>
                </div>
                <cm-button variant="primary" size="sm" (clicked)="state.toast('Disparo enviado para contatos na janela de 24h!')">
                  disparo janela 24h
                </cm-button>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr class="border-b border-[var(--c-border)] text-[11px] font-mono uppercase text-[var(--c-text-muted)]">
                      <th class="py-2.5 px-3">Usuário</th>
                      <th class="py-2.5 px-3">Tags</th>
                      <th class="py-2.5 px-3">Origem</th>
                      <th class="py-2.5 px-3">Última Interação</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (ct of accountContacts(); track ct.id) {
                      <tr class="border-b border-[var(--c-border)] hover:bg-[var(--c-surface)]">
                        <td class="py-2.5 px-3 font-mono font-semibold text-[var(--c-text)]">&#64;{{ ct.u }}</td>
                        <td class="py-2.5 px-3">
                          <div class="flex flex-wrap gap-1">
                            @for (t of ct.tags; track t) {
                              <span class="chip orange">{{ t }}</span>
                            }
                          </div>
                        </td>
                        <td class="py-2.5 px-3 text-[var(--c-text-2)]">{{ ct.src }}</td>
                        <td class="py-2.5 px-3 font-mono text-[var(--c-text-muted)]">{{ ct.last }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }

          <!-- 8. PROMPT STUDIO (ENGENHARIA DE PROMPTS VISUAIS) -->
          @if (state.view() === 'prompts') {
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div class="card-p flex flex-col gap-3">
                <div class="card-head">
                  <div>
                    <div class="card-title">Style Reference da Conta</div>
                    <div class="card-sub">sufixo estético injetado em todos os prompts de &#64;{{ state.activeAccount().user }}</div>
                  </div>
                </div>

                <textarea
                  rows="5"
                  class="w-full p-3 rounded-[10px] bg-[var(--c-bg-elev)] border border-[var(--c-border)] text-xs font-mono text-[var(--c-text)] cm-input-focus"
                  [ngModel]="state.activeStyleRef()"
                  (ngModelChange)="updateStyleRef($event)"></textarea>

                <cm-button
                  variant="primary"
                  size="sm"
                  [fullWidth]="true"
                  (clicked)="runSlashSkill('/prompt-foto Conceito editorial da marca 4:5')">
                  gerar novo prompt com /prompt-foto
                </cm-button>
              </div>

              <div class="card-p lg:col-span-2 flex flex-col gap-3">
                <div class="card-head">
                  <div>
                    <div class="card-title">prompts vinculados aos posts (status PROMPT_READY)</div>
                    <div class="card-sub">prontos para Midjourney v6, Flux.1 Pro e Google Imagen 3</div>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  @for (p of state.accountPosts(); track p.id) {
                    @for (pr of p.pr; track pr.t) {
                      <div class="p-3 rounded-[6px] bg-[var(--c-bg-elev)] border border-[var(--c-border)] flex flex-col justify-between gap-2">
                        <div>
                          <div class="flex items-center justify-between mb-1">
                            <span class="text-xs font-semibold text-[var(--c-text)] truncate">{{ p.topic }}</span>
                            <span class="chip purple">{{ pr.ar }}</span>
                          </div>
                          <div class="text-[11px] text-[var(--c-text-muted)] mb-1">{{ pr.t }}</div>
                          <div class="font-mono text-[11px] text-[var(--c-text-2)] bg-[var(--c-bg)] p-2.5 rounded-[4px] border border-[var(--c-border)] select-all">
                            {{ pr.x }}
                          </div>
                        </div>
                        <div class="flex justify-end">
                          <button
                            type="button"
                            class="text-[11px] font-mono text-[var(--c-link)] hover:underline cursor-pointer"
                            (click)="state.copyText(pr.x, p.id + pr.t)">
                            {{ state.copied() === p.id + pr.t ? 'copiado!' : 'copiar prompt' }}
                          </button>
                        </div>
                      </div>
                    }
                  }
                </div>
              </div>
            </div>
          }

          <!-- 9. SKILLS & COMANDOS "/" (.ai-skills/registry.json) -->
          @if (state.view() === 'skills') {
            <div class="flex flex-col gap-4">
              <div class="card-p">
                <div class="card-head">
                  <div>
                    <div class="card-title">catálogo unificado de Skills & Slash Commands (/)</div>
                    <div class="card-sub">compartilhado entre o Chat da UI, Claude Code (.claude/commands), Gemini (.gemini/skills) e Codex (.codex/skills.yaml)</div>
                  </div>
                  <span class="chip orange">{{ state.allCommands(true).length }} skills</span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  @for (sk of state.allCommands(true); track sk.c) {
                    <div class="p-3.5 rounded-[6px] bg-[var(--c-bg-elev)] border border-[var(--c-border)] hover:border-[#f1a10b] transition-all flex flex-col justify-between gap-2.5">
                      <div>
                        <div class="flex items-center justify-between gap-2 mb-1">
                          <span class="font-mono text-xs font-bold text-[var(--c-acc)]">/{{ sk.c }}</span>
                          <span class="chip purple">{{ sk.e }}</span>
                        </div>
                        <div class="text-[11px] text-[var(--c-text-2)] mt-1">{{ sk.d }}</div>
                      </div>
                      <div class="flex items-center justify-between pt-2 border-t border-[var(--c-border)]">
                        <span class="text-[10px] font-mono text-[var(--c-text-muted)] truncate">{{ sk.a || 'sem argumentos' }}</span>
                        <button
                          type="button"
                          class="text-[11px] font-mono text-[var(--c-link)] hover:underline shrink-0 cursor-pointer"
                          (click)="runSlashSkill('/' + sk.c + ' ')">
                          executar »
                        </button>
                      </div>
                    </div>
                  }
                </div>
              </div>

              <!-- Criar Skill Customizada do Tenant -->
              <div class="card-p">
                <div class="card-head">
                  <div>
                    <div class="card-title">criar Skill customizada para o Tenant</div>
                    <div class="card-sub">salva em ai_skills no Supabase com isolamento RLS</div>
                  </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    class="px-3 py-2 rounded-[6px] bg-[var(--c-bg-elev)] border border-[var(--c-border)] text-xs font-mono text-[var(--c-text)] cm-input-focus"
                    placeholder="/minha-skill"
                    [ngModel]="state.nsCmd()"
                    (ngModelChange)="state.nsCmd.set($event)" />
                  <input
                    type="text"
                    class="md:col-span-2 px-3 py-2 rounded-[6px] bg-[var(--c-bg-elev)] border border-[var(--c-border)] text-xs text-[var(--c-text)] cm-input-focus"
                    placeholder="System prompt da skill..."
                    [ngModel]="state.nsPrompt()"
                    (ngModelChange)="state.nsPrompt.set($event)" />
                </div>
                <div class="mt-3 flex justify-end">
                  <cm-button variant="primary" size="sm" (clicked)="state.addCustomTenantSkill()">
                    + registrar skill no catálogo
                  </cm-button>
                </div>
              </div>
            </div>
          }

          <!-- 10. ANALYTICS (INSIGHTS API + AUDITORIA IA) -->
          @if (state.view() === 'analytics') {
            <div class="flex flex-col gap-4">
              <div class="kpi-grid">
                @for (k of activeMetrics().k; track k[0]) {
                  <div class="kpi">
                    <div class="kpi-top"><span>{{ k[0] }}</span><span class="kpi-delta">{{ k[2] }}</span></div>
                    <div class="kpi-val">{{ k[1] }}</div>
                    <div class="kpi-sub">Insights API · &#64;{{ state.activeAccount().user }}</div>
                  </div>
                }
              </div>

              <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div class="card-p">
                  <div class="card-head">
                    <div>
                      <div class="card-title">retenção média por formato</div>
                      <div class="card-sub">últimos 30 dias</div>
                    </div>
                  </div>
                  <div class="flex flex-col gap-2.5">
                    @for (fmt of activeMetrics().f; track fmt[0]) {
                      <div>
                        <div class="flex justify-between text-xs mb-1">
                          <span>{{ fmt[0] }}</span>
                          <span class="font-mono text-[var(--c-acc)]">{{ fmt[1] }}%</span>
                        </div>
                        <div class="h-2.5 rounded-[2px] bg-[var(--c-bg-elev)] overflow-hidden">
                          <div class="h-full" style="background: var(--grad-brand);" [style.width.%]="fmt[1]"></div>
                        </div>
                      </div>
                    }
                  </div>
                </div>

                <div class="card-p">
                  <div class="card-head">
                    <div>
                      <div class="card-title">plano de ação (/auditoria-perfil)</div>
                      <div class="card-sub">melhores janelas: {{ activeMetrics().h.join(' · ') }}</div>
                    </div>
                    <cm-button variant="primary" size="sm" (clicked)="runSlashSkill('/auditoria-perfil')">
                      atualizar via Gemini
                    </cm-button>
                  </div>
                  <div class="flex flex-col gap-2">
                    @for (step of activeMetrics().p; track step; let idx = $index) {
                      <div class="p-3 rounded-[6px] bg-[var(--c-bg-elev)] border border-[var(--c-border)] text-xs text-[var(--c-text)]">
                        <strong class="text-[var(--c-acc)] font-mono mr-1.5">{{ idx + 1 }}.</strong> {{ step }}
                      </div>
                    }
                  </div>
                </div>
              </div>
            </div>
          }

          <!-- 11. CONTAS & TOM DE VOZ -->
          @if (state.view() === 'accounts') {
            <app-accounts-manager />
          }
        </div>
      </main>

      <!-- ==================== COLUNA DIREITA: AI COPILOT DOCK / ATIVIDADE ==================== -->
      @if (state.isRightOpen()) {
        <aside class="right-rail relative">
          <div class="resize-handle right" (mousedown)="startResizeRight($event)" title="Arraste para redimensionar"></div>
          <app-ai-copilot-chat (closeDock)="state.rightOpen.set(false)" />
        </aside>
      }
    </div>

    <!-- ==================== MODAL: COMPOSER MULTI-CONTA ==================== -->
    @if (state.comp(); as comp) {
      <div class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="w-full max-w-3xl rounded-[10px] bg-[var(--c-panel)] border border-[var(--c-border-strong)] shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-5">
          <div class="p-5 md:col-span-3 flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-bold text-[var(--c-text)]">Novo Post Multi-Conta · Graph API v22.0</h3>
              <button type="button" class="text-xs text-[var(--c-text-muted)] hover:text-[var(--c-text)] cursor-pointer" (click)="state.closeComposer()">fechar ✕</button>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="text-[11px] font-mono text-[var(--c-text-muted)] block mb-1">Formato</label>
                <select
                  class="w-full px-2.5 py-1.5 rounded-[6px] bg-[var(--c-bg-elev)] border border-[var(--c-border)] text-xs text-[var(--c-text)] cm-input-focus"
                  [ngModel]="comp.t"
                  (ngModelChange)="setComposerFormat($event)">
                  <option value="CAROUSEL">CARROSSEL</option>
                  <option value="REELS">REELS</option>
                  <option value="IMAGE">IMAGEM 4:5</option>
                  <option value="STORIES">STORIES</option>
                </select>
              </div>
              <div>
                <label class="text-[11px] font-mono text-[var(--c-text-muted)] block mb-1">Horário</label>
                <input
                  type="text"
                  class="w-full px-2.5 py-1.5 rounded-[6px] bg-[var(--c-bg-elev)] border border-[var(--c-border)] text-xs text-[var(--c-text)] cm-input-focus"
                  [ngModel]="comp.time"
                  (ngModelChange)="state.patchComposer({ time: $event })" />
              </div>
            </div>

            <div>
              <label class="text-[11px] font-mono text-[var(--c-text-muted)] block mb-1">Tópico / Hook Principal</label>
              <input
                type="text"
                class="w-full px-3 py-1.5 rounded-[6px] bg-[var(--c-bg-elev)] border border-[var(--c-border)] text-xs text-[var(--c-text)] cm-input-focus"
                placeholder="Ex: 3 sinais de que seu produto precisa de um agente de IA"
                [ngModel]="comp.topic"
                (ngModelChange)="state.patchComposer({ topic: $event })" />
            </div>

            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="text-[11px] font-mono text-[var(--c-text-muted)]">Legenda</label>
                <button
                  type="button"
                  class="text-[11px] font-mono text-[var(--c-link)] hover:underline cursor-pointer"
                  (click)="state.generateComposerCaptionWithAi()">
                  gerar com Claude »
                </button>
              </div>
              <textarea
                rows="4"
                class="w-full px-3 py-2 rounded-[10px] bg-[var(--c-bg-elev)] border border-[var(--c-border)] text-xs text-[var(--c-text)] cm-input-focus"
                placeholder="Digite a legenda com CTA..."
                [ngModel]="comp.cap"
                (ngModelChange)="state.patchComposer({ cap: $event })"></textarea>
            </div>

            <div>
              <label class="text-[11px] font-mono text-[var(--c-text-muted)] block mb-1">Prompt Visual (Midjourney / Flux)</label>
              <input
                type="text"
                class="w-full px-3 py-1.5 rounded-[6px] bg-[var(--c-bg-elev)] border border-[var(--c-border)] text-xs font-mono text-[var(--c-text)] cm-input-focus"
                placeholder="--ar 4:5 --style raw --v 6"
                [ngModel]="comp.pr"
                (ngModelChange)="state.patchComposer({ pr: $event })" />
            </div>

            <div class="flex items-center justify-end gap-2 pt-2">
              <cm-button variant="ghost" size="sm" (clicked)="state.saveComposerPosts('DRAFT')">salvar rascunho</cm-button>
              <cm-button variant="primary" size="sm" [arrow]="true" (clicked)="state.saveComposerPosts('SCHEDULED')">agendar publicação</cm-button>
            </div>
          </div>

          <!-- Preview 4:5 Instagram -->
          <div class="p-5 bg-[var(--c-bg-elev)] border-l border-[var(--c-border)] md:col-span-2 flex flex-col justify-between">
            <div>
              <div class="text-[10px] font-mono uppercase text-[var(--c-text-muted)] mb-2">Preview 4:5 · &#64;{{ state.activeAccount().user }}</div>
              <div class="aspect-[4/5] rounded-[6px] bg-gradient-to-br from-[#2b2b2b] via-[#1f1f1f] to-[#f1a10b]/25 border border-[var(--c-border)] p-4 flex flex-col justify-between">
                <div class="flex items-center justify-between text-[10px] font-mono text-[#fbd23a]">
                  <span>{{ comp.t }}</span>
                  <span>&#64;{{ state.activeAccount().user }}</span>
                </div>
                <div class="text-sm font-bold text-white leading-snug">
                  {{ comp.topic || 'Seu título aparecerá em destaque aqui' }}
                </div>
                <div class="text-[10px] font-mono text-white/60 truncate">
                  {{ comp.pr || 'Prompt pronto para Midjourney v6 / Flux' }}
                </div>
              </div>
            </div>
            <div class="text-[11px] text-[var(--c-text-2)] line-clamp-3 mt-3">
              <strong>&#64;{{ state.activeAccount().user }}</strong> {{ comp.cap || 'A legenda otimizada respeitará o Brand Voice da conta selecionada.' }}
            </div>
          </div>
        </div>
      </div>
    }

    <!-- ==================== TOAST NOTIFICATION ==================== -->
    @if (state.toastMsg()) {
      <div class="fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-[6px] bg-[var(--c-pop)] border border-[#f6bc03]/60 text-xs font-medium text-[var(--c-text)] shadow-2xl flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-[#f6bc03]"></span>
        <span>{{ state.toastMsg() }}</span>
      </div>
    }
  `,
})
export class WorkspaceLayoutComponent {
  readonly state = inject(AccountStateService);
  readonly ai = inject(AiOrchestratorService);

  readonly commentFilters: { id: 'todos' | 'duvida' | 'elogio' | 'spam' | 'gatilho'; label: string }[] = [
    { id: 'todos', label: 'Todos' },
    { id: 'duvida', label: 'Dúvidas' },
    { id: 'elogio', label: 'Elogios' },
    { id: 'gatilho', label: 'Gatilhos DM' },
    { id: 'spam', label: 'Spam' },
  ];

  readonly filteredComments = computed(() => {
    const f = this.state.cFilter();
    const list = this.state.accountInts().filter((i) => i.t === 'COMMENT' && !i.hidden);
    if (f === 'todos') return list;
    return list.filter((c) => c.cat === f);
  });

  readonly accountRules = computed(() =>
    this.state.rules().filter((r) => r.a === this.state.activeAccount().id)
  );

  readonly accountFlows = computed(() =>
    this.state.flows().filter((fl) => fl.a === this.state.activeAccount().id)
  );

  readonly accountContacts = computed(() =>
    this.state.contacts().filter((c) => c.a === this.state.activeAccount().id)
  );

  readonly activeTwin = computed(
    () => TWINS[this.state.activeAccount().id] || TWINS['a1']
  );

  readonly activeMetrics = computed(
    () => METRICS[this.state.activeAccount().id] || METRICS['a1']
  );

  private readonly headers: Record<WorkspaceView, { l: string; b: string }> = {
    overview: { l: 'visão ', b: 'geral' },
    content: { l: 'estúdio de ', b: 'conteúdo' },
    comments: { l: 'gestão de ', b: 'comentários' },
    inbox: { l: 'inbox ', b: 'unificado' },
    twin: { l: 'sua ', b: 'versão digital' },
    automations: { l: 'automações ', b: 'de direct' },
    audience: { l: 'audiência ', b: '& crm social' },
    prompts: { l: 'prompt ', b: 'studio' },
    analytics: { l: 'analytics ', b: '& insights' },
    skills: { l: 'skills ', b: '& comandos /' },
    accounts: { l: 'contas ', b: '& tom de voz' },
  };

  readonly currentHeader = computed(() => this.headers[this.state.view()]);

  toggleRightDock(tab: 'copilot' | 'activity'): void {
    if (this.state.isRightOpen() && this.state.rightTab() === tab) {
      this.state.rightOpen.set(false);
    } else {
      this.state.rightTab.set(tab);
      this.state.rightOpen.set(true);
    }
  }

  runSlashSkill(cmd: string): void {
    this.ai.prefill(cmd);
    if (!cmd.endsWith(' ')) {
      this.ai.send();
    }
  }

  hideSpamComments(): void {
    const spamIds = this.state
      .accountInts()
      .filter((i) => i.t === 'COMMENT' && i.cat === 'spam')
      .map((i) => i.id);
    if (spamIds.length === 0) {
      this.state.toast('Nenhum spam pendente para ocultar');
      return;
    }
    this.state.updateInteractionStatus(
      spamIds,
      { s: 'ARCHIVED', hidden: true },
      `${spamIds.length} spam(s) ocultado(s) via Graph API`
    );
  }

  batchApproveComments(): void {
    const pendingIds = this.state
      .accountInts()
      .filter((i) => i.t === 'COMMENT' && i.s === 'UNREAD' && i.cat !== 'spam')
      .map((i) => i.id);
    if (pendingIds.length === 0) {
      this.state.toast('Todos os comentários já foram respondidos');
      return;
    }
    this.state.updateInteractionStatus(
      pendingIds,
      { s: 'AI_REPLIED' },
      `${pendingIds.length} comentário(s) respondido(s) com IA`
    );
  }

  updateStyleRef(value: string): void {
    const id = this.state.activeAccount().id;
    this.state.styleOverrides.update((prev) => ({ ...prev, [id]: value }));
  }

  setComposerFormat(fmt: PostFormat): void {
    this.state.patchComposer({ t: fmt });
  }

  startResizeLeft(event: MouseEvent): void {
    event.preventDefault();
    const onMove = (e: MouseEvent) => {
      const w = Math.max(200, Math.min(360, e.clientX));
      this.state.leftWidth.set(w);
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }

  startResizeRight(event: MouseEvent): void {
    event.preventDefault();
    const onMove = (e: MouseEvent) => {
      const w = Math.max(290, Math.min(520, window.innerWidth - e.clientX));
      this.state.rightWidth.set(w);
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }
}
