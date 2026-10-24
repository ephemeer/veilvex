import { $$, finePointer, reduceMotion } from './util';

/**
 * Subtle magnetic pull (≤6px) for the hero CTA — decorative, marketing page only.
 * Uses the individual `translate` property (not `transform`) so the button's own
 * `:active { transform: scale(0.97) }` and transitions keep working.
 */
export function initMagnetic(): void {
  if (!finePointer() || reduceMotion()) return;
  for (const el of $$('[data-magnetic]')) {
    const strength = 6;
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const dx = ((e.clientX - (r.left + r.width / 2)) / (r.width / 2)) * strength;
      const dy = ((e.clientY - (r.top + r.height / 2)) / (r.height / 2)) * strength;
      el.style.translate = `${dx.toFixed(1)}px ${dy.toFixed(1)}px`;
    });
    el.addEventListener('pointerleave', () => {
      el.style.translate = '';
    });
  }
}
