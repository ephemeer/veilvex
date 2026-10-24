/**
 * Accessibility smoke test: skip link, image alt text, accessible names, <html lang>.
 */
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { DESKTOP, LANG_PATHS, fixture, openPage } from './helpers.mjs';

const f = fixture();
before(f.setup);
after(f.teardown);

describe('a11y smoke', () => {
  test('skip link is the first tab stop and targets #main', async () => {
    const context = await f.state.browser.newContext(DESKTOP);
    const { page, problems } = await openPage(context);
    await page.goto(f.state.base + '/', { waitUntil: 'networkidle' });
    await page.keyboard.press('Tab');
    const active = await page.evaluate(() => ({ cls: document.activeElement.className, href: document.activeElement.getAttribute('href'), visible: document.activeElement.getBoundingClientRect().top >= 0 }));
    assert.equal(active.cls, 'skip-link');
    assert.equal(active.href, '#main');
    assert.equal(active.visible, true, 'skip link slides into view on focus');
    assert.equal(await page.$eval('#main', (el) => el.tagName), 'MAIN');
    assert.deepEqual(await problems(), []);
    await context.close();
  });

  test('images have alt text, controls have accessible names, <html lang> matches the locale', async () => {
    const context = await f.state.browser.newContext(DESKTOP);
    const { page, problems } = await openPage(context);
    for (const [lang, path] of [...Object.entries(LANG_PATHS), ['ru', '/privacy/'], ['en', '/en/privacy/']]) {
      await page.goto(f.state.base + path, { waitUntil: 'load' });
      assert.equal(await page.$eval('html', (el) => el.lang.slice(0, 2)), lang, `${path}: html lang`);
      const report = await page.evaluate(() => {
        const name = (el) => {
          const labelled = el.getAttribute('aria-labelledby');
          const byId = labelled && labelled.split(/\s+/).map((id) => document.getElementById(id)?.textContent ?? '').join(' ');
          return (el.getAttribute('aria-label') || byId || el.textContent || el.getAttribute('title') || [...el.querySelectorAll('img[alt]')].map((i) => i.alt).join(' ')).trim();
        };
        const describe = (el) => `${el.tagName.toLowerCase()}.${[...el.classList].join('.')}${el.id ? '#' + el.id : ''}`;
        return {
          imgsWithoutAlt: [...document.querySelectorAll('img')].filter((i) => !i.hasAttribute('alt')).map(describe),
          svgNotHidden: [...document.querySelectorAll('svg')].filter((s) => s.getAttribute('aria-hidden') !== 'true' && !s.getAttribute('aria-label') && !s.querySelector('title')).map(describe),
          unnamed: [...document.querySelectorAll('button, a[href], [role="button"], [role="menuitem"], input:not([type="hidden"]), textarea')]
            .filter((el) => el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA' ? !name(el) : !(el.labels?.length || el.getAttribute('aria-label') || el.getAttribute('aria-labelledby')))
            .map(describe),
          mainCount: document.querySelectorAll('main').length,
          h1Count: document.querySelectorAll('h1').length,
        };
      });
      assert.deepEqual(report.imgsWithoutAlt, [], `${path}: <img> without alt`);
      assert.deepEqual(report.svgNotHidden, [], `${path}: decorative <svg> not hidden from AT`);
      assert.deepEqual(report.unnamed, [], `${path}: controls without an accessible name`);
      assert.equal(report.mainCount, 1, `${path}: one <main>`);
      assert.equal(report.h1Count, 1, `${path}: one <h1>`);
    }
    assert.deepEqual(await problems(), []);
    await context.close();
  });
});
