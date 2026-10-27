/**
 * Case-study pages (src/components/CasePage.astro, /cases/<slug>/ in every language): content against
 * src/i18n/cases/*.ts, head (title, description, canonical, hreflang, JSON-LD Article + breadcrumbs),
 * a clean console / CSP and no horizontal overflow at 390 and 1440, the table of contents, previous /
 * next, the CTA → request-form handoff with the case's service preselected, the live-site links, the
 * case sheet's "read the full case" link, and the sitemap / llms-full.txt entries.
 *
 * Language paths come from LANG_PATHS (helpers.mjs), never literals.
 */
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { DESKTOP, LANG_PATHS, MOBILE, fixture, openPage } from './helpers.mjs';

const { ru } = await import('../../src/i18n/ru.ts');
const { en } = await import('../../src/i18n/en.ts');
const { az } = await import('../../src/i18n/az.ts');
const { de } = await import('../../src/i18n/de.ts');
const { CASE_SLUGS, CASE_META, CASE_SERVICE } = await import('../../src/i18n/cases/meta.ts');
const DETAILS = {
  ru: (await import('../../src/i18n/cases/ru.ts')).ru,
  en: (await import('../../src/i18n/cases/en.ts')).en,
  az: (await import('../../src/i18n/cases/az.ts')).az,
  de: (await import('../../src/i18n/cases/de.ts')).de,
};
const CONTENT = { ru, en, az, de };
const LANGS = Object.keys(LANG_PATHS);
const DEFAULT = LANGS.find((l) => LANG_PATHS[l] === '/');

const f = fixture();
before(f.setup);
after(f.teardown);

/** Site path of a case page: LANG_PATHS[lang] + cases/<slug>/ */
const casePath = (lang, slug) => `${LANG_PATHS[lang]}cases/${slug}/`;
const get = (path) => fetch(f.state.base + path);
const norm = (s) => s.replace(/\s+/g, ' ').trim();

describe('every case page in every language', () => {
  test('12 × 4 pages exist, with their own title, description, canonical, hreflang and JSON-LD', async () => {
    assert.equal(CASE_SLUGS.length, 12);
    const titles = new Set();
    for (const lang of LANGS) {
      const t = CONTENT[lang];
      assert.equal(t.cases.items.length, CASE_SLUGS.length, `${lang}: one slug per case`);
      for (const [i, slug] of CASE_SLUGS.entries()) {
        const path = casePath(lang, slug);
        const res = await get(path);
        assert.equal(res.status, 200, path);
        const html = await res.text();
        const title = html.match(/<title>([^<]+)<\/title>/)?.[1] ?? '';
        assert.ok(title.startsWith(t.cases.items[i].title.replace(/&/g, '&amp;')), `${path}: <title> starts with the case title (${title})`);
        assert.ok(!titles.has(title), `${path}: unique <title>`);
        titles.add(title);
        const desc = html.match(/<meta name="description" content="([^"]+)"/)?.[1];
        assert.ok(desc && desc.length >= 50 && desc.length <= 160, `${path}: description of a sensible length (${desc?.length})`);
        const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1] ?? '';
        assert.ok(canonical.endsWith(path), `${path}: canonical (${canonical})`);
        const alternates = Object.fromEntries([...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map((m) => [m[1], m[2]]));
        assert.deepEqual(Object.keys(alternates).sort(), ['az', 'de', 'en', 'ru', 'x-default'], `${path}: 4 hreflang + x-default`);
        for (const l of LANGS) assert.ok(alternates[l].endsWith(casePath(l, slug)), `${path}: hreflang ${l}`);
        assert.equal(alternates['x-default'], alternates[DEFAULT], `${path}: x-default = the default language`);
        assert.match(html, /<meta property="og:type" content="article">/);
        // JSON-LD: the Article (stable @id = page#case) is the page's main entity; breadcrumbs home → cases → case
        const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
        assert.equal(blocks.length, 1, `${path}: one JSON-LD block`);
        const graph = blocks[0]['@graph'];
        const article = graph.find((n) => n['@type'] === 'Article');
        assert.ok(article, `${path}: an Article node`);
        assert.equal(article['@id'], `${canonical}#case`);
        assert.equal(article.headline, t.cases.items[i].title);
        assert.equal(article.inLanguage, t.locale);
        assert.match(article.isBasedOn['@id'], new RegExp(`#case-${i + 1}$`));
        const page = graph.find((n) => n['@type'] === 'WebPage');
        assert.equal(page.mainEntity['@id'], article['@id']);
        const crumbs = graph.find((n) => n['@type'] === 'BreadcrumbList');
        assert.equal(crumbs.itemListElement.length, 3);
        assert.equal(crumbs.itemListElement[2].item, canonical);
        const ids = graph.map((n) => n['@id']);
        assert.equal(new Set(ids).size, ids.length, `${path}: @id values are unique`);
        // never the source's contacts or money in another currency
        assert.doesNotMatch(html, /994\s?50\s?493|mdh@|my\s?digital\s?home|манат|\bAZN\b|₼|₽|рубл/i, `${path}: no foreign contacts / currencies`);
      }
    }
  });

  for (const lang of LANGS) {
    test(`${lang}: each page shows its title, lead, facts and every section; clean console, no overflow at 390 / 1440`, async () => {
      const t = CONTENT[lang];
      const d = DETAILS[lang];
      for (const [label, options] of [
        ['desktop', DESKTOP],
        ['phone', MOBILE],
      ]) {
        const context = await f.state.browser.newContext(options);
        const { page, problems } = await openPage(context);
        for (const [i, slug] of CASE_SLUGS.entries()) {
          const path = casePath(lang, slug);
          await page.goto(f.state.base + path, { waitUntil: 'load' });
          const data = await page.evaluate(() => ({
            lang: document.documentElement.lang,
            h1: document.querySelector('h1')?.textContent ?? '',
            lead: document.querySelector('.cs-lead')?.textContent ?? '',
            sections: [...document.querySelectorAll('[data-case-section]')].map((s) => ({ id: s.id, h: s.querySelector('h2')?.textContent ?? '' })),
            toc: [...document.querySelectorAll('.cs-aside [data-toc-link]')].map((a) => a.getAttribute('href')),
            tags: [...document.querySelectorAll('.cs-tags li')].map((li) => li.textContent),
            facts: document.querySelector('.cs-facts')?.textContent ?? '',
            overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
            imgs: [...document.querySelectorAll('.cs-media img')].map((img) => ({ alt: img.alt, w: img.getAttribute('width'), h: img.getAttribute('height'), lazy: img.loading })),
          }));
          assert.equal(data.lang.slice(0, 2), lang, `${path}: <html lang>`);
          assert.equal(norm(data.h1), t.cases.items[i].title, `${path}: H1`);
          assert.equal(norm(data.lead), d.items[slug].lead, `${path}: lead`);
          const sections = d.items[slug].sections;
          assert.deepEqual(
            data.sections.map((s) => s.id),
            sections.map((s) => s.id),
            `${path}: sections in order`,
          );
          data.sections.forEach((s, k) => assert.equal(norm(s.h), `${String(k + 1).padStart(2, '0')}${sections[k].title}`, `${path}: section ${k + 1} heading`));
          assert.deepEqual(data.toc, sections.map((s) => `#${s.id}`), `${path}: table of contents`);
          assert.deepEqual(data.tags, d.items[slug].tags, `${path}: tech chips`);
          for (const fct of d.items[slug].facts) assert.ok(norm(data.facts).includes(fct.value), `${path}: fact ${fct.label}`);
          assert.ok(norm(data.facts).includes(d.items[slug].result), `${path}: result`);
          assert.equal(data.overflow, 0, `${path} (${label}): no horizontal overflow`);
          // screenshots: as many as the meta lists, with alt text and explicit dimensions; the first is eager
          assert.equal(data.imgs.length, CASE_META[slug].shots.length, `${path}: screenshots`);
          data.imgs.forEach((img, k) => {
            assert.ok(img.alt.length > 10 && img.w && img.h, `${path}: screenshot ${k + 1} has alt and size`);
            assert.equal(img.lazy, k === 0 ? 'auto' : 'lazy', `${path}: screenshot ${k + 1} loading`);
          });
        }
        assert.deepEqual(await problems(), [], `${lang} ${label}: console / CSP`);
        await context.close();
      }
    });
  }
});

describe('navigation on a case page', () => {
  test('desktop: TOC links jump to their section and mark it; the TOC stays in view', async () => {
    const context = await f.state.browser.newContext(DESKTOP);
    const { page, problems } = await openPage(context);
    const lang = 'ru';
    const slug = 'yakitori-site';
    await page.goto(f.state.base + casePath(lang, slug), { waitUntil: 'load' });
    const ids = DETAILS[lang].items[slug].sections.map((s) => s.id);
    for (const id of [ids[ids.length - 2], ids[2], ids[0]]) {
      await page.click(`.cs-aside [data-toc-link="${id}"]`);
      await page.waitForFunction((id) => location.hash === `#${id}`, id);
      // smooth scroll settles
      await page.waitForFunction(
        (id) => {
          const top = document.getElementById(id).getBoundingClientRect().top;
          return top >= 0 && top < innerHeight * 0.3;
        },
        id,
        { timeout: 5000 },
      );
      // the mark follows the reading position while the smooth scroll runs; once it rests, it is the target
      await page.waitForFunction((id) => document.querySelector(`.cs-aside [data-toc-link="${id}"]`).getAttribute('aria-current') === 'location', id, { timeout: 5000 });
      assert.equal(await page.$$eval('.cs-aside [aria-current="location"]', (a) => a.length), 1, 'one marked link');
      const toc = await page.$eval('.cs-aside .cs-toc', (el) => el.getBoundingClientRect().toJSON());
      assert.ok(toc.top >= 0 && toc.top < 200, 'the TOC is sticky');
    }
    assert.equal(await page.$eval('.cs-toc-m', (el) => getComputedStyle(el).display), 'none', 'the phone toggle is hidden on desktop');
    assert.deepEqual(await problems(), []);
    await context.close();
  });

  test('phone: the TOC is a collapsed toggle; its links jump to the sections', async () => {
    const context = await f.state.browser.newContext(MOBILE);
    const { page, problems } = await openPage(context);
    const lang = 'de';
    const slug = 'mybuild';
    await page.goto(f.state.base + casePath(lang, slug), { waitUntil: 'load' });
    assert.equal(await page.$eval('.cs-aside', (el) => getComputedStyle(el).display), 'none', 'no side column on phones');
    assert.equal(await page.$eval('.cs-toc-m', (el) => el.open), false, 'collapsed by default');
    await page.tap('.cs-toc-m summary');
    assert.equal(await page.$eval('.cs-toc-m', (el) => el.open), true);
    const id = DETAILS[lang].items[slug].sections.at(-1).id;
    await page.tap(`.cs-toc-m [data-toc-link="${id}"]`);
    await page.waitForFunction((id) => location.hash === `#${id}`, id);
    await page.waitForFunction(
      (id) => {
        const r = document.getElementById(id).getBoundingClientRect();
        return r.top >= 0 && r.top < innerHeight;
      },
      id,
      { timeout: 5000 },
    );
    assert.deepEqual(await problems(), []);
    await context.close();
  });

  test('next goes through all 12 cases in order and comes back round; previous goes the other way', async () => {
    const context = await f.state.browser.newContext(DESKTOP);
    const { page, problems } = await openPage(context);
    const lang = 'en';
    const t = CONTENT[lang];
    await page.goto(f.state.base + casePath(lang, CASE_SLUGS[0]), { waitUntil: 'load' });
    for (let k = 1; k <= CASE_SLUGS.length; k++) {
      const n = k % CASE_SLUGS.length;
      await Promise.all([page.waitForURL((u) => u.pathname === casePath(lang, CASE_SLUGS[n])), page.click('[data-case-next]')]);
      assert.equal(norm(await page.textContent('h1')), t.cases.items[n].title, `next → case ${n + 1}`);
    }
    await Promise.all([page.waitForURL((u) => u.pathname === casePath(lang, CASE_SLUGS.at(-1))), page.click('[data-case-prev]')]);
    assert.equal(norm(await page.textContent('h1')), t.cases.items.at(-1).title, 'previous from case 1 → case 12');
    assert.equal(await page.getAttribute('[data-case-prev]', 'rel'), 'prev');
    assert.equal(await page.getAttribute('[data-case-next]', 'rel'), 'next');
    // the breadcrumb leads back to the cases on the home page
    await Promise.all([page.waitForURL((u) => u.pathname === LANG_PATHS[lang] && u.hash === '#cases'), page.click('.cs-crumbs li:nth-child(2) a')]);
    assert.deepEqual(await problems(), []);
    await context.close();
  });

  test('"Discuss a similar project" lands on the request form with the case’s service preselected', async () => {
    const context = await f.state.browser.newContext(DESKTOP);
    const { page, problems } = await openPage(context);
    // one case of every type, across languages
    const picks = [
      ['ru', 'mybuild'],
      ['en', 'target-english-courses'],
      ['az', 'alfanet'],
      ['de', 'yakitori-menu'],
    ];
    for (const [lang, slug] of picks) {
      const i = CASE_SLUGS.indexOf(slug);
      const service = CASE_SERVICE[CONTENT[lang].cases.items[i].type];
      await page.goto(f.state.base + casePath(lang, slug), { waitUntil: 'load' });
      const ctas = await page.$$eval('[data-case-cta]', (els) => els.map((a) => a.getAttribute('href')));
      assert.equal(ctas.length, 2, `${lang}/${slug}: hero + closing CTA`);
      assert.deepEqual(new Set(ctas).size, 1);
      await Promise.all([
        page.waitForURL((u) => u.pathname === LANG_PATHS[lang] && u.searchParams.get('service') === service && u.hash === '#contact'),
        page.click('.cs-cta [data-case-cta]'),
      ]);
      await page.waitForFunction((s) => document.querySelector(`input[name="services"][value="${s}"]`)?.checked === true, service, { timeout: 5000 });
      const checked = await page.$$eval('input[name="services"]:checked', (els) => els.map((e) => e.value));
      assert.deepEqual(checked, [service], `${lang}/${slug}: only "${service}" is preselected`);
    }
    assert.deepEqual(await problems(), []);
    await context.close();
  });

  test('the live-site link is external and safe, and only there when the client site is public', async () => {
    for (const lang of LANGS) {
      for (const slug of CASE_SLUGS) {
        const html = await (await get(casePath(lang, slug))).text();
        const links = [...html.matchAll(/<a\b[^>]*data-case-live[^>]*>/g)].map((m) => m[0]);
        const live = CASE_META[slug].live?.[lang];
        if (!live) {
          assert.equal(links.length, 0, `${lang}/${slug}: no live link`);
          continue;
        }
        assert.equal(links.length, 1, `${lang}/${slug}: one live link`);
        const a = links[0];
        assert.match(a, new RegExp(`href="${live.replace(/[.?/]/g, '\\$&')}"`));
        assert.match(a, /target="_blank"/);
        const rel = a.match(/rel="([^"]+)"/)?.[1].split(/\s+/) ?? [];
        assert.ok(rel.includes('noopener') && rel.includes('noreferrer'), `${lang}/${slug}: rel=${rel}`);
        assert.match(live, /^https:\/\//);
      }
    }
  });
});

describe('the case sheet links to the full case', () => {
  test('every sheet article carries "read the full case" (and the live site where there is one)', async () => {
    for (const lang of LANGS) {
      const html = await (await get(LANG_PATHS[lang])).text();
      const more = [...html.matchAll(/<a href="([^"]+)"[^>]*data-sheet-more[^>]*>([\s\S]*?)<\/a>/g)];
      assert.equal(more.length, CASE_SLUGS.length, `${lang}: one link per case`);
      more.forEach((m, i) => {
        assert.equal(m[1], casePath(lang, CASE_SLUGS[i]), `${lang}: case ${i + 1} link`);
        assert.ok(m[2].includes(DETAILS[lang].labels.readFull), `${lang}: link text`);
      });
      const live = [...html.matchAll(/<a\b[^>]*data-sheet-live[^>]*>/g)].map((m) => m[0]);
      assert.equal(live.length, CASE_SLUGS.filter((s) => CASE_META[s].live).length, `${lang}: live links`);
      for (const a of live) {
        assert.match(a, /target="_blank"/);
        assert.match(a, /rel="noopener noreferrer"/);
      }
    }
  });

  test('clicking it in an open sheet opens the case page in the same language', async () => {
    for (const [lang, options] of [
      ['ru', DESKTOP],
      [DEFAULT, MOBILE],
    ]) {
      const context = await f.state.browser.newContext(options);
      const { page, problems } = await openPage(context);
      const n = 8;
      await page.goto(`${f.state.base}${LANG_PATHS[lang]}#case-${n}`, { waitUntil: 'load' });
      await page.waitForSelector('[data-sheet].is-open', { state: 'attached', timeout: 5000 });
      const link = `[data-sheet-case="${n}"] [data-sheet-more]`;
      await page.$eval(link, (a) => a.scrollIntoView({ block: 'center', behavior: 'instant' }));
      await Promise.all([page.waitForURL((u) => u.pathname === casePath(lang, CASE_SLUGS[n - 1])), page.click(link)]);
      assert.equal(norm(await page.textContent('h1')), CONTENT[lang].cases.items[n - 1].title);
      assert.deepEqual(await problems(), [], `${lang}: console / CSP`);
      await context.close();
    }
  });
});

describe('sitemap and llms-full.txt', () => {
  test('the sitemap lists every case page in every language', async () => {
    const xml = await (await get('/sitemap-0.xml')).text();
    for (const lang of LANGS) for (const slug of CASE_SLUGS) assert.ok(xml.includes(`${casePath(lang, slug)}</loc>`), `${lang}/${slug} in the sitemap`);
  });

  test('llms-full.txt carries every case study (RU and EN in full, AZ and DE as links)', async () => {
    const text = await (await get('/llms-full.txt')).text();
    for (const lang of ['ru', 'en']) {
      for (const [i, slug] of CASE_SLUGS.entries()) {
        const d = DETAILS[lang].items[slug];
        assert.ok(text.includes(`${casePath(lang, slug)}`), `${lang}/${slug}: page link`);
        assert.ok(text.includes(d.lead), `${lang}/${slug}: lead`);
        for (const s of d.sections) assert.ok(text.includes(s.title), `${lang}/${slug}: section ${s.title}`);
        assert.ok(text.includes(CONTENT[lang].cases.items[i].title));
      }
    }
    for (const lang of ['az', 'de']) for (const slug of CASE_SLUGS) assert.ok(text.includes(casePath(lang, slug)), `${lang}/${slug}: link`);
    assert.doesNotMatch(text, /my\s?digital\s?home|994\s?50\s?493|mdh@/i);
  });
});
