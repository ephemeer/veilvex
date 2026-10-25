import { $$ } from './util';

/**
 * Ambient loops (hero aurora, GEO orbit) tick only while their element is on screen: an
 * IntersectionObserver toggles `.is-on`, which the CSS maps to `animation-play-state`. Off screen —
 * and in a background tab, where the browser already stops CSS animations — nothing moves.
 * Under reduced motion the stylesheets set `animation: none`, so the class changes nothing.
 */
export function initAmbient(): void {
  const els = $$('[data-ambient]');
  if (els.length === 0) return;
  if (!('IntersectionObserver' in window)) {
    for (const el of els) el.classList.add('is-on');
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) (e.target as HTMLElement).classList.toggle('is-on', e.isIntersecting);
    },
    { threshold: 0 },
  );
  for (const el of els) io.observe(el);
}
