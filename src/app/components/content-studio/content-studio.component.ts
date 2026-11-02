import { Component, inject, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { AccountStateService, CAPTION_MAX } from '../../services/account-state.service';
import { PostFormat, PostItem, PostStatus } from '../../data/seed-data';
import { MediaUploaderComponent } from '../media-uploader/media-uploader.component';
import { ContentCalendarComponent } from './content-calendar.component';
import { PagerComponent } from '../../shared/pager.component';
import { cmpNum, cmpText, createPager, createSorter } from '../../shared/list-tools';
import { isValidIsoDate, isValidTime, postDateKey, postWhen, todayIso } from '../../shared/dates';
import { PlatformLinksComponent } from '../platform-links.component';
import {
  FORMAT_ICON,
  FORMAT_LABEL,
  STATUS_BG,
  STATUS_COLOR,
  STATUS_LABEL,
  STATUS_OPTIONS,
  STATUS_ORDER,
  formatBadgeClass as formatBadge,
} from '../../shared/post-ui';

@Component({
  selector: 'app-content-studio',
  imports: [FormsModule, NgClass, MediaUploaderComponent, ContentCalendarComponent, PagerComponent, PlatformLinksComponent],
  template: `
    <div class="flex flex-col gap-4 w-full">
      <!-- ==================== TOOLBAR SUPERIOR DINÂMICA ==================== -->
      <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-xl bg-[var(--c-panel)] border border-[var(--c-border)] shadow-sm">
        <!-- Seletor de Modo de Visualização (Kanban, Grid, Feed, Calendário) -->
        <div class="flex items-center gap-1.5 p-1 rounded-lg bg-[var(--c-bg-elev)] border border-[var(--c-border)] shrink-0 overflow-x-auto">
          <button
            type="button"
            class="px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            [ngClass]="activeMode() === 'kanban' ? 'bg-[var(--c-panel)] text-[var(--c-acc)] font-bold shadow-sm border border-[rgba(var(--ov),.15)]' : 'text-[var(--c-text-muted)] hover:text-[var(--c-text)]'"
            (click)="setMode('kanban')">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="5" height="18" rx="1"/>
              <rect x="10" y="3" width="5" height="18" rx="1"/>
              <rect x="17" y="3" width="5" height="18" rx="1"/>
            </svg>
            <span>Kanban Dinâmico</span>
          </button>

          <button
            type="button"
            class="px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            [ngClass]="activeMode() === 'grid' ? 'bg-[var(--c-panel)] text-[var(--c-acc)] font-bold shadow-sm border border-[rgba(var(--ov),.15)]' : 'text-[var(--c-text-muted)] hover:text-[var(--c-text)]'"
            (click)="setMode('grid')">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="14" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
            </svg>
            <span>Grid de Mídia</span>
          </button>

          <button
            type="button"
            class="px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            [ngClass]="activeMode() === 'list' ? 'bg-[var(--c-panel)] text-[var(--c-acc)] font-bold shadow-sm border border-[rgba(var(--ov),.15)]' : 'text-[var(--c-text-muted)] hover:text-[var(--c-text)]'"
            (click)="setMode('list')">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="8" y1="6" x2="21" y2="6"/>
              <line x1="8" y1="12" x2="21" y2="12"/>
              <line x1="8" y1="18" x2="21" y2="18"/>
              <line x1="3" y1="6" x2="3.01" y2="6"/>
              <line x1="3" y1="12" x2="3.01" y2="12"/>
              <line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
            <span>Lista</span>
          </button>

          <button
            type="button"
            class="px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            [ngClass]="activeMode() === 'feed' ? 'bg-[var(--c-panel)] text-[var(--c-acc)] font-bold shadow-sm border border-[rgba(var(--ov),.15)]' : 'text-[var(--c-text-muted)] hover:text-[var(--c-text)]'"
            (click)="setMode('feed')">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="2" width="20" height="20" rx="5"/>
              <circle cx="12" cy="12" r="4"/>
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>
            </svg>
            <span>Feed 3x3</span>
          </button>

          <button
            type="button"
            class="px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            [ngClass]="activeMode() === 'calendar' ? 'bg-[var(--c-panel)] text-[var(--c-acc)] font-bold shadow-sm border border-[rgba(var(--ov),.15)]' : 'text-[var(--c-text-muted)] hover:text-[var(--c-text)]'"
            (click)="setMode('calendar')">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <span>Calendário</span>
          </button>
        </div>

        <!-- Controles de Busca e Filtro -->
        <div class="flex items-center gap-2 flex-wrap md:justify-end md:flex-1 min-w-0">
          <!-- Input de Busca -->
          <div class="relative min-w-[200px] flex-1">
            <input
              type="text"
              class="w-full pl-8 pr-7 py-1.5 rounded-lg bg-[var(--c-bg-elev)] border border-[var(--c-border)] text-xs text-[var(--c-text)] placeholder-[var(--c-text-muted)] cm-input-focus"
              placeholder="Buscar por tópico, copy ou hashtag..."
              aria-label="Buscar posts"
              [ngModel]="searchQuery()"
              (ngModelChange)="searchQuery.set($event)" />
            <svg class="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--c-dim)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            @if (searchQuery()) {
              <button
                type="button"
                class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[var(--c-dim)] hover:text-[var(--c-text)] cursor-pointer"
                (click)="searchQuery.set('')">
                ✕
              </button>
            }
          </div>

          <!-- Filtro por Formato -->
          <select
            class="px-2.5 py-1.5 rounded-lg bg-[var(--c-bg-elev)] border border-[var(--c-border)] text-xs text-[var(--c-text)] cursor-pointer cm-input-focus"
            aria-label="Filtrar por formato"
            [ngModel]="formatFilter()"
            (ngModelChange)="formatFilter.set($event)">
            <option value="ALL">Todos os Formatos</option>
            <option value="CAROUSEL">Carrossel (4:5)</option>
            <option value="REELS">Reels (9:16)</option>
            <option value="IMAGE">Imagem Feed</option>
            <option value="STORIES">Stories</option>
          </select>

          <!-- Filtro por Status (o Kanban já separa por status) -->
          @if (activeMode() !== 'kanban') {
            <select
              class="px-2.5 py-1.5 rounded-lg bg-[var(--c-bg-elev)] border border-[var(--c-border)] text-xs text-[var(--c-text)] cursor-pointer cm-input-focus"
              aria-label="Filtrar por status"
              [ngModel]="statusFilter()"
              (ngModelChange)="statusFilter.set($event)">
              <option value="ALL">Todos os Status</option>
              @for (s of statusOptions; track s.value) {
                <option [value]="s.value">{{ s.label }}</option>
              }
            </select>
          }

          <!-- Ordenação (Grid, Lista e Feed) -->
          @if (activeMode() === 'grid' || activeMode() === 'list' || activeMode() === 'feed') {
            <div class="flex items-center gap-1 shrink-0">
              <select
                class="px-2.5 py-1.5 rounded-lg bg-[var(--c-bg-elev)] border border-[var(--c-border)] text-xs text-[var(--c-text)] cursor-pointer cm-input-focus"
                aria-label="Ordenar por"
                [ngModel]="sorter.key()"
                (ngModelChange)="onSortChange($event)">
                @for (o of sorter.options; track o.key) {
                  <option [value]="o.key">Ordenar: {{ o.label }}</option>
                }
              </select>
              <button
                type="button"
                class="w-8 h-8 rounded-lg bg-[var(--c-bg-elev)] border border-[var(--c-border)] text-xs text-[var(--c-text)] cursor-pointer hover:border-[var(--c-acc)]"
                [attr.aria-label]="sorter.dir() === 'asc' ? 'Ordem crescente. Inverter' : 'Ordem decrescente. Inverter'"
                [title]="sorter.dir() === 'asc' ? 'Crescente' : 'Decrescente'"
                (click)="sorter.toggleDir()">
                {{ sorter.dir() === 'asc' ? '▲' : '▼' }}
              </button>
            </div>
          }

          <!-- Ação Rápida: Novo Post -->
          <button
            type="button"
            class="px-3 py-1.5 rounded-lg bg-gradient-to-b from-[#ffcb05] to-[#f58220] hover:brightness-105 active:scale-95 text-[#1f1f1f] font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-all whitespace-nowrap shrink-0"
            (click)="state.openComposer()">
            <span>+</span>
            <span>Novo Post</span>
          </button>
        </div>
      </div>

      <!-- Resumo e Estatísticas Dinâmicas dos Posts -->
      <div class="flex items-center justify-between text-xs text-[var(--c-text-muted)] px-1">
        <div class="flex items-center gap-2">
          <span>Conta: <strong class="text-[var(--c-text)]">&#64;{{ state.activeAccount().user }}</strong></span>
          <span>·</span>
          <span>Exibindo <strong>{{ filteredPosts().length }}</strong> de {{ state.accountPosts().length }} publicações</span>
        </div>
        <div class="hidden sm:flex items-center gap-3 font-mono text-[11px]">
          <span class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>Rascunhos: {{ countByStatus('DRAFT') }}</span>
          </span>
          <span class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-blue-400"></span>
            <span>Prontos: {{ countByStatus('PROMPT_READY') }}</span>
          </span>
          <span class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-purple-400"></span>
            <span>Agendados: {{ countByStatus('SCHEDULED') }}</span>
          </span>
          <span class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Publicados: {{ countByStatus('PUBLISHED') }}</span>
          </span>
        </div>
      </div>

      <!-- ==================== 1. VIEW: KANBAN DINÂMICO ==================== -->
      @if (activeMode() === 'kanban') {
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 items-start w-full">
          @for (col of kanbanCols(); track col.key) {
            <section
              class="rounded-xl p-3 flex flex-col gap-3 min-h-[300px] transition-all bg-[var(--c-panel)] border border-[var(--c-border)] shadow-sm"
              [style.border-top-color]="col.accentColor"
              style="border-top-width: 3px;">
              <!-- Col Header com Ação Rápida -->
              <div class="flex items-center justify-between pb-2 border-b border-[var(--c-border)]">
                <div class="flex items-center gap-2">
                  <span class="text-sm">{{ col.icon }}</span>
                  <span
                    class="font-display font-semibold text-xs tracking-wider uppercase"
                    [style.color]="col.accentColor">
                    {{ col.title }}
                  </span>
                  <span class="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[rgba(var(--ov),.08)] text-[var(--c-text)]">
                    {{ col.posts.length }}
                  </span>
                </div>

                <!-- Botão + para adicionar diretamente no status -->
                <button
                  type="button"
                  class="w-6 h-6 rounded-md flex items-center justify-center text-xs text-[var(--c-text-muted)] hover:text-[var(--c-text)] hover:bg-[rgba(var(--ov),.1)] transition-colors cursor-pointer"
                  [title]="'Adicionar post em ' + col.title"
                  (click)="quickAddForColumn(col.key)">
                  +
                </button>
              </div>

              <!-- Lista de Cards da Coluna -->
              <div class="flex flex-col gap-2.5">
                @for (p of col.posts; track p.id) {
                  <article
                    class="cm-card-interactive group rounded-lg p-3 cursor-pointer w-full text-left bg-[var(--c-bg-elev)] border transition-all flex flex-col gap-2"
                    [style.border-color]="state.selId() === p.id ? 'var(--c-acc)' : 'var(--c-border)'"
                    [style.box-shadow]="state.selId() === p.id ? '0 0 0 1px var(--c-acc)' : 'none'"
                    (click)="openPost(p.id)">
                    <!-- Linha Superior: Formato e Status -->
                    <div class="flex items-center justify-between gap-2">
                      <span
                        class="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1"
                        [ngClass]="formatBadgeClass(p.t)">
                        <span>{{ formatIcon(p.t) }}</span>
                        <span>{{ formatLabel(p.t) }}</span>
                      </span>

                      <span class="text-[11px] font-mono text-[var(--c-text-muted)] flex items-center gap-1 shrink-0">
                        <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        <span>{{ postMeta(p) }}</span>
                      </span>
                    </div>

                    <!-- Mídia Preview Thumbnail (se houver) -->
                    @if (p.media && p.media.length > 0) {
                      <div class="relative w-full aspect-[16/9] rounded-md overflow-hidden bg-black/60 border border-[rgba(var(--ov),.1)]">
                        @let mediaItem = p.media[0];
                        @if (mediaItem.type === 'video') {
                          <img
                            [src]="mediaItem.thumbnailUrl || mediaItem.url"
                            alt="Vídeo"
                            class="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                          />
                          <div class="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <span class="w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center text-xs">▶</span>
                          </div>
                          <span class="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 text-[9.5px] text-white font-mono">
                            Vídeo
                          </span>
                        } @else {
                          <img
                            [src]="mediaItem.url"
                            [alt]="mediaItem.name"
                            class="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                          />
                          @if (p.media.length > 1) {
                            <span class="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 text-[9.5px] text-white font-mono flex items-center gap-1">
                              🗂 {{ p.media.length }}
                            </span>
                          }
                        }
                      </div>
                    }

                    <!-- Título / Hook Principal -->
                    <h4 class="font-semibold text-xs leading-snug text-[var(--c-text)] line-clamp-2">
                      {{ p.topic }}
                    </h4>

                    <!-- Prévia da Legenda -->
                    @if (p.cap) {
                      <p class="text-[11px] text-[var(--c-text-muted)] line-clamp-2 leading-relaxed">
                        {{ p.cap }}
                      </p>
                    }

                    <!-- Link direto da publicação na Meta (só existe em posts já publicados) -->
                    @if (p.permalink) {
                      <a
                        [href]="p.permalink"
                        target="_blank"
                        rel="noopener noreferrer"
                        (click)="$event.stopPropagation()"
                        [attr.aria-label]="'Abrir publicação de ' + p.topic + ' em nova aba'"
                        class="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md bg-[rgba(123,191,74,.12)] border border-[rgba(123,191,74,.3)] hover:bg-[rgba(123,191,74,.22)] transition-colors">
                        <span class="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--c-ok)]">
                          <span>ver publicação</span>
                          <svg class="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                            <polyline points="15 3 21 3 21 9"/>
                            <line x1="10" y1="14" x2="21" y2="3"/>
                          </svg>
                        </span>
                        <span class="text-[10px] font-mono text-[var(--c-dim)] truncate">{{ p.permalink.includes('instagram.com') ? 'instagram' : 'facebook' }}</span>
                      </a>
                    }

                    <!-- Rodapé do Card com Ações Rápidas -->
                    <div class="flex items-center justify-between pt-2 border-t border-[rgba(var(--ov),.08)] mt-1 text-[11px]">
                      <span class="text-[10px] font-mono text-[var(--c-dim)]">
                        IA: {{ p.ai || 'Multi-Engine' }}
                      </span>

                      <div class="flex items-center gap-1.5">
                        <!-- Avançar status com 1 clique -->
                        @if (getNextStatus(p.s); as nextSt) {
                          <button
                            type="button"
                            class="px-2 py-0.5 rounded bg-[var(--c-surface)] hover:bg-[rgba(246,188,3,.2)] text-[var(--c-text2)] hover:text-[var(--c-acc)] font-mono text-[10.5px] flex items-center gap-1 transition-colors cursor-pointer"
                            [title]="'Mover para ' + statusLabel(nextSt)"
                            (click)="$event.stopPropagation(); state.movePostStatus(p.id, nextSt)">
                            <span>{{ statusLabel(nextSt) }}</span>
                            <span>➔</span>
                          </button>
                        }

                        <!-- Menu de opções rápidas -->
                        <button
                          type="button"
                          class="w-5 h-5 rounded flex items-center justify-center text-[var(--c-dim)] hover:text-[var(--c-text)] hover:bg-[rgba(var(--ov),.1)] cursor-pointer"
                          title="Duplicar post"
                          (click)="$event.stopPropagation(); state.duplicatePost(p.id)">
                          <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </article>
                }

                <!-- Empty State Interativo da Coluna (espaço preenchido de forma produtiva) -->
                @if (col.posts.length === 0) {
                  <div class="py-8 px-3 rounded-lg border border-dashed border-[rgba(var(--ov),.15)] flex flex-col items-center justify-center gap-2 text-center bg-[rgba(var(--ov),.01)]">
                    <span class="text-xl opacity-60">{{ col.icon }}</span>
                    <span class="text-xs text-[var(--c-dim)] font-medium">Nenhum post em {{ col.title }}</span>
                    <button
                      type="button"
                      class="mt-1 px-3 py-1 rounded-md text-[11px] font-mono text-[var(--c-acc)] bg-[rgba(246,188,3,.1)] hover:bg-[rgba(246,188,3,.2)] border border-[rgba(241,161,11,.3)] cursor-pointer transition-colors"
                      (click)="quickAddForColumn(col.key)">
                      + Adicionar {{ col.title }}
                    </button>
                  </div>
                }
              </div>
            </section>
          }
        </div>
      }

      <!-- ==================== 2. VIEW: GRID DE MÍDIA COMPLETO ==================== -->
      @if (activeMode() === 'grid') {
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
          @for (p of gridItems(); track p.id) {
            <article
              class="cm-card-interactive group rounded-xl overflow-hidden bg-[var(--c-panel)] border transition-all flex flex-col justify-between cursor-pointer"
              [style.border-color]="state.selId() === p.id ? 'var(--c-acc)' : 'var(--c-border)'"
              [style.box-shadow]="state.selId() === p.id ? '0 0 0 1px var(--c-acc)' : 'none'"
              (click)="openPost(p.id)">
              <!-- Header do Post Card -->
              <div class="p-3 pb-2 flex items-center justify-between gap-2 border-b border-[var(--c-border)]">
                <span
                  class="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1"
                  [ngClass]="formatBadgeClass(p.t)">
                  <span>{{ formatIcon(p.t) }}</span>
                  <span>{{ formatLabel(p.t) }}</span>
                </span>
                <span
                  class="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold flex items-center gap-1"
                  [style.background]="statusBg(p.s)"
                  [style.color]="statusColor(p.s)">
                  <span class="w-1.5 h-1.5 rounded-full" [style.background]="statusColor(p.s)"></span>
                  <span>{{ statusLabel(p.s) }}</span>
                </span>
              </div>

              <!-- Media Cover Visual Grande -->
              <div class="relative w-full aspect-[4/5] bg-black/60 overflow-hidden flex items-center justify-center">
                @if (p.media && p.media.length > 0) {
                  @let mediaItem = p.media[0];
                  @if (mediaItem.type === 'video') {
                    <img
                      [src]="mediaItem.thumbnailUrl || mediaItem.url"
                      alt="Vídeo"
                      class="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                    />
                    <div class="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <span class="w-10 h-10 rounded-full bg-black/75 text-white flex items-center justify-center text-sm shadow-lg">▶</span>
                    </div>
                  } @else {
                    <img
                      [src]="mediaItem.url"
                      [alt]="mediaItem.name"
                      class="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                    />
                  }
                  @if (p.media.length > 1) {
                    <span class="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/80 text-[10px] font-mono text-white flex items-center gap-1 border border-white/10">
                      🗂 1/{{ p.media.length }}
                    </span>
                  }
                } @else {
                  <div class="w-full h-full p-5 bg-gradient-to-br from-[#2b2b2b] via-[#1f1f1f] to-[#f1a10b]/20 flex flex-col justify-between">
                    <span class="text-xs font-mono text-[var(--c-acc)]">{{ formatLabel(p.t) }}</span>
                    <p class="text-sm font-bold text-white leading-snug line-clamp-3">{{ p.topic }}</p>
                    <span class="text-[10px] font-mono text-white/50">&#64;{{ state.activeAccount().user }}</span>
                  </div>
                }

                <!-- Overlay rápido com botão editar ao passar o mouse -->
                <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
                  <span class="px-3 py-1.5 rounded-lg bg-[var(--c-acc)] text-black font-bold text-xs shadow-lg">
                    Editar Detalhes ➔
                  </span>
                </div>
              </div>

              <!-- Informações Textuais & Copy -->
              <div class="p-3 flex flex-col gap-1.5 flex-1 justify-between">
                <div>
                  <h4 class="font-bold text-xs text-[var(--c-text)] line-clamp-2 leading-snug">
                    {{ p.topic }}
                  </h4>
                  @if (p.cap) {
                    <p class="text-[11px] text-[var(--c-text-muted)] line-clamp-2 mt-1 leading-relaxed">
                      {{ p.cap }}
                    </p>
                  }
                </div>

                @if (p.permalink) {
                  <a
                    [href]="p.permalink"
                    target="_blank"
                    rel="noopener noreferrer"
                    (click)="$event.stopPropagation()"
                    [attr.aria-label]="'Abrir publicação de ' + p.topic + ' em nova aba'"
                    class="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md bg-[rgba(123,191,74,.12)] border border-[rgba(123,191,74,.3)] hover:bg-[rgba(123,191,74,.22)] transition-colors">
                    <span class="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--c-ok)]">
                      <span>ver publicação</span>
                      <svg class="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                        <polyline points="15 3 21 3 21 9"/>
                        <line x1="10" y1="14" x2="21" y2="3"/>
                      </svg>
                    </span>
                    <span class="text-[10px] font-mono text-[var(--c-dim)] truncate">{{ p.permalink.includes('instagram.com') ? 'instagram' : 'facebook' }}</span>
                  </a>
                }

                <div class="flex items-center justify-between pt-2 border-t border-[rgba(var(--ov),.08)] text-[10.5px] font-mono text-[var(--c-dim)]">
                  <span>{{ postMeta(p) }}</span>
                  <span>{{ p.pr.length > 0 ? p.pr.length + ' prompts' : 'Copy pronto' }}</span>
                </div>
              </div>
            </article>
          }

          @if (filteredPosts().length === 0) {
            <div class="col-span-full py-16 text-center flex flex-col items-center justify-center gap-3">
              <span class="text-3xl">🔍</span>
              <p class="text-sm font-medium text-[var(--c-text-muted)]">Nenhum post encontrado com os filtros atuais.</p>
              <app-platform-links [account]="state.activeAccount()" />
              <button
                type="button"
                class="px-3 py-1.5 rounded-lg bg-[var(--c-surface)] hover:bg-[var(--c-surface-hover)] text-xs text-[var(--c-acc)] cursor-pointer"
                (click)="resetFilters()">
                Limpar filtros de busca
              </button>
            </div>
          }
        </div>
        <app-pager [pager]="gridPager" label="posts" />
      }

      <!-- ==================== 2.1 VIEW: LISTA (TABELA ORDENÁVEL) ==================== -->
      @if (activeMode() === 'list') {
        <div class="rounded-xl bg-[var(--c-panel)] border border-[var(--c-border)] overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="border-b border-[var(--c-border)] text-[11px] font-mono uppercase text-[var(--c-text-muted)]">
                  <th class="py-2.5 px-3 w-14"><span class="sr-only">Mídia</span></th>
                  <th class="py-2.5 px-3" [attr.aria-sort]="sorter.ariaSort('topic')">
                    <button type="button" class="uppercase cursor-pointer hover:text-[var(--c-text)]" (click)="sorter.toggle('topic')">Tópico {{ sorter.indicator('topic') }}</button>
                  </th>
                  <th class="py-2.5 px-3" [attr.aria-sort]="sorter.ariaSort('format')">
                    <button type="button" class="uppercase cursor-pointer hover:text-[var(--c-text)]" (click)="sorter.toggle('format')">Formato {{ sorter.indicator('format') }}</button>
                  </th>
                  <th class="py-2.5 px-3" [attr.aria-sort]="sorter.ariaSort('status')">
                    <button type="button" class="uppercase cursor-pointer hover:text-[var(--c-text)]" (click)="sorter.toggle('status')">Status {{ sorter.indicator('status') }}</button>
                  </th>
                  <th class="py-2.5 px-3" [attr.aria-sort]="sorter.ariaSort('date')">
                    <button type="button" class="uppercase cursor-pointer hover:text-[var(--c-text)]" (click)="sorter.toggle('date')">Data {{ sorter.indicator('date') }}</button>
                  </th>
                  <th class="py-2.5 px-3 text-right" [attr.aria-sort]="sorter.ariaSort('media')">
                    <button type="button" class="uppercase cursor-pointer hover:text-[var(--c-text)]" (click)="sorter.toggle('media')">Mídias {{ sorter.indicator('media') }}</button>
                  </th>
                  <th class="py-2.5 px-3 text-right"><span class="sr-only">Ações</span></th>
                </tr>
              </thead>
              <tbody>
                @for (p of listItems(); track p.id) {
                  <tr
                    class="border-b border-[var(--c-border)] hover:bg-[var(--c-surface)] cursor-pointer"
                    [style.background]="state.selId() === p.id ? 'rgba(246,188,3,.08)' : ''"
                    (click)="openPost(p.id)">
                    <td class="py-2 px-3">
                      <div class="w-10 h-10 rounded-md overflow-hidden bg-black/50 flex items-center justify-center text-sm">
                        @if (p.media && p.media.length > 0) {
                          <img [src]="p.media[0].thumbnailUrl || p.media[0].url" [alt]="p.topic" class="w-full h-full object-cover" loading="lazy" />
                        } @else {
                          <span aria-hidden="true">{{ formatIcon(p.t) }}</span>
                        }
                      </div>
                    </td>
                    <td class="py-2 px-3 max-w-[340px]">
                      <div class="font-semibold text-[var(--c-text)] truncate">{{ p.topic }}</div>
                      @if (p.cap) {
                        <div class="text-[11px] text-[var(--c-text-muted)] truncate">{{ p.cap }}</div>
                      }
                    </td>
                    <td class="py-2 px-3 whitespace-nowrap">
                      <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase flex items-center gap-1 w-fit" [ngClass]="formatBadgeClass(p.t)">
                        <span>{{ formatIcon(p.t) }}</span><span>{{ formatLabel(p.t) }}</span>
                      </span>
                    </td>
                    <td class="py-2 px-3 whitespace-nowrap">
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold inline-flex items-center gap-1" [style.background]="statusBg(p.s)" [style.color]="statusColor(p.s)">
                        <span class="w-1.5 h-1.5 rounded-full" [style.background]="statusColor(p.s)"></span>{{ statusLabel(p.s) }}
                      </span>
                    </td>
                    <td class="py-2 px-3 font-mono text-[11px] text-[var(--c-text-2)] whitespace-nowrap">{{ postMeta(p) }}</td>
                    <td class="py-2 px-3 font-mono text-right">{{ p.media?.length || 0 }}</td>
                    <td class="py-2 px-3 text-right whitespace-nowrap">
                      @if (p.permalink) {
                        <a [href]="p.permalink" target="_blank" rel="noopener noreferrer" class="text-[var(--c-link)] hover:underline mr-3" [attr.aria-label]="'Abrir publicação de ' + p.topic + ' em nova aba'" (click)="$event.stopPropagation()">ver</a>
                      }
                      <button type="button" class="text-[var(--c-dim)] hover:text-[var(--c-text)] cursor-pointer" [attr.aria-label]="'Duplicar ' + p.topic" title="Duplicar post" (click)="$event.stopPropagation(); state.duplicatePost(p.id)">⧉</button>
                    </td>
                  </tr>
                }
                @if (filteredPosts().length === 0) {
                  <tr>
                    <td colspan="7" class="py-12 text-center text-[var(--c-text-muted)]">
                      Nenhum post encontrado com os filtros atuais.
                      <button type="button" class="ml-2 text-[var(--c-acc)] hover:underline cursor-pointer" (click)="resetFilters()">Limpar filtros</button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
        <app-pager [pager]="listPager" label="posts" />
      }

      <!-- ==================== 3. VIEW: FEED INSTAGRAM 3X3 ==================== -->
      @if (activeMode() === 'feed') {
        <div class="max-w-2xl mx-auto w-full flex flex-col gap-6 p-4 rounded-2xl bg-[var(--c-panel)] border border-[var(--c-border)] shadow-xl">
          <!-- Cabeçalho do Perfil Instagram Mockup -->
          <div class="flex items-center gap-5 pb-4 border-b border-[var(--c-border)]">
            <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-pink-500 p-[2.5px] shrink-0">
              <div class="w-full h-full rounded-full bg-[var(--c-bg)] flex items-center justify-center text-xl sm:text-2xl font-bold text-white">
                {{ state.activeAccount().user.charAt(0).toUpperCase() }}
              </div>
            </div>

            <div class="flex flex-col gap-2 min-w-0 flex-1">
              <div class="flex items-center gap-3 flex-wrap">
                <h3 class="text-base sm:text-lg font-bold text-[var(--c-text)] truncate">&#64;{{ state.activeAccount().user }}</h3>
                <span class="px-2 py-0.5 rounded-md bg-[rgba(246,188,3,.15)] text-[var(--c-acc)] text-[11px] font-mono font-bold">
                  {{ state.activeAccount().name }}
                </span>
              </div>

              <!-- Stats do Perfil -->
              <div class="flex items-center gap-4 text-xs">
                <span><strong class="text-[var(--c-text)]">{{ state.accountPosts().length }}</strong> posts</span>
                <span><strong class="text-[var(--c-text)]">14.2k</strong> seguidores</span>
                <span><strong class="text-[var(--c-text)]">618</strong> seguindo</span>
              </div>

              <p class="text-xs text-[var(--c-text-muted)] leading-relaxed">
                Brand Voice ativa: <strong class="text-[var(--c-text)]">{{ state.activeAccount().voice.tom }}</strong>
              </p>
            </div>
          </div>

          <!-- Abas de Navegação do Feed -->
          <div class="flex items-center justify-center gap-8 -mt-2 text-xs font-mono uppercase tracking-wider text-[var(--c-text-muted)] border-b border-[var(--c-border)] pb-2">
            <span class="text-[var(--c-acc)] font-bold flex items-center gap-1.5 border-b-2 border-[var(--c-acc)] pb-2 -mb-2.5">
              <span>⊞</span>
              <span>Publicações</span>
            </span>
            <span class="flex items-center gap-1.5 opacity-60">
              <span>🎬</span>
              <span>Reels</span>
            </span>
            <span class="flex items-center gap-1.5 opacity-60">
              <span>🏷</span>
              <span>Marcados</span>
            </span>
          </div>

          <!-- Grid 3x3 do Instagram Realista -->
          <div class="grid grid-cols-3 gap-1.5 sm:gap-2 w-full">
            @for (p of feedItems(); track p.id) {
              <div
                class="relative aspect-square bg-[var(--c-bg-elev)] overflow-hidden cursor-pointer group rounded-[2px]"
                (click)="openPost(p.id)">
                @if (p.media && p.media.length > 0) {
                  @let mediaItem = p.media[0];
                  <img
                    [src]="mediaItem.thumbnailUrl || mediaItem.url"
                    [alt]="p.topic"
                    class="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                  />
                  <!-- Ícone no canto superior direito para Carrossel ou Vídeo -->
                  @if (p.t === 'CAROUSEL' || (p.media.length > 1)) {
                    <span class="absolute top-1.5 right-1.5 text-white drop-shadow-md text-xs">
                      🗂
                    </span>
                  } @else if (p.t === 'REELS' || mediaItem.type === 'video') {
                    <span class="absolute top-1.5 right-1.5 text-white drop-shadow-md text-xs">
                      ▶
                    </span>
                  }
                } @else {
                  <div class="w-full h-full p-2 bg-gradient-to-br from-[#2b2b2b] via-[#222] to-[#f1a10b]/25 flex flex-col justify-between text-white">
                    <span class="text-[9px] font-mono text-[var(--c-acc)]">{{ p.t }}</span>
                    <span class="text-[10px] font-semibold leading-tight line-clamp-3">{{ p.topic }}</span>
                    <span class="text-[8px] font-mono opacity-50">{{ statusLabel(p.s) }}</span>
                  </div>
                }

                <!-- Hover Overlay do Instagram com Curtidas e Comentários -->
                <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 text-white font-bold text-xs">
                  <span class="flex items-center gap-1">♥ 342</span>
                  <span class="flex items-center gap-1">💬 18</span>
                </div>
              </div>
            }
          </div>
          <app-pager [pager]="feedPager" label="posts" />
        </div>
      }

      <!-- ==================== 4. VIEW: CALENDÁRIO (MÊS / SEMANA) ==================== -->
      @if (activeMode() === 'calendar') {
        <app-content-calendar
          [posts]="filteredPosts()"
          (openPost)="openPost($event)"
          (createOn)="newPostOn($event)" />
      }
    </div>

    <!-- ==================== SLIDE-OVER DRAWER DO POST ==================== -->
    @if (state.selectedPost(); as sel) {
      <!-- Backdrop translúcido para fechar com 1 clique -->
      <div
        class="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 transition-opacity"
        (click)="state.selId.set(null)">
      </div>

      <!-- Drawer Content -->
      <aside
        class="fixed top-0 right-0 bottom-0 flex flex-col z-50 w-full max-w-[480px] bg-[var(--c-panel)] border-l border-[var(--c-border-strong)] shadow-2xl animate-cm-fade"
        (click)="$event.stopPropagation()">
        <!-- Header do Drawer com BOTÃO FECHAR ELEGANTE -->
        <div class="p-4 flex flex-col gap-3 border-b border-[var(--c-border)]">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span
                class="px-2 py-0.5 rounded text-[10.5px] font-mono font-bold uppercase tracking-wider flex items-center gap-1"
                [ngClass]="formatBadgeClass(sel.t)">
                <span>{{ formatIcon(sel.t) }}</span>
                <span>{{ formatLabel(sel.t) }}</span>
              </span>

              <span class="flex items-center gap-1.5 text-xs text-[var(--c-text-muted)] font-mono">
                <span class="w-2 h-2 rounded-full" [style.background]="statusColor(sel.s)"></span>
                <span>{{ statusLabel(sel.s) }}</span>
              </span>
            </div>

            <!-- BOTÃO FECHAR MODERNO COM SVG -->
            <button
              type="button"
              class="modal-close-btn"
              title="Fechar painel (ESC)"
              aria-label="Fechar"
              (click)="state.selId.set(null)">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <h3 class="text-base font-bold text-[var(--c-text)] leading-snug">
            {{ sel.topic }}
          </h3>

          <!-- Segmented Status Switcher -->
          <div class="flex items-center gap-1.5 flex-wrap">
            @for (m of statusMoves; track m.status) {
              <button
                type="button"
                class="px-2.5 py-1 rounded-full text-xs font-mono transition-all cursor-pointer"
                [style.border]="sel.s === m.status ? '1px solid #f1a10b' : '1px solid var(--c-border)'"
                [style.background]="sel.s === m.status ? 'rgba(246,188,3,.18)' : 'var(--c-bg-elev)'"
                [style.color]="sel.s === m.status ? 'var(--c-acc)' : 'var(--c-text2)'"
                (click)="state.moveSelectedPostStatus(m.status)">
                {{ m.label }}
              </button>
            }
          </div>

          <!-- Abas do Drawer -->
          <div class="flex gap-4 -mb-4 pt-1">
            <button
              type="button"
              class="py-2.5 px-1 text-xs font-medium cursor-pointer transition-colors border-b-2"
              [style.border-color]="state.drawerTab() === 'cap' ? 'var(--c-acc)' : 'transparent'"
              [style.color]="state.drawerTab() === 'cap' ? 'var(--c-text)' : 'var(--c-text-muted)'"
              (click)="state.drawerTab.set('cap')">
              Legenda & Copy
            </button>
            <button
              type="button"
              class="py-2.5 px-1 text-xs font-medium cursor-pointer transition-colors border-b-2 flex items-center gap-1.5"
              [style.border-color]="state.drawerTab() === 'media' ? 'var(--c-acc)' : 'transparent'"
              [style.color]="state.drawerTab() === 'media' ? 'var(--c-text)' : 'var(--c-text-muted)'"
              (click)="state.drawerTab.set('media')">
              <span>Mídias</span>
              @if ((sel.media?.length || 0) > 0) {
                <span class="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-[#f6bc03]/20 text-[var(--c-acc)] font-bold">
                  {{ sel.media?.length }}
                </span>
              }
            </button>
            <button
              type="button"
              class="py-2.5 px-1 text-xs font-medium cursor-pointer transition-colors border-b-2"
              [style.border-color]="state.drawerTab() === 'pr' ? 'var(--c-acc)' : 'transparent'"
              [style.color]="state.drawerTab() === 'pr' ? 'var(--c-text)' : 'var(--c-text-muted)'"
              (click)="state.drawerTab.set('pr')">
              Prompts de Imagem
            </button>
          </div>
        </div>

        <!-- Conteúdo Interno da Aba -->
        <div class="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col gap-3">
          @if (state.drawerTab() === 'cap') {
            <div class="flex items-center justify-between">
              <label for="drawer-cap" class="text-[11px] font-mono text-[var(--c-text-muted)] block">
                Texto da Legenda
              </label>
              <span
                class="text-[10px] font-mono"
                [style.color]="selectedCaption(sel).length > captionMax ? 'var(--c-err)' : 'var(--c-dim)'">
                {{ selectedCaption(sel).length }} / {{ captionMax }}
              </span>
            </div>
            <textarea
              id="drawer-cap"
              rows="10"
              class="w-full resize-y rounded-xl p-3 text-xs leading-relaxed bg-[var(--c-bg-elev)] border border-[var(--c-border)] text-[var(--c-text)] cm-input-focus"
              [value]="selectedCaption(sel)"
              (input)="onCaptionEdit(sel.id, $any($event.target).value)"></textarea>

            <div class="flex gap-1.5 flex-wrap">
              @for (h of sel.tags; track h) {
                <span class="px-2 py-0.5 rounded text-[11px] font-mono bg-[rgba(var(--ov),.08)] text-[var(--c-acc)]">
                  {{ h }}
                </span>
              }
            </div>

            <div class="text-xs text-[var(--c-dim)] p-2.5 rounded-lg bg-[rgba(var(--ov),.03)] border border-[rgba(var(--ov),.08)]">
              IA: {{ sel.ai }} · Brand Voice aplicada de &#64;{{ state.activeAccount().user }}
            </div>

            <!-- Agendamento (posts já publicados não podem ser reagendados) -->
            @if (sel.s !== 'PUBLISHED') {
              <form
                class="p-3 rounded-xl bg-[var(--c-bg-elev)] border border-[var(--c-border)] flex flex-col gap-2"
                (submit)="$event.preventDefault(); saveSchedule(sel.id)"
                novalidate>
                <div class="text-[11px] font-mono text-[var(--c-text-muted)]">
                  Agendamento · {{ sel.date ? postMeta(sel) : 'sem data definida' }}
                </div>
                <div class="flex items-start gap-2 flex-wrap">
                  <div class="flex flex-col gap-1">
                    <label for="sched-date" class="text-[10px] font-mono text-[var(--c-dim)]">Data</label>
                    <input
                      id="sched-date"
                      type="date"
                      required
                      [attr.min]="today"
                      class="px-2.5 py-1.5 rounded-lg bg-[var(--c-panel)] border border-[var(--c-border)] text-xs text-[var(--c-text)] font-mono cm-input-focus"
                      [ngModel]="schedDate()"
                      (ngModelChange)="schedDate.set($event); schedError.set('')"
                      name="schedDate" />
                  </div>
                  <div class="flex flex-col gap-1">
                    <label for="sched-time" class="text-[10px] font-mono text-[var(--c-dim)]">Hora</label>
                    <input
                      id="sched-time"
                      type="time"
                      required
                      class="px-2.5 py-1.5 rounded-lg bg-[var(--c-panel)] border border-[var(--c-border)] text-xs text-[var(--c-text)] font-mono cm-input-focus"
                      [ngModel]="schedTime()"
                      (ngModelChange)="schedTime.set($event); schedError.set('')"
                      name="schedTime" />
                  </div>
                  <button
                    type="submit"
                    class="self-end px-3 py-1.5 rounded-lg bg-[var(--c-surface)] hover:bg-[rgba(246,188,3,.2)] text-xs font-mono text-[var(--c-acc)] cursor-pointer">
                    Salvar agendamento
                  </button>
                </div>
                @if (schedError()) {
                  <p class="text-[11px] text-[var(--c-err)]" role="alert">{{ schedError() }}</p>
                }
              </form>
            }
          } @else if (state.drawerTab() === 'media') {
            <app-media-uploader
              [mediaList]="sel.media || []"
              [format]="sel.t"
              (mediaAdded)="state.addMediaToSelectedPost($event)"
              (mediaRemoved)="state.removeMediaFromSelectedPost($event)"
            />
          } @else {
            @for (pr of sel.pr; track $index) {
              <div class="p-3 rounded-lg bg-[var(--c-bg-elev)] border border-[var(--c-border)] flex flex-col gap-2">
                <div class="flex items-center justify-between">
                  <span class="font-semibold text-xs text-[var(--c-text)]">{{ pr.t }}</span>
                  <span class="text-[10px] font-mono text-[var(--c-acc)] bg-[rgba(246,188,3,.15)] px-1.5 py-0.5 rounded">
                    {{ pr.ar }}
                  </span>
                </div>
                <div class="font-mono text-[11.5px] leading-relaxed text-[var(--c-text-2)] bg-[var(--c-bg)] p-2 rounded border border-[var(--c-border)] select-all">
                  {{ pr.x }}
                </div>
                <button
                  type="button"
                  class="self-end px-2.5 py-1 rounded text-xs font-mono bg-[var(--c-surface)] hover:bg-[var(--c-surface-hover)] text-[var(--c-acc)] cursor-pointer"
                  (click)="state.copyText(pr.x, sel.id + $index)">
                  {{ state.copied() === sel.id + $index ? '✓ Copiado' : 'Copiar prompt' }}
                </button>
              </div>
            }

            @if (sel.pr.length === 0) {
              <div class="py-8 px-4 rounded-xl text-center border border-dashed border-[var(--c-border)] flex flex-col items-center gap-2">
                <span class="text-2xl">🎨</span>
                <p class="text-xs text-[var(--c-text-muted)]">Nenhum prompt de imagem para este post.</p>
                <button
                  type="button"
                  class="px-3 py-1.5 rounded-lg bg-[var(--c-surface)] text-[var(--c-acc)] hover:bg-[rgba(246,188,3,.15)] text-xs font-mono cursor-pointer transition-colors"
                  (click)="state.generatePromptForSelectedPost()">
                  Gerar prompt com IA »
                </button>
              </div>
            }
          }
        </div>

        <!-- Footer do Drawer -->
        <div class="p-4 border-t border-[var(--c-border)] bg-[var(--c-bg-elev)] flex flex-col gap-2.5">
          <div class="text-[11px] text-[var(--c-dim)] flex items-center gap-1.5">
            <span>Graph API v22: requer ao menos 1 mídia final anexada.</span>
          </div>

          <div class="flex items-center justify-between gap-2">
            <button
              type="button"
              class="px-3 py-1.5 rounded-lg bg-[var(--c-surface)] hover:bg-[var(--c-surface-hover)] text-xs text-[var(--c-text)] cursor-pointer flex items-center gap-1.5 transition-colors"
              (click)="state.drawerTab.set('media')">
              <span>📁</span>
              <span>{{ (sel.media?.length || 0) > 0 ? 'Mídias (' + sel.media?.length + ')' : 'Anexar Mídia' }}</span>
            </button>

            <button
              type="button"
              class="px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
              [disabled]="(sel.media?.length || 0) === 0"
              [style.background]="(sel.media?.length || 0) > 0 ? 'var(--grad-brand)' : 'var(--c-surface)'"
              [style.color]="(sel.media?.length || 0) > 0 ? '#1f1f1f' : 'var(--c-dim)'"
              [style.cursor]="(sel.media?.length || 0) > 0 ? 'pointer' : 'not-allowed'"
              (click)="state.toast('Publicação direta ainda não está ligada a este painel. Publique pelo Instagram ou pelo Meta Business Suite.')">
              <span>Publicar Agora</span>
              <span>➔</span>
            </button>
          </div>
        </div>
      </aside>
    }
  `,
})
export class ContentStudioComponent {
  readonly state = inject(AccountStateService);

  // Filtros Reativos
  readonly searchQuery = signal<string>('');
  readonly formatFilter = signal<string>('ALL');
  readonly statusFilter = signal<string>('ALL');
  readonly statusOptions = STATUS_OPTIONS;
  readonly captionMax = CAPTION_MAX;
  readonly today = todayIso();

  // Agendamento no painel do post
  readonly schedDate = signal<string>('');
  readonly schedTime = signal<string>('18:00');
  readonly schedError = signal<string>('');

  // Modo ativo sincronizado com o State
  readonly activeMode = computed<'kanban' | 'grid' | 'list' | 'feed' | 'calendar'>(() => {
    const sub = this.state.contentSubTab();
    if (sub === 'calendar') return 'calendar';
    if (sub === 'grid') return 'grid';
    if (sub === 'list') return 'list';
    if (sub === 'feed') return 'feed';
    return 'kanban';
  });

  // Ordenação sempre sobre chaves cruas (data ISO, ordem do fluxo, contagem), nunca sobre texto exibido.
  readonly sorter = createSorter<PostItem>(
    [
      {
        key: 'date',
        label: 'data',
        compare: (a, b) => cmpText(postDateKey(a), postDateKey(b)),
        isEmpty: (p) => !p.date,
      },
      { key: 'topic', label: 'tópico (A–Z)', compare: (a, b) => cmpText(a.topic, b.topic) },
      { key: 'format', label: 'formato', compare: (a, b) => cmpText(FORMAT_LABEL[a.t], FORMAT_LABEL[b.t]) },
      { key: 'status', label: 'status', compare: (a, b) => cmpNum(STATUS_ORDER[a.s], STATUS_ORDER[b.s]) },
      { key: 'media', label: 'nº de mídias', compare: (a, b) => cmpNum(a.media?.length ?? 0, b.media?.length ?? 0) },
    ],
    'date',
    'desc'
  );

  onSortChange(key: string): void {
    const textual = key === 'topic' || key === 'format' || key === 'status';
    this.sorter.set(key, textual ? 'asc' : 'desc');
  }

  readonly statusMoves: { status: PostStatus; label: string }[] = [
    { status: 'DRAFT', label: 'Rascunho' },
    { status: 'PROMPT_READY', label: 'Prompt Pronto' },
    { status: 'SCHEDULED', label: 'Agendar' },
    { status: 'PUBLISHED', label: 'Publicado' },
  ];

  setMode(mode: 'kanban' | 'grid' | 'list' | 'feed' | 'calendar'): void {
    this.state.contentSubTab.set(mode);
    this.state.contentMode.set(mode);
  }

  // Busca + formato (o Kanban usa só isto: as colunas já são os status)
  readonly searchedPosts = computed<PostItem[]>(() => {
    let list = this.state.accountPosts();
    const q = this.searchQuery().trim().toLowerCase();
    const fmt = this.formatFilter();

    if (q) {
      list = list.filter(
        (p) =>
          p.topic.toLowerCase().includes(q) ||
          p.cap.toLowerCase().includes(q) ||
          (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    if (fmt !== 'ALL') {
      list = list.filter((p) => p.t === fmt);
    }

    return list;
  });

  // Busca + formato + status (Grid, Lista, Feed e Calendário)
  readonly filteredPosts = computed<PostItem[]>(() => {
    const st = this.statusFilter();
    const list = this.searchedPosts();
    return st === 'ALL' ? list : list.filter((p) => p.s === st);
  });

  readonly sortedPosts = computed<PostItem[]>(() => this.sorter.apply(this.filteredPosts()));

  // Qualquer mudança de filtro/ordenação/conta volta a paginação para a página 1.
  private readonly resetKey = () => [
    this.state.activeAccount().id,
    this.searchQuery(),
    this.formatFilter(),
    this.statusFilter(),
    this.sorter.key(),
    this.sorter.dir(),
  ];

  readonly gridPager = createPager(() => this.sortedPosts().length, { sizes: [8, 12, 24, 48], size: 12, resetOn: this.resetKey });
  readonly listPager = createPager(() => this.sortedPosts().length, { sizes: [10, 25, 50, 100], size: 10, resetOn: this.resetKey });
  readonly feedPager = createPager(() => this.sortedPosts().length, { sizes: [9, 18, 36], size: 9, resetOn: this.resetKey });

  readonly gridItems = computed(() => this.gridPager.slice(this.sortedPosts()));
  readonly listItems = computed(() => this.listPager.slice(this.sortedPosts()));
  readonly feedItems = computed(() => this.feedPager.slice(this.sortedPosts()));

  // Colunas do Kanban dinâmico
  readonly kanbanCols = computed(() => {
    const posts = this.searchedPosts();
    const defs: { key: PostStatus; title: string; icon: string; accentColor: string }[] = [
      { key: 'DRAFT', title: 'Rascunho', icon: '📝', accentColor: '#f1a10b' },
      { key: 'PROMPT_READY', title: 'Prompt Pronto', icon: '🎨', accentColor: '#6fb0d6' },
      { key: 'SCHEDULED', title: 'Agendado', icon: '⏰', accentColor: '#a855f7' },
      { key: 'PUBLISHED', title: 'Publicado', icon: '✅', accentColor: '#7bbf4a' },
    ];

    return defs.map((d) => ({
      ...d,
      posts: posts.filter(
        (p) => p.s === d.key || (d.key === 'SCHEDULED' && p.s === 'FAILED')
      ),
    }));
  });

  countByStatus(status: PostStatus): number {
    return this.state.accountPosts().filter((p) => p.s === status).length;
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.formatFilter.set('ALL');
    this.statusFilter.set('ALL');
  }

  newPostOn(date: string): void {
    this.state.openComposer('IMAGE', '', date);
  }

  saveSchedule(postId: string): void {
    const date = this.schedDate();
    const time = this.schedTime();
    if (!isValidIsoDate(date)) {
      this.schedError.set('Informe uma data válida');
      return;
    }
    if (!isValidTime(time)) {
      this.schedError.set('Informe a hora no formato HH:MM');
      return;
    }
    if (`${date} ${time}` <= `${todayIso()} ${new Date().toTimeString().slice(0, 5)}`) {
      this.schedError.set('Escolha um horário no futuro');
      return;
    }
    this.schedError.set(this.state.schedulePost(postId, date, time) ?? '');
  }

  quickAddForColumn(status: PostStatus): void {
    const fmt: PostFormat = status === 'SCHEDULED' ? 'CAROUSEL' : 'IMAGE';
    this.state.openComposer(fmt, '');
  }

  getNextStatus(current: PostStatus): PostStatus | null {
    if (current === 'DRAFT') return 'PROMPT_READY';
    if (current === 'PROMPT_READY') return 'SCHEDULED';
    if (current === 'SCHEDULED') return 'PUBLISHED';
    return null;
  }

  openPost(postId: string): void {
    this.state.selId.set(postId);
    this.state.drawerTab.set('cap');
    const post = this.state.accountPosts().find((p) => p.id === postId);
    this.schedDate.set(post?.date && post.date >= todayIso() ? post.date : '');
    this.schedTime.set(post?.time && isValidTime(post.time) ? post.time : '18:00');
    this.schedError.set('');
  }

  selectedCaption(p: PostItem): string {
    const drafts = this.state.captionDrafts();
    return drafts[p.id] !== undefined ? drafts[p.id] : p.cap;
  }

  onCaptionEdit(postId: string, val: string): void {
    this.state.captionDrafts.update((prev) => ({ ...prev, [postId]: val }));
  }

  formatLabel(t: PostFormat): string {
    return FORMAT_LABEL[t] || t;
  }

  formatIcon(t: PostFormat): string {
    return FORMAT_ICON[t] || '📄';
  }

  formatBadgeClass(t: PostFormat): string {
    return formatBadge(t);
  }

  statusLabel(s: PostStatus): string {
    return STATUS_LABEL[s] || s;
  }

  statusColor(s: PostStatus): string {
    return STATUS_COLOR[s] || 'var(--c-muted)';
  }

  statusBg(s: PostStatus): string {
    return STATUS_BG[s] || 'rgba(var(--ov), .1)';
  }

  postMeta(p: PostItem): string {
    if (p.date || p.time) return postWhen(p);
    if (p.pr && p.pr.length > 0) {
      return `${p.pr.length} prompt${p.pr.length > 1 ? 's' : ''}`;
    }
    return 'Sem data';
  }
}
