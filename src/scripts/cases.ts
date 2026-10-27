import { $, $$, reduceMotion } from './util';

/** Phones show six cases behind a "show all" button: reveal the rest (a filter does it too). */
export function expandCases(): void {
  $('[data-cases-root]')?.classList.remove('is-collapsed');
  const more = $('[data-cases-more]');
  if (more) more.hidden = true;
}

export function initCases(): void {
  const filters = $('[data-filters]');
  const grid = $('[data-cases]');
  if (!filters || !grid) return;
  const layer = $('[data-active-layer]', filters);
  const buttons = $$('button[data-filter]', filters);
  const cards = $$('.case', grid);
  const more = $('[data-cases-more]');

  /**
   * Clip the inverted copy of the row to the active button (4-side insets → works when the row wraps).
   * Only a click animates the move; init, resize and font-load repositioning snap (a pill sliding on
   * its own because the font arrived is a glitch, not a transition).
   */
  const moveIndicator = (btn: HTMLElement, animate = true) => {
    if (!layer) return;
    const left = Math.max(0, btn.offsetLeft - layer.offsetLeft);
    const top = Math.max(0, btn.offsetTop - layer.offsetTop);
    const right = Math.max(0, layer.offsetWidth - (left + btn.offsetWidth));
    const bottom = Math.max(0, layer.offsetHeight - (top + btn.offsetHeight));
    if (!animate) layer.style.transition = 'none';
    layer.style.setProperty('--l', `${left}px`);
    layer.style.setProperty('--t', `${top}px`);
    layer.style.setProperty('--r', `${right}px`);
    layer.style.setProperty('--b', `${bottom}px`);
    if (!animate) {
      void layer.offsetWidth; // apply the new clip before the transition comes back
      layer.style.removeProperty('transition');
    }
  };

  const apply = (type: string) => {
    for (const card of cards) {
      const show = type === 'all' || card.dataset.type === type;
      if (show) {
        if (card.hidden) {
          card.hidden = false;
          // force a style/layout pass so the .is-out start state is rendered before transitioning
          void card.offsetWidth;
        }
        card.classList.remove('is-out');
      } else {
        card.classList.add('is-out');
        const onEnd = () => {
          if (card.classList.contains('is-out')) card.hidden = true;
        };
        // the card's own fade: transitions of its children or of a pseudo layer (the arena's light) bubble here too
        const onFade = (e: TransitionEvent) => {
          if (e.target !== card || e.pseudoElement || e.propertyName !== 'opacity') return;
          card.removeEventListener('transitionend', onFade);
          onEnd();
        };
        card.addEventListener('transitionend', onFade);
        setTimeout(() => {
          card.removeEventListener('transitionend', onFade);
          onEnd();
        }, 240);
      }
    }
    // the arena (arena.ts) re-spaces its ring around the cards that stay
    grid.dispatchEvent(new CustomEvent('cases:filter', { detail: { type } }));
  };

  // phones: the row scrolls sideways when the labels do not fit (Cases.astro); its clipped ends fade, and a
  // pressed filter is brought into view inside the row — the row scrolls, never the page
  const edges = () => {
    const max = filters.scrollWidth - filters.clientWidth;
    filters.classList.toggle('is-clipped-start', max > 1 && filters.scrollLeft > 1);
    filters.classList.toggle('is-clipped-end', max > 1 && filters.scrollLeft < max - 1);
  };
  const bringIntoRow = (btn: HTMLElement) => {
    const max = filters.scrollWidth - filters.clientWidth;
    if (max <= 1) return;
    const left = Math.min(max, Math.max(0, btn.offsetLeft - (filters.clientWidth - btn.offsetWidth) / 2));
    filters.scrollTo({ left, behavior: reduceMotion() ? 'instant' : 'smooth' });
  };
  filters.addEventListener('scroll', edges, { passive: true });

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      moveIndicator(btn);
      bringIntoRow(btn);
      expandCases();
      apply(btn.dataset.filter ?? 'all');
    });
  });
  more?.addEventListener('click', expandCases);

  const current = () => buttons.find((b) => b.getAttribute('aria-pressed') === 'true') ?? buttons[0];
  const active = current();
  if (active) moveIndicator(active, false);
  edges();
  window.addEventListener('resize', () => {
    const cur = current();
    if (cur) moveIndicator(cur, false);
    edges();
  }, { passive: true });
  // fonts can change button widths after first paint
  if ('fonts' in document) document.fonts.ready.then(() => { const cur = current(); if (cur) moveIndicator(cur, false); edges(); });
}
