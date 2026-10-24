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

/** Run `fn` once when `el` enters the viewport. */
export function onceInView(el: Element, fn: () => void, options: IntersectionObserverInit = { rootMargin: '0px 0px -12% 0px', threshold: 0.15 }): void {
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
