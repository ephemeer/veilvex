import { $, $$, EASE_OUT, clamp, easeOut, finePointer, onceInView, reduceMotion } from './util';
import { decode } from './decode';
import { expandCases } from './cases';

/**
 * The case arena (reference: emotion-agency /projects) — the Cases grid rebuilt as a ring of neon frames on
 * a cylinder seen from outside, CSS 3D only. Progressive: it takes the server-rendered `<li class="case">`
 * cards (sheet opener, hover data sheet, filter type) and re-places them; without JS or under reduced motion
 * nothing runs and the grid stays. Layout and look live in Cases.astro (`<style is:global>`).
 *
 * Geometry: angle = (i − p) × step, step = clamp(360°/n, 30°, 60°), radius 460px (phones 345px), eye 1400px.
 * Each card and its reflection stand-in carries `--i`; the stylesheet places them from the ring's `--p`
 * (continuous active index) at rest. In motion the placement runs on the compositor: every element has one
 * paused, linear WAAPI animation sweeping rotateY from −540° to 540° and the script scrubs its currentTime
 * (an inline transform per element per frame would be matched against the whole stylesheet and recompute
 * overflow every frame — measured at 4–5ms; a `--p` change on the ring would restyle its ~1000 nodes).
 * `--p` is written back once the loop settles, so the resting state is readable.
 *
 * One source of truth: the page scroll. The section is tall enough to scroll 180px per case (min 1600px);
 * while the stage is pinned, progress → target index t; the shown p follows t with inertia (lerp 0.12 per
 * 60fps frame, the short way round on a closed ring, rAF only while |p − t| ≥ 0.002). A drag (1 case per
 * 120px, momentum on release), ← / →, a pagination tick, a click on a side card, keyboard focus on a card
 * and a #case-N hash all just scroll the page to that index's offset; the ring follows through the same
 * path, and once scrolling stops between two cards the page settles on the nearest one. A click on the
 * active (or destination) card falls through to the sheet opener.
 *
 * Headline (bottom-left): ↳ + the active title, decoded (decode.ts, 450ms) and slid 12px up behind a clip
 * while the glyph scales .9 → 1 (300ms ease-out), plus a mono "kind · tags" line crossfading 200ms. Hover
 * previews a card's headline; leaving restores the active one. Pagination (bottom centre): position, one
 * tick button per visible case (aria-label "<kicker> N: title"), a frame sliding to the active tick, total.
 *
 * Filters (cases.ts dispatches `cases:filter`): the leaving cards fade with their existing `is-out`, the rest
 * glide to their new angles (400ms ease-out, `.is-reflow` while it runs), ticks/counter/total rebuild.
 *
 * Test hooks on the ring <ul>: data-arena-active (1-based case number), data-arena-loop (live | idle);
 * `--p` (at rest), `--n`, `--step` readable from its computed style. `.cases.is-no-decode` skips the decode.
 */
const PX_PER_CASE = 180;
const SPAN_MIN = 1600;
const DRAG_PX = 120; // px of pointer travel per case
const DRAG_SLOP = 6;
const FLICK_MS = 160; // momentum: how far the release velocity carries, in ms of travel
const LERP = 0.12; // per 60fps frame
const SETTLE = 0.002;
const DECODE_MS = 450;
const SWAP_MS = 300;
const REFLOW_MS = 400;
const PRESS_MS = 140;
const SNAP_MS = 280; // idle time after the last scroll event before the page settles on a card
const STEP_MIN = 30;
const STEP_MAX = 60;
const SWEEP = 540; // degrees either side of 0 covered by an element's placement animation
const SWEEP_MS = 100_000; // its (arbitrary) timeline length: the script scrubs currentTime
const HASH = /^#case-(\d{1,2})$/;

const pad2 = (n: number) => String(n).padStart(2, '0');
const svgEl = <K extends keyof SVGElementTagNameMap>(name: K, attrs: Record<string, string>): SVGElementTagNameMap[K] => {
  const el = document.createElementNS('http://www.w3.org/2000/svg', name);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
};
const el = <K extends keyof HTMLElementTagNameMap>(name: K, className: string, attrs: Record<string, string> = {}): HTMLElementTagNameMap[K] => {
  const e = document.createElement(name);
  e.className = className;
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  return e;
};

export function initArena(): void {
  const root = $('[data-cases-root]');
  const stage = root ? $('[data-arena-stage]', root) : null;
  const track = root ? $('[data-arena-track]', root) : null;
  const grid = root ? $<HTMLElement>('[data-cases]', root) : null;
  if (!root || !stage || !track || !grid || reduceMotion()) return;
  if (typeof CSS === 'undefined' || !CSS.supports('transform-style', 'preserve-3d') || !CSS.supports('perspective', '1px')) return;
  if (typeof Element.prototype.animate !== 'function') return;
  const cards = $$<HTMLElement>('.case', grid);
  if (cards.length < 2) return;
  const total = cards.length;
  const fine = finePointer();
  const kicker = $('[data-sheet]')?.dataset.sheetKicker ?? '';
  const groupLabel = $('[data-filters]')?.getAttribute('aria-label') ?? kicker;

  // ---- content read once from the cards (titles, kinds, tags) ----
  const titleOf = (c: HTMLElement) => $('.case__open', c)?.textContent?.trim() ?? '';
  const kindOf = (c: HTMLElement) => $('.case__fact dd', c)?.textContent?.trim() ?? '';
  const tagsOf = (c: HTMLElement) => $('.case__tags', c)?.textContent?.trim() ?? '';
  const titles = cards.map(titleOf);
  const lines = cards.map((c) => `${kindOf(c)} · ${tagsOf(c)}`);

  // ---- the stage chrome ----
  expandCases(); // phones: every card is in the ring, the "show all" button is irrelevant
  for (const c of cards) {
    // the cards' own reveal would animate `transform` over the 3D placement; the arena enters as one object
    c.classList.remove('reveal', 'is-in');
    c.style.removeProperty('--d');
  }
  const rays = svgEl('svg', { class: 'arena__rays', viewBox: '0 0 100 100', preserveAspectRatio: 'none', 'aria-hidden': 'true', focusable: 'false' });
  for (const x of [4, 19, 34, 50, 66, 81, 96]) rays.append(svgEl('line', { x1: '50', y1: '0', x2: String(x), y2: '100' }));
  const beam = el('i', 'arena__beam', { 'aria-hidden': 'true' });
  stage.prepend(rays, beam);

  const arena = el('div', 'arena', { 'data-arena': '' });
  const scene = el('div', 'arena__scene', { 'data-arena-scene': '' });
  const ring = el('div', 'arena__ring');
  const floor = el('i', 'arena__floor', { 'aria-hidden': 'true' });
  const horizon = el('i', 'arena__horizon', { 'aria-hidden': 'true' });
  const mirror = el('div', 'arena__mirror', { 'aria-hidden': 'true', 'data-arena-mirror': '' });
  const ghosts = cards.map((c, i) => {
    const g = el('div', 'arena__ghost');
    const art = $('.case__art svg', c)?.cloneNode(true) as SVGSVGElement | undefined;
    if (art) {
      // the clone's <defs> ids must stay unique in the document: prefix them and their url(#…) uses
      for (const node of $$<SVGElement>('[id]', art)) {
        const id = node.id;
        node.id = `m${i}-${id}`;
        for (const user of $$<SVGElement>(`[fill="url(#${id})"]`, art)) user.setAttribute('fill', `url(#${node.id})`);
      }
      g.append(art);
    }
    g.hidden = c.hidden;
    return g;
  });
  mirror.append(...ghosts);
  grid.replaceWith(arena);
  ring.append(floor, horizon, grid, mirror);
  scene.append(ring);

  const foot = el('div', 'arena__foot');
  const headline = el('div', 'arena__headline', { 'data-arena-headline': '' });
  const glyph = svgEl('svg', { class: 'arena__glyph', 'aria-hidden': 'true', focusable: 'false' });
  glyph.append(svgEl('use', { href: '#i-arrow-turn' }));
  const titleBox = el('div', 'arena__title');
  const line = el('h3', 'arena__title-line', { 'data-arena-line': '' }); // slides as one: ↳ + the text
  const title = el('span', 'arena__title-text', { 'data-arena-title': '' }); // the decoded run
  line.append(glyph, title);
  titleBox.append(line);
  const kind = el('p', 'arena__kind', { 'data-arena-kind': '' });
  const kindLayers = [el('span', 'is-on'), el('span', '')];
  kind.append(...kindLayers);
  headline.append(titleBox, kind);
  const pager = el('div', 'arena__pager', { 'data-arena-pager': '' });
  const count = el('span', 'arena__count', { 'data-arena-cur': '' });
  const ticks = el('div', 'arena__ticks', { role: 'group', 'aria-label': groupLabel, 'data-arena-ticks': '' });
  const marker = el('i', 'arena__marker', { 'aria-hidden': 'true' });
  const totalEl = el('span', 'arena__total', { 'data-arena-total': '' });
  pager.append(count, ticks, totalEl);
  foot.append(headline, pager);
  arena.append(scene, foot);

  grid.classList.add('is-arena');
  root.classList.add('is-arena');
  const span = Math.max(SPAN_MIN, total * PX_PER_CASE);
  root.style.setProperty('--arena-span', `${span}px`);

  // ---- state ----
  let order: HTMLElement[] = []; // the visible cards, DOM order — the ring
  let n = 0;
  let step = STEP_MIN;
  let closed = false; // n × step = 360°: the last card stands next to the first
  let p = 0; // shown index (continuous)
  let t = 0; // target index from the scroll
  let active = -1; // card index (0-based, over all cards) at the front
  let shown = -1; // card index the headline shows (a hover preview may differ from active)
  let dest: number | null = null; // card index the last goTo() asked for
  let pinStart = 0; // scrollY at which the stage starts to stick (progress 0)
  let radius = 0; // --arena-r in px (per breakpoint)
  let raf = 0;
  let measuredAt = -Infinity;
  let onScreen = true;
  let hovering = false;
  let tickButtons: HTMLButtonElement[] = [];
  let kindOn = 0;
  let suppressUntil = 0;

  const setLoop = (s: 'live' | 'idle') => {
    if (grid.dataset.arenaLoop !== s) grid.dataset.arenaLoop = s;
  };

  /** Where the stage starts sticking: one rect read of the never-sticky spacer (on resize, fonts, scroll start). */
  const measure = () => {
    const navH = parseFloat(getComputedStyle(stage).top) || 0;
    pinStart = track.getBoundingClientRect().top + window.scrollY - stage.offsetHeight - navH;
    measuredAt = performance.now();
  };
  const positionOf = (card: HTMLElement) => order.indexOf(card);
  const offsetOf = (pos: number) => pinStart + (n > 1 ? (span * clamp(pos, 0, n - 1)) / (n - 1) : 0);
  const targetFromScroll = () => (n > 1 ? clamp((window.scrollY - pinStart) / span) * (n - 1) : 0);
  const pinned = () => {
    const y = window.scrollY;
    return y > pinStart && y < pinStart + span;
  };

  // ---- placement: one paused compositor animation per element, scrubbed by angle ----
  const placements = new Map<HTMLElement, Animation>();
  const angleOf = (pos: number, v: number) => clamp((pos - v) * step, -SWEEP, SWEEP);
  const timeOf = (angle: number) => ((angle + SWEEP) / (2 * SWEEP)) * SWEEP_MS;
  const currentAngle = (e: HTMLElement) => {
    const a = placements.get(e);
    const ms = typeof a?.currentTime === 'number' ? a.currentTime : SWEEP_MS / 2;
    return (ms / SWEEP_MS) * 2 * SWEEP - SWEEP;
  };
  const setAngle = (e: HTMLElement, angle: number) => {
    const a = placements.get(e);
    if (a) a.currentTime = timeOf(angle);
  };
  /** (Re)creates the placement animations for the current radius, keeping each element's angle. */
  const mount = () => {
    const r = parseFloat(getComputedStyle(root).getPropertyValue('--arena-r')) || 460;
    if (r === radius) return;
    radius = r;
    const tf = (angle: number, flip: boolean) => `translateZ(${-r}px) rotateY(${angle}deg) translateZ(${r}px)${flip ? ' scaleY(-1)' : ''}`;
    cards.forEach((c, i) => {
      for (const [e, flip] of [[c, false], [ghosts[i], true]] as [HTMLElement | undefined, boolean][]) {
        if (!e) continue;
        const angle = placements.has(e) ? currentAngle(e) : 0;
        placements.get(e)?.cancel();
        const a = e.animate([{ transform: tf(-SWEEP, flip) }, { transform: tf(SWEEP, flip) }], { duration: SWEEP_MS, easing: 'linear', fill: 'both' });
        a.pause();
        a.currentTime = timeOf(angle);
        placements.set(e, a);
      }
    });
  };
  let reflowing = false;
  const place = (v: number) => {
    if (reflowing) return; // the glide tween owns the angles until it lands
    for (let pos = 0; pos < order.length; pos++) {
      const c = order[pos] as HTMLElement;
      const angle = angleOf(pos, v);
      setAngle(c, angle);
      const g = ghosts[cards.indexOf(c)];
      if (g) setAngle(g, angle);
    }
  };
  const settle = (v: number) => {
    // a custom-property write on the ring restyles its whole subtree (~7ms): only when the value moved
    // (a resize or the sheet's scroll-lock padding re-syncs the ring without changing p)
    const next = v.toFixed(3);
    if (ring.style.getPropertyValue('--p') !== next) ring.style.setProperty('--p', next);
  };

  // ---- headline + pagination ----
  const showHeadline = (idx: number, animate = true) => {
    if (idx === shown || idx < 0) return;
    shown = idx;
    title.textContent = titles[idx] ?? '';
    const skip = root.classList.contains('is-no-decode');
    if (animate && !skip) {
      decode(title, { duration: DECODE_MS }).then(() => {
        // decode.ts leaves data-decode="done" behind; this title is decoded on every change, so the
        // attribute goes once the run is over (a run taken over by the next one keeps the new one's)
        if (title.dataset.decode === 'done') delete title.dataset.decode;
      });
    } else delete title.dataset.decode;
    // the slide plays once per arrival: while the ring spins through several cards the text keeps
    // re-decoding in place (a restart from opacity 0 on every change would leave the line blank)
    if (animate && line.getAnimations().length === 0) {
      line.animate([{ transform: 'translateY(12px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: SWAP_MS, easing: EASE_OUT });
      glyph.animate([{ transform: 'scale(0.9)', opacity: 0.6 }, { transform: 'none', opacity: 1 }], { duration: SWAP_MS, easing: EASE_OUT });
    }
    const next = kindLayers[1 - kindOn];
    const cur = kindLayers[kindOn];
    if (next && cur) {
      next.textContent = lines[idx] ?? '';
      cur.classList.remove('is-on');
      next.classList.add('is-on');
      kindOn = 1 - kindOn;
    }
  };

  const buildTicks = () => {
    tickButtons = order.map((card, pos) => {
      const idx = cards.indexOf(card);
      return el('button', 'arena__tick', { type: 'button', 'aria-label': `${kicker} ${idx + 1}: ${titles[idx] ?? ''}`, 'data-arena-tick': String(idx + 1), 'data-arena-pos': String(pos) });
    });
    ticks.replaceChildren(...tickButtons, marker);
    totalEl.textContent = pad2(n);
  };

  const setActive = (idx: number, animateHeadline = true) => {
    if (idx === active) return;
    const prev = cards[active];
    const next = cards[idx];
    if (!next) return;
    prev?.classList.remove('is-active');
    ghosts[active]?.classList.remove('is-active');
    next.classList.add('is-active');
    ghosts[idx]?.classList.add('is-active');
    active = idx;
    grid.dataset.arenaActive = String(idx + 1);
    const pos = positionOf(next);
    count.textContent = pad2(pos + 1);
    tickButtons.forEach((b, k) => {
      if (k === pos) b.setAttribute('aria-current', 'true');
      else b.removeAttribute('aria-current');
    });
    marker.style.transform = `translateX(${pos * 10}px)`;
    if (!hovering) showHeadline(idx, animateHeadline);
  };

  // ---- the frame loop ----
  /** The card at the front for a shown p (the ring is cyclic when its steps close the circle). */
  const frontCard = (v: number) => order[closed ? ((Math.round(v) % n) + n) % n : clamp(Math.round(v), 0, n - 1)] as HTMLElement;
  /** Signed distance from p to t — the short way round on a closed ring (card 12 is one step left of card 1). */
  const distance = (from: number, to: number) => {
    const d = to - from;
    return closed ? ((((d + n / 2) % n) + n) % n) - n / 2 : d;
  };
  /** A settled target: an integer scroll position cannot hit a fractional offset exactly, so a value within
   *  half a pixel of a card (|Δ| < 0.004 of a step) reads as that card. */
  const quantise = (v: number) => (Math.abs(v - Math.round(v)) < 0.004 ? Math.round(v) : v);
  let last = 0;
  const frame = (now: number) => {
    raf = 0;
    t = targetFromScroll();
    const d = distance(p, t);
    if (Math.abs(d) < SETTLE || !onScreen || reflowing) {
      p = quantise(t);
      last = 0;
      place(p);
      settle(p);
      setActive(cards.indexOf(frontCard(p)));
      setLoop('idle');
      return;
    }
    // lerp 0.12 per 60fps frame, normalised to the real frame time
    const dt = last ? Math.min(50, now - last) : 1000 / 60;
    last = now;
    p += d * (1 - Math.pow(1 - LERP, dt / (1000 / 60)));
    place(p);
    setActive(cards.indexOf(frontCard(p)));
    setLoop('live');
    raf = requestAnimationFrame(frame);
  };
  const schedule = () => {
    if (!raf) raf = requestAnimationFrame(frame);
  };
  /** Snap to the scroll position without inertia (init, filters, resize, off screen). */
  const sync = () => {
    t = targetFromScroll();
    p = quantise(t);
    last = 0;
    place(p);
    settle(p);
    setActive(cards.indexOf(frontCard(p)), false);
  };

  /**
   * Scroll the page to the offset of card `idx` (0-based over all cards); the ring follows through progress.
   * `asDest` marks the card as the one the visitor asked for (a click opens it even before it has arrived);
   * a turn that merely follows the keyboard focus does not — the mousedown that focuses a side card must not
   * turn its own click into an open.
   */
  // the offset of a smooth travel in flight: the idle snap below must not cut it short when the main thread
  // stalls for longer than SNAP_MS mid-way (the page would settle on whatever card was nearest at the stall
  // instead of the one asked for). Cleared on arrival, on any user input and when the stage is re-measured.
  let travelTo: number | null = null;
  const goTo = (idx: number, smooth = true, asDest = true) => {
    const card = cards[idx];
    const pos = card ? positionOf(card) : -1;
    if (pos < 0) return;
    if (asDest) dest = idx;
    if (performance.now() - measuredAt > 150) measure();
    const top = Math.round(offsetOf(pos));
    travelTo = smooth && Math.abs(top - window.scrollY) > 1 ? top : null;
    window.scrollTo({ top, behavior: smooth ? 'smooth' : 'instant' });
    schedule();
  };

  // ---- the ring: which cards, at which --i; a filter glides the survivors to their new angles ----
  let reflowRaf = 0;
  const glide = (movers: HTMLElement[]) => {
    const from = new Map(movers.map((c) => [c, currentAngle(c)] as const));
    const t0 = performance.now();
    grid.classList.add('is-reflow');
    ring.classList.add('is-reflow');
    reflowing = true;
    cancelAnimationFrame(reflowRaf);
    const tick = (now: number) => {
      const k = easeOut(clamp((now - t0) / REFLOW_MS));
      for (const c of movers) {
        const pos = positionOf(c);
        if (pos < 0) continue;
        const angle = (from.get(c) ?? 0) + (angleOf(pos, p) - (from.get(c) ?? 0)) * k;
        setAngle(c, angle);
        const g = ghosts[cards.indexOf(c)];
        if (g) setAngle(g, angle);
      }
      if (k < 1) {
        reflowRaf = requestAnimationFrame(tick);
        return;
      }
      reflowRaf = 0;
      reflowing = false;
      grid.classList.remove('is-reflow');
      ring.classList.remove('is-reflow');
      place(p);
    };
    reflowRaf = requestAnimationFrame(tick);
  };
  const rebuild = (animate: boolean) => {
    const prevActive = active;
    const prevOrder = order;
    order = cards.filter((c) => !c.hidden && !c.classList.contains('is-out'));
    n = order.length;
    step = n > 0 ? clamp(360 / n, STEP_MIN, STEP_MAX) : STEP_MIN;
    closed = n > 1 && Math.abs(n * step - 360) < 0.01;
    ring.style.setProperty('--n', String(n));
    ring.style.setProperty('--step', `${step}deg`);
    order.forEach((c, pos) => {
      c.style.setProperty('--i', String(pos));
      ghosts[cards.indexOf(c)]?.style.setProperty('--i', String(pos));
    });
    buildTicks();
    if (n === 0) return;
    // the active card stays if it is still in the ring, else the nearest one that is
    let keep = order.indexOf(cards[prevActive] as HTMLElement);
    if (keep < 0) {
      keep = 0;
      let best = Infinity;
      order.forEach((c, pos) => {
        const dist = Math.abs(cards.indexOf(c) - prevActive);
        if (dist < best) {
          best = dist;
          keep = pos;
        }
      });
    }
    active = -1; // the position-dependent chrome (counter, ticks, marker) must be rewritten
    if (!animate) {
      sync();
      return;
    }
    measure();
    if (pinned()) window.scrollTo({ top: Math.round(offsetOf(keep)), behavior: 'instant' });
    t = targetFromScroll();
    p = t;
    last = 0;
    settle(p);
    setActive(cards.indexOf(frontCard(p)), false);
    // cards that were already in the ring glide (400ms ease-out); returning ones fade in at their place
    const movers = order.filter((c) => prevOrder.includes(c));
    for (const c of order) {
      if (movers.includes(c)) continue;
      const angle = angleOf(positionOf(c), p);
      setAngle(c, angle);
      const g = ghosts[cards.indexOf(c)];
      if (g) setAngle(g, angle);
    }
    glide(movers);
  };

  // stand-ins follow their cards through a filter (is-out fade, then hidden)
  new MutationObserver((muts) => {
    for (const m of muts) {
      const c = m.target as HTMLElement;
      const g = ghosts[cards.indexOf(c)];
      if (!g) continue;
      g.hidden = c.hidden;
      g.classList.toggle('is-out', c.classList.contains('is-out'));
    }
  }).observe(grid, { attributes: true, attributeFilter: ['hidden', 'class'], subtree: true });
  grid.addEventListener('cases:filter', () => rebuild(true));

  // ---- input ----
  // a click on a side card brings it to the front instead of opening it; the active (or destination) card
  // falls through to the sheet opener. Capture phase: it must run before the button's own listener.
  grid.addEventListener(
    'click',
    (e) => {
      const card = (e.target as Element).closest<HTMLElement>('.case');
      if (!card) return;
      if (performance.now() < suppressUntil) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      const idx = cards.indexOf(card);
      if (idx === active || idx === dest) return;
      e.preventDefault();
      e.stopPropagation();
      goTo(idx);
    },
    true,
  );
  ticks.addEventListener('click', (e) => {
    const b = (e.target as Element).closest<HTMLButtonElement>('[data-arena-tick]');
    if (b) goTo(Number(b.dataset.arenaTick) - 1);
  });
  // keyboard focus on a card's button rotates the ring to it (Tab through the cases, focus return from the sheet)
  grid.addEventListener('focusin', (e) => {
    const card = (e.target as Element).closest<HTMLElement>('.case');
    if (card) goTo(cards.indexOf(card), true, false);
  });
  // ← / → while a card or a tick has focus; the focus moves along with the ring. Steps count from the card
  // the ring is heading to, so two quick presses move two cards, not one.
  arena.addEventListener('keydown', (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey || e.isComposing) return;
    const target = e.target as HTMLElement;
    const onTick = target.closest('[data-arena-tick]') !== null;
    const onCard = target.closest('.case') !== null;
    if (!onTick && !onCard) return;
    const from = dest !== null && cards[dest] && positionOf(cards[dest] as HTMLElement) >= 0 ? (cards[dest] as HTMLElement) : (cards[active] as HTMLElement);
    let pos = positionOf(from);
    if (e.key === 'ArrowRight') pos += 1;
    else if (e.key === 'ArrowLeft') pos -= 1;
    else if (e.key === 'Home') pos = 0;
    else if (e.key === 'End') pos = n - 1;
    else return;
    e.preventDefault();
    pos = clamp(pos, 0, n - 1);
    const card = order[pos];
    if (!card) return;
    goTo(cards.indexOf(card));
    const next = onTick ? tickButtons[pos] : $<HTMLElement>('.case__open', card);
    next?.focus({ preventScroll: true });
  });

  // press feedback on a card: scale(.98) over 140ms while the pointer is down — an additive animation on
  // top of the placement (the card's transform is owned by that animation, so the :active rule cannot);
  // released at once on pointerup, or when the press becomes a drag
  let press: Animation | null = null;
  const release = () => {
    press?.cancel();
    press = null;
  };
  grid.addEventListener('pointerdown', (e) => {
    if (!e.isPrimary || (e.pointerType === 'mouse' && e.button !== 0)) return;
    const card = (e.target as Element).closest<HTMLElement>('.case');
    if (!card) return;
    release();
    press = card.animate([{ transform: 'scale(1)' }, { transform: 'scale(0.98)' }], { duration: PRESS_MS, easing: EASE_OUT, fill: 'forwards', composite: 'add' });
  });
  window.addEventListener('pointerup', release, { passive: true });
  window.addEventListener('pointercancel', release, { passive: true });

  // pointer drag on the scene: horizontal only (touch-action: pan-y keeps vertical scrolling native),
  // 1 case per 120px, momentum on release; the drag moves the page scroll, the ring follows
  let drag: { id: number; x0: number; y0: number; scroll0: number; on: boolean; samples: [number, number][] } | null = null;
  scene.addEventListener('pointerdown', (e) => {
    if (!e.isPrimary || (e.pointerType === 'mouse' && e.button !== 0)) return;
    drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, scroll0: window.scrollY, on: false, samples: [[performance.now(), e.clientX]] };
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
      try {
        scene.setPointerCapture(e.pointerId);
      } catch {
        /* the pointer may be gone already */
      }
      grid.classList.add('is-dragging');
      measure();
    }
    e.preventDefault();
    const now = performance.now();
    drag.samples.push([now, e.clientX]);
    while (drag.samples.length > 2 && now - (drag.samples[0]?.[0] ?? now) > 100) drag.samples.shift();
    const pxPerCase = n > 1 ? span / (n - 1) : 0;
    window.scrollTo({ top: Math.round(drag.scroll0 - (dx * pxPerCase) / DRAG_PX), behavior: 'instant' });
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
    const lastSample = d.samples[d.samples.length - 1];
    const dt = first && lastSample ? lastSample[0] - first[0] : 0;
    const v = first && lastSample && dt > 0 ? (lastSample[1] - first[1]) / dt : 0; // px/ms, right positive
    const tNow = targetFromScroll();
    const pos = clamp(Math.round(tNow - (v * FLICK_MS) / DRAG_PX), 0, n - 1);
    const card = order[pos];
    if (card) goTo(cards.indexOf(card));
  };
  scene.addEventListener('pointerup', endDrag);
  scene.addEventListener('pointercancel', endDrag);
  scene.addEventListener('wheel', () => (dest = null), { passive: true });

  // hover previews a card's headline; leaving the ring restores the active one
  if (fine) {
    grid.addEventListener('pointerover', (e) => {
      const card = (e.target as Element).closest<HTMLElement>('.case');
      if (!card) return;
      hovering = true;
      showHeadline(cards.indexOf(card));
    });
    grid.addEventListener('pointerout', (e) => {
      const to = e.relatedTarget as Element | null;
      if (to && to.closest('.case')) return;
      hovering = false;
      showHeadline(active);
    });
  }

  // ---- scroll, resize, visibility ----
  // once the scrolling stops between two cards (a wheel tick, a trackpad flick), the page settles on the
  // nearest card's offset — the ring always rests with a card facing the viewer, never while the pointer
  // drags, the sheet holds the scroll or the stage is not pinned
  let scrollTimer = 0;
  const snap = () => {
    scrollTimer = 0;
    if (travelTo !== null || drag?.on || !pinned() || n < 2 || document.documentElement.classList.contains('is-sheet-open')) return;
    const tt = targetFromScroll();
    const pos = Math.round(tt);
    if (Math.abs(tt - pos) < 0.02) return;
    const card = order[pos];
    if (card) goTo(cards.indexOf(card));
  };
  window.addEventListener(
    'scroll',
    () => {
      // the first scroll event after a pause re-reads the spacer rect (content above may have moved)
      if (!scrollTimer) measure();
      if (travelTo !== null && Math.abs(window.scrollY - travelTo) <= 1.5) travelTo = null; // arrived
      window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(snap, SNAP_MS);
      schedule();
    },
    { passive: true },
  );
  const remeasure = () => {
    travelTo = null;
    measure();
    mount(); // a breakpoint may have changed the radius
    sync();
  };
  // the visitor takes over: a wheel, a pointer or a scroll key anywhere ends the travel the script was on
  const takeOver = () => (travelTo = null);
  window.addEventListener('wheel', takeOver, { passive: true, capture: true });
  window.addEventListener('pointerdown', takeOver, { passive: true, capture: true });
  window.addEventListener('keydown', (e) => {
    if (!e.defaultPrevented) takeOver(); // ← / → handled above already started a new travel
  });
  window.addEventListener('resize', remeasure, { passive: true });
  if ('ResizeObserver' in window) new ResizeObserver(remeasure).observe(stage);
  if ('fonts' in document) document.fonts.ready.then(remeasure);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(
      (entries) => {
        for (const e of entries) onScreen = e.isIntersecting;
        if (onScreen) schedule();
        else if (raf) {
          cancelAnimationFrame(raf);
          raf = 0;
          sync();
          setLoop('idle');
        }
      },
      { threshold: 0 },
    ).observe(root);
  }
  // the sheet's deep link (and a later hashchange): the ring comes to that case too
  window.addEventListener('hashchange', () => {
    const m = HASH.exec(location.hash);
    if (m) goTo(Number(m[1]) - 1);
  });

  // ---- go ----
  mount();
  rebuild(false);
  measure();
  sync();
  setLoop('idle');
  // #case-N at load: the sheet opens on it (case-sheet.ts) and the ring comes to it too. The browser keeps
  // re-scrolling to the card's element on every layout until `load`; inside a pinned stage each of those
  // scrolls would push the target further down the track, so the stage stays in flow (.is-booting) until
  // the page has loaded, then the ring takes the scroll position over.
  const m = HASH.exec(location.hash);
  const deep = m ? Number(m[1]) - 1 : -1;
  if (deep >= 0 && deep < total) {
    const land = () => {
      root.classList.remove('is-booting');
      measure();
      window.scrollTo({ top: Math.round(offsetOf(positionOf(cards[deep] as HTMLElement))), behavior: 'instant' });
      measure();
      sync();
    };
    if (document.readyState === 'complete') land();
    else {
      root.classList.add('is-booting');
      window.addEventListener('load', () => requestAnimationFrame(land), { once: true });
    }
  }
  onceInView(arena, () => arena.classList.add('is-in'));
}
