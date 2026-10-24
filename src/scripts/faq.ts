import { $, $$ } from './util';

export function initFaq(): void {
  const root = $('[data-faq]');
  if (!root) return;
  const items = $$('.faq__item', root);
  const close = (item: HTMLElement) => {
    const btn = $('.faq__q', item);
    const panel = $('.faq__panel', item);
    btn?.setAttribute('aria-expanded', 'false');
    panel?.classList.remove('is-open');
  };
  for (const item of items) {
    const btn = $('.faq__q', item);
    const panel = $('.faq__panel', item);
    if (!btn || !panel) continue;
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      items.forEach((other) => other !== item && close(other));
      btn.setAttribute('aria-expanded', String(!open));
      panel.classList.toggle('is-open', !open);
    });
  }
}
