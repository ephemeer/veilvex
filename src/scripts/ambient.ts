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
  // what counts as "on screen" is the element itself, or the nearest [data-ambient-box] ancestor when the
  // loop overflows its clipped container (the GEO orbit runs past the chat card: only the card counts)
  const groups = new Map<Element, HTMLElement[]>();
  for (const el of els) {
    const box = el.closest('[data-ambient-box]') ?? el;
    const list = groups.get(box) ?? [];
    list.push(el);
    groups.set(box, list);
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) for (const el of groups.get(e.target) ?? []) el.classList.toggle('is-on', e.isIntersecting);
    },
    { threshold: 0 },
  );
  for (const box of groups.keys()) io.observe(box);
}
