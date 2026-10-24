import { $$ } from './util';

/**
 * Scroll reveal for `.reveal` elements (first-view only, marketing tier).
 * Elements with data-i get `--i` (used by CSS for in-component staggers).
 * Reveal delay (`--d`) is the element's position within the batch that enters the viewport
 * together (document order), 60ms apart, capped — so a lone card never waits for siblings that
 * revealed long ago.
 */
export function initReveal(): void {
  for (const el of $$('[data-i]')) {
    el.style.setProperty('--i', el.dataset.i ?? '0');
  }
  const items = $$('.reveal');
  if (items.length === 0) return;
  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-in'));
    return;
  }
  const order = new Map(items.map((el, i) => [el, i] as const));
  const io = new IntersectionObserver(
    (entries) => {
      const batch = entries
        .filter((e) => e.isIntersecting)
        .map((e) => e.target as HTMLElement)
        .sort((a, b) => (order.get(a) ?? 0) - (order.get(b) ?? 0));
      batch.forEach((el, k) => {
        el.style.setProperty('--d', `${Math.min(k, 8) * 60}ms`);
        el.classList.add('is-in');
        io.unobserve(el);
        // Once the entrance has played, drop the reveal classes: a CSS animation restarts whenever the
        // element goes display:none → visible again (case filters, "show all"), which would replay it.
        el.addEventListener(
          'animationend',
          (e) => {
            if (e.target !== el) return;
            el.classList.remove('reveal', 'reveal--scale', 'reveal--left', 'is-in');
            el.style.removeProperty('--d');
          },
          { once: true },
        );
      });
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.1 },
  );
  items.forEach((el) => io.observe(el));
}
