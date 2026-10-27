/**
 * Shared by the arena e2e files (arena.test.mjs, arena-screen.test.mjs): visit() opens a page on the fixture's
 * browser, waits for the arena's deferred mount and returns the probes the tests read and drive it with;
 * detent() mirrors arena.ts.
 */
import assert from 'node:assert/strict';
import { DESKTOP, openPage } from './helpers.mjs';

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
/** detent() of arena.ts: around each integer the ring holds still for 45% of a segment, smoothstep between. */
export const detent = (x) => {
  const k = Math.floor(x);
  const u = Math.min(1, Math.max(0, (x - k - 0.225) / 0.55));
  return k + u * u * (3 - 2 * u);
};
/** visit(path, options = DESKTOP, { js, init }) for a file's fixture `f`. */
export const visitor = (f) => (path, options, opts) => visit(f, path, options, opts);

async function visit(f, path, options = DESKTOP, { js = true, init } = {}) {
  const context = await f.state.browser.newContext({ ...options, javaScriptEnabled: js });
  const { page, problems } = await openPage(context);
  if (init) await page.addInitScript(init);
  await page.goto(f.state.base + path, { waitUntil: 'networkidle' });
  // the arena mounts in idle time after load (or at once for a fragment): wait for it, or for its "off"
  if (js) {
    await page.waitForFunction(
      () => {
        const s = document.querySelector('#cases')?.dataset.arena;
        return s === 'off' || (s === 'on' && document.querySelector('.cases__grid').dataset.arenaLoop);
      },
      null,
      { timeout: 8000 },
    );
  }
  const state = () =>
    page.evaluate(() => {
      const g = document.querySelector('.cases__grid');
      const r = (sel) => {
        const e = document.querySelector(sel);
        if (!e) return null;
        const b = e.getBoundingClientRect();
        return { x: b.x, y: b.y, w: b.width, h: b.height, bottom: b.bottom, right: b.right };
      };
      const ae = document.activeElement;
      return {
        arena: g.classList.contains('is-arena'),
        drive: g.dataset.arenaDrive,
        p: g.dataset.arenaP,
        n: g.dataset.arenaN,
        step: g.dataset.arenaStep,
        active: Number(g.dataset.arenaActive),
        loop: g.dataset.arenaLoop,
        reflow: g.classList.contains('is-reflow'),
        scrollY: Math.round(scrollY),
        title: document.querySelector('[data-arena-title]')?.textContent,
        kind: document.querySelector('[data-arena-kind]')?.textContent,
        count: document.querySelector('[data-arena-cur]')?.textContent,
        total: document.querySelector('[data-arena-total]')?.textContent,
        ticks: document.querySelectorAll('.arena__tick').length,
        lit: [...document.querySelectorAll('.case.is-active')].map((c) => c.id),
        litGhosts: document.querySelectorAll('.arena__ghost.is-active').length,
        hovered: [...document.querySelectorAll('.case.is-hover')].map((c) => c.id),
        stops: [...document.querySelectorAll('.case__open')].filter((b) => b.tabIndex === 0).map((b) => b.dataset.caseOpen),
        sheetOpen: document.querySelector('[data-sheet]').classList.contains('is-open'),
        sheetCase: Number(document.querySelector('[data-sheet-case]:not([hidden])')?.dataset.sheetCase ?? 0),
        hash: location.hash,
        stage: r('.cases__stage'),
        ring: r('.arena__ring'),
        headline: r('[data-arena-headline]'),
        pager: r('[data-arena-pager]'),
        strip: r('[data-arena-strip]'),
        activeCard: r('.case.is-active'),
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        focus: ae && ae !== document.body ? { tag: ae.tagName, caseOpen: ae.dataset.caseOpen, filter: ae.dataset.filter, inGrid: !!ae.closest('.cases__grid') } : null,
      };
    });
  /** The scrollY at which the stage starts to stick (index 0), from the never-sticky spacer — as arena.ts measures it. */
  const pinStart = () =>
    page.evaluate(() => {
      const stage = document.querySelector('.cases__stage');
      const track = document.querySelector('.cases__track');
      return track.getBoundingClientRect().top + scrollY - stage.offsetHeight - (parseFloat(getComputedStyle(stage).top) || 0);
    });
  const span = () => page.evaluate(() => document.querySelector('.cases__track').getBoundingClientRect().height);
  /** The scroll offset of order position pos (the visible cards, DOM order). */
  const offsetOf = async (pos) => {
    const n = Number(await page.evaluate(() => document.querySelector('.cases__grid').dataset.arenaN));
    return Math.round((await pinStart()) + ((await span()) * pos) / (n - 1));
  };
  const jump = (y) => page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), Math.round(y));
  /** Waits until the page has stopped scrolling and the ring has settled (loop idle, no glide, the kind line decoded). */
  const settled = async (timeout = 8000) => {
    const t0 = Date.now();
    let stable = 0;
    let last = -1;
    while (Date.now() - t0 < timeout) {
      const s = await page.evaluate(() => [
        Math.round(scrollY),
        document.querySelector('.cases__grid').dataset.arenaLoop,
        document.querySelector('.cases__grid').classList.contains('is-reflow') || document.querySelector('[data-arena-kind]')?.dataset.decode === 'on',
      ]);
      if (s[0] === last && s[1] === 'idle' && !s[2]) stable++;
      else stable = 0;
      last = s[0];
      if (stable >= 3) return;
      await sleep(100);
    }
    throw new Error('the ring did not settle');
  };
  /** A pointer click on the strip at order position pos (the strip maps x to the nearest tick). */
  const stripClick = async (pos) => {
    const b = await page.$eval('[data-arena-strip]', (s) => {
      const r = s.getBoundingClientRect();
      return { x: r.x, y: r.y, h: r.height, pitch: parseFloat(getComputedStyle(s).getPropertyValue('--arena-tick')) };
    });
    await page.mouse.click(b.x + (pos + 0.5) * b.pitch, b.y + b.h / 2);
  };
  const centre = (n) => page.$eval(`#case-${n}`, (el) => {
    const r = el.getBoundingClientRect();
    return [r.x + r.width / 2, r.y + r.height / 2];
  });
  /** A real pointer move onto card n (no scroll-into-view, unlike page.hover). */
  const hoverCard = async (n) => {
    const [x, y] = await centre(n);
    await page.mouse.move(x - 3, y);
    await page.mouse.move(x, y);
  };
  const clickCard = async (n) => {
    const [x, y] = await centre(n);
    await page.mouse.click(x, y);
  };
  /**
   * One wheel notch of dy px at the pointer: the page must move at least min px and stay there. The scroll is
   * watched for 900ms (longer than any idle timer) — a notch that went down and came back fails. A notch that
   * never moved the page at all was lost on its way in (headless input on a loaded machine): it is sent once more.
   */
  const notch = async (dy, min) => {
    const before = await page.evaluate(() => Math.round(scrollY));
    for (let attempt = 0; attempt < 2; attempt++) {
      await page.mouse.wheel(0, dy);
      const [max, end] = await page.evaluate(async () => {
        let top = scrollY;
        const t0 = performance.now();
        while (performance.now() - t0 < 900) {
          await new Promise((r) => requestAnimationFrame(r));
          top = Math.max(top, scrollY);
        }
        return [Math.round(top), Math.round(scrollY)];
      });
      assert.ok(!(max >= before + min && end < before + min), `a ${dy}px notch was pulled back (${before} → ${max} → ${end})`);
      if (end >= before + min) return;
    }
    assert.fail(`a ${dy}px wheel notch did not move the page (${before})`);
  };
  const done = async () => {
    assert.deepEqual(await problems(), []);
    await context.close();
  };
  return { page, state, pinStart, span, offsetOf, jump, settled, stripClick, hoverCard, clickCard, centre, notch, done };
}
