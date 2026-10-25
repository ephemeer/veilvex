import { $$, onceInView, reduceMotion } from './util';

/** Same curve as --ease-out-long in global.css (for WAAPI). */
const EASE_OUT_LONG = 'cubic-bezier(0.16, 1, 0.3, 1)';
/** reveal.ts's observer options — the draw then starts in the same frame as the host's entrance. */
const REVEAL_IO: IntersectionObserverInit = { rootMargin: '0px 0px -10% 0px', threshold: 0.1 };

/**
 * Stroke draw-in for small line art (service / guarantee icons, stat sparklines), delight tier,
 * once per visit. `[data-draw]` is an <svg> whose sprite paths carry pathLength="100" (the dash
 * properties inherit into the <use> shadow tree), a <path> with pathLength="100", or a wrapper
 * around such an <svg>. Its stroke is hidden behind a 100-unit dash and drawn once when its
 * revealed host (`.reveal` ancestor) enters the viewport: the host's reveal stagger (`--d`, set by
 * reveal.ts in the same frame) plus data-draw-delay, over data-draw-duration (700ms by default) on
 * the long ease-out. Afterwards the dash properties are removed, so at rest the art is plain. An
 * optional sibling `[data-draw-end]` (the sparkline's end dot) fades in when the line arrives.
 * Under reduced motion nothing is hidden and nothing runs; without JS the art is simply visible.
 */
export function initDraw(): void {
  if (reduceMotion() || typeof Element.prototype.animate !== 'function') return;
  for (const el of $$<HTMLElement | SVGElement>('[data-draw]')) {
    const target = el instanceof SVGElement ? el : el.querySelector<SVGElement>('svg, path');
    if (!target) continue;
    const host = el.closest<HTMLElement>('.reveal') ?? el;
    const end = target.parentElement?.querySelector<SVGElement>('[data-draw-end]') ?? null;
    target.style.strokeDasharray = '100';
    target.style.strokeDashoffset = '100';
    if (end) end.style.opacity = '0';
    const extra = Number(el.dataset.drawDelay ?? 0) || 0;
    const duration = Number(el.dataset.drawDuration ?? 700) || 700;
    onceInView(
      host,
      () => {
        const stagger = parseFloat(host.style.getPropertyValue('--d')) || 0;
        const anim = target.animate([{ strokeDashoffset: 100 }, { strokeDashoffset: 0 }], {
          duration,
          delay: stagger + extra,
          easing: EASE_OUT_LONG,
          fill: 'forwards',
        });
        const settle = () => {
          // plain at rest: no dash, no animation effect, the end dot fades in on its own transition
          target.style.removeProperty('stroke-dasharray');
          target.style.removeProperty('stroke-dashoffset');
          anim.cancel();
          if (end) end.style.removeProperty('opacity');
        };
        anim.finished.then(settle, settle);
      },
      REVEAL_IO,
    );
  }
}
