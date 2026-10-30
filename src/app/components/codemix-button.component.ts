import { Component, input, output, computed } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'dark' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'cm-button',
  template: `
    <button
      type="button"
      class="btn border transition-all select-none p-0 overflow-hidden inline-flex items-center gap-0 font-medium"
      [disabled]="disabled()"
      [style]="buttonStyle()"
      (click)="handleClick($event)"
    >
      <span
        class="inline-flex items-center gap-2 h-full"
        [style.padding]="sizeConfig().pad"
      >
        <ng-content />
      </span>
      @if (arrow()) {
        <span
          aria-hidden="true"
          class="inline-flex items-center justify-center h-full w-[26px] text-[11px]"
          style="border-left: 1px solid rgba(0,0,0,.22); box-shadow: inset 1px 0 0 rgba(255,255,255,.28);"
        >
          ▸
        </span>
      }
    </button>
  `,
})
export class CodemixButtonComponent {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly arrow = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly fullWidth = input<boolean>(false);
  readonly clicked = output<MouseEvent>();

  readonly sizeConfig = computed(() => {
    const s = this.size();
    if (s === 'sm') {
      return {
        height: 'var(--control-h-sm, 26px)',
        pad: '0 var(--space-5, 12px)',
        fs: 'var(--fs-body-sm, 13.5px)',
      };
    }
    if (s === 'lg') {
      return {
        height: '42px',
        pad: '0 var(--space-9, 32px)',
        fs: 'var(--fs-body-lg, 17px)',
      };
    }
    return {
      height: 'var(--control-h, 34px)',
      pad: '0 var(--space-7, 20px)',
      fs: 'var(--fs-body, 15px)',
    };
  });

  readonly buttonStyle = computed(() => {
    const v = this.variant();
    const s = this.sizeConfig();
    const base: Record<string, string> = {
      height: s.height,
      'min-height': s.height,
      'font-size': s.fs,
      'font-family': 'var(--font-sans)',
      'letter-spacing': 'var(--ls-nav, 0.01em)',
      'border-radius': 'var(--radius-sm, 4px)',
      opacity: this.disabled() ? '0.45' : '1',
      'pointer-events': this.disabled() ? 'none' : 'auto',
      width: this.fullWidth() ? '100%' : 'auto',
      'justify-content': this.fullWidth() ? 'space-between' : 'center',
    };

    if (v === 'secondary') {
      return {
        ...base,
        background: 'linear-gradient(180deg,#fdfdfd 0%,#e9e9e9 100%)',
        'border-color': 'var(--border-strong, #bfbfbf)',
        color: 'var(--text-body, #363d3f)',
        'box-shadow': 'var(--shadow-button)',
      };
    }
    if (v === 'dark') {
      return {
        ...base,
        background: 'linear-gradient(180deg,var(--slate-600, #4b5054) 0%,var(--graphite-800, #363d3f) 100%)',
        'border-color': '#2b2b2b',
        color: 'var(--text-on-dark, #fefefe)',
        'box-shadow': 'var(--shadow-button)',
      };
    }
    if (v === 'ghost') {
      return {
        ...base,
        background: 'transparent',
        'border-color': 'transparent',
        color: 'var(--c-link, var(--link, #ee9c0a))',
        'box-shadow': 'none',
      };
    }
    return {
      ...base,
      background: 'var(--grad-brand, linear-gradient(180deg,#ffcb05 0%,#f58220 100%))',
      'border-color': 'var(--orange-700, #c96a0c)',
      color: '#fff',
      'text-shadow': '0 1px 1px rgba(0,0,0,.35)',
      'box-shadow': 'var(--shadow-button)',
    };
  });

  handleClick(ev: MouseEvent): void {
    if (!this.disabled()) {
      this.clicked.emit(ev);
    }
  }
}

