/**
 * Reference motion adapted from the emotion-agency brief: the reading-paced ink fill on the About
 * manifesto (src/scripts/ink.ts + About.astro, markup from i18n ink()), sibling dimming on hover in the
 * Trust and Industries grids (Trust.astro, Industries.astro) and the ↳ + accent-word motif on the Contact
 * headline (SectionHead.astro, Icons.astro, i18n contact.title `{{accent}}`), and the stacked-label CTA hover
 * ("Let's talk ↳": .btn--swap / .btn__label in global.css — the label rides up out of its clip while a CSS copy
 * rides in from below; the primary button's existing 2px arrow nudge stays), and the character decode of the
 * section eyebrows on their first reveal (src/scripts/decode.ts, triggered by reveal.ts on `[data-decode]`).
 */
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { DESKTOP, LANG_PATHS, MOBILE, fixture, openPage } from './helpers.mjs';

const f = fixture();
before(f.setup);
after(f.teardown);

const REDUCED = { ...DESKTOP, reducedMotion: 'reduce' };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function visit(path, options = DESKTOP) {
  const context = await f.state.browser.newContext(options);
  const { page, problems } = await openPage(context);
  await page.goto(f.state.base + path, { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto';
  });
  /** scrolls so that the element's top sits at `frac` of the viewport height */
  const topAt = (selector, frac) =>
    page.evaluate(
      ([s, fr]) => {
        const el = document.querySelector(s);
        scrollTo(0, Math.round(el.getBoundingClientRect().top + scrollY - innerHeight * fr));
      },
      [selector, frac],
    );
  /** waits until every element matching `selector` has played its entrance (reveal.ts stripped the classes) */
  const revealed = (selector) => page.waitForFunction((s) => [...document.querySelectorAll(s)].every((el) => !el.classList.contains('reveal')), selector, { timeout: 8000 });
  const done = async () => {
    assert.deepEqual(await problems(), []);
    await context.close();
  };
  return { page, topAt, revealed, done };
}

/* ------------------------------------------------------------------------------------------ */
describe('reading-paced ink fill (About manifesto)', () => {
  const words = (page) => page.$$eval('[data-ink] .w', (els) => els.map((w) => +getComputedStyle(w).opacity));
  const state = (page) => page.$eval('[data-ink]', (p) => ({ p: p.style.getPropertyValue('--p'), n: p.style.getPropertyValue('--n'), count: p.querySelectorAll('.w').length }));
  const pIs = (page, frac) => {
    const want = Math.min(1, Math.max(0, (0.8 - frac) / 0.45));
    return page.waitForFunction((w) => Math.abs(parseFloat(document.querySelector('[data-ink]').style.getPropertyValue('--p')) - w) < 0.02, want, { timeout: 4000 });
  };
  const monotonic = (o) => o.every((v, i) => i === 0 || v <= o[i - 1] + 1e-9);

  for (const [name, options] of [
    ['desktop', DESKTOP],
    ['phone', MOBILE],
  ]) {
    test(`${name}: words fill in reading order from 80% to 35% of the viewport, never below .38, all read once passed`, async () => {
      const t = await visit('/ru/', options);
      const s = await state(t.page);
      assert.equal(s.count, 24, 'every word of the RU manifesto is a span');
      assert.equal(s.n, '24', '--n is the word count');
      assert.deepEqual(await t.page.$$eval('[data-ink] .w', (els) => els.map((w) => w.style.getPropertyValue('--i') === w.dataset.i)), new Array(24).fill(true), '--i follows data-i');
      assert.deepEqual(await t.page.$$eval('[data-ink] .w .hl', (els) => els.map((e) => e.textContent)), ['Google', 'нейросети', 'роботы'], 'the highlights live inside the word spans');

      // not yet reading: everything at the ink floor
      await t.topAt('[data-ink]', 0.9);
      await pIs(t.page, 0.9);
      const before = await words(t.page);
      assert.ok(before.every((o) => o === 0.38), `all at .38 before the paragraph reaches 80%: ${before.join(' ')}`);

      // three positions in the fill: monotonic in reading order, within [.38, 1], the frontier advancing
      let lastRead = -1;
      for (const frac of [0.7, 0.57, 0.45]) {
        await t.topAt('[data-ink]', frac);
        await pIs(t.page, frac);
        const o = await words(t.page);
        assert.ok(monotonic(o), `${frac}: reading order ${o.join(' ')}`);
        assert.ok(o.every((v) => v >= 0.38 && v <= 1), `${frac}: within [.38, 1]`);
        assert.equal(o[0], 1, `${frac}: the first word is read`);
        assert.equal(o[o.length - 1], 0.38, `${frac}: the last word is not`);
        const read = o.filter((v) => v === 1).length;
        assert.ok(read > lastRead, `${frac}: more words read than before (${read} > ${lastRead})`);
        assert.ok(o.some((v) => v > 0.38 && v < 1), `${frac}: a soft edge between read and unread`);
        lastRead = read;
      }

      // passed 35%: everything read
      await t.topAt('[data-ink]', 0.3);
      await pIs(t.page, 0.3);
      assert.ok((await words(t.page)).every((o) => o === 1), 'all read once the paragraph has climbed past 35%');
      assert.equal((await state(t.page)).p, '1.00');

      // the fill is scrubbed, not one-shot: scrolling back dims the unread words again
      await t.topAt('[data-ink]', 0.7);
      await pIs(t.page, 0.7);
      assert.ok((await words(t.page)).some((o) => o === 0.38));
      await t.done();
    });
  }

  test('reduced motion: nothing is written and every word is simply there', async () => {
    const t = await visit('/ru/', REDUCED);
    await t.topAt('[data-ink]', 0.6);
    await sleep(200);
    const s = await state(t.page);
    assert.equal(s.p, '');
    assert.equal(s.n, '');
    assert.ok((await words(t.page)).every((o) => o === 1));
    await t.done();
  });

  test('without JavaScript the words are at 100%', async () => {
    const t = await visit('/ru/', { ...DESKTOP, javaScriptEnabled: false });
    assert.equal(await t.page.$$eval('[data-ink] .w', (els) => els.length), 24);
    assert.ok((await words(t.page)).every((o) => o === 1));
    await t.done();
  });
});

/* ------------------------------------------------------------------------------------------ */
describe('sibling dimming on hover (Trust, Industries)', () => {
  const trust = (page) => page.$$eval('.trust__item', (els) => els.map((it) => [...it.children].map((c) => +getComputedStyle(c).opacity)));
  const ind = (page) => page.$$eval('.ind', (els) => els.map((e) => +getComputedStyle(e).opacity));
  const centre = (page, selector) => page.$eval(selector, (el) => {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });

  test('hovering a guarantee dims the other five tiles to .6 in 200ms with no delay; leaving the grid restores them', async () => {
    const t = await visit('/ru/');
    await t.topAt('.trust__grid', 0.2);
    await t.revealed('.trust__item');
    assert.deepEqual(await t.page.$eval('.trust__item > *', (c) => [getComputedStyle(c).transitionProperty, getComputedStyle(c).transitionDuration, getComputedStyle(c).transitionDelay]), ['opacity', '0.2s', '0s']);
    await t.page.hover('.trust__item[data-i="1"] .trust__title');
    await sleep(250);
    const o = await trust(t.page);
    assert.deepEqual(
      o.map((tile) => tile.every((v) => v === 1)),
      [false, true, false, false, false, false],
      `only the hovered tile stays at 100%: ${JSON.stringify(o)}`,
    );
    assert.ok(o.every((tile, i) => i === 1 || tile.every((v) => v === 0.65)), `the siblings' content sits at .65: ${JSON.stringify(o)}`);
    // the tile keeps its own pane: the dim is on the content, so the hairline grid never bleeds through
    assert.equal(await t.page.$eval('.trust__item[data-i="0"]', (el) => getComputedStyle(el).opacity), '1');
    await t.page.mouse.move(8, 8);
    await sleep(250);
    assert.ok((await trust(t.page)).every((tile) => tile.every((v) => v === 1)), 'restored after the pointer leaves');
    await t.done();
  });

  test('sweeping across three tiles is one calm crossfade: the hovered tile never drops below .55, nothing undershoots .6', async () => {
    const t = await visit('/ru/');
    await t.topAt('.trust__grid', 0.2);
    await t.revealed('.trust__item');
    const a = await centre(t.page, '.trust__item[data-i="0"]');
    const c = await centre(t.page, '.trust__item[data-i="2"]');
    await t.page.mouse.move(a.x, a.y);
    await sleep(250);
    const samples = [];
    const steps = 36;
    for (let i = 0; i <= steps; i++) {
      await t.page.mouse.move(a.x + ((c.x - a.x) * i) / steps, a.y);
      samples.push(
        await t.page.evaluate(() => ({
          hovered: [...document.querySelectorAll('.trust__item')].findIndex((el) => el.matches(':hover')),
          tiles: [...document.querySelectorAll('.trust__item')].map((it) => Math.min(...[...it.children].map((ch) => +getComputedStyle(ch).opacity))),
        })),
      );
    }
    const visited = new Set(samples.map((s) => s.hovered).filter((h) => h >= 0));
    assert.deepEqual([...visited].sort(), [0, 1, 2], 'the sweep crossed all three tiles');
    for (const s of samples) {
      if (s.hovered >= 0) assert.ok(s.tiles[s.hovered] >= 0.55, `hovered tile ${s.hovered} at ${s.tiles[s.hovered]} mid-sweep`);
      assert.ok(s.tiles.every((v) => v >= 0.65 - 1e-6), `no tile undershoots .65: ${s.tiles.join(' ')}`);
    }
    await sleep(250);
    const end = await trust(t.page);
    assert.ok(end[2].every((v) => v === 1) && end[0].every((v) => v === 0.65) && end[1].every((v) => v === 0.65), `settled on the third tile: ${JSON.stringify(end)}`);
    await t.done();
  });

  test('industries: the hovered card stays, the others dim as whole cards; keyboard focus on a card link does the same', async () => {
    const t = await visit('/ru/');
    await t.topAt('.ind__grid', 0.2);
    await t.revealed('.ind');
    assert.match(await t.page.$eval('.ind', (el) => getComputedStyle(el).transition), /opacity 0\.2s/);
    await t.page.hover('.ind[data-i="2"] .ind__title');
    await sleep(250);
    assert.deepEqual(await ind(t.page), [0.65, 0.65, 1, 0.65]);
    await t.page.mouse.move(8, 8);
    await sleep(250);
    assert.deepEqual(await ind(t.page), [1, 1, 1, 1]);

    await t.page.focus('.ind[data-i="1"] .link-arrow');
    await sleep(250);
    assert.deepEqual(await ind(t.page), [0.65, 1, 0.65, 0.65], 'focus-within dims the others');
    // hover and focus on different cards: both stay readable
    await t.page.hover('.ind[data-i="3"] .ind__title');
    await sleep(250);
    assert.deepEqual(await ind(t.page), [0.65, 1, 0.65, 1]);
    await t.page.evaluate(() => document.activeElement.blur());
    await t.page.mouse.move(8, 8);
    await sleep(250);
    assert.deepEqual(await ind(t.page), [1, 1, 1, 1]);
    await t.done();
  });

  test('touch: no fine pointer, no dimming', async () => {
    const t = await visit('/ru/', MOBILE);
    assert.equal(await t.page.evaluate(() => matchMedia('(hover: hover) and (pointer: fine)').matches), false);
    await t.topAt('.trust__grid', 0.2);
    await t.revealed('.trust__item[data-i="1"]'); // one column on a phone: the lower tiles are still below the fold
    await t.page.tap('.trust__item[data-i="1"] .trust__title');
    await sleep(250);
    assert.ok((await trust(t.page)).every((tile) => tile.every((v) => v === 1)));
    await t.done();
  });

  test('reduced motion: the dim is instant (no transition) and still only on the siblings', async () => {
    const t = await visit('/ru/', REDUCED);
    await t.topAt('.trust__grid', 0.2);
    await t.revealed('.trust__item');
    assert.equal(await t.page.$eval('.trust__item > *', (c) => getComputedStyle(c).transitionDuration), '0s');
    await t.page.hover('.trust__item[data-i="3"] .trust__title');
    await t.page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    const o = await trust(t.page);
    assert.ok(o[3].every((v) => v === 1) && o.every((tile, i) => i === 3 || tile.every((v) => v === 0.65)), JSON.stringify(o));
    await t.done();
  });
});

/* ------------------------------------------------------------------------------------------ */
describe('contact headline motif (↳ + accent word)', () => {
  const ACCENT = { ru: 'будущее', en: 'future', az: 'gələcəyi', de: 'Zukunft' };
  const TITLE = { ru: 'Давайте строитьбудущее вместе', en: 'Let’s buildthe future together', az: 'Gəlin gələcəyibirlikdə quraq', de: 'Lassen Sie uns gemeinsamdie Zukunft bauen' };

  for (const [lang, path] of Object.entries(LANG_PATHS)) {
    test(`${lang}: the accent word is lime with the glyph before it, on one line, numbering kept`, async () => {
      const t = await visit(path);
      const m = await t.page.$eval('.contact .section-head', (head) => {
        const h2 = head.querySelector('.h2');
        const motif = h2.querySelector('.h2__motif');
        const glyph = motif?.querySelector('.h2__glyph');
        const word = motif?.querySelector('.hl');
        return {
          text: h2.textContent,
          eyebrow: head.querySelector('.eyebrow').textContent,
          motifs: h2.querySelectorAll('.h2__motif').length,
          glyphFirst: motif?.firstElementChild === glyph,
          use: glyph?.querySelector('use')?.getAttribute('href'),
          symbol: !!document.getElementById('i-arrow-turn'),
          hidden: glyph?.getAttribute('aria-hidden'),
          word: word?.textContent,
          color: word && getComputedStyle(word).color,
          nowrap: motif && getComputedStyle(motif).whiteSpace,
          glyphEm: glyph && Math.round((glyph.getBoundingClientRect().width / parseFloat(getComputedStyle(h2).fontSize)) * 100) / 100,
        };
      });
      assert.equal(m.text, TITLE[lang], 'no {{ }} leaks into the heading');
      assert.match(m.eyebrow, /^10/, 'the section index stays');
      assert.equal(m.motifs, 1);
      assert.equal(m.glyphFirst, true);
      assert.equal(m.use, '#i-arrow-turn');
      assert.equal(m.symbol, true);
      assert.equal(m.hidden, 'true');
      assert.equal(m.word, ACCENT[lang]);
      assert.equal(m.color, 'rgb(198, 255, 74)');
      assert.equal(m.nowrap, 'nowrap');
      assert.equal(m.glyphEm, 0.78);
      await t.done();
    });
  }

  test('on reveal the word slides in from −24px and the glyph follows 120ms later (600ms, long ease-out, from scale .9); the h2 is clean afterwards', async () => {
    const t = await visit('/ru/');
    // time the reveal from the page: when `.is-in` lands on the h2 and when reveal.ts strips `.reveal`
    await t.page.$eval('.contact .h2', (h2) => {
      window.__motif = {};
      new MutationObserver(() => {
        if (h2.classList.contains('is-in') && !window.__motif.in) window.__motif.in = performance.now();
        if (!h2.classList.contains('reveal') && !window.__motif.out) window.__motif.out = performance.now();
      }).observe(h2, { attributes: true, attributeFilter: ['class'] });
    });
    await t.topAt('.contact__sh', 0.2);
    await t.page.waitForFunction(() => document.querySelector('.contact .h2').classList.contains('is-in'), null, { timeout: 4000 });
    const a = await t.page.$eval('.contact .h2', (h2) => {
      const d = parseFloat(h2.style.getPropertyValue('--d')) || 0;
      const read = (el) => {
        const an = el.getAnimations().find((x) => x.animationName?.startsWith('motif-'));
        if (!an) return null;
        const k = an.effect.getKeyframes();
        return { name: an.animationName, ...an.effect.getTiming(), from: k[0], to: k[k.length - 1] };
      };
      return { d, glyph: read(h2.querySelector('.h2__glyph')), word: read(h2.querySelector('.h2__motif .hl')) };
    });
    assert.ok(a.word && a.glyph, 'both motif animations are running');
    assert.equal(a.word.name, 'motif-word');
    assert.equal(a.word.duration, 600);
    assert.equal(a.word.delay, a.d);
    assert.equal(a.word.fill, 'backwards');
    // Chromium serialises translateX(…) in keyframes as translate(…)
    assert.match(a.word.from.transform, /^translateX?\(-24px\)$/);
    assert.equal(a.word.from.easing, 'cubic-bezier(0.16, 1, 0.3, 1)');
    assert.equal(a.glyph.name, 'motif-glyph');
    assert.equal(a.glyph.duration, 600);
    assert.ok(Math.abs(a.glyph.delay - (a.d + 120)) < 0.01, `glyph starts 120ms after the word: ${a.glyph.delay} vs ${a.d}`);
    assert.equal(a.glyph.fill, 'backwards');
    assert.equal(a.glyph.from.opacity, '0');
    assert.match(a.glyph.from.transform, /^translateX?\(-12px\) scale\(0\.9\)$/);
    assert.equal(a.glyph.from.easing, 'cubic-bezier(0.16, 1, 0.3, 1)');
    assert.equal(a.glyph.to.transform, 'none');

    await t.page.waitForFunction(() => !document.querySelector('.contact .h2').classList.contains('reveal'), null, { timeout: 4000 });
    const end = await t.page.$eval('.contact .h2', (h2) => {
      const g = h2.querySelector('.h2__glyph');
      const w = h2.querySelector('.h2__motif .hl');
      return { cls: h2.className, glyph: [getComputedStyle(g).opacity, getComputedStyle(g).transform], word: getComputedStyle(w).transform, anims: g.getAnimations().length + w.getAnimations().length, held: window.__motif.out - window.__motif.in };
    });
    assert.equal(end.cls, 'h2', 'reveal classes stripped');
    assert.deepEqual(end.glyph, ['1', 'none']);
    assert.equal(end.word, 'none');
    assert.equal(end.anims, 0);
    assert.ok(end.held >= a.d + 700 && end.held < a.d + 1200, `reveal.ts waited for the glyph (${a.d + 720}ms) before stripping: ${Math.round(end.held)}ms`);
    await t.done();
  });

  test('phone: the glyph and the word share a line and the motif renders', async () => {
    const t = await visit('/ru/', MOBILE);
    await t.topAt('.contact__sh', 0.2);
    await t.page.waitForFunction(() => !document.querySelector('.contact .h2').classList.contains('reveal'), null, { timeout: 6000 });
    const r = await t.page.$eval('.contact .h2__motif', (m) => {
      const g = m.querySelector('.h2__glyph').getBoundingClientRect();
      const w = m.querySelector('.hl').getBoundingClientRect();
      return { sameLine: Math.abs(g.bottom - w.bottom) < w.height / 2, before: g.right <= w.left + 1, vis: getComputedStyle(m.querySelector('.h2__glyph')).opacity };
    });
    assert.deepEqual(r, { sameLine: true, before: true, vis: '1' });
    await t.done();
  });

  test('reduced motion: no motif animation, only the heading fade; everything visible', async () => {
    const t = await visit('/ru/', REDUCED);
    await t.topAt('.contact__sh', 0.2);
    await t.page.waitForFunction(() => document.querySelector('.contact .h2').classList.contains('is-in'), null, { timeout: 4000 });
    const names = await t.page.$eval('.contact .h2', (h2) => [...h2.querySelectorAll('.h2__glyph, .h2__motif .hl')].flatMap((el) => el.getAnimations().map((a) => a.animationName)));
    assert.deepEqual(names, []);
    await t.page.waitForFunction(() => !document.querySelector('.contact .h2').classList.contains('reveal'), null, { timeout: 4000 });
    assert.deepEqual(await t.page.$eval('.contact .h2__glyph', (g) => [getComputedStyle(g).opacity, getComputedStyle(g).transform]), ['1', 'none']);
    await t.done();
  });
});

/* ------------------------------------------------------------------------------------------ */

describe('stacked-label CTA hover ("Let\'s talk ↳")', () => {
  const SEL = '.hero .btn--primary.btn--swap';
  /** [span transform, span opacity, ::after transform, ::after opacity, svg transform] + the label box height */
  const state = (page, sel = SEL) =>
    page.$eval(sel, (btn) => {
      const label = btn.querySelector('.btn__label');
      const span = label.firstElementChild;
      const cs = (el, pseudo) => getComputedStyle(el, pseudo);
      const r2 = (v) => Math.round(v * 100) / 100;
      const ty = (m) => (m === 'none' ? 0 : r2(+m.match(/matrix\((.+)\)/)[1].split(',')[5]));
      const tx = (m) => (m === 'none' ? 0 : r2(+m.match(/matrix\((.+)\)/)[1].split(',')[4]));
      const svg = btn.querySelector(':scope > svg');
      return {
        h: label.getBoundingClientRect().height,
        span: [ty(cs(span).transform), +cs(span).opacity],
        copy: [ty(cs(label, '::after').transform), +cs(label, '::after').opacity],
        icon: svg ? tx(cs(svg).transform) : null,
        box: (({ width, height }) => [r2(width), r2(height)])(btn.getBoundingClientRect()),
      };
    });

  test('every swap button carries its own text as the copy, on every language, and the link is named once', async () => {
    for (const [lang, path] of Object.entries(LANG_PATHS)) {
      const t = await visit(path);
      const labels = await t.page.$$eval('.btn--swap', (els) =>
        els.map((b) => {
          const l = b.querySelector('.btn__label');
          return [l?.dataset.text, l?.firstElementChild?.textContent, getComputedStyle(l, '::after').content];
        }),
      );
      assert.ok(labels.length >= 6, `${lang}: hero ×2, nav ×2, pricing ×2+: ${labels.length}`);
      for (const [data, text, content] of labels) {
        assert.equal(data, text, `${lang}: data-text mirrors the label`);
        assert.ok(content.startsWith(`"${text}"`), `${lang}: the copy is the generated content: ${content}`);
      }
      const text = labels[0][1];
      assert.ok((await t.page.getByRole('link', { name: text, exact: true }).count()) >= 1, `${lang}: accessible name "${text}" is read once, not doubled by the copy`);
      await t.done();
    }
  });

  test('hover: the label rides up (−110%) as the copy rides in from +110% in 200ms ease-out, the arrow nudges 2px, the button box never changes', async () => {
    const t = await visit('/ru/');
    await t.revealed('.hero .btn');
    // CSS transitions at 1/10 speed so the mid-flight sample lands inside the 200ms, whatever the machine load
    const cdp = await t.page.context().newCDPSession(t.page);
    await cdp.send('Animation.enable');
    await cdp.send('Animation.setPlaybackRate', { playbackRate: 0.1 });
    const before = await state(t.page);
    assert.ok(before.h > 10, 'the label has a line box');
    assert.deepEqual([before.span, before.icon], [[0, 1], 0]);
    assert.ok(Math.abs(before.copy[0] / before.h - 1.1) < 0.05 && before.copy[1] === 0, `the copy waits below the clip: ${JSON.stringify(before.copy)}`);
    assert.deepEqual(
      await t.page.$eval(`${SEL} .btn__label`, (l) => [getComputedStyle(l).overflow, getComputedStyle(l).display, getComputedStyle(l.firstElementChild).transitionDuration, getComputedStyle(l.firstElementChild).transitionDelay, getComputedStyle(l.firstElementChild).transitionTimingFunction]),
      ['hidden', 'grid', '0.2s, 0.2s', '0s, 0s', 'cubic-bezier(0.22, 1, 0.36, 1), cubic-bezier(0.22, 1, 0.36, 1)'],
    );
    await t.page.hover(SEL);
    await sleep(600); // ≈ 60ms of transition time
    const mid = await state(t.page);
    assert.ok(mid.span[0] < 0 && mid.span[0] > -1.1 * mid.h, `mid-flight the label is on its way up: ${mid.span[0]}`);
    assert.ok(mid.copy[0] > 0 && mid.copy[0] < 1.1 * mid.h, `mid-flight the copy is on its way in: ${mid.copy[0]}`);
    assert.deepEqual(mid.box, before.box, 'no reflow while the pair moves');
    await cdp.send('Animation.setPlaybackRate', { playbackRate: 1 });
    await sleep(300);
    const on = await state(t.page);
    assert.ok(Math.abs(on.span[0] / on.h + 1.1) < 0.05 && on.span[1] === 0, `the label is out of the clip: ${JSON.stringify(on.span)}`);
    assert.deepEqual([on.copy, on.icon, on.box], [[0, 1], 2, before.box]);
    await t.page.mouse.move(8, 8);
    await sleep(300);
    const off = await state(t.page);
    assert.deepEqual([off.span, off.icon, off.box], [[0, 1], 0, before.box]);
    assert.ok(Math.abs(off.copy[0] / off.h - 1.1) < 0.05 && off.copy[1] === 0, 'the copy went back down');
    await t.done();
  });

  test('the secondary hero button and the pricing CTAs swap too; the nav CTA swaps without an icon', async () => {
    const t = await visit('/ru/');
    await t.revealed('.hero .btn');
    for (const sel of ['.hero .btn--secondary.btn--swap', '.nav__cta.btn--swap']) {
      await t.page.hover(sel);
      await sleep(300);
      const on = await state(t.page, sel);
      assert.ok(Math.abs(on.span[0] / on.h + 1.1) < 0.05, `${sel}: label out`);
      assert.deepEqual([on.copy, on.icon], [[0, 1], null], `${sel}: copy in, no icon`);
    }
    await t.topAt('.tier__cta', 0.4);
    await t.revealed('.tier');
    await t.page.hover('.tier__cta');
    await sleep(300);
    assert.deepEqual((await state(t.page, '.tier__cta')).copy, [0, 1]);
    await t.done();
  });

  test('touch: no fine pointer, the pair holds still', async () => {
    const t = await visit('/ru/', MOBILE);
    await t.revealed('.hero .btn');
    const before = await state(t.page);
    await t.page.hover(SEL);
    await sleep(300);
    assert.deepEqual(await state(t.page), before);
    await t.done();
  });

  test('reduced motion: the copy crossfades in place, nothing moves', async () => {
    const t = await visit('/ru/', REDUCED);
    await t.revealed('.hero .btn');
    assert.deepEqual((await state(t.page)).span, [0, 1]);
    await t.page.hover(SEL);
    await sleep(300);
    const on = await state(t.page);
    assert.deepEqual([on.span, on.copy, on.icon], [[0, 0], [0, 1], 0], `only opacity changes: ${JSON.stringify(on)}`);
    await t.done();
  });
});

/* ------------------------------------------------------------------------------------------ */

describe('eyebrow decode on first reveal', () => {
  const GLYPHS = '!$#%&*/=:;<>?{}~^_@';
  const SEL = '#pricing .section-head [data-decode]';
  /** the server-rendered eyebrow texts, in document order */
  const rendered = async (page, path) => {
    const html = await (await page.request.get(f.state.base + path)).text();
    return [...html.matchAll(/<span data-decode[^>]*>([^<]*)<\/span>/g)].map((m) => m[1]);
  };
  /** samples the element every frame until it reports done: [ms, state, visible text, sr-only twin, width] */
  const record = (page, sel = SEL) =>
    page.$eval(sel, (el) =>
      new Promise((resolve) => {
        const out = [];
        const t0 = performance.now();
        const tick = () => {
          const run = el.querySelector('[aria-hidden]');
          out.push([Math.round(performance.now() - t0), el.dataset.decode ?? '', (run ?? el).textContent, el.querySelector('.sr-only')?.textContent ?? null, el.getBoundingClientRect().width]);
          if (el.dataset.decode === 'done' || performance.now() - t0 > 4000) resolve(out);
          else requestAnimationFrame(tick);
        };
        tick();
      }),
    );
  const prefix = (a, b) => {
    let i = 0;
    while (i < a.length && a[i] === b[i]) i++;
    return i;
  };

  test('the tag resolves left to right out of cipher glyphs in 350–600ms, the width never moves, assistive tech keeps the real text', async () => {
    const t = await visit('/ru/');
    const original = await t.page.$eval(SEL, (el) => el.textContent);
    assert.ok((await rendered(t.page, '/ru/')).includes(original), `the tag is still as rendered before its reveal: ${original}`);
    await t.topAt('#pricing .section-head', 0.3);
    const samples = await record(t.page);
    const on = samples.filter((s) => s[1] === 'on');
    const last = samples.at(-1);
    assert.equal(last[1], 'done');
    assert.equal(last[2], original, 'the tag ends as it was rendered');
    assert.ok(on.length >= 6, `the sweep spans frames: ${on.length} of ${samples.length}`);
    const cipher = on.filter((s) => s[2] !== original);
    assert.ok(cipher.length >= 3, 'mid-sweep the visible run differs from the tag');
    for (const [, , text] of cipher) assert.ok([...text].every((c, i) => c === original[i] || GLYPHS.includes(c)), `only the tag's own characters or cipher glyphs: ${text}`);
    assert.ok(on.every((s) => s[3] === original), 'the sr-only twin carries the real text for the whole run');
    let p = 0;
    for (const [, , text] of on) {
      const q = prefix(text, original);
      assert.ok(q >= p, `resolved left to right, never backwards: ${text}`);
      p = q;
    }
    const w = last[4];
    assert.ok(samples.every((s) => Math.abs(s[4] - w) <= 1.5), `mono: the width holds within a pixel: ${samples.map((s) => s[4].toFixed(1)).join(' ')}`);
    const span = on.at(-1)[0] - on[0][0];
    assert.ok(span >= 250 && span <= 900, `the sweep takes 350–600ms (observed ${span}ms over ${on.length} frames)`);
    await t.done();
  });

  test('every eyebrow on the page ends as rendered (ru, az)', async () => {
    for (const path of ['/ru/', LANG_PATHS.az]) {
      const t = await visit(path);
      const expected = await rendered(t.page, path);
      assert.ok(expected.length >= 8, `${path}: ${expected.length} decoded eyebrows`);
      const height = await t.page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < height; y += 500) {
        await t.page.evaluate((v) => scrollTo(0, v), y);
        await sleep(120);
      }
      await t.page.waitForFunction(() => [...document.querySelectorAll('[data-decode]')].every((el) => el.dataset.decode === 'done'), null, { timeout: 8000 });
      assert.deepEqual(await t.page.$$eval('[data-decode]', (els) => els.map((el) => el.textContent)), expected);
      assert.equal(await t.page.$$eval('[data-decode] .sr-only, [data-decode] [aria-hidden]', (els) => els.length), 0, 'no scaffolding left behind');
      await t.done();
    }
  });

  test('reduced motion: the tag is simply there, nothing is scrambled', async () => {
    const t = await visit('/ru/', REDUCED);
    const original = await t.page.$eval(SEL, (el) => el.textContent);
    await t.topAt('#pricing .section-head', 0.3);
    const samples = await record(t.page);
    assert.ok(samples.every((s) => s[2] === original && s[1] !== 'on'), `never a cipher frame: ${JSON.stringify(samples.slice(0, 4))}`);
    assert.equal(samples.at(-1)[1], 'done');
    await t.done();
  });
});
