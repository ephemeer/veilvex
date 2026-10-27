import { $, $$, jumpToSection, lockScroll, reduceMotion, unlockScroll } from './util';
import { langHref } from './lang-links';
import { scrollToRequestForm } from './contact';

/** Exit transition length — must match `.cmd.is-closing` in CommandBar.astro. */
const CLOSE_MS = 120;

/**
 * ⌘K / Ctrl+K command bar. The options are server-rendered (CommandBar.astro); this script only
 * filters them, moves the selection and performs the chosen action.
 *
 * Combobox + listbox pattern: keyboard focus stays in the input, the highlighted option is exposed
 * through aria-activedescendant / aria-selected. While open the rest of the page is inert, the
 * document does not scroll, Tab cycles inside the dialog, Esc / backdrop / ⌘K close it and focus
 * returns to where it came from.
 */
export function initCommandBar(): void {
  const root = $('[data-cmd]');
  const input = root ? $<HTMLInputElement>('[data-cmd-input]', root) : null;
  const list = root ? $('[data-cmd-list]', root) : null;
  if (!root || !input || !list) return;
  const dialog = $('[data-cmd-dialog]', root) ?? root;
  const body = $('[data-cmd-body]', root);
  const items = $$('[data-cmd-item]', list);
  const groups = $$('[data-cmd-group]', list);
  const empty = $('[data-cmd-empty]', root);
  const status = $('[data-cmd-status]', root);
  const triggers = $$('[data-cmd-open]');
  const html = document.documentElement;
  const locale = html.lang || undefined;

  // The header badge shows "⌘K" or "Ctrl K" from the first paint: both labels are in the markup and
  // html.mac / html.pc (set by the inline script in Base.astro) picks one — no text swap here.

  // search index: visible text (label + hint) and the per-item synonyms from data-keywords
  const norm = (s: string) => s.toLocaleLowerCase(locale).replace(/ё/g, 'е');
  const index = items.map((el) => ({ el, text: norm(`${el.textContent ?? ''} ${el.dataset.keywords ?? ''}`) }));
  const emptyText = (empty?.textContent ?? '').trim();

  let isOpen = false;
  let hideTimer: number | undefined;
  let lastFocus: HTMLElement | null = null;
  let visible: HTMLElement[] = items;
  let selected: HTMLElement | null = null;

  const select = (el: HTMLElement | null, scroll = true) => {
    if (selected && selected !== el) selected.setAttribute('aria-selected', 'false');
    selected = el;
    if (!el) {
      input.setAttribute('aria-activedescendant', '');
      return;
    }
    el.setAttribute('aria-selected', 'true');
    input.setAttribute('aria-activedescendant', el.id);
    if (scroll) el.scrollIntoView({ block: 'nearest' });
  };

  const filter = (query: string) => {
    const tokens = norm(query).split(/\s+/).filter(Boolean);
    visible = [];
    for (const { el, text } of index) {
      const show = tokens.every((t) => text.includes(t));
      el.hidden = !show;
      if (show) visible.push(el);
    }
    for (const g of groups) g.hidden = !visible.some((v) => g.contains(v));
    if (empty) empty.hidden = visible.length > 0;
    if (status) status.textContent = visible.length ? '' : emptyText;
    select(visible[0] ?? null);
  };

  // scroll lock with scrollbar compensation — shared with the menu and the case sheet (util.ts)
  const lock = (on: boolean) => (on ? lockScroll('cmd') : unlockScroll('cmd'));

  // everything but the palette is inert while it is open (no focus, no clicks, hidden from AT)
  const setInert = (on: boolean) => {
    for (const el of Array.from(document.body.children)) {
      if (el === root || el.tagName === 'SCRIPT') continue;
      if (on) el.setAttribute('inert', '');
      else el.removeAttribute('inert');
    }
  };

  const focusables = (): HTMLElement[] =>
    $$<HTMLElement>('input, button, a[href], [tabindex]:not([tabindex="-1"])', dialog).filter(
      (el) => !el.closest('[hidden]') && el.getClientRects().length > 0,
    );

  const open = (trigger: HTMLElement | null = null) => {
    if (isOpen) return;
    isOpen = true;
    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = undefined;
      root.classList.remove('is-closing');
    }
    const active = document.activeElement;
    lastFocus = trigger ?? (active instanceof HTMLElement && active !== document.body ? active : null);
    // a jump from the palette must land on the page, not behind the open mobile menu
    $('[data-burger][aria-expanded="true"]')?.click();
    root.hidden = false;
    void root.offsetWidth; // flush the display change so the entrance transition runs
    root.classList.add('is-open');
    lock(true);
    setInert(true);
    triggers.forEach((b) => b.setAttribute('aria-expanded', 'true'));
    input.value = '';
    filter('');
    input.focus({ preventScroll: true });
  };

  // The scroll lock outlives the dialog's 120ms exit: the returning scrollbar narrows the viewport and
  // would nudge the still-visible, centered dialog sideways. `unlockNow` is for actions that scroll the
  // page right away (section jump, request form).
  const close = (restoreFocus = true, unlockNow = false) => {
    if (!isOpen) return;
    isOpen = false;
    setInert(false);
    if (unlockNow) lock(false);
    triggers.forEach((b) => b.setAttribute('aria-expanded', 'false'));
    root.classList.remove('is-open');
    root.classList.add('is-closing');
    const fallback = triggers.find((b) => b.getClientRects().length > 0) ?? null;
    const target = lastFocus?.isConnected ? lastFocus : fallback;
    lastFocus = null;
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

  const activate = (el: HTMLElement) => {
    const { cmdSection, cmdLang, cmdAction, href } = el.dataset;
    if (cmdLang) {
      if (el.getAttribute('aria-current') === 'true') {
        close();
        return;
      }
      close(false);
      if (href) location.assign(langHref(href)); // same page, same section, other language
      return;
    }
    if (cmdSection) {
      close(true, true); // unlock scrolling first, then jump
      if (!jumpToSection(cmdSection) && href) location.assign(href); // privacy page → home#section
      return;
    }
    if (cmdAction === 'request') {
      const onPage = document.getElementById('contact') !== null;
      close(!onPage, onPage); // on the page: unlock now, the form is scrolled to
      if (!onPage) {
        if (href) location.assign(href);
        return;
      }
      scrollToRequestForm();
      $<HTMLInputElement>('#f-name')?.focus({ preventScroll: true });
      return;
    }
    close(false);
    if (href) location.assign(href);
  };

  // keyboard inside the dialog
  dialog.addEventListener('keydown', (e) => {
    if (e.isComposing) return;
    const n = visible.length;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!n) return;
      const i = selected ? visible.indexOf(selected) : -1;
      const next = e.key === 'ArrowDown' ? (i + 1) % n : i <= 0 ? n - 1 : i - 1;
      select(visible[next] ?? null);
    } else if ((e.key === 'Home' || e.key === 'End') && !input.value) {
      e.preventDefault();
      if (n) select((e.key === 'Home' ? visible[0] : visible[n - 1]) ?? null);
    } else if (e.key === 'Enter') {
      if (selected) {
        e.preventDefault();
        activate(selected);
      }
    } else if (e.key === 'Tab') {
      const f = focusables();
      const first = f[0];
      const last = f[f.length - 1];
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  // pointer: hovering highlights, clicking activates, focus (and the caret) stays in the input
  dialog.addEventListener('mousedown', (e) => {
    const t = e.target as Element;
    if (t !== body && !t.closest('input, button')) e.preventDefault();
  });
  list.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    const el = (e.target as Element).closest<HTMLElement>('[data-cmd-item]');
    if (el && el !== selected && !el.hidden) select(el, false);
  });
  list.addEventListener('click', (e) => {
    const el = (e.target as Element).closest<HTMLElement>('[data-cmd-item]');
    if (el) activate(el);
  });
  input.addEventListener('input', () => filter(input.value));
  $('[data-cmd-backdrop]', root)?.addEventListener('click', () => close());
  $('[data-cmd-close]', root)?.addEventListener('click', () => close());
  for (const b of triggers) b.addEventListener('click', () => (isOpen ? close() : open(b)));

  // global shortcut — not while typing somewhere else on the page
  const isTyping = (t: EventTarget | null) =>
    t instanceof HTMLElement && t !== input && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey && (e.code === 'KeyK' || e.key.toLowerCase() === 'k')) {
      if (!isOpen && isTyping(e.target)) return;
      e.preventDefault();
      if (isOpen) close();
      else open();
      return;
    }
    if (e.key === 'Escape' && isOpen) {
      e.preventDefault();
      close();
    }
  });

  // belt and braces: focus never leaves the dialog while it is open
  document.addEventListener('focusin', (e) => {
    if (isOpen && !root.contains(e.target as Node)) input.focus({ preventScroll: true });
  });
}
