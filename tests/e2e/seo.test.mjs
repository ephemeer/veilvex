/**
 * SEO / GEO infrastructure: llms.txt, robots.txt, JSON-LD graph, OG cover, sitemap, canonical + hreflang.
 */
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { DESKTOP, LANG_PATHS, fixture, openPage } from './helpers.mjs';

const f = fixture();
before(f.setup);
after(f.teardown);

const { ru } = await import('../../src/i18n/ru.ts');
const SERVICE_TITLES = ru.services.items.map((s) => s.title);

const get = (path) => fetch(f.state.base + path);

describe('llms.txt / robots.txt', () => {
  test('llms.txt and llms-full.txt are text/plain and carry the brand and all 9 services', async () => {
    assert.equal(SERVICE_TITLES.length, 9);
    for (const path of ['/llms.txt', '/llms-full.txt']) {
      const res = await get(path);
      assert.equal(res.status, 200, path);
      assert.match(res.headers.get('content-type') ?? '', /^text\/plain/, path);
      const text = await res.text();
      assert.ok(text.includes('Veilvex'), `${path} mentions the brand`);
      for (const title of SERVICE_TITLES) assert.ok(text.includes(title), `${path} lists "${title}"`);
      assert.doesNotMatch(text, /nexum/i, `${path} has no leftover brand`);
      assert.doesNotMatch(text, /<\/?script/i);
    }
  });

  test('robots.txt advertises the sitemap and welcomes the AI crawlers', async () => {
    const res = await get('/robots.txt');
    assert.equal(res.status, 200);
    const text = await res.text();
    assert.match(text, /^Sitemap: https?:\/\/\S+\/sitemap-index\.xml$/m);
    for (const agent of ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended', 'OAI-SearchBot']) {
      assert.match(text, new RegExp(`^User-agent: ${agent}\\nAllow: /\\nDisallow: /api/$`, 'm'), agent);
    }
    assert.match(text, /^User-agent: \*$/m);
  });

  test('sitemap-index.xml exists and points at a sitemap', async () => {
    const res = await get('/sitemap-index.xml');
    assert.equal(res.status, 200);
    assert.match(await res.text(), /<sitemapindex[\s\S]*<loc>https?:\/\/\S+\/sitemap-0\.xml<\/loc>/);
    assert.equal((await get('/sitemap-0.xml')).status, 200);
  });
});

describe('JSON-LD and head links', () => {
  test('every home page has exactly one JSON-LD graph with Organization, WebSite, FAQPage and 9 Services', async () => {
    const context = await f.state.browser.newContext(DESKTOP);
    const { page, problems } = await openPage(context);
    for (const [lang, path] of Object.entries(LANG_PATHS)) {
      await page.goto(f.state.base + path, { waitUntil: 'load' });
      const blocks = await page.$$eval('script[type="application/ld+json"]', (els) => els.map((e) => e.textContent));
      assert.equal(blocks.length, 1, `${lang}: one data block`);
      assert.doesNotMatch(blocks[0], /<|&/, `${lang}: < and & are escaped`);
      const data = JSON.parse(blocks[0]);
      assert.equal(data['@context'], 'https://schema.org');
      const types = data['@graph'].map((n) => n['@type']);
      for (const t of ['Organization', 'WebSite', 'WebPage', 'FAQPage']) assert.equal(types.filter((x) => x === t).length, 1, `${lang}: one ${t}`);
      assert.equal(types.filter((x) => x === 'Service').length, 9, `${lang}: nine Service nodes`);
      const ids = data['@graph'].map((n) => n['@id']);
      assert.equal(new Set(ids).size, ids.length, `${lang}: @id values are unique`);
      assert.equal(await page.$eval('html', (el) => el.lang.slice(0, 2)), lang);
    }
    assert.deepEqual(await problems(), []);
    await context.close();
  });

  test('every home page has canonical + 4 hreflang + x-default', async () => {
    for (const [lang, path] of Object.entries(LANG_PATHS)) {
      const html = await (await get(path)).text();
      const canonical = [...html.matchAll(/<link rel="canonical" href="([^"]+)"/g)].map((m) => m[1]);
      assert.equal(canonical.length, 1, `${lang}: one canonical`);
      assert.match(canonical[0], new RegExp(`^https?://[^/]+${path.replace(/\//g, '\\/')}$`));
      const alternates = Object.fromEntries([...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map((m) => [m[1], m[2]]));
      assert.deepEqual(Object.keys(alternates).sort(), ['az', 'de', 'en', 'ru', 'x-default']);
      assert.equal(alternates['x-default'], alternates.en, 'x-default is the English page at the root');
      assert.equal(alternates[lang], canonical[0], 'hreflang of the current language equals the canonical');
    }
  });

  test('/og.png is a 1200×630 PNG', async () => {
    const res = await get('/og.png');
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('content-type'), 'image/png');
    const buf = Buffer.from(await res.arrayBuffer());
    assert.equal(buf.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', 'PNG signature');
    assert.equal(buf.subarray(12, 16).toString('ascii'), 'IHDR');
    assert.equal(buf.readUInt32BE(16), 1200);
    assert.equal(buf.readUInt32BE(20), 630);
    const html = await (await get('/ru/')).text();
    assert.match(html, /<meta property="og:image" content="https?:\/\/[^"]+\/og\.png">/);
  });
});
