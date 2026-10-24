/**
 * Service → request-form handoff (src/scripts/contact.ts) and hash-preserving language links
 * (src/scripts/lang-links.ts).
 */
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { DESKTOP, fixture, openPage } from './helpers.mjs';

const f = fixture();
before(f.setup);
after(f.teardown);

async function visit(path, options = DESKTOP) {
  const context = await f.state.browser.newContext(options);
  const { page, problems } = await openPage(context);
  await page.goto(f.state.base + path, { waitUntil: 'networkidle' });
  const checked = () => page.$$eval('input[name="services"]:checked', (els) => els.map((e) => e.value));
  const done = async () => {
    assert.deepEqual(await problems(), []);
    await context.close();
  };
  return { page, checked, done };
}

describe('service → form handoff', () => {
  test('pricing CTA with data-service="app" checks the chip, sets #contact and flashes the fieldset', async () => {
    const t = await visit('/');
    assert.deepEqual(await t.checked(), []);
    await t.page.click('.tier__cta[data-service="app"]');
    await t.page.waitForFunction(() => location.hash === '#contact');
    assert.deepEqual(await t.checked(), ['app']);
    // the accent waits until the fieldset is in view (smooth scroll), then holds and fades
    await t.page.waitForSelector('[data-pick].is-hint', { state: 'attached', timeout: 6000 });
    assert.equal(await t.page.$eval('input[name="services"][value="app"]', (el) => el.closest('.pick__item').classList.contains('is-hint')), true, 'the chosen chip gets the ring too');
    await t.page.waitForSelector('[data-pick].is-hint', { state: 'detached', timeout: 6000 });
    assert.equal(await t.page.$$eval('.pick__item.is-hint', (els) => els.length), 0, 'chip accent is gone after the animation');
    // the form itself is where the reader ends up
    const inView = await t.page.$eval('[data-pick]', (el) => {
      const r = el.getBoundingClientRect();
      return r.top >= 0 && r.bottom <= innerHeight;
    });
    assert.equal(inView, true, 'services fieldset is in the viewport');
    await t.done();
  });

  test('a service card link checks its chip', async () => {
    const t = await visit('/en/');
    await t.page.click('.svc a[data-service="seo"]');
    await t.page.waitForFunction(() => location.hash === '#contact');
    assert.deepEqual(await t.checked(), ['seo']);
    assert.equal(await t.page.evaluate(() => location.pathname), '/en/', 'stays on the page (no reload)');
    await t.done();
  });

  test('?service=geo preselects; an unknown value selects nothing and never reaches the DOM', async () => {
    const t = await visit('/?service=geo');
    assert.deepEqual(await t.checked(), ['geo']);
    await t.done();

    const hinted = await visit('/?service=geo#contact');
    await hinted.page.waitForSelector('[data-pick].is-hint', { state: 'attached', timeout: 6000 });
    assert.deepEqual(await hinted.checked(), ['geo']);
    await hinted.done();

    const evil = await visit('/?service=' + encodeURIComponent('"]<img src=x onerror=alert(1)>'));
    assert.deepEqual(await evil.checked(), []);
    assert.equal(await evil.page.evaluate(() => document.documentElement.outerHTML.includes('onerror')), false);
    await evil.done();
  });

  test('language links keep the current section hash', async () => {
    const t = await visit('/#pricing');
    const hrefs = await t.page.$$eval('a[data-lang-link]', (els) => els.map((a) => a.getAttribute('href')));
    assert.ok(hrefs.length >= 4);
    for (const h of hrefs) assert.match(h, /^\/(?:(?:en|az|de)\/)?#pricing$/, h);
    await t.done();

    const none = await visit('/#no-such-section');
    const plain = await none.page.$$eval('a[data-lang-link]', (els) => els.map((a) => a.getAttribute('href')));
    for (const h of plain) assert.doesNotMatch(h, /#/, `unknown hash must not be carried over: ${h}`);
    await none.done();
  });
});
