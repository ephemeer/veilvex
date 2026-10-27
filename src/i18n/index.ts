import type { Content, Lang } from './types';
import { ru } from './ru';

export const LANGS: Lang[] = ['ru', 'en', 'az', 'de'];
/** The site opens in English at '/'; every other language lives under its prefix ('/ru/', '/az/', '/de/'). */
export const DEFAULT_LANG: Lang = 'en';

export const LANG_NAMES: Record<Lang, string> = {
  ru: 'Русский',
  en: 'English',
  az: 'Azərbaycan',
  de: 'Deutsch',
};

/** Lazily load a language file so a missing translation never breaks other pages. */
export async function getContent(lang: Lang): Promise<Content> {
  switch (lang) {
    case 'ru':
      return ru;
    case 'az':
      return (await import('./az')).az;
    case 'de':
      return (await import('./de')).de;
    default:
      return (await import('./en')).en;
  }
}

/** Path prefix for a language: '' for the default (en), '/ru' etc. for the rest. */
export function langPrefix(lang: Lang): string {
  return lang === DEFAULT_LANG ? '' : `/${lang}`;
}

/** Build a localized path. localePath('ru', '/privacy') → '/ru/privacy/'. */
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

/**
 * Word-split markup for the reading-paced ink fill (About.astro `.ink`, scrolled by src/scripts/ink.ts):
 * every whitespace-separated word becomes `<span class="w" data-i="k">`, so one CSS rule can light the
 * words up in reading order from a single `--p` on the paragraph. `{{…}}` highlights stay <em class="hl">
 * and may span several words: the <em> is opened and closed inside every word it covers, so the nesting
 * is valid per word and punctuation glued to a highlighted word ("{{Google}},") dims with it.
 * The text is escaped first, like hl().
 */
export function ink(text: string): string {
  let open = false;
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((word, i) => {
      const wasOpen = open;
      const inner = escapeHtml(word).replace(/\{\{|\}\}/g, (m) => {
        open = m === '{{';
        return open ? '<em class="hl">' : '</em>';
      });
      return `<span class="w" data-i="${i}">${wasOpen ? '<em class="hl">' : ''}${inner}${open ? '</em>' : ''}</span>`;
    })
    .join(' ');
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
