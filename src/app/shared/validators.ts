// Validações simples de entrada, compartilhadas pelos formulários.

/** Aceita só URLs completas http(s) — evita `javascript:`, `data:` e textos soltos. */
export function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value.trim());
    return (u.protocol === 'https:' || u.protocol === 'http:') && !!u.hostname.includes('.');
  } catch {
    return false;
  }
}

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

/** Mantém só dígitos (ex.: código de verificação colado com espaços ou hífen). */
export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}
