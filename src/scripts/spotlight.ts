import { $$, finePointer } from './util';

/**
 * Cursor spotlight on cards. A dedicated child element is moved with `transform` only
 * (composite tier) — no per-frame gradient repaint and no CSS-variable recalc on the card subtree.
 */
export function initSpotlight(): void {
  if (!finePointer()) return;
  for (const card of $$('[data-spotlight]')) {
    const spot = document.createElement('i');
    spot.className = 'card__spot';
    spot.setAttribute('aria-hidden', 'true');
    card.prepend(spot);
    card.addEventListener(
      'pointermove',
      (e) => {
        const r = card.getBoundingClientRect();
        spot.style.transform = `translate(${(e.clientX - r.left).toFixed(0)}px, ${(e.clientY - r.top).toFixed(0)}px)`;
      },
      { passive: true },
    );
  }
}
