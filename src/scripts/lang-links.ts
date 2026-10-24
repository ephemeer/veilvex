import { $$ } from './util';

/**
 * The current hash, but only when it points at an element of this page: the same page in another
 * language has the same ids, so the reader lands on the same section. Privacy pages have no hash.
 */
export function sectionHash(): string {
  const hash = location.hash;
  if (hash.length < 2) return '';
  let id = hash.slice(1);
  try {
    id = decodeURIComponent(id);
  } catch {
    return '';
  }
  return document.getElementById(id) ? hash : '';
}

/** Language-switch target that keeps the reader on the current section: '/en/' → '/en/#pricing'. */
export function langHref(base: string): string {
  return base.replace(/#.*$/, '') + sectionHash();
}

/**
 * Every `a[data-lang-link]` (nav popover, mobile menu, footer) carries the current section hash.
 * Refreshed on hashchange/popstate and again right before activation (pushState fires no hashchange).
 */
export function initLangLinks(): void {
  const links = $$<HTMLAnchorElement>('a[data-lang-link]');
  if (!links.length) return;
  const bases = links.map((a) => a.getAttribute('href') ?? '');
  const update = () => links.forEach((a, i) => a.setAttribute('href', langHref(bases[i] ?? '')));
  update();
  window.addEventListener('hashchange', update);
  window.addEventListener('popstate', update);
  for (const a of links) {
    a.addEventListener('pointerdown', update);
    a.addEventListener('focus', update);
    a.addEventListener('click', update);
  }
}
