import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountStateService } from '../../services/account-state.service';
import { SupabaseService } from '../../services/supabase.service';
import { CodemixButtonComponent } from '../codemix-button.component';
import { LoginPanelComponent } from '../login-panel/login-panel.component';
import { PagerComponent } from '../../shared/pager.component';
import { cmpNum, cmpText, createPager, createSorter } from '../../shared/list-tools';
import { MetaAdAccount, MetaCampaign, MetaAudience, MetaCampaignObjective } from '../../data/seed-data';

type MetaSubTab = 'campaigns' | 'audiences' | 'sync' | 'ai-assistant';

@Component({
  selector: 'app-meta-campaigns',
  imports: [CommonModule, FormsModule, CodemixButtonComponent, LoginPanelComponent, PagerComponent],
  template: `
    <div class="flex flex-col gap-5">
      <!-- LOGIN: alterações na Meta exigem usuário autorizado -->
      <app-login-panel />

      <!-- HEADER DO MÓDULO META MARKETING API -->
      <div
        class="rounded-[8px] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
        style="background: var(--c-panel); border: 1px solid rgba(var(--ov), .1); box-shadow: 0 4px 20px rgba(0,0,0,.15);"
      >
        <div class="flex flex-col gap-1.5">
          <div class="flex items-center gap-2.5 flex-wrap">
            <h1 class="text-xl font-bold tracking-tight text-[var(--c-text)]">
              Meta Ads Manager & Lookalike Audiences
            </h1>
            @if (state.activeAccount().st === 'pendente') {
              <span
                class="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium"
                style="background: rgba(var(--ov), .05); color: var(--c-muted); border: 1px solid rgba(var(--ov), .12);"
              >
                Sem token da Meta
              </span>
            } @else {
              <span
                class="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium flex items-center gap-1.5"
                style="background: rgba(63, 122, 28, 0.15); color: #4ade80; border: 1px solid rgba(63, 122, 28, 0.3);"
              >
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Graph API v22.0 Conectada
              </span>
              <span
                class="px-2 py-0.5 rounded text-[11px] font-mono text-[var(--c-muted)]"
                style="background: rgba(var(--ov), .05); border: 1px solid rgba(var(--ov), .08);"
              >
                Long-Lived Token (60 dias)
              </span>
            }
          </div>
          <p class="text-xs text-[var(--c-muted)]">
            Crie campanhas para públicos semelhantes (Lookalike de 1% a 10%) e listas de contatos capturados no Direct e Comentários do Instagram.
          </p>
        </div>

        <div class="flex items-center gap-2.5 flex-wrap">
          <!-- Seletor de Conta de Anúncios -->
          <div class="flex items-center gap-2">
            <span class="text-xs text-[var(--c-muted)] font-mono">Conta de Anúncio:</span>
            <select
              class="h-8 px-2.5 rounded-[4px] text-xs font-mono cursor-pointer"
              style="background: rgba(var(--ov), .06); border: 1px solid rgba(var(--ov), .15); color: var(--c-text);"
              aria-label="Conta de anúncio"
              (change)="onAdAccountChange($event)"
            >
              @for (group of portfolioGroups(); track group.name) {
                <optgroup [label]="group.name" style="background: #2b2b2b; color: #fefefe;">
                  @for (acc of group.accounts; track acc.id) {
                    <option [value]="acc.id" [selected]="acc.id === state.activeAdAccount()?.id" style="background: #2b2b2b; color: #fefefe;">
                      {{ acc.name }} ({{ acc.id }})
                    </option>
                  }
                </optgroup>
              }
            </select>
          </div>

          <cm-button
            variant="ghost"
            size="sm"
            (clicked)="openLookalikeModal()"
          >
            <span>🎯 novo lookalike</span>
          </cm-button>

          <cm-button
            variant="primary"
            size="sm"
            [arrow]="true"
            (clicked)="openCampaignModal()"
          >
            <span>+ nova campanha</span>
          </cm-button>
        </div>
      </div>

      <!-- KPI METRICS SUMMARY -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div class="kpi-card">
          <div class="kpi-label">investimento</div>
          <div class="kpi-value">R$ {{ state.campaignMetrics().totalSpend.toFixed(2) }}</div>
          <div class="kpi-sub">{{ state.campaignMetrics().activeCount }} ativas</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-label">impressões</div>
          <div class="kpi-value">{{ state.campaignMetrics().totalImpressions.toLocaleString('pt-BR') }}</div>
          <div class="kpi-sub">alcance qualificado</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-label">cliques</div>
          <div class="kpi-value">{{ state.campaignMetrics().totalClicks.toLocaleString('pt-BR') }}</div>
          <div class="kpi-sub">
            CTR {{ state.campaignMetrics().totalImpressions > 0 ? ((state.campaignMetrics().totalClicks / state.campaignMetrics().totalImpressions) * 100).toFixed(2) : '0' }}%
          </div>
        </div>

        <div class="kpi-card highlight">
          <div class="kpi-label">leads gerados</div>
          <div class="kpi-value accent">{{ state.campaignMetrics().totalLeads }}</div>
          <div class="kpi-sub">DM & WhatsApp</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-label">cpa médio</div>
          <div class="kpi-value">R$ {{ state.campaignMetrics().avgCpa.toFixed(2) }}</div>
          <div class="kpi-sub">custo por lead</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-label">roas médio</div>
          <div class="kpi-value accent-green">{{ state.campaignMetrics().avgRoas.toFixed(2) }}x</div>
          <div class="kpi-sub">retorno sobre anúncio</div>
        </div>
      </div>

      <!-- NAVEGAÇÃO DE SUB-ABAS -->
      <div
        class="flex items-center justify-between border-b border-[rgba(var(--ov),.1)] pb-1 gap-2 flex-wrap"
      >
        <div class="flex items-center gap-1">
          <button
            type="button"
            class="tab-btn"
            [class.active]="activeTab() === 'campaigns'"
            (click)="activeTab.set('campaigns')"
          >
            <span>Campanhas Ativas</span>
            <span class="tab-badge">{{ state.accountCampaigns().length }}</span>
          </button>

          <button
            type="button"
            class="tab-btn"
            [class.active]="activeTab() === 'audiences'"
            (click)="activeTab.set('audiences')"
          >
            <span>Públicos & Lookalike</span>
            <span class="tab-badge ai">{{ state.accountAudiences().length }}</span>
          </button>

          <button
            type="button"
            class="tab-btn"
            [class.active]="activeTab() === 'sync'"
            (click)="activeTab.set('sync')"
          >
            <span>Sincronizador de Contatos (SHA-256)</span>
            <span class="tab-badge">{{ unsyncedCount() > 0 ? unsyncedCount() + ' pendentes' : 'sincronizado' }}</span>
          </button>

          <button
            type="button"
            class="tab-btn"
            [class.active]="activeTab() === 'ai-assistant'"
            (click)="activeTab.set('ai-assistant')"
          >
            <span>Assistente IA de Anúncios</span>
            <span class="tab-badge ai">IA</span>
          </button>
        </div>

        <!-- Filtros Rápidos (quando em campanhas) -->
        @if (activeTab() === 'campaigns') {
          <div class="flex items-center gap-1.5 text-xs flex-wrap">
            <input
              type="search"
              class="h-7 w-44 px-2.5 rounded-[4px] text-xs"
              style="background: rgba(var(--ov), .06); border: 1px solid rgba(var(--ov), .15); color: var(--c-text);"
              placeholder="Buscar campanha..."
              aria-label="Buscar campanha"
              [ngModel]="campQuery()"
              (ngModelChange)="campQuery.set($event)" />
            <span class="text-[var(--c-muted)] text-[11px] font-mono">Filtro:</span>
            <button
              type="button"
              class="filter-pill"
              [class.active]="state.campaignFilter() === 'all'"
              (click)="state.campaignFilter.set('all')"
            >
              Todas
            </button>
            <button
              type="button"
              class="filter-pill"
              [class.active]="state.campaignFilter() === 'active'"
              (click)="state.campaignFilter.set('active')"
            >
              Ativas
            </button>
            <button
              type="button"
              class="filter-pill"
              [class.active]="state.campaignFilter() === 'lookalike'"
              (click)="state.campaignFilter.set('lookalike')"
            >
              Lookalike 1%
            </button>
            <button
              type="button"
              class="filter-pill"
              [class.active]="state.campaignFilter() === 'paused'"
              (click)="state.campaignFilter.set('paused')"
            >
              Pausadas
            </button>
          </div>
        }
      </div>

      <!-- ================= ABA 1: TABELA DE CAMPANHAS ================= -->
      @if (activeTab() === 'campaigns') {
        <div class="card-p">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="border-b border-[rgba(var(--ov),.1)] text-[11px] font-mono uppercase text-[var(--c-muted)]">
                  @for (col of campColumns; track col.key) {
                    <th class="py-2.5 px-3" [attr.aria-sort]="campSorter.ariaSort(col.key)">
                      @if (col.sortable) {
                        <button type="button" class="uppercase cursor-pointer hover:text-[var(--c-text)]" (click)="campSorter.toggle(col.key)">
                          {{ col.label }} {{ campSorter.indicator(col.key) }}
                        </button>
                      } @else {
                        {{ col.label }}
                      }
                    </th>
                  }
                  <th class="py-2.5 px-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[rgba(var(--ov),.06)]">
                @for (c of campItems(); track c.id) {
                  <tr class="hover:bg-[rgba(var(--ov),.02)] transition-colors">
                    <td class="py-3 px-3 whitespace-nowrap">
                      <button
                        type="button"
                        class="toggle-switch"
                        [class.active]="c.status === 'ACTIVE'"
                        (click)="state.toggleCampaignStatus(c.id)"
                        [title]="c.status === 'ACTIVE' ? 'Clique para pausar' : 'Clique para ativar'"
                      >
                        <span class="toggle-dot"></span>
                      </button>
                    </td>

                    <td class="py-3 px-3">
                      <div class="font-medium text-[var(--c-text)] flex items-center gap-1.5">
                        {{ c.name }}
                        @if (c.isLookalike) {
                          <span class="lal-badge">LAL 1%</span>
                        }
                      </div>
                      <div class="text-[11px] text-[var(--c-muted)] font-mono">
                        Objetivo: {{ formatObjective(c.objective) }} • Início: {{ c.startDate }}
                      </div>
                    </td>

                    <td class="py-3 px-3">
                      <span class="inline-flex items-center gap-1 text-[var(--c-text)]">
                        <svg class="w-3.5 h-3.5 text-amber-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
                        </svg>
                        <span class="truncate max-w-[200px]" [title]="c.audienceName">{{ c.audienceName }}</span>
                      </span>
                    </td>

                    <td class="py-3 px-3 font-mono font-medium text-[var(--c-text)]">
                      R$ {{ c.dailyBudget.toFixed(2) }}
                    </td>

                    <td class="py-3 px-3 font-mono text-[var(--c-text)]">
                      R$ {{ c.spend.toFixed(2) }}
                    </td>

                    <td class="py-3 px-3 font-mono text-[var(--c-text)]">
                      {{ c.impressions.toLocaleString('pt-BR') }}
                    </td>

                    <td class="py-3 px-3 font-mono font-bold text-amber-500">
                      {{ c.leads }}
                    </td>

                    <td class="py-3 px-3 font-mono text-[var(--c-text)]">
                      R$ {{ c.cpa > 0 ? c.cpa.toFixed(2) : '—' }}
                    </td>

                    <td class="py-3 px-3 font-mono font-bold text-emerald-400">
                      {{ c.roas > 0 ? c.roas.toFixed(2) + 'x' : '—' }}
                    </td>

                    <td class="py-3 px-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        class="action-btn"
                        (click)="state.toast('Abrindo gerenciador de anúncios Meta para ' + c.name)"
                        title="Ver no Meta Ads Manager"
                      >
                        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <app-pager [pager]="campPager" label="campanhas" />
        </div>
      }

      <!-- ================= ABA 2: PÚBLICOS & LOOKALIKE HUB ================= -->
      @if (activeTab() === 'audiences') {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <!-- Coluna 1 & 2: Lista de Públicos Existentes -->
          <div class="lg:col-span-2 flex flex-col gap-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-bold text-[var(--c-text)]">Públicos Disponíveis na Conta de Anúncios</h3>
                <p class="text-xs text-[var(--c-muted)]">Públicos Semelhantes (Lookalike) e Listas de Clientes sincronizadas</p>
              </div>

              <div class="flex items-center gap-1.5">
                <button
                  type="button"
                  class="filter-pill"
                  [class.active]="state.audienceFilter() === 'all'"
                  (click)="state.audienceFilter.set('all')"
                >
                  Todos
                </button>
                <button
                  type="button"
                  class="filter-pill"
                  [class.active]="state.audienceFilter() === 'lookalike'"
                  (click)="state.audienceFilter.set('lookalike')"
                >
                  Lookalikes
                </button>
                <button
                  type="button"
                  class="filter-pill"
                  [class.active]="state.audienceFilter() === 'custom_list'"
                  (click)="state.audienceFilter.set('custom_list')"
                >
                  Listas
                </button>
              </div>
            </div>

            <div class="flex items-center gap-2 flex-wrap">
              <input
                type="search"
                class="h-8 flex-1 min-w-[160px] px-2.5 rounded-[4px] text-xs"
                style="background: rgba(var(--ov), .06); border: 1px solid rgba(var(--ov), .15); color: var(--c-text);"
                placeholder="Buscar público..."
                aria-label="Buscar público"
                [ngModel]="audQuery()"
                (ngModelChange)="audQuery.set($event)" />
              <select
                class="h-8 px-2.5 rounded-[4px] text-xs font-mono cursor-pointer"
                style="background: rgba(var(--ov), .06); border: 1px solid rgba(var(--ov), .15); color: var(--c-text);"
                aria-label="Ordenar públicos por"
                [ngModel]="audSorter.key()"
                (ngModelChange)="audSorter.set($event, $event === 'size' ? 'desc' : 'asc')">
                @for (o of audSorter.options; track o.key) {
                  <option [value]="o.key">Ordenar: {{ o.label }}</option>
                }
              </select>
              <button
                type="button"
                class="w-8 h-8 rounded-[4px] text-xs cursor-pointer"
                style="background: rgba(var(--ov), .06); border: 1px solid rgba(var(--ov), .15); color: var(--c-text);"
                [attr.aria-label]="audSorter.dir() === 'asc' ? 'Ordem crescente. Inverter' : 'Ordem decrescente. Inverter'"
                (click)="audSorter.toggleDir()">
                {{ audSorter.dir() === 'asc' ? '▲' : '▼' }}
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              @for (aud of audItems(); track aud.id) {
                <div class="aud-card">
                  <div class="flex items-start justify-between gap-2">
                    <span
                      class="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase"
                      [style.background]="aud.type === 'LOOKALIKE' ? 'rgba(241, 161, 11, 0.15)' : 'rgba(56, 189, 248, 0.15)'"
                      [style.color]="aud.type === 'LOOKALIKE' ? '#f59e0b' : '#38bdf8'"
                      [style.border]="aud.type === 'LOOKALIKE' ? '1px solid rgba(241, 161, 11, 0.3)' : '1px solid rgba(56, 189, 248, 0.3)'"
                    >
                      {{ aud.type === 'LOOKALIKE' ? 'Lookalike ' + (aud.lookalikeRatio || 1) + '%' : (aud.type === 'CUSTOM_LIST' ? 'Lista de Clientes' : 'Engajamento IG') }}
                    </span>

                    <span class="text-[11px] font-mono text-[var(--c-muted)]">
                      {{ aud.lastSync }}
                    </span>
                  </div>

                  <div class="font-semibold text-sm text-[var(--c-text)] mt-1">
                    {{ aud.name }}
                  </div>

                  @if (aud.originAudienceName) {
                    <div class="text-[11px] text-[var(--c-muted)]">
                      Origem: <span class="text-[var(--c-text)]">{{ aud.originAudienceName }}</span>
                    </div>
                  }

                  <div class="flex items-center justify-between text-xs pt-2 border-t border-[rgba(var(--ov),.08)] mt-1">
                    <div class="flex flex-col">
                      <span class="text-[10px] uppercase font-mono text-[var(--c-muted)]">Tamanho Estimado</span>
                      <span class="font-mono font-bold text-[var(--c-text)]">
                        {{ aud.size >= 1000000 ? (aud.size / 1000000).toFixed(1) + ' Milhões' : aud.size.toLocaleString('pt-BR') + ' pessoas' }}
                      </span>
                    </div>

                    <div class="flex items-center gap-1.5">
                      @if (aud.type === 'CUSTOM_LIST') {
                        <button
                          type="button"
                          class="px-2 py-1 rounded text-[11px] font-mono cursor-pointer"
                          style="background: rgba(var(--ov), .06); border: 1px solid rgba(var(--ov), .15); color: var(--c-text);"
                          (click)="state.syncContactsToMeta(aud.id)"
                          title="Sincronizar novos contatos"
                        >
                          🔄 Sync
                        </button>
                      }

                      <button
                        type="button"
                        class="px-2.5 py-1 rounded text-[11px] font-medium cursor-pointer"
                        style="background: var(--grad-brand); color: #2b2b2b; border: 1px solid #c96a0c;"
                        (click)="quickCreateCampaignForAudience(aud)"
                      >
                        Anunciar
                      </button>
                    </div>
                  </div>
                </div>
              } @empty {
                <p class="md:col-span-2 py-8 text-center text-xs text-[var(--c-muted)]">Nenhum público encontrado.</p>
              }
            </div>
            <app-pager [pager]="audPager" label="públicos" />
          </div>

          <!-- Coluna 3: Criador Rápido de Lookalike -->
          <div class="card-p flex flex-col gap-4">
            <div>
              <div class="card-title text-sm">Criar Lookalike na Meta</div>
              <div class="card-sub text-xs">A Meta buscará pessoas idênticas aos seus clientes e leads quentes</div>
            </div>

            <div class="flex flex-col gap-3 text-xs">
              <div>
                <label class="block text-[11px] font-mono uppercase text-[var(--c-muted)] mb-1">
                  1. Público de Origem (Semente)
                </label>
                <select
                  class="w-full h-8 px-2.5 rounded-[4px] font-mono text-xs"
                  style="background: rgba(var(--ov), .06); border: 1px solid rgba(var(--ov), .15); color: var(--c-text);"
                  [(ngModel)]="newLookalikeSource"
                >
                  <option value="Lista VIP — Leads Inbox & Palavra 'AGENTE'">
                    Lista VIP — Leads Inbox & Palavra "AGENTE" (420 leads)
                  </option>
                  <option value="Engajamento IG 90 Dias — Comentários & Directs">
                    Engajadores nos Posts & Reels (Últimos 90 dias)
                  </option>
                  <option value="Contatos Quentes Capturados no Direct">
                    Contatos Qualificados pelo Bot (Últimos 30 dias)
                  </option>
                </select>
              </div>

              <div>
                <div class="flex justify-between items-center mb-1">
                  <label class="text-[11px] font-mono uppercase text-[var(--c-muted)]">
                    2. Precisão do Lookalike ({{ lookalikeRatio }}%)
                  </label>
                  <span class="text-[11px] font-mono text-amber-500 font-bold">
                    {{ lookalikeRatio === 1 ? '🎯 Máxima Similaridade' : (lookalikeRatio <= 3 ? '⚡ Equilibrado' : '🌐 Amplo') }}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  class="w-full accent-amber-500 cursor-pointer"
                  [(ngModel)]="lookalikeRatio"
                />
                <div class="flex justify-between text-[10px] font-mono text-[var(--c-muted)] mt-1">
                  <span>1% (Mais fiel)</span>
                  <span>5%</span>
                  <span>10% (Mais amplo)</span>
                </div>
              </div>

              <div
                class="rounded-[4px] p-2.5 flex flex-col gap-1 text-[11px]"
                style="background: rgba(var(--ov), .04); border: 1px solid rgba(var(--ov), .08);"
              >
                <div class="flex justify-between">
                  <span class="text-[var(--c-muted)]">País-alvo:</span>
                  <span class="font-bold text-[var(--c-text)]">Brasil 🇧🇷</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-[var(--c-muted)]">Alcance estimado:</span>
                  <span class="font-bold text-amber-500 font-mono">
                    ~{{ ((lookalikeRatio * 160000000) / 100000000).toFixed(1) }} Milhões de pessoas
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-[var(--c-muted)]">Taxa esperada de conversão:</span>
                  <span class="font-bold text-emerald-400 font-mono">
                    {{ lookalikeRatio === 1 ? 'Alta (Top 1%)' : 'Média' }}
                  </span>
                </div>
              </div>

              <cm-button
                variant="primary"
                size="sm"
                [arrow]="true"
                [fullWidth]="true"
                (clicked)="submitLookalikeCreation()"
              >
                <span>gerar lookalike {{ lookalikeRatio }}% na meta</span>
              </cm-button>
            </div>
          </div>
        </div>
      }

      <!-- ================= ABA 3: SINCRONIZADOR DE CONTATOS (SHA-256) ================= -->
      @if (activeTab() === 'sync') {
        <div class="card-p flex flex-col gap-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div class="card-title text-sm">Lista de Contatos do Instagram (Sincronização com Meta Ads)</div>
              <div class="card-sub text-xs">
                Criptografia SHA-256 no client & server antes de enviar para a Meta. Compatível com LGPD e políticas Meta Ads.
              </div>
            </div>

            <div class="flex items-center gap-2">
              <cm-button
                variant="primary"
                size="sm"
                (clicked)="syncAllContactsToMeta()"
              >
                <span>📤 criptografar e sincronizar todos na meta</span>
              </cm-button>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="border-b border-[rgba(var(--ov),.1)] text-[11px] font-mono uppercase text-[var(--c-muted)]">
                  <th class="py-2.5 px-3">Usuário Instagram</th>
                  <th class="py-2.5 px-3">E-mail (Hash SHA-256)</th>
                  <th class="py-2.5 px-3">Telefone</th>
                  <th class="py-2.5 px-3">Origem</th>
                  <th class="py-2.5 px-3">Tags</th>
                  <th class="py-2.5 px-3">Status na Meta</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[rgba(var(--ov),.06)]">
                @for (c of currentAccountContacts(); track c.id) {
                  <tr class="hover:bg-[rgba(var(--ov),.02)]">
                    <td class="py-3 px-3 font-medium text-[var(--c-text)]">
                      &#64;{{ c.u }}
                    </td>

                    <td class="py-3 px-3 font-mono text-[11px] text-[var(--c-muted)]">
                      {{ c.email || '—' }}
                    </td>

                    <td class="py-3 px-3 font-mono text-[11px] text-[var(--c-muted)]">
                      {{ c.phone || '—' }}
                    </td>

                    <td class="py-3 px-3 font-mono text-[11px] text-[var(--c-text)]">
                      {{ c.src }}
                    </td>

                    <td class="py-3 px-3">
                      <div class="flex items-center gap-1 flex-wrap">
                        @for (tag of c.tags; track tag) {
                          <span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[rgba(var(--ov),.06)] text-[var(--c-text)]">
                            {{ tag }}
                          </span>
                        }
                      </div>
                    </td>

                    <td class="py-3 px-3 whitespace-nowrap">
                      @if (c.metaSynced) {
                        <span class="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          Sincronizado na Meta
                        </span>
                      } @else {
                        <span class="inline-flex items-center gap-1 text-[11px] font-mono text-amber-500">
                          <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          Pendente de envio
                        </span>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- ================= ABA 4: ASSISTENTE IA DE ANÚNCIOS ================= -->
      @if (activeTab() === 'ai-assistant') {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Recomendação 1: Post com Alto Engajamento -->
          <div class="card-p flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <span class="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Oportunidade de Escala
              </span>
              <span class="text-xs text-[var(--c-muted)] font-mono">IA Copilot</span>
            </div>

            <h4 class="text-sm font-bold text-[var(--c-text)]">
              Transformar Reels "3 Sinais de que seu produto precisa de um agente" em Anúncio Lookalike
            </h4>

            <p class="text-xs text-[var(--c-muted)]">
              Este post gerou <strong>48 leads qualificados</strong> organicamente via palavra-chave "AGENTE". A IA recomenda criar um Lookalike de 1% no Brasil e injetar R$ 50/dia para capturar novos clientes no Direct.
            </p>

            <div class="rounded p-2.5 bg-[rgba(var(--ov),.04)] text-xs flex flex-col gap-1 border border-[rgba(var(--ov),.08)]">
              <div class="flex justify-between">
                <span class="text-[var(--c-muted)]">Público sugerido:</span>
                <span class="font-bold text-[var(--c-text)]">Lookalike 1% Brasil (1.6M)</span>
              </div>
              <div class="flex justify-between">
                <span class="text-[var(--c-muted)]">CPA Estimado:</span>
                <span class="font-bold text-emerald-400 font-mono">R$ 6,50 - R$ 9,00 / lead</span>
              </div>
            </div>

            <cm-button
              variant="primary"
              size="sm"
              (clicked)="state.quickPromoteWithLookalike('3 sinais de que seu produto precisa de um agente', 'p1')"
            >
              <span>🚀 aplicar recomendação e ativar anúncio</span>
            </cm-button>
          </div>

          <!-- Recomendação 2: Remarketing da Caixa de Entrada -->
          <div class="card-p flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <span class="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-sky-500/20 text-sky-400 border border-sky-500/30">
                Remarketing de Alta Conversão
              </span>
              <span class="text-xs text-[var(--c-muted)] font-mono">IA Copilot</span>
            </div>

            <h4 class="text-sm font-bold text-[var(--c-text)]">
              Anunciar para quem comentou mas ainda não fechou
            </h4>

            <p class="text-xs text-[var(--c-muted)]">
              Você tem 420 pessoas que interagiram nos comentários e inbox nos últimos 30 dias. Um anúncio de remarketing com chamada para oferta especial costuma ter ROAS acima de 6x.
            </p>

            <div class="rounded p-2.5 bg-[rgba(var(--ov),.04)] text-xs flex flex-col gap-1 border border-[rgba(var(--ov),.08)]">
              <div class="flex justify-between">
                <span class="text-[var(--c-muted)]">Público:</span>
                <span class="font-bold text-[var(--c-text)]">Lista VIP — Leads Inbox</span>
              </div>
              <div class="flex justify-between">
                <span class="text-[var(--c-muted)]">ROAS Estimado:</span>
                <span class="font-bold text-emerald-400 font-mono">5.8x - 7.2x</span>
              </div>
            </div>

            <cm-button
              variant="ghost"
              size="sm"
              (clicked)="state.quickPromoteWithLookalike('Remarketing Leads Inbox', 'p2')"
            >
              <span>🎯 criar campanha de remarketing</span>
            </cm-button>
          </div>
        </div>
      }

      <!-- ================= MODAL: NOVA CAMPANHA ================= -->
      @if (showCampaignModal()) {
        <div class="modal-backdrop" (click)="showCampaignModal.set(false)">
          <div class="modal-box" (click)="$event.stopPropagation()">
            <div class="flex items-center justify-between border-b border-[rgba(var(--ov),.1)] pb-3">
              <h3 class="text-base font-bold text-[var(--c-text)]">Criar Campanha Meta Ads</h3>
              <button
                type="button"
                class="modal-close-btn"
                title="Fechar modal"
                aria-label="Fechar"
                (click)="showCampaignModal.set(false)"
              >
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div class="flex flex-col gap-3 py-3 text-xs">
              <div>
                <label for="camp-name" class="block font-mono uppercase text-[11px] text-[var(--c-muted)] mb-1">
                  Nome da Campanha
                </label>
                <input
                  id="camp-name"
                  type="text"
                  maxlength="100"
                  class="modal-input"
                  [style.border-color]="campErrors().name ? 'var(--c-err)' : ''"
                  [attr.aria-invalid]="!!campErrors().name"
                  [(ngModel)]="newCampName"
                  (ngModelChange)="campErrors.set({})"
                  placeholder="Ex: LAL 1% BR | Agentes de IA"
                />
                @if (campErrors().name) {
                  <p class="text-[11px] mt-1" style="color: var(--c-err);" role="alert">{{ campErrors().name }}</p>
                }
              </div>

              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label for="camp-objective" class="block font-mono uppercase text-[11px] text-[var(--c-muted)] mb-1">
                    Objetivo
                  </label>
                  <select id="camp-objective" class="modal-input" [(ngModel)]="newCampObjective">
                    <option value="OUTCOME_LEADS">Gerar Leads (Direct/WhatsApp)</option>
                    <option value="OUTCOME_ENGAGEMENT">Engajamento (Comentários)</option>
                    <option value="OUTCOME_SALES">Vendas & Conversão</option>
                    <option value="OUTCOME_TRAFFIC">Tráfego para Site</option>
                  </select>
                </div>

                <div>
                  <label for="camp-budget" class="block font-mono uppercase text-[11px] text-[var(--c-muted)] mb-1">
                    Orçamento Diário (R$)
                  </label>
                  <input
                    id="camp-budget"
                    type="number"
                    inputmode="decimal"
                    required
                    min="10"
                    max="100000"
                    step="1"
                    class="modal-input"
                    [style.border-color]="campErrors().budget ? 'var(--c-err)' : ''"
                    [attr.aria-invalid]="!!campErrors().budget"
                    [(ngModel)]="newCampBudget"
                    (ngModelChange)="campErrors.set({})"
                  />
                  @if (campErrors().budget) {
                    <p class="text-[11px] mt-1" style="color: var(--c-err);" role="alert">{{ campErrors().budget }}</p>
                  }
                </div>
              </div>

              <div>
                <label for="camp-audience" class="block font-mono uppercase text-[11px] text-[var(--c-muted)] mb-1">
                  Público-Alvo Meta
                </label>
                <select id="camp-audience" class="modal-input" [(ngModel)]="newCampAudienceId">
                  @for (aud of state.accountAudiences(); track aud.id) {
                    <option [value]="aud.id">
                      {{ aud.type === 'LOOKALIKE' ? '🎯 ' : '📋 ' }} {{ aud.name }}
                    </option>
                  }
                </select>
              </div>
            </div>

            <div class="flex items-center justify-end gap-2 pt-3 border-t border-[rgba(var(--ov),.1)]">
              <button
                type="button"
                class="px-3 py-1.5 rounded text-xs text-[var(--c-muted)] cursor-pointer"
                (click)="showCampaignModal.set(false)"
              >
                Cancelar
              </button>
              <cm-button
                variant="primary"
                size="sm"
                [arrow]="true"
                (clicked)="submitCampaignCreation()"
              >
                <span>publicar na meta ads</span>
              </cm-button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .kpi-card {
        background: var(--c-panel);
        border: 1px solid rgba(var(--ov), 0.08);
        border-radius: 6px;
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 3px;
      }
      .kpi-card.highlight {
        border-color: rgba(246, 188, 3, 0.4);
        background: rgba(246, 188, 3, 0.04);
      }
      .kpi-label {
        font-family: var(--font-mono);
        font-size: 10px;
        text-transform: uppercase;
        color: var(--c-muted);
      }
      .kpi-value {
        font-family: var(--font-display);
        font-size: 18px;
        font-weight: 700;
        color: var(--c-text);
      }
      .kpi-value.accent {
        color: var(--c-acc);
      }
      .kpi-value.accent-green {
        color: #4ade80;
      }
      .kpi-sub {
        font-size: 11px;
        color: var(--c-muted);
      }
      .tab-btn {
        padding: 6px 12px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
        color: var(--c-muted);
        background: transparent;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        transition: all 0.15s ease;
      }
      .tab-btn:hover {
        color: var(--c-text);
        background: rgba(var(--ov), 0.04);
      }
      .tab-btn.active {
        color: var(--c-text);
        background: rgba(var(--ov), 0.08);
        font-weight: 600;
      }
      .tab-badge {
        font-size: 10px;
        font-family: var(--font-mono);
        padding: 1px 5px;
        border-radius: 999px;
        background: rgba(var(--ov), 0.1);
        color: var(--c-text);
      }
      .tab-badge.ai {
        background: rgba(246, 188, 3, 0.2);
        color: var(--c-acc);
      }
      .filter-pill {
        padding: 3px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-family: var(--font-mono);
        background: transparent;
        border: 1px solid rgba(var(--ov), 0.1);
        color: var(--c-muted);
        cursor: pointer;
      }
      .filter-pill.active {
        background: rgba(var(--ov), 0.1);
        border-color: rgba(var(--ov), 0.25);
        color: var(--c-text);
      }
      .card-p {
        background: var(--c-panel);
        border: 1px solid rgba(var(--ov), 0.1);
        border-radius: 6px;
        padding: 16px;
      }
      .card-title {
        font-size: 14px;
        font-weight: 600;
        color: var(--c-text);
      }
      .card-sub {
        font-size: 12px;
        color: var(--c-muted);
      }
      .aud-card {
        background: rgba(var(--ov), 0.03);
        border: 1px solid rgba(var(--ov), 0.08);
        border-radius: 6px;
        padding: 14px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .aud-card:hover {
        border-color: rgba(var(--ov), 0.18);
      }
      .lal-badge {
        font-size: 9px;
        font-family: var(--font-mono);
        font-weight: 700;
        padding: 1px 4px;
        border-radius: 3px;
        background: rgba(246, 188, 3, 0.15);
        color: #f59e0b;
        border: 1px solid rgba(246, 188, 3, 0.3);
      }
      .toggle-switch {
        width: 34px;
        height: 18px;
        border-radius: 999px;
        background: rgba(var(--ov), 0.15);
        border: 1px solid rgba(var(--ov), 0.2);
        position: relative;
        cursor: pointer;
        transition: background 0.2s ease;
      }
      .toggle-switch.active {
        background: #10b981;
        border-color: #059669;
      }
      .toggle-dot {
        position: absolute;
        top: 2px;
        left: 2px;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: white;
        transition: transform 0.2s ease;
      }
      .toggle-switch.active .toggle-dot {
        transform: translateX(16px);
      }
      .action-btn {
        padding: 4px 8px;
        border-radius: 4px;
        background: rgba(var(--ov), 0.05);
        border: 1px solid rgba(var(--ov), 0.1);
        color: var(--c-muted);
        cursor: pointer;
      }
      .action-btn:hover {
        color: var(--c-text);
        background: rgba(var(--ov), 0.1);
      }
      .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.65);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 50;
      }
      .modal-box {
        background: var(--c-panel);
        border: 1px solid rgba(var(--ov), 0.2);
        border-radius: 8px;
        width: 100%;
        max-width: 480px;
        padding: 20px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
      }
      .modal-input {
        width: 100%;
        height: 34px;
        padding: 0 10px;
        border-radius: 4px;
        background: rgba(var(--ov), 0.06);
        border: 1px solid rgba(var(--ov), 0.15);
        color: var(--c-text);
        font-family: var(--font-sans);
        font-size: 12px;
      }
      .modal-input:focus {
        outline: none;
        border-color: #f1a10b;
      }
    `,
  ],
})
export class MetaCampaignsComponent {
  readonly state = inject(AccountStateService);

  readonly activeTab = signal<MetaSubTab>('campaigns');
  readonly showCampaignModal = signal<boolean>(false);

  readonly auth = inject(SupabaseService);

  // ----- Campanhas: busca, ordenação e paginação -----
  readonly campColumns = [
    { key: 'status', label: 'Status', sortable: true },
    { key: 'name', label: 'Nome da Campanha', sortable: true },
    { key: 'audience', label: 'Público Segmentado', sortable: true },
    { key: 'budget', label: 'Orçamento/dia', sortable: true },
    { key: 'spend', label: 'Gasto', sortable: true },
    { key: 'impressions', label: 'Impressões', sortable: true },
    { key: 'leads', label: 'Leads', sortable: true },
    { key: 'cpa', label: 'CPA', sortable: true },
    { key: 'roas', label: 'ROAS', sortable: true },
  ];
  readonly campQuery = signal('');
  readonly campSorter = createSorter<MetaCampaign>(
    [
      { key: 'status', label: 'Status', compare: (a, b) => cmpText(a.status, b.status) },
      { key: 'name', label: 'Nome', compare: (a, b) => cmpText(a.name, b.name) },
      { key: 'audience', label: 'Público', compare: (a, b) => cmpText(a.audienceName, b.audienceName) },
      { key: 'budget', label: 'Orçamento', compare: (a, b) => cmpNum(a.dailyBudget, b.dailyBudget) },
      { key: 'spend', label: 'Gasto', compare: (a, b) => cmpNum(a.spend, b.spend) },
      { key: 'impressions', label: 'Impressões', compare: (a, b) => cmpNum(a.impressions, b.impressions) },
      { key: 'leads', label: 'Leads', compare: (a, b) => cmpNum(a.leads, b.leads) },
      { key: 'cpa', label: 'CPA', compare: (a, b) => cmpNum(a.cpa, b.cpa) },
      { key: 'roas', label: 'ROAS', compare: (a, b) => cmpNum(a.roas, b.roas) },
    ],
    'spend',
    'desc'
  );
  readonly campSorted = computed(() => {
    const q = this.campQuery().trim().toLowerCase();
    let list = this.state.accountCampaigns();
    if (q) list = list.filter((c) => c.name.toLowerCase().includes(q) || c.audienceName.toLowerCase().includes(q));
    return this.campSorter.apply(list);
  });
  readonly campPager = createPager(() => this.campSorted().length, {
    sizes: [5, 10, 25, 50],
    size: 10,
    resetOn: () => [
      this.state.activeAccount().id,
      this.state.campaignFilter(),
      this.campQuery(),
      this.campSorter.key(),
      this.campSorter.dir(),
    ],
  });
  readonly campItems = computed(() => this.campPager.slice(this.campSorted()));

  // ----- Públicos: busca, ordenação e paginação -----
  readonly audQuery = signal('');
  readonly audSorter = createSorter<MetaAudience>(
    [
      { key: 'name', label: 'nome (A–Z)', compare: (a, b) => cmpText(a.name, b.name) },
      { key: 'size', label: 'tamanho', compare: (a, b) => cmpNum(a.size, b.size) },
      { key: 'type', label: 'tipo', compare: (a, b) => cmpText(a.type, b.type) },
    ],
    'name',
    'asc'
  );
  readonly audSorted = computed(() => {
    const q = this.audQuery().trim().toLowerCase();
    let list = this.state.accountAudiences();
    if (q) list = list.filter((a) => a.name.toLowerCase().includes(q));
    return this.audSorter.apply(list);
  });
  readonly audPager = createPager(() => this.audSorted().length, {
    sizes: [4, 8, 16],
    size: 8,
    resetOn: () => [
      this.state.activeAccount().id,
      this.state.audienceFilter(),
      this.audQuery(),
      this.audSorter.key(),
      this.audSorter.dir(),
    ],
  });
  readonly audItems = computed(() => this.audPager.slice(this.audSorted()));

  // Formulário Lookalike
  newLookalikeSource = 'Lista VIP — Leads Inbox & Palavra "AGENTE"';
  lookalikeRatio = 1;

  // Formulário Campanha
  readonly campErrors = signal<{ name?: string; budget?: string }>({});
  newCampName = '';
  newCampObjective: MetaCampaignObjective = 'OUTCOME_LEADS';
  newCampBudget = 50;
  newCampAudienceId = '';

  readonly currentAccountContacts = computed(() => {
    const accId = this.state.activeAccount().id;
    return this.state.contacts().filter((c) => c.a === accId);
  });

  readonly unsyncedCount = computed(() => {
    return this.currentAccountContacts().filter((c) => !c.metaSynced).length;
  });

  // Contas agrupadas por Business Portfolio, para escolher entre campanhas de portfólios diferentes
  readonly portfolioGroups = computed(() => {
    const groups = new Map<string, MetaAdAccount[]>();
    // Só as contas de anúncios do cliente ativo: nunca mostrar ou criar em conta de outro cliente
    for (const acc of this.state.adAccounts().filter((ad) => ad.a === this.state.activeAccount().id)) {
      const key = acc.portfolioName || 'Sem portfólio';
      groups.set(key, [...(groups.get(key) ?? []), acc]);
    }
    return [...groups.entries()].map(([name, accounts]) => ({ name, accounts }));
  });

  onAdAccountChange(e: Event): void {
    const val = (e.target as HTMLSelectElement).value;
    this.state.selectAdAccount(val);
  }

  formatObjective(obj: MetaCampaignObjective): string {
    switch (obj) {
      case 'OUTCOME_LEADS':
        return 'Leads (DM/WhatsApp)';
      case 'OUTCOME_ENGAGEMENT':
        return 'Engajamento';
      case 'OUTCOME_SALES':
        return 'Vendas';
      case 'OUTCOME_TRAFFIC':
        return 'Tráfego';
      default:
        return obj;
    }
  }

  openLookalikeModal(): void {
    this.activeTab.set('audiences');
  }

  openCampaignModal(): void {
    const auds = this.state.accountAudiences();
    this.newCampAudienceId = auds[0]?.id || '';
    this.newCampName = `Campanha LAL 1% — ${this.state.activeAccount().user}`;
    this.campErrors.set({});
    this.showCampaignModal.set(true);
  }

  submitLookalikeCreation(): void {
    this.state.createLookalikeAudience(
      this.newLookalikeSource,
      this.lookalikeRatio,
      'BR'
    );
  }

  submitCampaignCreation(): void {
    const name = this.newCampName.trim();
    const budget = Number(this.newCampBudget);
    const errors: { name?: string; budget?: string } = {};
    if (name.length < 3) errors.name = 'Informe um nome com pelo menos 3 caracteres';
    if (!Number.isFinite(budget) || String(this.newCampBudget).trim() === '') errors.budget = 'Informe o orçamento diário';
    else if (budget < 10) errors.budget = 'O orçamento diário mínimo é R$ 10';
    else if (budget > 100000) errors.budget = 'O orçamento diário máximo é R$ 100.000';
    if (errors.name || errors.budget) {
      this.campErrors.set(errors);
      return;
    }

    const selectedAud = this.state.audiences().find((a) => a.id === this.newCampAudienceId);

    this.state.createCampaign({
      name,
      objective: this.newCampObjective,
      dailyBudget: budget,
      audienceId: this.newCampAudienceId,
      audienceName: selectedAud?.name || 'Lookalike 1% Brasil',
      isLookalike: selectedAud?.type === 'LOOKALIKE',
    });

    this.showCampaignModal.set(false);
  }

  quickCreateCampaignForAudience(aud: MetaAudience): void {
    this.newCampAudienceId = aud.id;
    this.newCampName = `Campanha | ${aud.name.slice(0, 32)}`;
    this.newCampObjective = aud.type === 'LOOKALIKE' ? 'OUTCOME_LEADS' : 'OUTCOME_SALES';
    this.newCampBudget = 50;
    this.campErrors.set({});
    this.showCampaignModal.set(true);
  }

  syncAllContactsToMeta(): void {
    const auds = this.state.accountAudiences();
    const customListAud = auds.find((a) => a.type === 'CUSTOM_LIST');
    if (customListAud) {
      this.state.syncContactsToMeta(customListAud.id);
    } else {
      const contactIds = this.currentAccountContacts().map((c) => c.id);
      this.state.createAudienceFromContacts(
        `Lista VIP de Contatos — @${this.state.activeAccount().user}`,
        contactIds
      );
    }
  }
}

