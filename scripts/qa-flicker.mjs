#!/usr/bin/env node
/**
 * Flicker / flash / layout-jump detector — optional dev tool, NOT part of `npm run verify`.
 *
 * Records the compositor's frames (CDP Page.startScreencast, ~50 fps) while the built site loads
 * under a slow network + slow CPU, while every interactive state changes (mobile menu, language
 * popover, ⌘K, case filters, FAQ, form validation, service → form handoff, language switch) and
 * while scrolling. Consecutive frames are compared with PIL (scripts/lib/flicker-analyze.py): a
 * region that changes abruptly and then returns to its previous pixels (A→B→A) is a flash, a
 * frame-wide luminance jump is a white flash, text that re-renders when `document.fonts` finishes
 * loading is FOUT. A rAF sampler inside the page records element rects + opacity, the scrollbar
 * width, `:focus-visible`, `animationstart` events and layout-shift entries, so one-frame jumps,
 * double entrances, scrollbar-induced shifts and sticky/nav jitter are caught even between frames.
 *
 *   npm run build && node scripts/qa-flicker.mjs [options]
 *
 *   --base <url>          test a running server (default: starts scripts/serve-secure.mjs itself)
 *   --pages /,/en/,/de/   pages for the load / scroll scenarios
 *   --scenarios all | load,transitions,scroll,nojs,reduced
 *   --viewports desktop,mobile
 *   --cpu 4               CPU throttling for the load scenarios (Emulation.setCPUThrottlingRate)
 *   --net slow4g|fast3g|none   network for the load scenarios (Network.emulateNetworkConditions)
 *   --duration 4500       ms recorded after navigation starts
 *   --out qa/flicker      frames, evidence strips, report.json + report.md
 *   --realistic-fonts     Linux: start Chromium with a fontconfig that hides a system-wide Inter and
 *                         maps every fallback family to Liberation Sans (Arial metrics) — without it a
 *                         machine that has Inter installed cannot show the real FOUT
 *   --fontconfig <file>   use this FONTCONFIG_FILE instead
 *   --keep-frames         keep every frame (default: only frames referenced by findings)
 *   --python python3      interpreter for the analyzer (needs Pillow + numpy)
 *
 * Exit code 1 when a finding of severity "high" is present (expected regions are "low").
 * Playwright comes from PLAYWRIGHT_MODULE (path to an installation) or a local `playwright` package;
 * Chromium is required (`npx playwright install chromium`).
 */
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ANALYZER = path.join(ROOT, 'scripts', 'lib', 'flicker-analyze.py');

// ------------------------------------------------------------------------------------------------
// CLI
// ------------------------------------------------------------------------------------------------
const argv = process.argv.slice(2);
const flag = (name, def) => {
  const i = argv.indexOf(`--${name}`);
  if (i === -1) return def;
  const v = argv[i + 1];
  return v === undefined || v.startsWith('--') ? true : v;
};
const list = (v) => (typeof v === 'string' ? v.split(',').map((s) => s.trim()).filter(Boolean) : v);
const opts = {
  base: flag('base', ''),
  pages: list(flag('pages', '/,/en/,/de/')),
  scenarios: list(flag('scenarios', 'all')),
  viewports: list(flag('viewports', 'desktop,mobile')),
  cpu: Number(flag('cpu', 4)),
  net: flag('net', 'slow4g'),
  duration: Number(flag('duration', 4500)),
  out: path.resolve(flag('out', 'qa/flicker')),
  realisticFonts: flag('realistic-fonts', false) === true,
  fontconfig: flag('fontconfig', ''),
  keepFrames: flag('keep-frames', false) === true,
  python: flag('python', 'python3'),
};
const want = (s) => opts.scenarios.includes('all') || opts.scenarios.includes(s);

const NETS = {
  slow4g: { latency: 400, downloadThroughput: (1.5 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 },
  fast3g: { latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 },
  none: null,
};
const VIEWPORTS = {
  desktop: { name: 'desktop', viewport: { width: 1440, height: 900 } },
  mobile: { name: 'mobile', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
  // a narrow desktop window (classic scrollbars) — the mobile menu shows below 1024px
  narrow: { name: 'narrow', viewport: { width: 1000, height: 800 } },
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const slug = (s) => s.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'home';

// ------------------------------------------------------------------------------------------------
// server + browser
// ------------------------------------------------------------------------------------------------
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

async function startServer() {
  if (!fs.existsSync(path.join(ROOT, 'dist', 'index.html'))) throw new Error('dist/ is missing — run `npm run build` first');
  const port = await freePort();
  const child = spawn(process.execPath, [path.join(ROOT, 'scripts', 'serve-secure.mjs')], {
    cwd: ROOT,
    env: { ...process.env, PORT: String(port), CONTEXT: 'dev' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let log = '';
  child.stdout.on('data', (d) => (log += d));
  child.stderr.on('data', (d) => (log += d));
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

/** fonts.conf that hides a system-wide Inter and maps every fallback family to Liberation Sans. */
function writeRealisticFontconfig(dir) {
  const dirs = ['/usr/share/fonts/truetype/liberation', '/usr/share/fonts/truetype/dejavu', '/usr/share/fonts/truetype/noto'].filter((d) => fs.existsSync(d));
  if (!dirs.length) {
    console.warn('[qa-flicker] --realistic-fonts: no Liberation/DejaVu font directories found, using the system fontconfig');
    return '';
  }
  const sans = ['sans', 'sans-serif', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Helvetica', 'Arial', 'Inter'];
  const mono = ['monospace', 'ui-monospace', 'SF Mono', 'JetBrains Mono', 'Menlo', 'Consolas'];
  const rule = (fam, to) =>
    `  <match target="pattern"><test qual="any" name="family"><string>${fam}</string></test><edit name="family" mode="prepend" binding="strong"><string>${to}</string></edit></match>\n`;
  const cache = path.join(dir, 'fc-cache');
  fs.mkdirSync(cache, { recursive: true });
  const xml =
    `<?xml version="1.0"?>\n<!DOCTYPE fontconfig SYSTEM "fonts.dtd">\n<fontconfig>\n` +
    dirs.map((d) => `  <dir>${d}</dir>\n`).join('') +
    `  <cachedir>${cache}</cachedir>\n` +
    sans.map((f) => rule(f, 'Liberation Sans')).join('') +
    mono.map((f) => rule(f, 'DejaVu Sans Mono')).join('') +
    `  <alias binding="strong"><family>serif</family><prefer><family>Liberation Serif</family></prefer></alias>\n</fontconfig>\n`;
  const file = path.join(dir, 'fonts.conf');
  fs.writeFileSync(file, xml);
  return file;
}

async function launchBrowser(fontconfig) {
  const spec = process.env.PLAYWRIGHT_MODULE || 'playwright';
  let pw;
  try {
    pw = await import(spec.includes('/') || spec.includes('\\') ? pathToFileURL(path.resolve(spec)).href : spec);
  } catch (err) {
    throw new Error(`Playwright not found (${spec}): ${err instanceof Error ? err.message : err}\nSet PLAYWRIGHT_MODULE or \`npm i -D playwright && npx playwright install chromium\`.`);
  }
  const env = { ...process.env };
  if (fontconfig) env.FONTCONFIG_FILE = fontconfig;
  // headless Chromium hides scrollbars by default; a real desktop browser has a 15px classic scrollbar
  // that disappears when the document is scroll-locked — exactly the shift this tool must catch
  return pw.chromium.launch({ env, ignoreDefaultArgs: ['--hide-scrollbars'] });
}

// ------------------------------------------------------------------------------------------------
// in-page instrumentation (added as an init script; runs before any document script)
// ------------------------------------------------------------------------------------------------
function instrument(cfg) {
  const Q = (window.__qa = {
    timeOrigin: performance.timeOrigin,
    ls: [],
    paints: [],
    fonts: { loading: [], done: [] },
    anim: [],
    focus: [],
    samples: [],
    firstFrame: null,
    selectors: cfg.selectors || [],
    running: false,
  });
  const ids = new WeakMap();
  let nextId = 0;
  const desc = (n) => {
    if (!n || !n.tagName) return String(n);
    let s = n.tagName.toLowerCase();
    if (n.id) s += '#' + n.id;
    const cls = typeof n.className === 'string' ? n.className.trim().split(/\s+/).filter((c) => c && !/^(is-|reveal$)/.test(c)).slice(0, 2) : [];
    if (cls.length) s += '.' + cls.join('.');
    if (n.dataset && n.dataset.i !== undefined) s += `[${n.dataset.i}]`;
    if (!ids.has(n)) ids.set(n, ++nextId);
    return `${s}@${ids.get(n)}`;
  };
  const rect = (r) => [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)];
  try {
    new PerformanceObserver((l) => {
      for (const e of l.getEntries())
        Q.ls.push({ t: e.startTime, value: e.value, input: e.hadRecentInput, sources: (e.sources || []).map((s) => ({ node: desc(s.node), from: rect(s.previousRect), to: rect(s.currentRect) })) });
    }).observe({ type: 'layout-shift', buffered: true });
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) Q.paints.push({ name: e.name, t: e.startTime });
    }).observe({ type: 'paint', buffered: true });
  } catch {
    /* older engine */
  }
  if (document.fonts) {
    document.fonts.addEventListener('loading', () => Q.fonts.loading.push(performance.now()));
    document.fonts.addEventListener('loadingdone', (e) =>
      Q.fonts.done.push({ t: performance.now(), faces: e.fontfaces.map((f) => `${f.family} ${(f.unicodeRange || '').split(',')[0]}`) }),
    );
  }
  document.addEventListener('animationstart', (e) => Q.anim.push({ t: performance.now(), name: e.animationName, el: desc(e.target) }), true);
  document.addEventListener('focusin', (e) => Q.focus.push({ t: performance.now(), el: desc(e.target), fv: e.target.matches(':focus-visible') }), true);
  document.addEventListener('focusout', (e) => Q.focus.push({ t: performance.now(), el: desc(e.target), out: true }), true);

  const r1 = (v) => Math.round(v * 10) / 10;
  const sampleNow = () => {
    const de = document.documentElement;
    const s = { t: performance.now(), sy: Math.round(scrollY), cw: de.clientWidth, iw: innerWidth, r: {} };
    const nav = document.querySelector('[data-nav]');
    if (nav) s.nav = nav.classList.contains('is-scrolled') ? 1 : 0;
    const beam = document.querySelector('[data-beam]');
    if (beam) s.p = parseFloat(getComputedStyle(beam).getPropertyValue('--p')) || 0;
    s.lit = document.querySelectorAll('[data-step].is-lit').length;
    const ae = document.activeElement;
    s.fv = !!(ae && ae !== document.body && ae.matches(':focus-visible'));
    s.active = ae && ae !== document.body ? desc(ae) : '';
    if (cfg.values) {
      // animated numbers: text + whether the reader can see them right now (in view, not transparent)
      const vis = (el) => {
        const b = el.getBoundingClientRect();
        if (b.bottom <= 0 || b.top >= innerHeight || b.width === 0) return 0;
        let o = 1;
        for (let n = el; n && n !== document.body; n = n.parentElement) o *= Number(getComputedStyle(n).opacity);
        return o;
      };
      s.values = [...document.querySelectorAll('[data-count], [data-chat-pct]')].map((el) => ({ el: desc(el), text: el.textContent.trim(), vis: r1(vis(el)) }));
      const line = document.querySelector('.mock__line');
      if (line) s.mockLine = { vis: r1(vis(line)), dash: getComputedStyle(line).strokeDashoffset, drawn: !line.style.strokeDashoffset || parseFloat(line.style.strokeDashoffset) < 1 };
    }
    for (const q of Q.selectors) {
      const el = document.querySelector(q);
      if (!el) continue;
      const r = el.getBoundingClientRect();
      // opacity only for the entrance-order probes: getComputedStyle per element per frame is not free
      s.r[q] = [r1(r.x), r1(r.y), r1(r.width), r1(r.height), /\.(mock|w__in)$/.test(q) ? Number(getComputedStyle(el).opacity) : 1];
    }
    return s;
  };
  const tick = () => {
    if (!Q.running) return;
    const s = sampleNow();
    if (!Q.firstFrame) {
      const inView = (el) => {
        const r = el.getBoundingClientRect();
        return r.bottom > 0 && r.top < innerHeight && r.width > 0 && r.height > 0;
      };
      Q.firstFrame = {
        t: s.t,
        readyState: document.readyState,
        fonts: document.fonts ? [...document.fonts].map((f) => f.status) : [],
        // `.reveal` elements in the viewport that are NOT hidden at the first frame would flash
        revealVisible: [...document.querySelectorAll('.reveal:not(.is-in)')].filter(inView).filter((el) => getComputedStyle(el).opacity !== '0').map(desc),
        revealInView: document.querySelectorAll('.reveal').length ? [...document.querySelectorAll('.reveal')].filter(inView).length : 0,
      };
    }
    Q.samples.push(s);
    if (Q.samples.length < 2000) requestAnimationFrame(tick);
    else Q.running = false;
  };
  Q.sampleNow = sampleNow;
  Q.start = () => {
    if (Q.running) return;
    Q.running = true;
    requestAnimationFrame(tick);
  };
  Q.stop = () => (Q.running = false);
  Q.reset = () => {
    Q.ls = [];
    Q.anim = [];
    Q.focus = [];
    Q.samples = [];
  };
  Q.export = () => ({
    timeOrigin: Q.timeOrigin,
    ls: Q.ls,
    paints: Q.paints,
    fonts: Q.fonts,
    anim: Q.anim,
    focus: Q.focus,
    samples: Q.samples,
    firstFrame: Q.firstFrame,
    selectors: Q.selectors,
    now: performance.now(),
  });
  Q.start();
}

// ------------------------------------------------------------------------------------------------
// screencast recorder
// ------------------------------------------------------------------------------------------------
class Recorder {
  constructor(cdp, dir, viewport) {
    this.cdp = cdp;
    this.dir = dir;
    this.viewport = viewport;
    this.frames = [];
    this.pending = [];
    this.active = false;
    fs.mkdirSync(path.join(dir, 'frames'), { recursive: true });
    cdp.on('Page.screencastFrame', (ev) => {
      if (this.active) {
        const n = this.frames.length;
        const file = `frames/f${String(n).padStart(4, '0')}.png`;
        this.frames.push({ file, t: ev.metadata.timestamp * 1000 });
        this.pending.push(fs.promises.writeFile(path.join(dir, file), Buffer.from(ev.data, 'base64')));
      }
      cdp.send('Page.screencastFrameAck', { sessionId: ev.sessionId }).catch(() => {});
    });
  }
  async start() {
    this.frames = [];
    this.pending = [];
    this.active = true;
    await this.cdp.send('Page.startScreencast', { format: 'png', maxWidth: this.viewport.width, maxHeight: this.viewport.height, everyNthFrame: 1 });
  }
  async stop() {
    await this.cdp.send('Page.stopScreencast').catch(() => {});
    await sleep(80);
    this.active = false;
    await Promise.all(this.pending);
    return this.frames;
  }
}

// ------------------------------------------------------------------------------------------------
// analysis helpers (sampler data → findings)
// ------------------------------------------------------------------------------------------------
function cls(ls) {
  const entries = ls.filter((e) => !e.input).sort((a, b) => a.t - b.t);
  let total = 0;
  let best = 0;
  let win = 0;
  let winStart = -1;
  let prev = -1;
  for (const e of entries) {
    total += e.value;
    if (winStart < 0 || e.t - prev > 1000 || e.t - winStart > 5000) {
      win = 0;
      winStart = e.t;
    }
    win += e.value;
    prev = e.t;
    best = Math.max(best, win);
  }
  return { total: +total.toFixed(4), windowed: +best.toFixed(4), count: entries.length };
}

/** Rect series analysis: one-frame reverts (A→B→A) and abrupt moves of elements that should stay put. */
function rectFindings(qa, { subjects = [], tol = 1.5, t0ms = 0 } = {}) {
  const out = [];
  const samples = qa.samples;
  if (samples.length < 3) return out;
  for (const sel of qa.selectors) {
    const series = samples.map((s) => ({ t: s.t - t0ms, r: s.r[sel], sy: s.sy })).filter((x) => x.r);
    for (let i = 1; i < series.length - 1; i++) {
      const a = series[i - 1].r;
      const b = series[i].r;
      const moved = Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]), Math.abs(b[2] - a[2]), Math.abs(b[3] - a[3]));
      if (moved <= tol) continue;
      // scroll-driven movement is fine: Δy equals −Δscroll
      const dScroll = series[i].sy - series[i - 1].sy;
      if (Math.abs(b[1] - a[1] + dScroll) <= tol && Math.abs(b[0] - a[0]) <= tol && Math.abs(b[2] - a[2]) <= tol) continue;
      // revert within 3 samples → painted at the wrong place for a frame
      for (let k = i + 1; k <= Math.min(series.length - 1, i + 3); k++) {
        const c = series[k].r;
        const back = Math.max(Math.abs(c[0] - a[0]), Math.abs(c[1] - a[1]), Math.abs(c[2] - a[2]), Math.abs(c[3] - a[3])) <= tol;
        const scrollBack = series[k].sy === series[i - 1].sy;
        if (back && scrollBack) {
          out.push({ type: 'jump-revert', severity: 'high', t: Math.round(series[i].t), dt: Math.round(series[k].t - series[i - 1].t), el: sel,
            detail: `${sel} moved ${moved.toFixed(1)}px and came back within ${k - i + 1} frame(s): ${JSON.stringify(a.slice(0, 4))} → ${JSON.stringify(b.slice(0, 4))} → ${JSON.stringify(c.slice(0, 4))}` });
          break;
        }
      }
      if (!subjects.includes(sel) && moved > 8 && Math.abs(dScroll) < 1) {
        out.push({ type: 'jump', severity: 'medium', t: Math.round(series[i].t), dt: Math.round(series[i].t - series[i - 1].t), el: sel,
          detail: `${sel} jumped ${moved.toFixed(1)}px in one frame while it was not the subject of the transition: ${JSON.stringify(a.slice(0, 4))} → ${JSON.stringify(b.slice(0, 4))}` });
      }
    }
  }
  // classic scrollbar appearing/disappearing: html.clientWidth changes while innerWidth does not
  for (let i = 1; i < samples.length; i++) {
    if (samples[i].cw !== samples[i - 1].cw && samples[i].iw === samples[i - 1].iw) {
      const shifted = qa.selectors.filter((sel) => samples[i].r[sel] && samples[i - 1].r[sel] && Math.abs(samples[i].r[sel][0] - samples[i - 1].r[sel][0]) > tol);
      out.push({ type: 'scrollbar-shift', severity: shifted.length ? 'high' : 'low', t: Math.round(samples[i].t - t0ms), dt: 0,
        detail: `scrollbar ${samples[i].cw > samples[i - 1].cw ? 'disappeared' : 'appeared'} (clientWidth ${samples[i - 1].cw} → ${samples[i].cw})` + (shifted.length ? `; shifted horizontally: ${shifted.join(', ')}` : ' — nothing moved (compensated)') });
    }
  }
  // focus ring that shows and goes within ~2 frames
  const fv = samples.map((s) => s.fv);
  for (let i = 1; i < fv.length - 1; i++) {
    if (fv[i] && !fv[i - 1] && !fv[i + 1]) out.push({ type: 'focus-flash', severity: 'medium', t: Math.round(samples[i].t - t0ms), dt: Math.round(samples[i + 1].t - samples[i].t), detail: `:focus-visible on ${samples[i].active} for one frame` });
  }
  // double entrances
  const counts = new Map();
  for (const a of qa.anim) if (/^(reveal-in|reveal-fade|hero-in|hero-fade)$/.test(a.name)) counts.set(a.el, (counts.get(a.el) || 0) + 1);
  for (const [el, n] of counts) if (n > 1) out.push({ type: 'double-entrance', severity: 'high', t: 0, dt: 0, el, detail: `${el}: entrance animation started ${n} times` });
  return out;
}

const r = (v) => Math.round(v);

// ------------------------------------------------------------------------------------------------
// analyzer bridge
// ------------------------------------------------------------------------------------------------
function analyzeFrames(dir) {
  const res = spawnSync(opts.python, ['-I', ANALYZER, dir], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (res.status !== 0) {
    console.error(res.stderr || res.stdout);
    throw new Error(`frame analyzer failed in ${dir}`);
  }
  return JSON.parse(res.stdout);
}

function finish(capture, dir, { frames, meta, findings, extra = {} }) {
  fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify(meta, null, 1));
  let analysis = { stats: { frames: frames.length }, findings: [] };
  if (frames.length >= 2) analysis = analyzeFrames(dir);
  const all = [...analysis.findings, ...findings];
  for (const f of all) {
    f.capture = capture;
    if (f.evidence) f.evidence = f.evidence.startsWith(ROOT + path.sep) ? path.relative(ROOT, f.evidence) : f.evidence;
  }
  if (!opts.keepFrames) {
    const keep = new Set([0, frames.length - 1]);
    for (const f of analysis.findings) for (const i of f.frames || []) keep.add(i);
    frames.forEach((f, i) => {
      if (!keep.has(i)) fs.rmSync(path.join(dir, f.file), { force: true });
    });
  }
  const sev = all.reduce((m, f) => Math.max(m, { low: 1, medium: 2, high: 3 }[f.severity] || 0), 0);
  const line = `${all.length ? (sev === 3 ? '✗' : sev === 2 ? '!' : '·') : '✓'} ${capture}: ${frames.length} frames${analysis.stats.fps ? ` @ ${analysis.stats.fps} fps` : ''}, ${all.length} finding(s)`;
  console.log(line);
  for (const f of all) console.log(`   [${f.severity}] ${f.type} @ ${f.t} ms — ${f.detail}${f.evidence ? ` (${f.evidence})` : ''}`);
  return { capture, dir: dir.startsWith(ROOT + path.sep) ? path.relative(ROOT, dir) : dir, stats: analysis.stats, findings: all, ...extra };
}

const toRel = (qa, tWall0) => (tPerf) => qa.timeOrigin + tPerf - tWall0;

// ------------------------------------------------------------------------------------------------
// scenarios
// ------------------------------------------------------------------------------------------------
const LOAD_SELECTORS = ['.nav__logo', '.nav__links', '.nav__right', '.cmdk', '.hero__title', '.hero__title .w__in', '.hero__lead', '.hero__cta', '.mock', 'h1'];

async function throttle(cdp, { cpu, net }) {
  if (cpu > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpu });
  if (NETS[net]) {
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', { offline: false, ...NETS[net] });
  }
}

async function scenarioLoad(browser, base, pagePath, vpKey, { reduced = false, nojs = false } = {}) {
  const vp = VIEWPORTS[vpKey];
  const capture = `load${reduced ? '-reduced' : ''}${nojs ? '-nojs' : ''}-${slug(pagePath)}-${vp.name}`;
  const dir = path.join(opts.out, capture);
  fs.rmSync(dir, { recursive: true, force: true });
  const context = await browser.newContext({ ...vp, reducedMotion: reduced ? 'reduce' : 'no-preference', javaScriptEnabled: !nojs });
  try {
    const page = await context.newPage();
    if (!nojs) await page.addInitScript(instrument, { selectors: LOAD_SELECTORS });
    const cdp = await context.newCDPSession(page);
    await throttle(cdp, opts);
    const cdpShifts = [];
    if (nojs) {
      await cdp.send('PerformanceTimeline.enable', { eventTypes: ['layout-shift'] }).catch(() => {});
      cdp.on('PerformanceTimeline.timelineEventAdded', (ev) => {
        const d = ev.event.layoutShiftDetails;
        if (d) cdpShifts.push({ t: ev.event.time * 1000, value: d.value, input: d.hadRecentInput, sources: (d.sources || []).map((s) => ({ node: String(s.nodeId), from: [s.previousRect.x, s.previousRect.y, s.previousRect.width, s.previousRect.height].map(r), to: [s.currentRect.x, s.currentRect.y, s.currentRect.width, s.currentRect.height].map(r) })) });
      });
    }
    const rec = new Recorder(cdp, dir, vp.viewport);
    await rec.start();
    const t0 = Date.now();
    await page.goto(base + pagePath, { waitUntil: 'commit' });
    const commitAt = Date.now() - t0;
    await sleep(opts.duration);
    const frames = await rec.stop();
    const findings = [];
    let meta = { capture, viewport: vp.viewport, t0, commitAt, frames, window: 1500, expect: [], scroll: [] };
    const extra = {};
    if (!nojs) {
      const qa = await page.evaluate(() => {
        window.__qa.stop();
        return window.__qa.export();
      });
      fs.writeFileSync(path.join(dir, 'qa.json'), JSON.stringify(qa));
      const navT = await page.evaluate(() => {
        const e = performance.getEntriesByType('navigation')[0];
        return e ? { ttfb: Math.round(e.responseStart), domInteractive: Math.round(e.domInteractive), dcl: Math.round(e.domContentLoadedEventEnd), load: Math.round(e.loadEventEnd) } : null;
      });
      const resources = await page.evaluate(() =>
        performance.getEntriesByType('resource').map((x) => ({ name: x.name.split('/').pop().replace(/\.[A-Za-z0-9_-]{8}\.(css|js|woff2)$/, '.$1'), start: Math.round(x.startTime), end: Math.round(x.responseEnd), size: x.transferSize })),
      );
      const rel = toRel(qa, t0);
      const paints = Object.fromEntries(qa.paints.map((p) => [p.name, Math.round(rel(p.t))]));
      // every font file swaps its own subset as soon as it arrives (`loadingdone` fires once, after the last one)
      const fontsDone = resources
        .filter((x) => /\.woff2$/.test(x.name))
        .map((x) => ({ t: Math.round(rel(x.end)), faces: [x.name.replace(/-wght.*$/, '')] }))
        .sort((a, b) => a.t - b.t);
      const fontsLoading = qa.fonts.loading.map((t) => Math.round(rel(t)));
      meta.fonts = { done: fontsDone, loading: fontsLoading, loadingdone: qa.fonts.done.map((d) => Math.round(rel(d.t))) };
      meta.layoutShifts = qa.ls.map((e) => ({ ...e, t: Math.round(rel(e.t)) }));
      meta.scroll = qa.samples.map((x) => [Math.round(rel(x.t)), x.sy]);
      const shifts = cls(qa.ls);
      // text that changes width when the web font arrives (FOUT with layout shift)
      const fout = [];
      for (const d of fontsDone) {
        for (const sel of ['h1', '.nav__links', '.nav__right', '.hero__lead']) {
          const before = [...qa.samples].reverse().find((s) => rel(s.t) < d.t && s.r[sel]);
          const after = qa.samples.find((s) => rel(s.t) > d.t + 350 && s.r[sel]);
          if (before && after) {
            const dw = after.r[sel][2] - before.r[sel][2];
            const dx = after.r[sel][0] - before.r[sel][0];
            const dh = after.r[sel][3] - before.r[sel][3];
            if (Math.abs(dw) > 1 || Math.abs(dx) > 1 || Math.abs(dh) > 1) fout.push({ t: d.t, face: d.faces[0], sel, dw: +dw.toFixed(1), dx: +dx.toFixed(1), dh: +dh.toFixed(1) });
          }
        }
      }
      const fcp = paints['first-contentful-paint'];
      const firstSwap = fontsDone[0]?.t;
      extra.timeline = { ...navT, ...paints, fontsLoading, fontsDone: fontsDone.map((d) => d.t), swapAfterFirstPaint: firstSwap && fcp ? firstSwap - fcp : null, resources };
      extra.cls = shifts;
      extra.firstFrame = qa.firstFrame;
      extra.fout = fout;
      if (qa.firstFrame?.revealVisible?.length) findings.push({ type: 'reveal-visible-at-first-paint', severity: 'high', t: Math.round(rel(qa.firstFrame.t)), dt: 0, detail: `.reveal elements in view were visible before their entrance: ${qa.firstFrame.revealVisible.join(', ')}` });
      if (fout.length) findings.push({ type: 'fout-shift', severity: 'high', t: fout[0].t, dt: 0, detail: `text re-flowed when Inter arrived (${firstSwap - fcp} ms after first paint): ` + fout.map((f) => `${f.sel} Δw ${f.dw}px Δx ${f.dx}px Δh ${f.dh}px (${f.face} @ ${f.t} ms)`).join('; ') });
      else if (firstSwap && fcp && firstSwap - fcp > 120) findings.push({ type: 'fout', severity: 'medium', t: firstSwap, dt: 0, detail: `Inter arrived ${firstSwap - fcp} ms after first paint — text was painted in the fallback font first (no reflow measured)` });
      // entrance order: the console mock must not appear before the hero copy
      const firstVisible = (sel) => qa.samples.find((s) => s.r[sel] && s.r[sel][4] > 0.05);
      const mockAt = firstVisible('.mock');
      const heroAt = firstVisible('.hero__title .w__in');
      if (mockAt && heroAt && mockAt.t < heroAt.t - 150) findings.push({ type: 'order', severity: 'medium', t: Math.round(rel(mockAt.t)), dt: Math.round(heroAt.t - mockAt.t), detail: `the console mock fades in ${Math.round(heroAt.t - mockAt.t)} ms before the hero headline (hero waits for fonts, the mock's reveal does not)` });
      if (shifts.windowed >= 0.05) findings.push({ type: 'cls', severity: 'high', t: 0, dt: 0, detail: `CLS ${shifts.windowed} (sum ${shifts.total}, ${shifts.count} shifts)` });
      findings.push(...rectFindings({ ...qa, samples: qa.samples.map((s) => ({ ...s, t: rel(s.t) })) }, { subjects: LOAD_SELECTORS, t0ms: 0 }).filter((f) => f.type !== 'jump'));
    } else {
      meta.layoutShifts = cdpShifts.map((e) => ({ ...e, t: Math.round(e.t - t0) }));
      extra.cls = cls(cdpShifts);
      // content must be visible without JS: nothing may stay hidden behind the JS-only gating
      const hidden = await page.evaluate(() => {
        const vis = (el) => {
          const cs = getComputedStyle(el);
          return cs.opacity !== '0' && cs.visibility !== 'hidden' && cs.display !== 'none';
        };
        const bad = [];
        for (const sel of ['.hero__title .w__in', '.hero__lead', '.hero__cta', '.reveal', '.faq__panel', '.chat__msg--ai', '.mock__kpi'])
          for (const el of document.querySelectorAll(sel)) if (!vis(el)) { bad.push(sel); break; }
        return bad;
      });
      if (hidden.length) findings.push({ type: 'nojs-hidden', severity: 'high', t: 0, dt: 0, detail: `without JavaScript these stay invisible: ${[...new Set(hidden)].join(', ')}` });
    }
    return finish(capture, dir, { frames, meta, findings, extra });
  } finally {
    await context.close();
  }
}

/** Scrolls an element into view instantly and lets the reveal entrances finish. */
async function settleAt(page, selector, ms = 1400) {
  await page.evaluate((sel) => {
    document.documentElement.style.scrollBehavior = 'auto';
    const el = document.querySelector(sel);
    if (el) el.scrollIntoView({ block: 'start' });
  }, selector);
  await sleep(ms);
}

const TRANSITIONS = [
  {
    id: 'mobile-menu', vp: 'mobile', path: '/',
    selectors: ['.nav__logo', '.nav__right', '[data-burger]', '.mobile__links a', '.mobile__foot .btn', '.hero__badge'],
    subjects: ['.mobile__links a', '.mobile__foot .btn'],
    steps: [{ label: 'open', ms: 900, act: (p) => p.click('[data-burger]') }, { label: 'close', ms: 900, act: (p) => p.click('[data-burger]') }],
  },
  {
    id: 'mobile-menu-narrow-window', vp: 'narrow', path: '/',
    selectors: ['.nav__logo', '.nav__right', '[data-burger]', '.mobile__links a', '.hero__badge'],
    subjects: ['.mobile__links a'],
    steps: [{ label: 'open', ms: 900, act: (p) => p.click('[data-burger]') }, { label: 'close', ms: 900, act: (p) => p.click('[data-burger]') }],
  },
  {
    id: 'lang-popover', vp: 'desktop', path: '/',
    selectors: ['.lang__btn', '.lang__menu', '.lang__menu a', '.nav__right', '.nav__logo'],
    subjects: ['.lang__menu', '.lang__menu a'],
    steps: [{ label: 'open', ms: 700, act: (p) => p.click('.lang__btn') }, { label: 'close', ms: 700, act: (p) => p.keyboard.press('Escape') }],
  },
  {
    id: 'command-bar', vp: 'desktop', path: '/',
    selectors: ['.cmd__dialog', '.cmd__input', '.nav__logo', '.nav__right', '.hero__title', '.hero__badge'],
    subjects: ['.cmd__dialog', '.cmd__input'],
    steps: [{ label: 'open', ms: 900, act: (p) => p.keyboard.press('Control+KeyK') }, { label: 'close', ms: 700, act: (p) => p.keyboard.press('Escape') }],
  },
  {
    id: 'command-bar-mobile', vp: 'mobile', path: '/',
    selectors: ['.cmd__dialog', '.nav__logo', '.nav__right', '.hero__title'],
    subjects: ['.cmd__dialog'],
    steps: [{ label: 'open', ms: 900, act: (p) => p.click('[data-cmd-open]') }, { label: 'close', ms: 700, act: (p) => p.click('[data-cmd-close]') }],
  },
  {
    id: 'case-filters', vp: 'desktop', path: '/', pre: '#cases',
    selectors: ['.filters__active', '.filters', '.case:nth-child(1)', '.case:nth-child(2)', '.case:nth-child(5)', '.cases__grid', '#pricing .section-head'],
    subjects: ['.filters__active', '.case:nth-child(1)', '.case:nth-child(2)', '.case:nth-child(5)', '.cases__grid', '#pricing .section-head'],
    expect: [{ sel: '.cases__grid', why: 'grid reflows when cards are hidden/shown (filter by design)' }, { sel: '#pricing .section-head', why: 'content below the grid moves with it' }],
    steps: [{ label: 'ads', ms: 900, act: (p) => p.click('[data-filter="ads"]') }, { label: 'all', ms: 900, act: (p) => p.click('[data-filter="all"]') }],
  },
  {
    id: 'faq', vp: 'desktop', path: '/', pre: '#faq',
    selectors: ['.faq__item:nth-child(1) .faq__panel', '.faq__item:nth-child(2) .faq__panel', '.faq__item:nth-child(3) .faq__q', '.faq__item:nth-child(1) .faq__icon'],
    subjects: ['.faq__item:nth-child(1) .faq__panel', '.faq__item:nth-child(2) .faq__panel', '.faq__item:nth-child(3) .faq__q', '.faq__item:nth-child(1) .faq__icon'],
    steps: [{ label: 'open-1', ms: 700, act: (p) => p.click('.faq__item:nth-child(1) .faq__q') }, { label: 'open-2', ms: 700, act: (p) => p.click('.faq__item:nth-child(2) .faq__q') }],
  },
  {
    id: 'form-validation', vp: 'desktop', path: '/', pre: '#contact',
    selectors: ['[data-submit]', '#f-name', '#f-contact', '.consent', '.contact__card', '.form__note'],
    subjects: ['[data-submit]', '#f-contact', '.consent', '.contact__card', '.form__note'],
    steps: [{ label: 'submit-empty', ms: 900, act: (p) => p.click('[data-submit]') }],
  },
  {
    id: 'handoff', vp: 'desktop', path: '/', pre: '#pricing',
    selectors: ['[data-pick]', '.tier__cta[data-service="app"]', '.contact__card', '#f-name'],
    subjects: ['[data-pick]', '.tier__cta[data-service="app"]', '.contact__card', '#f-name'],
    expect: [{ sel: '[data-pick]', why: 'handoff accent: the lime outline holds and fades by design' }],
    steps: [{ label: 'pricing-cta', ms: 2800, act: (p) => p.click('.tier__cta[data-service="app"]') }],
  },
  {
    id: 'geo-chat', vp: 'desktop', path: '/', pre: '#geo', window: 2200,
    selectors: ['.chat', '[data-chat-pct]', '.chat__meter-bar', '.geo__models', '#trust .section-head', '.geo__more'],
    subjects: ['.chat', '[data-chat-pct]', '.chat__meter-bar', '.geo__models'],
    steps: [{ label: 'choreography', ms: 7000, act: async () => {} }],
  },
  {
    id: 'lang-switch', vp: 'desktop', path: '/#pricing', navigates: true,
    selectors: ['#pricing', '.nav__logo', '.tier'],
    subjects: ['#pricing', '.tier'],
    steps: [{ label: 'ru-to-en', ms: 3200, act: async (p) => { await p.click('.lang__btn'); await p.click('.lang__menu a[hreflang="en"]'); } }],
  },
];

async function scenarioTransitions(browser, base) {
  const results = [];
  for (const T of TRANSITIONS) {
    if (!opts.viewports.includes(T.vp) && T.vp !== 'narrow') continue;
    const vp = VIEWPORTS[T.vp];
    const context = await browser.newContext({ ...vp });
    try {
      const page = await context.newPage();
      await page.addInitScript(instrument, { selectors: T.selectors });
      const cdp = await context.newCDPSession(page);
      await page.goto(base + T.path, { waitUntil: 'networkidle' });
      await sleep(600);
      if (T.pre) await settleAt(page, T.pre, T.id === 'geo-chat' ? 200 : 1400);
      for (const step of T.steps) {
        const capture = `transition-${T.id}-${step.label}`;
        const dir = path.join(opts.out, capture);
        fs.rmSync(dir, { recursive: true, force: true });
        const expect = [];
        for (const e of T.expect || []) {
          const rect = await page.$eval(e.sel, (el) => { const r = el.getBoundingClientRect(); return [r.x - 24, r.y - 24, r.width + 48, r.height + 48].map(Math.round); }).catch(() => null);
          if (rect) expect.push({ region: rect, why: e.why });
        }
        await page.evaluate(() => { window.__qa.reset(); window.__qa.start(); });
        const rec = new Recorder(cdp, dir, vp.viewport);
        await rec.start();
        const t0 = Date.now();
        await step.act(page);
        await sleep(step.ms);
        const frames = await rec.stop();
        const qa = await page.evaluate(() => { window.__qa.stop(); return window.__qa.export(); });
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, 'qa.json'), JSON.stringify(qa));
        const rel = toRel(qa, t0);
        const samples = qa.samples.map((s) => ({ ...s, t: rel(s.t) }));
        const findings = rectFindings({ ...qa, samples }, { subjects: T.subjects || [] });
        const extra = { cls: cls(qa.ls) };
        if (T.navigates) {
          // the new document starts its own sampler: a scrollY series that starts at 0 and climbs
          // over several frames means the browser animated the fragment scroll on load
          const sy = samples.map((s) => s.sy);
          const climbing = sy.filter((v, i) => i && v > sy[i - 1]).length;
          const settled = sy[sy.length - 1];
          extra.scrollOnLoad = { first: sy[0], settled, climbingFrames: climbing };
          if (sy.length > 3 && sy[0] < settled * 0.5 && climbing >= 3) findings.push({ type: 'scroll-on-load', severity: 'high', t: Math.round(samples[0].t), dt: Math.round(samples[climbing].t - samples[0].t), detail: `the new page loaded at the top and then scrolled smoothly to #pricing over ${climbing} frames (scrollY ${sy[0]} → ${settled}) — ${qa.anim.filter((a) => a.name === 'reveal-in').length} reveal entrances fired on the way` });
          extra.entrancesOnLoad = qa.anim.filter((a) => a.name === 'reveal-in').length;
        }
        meta_(dir, { capture, viewport: vp.viewport, t0, frames, window: T.window || 1200, expect, layoutShifts: qa.ls.map((e) => ({ ...e, t: Math.round(rel(e.t)) })), scroll: samples.map((x) => [Math.round(x.t), x.sy]) });
        results.push(finish(capture, dir, { frames, meta: readMeta(dir), findings, extra }));
      }
    } finally {
      await context.close();
    }
  }
  return results;
}
const meta_ = (dir, meta) => {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify(meta, null, 1));
};
const readMeta = (dir) => JSON.parse(fs.readFileSync(path.join(dir, 'meta.json'), 'utf8'));

async function scenarioScroll(browser, base, pagePath, vpKey) {
  const vp = VIEWPORTS[vpKey];
  const capture = `scroll-${slug(pagePath)}-${vp.name}`;
  const selectors = ['.geo__visual', '.contact__text', '[data-nav]', '.process__beam'];
  const context = await browser.newContext({ ...vp });
  try {
    const page = await context.newPage();
    await page.addInitScript(instrument, { selectors, values: true });
    await page.goto(base + pagePath, { waitUntil: 'networkidle' });
    await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; window.__qa.stop(); window.__qa.reset(); });
    const twoFrames = () => page.evaluate(() => new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(() => res(window.__qa.sampleNow())))));
    const run = async (ys, dwell = 0) => {
      const out = [];
      for (const y of ys) {
        await page.evaluate((v) => scrollTo(0, v), y);
        if (dwell) await sleep(dwell);
        out.push({ y, ...(await twoFrames()) });
      }
      return out;
    };
    const maxY = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
    const coarse = await run(Array.from({ length: Math.floor(maxY / 200) + 1 }, (_, i) => i * 200));
    await page.evaluate(() => scrollTo(0, 0));
    await sleep(7000); // the GEO chat choreography started during the pass must finish before the next one
    // a slow reader: 20px every ~100 ms — reveals and in-view triggers have time to fire between steps
    const fine = await run(Array.from({ length: Math.min(220, Math.floor(maxY / 20) + 1) }, (_, i) => i * 20), 90);
    const jitter = await run([0, 7, 9, 7, 9, 8, 10, 7, 12, 4, 9, 0]);
    await page.evaluate(() => scrollTo(0, 0));
    const anim = await page.evaluate(() => window.__qa.anim);
    const findings = [];
    // nav border: must be a function of scrollY with no toggling on ±1–2px wobble
    const toggles = (s) => s.reduce((n, x, i) => n + (i && x.nav !== s[i - 1].nav ? 1 : 0), 0);
    const navJitter = toggles(jitter);
    if (navJitter >= 3) findings.push({ type: 'nav-jitter', severity: 'medium', t: 0, dt: 0, detail: `nav .is-scrolled toggled ${navJitter} times for scroll positions ${jitter.map((j) => j.y).join('→')}px (threshold without hysteresis: a 2px wobble around 8px flickers the border)` });
    // beam and lit steps must never go backwards while scrolling down
    const nonMono = (s, key) => s.filter((x, i) => i && x[key] < s[i - 1][key] - 1e-6).map((x) => x.y);
    for (const [label, s] of [['200px', coarse], ['20px', fine]]) {
      const b = nonMono(s, 'p');
      if (b.length) findings.push({ type: 'beam-backwards', severity: 'high', t: 0, dt: 0, detail: `process beam --p decreased while scrolling down in ${label} steps at y=${b.slice(0, 5).join(',')}` });
      const l = nonMono(s, 'lit');
      if (l.length) findings.push({ type: 'pin-unlit', severity: 'high', t: 0, dt: 0, detail: `process pins switched off while scrolling down in ${label} steps at y=${l.slice(0, 5).join(',')}` });
      // sticky elements: between steps the top moves with the content (−Δy) or stays (stuck); anything else is a jump
      for (const sel of ['.geo__visual', '.contact__text']) {
        for (let i = 1; i < s.length; i++) {
          const a = s[i - 1].r[sel];
          const c = s[i].r[sel];
          if (!a || !c) continue;
          const dy = c[1] - a[1];
          const dScroll = s[i].y - s[i - 1].y;
          const stuck = Math.abs(dy) <= 2;
          const moving = Math.abs(dy + dScroll) <= 2;
          const partial = dy < 0 && dy > -dScroll; // the exact step where it becomes stuck/unstuck
          if (!stuck && !moving && !partial) findings.push({ type: 'sticky-jump', severity: 'high', t: 0, dt: 0, detail: `${sel} top moved ${dy.toFixed(1)}px for a ${dScroll}px scroll step (${label}) at y=${s[i].y}` });
        }
      }
    }
    const counts = new Map();
    for (const a of anim) if (a.name === 'reveal-in') counts.set(a.el, (counts.get(a.el) || 0) + 1);
    for (const [el, n] of counts) if (n > 1) findings.push({ type: 'double-entrance', severity: 'high', t: 0, dt: 0, detail: `${el}: reveal entrance started ${n} times while scrolling` });
    // a number the reader could already see must not be reset and counted up again
    const seen = new Map();
    for (const step of fine) {
      for (const v of step.values || []) {
        const num = parseFloat(v.text.replace(',', '.').replace(/[^\d.]/g, ''));
        const prev = seen.get(v.el);
        if (prev && prev.vis > 0.05 && v.vis > 0.05 && !Number.isNaN(num) && num < prev.num - 1e-9 && prev.num > 0) findings.push({ type: 'value-reset', severity: 'high', t: 0, dt: 0, detail: `${v.el}: "${prev.text}" was visible (opacity ${prev.vis}) at y=${prev.y}, then reset to "${v.text}" at y=${step.y} and counts up again` });
        if (!Number.isNaN(num)) seen.set(v.el, { num, text: v.text, vis: v.vis, y: step.y });
      }
      if (step.mockLine && step.mockLine.vis > 0.05 && step.mockLine.drawn) seen.set('__line', step);
      if (step.mockLine && seen.get('__line') && !step.mockLine.drawn && step.mockLine.vis > 0.05 && !seen.get('__lineFlagged')) {
        seen.set('__lineFlagged', true);
        findings.push({ type: 'line-redraw', severity: 'high', t: 0, dt: 0, detail: `.mock__line was visible fully drawn at y=${seen.get('__line').y} (opacity ${seen.get('__line').mockLine.vis}), then hidden and redrawn at y=${step.y}` });
      }
    }
    const stats = { maxY, steps200: coarse.length, steps20: fine.length, navToggles20: toggles(fine), navToggles200: toggles(coarse), navJitterToggles: navJitter, beamRange: [coarse[0]?.p, coarse[coarse.length - 1]?.p], entrances: anim.filter((a) => a.name === 'reveal-in').length };
    const line = `${findings.some((f) => f.severity === 'high') ? '✗' : findings.length ? '!' : '✓'} ${capture}: ${findings.length} finding(s) — ${JSON.stringify(stats)}`;
    console.log(line);
    for (const f of findings) console.log(`   [${f.severity}] ${f.type} — ${f.detail}`);
    return { capture, stats, findings: findings.map((f) => ({ ...f, capture })) };
  } finally {
    await context.close();
  }
}

// ------------------------------------------------------------------------------------------------
// main
// ------------------------------------------------------------------------------------------------
async function main() {
  fs.mkdirSync(opts.out, { recursive: true });
  let fontconfig = opts.fontconfig;
  if (!fontconfig && opts.realisticFonts && os.platform() === 'linux') fontconfig = writeRealisticFontconfig(opts.out);
  if (!fontconfig && os.platform() === 'linux' && fs.existsSync('/usr/share/fonts/opentype/inter')) console.warn('[qa-flicker] a system-wide Inter is installed: the fallback font is Inter itself, so FOUT cannot be seen. Use --realistic-fonts.');
  const server = opts.base ? null : await startServer();
  const base = (opts.base || server.base).replace(/\/$/, '');
  const browser = await launchBrowser(fontconfig);
  const results = [];
  const started = Date.now();
  try {
    console.log(`[qa-flicker] ${base} → ${opts.out}  (cpu ×${opts.cpu}, net ${opts.net}, ${opts.duration} ms per load)`);
    if (want('load')) for (const p of opts.pages) for (const v of opts.viewports) results.push(await scenarioLoad(browser, base, p, v));
    if (want('reduced')) for (const p of opts.pages.slice(0, 1)) for (const v of opts.viewports) results.push(await scenarioLoad(browser, base, p, v, { reduced: true }));
    if (want('nojs')) for (const p of opts.pages.slice(0, 1)) for (const v of opts.viewports) results.push(await scenarioLoad(browser, base, p, v, { nojs: true }));
    if (want('transitions')) results.push(...(await scenarioTransitions(browser, base)));
    if (want('scroll')) for (const p of opts.pages) for (const v of opts.viewports) results.push(await scenarioScroll(browser, base, p, v));
  } finally {
    await browser.close();
    await server?.stop();
  }
  const findings = results.flatMap((x) => x.findings);
  const high = findings.filter((f) => f.severity === 'high');
  const report = { generatedAt: new Date().toISOString(), options: { ...opts, out: path.relative(ROOT, opts.out) }, durationMs: Date.now() - started, results, summary: { captures: results.length, findings: findings.length, high: high.length, medium: findings.filter((f) => f.severity === 'medium').length, low: findings.filter((f) => f.severity === 'low').length } };
  fs.writeFileSync(path.join(opts.out, 'report.json'), JSON.stringify(report, null, 1));
  const md = ['# Flicker report', '', `${report.summary.captures} captures, ${findings.length} findings (${high.length} high, ${report.summary.medium} medium, ${report.summary.low} low). Generated ${report.generatedAt}.`, ''];
  md.push('| capture | type | severity | t (ms) | detail | evidence |', '|---|---|---|---|---|---|');
  for (const f of findings) md.push(`| ${f.capture} | ${f.type} | ${f.severity} | ${f.t} | ${String(f.detail).replace(/\|/g, '\\|')} | ${f.evidence ?? ''} |`);
  md.push('', '## Load timelines', '', '| capture | FCP | fonts loading | fonts done | swap after FCP | CLS (windowed / sum) | entrance order |', '|---|---|---|---|---|---|---|');
  for (const x of results) if (x.timeline) md.push(`| ${x.capture} | ${x.timeline['first-contentful-paint'] ?? ''} | ${x.timeline.fontsLoading.join(' ')} | ${x.timeline.fontsDone.join(' ')} | ${x.timeline.swapAfterFirstPaint ?? ''} | ${x.cls.windowed} / ${x.cls.total} | ${x.findings.some((f) => f.type === 'order') ? 'mock before hero' : 'ok'} |`);
  fs.writeFileSync(path.join(opts.out, 'report.md'), md.join('\n') + '\n');
  console.log(`\n[qa-flicker] ${findings.length} finding(s): ${high.length} high, ${report.summary.medium} medium, ${report.summary.low} low → ${path.join(opts.out, 'report.md')}`);
  process.exit(high.length ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
