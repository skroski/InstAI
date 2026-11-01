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
import { MetaCampaignsComponent } from '../meta-campaigns/meta-campaigns.component';
import { IcpStudioComponent } from '../icp-studio/icp-studio.component';
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
    MetaCampaignsComponent,
    IcpStudioComponent,
  ],
  template: `
    <div
      class="workspace"
      [class.left-collapsed]="state.isLeftCompact()"
      [class.right-closed]="!state.isRightOpen()"
      [style]="state.themeVariables()"
      [style.--left-w.px]="state.leftWidth()"
      [style.--right-w.px]="state.rightWidth()">

      <!-- ==================== COLUNA ESQUERDA: NAVEGAÇÃO ENXUTA ==================== -->
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

        <!-- Navigation Menu Estruturado em 6 Hubs -->
        <div class="flex-1 overflow-y-auto flex flex-col gap-1 pr-0.5 mt-2">
          <!-- 1. Visão Geral -->
          <button
            type="button"
            class="nav-item"
            [class.active]="state.view() === 'overview'"
            (click)="state.setView('overview')">
            <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <rect x="3" y="3" width="7" height="9" rx="1.5"/>
              <rect x="14" y="3" width="7" height="5" rx="1.5"/>
              <rect x="14" y="12" width="7" height="9" rx="1.5"/>
              <rect x="3" y="16" width="7" height="5" rx="1.5"/>
            </svg>
            <span class="nav-txt">visão geral</span>
          </button>

          <!-- 2. Conteúdo & Estúdio -->
          <button
            type="button"
            class="nav-item"
            [class.active]="state.view() === 'content'"
            (click)="state.setView('content')">
            <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <span class="nav-txt">conteúdo & estúdio</span>
            <span class="nav-badge">{{ state.accountPosts().length }}</span>
          </button>

          <!-- 3. Inbox & Conversas -->
          <button
            type="button"
            class="nav-item"
            [class.active]="state.view() === 'inbox'"
            (click)="state.setView('inbox')">
            <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span class="nav-txt">inbox & conversas</span>
            @if (totalUnread() > 0) {
              <span class="nav-badge warn">{{ totalUnread() }}</span>
            }
          </button>

          <!-- 4. Meta Ads & Crescimento -->
          <button
            type="button"
            class="nav-item"
            [class.active]="state.view() === 'campaigns'"
            (click)="state.setView('campaigns')">
            <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="6"/>
              <circle cx="12" cy="12" r="2"/>
            </svg>
            <span class="nav-txt">meta ads & público</span>
            <span class="nav-badge ai">{{ state.campaignMetrics().activeCount }} ativas</span>
          </button>

          <!-- 5. Automações & IA -->
          <button
            type="button"
            class="nav-item"
            [class.active]="state.view() === 'automations'"
            (click)="state.setView('automations')">
            <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z"/>
              <path d="M16 14h.01"/><path d="M8 14h.01"/>
              <path d="M5 20a7 7 0 0 1 14 0"/>
            </svg>
            <span class="nav-txt">automações & ia</span>
            <span class="nav-badge ai">ON</span>
          </button>

          <!-- 6. Contas & Ajustes -->
          <button
            type="button"
            class="nav-item"
            [class.active]="state.view() === 'accounts'"
            (click)="state.setView('accounts')">
            <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
            <span class="nav-txt">contas & ajustes</span>
          </button>
        </div>

        <!-- Sidebar Footer -->
        <div class="sidebar-foot">
          <div class="user-row">
            <div class="user-ava">CM</div>
            <div class="user-info">
              <div class="user-name">Codemix Studio</div>
              <div class="user-role">{{ state.accounts().length }} contas conectadas</div>
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
        <!-- Top Header Limpo & Elegante -->
        <header class="main-head">
          <button
            type="button"
            class="icon-btn"
            title="Recolher/expandir menu lateral"
            (click)="state.leftCompact.set(!state.isLeftCompact())">
            <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
          </button>

          <div class="main-title">
            <span class="light">{{ currentBreadcrumb().l }}</span><span class="bold">{{ currentBreadcrumb().b }}</span>
            <span class="crumb">/ {{ currentBreadcrumb().sub }}</span>
          </div>

          <div class="head-actions">
            <!-- Indicador Live da Meta Graph API -->
            <span class="live-status-chip hidden sm:inline-flex" title="Meta Graph API v26.0 ativa">
              <span class="live-dot"></span>
              <span>Meta API Live</span>
              <span class="live-sync-time">· {{ state.liveApi.lastSyncTime() }}</span>
            </span>

            <!-- Botão de Sincronizar e Variar Dados da API -->
            <button
              type="button"
              class="sync-api-btn"
              [class.loading]="state.liveApi.isSyncing()"
              (click)="state.syncWithLiveApiAndVaryData()"
              [disabled]="state.liveApi.isSyncing()"
              title="Consulta Meta Graph API e gera dados variados">
              <svg class="ico" [class.animate-spin]="state.liveApi.isSyncing()" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
              </svg>
              <span>{{ state.liveApi.isSyncing() ? 'Sincronizando...' : 'Variar Dados da API' }}</span>
            </button>

            <!-- Botão Copilot Chat -->
            <button
              type="button"
              class="icon-btn"
              [class.active]="state.isRightOpen() && state.rightTab() === 'copilot'"
              style="width: auto; padding: 0 11px; gap: 6px; font-size: 12px;"
              (click)="toggleRightDock('copilot')">
              <span class="w-2 h-2 rounded-full bg-[#f6bc03]"></span>
              <span>ai copilot</span>
            </button>
          </div>
        </header>

        <!-- Main Scrollable Viewport -->
        <div class="main-body relative">

          <!-- ==================== 1. VISÃO GERAL ==================== -->
          @if (state.view() === 'overview') {
            <div class="flex flex-col gap-4">
              <!-- KPI Grid -->
              <div class="kpi-grid">
                @for (k of activeMetrics().k; track k[0]) {
                  <div class="kpi">
                    <div class="kpi-top"><span>{{ k[0] }}</span><span class="kpi-delta">{{ k[2] }}</span></div>
                    <div class="kpi-val">{{ k[1] }}</div>
                    <div class="kpi-sub">últimos 30 dias · &#64;{{ state.activeAccount().user }}</div>
                  </div>
                }
              </div>

              <!-- Barra de Atalhos Rápidos da Operação -->
              <div class="flex items-center justify-between gap-3 p-3 rounded-[8px] bg-[var(--c-panel)] border border-[var(--c-border)] flex-wrap">
                <div class="flex items-center gap-2 text-xs text-[var(--c-text)]">
                  <span class="font-semibold">&#64;{{ state.activeAccount().user }}</span>
                  <span class="text-[var(--c-dim)]">· {{ state.accountPosts().length }} publicações · {{ state.campaignMetrics().activeCount }} campanhas ativas</span>
                </div>
                <div class="flex items-center gap-2 flex-wrap">
                  <cm-button variant="ghost" size="sm" (clicked)="state.quickPromoteWithLookalike('Público de Alta Conversão')">
                    <span>🎯 criar lookalike 1%</span>
                  </cm-button>
                  <cm-button variant="primary" size="sm" (clicked)="state.openComposer()">
                    <span>+ novo post com ia</span>
                  </cm-button>
                </div>
              </div>

              <div class="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
                <!-- Pipeline Editorial -->
                <div class="card-p lg:col-span-2">
                  <div class="card-head">
                    <div>
                      <div class="card-title">pipeline editorial recente</div>
                      <div class="card-sub">publicações prontas e agendadas para &#64;{{ state.activeAccount().user }}</div>
                    </div>
                    <cm-button variant="ghost" size="sm" (clicked)="state.setView('content')">abrir estúdio »</cm-button>
                  </div>
                  <div class="flex flex-col gap-2">
                    @for (p of state.accountPosts().slice(0, 5); track p.id) {
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

                <!-- Ações Rápidas com IA -->
                <div class="card-p">
                  <div class="card-head">
                    <div>
                      <div class="card-title">ações rápidas com IA</div>
                      <div class="card-sub">Multi-Engine (Claude · Codex · Gemini)</div>
                    </div>
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
                      (click)="runSlashSkill('/prompt-foto Editorial minimalista 4:5')">
                      <div class="font-mono text-xs text-[var(--c-acc)] font-semibold">/prompt-foto 4:5</div>
                      <div class="text-[11px] text-[var(--c-text-2)] mt-0.5">Gerar prompt técnico para Midjourney v6 / Flux</div>
                    </button>
                    <button
                      type="button"
                      class="p-2.5 rounded-[6px] bg-[var(--c-bg-elev)] border border-[var(--c-border)] hover:border-[#f1a10b] text-left transition-all cursor-pointer"
                      (click)="runSlashSkill('/auditoria-perfil')">
                      <div class="font-mono text-xs text-[var(--c-acc)] font-semibold">/auditoria-perfil</div>
                      <div class="text-[11px] text-[var(--c-text-2)] mt-0.5">Diagnóstico de engajamento e melhor horário</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          }

          <!-- ==================== 2. CONTEÚDO & ESTÚDIO ==================== -->
          @if (state.view() === 'content') {
            <div class="flex flex-col gap-4">
              <!-- Sub-navegação do Conteúdo -->
              <div class="subnav-bar">
                <button
                  type="button"
                  class="subnav-btn"
                  [class.active]="state.contentSubTab() === 'kanban'"
                  (click)="setContentTab('kanban')">
                  <span>Kanban</span>
                  <span class="subnav-badge">{{ state.accountPosts().length }}</span>
                </button>
                <button
                  type="button"
                  class="subnav-btn"
                  [class.active]="state.contentSubTab() === 'calendar'"
                  (click)="setContentTab('calendar')">
                  <span>Calendário Semanal</span>
                </button>
                <button
                  type="button"
                  class="subnav-btn"
                  [class.active]="state.contentSubTab() === 'prompts'"
                  (click)="setContentTab('prompts')">
                  <span>Prompts de Imagem</span>
                </button>
              </div>

              <!-- View do Kanban / Calendário -->
              @if (state.contentSubTab() === 'kanban' || state.contentSubTab() === 'calendar') {
                <app-content-studio />
              }

              <!-- View de Prompts Visuais -->
              @if (state.contentSubTab() === 'prompts') {
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div class="card-p flex flex-col gap-3">
                    <div class="card-head">
                      <div>
                        <div class="card-title">Style Reference da Conta</div>
                        <div class="card-sub">sufixo estético injetado em prompts de &#64;{{ state.activeAccount().user }}</div>
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
                        <div class="card-title">prompts vinculados aos posts</div>
                        <div class="card-sub">otimizados para Midjourney v6, Flux.1 Pro e Imagen 3</div>
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
            </div>
          }

          <!-- ==================== 3. INBOX & CONVERSAS ==================== -->
          @if (state.view() === 'inbox') {
            <div class="flex flex-col gap-4">
              <!-- Sub-navegação do Inbox -->
              <div class="subnav-bar">
                <button
                  type="button"
                  class="subnav-btn"
                  [class.active]="state.inboxSubTab() === 'dms'"
                  (click)="state.inboxSubTab.set('dms')">
                  <span>Directs (DMs)</span>
                  @if (state.unreadDmsCount() > 0) {
                    <span class="subnav-badge">{{ state.unreadDmsCount() }}</span>
                  }
                </button>
                <button
                  type="button"
                  class="subnav-btn"
                  [class.active]="state.inboxSubTab() === 'comments'"
                  (click)="state.inboxSubTab.set('comments')">
                  <span>Comentários & Moderação</span>
                  @if (state.unreadCommentsCount() > 0) {
                    <span class="subnav-badge">{{ state.unreadCommentsCount() }}</span>
                  }
                </button>
                <button
                  type="button"
                  class="subnav-btn"
                  [class.active]="state.inboxSubTab() === 'triggers'"
                  (click)="state.inboxSubTab.set('triggers')">
                  <span>Gatilhos Private Reply</span>
                  <span class="subnav-badge">{{ accountRules().length }}</span>
                </button>
                <button
                  type="button"
                  class="subnav-btn"
                  [class.active]="state.inboxSubTab() === 'audience'"
                  (click)="state.inboxSubTab.set('audience')">
                  <span>CRM & Leads Capturados</span>
                  <span class="subnav-badge">{{ accountContacts().length }}</span>
                </button>
              </div>

              <!-- View 1: DMs -->
              @if (state.inboxSubTab() === 'dms') {
                <app-unified-inbox />
              }

              <!-- View 2: Comentários -->
              @if (state.inboxSubTab() === 'comments') {
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
                    <div class="flex items-center gap-2 flex-wrap">
                      <cm-button variant="ghost" size="sm" (clicked)="hideSpamComments()">
                        ocultar spam
                      </cm-button>
                      <cm-button variant="primary" size="sm" (clicked)="batchApproveComments()">
                        aprovar pendentes com IA ({{ state.unreadCommentsCount() }})
                      </cm-button>
                    </div>
                  </div>

                  <div class="grid grid-cols-1 gap-3">
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
                </div>
              }

              <!-- View 3: Gatilhos de DM -->
              @if (state.inboxSubTab() === 'triggers') {
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div class="card-p lg:col-span-2 flex flex-col gap-3">
                    <div class="card-head">
                      <div>
                        <div class="card-title">gatilhos ativos comentário → DM</div>
                        <div class="card-sub">Private Replies API automatizada</div>
                      </div>
                    </div>
                    <div class="flex flex-col gap-2">
                      @for (r of accountRules(); track r.id) {
                        <div class="p-3.5 rounded-[6px] bg-[var(--c-bg-elev)] border border-[var(--c-border)] flex items-center justify-between">
                          <div>
                            <span class="font-mono text-xs font-bold text-[var(--c-acc)]">palavra: "{{ r.kw }}"</span>
                            <div class="text-xs text-[var(--c-text-2)] mt-0.5">Escopo: {{ r.post }}</div>
                            <div class="text-[11px] text-[var(--c-text-muted)] font-mono">Destino: {{ r.link }}</div>
                          </div>
                          <input
                            type="checkbox"
                            class="toggle toggle-sm toggle-primary"
                            [checked]="r.on"
                            (change)="state.toggleRule(r.id)" />
                        </div>
                      }
                    </div>
                  </div>

                  <div class="card-p h-fit flex flex-col gap-3">
                    <div class="card-head">
                      <div class="card-title">criar novo gatilho</div>
                    </div>
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
                      + ativar regra
                    </cm-button>
                  </div>
                </div>
              }

              <!-- View 4: CRM de Leads -->
              @if (state.inboxSubTab() === 'audience') {
                <div class="card-p">
                  <div class="card-head flex-wrap gap-2">
                    <div>
                      <div class="card-title">base de leads qualificados</div>
                      <div class="card-sub">contatos capturados via Direct & Comentários de &#64;{{ state.activeAccount().user }}</div>
                    </div>
                    <div class="flex items-center gap-2 flex-wrap">
                      <cm-button
                        variant="ghost"
                        size="sm"
                        (clicked)="state.quickPromoteWithLookalike('Leads Qualificados via Direct')">
                        <span>🎯 criar lookalike 1% na meta</span>
                      </cm-button>
                      <cm-button
                        variant="primary"
                        size="sm"
                        (clicked)="state.syncContactsToMeta('aud_1')">
                        <span>📤 sincronizar no meta ads</span>
                      </cm-button>
                    </div>
                  </div>

                  <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr class="border-b border-[var(--c-border)] text-[11px] font-mono uppercase text-[var(--c-text-muted)]">
                          <th class="py-2.5 px-3">Usuário</th>
                          <th class="py-2.5 px-3">E-mail</th>
                          <th class="py-2.5 px-3">Origem</th>
                          <th class="py-2.5 px-3">ICP Score</th>
                          <th class="py-2.5 px-3">Meta Ads</th>
                          <th class="py-2.5 px-3">Última Interação</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (ct of accountContacts(); track ct.id) {
                          <tr class="border-b border-[var(--c-border)] hover:bg-[var(--c-surface)]">
                            <td class="py-2.5 px-3 font-mono font-semibold text-[var(--c-text)]">&#64;{{ ct.u }}</td>
                            <td class="py-2.5 px-3 font-mono text-[11px] text-[var(--c-text-muted)]">{{ ct.email || '—' }}</td>
                            <td class="py-2.5 px-3 text-[var(--c-text-2)]">{{ ct.src }}</td>
                            <td class="py-2.5 px-3">
                              <span class="font-mono font-bold" [class.text-emerald-400]="(ct.icpScore || 0) >= 80" [class.text-amber-400]="(ct.icpScore || 0) < 80">
                                {{ ct.icpScore || 0 }} pts ({{ ct.icpTier === 'TIER_1_OURO' ? 'Ouro' : 'Prata' }})
                              </span>
                            </td>
                            <td class="py-2.5 px-3 whitespace-nowrap">
                              @if (ct.metaSynced) {
                                <span class="text-[10px] font-mono text-emerald-400">● Sincronizado</span>
                              } @else {
                                <span class="text-[10px] font-mono text-amber-500">○ Pendente</span>
                              }
                            </td>
                            <td class="py-2.5 px-3 font-mono text-[var(--c-text-muted)]">{{ ct.last }}</td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              }
            </div>
          }

          <!-- ==================== 4. META ADS & CRESCIMENTO ==================== -->
          @if (state.view() === 'campaigns') {
            <div class="flex flex-col gap-4">
              <!-- Sub-navegação do Módulo Meta Ads -->
              <div class="subnav-bar">
                <button
                  type="button"
                  class="subnav-btn"
                  [class.active]="state.campaignSubTab() === 'campaigns'"
                  (click)="state.campaignSubTab.set('campaigns')">
                  <span>Campanhas & Meta Ads</span>
                  <span class="subnav-badge">{{ state.accountCampaigns().length }}</span>
                </button>
                <button
                  type="button"
                  class="subnav-btn"
                  [class.active]="state.campaignSubTab() === 'icp'"
                  (click)="state.campaignSubTab.set('icp')">
                  <span>ICP Studio (Matriz 360°)</span>
                  <span class="subnav-badge ai">{{ state.icpStats().tier1Count }} ouro</span>
                </button>
              </div>

              @if (state.campaignSubTab() === 'campaigns') {
                <app-meta-campaigns />
              } @else {
                <app-icp-studio />
              }
            </div>
          }

          <!-- ==================== 5. AUTOMAÇÕES & IA ==================== -->
          @if (state.view() === 'automations') {
            <div class="flex flex-col gap-4">
              <!-- Sub-navegação de Automações & IA -->
              <div class="subnav-bar">
                <button
                  type="button"
                  class="subnav-btn"
                  [class.active]="state.automationSubTab() === 'twin'"
                  (click)="state.automationSubTab.set('twin')">
                  <span>Versão Digital (Twin)</span>
                </button>
                <button
                  type="button"
                  class="subnav-btn"
                  [class.active]="state.automationSubTab() === 'flows'"
                  (click)="state.automationSubTab.set('flows')">
                  <span>Fluxos ManyChat</span>
                  <span class="subnav-badge">{{ accountFlows().length }}</span>
                </button>
                <button
                  type="button"
                  class="subnav-btn"
                  [class.active]="state.automationSubTab() === 'skills'"
                  (click)="state.automationSubTab.set('skills')">
                  <span>Catálogo de Skills (/)</span>
                  <span class="subnav-badge">{{ state.allCommands(true).length }}</span>
                </button>
                <button
                  type="button"
                  class="subnav-btn"
                  [class.active]="state.automationSubTab() === 'analytics'"
                  (click)="state.automationSubTab.set('analytics')">
                  <span>Analytics & Retenção</span>
                </button>
              </div>

              <!-- View 1: Digital Twin -->
              @if (state.automationSubTab() === 'twin') {
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div class="card-p flex flex-col gap-3">
                    <div class="card-head">
                      <div>
                        <div class="card-title">configuração da Versão Digital</div>
                        <div class="card-sub">treinada na voz e ofertas de &#64;{{ state.activeAccount().user }}</div>
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
                      <div class="text-xs font-semibold mb-2">domínios autorizados</div>
                      <div class="flex flex-wrap gap-1.5">
                        @for (f of state.getTwinSettings().fields; track f.l) {
                          <span class="chip" [class.green]="f.on" [class.orange]="!f.on">
                            {{ f.l }}
                          </span>
                        }
                      </div>
                    </div>
                  </div>

                  <!-- Playground Comparativo -->
                  <div class="card-p flex flex-col gap-3">
                    <div class="card-head">
                      <div>
                        <div class="card-title">simulador da Versão Digital</div>
                        <div class="card-sub">teste perguntas frequentes dos seguidores</div>
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
                      <div class="p-3 rounded-[6px] bg-[#7bbf4a]/10 border border-[#7bbf4a]/35 flex flex-col gap-2">
                        <div class="text-[10px] font-mono uppercase text-[var(--c-ok)]">✓ Resposta da sua Versão Digital</div>
                        @for (step of ans.t; track step) {
                          <div class="text-xs text-[var(--c-text)] p-2 rounded-[4px] bg-[var(--c-bg-elev)]">{{ step }}</div>
                        }
                      </div>
                    }
                  </div>
                </div>
              }

              <!-- View 2: Fluxos ManyChat -->
              @if (state.automationSubTab() === 'flows') {
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
                        <div class="grid grid-cols-4 gap-2 pt-2 mt-2 border-t border-[var(--c-border)] text-center text-xs">
                          <div><div class="font-bold">{{ fl.stats.sent }}</div><div class="text-[10px] text-[var(--c-text-muted)]">envios</div></div>
                          <div><div class="font-bold">{{ fl.stats.open }}</div><div class="text-[10px] text-[var(--c-text-muted)]">abertura</div></div>
                          <div><div class="font-bold">{{ fl.stats.clicks }}</div><div class="text-[10px] text-[var(--c-text-muted)]">cliques</div></div>
                          <div><div class="font-bold text-[var(--c-ok)]">{{ fl.stats.leads }}</div><div class="text-[10px] text-[var(--c-text-muted)]">leads</div></div>
                        </div>
                      </div>
                    }
                  </div>

                  @if (state.currentFlow(); as flow) {
                    <div class="card-p lg:col-span-2 flex flex-col gap-3">
                      <div class="card-head">
                        <div>
                          <div class="card-title">{{ flow.name }}</div>
                          <div class="card-sub">{{ flow.nodes.length }} etapas configuradas</div>
                        </div>
                        <cm-button variant="primary" size="sm" (clicked)="state.runFlowSimulator(flow.nodes.length)">
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
                              <span class="text-xs font-semibold text-[var(--c-text)] uppercase font-mono">{{ node.t }}</span>
                              <div class="text-xs text-[var(--c-text)] mt-1">{{ node.text }}</div>
                            </div>
                          </div>
                        }
                      </div>
                    </div>
                  }
                </div>
              }

              <!-- View 3: Skills / -->
              @if (state.automationSubTab() === 'skills') {
                <div class="card-p">
                  <div class="card-head">
                    <div>
                      <div class="card-title">catálogo de Skills e Comandos /</div>
                      <div class="card-sub">integradas com Claude 3.7, Codex GPT-4o e Gemini 2.5 Pro</div>
                    </div>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    @for (sk of state.allCommands(true); track sk.c) {
                      <div class="p-3 rounded-[6px] bg-[var(--c-bg-elev)] border border-[var(--c-border)] flex flex-col justify-between gap-2">
                        <div>
                          <div class="flex items-center justify-between mb-1">
                            <span class="font-mono text-xs font-bold text-[var(--c-acc)]">/{{ sk.c }}</span>
                            <span class="chip purple">{{ sk.e }}</span>
                          </div>
                          <div class="text-xs text-[var(--c-text-2)]">{{ sk.d }}</div>
                        </div>
                        <button
                          type="button"
                          class="text-[11px] font-mono text-[var(--c-link)] hover:underline text-right cursor-pointer"
                          (click)="runSlashSkill('/' + sk.c + ' ')">
                          executar »
                        </button>
                      </div>
                    }
                  </div>
                </div>
              }

              <!-- View 4: Analytics -->
              @if (state.automationSubTab() === 'analytics') {
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div class="card-p">
                    <div class="card-head">
                      <div class="card-title">retenção média por formato</div>
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
                      <div class="card-title">plano de ação sugerido</div>
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
              }
            </div>
          }

          <!-- ==================== 6. CONTAS & AJUSTES ==================== -->
          @if (state.view() === 'accounts') {
            <app-accounts-manager />
          }
        </div>
      </main>

      <!-- ==================== COLUNA DIREITA: AI COPILOT DOCK ==================== -->
      @if (state.isRightOpen()) {
        <aside class="right-rail relative">
          <div class="resize-handle right" (mousedown)="startResizeRight($event)" title="Arraste para redimensionar"></div>
          <app-ai-copilot-chat (closeDock)="state.rightOpen.set(false)" />
        </aside>
      }
    </div>

    <!-- ==================== MODAL: COMPOSER ==================== -->
    @if (state.comp(); as comp) {
      <div class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="w-full max-w-3xl rounded-[10px] bg-[var(--c-panel)] border border-[var(--c-border-strong)] shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-5">
          <div class="p-5 md:col-span-3 flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-bold text-[var(--c-text)]">Novo Post Multi-Conta</h3>
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
                placeholder="Ex: 3 sinais de que seu produto precisa de IA"
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
                placeholder="Digite a legenda..."
                [ngModel]="comp.cap"
                (ngModelChange)="state.patchComposer({ cap: $event })"></textarea>
            </div>

            <div class="flex items-center justify-end gap-2 pt-2">
              <cm-button variant="ghost" size="sm" (clicked)="state.saveComposerPosts('DRAFT')">salvar rascunho</cm-button>
              <cm-button variant="primary" size="sm" [arrow]="true" (clicked)="state.saveComposerPosts('SCHEDULED')">agendar publicação</cm-button>
            </div>
          </div>

          <div class="p-5 bg-[var(--c-bg-elev)] border-l border-[var(--c-border)] md:col-span-2 flex flex-col justify-between">
            <div>
              <div class="text-[10px] font-mono uppercase text-[var(--c-text-muted)] mb-2">Preview · &#64;{{ state.activeAccount().user }}</div>
              <div class="aspect-[4/5] rounded-[6px] bg-gradient-to-br from-[#2b2b2b] via-[#1f1f1f] to-[#f1a10b]/25 border border-[var(--c-border)] p-4 flex flex-col justify-between">
                <div class="text-[10px] font-mono text-[#fbd23a]">
                  {{ comp.t }}
                </div>
                <div class="text-sm font-bold text-white leading-snug">
                  {{ comp.topic || 'Seu título aparecerá em destaque aqui' }}
                </div>
                <div class="text-[10px] font-mono text-white/60">
                  &#64;{{ state.activeAccount().user }}
                </div>
              </div>
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

  readonly totalUnread = computed(() => this.state.unreadCommentsCount() + this.state.unreadDmsCount());

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

  readonly currentBreadcrumb = computed(() => {
    const v = this.state.view();
    const acc = this.state.activeAccount().user;
    if (v === 'overview') return { l: 'visão ', b: 'geral', sub: `@${acc}` };
    if (v === 'content') {
      const sub = this.state.contentSubTab();
      const subName = sub === 'calendar' ? 'calendário' : sub === 'prompts' ? 'prompts de imagem' : 'kanban';
      return { l: 'estúdio de ', b: 'conteúdo', sub: subName };
    }
    if (v === 'inbox') {
      const sub = this.state.inboxSubTab();
      const subName =
        sub === 'comments'
          ? 'comentários & moderação'
          : sub === 'triggers'
            ? 'gatilhos de dm'
            : sub === 'audience'
              ? 'crm de leads'
              : 'directs (dms)';
      return { l: 'inbox & ', b: 'conversas', sub: subName };
    }
    if (v === 'campaigns') {
      const sub = this.state.campaignSubTab();
      const subName = sub === 'icp' ? 'icp studio' : 'meta ads manager';
      return { l: 'meta ads & ', b: 'crescimento', sub: subName };
    }
    if (v === 'automations') {
      const sub = this.state.automationSubTab();
      const subName =
        sub === 'flows'
          ? 'fluxos manychat'
          : sub === 'skills'
            ? 'skills /'
            : sub === 'analytics'
              ? 'analytics & retenção'
              : 'versão digital (twin)';
      return { l: 'automações & ', b: 'inteligência', sub: subName };
    }
    if (v === 'accounts') {
      return { l: 'contas & ', b: 'ajustes', sub: `@${acc}` };
    }
    return { l: 'visão ', b: 'geral', sub: `@${acc}` };
  });

  setContentTab(tab: 'kanban' | 'calendar' | 'prompts'): void {
    this.state.contentSubTab.set(tab);
    if (tab === 'kanban' || tab === 'calendar') {
      this.state.contentMode.set(tab);
    }
  }

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
