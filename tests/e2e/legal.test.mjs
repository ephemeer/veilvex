/**
 * Legal pages: privacy policy (/privacy/) and terms of cooperation (/terms/) in every language —
 * rendering, table of contents, cross-links, footer and consent links, language switch, sitemap,
 * llms.txt, print stylesheet, no horizontal overflow, no console / CSP problems.
 *
 * URLs are built from LANG_PATHS (helpers.mjs) — never from literal language prefixes.
 */
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { DESKTOP, LANG_PATHS, MOBILE, fixture, openPage } from './helpers.mjs';

const f = fixture();
before(f.setup);
after(f.teardown);

const { ru } = await import('../../src/i18n/ru.ts');
const { en } = await import('../../src/i18n/en.ts');
const { az } = await import('../../src/i18n/az.ts');
const { de } = await import('../../src/i18n/de.ts');
const { LEGAL_PATHS, LEGAL_UPDATED } = await import('../../src/lib/legal.ts');
const { siteConfig } = await import('../../src/config.ts');

const CONTENT = { ru, en, az, de };
const LANGS = Object.keys(LANG_PATHS);
const DOCS = /** @type {const} */ (['privacy', 'terms']);

/** '/ru/' + '/terms' → '/ru/terms/' */
const legalUrl = (lang, doc) => `${LANG_PATHS[lang]}${LEGAL_PATHS[doc].replace(/^\//, '')}/`;
const channels = ['whatsapp', 'telegram', 'phone', 'email'].filter((k) => siteConfig[k]).length;

describe('legal pages', () => {
  test('both documents render in every language with title, date, numbered sections and contacts', async () => {
    const context = await f.state.browser.newContext(DESKTOP);
    const { page, problems } = await openPage(context);
    for (const lang of LANGS) {
      for (const doc of DOCS) {
        const d = CONTENT[lang][doc];
        const url = legalUrl(lang, doc);
        const res = await page.goto(f.state.base + url, { waitUntil: 'load' });
        assert.equal(res?.status(), 200, url);
        const info = await page.evaluate(() => ({
          lang: document.documentElement.lang.slice(0, 2),
          h1: [...document.querySelectorAll('h1')].map((h) => h.textContent.trim()),
          time: document.querySelector('.legal__date time')?.getAttribute('datetime'),
          sections: [...document.querySelectorAll('.legal__section')].map((s) => ({ id: s.id, h: s.querySelector('h2 span:last-child')?.textContent.trim() })),
          toc: [...document.querySelectorAll('.legal__toc a')].map((a) => a.getAttribute('href')),
          contacts: document.querySelectorAll('.legal__contacts').length,
          contactLinks: [...document.querySelectorAll('.legal__contacts')].map((c) => c.querySelectorAll('a[href]').length),
          clauses: document.querySelectorAll('.legal__clause').length,
          title: document.title,
        }));
        assert.equal(info.lang, lang, `${url}: html lang`);
        assert.deepEqual(info.h1, [d.title], `${url}: one h1 with the document title`);
        assert.equal(info.time, LEGAL_UPDATED, `${url}: edition date`);
        assert.deepEqual(info.sections, d.sections.map((s) => ({ id: s.id, h: s.h })), `${url}: sections in order`);
        assert.deepEqual(info.toc, d.sections.map((s) => `#${s.id}`), `${url}: table of contents`);
        assert.ok(info.title.startsWith(d.title), `${url}: <title>`);
        assert.ok(info.contacts >= 1, `${url}: contact channels are listed`);
        for (const n of info.contactLinks) assert.equal(n, channels, `${url}: every configured channel, nothing else`);
        if (d.clauses) assert.ok(info.clauses > d.sections.length, `${url}: clauses are numbered`);
        else assert.equal(info.clauses, 0, `${url}: no clause numbers`);
      }
    }
    assert.deepEqual(await problems(), []);
    await context.close();
  });

  test('formal requests go by email: the configured address or a fallback phrase, never a placeholder', async () => {
    const context = await f.state.browser.newContext(DESKTOP);
    const { page, problems } = await openPage(context);
    for (const lang of LANGS) {
      const l = CONTENT[lang].legal;
      for (const [doc, ids] of [['privacy', ['controller', 'rights']], ['terms', ['refunds', 'notices', 'contacts']]]) {
        await page.goto(f.state.base + legalUrl(lang, doc), { waitUntil: 'load' });
        const text = await page.$eval('.legal', (el) => el.textContent);
        assert.doesNotMatch(text, /\[\[|\]\]|\{email\}/, `${lang}/${doc}: no unresolved markup`);
        for (const id of ids) {
          const section = await page.$eval(`#${id}`, (el) => ({ text: el.textContent.replace(/\s+/g, ' '), mailto: [...el.querySelectorAll('a[href^="mailto:"]')].map((a) => a.getAttribute('href')) }));
          if (siteConfig.email) assert.ok(section.mailto.includes(`mailto:${siteConfig.email}`), `${lang}/${doc} #${id}: mailto link`);
          else assert.ok(section.text.includes(l.emailFallback), `${lang}/${doc} #${id}: "${l.emailFallback}"`);
        }
      }
    }
    assert.deepEqual(await problems(), []);
    await context.close();
  });

  test('section ids are unique, the same in every language, and never collide with home-page ids', async () => {
    const context = await f.state.browser.newContext(DESKTOP);
    const { page, problems } = await openPage(context);
    await page.goto(f.state.base + LANG_PATHS.en, { waitUntil: 'load' });
    const homeIds = new Set(await page.$$eval('[id]', (els) => els.map((e) => e.id)));
    for (const doc of DOCS) {
      const ids = CONTENT.en[doc].sections.map((s) => s.id);
      assert.equal(new Set(ids).size, ids.length, `${doc}: unique ids`);
      for (const lang of LANGS) assert.deepEqual(CONTENT[lang][doc].sections.map((s) => s.id), ids, `${doc}: ${lang} ids match en`);
      for (const id of ids) assert.ok(!homeIds.has(id), `${doc}: #${id} also exists on the home page`);
    }
    assert.deepEqual(await problems(), []);
    await context.close();
  });

  test('table-of-contents links scroll their section just below the sticky nav', async () => {
    for (const [name, opts] of [['desktop', DESKTOP], ['phone', MOBILE]]) {
      const context = await f.state.browser.newContext(opts);
      const { page, problems } = await openPage(context);
      for (const [lang, doc] of [['en', 'privacy'], ['ru', 'terms'], ['de', 'privacy'], ['az', 'terms']]) {
        const sections = CONTENT[lang][doc].sections;
        await page.goto(f.state.base + legalUrl(lang, doc), { waitUntil: 'load' });
        for (const target of [sections[Math.floor(sections.length / 2)], sections[sections.length - 2]]) {
          await page.click(`.legal__toc a[href="#${target.id}"]`);
          await page.waitForFunction((id) => location.hash === `#${id}`, target.id);
          // smooth scrolling: wait until the position has not changed for 10 frames in a row
          await page.waitForFunction(
            () =>
              new Promise((resolve) => {
                let y = scrollY;
                let still = 0;
                const tick = () => {
                  still = scrollY === y ? still + 1 : 0;
                  y = scrollY;
                  if (still >= 10) resolve(true);
                  else requestAnimationFrame(tick);
                };
                requestAnimationFrame(tick);
              }),
          );
          const pos = await page.evaluate((id) => {
            const nav = document.querySelector('.nav')?.getBoundingClientRect();
            const h = document.getElementById(id).getBoundingClientRect();
            const atBottom = Math.ceil(scrollY + innerHeight) >= document.documentElement.scrollHeight - 1;
            return { top: h.top, navBottom: nav ? nav.bottom : 0, atBottom };
          }, target.id);
          assert.ok(pos.top >= pos.navBottom - 1, `${name} ${lang}/${doc} #${target.id}: heading not hidden under the nav (${pos.top} < ${pos.navBottom})`);
          if (!pos.atBottom) assert.ok(pos.top < pos.navBottom + 60, `${name} ${lang}/${doc} #${target.id}: heading lands at the top (${pos.top})`);
        }
      }
      assert.deepEqual(await problems(), []);
      await context.close();
    }
  });

  test('the two documents link to each other in the same language', async () => {
    const context = await f.state.browser.newContext(DESKTOP);
    const { page, problems } = await openPage(context);
    for (const lang of LANGS) {
      for (const doc of DOCS) {
        const other = doc === 'privacy' ? 'terms' : 'privacy';
        await page.goto(f.state.base + legalUrl(lang, doc), { waitUntil: 'load' });
        const inText = await page.$$eval('.legal__body p a, .legal__body li a', (as) => as.map((a) => a.getAttribute('href')));
        assert.ok(inText.includes(legalUrl(lang, other)), `${lang}/${doc}: inline link to ${other}`);
        assert.equal(await page.$eval('.legal__see a', (a) => a.getAttribute('href')), legalUrl(lang, other), `${lang}/${doc}: see also`);
        assert.equal(await page.$eval('.legal__back', (a) => a.getAttribute('href')), LANG_PATHS[lang], `${lang}/${doc}: back to this language's home`);
      }
    }
    assert.deepEqual(await problems(), []);
    await context.close();
  });

  test('footer and the consent line point to this language’s pages; the language switch keeps the document', async () => {
    const context = await f.state.browser.newContext(DESKTOP);
    const { page, problems } = await openPage(context);
    for (const lang of LANGS) {
      for (const url of [LANG_PATHS[lang], legalUrl(lang, 'privacy'), legalUrl(lang, 'terms')]) {
        await page.goto(f.state.base + url, { waitUntil: 'load' });
        const footer = await page.$$eval('.footer a[data-legal-link]', (as) => Object.fromEntries(as.map((a) => [a.dataset.legalLink, a.getAttribute('href')])));
        assert.deepEqual(footer, { privacy: legalUrl(lang, 'privacy'), terms: legalUrl(lang, 'terms') }, `${url}: footer legal links`);
      }
      await page.goto(f.state.base + LANG_PATHS[lang], { waitUntil: 'load' });
      const consent = await page.$$eval('.consent a[data-legal-link]', (as) => as.map((a) => [a.dataset.legalLink, a.getAttribute('href'), a.textContent.trim()]));
      const form = CONTENT[lang].contact.form;
      assert.deepEqual(
        consent,
        [
          ['privacy', legalUrl(lang, 'privacy'), form.consentLink],
          ['terms', legalUrl(lang, 'terms'), form.consentTermsLink],
        ],
        `${lang}: consent links the privacy policy and the terms`,
      );
      for (const doc of DOCS) {
        await page.goto(f.state.base + legalUrl(lang, doc), { waitUntil: 'load' });
        const switcher = await page.$$eval('.lang__menu a[data-lang-link]', (as) => Object.fromEntries(as.map((a) => [a.getAttribute('hreflang'), a.getAttribute('href')])));
        assert.deepEqual(switcher, Object.fromEntries(LANGS.map((l) => [l, legalUrl(l, doc)])), `${lang}/${doc}: language switch`);
        const alternates = await page.$$eval('link[rel="alternate"][hreflang]', (ls) => Object.fromEntries(ls.map((l) => [l.hreflang, new URL(l.href).pathname])));
        for (const l of LANGS) assert.equal(alternates[l], legalUrl(l, doc), `${lang}/${doc}: hreflang ${l}`);
        assert.equal(new URL(await page.$eval('link[rel="canonical"]', (l) => l.href)).pathname, legalUrl(lang, doc), `${lang}/${doc}: canonical`);
      }
    }
    assert.deepEqual(await problems(), []);
    await context.close();
  });

  test('no horizontal overflow at 390 and 1440 px', async () => {
    for (const [name, opts] of [['phone', MOBILE], ['desktop', DESKTOP]]) {
      const context = await f.state.browser.newContext(opts);
      const { page, problems } = await openPage(context);
      for (const lang of LANGS) {
        for (const doc of DOCS) {
          await page.goto(f.state.base + legalUrl(lang, doc), { waitUntil: 'load' });
          const o = await page.evaluate(() => {
            const vw = document.documentElement.clientWidth;
            const wide = [...document.querySelectorAll('.legal *')].filter((el) => el.getBoundingClientRect().right > vw + 1).map((el) => `${el.tagName.toLowerCase()}.${el.className}`);
            return { scroll: document.documentElement.scrollWidth, vw, wide: wide.slice(0, 5) };
          });
          assert.ok(o.scroll <= o.vw, `${name} ${lang}/${doc}: page scrolls sideways (${o.scroll} > ${o.vw})`);
          assert.deepEqual(o.wide, [], `${name} ${lang}/${doc}: elements past the right edge`);
        }
      }
      assert.deepEqual(await problems(), []);
      await context.close();
    }
  });

  test('print: no site chrome or contents, black on white', async () => {
    const context = await f.state.browser.newContext(DESKTOP);
    const { page, problems } = await openPage(context);
    await page.goto(f.state.base + legalUrl('de', 'terms'), { waitUntil: 'load' });
    await page.emulateMedia({ media: 'print' });
    const p = await page.evaluate(() => {
      const shown = (sel) => {
        const el = document.querySelector(sel);
        return !!el && getComputedStyle(el).display !== 'none';
      };
      return {
        nav: shown('.nav'),
        footer: shown('.footer'),
        toc: shown('.legal__toc'),
        body: shown('.legal__body'),
        color: getComputedStyle(document.querySelector('.legal__p')).color,
        bg: getComputedStyle(document.body).backgroundColor,
      };
    });
    assert.deepEqual(p, { nav: false, footer: false, toc: false, body: true, color: 'rgb(0, 0, 0)', bg: 'rgb(255, 255, 255)' });
    assert.deepEqual(await problems(), []);
    await context.close();
  });

  test('sitemap lists every legal page with hreflang alternates; llms.txt links them', async () => {
    const sitemap = await (await fetch(f.state.base + '/sitemap-0.xml')).text();
    for (const doc of DOCS) {
      for (const lang of LANGS) {
        const entry = [...sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => m[1]).find((u) => new RegExp(`<loc>https?://[^<]+?${legalUrl(lang, doc)}</loc>`).test(u));
        assert.ok(entry, `sitemap: ${legalUrl(lang, doc)}`);
        for (const l of LANGS) assert.match(entry, new RegExp(`hreflang="${l}" href="https?://[^"]+?${legalUrl(l, doc)}"`), `sitemap ${legalUrl(lang, doc)}: alternate ${l}`);
      }
    }
    const llms = await (await fetch(f.state.base + '/llms.txt')).text();
    const full = await (await fetch(f.state.base + '/llms-full.txt')).text();
    for (const lang of ['ru', 'en']) for (const doc of DOCS) assert.match(llms, new RegExp(`\\(https?://[^)]+?${legalUrl(lang, doc)}\\)`), `llms.txt: ${lang} ${doc}`);
    for (const lang of LANGS) for (const doc of DOCS) assert.ok(full.includes(legalUrl(lang, doc)), `llms-full.txt: ${lang} ${doc}`);
    assert.doesNotMatch(full, /\[\[(privacy|terms)\|/, 'llms-full.txt: cross-link markup is resolved');
  });
});
