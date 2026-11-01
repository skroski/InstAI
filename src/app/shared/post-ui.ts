import { PostFormat, PostStatus } from '../data/seed-data';

// Rótulos e cores de posts compartilhados entre Kanban, Grid, Lista e Calendário.

export const FORMAT_LABEL: Record<PostFormat, string> = {
  IMAGE: 'Imagem Feed',
  CAROUSEL: 'Carrossel',
  REELS: 'Reels',
  STORIES: 'Stories',
};

export const FORMAT_ICON: Record<PostFormat, string> = {
  IMAGE: '📸',
  CAROUSEL: '🗂',
  REELS: '🎬',
  STORIES: '⚡',
};

export const STATUS_LABEL: Record<PostStatus, string> = {
  DRAFT: 'Rascunho',
  PROMPT_READY: 'Prompt Pronto',
  SCHEDULED: 'Agendado',
  PUBLISHED: 'Publicado',
  FAILED: 'Falhou',
};

export const STATUS_COLOR: Record<PostStatus, string> = {
  DRAFT: '#f1a10b',
  PROMPT_READY: '#6fb0d6',
  SCHEDULED: '#a855f7',
  PUBLISHED: '#7bbf4a',
  FAILED: '#e8604f',
};

export const STATUS_BG: Record<PostStatus, string> = {
  DRAFT: 'rgba(241, 161, 11, 0.15)',
  PROMPT_READY: 'rgba(111, 176, 214, 0.15)',
  SCHEDULED: 'rgba(168, 85, 247, 0.15)',
  PUBLISHED: 'rgba(123, 191, 74, 0.15)',
  FAILED: 'rgba(232, 96, 79, 0.15)',
};

/** Ordem do fluxo editorial, usada para ordenar por status. */
export const STATUS_ORDER: Record<PostStatus, number> = {
  DRAFT: 0,
  PROMPT_READY: 1,
  SCHEDULED: 2,
  PUBLISHED: 3,
  FAILED: 4,
};

export const STATUS_OPTIONS: { value: PostStatus; label: string }[] = (
  Object.keys(STATUS_LABEL) as PostStatus[]
).map((value) => ({ value, label: STATUS_LABEL[value] }));

export function formatBadgeClass(t: PostFormat): string {
  switch (t) {
    case 'CAROUSEL':
      return 'bg-purple-500/15 text-purple-400 border border-purple-500/30';
    case 'REELS':
      return 'bg-blue-500/15 text-blue-400 border border-blue-500/30';
    case 'IMAGE':
      return 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
    case 'STORIES':
      return 'bg-pink-500/15 text-pink-400 border border-pink-500/30';
    default:
      return 'bg-gray-500/15 text-gray-400';
  }
}
