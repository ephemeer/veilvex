import { $, $$, onceInView, reduceMotion, EASE_OUT } from './util';

export function initHero(): void {
  const hero = $('[data-hero]');
  if (hero) {
    // Wait a frame so the initial (hidden) styles are applied before transitioning.
    const ready = () => requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add('is-ready')));
    if ('fonts' in document) {
      Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 600))]).then(ready, ready);
    } else ready();
  }

  const mock = $('[data-mock]');
  if (!mock) return;

  // Console views: each sidebar button shows its own pre-rendered head layer and chart group
  // (Mock.astro crossfades them in CSS); the crumb in the title bar follows the active item.
  const navs = $$<HTMLButtonElement>('[data-view]', mock);
  const heads = $$('[data-view-head]', mock);
  const charts = $$<SVGGElement>('[data-view-chart]', mock);
  const crumb = $('[data-view-crumb]', mock);
  const show = (view: string) => {
    for (const b of navs) {
      const on = b.dataset.view === view;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', String(on));
      if (on && crumb) crumb.textContent = `/ ${b.textContent?.trim() ?? ''}`;
    }
    for (const h of heads) h.classList.toggle('is-active', h.dataset.viewHead === view);
    for (const g of charts) g.classList.toggle('is-active', g.dataset.viewChart === view);
  };
  for (const b of navs) b.addEventListener('click', () => show(b.dataset.view ?? ''));

  onceInView(mock, () => {
    mock.classList.add('is-live');
    const line = $<SVGPathElement>('.mock__view.is-active .mock__line', mock);
    if (line && !reduceMotion() && typeof line.getTotalLength === 'function') {
      const len = line.getTotalLength();
      line.style.strokeDasharray = `${len}`;
      line.style.strokeDashoffset = `${len}`;
      line.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], {
        duration: 1400,
        easing: EASE_OUT,
        fill: 'forwards',
        delay: 150,
      });
    }
  });
}
