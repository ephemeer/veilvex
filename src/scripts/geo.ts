import { $, $$, onceInView, reduceMotion, sleep, tween } from './util';

/**
 * GEO chat choreography: question → typing → typed answer with highlights → models light up → meter.
 * Even, unhurried pacing: 24ms per character (40ms after a space), 200ms fades for the typing bubble,
 * models 100ms apart, meter 900ms — it must never pull attention away from the copy.
 */
export function initGeo(): void {
  const chat = $('[data-chat]');
  if (!chat) return;
  const q = $('[data-chat-q]', chat);
  const typing = $('[data-chat-typing]', chat);
  const a = $('[data-chat-a]', chat);
  const text = $('[data-chat-text]', chat);
  const pct = $('[data-chat-pct]', chat);
  const models = $$('[data-model]');
  const raw = chat.dataset.answer ?? '';

  onceInView(chat, async () => {
    if (reduceMotion()) {
      [q, typing, a].forEach((el) => el?.classList.add('is-shown'));
      typing?.classList.remove('is-shown');
      chat.classList.add('is-done');
      models.forEach((m) => m.classList.add('is-lit'));
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

    for (let i = 0; i < models.length; i++) {
      models[i]?.classList.add('is-lit');
      await sleep(100);
    }
    chat.classList.add('is-done');
    if (pct) tween(900, (p) => (pct.textContent = `${Math.round(92 * p)}%`), () => (pct.textContent = '92%'));
  });
}
