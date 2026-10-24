import type { Content, Lang } from './types';
import { ru } from './ru';

export const LANGS: Lang[] = ['ru', 'en', 'az', 'de'];
export const DEFAULT_LANG: Lang = 'ru';

export const LANG_NAMES: Record<Lang, string> = {
  ru: 'Русский',
  en: 'English',
  az: 'Azərbaycan',
  de: 'Deutsch',
};

/** Lazily load a language file so a missing translation never breaks other pages. */
export async function getContent(lang: Lang): Promise<Content> {
  switch (lang) {
    case 'en':
      return (await import('./en')).en;
    case 'az':
      return (await import('./az')).az;
    case 'de':
      return (await import('./de')).de;
    default:
      return ru;
  }
}

/** Path prefix for a language: '' for the default (ru), '/en' etc. for the rest. */
export function langPrefix(lang: Lang): string {
  return lang === DEFAULT_LANG ? '' : `/${lang}`;
}

/** Build a localized path. localePath('en', '/privacy') → '/en/privacy/'. */
export function localePath(lang: Lang, path = '/'): string {
  const clean = path === '/' ? '' : path.replace(/\/+$/, '');
  const p = `${langPrefix(lang)}${clean}/`;
  return p.replace(/\/{2,}/g, '/');
}

const ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ESC[c] ?? c);
}

/**
 * Render inline highlights: "{{word}}" → <em class="hl">word</em>.
 * The text is escaped first, so content strings can never inject markup.
 */
export function hl(text: string): string {
  return escapeHtml(text).replace(/\{\{(.+?)\}\}/g, '<em class="hl">$1</em>');
}

/** Render "\n" as a desktop-only line break (escaped first). */
export function nl(text: string): string {
  return escapeHtml(text).replace(/\n/g, '<br class="br-desktop">');
}

/** Both helpers at once. */
export function rich(text: string): string {
  return hl(text).replace(/\n/g, '<br class="br-desktop">');
}

/** Strip {{ }} markers for plain-text contexts (meta tags, aria labels). */
export function plain(text: string): string {
  return text.replace(/\{\{(.+?)\}\}/g, '$1').replace(/\n/g, ' ');
}

export function pad2(n: number): string {
  return String(n).padStart(2, '0');
}
