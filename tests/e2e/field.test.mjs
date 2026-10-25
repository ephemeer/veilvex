/**
 * The hero dot field (src/scripts/field.ts): a canvas of dots behind the headline that the cursor
 * pushes and lights, a wave that runs out from the headline as it lands, a wave per tap, and a loop
 * that stops as soon as everything is at rest — static under reduced motion.
 */
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { DESKTOP, MOBILE, fixture, openPage } from './helpers.mjs';

const f = fixture();
before(f.setup);
after(f.teardown);

async function visit(path, options = DESKTOP) {
  const context = await f.state.browser.newContext(options);
  const { page, problems } = await openPage(context);
  await page.goto(f.state.base + path, { waitUntil: 'networkidle' });
  // the ambient wave (every 8–10.5s) would make the timing below a lottery
  await page.$eval('[data-field]', (c) => (c.dataset.fieldAmbient = 'off'));
  const done = async () => {
    assert.deepEqual(await problems(), []);
    await context.close();
  };
  return { page, done };
}

const state = (page) => page.$eval('[data-field]', (c) => c.dataset.fieldState);
const waitState = (page, s, timeout) => page.waitForFunction((s) => document.querySelector('[data-field]')?.dataset.fieldState === s, s, { timeout }).then(() => true, () => false);
/** lime-lit pixels on the canvas (alpha above the resting dots, blue channel well below white) */
const lit = (page) =>
  page.$eval('[data-field]', (c) => {
    const { data } = c.getContext('2d').getImageData(0, 0, c.width, c.height);
    let n = 0;
    for (let i = 0; i < data.length; i += 4) if (data[i + 3] > 90 && data[i + 2] < 150) n++;
    return n;
  });
const info = (page) =>
  page.$eval('[data-field]', (c) => ({
    w: c.width,
    h: c.height,
    cssH: c.clientHeight,
    dots: Number(c.dataset.fieldDots),
    grid: getComputedStyle(c.parentElement.querySelector('.bg-grid')).display,
    mask: getComputedStyle(c).maskImage || getComputedStyle(c).webkitMaskImage,
  }));

describe('hero field', () => {
  test('a canvas of dots covers the headline screen, the line grid steps aside, the load wave lights the dots lime and the field settles to idle', async () => {
    const { page, done } = await visit('/');
    const i = await info(page);
    assert.ok(i.w > 0 && i.h > 0, 'bitmap sized');
    assert.ok(i.dots > 800 && i.dots < 2600, `dot count ${i.dots}`);
    assert.ok(i.cssH <= 900 * 1.15 + 1, `field height ${i.cssH} stays on the first screen`);
    assert.equal(i.grid, 'none', 'CSS line grid hidden while the field is active');
    assert.match(i.mask, /radial-gradient/, 'same dissolve as the grid');
    // the load wave (520ms after .is-ready) makes the field live, lights dots lime, then it settles
    assert.ok(await waitState(page, 'live', 4000), 'load wave started');
    await page.waitForTimeout(250);
    assert.ok((await lit(page)) > 40, 'the front is lit lime');
    assert.ok(await waitState(page, 'idle', 6000), 'settled after the wave');
    assert.equal(await lit(page), 0, 'nothing lit at rest');
    await done();
  });

  test('the cursor pushes and lights nearby dots; leaving the hero lets them settle; a click sends a wave', async () => {
    const { page, done } = await visit('/');
    await waitState(page, 'idle', 8000);
    await page.mouse.move(1150, 420);
    await page.mouse.move(1160, 430);
    await page.waitForTimeout(120);
    assert.equal(await state(page), 'live');
    const litNearCursor = await page.$eval('[data-field]', (c) => {
      const dpr = c.width / c.clientWidth;
      const { data } = c.getContext('2d').getImageData(Math.round((1160 - 160) * dpr), Math.round((430 - 160) * dpr), Math.round(320 * dpr), Math.round(320 * dpr));
      let n = 0;
      for (let i = 0; i < data.length; i += 4) if (data[i + 3] > 90 && data[i + 2] < 150) n++;
      return n;
    });
    assert.ok(litNearCursor > 20, `dots lit around the cursor (${litNearCursor})`);
    const far = await page.$eval('[data-field]', (c) => {
      const dpr = c.width / c.clientWidth;
      const { data } = c.getContext('2d').getImageData(0, Math.round(500 * dpr), Math.round(300 * dpr), Math.round(200 * dpr));
      let n = 0;
      for (let i = 0; i < data.length; i += 4) if (data[i + 3] > 90 && data[i + 2] < 150) n++;
      return n;
    });
    assert.equal(far, 0, 'dots away from the cursor stay at rest');
    await page.mouse.move(720, 30); // onto the fixed nav: pointerleave for the hero
    assert.ok(await waitState(page, 'idle', 3000), 'settles once the cursor is gone');
    assert.equal(await lit(page), 0);
    await page.mouse.click(1250, 560); // hero background, no control there
    assert.ok(await waitState(page, 'live', 1000), 'a click sends a wave');
    await page.waitForTimeout(200);
    assert.ok((await lit(page)) > 20, 'the tap wave is lit');
    await page.mouse.move(720, 30);
    assert.ok(await waitState(page, 'idle', 4000));
    await done();
  });

  test('scrolled away the loop stops; on a phone a tap sends a wave and nothing tracks the finger', async () => {
    const { page, done } = await visit('/');
    await waitState(page, 'idle', 8000);
    await page.mouse.move(1150, 420);
    await page.waitForTimeout(80);
    await page.evaluate(() => document.getElementById('services').scrollIntoView({ block: 'start', behavior: 'instant' }));
    await page.waitForTimeout(250);
    assert.equal(await state(page), 'idle', 'off screen: not running');
    await done();
    const m = await visit('/', MOBILE);
    const mi = await info(m.page);
    assert.ok(mi.dots > 150 && mi.dots < 1200, `phone dot count ${mi.dots}`);
    assert.ok(await waitState(m.page, 'idle', 8000), 'load wave settles on the phone too');
    await m.page.touchscreen.tap(330, 700);
    assert.ok(await waitState(m.page, 'live', 1000), 'tap wave');
    assert.ok(await waitState(m.page, 'idle', 5000), 'and it settles');
    await m.done();
  });

  test('reduced motion: the dots are drawn once and nothing ever moves', async () => {
    const { page, done } = await visit('/', { ...DESKTOP, reducedMotion: 'reduce' });
    assert.equal(await state(page), 'static');
    await page.mouse.move(1150, 420);
    await page.mouse.click(1250, 560);
    await page.waitForTimeout(1500);
    assert.equal(await state(page), 'static');
    assert.equal(await lit(page), 0);
    assert.ok((await info(page)).dots > 800, 'the dots are still there');
    await done();
  });
});
