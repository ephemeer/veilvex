import { $$ } from './util';

/**
 * Scroll reveal for `.reveal` elements (first-view only, marketing tier).
 * Elements with data-i get `--i` (used by CSS for in-component staggers).
 * Reveal delay (`--d`) is the element's position within the batch that enters the viewport
 * together (document order), 45ms apart, capped — so a lone card never waits for siblings that
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
        el.style.setProperty('--d', `${Math.min(k, 8) * 45}ms`);
        el.classList.add('is-in');
        io.unobserve(el);
        // Once the entrance has played, drop the reveal classes: a CSS animation restarts whenever the
        // element goes display:none → visible again (case filters, "show all"), which would replay it.
        const strip = () => {
          el.classList.remove('reveal', 'is-in');
          el.style.removeProperty('--d');
        };
        el.addEventListener(
          'animationend',
          (e) => {
            if (e.target !== el) return;
            // A child entrance keyed on `.is-in` can outlast the element's own (the contact headline
            // motif: its glyph starts 120ms later) — stripping the classes now would cut it off, so wait
            // for the finite animations still running in the subtree. Loops (orbit, marquee) are skipped.
            const pending =
              typeof el.getAnimations === 'function'
                ? el.getAnimations({ subtree: true }).filter((a) => a.playState === 'running' && Number.isFinite(a.effect?.getTiming().iterations ?? Infinity))
                : [];
            if (pending.length === 0) strip();
            else Promise.allSettled(pending.map((a) => a.finished)).then(strip);
          },
          { once: true },
        );
      });
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.1 },
  );
  items.forEach((el) => io.observe(el));
}
