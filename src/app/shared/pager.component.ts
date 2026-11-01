import { Component, input } from '@angular/core';
import { Pager } from './list-tools';

@Component({
  selector: 'app-pager',
  template: `
    @if (pager().total() > 0) {
      <nav
        class="flex flex-wrap items-center justify-between gap-3 px-1 pt-2 text-xs text-[var(--c-text-muted)]"
        [attr.aria-label]="'Paginação de ' + label()">
        <div class="flex items-center gap-3 flex-wrap">
          <span aria-live="polite">
            <strong class="text-[var(--c-text)]">{{ pager().range()[0] }}–{{ pager().range()[1] }}</strong>
            de {{ pager().total() }} {{ label() }}
          </span>
          <label class="flex items-center gap-1.5">
            <span>por página</span>
            <select
              class="px-2 py-1 rounded-md bg-[var(--c-bg-elev)] border border-[var(--c-border)] text-xs text-[var(--c-text)] cursor-pointer cm-input-focus"
              [attr.aria-label]="'Itens por página'"
              [value]="pager().pageSize()"
              (change)="pager().setSize(+$any($event.target).value)">
              @for (s of pager().sizes; track s) {
                <option [value]="s" [selected]="s === pager().pageSize()">{{ s }}</option>
              }
            </select>
          </label>
        </div>

        <div class="flex items-center gap-1">
          <button
            type="button"
            class="pg-btn"
            [disabled]="pager().page() <= 1"
            aria-label="Página anterior"
            (click)="pager().prev()">
            ‹
          </button>
          @for (p of pager().pages(); track $index) {
            @if (p === null) {
              <span class="px-1 select-none" aria-hidden="true">…</span>
            } @else {
              <button
                type="button"
                class="pg-btn"
                [class.pg-active]="p === pager().page()"
                [attr.aria-current]="p === pager().page() ? 'page' : null"
                [attr.aria-label]="'Página ' + p"
                (click)="pager().go(p)">
                {{ p }}
              </button>
            }
          }
          <button
            type="button"
            class="pg-btn"
            [disabled]="pager().page() >= pager().pageCount()"
            aria-label="Próxima página"
            (click)="pager().next()">
            ›
          </button>
        </div>
      </nav>
    }
  `,
  styles: [
    `
      .pg-btn {
        min-width: 28px;
        height: 28px;
        padding: 0 8px;
        border-radius: 6px;
        border: 1px solid var(--c-border);
        background: var(--c-bg-elev);
        color: var(--c-text);
        font-size: 12px;
        font-family: var(--font-mono);
        cursor: pointer;
        transition: background 0.15s, border-color 0.15s;
      }
      .pg-btn:hover:not(:disabled) {
        border-color: #f1a10b;
      }
      .pg-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
      .pg-active {
        background: rgba(246, 188, 3, 0.18);
        border-color: #f1a10b;
        color: var(--c-acc);
        font-weight: 700;
      }
    `,
  ],
})
export class PagerComponent {
  readonly pager = input.required<Pager>();
  readonly label = input('itens');
}
