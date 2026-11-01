import { PostItem } from '../data/seed-data';

// Datas do app são sempre "YYYY-MM-DD" no horário de Brasília (o Brasil não tem horário de verão desde 2019).
export const TZ = 'America/Sao_Paulo';

export const WEEKDAYS_SHORT = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'];
export const MONTHS = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

const pad = (n: number): string => String(n).padStart(2, '0');

export function toIso(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Meia-noite local do dia (evita o deslocamento de fuso de `new Date('YYYY-MM-DD')`). */
export function fromIso(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function isValidIsoDate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  return toIso(fromIso(s)) === s;
}

export function isValidTime(s: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(s);
}

export function todayIso(): string {
  return toIso(new Date());
}

export function addDays(iso: string, n: number): string {
  const d = fromIso(iso);
  d.setDate(d.getDate() + n);
  return toIso(d);
}

export function addMonths(iso: string, n: number): string {
  const d = fromIso(iso);
  return toIso(new Date(d.getFullYear(), d.getMonth() + n, 1));
}

/** 0 = segunda … 6 = domingo. */
export function weekdayIndex(iso: string): number {
  return (fromIso(iso).getDay() + 6) % 7;
}

export function startOfWeek(iso: string): string {
  return addDays(iso, -weekdayIndex(iso));
}

export function startOfMonth(iso: string): string {
  const d = fromIso(iso);
  return toIso(new Date(d.getFullYear(), d.getMonth(), 1));
}

export function weekDays(iso: string): string[] {
  const start = startOfWeek(iso);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

/** Grade de 6 semanas (segunda a domingo) que cobre o mês de `iso`. */
export function monthMatrix(iso: string): string[][] {
  const first = startOfWeek(startOfMonth(iso));
  return Array.from({ length: 6 }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => addDays(first, w * 7 + d))
  );
}

export function sameMonth(a: string, b: string): boolean {
  return a.slice(0, 7) === b.slice(0, 7);
}

export function monthTitle(iso: string): string {
  const d = fromIso(iso);
  return `${MONTHS[d.getMonth()]} de ${d.getFullYear()}`;
}

/** "qui 29/10" */
export function formatDayShort(iso: string): string {
  const d = fromIso(iso);
  return `${WEEKDAYS_SHORT[weekdayIndex(iso)]} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
}

/** "29/10/2026" */
export function formatDateBr(iso: string): string {
  const d = fromIso(iso);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export function weekRangeTitle(iso: string): string {
  const days = weekDays(iso);
  const a = fromIso(days[0]);
  const b = fromIso(days[6]);
  const sameYear = a.getFullYear() === b.getFullYear();
  const left = `${pad(a.getDate())} ${MONTHS[a.getMonth()].slice(0, 3)}${sameYear ? '' : ' ' + a.getFullYear()}`;
  return `${left} – ${pad(b.getDate())} ${MONTHS[b.getMonth()].slice(0, 3)} ${b.getFullYear()}`;
}

/** Converte um timestamp ISO (ex.: created_time da Graph API) para data/hora de Brasília. */
export function brtParts(timestamp: string): { date: string; time: string } | null {
  const d = new Date(timestamp.replace(/([+-]\d{2})(\d{2})$/, '$1:$2'));
  if (Number.isNaN(d.getTime())) return null;
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '00';
  return { date: `${get('year')}-${get('month')}-${get('day')}`, time: `${get('hour')}:${get('minute')}` };
}

/**
 * Posts antigos só têm `day` (0 = segunda da semana atual). Preenche `date` a partir dele,
 * sem alterar posts que já têm data real.
 */
export function withDate(p: PostItem): PostItem {
  if (p.date || p.day === null || p.day === undefined) return p;
  return { ...p, date: addDays(startOfWeek(todayIso()), p.day) };
}

/** Chave ordenável "YYYY-MM-DD HH:MM"; vazia quando o post não tem data. */
export function postDateKey(p: PostItem): string {
  return p.date ? `${p.date} ${p.time || '00:00'}` : '';
}

/** Rótulo curto para cards: "qui 29/10 · 20:24", ou o que houver. */
export function postWhen(p: PostItem): string {
  if (!p.date) return p.time || 'Sem data';
  return `${formatDayShort(p.date)}${p.time ? ' · ' + p.time : ''}`;
}

/**
 * Chave ordenável para rótulos relativos do tipo "hoje 10:24", "Ontem 17:30" ou só "10:24".
 * Maior = mais recente. Devolve null quando o texto não segue nenhum desses formatos.
 */
export function relativeTimeKey(label: string | undefined): number | null {
  if (!label) return null;
  const m = label.trim().toLowerCase().match(/^(hoje|ontem)?\s*(?:(\d{1,2}):(\d{2}))?$/);
  if (!m || (!m[1] && !m[2])) return null;
  const dayOffset = m[1] === 'ontem' ? -1 : 0;
  const minutes = m[2] ? Number(m[2]) * 60 + Number(m[3]) : 1439; // "hoje" sem hora = o mais recente do dia
  return dayOffset * 1440 + minutes;
}
