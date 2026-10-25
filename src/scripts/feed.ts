import { $, $$, EASE_OUT, reduceMotion } from './util';

const INTERVAL = 6000; // between rotations
const LEAVE = 200; // the oldest row fades out (Mock.astro .is-leave)
const SHIFT = 300; // the rows between glide down; the new row rises in (.is-enter)

/**
 * Live console feed (Mock.astro `[data-feed]`): the three visible automation events rotate gently.
 * Every ~6 s the oldest row fades out, moves to the top carrying the next event from the localized
 * pool (the server-rendered hidden rows) and rises in, while the rows between glide down (FLIP,
 * transform only). It is one DOM move — the row count never changes, so nothing below the mock
 * shifts. Rotation waits for the mock's own entrance (`.is-live`), pauses while the mock is off
 * screen or the tab is hidden, and does not run under reduced motion.
 */
export function initFeed(): void {
  const mock = $('[data-mock]');
  const feed = mock ? $('[data-feed]', mock) : null;
  if (!mock || !feed || reduceMotion()) return;
  const rows = $$('[data-feed-item]', feed);
  const pool = rows.map((r) => ({ text: $('.mock__ev-t', r)?.textContent ?? '', meta: $('.mock__ev-m', r)?.textContent ?? '' }));
  let visible = rows.filter((r) => !r.hidden);
  for (const r of rows) if (r.hidden) r.remove();
  if (visible.length < 2 || pool.length <= visible.length) return;

  let next = visible.length; // pool index of the event that enters next
  let timer = 0;
  let onScreen = false;
  let busy = false;

  const rotate = () => {
    const last = visible[visible.length - 1];
    if (!last || busy) return;
    busy = true;
    last.classList.add('is-leave');
    window.setTimeout(() => {
      const item = pool[next % pool.length];
      next += 1;
      const rest = visible.slice(0, -1);
      const before = rest.map((r) => r.getBoundingClientRect().top);
      const text = $('.mock__ev-t', last);
      const meta = $('.mock__ev-m', last);
      if (text) text.textContent = item?.text ?? '';
      if (meta) meta.textContent = item?.meta ?? '';
      // the leaving row becomes the new first row: one move, same count, no layout change below
      feed.insertBefore(last, rest[0] ?? null);
      last.classList.remove('is-leave');
      last.classList.add('is-enter');
      last.addEventListener('animationend', () => last.classList.remove('is-enter'), { once: true });
      rest.forEach((r, i) => {
        const dy = r.getBoundingClientRect().top - (before[i] ?? 0);
        if (dy) r.animate([{ transform: `translateY(${-dy}px)` }, { transform: 'none' }], { duration: SHIFT, easing: EASE_OUT });
      });
      visible = [last, ...rest];
      busy = false;
    }, LEAVE);
  };

  const schedule = () => {
    window.clearTimeout(timer);
    timer = 0;
    if (!onScreen || document.hidden) return;
    timer = window.setTimeout(() => {
      timer = 0;
      if (mock.classList.contains('is-live')) rotate();
      schedule();
    }, INTERVAL);
  };

  document.addEventListener('visibilitychange', schedule);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(
      (entries) => {
        for (const e of entries) onScreen = e.isIntersecting;
        schedule();
      },
      { threshold: 0 },
    ).observe(mock);
  } else {
    onScreen = true;
    schedule();
  }
}
