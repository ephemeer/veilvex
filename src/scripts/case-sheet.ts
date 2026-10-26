import { $, $$, EASE_OUT, reduceMotion } from './util';
import { handoffToForm } from './contact';
import { expandCases } from './cases';

/** Exit transition length — must match `.sheet.is-closing` in CaseSheet.astro. */
const CLOSE_MS = 180;
/** The last staggered child (CTA, --k 7) settles at 80 + 7 × 40 + 300 ms; `is-entering` leaves after that. */
const ENTER_MS = 700;
/** The card art's flight into the sheet (FLIP, see fly()). */
const FLY_MS = 320;
const HASH = /^#case-(\d{1,2})$/;

/**
 * The case sheet (CaseSheet.astro): one dialog, all cases pre-rendered as hidden articles, one shown at
 * a time. Opens from a card button (data-case-open), from a #case-N URL at load and on hashchange;
 * closes on Esc, the × button, the backdrop, and whenever the hash moves somewhere else (a ⌘K jump).
 * ← / → and the bar buttons page through the cases. While open: the rest of the page is inert, the
 * document is scroll-locked (html.is-sheet-open, --sheet-sbw compensates the vanished scrollbar), Tab
 * cycles inside the panel, and on close focus returns to the card of the case being read.
 *
 * The URL carries the open case (#case-N via replaceState — no scroll, no history entry): the language
 * links keep the hash, so the same case opens in another language.
 */
export function initCaseSheet(): void {
  const root = $('[data-sheet]');
  if (!root) return;
  const panel = $('[data-sheet-panel]', root);
  const scroll = $('[data-sheet-scroll]', root);
  const cases = $$('[data-sheet-case]', root);
  const cur = $('[data-sheet-cur]', root);
  const status = $('[data-sheet-status]', root);
  const openers = $$<HTMLButtonElement>('[data-case-open]');
  if (!panel || !scroll || !cases.length) return;
  const html = document.documentElement;
  const total = cases.length;
  const kicker = root.dataset.sheetKicker ?? '';
  const pad2 = (n: number) => String(n).padStart(2, '0');

  let isOpen = false;
  let current = 0; // 1-based index of the case on show
  let opener: HTMLElement | null = null;
  let prevHash = '';
  let hideTimer: number | undefined;
  let enterTimer: number | undefined;
  let inerted: Element[] = [];
  let ghost: HTMLElement | null = null;

  const article = (n: number) => cases[n - 1] ?? null;
  const cardOf = (n: number) => openers.find((b) => Number(b.dataset.caseOpen) === n) ?? null;
  const titleOf = (n: number) => $<HTMLElement>(`#case-sheet-title-${n}`, root);
  const rendered = (el: Element | null): boolean => el !== null && el.getClientRects().length > 0;
  /** Another modal layer (the ⌘K palette) is on top: this sheet is inert and must not react. */
  const covered = () => root.closest('[inert]') !== null;

  // scroll lock; --sheet-sbw compensates the vanished scrollbar (see CaseSheet.astro)
  const lock = (on: boolean) => {
    if (on) {
      // reopened while the previous close is still fading: the lock is on and the scrollbar already gone,
      // so measuring again would read 0px and shift the page by the compensation
      if (html.classList.contains('is-sheet-open')) return;
      const sbw = window.innerWidth - html.clientWidth;
      html.style.setProperty('--sheet-sbw', `${Math.max(0, sbw)}px`);
      html.classList.add('is-sheet-open');
    } else {
      html.classList.remove('is-sheet-open');
      html.style.removeProperty('--sheet-sbw');
    }
  };

  // Everything but the sheet is inert while it is open (no focus, no clicks, hidden from AT). The sheet
  // lives inside the cases section, so every ancestor's siblings up to <body> are marked; only what this
  // call marked is cleared again. The ⌘K palette stays live: its shortcut is global and it opens on top.
  const setInert = (on: boolean) => {
    if (!on) {
      for (const el of inerted) el.removeAttribute('inert');
      inerted = [];
      return;
    }
    for (let node: HTMLElement | null = root; node && node !== document.body; node = node.parentElement) {
      for (const sib of Array.from(node.parentElement?.children ?? [])) {
        if (sib === node || sib.tagName === 'SCRIPT' || sib.hasAttribute('inert')) continue;
        if (sib.querySelector('[aria-modal="true"]')) continue;
        sib.setAttribute('inert', '');
        inerted.push(sib);
      }
    }
  };

  const setHash = (hash: string) => {
    if (location.hash === hash) return;
    history.replaceState(history.state, '', `${location.pathname}${location.search}${hash}`);
  };

  const land = () => {
    ghost?.remove();
    ghost = null;
    root.classList.remove('is-flying');
  };

  /**
   * Shared-element touch (desktop, motion on, opened from a card): a clone of the card's art flies from the
   * card's rect to the sheet art's rect — transform only, 320ms ease-out — while the panel slides in; the
   * sheet's own art is hidden underneath until both the flight and its entrance have finished, then takes
   * over in the same frame (same SVG, same box). No flight on close: the panel just exits.
   */
  const fly = (from: DOMRect, svg: Element, n: number) => {
    const art = $(`[data-sheet-case="${n}"] .sheet__art`, root);
    if (!art) return;
    const r = art.getBoundingClientRect();
    // the panel still sits at translateX(100%) (its width to the right); the art sits at the top of the scroll
    // container, parked 8px low by its own entrance keyframe — the container's top is its resting place
    const to = { x: r.x - panel.getBoundingClientRect().width, y: scroll.getBoundingClientRect().y, w: r.width, h: r.height };
    if (!to.w || !to.h || !from.width || !from.height) return;
    land();
    const g = document.createElement('div');
    g.className = 'sheet__ghost';
    g.style.left = `${to.x}px`;
    g.style.top = `${to.y}px`;
    g.style.width = `${to.w}px`;
    g.style.height = `${to.h}px`;
    g.append(svg.cloneNode(true));
    document.body.append(g);
    ghost = g;
    root.classList.add('is-flying');
    const flight = g.animate(
      [{ transform: `translate(${from.x - to.x}px, ${from.y - to.y}px) scale(${from.width / to.w}, ${from.height / to.h})` }, { transform: 'none' }],
      { duration: FLY_MS, easing: EASE_OUT, fill: 'both' },
    );
    Promise.allSettled([flight.finished, ...art.getAnimations().map((a) => a.finished)]).then(() => {
      if (ghost === g) land();
    });
  };

  const focusables = (): HTMLElement[] =>
    $$<HTMLElement>('button, a[href], input, [tabindex]:not([tabindex="-1"])', panel).filter((el) => !el.closest('[hidden]') && el.getClientRects().length > 0);

  /** Show case n; dir ±1 slides the new story in from the side it came from, 0 swaps silently (open). */
  const show = (n: number, dir: -1 | 0 | 1) => {
    const next = article(n);
    if (!next) return;
    if (dir) land();
    for (const c of cases) if (c !== next && !c.hidden) c.hidden = true;
    next.classList.remove('is-swap-next', 'is-swap-prev');
    next.hidden = false;
    if (dir) {
      next.classList.add(dir > 0 ? 'is-swap-next' : 'is-swap-prev');
      next.addEventListener(
        'animationend',
        (e) => {
          if (e.target === next) next.classList.remove('is-swap-next', 'is-swap-prev');
        },
        { once: true },
      );
    }
    current = n;
    scroll.scrollTop = 0;
    panel.setAttribute('aria-labelledby', `case-sheet-title-${n}`);
    if (cur) cur.textContent = pad2(n);
    // the card behind the sheet must exist for the focus return: phones hide cases 7+ behind "show all"
    const card = cardOf(n);
    if (card && !rendered(card) && $('[data-cases-root].is-collapsed')) expandCases();
  };

  const open = (n: number, trigger: HTMLElement | null, instant = false) => {
    if (n < 1 || n > total) return;
    if (isOpen) {
      if (n !== current) show(n, n > current ? 1 : -1);
      return;
    }
    isOpen = true;
    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = undefined;
      root.classList.remove('is-closing');
    }
    const active = document.activeElement;
    opener = trigger ?? (active instanceof HTMLElement && active !== document.body ? active : null);
    prevHash = HASH.test(location.hash) ? '' : location.hash;
    // the flight starts from where the card's art is right now (measured before anything moves)
    const cardArt = trigger?.closest('.case')?.querySelector('.case__art svg') ?? null;
    const flies = !!cardArt && !instant && !reduceMotion() && window.matchMedia('(min-width: 960px)').matches && cardArt.getClientRects().length > 0;
    const from = flies ? cardArt.getBoundingClientRect() : null;
    show(n, 0);
    root.classList.toggle('is-instant', instant);
    root.hidden = false;
    if (!instant) void root.offsetWidth; // flush the display change so the entrance transition runs
    root.classList.add('is-open');
    if (!instant && !reduceMotion()) {
      root.classList.add('is-entering');
      clearTimeout(enterTimer);
      enterTimer = window.setTimeout(() => root.classList.remove('is-entering'), ENTER_MS);
    }
    // the instant open (a #case-N URL at load) must not mute the transitions that come after it
    if (instant) requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('is-instant')));
    lock(true);
    setInert(true);
    if (from && cardArt) fly(from, cardArt, n);
    setHash(`#case-${n}`);
    titleOf(n)?.focus({ preventScroll: true });
  };

  // The scroll lock outlives the 180ms exit: the returning scrollbar would otherwise nudge the still-visible
  // panel sideways. `unlockNow` is for the moments the page is about to scroll (the request-form handoff,
  // a section jump from the palette).
  const close = ({ restoreFocus = true, restoreHash = true, unlockNow = false } = {}) => {
    if (!isOpen) return;
    isOpen = false;
    setInert(false);
    clearTimeout(enterTimer);
    land();
    root.classList.remove('is-open', 'is-entering');
    root.classList.add('is-closing');
    if (unlockNow) lock(false);
    if (restoreHash) setHash(prevHash);
    // focus goes back to the card of the case being read (the reader may have paged with ← / →),
    // else to the card that opened the sheet, else to the active filter
    const card = cardOf(current);
    const target = rendered(card) ? card : rendered(opener) ? opener : $('[data-filters] [aria-pressed="true"]');
    opener = null;
    if (restoreFocus && target) target.focus({ preventScroll: true });
    else if (root.contains(document.activeElement)) (document.activeElement as HTMLElement).blur();
    hideTimer = window.setTimeout(
      () => {
        hideTimer = undefined;
        root.classList.remove('is-closing');
        root.hidden = true;
        lock(false);
      },
      reduceMotion() ? 0 : CLOSE_MS,
    );
  };

  const step = (dir: -1 | 1) => {
    if (!isOpen) return;
    const n = ((current - 1 + dir + total) % total) + 1; // wraps around
    show(n, dir);
    setHash(`#case-${n}`);
    if (status) status.textContent = `${kicker} ${pad2(n)} / ${pad2(total)} — ${titleOf(n)?.textContent?.trim() ?? ''}`;
  };

  for (const b of openers) b.addEventListener('click', () => open(Number(b.dataset.caseOpen), b));

  root.addEventListener('click', (e) => {
    const t = e.target as Element;
    const cta = t.closest<HTMLElement>('[data-sheet-cta]');
    if (cta) {
      // hand over to the request form: the page scrolls there, so the lock goes now and focus does not
      // return to the card — it lands on the preselected chip, where Tab continues inside the form
      const service = cta.dataset.service ?? '';
      close({ restoreFocus: false, restoreHash: false, unlockNow: true });
      if (handoffToForm(service)) $<HTMLInputElement>(`input[name="services"][value="${CSS.escape(service)}"]`)?.focus({ preventScroll: true });
      return;
    }
    if (t.closest('[data-sheet-close]') || t.closest('[data-sheet-backdrop]')) close();
    else if (t.closest('[data-sheet-next]')) step(1);
    else if (t.closest('[data-sheet-prev]')) step(-1);
  });

  // keyboard: Esc closes, ← / → page; Tab cycles inside the panel. Capture phase: when the ⌘K palette is
  // open on top, its own Escape handler lifts the inert it put on the page — this must look before that.
  document.addEventListener(
    'keydown',
    (e) => {
      if (!isOpen || covered() || e.isComposing) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        if (e.altKey || e.ctrlKey || e.metaKey) return;
        e.preventDefault();
        step(e.key === 'ArrowRight' ? 1 : -1);
      }
    },
    true,
  );
  panel.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const f = focusables();
    const first = f[0];
    const last = f[f.length - 1];
    if (!first || !last) return;
    const active = document.activeElement;
    if (e.shiftKey && (active === first || active === panel)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  });

  // belt and braces: focus never leaves the sheet while it is the active layer
  document.addEventListener('focusin', (e) => {
    if (isOpen && !covered() && !root.contains(e.target as Node)) (titleOf(current) ?? panel).focus({ preventScroll: true });
  });

  // The URL is the state: Back/Forward or a typed #case-N opens that case; any other hash (a ⌘K section
  // jump, the request form) means the page is going somewhere, so the sheet gets out of the way.
  window.addEventListener('hashchange', () => {
    const m = HASH.exec(location.hash);
    const n = m ? Number(m[1]) : 0;
    if (n >= 1 && n <= total) open(n, null);
    else if (isOpen) close({ restoreHash: false, unlockNow: true });
  });

  // #case-N at load: the browser has already scrolled to the card (it carries the id); the sheet is
  // simply there — no entrance, nothing moves behind it
  const m = HASH.exec(location.hash);
  const n = m ? Number(m[1]) : 0;
  if (n >= 1 && n <= total) {
    const card = cardOf(n);
    if (card && !rendered(card) && $('[data-cases-root].is-collapsed')) {
      expandCases();
      card.scrollIntoView({ block: 'center', behavior: 'instant' });
    }
    open(n, card, true);
    // the fragment navigation runs its own focusing steps once the document has loaded (the card is not
    // focusable, so the viewport gets it), which would blur the title: focus it again after `load`
    const refocus = () => {
      if (isOpen && current === n) titleOf(n)?.focus({ preventScroll: true });
    };
    if (document.readyState === 'complete') refocus();
    else window.addEventListener('load', () => requestAnimationFrame(refocus), { once: true });
  }
}
