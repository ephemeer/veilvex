import { $$, finePointer } from './util';

/**
 * Delicate cursor highlight on cards (styled by `.card__spot`: large, soft, ≤7% lime). A dedicated
 * child element is moved with `transform` only (composite tier) — no per-frame gradient repaint and
 * no CSS-variable recalc on the card subtree. The card rect is read once per hover, not per move.
 */
export function initSpotlight(): void {
  if (!finePointer()) return;
  for (const card of $$('[data-spotlight]')) {
    const spot = document.createElement('i');
    spot.className = 'card__spot';
    spot.setAttribute('aria-hidden', 'true');
    card.prepend(spot);
    let rect: DOMRect | null = null;
    card.addEventListener('pointerenter', () => (rect = card.getBoundingClientRect()), { passive: true });
    card.addEventListener(
      'pointermove',
      (e) => {
        const r = rect ?? (rect = card.getBoundingClientRect());
        spot.style.transform = `translate(${(e.clientX - r.left).toFixed(0)}px, ${(e.clientY - r.top).toFixed(0)}px)`;
      },
      { passive: true },
    );
    card.addEventListener('pointerleave', () => (rect = null), { passive: true });
  }
}
