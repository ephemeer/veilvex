/**
 * The case sheet (src/components/CaseSheet.astro + src/scripts/case-sheet.ts): opening from a card, the
 * content against the i18n data, paging (bar buttons and ← / →), closing (Esc, backdrop, ×) with focus
 * return, scroll lock with scrollbar compensation, #case-N deep links, the language switch, the CTA →
 * request-form handoff, the phone variant, reduced motion, and a clean console / CSP in every language.
 */
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { DESKTOP, LANG_PATHS, MOBILE, fixture, openPage } from './helpers.mjs';

const { ru } = await import('../../src/i18n/ru.ts');
const { en } = await import('../../src/i18n/en.ts');
const { az } = await import('../../src/i18n/az.ts');
const { de } = await import('../../src/i18n/de.ts');
const CONTENT = { ru, en, az, de };
const SERVICE = { web: 'site', app: 'app', ads: 'ads', design: 'design' };

// classic scrollbars (headless Chromium hides them): the scroll lock must compensate their width
const f = fixture({ launch: { ignoreDefaultArgs: ['--hide-scrollbars'] } });
before(f.setup);
after(f.teardown);

const REDUCED = { ...DESKTOP, reducedMotion: 'reduce' };

async function visit(path, options = DESKTOP) {
  const context = await f.state.browser.newContext(options);
  const { page, problems } = await openPage(context);
  await page.goto(f.state.base + path, { waitUntil: 'networkidle' });
  // the case arena mounts in idle time after load (arena.ts): wait for it — or for its "off" — before touching cards
  await page.waitForFunction(
    () => {
      const s = document.querySelector('#cases')?.dataset.arena;
      return s !== 'pending' && (s !== 'on' || document.querySelector('.cases__grid').dataset.arenaLoop);
    },
    null,
    { timeout: 8000 },
  );
  const scrollTo = (selector) => page.$eval(selector, (el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  const opened = async () => {
    await page.waitForSelector('[data-sheet].is-open', { state: 'attached', timeout: 2000 });
    await page.waitForFunction(() => document.querySelector('.sheet__panel').getAnimations().length === 0 && !document.querySelector('.sheet__ghost'), null, { timeout: 3000 });
  };
  /**
   * Puts card n where it can be clicked. With the arena on (JS + motion: arena.ts), only the front card
   * opens the sheet — a click on a side card turns the ring instead — so the page jumps to that card's
   * scroll offset (the same place its tick would scroll to, instantly) and the ring settles; the plain
   * grid (reduced motion) just scrolls the card into view.
   */
  const bring = async (n) => {
    if (!(await page.evaluate(() => document.querySelector('.cases__grid.is-arena') !== null))) return scrollTo(`#case-${n}`);
    await page.evaluate((n) => {
      document.documentElement.style.scrollBehavior = 'auto';
      const stage = document.querySelector('.cases__stage');
      const track = document.querySelector('.cases__track');
      const pinStart = track.getBoundingClientRect().top + scrollY - stage.offsetHeight - (parseFloat(getComputedStyle(stage).top) || 0);
      const span = track.getBoundingClientRect().height;
      const order = [...document.querySelectorAll('.cases__grid > .case')].filter((c) => !c.hidden && !c.classList.contains('is-out'));
      const pos = order.findIndex((c) => c.id === `case-${n}`);
      scrollTo({ top: Math.round(pinStart + (span * pos) / Math.max(1, order.length - 1)), behavior: 'instant' });
    }, n);
    let stable = 0;
    let last = -1;
    for (let i = 0; i < 60 && stable < 2; i++) {
      await new Promise((r) => setTimeout(r, 100));
      const s = await page.evaluate(() => [Math.round(scrollY), document.querySelector('.cases__grid').dataset.arenaActive, document.querySelector('.cases__grid').dataset.arenaLoop]);
      stable = s[0] === last && s[1] === String(n) && s[2] === 'idle' ? stable + 1 : 0;
      last = s[0];
    }
    if (stable < 2) throw new Error(`the ring did not settle on case ${n}`);
  };
  /** Moves the pointer to the centre of card n's current box — page.hover would first scroll the card
   *  "into view", which can move a pinned stage on a loaded machine. */
  const hoverCard = async (n) => {
    const r = await page.$eval(`#case-${n}`, (el) => el.getBoundingClientRect().toJSON());
    await page.mouse.move(r.x + r.width / 2, r.y + r.height / 2);
  };
  const open = async (n) => {
    // under a loaded machine (the whole suite in parallel) a click can land a frame before the ring has
    // truly come to rest: one more bring + click before giving up
    for (let attempt = 0; ; attempt++) {
      await bring(n);
      await (options.hasTouch ? page.tap(`#case-${n}`) : page.click(`#case-${n}`)); // anywhere on the card
      try {
        await opened();
        return;
      } catch (err) {
        if (attempt >= 1) throw err;
      }
    }
  };
  const closed = () => page.waitForSelector('[data-sheet]', { state: 'hidden', timeout: 2000 });
  const state = () =>
    page.evaluate(() => {
      const root = document.querySelector('[data-sheet]');
      const ae = document.activeElement;
      return {
        hidden: root.hidden,
        open: root.classList.contains('is-open'),
        locked: document.documentElement.classList.contains('is-sheet-open'),
        sbw: document.documentElement.style.paddingRight, // the scrollbar compensation (inline, see case-sheet.ts lock())
        shown: [...document.querySelectorAll('[data-sheet-case]')].filter((a) => !a.hidden).map((a) => Number(a.dataset.sheetCase)),
        pos: document.querySelector('[data-sheet-cur]').textContent,
        labelledby: document.querySelector('[data-sheet-panel]').getAttribute('aria-labelledby'),
        active: ae && ae !== document.body ? { id: ae.id, tag: ae.tagName, caseOpen: ae.dataset.caseOpen, value: ae.value } : null,
        inside: root.contains(ae),
        hash: location.hash,
        path: location.pathname,
        status: document.querySelector('[data-sheet-status]').textContent,
      };
    });
  const done = async () => {
    assert.deepEqual(await problems(), []);
    await context.close();
  };
  return { page, scrollTo, bring, hoverCard, open, opened, closed, state, done };
}

/** The visible article, structured like the i18n data. */
const content = (page) =>
  page.evaluate(() => {
    const a = document.querySelector('[data-sheet-case]:not([hidden])');
    const txt = (sel) => a.querySelector(sel)?.textContent.trim();
    return {
      n: Number(a.dataset.sheetCase),
      title: txt('.sheet__title'),
      facts: [...a.querySelectorAll('.sheet__fact')].map((x) => [x.querySelector('dt').textContent.trim(), x.querySelector('dd').textContent.trim()]),
      lead: txt('.sheet__lead'),
      blocks: [...a.querySelectorAll('.sheet__block')].map((b) => ({ h: b.querySelector('h3').textContent.trim(), items: [...b.querySelectorAll('li, p')].map((e) => e.textContent.trim()) })),
      cta: txt('[data-sheet-cta]'),
      service: a.querySelector('[data-sheet-cta]').dataset.service,
      art: a.querySelector('.sheet__art svg') !== null,
    };
  });
const expected = (t, n) => {
  const c = t.cases.items[n - 1];
  const s = t.cases.sheet;
  return {
    n,
    title: c.title,
    facts: [
      [s.direction, c.kind],
      [s.tech, c.tags],
      [s.result, c.result],
    ],
    lead: c.lead,
    blocks: c.blocks.map((b) => ({ h: b.h, items: b.items })),
    cta: s.cta,
    service: SERVICE[c.type],
    art: true,
  };
};
const logoX = (page) => page.$eval('.nav__logo', (el) => el.getBoundingClientRect().x);

describe('opening from a card', () => {
  test('every card is a dialog trigger; the third card opens the whole story of case 3 — RU and EN', async () => {
    for (const [path, t] of [
      ['/ru/', ru],
      ['/', en],
    ]) {
      const v = await visit(path);
      const triggers = await v.page.$$eval('[data-case-open]', (els) => els.map((b) => ({ tag: b.tagName, popup: b.getAttribute('aria-haspopup'), controls: b.getAttribute('aria-controls'), nested: b.querySelectorAll('a, button, input').length, inH3: b.parentElement.tagName })));
      assert.equal(triggers.length, 12);
      assert.ok(triggers.every((x) => x.tag === 'BUTTON' && x.popup === 'dialog' && x.controls === 'case-sheet' && x.nested === 0 && x.inH3 === 'H3'), JSON.stringify(triggers[0]));
      // all twelve stories are in the HTML (search engines, AI crawlers), one dialog, hidden until opened
      assert.deepEqual(await v.page.$$eval('[data-sheet-case] .sheet__title', (els) => els.map((e) => e.textContent.trim())), t.cases.items.map((c) => c.title));
      assert.equal((await v.state()).hidden, true);
      assert.equal(await v.page.$eval('[data-sheet-panel]', (el) => `${el.getAttribute('role')} ${el.getAttribute('aria-modal')}`), 'dialog true');

      await v.open(3);
      const s = await v.state();
      assert.equal(s.open, true);
      assert.deepEqual(s.shown, [3], 'one article shown');
      assert.equal(s.pos, '03');
      assert.equal(s.labelledby, 'case-sheet-title-3', 'the dialog is named by the visible title');
      assert.equal(s.hash, '#case-3');
      assert.equal(s.locked, true);
      assert.deepEqual(s.active, { id: 'case-sheet-title-3', tag: 'H2', caseOpen: undefined, value: undefined }, 'focus moved to the title');
      assert.deepEqual(await content(v.page), expected(t, 3));
      assert.equal(await v.page.$eval('.sheet__pos', (el) => el.textContent.replace(/\s+/g, ' ').trim()), `${t.cases.sheet.kicker} · 03 / 12`);
      // the SVG ids of the big art do not collide with the grid's
      const ids = await v.page.$$eval('[data-sheet-case]:not([hidden]) svg [id], #case-3 svg [id]', (els) => els.map((e) => e.id));
      assert.equal(new Set(ids).size, ids.length, `unique svg ids: ${ids}`);
      // everything else is inert, except the ⌘K palette (its shortcut is global)
      const inert = await v.page.evaluate(() => ({
        nav: document.querySelector('.nav').hasAttribute('inert'),
        footer: document.querySelector('footer').hasAttribute('inert'),
        grid: document.querySelector('#cases .container').hasAttribute('inert'),
        hero: document.querySelector('.hero').hasAttribute('inert'),
        cmd: document.querySelector('[data-cmd]').hasAttribute('inert'),
        sheet: document.querySelector('[data-sheet]').closest('[inert]') !== null,
      }));
      assert.deepEqual(inert, { nav: true, footer: true, grid: true, hero: true, cmd: false, sheet: false });
      await v.done();
    }
  });

  test('motion: the panel slides in 300ms on the drawer curve, the backdrop fades 150ms, the content staggers 40ms apart at 300ms ease-out', async () => {
    const v = await visit('/ru/');
    await v.bring(3);
    const m = await v.page.evaluate(() => {
      document.querySelector('#case-3 .case__open').click();
      const panel = document.querySelector('.sheet__panel');
      const cs = getComputedStyle(panel);
      const items = [...document.querySelectorAll('[data-sheet-case]:not([hidden]) .sheet__art, [data-sheet-case]:not([hidden]) .sheet__text > *')];
      return {
        props: cs.transitionProperty,
        dur: cs.transitionDuration,
        curve: cs.transitionTimingFunction,
        backdrop: getComputedStyle(document.querySelector('.sheet__backdrop')).transitionDuration,
        entering: document.querySelector('[data-sheet]').classList.contains('is-entering'),
        // a CSS animation's timing function sits on its keyframes (getTiming().easing is the effect-level 'linear')
        stagger: items.map((el) => el.getAnimations().map((a) => [a.animationName, a.effect.getTiming().delay, a.effect.getTiming().duration, a.effect.getKeyframes()[0].easing])),
      };
    });
    assert.equal(m.props, 'transform, opacity');
    assert.equal(m.dur, '0.3s, 0.16s');
    assert.equal(m.curve, 'cubic-bezier(0.32, 0.72, 0, 1), cubic-bezier(0.22, 1, 0.36, 1)');
    assert.equal(m.backdrop, '0.15s');
    assert.equal(m.entering, true);
    assert.equal(m.stagger.length, 5 + ru.cases.items[2].blocks.length, 'art, title, facts, lead, blocks, cta');
    m.stagger.forEach((anims, k) => {
      assert.deepEqual(anims, [['sheet-item', 80 + k * 40, 300, 'cubic-bezier(0.22, 1, 0.36, 1)']], `child ${k}`);
    });
    await v.page.waitForFunction(() => !document.querySelector('[data-sheet]').classList.contains('is-entering'), null, { timeout: 3000 });
    assert.equal(await v.page.$eval('[data-sheet-case]:not([hidden]) .sheet__cta', (el) => el.getAnimations().length), 0, 'the stagger is over and gone');
    // exit: symmetric and shorter
    await v.page.keyboard.press('Escape');
    const exit = await v.page.evaluate(() => ({ closing: document.querySelector('[data-sheet]').classList.contains('is-closing'), dur: getComputedStyle(document.querySelector('.sheet__panel')).transitionDuration, backdrop: getComputedStyle(document.querySelector('.sheet__backdrop')).transitionDuration }));
    assert.deepEqual(exit, { closing: true, dur: '0.18s, 0.15s', backdrop: '0.12s' });
    await v.closed();
    await v.done();
  });
});

describe('paging', () => {
  test('the bar buttons and ← / → page through the cases, wrap at the ends, keep the hash and announce the new story', async () => {
    const v = await visit('/ru/');
    await v.open(3);
    const swap = await v.page.evaluate(() => {
      document.querySelector('[data-sheet-next]').click();
      const a = document.querySelector('[data-sheet-case]:not([hidden])');
      return { n: Number(a.dataset.sheetCase), anims: a.getAnimations().map((x) => [x.animationName, x.effect.getTiming().duration]), panelAnims: document.querySelector('.sheet__panel').getAnimations().length };
    });
    assert.deepEqual(swap, { n: 4, anims: [['sheet-swap-next', 180]], panelAnims: 0 }, 'the new story slides in, the panel stays');
    let s = await v.state();
    assert.deepEqual([s.shown, s.pos, s.hash, s.labelledby], [[4], '04', '#case-4', 'case-sheet-title-4']);
    assert.equal(s.status, `${ru.cases.sheet.kicker} 04 / 12 — ${ru.cases.items[3].title}`);
    assert.deepEqual(await content(v.page), expected(ru, 4));
    await v.page.keyboard.press('ArrowLeft');
    assert.deepEqual((await v.state()).shown, [3]);
    await v.page.click('[data-sheet-prev]');
    await v.page.click('[data-sheet-prev]');
    assert.deepEqual((await v.state()).shown, [1]);
    await v.page.keyboard.press('ArrowLeft');
    s = await v.state();
    assert.deepEqual([s.shown, s.hash], [[12], '#case-12'], 'wraps to the last case');
    assert.deepEqual(await content(v.page), expected(ru, 12));
    await v.page.keyboard.press('ArrowRight');
    assert.deepEqual((await v.state()).shown, [1], 'and back to the first');
    // a switch starts the new story at the top
    await v.page.$eval('[data-sheet-scroll]', (el) => (el.scrollTop = 300));
    await v.page.keyboard.press('ArrowRight');
    assert.equal(await v.page.$eval('[data-sheet-scroll]', (el) => el.scrollTop), 0);
    assert.equal(await v.page.$$eval('[data-sheet-case]', (els) => els.filter((a) => !a.hidden).length), 1);
    await v.done();
  });
});

describe('closing', () => {
  test('opened and closed in the same task (before the deferred inert lands): nothing stays inert, the page is live', async () => {
    const v = await visit('/ru/');
    await v.bring(3);
    await v.page.evaluate(() => {
      document.querySelector('[data-case-open="3"]').click();
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    });
    await v.closed();
    const after = await v.page.evaluate(() => ({ inert: document.querySelectorAll('[inert]').length, hash: location.hash, locked: document.documentElement.classList.contains('is-sheet-open') }));
    assert.deepEqual(after, { inert: 0, hash: '', locked: false });
    // and a normal open afterwards still makes the rest of the page inert
    await v.open(3);
    assert.equal(await v.page.evaluate(() => document.querySelector('.nav').hasAttribute('inert')), true);
    await v.page.keyboard.press('Escape');
    await v.closed();
    assert.equal(await v.page.evaluate(() => document.querySelectorAll('[inert]').length), 0);
    await v.done();
  });

  test('Esc closes: the lock lifts once the exit is over, the hash is cleared and focus returns to the card that opened it', async () => {
    const v = await visit('/ru/');
    await v.open(3);
    await v.page.keyboard.press('Escape');
    await v.closed();
    const s = await v.state();
    assert.equal(s.hidden, true);
    assert.equal(s.locked, false);
    assert.equal(s.sbw, '', 'the compensation variable is gone');
    assert.equal(s.hash, '');
    assert.equal(s.active.caseOpen, '3');
    await v.done();
  });

  test('after paging, focus returns to the card of the case being read; a hidden card falls back to the opener', async () => {
    const v = await visit('/ru/');
    await v.open(3);
    await v.page.keyboard.press('ArrowRight');
    await v.page.keyboard.press('ArrowRight');
    await v.page.keyboard.press('Escape');
    await v.closed();
    assert.equal((await v.state()).active.caseOpen, '5');
    // filter "ads" hides the web cases: paging from an ads case to a web case, then closing → the opener
    await v.page.click('[data-filter="ads"]');
    await v.page.waitForFunction(() => document.querySelector('#case-3').hidden);
    await v.open(2);
    await v.page.keyboard.press('ArrowRight'); // 3, hidden behind the filter
    assert.deepEqual((await v.state()).shown, [3]);
    await v.page.keyboard.press('Escape');
    await v.closed();
    assert.equal((await v.state()).active.caseOpen, '2');
    await v.done();
  });

  test('the backdrop and the × button close too; the previous hash comes back', async () => {
    const v = await visit('/#cases');
    await v.open(2);
    assert.equal((await v.state()).hash, '#case-2');
    await v.page.mouse.click(12, 450); // backdrop, far left of the panel
    await v.closed();
    assert.equal((await v.state()).hash, '#cases');
    await v.open(2);
    await v.page.click('[data-sheet-close]');
    await v.closed();
    const s = await v.state();
    assert.equal(s.hash, '#cases');
    assert.equal(s.active.caseOpen, '2');
    await v.done();
  });

  test('Tab / Shift+Tab stay inside the panel', async () => {
    const v = await visit('/ru/');
    await v.open(1);
    for (const key of ['Tab', 'Tab', 'Tab', 'Tab', 'Tab', 'Tab', 'Shift+Tab', 'Shift+Tab', 'Shift+Tab', 'Shift+Tab', 'Shift+Tab', 'Shift+Tab']) {
      await v.page.keyboard.press(key);
      const s = await v.state();
      assert.equal(s.inside, true, `focus left the sheet after ${key}: ${JSON.stringify(s.active)}`);
    }
    await v.done();
  });
});

describe('scroll lock', () => {
  test('the document is locked and the vanished scrollbar is compensated: the header does not shift, on open or on close', async () => {
    const v = await visit('/ru/');
    await v.bring(3);
    const sbw = await v.page.evaluate(() => innerWidth - document.documentElement.clientWidth);
    assert.ok(sbw > 0, `classic scrollbar present (${sbw}px)`);
    const before = await logoX(v.page);
    await v.open(3);
    const y = await v.page.evaluate(() => scrollY);
    let s = await v.state();
    assert.equal(s.locked, true);
    assert.equal(s.sbw, `${sbw}px`);
    assert.equal(await v.page.evaluate(() => innerWidth - document.documentElement.clientWidth), 0, 'no scrollbar while locked');
    assert.equal(await logoX(v.page), before, 'the logo stays put while open');
    const pad = await v.page.evaluate(() => ({
      html: getComputedStyle(document.documentElement).paddingRight,
      nav: getComputedStyle(document.querySelector('.nav')).paddingRight,
      vars: [...document.documentElement.style].filter((p) => p.startsWith('--')),
    }));
    assert.equal(pad.html, `${sbw}px`, 'the page keeps the scrollbar width as padding');
    assert.equal(pad.nav, `${sbw}px`, 'so does the fixed header');
    assert.deepEqual(pad.vars, [], 'no custom property is written on <html> for it (that would restyle the whole page)');
    await v.page.mouse.move(200, 450);
    await v.page.mouse.wheel(0, 600);
    await v.page.waitForTimeout(200);
    assert.equal(await v.page.evaluate(() => scrollY), y, 'the page behind does not scroll');
    await v.page.keyboard.press('Escape');
    assert.equal((await v.state()).locked, true, 'the lock outlives the exit');
    await v.closed();
    s = await v.state();
    assert.equal(s.locked, false);
    assert.equal(await logoX(v.page), before, 'the logo stays put after closing');
    assert.equal(await v.page.evaluate(() => getComputedStyle(document.querySelector('.nav')).paddingRight), '0px', 'the header padding is gone with the lock');
    assert.equal(await v.page.evaluate(() => innerWidth - document.documentElement.clientWidth), sbw, 'the scrollbar is back');
    await v.done();
  });
});

describe('deep links', () => {
  test('/ru/#case-3 opens the third case at load, instantly, with the card in view behind it; closing clears the hash', async () => {
    const v = await visit('/ru/#case-3');
    const s = await v.state();
    assert.equal(s.open, true);
    assert.deepEqual(s.shown, [3]);
    assert.equal(s.locked, true);
    assert.equal(s.active.id, 'case-sheet-title-3');
    const panel = await v.page.evaluate(() => {
      const r = document.querySelector('#case-3').getBoundingClientRect();
      return { instant: document.querySelector('[data-sheet]').classList.contains('is-instant'), transform: getComputedStyle(document.querySelector('.sheet__panel')).transform, anims: document.querySelector('.sheet__panel').getAnimations().length, cardInView: r.top >= 0 && r.bottom <= innerHeight, scrolled: scrollY > 0 };
    });
    assert.deepEqual(panel, { instant: false, transform: 'none', anims: 0, cardInView: true, scrolled: true });
    assert.deepEqual(await content(v.page), expected(ru, 3));
    // the language links carry the case
    const hrefs = await v.page.$$eval('a[data-lang-link]', (els) => els.map((a) => a.getAttribute('href')));
    for (const h of hrefs) assert.match(h, /^\/(?:(?:ru|az|de)\/)?#case-3$/, h);
    await v.page.keyboard.press('Escape');
    await v.closed();
    assert.equal(await v.page.evaluate(() => location.href.endsWith('/')), true, 'hash cleared');
    assert.equal((await v.state()).active.caseOpen, '3');
    await v.done();
  });

  test('#case-0 and #case-99 open nothing', async () => {
    for (const path of ['/#case-0', '/#case-99', '/#case-x']) {
      const v = await visit(path);
      assert.equal((await v.state()).hidden, true, path);
      await v.done();
    }
  });

  test('the language switch from the ⌘K palette keeps the case open in the other language', async () => {
    const v = await visit('/ru/#case-3');
    await v.page.keyboard.press('Control+KeyK');
    await v.page.waitForSelector('[data-cmd].is-open', { state: 'attached', timeout: 2000 });
    assert.equal(await v.page.evaluate(() => document.activeElement.id), 'cmd-input', 'the palette opens on top of the sheet');
    await v.page.keyboard.type('english');
    await Promise.all([v.page.waitForURL((u) => u.pathname === '/' && u.hash === '#case-3'), v.page.keyboard.press('Enter')]);
    await v.page.waitForLoadState('networkidle');
    const s = await v.state();
    assert.equal(s.path, '/');
    assert.equal(s.open, true);
    assert.deepEqual(s.shown, [3]);
    assert.deepEqual(await content(v.page), expected(en, 3));
    await v.done();
  });

  test('a section jump from the palette closes the sheet and lets the page scroll', async () => {
    const v = await visit('/ru/');
    await v.open(2);
    await v.page.keyboard.press('Control+KeyK');
    await v.page.waitForSelector('[data-cmd].is-open', { state: 'attached', timeout: 2000 });
    await v.page.keyboard.press('Escape'); // closes the palette only
    await v.page.waitForSelector('[data-cmd]', { state: 'hidden' });
    let s = await v.state();
    assert.equal(s.open, true, 'the sheet is still open');
    assert.equal(s.inside, true, 'focus came back into the sheet');
    await v.page.keyboard.press('Control+KeyK');
    await v.page.waitForSelector('[data-cmd].is-open', { state: 'attached', timeout: 2000 });
    await v.page.keyboard.type('цен');
    await v.page.keyboard.press('Enter');
    await v.page.waitForFunction(() => location.hash === '#pricing');
    await v.closed();
    s = await v.state();
    assert.equal(s.locked, false);
    assert.equal(s.hash, '#pricing');
    await v.done();
  });
});

describe('CTA → request form', () => {
  test('«Хочу так же» closes the sheet, preselects the matching service chip and flashes the handoff accent', async () => {
    const v = await visit('/ru/');
    await v.open(1); // an app case → the "app" service
    await v.page.click('[data-sheet-case]:not([hidden]) [data-sheet-cta]');
    await v.closed();
    await v.page.waitForFunction(() => location.hash === '#contact');
    assert.deepEqual(await v.page.$$eval('input[name="services"]:checked', (els) => els.map((e) => e.value)), ['app']);
    const s = await v.state();
    assert.equal(s.locked, false, 'unlocked at once: the page scrolls to the form');
    assert.deepEqual([s.active.tag, s.active.value], ['INPUT', 'app'], 'focus lands on the chosen chip');
    await v.page.waitForSelector('[data-pick].is-hint', { state: 'attached', timeout: 6000 });
    assert.equal(await v.page.$eval('input[name="services"][value="app"]', (el) => el.closest('.pick__item').classList.contains('is-hint')), true);
    await v.page.waitForSelector('[data-pick].is-hint', { state: 'detached', timeout: 6000 });
    // web → site, ads → ads, design → design
    assert.deepEqual(await v.page.$$eval('[data-sheet-cta]', (els) => els.map((b) => b.dataset.service)), ru.cases.items.map((c) => SERVICE[c.type]));
    await v.done();
  });
});

describe('phones', () => {
  test('a full-screen panel that scrolls inside while the page behind stays put', async () => {
    const v = await visit('/ru/', MOBILE);
    await v.open(2);
    const m = await v.page.evaluate(() => {
      const r = document.querySelector('.sheet__panel').getBoundingClientRect();
      const sc = document.querySelector('[data-sheet-scroll]');
      return { rect: [r.x, r.y, r.width, r.height], scrollable: sc.scrollHeight > sc.clientHeight, y: scrollY };
    });
    assert.deepEqual(m.rect, [0, 0, 390, 844]);
    assert.equal(m.scrollable, true);
    await v.page.$eval('[data-sheet-scroll]', (el) => (el.scrollTop = 100));
    await v.page.waitForTimeout(100);
    assert.equal(await v.page.evaluate(() => scrollY), m.y, 'the page did not move');
    assert.equal(await v.page.$eval('[data-sheet-scroll]', (el) => el.scrollTop), 100);
    assert.deepEqual(await content(v.page), expected(ru, 2));
    await v.page.tap('[data-sheet-close]');
    await v.closed();
    assert.equal((await v.state()).active.caseOpen, '2');
    await v.done();
  });

  test('/#case-9 on a phone expands the collapsed grid, so the card exists behind the sheet and takes the focus back', async () => {
    const v = await visit('/#case-9', MOBILE);
    const s = await v.state();
    assert.equal(s.open, true);
    assert.deepEqual(s.shown, [9]);
    assert.equal(await v.page.$eval('[data-cases-root]', (el) => el.classList.contains('is-collapsed')), false);
    assert.equal(await v.page.$eval('#case-9', (el) => el.getClientRects().length > 0), true);
    await v.page.keyboard.press('Escape');
    await v.closed();
    assert.equal((await v.state()).active.caseOpen, '9');
    await v.done();
  });
});

describe('hover data sheet on the cards', () => {
  const rows = (page, n) =>
    page.$$eval(`#case-${n} .case__fact`, (els) =>
      els.map((e) => {
        const cs = getComputedStyle(e);
        // one delay per transitioned property: the first row has none ('0s, 0s'), the others one for both
        return { opacity: cs.opacity, transform: cs.transform, delay: cs.transitionDelay.split(',')[0].trim(), dur: cs.transitionDuration, props: cs.transitionProperty, text: [e.querySelector('dt').textContent, e.querySelector('dd').textContent] };
      }),
    );
  const artOpacity = (page, n) => page.$eval(`#case-${n} .case__art svg`, (el) => getComputedStyle(el).opacity);
  const shown = (page, n) => page.waitForFunction((sel) => [...document.querySelectorAll(sel)].every((e) => getComputedStyle(e).opacity === '1'), `#case-${n} .case__fact`, { timeout: 2000 });
  const gone = (page, n) => page.waitForFunction((sel) => [...document.querySelectorAll(sel)].every((e) => getComputedStyle(e).opacity === '0'), `#case-${n} .case__fact`, { timeout: 2000 });

  test('a fine pointer dims the art to .55 and brings three mono rows in 30ms apart; keyboard focus does the same; the rows never take the pointer', async () => {
    const v = await visit('/ru/');
    await v.bring(3); // in the arena the data sheet is the front card's hover / focus gesture
    const rest = await rows(v.page, 3);
    assert.equal(rest.length, 3);
    for (const r of rest) {
      assert.equal(r.opacity, '0');
      assert.equal(r.transform, 'matrix(1, 0, 0, 1, 0, 6)', 'parked 6px low');
      assert.equal(r.dur, '0.2s, 0.2s');
    }
    assert.equal(await v.page.$eval('#case-3 .case__facts', (el) => el.getAttribute('aria-hidden') + ' ' + getComputedStyle(el).pointerEvents), 'true none');
    await v.hoverCard(3);
    // the hover state lands with the rAF-aligned mousemove — a frame later on a loaded machine
    await v.page.waitForFunction(() => getComputedStyle(document.querySelector('#case-3 .case__fact:nth-child(2)')).transitionDelay.split(',')[0].trim() === '0.03s', null, { timeout: 2000 });
    const mid = await rows(v.page, 3);
    assert.deepEqual(mid.map((r) => r.delay), ['0s', '0.03s', '0.06s']);
    await shown(v.page, 3);
    const on = await rows(v.page, 3);
    assert.ok(on.every((r) => r.transform === 'none'));
    const c = ru.cases.items[2];
    const sh = ru.cases.sheet;
    assert.deepEqual(on.map((r) => r.text), [[sh.direction, c.kind], [sh.tech, c.tags], [sh.result, c.result]]);
    assert.equal(await artOpacity(v.page, 3), '0.55');
    // the pointer over the rows still hits the button that opens the case sheet
    const hit = await v.page.$eval('#case-3 .case__fact:last-child', (el) => {
      const r = el.getBoundingClientRect();
      return document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2).closest('.case__open') !== null;
    });
    assert.equal(hit, true);
    await v.page.mouse.move(4, 4);
    await gone(v.page, 3);
    assert.equal(await artOpacity(v.page, 3), '1');
    assert.equal(await v.page.$eval('#case-3 .case__result', (el) => getComputedStyle(el).opacity), '1', 'the result under the title is untouched');
    // keyboard focus on the card's button shows the same sheet
    await v.page.focus('#case-3 .case__open');
    await shown(v.page, 3);
    assert.equal(await artOpacity(v.page, 3), '0.55');
    await v.done();
  });

  test('touch (390): no hover sheet', async () => {
    const v = await visit('/ru/', MOBILE);
    await v.bring(1); // case 2 is the side card to the right
    assert.equal(await v.page.evaluate(() => matchMedia('(hover: hover) and (pointer: fine)').matches), false);
    await v.hoverCard(2);
    await v.page.waitForTimeout(400);
    assert.ok((await rows(v.page, 2)).every((r) => r.opacity === '0'));
    assert.equal(await artOpacity(v.page, 2), '1');
    await v.done();
  });

  test('reduced motion: the rows fade in place', async () => {
    const v = await visit('/ru/', REDUCED);
    await v.scrollTo('#case-3');
    const rest = await rows(v.page, 3);
    assert.ok(rest.every((r) => r.transform === 'none' && r.props === 'opacity' && r.dur === '0.2s'), JSON.stringify(rest[0]));
    await v.page.hover('#case-3');
    await shown(v.page, 3);
    assert.equal(await artOpacity(v.page, 3), '0.55');
    await v.done();
  });
});

describe('shared-element flight', () => {
  test('on desktop the clicked card art flies into the sheet (320ms ease-out, transform only) and the sheet art takes over where it lands', async () => {
    const v = await visit('/ru/');
    await v.bring(3);
    const from = await v.page.$eval('#case-3 .case__art svg', (el) => el.getBoundingClientRect().toJSON());
    const start = await v.page.evaluate(() => {
      document.querySelector('#case-3 .case__open').click();
      const g = document.querySelector('.sheet__ghost');
      const a = g && g.getAnimations()[0];
      return g && {
        flying: document.querySelector('[data-sheet]').classList.contains('is-flying'),
        artHidden: getComputedStyle(document.querySelector('[data-sheet-case="3"] .sheet__art')).visibility,
        box: [g.style.left, g.style.top, g.style.width, g.style.height].map(parseFloat),
        timing: a && [a.effect.getTiming().duration, a.effect.getTiming().easing, a.effect.getTiming().fill],
        frames: a && a.effect.getKeyframes().map((k) => k.transform),
        svg: g.querySelector('svg') !== null,
        z: getComputedStyle(g).zIndex,
      };
    });
    assert.ok(start, 'a ghost is in flight');
    assert.equal(start.flying, true);
    assert.equal(start.artHidden, 'hidden', 'the sheet art waits underneath');
    assert.deepEqual(start.timing, [320, 'cubic-bezier(0.22, 1, 0.36, 1)', 'both']);
    assert.match(start.frames[0], /^translate\(-?[\d.]+px, -?[\d.]+px\) scale\([\d.]+, [\d.]+\)$/);
    assert.equal(start.frames[1], 'none');
    assert.equal(start.svg, true);
    assert.equal(start.z, '81');
    // the first keyframe puts the ghost exactly over the card's art
    const [tx, ty, sx] = start.frames[0].match(/-?[\d.]+/g).map(Number);
    assert.ok(Math.abs(start.box[0] + tx - from.x) < 1 && Math.abs(start.box[1] + ty - from.y) < 1, `starts at the card art (${start.box[0] + tx},${start.box[1] + ty} vs ${from.x},${from.y})`);
    assert.ok(Math.abs(start.box[2] * sx - from.width) < 1, 'at the card art size');
    await v.page.waitForFunction(() => !document.querySelector('.sheet__ghost') && !document.querySelector('[data-sheet]').classList.contains('is-flying'), null, { timeout: 3000 });
    const landed = await v.page.$eval('[data-sheet-case="3"] .sheet__art', (el) => ({ vis: getComputedStyle(el).visibility, rect: el.getBoundingClientRect().toJSON() }));
    assert.equal(landed.vis, 'visible');
    assert.ok(Math.abs(landed.rect.x - start.box[0]) < 1 && Math.abs(landed.rect.y - start.box[1]) < 1 && Math.abs(landed.rect.width - start.box[2]) < 1, `the ghost's box is the sheet art's box: ${JSON.stringify(landed.rect)} vs ${start.box}`);
    await v.page.keyboard.press('Escape');
    assert.equal(await v.page.$('.sheet__ghost'), null, 'no flight on close');
    await v.closed();
    await v.done();
  });

  test('no flight on phones, under reduced motion, from a deep link or when paging', async () => {
    const m = await visit('/ru/', MOBILE);
    await m.bring(2);
    const tapped = await m.page.evaluate(() => {
      document.querySelector('#case-2 .case__open').click();
      return document.querySelector('.sheet__ghost') === null;
    });
    assert.equal(tapped, true, 'phones');
    await m.done();
    const r = await visit('/ru/', REDUCED);
    await r.scrollTo('#case-3');
    assert.equal(await r.page.evaluate(() => { document.querySelector('#case-3 .case__open').click(); return document.querySelector('.sheet__ghost') === null; }), true, 'reduced motion');
    await r.done();
    const d = await visit('/ru/#case-3');
    assert.equal(await d.page.$('.sheet__ghost'), null, 'deep link');
    assert.equal(await d.page.evaluate(() => { document.querySelector('[data-sheet-next]').click(); return document.querySelector('.sheet__ghost') === null; }), true, 'paging');
    await d.done();
  });
});

describe('reduced motion', () => {
  test('the panel fades in place, nothing staggers, a page turn is a plain fade', async () => {
    const v = await visit('/ru/', REDUCED);
    await v.scrollTo('#case-3');
    const m = await v.page.evaluate(() => {
      document.querySelector('#case-3 .case__open').click();
      const cs = getComputedStyle(document.querySelector('.sheet__panel'));
      const items = [...document.querySelectorAll('[data-sheet-case]:not([hidden]) .sheet__art, [data-sheet-case]:not([hidden]) .sheet__text > *')];
      return { props: cs.transitionProperty, dur: cs.transitionDuration, transform: cs.transform, entering: document.querySelector('[data-sheet]').classList.contains('is-entering'), anims: items.reduce((n, el) => n + el.getAnimations().length, 0) };
    });
    assert.deepEqual(m, { props: 'opacity', dur: '0.15s', transform: 'none', entering: false, anims: 0 });
    await v.opened();
    const swap = await v.page.evaluate(() => {
      document.querySelector('[data-sheet-next]').click();
      return document.querySelector('[data-sheet-case]:not([hidden])').getAnimations().map((x) => [x.animationName, x.effect.getTiming().duration]);
    });
    assert.deepEqual(swap, [['sheet-fade', 120]]);
    await v.page.keyboard.press('Escape');
    await v.closed();
    await v.done();
  });
});

describe('clean console and CSP', () => {
  test('/ru/, /, /az/ and /de/: open, page, close — no errors, no violations; the chrome is translated', async () => {
    for (const [lang, path] of Object.entries(LANG_PATHS)) {
      const t = CONTENT[lang];
      const v = await visit(path);
      const chrome = await v.page.evaluate(() => ({
        kicker: document.querySelector('[data-sheet]').dataset.sheetKicker,
        prev: document.querySelector('[data-sheet-prev]').getAttribute('aria-label'),
        next: document.querySelector('[data-sheet-next]').getAttribute('aria-label'),
        close: document.querySelector('[data-sheet-close]').getAttribute('aria-label'),
        cta: document.querySelector('[data-sheet-cta]').textContent.trim(),
      }));
      assert.deepEqual(chrome, { kicker: t.cases.sheet.kicker, prev: t.cases.sheet.prev, next: t.cases.sheet.next, close: t.cases.sheet.close, cta: t.cases.sheet.cta }, lang);
      await v.open(1);
      assert.deepEqual(await content(v.page), expected(t, 1), lang);
      await v.page.keyboard.press('ArrowRight');
      assert.deepEqual(await content(v.page), expected(t, 2), lang);
      await v.page.keyboard.press('Escape');
      await v.closed();
      await v.done();
    }
  });
});
