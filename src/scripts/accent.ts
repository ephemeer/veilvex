import { $$ } from './util';

/**
 * Hero headline accent (Hero.astro `.w__in--accent`): the last line is lime → mint, clipped to the
 * glyphs. Every word is its own masked box for the word reveal, so each would repeat the gradient;
 * this stretches one gradient across the whole line by sizing and offsetting each word's background
 * to the line's extent. Layout positions (offset*), not transformed rects, so the staggered entrance
 * never skews the measure. Re-measured after fonts and on resize; if the words wrap onto separate
 * lines they fall back to the stylesheet's per-word gradient.
 */
export function initAccent(): void {
  const words = $$('.w__in--accent');
  if (words.length < 2) return;
  const place = () => {
    const first = words[0];
    if (!first) return;
    const top = first.offsetTop;
    const sameLine = words.every((w) => Math.abs(w.offsetTop - top) < w.offsetHeight / 2);
    const width = Math.max(...words.map((w) => w.offsetLeft + w.offsetWidth)) - first.offsetLeft;
    for (const w of words) {
      if (!sameLine || width <= 0) {
        w.style.removeProperty('background-size');
        w.style.removeProperty('background-position');
        continue;
      }
      w.style.backgroundSize = `${width}px 100%`;
      w.style.backgroundPosition = `${first.offsetLeft - w.offsetLeft}px 0`;
    }
  };
  place();
  window.addEventListener('resize', place, { passive: true });
  if ('fonts' in document) document.fonts.ready.then(place, () => {});
}
