import { Component, computed, inject, input, output, signal } from '@angular/core';
import { AccountStateService } from '../../services/account-state.service';
import { PostItem } from '../../data/seed-data';
import {
  WEEKDAYS_SHORT,
  addDays,
  addMonths,
  formatDayShort,
  monthMatrix,
  monthTitle,
  sameMonth,
  todayIso,
  weekDays,
  weekRangeTitle,
} from '../../shared/dates';
import { FORMAT_ICON, FORMAT_LABEL, STATUS_COLOR, STATUS_LABEL, STATUS_OPTIONS } from '../../shared/post-ui';

type CalendarView = 'month' | 'week';

const MAX_CHIPS_IN_MONTH = 3;

@Component({
  selector: 'app-content-calendar',
  template: `
    <div class="flex flex-col gap-3">
      <!-- Cabeçalho: navegação e visão -->
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div class="flex items-center gap-1.5">
          <button type="button" class="cal-btn" aria-label="Período anterior" (click)="shift(-1)">‹</button>
          <button type="button" class="cal-btn px-3" (click)="goToday()">Hoje</button>
          <button type="button" class="cal-btn" aria-label="Próximo período" (click)="shift(1)">›</button>
          <h3 class="ml-2 text-sm font-bold text-[var(--c-text)] first-letter:uppercase" aria-live="polite">{{ title() }}</h3>
        </div>

        <div class="flex items-center gap-1 p-1 rounded-lg bg-[var(--c-bg-elev)] border border-[var(--c-border)]" role="group" aria-label="Visão do calendário">
          <button
            type="button"
            class="px-3 py-1 rounded-md text-xs cursor-pointer"
            [class]="view() === 'month' ? 'bg-[var(--c-panel)] text-[var(--c-acc)] font-bold' : 'text-[var(--c-text-muted)]'"
            [attr.aria-pressed]="view() === 'month'"
            (click)="view.set('month')">
            Mês
          </button>
          <button
            type="button"
            class="px-3 py-1 rounded-md text-xs cursor-pointer"
            [class]="view() === 'week' ? 'bg-[var(--c-panel)] text-[var(--c-acc)] font-bold' : 'text-[var(--c-text-muted)]'"
            [attr.aria-pressed]="view() === 'week'"
            (click)="view.set('week')">
            Semana
          </button>
        </div>
      </div>

      <!-- Legenda de status -->
      <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[var(--c-text-muted)]">
        @for (s of statuses; track s.value) {
          <span class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full" [style.background]="statusColor(s.value)"></span>{{ s.label }}
          </span>
        }
        <span class="ml-auto hidden sm:inline">Arraste um post para outro dia para reagendar</span>
      </div>

      <!-- Cabeçalho dos dias da semana (mês) -->
      @if (view() === 'month') {
        <div class="grid grid-cols-7 gap-1.5 text-center text-[10px] font-mono uppercase tracking-wider text-[var(--c-dim)]" aria-hidden="true">
          @for (w of weekdayNames; track w) {
            <span>{{ w }}</span>
          }
        </div>

        <div class="grid grid-cols-7 gap-1.5" role="grid" [attr.aria-label]="title()">
          @for (week of matrix(); track week[0]) {
            @for (d of week; track d) {
              <div
                role="gridcell"
                class="min-h-[64px] sm:min-h-[112px] rounded-lg p-1.5 flex flex-col gap-1 border transition-colors bg-[var(--c-panel)]"
                [class.opacity-50]="!inCursorMonth(d)"
                [style.border-color]="d === selected() ? 'var(--c-acc)' : d === today ? 'rgba(246,188,3,.55)' : 'var(--c-border)'"
                [style.box-shadow]="d === selected() ? '0 0 0 1px var(--c-acc)' : 'none'"
                (click)="select(d)"
                (dragover)="allowDrop($event)"
                (drop)="onDrop($event, d)">
                <div class="flex items-center justify-between">
                  <button
                    type="button"
                    class="w-6 h-6 rounded-full text-[11px] font-mono flex items-center justify-center cursor-pointer"
                    [style.background]="d === today ? 'var(--c-acc)' : 'transparent'"
                    [style.color]="d === today ? '#1f1f1f' : 'var(--c-text)'"
                    [style.font-weight]="d === today ? '700' : '400'"
                    [attr.aria-label]="formatDay(d) + (postsOn(d).length ? ', ' + postsOn(d).length + ' posts' : '')"
                    (click)="select(d); $event.stopPropagation()">
                    {{ dayNumber(d) }}
                  </button>
                  <button
                    type="button"
                    class="w-5 h-5 rounded text-xs text-[var(--c-dim)] hover:text-[var(--c-acc)] hover:bg-[rgba(var(--ov),.1)] cursor-pointer"
                    [attr.aria-label]="'Novo post em ' + formatDay(d)"
                    (click)="$event.stopPropagation(); createOn.emit(d)">
                    +
                  </button>
                </div>

                <!-- Em telas estreitas a célula mostra só pontos de status; a lista do dia fica abaixo do calendário -->
                @if (postsOn(d).length > 0) {
                  <div class="flex sm:hidden flex-wrap gap-0.5 px-0.5" aria-hidden="true">
                    @for (p of postsOn(d).slice(0, 4); track p.id) {
                      <span class="w-1.5 h-1.5 rounded-full" [style.background]="statusColor(p.s)"></span>
                    }
                  </div>
                }

                @for (p of postsOn(d).slice(0, maxChips); track p.id) {
                  <button
                    type="button"
                    class="chip-post"
                    [attr.draggable]="p.s !== 'PUBLISHED'"
                    [title]="p.time + ' · ' + p.topic"
                    (dragstart)="onDragStart($event, p)"
                    (dragend)="dragId.set(null)"
                    (click)="$event.stopPropagation(); openPost.emit(p.id)">
                    <span class="w-1.5 h-1.5 rounded-full shrink-0" [style.background]="statusColor(p.s)"></span>
                    <span class="font-mono text-[10px] shrink-0">{{ p.time }}</span>
                    <span class="truncate">{{ p.topic }}</span>
                  </button>
                }
                @if (postsOn(d).length > maxChips) {
                  <button
                    type="button"
                    class="hidden sm:block text-[10px] font-mono text-[var(--c-link)] text-left px-1 cursor-pointer hover:underline"
                    (click)="$event.stopPropagation(); select(d)">
                    +{{ postsOn(d).length - maxChips }} mais
                  </button>
                }
              </div>
            }
          }
        </div>
      } @else {
        <!-- Visão semanal -->
        <div class="grid grid-cols-1 md:grid-cols-7 gap-2.5">
          @for (d of week(); track d) {
            <div
              class="rounded-xl p-2.5 flex flex-col gap-2 min-h-[180px] bg-[var(--c-panel)] border transition-all"
              [style.border-color]="d === today ? 'var(--c-acc)' : d === selected() ? 'rgba(246,188,3,.55)' : 'var(--c-border)'"
              [style.box-shadow]="d === today ? '0 0 12px rgba(246,188,3,.15)' : 'none'"
              (click)="select(d)"
              (dragover)="allowDrop($event)"
              (drop)="onDrop($event, d)">
              <div
                class="font-display font-semibold text-xs tracking-wider uppercase pb-1.5 border-b border-[var(--c-border)] flex items-center justify-between"
                [style.color]="d === today ? 'var(--c-acc)' : 'var(--c-text-muted)'">
                <span>{{ formatDay(d) }}</span>
                <span class="flex items-center gap-1.5">
                  <span class="text-[10px] font-mono">{{ postsOn(d).length }}</span>
                  <button
                    type="button"
                    class="w-5 h-5 rounded text-xs hover:text-[var(--c-acc)] hover:bg-[rgba(var(--ov),.1)] cursor-pointer"
                    [attr.aria-label]="'Novo post em ' + formatDay(d)"
                    (click)="$event.stopPropagation(); createOn.emit(d)">
                    +
                  </button>
                </span>
              </div>

              <div class="flex flex-col gap-1.5 flex-1">
                @for (p of postsOn(d); track p.id) {
                  <button
                    type="button"
                    class="flex flex-col gap-1 items-start p-2 rounded-lg cursor-pointer w-full text-left bg-[var(--c-bg-elev)] border hover:border-[var(--c-acc)] transition-all"
                    [style.border-color]="state.selId() === p.id ? 'var(--c-acc)' : 'var(--c-border)'"
                    [attr.draggable]="p.s !== 'PUBLISHED'"
                    (dragstart)="onDragStart($event, p)"
                    (dragend)="dragId.set(null)"
                    (click)="$event.stopPropagation(); openPost.emit(p.id)">
                    <span class="text-[10px] font-mono text-[var(--c-text-muted)] flex items-center gap-1">
                      <span class="w-1.5 h-1.5 rounded-full" [style.background]="statusColor(p.s)"></span>
                      <span>{{ p.time }}</span>
                      <span>·</span>
                      <span class="font-bold">{{ formatLabel(p.t) }}</span>
                    </span>
                    <span class="text-xs font-medium text-[var(--c-text)] line-clamp-2 leading-tight">{{ p.topic }}</span>
                  </button>
                }
                @if (postsOn(d).length === 0) {
                  <div class="flex-1 flex items-center justify-center text-[11px] text-[var(--c-dim)] border border-dashed border-[rgba(var(--ov),.1)] rounded-md py-4">
                    livre
                  </div>
                }
              </div>
            </div>
          }
        </div>
      }

      <!-- Painel do dia selecionado (mês) -->
      @if (view() === 'month' && selected(); as day) {
        <section class="rounded-xl p-3 bg-[var(--c-panel)] border border-[var(--c-border)] flex flex-col gap-2" aria-live="polite">
          <div class="flex items-center justify-between gap-2">
            <h4 class="text-xs font-bold text-[var(--c-text)] first-letter:uppercase">{{ formatDay(day) }} · {{ selectedPosts().length }} post(s)</h4>
            <button type="button" class="cal-btn px-3" (click)="createOn.emit(day)">+ Novo post neste dia</button>
          </div>
          @for (p of selectedPosts(); track p.id) {
            <button
              type="button"
              class="flex items-center gap-2 p-2 rounded-lg text-left cursor-pointer bg-[var(--c-bg-elev)] border border-[var(--c-border)] hover:border-[var(--c-acc)]"
              (click)="openPost.emit(p.id)">
              <span class="font-mono text-[11px] text-[var(--c-text-muted)] w-11 shrink-0">{{ p.time }}</span>
              <span class="px-1.5 py-0.5 rounded-full text-[10px] font-mono shrink-0" [style.color]="statusColor(p.s)" [style.background]="'rgba(var(--ov),.06)'">
                {{ statusLabel(p.s) }}
              </span>
              <span class="text-[10px] shrink-0">{{ formatIcon(p.t) }}</span>
              <span class="text-xs text-[var(--c-text)] truncate">{{ p.topic }}</span>
            </button>
          } @empty {
            <p class="text-xs text-[var(--c-dim)] py-2">Nenhum post neste dia.</p>
          }
        </section>
      }

      <!-- Posts sem data -->
      @if (undated().length > 0) {
        <section class="rounded-xl p-3 bg-[var(--c-panel)] border border-dashed border-[var(--c-border)] flex flex-col gap-2">
          <h4 class="text-xs font-bold text-[var(--c-text)]">Sem data ({{ undated().length }})</h4>
          <p class="text-[11px] text-[var(--c-dim)]">
            Selecione um dia no calendário e use “Agendar no dia” para posicionar o post, ou abra o post para escolher data e hora.
          </p>
          <div class="flex flex-col gap-1.5">
            @for (p of undated(); track p.id) {
              <div class="flex items-center gap-2 p-2 rounded-lg bg-[var(--c-bg-elev)] border border-[var(--c-border)]">
                <button type="button" class="flex-1 min-w-0 flex items-center gap-2 text-left cursor-pointer" (click)="openPost.emit(p.id)">
                  <span class="w-1.5 h-1.5 rounded-full shrink-0" [style.background]="statusColor(p.s)"></span>
                  <span class="text-[10px] shrink-0">{{ formatIcon(p.t) }}</span>
                  <span class="text-xs text-[var(--c-text)] truncate">{{ p.topic }}</span>
                </button>
                @if (selected() && p.s !== 'PUBLISHED') {
                  <button type="button" class="cal-btn px-2 shrink-0" (click)="scheduleOnSelected(p)">Agendar no dia {{ dayNumber(selected()!) }}</button>
                }
              </div>
            }
          </div>
        </section>
      }
    </div>
  `,
  styles: [
    `
      .cal-btn {
        height: 28px;
        min-width: 28px;
        border-radius: 6px;
        border: 1px solid var(--c-border);
        background: var(--c-bg-elev);
        color: var(--c-text);
        font-size: 12px;
        cursor: pointer;
      }
      .cal-btn:hover {
        border-color: #f1a10b;
      }
      .chip-post {
        display: none;
        align-items: center;
        gap: 4px;
        width: 100%;
        padding: 2px 5px;
        border-radius: 5px;
        border: 1px solid var(--c-border);
        background: var(--c-bg-elev);
        color: var(--c-text);
        font-size: 11px;
        text-align: left;
        cursor: pointer;
        min-width: 0;
      }
      .chip-post:hover {
        border-color: var(--c-acc);
      }
      @media (min-width: 640px) {
        .chip-post {
          display: flex;
        }
      }
    `,
  ],
})
export class ContentCalendarComponent {
  readonly state = inject(AccountStateService);

  /** Posts já filtrados pelo estúdio (busca, formato, status). */
  readonly posts = input.required<PostItem[]>();
  readonly createOn = output<string>();
  readonly openPost = output<string>();

  readonly view = signal<CalendarView>('month');
  readonly cursor = signal<string>(todayIso());
  readonly selected = signal<string | null>(todayIso());
  readonly dragId = signal<string | null>(null);

  readonly today = todayIso();
  readonly weekdayNames = WEEKDAYS_SHORT;
  readonly maxChips = MAX_CHIPS_IN_MONTH;
  readonly statuses = STATUS_OPTIONS;

  readonly matrix = computed(() => monthMatrix(this.cursor()));
  readonly week = computed(() => weekDays(this.cursor()));
  readonly title = computed(() => (this.view() === 'month' ? monthTitle(this.cursor()) : weekRangeTitle(this.cursor())));

  private readonly byDate = computed(() => {
    const map = new Map<string, PostItem[]>();
    for (const p of this.posts()) {
      if (!p.date) continue;
      map.set(p.date, [...(map.get(p.date) ?? []), p]);
    }
    for (const list of map.values()) list.sort((a, b) => (a.time || '').localeCompare(b.time || ''));
    return map;
  });

  readonly undated = computed(() => this.posts().filter((p) => !p.date));
  readonly selectedPosts = computed(() => {
    const d = this.selected();
    return d ? this.postsOn(d) : [];
  });

  postsOn(date: string): PostItem[] {
    return this.byDate().get(date) ?? [];
  }

  inCursorMonth(date: string): boolean {
    return sameMonth(date, this.cursor());
  }

  dayNumber(date: string): string {
    return String(Number(date.slice(8, 10)));
  }

  formatDay(date: string): string {
    return formatDayShort(date);
  }

  shift(dir: 1 | -1): void {
    this.cursor.update((c) => (this.view() === 'month' ? addMonths(c, dir) : addDays(c, dir * 7)));
  }

  goToday(): void {
    this.cursor.set(todayIso());
    this.selected.set(todayIso());
  }

  select(date: string): void {
    this.selected.set(date);
    // Clicar num dia vizinho (cinza) leva o calendário para o mês dele.
    if (this.view() === 'month' && !this.inCursorMonth(date)) this.cursor.set(date);
  }

  scheduleOnSelected(p: PostItem): void {
    const day = this.selected();
    if (!day) return;
    if (day < this.today) {
      this.state.toast('Escolha um dia de hoje em diante para agendar');
      return;
    }
    this.state.schedulePost(p.id, day, p.time || '18:00');
  }

  allowDrop(ev: DragEvent): void {
    if (this.dragId()) ev.preventDefault();
  }

  onDragStart(ev: DragEvent, p: PostItem): void {
    if (p.s === 'PUBLISHED') {
      ev.preventDefault();
      return;
    }
    this.dragId.set(p.id);
    ev.dataTransfer?.setData('text/plain', p.id);
    if (ev.dataTransfer) ev.dataTransfer.effectAllowed = 'move';
  }

  onDrop(ev: DragEvent, date: string): void {
    ev.preventDefault();
    const id = this.dragId() ?? ev.dataTransfer?.getData('text/plain');
    this.dragId.set(null);
    if (id) this.state.reschedulePostToDate(id, date);
  }

  statusColor(s: PostItem['s']): string {
    return STATUS_COLOR[s];
  }
  statusLabel(s: PostItem['s']): string {
    return STATUS_LABEL[s];
  }
  formatIcon(t: PostItem['t']): string {
    return FORMAT_ICON[t];
  }
  formatLabel(t: PostItem['t']): string {
    return FORMAT_LABEL[t];
  }
}
