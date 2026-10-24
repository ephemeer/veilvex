import { $, onceInView, reduceMotion } from './util';

/**
 * Once-only sheen along the border of the popular tier (Pricing.astro `.is-sheen`, delight tier).
 * It starts when most of the card is in view — after the card's own reveal entrance has landed —
 * and the class leaves with the animation, so it never replays and nothing moves at rest.
 * Under reduced motion it does not run at all.
 */
export function initPricing(): void {
  const card = $('.tier.is-popular');
  const sheen = card ? $('.tier__sheen', card) : null;
  if (!card || !sheen || reduceMotion()) return;
  onceInView(
    card,
    () => {
      window.setTimeout(() => {
        sheen.addEventListener('animationend', () => card.classList.remove('is-sheen'), { once: true });
        card.classList.add('is-sheen');
      }, 500);
    },
    { threshold: 0.6 },
  );
}
