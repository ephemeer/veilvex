import { $, $$ } from './util';

type ApiError = 'validation' | 'rate_limited' | 'forbidden' | 'payload_too_large' | 'not_configured' | 'delivery_failed' | 'server' | string;

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
  const checkService = (id: string | undefined) => {
    if (!id) return;
    const box = form.querySelector<HTMLInputElement>(`input[name="services"][value="${CSS.escape(id)}"]`);
    if (box) box.checked = true;
  };
  for (const link of $$('a[data-service]')) {
    link.addEventListener('click', () => checkService(link.dataset.service));
  }
  checkService(new URLSearchParams(location.search).get('service') ?? undefined);

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
