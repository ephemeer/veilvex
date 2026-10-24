import { $, $$, onceInView, reduceMotion, sleep, tween } from './util';

/**
 * GEO chat choreography: question → typing → typed answer with highlights → models light up → meter.
 * Even, unhurried pacing: 24ms per character (40ms after a space), 200ms fades for the typing bubble,
 * models 100ms apart, meter 900ms — it must never pull attention away from the copy.
 *
 * The model chips are buttons. Pressing one focuses the meter on that model: its own visibility value
 * (data-pct, Geo.astro), bar and number retarget over the meter's 900ms ease-out, " · Model" is added to
 * the label and only that chip stays lit. Pressing it again returns to the overall figure with every
 * model lit. A chip pressed before the choreography has finished is honoured when the meter appears.
 */
const OVERALL = 92;

export function initGeo(): void {
  const chat = $('[data-chat]');
  if (!chat) return;
  const q = $('[data-chat-q]', chat);
  const typing = $('[data-chat-typing]', chat);
  const a = $('[data-chat-a]', chat);
  const text = $('[data-chat-text]', chat);
  const pct = $('[data-chat-pct]', chat);
  const bar = $('[data-chat-meter]', chat);
  const label = $('[data-chat-label]', chat);
  const models = $$<HTMLButtonElement>('[data-model]');
  const raw = chat.dataset.answer ?? '';
  const baseLabel = label?.textContent ?? '';

  let done = false;
  let selected: HTMLButtonElement | null = null;
  let shown = 0; // the value the number displays right now — a retarget tweens from here
  let run = 0; // a newer tween silences the older one

  const setMeter = (to: number, animate: boolean) => {
    // the bar keeps its CSS transition (900ms ease-out) and retargets from wherever it is;
    // with no model selected the stylesheet's overall width applies
    if (bar) bar.style.transform = selected ? `scaleX(${to / 100})` : '';
    const from = shown;
    const id = ++run;
    const put = (v: number) => {
      shown = v;
      if (pct) pct.textContent = `${v}%`;
    };
    if (!animate || from === to) {
      put(to);
      return;
    }
    tween(
      900,
      (p) => {
        if (id === run) put(Math.round(from + (to - from) * p));
      },
      () => {
        if (id === run) put(to);
      },
    );
  };

  const render = (animate: boolean) => {
    for (const b of models) {
      b.classList.toggle('is-lit', selected ? b === selected : done);
      b.setAttribute('aria-pressed', String(b === selected));
    }
    if (label) label.textContent = selected ? `${baseLabel} · ${selected.textContent?.trim() ?? ''}` : baseLabel;
    if (done) setMeter(selected ? Number(selected.dataset.pct) || OVERALL : OVERALL, animate);
  };

  const finish = (animate: boolean) => {
    done = true;
    chat.classList.add('is-done');
    render(animate);
  };

  for (const b of models) {
    b.addEventListener('click', () => {
      selected = selected === b ? null : b;
      render(!reduceMotion());
    });
  }

  onceInView(chat, async () => {
    if (reduceMotion()) {
      [q, a].forEach((el) => el?.classList.add('is-shown'));
      finish(false);
      return;
    }
    q?.classList.add('is-shown');
    await sleep(600);
    typing?.classList.add('is-shown');
    await sleep(1300);
    typing?.classList.remove('is-shown');
    await sleep(200); // let the bubble fade out before the answer takes its place

    if (text && raw) {
      // Build segments: plain text vs {{highlight}} — typed sequentially into safe text nodes.
      const parts = raw.split(/(\{\{.+?\}\})/).filter(Boolean);
      text.textContent = '';
      const caret = document.createElement('span');
      caret.className = 'chat__caret';
      a?.classList.add('is-shown');
      for (const part of parts) {
        const isHl = part.startsWith('{{');
        const content = isHl ? part.slice(2, -2) : part;
        const node: HTMLElement | Text = isHl ? document.createElement('em') : document.createTextNode('');
        if (node instanceof HTMLElement) node.className = 'hl';
        text.appendChild(node);
        text.appendChild(caret);
        for (let i = 1; i <= content.length; i++) {
          if (node instanceof HTMLElement) node.textContent = content.slice(0, i);
          else node.data = content.slice(0, i);
          await sleep(content[i - 1] === ' ' ? 40 : 24);
        }
      }
      caret.remove();
    } else {
      a?.classList.add('is-shown');
    }

    // models light up one by one — unless the visitor has already picked one
    for (const m of models) {
      if (selected) break;
      m.classList.add('is-lit');
      await sleep(100);
    }
    finish(true);
  });
}
