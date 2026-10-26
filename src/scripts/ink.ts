import { $, $$, clamp, reduceMotion } from './util';

/**
 * Reading-paced ink fill on the About manifesto (About.astro `.ink`, markup from i18n ink()).
 * The words are `.w` spans whose `--i` reveal.ts sets from data-i; this sets `--n` (word count) once
 * and, rAF-throttled like the process beam, one quantised `--p` on the paragraph:
 *   p = clamp((0.8·vh − top) / (0.45·vh)) — 0 while the paragraph's top is below 80% of the viewport
 *   height, 1 once it has passed 35%. The CSS turns it into per-word opacity in reading order.
 * Written only when the hundredth changes, so a scroll frame costs at most one style recalc of the
 * paragraph (≤100 over the whole fill). Under reduced motion nothing runs and the words stay at 100%.
 */
export function initInk(): void {
  const el = $('[data-ink]');
  if (!el || reduceMotion()) return;
  const n = $$('.w', el).length;
  if (n === 0) return;
  el.style.setProperty('--n', String(n));
  let last = '';
  let ticking = false;
  const update = () => {
    ticking = false;
    const vh = window.innerHeight;
    const p = clamp((vh * 0.8 - el.getBoundingClientRect().top) / (vh * 0.45));
    const q = (Math.round(p * 100) / 100).toFixed(2);
    if (q === last) return;
    last = q;
    el.style.setProperty('--p', q);
  };
  const schedule = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  update();
}
