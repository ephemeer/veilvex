import { $, $$ } from './util';

export function initNav(): void {
  const nav = $('[data-nav]');
  if (!nav) return;
  const links = $$('[data-nav-link]', nav);
  const sections = links
    .map((a) => document.getElementById(a.dataset.navLink ?? ''))
    .filter((s): s is HTMLElement => s !== null);

  // scrolled state (rAF-throttled): border + background only, no reading-progress bar.
  // Hysteresis (on above 12px, off below 4px): a 1–2px wobble around one threshold — trackpad
  // inertia, rubber-banding — would otherwise toggle the border several times a second.
  let ticking = false;
  let scrolled = false;
  const update = () => {
    ticking = false;
    const y = window.scrollY;
    if (y > 12) scrolled = true;
    else if (y < 4) scrolled = false;
    nav.classList.toggle('is-scrolled', scrolled);
  };
  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true },
  );
  update();

  // active section link
  if (sections.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const id = (e.target as HTMLElement).id;
          links.forEach((a) => a.classList.toggle('is-active', a.dataset.navLink === id));
        }
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 },
    );
    sections.forEach((s) => io.observe(s));
  }

  // language popover
  const lang = $('[data-lang]', nav);
  const langBtn = lang ? $('.lang__btn', lang) : null;
  const langMenu = lang ? $('.lang__menu', lang) : null;
  const closeLang = () => {
    if (!langBtn || !langMenu) return;
    langBtn.setAttribute('aria-expanded', 'false');
    langMenu.classList.remove('is-open');
  };
  if (langBtn && langMenu) {
    langMenu.hidden = false; // visibility is handled by CSS (so it can animate)
    langBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = langBtn.getAttribute('aria-expanded') === 'true';
      langBtn.setAttribute('aria-expanded', String(!open));
      langMenu.classList.toggle('is-open', !open);
      if (!open) ($('a', langMenu) as HTMLElement | null)?.focus({ preventScroll: true });
    });
    document.addEventListener('click', (e) => {
      if (lang && !lang.contains(e.target as Node)) closeLang();
    });
  }

  // mobile menu
  const burger = $('[data-burger]', nav);
  const mobile = $('[data-mobile]', nav);
  const setMobile = (open: boolean) => {
    if (!burger || !mobile) return;
    burger.setAttribute('aria-expanded', String(open));
    mobile.classList.toggle('is-open', open);
    // scroll lock with scrollbar compensation (Nav.astro html.is-menu-open): the page and the fixed
    // header keep the vanished scrollbar's width as padding, so the burger does not jump sideways
    const html = document.documentElement;
    if (open) {
      html.style.setProperty('--nav-sbw', `${Math.max(0, window.innerWidth - html.clientWidth)}px`);
      html.classList.add('is-menu-open');
    } else {
      html.classList.remove('is-menu-open');
      html.style.removeProperty('--nav-sbw');
    }
  };
  if (burger && mobile) {
    mobile.hidden = false;
    burger.addEventListener('click', () => setMobile(burger.getAttribute('aria-expanded') !== 'true'));
    $$('a', mobile).forEach((a) => a.addEventListener('click', () => setMobile(false)));
    window.matchMedia('(min-width: 1024px)').addEventListener('change', (e) => {
      if (e.matches) setMobile(false);
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeLang();
      setMobile(false);
    }
  });
}
