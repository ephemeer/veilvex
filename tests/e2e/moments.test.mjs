/**
 * Quiet interactive moments: console views behind the hero sidebar (src/scripts/hero.ts + Mock.astro),
 * model chips driving the GEO meter (src/scripts/geo.ts + Geo.astro), the logo tilt (Nav.astro), the
 * once-only sheen on the popular tier (src/scripts/pricing.ts + Pricing.astro) and the check that
 * draws itself on form success (Contact.astro).
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

describe('hero console views', () => {
  test('sidebar buttons switch head, chart and crumb; aria-pressed and visibility follow', async () => {
    const t = await visit('/');
    const state = () =>
      t.page.evaluate(() => ({
        pressed: [...document.querySelectorAll('[data-mock] [data-view]')].map((b) => b.getAttribute('aria-pressed')),
        head: document.querySelector('[data-mock] [data-view-head].is-active')?.dataset.viewHead,
        title: document.querySelector('[data-mock] [data-view-head].is-active .mock__title')?.textContent.trim(),
        chart: document.querySelector('[data-mock] [data-view-chart].is-active')?.dataset.viewChart,
        crumb: document.querySelector('[data-view-crumb]')?.textContent.trim(),
        visibleHeads: [...document.querySelectorAll('[data-mock] [data-view-head]')].filter((el) => getComputedStyle(el).visibility === 'visible').length,
      }));
    const before = await state();
    assert.deepEqual(before.pressed, ['false', 'false', 'false', 'true', 'false'], 'AI mentions is the default view');
    assert.equal(before.head, '3');
    assert.equal(before.chart, '3');
    assert.equal(before.title, 'Видимость бренда в ответах ИИ');
    assert.equal(before.crumb, '/ Упоминания в ИИ');
    assert.equal(before.visibleHeads, 1);
    // every view has its own pre-rendered line
    const lines = await t.page.$$eval('[data-mock] [data-view-chart] .mock__line', (els) => els.map((p) => p.getAttribute('d')));
    assert.equal(new Set(lines).size, 5);

    await t.page.click('[data-mock] [data-view="1"]');
    await t.page.waitForTimeout(400); // crossfade: 100ms out, 60ms beat, 200ms in
    const after1 = await state();
    assert.deepEqual(after1.pressed, ['false', 'true', 'false', 'false', 'false']);
    assert.equal(after1.head, '1');
    assert.equal(after1.chart, '1');
    assert.equal(after1.title, 'Заявки из всех каналов');
    assert.equal(after1.crumb, '/ Заявки');
    assert.equal(after1.visibleHeads, 1, 'only the active head layer is visible (one heading for AT)');
    assert.equal(await t.page.$eval('[data-mock] [data-view-chart="1"]', (el) => getComputedStyle(el).opacity), '1');
    assert.equal(await t.page.$eval('[data-mock] [data-view-chart="3"]', (el) => getComputedStyle(el).opacity), '0');

    // keyboard: the buttons are real buttons
    await t.page.focus('[data-mock] [data-view="4"]');
    await t.page.keyboard.press('Space');
    const after2 = await state();
    assert.equal(after2.head, '4');
    assert.equal(after2.title, 'Еженедельные отчёты');
    assert.deepEqual(after2.pressed, ['false', 'false', 'false', 'false', 'true']);
    await t.done();
  });
});

describe('GEO model chips', () => {
  const chips = (page) => page.$$eval('[data-model]', (els) => els.map((b) => ({ pressed: b.getAttribute('aria-pressed'), lit: b.classList.contains('is-lit'), name: b.textContent.trim() })));
  const pctIs = (page, v) => page.waitForFunction((want) => document.querySelector('[data-chat-pct]').textContent === want, v, { timeout: 4000 });
  const barIs = (page, s) => page.waitForFunction((want) => getComputedStyle(document.querySelector('[data-chat-meter]')).transform === want, s, { timeout: 4000 });

  test('after the choreography a tap focuses the meter on one model, a second tap returns to the overall figure', async () => {
    const t = await visit('/', MOBILE);
    await t.scrollTo('[data-chat]');
    await t.page.waitForSelector('[data-chat].is-done', { state: 'attached', timeout: 40000 });
    await pctIs(t.page, '92%');
    const all = await chips(t.page);
    assert.equal(all.length, 6);
    assert.ok(all.every((c) => c.lit && c.pressed === 'false'), 'all models lit, none pressed');
    const base = await t.page.$eval('[data-chat-label]', (el) => el.textContent);
    assert.equal(base, 'Видимость бренда в ответах ИИ');

    await t.page.tap('[data-model][data-pct="88"]'); // Gemini
    await pctIs(t.page, '88%');
    await barIs(t.page, 'matrix(0.88, 0, 0, 1, 0, 0)');
    const one = await chips(t.page);
    assert.deepEqual(one.map((c) => c.pressed), ['false', 'true', 'false', 'false', 'false', 'false']);
    assert.deepEqual(one.map((c) => c.lit), [false, true, false, false, false, false]);
    assert.equal(await t.page.$eval('[data-chat-label]', (el) => el.textContent), `${base} · Gemini`);

    await t.page.tap('[data-model][data-pct="88"]'); // off again
    await pctIs(t.page, '92%');
    await barIs(t.page, 'matrix(0.92, 0, 0, 1, 0, 0)');
    const back = await chips(t.page);
    assert.ok(back.every((c) => c.lit && c.pressed === 'false'));
    assert.equal(await t.page.$eval('[data-chat-label]', (el) => el.textContent), base);

    // a second press mid-flight retargets instead of restarting
    await t.page.tap('[data-model][data-pct="77"]'); // Grok
    await t.page.waitForTimeout(150);
    await t.page.tap('[data-model][data-pct="86"]'); // Claude
    await pctIs(t.page, '86%');
    await barIs(t.page, 'matrix(0.86, 0, 0, 1, 0, 0)');
    assert.deepEqual((await chips(t.page)).map((c) => c.pressed), ['false', 'false', 'false', 'true', 'false', 'false']);
    await t.done();
  });

  test('a chip pressed before the choreography has finished is honoured when the meter appears', async () => {
    const t = await visit('/');
    await t.scrollTo('[data-chat]');
    await t.page.click('[data-model][data-pct="86"]'); // Claude, while the question is still being asked
    assert.deepEqual((await chips(t.page)).map((c) => c.lit), [false, false, false, true, false, false]);
    assert.equal(await t.page.$eval('[data-model][data-pct="86"]', (b) => b.getAttribute('aria-pressed')), 'true');
    await t.page.waitForSelector('[data-chat].is-done', { state: 'attached', timeout: 40000 });
    await pctIs(t.page, '86%');
    assert.deepEqual((await chips(t.page)).map((c) => c.lit), [false, false, false, true, false, false], 'the sequence did not light the others');
    assert.match(await t.page.$eval('[data-chat-label]', (el) => el.textContent), / · Claude$/);
    await t.done();
  });

  test('reduced motion: everything is immediate', async () => {
    const t = await visit('/', REDUCED);
    await t.scrollTo('[data-chat]');
    await t.page.waitForSelector('[data-chat].is-done', { state: 'attached', timeout: 5000 });
    await t.page.click('[data-model][data-pct="81"]'); // Copilot
    assert.equal(await t.page.$eval('[data-chat-pct]', (el) => el.textContent), '81%');
    assert.equal(await t.page.$eval('[data-chat-meter]', (el) => getComputedStyle(el).transform), 'matrix(0.81, 0, 0, 1, 0, 0)');
    await t.done();
  });
});

describe('logo', () => {
  test('the mark tilts on hover with a fine pointer and stays still on touch and under reduced motion', async () => {
    const t = await visit('/');
    const transform = (page) => page.$eval('.nav__mark', (el) => getComputedStyle(el).transform);
    assert.equal(await transform(t.page), 'none');
    await t.page.hover('.nav__logo');
    await t.page.waitForFunction(() => getComputedStyle(document.querySelector('.nav__mark')).transform !== 'none');
    await t.page.waitForTimeout(260);
    const m = await transform(t.page);
    const [a, b] = m.match(/-?[\d.]+/g).map(Number);
    assert.ok(Math.abs(a - Math.cos((8 * Math.PI) / 180)) < 0.01 && b < 0, `rotate(-8deg): ${m}`);
    await t.page.mouse.move(720, 600);
    await t.page.waitForFunction(() => getComputedStyle(document.querySelector('.nav__mark')).transform === 'none');
    await t.done();

    const touch = await visit('/', MOBILE);
    assert.equal(await touch.page.evaluate(() => matchMedia('(hover: hover) and (pointer: fine)').matches), false);
    await touch.page.hover('.nav__logo');
    await touch.page.waitForTimeout(300);
    assert.equal(await transform(touch.page), 'none');
    await touch.done();

    const reduced = await visit('/', REDUCED);
    await reduced.page.hover('.nav__logo');
    await reduced.page.waitForTimeout(300);
    assert.equal(await transform(reduced.page), 'none');
    await reduced.done();
  });
});

describe('pricing sheen', () => {
  test('runs once when the popular tier comes into view, then leaves nothing animating', async () => {
    const t = await visit('/');
    assert.equal(await t.page.$$eval('.tier.is-popular .tier__sheen', (els) => els.length), 1);
    assert.equal(await t.page.$$eval('.tier:not(.is-popular) .tier__sheen', (els) => els.length), 0, 'only the popular tier has one');
    await t.scrollTo('.tier.is-popular');
    await t.page.waitForSelector('.tier.is-popular.is-sheen', { state: 'attached', timeout: 5000 });
    const names = await t.page.$eval('.tier.is-popular .tier__sheen', (el) => el.getAnimations({ subtree: true }).map((a) => a.animationName).sort());
    assert.deepEqual(names, ['sheen-fade', 'sheen-turn']);
    await t.page.waitForSelector('.tier.is-popular.is-sheen', { state: 'detached', timeout: 5000 });
    assert.equal(await t.page.$eval('.tier.is-popular .tier__sheen', (el) => el.getAnimations({ subtree: true }).length), 0, 'nothing animates at rest');
    assert.equal(await t.page.$eval('.tier.is-popular .tier__sheen', (el) => getComputedStyle(el).opacity), '0');
    // leaving and coming back does not replay it
    await t.page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await t.page.waitForTimeout(300);
    await t.scrollTo('.tier.is-popular');
    await t.page.waitForTimeout(1200);
    assert.equal(await t.page.$$eval('.tier.is-popular.is-sheen', (els) => els.length), 0);
    await t.done();

    const r = await visit('/', REDUCED);
    await r.scrollTo('.tier.is-popular');
    await r.page.waitForTimeout(1500);
    assert.equal(await r.page.$$eval('.tier.is-popular.is-sheen', (els) => els.length), 0, 'no sheen under reduced motion');
    await r.done();
  });
});

describe('form success', () => {
  const submit = async (t) => {
    await t.page.route('**/api/contact', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) }));
    await t.page.fill('#f-name', 'Тест');
    await t.page.fill('#f-contact', '+994 50 000 00 00');
    await t.page.click('.consent__box');
    await t.page.click('[data-submit]');
    await t.page.waitForSelector('[data-done]:not([hidden])', { state: 'attached', timeout: 5000 });
  };
  const icon = (page, fn) => page.$eval('.form__done-icon .icon', fn);

  test('the check draws its stroke as the success panel appears', async () => {
    const t = await visit('/');
    await submit(t);
    const names = await icon(t.page, (el) => el.getAnimations().map((a) => a.animationName));
    assert.ok(names.includes('done-draw'), `draw animation runs: ${names}`);
    await icon(t.page, (el) => Promise.all(el.getAnimations().map((a) => a.finished)));
    assert.equal(await icon(t.page, (el) => getComputedStyle(el).strokeDashoffset), '0px', 'the stroke is fully drawn at the end');
    await t.done();
  });

  test('reduced motion: the check is simply there', async () => {
    const t = await visit('/', REDUCED);
    await submit(t);
    assert.deepEqual(await icon(t.page, (el) => el.getAnimations().map((a) => a.animationName)), []);
    assert.equal(await icon(t.page, (el) => getComputedStyle(el).strokeDasharray), 'none');
    assert.equal(await icon(t.page, (el) => getComputedStyle(el).strokeDashoffset), '0px');
    await t.done();
  });
});
