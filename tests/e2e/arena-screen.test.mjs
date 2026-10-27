/**
 * The case arena (src/scripts/arena.ts), what reaches the screen and where the ring comes to rest. The turn that
 * follows the scroll and the offset (a programmatic move, the drag, the settle) live on separate boxes — on one
 * element Chrome computes the main thread's animation but paints only the compositor's scroll-linked one — and
 * CDP screencast frames of a strip jump and a drag show the ring turning frame by frame on both drives. Stopped
 * between two cards (ArrowDown steps, 53px notches, an instant jump while the ring was off screen) the ring alone
 * eases onto the nearer card and the page stays where the input put it.
 */
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { DESKTOP, MOBILE, fixture } from './helpers.mjs';
import { detent, sleep, visitor } from './arena-helpers.mjs';

const { ru } = await import('../../src/i18n/ru.ts');

const f = fixture();
before(f.setup);
after(f.teardown);
const visit = visitor(f);

describe('stopped between two cards, the ring comes to rest on the nearer one', () => {
  test('stopped between two cards (ArrowDown steps, 53px notches), the ring alone eases onto the nearer card: centred within 2px, the counter and headline on it, the page left where the input put it', async () => {
    const v = await visit('/');
    const y0 = await v.pinStart();
    const span = await v.span();
    // every scroll event, timed: the input's own (smooth) scroll runs frame after frame; a scroll after a pause
    // (the 200ms idle that starts the settle) would be the script moving the page
    await v.page.evaluate(() => {
      window.__ys = [];
      addEventListener('scroll', () => window.__ys.push(performance.now()), { passive: true });
    });
    const from = async (y) => {
      await v.jump(y);
      await v.settled();
      await v.page.evaluate(() => (window.__ys.length = 0));
    };
    /** One input (sent once more if it never reached the page), its scroll, the settle; → where it stopped (raw index). */
    const stop = async (label, send) => {
      for (let attempt = 0; ; attempt++) {
        await send();
        const moved = await v.page.waitForFunction(() => window.__ys.length > 0, null, { timeout: 1500 }).then(() => true, () => false);
        if (moved) break;
        assert.ok(attempt < 1, `${label}: the input did not move the page`);
      }
      await v.page.waitForFunction(() => performance.now() - window.__ys[window.__ys.length - 1] > 250, null, { timeout: 4000, polling: 50 });
      await sleep(600); // the settle: 300ms
      await v.settled();
      const ts = await v.page.evaluate(() => window.__ys.splice(0));
      const pause = Math.max(0, ...ts.slice(1).map((t, i) => t - ts[i]));
      assert.ok(pause < 190, `${label}: the page moved once, in one go (a ${pause.toFixed(0)}ms pause between two scroll events)`);
      const s = await v.state();
      const raw = ((s.scrollY - y0) / span) * 11;
      // the nearer card (either one within a hair of the midpoint, where sub-pixel measures may round either way)
      const d = detent(raw);
      const near = Math.abs(d - Math.floor(d) - 0.5) < 0.02 ? [Math.floor(d) + 1, Math.floor(d) + 2] : [Math.round(d) + 1];
      assert.ok(near.includes(s.active), `${label} (raw ${raw.toFixed(3)}): settled on case ${s.active}, expected ${near.join(' or ')}`);
      const card = s.active;
      assert.deepEqual([s.p, s.count, s.lit, s.title], [`${card - 1}.000`, String(card).padStart(2, '0'), [`case-${card}`], ru.cases.items[card - 1].title], `${label}: the counter and the headline follow case ${card}`);
      const x = s.activeCard.x + s.activeCard.w / 2;
      assert.ok(Math.abs(x - 720) <= 2, `${label} (raw ${raw.toFixed(3)}): the front card is centred (${x.toFixed(1)})`);
      return raw;
    };
    /** The stops off the plateaus (the dwell zone: 0.225 either side of a card), where the settle has work to do. */
    const between = (raws) => raws.filter((r) => Math.abs(r - Math.round(r)) > 0.235).length;
    await from(y0 + 30);
    await v.page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
    let raws = [];
    for (let i = 1; i <= 5; i++) raws.push(await stop(`ArrowDown ${i}`, () => v.page.keyboard.press('ArrowDown')));
    assert.ok(between(raws) >= 3, `the ArrowDown stops fell between two cards (≥ 3): ${raws.map((r) => r.toFixed(3)).join(' ')}`);
    await from(y0 + 30);
    const [cx, cy] = await v.centre(1);
    await v.page.mouse.move(cx, cy);
    raws = [];
    for (let i = 1; i <= 5; i++) raws.push(await stop(`53px notch ${i}`, () => v.page.mouse.wheel(0, 53)));
    assert.ok(between(raws) >= 3, `the notch stops fell between two cards (≥ 3): ${raws.map((r) => r.toFixed(3)).join(' ')}`);
    await v.done();
  });

  test('an instant jump from the top of the page to between two cards (the ring off screen until then) settles on the nearer card too — 1440 and 390', async () => {
    for (const vp of [DESKTOP, MOBILE]) {
      const v = await visit('/', vp);
      await v.jump(0);
      await v.settled();
      const y = Math.round((await v.pinStart()) + ((await v.span()) * 3.6) / 11); // detent(3.6) ≈ 3.76: case 5
      await v.jump(y);
      await sleep(700);
      await v.settled();
      const s = await v.state();
      const [x, mid] = [s.activeCard.x + s.activeCard.w / 2, vp.viewport.width / 2];
      assert.deepEqual([s.p, s.active, s.count, s.scrollY], ['4.000', 5, '05', y], `${vp.viewport.width}: settled on case 5, the page where it was put`);
      assert.ok(Math.abs(x - mid) <= 2, `${vp.viewport.width}: the front card is centred (${x.toFixed(1)})`);
      await v.done();
    }
  });
});

describe('what reaches the screen', () => {
  /**
   * The elements that carry a scroll-linked animation, those of them that run any other transform animation as
   * well (there the compositor paints the scroll-linked turn only — the other is computed, never painted), and the
   * arena's elements with a paused (main-thread) transform animation: the offset.
   */
  const turning = (page) =>
    page.evaluate(() => {
      const moves = (a) => !a.effect.pseudoElement && a.effect.getKeyframes().some((k) => ['transform', 'translate', 'rotate', 'scale'].some((p) => p in k));
      const linked = (a) => a.timeline?.constructor?.name === 'ScrollTimeline';
      const name = (e) => ['arena__turn', 'arena__mirror-turn', 'cases__grid', 'arena__mirror-ring'].find((c) => e.classList.contains(c)) ?? e.getAttribute('class');
      const by = new Map();
      for (const a of document.getAnimations()) {
        const e = a.effect?.target;
        if (e) by.set(e, [...(by.get(e) ?? []), a]);
      }
      const all = [...by];
      return {
        linked: all.filter(([, list]) => list.some(linked)).map(([e]) => name(e)),
        mixed: all.filter(([, list]) => list.some(linked) && list.filter(moves).length > 1).map(([e]) => name(e)),
        offset: all.filter(([e, list]) => e.closest('#cases') && list.some((a) => !linked(a) && moves(a) && a.playState === 'paused')).map(([e]) => name(e)),
      };
    });
  const OUTER = ['arena__turn', 'arena__mirror-turn'];
  const INNER = ['cases__grid', 'arena__mirror-ring'];

  test('the scroll-linked turn and the offset never share an element: at rest, during a strip jump, a drag and the settle between two cards', async () => {
    const v = await visit('/');
    await v.jump((await v.pinStart()) + 1);
    await v.settled();
    assert.deepEqual(await turning(v.page), { linked: OUTER, mixed: [], offset: [] }, 'at rest on a card');
    await v.stripClick(6);
    await sleep(40);
    assert.deepEqual(await turning(v.page), { linked: OUTER, mixed: [], offset: INNER }, 'a strip jump: the offset turns the inner boxes');
    await v.settled();
    const s = await v.state();
    const cy = s.ring.y + s.ring.h / 2;
    await v.page.mouse.move(900, cy);
    await v.page.mouse.down();
    for (let i = 1; i <= 6; i++) {
      await v.page.mouse.move(900 - i * 20, cy);
      await sleep(16);
    }
    assert.deepEqual(await turning(v.page), { linked: OUTER, mixed: [], offset: INNER }, 'a drag');
    await v.page.mouse.up();
    await v.settled();
    await v.jump((await v.pinStart()) + ((await v.span()) * 6.3) / 11);
    await sleep(800);
    await v.settled();
    assert.equal((await v.state()).p, '6.000');
    assert.deepEqual(await turning(v.page), { linked: OUTER, mixed: [], offset: INNER }, 'settled between two cards');
    await v.done();
  });

  /** The front chord at 1440 (R 840, 15°): the distance between two neighbouring frames at the front. */
  const PITCH = 2 * 840 * Math.sin((7.5 * Math.PI) / 180);
  /**
   * CDP screencast of the page, on only while recording (encoding every frame is not free for the files running
   * alongside): record(act, tail) returns the frames (jpeg, base64) painted while act ran and tail ms after.
   */
  const screencast = async (page) => {
    const cdp = await page.context().newCDPSession(page);
    let frames = null;
    cdp.on('Page.screencastFrame', (f) => {
      frames?.push(f.data);
      cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {});
    });
    return {
      async record(act, tail) {
        await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 90, everyNthFrame: 1 });
        await sleep(150); // the picture as it stands comes first: not part of the recording
        frames = [];
        await act();
        await sleep(tail);
        const out = frames;
        frames = null;
        await cdp.send('Page.stopScreencast');
        return out;
      },
      stop: () => cdp.detach(),
    };
  };
  /**
   * Each frame → where two frames are painted, from the lime runs along the ring's top edge: `front`, the frame
   * nearest the centre (the ring's painted turn: it sweeps through positions while the ring turns, it stays put when
   * the ring jumps), and `lit`, the bright one (a side frame's border is too dim to pass) — null when there is none.
   * Decoded on a blank page of its own (the site's CSP allows no data: images).
   */
  const trace = (lab, band, frames) =>
    lab.evaluate(
      async ({ frames, band }) => {
        const out = { front: [], lit: [] };
        const cv = document.createElement('canvas');
        const ctx = cv.getContext('2d', { willReadFrequently: true });
        for (const f of frames) {
          const img = new Image();
          img.src = `data:image/jpeg;base64,${f}`;
          await img.decode();
          cv.width = img.width;
          cv.height = img.height;
          ctx.drawImage(img, 0, 0);
          const scale = img.width / band.vw;
          const h = Math.round(9 * scale);
          const d = ctx.getImageData(0, Math.max(0, Math.round((band.top - 4) * scale)), img.width, h).data;
          const g = [];
          const gb = [];
          for (let x = 0; x < img.width; x++) {
            g[x] = 0;
            gb[x] = -255;
            for (let y = 0; y < h; y++) {
              const i = (y * img.width + x) * 4;
              g[x] = Math.max(g[x], d[i + 1]);
              gb[x] = Math.max(gb[x], d[i + 1] - d[i + 2]);
            }
          }
          /** The midpoints (CSS px) of the runs of at least 100px where the column passes (gaps up to 4px bridged). */
          const runs = (gMin, gbMin) => {
            const all = [];
            let run = null;
            for (let x = 0; x < img.width; x++) {
              if (g[x] < gMin || gb[x] < gbMin) continue;
              if (run && x - run[1] <= 4 * scale) run[1] = x;
              else all.push((run = [x, x]));
            }
            return all.filter(([a, b]) => b - a >= 100 * scale).map(([a, b]) => (a + b) / 2 / scale);
          };
          const near = (xs) => (xs.length ? xs.reduce((m, x) => (Math.abs(x - band.vw / 2) < Math.abs(m - band.vw / 2) ? x : m)) : null);
          out.front.push(near(runs(110, 25)));
          out.lit.push(near(runs(185, 40)));
        }
        return out;
      },
      { frames, band },
    );
  /**
   * The ring turns on screen: the front frame is painted in ≥ 4 positions on the way; the lit frame is painted at the
   * front (±0.6 card) and never moves more than a card from one frame to the next. → the front frame's small moves.
   */
  const judge = ({ front, lit }, label) => {
    const fmt = (xs) => xs.map((x) => (x === null ? '-' : Math.round(x))).join(' ');
    const f = front.filter((x) => x !== null);
    const l = lit.filter((x) => x !== null);
    const positions = new Set(f.filter((x) => Math.abs(x - 720) > 3).map((x) => Math.round(x / 4))).size;
    const off = Math.max(0, ...l.map((x) => Math.abs(x - 720))) / PITCH;
    const jump = Math.max(0, ...l.slice(1).map((x, i) => Math.abs(x - l[i]))) / PITCH;
    assert.ok(positions >= 4, `${label}: the front frame is painted in ${positions} positions on the way (≥ 4): ${fmt(front)}`);
    assert.ok(off <= 0.6, `${label}: the lit frame is painted at the front, within 0.6 card (${off.toFixed(2)}): ${fmt(lit)}`);
    assert.ok(jump <= 1.05, `${label}: the lit frame never moves more than a card a frame (${jump.toFixed(2)}): ${fmt(lit)}`);
    return f.slice(1).filter((x, i) => Math.abs(x - f[i]) > 3 && Math.abs(x - f[i]) < 0.6 * PITCH).length;
  };

  for (const drive of ['scroll', 'loop']) {
    test(`painted (CDP screencast, the ${drive} drive): a strip jump over 6 cards and a 300px drag turn the ring on screen frame by frame — during the drag before the release`, async () => {
      const v = await visit('/', DESKTOP, drive === 'loop' ? { init: () => delete window.ScrollTimeline } : {});
      assert.equal((await v.state()).drive, drive);
      const cast = await screencast(v.page);
      const lab = await (await f.state.browser.newContext()).newPage();
      try {
        // the strip, 1 → 7; a capture too sparse to judge (a loaded machine) is taken once more
        let frames = [];
        let band = null;
        for (let attempt = 0; attempt < 2 && frames.length < 12; attempt++) {
          await v.jump((await v.pinStart()) + 1);
          await v.settled();
          band = await v.page.evaluate(() => ({ top: document.querySelector('.arena__ring').getBoundingClientRect().top, vw: innerWidth }));
          frames = await cast.record(() => v.stripClick(6), 1300);
        }
        judge(await trace(lab, band, frames), 'the strip jump');
        await v.settled();
        // a 300px drag, the pointer held down
        const cy = band.top + (await v.state()).ring.h / 2;
        await v.page.mouse.move(900, cy);
        await v.page.mouse.down();
        frames = await cast.record(async () => {
          for (let i = 1; i <= 30; i++) {
            await v.page.mouse.move(900 - i * 10, cy);
            await sleep(25);
          }
        }, 200);
        await v.page.mouse.up();
        const moves = judge(await trace(lab, band, frames), 'the drag');
        assert.ok(moves >= 4, `the ring turns on screen while the pointer is down (${moves} small moves)`);
        await v.settled();
      } finally {
        await cast.stop();
        await lab.context().close();
      }
      await v.done();
    });
  }
});
