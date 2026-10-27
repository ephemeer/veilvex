/**
 * The case arena (src/scripts/arena.ts + the global block of src/components/Cases.astro): the ring of neon
 * frames the Cases grid turns into with JS and motion on. Geometry at 1440 and 390 (15° / 17° steps, the
 * circular list), the grid fallback, the scroll mapping through dwell zones (the page is never moved by the
 * script; small steps, notches and flicks are kept), in-pin navigation (instant scroll, the ring eases),
 * the roving tab stop and ← / → / Home / End, pointer vs. keyboard clicks, the headline (settled swap, the
 * kind line's decode, hover preview), the drag, filters, frames that keep their content, the light, resize,
 * deep links, the sheet's flight, the loop fallback without ScrollTimeline, and a clean console / CSP.
 *
 * Test positioning uses `scrollTo({ behavior: 'instant' })`; user input (keys, wheel) scrolls the way the page
 * does — smoothly (html.is-loaded), nothing here forces `scroll-behavior: auto`.
 */
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { DESKTOP, LANG_PATHS, MOBILE, fixture, openPage } from './helpers.mjs';

const { ru } = await import('../../src/i18n/ru.ts');
const { en } = await import('../../src/i18n/en.ts');
const { az } = await import('../../src/i18n/az.ts');
const { de } = await import('../../src/i18n/de.ts');
const CONTENT = { ru, en, az, de };
const GLYPHS = '!$#%&*/=:;<>?{}~^_@';
const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)';

const f = fixture();
before(f.setup);
after(f.teardown);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const REDUCED = { ...DESKTOP, reducedMotion: 'reduce' };
/** detent() of arena.ts: around each integer the ring holds still for 45% of a segment, smoothstep between. */
const detent = (x) => {
  const k = Math.floor(x);
  const u = Math.min(1, Math.max(0, (x - k - 0.225) / 0.55));
  return k + u * u * (3 - 2 * u);
};

async function visit(path, options = DESKTOP, { js = true, init } = {}) {
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

describe('the arena is on with JS and motion, the grid otherwise', () => {
  test('1440: a pinned stage; 200×260 cards 15° apart on a radius of 840px, seen from 2800px; the turn is a scroll-linked animation; case 12 stands left of case 1; 11 frames in view', async () => {
    const v = await visit('/');
    await v.jump((await v.pinStart()) + 1);
    await v.settled();
    const s = await v.state();
    assert.equal(s.arena, true);
    assert.deepEqual([s.n, s.step, s.total, s.ticks, s.drive], ['12', '15', '12', 12, 'scroll']);
    const geo = await v.page.evaluate(() => {
      const root = document.querySelector('#cases');
      const stage = document.querySelector('.cases__stage');
      const grid = document.querySelector('.cases__grid');
      const mirrorRing = document.querySelector('.arena__mirror-ring');
      const card = (n) => document.querySelector(`#case-${n}`);
      const box = (n) => card(n).getBoundingClientRect();
      return {
        sticky: [getComputedStyle(stage).position, getComputedStyle(stage).top],
        stageH: stage.getBoundingClientRect().height,
        track: document.querySelector('.cases__track').getBoundingClientRect().height,
        perspective: getComputedStyle(document.querySelector('.arena__ring')).perspective,
        front: [box(1).width, box(1).height].map((x) => Math.round(x * 100) / 100),
        placed: [2, 12, 7].map((n) => card(n).style.transform),
        inline: [grid.style.transform, mirrorRing.style.transform],
        turn: [grid, mirrorRing].map((e) => e.getAnimations().map((a) => [a.timeline?.constructor?.name, a.effect.getKeyframes().length])),
        left12: box(12).right <= box(1).left,
        inView: [1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12].filter((n) => box(n).right > 0 && box(n).left < innerWidth).length,
        edges: [box(8).left, box(6).right],
        ghosts: [...document.querySelectorAll('.arena__ghost')].map((g, i) => [g.querySelector('.arena__ghost-path') !== null, g.querySelector('.art') === null, g.style.transform === card(i + 1).style.transform]),
        hidden: ['.arena__mirror', '.arena__foot'].map((sel) => document.querySelector(sel).getAttribute('aria-hidden')),
        focusables: document.querySelectorAll('.arena__foot button, .arena__foot a, .arena__foot [tabindex]').length,
        rays: document.querySelectorAll('.arena__rays line').length,
        labels: [...document.querySelectorAll('.arena__label')].map((l) => l.textContent),
        svgText: [...new Set([...grid.querySelectorAll('.art text')].map((t) => getComputedStyle(t).display))],
        reveal: card(1).classList.contains('reveal'),
        collapsed: root.classList.contains('is-collapsed'),
        front1: [getComputedStyle(card(1).querySelector('.case__art')).opacity, getComputedStyle(card(1).querySelector('.case__body')).opacity],
        side2: [getComputedStyle(card(2).querySelector('.case__art')).opacity, getComputedStyle(card(2).querySelector('.case__body')).opacity],
      };
    });
    assert.deepEqual(geo.sticky, ['sticky', '64px']);
    assert.equal(geo.stageH, 900 - 64, 'the stage is the viewport below the header');
    assert.equal(geo.track, 11 * 180, 'the stage travels 180px per case');
    assert.equal(geo.perspective, '2800px');
    assert.deepEqual(geo.front, [200, 260], 'the front card is unscaled (z = 0)');
    assert.deepEqual(geo.placed, ['rotateY(15deg) translateZ(840px)', 'rotateY(-15deg) translateZ(840px)', 'rotateY(-90deg) translateZ(840px)'], 'static slots; case 12 wraps to the left, case 7 is edge-on at the back');
    assert.deepEqual(geo.inline, ['', ''], 'the turn is never an inline style');
    assert.deepEqual(geo.turn, [[['ScrollTimeline', 24]], [['ScrollTimeline', 24]]], 'one scroll-linked animation per container, a plateau per card');
    assert.equal(geo.left12, true, 'case 12 stands left of case 1');
    assert.equal(geo.inView, 11, '11 frames in view');
    assert.ok(geo.edges[0] < 150 && geo.edges[1] > 1440 - 150, `the outermost frames reach the viewport edges: ${geo.edges}`);
    assert.equal(geo.ghosts.length, 12);
    assert.ok(geo.ghosts.every((g) => g.every(Boolean)), 'every stand-in is a frame path (no art clone) on its card\'s slot');
    assert.deepEqual(geo.hidden, ['true', 'true'], 'the reflection and the headline/pager foot are decorative');
    assert.equal(geo.focusables, 0, 'nothing in the foot takes focus');
    assert.equal(geo.rays, 10, '7 rays and 3 ceiling lines');
    assert.deepEqual(geo.labels, ['95', '< $1', '80', '25 y', '#1'], 'the art labels are HTML in the ring');
    assert.deepEqual(geo.svgText, ['none'], 'and the SVG text steps aside');
    assert.equal(geo.reveal, false, 'the arena enters as one object (no per-card reveal)');
    assert.equal(geo.collapsed, false, 'the phone "show all" state is irrelevant in the arena');
    assert.deepEqual(geo.front1, ['1', '1'], 'the front card shows its art and text');
    assert.deepEqual(geo.side2, ['0.5', '0'], 'a side card: art dimmed, text hidden');
    assert.deepEqual([s.lit, s.litGhosts, s.stops], [['case-1'], 1, ['1']], 'one lit card, one lit reflection, one tab stop');
    assert.equal(s.overflow, 0);
    await v.done();
  });

  test('390: 150×200 cards 17° apart on a radius of 570px, seen from 1900px; the neighbours are cut by the screen edges; the strip is a 44px target', async () => {
    const v = await visit('/', MOBILE);
    await v.jump((await v.pinStart()) + 1);
    await v.settled();
    const s = await v.state();
    assert.deepEqual([s.arena, s.step], [true, '17']);
    const geo = await v.page.evaluate(() => ({
      front: [document.querySelector('#case-1').getBoundingClientRect().width, document.querySelector('#case-1').getBoundingClientRect().height],
      placed: document.querySelector('#case-2').style.transform,
      perspective: getComputedStyle(document.querySelector('.arena__ring')).perspective,
      cut: [document.querySelector('#case-12').getBoundingClientRect().left, document.querySelector('#case-2').getBoundingClientRect().right],
      facts: [...document.querySelectorAll('.case.is-active .case__fact')].map((e) => getComputedStyle(e).display),
      clip: [getComputedStyle(document.querySelector('.arena__scene')).overflowX, document.querySelector('.arena__scene').getBoundingClientRect().width],
    }));
    assert.deepEqual(geo.front.map(Math.round), [150, 200]);
    assert.equal(geo.placed, 'rotateY(17deg) translateZ(570px)');
    assert.equal(geo.perspective, '1900px');
    assert.ok(geo.cut[0] < 0 && geo.cut[1] > 390, `both neighbours run off the screen: ${geo.cut}`);
    assert.deepEqual(geo.facts, ['grid', 'grid', 'none'], 'two fact rows fit the small art');
    assert.deepEqual(geo.clip, ['clip', 390], 'the scene bleeds to the viewport edges and clips there');
    assert.equal(s.overflow, 0, 'no horizontal page overflow');
    assert.ok(s.strip.h >= 44, `the tick strip is a 44px target (${s.strip.h})`);
    assert.ok(s.headline.y >= s.ring.bottom, `the headline (${s.headline.y}) sits below the ring (${s.ring.bottom})`);
    assert.ok(s.pager.y >= s.headline.bottom - 1, `the pager (${s.pager.y}) sits below the headline (${s.headline.bottom})`);
    assert.ok(s.pager.bottom <= s.stage.bottom, 'everything fits the pinned stage');
    await v.done();
  });

  test('reduced motion, JS off and a window too short for the stage (720×450): the grid, untouched', async () => {
    for (const [label, options, js] of [
      ['reduced motion', REDUCED, true],
      ['no JS', DESKTOP, false],
      ['reduced motion, phone', { ...MOBILE, reducedMotion: 'reduce' }, true],
      ['720×450', { viewport: { width: 720, height: 450 } }, true],
    ]) {
      const v = await visit('/', options, { js });
      const g = await v.page.evaluate(() => ({
        arena: document.querySelector('.cases__grid').classList.contains('is-arena'),
        rootArena: document.querySelector('#cases').classList.contains('is-arena'),
        chrome: document.querySelectorAll('.arena, .arena__mirror, [data-arena-headline], .arena__rays, .arena__label').length,
        display: getComputedStyle(document.querySelector('.cases__grid')).display,
        sticky: getComputedStyle(document.querySelector('.cases__stage')).position,
        track: document.querySelector('.cases__track').getBoundingClientRect().height,
        transform: getComputedStyle(document.querySelector('#case-1')).transform,
        text: getComputedStyle(document.querySelector('#case-2 .art text')).display !== 'none',
      }));
      assert.deepEqual(g, { arena: false, rootArena: false, chrome: 0, display: 'grid', sticky: 'static', track: 0, transform: 'none', text: true }, label);
      if (js) assert.equal(await v.page.$eval('#cases', (el) => el.dataset.arena), 'off', label);
      await v.done();
    }
  });
});

describe('the scroll drives the ring', () => {
  test('progress → index through the dwell zones: a card holds over a plateau, between two the ring rests where the scroll puts it; the script never moves the page; past the end the stage lets go', async () => {
    const v = await visit('/');
    const y0 = await v.pinStart();
    const span = await v.span();
    await v.jump(y0 - 300);
    await v.settled();
    let s = await v.state();
    assert.deepEqual([s.p, s.active, s.count, s.title], ['0.000', 1, '01', ru.cases.items[0].title]);
    assert.ok(s.stage.y > 64, 'not pinned yet');
    await v.jump(await v.offsetOf(3)); // case 4
    await v.settled();
    s = await v.state();
    assert.deepEqual([s.p, s.active, s.count, s.total, s.title, s.kind], ['3.000', 4, '04', '12', ru.cases.items[3].title, `${ru.cases.items[3].kind} · ${ru.cases.items[3].tags}`]);
    assert.equal(s.stage.y, 64, 'the stage is pinned under the header');
    assert.ok(Math.abs(s.activeCard.x + s.activeCard.w / 2 - 720) < 1.5, 'the front card faces the viewer, centred');
    assert.deepEqual([s.activeCard.w, s.activeCard.h].map(Math.round), [200, 260]);
    assert.deepEqual([s.lit, s.stops], [['case-4'], ['4']]);
    // a 40px nudge stays on the plateau: the same card, the ring does not move
    await v.jump((await v.offsetOf(3)) + 40);
    await v.settled();
    s = await v.state();
    assert.deepEqual([s.p, s.active], ['3.000', 4], 'a nudge inside the dwell zone keeps the front card');
    // between cards 7 and 8 (raw 6.3): the ring rests at detent(6.3), the page stays where it is
    const y63 = Math.round(y0 + (span * 6.3) / 11);
    await v.jump(y63);
    await v.settled();
    await sleep(500);
    s = await v.state();
    const raw = ((y63 - y0) / span) * 11;
    assert.ok(Math.abs(Number(s.p) - detent(raw)) < 0.005, `the ring rests at detent(${raw.toFixed(3)}) = ${detent(raw).toFixed(3)} (p = ${s.p})`);
    assert.deepEqual([s.active, s.scrollY], [7, y63], 'the page was not moved');
    // past the end: the last card, the stage released
    await v.jump(y0 + span + 400);
    await v.settled();
    s = await v.state();
    assert.deepEqual([s.p, s.active], ['11.000', 12]);
    assert.ok(s.stage.y < 64, 'the stage scrolls away after the last card');
    await v.done();
  });

  test('small steps are never undone (smooth scrolling): ArrowDown walks into the pin, through it and out into Pricing; 53px wheel notches move on', async () => {
    const v = await visit('/');
    const y0 = await v.pinStart();
    const span = await v.span();
    await v.jump(y0 + 2);
    await v.settled();
    await v.page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
    let prev = (await v.state()).scrollY;
    for (let i = 0; i < 6; i++) {
      await v.page.keyboard.press('ArrowDown');
      await sleep(400);
      const y = (await v.state()).scrollY;
      assert.ok(y > prev, `ArrowDown ${i + 1}: the page moved down and stayed (${prev} → ${y})`);
      prev = y;
    }
    // from the last card out of the pin: the stage lets go and Pricing comes into view
    await v.jump(y0 + span - 80);
    await v.settled();
    prev = (await v.state()).scrollY;
    for (let i = 0; i < 12; i++) {
      await v.page.keyboard.press('ArrowDown');
      await sleep(300);
      const y = (await v.state()).scrollY;
      assert.ok(y > prev, `ArrowDown at the end ${i + 1}: (${prev} → ${y})`);
      prev = y;
    }
    await v.settled();
    const out = await v.page.evaluate(() => [document.querySelector('.cases__stage').getBoundingClientRect().top, document.querySelector('#pricing').getBoundingClientRect().top, innerHeight]);
    assert.ok(out[0] < 64, `the stage has been let go (${out[0]})`);
    assert.ok(out[1] < out[2], `Pricing is in view (${out[1]})`);
    assert.equal((await v.state()).active, 12);
    // 53px wheel notches over the ring, from the start of the pin
    await v.jump(y0 + 2);
    await v.settled();
    const [cx, cy] = await v.centre(1);
    await v.page.mouse.move(cx, cy);
    for (let i = 0; i < 10; i++) await v.notch(53, 45);
    await v.done();
  });

  test('a trackpad-like flick (many small deltas) is never pulled back; with the "ads" filter (3 cards, a 360px track) 100px notches still walk the arc', async () => {
    const v = await visit('/');
    const y0 = await v.pinStart();
    await v.jump(y0 + 2);
    await v.settled();
    const [cx, cy] = await v.centre(1);
    await v.page.mouse.move(cx, cy);
    const start = (await v.state()).scrollY;
    for (let i = 0; i < 30; i++) {
      await v.page.mouse.wheel(0, 9);
      await sleep(16);
    }
    const trail = [];
    for (let i = 0; i < 24; i++) {
      trail.push((await v.state()).scrollY);
      await sleep(50);
    }
    assert.ok(trail.every((y, i) => i === 0 || y >= trail[i - 1]), `never pulled back: ${trail.join(' ')}`);
    assert.ok(trail[trail.length - 1] >= start + 250, `the flick is kept (${start} → ${trail[trail.length - 1]})`);
    await v.settled();
    // the "ads" filter: 3 cards on a 360px track
    await v.jump(await v.offsetOf(3)); // case 4, an ads case
    await v.settled();
    await v.page.$eval('[data-filter="ads"]', (b) => b.click());
    await v.page.waitForFunction(() => document.querySelector('#case-1').hidden, null, { timeout: 3000 });
    await v.settled();
    assert.equal(await v.span(), 360);
    await v.jump((await v.pinStart()) + 1);
    await v.settled();
    await v.page.mouse.move(720, (await v.state()).ring.y + 100);
    for (let i = 0; i < 3; i++) await v.notch(100, 90);
    await v.settled();
    assert.equal((await v.state()).active, 7, 'the last ads case at the front');
    await v.done();
  });

  test('without ScrollTimeline the loop drives the same ring: the shown index trails the scroll with inertia and rests on the card', async () => {
    const v = await visit('/', DESKTOP, { init: () => delete window.ScrollTimeline });
    const y0 = await v.pinStart();
    await v.jump(y0 + 1);
    await v.settled();
    let s = await v.state();
    assert.deepEqual([s.drive, s.active, s.p], ['loop', 1, '0.000']);
    const turn = await v.page.evaluate(() => [document.querySelector('.cases__grid').style.transform, document.querySelector('.cases__grid').getAnimations().map((a) => a.playState)]);
    assert.deepEqual(turn, ['', ['paused']], 'one paused animation per container, scrubbed by the loop');
    await v.jump(await v.offsetOf(5));
    await sleep(50);
    assert.equal((await v.state()).loop, 'live', 'the ring is still on its way');
    await v.settled();
    s = await v.state();
    assert.deepEqual([s.p, s.active, s.lit], ['5.000', 6, ['case-6']]);
    await v.stripClick(9);
    await v.settled();
    s = await v.state();
    assert.deepEqual([s.p, s.active, s.scrollY], ['9.000', 10, await v.offsetOf(9)]);
    await v.done();
  });
});

describe('navigation inside the pin is instant, the ring eases', () => {
  test('a strip click moves the page at once and the ring turns there; a pointer click on a side card turns to it, on the front card it opens the sheet; focus comes back to that card, now the tab stop', async () => {
    const v = await visit('/');
    await v.jump((await v.pinStart()) + 1);
    await v.settled();
    await v.stripClick(5);
    await sleep(40);
    let s = await v.state();
    assert.equal(s.scrollY, await v.offsetOf(5), 'the page jumped (instant) to case 6');
    assert.equal(s.loop, 'live', 'while the ring eases there');
    await v.settled();
    s = await v.state();
    assert.deepEqual([s.active, s.p, s.count], [6, '5.000', '06']);
    await v.clickCard(8); // two to the right
    await v.settled();
    s = await v.state();
    assert.deepEqual([s.active, s.sheetOpen, s.scrollY], [8, false, await v.offsetOf(7)]);
    await v.clickCard(8);
    await v.page.waitForSelector('[data-sheet].is-open', { state: 'attached', timeout: 3000 });
    s = await v.state();
    assert.deepEqual([s.sheetOpen, s.sheetCase, s.hash], [true, 8, '#case-8']);
    await v.page.keyboard.press('Escape');
    await v.page.waitForSelector('[data-sheet]', { state: 'hidden', timeout: 3000 });
    await v.settled();
    s = await v.state();
    assert.deepEqual([s.focus?.caseOpen, s.stops, s.active], ['8', ['8'], 8]);
    await v.done();
  });

  test('roving tab stop: Tab reaches the front card and leaves the ring; ← / → / Home / End move focus and ring together; ← from case 1 is case 12, the short way round', async () => {
    const v = await visit('/');
    await v.jump((await v.pinStart()) + 1);
    await v.settled();
    await v.page.focus('[data-filter="design"]');
    await v.page.keyboard.press('Tab');
    assert.equal((await v.state()).focus?.caseOpen, '1', 'Tab from the filters lands on the front card');
    await v.page.keyboard.press('Tab');
    assert.equal((await v.state()).focus?.inGrid, false, 'the next Tab leaves the ring');
    await v.page.keyboard.press('Shift+Tab');
    assert.equal((await v.state()).focus?.caseOpen, '1');
    await v.page.keyboard.press('ArrowRight');
    let s = await v.state();
    assert.deepEqual([s.focus?.caseOpen, s.stops], ['2', ['2']]);
    await v.settled();
    assert.equal((await v.state()).active, 2);
    await v.page.keyboard.press('End');
    await v.settled();
    s = await v.state();
    assert.deepEqual([s.active, s.focus?.caseOpen], [12, '12']);
    await v.page.keyboard.press('Home');
    await v.settled();
    s = await v.state();
    assert.deepEqual([s.active, s.focus?.caseOpen], [1, '1']);
    // ← from case 1: the ring turns one step to case 12, through no other card
    const seen = v.page.evaluate(
      () =>
        new Promise((resolve) => {
          const g = document.querySelector('.cases__grid');
          const out = new Set();
          const t0 = performance.now();
          const tick = () => {
            out.add(g.dataset.arenaActive);
            if (performance.now() - t0 > 1500) resolve([...out]);
            else requestAnimationFrame(tick);
          };
          tick();
        }),
    );
    await v.page.keyboard.press('ArrowLeft');
    const fronts = await seen;
    assert.ok(fronts.includes('12') && fronts.every((x) => x === '1' || x === '12'), `the short way round: ${fronts}`);
    await v.settled();
    s = await v.state();
    assert.deepEqual([s.active, s.focus?.caseOpen, s.stops], [12, '12', ['12']]);
    await v.done();
  });

  test('a click without a pointer (detail 0: keyboard, assistive tech) on a side card opens its sheet; the ring turns behind it', async () => {
    const v = await visit('/');
    await v.jump((await v.pinStart()) + 1);
    await v.settled();
    await v.page.$eval('#case-5 .case__open', (b) => b.click());
    await v.page.waitForSelector('[data-sheet].is-open', { state: 'attached', timeout: 3000 });
    assert.equal((await v.state()).sheetCase, 5);
    await v.page.keyboard.press('Escape');
    await v.page.waitForSelector('[data-sheet]', { state: 'hidden', timeout: 3000 });
    await v.settled();
    const s = await v.state();
    assert.deepEqual([s.active, s.focus?.caseOpen, s.stops], [5, '5', ['5']]);
    await v.done();
  });

  test('focus that does not come from a pointer (assistive tech) brings its card to the front', async () => {
    const v = await visit('/');
    await v.jump((await v.pinStart()) + 1);
    await v.settled();
    await v.page.focus('#case-5 .case__open');
    await v.settled();
    const s = await v.state();
    assert.deepEqual([s.active, s.focus?.caseOpen, s.stops, s.scrollY], [5, '5', ['5'], await v.offsetOf(4)]);
    await v.done();
  });
});

describe('the headline', () => {
  test('swaps once the ring settles on a new card — one 200ms fade + 8px rise, never blank on the way; the title is set (no decode), the mono kind line decodes once', async () => {
    const v = await visit('/');
    await v.jump((await v.pinStart()) + 1);
    await v.settled();
    const rec = v.page.evaluate(
      () =>
        new Promise((resolve) => {
          const title = document.querySelector('[data-arena-title]');
          const kind = document.querySelector('[data-arena-kind]');
          const line = document.querySelector('[data-arena-line]');
          const g = document.querySelector('.cases__grid');
          const out = [];
          const t0 = performance.now();
          const tick = () => {
            out.push({
              title: title.textContent,
              tdec: title.dataset.decode ?? '',
              kind: (kind.querySelector('[aria-hidden]') ?? kind).textContent,
              kdec: kind.dataset.decode ?? '',
              loop: g.dataset.arenaLoop,
              anims: line.getAnimations().map((a) => [a.effect.getTiming().duration, a.effect.getTiming().easing, a.effect.getKeyframes().map((k) => [k.opacity, k.transform])]),
            });
            if (performance.now() - t0 > 2500) resolve(out);
            else requestAnimationFrame(tick);
          };
          tick();
        }),
    );
    await v.stripClick(7);
    const frames = await rec;
    await v.settled();
    const t1 = ru.cases.items[0].title;
    const t8 = ru.cases.items[7].title;
    assert.ok(frames.every((fr) => fr.title === t1 || fr.title === t8), 'never blank, never anything else');
    const swap = frames.findIndex((fr) => fr.title === t8);
    assert.ok(swap > 0, 'the old title holds while the ring travels');
    assert.equal(frames[swap].loop, 'idle', 'the swap comes with the settle');
    assert.ok(frames.every((fr) => fr.tdec === ''), 'the proportional title is never decoded');
    const anim = frames.slice(swap).find((fr) => fr.anims.length)?.anims;
    assert.deepEqual(anim, [[200, EASE_OUT, [['0', 'translateY(8px)'], ['1', 'none']]]], 'one 200ms fade + 8px rise');
    const kindTarget = `${ru.cases.items[7].kind} · ${ru.cases.items[7].tags}`;
    const cipher = frames.filter((fr) => fr.kdec === 'on' && fr.kind !== kindTarget);
    assert.ok(cipher.length >= 3, `the kind line decodes after the swap (${cipher.length} cipher frames)`);
    for (const fr of cipher) assert.ok([...fr.kind].every((c, i) => c === kindTarget[i] || GLYPHS.includes(c)), `only the line's characters or cipher glyphs: ${fr.kind}`);
    assert.ok(frames.slice(0, swap).every((fr) => fr.kdec !== 'on'), 'no decode while travelling');
    const s = await v.state();
    assert.deepEqual([s.title, s.kind], [t8, kindTarget]);
    assert.deepEqual(await v.page.$eval('[data-arena-kind]', (el) => [el.dataset.decode ?? '', getComputedStyle(el).textTransform]), ['', 'uppercase']);
    await v.done();
  });

  test('a real pointer move over a side card previews its headline at once; scrolling with the pointer resting over a side card keeps the front card\'s headline', async () => {
    const v = await visit('/');
    await v.jump(await v.offsetOf(2)); // case 3
    await v.settled();
    await v.hoverCard(4);
    await v.page.waitForFunction((t) => document.querySelector('[data-arena-title]').textContent === t, ru.cases.items[3].title, { timeout: 2000 });
    let s = await v.state();
    assert.deepEqual([s.hovered, s.active], [['case-4'], 3], 'a preview, the front card unchanged');
    await v.page.mouse.move(5, 5);
    await v.page.waitForFunction((t) => document.querySelector('[data-arena-title]').textContent === t, ru.cases.items[2].title, { timeout: 2000 });
    // the pointer comes to rest over a side card, then the wheel turns the ring under it
    await v.hoverCard(5);
    await v.page.waitForFunction((t) => document.querySelector('[data-arena-title]').textContent === t, ru.cases.items[4].title, { timeout: 2000 });
    await v.page.mouse.wheel(0, 180);
    await sleep(120);
    s = await v.state();
    assert.deepEqual(s.hovered, [], 'the preview ends as soon as the ring moves');
    await v.settled();
    await sleep(300);
    s = await v.state();
    assert.equal(s.title, ru.cases.items[s.active - 1].title, `the headline is the front card's (${s.active})`);
    assert.deepEqual(s.hovered, [], 'cards sliding under a resting pointer are not a hover');
    await v.done();
  });

  test('the decode can be switched off for tests (.is-no-decode): the kind line is simply set', async () => {
    const v = await visit('/');
    await v.page.evaluate(() => document.querySelector('#cases').classList.add('is-no-decode'));
    await v.jump(await v.offsetOf(3));
    await v.settled();
    assert.equal(await v.page.$eval('[data-arena-kind]', (el) => `${el.textContent}|${el.dataset.decode ?? ''}|${el.children.length}`), `${ru.cases.items[3].kind} · ${ru.cases.items[3].tags}||0`);
    await v.done();
  });
});

describe('drag', () => {
  test('a horizontal drag turns the ring (1 case per 120px) and never moves the page; the release lands on a card with one instant scroll; the click after a drag does not open the sheet', async () => {
    const v = await visit('/');
    await v.jump(await v.offsetOf(2)); // case 3
    await v.settled();
    const s0 = await v.state();
    const cy = s0.ring.y + s0.ring.h / 2;
    await v.page.mouse.move(720, cy);
    await v.page.mouse.down();
    const during = [];
    for (let i = 1; i <= 10; i++) {
      await v.page.mouse.move(720 - i * 25, cy + (i % 2), { steps: 1 });
      await sleep(16);
      during.push((await v.state()).scrollY);
    }
    assert.ok(during.every((y) => y === s0.scrollY), `the page never moves during a drag: ${[...new Set(during)]}`);
    const mid = await v.state();
    assert.ok(mid.active >= 4, `the ring follows the pointer (front ${mid.active})`);
    assert.equal(await v.page.$eval('.cases__grid', (g) => g.classList.contains('is-dragging')), true);
    await v.page.mouse.up();
    await v.settled();
    const s1 = await v.state();
    assert.ok(s1.active >= 5 && s1.active <= 6, `250px of drag moved ~2 cases (now at ${s1.active})`);
    assert.equal(s1.scrollY, await v.offsetOf(s1.active - 1), 'the page moved once, onto that card');
    assert.equal(s1.sheetOpen, false);
    await v.done();
  });

  test('before the pin a drag moves neither the ring nor the page', async () => {
    const v = await visit('/');
    await v.jump((await v.pinStart()) - 300);
    await v.settled();
    const s0 = await v.state();
    const cy = s0.ring.y + s0.ring.h / 2;
    await v.page.mouse.move(900, cy);
    await v.page.mouse.down();
    for (let i = 1; i <= 10; i++) {
      await v.page.mouse.move(900 - i * 30, cy, { steps: 1 });
      await sleep(16);
    }
    await v.page.mouse.up();
    await sleep(400);
    const s1 = await v.state();
    assert.deepEqual([s1.active, s1.scrollY], [1, s0.scrollY]);
    await v.done();
  });

  test('a phone drag turns the ring too; the scene keeps the vertical pan (touch-action: pan-y)', async () => {
    const v = await visit('/', MOBILE);
    await v.jump(await v.offsetOf(1));
    await v.settled();
    assert.equal(await v.page.$eval('.arena__scene', (el) => getComputedStyle(el).touchAction), 'pan-y');
    const s0 = await v.state();
    const cy = s0.ring.y + s0.ring.h / 2;
    await v.page.mouse.move(300, cy);
    await v.page.mouse.down();
    for (let i = 1; i <= 8; i++) {
      await v.page.mouse.move(300 - i * 30, cy, { steps: 1 });
      await sleep(16);
    }
    await v.page.mouse.up();
    await v.settled();
    assert.ok((await v.state()).active >= 3, 'the ring turned');
    await v.done();
  });
});

describe('filters rebuild the ring', () => {
  test('"ads": 3 cards on an open arc with the same 15° step and a 360px track, the front card kept, the survivors glide 300ms; "all" brings 12 back; one lit card and one lit reflection after each round trip', async () => {
    const v = await visit('/');
    await v.jump(await v.offsetOf(3)); // case 4 — an ads case
    await v.settled();
    await v.page.$eval('[data-filter="ads"]', (b) => b.click());
    await v.page.waitForFunction(() => document.querySelector('.cases__grid').classList.contains('is-reflow'), null, { timeout: 3000 });
    const glide = await v.page.$eval('#case-7', (c) => c.getAnimations().filter((a) => a.effect.getTiming().duration === 300).map((a) => a.effect.getTiming().easing));
    assert.deepEqual(glide, [EASE_OUT], 'the survivors glide 300ms ease-out');
    await v.page.waitForFunction(() => document.querySelector('#case-1').hidden, null, { timeout: 3000 });
    await v.settled();
    let s = await v.state();
    assert.deepEqual([s.n, s.step, s.total, s.ticks, s.count, s.active, s.p], ['3', '15', '03', 3, '02', 4, '1.000']);
    assert.equal(await v.span(), 360);
    assert.deepEqual([s.lit, s.litGhosts], [['case-4'], 1]);
    const placed = await v.page.$$eval('.case:not([hidden])', (els) => els.map((e) => [e.id, e.style.transform]));
    assert.deepEqual(placed, [
      ['case-2', 'rotateY(0deg) translateZ(840px)'],
      ['case-4', 'rotateY(15deg) translateZ(840px)'],
      ['case-7', 'rotateY(30deg) translateZ(840px)'],
    ]);
    await v.page.$eval('[data-filter="all"]', (b) => b.click());
    await v.page.waitForFunction(() => !document.querySelector('#case-1').hidden, null, { timeout: 3000 });
    await v.settled();
    s = await v.state();
    assert.deepEqual([s.n, s.total, s.ticks, s.active, s.lit, s.litGhosts], ['12', '12', 12, 4, ['case-4'], 1]);
    // a second round trip from case 7
    await v.jump(await v.offsetOf(6));
    await v.settled();
    for (const filter of ['ads', 'design', 'all']) {
      await v.page.$eval(`[data-filter="${filter}"]`, (b) => b.click());
      await sleep(400);
      await v.settled();
      s = await v.state();
      assert.equal(s.lit.length, 1, `${filter}: one card lit (${s.lit})`);
      assert.equal(s.litGhosts, 1, `${filter}: one lit reflection`);
      assert.equal(s.lit[0], `case-${s.active}`, `${filter}: the lit card is the front card`);
    }
    await v.done();
  });
});

describe('frames keep their content', () => {
  for (const [label, path, options] of [
    ['1440 RU', '/', DESKTOP],
    ['1440 DE', LANG_PATHS.de, DESKTOP],
    ['390 RU', '/', MOBILE],
    ['390 DE', LANG_PATHS.de, MOBILE],
  ]) {
    test(`${label}: every card's art and text stay inside its frame; the result keeps to two lines`, async () => {
      const v = await visit(path, options);
      await v.jump((await v.pinStart()) + 2);
      await v.settled();
      const spill = await v.page.$$eval('.cases__grid.is-arena > .case:not([hidden])', (els) =>
        els.flatMap((c) => {
          const out = [];
          const inner = c.clientWidth;
          for (const sel of ['.case__art', '.case__body', '.case__meta', '.case__title']) {
            const e = c.querySelector(sel);
            if (e && e.offsetWidth > inner + 0.5) out.push(`${c.id} ${sel} ${e.offsetWidth} > ${inner}`);
          }
          const r = c.querySelector('.case__result');
          if (r && getComputedStyle(r).display !== 'none') {
            const lh = parseFloat(getComputedStyle(r).lineHeight);
            if (r.offsetHeight > 2 * lh + 1) out.push(`${c.id} result ${r.offsetHeight}px > two lines (${2 * lh}px)`);
          }
          return out;
        }),
      );
      assert.deepEqual(spill, [], 'no card content wider than its frame, no third result line');
      await v.done();
    });
  }
});

describe('the light', () => {
  test('the rays span the viewport and converge on the beam at the top centre', async () => {
    for (const viewport of [{ width: 1440, height: 900 }, { width: 1920, height: 1080 }]) {
      const v = await visit('/', { viewport });
      await v.jump((await v.pinStart()) + 2);
      await v.settled();
      const [w, apex, beam] = await v.page.evaluate(() => {
        const r = document.querySelector('.arena__rays').getBoundingClientRect();
        const b = document.querySelector('.arena__beam').getBoundingClientRect();
        return [r.width, r.x + r.width * 0.5, b.x + b.width / 2];
      });
      assert.equal(Math.round(w), viewport.width, 'the rays are as wide as the viewport');
      assert.ok(Math.abs(apex - beam) <= 2, `apex ${apex.toFixed(1)} vs beam ${beam.toFixed(1)} at ${viewport.width}`);
      await v.done();
    }
  });
});

describe('resize', () => {
  test('a resize keeps the front card (the page is re-anchored on it), the stage stays pinned', async () => {
    const v = await visit('/');
    await v.jump(await v.offsetOf(5)); // case 6
    await v.settled();
    for (const size of [{ width: 1280, height: 800 }, { width: 1440, height: 900 }]) {
      await v.page.setViewportSize(size);
      await sleep(300);
      await v.settled();
      const s = await v.state();
      assert.deepEqual([s.active, s.p, s.stage.y, s.scrollY], [6, '5.000', 64, await v.offsetOf(5)], `${size.width}×${size.height}`);
    }
    await v.done();
  });
});

describe('deep links', () => {
  test('/#case-7 opens the sheet and brings the ring to 7 behind it; Esc returns focus to that card', async () => {
    const v = await visit('/#case-7');
    await v.page.waitForSelector('[data-sheet].is-open', { state: 'attached', timeout: 3000 });
    await v.settled();
    const s = await v.state();
    assert.deepEqual([s.sheetOpen, s.sheetCase, s.active, s.p, s.count], [true, 7, 7, '6.000', '07']);
    assert.equal(s.scrollY, await v.offsetOf(6));
    assert.ok(s.activeCard.y >= 0 && s.activeCard.bottom <= 900, 'the card is on screen behind the sheet');
    await v.page.keyboard.press('Escape');
    await v.page.waitForSelector('[data-sheet]', { state: 'hidden', timeout: 3000 });
    await v.settled();
    const after = await v.state();
    assert.deepEqual([after.active, after.focus?.caseOpen, after.stops], [7, '7', ['7']]);
    await v.done();
  });

  test('/#pricing: the arena is mounted before the page lands, so it lands on Pricing', async () => {
    const v = await visit('/#pricing');
    await sleep(600);
    const top = await v.page.$eval('#pricing', (el) => el.getBoundingClientRect().top);
    assert.equal(await v.page.$eval('#cases', (el) => el.dataset.arena), 'on');
    assert.ok(Math.abs(top) < 120, `Pricing is at the top of the viewport (${top})`);
    await v.done();
  });
});

describe('the sheet from the arena', () => {
  test('the art flies from the front card (its rect is exact at z = 0); the ring is where it was after close', async () => {
    const v = await visit('/');
    await v.jump((await v.pinStart()) + 1);
    await v.settled();
    await v.stripClick(4);
    await v.settled();
    const from = await v.page.$eval('#case-5 .case__art svg', (el) => el.getBoundingClientRect().toJSON());
    const start = await v.page.evaluate(() => {
      document.querySelector('#case-5 .case__open').click();
      const g = document.querySelector('.sheet__ghost');
      return g && { box: [g.style.left, g.style.top, g.style.width].map(parseFloat), frame: g.getAnimations()[0].effect.getKeyframes()[0].transform };
    });
    assert.ok(start, 'a ghost flies');
    const [tx, ty, sx] = start.frame.match(/-?[\d.]+/g).map(Number);
    assert.ok(Math.abs(start.box[0] + tx - from.x) < 1 && Math.abs(start.box[1] + ty - from.y) < 1 && Math.abs(start.box[2] * sx - from.width) < 1, 'the flight starts exactly at the card art');
    await v.page.waitForSelector('[data-sheet].is-open', { state: 'attached' });
    await v.page.waitForFunction(() => !document.querySelector('.sheet__ghost'), null, { timeout: 3000 });
    assert.equal((await v.state()).sheetCase, 5);
    await v.page.keyboard.press('Escape');
    await v.page.waitForSelector('[data-sheet]', { state: 'hidden', timeout: 3000 });
    await v.settled();
    const s = await v.state();
    assert.deepEqual([s.active, s.p], [5, '4.000']);
    await v.done();
  });
});

describe('clean console and CSP', () => {
  test('/, /en/, /az/ and /de/: pin, scroll through, strip, open — no errors, no violations; the headline follows the language', async () => {
    for (const [lang, path] of Object.entries(LANG_PATHS)) {
      const t = CONTENT[lang];
      const v = await visit(path);
      const y0 = await v.pinStart();
      const span = await v.span();
      for (let y = y0; y <= y0 + span; y += 360) {
        await v.jump(y);
        await sleep(120);
      }
      await v.jump(y0 + span);
      await v.settled();
      let s = await v.state();
      assert.deepEqual([s.active, s.title], [12, t.cases.items[11].title], lang);
      await v.stripClick(1);
      await v.settled();
      s = await v.state();
      assert.deepEqual([s.active, s.title, s.kind], [2, t.cases.items[1].title, `${t.cases.items[1].kind} · ${t.cases.items[1].tags}`], lang);
      await v.clickCard(2);
      await v.page.waitForSelector('[data-sheet].is-open', { state: 'attached', timeout: 3000 });
      assert.equal(await v.page.$eval('[data-sheet-case]:not([hidden]) .sheet__title', (el) => el.textContent.trim()), t.cases.items[1].title, lang);
      await v.page.keyboard.press('Escape');
      await v.page.waitForSelector('[data-sheet]', { state: 'hidden', timeout: 3000 });
      await v.done();
    }
  });
});
