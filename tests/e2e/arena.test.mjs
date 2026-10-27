/**
 * The case arena (src/scripts/arena.ts + the global block of src/components/Cases.astro): the ring of neon
 * frames the Cases grid turns into with JS and motion on. Presence and geometry at 1440 and 390, the grid
 * fallback (reduced motion, JS off), the pinned scroll driving the ring (progress → index, `--p` settling,
 * the idle snap), ticks and ← / →, the decoded headline, the drag, a side-card click vs the active-card
 * click (sheet), the filter rebuild, the #case-N deep link, the reflection, and a clean console / CSP in
 * every language.
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
const SPAN = Math.max(1600, 12 * 180); // 180px of scroll per case

const f = fixture();
before(f.setup);
after(f.teardown);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const REDUCED = { ...DESKTOP, reducedMotion: 'reduce' };

async function visit(path, options = DESKTOP, { js = true } = {}) {
  const context = await f.state.browser.newContext({ ...options, javaScriptEnabled: js });
  const { page, problems } = await openPage(context);
  await page.goto(f.state.base + path, { waitUntil: 'networkidle' });
  if (js) await page.evaluate(() => (document.documentElement.style.scrollBehavior = 'auto'));
  const state = () =>
    page.evaluate(() => {
      const g = document.querySelector('.cases__grid');
      const cs = getComputedStyle(g);
      const r = (sel) => {
        const e = document.querySelector(sel);
        if (!e) return null;
        const b = e.getBoundingClientRect();
        return { x: b.x, y: b.y, w: b.width, h: b.height, bottom: b.bottom, right: b.right };
      };
      return {
        arena: g.classList.contains('is-arena'),
        p: cs.getPropertyValue('--p').trim(),
        n: cs.getPropertyValue('--n').trim(),
        step: cs.getPropertyValue('--step').trim(),
        active: Number(g.dataset.arenaActive),
        loop: g.dataset.arenaLoop,
        reflow: g.classList.contains('is-reflow'),
        scrollY: Math.round(scrollY),
        title: document.querySelector('[data-arena-title]')?.textContent,
        kind: document.querySelector('[data-arena-kind] .is-on')?.textContent,
        count: document.querySelector('[data-arena-cur]')?.textContent,
        total: document.querySelector('[data-arena-total]')?.textContent,
        ticks: [...document.querySelectorAll('[data-arena-tick]')].map((b) => ({ n: Number(b.dataset.arenaTick), label: b.getAttribute('aria-label'), current: b.getAttribute('aria-current') })),
        sheetOpen: document.querySelector('[data-sheet]').classList.contains('is-open'),
        sheetCase: Number(document.querySelector('[data-sheet-case]:not([hidden])')?.dataset.sheetCase ?? 0),
        hash: location.hash,
        stage: r('.cases__stage'),
        ring: r('.arena__ring'),
        headline: r('[data-arena-headline]'),
        pager: r('[data-arena-pager]'),
        activeCard: r('.case.is-active'),
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        focus: document.activeElement && document.activeElement !== document.body ? { tag: document.activeElement.tagName, tick: document.activeElement.dataset.arenaTick, caseOpen: document.activeElement.dataset.caseOpen } : null,
      };
    });
  /** The scrollY at which the stage starts to stick (progress 0): from the never-sticky spacer. */
  const pinStart = () =>
    page.evaluate(() => {
      const stage = document.querySelector('.cases__stage');
      const track = document.querySelector('.cases__track');
      return track.getBoundingClientRect().top + scrollY - stage.offsetHeight - (parseFloat(getComputedStyle(stage).top) || 0);
    });
  const offsetOf = async (pos, n = 12) => Math.round((await pinStart()) + (SPAN * pos) / (n - 1));
  /** Waits until the page has stopped scrolling and the ring has settled (loop idle, no glide). */
  const settled = async (timeout = 6000) => {
    const t0 = Date.now();
    let stable = 0;
    let last = -1;
    while (Date.now() - t0 < timeout) {
      const s = await page.evaluate(() => [Math.round(scrollY), document.querySelector('.cases__grid').dataset.arenaLoop, document.querySelector('.cases__grid').classList.contains('is-reflow')]);
      if (s[0] === last && s[1] === 'idle' && !s[2]) stable++;
      else stable = 0;
      last = s[0];
      if (stable >= 3) return;
      await sleep(100);
    }
    throw new Error('the ring did not settle');
  };
  /** Clicks tick n the way a keyboard/pointer user leaves it: focused and activated. A script click, because
   *  Playwright's own scroll-into-view before a pointer click can move a pinned stage on a loaded machine. */
  const tick = (n) => page.$eval(`[data-arena-tick="${n}"]`, (b) => { b.focus(); b.click(); });
  /** Moves the pointer to the centre of card n's current box (no scroll-into-view, unlike page.hover). */
  const hoverCard = async (n) => {
    const r = await page.$eval(`#case-${n}`, (el) => el.getBoundingClientRect().toJSON());
    await page.mouse.move(r.x + r.width / 2, r.y + r.height / 2);
  };
  const done = async () => {
    assert.deepEqual(await problems(), []);
    await context.close();
  };
  return { page, state, pinStart, offsetOf, settled, tick, hoverCard, done };
}

describe('the arena is on with JS and motion, the grid otherwise', () => {
  test('1440: a pinned stage, 12 cards on a 30° cylinder (200×260, radius 460, eye 1400px), a reflection, a headline, 12 ticks', async () => {
    const v = await visit('/');
    const s = await v.state();
    assert.equal(s.arena, true);
    assert.deepEqual([s.n, s.step, s.ticks.length, s.total], ['12', '30deg', 12, '12']);
    const geo = await v.page.evaluate(() => {
      const root = document.querySelector('#cases');
      const stage = document.querySelector('.cases__stage');
      const grid = document.querySelector('.cases__grid');
      const card = document.querySelector('#case-1');
      const cs = getComputedStyle(card);
      const rs = getComputedStyle(root);
      return {
        rootClass: root.classList.contains('is-arena'),
        sticky: getComputedStyle(stage).position,
        top: getComputedStyle(stage).top,
        stageH: stage.getBoundingClientRect().height,
        track: document.querySelector('.cases__track').getBoundingClientRect().height,
        perspective: getComputedStyle(grid).perspective,
        card: [card.getBoundingClientRect().width, card.getBoundingClientRect().height],
        radius: rs.getPropertyValue('--arena-r').trim(),
        backface: cs.backfaceVisibility,
        placed: card.getAnimations().map((a) => [a.playState, a.effect.getTiming().duration, a.effect.getKeyframes().map((k) => k.transform)]),
        inlineTransform: card.style.transform,
        collapsed: root.classList.contains('is-collapsed'),
        more: document.querySelector('[data-cases-more]').hidden,
        mirror: [...document.querySelectorAll('.arena__mirror .arena__ghost')].map((g) => [g.querySelector('svg.art') !== null, getComputedStyle(g).transform !== 'none', g.getAnimations().map((a) => a.effect.getKeyframes()[0].transform)]),
        mirrorOrigin: getComputedStyle(document.querySelector('.arena__mirror')).perspectiveOrigin,
        mirrorHidden: document.querySelector('.arena__mirror').getAttribute('aria-hidden'),
        rays: document.querySelectorAll('.arena__rays line').length,
        ids: [...document.querySelectorAll('svg [id]')].map((e) => e.id),
        cardReveal: card.classList.contains('reveal'),
      };
    });
    assert.equal(geo.rootClass, true);
    assert.deepEqual([geo.sticky, geo.top], ['sticky', '64px']);
    assert.equal(geo.stageH, Math.min(900 - 64 - 24, 780));
    assert.equal(geo.track, SPAN, 'the stage travels 180px per case');
    assert.equal(geo.perspective, '1400px');
    assert.deepEqual(geo.card, [200, 260]);
    assert.equal(geo.radius, '460px');
    assert.equal(geo.backface, 'hidden');
    // the placement: one paused linear sweep per card, scrubbed by the script (no inline transform)
    assert.equal(geo.placed.length, 1);
    assert.equal(geo.placed[0][0], 'paused');
    assert.equal(geo.placed[0][1], 100000);
    assert.deepEqual(geo.placed[0][2], ['translateZ(-460px) rotateY(-540deg) translateZ(460px)', 'translateZ(-460px) rotateY(540deg) translateZ(460px)']);
    assert.equal(geo.inlineTransform, '');
    assert.deepEqual([geo.collapsed, geo.more], [false, true], 'the phone "show all" state is irrelevant in the arena');
    assert.equal(geo.mirror.length, 12);
    assert.ok(geo.mirror.every(([art, placed]) => art && placed), 'every stand-in carries the art clone and is placed');
    assert.ok(geo.mirror.every(([, , frames]) => frames.length === 1 && frames[0] === 'translateZ(-460px) rotateY(-540deg) translateZ(460px) scaleY(-1)'), 'each stand-in is the card flipped in its own plane, on the same cylinder');
    assert.ok(geo.mirrorOrigin.endsWith(' -130px'), `the reflection is seen from the ring's centre: ${geo.mirrorOrigin}`);
    assert.equal(geo.mirrorHidden, 'true');
    assert.equal(geo.rays, 7);
    assert.equal(new Set(geo.ids).size, geo.ids.length, 'the cloned art keeps every svg id unique');
    assert.equal(geo.cardReveal, false, 'the cards no longer carry the per-card reveal (the arena enters as one object)');
    assert.equal(s.overflow, 0);
    // at rest the front card shows its picture inside the neon frame; the data sheet is the grid's hover / focus gesture
    assert.deepEqual(
      await v.page.$eval('.case.is-active', (el) => [getComputedStyle(el.querySelector('.case__art .art')).opacity, getComputedStyle(el.querySelector('.case__facts'), '::before').opacity, getComputedStyle(el.querySelector('.case__fact')).opacity]),
      ['1', '0', '0'],
      'the picture is at full opacity, the facts wait for a hover',
    );
    await v.done();
  });

  test('390: 150×200 cards on radius 345, the ring clipped at the viewport edge, the headline below the ring, the pager below the headline', async () => {
    const v = await visit('/', MOBILE);
    await v.page.evaluate((y) => scrollTo(0, y), (await v.pinStart()) + 2);
    await v.settled();
    const s = await v.state();
    assert.equal(s.arena, true);
    const geo = await v.page.evaluate(() => ({
      card: [document.querySelector('#case-1').getBoundingClientRect().width, document.querySelector('#case-1').getBoundingClientRect().height],
      radius: getComputedStyle(document.querySelector('#cases')).getPropertyValue('--arena-r').trim(),
      perspective: getComputedStyle(document.querySelector('.cases__grid')).perspective,
      facts: [...document.querySelectorAll('.case.is-active .case__fact')].map((e) => getComputedStyle(e).display),
      clip: getComputedStyle(document.querySelector('.arena__scene')).overflowX,
      scene: document.querySelector('.arena__scene').getBoundingClientRect().width,
    }));
    assert.deepEqual(geo.card.map(Math.round), [150, 200]);
    assert.equal(geo.radius, '345px');
    assert.equal(geo.perspective, '1100px');
    assert.deepEqual(geo.facts, ['grid', 'grid', 'none'], 'two fact rows fit the small art');
    assert.deepEqual([geo.clip, geo.scene], ['clip', 390], 'the scene bleeds to the viewport edges and clips there');
    assert.equal(s.overflow, 0, 'no horizontal page overflow');
    assert.equal(s.stage.w, 390);
    assert.ok(s.headline.y >= s.ring.bottom, `the headline (${s.headline.y}) sits below the ring (${s.ring.bottom})`);
    assert.ok(s.pager.y >= s.headline.bottom - 1, `the pager (${s.pager.y}) sits below the headline (${s.headline.bottom})`);
    assert.ok(s.pager.bottom <= s.stage.bottom, 'everything fits the pinned stage');
    await v.done();
  });

  test('reduced motion and JS off: the grid, untouched', async () => {
    for (const [label, options, js] of [
      ['reduced motion', REDUCED, true],
      ['no JS', DESKTOP, false],
      ['reduced motion, phone', { ...MOBILE, reducedMotion: 'reduce' }, true],
    ]) {
      const v = await visit('/', options, { js });
      const g = await v.page.evaluate(() => ({
        arena: document.querySelector('.cases__grid').classList.contains('is-arena'),
        rootArena: document.querySelector('#cases').classList.contains('is-arena'),
        chrome: document.querySelectorAll('.arena, .arena__mirror, [data-arena-headline], [data-arena-tick], .arena__rays').length,
        display: getComputedStyle(document.querySelector('.cases__grid')).display,
        sticky: getComputedStyle(document.querySelector('.cases__stage')).position,
        track: document.querySelector('.cases__track').getBoundingClientRect().height,
        transform: getComputedStyle(document.querySelector('#case-1')).transform,
      }));
      assert.deepEqual(g, { arena: false, rootArena: false, chrome: 0, display: 'grid', sticky: 'static', track: 0, transform: 'none' }, label);
      await v.done();
    }
  });
});

describe('the scroll drives the ring', () => {
  test('progress → index: the stage pins, --p settles on the card the scroll points at, the counter and headline follow; a position between two cards settles on the nearest', async () => {
    const v = await visit('/');
    const y0 = await v.pinStart();
    // before the pin: the first card
    await v.page.evaluate((y) => scrollTo(0, y - 300), y0);
    await v.settled();
    let s = await v.state();
    assert.deepEqual([s.p, s.active, s.count, s.title], ['0.000', 1, '01', ru.cases.items[0].title]);
    assert.equal(s.stage.y > 64, true, 'not pinned yet');
    // exactly on card 4 (index 3)
    await v.page.evaluate((y) => scrollTo(0, y), await v.offsetOf(3));
    await sleep(100);
    assert.equal((await v.state()).loop, 'live', 'the loop runs while p chases t');
    await v.settled();
    s = await v.state();
    assert.deepEqual([s.p, s.active, s.count, s.total, s.title, s.kind], ['3.000', 4, '04', '12', ru.cases.items[3].title, `${ru.cases.items[3].kind} · ${ru.cases.items[3].tags}`]);
    assert.equal(s.stage.y, 64, 'the stage is pinned under the header');
    assert.equal(s.ticks[3].current, 'true');
    assert.equal(s.ticks.filter((t) => t.current).length, 1);
    assert.ok(Math.abs(s.activeCard.x + s.activeCard.w / 2 - (s.stage.x + s.stage.w / 2)) < 1.5, 'the active card faces the viewer, centred');
    assert.deepEqual([s.activeCard.w, s.activeCard.h].map(Math.round), [200, 260], 'at the front the card is unscaled (z = 0)');
    // between cards 7 and 8 (index 6.3): the idle snap settles the page on card 7's offset
    await v.page.evaluate((y) => scrollTo(0, y), Math.round(y0 + (SPAN * 6.3) / 11));
    await v.settled();
    s = await v.state();
    assert.deepEqual([s.p, s.active, s.scrollY], ['6.000', 7, await v.offsetOf(6)]);
    // past the end: the last card, the stage released
    await v.page.evaluate((y) => scrollTo(0, y + 400), y0 + SPAN);
    await v.settled();
    s = await v.state();
    assert.deepEqual([s.p, s.active], ['11.000', 12]);
    assert.ok(s.stage.y < 64, 'the stage scrolls away after the last card');
    await v.done();
  });

  test('the loop idles at rest and nothing runs: the 24 placement animations are paused, the state transitions are over', async () => {
    const v = await visit('/');
    await v.page.evaluate((y) => scrollTo(0, y), await v.offsetOf(2));
    await v.settled();
    await sleep(400); // the active-state transitions (300ms) end
    const at = await v.page.evaluate(() => {
      const all = [...document.querySelectorAll('.case, .arena__ghost')].flatMap((e) => e.getAnimations({ subtree: true }));
      return {
        loop: document.querySelector('.cases__grid').dataset.arenaLoop,
        running: all.filter((a) => a.playState === 'running').length,
        paused: all.filter((a) => a.playState === 'paused' && a.effect.getTiming().duration === 100000).length,
      };
    });
    assert.deepEqual(at, { loop: 'idle', running: 0, paused: 24 });
    await v.done();
  });
});

describe('ticks, keys, focus', () => {
  test('a tick click scrolls the page to that case; ← / → from a tick move the ring and the focus; Home / End', async () => {
    const v = await visit('/');
    await v.tick(6);
    await v.settled();
    let s = await v.state();
    assert.deepEqual([s.active, s.p, s.count, s.scrollY], [6, '5.000', '06', await v.offsetOf(5)]);
    assert.equal(s.ticks[5].label, `${ru.cases.sheet.kicker} 6: ${ru.cases.items[5].title}`);
    assert.equal(s.focus.tick, '6');
    await v.page.keyboard.press('ArrowRight');
    await v.settled();
    s = await v.state();
    assert.deepEqual([s.active, s.scrollY, s.focus.tick], [7, await v.offsetOf(6), '7']);
    await v.page.keyboard.press('ArrowLeft');
    await v.page.keyboard.press('ArrowLeft');
    await v.settled();
    s = await v.state();
    assert.deepEqual([s.active, s.focus.tick], [5, '5']);
    await v.page.keyboard.press('End');
    await v.settled();
    assert.deepEqual([(await v.state()).active, (await v.state()).focus.tick], [12, '12']);
    await v.page.keyboard.press('Home');
    await v.settled();
    assert.equal((await v.state()).active, 1);
    await v.done();
  });

  test('keyboard focus on a card brings it to the front; → from a card moves to the next card', async () => {
    const v = await visit('/');
    await v.page.focus('#case-5 .case__open');
    await v.settled();
    let s = await v.state();
    assert.deepEqual([s.active, s.focus.caseOpen], [5, '5']);
    await v.page.keyboard.press('ArrowRight');
    await v.settled();
    s = await v.state();
    assert.deepEqual([s.active, s.focus.caseOpen], [6, '6']);
    await v.done();
  });

  test('a click on a side card rotates to it (no sheet); a click on the front card opens its sheet', async () => {
    const v = await visit('/');
    await v.page.evaluate((y) => scrollTo(0, y + 2), await v.pinStart());
    await v.settled();
    await v.page.click('#case-3'); // at +60° while case 1 is at the front
    await v.settled();
    let s = await v.state();
    assert.deepEqual([s.active, s.sheetOpen, s.scrollY], [3, false, await v.offsetOf(2)]);
    await v.page.click('#case-3');
    await v.page.waitForSelector('[data-sheet].is-open', { state: 'attached', timeout: 2000 });
    s = await v.state();
    assert.deepEqual([s.sheetOpen, s.sheetCase, s.hash], [true, 3, '#case-3']);
    assert.equal(await v.page.$eval('[data-sheet-case]:not([hidden]) .sheet__title', (el) => el.textContent.trim()), ru.cases.items[2].title);
    await v.page.keyboard.press('Escape');
    await v.page.waitForSelector('[data-sheet]', { state: 'hidden', timeout: 2000 });
    assert.equal((await v.state()).focus.caseOpen, '3', 'focus returns to the card');
    await v.done();
  });
});

describe('a travel survives a stall', () => {
  test('the main thread freezes for longer than the idle-snap delay while the ring travels to a card: the page still arrives there', async () => {
    const v = await visit('/');
    const pin = await v.pinStart();
    await v.page.evaluate((y) => scrollTo(0, y), pin);
    await v.settled();
    assert.equal((await v.state()).active, 1);
    await v.page.focus('#case-12 .case__open'); // a long smooth travel inside the pinned range
    // once the travel is under way, block the main thread for 320ms (> SNAP_MS): no scroll events reach the
    // page meanwhile, and the snap timer is overdue when it wakes — it must not redirect the travel
    const stalledAt = await v.page.evaluate(
      (y) =>
        new Promise((resolve) => {
          const wait = () => {
            if (scrollY > y + 150) {
              const t0 = performance.now();
              while (performance.now() - t0 < 320);
              resolve(Math.round(scrollY - y));
            } else requestAnimationFrame(wait);
          };
          wait();
        }),
      pin,
    );
    await v.settled();
    assert.equal((await v.state()).active, 12, `the ring arrives at the card asked for (stalled at +${stalledAt}px)`);
    await v.done();
  });
});

describe('the headline', () => {
  test('on arrival the title decodes to the exact i18n title (450ms), the mono line reads "kind · tags"; hover previews another card', async () => {
    const v = await visit('/');
    await v.page.evaluate((y) => scrollTo(0, y + 2), await v.pinStart());
    await v.settled();
    // record the title every frame while the ring goes to case 8
    const samples = await v.page.evaluate(
      () =>
        new Promise((resolve) => {
          const el = document.querySelector('[data-arena-title]');
          const out = [];
          const t0 = performance.now();
          document.querySelector('[data-arena-tick="8"]').click();
          const tick = () => {
            const run = el.querySelector('[aria-hidden]');
            out.push([Math.round(performance.now() - t0), el.dataset.decode ?? '', (run ?? el).textContent, document.querySelector('.cases__grid').dataset.arenaActive]);
            if (performance.now() - t0 > 3500) resolve(out);
            else requestAnimationFrame(tick);
          };
          tick();
        }),
    );
    await v.settled();
    const target = ru.cases.items[7].title;
    const lastSample = samples[samples.length - 1];
    assert.equal(lastSample[2], target, 'ends exactly as the i18n title');
    assert.equal(lastSample[1], '', 'no decode scaffolding at rest');
    const cipher = samples.filter((s) => s[3] === '8' && s[1] === 'on' && s[2] !== target);
    assert.ok(cipher.length >= 3, `the title scrambles on the way in (${cipher.length} cipher frames)`);
    for (const [, , text] of cipher) assert.ok([...text].every((c, i) => c === target[i] || GLYPHS.includes(c)), `only the title's characters or cipher glyphs: ${text}`);
    const s = await v.state();
    assert.deepEqual([s.title, s.kind], [target, `${ru.cases.items[7].kind} · ${ru.cases.items[7].tags}`]);
    assert.equal(await v.page.$eval('[data-arena-kind] .is-on', (el) => getComputedStyle(el).textTransform), 'uppercase');
    // hover preview (fine pointer): a side card's headline, with the 300ms slide + glyph scale
    await v.hoverCard(6);
    const m = await v.page.evaluate(() => {
      const title = document.querySelector('[data-arena-title]');
      const line = document.querySelector('[data-arena-line]');
      const glyph = document.querySelector('.arena__glyph');
      const anim = (el) => el.getAnimations().map((a) => [a.effect.getTiming().duration, a.effect.getTiming().easing, a.effect.getKeyframes().map((k) => [k.transform, k.opacity])]);
      return { title: title.textContent, titleAnim: anim(line), glyphAnim: anim(glyph), clip: getComputedStyle(line.parentElement).overflow, glyphInLine: line.firstElementChild === glyph && line.contains(title) };
    });
    assert.equal(m.glyphInLine, true, '↳ leads the title line');
    assert.equal(m.title.endsWith(ru.cases.items[5].title) || m.title.includes(ru.cases.items[5].title.slice(0, 3)), true, `previews case 6: ${m.title}`);
    assert.deepEqual(m.titleAnim, [[300, 'cubic-bezier(0.22, 1, 0.36, 1)', [['translateY(12px)', '0'], ['none', '1']]]]);
    assert.deepEqual(m.glyphAnim, [[300, 'cubic-bezier(0.22, 1, 0.36, 1)', [['scale(0.9)', '0.6'], ['none', '1']]]]);
    assert.equal(m.clip, 'hidden', 'the title slides behind a clip');
    await v.page.waitForFunction(() => document.querySelector('[data-arena-title]').textContent === document.querySelector('#case-6 .case__open').textContent.trim(), null, { timeout: 3000 });
    await v.page.mouse.move(8, 8);
    await v.page.waitForFunction((t) => document.querySelector('[data-arena-title]').textContent === t, target, { timeout: 3000 });
    assert.equal((await v.state()).active, 8, 'leaving restores the active headline');
    await v.done();
  });

  test('the decode can be switched off for tests (.is-no-decode): the title is simply set', async () => {
    const v = await visit('/');
    await v.page.evaluate(() => document.querySelector('#cases').classList.add('is-no-decode'));
    await v.tick(4);
    await v.settled();
    assert.equal(await v.page.$eval('[data-arena-title]', (el) => `${el.textContent}|${el.dataset.decode ?? ''}|${el.children.length}`), `${ru.cases.items[3].title}||0`);
    await v.done();
  });
});

describe('drag', () => {
  test('a horizontal drag on the stage turns the ring (1 case per 120px) and lands on a card; the click after a drag does not open the sheet', async () => {
    const v = await visit('/');
    await v.page.evaluate((y) => scrollTo(0, y), await v.offsetOf(2));
    await v.settled();
    const s0 = await v.state();
    const cy = s0.ring.y + s0.ring.h / 2;
    const x0 = s0.stage.x + s0.stage.w / 2;
    await v.page.mouse.move(x0, cy);
    await v.page.mouse.down();
    for (let i = 1; i <= 10; i++) {
      await v.page.mouse.move(x0 - i * 25, cy + (i % 2), { steps: 1 });
      await sleep(16);
    }
    const mid = await v.state();
    assert.ok(mid.scrollY > s0.scrollY, 'the drag moves the page scroll (one source of truth)');
    assert.equal(await v.page.$eval('.cases__grid', (g) => g.classList.contains('is-dragging')), true);
    await v.page.mouse.up();
    await v.settled();
    const s1 = await v.state();
    assert.ok(s1.active >= 5 && s1.active <= 6, `250px of drag moved ~2 cases (now at ${s1.active})`);
    assert.equal(s1.scrollY, await v.offsetOf(s1.active - 1), 'settled on a card');
    assert.equal(s1.sheetOpen, false);
    await v.done();
  });

  test('a phone drag works too, and a vertical pan still scrolls the page', async () => {
    const v = await visit('/', MOBILE);
    await v.page.evaluate((y) => scrollTo(0, y), await v.offsetOf(1));
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
    const s1 = await v.state();
    assert.ok(s1.active >= 3, `the ring turned (now at ${s1.active})`);
    await v.done();
  });
});

describe('filters rebuild the ring', () => {
  test('"ads" leaves 3 cards 60° apart (3 ticks, counter/total 0x/03), the survivors glide 400ms, "all" brings 12 back', async () => {
    const v = await visit('/');
    await v.page.evaluate((y) => scrollTo(0, y), await v.offsetOf(3)); // case 4 — an ads case
    await v.settled();
    // a JS click: Playwright's own scroll-into-view before a pointer click can move a pinned stage on a slow machine
    await v.page.$eval('[data-filter="ads"]', (b) => b.click());
    const during = await v.state();
    assert.equal(during.reflow, true, 'the glide is on');
    await v.page.waitForFunction(() => document.querySelector('#case-1').hidden, null, { timeout: 2000 });
    await v.settled();
    const s = await v.state();
    assert.deepEqual([s.n, s.step, s.total, s.reflow], ['3', '60deg', '03', false]);
    assert.deepEqual(s.ticks.map((t) => t.n), [2, 4, 7], 'the ads cases, in order');
    assert.deepEqual([s.active, s.count, s.p], [4, '02', '1.000'], 'the active ads case stays, now second of three');
    assert.equal(s.ticks[1].current, 'true');
    const angles = await v.page.$$eval('.case:not([hidden])', (els) => els.map((e) => [e.id, e.style.getPropertyValue('--i')]));
    assert.deepEqual(angles, [['case-2', '0'], ['case-4', '1'], ['case-7', '2']]);
    await v.page.$eval('[data-filter="all"]', (b) => b.click());
    await v.page.waitForFunction(() => !document.querySelector('#case-1').hidden, null, { timeout: 2000 });
    await v.settled();
    const back = await v.state();
    assert.deepEqual([back.n, back.step, back.total, back.ticks.length, back.active], ['12', '30deg', '12', 12, 4]);
    await v.done();
  });
});

describe('deep link', () => {
  test('/#case-7 opens the sheet and brings the ring to 7 behind it', async () => {
    const v = await visit('/#case-7');
    await v.page.waitForSelector('[data-sheet].is-open', { state: 'attached', timeout: 2000 });
    const s = await v.state();
    assert.deepEqual([s.sheetOpen, s.sheetCase, s.active, s.p, s.count], [true, 7, 7, '6.000', '07']);
    assert.equal(s.scrollY, await v.offsetOf(6));
    assert.ok(s.activeCard.y >= 0 && s.activeCard.bottom <= 900, 'the card is on screen behind the sheet');
    await v.page.keyboard.press('Escape');
    await v.page.waitForSelector('[data-sheet]', { state: 'hidden', timeout: 2000 });
    await v.settled();
    assert.deepEqual([(await v.state()).active, (await v.state()).focus.caseOpen], [7, '7']);
    await v.done();
  });
});

describe('the sheet from the arena', () => {
  test('the art flies from the front card (its rect is exact at z = 0) and the sheet opens over the pinned stage; the ring is where it was on close', async () => {
    const v = await visit('/');
    await v.tick(5);
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
    await v.page.waitForSelector('[data-sheet]', { state: 'hidden', timeout: 2000 });
    await v.settled();
    assert.deepEqual([(await v.state()).active, (await v.state()).p], [5, '4.000']);
    await v.done();
  });
});

describe('clean console and CSP', () => {
  test('/, /en/, /az/ and /de/: pin, scroll, tick, open — no errors, no violations; the tick labels use the localised kicker', async () => {
    for (const [lang, path] of Object.entries(LANG_PATHS)) {
      const t = CONTENT[lang];
      const v = await visit(path);
      const y0 = await v.pinStart();
      for (let y = y0; y <= y0 + SPAN; y += 360) {
        await v.page.evaluate((v) => scrollTo(0, v), y);
        await sleep(120);
      }
      await v.settled();
      const s = await v.state();
      assert.equal(s.ticks[2].label, `${t.cases.sheet.kicker} 3: ${t.cases.items[2].title}`, lang);
      assert.equal(s.title, t.cases.items[11].title, lang);
      await v.tick(2);
      await v.settled();
      await v.page.click('#case-2');
      await v.page.waitForSelector('[data-sheet].is-open', { state: 'attached', timeout: 2000 });
      assert.equal(await v.page.$eval('[data-sheet-case]:not([hidden]) .sheet__title', (el) => el.textContent.trim()), t.cases.items[1].title, lang);
      await v.page.keyboard.press('Escape');
      await v.page.waitForSelector('[data-sheet]', { state: 'hidden', timeout: 2000 });
      await v.done();
    }
  });
});
