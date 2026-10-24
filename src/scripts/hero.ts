import { $, onceInView, reduceMotion, EASE_OUT } from './util';

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
  onceInView(mock, () => {
    mock.classList.add('is-live');
    const line = $<SVGPathElement>('.mock__line', mock);
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
