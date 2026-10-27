#!/usr/bin/env node
/**
 * End-to-end smoke test: builds nothing — expects `dist/` to exist and the secure server to be
 * reachable (run `npm run build && npm run serve:secure` first, or pass BASE_URL).
 * Captures screenshots (desktop + mobile) of every page into ./qa/, fails on console errors,
 * page errors, failed requests, CSP violations or horizontal overflow.
 *
 * Requires Playwright with Chromium: `npx playwright install chromium`
 * (or set PLAYWRIGHT_MODULE to an existing playwright installation).
 */
import fs from 'node:fs';
import path from 'node:path';

const pwModule = process.env.PLAYWRIGHT_MODULE || 'playwright';
const { chromium } = await import(pwModule);
const base = process.env.BASE_URL || 'http://127.0.0.1:4322';
const out = path.resolve('qa');
fs.mkdirSync(out, { recursive: true });

const pages = ['/', '/ru/', '/az/', '/de/', '/privacy/', '/ru/privacy/', '/terms/', '/de/terms/', '/this-page-does-not-exist'];
const viewports = { desktop: { width: 1440, height: 900 }, mobile: { width: 390, height: 844 } };
const browser = await chromium.launch();
let failures = 0;

for (const [vpName, vp] of Object.entries(viewports)) {
  const ctx = await browser.newContext({ viewport: vp });
  for (const p of pages) {
    const page = await ctx.newPage();
    const problems = [];
    page.on('console', (m) => { if (m.type() === 'error') problems.push(`console.error: ${m.text()}`); });
    page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
    page.on('requestfailed', (r) => problems.push(`requestfailed: ${r.url()}`));
    await page.addInitScript(() => {
      window.__csp = [];
      document.addEventListener('securitypolicyviolation', (e) => window.__csp.push(`${e.violatedDirective} blocked ${e.blockedURI}`));
    });
    const res = await page.goto(base + p, { waitUntil: 'networkidle' });
    const expected404 = p.includes('does-not-exist');
    if (!res || (expected404 ? res.status() !== 404 : res.status() !== 200)) problems.push(`unexpected status ${res?.status()}`);
    await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
    await page.evaluate(async () => {
      const h = document.body.scrollHeight;
      for (let y = 0; y < h; y += 400) { window.scrollTo({ top: y, behavior: 'instant' }); await new Promise((r) => setTimeout(r, 60)); }
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
    await page.waitForTimeout(1500);
    const csp = await page.evaluate(() => window.__csp);
    csp.forEach((v) => problems.push(`CSP: ${v}`));
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (overflow > 1) problems.push(`horizontal overflow: ${overflow}px`);
    // 404 page legitimately logs a failed resource status; ignore that one line
    const real = problems.filter((x) => !(expected404 && x.includes('status of 404')));
    const slug = p.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '') || 'home';
    await page.screenshot({ path: path.join(out, `${vpName}-${slug}.png`) });
    if (real.length) { failures++; console.log(`✗ ${vpName} ${p}\n   ${real.join('\n   ')}`); }
    else console.log(`✓ ${vpName} ${p} (${res?.status()})`);
    await page.close();
  }
  await ctx.close();
}
await browser.close();
console.log(failures ? `\n${failures} page(s) with problems` : '\nAll pages clean');
process.exit(failures ? 1 : 0);
