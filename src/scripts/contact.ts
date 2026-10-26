import { $, $$, jumpToSection, reduceMotion } from './util';

type ApiError = 'validation' | 'rate_limited' | 'forbidden' | 'payload_too_large' | 'not_configured' | 'delivery_failed' | 'server' | string;

/**
 * Bring the request form into view and put #contact in the URL. On the two-column layout that is the
 * section itself (heading left, form right); on narrow screens the form card sits far below the
 * heading, so the card is the target. Returns false when the form is not on this page.
 */
export function scrollToRequestForm(): boolean {
  if (!document.getElementById('contact')) return false;
  const card = $('[data-form]')?.parentElement;
  if (!card || window.matchMedia('(min-width: 960px)').matches) return jumpToSection('contact');
  if (location.hash !== '#contact') history.pushState(null, '', '#contact');
  card.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
  return true;
}

let handoff: ((service: string | undefined) => boolean) | null = null;

/**
 * Service → request-form handoff for scripts (the case sheet's CTA): preselect the service chip, bring
 * the form into view (URL gets #contact) and flash the handoff accent once the chips are in view.
 * Returns false when the form is not on this page.
 */
export function handoffToForm(service?: string): boolean {
  return handoff ? handoff(service) : false;
}

export function initContact(): void {
  const form = $<HTMLFormElement>('[data-form]');
  if (!form) return;
  const card = form.parentElement;
  const done = card ? $('[data-done]', card) : null;
  const status = $('[data-status]', form);
  const ts = $<HTMLInputElement>('[data-ts]', form);
  const submit = $<HTMLButtonElement>('[data-submit]', form);
  // bot timing check needs the render timestamp
  if (ts) ts.value = String(Date.now());

  // Preselect services from "Обсудить"/"Заказать" links and ?service= param
  const checkService = (id: string | undefined): boolean => {
    if (!id) return false;
    const box = form.querySelector<HTMLInputElement>(`input[name="services"][value="${CSS.escape(id)}"]`);
    if (!box) return false;
    box.checked = true;
    return true;
  };

  // Handoff accent: once the services fieldset is in view, its outline and the first checked chip
  // light up in lime and fade (Contact.astro .is-hint). Restartable; the class leaves with the animation.
  const pick = $('[data-pick]', form);
  let pendingHint: IntersectionObserver | null = null;
  const flash = (el: Element) => {
    el.classList.remove('is-hint');
    void (el as HTMLElement).offsetWidth; // restart the animation when clicked twice
    el.classList.add('is-hint');
  };
  const hint = () => {
    if (!pick) return;
    flash(pick);
    const first = $('input[name="services"]:checked', pick)?.closest('.pick__item');
    if (first) flash(first);
  };
  pick?.addEventListener('animationend', (e) => {
    const el = e.target as Element;
    if (el === pick) pick.classList.remove('is-hint');
    else el.closest('.pick__item')?.classList.remove('is-hint');
  });
  const hintWhenVisible = () => {
    if (!pick) return;
    pendingHint?.disconnect();
    if (!('IntersectionObserver' in window)) {
      hint();
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((en) => en.isIntersecting)) return;
        io.disconnect();
        if (pendingHint === io) pendingHint = null;
        hint();
      },
      { threshold: 0.6 },
    );
    pendingHint = io;
    io.observe(pick);
    window.setTimeout(() => {
      if (pendingHint === io) {
        io.disconnect();
        pendingHint = null;
      }
    }, 6000);
  };

  handoff = (id) => {
    checkService(id);
    if (!scrollToRequestForm()) return false; // smooth (instant under reduced motion), URL gets #contact
    hintWhenVisible();
    return true;
  };
  for (const link of $$<HTMLAnchorElement>('a[data-service]')) {
    link.addEventListener('click', (e) => {
      // other page: the link itself leads to /#contact
      if (handoff?.(link.dataset.service)) e.preventDefault();
    });
  }
  if (checkService(new URLSearchParams(location.search).get('service') ?? undefined) && location.hash === '#contact') {
    hintWhenVisible();
  }

  const fieldError = (input: HTMLElement, msg: string) => {
    const field = input.closest('.field');
    const slot = field ? $('.field__error', field) : null;
    if (slot) slot.textContent = msg;
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    input.closest('.consent')?.classList.toggle('is-invalid', Boolean(msg));
  };

  const validate = (): boolean => {
    let ok = true;
    const name = $<HTMLInputElement>('input[name="name"]', form);
    const contact = $<HTMLInputElement>('input[name="contact"]', form);
    const consent = $<HTMLInputElement>('input[name="consent"]', form);
    if (name) {
      const bad = name.value.trim().length < 2;
      fieldError(name, bad ? (name.dataset.error ?? '') : '');
      ok = ok && !bad;
    }
    if (contact) {
      const bad = contact.value.trim().length < 5;
      fieldError(contact, bad ? (contact.dataset.error ?? '') : '');
      ok = ok && !bad;
    }
    if (consent) {
      fieldError(consent, consent.checked ? '' : (consent.dataset.error ?? ''));
      ok = ok && consent.checked;
    }
    return ok;
  };

  // live re-validation after the first attempt
  let attempted = false;
  form.addEventListener('input', () => {
    if (attempted) validate();
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    attempted = true;
    if (status) status.textContent = '';
    if (!validate()) {
      $<HTMLElement>('[aria-invalid="true"], .consent.is-invalid input', form)?.focus();
      return;
    }
    const data = new FormData(form);
    const payload = {
      name: String(data.get('name') ?? '').trim(),
      contact: String(data.get('contact') ?? '').trim(),
      services: data.getAll('services').map(String),
      message: String(data.get('message') ?? '').trim(),
      consent: data.get('consent') === 'on',
      lang: form.dataset.lang ?? 'ru',
      website: String(data.get('website') ?? ''),
      t: Number(ts?.value ?? 0),
    };
    form.classList.add('is-sending');
    submit?.setAttribute('aria-busy', 'true');
    try {
      if (!navigator.onLine) throw new Error('offline');
      const res = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'same-origin',
      });
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: ApiError };
      if (res.ok && body.ok) {
        form.hidden = true;
        if (done) {
          done.hidden = false;
          done.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          $('.h3', done)?.setAttribute('tabindex', '-1');
          ($('.h3', done) as HTMLElement | null)?.focus({ preventScroll: true });
        }
        return;
      }
      const texts = errorTexts(form);
      if (status) status.textContent = res.status === 429 ? texts.rate : texts.generic;
    } catch (err) {
      const texts = errorTexts(form);
      if (status) status.textContent = err instanceof Error && err.message === 'offline' ? texts.offline : texts.generic;
    } finally {
      form.classList.remove('is-sending');
      submit?.removeAttribute('aria-busy');
    }
  });

  // reset to send another
  const again = done ? $('[data-again]', done) : null;
  again?.addEventListener('click', () => {
    form.reset();
    if (ts) ts.value = String(Date.now());
    attempted = false;
    $$('.field__error', form).forEach((s) => (s.textContent = ''));
    $$('[aria-invalid]', form).forEach((i) => i.setAttribute('aria-invalid', 'false'));
    if (done) done.hidden = true;
    form.hidden = false;
    $<HTMLInputElement>('input[name="name"]', form)?.focus();
  });
}

function errorTexts(form: HTMLFormElement): { generic: string; rate: string; offline: string } {
  return {
    generic: form.dataset.errorGeneric ?? 'Error. Please try again.',
    rate: form.dataset.errorRate ?? 'Too many requests. Please wait a few minutes.',
    offline: form.dataset.errorOffline ?? 'You are offline.',
  };
}
