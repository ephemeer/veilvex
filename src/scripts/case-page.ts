import { $$ } from './util';

/**
 * Case-study page (CasePage.astro). Screenshots fade in once loaded (see below). The table of contents marks the section being read —
 * `aria-current="location"` on its link in both TOCs (the sticky desktop column and the phone toggle).
 * "Being read" = the last section whose top has passed a line 30% down the viewport; above the first
 * section nothing is marked, and at the very end of the page (where short closing sections can never
 * reach the line) the last section is. Measured once per frame while scrolling (passive listener + rAF,
 * like the nav). Colour change only (CSS, 150ms); nothing moves. A TOC click marks its target at once.
 */
export function initCasePage(): void {
  // screenshots: fade in once loaded (CasePage.astro); already loaded → shown at once, failed → shown anyway
  // (decode() first: `load` can fire before the pixels are ready, and a fade that runs on an undecoded image
  // ends before anything is painted — the screenshot would still pop in)
  for (const img of $$<HTMLImageElement>('img[data-fade]')) {
    const done = () => img.classList.add('is-loaded');
    const show = () => (typeof img.decode === 'function' ? img.decode().then(done, done) : done());
    if (img.complete) void show();
    else {
      img.addEventListener('load', () => void show(), { once: true });
      img.addEventListener('error', done, { once: true });
    }
  }

  const sections = $$('[data-case-section]');
  const links = $$<HTMLAnchorElement>('[data-toc-link]');
  if (!sections.length || !links.length) return;
  let current = '';
  const mark = (id: string) => {
    if (id === current) return;
    current = id;
    for (const a of links) {
      if (a.dataset.tocLink === id) a.setAttribute('aria-current', 'location');
      else a.removeAttribute('aria-current');
    }
  };
  for (const a of links) a.addEventListener('click', () => mark(a.dataset.tocLink ?? ''));

  let ticking = false;
  const update = () => {
    ticking = false;
    const line = window.innerHeight * 0.3;
    let id = '';
    for (const s of sections) if (s.getBoundingClientRect().top <= line) id = s.id;
    const root = document.documentElement;
    const atEnd = window.scrollY + window.innerHeight >= root.scrollHeight - 2;
    const last = sections[sections.length - 1]!;
    if (atEnd && last.getBoundingClientRect().top < window.innerHeight) id = last.id;
    mark(id);
  };
  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    },
    { passive: true },
  );
  window.addEventListener('resize', update, { passive: true });
  update();
}
