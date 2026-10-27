import { $, $$, EASE_OUT, clamp, finePointer, onceInView } from './util';
import { decode } from './decode';
import { expandCases } from './cases';

/**
 * The case arena (reference: emotion-agency /projects) — the Cases grid rebuilt as a large convex ring of
 * neon frames seen from outside, CSS 3D only. Progressive: it takes the server-rendered `<li class="case">`
 * cards (sheet opener, hover data sheet, filter type) and re-places them; without JS, under reduced motion
 * or in a window too short for the stage nothing runs and the grid stays. Look: Cases.astro `<style is:global>`.
 *
 * Geometry (1440×900, scale 1): cards 200×260, 15° apart on a radius of 840px, eye 2800px away at 30% of the
 * card height — neighbours ≈19px apart at the front, ±5 cards in view, the outermost ones slivers at the
 * silhouette. Phones: 150×200, 17°, 570px, 1900px. Everything scales with the window: width factor
 * clamp(vw / base, 0.8, 1.3), capped by a height factor so the ring and its reflection fit the stage; a window
 * whose factor would start below 0.6 keeps the grid (later resizes clamp at 0.6 instead).
 *
 * Rendering: each card and its reflection stand-in carry a static `rotateY(slot·step) translateZ(R)`; the ring
 * and the mirror containers turn with `translateZ(−R) rotateY(−p·step)`, always an animated value, never an
 * inline style. When the list closes the half circle (n·step ≥ 180°) it is circular: a card's slot wraps by ±n
 * while it is edge-on at the back, so case 12 stands left of case 1 and the short way round is always taken. A
 * filtered, shorter list is an open arc with the same step. The rim along the base is a static SVG drawn per
 * resize; the reflection is a second ring of frame-only stand-ins (the art would fall where it has faded out).
 *
 * One source of truth: the page scroll. The section scrolls 180px per case; while the stage is pinned, the
 * scroll maps to a target index t through dwell zones (each card holds still for 45% of its segment, smoothstep
 * between). Where the browser has ScrollTimeline that mapping is the keyframes of a scroll-linked animation the
 * compositor runs, and the main thread only follows (front card, wrap slots, headline); elsewhere a rAF loop
 * drives a paused animation and the shown index p trails t with inertia (lerp 0.12 per 60fps frame, only
 * while it moves). The script never moves the page on its own. Ticks, ← / → / Home / End, a side-card click,
 * focus return from the sheet, #case-N and a drag release scroll the page to that card's offset — instantly
 * when the stage is already pinned (invisible behind it; the ring eases the short way from where it was, the
 * same lerp, as an additive offset on the scroll-linked turn), smoothly only to travel into the pin. A drag
 * turns the ring directly (1 case per 120px, rubber band at the ends of an open arc) and only while pinned;
 * the page moves once, on release.
 *
 * Headline (bottom-left, aria-hidden): ↳ + the front card's title, swapped once the ring settles on a new card
 * (200ms fade + 8px rise); the mono "kind · tags" line decodes once per settle. A real pointer move over a
 * side card previews its headline instantly; the preview clears as soon as the ring moves. Pager (aria-hidden):
 * position, a strip of ticks that is one pointer target, total. Keyboard: a roving tab stop on the front card.
 *
 * Mounting is deferred (idle time after load, or when the section comes within 1.5 viewports) unless the URL
 * has a fragment or the browser restores a scroll position. Test hooks on the ring <ul>: data-arena-active
 * (1-based case), data-arena-loop (live | idle), data-arena-p (at rest), data-arena-n, data-arena-step,
 * data-arena-drive (scroll | loop); `data-arena` on the section is pending | on | off. `.cases.is-no-decode`
 * skips the decode.
 */
interface Base {
  w: number;
  h: number;
  step: number;
  r: number;
  persp: number;
  vw: number;
}
const DESK: Base = { w: 200, h: 260, step: 15, r: 840, persp: 2800, vw: 1440 };
const PHONE: Base = { w: 150, h: 200, step: 17, r: 570, persp: 1900, vw: 390 };
const PHONE_MAX = 767;
const S_MIN = 0.6;
const S_MAX = 1.3;
const SW_MIN = 0.8;
const NEED = 1.75; // scene height per card height: the ring, 62% of its reflection, a little air
const FOOT = { desk: 76, phone: 132 }; // the headline + pager band under the scene (--arena-foot in Cases.astro)
const EYE = 0.3; // eye height from the top of the cards (perspective-origin y)
const GHOST = 0.6; // the reflection's height per card height (it has faded out by then)
const RADIUS = 12; // the cards' corner radius (--r-lg)
const PX_PER_CASE = 180;
const SPAN_MIN = 360;
const DWELL = 0.45; // share of each card's scroll segment where the ring holds still
const LERP = 0.12; // per 60fps frame
const SETTLE = 0.002;
const SMOOTHSTEP = 'cubic-bezier(0.3333, 0, 0.6667, 1)'; // 3u² − 2u³ exactly
const DRAG_PX = 120; // pointer travel per case
const DRAG_SLOP = 6;
const FLICK_MS = 160; // how far the release velocity carries, in ms of travel
const RUBBER = 0.2;
const GLIDE_MS = 300;
const PRESS_MS = 140;
const SWAP_MS = 200;
const KIND_MS = 350;
const SCROLL_IDLE_MS = 200;
const HASH = /^#case-(\d{1,2})$/;
const SVGNS = 'http://www.w3.org/2000/svg';

/** Scroll-driven animations are not in TypeScript's DOM lib yet: only what the arena uses. */
type ScrollTimelineCtor = new (options: { source: Element; axis: 'block' }) => AnimationTimeline;
interface RangeOffset {
  offset: CSSNumericValue;
}
type Ranged = Animation & { rangeStart: RangeOffset; rangeEnd: RangeOffset };

const pad2 = (n: number) => String(n).padStart(2, '0');
/** The pinned scroll length for n cards. */
const spanFor = (n: number) => Math.max(SPAN_MIN, PX_PER_CASE * Math.max(0, n - 1));
const mod = (a: number, m: number) => ((a % m) + m) % m;
const svgEl = <K extends keyof SVGElementTagNameMap>(name: K, attrs: Record<string, string>): SVGElementTagNameMap[K] => {
  const e = document.createElementNS(SVGNS, name);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  return e;
};
const el = <K extends keyof HTMLElementTagNameMap>(name: K, className: string, attrs: Record<string, string> = {}): HTMLElementTagNameMap[K] => {
  const e = document.createElement(name);
  e.className = className;
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  return e;
};
const idle = (fn: () => void, timeout: number) => {
  if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(fn, { timeout });
  else setTimeout(fn, 200);
};

export function initArena(): void {
  const root = $('[data-cases-root]');
  const stage = root ? $('[data-arena-stage]', root) : null;
  const track = root ? $('[data-arena-track]', root) : null;
  const grid = root ? $<HTMLElement>('[data-cases]', root) : null;
  const head = root ? $('.cases__head', root) : null;
  if (!root || !stage || !track || !grid || !head) return;
  const rm = window.matchMedia('(prefers-reduced-motion: reduce)');
  const cards = $$<HTMLElement>('.case', grid);
  if (rm.matches || typeof CSS === 'undefined' || !CSS.supports('transform-style', 'preserve-3d') || !CSS.supports('perspective', '1px') || cards.length < 2) {
    root.dataset.arena = 'off';
    return;
  }
  root.dataset.arena = 'pending';
  // the arena's length is reserved at once (the stage one viewport tall, the track 180px per case), so the
  // deferred mount moves nothing below the section; a window too short for the stage is left as it is
  if (window.innerHeight >= (window.innerWidth <= PHONE_MAX ? 600 : 540)) {
    root.classList.add('is-arena-pending');
    track.style.height = `${spanFor(cards.length)}px`;
  }

  let mounted = false;
  const mount = () => {
    if (mounted) return;
    mounted = true;
    // preflight with the arena's stage and head styles: one forced layout decides whether the stage fits
    root.classList.remove('is-arena-pending');
    root.classList.add('is-arena');
    const vw = document.documentElement.clientWidth;
    const base = vw <= PHONE_MAX ? PHONE : DESK;
    const sceneH = stage.clientHeight - head.offsetHeight - (vw <= PHONE_MAX ? FOOT.phone : FOOT.desk);
    if (Math.min(clamp(vw / base.vw, SW_MIN, S_MAX), sceneH / (NEED * base.h)) < S_MIN) {
      root.classList.remove('is-arena');
      track.style.removeProperty('height');
      root.dataset.arena = 'off';
      return;
    }
    build(root, stage, track, grid, cards, rm);
  };

  // the browser is about to scroll somewhere — a fragment (#cases, #case-N, a section below) or a restored
  // position: mount now, so the page lands on the final layout (the arena is taller than the grid it replaces;
  // without scroll anchoring a later mount would move what is on screen)
  const navType = (performance.getEntriesByType?.('navigation')[0] as PerformanceNavigationTiming | undefined)?.type;
  if (location.hash.length > 1 || navType === 'reload' || navType === 'back_forward') {
    mount();
    return;
  }
  // otherwise in idle time after load, or as soon as the section comes within 1.5 viewports
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        mount();
      },
      { rootMargin: '150% 0px 150% 0px' },
    );
    io.observe(root);
  }
  const later = () => idle(mount, 1500);
  if (document.readyState === 'complete') later();
  else window.addEventListener('load', later, { once: true });
}

function build(root: HTMLElement, stage: HTMLElement, track: HTMLElement, grid: HTMLElement, cards: HTMLElement[], rm: MediaQueryList): void {
  const fine = finePointer();
  const titleOf = (c: HTMLElement) => $('.case__open', c)?.textContent?.trim() ?? '';
  const kindOf = (c: HTMLElement) => $('.case__fact dd', c)?.textContent?.trim() ?? '';
  const tagsOf = (c: HTMLElement) => $('.case__tags', c)?.textContent?.trim() ?? '';
  const titles = cards.map(titleOf);
  const lines = cards.map((c) => `${kindOf(c)} · ${tagsOf(c)}`);
  const buttons = cards.map((c) => $<HTMLButtonElement>('.case__open', c));

  // ---- the stage chrome (writes only) ----
  expandCases(); // phones: every card is in the ring, the "show all" button is irrelevant
  for (const c of cards) {
    // the cards' own reveal would animate `transform` over the 3D placement; the arena enters as one object
    c.classList.remove('reveal', 'is-in');
    c.style.removeProperty('--d');
  }
  // SVG <text> under a turning ancestor is laid out again every frame (Blink re-fits its font to the screen
  // scale): in the ring the arts' few labels are HTML, placed over the art in its viewBox units (CSS hides the
  // SVG text). Attribute maths only, no layout read.
  for (const c of cards) {
    const svg = $<SVGSVGElement>('.case__art svg', c);
    const vb = svg?.viewBox.baseVal;
    if (!svg || !vb?.width || !vb.height) continue;
    const labels = $$<SVGTextElement>('text', svg).map((tx) => {
      let m = new DOMMatrix();
      for (let e: Element | null = tx; e && e !== svg; e = e.parentElement) {
        const list = e instanceof SVGGraphicsElement ? e.transform.baseVal : null;
        for (let k = (list?.numberOfItems ?? 0) - 1; k >= 0; k--) m = DOMMatrix.fromMatrix((list as SVGTransformList).getItem(k).matrix).multiply(m);
      }
      const at = (l: SVGAnimatedLengthList) => (l.baseVal.numberOfItems ? l.baseVal.getItem(0).value : 0);
      const pt = new DOMPoint(at(tx.x), at(tx.y)).matrixTransform(m);
      const cls = `arena__label${tx.classList.contains('art__text--lime') ? ' arena__label--lime' : ''}${tx.getAttribute('text-anchor') === 'middle' ? ' arena__label--mid' : ''}`;
      const label = el('span', cls, { 'aria-hidden': 'true' });
      label.textContent = tx.textContent;
      label.style.left = `${(((pt.x - vb.x) / vb.width) * 100).toFixed(3)}%`;
      label.style.top = `${(((pt.y - vb.y) / vb.height) * 100).toFixed(3)}%`;
      return label;
    });
    svg.after(...labels);
  }
  // light: 7 rays and a few ceiling lines converging at the top centre, a vertical beam
  const rays = svgEl('svg', { class: 'arena__rays', viewBox: '0 0 100 100', preserveAspectRatio: 'none', 'aria-hidden': 'true', focusable: 'false' });
  for (const x of [-30, 2, 22, 50, 78, 98, 130]) rays.append(svgEl('line', { x1: '50', y1: '0', x2: String(x), y2: '100' }));
  for (const y of [22, 47, 76]) rays.append(svgEl('line', { class: 'arena__ceil', x1: '0', y1: String(y), x2: '100', y2: String(y) }));
  const beam = el('i', 'arena__beam', { 'aria-hidden': 'true' });
  stage.prepend(rays, beam);

  const arena = el('div', 'arena', { 'data-arena-box': '' });
  const scene = el('div', 'arena__scene', { 'data-arena-scene': '' });
  const ring = el('div', 'arena__ring');
  const floor = el('i', 'arena__floor', { 'aria-hidden': 'true' });
  const rim = svgEl('svg', { class: 'arena__rim', 'aria-hidden': 'true', focusable: 'false', preserveAspectRatio: 'none' });
  const rimPaths = ['arena__rim-haze', 'arena__rim-glow', 'arena__rim-line'].map((c) => svgEl('path', { class: c, d: 'M0 0' }));
  rim.append(...rimPaths);
  const mirror = el('div', 'arena__mirror', { 'aria-hidden': 'true', 'data-arena-mirror': '' });
  const mirrorRing = el('div', 'arena__mirror-ring');
  // the reflection's stand-ins: a frame path each, painted with fading strokes and fills shared by all of them
  const fades = svgEl('svg', { class: 'arena__fades', 'aria-hidden': 'true', focusable: 'false', width: '0', height: '0' });
  const defs = svgEl('defs', {});
  for (const id of ['line', 'lit', 'fill']) {
    const g = svgEl('linearGradient', { id: `arena-fade-${id}`, x1: '0', y1: '0', x2: '0', y2: '1' });
    g.append(svgEl('stop', { class: `arena__stop arena__stop--${id}`, offset: '0' }), svgEl('stop', { class: `arena__stop arena__stop--${id} arena__stop--end`, offset: '1' }));
    defs.append(g);
  }
  fades.append(defs);
  const ghostPaths: SVGPathElement[] = [];
  const ghosts = cards.map((c) => {
    const g = el('div', 'arena__ghost');
    g.hidden = c.hidden;
    const frame = svgEl('svg', { class: 'arena__ghost-frame', preserveAspectRatio: 'none', 'aria-hidden': 'true', focusable: 'false' });
    const path = svgEl('path', { class: 'arena__ghost-path', d: 'M0 0' });
    frame.append(path);
    ghostPaths.push(path);
    g.append(frame);
    return g;
  });
  const ghostOf = (c: HTMLElement) => ghosts[cards.indexOf(c)];
  mirrorRing.append(...ghosts);
  mirror.append(fades, mirrorRing);
  grid.replaceWith(arena);
  ring.append(floor, rim, grid, mirror);
  scene.append(ring);

  const foot = el('div', 'arena__foot', { 'aria-hidden': 'true' });
  const headline = el('div', 'arena__headline', { 'data-arena-headline': '' });
  const titleBox = el('div', 'arena__title');
  const line = el('div', 'arena__title-line', { 'data-arena-line': '' });
  const glyph = svgEl('svg', { class: 'arena__glyph', 'aria-hidden': 'true', focusable: 'false' });
  glyph.append(svgEl('use', { href: '#i-arrow-turn' }));
  const title = el('span', 'arena__title-text', { 'data-arena-title': '' });
  line.append(glyph, title);
  titleBox.append(line);
  const kind = el('p', 'arena__kind', { 'data-arena-kind': '' });
  headline.append(titleBox, kind);
  const pager = el('div', 'arena__pager', { 'data-arena-pager': '' });
  const count = el('span', 'arena__count', { 'data-arena-cur': '' });
  const strip = el('div', 'arena__strip', { 'data-arena-strip': '' });
  const marker = el('i', 'arena__marker');
  const totalEl = el('span', 'arena__total', { 'data-arena-total': '' });
  pager.append(count, strip, totalEl);
  foot.append(headline, pager);
  arena.append(scene, foot);

  grid.classList.add('is-arena');
  root.dataset.arena = 'on';
  // the track's height right away (the first frame places the ring): the page has its final length from here on
  track.style.height = `${spanFor(cards.filter((c) => !c.hidden && !c.classList.contains('is-out')).length)}px`;
  // roving tab stop: only the front card's button is in the tab order (set once the front is known)
  for (const b of buttons) if (b) b.tabIndex = -1;

  // ---- state ----
  let order: HTMLElement[] = []; // the visible cards, DOM order
  let n = 0;
  let step = DESK.step;
  let wraps = false; // n·step closes the half circle: a circular list
  let s = 0; // scale
  let W = 0;
  let H = 0;
  let R = 0;
  let P = 0;
  let viewW = 0;
  let span = SPAN_MIN;
  let pinStart = 0;
  let navH = 0;
  let stageH = 0;
  let measuredAt = -Infinity;
  let p = 0; // shown index (continuous): t + o
  let t = 0; // target index from the scroll
  let renderedP = NaN;
  const slot = new Map<HTMLElement, number>(); // card → slot (its static angle / step)
  let active = -1; // card index (over all cards) at the front
  let settled = -1; // card index the headline shows
  let previewing = -1; // card index a hover preview shows
  let dest: number | null = null; // card index the last navigation asked for
  let tabStop: HTMLButtonElement | null = null;
  let tickEls: HTMLElement[] = [];
  let onTick = -1;
  let raf = 0;
  let last = 0;
  let onScreen = true;
  let still = rm.matches;
  let hoverCard: HTMLElement | null = null;
  let pointerCard: HTMLElement | null = null;
  let pointerTimer = 0;
  let keyNav = false;
  let suppressUntil = 0;
  let press: Animation | null = null;
  let glideTimer = 0;
  let o = 0; // the shown index's offset from the scroll's target: inertia, a programmatic move, a drag
  let jumpFrom: number | null = null; // scroll-driven: the shown index before an instant programmatic scroll
  let renderedO = NaN;

  const posOf = (c: HTMLElement | undefined) => (c ? order.indexOf(c) : -1);
  const cardAt = (v: number): HTMLElement | undefined => (n ? order[wraps ? mod(Math.round(v), n) : clamp(Math.round(v), 0, n - 1)] : undefined);
  /** Signed way from p to t — the short way round on a circular list (case 12 is one step left of case 1). */
  const distance = (from: number, to: number) => (wraps ? mod(to - from + n / 2, n) - n / 2 : to - from);
  /** Dwell zones: around each integer the ring holds still for DWELL of a segment, smoothstep in between. */
  const detent = (x: number) => {
    const k = Math.floor(x);
    const u = clamp((x - k - DWELL / 2) / (1 - DWELL));
    return k + u * u * (3 - 2 * u);
  };
  const raw = () => (n > 1 ? clamp((window.scrollY - pinStart) / span) * (n - 1) : 0);
  const target = () => detent(raw());
  const offsetOf = (pos: number) => pinStart + (n > 1 ? (span * clamp(pos, 0, n - 1)) / (n - 1) : 0);
  const pinned = () => {
    const y = window.scrollY;
    return y >= pinStart - 1 && y <= pinStart + span + 1;
  };
  /** The slot of order position j: itself on an open arc; on a circular list the lap that puts it in [−n/2, n/2) around v. */
  const slotFor = (j: number, v: number) => (wraps ? j + n * Math.ceil((v - j - n / 2) / n) : j);
  const destIdx = () => (dest !== null ? dest : cards.indexOf(cardAt(target()) as HTMLElement));

  /** Where the stage starts sticking: one rect read of the never-sticky spacer. */
  const measure = () => {
    pinStart = track.getBoundingClientRect().top + window.scrollY - stageH - navH;
    measuredAt = performance.now();
    syncBase();
  };

  // ---- placement ----
  const cardTf = (sl: number) => `rotateY(${(sl * step).toFixed(3)}deg) translateZ(${R.toFixed(2)}px)`;
  const placeCard = (c: HTMLElement, sl: number) => {
    slot.set(c, sl);
    const tf = cardTf(sl);
    c.style.transform = tf;
    const g = ghostOf(c);
    if (g) g.style.transform = tf;
  };
  /**
   * The turn — never written inline: an animated transform updates the compositor's property tree directly, an
   * inline one re-layerizes the page every frame. Where the browser has ScrollTimeline the turn is scroll-driven:
   * each container runs a scroll-linked animation over the pinned range whose keyframes are the dwell zones, so
   * the compositor turns the ring with the page and the main thread only follows (front card, slots); a
   * programmatic move or a drag adds an offset o (an additive paused animation) that eases back to 0. Elsewhere
   * the loop drives it: one paused linear animation per container whose currentTime is p, and p trails the
   * scroll with inertia (o = p − t eases to 0 in both).
   */
  const ScrollTl = (window as unknown as { ScrollTimeline?: ScrollTimelineCtor }).ScrollTimeline;
  let timeline: AnimationTimeline | null = null;
  try {
    if (ScrollTl && typeof CSS.px === 'function') timeline = new ScrollTl({ source: document.documentElement, axis: 'block' });
  } catch {
    timeline = null;
  }
  let sd = !!timeline;
  let turns: Animation[] = []; // loop: currentTime = p
  let bases: Animation[] = []; // scroll-driven: scroll-linked
  let adds: Animation[] = []; // scroll-driven: the offset, only while o ≠ 0
  let baseKey = '';
  const LO = -cards.length - 2; // the index range the paused animations cover
  const HI = 2 * cards.length + 2;
  const ringTf = (v: number) => `translateZ(${(-R).toFixed(2)}px) rotateY(${(-v * step).toFixed(3)}deg)`;
  const paused = (e: HTMLElement, kf: Keyframe[], composite: CompositeOperation) => {
    const a = e.animate(kf, { duration: (HI - LO) * 1000, easing: 'linear', fill: 'both', composite });
    a.pause();
    return a;
  };
  /** The scroll-linked keyframes: a plateau around every card (DWELL of a segment), smoothstep between. */
  const baseFrames = (): Keyframe[] => {
    if (n < 2) return [{ transform: ringTf(0) }, { transform: ringTf(0) }];
    const kf: Keyframe[] = [];
    for (let k = 0; k < n; k++) {
      const a = Math.max(0, k - DWELL / 2);
      const b = Math.min(n - 1, k + DWELL / 2);
      kf.push({ offset: a / (n - 1), transform: ringTf(k) });
      if (b > a) kf.push({ offset: b / (n - 1), transform: ringTf(k), easing: SMOOTHSTEP });
    }
    return kf;
  };
  function syncBase() {
    if (!sd || !timeline || !n || !R) return;
    const key = `${n}|${span}|${pinStart.toFixed(1)}|${R.toFixed(2)}|${step}`;
    if (key === baseKey) return;
    baseKey = key;
    const range = { rangeStart: { offset: CSS.px(pinStart) }, rangeEnd: { offset: CSS.px(pinStart + span) } };
    try {
      if (!bases.length) {
        const opts: KeyframeAnimationOptions & typeof range = { timeline, fill: 'both', easing: 'linear', ...range };
        bases = [grid, mirrorRing].map((e) => e.animate(baseFrames(), opts));
      } else {
        const kf = baseFrames();
        for (const a of bases as Ranged[]) {
          (a.effect as KeyframeEffect).setKeyframes(kf);
          a.rangeStart = range.rangeStart;
          a.rangeEnd = range.rangeEnd;
        }
      }
    } catch {
      // no scroll-linked ranges after all: the loop drives the turn
      for (const a of bases) a.cancel();
      bases = [];
      sd = false;
      buildTurn();
    }
  }
  /** After a change of radius or step: the loop's turn anew; the scroll-driven keyframes follow in syncBase(). */
  function buildTurn() {
    for (const a of [...turns, ...adds]) a.cancel();
    turns = [];
    adds = [];
    renderedP = NaN;
    renderedO = NaN;
    grid.dataset.arenaDrive = sd ? 'scroll' : 'loop';
    if (sd) return syncBase();
    turns = [grid, mirrorRing].map((e) => paused(e, [{ transform: ringTf(LO) }, { transform: ringTf(HI) }], 'replace'));
  }
  const setAdd = (v: number) => {
    if (v === 0) {
      for (const a of adds) a.cancel();
      adds = [];
      return;
    }
    if (!adds.length) adds = [grid, mirrorRing].map((e) => paused(e, [{ transform: `rotateY(${(-LO * step).toFixed(3)}deg)` }, { transform: `rotateY(${(-HI * step).toFixed(3)}deg)` }], 'add'));
    const ct = (clamp(v, LO, HI) - LO) * 1000;
    for (const a of adds) a.currentTime = ct;
  };
  /** The shown index on screen: the (edge-on) cards that wrap change lap; then the offset or the turn. */
  const render = (force = false) => {
    if (wraps) {
      for (let j = 0; j < n; j++) {
        const c = order[j] as HTMLElement;
        const sl = slotFor(j, p);
        if (slot.get(c) !== sl) placeCard(c, sl);
      }
    }
    if (sd) {
      if (!force && o === renderedO) return;
      renderedO = o;
      setAdd(o);
      return;
    }
    if (!force && p === renderedP) return;
    renderedP = p;
    const ct = (clamp(p, LO, HI) - LO) * 1000;
    for (const a of turns) a.currentTime = ct;
  };
  const placeAll = () => {
    for (let j = 0; j < n; j++) placeCard(order[j] as HTMLElement, slotFor(j, p));
    render(true);
  };

  /** The rim along the base of the ring, through the projected bottom points of the cylinder (static). */
  const drawRim = () => {
    const cx = viewW / 2;
    const yE = EYE * H;
    const edge = Math.acos(R / (R + P)); // the silhouette seen from the eye
    let d = '';
    const N = 64;
    for (let k = 0; k <= N; k++) {
      const th = -edge + (2 * edge * k) / N;
      const f = P / (P + R * (1 - Math.cos(th)));
      d += `${k ? 'L' : 'M'}${(cx + R * Math.sin(th) * f).toFixed(1)} ${(yE + (H - yE) * f).toFixed(1)}`;
    }
    rim.setAttribute('viewBox', `0 0 ${Math.round(viewW)} ${H}`);
    for (const path of rimPaths) path.setAttribute('d', d);
  };

  /** Reads the window and the scene, then (only if something changed) writes the scale. */
  const geometry = (): boolean => {
    const vw = document.documentElement.clientWidth;
    const base = vw <= PHONE_MAX ? PHONE : DESK;
    const sceneH = scene.clientHeight;
    const wNow = ring.clientWidth;
    navH = parseFloat(getComputedStyle(stage).top) || 0;
    stageH = stage.offsetHeight;
    const sNew = Math.max(S_MIN, Math.min(clamp(vw / base.vw, SW_MIN, S_MAX), sceneH / (NEED * base.h)));
    if (R && base.step === step && Math.abs(sNew - s) < 0.004 && wNow === viewW) return false;
    const stepChanged = base.step !== step;
    s = sNew;
    step = base.step;
    viewW = wNow;
    W = Math.round(base.w * s);
    H = Math.round(base.h * s);
    R = base.r * s;
    P = base.persp * s;
    arena.style.setProperty('--arena-w', `${W}px`);
    arena.style.setProperty('--arena-h', `${H}px`);
    ring.style.perspective = `${P.toFixed(1)}px`;
    mirror.style.perspective = ring.style.perspective;
    // the stand-ins' frame: the near part of the card's mirror image (its bottom corners on top), in pixels
    const gw = W;
    const gh = Math.round(H * GHOST);
    const r = Math.min(RADIUS, gw / 2);
    const d = `M0.5 ${gh}V${r + 0.5}A${r} ${r} 0 0 1 ${r + 0.5} 0.5H${gw - r - 0.5}A${r} ${r} 0 0 1 ${gw - 0.5} ${r + 0.5}V${gh}`;
    for (const path of ghostPaths) {
      path.setAttribute('d', d);
      path.parentElement?.setAttribute('viewBox', `0 0 ${gw} ${gh}`);
    }
    grid.dataset.arenaStep = String(step);
    if (stepChanged) wraps = n > 1 && n * step >= 180 - 1e-6;
    drawRim();
    buildTurn();
    return true;
  };

  // ---- headline + pager ----
  const stopDecode = (e: HTMLElement) => {
    decode(e, { duration: 0 }); // takes over a run in flight and resolves at once
    delete e.dataset.decode;
  };
  const setKind = (text: string, animate: boolean) => {
    kind.textContent = text;
    if (animate && !still && !root.classList.contains('is-no-decode')) {
      decode(kind, { duration: KIND_MS }).then(() => {
        // decode.ts leaves data-decode="done" behind; this line decodes again on every settle
        if (kind.dataset.decode === 'done') delete kind.dataset.decode;
      });
    } else stopDecode(kind);
  };
  /** The settled headline: once per settle on a new card, a 200ms fade + 8px rise and the kind line decoded. */
  const showSettled = (idx: number, animate: boolean) => {
    settled = idx;
    previewing = -1;
    title.textContent = titles[idx] ?? '';
    setKind(lines[idx] ?? '', animate);
    if (animate && !still) line.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: SWAP_MS, easing: EASE_OUT });
  };
  /** A hover preview (or its end): an instant swap, no animation, no decode. */
  const preview = (idx: number) => {
    const show = idx >= 0 && idx !== settled ? idx : -1;
    if (show === previewing) return;
    previewing = show;
    const i = show >= 0 ? show : settled;
    title.textContent = titles[i] ?? '';
    kind.textContent = lines[i] ?? '';
    stopDecode(kind);
  };
  const setHover = (c: HTMLElement | null) => {
    if (c === hoverCard) return;
    hoverCard?.classList.remove('is-hover');
    hoverCard = c;
    c?.classList.add('is-hover');
    preview(c ? cards.indexOf(c) : -1);
  };

  const buildTicks = () => {
    tickEls = order.map(() => el('i', 'arena__tick'));
    strip.replaceChildren(...tickEls, marker);
    totalEl.textContent = pad2(n);
    onTick = -1;
  };
  const setActive = (idx: number) => {
    if (idx === active) return;
    cards[active]?.classList.remove('is-active');
    ghosts[active]?.classList.remove('is-active');
    const next = cards[idx];
    active = next ? idx : -1;
    if (!next) return;
    next.classList.add('is-active');
    ghosts[idx]?.classList.add('is-active');
    grid.dataset.arenaActive = String(idx + 1);
    const pos = posOf(next);
    count.textContent = pad2(pos + 1);
    if (onTick >= 0) tickEls[onTick]?.classList.remove('is-on');
    tickEls[pos]?.classList.add('is-on');
    onTick = pos;
    marker.style.setProperty('--pos', String(pos));
  };
  const front = () => {
    const c = cardAt(p);
    if (c) setActive(cards.indexOf(c));
  };
  const setTabStop = (c: HTMLElement | undefined) => {
    const b = c ? buttons[cards.indexOf(c)] : null;
    if (!b || b === tabStop) return;
    if (tabStop) tabStop.tabIndex = -1;
    b.tabIndex = 0;
    tabStop = b;
  };

  // ---- the loop ----
  const goLive = () => {
    if (grid.dataset.arenaLoop !== 'live') {
      grid.dataset.arenaLoop = 'live';
      delete grid.dataset.arenaP;
    }
    if (hoverCard) setHover(null);
  };
  const goIdle = () => {
    if (grid.dataset.arenaLoop !== 'idle') grid.dataset.arenaLoop = 'idle';
    const pv = (wraps ? mod(p, n) : p).toFixed(3);
    if (grid.dataset.arenaP !== pv) grid.dataset.arenaP = pv;
    dest = null;
    const c = cardAt(p);
    const idx = c ? cards.indexOf(c) : -1;
    if (idx >= 0 && idx !== settled) showSettled(idx, settled >= 0);
    setTabStop(c);
  };
  let drag: { id: number; x0: number; y0: number; p0: number; p: number; on: boolean; samples: [number, number][] } | null = null;
  const frame = (now: number) => {
    raf = 0;
    const dt = last ? Math.min(50, now - last) : 1000 / 60;
    const prev = p;
    t = target();
    if (drag?.on) {
      o = wraps ? distance(t, drag.p) : drag.p - t;
    } else {
      if (jumpFrom !== null) o = distance(t, jumpFrom); // scroll-driven: the base jumped with the page, the picture stays
      else if (!sd) o = distance(t, p); // loop: the shown index trails the scroll
      jumpFrom = null;
      if (still || !onScreen || Math.abs(o) < SETTLE) o = 0;
      else o *= Math.pow(1 - LERP, dt / (1000 / 60));
    }
    p = t + o;
    if (Math.abs(p - Math.round(p)) < 1e-6) p = Math.round(p);
    render();
    front();
    if (drag?.on) {
      last = 0;
      goLive();
      return; // the next pointer move schedules the next frame
    }
    if (o !== 0) {
      last = now;
      goLive();
      raf = requestAnimationFrame(frame);
      return;
    }
    last = 0;
    // scroll-driven: turning with the page, the settle waits for the scroll to stop (a plateau is not a stop)
    if (sd && scrollTimer) {
      if (p !== prev) goLive();
      return;
    }
    goIdle();
  };
  const schedule = () => {
    if (!raf) raf = requestAnimationFrame(frame);
  };
  /** Snap p to the scroll without inertia (mount, off screen, reduced motion). */
  const sync = () => {
    t = target();
    p = t;
    o = 0;
    jumpFrom = null;
    last = 0;
    render(true);
    front();
    goIdle();
  };

  /**
   * Bring card idx (0-based over all cards) to the front: scroll the page to its offset — instantly while the
   * stage is pinned (invisible behind it; the ring turns the short way), smoothly to travel into the pin.
   */
  const goTo = (idx: number) => {
    const pos = posOf(cards[idx]);
    if (pos < 0) return;
    dest = idx;
    if (performance.now() - measuredAt > 150) measure();
    const top = Math.round(offsetOf(pos));
    const smooth = !still && !pinned();
    if (Math.abs(top - window.scrollY) > 0.5) {
      if (sd && !smooth) jumpFrom = p; // the scroll-linked turn jumps with the page: the next frame keeps the picture
      window.scrollTo({ top, behavior: smooth ? 'smooth' : 'instant' });
    }
    schedule();
  };

  // ---- the ring: which cards, where; a filter glides the survivors to their new angles ----
  const glide = (moves: [HTMLElement, number, number][]) => {
    grid.classList.add('is-reflow');
    ring.classList.add('is-reflow');
    for (const [c, from, to] of moves) {
      if (Math.abs(from - to) < 0.01) continue;
      const kf = (a: number, flip: string) => ({ transform: `rotateY(${a.toFixed(3)}deg) translateZ(${R.toFixed(2)}px)${flip}` });
      c.animate([kf(from, ''), kf(to, '')], { duration: GLIDE_MS, easing: EASE_OUT });
      ghostOf(c)?.animate([kf(from, ''), kf(to, '')], { duration: GLIDE_MS, easing: EASE_OUT });
    }
    window.clearTimeout(glideTimer);
    glideTimer = window.setTimeout(() => {
      grid.classList.remove('is-reflow');
      ring.classList.remove('is-reflow');
    }, GLIDE_MS);
  };
  const rebuild = (animate: boolean) => {
    const prevOrder = order;
    const prevP = p;
    const prevActive = active;
    const prevSlots = new Map(slot);
    // pinned or not is a question about the track as it was: the new span may already end above the scroll
    if (performance.now() - measuredAt > 150) measure();
    const wasPinned = pinned();
    order = cards.filter((c) => !c.hidden && !c.classList.contains('is-out'));
    n = order.length;
    wraps = n > 1 && n * step >= 180 - 1e-6;
    span = spanFor(n);
    track.style.height = `${span}px`;
    grid.dataset.arenaN = String(n);
    buildTicks();
    // the previous front card and its reflection lose their light before anything is re-chosen
    cards[prevActive]?.classList.remove('is-active');
    ghosts[prevActive]?.classList.remove('is-active');
    active = -1;
    if (n === 0) return;
    measure();
    // the card that stays in front: the same one if it is still in the ring, else the nearest that is
    let keep = posOf(cards[prevActive]);
    if (keep < 0) {
      let best = Infinity;
      order.forEach((c, j) => {
        const dist = Math.abs(cards.indexOf(c) - prevActive);
        if (dist < best) {
          best = dist;
          keep = j;
        }
      });
    }
    if (wasPinned) {
      if (animate) window.scrollTo({ top: Math.round(offsetOf(keep)), behavior: 'instant' }); // re-anchor: invisible behind the stage
    } else keep = clamp(Math.round(target()), 0, n - 1);
    p = keep;
    t = keep;
    o = 0;
    jumpFrom = null;
    last = 0;
    const moves: [HTMLElement, number, number][] = [];
    for (let j = 0; j < n; j++) {
      const c = order[j] as HTMLElement;
      const sl = slotFor(j, p);
      const was = prevSlots.get(c);
      if (animate && was !== undefined && prevOrder.includes(c)) moves.push([c, (was - prevP + p) * step, sl * step]);
      placeCard(c, sl);
    }
    // leaving cards fade out where they are seen
    for (const c of prevOrder) {
      const was = prevSlots.get(c);
      if (!order.includes(c) && was !== undefined) placeCard(c, was - prevP + p);
    }
    render(true);
    if (!animate) return; // the mount: sync() picks the front card from the scroll
    if (moves.length) glide(moves);
    front();
    goIdle();
  };

  // stand-ins follow their cards through a filter (is-out fade, then hidden)
  new MutationObserver((muts) => {
    for (const m of muts) {
      const c = m.target as HTMLElement;
      const g = ghostOf(c);
      if (!g) continue;
      g.hidden = c.hidden;
      g.classList.toggle('is-out', c.classList.contains('is-out'));
    }
  }).observe(grid, { attributes: true, attributeFilter: ['hidden', 'class'], childList: false, subtree: true });
  grid.addEventListener('cases:filter', () => rebuild(true));

  // ---- input ----
  // a pointer click on a side card turns the ring; on the front (or destination) card it opens the sheet.
  // A click without a pointer (detail 0: keyboard, screen reader) always opens; the ring turns behind the sheet.
  grid.addEventListener(
    'click',
    (e) => {
      const card = (e.target as Element).closest<HTMLElement>('.case');
      if (!card) return;
      const idx = cards.indexOf(card);
      pointerCard = null;
      if (performance.now() < suppressUntil) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      if (e.detail === 0) {
        if (idx !== destIdx()) goTo(idx);
        return;
      }
      if (idx === destIdx()) return;
      e.preventDefault();
      e.stopPropagation();
      goTo(idx);
    },
    true,
  );
  // focus that does not come from a pointer press (assistive tech, the sheet's focus return) brings the card in
  grid.addEventListener('focusin', (e) => {
    const card = (e.target as Element).closest<HTMLElement>('.case');
    if (!card || card === pointerCard || keyNav) return;
    setTabStop(card);
    const idx = cards.indexOf(card);
    if (idx !== destIdx()) goTo(idx);
  });
  // ← / → / Home / End move the focus and the ring together
  grid.addEventListener('keydown', (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey || e.isComposing) return;
    const card = (e.target as Element).closest<HTMLElement>('.case');
    let pos = posOf(card ?? undefined);
    if (pos < 0) return;
    if (e.key === 'ArrowRight') pos += 1;
    else if (e.key === 'ArrowLeft') pos -= 1;
    else if (e.key === 'Home') pos = 0;
    else if (e.key === 'End') pos = n - 1;
    else return;
    e.preventDefault();
    const next = order[wraps ? mod(pos, n) : clamp(pos, 0, n - 1)];
    if (!next) return;
    setTabStop(next);
    keyNav = true;
    buttons[cards.indexOf(next)]?.focus({ preventScroll: true });
    keyNav = false;
    goTo(cards.indexOf(next));
  });
  // the tick strip is one pointer target: x → the nearest tick
  strip.addEventListener('click', (e) => {
    if (!n) return;
    const r = strip.getBoundingClientRect();
    const pitch = parseFloat(getComputedStyle(strip).getPropertyValue('--arena-tick')) || 10;
    const card = order[clamp(Math.floor((e.clientX - r.left) / pitch), 0, n - 1)];
    if (card) goTo(cards.indexOf(card));
  });

  // press feedback: scale .98 in 140ms on top of the placement, released by playing it back
  const release = () => {
    const a = press;
    press = null;
    if (!a) return;
    a.reverse();
    a.finished.then(
      () => a.cancel(),
      () => {},
    );
  };
  grid.addEventListener('pointerdown', (e) => {
    if (!e.isPrimary || (e.pointerType === 'mouse' && e.button !== 0)) return;
    const card = (e.target as Element).closest<HTMLElement>('.case');
    if (!card) return;
    pointerCard = card; // the focus this press gives the button must not turn the ring; the click decides
    window.clearTimeout(pointerTimer);
    pointerTimer = window.setTimeout(() => (pointerCard = null), 1000);
    release();
    press = card.animate([{ transform: 'scale(1)' }, { transform: 'scale(0.98)' }], { duration: PRESS_MS, easing: EASE_OUT, fill: 'forwards', composite: 'add' });
  });
  window.addEventListener('pointerup', release, { passive: true });
  window.addEventListener('pointercancel', release, { passive: true });

  // drag: only while the stage is pinned; the ring follows the pointer, the page moves once on release
  scene.addEventListener('pointerdown', (e) => {
    if (!e.isPrimary || (e.pointerType === 'mouse' && e.button !== 0) || n < 2) return;
    if (performance.now() - measuredAt > 150) measure();
    if (!pinned()) return;
    drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, p0: p, p, on: false, samples: [[performance.now(), e.clientX]] };
  });
  scene.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x0;
    const dy = e.clientY - drag.y0;
    if (!drag.on) {
      if (Math.abs(dx) < DRAG_SLOP || Math.abs(dx) < Math.abs(dy)) return;
      drag.on = true;
      dest = null;
      release();
      setHover(null);
      try {
        scene.setPointerCapture(e.pointerId);
      } catch {
        /* the pointer may be gone already */
      }
      grid.classList.add('is-dragging');
    }
    e.preventDefault();
    const now = performance.now();
    drag.samples.push([now, e.clientX]);
    while (drag.samples.length > 2 && now - (drag.samples[0]?.[0] ?? now) > 100) drag.samples.shift();
    const v = drag.p0 - dx / DRAG_PX;
    drag.p = wraps ? v : v < 0 ? v * RUBBER : v > n - 1 ? n - 1 + (v - (n - 1)) * RUBBER : v;
    schedule();
  });
  const endDrag = (e: PointerEvent) => {
    if (!drag || e.pointerId !== drag.id) return;
    const d = drag;
    drag = null;
    if (!d.on) return;
    grid.classList.remove('is-dragging');
    suppressUntil = performance.now() + 300; // the click that follows a drag is not a click
    const first = d.samples[0];
    const lastS = d.samples[d.samples.length - 1];
    const dt = first && lastS ? lastS[0] - first[0] : 0;
    const vel = first && lastS && dt > 0 ? (lastS[1] - first[1]) / dt : 0; // px/ms, right positive
    const pos = Math.round(d.p - (vel * FLICK_MS) / DRAG_PX);
    const card = order[wraps ? mod(pos, n) : clamp(pos, 0, n - 1)];
    if (card) goTo(cards.indexOf(card));
    schedule();
  };
  scene.addEventListener('pointerup', endDrag);
  scene.addEventListener('pointercancel', endDrag);

  // hover: only a real pointer move counts (cards sliding under a resting pointer are not a hover)
  if (fine) {
    let lastXY = '';
    grid.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const xy = `${e.clientX},${e.clientY}`;
      if (xy === lastXY) return;
      lastXY = xy;
      if (drag?.on || grid.dataset.arenaLoop === 'live') return;
      setHover((e.target as Element).closest<HTMLElement>('.case'));
    });
    grid.addEventListener('pointerleave', () => setHover(null));
  }

  // ---- scroll, resize, visibility ----
  let scrollTimer = 0;
  window.addEventListener(
    'scroll',
    () => {
      if (!onScreen) return;
      if (!scrollTimer) measure(); // the first scroll after a pause re-reads the spacer (content above may have moved)
      window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(() => {
        scrollTimer = 0;
        if (sd) schedule(); // the scroll has stopped: the settle
      }, SCROLL_IDLE_MS);
      schedule();
    },
    { passive: true },
  );
  // a resize keeps the card in front; a change that leaves the scene as it was (a phone's URL bar) changes nothing
  let resizeRaf = 0;
  const relayout = () => {
    resizeRaf = 0;
    const keep = cards[active];
    const wasPinned = pinned();
    const changed = geometry();
    measure();
    if (!changed) return schedule();
    placeAll();
    const pos = posOf(keep);
    if (wasPinned && pos >= 0) {
      if (sd) jumpFrom = p;
      window.scrollTo({ top: Math.round(offsetOf(pos)), behavior: 'instant' });
    }
    schedule();
  };
  const onResize = () => {
    if (!resizeRaf) resizeRaf = requestAnimationFrame(relayout);
  };
  window.addEventListener('resize', onResize, { passive: true });
  if ('ResizeObserver' in window) new ResizeObserver(onResize).observe(scene);
  if ('fonts' in document) document.fonts.ready.then(onResize);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(
      (entries) => {
        for (const e of entries) onScreen = e.isIntersecting;
        if (onScreen) {
          measure();
          schedule();
        }
        else if (raf) {
          cancelAnimationFrame(raf);
          raf = 0;
          sync();
        }
      },
      { threshold: 0 },
    ).observe(root);
  }
  // reduced motion switched on later: no inertia, no decode, no swaps
  rm.addEventListener('change', () => {
    still = rm.matches;
    if (still) sync();
  });
  // the sheet's deep link (and a later hashchange): the ring comes to that case too
  window.addEventListener('hashchange', () => {
    const m = HASH.exec(location.hash);
    if (m) goTo(Number(m[1]) - 1);
  });

  // ---- go ----
  // #case-N: the sheet opens on it (case-sheet.ts) and the ring comes to it. The browser keeps re-scrolling to the
  // card's element on every layout until `load`; inside a pinned stage each of those scrolls would push the target
  // down the track, so the stage stays in flow (.is-booting) until the page has loaded.
  const m = HASH.exec(location.hash);
  const deep = m ? Number(m[1]) - 1 : -1;
  const land = () => {
    root.classList.remove('is-booting');
    geometry(); // the stage is sticky again: its top (the header's height) counts for the pin
    measure();
    const pos = posOf(cards[deep]);
    if (pos >= 0) window.scrollTo({ top: Math.round(offsetOf(pos)), behavior: 'instant' });
    measure();
    sync();
  };
  const linked = deep >= 0 && deep < cards.length;
  const booting = linked && document.readyState !== 'complete';
  // geometry and placement in the first frame (reads, then writes); a rAF queued later runs after it
  requestAnimationFrame(() => {
    geometry();
    rebuild(false);
    sync();
    if (linked && !booting) land();
  });
  if (booting) {
    root.classList.add('is-booting');
    window.addEventListener('load', () => requestAnimationFrame(land), { once: true });
  }
  onceInView(arena, () => arena.classList.add('is-in'));
}
