import { $, $$, clamp, finePointer, reduceMotion } from './util';

/**
 * The hero grid, awake (Hero.astro `[data-field]`): a canvas of dots on a 28px grid (32px on touch
 * devices) behind the headline. Each dot is a small spring (ω₀ ≈ 11 rad/s, ζ = 0.8 — bounce 0.2, at
 * rest again ~0.5s after a disturbance passes) pulled toward a target that the cursor and the waves
 * set:
 *   - a fine pointer pushes dots within 160px away by up to 18px and lights them lime;
 *   - a wave is a front expanding at 900px/s with a 70px half-width, moving dots outward (16px at the
 *     origin for strength 1, falling with distance) and lighting them as it passes; it fades over
 *     its time constant. The load wave starts at the headline's accent line 520ms after `.is-ready`
 *     (the last words of the reveal are landing), a pointerdown anywhere in the hero sends one from
 *     that point, and a faint ambient one starts from a random point every 8–10.5s so a phone sees
 *     the field breathe without a cursor.
 * The loop runs only while something moves: with no cursor, no wave and every dot at rest it draws
 * one last frame and stops; it also stops while the hero is off screen or the tab is hidden. DPR is
 * capped (2 / 1.5 on touch, and so that the bitmap stays under ~4.5MP). Reduced motion: the dots are
 * drawn once and nothing moves. Without JS the CSS line grid stays (`.hero.is-field` hides it).
 * `data-field-state` on the canvas (static | idle | live) is for the e2e tests.
 */
const SPACING_FINE = 28;
const SPACING_COARSE = 32;
const K = 120; // spring stiffness (1/s²) — ω₀ = √K ≈ 11 rad/s
const C = 17.5; // damping (1/s) — ζ = C / (2√K) = 0.8
const CURSOR_R = 160;
const CURSOR_PUSH = 18;
const WAVE_SPEED = 900; // px/s
const WAVE_BAND = 85; // px, half-width of the front
const WAVE_AMP = 22; // px at the origin for strength 1
const WAVE_REACH = 520; // px — amplitude halves this far from the origin
const WAVES = {
  load: { strength: 1.2, tau: 1.3 },
  tap: { strength: 0.8, tau: 0.9 },
  ambient: { strength: 0.3, tau: 1.0 },
} as const;
const LOAD_DELAY = 520; // ms after .is-ready
const AMBIENT_MIN = 8000;
const AMBIENT_JITTER = 2500;
const AMBIENT_FIRST = 9000;
const LEVELS = 16; // brightness buckets (one fillStyle each)
const LINK_FROM = 2; // brightness level from which a dot links to its lit neighbours
const REST = 0.3; // px / px·s⁻¹ under which a dot counts as at its target

interface Wave {
  x: number;
  y: number;
  t0: number;
  strength: number;
  tau: number;
  reach: number; // px — past this radius the front has left the field
}

export function initField(): void {
  const hero = $('[data-hero]');
  const canvas = hero ? $<HTMLCanvasElement>('[data-field]', hero) : null;
  const ctx = canvas?.getContext('2d');
  if (!hero || !canvas || !ctx) return;
  hero.classList.add('is-field');

  const fine = finePointer();
  const still = reduceMotion();
  const spacing = fine ? SPACING_FINE : SPACING_COARSE;

  // white → lime with brightness; alpha .12 → .9; dot 2px → 4.5px
  const styles = Array.from({ length: LEVELS }, (_, l) => {
    const b = l / (LEVELS - 1);
    return `rgba(${Math.round(255 - 57 * b)},255,${Math.round(255 - 181 * b)},${(0.12 + 0.78 * b).toFixed(3)})`;
  });
  // the grid lines between two lit neighbours: lime, alpha rising steeply so only the front and the
  // cursor's lens show a lattice, never the whole field
  const links = Array.from({ length: LEVELS }, (_, l) => `rgba(198,255,74,${(0.55 * Math.pow(l / (LEVELS - 1), 1.5)).toFixed(3)})`);

  let w = 0;
  let h = 0;
  let dpr = 1;
  let n = 0;
  let cols = 0;
  let rx = new Float32Array(0);
  let ry = new Float32Array(0);
  let ox = new Float32Array(0);
  let oy = new Float32Array(0);
  let vx = new Float32Array(0);
  let vy = new Float32Array(0);
  let lvl = new Uint8Array(0);
  const waves: Wave[] = [];
  const cursor = { x: 0, y: 0, on: false };
  let running = false;
  let raf = 0;
  let last = 0;
  let onScreen = true;
  let ambientTimer = 0;

  const setState = (s: 'static' | 'idle' | 'live') => {
    canvas.dataset.fieldState = s;
  };

  const sx = (i: number) => ((rx[i] ?? 0) + (ox[i] ?? 0)) * dpr; // screen x of dot i
  const sy = (i: number) => ((ry[i] ?? 0) + (oy[i] ?? 0)) * dpr;
  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // lattice: a segment to the right and the lower neighbour when both are lit, batched by level
    ctx.lineWidth = dpr;
    for (let l = LINK_FROM; l < LEVELS; l++) {
      let open = false;
      for (let i = 0; i < n; i++) {
        const a = lvl[i] ?? 0;
        if (a < LINK_FROM) continue;
        const right = (i + 1) % cols === 0 ? -1 : i + 1;
        const down = i + cols < n ? i + cols : -1;
        for (const j of [right, down]) {
          if (j < 0) continue;
          const m = Math.min(a, lvl[j] ?? 0);
          if (m !== l) continue;
          if (!open) {
            ctx.beginPath();
            open = true;
          }
          ctx.moveTo(sx(i), sy(i));
          ctx.lineTo(sx(j), sy(j));
        }
      }
      if (open) {
        ctx.strokeStyle = links[l] ?? links[0] ?? '#fff';
        ctx.stroke();
      }
    }
    for (let l = 0; l < LEVELS; l++) {
      ctx.fillStyle = styles[l] ?? styles[0] ?? '#fff';
      const size = (2 + 2.5 * (l / (LEVELS - 1))) * dpr;
      const half = size / 2;
      for (let i = 0; i < n; i++) {
        if (lvl[i] !== l) continue;
        ctx.fillRect(sx(i) - half, sy(i) - half, size, size);
      }
    }
  };

  const resize = () => {
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    dpr = Math.min(window.devicePixelRatio || 1, fine ? 2 : 1.5);
    if (w * h * dpr * dpr > 4.5e6) dpr = Math.max(1, Math.sqrt(4.5e6 / (w * h)));
    canvas.width = Math.max(1, Math.round(w * dpr));
    canvas.height = Math.max(1, Math.round(h * dpr));
    cols = Math.ceil(w / spacing) + 1;
    const rows = Math.ceil(h / spacing) + 1;
    const x0 = (w - (cols - 1) * spacing) / 2;
    n = cols * rows;
    rx = new Float32Array(n);
    ry = new Float32Array(n);
    ox = new Float32Array(n);
    oy = new Float32Array(n);
    vx = new Float32Array(n);
    vy = new Float32Array(n);
    lvl = new Uint8Array(n);
    for (let r = 0, i = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++, i++) {
        rx[i] = x0 + c * spacing;
        ry[i] = spacing / 2 + r * spacing;
      }
    }
    canvas.dataset.fieldDots = String(n);
    draw();
  };

  /** One physics step; returns whether every dot has reached its target (a resting cursor included)
   *  and whether that target is the grid itself (no cursor), so the arrays can be zeroed exactly. */
  const step = (dt: number, now: number): { atRest: boolean; free: boolean } => {
    const fronts: { x: number; y: number; r: number; s: number }[] = [];
    for (let i = waves.length - 1; i >= 0; i--) {
      const wv = waves[i];
      if (!wv) continue;
      const age = (now - wv.t0) / 1000;
      const s = wv.strength * Math.exp(-age / wv.tau);
      const r = WAVE_SPEED * age;
      if (s < 0.04 || r > wv.reach) waves.splice(i, 1);
      else fronts.push({ x: wv.x, y: wv.y, r, s });
    }
    const cOn = cursor.on && fine;
    const cx = cursor.x;
    const cy = cursor.y;
    const r2 = CURSOR_R * CURSOR_R;
    let maxV = 0;
    let maxD = 0; // distance from target
    for (let i = 0; i < n; i++) {
      const px = rx[i] ?? 0;
      const py = ry[i] ?? 0;
      let tx = 0;
      let ty = 0;
      let b = 0;
      if (cOn) {
        const dx = px - cx;
        const dy = py - cy;
        const d2 = dx * dx + dy * dy;
        if (d2 < r2) {
          const d = Math.sqrt(d2);
          const u = 1 - d / CURSOR_R;
          const s = u * u * (3 - 2 * u); // smoothstep
          if (d > 0.5) {
            tx += (dx / d) * CURSOR_PUSH * s;
            ty += (dy / d) * CURSOR_PUSH * s;
          }
          b += s * 0.9;
        }
      }
      for (const f of fronts) {
        const dx = px - f.x;
        const dy = py - f.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        const u = (d - f.r) / WAVE_BAND;
        if (u <= -1 || u >= 1) continue;
        const env = (1 - u * u) * (1 - u * u);
        const a = (WAVE_AMP * f.s * env) / (1 + d / WAVE_REACH);
        if (d > 0.5) {
          tx += (dx / d) * a;
          ty += (dy / d) * a;
        }
        b += env * f.s * 1.3;
      }
      const cvx = (vx[i] ?? 0) + (K * (tx - (ox[i] ?? 0)) - C * (vx[i] ?? 0)) * dt;
      const cvy = (vy[i] ?? 0) + (K * (ty - (oy[i] ?? 0)) - C * (vy[i] ?? 0)) * dt;
      vx[i] = cvx;
      vy[i] = cvy;
      const nox = (ox[i] ?? 0) + cvx * dt;
      const noy = (oy[i] ?? 0) + cvy * dt;
      ox[i] = nox;
      oy[i] = noy;
      lvl[i] = Math.round(clamp(b) * (LEVELS - 1));
      const av = Math.max(Math.abs(cvx), Math.abs(cvy));
      const ad = Math.max(Math.abs(tx - nox), Math.abs(ty - noy));
      if (av > maxV) maxV = av;
      if (ad > maxD) maxD = ad;
    }
    return { atRest: fronts.length === 0 && maxV < REST && maxD < REST, free: !cOn };
  };

  const frame = (ts: number) => {
    if (!running) return;
    const dt = Math.min(0.032, last ? (ts - last) / 1000 : 0.016);
    last = ts;
    const { atRest, free } = step(dt, performance.now());
    if (atRest && free) {
      ox.fill(0);
      oy.fill(0);
      vx.fill(0);
      vy.fill(0);
      lvl.fill(0);
    }
    draw();
    if (atRest) {
      // converged: with a resting cursor the pushed dots stay where they are until the next pointermove
      running = false;
      raf = 0;
      setState('idle');
      return;
    }
    raf = requestAnimationFrame(frame);
  };
  const wake = () => {
    if (running || !onScreen || document.hidden) return;
    running = true;
    last = 0;
    setState('live');
    raf = requestAnimationFrame(frame);
  };
  const sleep = () => {
    if (running) setState('idle');
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  };

  const ripple = (x: number, y: number, kind: keyof typeof WAVES) => {
    canvas.dataset.fieldWave = kind; // the kind of the latest wave (e2e)
    const reach = Math.max(Math.hypot(x, y), Math.hypot(w - x, y), Math.hypot(x, h - y), Math.hypot(w - x, h - y)) + WAVE_BAND;
    waves.push({ x, y, t0: performance.now(), reach, ...WAVES[kind] });
    wake();
  };
  const local = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const scheduleAmbient = (delay = AMBIENT_MIN + Math.random() * AMBIENT_JITTER) => {
    window.clearTimeout(ambientTimer);
    ambientTimer = 0;
    if (!onScreen || document.hidden || canvas.dataset.fieldAmbient === 'off') return; // `off`: e2e tests
    ambientTimer = window.setTimeout(() => {
      ambientTimer = 0;
      if (canvas.dataset.fieldAmbient === 'off') return;
      ripple(w * (0.15 + 0.7 * Math.random()), h * (0.1 + 0.6 * Math.random()), 'ambient');
      scheduleAmbient();
    }, delay);
  };

  // the load wave starts where the accent line of the headline lands
  const loadWave = () => {
    const words = $$('.w__in--accent', hero);
    const r = canvas.getBoundingClientRect();
    let x = w * 0.3;
    let y = h * 0.4;
    if (words.length) {
      const boxes = words.map((el) => el.getBoundingClientRect());
      const left = Math.min(...boxes.map((b) => b.left));
      const right = Math.max(...boxes.map((b) => b.right));
      const top = Math.min(...boxes.map((b) => b.top));
      const bottom = Math.max(...boxes.map((b) => b.bottom));
      x = (left + right) / 2 - r.left;
      y = (top + bottom) / 2 - r.top;
    }
    ripple(x, y, 'load');
    scheduleAmbient(AMBIENT_FIRST);
  };

  resize();
  if (still) {
    setState('static');
    new ResizeObserver(resize).observe(canvas);
    return;
  }
  setState('idle');

  new ResizeObserver(resize).observe(canvas);

  if (fine) {
    hero.addEventListener(
      'pointermove',
      (e) => {
        const p = local(e);
        cursor.x = p.x;
        cursor.y = p.y;
        cursor.on = p.y <= h;
        canvas.dataset.fieldCursor = cursor.on ? `${Math.round(p.x)},${Math.round(p.y)}` : 'off'; // e2e
        wake();
      },
      { passive: true },
    );
    hero.addEventListener('pointerleave', () => {
      cursor.on = false;
      canvas.dataset.fieldCursor = 'off';
      wake();
    });
  }
  hero.addEventListener(
    'pointerdown',
    (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      const p = local(e);
      if (p.y <= h) ripple(p.x, p.y, 'tap');
    },
    { passive: true },
  );

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(
      (entries) => {
        for (const e of entries) onScreen = e.isIntersecting;
        if (onScreen) {
          wake();
          scheduleAmbient();
        } else {
          sleep();
          scheduleAmbient(); // clears the timer while off screen
        }
      },
      { threshold: 0 },
    ).observe(hero);
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      sleep();
      scheduleAmbient();
    } else {
      wake();
      scheduleAmbient();
    }
  });

  if (hero.classList.contains('is-ready')) window.setTimeout(loadWave, LOAD_DELAY);
  else {
    const mo = new MutationObserver(() => {
      if (!hero.classList.contains('is-ready')) return;
      mo.disconnect();
      window.setTimeout(loadWave, LOAD_DELAY);
    });
    mo.observe(hero, { attributes: true, attributeFilter: ['class'] });
  }
}
