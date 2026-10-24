import { $$, onceInView, reduceMotion, tween } from './util';

/**
 * Count-up for any element with data-count.
 * data-count may be a plain number ("95", "0.93") or a formatted string ("$0,93", "9,3%").
 * The original text formatting (prefix, suffix, decimal separator) is preserved.
 */
export function initCounters(root: ParentNode = document): void {
  for (const el of $$('[data-count]', root)) {
    if (el.dataset.countInit) continue;
    el.dataset.countInit = '1';
    const raw = el.dataset.count ?? '';
    const match = raw.match(/-?[\d]+(?:[.,]\d+)?/);
    if (!match) continue;
    const numStr = match[0];
    const sep = numStr.includes(',') ? ',' : '.';
    const decimals = Number(el.dataset.decimals ?? (numStr.split(/[.,]/)[1]?.length ?? 0));
    const target = Number(numStr.replace(',', '.'));
    const prefix = raw.slice(0, match.index ?? 0);
    const suffix = raw.slice((match.index ?? 0) + numStr.length);
    const locale = document.documentElement.lang || 'en';
    const format = (v: number) => {
      const n = v.toLocaleString(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals, useGrouping: false });
      // keep the separator style of the source string when it was explicit
      return prefix + (sep === ',' ? n.replace('.', ',') : n) + suffix;
    };
    const final = format(target);
    if (reduceMotion()) {
      el.textContent = final;
      continue;
    }
    onceInView(el, () => {
      const duration = 1200 + Math.min(600, target * 2);
      tween(duration, (p) => (el.textContent = format(target * p)), () => (el.textContent = final));
    });
  }
}
