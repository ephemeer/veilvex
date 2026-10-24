/**
 * Shared plumbing for the browser e2e tests (`npm run test:e2e`, Node's built-in test runner).
 *
 * Builds nothing: `dist/` must already exist (`npm run build`). Each test file starts its own
 * `scripts/serve-secure.mjs` on a free port (so the pages come with the real CSP / security headers
 * from netlify.toml) and its own Chromium, and tears both down when the file is done.
 *
 * Playwright is not a dependency of the site: it is resolved from PLAYWRIGHT_MODULE (path to an
 * existing installation, e.g. the global one) and falls back to a local `playwright` package.
 * Chromium: `npx playwright install chromium`.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const LANG_PATHS = { ru: '/', en: '/en/', az: '/az/', de: '/de/' };

const freePort = () =>
  new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.unref();
    srv.once('error', reject);
    srv.listen(0, '127.0.0.1', () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Starts scripts/serve-secure.mjs on a free port and waits until it answers. */
export async function startServer() {
  if (!fs.existsSync(path.join(ROOT, 'dist', 'index.html'))) {
    throw new Error('dist/ is missing — run `npm run build` before `npm run test:e2e`');
  }
  const port = await freePort();
  const child = spawn(process.execPath, [path.join(ROOT, 'scripts', 'serve-secure.mjs')], {
    cwd: ROOT,
    env: { ...process.env, PORT: String(port), CONTEXT: 'dev' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let log = '';
  child.stdout.on('data', (d) => (log += d));
  child.stderr.on('data', (d) => (log += d));
  // never outlive the test process, and never keep its event loop alive on our own
  child.unref();
  child.stdout.unref();
  child.stderr.unref();
  process.once('exit', () => child.kill('SIGKILL'));
  const base = `http://127.0.0.1:${port}`;
  const stop = () =>
    new Promise((resolve) => {
      if (child.exitCode !== null) return resolve();
      const killer = setTimeout(() => child.kill('SIGKILL'), 2000);
      child.once('exit', () => {
        clearTimeout(killer);
        resolve();
      });
      child.kill('SIGTERM');
    });
  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`serve-secure exited with ${child.exitCode}:\n${log}`);
    try {
      const res = await fetch(`${base}/`, { method: 'HEAD' });
      if (res.ok) return { base, stop };
    } catch {
      /* not up yet */
    }
    await sleep(100);
  }
  await stop();
  throw new Error(`serve-secure did not answer within 15 s:\n${log}`);
}

/** Launches Chromium from PLAYWRIGHT_MODULE (or the `playwright` package). */
export async function launchBrowser() {
  const spec = process.env.PLAYWRIGHT_MODULE || 'playwright';
  let pw;
  try {
    pw = await import(spec.includes('/') || spec.includes('\\') ? pathToFileURL(path.resolve(spec)).href : spec);
  } catch (err) {
    throw new Error(
      `Playwright not found (${spec}): ${err instanceof Error ? err.message : err}\n` +
        'Set PLAYWRIGHT_MODULE to an existing installation or `npm i -D playwright && npx playwright install chromium`.',
    );
  }
  return pw.chromium.launch();
}

/**
 * Opens a page that records console errors, page errors, failed requests and CSP violations.
 * `problems()` returns everything collected so far — assert it is empty at the end of a scenario.
 */
export async function openPage(context) {
  const page = await context.newPage();
  const list = [];
  page.on('console', (m) => {
    if (m.type() === 'error') list.push(`console.error: ${m.text()}`);
  });
  page.on('pageerror', (e) => list.push(`pageerror: ${e.message}`));
  page.on('requestfailed', (r) => list.push(`requestfailed: ${r.url()}`));
  await page.addInitScript(() => {
    window.__csp = [];
    document.addEventListener('securitypolicyviolation', (e) => window.__csp.push(`${e.violatedDirective} blocked ${e.blockedURI}`));
  });
  const problems = async () => [...list, ...(await page.evaluate(() => window.__csp.map((v) => `CSP: ${v}`)))];
  return { page, problems };
}

/** Starts the server and Chromium once per test file; returns before/after hook bodies. */
export function fixture() {
  const state = { base: '', browser: null, server: null };
  return {
    state,
    async setup() {
      state.server = await startServer();
      state.base = state.server.base;
      state.browser = await launchBrowser();
    },
    async teardown() {
      await state.browser?.close();
      await state.server?.stop();
    },
  };
}

export const DESKTOP = { viewport: { width: 1440, height: 900 } };
export const MOBILE = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true };
