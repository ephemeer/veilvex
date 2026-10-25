/**
 * Colour & life layer: the hero aurora (Hero.astro + src/scripts/ambient.ts), the gradient headline
 * accent (src/scripts/accent.ts), line icons and stat sparklines that draw themselves in (Icons.astro,
 * About.astro, src/scripts/draw.ts), the live console feed (Mock.astro + src/scripts/feed.ts), the GEO
 * orbit (Geo.astro + ambient.ts) — and a clean console / CSP on every language and width.
 */
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { DESKTOP, MOBILE, fixture, openPage } from './helpers.mjs';

const f = fixture();
before(f.setup);
after(f.teardown);

const REDUCED = { ...DESKTOP, reducedMotion: 'reduce' };

async function visit(path, options = DESKTOP) {
  const context = await f.state.browser.newContext(options);
  const { page, problems } = await openPage(context);
  await page.goto(f.state.base + path, { waitUntil: 'networkidle' });
  const scrollTo = (selector) => page.$eval(selector, (el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  const done = async () => {
    assert.deepEqual(await problems(), []);
    await context.close();
  };
  return { page, scrollTo, done };
}

const noOverflow = (page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

describe('hero aurora', () => {
  const fields = (page) =>
    page.$$eval('.aurora', (els) =>
      els.map((e) => ({ on: e.parentElement.classList.contains('is-on'), play: getComputedStyle(e).animationPlayState, name: getComputedStyle(e).animationName })),
    );

  test('three light fields drift while the hero is on screen and hold still once it is scrolled away', async () => {
    const t = await visit('/');
    const top = await fields(t.page);
    assert.equal(top.length, 3);
    assert.ok(top.every((a) => a.on && a.play === 'running' && a.name.startsWith('aurora-')), JSON.stringify(top));
    await t.scrollTo('#contact');
    await t.page.waitForFunction(() => !document.querySelector('[data-aurora]').classList.contains('is-on'));
    assert.ok((await fields(t.page)).every((a) => a.play === 'paused'), 'paused off screen');
    await t.page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await t.page.waitForFunction(() => document.querySelector('[data-aurora]').classList.contains('is-on'));
    assert.ok((await fields(t.page)).every((a) => a.play === 'running'), 'running again when back');
    await t.done();
  });

  test('under the lead paragraph the wash stays below 8% at every point of the drift, desktop and phone, short and long copy', async () => {
    for (const [path, vp] of [
      ['/', DESKTOP],
      ['/', MOBILE],
      ['/de/', MOBILE],
    ]) {
      const t = await visit(path, vp);
      const worst = await t.page.evaluate(() => {
        const lead = document.querySelector('.hero__lead').getBoundingClientRect();
        // the fields are radial-gradient(closest-side, peak, mid 55%, transparent): alpha at the nearest
        // point of the lead, in normalised elliptical distance from the field's centre
        const alphaAt = (el) => {
          const r = el.getBoundingClientRect();
          const cx = r.left + r.width / 2;
          const cy = r.top + r.height / 2;
          const nx = Math.min(Math.max(cx, lead.left), lead.right);
          const ny = Math.min(Math.max(cy, lead.top), lead.bottom);
          const d = Math.hypot((nx - cx) / (r.width / 2), (ny - cy) / (r.height / 2));
          const peak = +el.dataset.auroraPeak;
          const mid = +el.dataset.auroraMid;
          return d >= 1 ? 0 : d < 0.55 ? peak + (mid - peak) * (d / 0.55) : mid * (1 - (d - 0.55) / 0.45);
        };
        return [...document.querySelectorAll('.aurora')].map((el) => {
          const anim = el.getAnimations()[0];
          if (!anim) return { peak: +el.dataset.auroraPeak, max: alphaAt(el) };
          const { duration, delay } = anim.effect.getTiming();
          const was = anim.currentTime;
          let max = 0;
          for (let k = 0; k <= 4; k++) {
            anim.currentTime = delay + (duration * k) / 4; // one full iteration, from → to
            max = Math.max(max, alphaAt(el));
          }
          anim.currentTime = was;
          return { peak: +el.dataset.auroraPeak, max: +max.toFixed(3) };
        });
      });
      assert.equal(worst.length, 3);
      for (const w of worst) {
        assert.ok(w.peak <= 0.18, `peak ${w.peak} ≤ .18`);
        assert.ok(w.max <= 0.08, `${path} @ ${vp.viewport.width}px: field peaking at ${w.peak} reaches ${w.max} under the lead`);
      }
      await t.done();
    }
  });

  test('reduced motion: the fields do not animate', async () => {
    const t = await visit('/', REDUCED);
    assert.deepEqual((await fields(t.page)).map((a) => a.name), ['none', 'none', 'none']);
    await t.done();
  });
});

describe('headline accent', () => {
  test('the last line is one lime → mint gradient clipped to the glyphs, stretched across its words', async () => {
    const t = await visit('/');
    await t.page.waitForFunction(() => [...document.querySelectorAll('.w__in--accent')].every((e) => getComputedStyle(e).opacity === '1'), null, { timeout: 4000 });
    const words = await t.page.$$eval('.w__in--accent', (els) =>
      els.map((e) => ({
        text: e.textContent,
        clip: getComputedStyle(e).webkitBackgroundClip,
        color: getComputedStyle(e).color,
        image: getComputedStyle(e).backgroundImage,
        size: e.style.backgroundSize,
        pos: e.style.backgroundPosition,
      })),
    );
    assert.deepEqual(words.map((w) => w.text), ['уже', 'здесь.']);
    for (const w of words) {
      assert.equal(w.clip, 'text');
      assert.equal(w.color, 'rgba(0, 0, 0, 0)', 'the glyphs show the gradient, not a fill colour');
      assert.match(w.image, /linear-gradient\(90deg, rgb\(198, 255, 74\).*rgb\(88, 230, 196\) 100%\)/);
    }
    assert.match(words[0].size, /^\d+px 100%$/, 'one gradient as wide as the whole line');
    assert.equal(words[1].size, words[0].size);
    assert.equal(words[0].pos, '0px 0px');
    assert.match(words[1].pos, /^-\d+px 0px$/, 'the second word continues where the first left off');
    // the other words of the headline are untouched
    assert.equal(await t.page.$eval('.hero__line:first-child .w__in', (e) => getComputedStyle(e).webkitBackgroundClip), 'border-box');
    await t.done();
  });
});

describe('line icons', () => {
  test('nine services and six guarantees each carry a distinct one; it draws once as the card reveals and is plain at rest', async () => {
    const t = await visit('/');
    assert.equal(await t.page.$$eval('.svc .svc__icon use', (els) => new Set(els.map((u) => u.getAttribute('href'))).size), 9);
    assert.equal(await t.page.$$eval('.trust__item .trust__icon use', (els) => new Set(els.map((u) => u.getAttribute('href'))).size), 6);
    assert.ok((await t.page.$$eval('.svc__icon svg, .trust__icon svg', (els) => els.map((e) => e.style.strokeDashoffset))).every((v) => v === '100'), 'hidden behind the dash until revealed');
    await t.scrollTo('.svc[data-i="0"]');
    await t.page.waitForFunction(() => document.querySelector('.svc[data-i="0"] .svc__icon svg').getAnimations().length === 1, null, { timeout: 4000 });
    const timing = await t.page.$eval('.svc[data-i="0"] .svc__icon svg', (e) => e.getAnimations()[0].effect.getTiming());
    assert.equal(timing.duration, 700);
    assert.equal(timing.easing, 'cubic-bezier(0.16, 1, 0.3, 1)');
    assert.ok(timing.delay >= 150 && timing.delay <= 150 + 8 * 45, `stagger with the card: ${timing.delay}ms`);
    await t.page.waitForFunction(
      () => {
        const e = document.querySelector('.svc[data-i="0"] .svc__icon svg');
        return e.getAnimations().length === 0 && e.style.strokeDasharray === '' && e.style.strokeDashoffset === '' && getComputedStyle(e).strokeDashoffset === '0px';
      },
      null,
      { timeout: 4000 },
    );
    await t.scrollTo('.trust__item[data-i="0"]');
    await t.page.waitForFunction(() => [...document.querySelectorAll('.trust__icon svg')].every((e) => getComputedStyle(e).strokeDashoffset === '0px' && e.style.strokeDasharray === ''), null, { timeout: 6000 });
    await t.done();
  });

  test('reduced motion: the icons are simply there', async () => {
    const t = await visit('/', REDUCED);
    const icons = await t.page.$$eval('.svc__icon svg, .trust__icon svg', (els) => els.map((e) => ({ da: e.style.strokeDasharray, off: getComputedStyle(e).strokeDashoffset, anims: e.getAnimations().length })));
    assert.equal(icons.length, 15);
    assert.ok(icons.every((i) => i.da === '' && i.off === '0px' && i.anims === 0));
    await t.done();
  });
});

describe('stat sparklines', () => {
  test('four fixed 120×32 sparklines draw on reveal (900ms) with a mint end dot fading in, and nothing shifts', async () => {
    const t = await visit('/');
    const boxes = await t.page.$$eval('.spark', (els) => els.map((s) => [s.getBoundingClientRect().width, s.getBoundingClientRect().height]));
    assert.equal(boxes.length, 4);
    assert.ok(boxes.every(([w, h]) => w === 120 && h === 32), JSON.stringify(boxes));
    assert.ok((await t.page.$$eval('.spark__end', (els) => els.map((e) => e.style.opacity))).every((v) => v === '0'), 'end dot hidden until the line arrives');
    const heightsBefore = await t.page.$$eval('.about__stat', (els) => els.map((e) => e.getBoundingClientRect().height));
    await t.scrollTo('.about__stats');
    await t.page.waitForFunction(() => document.querySelector('.spark__line').getAnimations().length === 1, null, { timeout: 4000 });
    assert.equal(await t.page.$eval('.spark__line', (e) => e.getAnimations()[0].effect.getTiming().duration), 900);
    await t.page.waitForFunction(
      () =>
        [...document.querySelectorAll('.spark__line')].every((p) => getComputedStyle(p).strokeDashoffset === '0px' && p.style.strokeDasharray === '' && p.getAnimations().length === 0) &&
        [...document.querySelectorAll('.spark__end')].every((d) => getComputedStyle(d).opacity === '1'),
      null,
      { timeout: 8000 },
    );
    assert.deepEqual(await t.page.$$eval('.about__stat', (els) => els.map((e) => e.getBoundingClientRect().height)), heightsBefore, 'layout did not move');
    assert.equal(await t.page.$eval('.spark__end', (e) => getComputedStyle(e).fill), 'rgb(88, 230, 196)');
    await t.done();
  });
});

describe('live console feed', () => {
  const rows = (page) => page.$$eval('[data-feed] .mock__ev', (els) => els.filter((e) => !e.hidden).map((e) => e.querySelector('.mock__ev-t').textContent));
  const FIRST = ['Новая заявка — Анна', 'Ответ клиенту отправлен', 'Счёт выставлен'];

  test('three rows; after ~6 s the next event enters at the top, the oldest leaves, the count never changes', async () => {
    const t = await visit('/');
    assert.deepEqual(await rows(t.page), FIRST);
    await t.scrollTo('[data-mock]');
    await t.page.waitForSelector('[data-mock].is-live', { state: 'attached', timeout: 5000 });
    const t0 = Date.now();
    await t.page.waitForFunction((was) => document.querySelector('[data-feed] .mock__ev .mock__ev-t').textContent !== was, FIRST[0], { timeout: 9000 });
    const elapsed = Date.now() - t0;
    const entering = await t.page.$eval('[data-feed] .mock__ev', (e) => e.getAnimations().map((a) => [a.animationName, a.effect.getTiming().duration]));
    assert.deepEqual(entering, [['ev-in', 300]], 'the new row rises in on the 300ms keyframe');
    assert.deepEqual(await rows(t.page), ['Отчёт за неделю собран', 'Новая заявка — Анна', 'Ответ клиенту отправлен']);
    assert.ok(elapsed >= 1500 && elapsed <= 8500, `rotated after ${elapsed}ms`);
    assert.equal(await t.page.$$eval('[data-feed] [data-feed-item]', (els) => els.length), 3, 'the pool rows are gone, three remain');
    await t.page.waitForFunction(() => document.querySelector('[data-feed] .mock__ev').getAnimations().length === 0 && !document.querySelector('[data-feed] .is-enter, [data-feed] .is-leave'), null, { timeout: 2000 });
    await t.done();
  });

  test('off screen it stops; back in view it resumes; under reduced motion it never rotates', async () => {
    const t = await visit('/');
    await t.scrollTo('#contact');
    await t.page.waitForTimeout(7500);
    assert.deepEqual(await rows(t.page), FIRST, 'nothing rotated while the mock was off screen');
    await t.scrollTo('[data-mock]');
    await t.page.waitForFunction((was) => document.querySelector('[data-feed] .mock__ev .mock__ev-t').textContent !== was, FIRST[0], { timeout: 9000 });
    await t.done();

    const r = await visit('/', REDUCED);
    await r.scrollTo('[data-mock]');
    await r.page.waitForTimeout(7500);
    assert.deepEqual(await rows(r.page), FIRST);
    assert.equal(await r.page.$$eval('[data-feed] .mock__ev', (els) => els.filter((e) => !e.hidden).length), 3);
    await r.done();
  });
});

describe('GEO orbit', () => {
  test('two rings with six varied dots turn while in view (60s, inner 90s reverse) and stay off the text column', async () => {
    const t = await visit('/');
    assert.equal(await t.page.$$eval('[data-orbit-ring]', (els) => els.length), 2);
    const dots = await t.page.$$eval('[data-orbit] .orbit__dot', (els) => els.map((d) => d.getAttribute('r')));
    assert.equal(dots.length, 6);
    assert.ok(new Set(dots).size >= 4, `dot sizes vary: ${dots}`);
    assert.equal(await t.page.$$eval('[data-orbit] .orbit__dot--mint', (els) => els.length), 3);
    await t.scrollTo('[data-chat]');
    await t.page.waitForFunction(() => document.querySelector('[data-orbit]').classList.contains('is-on'));
    const rings = await t.page.$$eval('[data-orbit-ring]', (els) =>
      els.map((e) => {
        const cs = getComputedStyle(e);
        return { play: cs.animationPlayState, dur: cs.animationDuration, dir: cs.animationDirection, name: cs.animationName };
      }),
    );
    assert.deepEqual(rings, [
      { play: 'running', dur: '60s', dir: 'normal', name: 'orbit-turn' },
      { play: 'running', dur: '90s', dir: 'reverse', name: 'orbit-turn' },
    ]);
    const box = await t.page.evaluate(() => {
      const o = document.querySelector('[data-orbit]').getBoundingClientRect();
      return { left: o.left, right: o.right, textRight: document.querySelector('.geo__text').getBoundingClientRect().right, opacity: getComputedStyle(document.querySelector('[data-orbit]')).opacity };
    });
    assert.ok(box.left >= box.textRight, `orbit box (${box.left}) starts right of the text column (${box.textRight})`);
    assert.equal(box.opacity, '0.6');
    assert.equal(await noOverflow(t.page), 0, 'no horizontal overflow from the orbit');
    await t.page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await t.page.waitForFunction(() => !document.querySelector('[data-orbit]').classList.contains('is-on'));
    assert.ok((await t.page.$$eval('[data-orbit-ring]', (els) => els.map((e) => getComputedStyle(e).animationPlayState))).every((p) => p === 'paused'));
    await t.done();

    const m = await visit('/', MOBILE);
    await m.scrollTo('[data-chat]');
    assert.equal(await noOverflow(m.page), 0);
    await m.done();
  });

  test('reduced motion: the orbit is static', async () => {
    const t = await visit('/', REDUCED);
    await t.scrollTo('[data-chat]');
    const rings = await t.page.$$eval('[data-orbit-ring]', (els) => els.map((e) => ({ name: getComputedStyle(e).animationName, anims: e.getAnimations().length })));
    assert.deepEqual(rings, [
      { name: 'none', anims: 0 },
      { name: 'none', anims: 0 },
    ]);
    await t.done();
  });
});

describe('clean console and CSP', () => {
  test('/, /en/ and /de/ at 1440 and 390 scroll through with no errors, violations or horizontal overflow', async () => {
    for (const path of ['/', '/en/', '/de/']) {
      for (const vp of [DESKTOP, MOBILE]) {
        const t = await visit(path, vp);
        await t.page.evaluate(async () => {
          document.documentElement.style.scrollBehavior = 'auto';
          const h = document.body.scrollHeight;
          for (let y = 0; y < h; y += 400) {
            window.scrollTo({ top: y, behavior: 'instant' });
            await new Promise((r) => setTimeout(r, 40));
          }
        });
        await t.page.waitForTimeout(600);
        assert.equal(await noOverflow(t.page), 0, `${path} @ ${vp.viewport.width}px: no horizontal overflow`);
        await t.done();
      }
    }
  });
});
