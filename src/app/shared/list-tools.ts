import { computed, linkedSignal, signal } from '@angular/core';

// Ordenação e paginação reutilizáveis para listas/grids. Sem biblioteca: só signals.

export type SortDir = 'asc' | 'desc';

export interface SortOption<T> {
  key: string;
  label: string;
  compare: (a: T, b: T) => number;
  /** Itens "vazios" nessa coluna (ex.: post sem data) ficam sempre no fim, em qualquer direção. */
  isEmpty?: (item: T) => boolean;
}

const collator = new Intl.Collator('pt-BR', { sensitivity: 'base', numeric: true });

export const cmpText = (a: string, b: string): number => collator.compare(a, b);
export const cmpNum = (a: number, b: number): number => a - b;

export function createSorter<T>(options: SortOption<T>[], defaultKey: string, defaultDir: SortDir = 'asc') {
  const key = signal(defaultKey);
  const dir = signal<SortDir>(defaultDir);
  const current = computed(() => options.find((o) => o.key === key()) ?? options[0]);

  return {
    options,
    key,
    dir,
    set(k: string, d: SortDir = 'asc'): void {
      key.set(k);
      dir.set(d);
    },
    toggleDir(): void {
      dir.update((d) => (d === 'asc' ? 'desc' : 'asc'));
    },
    /** Clique em cabeçalho de coluna: mesma coluna inverte, outra começa em ascendente. */
    toggle(k: string): void {
      if (key() === k) dir.update((d) => (d === 'asc' ? 'desc' : 'asc'));
      else {
        key.set(k);
        dir.set('asc');
      }
    },
    indicator(k: string): string {
      return key() === k ? (dir() === 'asc' ? '▲' : '▼') : '';
    },
    ariaSort(k: string): 'ascending' | 'descending' | 'none' {
      return key() === k ? (dir() === 'asc' ? 'ascending' : 'descending') : 'none';
    },
    apply(items: T[]): T[] {
      const opt = current();
      const mul = dir() === 'asc' ? 1 : -1;
      const filled = opt.isEmpty ? items.filter((i) => !opt.isEmpty!(i)) : items;
      const empty = opt.isEmpty ? items.filter((i) => opt.isEmpty!(i)) : [];
      return [...filled].sort((a, b) => mul * opt.compare(a, b)).concat(empty);
    },
  };
}

export type Sorter<T> = ReturnType<typeof createSorter<T>>;

export interface PagerOptions {
  sizes?: number[];
  size?: number;
  /** Lê os sinais de filtro/ordenação; quando mudam, a página volta para 1. */
  resetOn?: () => unknown;
}

export function createPager(total: () => number, opts: PagerOptions = {}) {
  const sizes = opts.sizes ?? [12, 24, 48];
  const pageSize = signal(opts.size ?? sizes[0]);
  const pageCount = computed(() => Math.max(1, Math.ceil(total() / pageSize())));

  // Volta para a página 1 quando filtros/tamanho mudam; o valor é comparado como texto para
  // que só uma mudança real reinicie a página.
  const requested = linkedSignal<string, number>({
    source: () => JSON.stringify([opts.resetOn?.() ?? null, pageSize()]),
    computation: () => 1,
  });
  // Também protege de páginas fora do intervalo (ex.: troca de conta que reduz a lista).
  const page = computed(() => Math.min(Math.max(1, requested()), pageCount()));

  const range = computed<[number, number]>(() => {
    const t = total();
    if (t === 0) return [0, 0];
    return [(page() - 1) * pageSize() + 1, Math.min(page() * pageSize(), t)];
  });

  // Janela de páginas com reticências (null) para listas longas.
  const pages = computed<(number | null)[]>(() => {
    const count = pageCount();
    const cur = page();
    if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);
    const out: (number | null)[] = [1];
    const from = Math.max(2, cur - 1);
    const to = Math.min(count - 1, cur + 1);
    if (from > 2) out.push(null);
    for (let i = from; i <= to; i++) out.push(i);
    if (to < count - 1) out.push(null);
    out.push(count);
    return out;
  });

  return {
    sizes,
    pageSize,
    pageCount,
    page,
    range,
    pages,
    total,
    go(n: number): void {
      requested.set(Math.min(Math.max(1, n), pageCount()));
    },
    next(): void {
      requested.set(Math.min(page() + 1, pageCount()));
    },
    prev(): void {
      requested.set(Math.max(page() - 1, 1));
    },
    setSize(n: number): void {
      if (sizes.includes(n)) pageSize.set(n);
    },
    slice<T>(items: T[]): T[] {
      const start = (page() - 1) * pageSize();
      return items.slice(start, start + pageSize());
    },
  };
}

export type Pager = ReturnType<typeof createPager>;
