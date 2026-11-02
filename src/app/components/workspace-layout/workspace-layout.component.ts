import { Component, inject, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountStateService, CAPTION_MAX, HASHTAGS_MAX, TOPIC_MAX, WorkspaceView } from '../../services/account-state.service';
import { AiOrchestratorService } from '../../services/ai-orchestrator.service';
import { CodemixButtonComponent } from '../codemix-button.component';
import { AccountSwitcherComponent } from '../account-switcher/account-switcher.component';
import { ContentStudioComponent } from '../content-studio/content-studio.component';
import { UnifiedInboxComponent } from '../unified-inbox/unified-inbox.component';
import { AccountsManagerComponent } from '../accounts-manager/accounts-manager.component';
import { AiCopilotChatComponent } from '../ai-copilot-chat/ai-copilot-chat.component';
import { MetaCampaignsComponent } from '../meta-campaigns/meta-campaigns.component';
import { IcpStudioComponent } from '../icp-studio/icp-studio.component';
import { MediaUploaderComponent } from '../media-uploader/media-uploader.component';
import { ContactItem, InteractionItem, PostFormat, SkillCommand, TWINS, METRICS, EMPTY_TWIN, EMPTY_METRICS } from '../../data/seed-data';
import { PagerComponent } from '../../shared/pager.component';
import { cmpNum, cmpText, createPager, createSorter } from '../../shared/list-tools';
import { addDays, relativeTimeKey, todayIso } from '../../shared/dates';

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
    MediaUploaderComponent,
    PagerComponent,
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
          <div class="brand-logo flex items-center gap-2">
            <div class="w-7 h-7 rounded-[7px] bg-gradient-to-br from-[#f1a10b] via-[#e1306c] to-[#833ab4] flex items-center justify-center text-white font-black text-[13px] shadow-sm shrink-0">
              ⚡
            </div>
            <div class="logo-full flex items-baseline tracking-tight">
              <span class="text-[17px] font-bold text-[var(--c-text)] font-display">Inst<span class="text-[#f1a10b]">AI</span></span>
            </div>
          </div>
          <span class="brand-tag">Hub</span>
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
            <div class="user-ava font-bold">IA</div>
            <div class="user-info">
              <div class="user-name">InstAI Studio</div>
              <div class="user-role">{{ state.accounts().length }} contas cadastradas</div>
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
            <span
              class="live-status-chip hidden sm:inline-flex"
              [title]="state.liveApi.metaApiConnected() ? 'Meta Graph API v22.0 respondeu na última sincronização' : 'Meta Graph API ainda não sincronizada nesta sessão'"
            >
              <span class="live-dot" [style.opacity]="state.liveApi.metaApiConnected() ? 1 : 0.35"></span>
              <span>{{ state.liveApi.metaApiConnected() ? 'Meta API conectada' : 'Meta API não sincronizada' }}</span>
              <span class="live-sync-time">· {{ state.liveApi.lastSyncTime() }}</span>
            </span>

            <!-- Botão de sincronização com a Meta Graph API -->
            <button
              type="button"
              class="sync-api-btn"
              [class.loading]="state.liveApi.isSyncing()"
              (click)="state.syncWithLiveApiAndVaryData()"
              [disabled]="state.liveApi.isSyncing()"
              title="Busca contas, campanhas e publicações na Meta Graph API">
              <svg class="ico" [class.animate-spin]="state.liveApi.isSyncing()" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
              </svg>
              <span>{{ state.liveApi.isSyncing() ? 'Sincronizando...' : 'Sincronizar com a Meta' }}</span>
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
                  [class.active]="state.contentSubTab() === 'grid'"
                  (click)="setContentTab('grid')">
                  <span>Grid de Mídia</span>
                </button>
                <button
                  type="button"
                  class="subnav-btn"
                  [class.active]="state.contentSubTab() === 'list'"
                  (click)="setContentTab('list')">
                  <span>Lista</span>
                </button>
                <button
                  type="button"
                  class="subnav-btn"
                  [class.active]="state.contentSubTab() === 'feed'"
                  (click)="setContentTab('feed')">
                  <span>Feed 3x3</span>
                </button>
                <button
                  type="button"
                  class="subnav-btn"
                  [class.active]="state.contentSubTab() === 'calendar'"
                  (click)="setContentTab('calendar')">
                  <span>Calendário</span>
                </button>
                <button
                  type="button"
                  class="subnav-btn"
                  [class.active]="state.contentSubTab() === 'prompts'"
                  (click)="setContentTab('prompts')">
                  <span>Prompts de Imagem</span>
                </button>
              </div>

              <!-- View do Content Studio (Kanban, Grid, Feed, Calendário) -->
              @if (state.contentSubTab() !== 'prompts') {
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

                    <div class="flex items-center gap-2 flex-wrap">
                      <input
                        type="search"
                        class="flex-1 min-w-[180px] px-2.5 py-1.5 rounded-[6px] bg-[var(--c-bg-elev)] border border-[var(--c-border)] text-xs text-[var(--c-text)] cm-input-focus"
                        placeholder="Buscar prompt ou tópico..."
                        aria-label="Buscar prompts"
                        [ngModel]="promptQuery()"
                        (ngModelChange)="promptQuery.set($event)" />
                      <select
                        class="px-2.5 py-1.5 rounded-[6px] bg-[var(--c-bg-elev)] border border-[var(--c-border)] text-xs text-[var(--c-text)] cursor-pointer cm-input-focus"
                        aria-label="Filtrar por proporção"
                        [ngModel]="promptRatio()"
                        (ngModelChange)="promptRatio.set($event)">
                        <option value="ALL">Todas as proporções</option>
                        @for (r of promptRatios(); track r) {
                          <option [value]="r">{{ r }}</option>
                        }
                      </select>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                      @for (it of promptItems(); track it.key) {
                        <div class="p-3 rounded-[6px] bg-[var(--c-bg-elev)] border border-[var(--c-border)] flex flex-col justify-between gap-2">
                          <div>
                            <div class="flex items-center justify-between mb-1">
                              <span class="text-xs font-semibold text-[var(--c-text)] truncate">{{ it.topic }}</span>
                              <span class="chip purple">{{ it.ar }}</span>
                            </div>
                            <div class="text-[11px] text-[var(--c-text-muted)] mb-1">{{ it.title }}</div>
                            <div class="font-mono text-[11px] text-[var(--c-text-2)] bg-[var(--c-bg)] p-2.5 rounded-[4px] border border-[var(--c-border)] select-all">
                              {{ it.x }}
                            </div>
                          </div>
                          <div class="flex justify-end">
                            <button
                              type="button"
                              class="text-[11px] font-mono text-[var(--c-link)] hover:underline cursor-pointer"
                              (click)="state.copyText(it.x, it.key)">
                              {{ state.copied() === it.key ? 'copiado!' : 'copiar prompt' }}
                            </button>
                          </div>
                        </div>
                      } @empty {
                        <p class="md:col-span-2 py-8 text-center text-xs text-[var(--c-text-muted)]">Nenhum prompt encontrado.</p>
                      }
                    </div>
                    <app-pager [pager]="promptPager" label="prompts" />
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

                  <div class="flex items-center gap-2 flex-wrap">
                    <input
                      type="search"
                      class="flex-1 min-w-[200px] px-2.5 py-1.5 rounded-[6px] bg-[var(--c-bg-elev)] border border-[var(--c-border)] text-xs text-[var(--c-text)] cm-input-focus"
                      placeholder="Buscar por usuário ou texto do comentário..."
                      aria-label="Buscar comentários"
                      [ngModel]="commentQuery()"
                      (ngModelChange)="commentQuery.set($event)" />
                    <select
                      class="px-2.5 py-1.5 rounded-[6px] bg-[var(--c-bg-elev)] border border-[var(--c-border)] text-xs text-[var(--c-text)] cursor-pointer cm-input-focus"
                      aria-label="Filtrar por status"
                      [ngModel]="commentStatus()"
                      (ngModelChange)="commentStatus.set($event)">
                      <option value="ALL">Todos os status</option>
                      <option value="UNREAD">Não lidos</option>
                      <option value="AI_REPLIED">Respondidos com IA</option>
                      <option value="HUMAN_ESCALATED">Escalados</option>
                      <option value="ARCHIVED">Arquivados</option>
                    </select>
                    <select
                      class="px-2.5 py-1.5 rounded-[6px] bg-[var(--c-bg-elev)] border border-[var(--c-border)] text-xs text-[var(--c-text)] cursor-pointer cm-input-focus"
                      aria-label="Ordenar por"
                      [ngModel]="commentSorter.key()"
                      (ngModelChange)="commentSorter.set($event, $event === 'recent' ? 'desc' : 'asc')">
                      @for (o of commentSorter.options; track o.key) {
                        <option [value]="o.key">Ordenar: {{ o.label }}</option>
                      }
                    </select>
                    <button
                      type="button"
                      class="w-8 h-8 rounded-[6px] bg-[var(--c-bg-elev)] border border-[var(--c-border)] text-xs cursor-pointer hover:border-[var(--c-acc)]"
                      [attr.aria-label]="commentSorter.dir() === 'asc' ? 'Ordem crescente. Inverter' : 'Ordem decrescente. Inverter'"
                      (click)="commentSorter.toggleDir()">
                      {{ commentSorter.dir() === 'asc' ? '▲' : '▼' }}
                    </button>
                  </div>

                  <div class="grid grid-cols-1 gap-3">
                    @for (c of commentItems(); track c.id) {
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
                    } @empty {
                      <p class="py-10 text-center text-xs text-[var(--c-text-muted)]">Nenhum comentário encontrado com os filtros atuais.</p>
                    }
                  </div>
                  <app-pager [pager]="commentPager" label="comentários" />
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
                    <form class="flex flex-col gap-3" novalidate (submit)="$event.preventDefault(); state.addKeywordRule('todos os posts')">
                      <div class="flex flex-col gap-1">
                        <label for="rule-kw" class="text-[11px] font-mono text-[var(--c-text-muted)]">Palavra-chave</label>
                        <input
                          id="rule-kw"
                          name="ruleKw"
                          type="text"
                          maxlength="30"
                          autocomplete="off"
                          autocapitalize="characters"
                          class="w-full px-2.5 py-1.5 rounded-[6px] bg-[var(--c-bg-elev)] border text-xs text-[var(--c-text)] cm-input-focus"
                          [style.border-color]="state.ruleTried() && state.ruleIssues().kw ? 'var(--c-err)' : 'var(--c-border)'"
                          [attr.aria-invalid]="state.ruleTried() && !!state.ruleIssues().kw"
                          [attr.aria-describedby]="'rule-kw-err'"
                          placeholder="ex: AGENTE"
                          [ngModel]="state.newKw()"
                          (ngModelChange)="state.newKw.set($event)" />
                        <p id="rule-kw-err" class="text-[11px] text-[var(--c-err)] min-h-[14px]" role="alert">
                          {{ state.ruleTried() ? state.ruleIssues().kw : '' }}
                        </p>
                      </div>
                      <div class="flex flex-col gap-1">
                        <label for="rule-link" class="text-[11px] font-mono text-[var(--c-text-muted)]">Link enviado por DM</label>
                        <input
                          id="rule-link"
                          name="ruleLink"
                          type="url"
                          inputmode="url"
                          autocomplete="off"
                          class="w-full px-2.5 py-1.5 rounded-[6px] bg-[var(--c-bg-elev)] border text-xs text-[var(--c-text)] cm-input-focus"
                          [style.border-color]="state.ruleTried() && state.ruleIssues().link ? 'var(--c-err)' : 'var(--c-border)'"
                          [attr.aria-invalid]="state.ruleTried() && !!state.ruleIssues().link"
                          [attr.aria-describedby]="'rule-link-err'"
                          placeholder="https://..."
                          [ngModel]="state.newLink()"
                          (ngModelChange)="state.newLink.set($event)" />
                        <p id="rule-link-err" class="text-[11px] text-[var(--c-err)] min-h-[14px]" role="alert">
                          {{ state.ruleTried() ? state.ruleIssues().link : '' }}
                        </p>
                      </div>
                      <cm-button variant="primary" size="sm" [fullWidth]="true" (clicked)="state.addKeywordRule('todos os posts')">
                        + ativar regra
                      </cm-button>
                    </form>
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

                  <div class="flex items-center gap-2 flex-wrap mb-3">
                    <input
                      type="search"
                      class="flex-1 min-w-[200px] px-2.5 py-1.5 rounded-[6px] bg-[var(--c-bg-elev)] border border-[var(--c-border)] text-xs text-[var(--c-text)] cm-input-focus"
                      placeholder="Buscar por usuário, e-mail ou tag..."
                      aria-label="Buscar leads"
                      [ngModel]="crmQuery()"
                      (ngModelChange)="crmQuery.set($event)" />
                    <select
                      class="px-2.5 py-1.5 rounded-[6px] bg-[var(--c-bg-elev)] border border-[var(--c-border)] text-xs text-[var(--c-text)] cursor-pointer cm-input-focus"
                      aria-label="Filtrar por origem"
                      [ngModel]="crmSource()"
                      (ngModelChange)="crmSource.set($event)">
                      <option value="ALL">Todas as origens</option>
                      @for (src of crmSources(); track src) {
                        <option [value]="src">{{ src }}</option>
                      }
                    </select>
                    <select
                      class="px-2.5 py-1.5 rounded-[6px] bg-[var(--c-bg-elev)] border border-[var(--c-border)] text-xs text-[var(--c-text)] cursor-pointer cm-input-focus"
                      aria-label="Filtrar por tier"
                      [ngModel]="crmTier()"
                      (ngModelChange)="crmTier.set($event)">
                      <option value="ALL">Todos os tiers</option>
                      <option value="TIER_1_OURO">Ouro</option>
                      <option value="TIER_2_PRATA">Prata</option>
                    </select>
                    <select
                      class="px-2.5 py-1.5 rounded-[6px] bg-[var(--c-bg-elev)] border border-[var(--c-border)] text-xs text-[var(--c-text)] cursor-pointer cm-input-focus"
                      aria-label="Filtrar por sincronização"
                      [ngModel]="crmSync()"
                      (ngModelChange)="crmSync.set($event)">
                      <option value="ALL">Meta Ads: todos</option>
                      <option value="SYNCED">Sincronizados</option>
                      <option value="PENDING">Pendentes</option>
                    </select>
                  </div>

                  <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr class="border-b border-[var(--c-border)] text-[11px] font-mono uppercase text-[var(--c-text-muted)]">
                          @for (col of crmColumns; track col.key) {
                            <th class="py-2.5 px-3" [attr.aria-sort]="crmSorter.ariaSort(col.key)">
                              <button type="button" class="uppercase cursor-pointer hover:text-[var(--c-text)]" (click)="crmSorter.toggle(col.key)">
                                {{ col.label }} {{ crmSorter.indicator(col.key) }}
                              </button>
                            </th>
                          }
                        </tr>
                      </thead>
                      <tbody>
                        @for (ct of crmItems(); track ct.id) {
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
                        } @empty {
                          <tr>
                            <td colspan="6" class="py-10 text-center text-[var(--c-text-muted)]">Nenhum lead encontrado com os filtros atuais.</td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                  <app-pager [pager]="crmPager" label="leads" />
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
                  <div class="flex items-center gap-2 flex-wrap mb-3">
                    <input
                      type="search"
                      class="flex-1 min-w-[200px] px-2.5 py-1.5 rounded-[6px] bg-[var(--c-bg-elev)] border border-[var(--c-border)] text-xs text-[var(--c-text)] cm-input-focus"
                      placeholder="Buscar comando ou descrição..."
                      aria-label="Buscar skills"
                      [ngModel]="skillQuery()"
                      (ngModelChange)="skillQuery.set($event)" />
                    <select
                      class="px-2.5 py-1.5 rounded-[6px] bg-[var(--c-bg-elev)] border border-[var(--c-border)] text-xs text-[var(--c-text)] cursor-pointer cm-input-focus"
                      aria-label="Filtrar por engine"
                      [ngModel]="skillEngine()"
                      (ngModelChange)="skillEngine.set($event)">
                      <option value="ALL">Todas as engines</option>
                      <option value="claude">Claude</option>
                      <option value="codex">Codex</option>
                      <option value="gemini">Gemini</option>
                      <option value="auto">Auto</option>
                    </select>
                    <select
                      class="px-2.5 py-1.5 rounded-[6px] bg-[var(--c-bg-elev)] border border-[var(--c-border)] text-xs text-[var(--c-text)] cursor-pointer cm-input-focus"
                      aria-label="Ordenar por"
                      [ngModel]="skillSorter.key()"
                      (ngModelChange)="skillSorter.set($event, 'asc')">
                      @for (o of skillSorter.options; track o.key) {
                        <option [value]="o.key">Ordenar: {{ o.label }}</option>
                      }
                    </select>
                    <button
                      type="button"
                      class="w-8 h-8 rounded-[6px] bg-[var(--c-bg-elev)] border border-[var(--c-border)] text-xs cursor-pointer hover:border-[var(--c-acc)]"
                      [attr.aria-label]="skillSorter.dir() === 'asc' ? 'Ordem crescente. Inverter' : 'Ordem decrescente. Inverter'"
                      (click)="skillSorter.toggleDir()">
                      {{ skillSorter.dir() === 'asc' ? '▲' : '▼' }}
                    </button>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    @for (sk of skillItems(); track sk.c) {
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
                    } @empty {
                      <p class="md:col-span-2 lg:col-span-3 py-10 text-center text-xs text-[var(--c-text-muted)]">Nenhuma skill encontrada.</p>
                    }
                  </div>
                  <app-pager [pager]="skillPager" label="skills" />
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
      <div
        class="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 md:p-6 overflow-y-auto animate-cm-fade"
        (click)="state.closeComposer()">
        <div
          class="w-full max-w-4xl max-h-[92vh] rounded-2xl bg-[var(--c-panel)] border border-[var(--c-border-strong)] shadow-2xl overflow-y-auto grid grid-cols-1 md:grid-cols-5 my-auto animate-cm-scale"
          (click)="$event.stopPropagation()">
          <div class="p-5 md:col-span-3 flex flex-col gap-3.5">
            <!-- Modal Header com Botão Fechar Premium -->
            <div class="flex items-center justify-between pb-3 border-b border-[var(--c-border)]">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-[#ffcb05] to-[#f58220] flex items-center justify-center text-[#1f1f1f] shadow-md font-bold text-base">
                  <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </div>
                <div>
                  <h3 class="text-sm font-bold text-[var(--c-text)] leading-tight flex items-center gap-2">
                    <span>Novo Post Multi-Conta</span>
                    <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[rgba(246,188,3,0.15)] text-[var(--c-acc)] border border-[rgba(241,161,11,0.3)]">
                      Meta Graph v22
                    </span>
                  </h3>
                  <p class="text-[11px] text-[var(--c-text-muted)] font-mono">Agendamento inteligente & mídias com IA</p>
                </div>
              </div>

              <!-- BOTÃO FECHAR MODERNO COM SVG E ANIMAÇÃO -->
              <button
                type="button"
                class="modal-close-btn"
                title="Fechar modal (ESC)"
                aria-label="Fechar modal"
                (click)="state.closeComposer()">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <!-- Contas de Destino (Multi-Tenant) -->
            <div>
              <label class="text-[11px] font-mono text-[var(--c-text-muted)] block mb-1.5">
                Contas de Destino (Publicação Cruzada)
              </label>
              <div class="flex items-center gap-1.5 flex-wrap">
                @for (acc of state.accounts(); track acc.id) {
                  <button
                    type="button"
                    class="px-2.5 py-1 rounded-full text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer"
                    [style.background]="isAccountSelectedInComposer(acc.id) ? 'rgba(246,188,3,0.18)' : 'var(--c-surface)'"
                    [style.border]="isAccountSelectedInComposer(acc.id) ? '1px solid #f1a10b' : '1px solid var(--c-border)'"
                    [style.color]="isAccountSelectedInComposer(acc.id) ? 'var(--c-acc)' : 'var(--c-text2)'"
                    [attr.aria-pressed]="isAccountSelectedInComposer(acc.id)"
                    (click)="toggleComposerAccount(acc.id)">
                    <span class="w-1.5 h-1.5 rounded-full bg-[var(--c-acc)]"></span>
                    <span>&#64;{{ acc.user }}</span>
                    @if (isAccountSelectedInComposer(acc.id)) {
                      <span class="text-[10px] font-bold">✓</span>
                    }
                  </button>
                }
              </div>
            </div>

            <!-- Formato (Segmented Visual Cards) -->
            <div>
              <label class="text-[11px] font-mono text-[var(--c-text-muted)] block mb-1.5">Formato de Publicação</label>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  class="px-2 py-2 rounded-lg text-xs font-medium transition-all flex flex-col items-center gap-1 cursor-pointer"
                  [style.background]="comp.t === 'CAROUSEL' ? 'rgba(246,188,3,0.16)' : 'var(--c-bg-elev)'"
                  [style.border]="comp.t === 'CAROUSEL' ? '1px solid #f1a10b' : '1px solid var(--c-border)'"
                  [style.color]="comp.t === 'CAROUSEL' ? 'var(--c-acc)' : 'var(--c-text2)'"
                  [attr.aria-pressed]="comp.t === 'CAROUSEL'"
                  (click)="setComposerFormat('CAROUSEL')">
                  <span class="text-base">🗂</span>
                  <span class="font-semibold text-[11.5px]">Carrossel</span>
                  <span class="text-[9.5px] opacity-75 font-mono">4:5 até 10 fotos</span>
                </button>
                <button
                  type="button"
                  class="px-2 py-2 rounded-lg text-xs font-medium transition-all flex flex-col items-center gap-1 cursor-pointer"
                  [style.background]="comp.t === 'REELS' ? 'rgba(246,188,3,0.16)' : 'var(--c-bg-elev)'"
                  [style.border]="comp.t === 'REELS' ? '1px solid #f1a10b' : '1px solid var(--c-border)'"
                  [style.color]="comp.t === 'REELS' ? 'var(--c-acc)' : 'var(--c-text2)'"
                  [attr.aria-pressed]="comp.t === 'REELS'"
                  (click)="setComposerFormat('REELS')">
                  <span class="text-base">🎬</span>
                  <span class="font-semibold text-[11.5px]">Reels</span>
                  <span class="text-[9.5px] opacity-75 font-mono">9:16 até 90s</span>
                </button>
                <button
                  type="button"
                  class="px-2 py-2 rounded-lg text-xs font-medium transition-all flex flex-col items-center gap-1 cursor-pointer"
                  [style.background]="comp.t === 'IMAGE' ? 'rgba(246,188,3,0.16)' : 'var(--c-bg-elev)'"
                  [style.border]="comp.t === 'IMAGE' ? '1px solid #f1a10b' : '1px solid var(--c-border)'"
                  [style.color]="comp.t === 'IMAGE' ? 'var(--c-acc)' : 'var(--c-text2)'"
                  [attr.aria-pressed]="comp.t === 'IMAGE'"
                  (click)="setComposerFormat('IMAGE')">
                  <span class="text-base">📸</span>
                  <span class="font-semibold text-[11.5px]">Imagem Feed</span>
                  <span class="text-[9.5px] opacity-75 font-mono">4:5 ou 1:1</span>
                </button>
                <button
                  type="button"
                  class="px-2 py-2 rounded-lg text-xs font-medium transition-all flex flex-col items-center gap-1 cursor-pointer"
                  [style.background]="comp.t === 'STORIES' ? 'rgba(246,188,3,0.16)' : 'var(--c-bg-elev)'"
                  [style.border]="comp.t === 'STORIES' ? '1px solid #f1a10b' : '1px solid var(--c-border)'"
                  [style.color]="comp.t === 'STORIES' ? 'var(--c-acc)' : 'var(--c-text2)'"
                  [attr.aria-pressed]="comp.t === 'STORIES'"
                  (click)="setComposerFormat('STORIES')">
                  <span class="text-base">⚡</span>
                  <span class="font-semibold text-[11.5px]">Stories</span>
                  <span class="text-[9.5px] opacity-75 font-mono">9:16 24 horas</span>
                </button>
              </div>
            </div>

            @let issues = state.composerIssues(true);
            @let showErr = !!comp.tried;

            <!-- Data e horário reais -->
            <fieldset class="flex flex-col gap-1.5">
              <legend class="text-[11px] font-mono text-[var(--c-text-muted)] mb-1">Data e horário de disparo <span class="text-[var(--c-dim)]">· Brasília (UTC-3)</span></legend>
              <div class="flex items-start gap-2 flex-wrap">
                <div class="flex flex-col gap-1">
                  <label for="cmp-date" class="text-[10px] font-mono text-[var(--c-dim)]">Data</label>
                  <input
                    id="cmp-date"
                    type="date"
                    required
                    [attr.min]="todayIso"
                    class="px-3 py-1.5 rounded-lg bg-[var(--c-bg-elev)] border text-xs text-[var(--c-text)] font-mono cm-input-focus"
                    [style.border-color]="showErr && issues.date ? 'var(--c-err)' : 'var(--c-border)'"
                    [attr.aria-invalid]="showErr && !!issues.date"
                    [attr.aria-describedby]="'cmp-sched-err'"
                    [ngModel]="comp.date"
                    (ngModelChange)="state.patchComposer({ date: $event })" />
                </div>
                <div class="flex flex-col gap-1">
                  <label for="cmp-time" class="text-[10px] font-mono text-[var(--c-dim)]">Hora</label>
                  <input
                    id="cmp-time"
                    type="time"
                    required
                    class="px-3 py-1.5 rounded-lg bg-[var(--c-bg-elev)] border text-xs text-[var(--c-text)] font-mono cm-input-focus"
                    [style.border-color]="showErr && issues.time ? 'var(--c-err)' : 'var(--c-border)'"
                    [attr.aria-invalid]="showErr && !!issues.time"
                    [attr.aria-describedby]="'cmp-sched-err'"
                    [ngModel]="comp.time"
                    (ngModelChange)="state.patchComposer({ time: $event })" />
                </div>
                <div class="flex items-end gap-1.5 flex-wrap self-end pb-0.5">
                  <button type="button" class="text-[11px] font-mono px-2 py-1 rounded bg-[var(--c-surface)] hover:bg-[var(--c-surface-hover)] text-[var(--c-text2)] cursor-pointer transition-all" (click)="setQuickDate(0)">Hoje</button>
                  <button type="button" class="text-[11px] font-mono px-2 py-1 rounded bg-[var(--c-surface)] hover:bg-[var(--c-surface-hover)] text-[var(--c-text2)] cursor-pointer transition-all" (click)="setQuickDate(1)">Amanhã</button>
                  <button type="button" class="text-[11px] font-mono px-2 py-1 rounded bg-[var(--c-surface)] hover:bg-[var(--c-surface-hover)] text-[var(--c-text2)] cursor-pointer transition-all" (click)="setQuickDate(7)">+7 dias</button>
                  <span class="w-px h-4 bg-[var(--c-border)] mx-0.5" aria-hidden="true"></span>
                  <button type="button" class="text-[11px] font-mono px-2 py-1 rounded bg-[var(--c-surface)] hover:bg-[var(--c-surface-hover)] text-[var(--c-text2)] cursor-pointer transition-all" (click)="setQuickSchedule('12:00')">12:00</button>
                  <button type="button" class="text-[11px] font-mono px-2 py-1 rounded bg-[var(--c-surface)] hover:bg-[var(--c-surface-hover)] text-[var(--c-text2)] cursor-pointer transition-all" (click)="setQuickSchedule('18:00')">18:00</button>
                  <button type="button" class="text-[11px] font-mono px-2 py-1 rounded bg-[var(--c-surface)] hover:bg-[var(--c-surface-hover)] text-[var(--c-text2)] cursor-pointer transition-all" (click)="setQuickSchedule('20:30')">20:30 (Pico)</button>
                </div>
              </div>
              <p id="cmp-sched-err" class="text-[11px] text-[var(--c-err)] min-h-[14px]" role="alert">
                {{ showErr ? (issues.date || issues.time || '') : '' }}
              </p>
            </fieldset>

            <!-- Tópico com botão IA -->
            <div>
              <div class="flex items-center justify-between mb-1">
                <label for="cmp-topic" class="text-[11px] font-mono text-[var(--c-text-muted)]">Tópico / Hook Principal</label>
                <div class="flex items-center gap-3">
                  <span class="text-[10px] font-mono" [style.color]="comp.topic.length > topicMax ? 'var(--c-err)' : 'var(--c-dim)'">
                    {{ comp.topic.length }} / {{ topicMax }}
                  </span>
                  <button
                    type="button"
                    class="text-[11px] font-mono text-[var(--c-link)] hover:underline flex items-center gap-1 cursor-pointer"
                    (click)="suggestHook()">
                    <span>🪄 Sugerir hook com IA</span>
                  </button>
                </div>
              </div>
              <input
                id="cmp-topic"
                type="text"
                autocomplete="off"
                class="w-full px-3 py-2 rounded-lg bg-[var(--c-bg-elev)] border text-xs text-[var(--c-text)] cm-input-focus font-medium"
                [style.border-color]="issues.topic ? 'var(--c-err)' : 'var(--c-border)'"
                [attr.aria-invalid]="!!issues.topic"
                placeholder="Ex: 3 sinais silenciosos de que sua operação precisa de IA"
                [ngModel]="comp.topic"
                (ngModelChange)="state.patchComposer({ topic: $event })" />
              @if (issues.topic) {
                <p class="text-[11px] text-[var(--c-err)] mt-1" role="alert">{{ issues.topic }}</p>
              }
            </div>

            <!-- Módulo de Upload de Mídias -->
            <div>
              <label class="text-[11px] font-mono text-[var(--c-text-muted)] block mb-1">
                Mídias do Post (Fotos e Vídeos)
              </label>
              <app-media-uploader
                [mediaList]="comp.media || []"
                [format]="comp.t"
                [compact]="true"
                (mediaAdded)="state.addMediaToComposer($event)"
                (mediaRemoved)="state.removeMediaFromComposer($event)"
                (mediaChange)="state.patchComposer({ media: $event })"
              />
            </div>

            <!-- Legenda com contador e IA -->
            <div>
              <div class="flex items-center justify-between mb-1">
                <div class="flex items-center gap-2">
                  <label for="cmp-cap" class="text-[11px] font-mono text-[var(--c-text-muted)]">Legenda & Copywriting</label>
                  <span class="text-[10px] font-mono" [style.color]="comp.cap.length > captionMax ? 'var(--c-err)' : 'var(--c-dim)'">
                    {{ comp.cap.length }} / {{ captionMax }} caracteres
                  </span>
                </div>
                <button
                  type="button"
                  class="text-[11px] font-mono text-[var(--c-link)] hover:underline flex items-center gap-1 cursor-pointer"
                  (click)="state.generateComposerCaptionWithAi()">
                  <span>✨ Gerar com Claude 3.5</span>
                </button>
              </div>
              <textarea
                id="cmp-cap"
                rows="3"
                class="w-full px-3 py-2 rounded-lg bg-[var(--c-bg-elev)] border text-xs text-[var(--c-text)] leading-relaxed cm-input-focus"
                [style.border-color]="(showErr || comp.cap.length > captionMax) && issues.cap ? 'var(--c-err)' : 'var(--c-border)'"
                [attr.aria-invalid]="(showErr || comp.cap.length > captionMax) && !!issues.cap"
                placeholder="Escreva a legenda ou gere com IA respeitando a Brand Voice..."
                [ngModel]="comp.cap"
                (ngModelChange)="state.patchComposer({ cap: $event })"></textarea>
              @if ((showErr || comp.cap.length > captionMax) && issues.cap) {
                <p class="text-[11px] text-[var(--c-err)] mt-1" role="alert">{{ issues.cap }}</p>
              }
            </div>

            <!-- Hashtags -->
            <div>
              <div class="flex items-center justify-between mb-1">
                <label for="cmp-tags" class="text-[11px] font-mono text-[var(--c-text-muted)]">Hashtags</label>
                <span class="text-[10px] font-mono text-[var(--c-dim)]">{{ tagCount(comp.tags) }} / {{ hashtagsMax }}</span>
              </div>
              <input
                id="cmp-tags"
                type="text"
                autocomplete="off"
                class="w-full px-3 py-2 rounded-lg bg-[var(--c-bg-elev)] border text-xs text-[var(--c-text)] font-mono cm-input-focus"
                [style.border-color]="issues.tags ? 'var(--c-err)' : 'var(--c-border)'"
                [attr.aria-invalid]="!!issues.tags"
                placeholder="#marca #tema #cidade"
                [ngModel]="comp.tags"
                (ngModelChange)="state.patchComposer({ tags: $event })" />
              @if (issues.tags) {
                <p class="text-[11px] text-[var(--c-err)] mt-1" role="alert">{{ issues.tags }}</p>
              }
            </div>

            <!-- Rodapé de Ações do Modal -->
            <div class="flex items-center justify-between pt-3 border-t border-[rgba(var(--ov),.1)]">
              <button
                type="button"
                class="px-3 py-1.5 rounded-lg text-xs font-mono text-[var(--c-text-muted)] hover:text-[var(--c-text)] cursor-pointer transition-colors"
                (click)="state.closeComposer()">
                cancelar
              </button>
              <div class="flex items-center gap-2">
                <cm-button variant="secondary" size="sm" (clicked)="state.saveComposerPosts('DRAFT')">
                  salvar rascunho
                </cm-button>
                <cm-button variant="primary" size="sm" [arrow]="true" (clicked)="state.saveComposerPosts('SCHEDULED')">
                  agendar publicação
                </cm-button>
              </div>
            </div>
          </div>

          <!-- Preview Realista do Instagram Phone Mockup -->
          <div class="p-5 bg-[var(--c-bg-elev)] border-l border-[var(--c-border)] md:col-span-2 flex flex-col justify-between gap-3">
            <div>
              <div class="flex items-center justify-between text-[10px] font-mono uppercase text-[var(--c-text-muted)] mb-2.5 pb-1 border-b border-[var(--c-border)]">
                <span class="flex items-center gap-1.5 font-bold text-[var(--c-text)]">
                  <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live Preview
                </span>
                <span class="text-[#fbd23a] font-bold px-1.5 py-0.5 rounded bg-[rgba(246,188,3,0.12)]">{{ comp.t }}</span>
              </div>

              <!-- Instagram Phone Mockup Container -->
              <div class="rounded-xl overflow-hidden border border-[var(--c-border)] bg-[var(--c-panel)] shadow-xl">
                <!-- Mockup Header -->
                <div class="flex items-center justify-between p-2.5 border-b border-[var(--c-border)]">
                  <div class="flex items-center gap-2">
                    <div class="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 p-[1.5px]">
                      <div class="w-full h-full rounded-full bg-[var(--c-panel)] flex items-center justify-center text-[10px] font-bold text-white">
                        {{ state.activeAccount().user.charAt(0).toUpperCase() }}
                      </div>
                    </div>
                    <div class="leading-tight">
                      <div class="text-[11px] font-bold text-[var(--c-text)] truncate max-w-[120px]">
                        &#64;{{ state.activeAccount().user }}
                      </div>
                      <div class="text-[9px] text-[var(--c-dim)] font-mono">São Paulo, Brasil</div>
                    </div>
                  </div>
                  <div class="text-[var(--c-dim)] text-xs">•••</div>
                </div>

                <!-- Mockup Media -->
                @if ((comp.media.length || 0) > 0) {
                  <div class="relative overflow-hidden bg-black flex items-center justify-center"
                       [ngClass]="comp.t === 'REELS' || comp.t === 'STORIES' ? 'aspect-[9/16] max-h-[340px] mx-auto' : 'aspect-[4/5] max-h-[290px] mx-auto'">
                    @let currentMedia = comp.media![composerActiveSlide() % comp.media!.length];
                    @if (currentMedia.type === 'video') {
                      <video
                        [src]="currentMedia.url"
                        controls
                        playsinline
                        autoplay
                        muted
                        loop
                        class="w-full h-full object-contain"
                      ></video>
                      <span class="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] text-white font-mono">
                        ▶ Vídeo
                      </span>
                    } @else {
                      <img
                        [src]="currentMedia.url"
                        [alt]="currentMedia.name"
                        class="w-full h-full object-cover"
                      />
                    }

                    <!-- Controles de Slide do Carrossel no Preview -->
                    @if (comp.media!.length > 1) {
                      <button
                        type="button"
                        class="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/70 hover:bg-black/90 text-white flex items-center justify-center text-xs cursor-pointer border border-white/20 transition-all hover:scale-110"
                        (click)="prevComposerSlide(comp.media!.length)">
                        ‹
                      </button>
                      <button
                        type="button"
                        class="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/70 hover:bg-black/90 text-white flex items-center justify-center text-xs cursor-pointer border border-white/20 transition-all hover:scale-110"
                        (click)="nextComposerSlide(comp.media!.length)">
                        ›
                      </button>
                      <span class="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/80 text-[9.5px] font-mono text-white border border-white/10">
                        {{ (composerActiveSlide() % comp.media!.length) + 1 }} / {{ comp.media!.length }}
                      </span>
                    }
                  </div>
                } @else {
                  <div class="aspect-[4/5] bg-gradient-to-br from-[#2b2b2b] via-[#222] to-[#f1a10b]/20 p-4 flex flex-col justify-between">
                    <div class="text-[10px] font-mono text-[#fbd23a] flex items-center gap-1">
                      <span>📸</span>
                      <span>{{ comp.t }} · Sem mídia anexada</span>
                    </div>
                    <div class="text-sm font-bold text-white leading-snug">
                      {{ comp.topic || 'Seu título aparecerá em destaque aqui' }}
                    </div>
                    <div class="text-[10.5px] text-white/60 italic">
                      Faça upload de fotos ou vídeos ao lado para ativar o preview real
                    </div>
                    <div class="text-[10px] font-mono text-white/50">
                      &#64;{{ state.activeAccount().user }}
                    </div>
                  </div>
                }

                <!-- Mockup Action Icons Bar -->
                <div class="p-2 flex items-center justify-between text-[var(--c-text)]">
                  <div class="flex items-center gap-2.5">
                    <span class="cursor-pointer hover:text-red-500 transition-colors">♥</span>
                    <span class="cursor-pointer hover:text-[var(--c-acc)] transition-colors">💬</span>
                    <span class="cursor-pointer hover:text-[var(--c-acc)] transition-colors">↗</span>
                  </div>
                  <span class="cursor-pointer hover:text-[var(--c-acc)] transition-colors">☖</span>
                </div>

                <!-- Mockup Caption -->
                <div class="px-2.5 pb-2.5 flex flex-col gap-1 text-[11px]">
                  <div class="text-[10.5px] font-bold text-[var(--c-text)]">482 curtidas</div>
                  <div class="text-[var(--c-text-2)] leading-relaxed line-clamp-2">
                    <strong class="text-[var(--c-text)] mr-1">&#64;{{ state.activeAccount().user }}</strong>
                    {{ comp.cap || comp.topic || 'A legenda da publicação aparecerá aqui...' }}
                  </div>
                  <div class="text-[9.5px] font-mono text-[var(--c-dim)] uppercase mt-0.5">
                    {{ comp.time ? 'Agendado para ' + comp.time : 'Hoje' }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Dica de Publicação -->
            <div class="p-2.5 rounded-lg bg-[rgba(var(--ov),.04)] border border-[rgba(var(--ov),.08)] flex items-center gap-2 text-[11px] text-[var(--c-text-muted)]">
              <span class="text-base">🚀</span>
              <span>Publicação automática via Instagram Graph API v22.0 com suporte a carrossel de até 10 mídias.</span>
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

  readonly captionMax = CAPTION_MAX;
  readonly topicMax = TOPIC_MAX;
  readonly hashtagsMax = HASHTAGS_MAX;
  readonly todayIso = todayIso();

  readonly filteredComments = computed(() => {
    const f = this.state.cFilter();
    const list = this.state.accountInts().filter((i) => i.t === 'COMMENT' && !i.hidden);
    if (f === 'todos') return list;
    return list.filter((c) => c.cat === f);
  });

  // ----- Comentários: busca, status, ordenação e paginação -----
  readonly commentQuery = signal('');
  readonly commentStatus = signal('ALL');
  readonly commentSorter = createSorter<InteractionItem>(
    [
      {
        key: 'recent',
        label: 'mais recentes',
        compare: (a, b) => cmpNum(relativeTimeKey(a.time) ?? 0, relativeTimeKey(b.time) ?? 0),
        isEmpty: (c) => relativeTimeKey(c.time) === null,
      },
      { key: 'user', label: 'usuário (A–Z)', compare: (a, b) => cmpText(a.u, b.u) },
      { key: 'category', label: 'categoria', compare: (a, b) => cmpText(a.cat ?? '', b.cat ?? '') },
      { key: 'status', label: 'status', compare: (a, b) => cmpText(a.s, b.s) },
    ],
    'recent',
    'desc'
  );
  readonly commentsSorted = computed(() => {
    const q = this.commentQuery().trim().toLowerCase();
    const st = this.commentStatus();
    let list = this.filteredComments();
    if (q) list = list.filter((c) => c.u.toLowerCase().includes(q) || c.c.toLowerCase().includes(q));
    if (st !== 'ALL') list = list.filter((c) => c.s === st);
    return this.commentSorter.apply(list);
  });
  readonly commentPager = createPager(() => this.commentsSorted().length, {
    sizes: [5, 10, 20, 50],
    size: 10,
    resetOn: () => [
      this.state.activeAccount().id,
      this.state.cFilter(),
      this.commentQuery(),
      this.commentStatus(),
      this.commentSorter.key(),
      this.commentSorter.dir(),
    ],
  });
  readonly commentItems = computed(() => this.commentPager.slice(this.commentsSorted()));

  // ----- CRM de leads -----
  readonly crmColumns = [
    { key: 'user', label: 'Usuário' },
    { key: 'email', label: 'E-mail' },
    { key: 'source', label: 'Origem' },
    { key: 'score', label: 'ICP Score' },
    { key: 'sync', label: 'Meta Ads' },
    { key: 'last', label: 'Última Interação' },
  ];
  readonly crmQuery = signal('');
  readonly crmSource = signal('ALL');
  readonly crmTier = signal('ALL');
  readonly crmSync = signal('ALL');
  readonly crmSorter = createSorter<ContactItem>(
    [
      { key: 'user', label: 'Usuário', compare: (a, b) => cmpText(a.u, b.u) },
      { key: 'email', label: 'E-mail', compare: (a, b) => cmpText(a.email ?? '', b.email ?? ''), isEmpty: (c) => !c.email },
      { key: 'source', label: 'Origem', compare: (a, b) => cmpText(a.src, b.src) },
      { key: 'score', label: 'ICP Score', compare: (a, b) => cmpNum(a.icpScore ?? 0, b.icpScore ?? 0), isEmpty: (c) => c.icpScore === undefined },
      { key: 'sync', label: 'Meta Ads', compare: (a, b) => cmpNum(a.metaSynced ? 1 : 0, b.metaSynced ? 1 : 0) },
      {
        key: 'last',
        label: 'Última Interação',
        compare: (a, b) => cmpNum(relativeTimeKey(a.last) ?? 0, relativeTimeKey(b.last) ?? 0),
        isEmpty: (c) => relativeTimeKey(c.last) === null,
      },
    ],
    'score',
    'desc'
  );
  readonly crmSources = computed(() => [...new Set(this.accountContacts().map((c) => c.src))].sort(cmpText));
  readonly crmSorted = computed(() => {
    const q = this.crmQuery().trim().toLowerCase();
    const src = this.crmSource();
    const tier = this.crmTier();
    const sync = this.crmSync();
    let list = this.accountContacts();
    if (q) {
      list = list.filter(
        (c) =>
          c.u.toLowerCase().includes(q) ||
          (c.email ?? '').toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (src !== 'ALL') list = list.filter((c) => c.src === src);
    if (tier !== 'ALL') list = list.filter((c) => c.icpTier === tier);
    if (sync !== 'ALL') list = list.filter((c) => (sync === 'SYNCED') === !!c.metaSynced);
    return this.crmSorter.apply(list);
  });
  readonly crmPager = createPager(() => this.crmSorted().length, {
    sizes: [5, 10, 25, 50],
    size: 10,
    resetOn: () => [
      this.state.activeAccount().id,
      this.crmQuery(),
      this.crmSource(),
      this.crmTier(),
      this.crmSync(),
      this.crmSorter.key(),
      this.crmSorter.dir(),
    ],
  });
  readonly crmItems = computed(() => this.crmPager.slice(this.crmSorted()));

  // ----- Catálogo de skills -----
  readonly skillQuery = signal('');
  readonly skillEngine = signal('ALL');
  readonly skillSorter = createSorter<SkillCommand>(
    [
      { key: 'command', label: 'comando (A–Z)', compare: (a, b) => cmpText(a.c, b.c) },
      { key: 'engine', label: 'engine', compare: (a, b) => cmpText(a.e, b.e) },
    ],
    'command',
    'asc'
  );
  readonly skillsSorted = computed(() => {
    const q = this.skillQuery().trim().toLowerCase();
    const eng = this.skillEngine();
    let list = this.state.allCommands(true);
    if (q) list = list.filter((k) => k.c.toLowerCase().includes(q) || k.d.toLowerCase().includes(q));
    if (eng !== 'ALL') list = list.filter((k) => k.e === eng);
    return this.skillSorter.apply(list);
  });
  readonly skillPager = createPager(() => this.skillsSorted().length, {
    sizes: [9, 18, 36],
    size: 9,
    resetOn: () => [this.skillQuery(), this.skillEngine(), this.skillSorter.key(), this.skillSorter.dir()],
  });
  readonly skillItems = computed(() => this.skillPager.slice(this.skillsSorted()));

  // ----- Prompts de imagem vinculados aos posts -----
  readonly promptQuery = signal('');
  readonly promptRatio = signal('ALL');
  private readonly allPrompts = computed(() =>
    this.state.accountPosts().flatMap((p) =>
      p.pr.map((pr, i) => ({ key: `${p.id}:${i}`, topic: p.topic, title: pr.t, ar: pr.ar, x: pr.x }))
    )
  );
  readonly promptRatios = computed(() => [...new Set(this.allPrompts().map((p) => p.ar))].sort(cmpText));
  private readonly promptsFiltered = computed(() => {
    const q = this.promptQuery().trim().toLowerCase();
    const ratio = this.promptRatio();
    return this.allPrompts().filter(
      (p) =>
        (ratio === 'ALL' || p.ar === ratio) &&
        (!q || p.topic.toLowerCase().includes(q) || p.title.toLowerCase().includes(q) || p.x.toLowerCase().includes(q))
    );
  });
  readonly promptPager = createPager(() => this.promptsFiltered().length, {
    sizes: [6, 12, 24],
    size: 6,
    resetOn: () => [this.state.activeAccount().id, this.promptQuery(), this.promptRatio()],
  });
  readonly promptItems = computed(() => this.promptPager.slice(this.promptsFiltered()));

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
    () => TWINS[this.state.activeAccount().id] || EMPTY_TWIN
  );

  readonly activeMetrics = computed(
    () => METRICS[this.state.activeAccount().id] || EMPTY_METRICS
  );

  readonly currentBreadcrumb = computed(() => {
    const v = this.state.view();
    const acc = this.state.activeAccount().user;
    if (v === 'overview') return { l: 'visão ', b: 'geral', sub: `@${acc}` };
    if (v === 'content') {
      const sub = this.state.contentSubTab();
      const subName =
        sub === 'calendar'
          ? 'calendário'
          : sub === 'prompts'
            ? 'prompts de imagem'
            : sub === 'grid'
              ? 'grid de mídia'
              : sub === 'list'
                ? 'lista'
                : sub === 'feed'
                  ? 'feed 3x3'
                  : 'kanban';
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

  setContentTab(tab: 'kanban' | 'grid' | 'list' | 'feed' | 'calendar' | 'prompts'): void {
    this.state.contentSubTab.set(tab);
    if (tab !== 'prompts') {
      this.state.contentMode.set(tab);
    }
  }

  @HostListener('window:keydown.escape')
  onEscapeKey(): void {
    if (this.state.comp()) {
      this.state.closeComposer();
    }
  }

  toggleComposerAccount(accId: string): void {
    const comp = this.state.comp();
    if (!comp) return;
    const exists = comp.accs.includes(accId);
    let updated: string[];
    if (exists) {
      if (comp.accs.length === 1) {
        this.state.toast('Selecione pelo menos uma conta de destino');
        return;
      }
      updated = comp.accs.filter((id) => id !== accId);
    } else {
      updated = [...comp.accs, accId];
    }
    this.state.patchComposer({ accs: updated });
  }

  isAccountSelectedInComposer(accId: string): boolean {
    const comp = this.state.comp();
    return comp ? comp.accs.includes(accId) : false;
  }

  setQuickSchedule(timeStr: string): void {
    this.state.patchComposer({ time: timeStr });
    this.state.toast(`Horário definido para ${timeStr}`);
  }

  setQuickDate(offsetDays: number): void {
    this.state.patchComposer({ date: addDays(todayIso(), offsetDays) });
  }

  tagCount(raw: string): number {
    return raw.split(/[\s,]+/).filter(Boolean).length;
  }

  suggestHook(): void {
    const hooks = [
      '3 sinais silenciosos de que sua operação precisa de IA urgente',
      'Como aumentamos o engajamento em 400% sem gastar com anúncios',
      'O maior erro no Instagram que coaches e agências ainda cometem',
      'Pare de postar todo dia: o framework de 3 passos para retenção',
      'Por que a automação no Direct é a maior máquina de vendas de 2026',
      'Como estruturar um carrossel técnico que gera conversas no Direct',
    ];
    const picked = hooks[Math.floor(Math.random() * hooks.length)];
    this.state.patchComposer({ topic: picked });
    this.state.toast('Hook sugerido aplicado!');
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
    // Ocultar no Instagram ainda não está ligado: nada é marcado como feito.
    this.state.toast(`Ocultar ${spamIds.length} comentário(s) ainda não está ligado a este painel`);
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
    this.state.patchAccount(id, { style: value });
  }

  setComposerFormat(fmt: PostFormat): void {
    this.state.patchComposer({ t: fmt });
    this.composerActiveSlide.set(0);
  }

  readonly composerActiveSlide = signal<number>(0);

  nextComposerSlide(total: number): void {
    if (total <= 1) return;
    this.composerActiveSlide.update((i) => (i + 1) % total);
  }

  prevComposerSlide(total: number): void {
    if (total <= 1) return;
    this.composerActiveSlide.update((i) => (i - 1 + total) % total);
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
