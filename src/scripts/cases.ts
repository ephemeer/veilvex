import { $, $$ } from './util';

export function initCases(): void {
  const filters = $('[data-filters]');
  const grid = $('[data-cases]');
  if (!filters || !grid) return;
  const layer = $('[data-active-layer]', filters);
  const buttons = $$('button[data-filter]', filters);
  const cards = $$('.case', grid);
  const more = $('[data-cases-more]');
  const section = grid.closest('[data-cases-root]') ?? grid.parentElement;

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

  const expand = () => {
    section?.classList.remove('is-collapsed');
    if (more) more.hidden = true;
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
        card.addEventListener('transitionend', onEnd, { once: true });
        setTimeout(onEnd, 240);
      }
    }
  };

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      moveIndicator(btn);
      expand();
      apply(btn.dataset.filter ?? 'all');
    });
  });
  more?.addEventListener('click', expand);

  const current = () => buttons.find((b) => b.getAttribute('aria-pressed') === 'true') ?? buttons[0];
  const active = current();
  if (active) moveIndicator(active, false);
  window.addEventListener('resize', () => {
    const cur = current();
    if (cur) moveIndicator(cur, false);
  }, { passive: true });
  // fonts can change button widths after first paint
  if ('fonts' in document) document.fonts.ready.then(() => { const cur = current(); if (cur) moveIndicator(cur, false); });
}
