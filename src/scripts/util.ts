export const reduceMotion = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const finePointer = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/** Same soft curve as --ease-out in global.css (for WAAPI). */
export const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)';

export const clamp = (v: number, min = 0, max = 1): number => Math.min(max, Math.max(min, v));

export const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document): T | null =>
  root.querySelector<T>(sel);

export const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document): T[] =>
  Array.from(root.querySelectorAll<T>(sel));

/**
 * Run `fn` once when `el` enters the viewport. The default geometry is the reveal observer's
 * (reveal.ts): an element's entrance and its in-view trigger then fire in the same task, so nothing
 * (a chart line, a counter) can be seen in its pre-trigger state between the two.
 */
export function onceInView(el: Element, fn: () => void, options: IntersectionObserverInit = { rootMargin: '0px 0px -10% 0px', threshold: 0.1 }): void {
  if (!('IntersectionObserver' in window)) {
    fn();
    return;
  }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        io.disconnect();
        fn();
        return;
      }
    }
  }, options);
  io.observe(el);
}

/** ease-out cubic for rAF tweens (same feel as --ease-out, cheap to compute). */
export const easeOut = (t: number): number => 1 - Math.pow(1 - t, 3);

export function tween(duration: number, onUpdate: (p: number) => void, done?: () => void): void {
  const start = performance.now();
  const step = (now: number) => {
    const p = clamp((now - start) / duration);
    onUpdate(easeOut(p));
    if (p < 1) requestAnimationFrame(step);
    else done?.();
  };
  requestAnimationFrame(step);
}

export const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/**
 * Jump to a section of the current page. A real fragment navigation (`location.hash`) lets the
 * browser scroll smoothly via CSS `scroll-behavior` (instantly under reduced motion), honour
 * `scroll-padding-top`, push history and fire `hashchange`. Returns false when the id is not on this page.
 */
export function jumpToSection(id: string): boolean {
  const el = document.getElementById(id);
  if (!el) return false;
  const hash = `#${id}`;
  if (location.hash === hash) el.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
  else location.hash = hash;
  return true;
}
