/**
 * ⌘K / Ctrl+K command bar (src/components/CommandBar.astro + src/scripts/command-bar.ts):
 * opening, filtering, keyboard navigation, focus management, language switch, request action.
 */
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { DESKTOP, fixture, openPage } from './helpers.mjs';

const f = fixture();
before(f.setup);
after(f.teardown);

const OPEN = 'Control+KeyK';

async function visit(path) {
  const context = await f.state.browser.newContext(DESKTOP);
  const { page, problems } = await openPage(context);
  await page.goto(f.state.base + path, { waitUntil: 'networkidle' });
  const open = async () => {
    await page.keyboard.press(OPEN);
    await page.waitForSelector('[data-cmd].is-open', { state: 'attached', timeout: 2000 });
  };
  const visibleLabels = () =>
    page.$$eval('[data-cmd-item]', (els) => els.filter((e) => !e.hidden).map((e) => e.querySelector('.cmd__label').textContent.trim()));
  const state = () =>
    page.evaluate(() => ({
      hidden: document.querySelector('[data-cmd]').hidden,
      open: document.querySelector('[data-cmd]').classList.contains('is-open'),
      locked: document.documentElement.classList.contains('is-cmd-open'),
      active: document.activeElement && { id: document.activeElement.id, tag: document.activeElement.tagName, cls: document.activeElement.className },
      insideDialog: document.querySelector('[data-cmd]').contains(document.activeElement),
      hash: location.hash,
      path: location.pathname,
    }));
  const done = async () => {
    assert.deepEqual(await problems(), []);
    await context.close();
  };
  return { page, open, visibleLabels, state, done };
}

describe('command bar', () => {
  test('Ctrl+K opens the dialog with the input focused and aria-modal', async () => {
    const t = await visit('/');
    assert.equal(await t.page.$eval('[data-cmd]', (el) => el.hidden), true, 'hidden before opening');
    await t.open();
    const s = await t.state();
    assert.equal(s.hidden, false);
    assert.equal(s.active.id, 'cmd-input');
    assert.equal(await t.page.getAttribute('[data-cmd-dialog]', 'aria-modal'), 'true');
    assert.equal(await t.page.getAttribute('[data-cmd-dialog]', 'role'), 'dialog');
    assert.equal(await t.page.getAttribute('[data-cmd-open]', 'aria-expanded'), 'true');
    assert.equal(s.locked, true, 'document scroll is locked while open');
    // everything else is inert
    const inert = await t.page.$$eval('body > *', (els) => els.filter((e) => !e.matches('script, [data-cmd]')).map((e) => e.hasAttribute('inert')));
    assert.ok(inert.length > 0 && inert.every(Boolean), 'all siblings of the palette are inert');
    await t.done();
  });

  test('typing filters: "цен" on / leaves only Цены, "pric" on /en/ only Pricing', async () => {
    const ru = await visit('/');
    await ru.open();
    await ru.page.keyboard.type('цен');
    assert.deepEqual(await ru.visibleLabels(), ['Цены']);
    assert.equal(await ru.page.$eval('[data-cmd-item][data-cmd-section="pricing"]', (el) => el.getAttribute('aria-selected')), 'true');
    await ru.page.keyboard.type('zzz');
    assert.deepEqual(await ru.visibleLabels(), []);
    assert.equal(await ru.page.$eval('[data-cmd-empty]', (el) => el.hidden), false, 'empty state shows');
    await ru.done();

    const en = await visit('/en/');
    await en.open();
    await en.page.keyboard.type('pric');
    assert.deepEqual(await en.visibleLabels(), ['Pricing']);
    await en.done();
  });

  test('ArrowDown + Enter jumps to a section and closes the palette', async () => {
    const t = await visit('/');
    await t.open();
    await t.page.keyboard.press('ArrowDown');
    const second = await t.page.$eval('[data-cmd-input]', (el) => el.getAttribute('aria-activedescendant'));
    const target = await t.page.$eval('[data-cmd-item][aria-selected="true"]', (el) => el.dataset.cmdSection);
    assert.ok(second && target, 'second option is selected and exposed via aria-activedescendant');
    await t.page.keyboard.press('Enter');
    await t.page.waitForFunction((h) => location.hash === h, `#${target}`);
    await t.page.waitForSelector('[data-cmd]', { state: 'hidden' });
    const s = await t.state();
    assert.equal(s.hash, `#${target}`);
    assert.equal(s.hidden, true);
    assert.equal(s.locked, false, 'html is not scroll-locked after closing');
    await t.done();
  });

  test('Escape closes and focus returns to the trigger', async () => {
    const t = await visit('/');
    await t.page.click('[data-cmd-open]');
    await t.page.waitForSelector('[data-cmd].is-open', { state: 'attached' });
    await t.page.keyboard.press('Escape');
    await t.page.waitForSelector('[data-cmd]', { state: 'hidden' });
    const s = await t.state();
    assert.equal(s.locked, false);
    assert.equal(await t.page.evaluate(() => document.activeElement === document.querySelector('[data-cmd-open]')), true);
    assert.equal(await t.page.getAttribute('[data-cmd-open]', 'aria-expanded'), 'false');
    await t.done();
  });

  test('backdrop click closes', async () => {
    const t = await visit('/');
    await t.open();
    await t.page.mouse.click(12, 880); // bottom-left corner: backdrop, far from the dialog
    await t.page.waitForSelector('[data-cmd]', { state: 'hidden' });
    assert.equal((await t.state()).locked, false);
    await t.done();
  });

  test('Tab / Shift+Tab stay inside the dialog', async () => {
    const t = await visit('/');
    await t.open();
    for (const key of ['Tab', 'Tab', 'Tab', 'Shift+Tab', 'Shift+Tab', 'Shift+Tab']) {
      await t.page.keyboard.press(key);
      const s = await t.state();
      assert.equal(s.insideDialog, true, `focus left the dialog after ${key}: ${JSON.stringify(s.active)}`);
    }
    await t.done();
  });

  test('choosing English from /#pricing lands on /en/#pricing', async () => {
    const t = await visit('/#pricing');
    await t.open();
    await t.page.keyboard.type('english');
    assert.deepEqual(await t.visibleLabels(), ['English']);
    await Promise.all([t.page.waitForURL(/\/en\/#pricing$/), t.page.keyboard.press('Enter')]);
    const s = await t.state();
    assert.equal(s.path, '/en/');
    assert.equal(s.hash, '#pricing');
    assert.equal(await t.page.getAttribute('html', 'lang'), 'en-US');
    await t.done();
  });

  test('«Оставить заявку» scrolls to the form and focuses #f-name', async () => {
    const t = await visit('/');
    await t.open();
    await t.page.keyboard.type('заявк');
    assert.deepEqual(await t.visibleLabels(), ['Оставить заявку']);
    await t.page.keyboard.press('Enter');
    await t.page.waitForSelector('[data-cmd]', { state: 'hidden' });
    await t.page.waitForFunction(() => location.hash === '#contact' && document.activeElement?.id === 'f-name');
    const s = await t.state();
    assert.equal(s.locked, false);
    assert.equal(s.active.id, 'f-name');
    await t.done();
  });

  test('the shortcut is ignored while typing in #f-contact', async () => {
    const t = await visit('/');
    await t.page.focus('#f-contact');
    await t.page.keyboard.type('+1');
    await t.page.keyboard.press(OPEN);
    await t.page.waitForTimeout(300);
    const s = await t.state();
    assert.equal(s.hidden, true, 'palette stays closed');
    assert.equal(s.active.id, 'f-contact');
    // …but works again once the field is left
    await t.page.keyboard.press('Escape');
    await t.page.evaluate(() => document.activeElement.blur());
    await t.open();
    assert.equal((await t.state()).active.id, 'cmd-input');
    await t.done();
  });
});
