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
  return { page, checked, done, problems, context };
}

const { en } = await import('../../src/i18n/en.ts');

describe('service → form handoff', () => {
  test('pricing CTA with data-service="app" checks the chip, sets #contact and flashes the fieldset', async () => {
    const t = await visit('/ru/');
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

  test('after the handoff, a failed submit (no delivery configured here) shows the generic error inside the viewport, not below the fold', async () => {
    const t = await visit('/');
    await t.page.click('.tier__cta[data-service="app"]');
    await t.page.waitForFunction(() => location.hash === '#contact');
    await t.page.waitForSelector('[data-pick].is-hint', { state: 'attached', timeout: 6000 }); // the form is in view
    await t.page.fill('#f-name', 'Reviewer');
    await t.page.fill('#f-contact', '+1 555 010 0100');
    await t.page.click('.consent__box');
    const buttonBottom = await t.page.$eval('[data-submit]', (el) => el.getBoundingClientRect().bottom);
    const [res] = await Promise.all([t.page.waitForResponse((r) => r.url().endsWith('/api/contact')), t.page.click('[data-submit]')]);
    assert.equal(res.status(), 503, 'serve-secure runs the function without delivery variables → not_configured');
    await t.page.waitForFunction(() => document.querySelector('[data-status]').textContent.length > 0);
    // the smooth scroll to the message: wait for it to land (a fixed 900ms was too short on a loaded machine — the
    // full suite runs three files at once); if it never lands, the assertion below says where the line ended up
    await t.page
      .waitForFunction(() => {
        const r = document.querySelector('[data-status]').getBoundingClientRect();
        return r.top >= 0 && r.bottom <= innerHeight;
      }, null, { timeout: 5000 })
      .catch(() => {});
    const seen = await t.page.evaluate(() => {
      const el = document.querySelector('[data-status]');
      const r = el.getBoundingClientRect();
      return { text: el.textContent, top: Math.round(r.top), bottom: Math.round(r.bottom), vh: innerHeight, formHidden: document.querySelector('[data-form]').hidden, sending: document.querySelector('[data-form]').classList.contains('is-sending') };
    });
    assert.equal(seen.text, en.contact.form.errorGeneric, 'the generic text, nothing from the server');
    assert.ok(seen.top >= 0 && seen.bottom <= seen.vh, `the error line is inside the viewport (button bottom was ${Math.round(buttonBottom)}): ${JSON.stringify(seen)}`);
    assert.equal(seen.formHidden || seen.sending, false, 'the form stays, ready for another try');
    // the only console noise allowed is the browser's own line about the 503 resource
    assert.deepEqual((await t.problems()).filter((p) => !/503/.test(p)), []);
    await t.context.close();
  });

  test('a service card link checks its chip', async () => {
    const t = await visit('/');
    await t.page.click('.svc a[data-service="seo"]');
    await t.page.waitForFunction(() => location.hash === '#contact');
    assert.deepEqual(await t.checked(), ['seo']);
    assert.equal(await t.page.evaluate(() => location.pathname), '/', 'stays on the page (no reload)');
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
    const t = await visit('/ru/#pricing');
    const hrefs = await t.page.$$eval('a[data-lang-link]', (els) => els.map((a) => a.getAttribute('href')));
    assert.ok(hrefs.length >= 4);
    for (const h of hrefs) assert.match(h, /^\/(?:(?:ru|az|de)\/)?#pricing$/, h);
    await t.done();

    const none = await visit('/ru/#no-such-section');
    const plain = await none.page.$$eval('a[data-lang-link]', (els) => els.map((a) => a.getAttribute('href')));
    for (const h of plain) assert.doesNotMatch(h, /#/, `unknown hash must not be carried over: ${h}`);
    await none.done();
  });
});
