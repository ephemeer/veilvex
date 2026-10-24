#!/usr/bin/env node
/**
 * Renders public/og.png (1200×630, the OpenGraph / Twitter cover) from scripts/og/og.html with
 * Playwright + Chromium. The brand and the two taglines are taken from the i18n content
 * (ru/en hero.eyebrow), so the cover stays in sync with the site copy.
 *
 * NOT part of the build (Playwright is not installed on Netlify): run `npm run gen:og` locally
 * after changing the template or the taglines and commit the PNG.
 *
 * Playwright is resolved from PLAYWRIGHT_MODULE, then the local install, then the global npm root
 * (`npm root -g`). Chromium: `npx playwright install chromium` or PLAYWRIGHT_BROWSERS_PATH.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const template = path.join(here, 'og.html');
const out = path.resolve('public/og.png');
const WIDTH = 1200;
const HEIGHT = 630;

async function loadPlaywright() {
  const candidates = [process.env.PLAYWRIGHT_MODULE, 'playwright'].filter(Boolean);
  try {
    candidates.push(path.join(execSync('npm root -g', { encoding: 'utf8' }).trim(), 'playwright', 'index.mjs'));
  } catch {
    /* npm not available — fine */
  }
  for (const c of candidates) {
    try {
      return await import(c.includes('/') || c.includes('\\') ? pathToFileURL(c).href : c);
    } catch {
      /* try next */
    }
  }
  throw new Error(`Playwright not found (tried: ${candidates.join(', ')}). Install it or set PLAYWRIGHT_MODULE.`);
}

const plain = (s) => s.replace(/\{\{(.+?)\}\}/g, '$1').replace(/\n/g, ' ');
const { ru } = await import('../../src/i18n/ru.ts');
const { en } = await import('../../src/i18n/en.ts');
const data = { brand: ru.brand, ru: plain(ru.hero.eyebrow), en: plain(en.hero.eyebrow) };

const { chromium } = await loadPlaywright();
// file:// pages need the flag to load the self-hosted woff2 files next to the template.
const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
try {
  const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: 1 });
  const problems = [];
  page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
  page.on('requestfailed', (r) => problems.push(`requestfailed: ${r.url()}`));
  await page.goto(pathToFileURL(template).href, { waitUntil: 'load' });
  await page.evaluate((d) => {
    document.querySelector('[data-brand]').textContent = d.brand;
    document.querySelector('[data-tagline-ru]').textContent = d.ru;
    document.querySelector('[data-tagline-en]').textContent = d.en;
  }, data);
  await page.evaluate(() => document.fonts.ready);
  const fonts = await page.evaluate(() => [...document.fonts].map((f) => `${f.family} ${f.weight} ${f.status}`));
  const loaded = fonts.filter((f) => f.endsWith(' loaded'));
  if (loaded.length < 2) problems.push(`fonts not loaded: ${fonts.join(' | ') || 'none'}`);
  const overflow = await page.evaluate(() => {
    const limit = document.body.clientWidth - 88;
    return [...document.querySelectorAll('.tagline span, .brand')].filter((el) => el.getBoundingClientRect().right > limit).map((el) => el.className);
  });
  if (overflow.length) problems.push(`text overflows the right margin: ${overflow.join(', ')}`);
  if (problems.length) throw new Error(problems.join('\n'));
  fs.mkdirSync(path.dirname(out), { recursive: true });
  await page.screenshot({ path: out, type: 'png', clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT } });
  console.log(`og.png → ${path.relative(process.cwd(), out)} (${WIDTH}×${HEIGHT}, ${(fs.statSync(out).size / 1024).toFixed(0)} KB, fonts: ${loaded.length} loaded)\n  "${data.ru}" / "${data.en}"`);
} finally {
  await browser.close();
}
