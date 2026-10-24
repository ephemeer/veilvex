import { $, $$, clamp } from './util';

/** Lime beam that fills the process rail as you scroll through the steps. */
export function initProcess(): void {
  const root = $('[data-process]');
  const beam = root ? $('[data-beam]', root) : null;
  if (!root || !beam) return;
  const steps = $$('[data-step]', root);
  let ticking = false;
  const update = () => {
    ticking = false;
    const r = root.getBoundingClientRect();
    const vh = window.innerHeight;
    // 0 when the rail enters the lower third of the viewport, 1 when it leaves the upper third
    const p = clamp((vh * 0.75 - r.top) / (r.height + vh * 0.25));
    beam.style.setProperty('--p', p.toFixed(3));
    steps.forEach((s, i) => {
      if (p >= (i + 0.35) / steps.length) s.classList.add('is-lit');
    });
  };
  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true },
  );
  window.addEventListener('resize', update, { passive: true });
  update();
}
