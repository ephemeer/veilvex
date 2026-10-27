/**
 * Character "decode" (reference: emotion-agency `data-decode`). The text starts as a run of cipher glyphs
 * (GLYPHS below) and resolves left to right over `duration`, like a line being typed out by a
 * decoder; the unresolved tail keeps re-rolling every other frame so it reads as noise, not as a
 * blink. Mono text only — every glyph has the same advance, so nothing reflows — and never on text a
 * visitor sees many times a session: the section eyebrows on their first reveal (reveal.ts) and the
 * case arena's mono "kind · tags" line, once per settle on a new card. While it runs, the visible run is
 * aria-hidden and the real text sits in an sr-only twin, so assistive tech never reads the cipher. Reduced
 * motion: resolved at once.
 * Calling it again on the same element takes over (the previous run stops).
 */
const GLYPHS = '!$#%&*/=:;<>?{}~^_@';
const runs = new WeakMap<HTMLElement, number>();
let seq = 0;

export interface DecodeOptions {
  /** total time of the left-to-right sweep; default ≈28ms per character, clamped to 350–600ms */
  duration?: number;
}

const roll = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

export function decode(el: HTMLElement, { duration }: DecodeOptions = {}): Promise<void> {
  const text = el.textContent ?? '';
  const chars = [...text];
  const id = ++seq;
  runs.set(el, id);
  const total = duration ?? Math.min(600, Math.max(350, 28 * chars.length));
  if (chars.length === 0 || total <= 0 || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = text;
    el.dataset.decode = 'done';
    return Promise.resolve();
  }
  const visible = document.createElement('span');
  visible.setAttribute('aria-hidden', 'true');
  const twin = document.createElement('span');
  twin.className = 'sr-only';
  twin.textContent = text;
  el.replaceChildren(visible, twin);
  el.dataset.decode = 'on';
  let noise = chars.map((c) => (c === ' ' ? c : roll()));
  let frame = 0;
  const paint = (resolved: number) => {
    if (frame++ % 2 === 0) noise = noise.map((c, i) => (c === ' ' || i < resolved ? c : roll()));
    visible.textContent = chars.map((c, i) => (i < resolved ? c : noise[i])).join('');
  };
  return new Promise((resolve) => {
    const t0 = performance.now();
    paint(0);
    const tick = (now: number) => {
      if (runs.get(el) !== id) return resolve(); // taken over
      const p = Math.min(1, (now - t0) / total);
      if (p < 1) {
        paint(Math.floor(p * chars.length));
        requestAnimationFrame(tick);
        return;
      }
      el.textContent = text;
      el.dataset.decode = 'done';
      runs.delete(el);
      resolve();
    };
    requestAnimationFrame(tick);
  });
}
