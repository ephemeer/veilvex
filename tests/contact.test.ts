/// <reference types="node" />
/**
 * Unit tests for the contact-form handler. Everything runs against `createContactHandler` with fake
 * dependencies: in-memory store, recording fetch, fixed clock, capturing logger.
 */
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type { Context } from '@netlify/functions';
import {
  MAX_BODY_BYTES,
  MAX_FORM_AGE_MS,
  allowedOrigins,
  createContactHandler,
  clientIp,
  createMemoryStore,
  hashIp,
  rateLimitIdentity,
  redact,
  sanitizeLine,
  sanitizeMultiline,
} from '../netlify/functions/lib/contact-core.ts';
import type { ContactDeps, ContactHandler, LogFields, Logger, RateLimitStore } from '../netlify/functions/lib/contact-core.ts';
import contactFunction, { config as contactConfig } from '../netlify/functions/contact.mts';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const NOW = Date.UTC(2026, 9, 23, 12, 0, 0);
const SITE = 'https://veilvex.example';
const ENDPOINT = `${SITE}/api/contact`;
const IP = '203.0.113.7';
const TOKEN = '123456789:AAHunitTestToken_abcdefghijklmnopqrstuvwxyz';
const RESEND_KEY = 're_test_key_0987654321';
const TELEGRAM_URL = `https://api.telegram.org/bot${TOKEN}/sendMessage`;
const RESEND_URL = 'https://api.resend.com/emails';

const TELEGRAM_ENV: Record<string, string> = { URL: SITE, CONTEXT: 'production', TELEGRAM_BOT_TOKEN: TOKEN, TELEGRAM_CHAT_ID: '4242' };
const RESEND_ENV: Record<string, string> = {
  URL: SITE,
  CONTEXT: 'production',
  RESEND_API_KEY: RESEND_KEY,
  CONTACT_TO_EMAIL: 'team@veilvex.example',
  CONTACT_FROM_EMAIL: 'site@veilvex.example',
};

interface FetchCall {
  url: string;
  init: RequestInit | undefined;
  json: Record<string, unknown> | undefined;
}

type Responder = (url: string, init: RequestInit | undefined) => Response | Promise<Response>;

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

const okResponder: Responder = () => jsonResponse(200, { ok: true });

function createFakeFetch(respond: Responder = okResponder): { fetchImpl: typeof globalThis.fetch; calls: FetchCall[] } {
  const calls: FetchCall[] = [];
  const fetchImpl = (async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    let json: Record<string, unknown> | undefined;
    if (typeof init?.body === 'string') {
      try {
        json = JSON.parse(init.body) as Record<string, unknown>;
      } catch {
        json = undefined;
      }
    }
    calls.push({ url, init, json });
    return respond(url, init);
  }) as unknown as typeof globalThis.fetch;
  return { fetchImpl, calls };
}

interface LogEntry {
  level: 'info' | 'warn' | 'error';
  event: string;
  fields: LogFields | undefined;
}

function createFakeLogger(): { logger: Logger; entries: LogEntry[] } {
  const entries: LogEntry[] = [];
  const logger: Logger = {
    info: (event, fields) => void entries.push({ level: 'info', event, fields }),
    warn: (event, fields) => void entries.push({ level: 'warn', event, fields }),
    error: (event, fields) => void entries.push({ level: 'error', event, fields }),
  };
  return { logger, entries };
}

interface HarnessOptions {
  env?: Record<string, string | undefined>;
  respond?: Responder;
  now?: () => number;
  store?: RateLimitStore;
  outboundTimeoutMs?: number;
}

interface Harness {
  deps: ContactDeps;
  handler: ContactHandler;
  calls: FetchCall[];
  logs: LogEntry[];
}

function harness(options: HarnessOptions = {}): Harness {
  const now = options.now ?? (() => NOW);
  const fake = createFakeFetch(options.respond);
  const { logger, entries } = createFakeLogger();
  const deps: ContactDeps = {
    fetch: fake.fetchImpl,
    now,
    env: options.env ?? TELEGRAM_ENV,
    store: options.store ?? createMemoryStore(now),
    log: logger,
    outboundTimeoutMs: options.outboundTimeoutMs,
  };
  return { deps, handler: createContactHandler(deps), calls: fake.calls, logs: entries };
}

function validBody(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    name: 'John Doe',
    contact: '+994 50 123 45 67',
    services: ['geo', 'site'],
    message: 'Need a landing page and ads.',
    consent: true,
    lang: 'en',
    website: '',
    t: NOW - 15_000,
    ...overrides,
  };
}

interface PostOptions {
  headers?: Record<string, string>;
  omit?: string[];
  raw?: BodyInit;
}

/** Builds the request exactly as the browser would send it (same-origin, JSON). */
function post(body: unknown, options: PostOptions = {}): Request {
  const headers = new Headers({ 'content-type': 'application/json', origin: SITE, 'sec-fetch-site': 'same-origin' });
  for (const [name, value] of Object.entries(options.headers ?? {})) headers.set(name, value);
  for (const name of options.omit ?? []) headers.delete(name);
  const init: RequestInit & { duplex?: 'half' } = { method: 'POST', headers, body: options.raw ?? JSON.stringify(body) };
  if (options.raw instanceof ReadableStream) init.duplex = 'half';
  return new Request(ENDPOINT, init);
}

/** `ip: null` calls the handler without `context.ip`, so the header fallbacks are exercised. */
async function send(h: Harness, req: Request, ip: string | null = IP): Promise<{ res: Response; body: Record<string, unknown> }> {
  const res = await h.handler(req, ip === null ? {} : { ip });
  let body: Record<string, unknown> = {};
  try {
    body = JSON.parse(await res.text()) as Record<string, unknown>;
  } catch {
    body = {};
  }
  return { res, body };
}

function onlyCall(h: Harness): FetchCall {
  expect(h.calls).toHaveLength(1);
  const call = h.calls[0];
  if (!call) throw new Error('no outbound call recorded');
  return call;
}

function textOf(call: FetchCall): string {
  const text = call.json?.text;
  if (typeof text !== 'string') throw new Error('outbound payload has no text');
  return text;
}

function hasLog(h: Harness, event: string, fields: Partial<LogFields> = {}): boolean {
  return h.logs.some((entry) => entry.event === event && Object.entries(fields).every(([k, v]) => entry.fields?.[k] === v));
}

// ---------------------------------------------------------------------------
// Request gates
// ---------------------------------------------------------------------------

describe('request gates', () => {
  it('405 with Allow: POST for every non-POST method', async () => {
    const h = harness();
    for (const method of ['GET', 'HEAD', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']) {
      const { res, body } = await send(h, new Request(ENDPOINT, { method }));
      expect(res.status, method).toBe(405);
      expect(res.headers.get('allow')).toBe('POST');
      expect(body).toEqual({ ok: false, error: 'method_not_allowed' });
    }
    expect(h.calls).toHaveLength(0);
  });

  it('415 unless Content-Type is application/json', async () => {
    const h = harness();
    const plain = await send(h, post(validBody(), { headers: { 'content-type': 'text/plain' } }));
    expect(plain.res.status).toBe(415);
    expect(plain.body).toEqual({ ok: false, error: 'unsupported_media_type' });

    const form = await send(h, post(validBody(), { headers: { 'content-type': 'application/x-www-form-urlencoded' } }));
    expect(form.res.status).toBe(415);

    const withCharset = await send(h, post(validBody(), { headers: { 'content-type': 'application/json; charset=utf-8' } }));
    expect(withCharset.res.status).toBe(200);
  });

  it('413 when Content-Length exceeds 16 KB', async () => {
    const h = harness();
    const { res, body } = await send(h, post(validBody(), { headers: { 'content-length': String(MAX_BODY_BYTES + 1) } }));
    expect(res.status).toBe(413);
    expect(body).toEqual({ ok: false, error: 'payload_too_large' });
    expect(h.calls).toHaveLength(0);
  });

  it('413 when the body actually read exceeds 16 KB (no Content-Length header)', async () => {
    const h = harness();
    const raw = JSON.stringify(validBody({ message: 'x'.repeat(MAX_BODY_BYTES + 100) }));

    const stringReq = post(null, { raw });
    expect(stringReq.headers.get('content-length')).toBeNull();
    const viaString = await send(h, stringReq);
    expect(viaString.res.status).toBe(413);
    expect(viaString.body).toEqual({ ok: false, error: 'payload_too_large' });

    const bytes = new TextEncoder().encode(raw);
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        for (let i = 0; i < bytes.length; i += 4096) controller.enqueue(bytes.subarray(i, i + 4096));
        controller.close();
      },
    });
    const viaStream = await send(h, post(null, { raw: stream }));
    expect(viaStream.res.status).toBe(413);
    expect(h.calls).toHaveLength(0);
  });

  it('400 invalid_json for malformed JSON, invalid UTF-8 and an empty body', async () => {
    const h = harness();
    const malformed = await send(h, post(null, { raw: '{"name": "x"' }));
    expect(malformed.res.status).toBe(400);
    expect(malformed.body).toEqual({ ok: false, error: 'invalid_json' });

    const invalidUtf8 = await send(h, post(null, { raw: new Uint8Array([0x7b, 0xff, 0xfe, 0x7d]) }));
    expect(invalidUtf8.res.status).toBe(400);
    expect(invalidUtf8.body.error).toBe('invalid_json');

    const empty = await send(h, post(null, { raw: '' }));
    expect(empty.res.status).toBe(400);
    expect(empty.body.error).toBe('invalid_json');
    expect(h.calls).toHaveLength(0);
  });

  describe('400 validation', () => {
    const cases: Array<[string, Record<string, unknown>, string]> = [
      ['name shorter than 2 chars (after trim)', { name: ' J ' }, 'name'],
      ['name longer than 80 chars', { name: 'a'.repeat(81) }, 'name'],
      ['contact shorter than 5 chars', { contact: '123' }, 'contact'],
      ['consent not literally true', { consent: false }, 'consent'],
      ['consent as string', { consent: 'true' }, 'consent'],
      ['unknown service id', { services: ['geo', 'crypto'] }, 'services'],
      ['duplicate service ids', { services: ['geo', 'geo'] }, 'services'],
      ['services not an array', { services: 'geo' }, 'services'],
      ['message longer than 2000 chars', { message: 'a'.repeat(2001) }, 'message'],
      ['unknown lang', { lang: 'fr' }, 'lang'],
      ['t not an integer', { t: 12.5 }, 't'],
      ['t as string', { t: String(NOW) }, 't'],
    ];

    for (const [title, overrides, field] of cases) {
      it(title, async () => {
        const h = harness();
        const { res, body } = await send(h, post(validBody(overrides)));
        expect(res.status).toBe(400);
        expect(body.ok).toBe(false);
        expect(body.error).toBe('validation');
        expect(body.fields).toContain(field);
        expect(h.calls).toHaveLength(0);
      });
    }

    it('rejects unknown extra fields (strict schema, anti mass-assignment)', async () => {
      const h = harness();
      const { res, body } = await send(h, post(validBody({ role: 'admin' })));
      expect(res.status).toBe(400);
      expect(body.error).toBe('validation');
      expect(h.calls).toHaveLength(0);
    });

    it('rejects non-object JSON', async () => {
      const h = harness();
      for (const raw of ['[]', '"text"', 'null', '42']) {
        const { res, body } = await send(h, post(null, { raw }));
        expect(res.status, raw).toBe(400);
        expect(body.error).toBe('validation');
      }
    });

    it('returns only generic codes and field names — never messages or input', async () => {
      const h = harness();
      const { body } = await send(h, post(validBody({ name: 'X', contact: 'secret-contact-value' })));
      expect(Object.keys(body).sort()).toEqual(['error', 'fields', 'ok']);
      expect(JSON.stringify(body)).not.toContain('secret-contact-value');
    });
  });
});

// ---------------------------------------------------------------------------
// Same-origin (CSRF)
// ---------------------------------------------------------------------------

describe('same-origin check', () => {
  it('403 for a foreign Origin', async () => {
    const h = harness();
    const { res, body } = await send(h, post(validBody(), { headers: { origin: 'https://evil.example' } }));
    expect(res.status).toBe(403);
    expect(body).toEqual({ ok: false, error: 'forbidden' });
    expect(h.calls).toHaveLength(0);
    expect(hasLog(h, 'contact_rejected', { status: 403, reason: 'origin' })).toBe(true);
  });

  it('403 for an opaque ("null") Origin', async () => {
    const h = harness();
    const { res } = await send(h, post(validBody(), { headers: { origin: 'null' } }));
    expect(res.status).toBe(403);
  });

  it('403 for Sec-Fetch-Site cross-site / same-site even with a valid Origin', async () => {
    const h = harness();
    for (const site of ['cross-site', 'same-site']) {
      const { res, body } = await send(h, post(validBody(), { headers: { 'sec-fetch-site': site } }));
      expect(res.status, site).toBe(403);
      expect(body.error).toBe('forbidden');
    }
    expect(h.calls).toHaveLength(0);
    expect(hasLog(h, 'contact_rejected', { status: 403, reason: 'sec_fetch_site' })).toBe(true);
  });

  it('allowed Origin + Sec-Fetch-Site same-origin passes', async () => {
    const h = harness();
    const { res } = await send(h, post(validBody()));
    expect(res.status).toBe(200);
    expect(h.calls).toHaveLength(1);
  });

  it('Sec-Fetch-Site none (direct navigation) passes when Origin is allowed', async () => {
    const h = harness();
    const { res } = await send(h, post(validBody(), { headers: { 'sec-fetch-site': 'none' } }));
    expect(res.status).toBe(200);
  });

  it('fail-closed: a POST without an Origin header is refused, nothing is delivered', async () => {
    const h = harness();
    const noHeaders = await send(h, post(validBody(), { omit: ['origin', 'sec-fetch-site'] }));
    expect(noHeaders.res.status).toBe(403);
    expect(noHeaders.body).toEqual({ ok: false, error: 'forbidden' });
    const onlySecFetch = await send(h, post(validBody(), { omit: ['origin'] }));
    expect(onlySecFetch.res.status).toBe(403);
    expect(hasLog(h, 'contact_rejected', { reason: 'missing_origin' })).toBe(true);
    expect(h.calls).toHaveLength(0);
  });

  it('accepts SITE_URL, URL, DEPLOY_PRIME_URL and DEPLOY_URL origins', async () => {
    const env = {
      ...TELEGRAM_ENV,
      SITE_URL: 'https://www.veilvex.example',
      URL: 'https://veilvex.example',
      DEPLOY_PRIME_URL: 'https://feature--veilvex.netlify.app',
      DEPLOY_URL: 'https://abc123--veilvex.netlify.app/',
    };
    const h = harness({ env });
    for (const origin of ['https://www.veilvex.example', 'https://veilvex.example', 'https://feature--veilvex.netlify.app', 'https://abc123--veilvex.netlify.app']) {
      const { res } = await send(h, post(validBody(), { headers: { origin } }), `10.0.0.${h.calls.length}`);
      expect(res.status, origin).toBe(200);
    }
  });

  it('allows localhost origins only outside deployed contexts', async () => {
    const localhost = { origin: 'http://localhost:4321' };
    const local = harness({ env: { TELEGRAM_BOT_TOKEN: TOKEN, TELEGRAM_CHAT_ID: '1', NODE_ENV: 'development' } });
    expect((await send(local, post(validBody(), { headers: localhost }))).res.status).toBe(200);

    const netlifyDev = harness({ env: { ...TELEGRAM_ENV, NETLIFY_DEV: 'true' } });
    expect((await send(netlifyDev, post(validBody(), { headers: localhost }))).res.status).toBe(200);

    const contextDev = harness({ env: { ...TELEGRAM_ENV, CONTEXT: 'dev' } });
    expect((await send(contextDev, post(validBody(), { headers: { origin: 'http://localhost:4322' } }))).res.status).toBe(200);

    const production = harness({ env: { ...TELEGRAM_ENV, CONTEXT: 'production' } });
    expect((await send(production, post(validBody(), { headers: localhost }))).res.status).toBe(403);

    const nodeProduction = harness({ env: { TELEGRAM_BOT_TOKEN: TOKEN, TELEGRAM_CHAT_ID: '1', NODE_ENV: 'production' } });
    expect((await send(nodeProduction, post(validBody(), { headers: localhost }))).res.status).toBe(403);

    // no CONTEXT and no NODE_ENV at all → production rules (localhost refused)
    const bare = harness({ env: { TELEGRAM_BOT_TOKEN: TOKEN, TELEGRAM_CHAT_ID: '1' } });
    expect((await send(bare, post(validBody(), { headers: localhost }))).res.status).toBe(403);
    // explicit NODE_ENV=development without CONTEXT → dev origins accepted
    const nodeDev = harness({ env: { TELEGRAM_BOT_TOKEN: TOKEN, TELEGRAM_CHAT_ID: '1', NODE_ENV: 'development' } });
    expect((await send(nodeDev, post(validBody(), { headers: localhost }))).res.status).toBe(200);
  });

  it('allowedOrigins normalises URLs and ignores garbage', () => {
    const set = allowedOrigins({ URL: 'https://Veilvex.Example/some/path?x=1', SITE_URL: 'not a url', DEPLOY_URL: 'ftp://nope.example', CONTEXT: 'production' });
    expect([...set]).toEqual(['https://veilvex.example']);
  });
});

// ---------------------------------------------------------------------------
// Bot heuristics
// ---------------------------------------------------------------------------

describe('bot heuristics (silent drop)', () => {
  async function expectSilentDrop(overrides: Record<string, unknown>, reason: string): Promise<void> {
    const store = createMemoryStore(() => NOW);
    const h = harness({ store });
    const { res, body } = await send(h, post(validBody(overrides)));
    expect(res.status).toBe(200);
    expect(body).toEqual({ ok: true });
    expect(h.calls).toHaveLength(0);
    expect(store.size()).toBe(0); // bots do not consume the rate-limit budget
    expect(hasLog(h, 'bot_dropped', { reason })).toBe(true);
  }

  it('honeypot filled → 200 without delivery', () => expectSilentDrop({ website: 'http://spam.example' }, 'honeypot'));
  it('t newer than 3 s → 200 without delivery', () => expectSilentDrop({ t: NOW - 1_000 }, 'too_fast'));
  it('t older than 24 h → 200 without delivery', () => expectSilentDrop({ t: NOW - MAX_FORM_AGE_MS - 1_000 }, 'stale_form'));
  it('t in the future → 200 without delivery', () => expectSilentDrop({ t: NOW + 120_000 }, 'future_timestamp'));
});

// ---------------------------------------------------------------------------
// Rate limit
// ---------------------------------------------------------------------------

describe('rate limit', () => {
  it('5 submissions pass, the 6th gets 429 with Retry-After', async () => {
    const h = harness();
    for (let i = 0; i < 5; i += 1) {
      const { res } = await send(h, post(validBody()));
      expect(res.status, `request ${i + 1}`).toBe(200);
    }
    const { res, body } = await send(h, post(validBody()));
    expect(res.status).toBe(429);
    expect(body.ok).toBe(false);
    expect(body.error).toBe('rate_limited');
    const retryAfter = body.retryAfter;
    if (typeof retryAfter !== 'number') throw new Error('retryAfter missing');
    expect(retryAfter).toBeGreaterThanOrEqual(1);
    expect(retryAfter).toBeLessThanOrEqual(600);
    expect(res.headers.get('retry-after')).toBe(String(retryAfter));
    expect(h.calls).toHaveLength(5);
    expect(hasLog(h, 'rate_limited')).toBe(true);
  });

  it('is a sliding window: allowed again once the oldest hit leaves the window', async () => {
    let clock = NOW;
    const h = harness({ now: () => clock });
    for (let i = 0; i < 5; i += 1) {
      expect((await send(h, post(validBody()))).res.status).toBe(200);
      clock += 1_000;
    }
    const blocked = await send(h, post(validBody()));
    expect(blocked.res.status).toBe(429);
    expect(blocked.body.retryAfter).toBe(595); // oldest hit at NOW, window 600 s, now = NOW + 5 s

    clock = NOW + 600_000 + 1;
    expect((await send(h, post(validBody()))).res.status).toBe(200);
  });

  it('counts per IP', async () => {
    const h = harness();
    for (let i = 0; i < 5; i += 1) expect((await send(h, post(validBody()))).res.status).toBe(200);
    expect((await send(h, post(validBody()))).res.status).toBe(429);
    expect((await send(h, post(validBody()), '198.51.100.1')).res.status).toBe(200);
  });

  it('honours CONTACT_RATE_LIMIT and CONTACT_RATE_WINDOW', async () => {
    const h = harness({ env: { ...TELEGRAM_ENV, CONTACT_RATE_LIMIT: '2', CONTACT_RATE_WINDOW: '60' } });
    expect((await send(h, post(validBody()))).res.status).toBe(200);
    expect((await send(h, post(validBody()))).res.status).toBe(200);
    const { res, body } = await send(h, post(validBody()));
    expect(res.status).toBe(429);
    expect(body.retryAfter).toBe(60);
  });

  it('stores SHA-256 hashes of the IP, never the raw address', async () => {
    const keys: string[] = [];
    const inner = createMemoryStore(() => NOW);
    const store: RateLimitStore = {
      get: (key) => inner.get(key),
      set: (key, hits, expiresAt) => {
        keys.push(key);
        return inner.set(key, hits, expiresAt);
      },
    };
    const h = harness({ store });
    await send(h, post(validBody()));
    expect(keys).toHaveLength(1);
    expect(keys[0]).toMatch(/^[0-9a-f]{64}$/);
    expect(keys[0]).toBe(await hashIp(IP));
    expect(keys.join()).not.toContain('203.0.113');
  });

  it('falls back to x-nf-client-connection-ip, then x-forwarded-for, then "unknown"', async () => {
    const keys: string[] = [];
    const inner = createMemoryStore(() => NOW);
    const store: RateLimitStore = {
      get: (key) => inner.get(key),
      set: (key, hits, expiresAt) => {
        keys.push(key);
        return inner.set(key, hits, expiresAt);
      },
    };
    const h = harness({ store });
    await send(h, post(validBody(), { headers: { 'x-nf-client-connection-ip': '198.51.100.9', 'x-forwarded-for': '192.0.2.1, 10.0.0.1' } }), null);
    await send(h, post(validBody(), { headers: { 'x-forwarded-for': '192.0.2.1, 10.0.0.1' } }), null);
    await send(h, post(validBody()), null);
    expect(keys).toEqual([await hashIp('198.51.100.9'), await hashIp('192.0.2.1'), await hashIp('unknown')]);
  });

  it('fails open (and logs) when the store is unavailable', async () => {
    const store: RateLimitStore = {
      get: async () => {
        throw new Error('blobs down');
      },
      set: async () => {
        throw new Error('blobs down');
      },
    };
    const h = harness({ store });
    const { res } = await send(h, post(validBody()));
    expect(res.status).toBe(200);
    expect(hasLog(h, 'rate_limit_store_read_failed')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Delivery
// ---------------------------------------------------------------------------

describe('delivery', () => {
  it('503 not_configured when no channel is configured', async () => {
    const h = harness({ env: { URL: SITE, CONTEXT: 'production' } });
    const { res, body } = await send(h, post(validBody()));
    expect(res.status).toBe(503);
    expect(body).toEqual({ ok: false, error: 'not_configured' });
    expect(h.calls).toHaveLength(0);
    expect(h.logs.some((l) => l.event === 'contact_not_configured' && l.level === 'error')).toBe(true);
  });

  it('a half-configured channel counts as not configured', async () => {
    const h = harness({ env: { URL: SITE, CONTEXT: 'production', TELEGRAM_BOT_TOKEN: TOKEN, RESEND_API_KEY: RESEND_KEY } });
    const { res } = await send(h, post(validBody()));
    expect(res.status).toBe(503);
    expect(h.calls).toHaveLength(0);
  });

  it('502 delivery_failed when Telegram returns 500', async () => {
    const h = harness({ respond: () => jsonResponse(500, { ok: false, description: 'Internal Server Error' }) });
    const { res, body } = await send(h, post(validBody()));
    expect(res.status).toBe(502);
    expect(body).toEqual({ ok: false, error: 'delivery_failed' });
    expect(h.calls).toHaveLength(1);
    expect(hasLog(h, 'delivery_failed', { channel: 'telegram', status: 500 })).toBe(true);
  });

  it('502 on a network error, and the bot token never reaches logs or the response', async () => {
    const h = harness({
      respond: () => {
        throw new TypeError(`fetch failed for ${TELEGRAM_URL}`);
      },
    });
    const { res, body } = await send(h, post(validBody()));
    expect(res.status).toBe(502);
    expect(body).toEqual({ ok: false, error: 'delivery_failed' });
    const dump = JSON.stringify(h.logs);
    expect(dump).not.toContain(TOKEN);
    expect(dump).toContain('[redacted]');
  });

  it('502 when the outbound call times out (AbortController)', async () => {
    const h = harness({
      outboundTimeoutMs: 20,
      respond: (_url, init) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(new DOMException('The operation was aborted', 'AbortError')));
        }),
    });
    const { res, body } = await send(h, post(validBody()));
    expect(res.status).toBe(502);
    expect(body.error).toBe('delivery_failed');
    expect(onlyCall(h).init?.signal?.aborted).toBe(true);
    expect(hasLog(h, 'delivery_failed', { channel: 'telegram', error: 'timeout' })).toBe(true);
  });

  it('200 happy path via Telegram: plain text, no parse_mode, user markup stays literal', async () => {
    const h = harness();
    const { res, body } = await send(
      h,
      post(validBody({ name: '<script>alert(1)</script>', message: '*bold* _it_ [link](https://x.example) <b>hi</b> & "quotes"' })),
    );
    expect(res.status).toBe(200);
    expect(body).toEqual({ ok: true });

    const call = onlyCall(h);
    expect(call.url).toBe(TELEGRAM_URL);
    expect(call.init?.method).toBe('POST');
    expect(new Headers(call.init?.headers).get('content-type')).toBe('application/json');
    expect(call.init?.signal).toBeInstanceOf(AbortSignal);

    expect(call.json).toBeDefined();
    expect(call.json).not.toHaveProperty('parse_mode');
    expect(call.json?.chat_id).toBe('4242');
    expect(call.json?.disable_web_page_preview).toBe(true);
    expect(Object.keys(call.json ?? {}).sort()).toEqual(['chat_id', 'disable_web_page_preview', 'text']);

    const text = textOf(call);
    expect(text).toContain('Name: <script>alert(1)</script>');
    expect(text).toContain('*bold* _it_ [link](https://x.example) <b>hi</b> & "quotes"');
    expect(text).toContain('Contact: +994 50 123 45 67');
    expect(text).toContain('Services: GEO, Website');
    expect(text).not.toContain('&lt;');
    expect(text).not.toContain('&amp;');
    expect(hasLog(h, 'contact_delivered', { channels: 'telegram', lang: 'en' })).toBe(true);
  });

  it('uses labels in the language of the request', async () => {
    const expectations: Array<[string, string]> = [
      ['ru', 'Имя: John Doe'],
      ['de', 'Kontakt: +994 50 123 45 67'],
      ['az', 'Əlaqə: +994 50 123 45 67'],
      ['en', 'Task:'],
    ];
    for (const [lang, snippet] of expectations) {
      const h = harness();
      await send(h, post(validBody({ lang })));
      expect(textOf(onlyCall(h)), lang).toContain(snippet);
    }
  });

  it('200 happy path via Resend: plain-text email, no html', async () => {
    const h = harness({ env: RESEND_ENV });
    const { res, body } = await send(h, post(validBody()));
    expect(res.status).toBe(200);
    expect(body).toEqual({ ok: true });

    const call = onlyCall(h);
    expect(call.url).toBe(RESEND_URL);
    expect(call.init?.method).toBe('POST');
    const headers = new Headers(call.init?.headers);
    expect(headers.get('authorization')).toBe(`Bearer ${RESEND_KEY}`);
    expect(headers.get('content-type')).toBe('application/json');
    expect(call.init?.signal).toBeInstanceOf(AbortSignal);

    expect(call.json?.from).toBe('site@veilvex.example');
    expect(call.json?.to).toEqual(['team@veilvex.example']);
    expect(call.json).not.toHaveProperty('html');
    expect(String(call.json?.subject)).toContain('John Doe');
    expect(textOf(call)).toContain('Need a landing page and ads.');
    expect(hasLog(h, 'contact_delivered', { channels: 'resend' })).toBe(true);
  });

  it('with both channels: one success is enough, all failures → 502', async () => {
    const env = { ...TELEGRAM_ENV, ...RESEND_ENV };
    const partial = harness({ env, respond: (url) => (url === TELEGRAM_URL ? jsonResponse(500, {}) : jsonResponse(200, { id: 'x' })) });
    const ok = await send(partial, post(validBody()));
    expect(ok.res.status).toBe(200);
    expect(partial.calls.map((c) => c.url).sort()).toEqual([RESEND_URL, TELEGRAM_URL].sort());
    expect(hasLog(partial, 'contact_delivered', { channels: 'resend' })).toBe(true);

    const total = harness({ env, respond: () => jsonResponse(503, {}) });
    const failed = await send(total, post(validBody()));
    expect(failed.res.status).toBe(502);
    expect(failed.body).toEqual({ ok: false, error: 'delivery_failed' });
    expect(total.calls).toHaveLength(2);
  });

  it('strips control characters and collapses whitespace before delivery', async () => {
    const h = harness();
    const { res } = await send(
      h,
      post(validBody({ name: 'Jo\u0000hn\u0007  \t Doe\u200B', contact: ' +1 \n 234\u001F 567 ', message: 'line1\r\n\r\n\r\n\r\nline2\u0000  \u202Eend\u0008' })),
    );
    expect(res.status).toBe(200);
    const text = textOf(onlyCall(h));
    expect(text).toContain('Name: John Doe\n');
    expect(text).toContain('Contact: +1 234 567\n');
    expect(text).toContain('Task:\nline1\n\nline2 end\n');
    expect(text).not.toMatch(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u200B\u202E]/);
  });

  it('sanitize helpers', () => {
    expect(sanitizeLine('\u202E abc\t\tdef \u0000 ')).toBe('abc def');
    expect(sanitizeLine('\u00A0multi\u2003space\u3000here')).toBe('multi space here');
    expect(sanitizeMultiline('a  \r\n  b\r\n\r\n\r\n\r\nc\ttab')).toBe('a\nb\n\nc tab');
  });
});

// ---------------------------------------------------------------------------
// Responses & logging hygiene
// ---------------------------------------------------------------------------

describe('responses and logging hygiene', () => {
  it('sets security headers on every response and never CORS headers', async () => {
    const h = harness();
    const responses = [
      (await send(h, post(validBody()))).res,
      (await send(h, post(validBody({ consent: false })))).res,
      (await send(h, post(validBody(), { headers: { origin: 'https://evil.example' } }))).res,
      (await send(h, new Request(ENDPOINT, { method: 'GET' }))).res,
    ];
    expect(responses.map((r) => r.status)).toEqual([200, 400, 403, 405]);
    for (const res of responses) {
      expect(res.headers.get('content-type')).toBe('application/json; charset=utf-8');
      expect(res.headers.get('cache-control')).toBe('no-store');
      expect(res.headers.get('x-content-type-options')).toBe('nosniff');
      expect(res.headers.get('access-control-allow-origin')).toBeNull();
      expect(res.headers.get('access-control-allow-credentials')).toBeNull();
      expect(res.headers.get('access-control-allow-methods')).toBeNull();
    }
  });

  it('logs carry event names, status and a hashed-ip prefix — never user text or secrets', async () => {
    const h = harness({ env: { ...TELEGRAM_ENV, ...RESEND_ENV } });
    await send(h, post(validBody({ name: 'Zelda Fitzgerald', contact: 'zelda@example.com', message: 'Top secret project text' })));
    await send(h, post(validBody({ consent: false })));
    const dump = JSON.stringify(h.logs);
    for (const forbidden of ['Zelda', 'zelda@example.com', 'Top secret', TOKEN, RESEND_KEY, IP]) expect(dump).not.toContain(forbidden);
    const delivered = h.logs.find((l) => l.event === 'contact_delivered');
    expect(delivered?.fields?.ip).toMatch(/^[0-9a-f]{8}$/);
    expect(delivered?.fields?.ip).toBe((await hashIp(IP)).slice(0, 8));
    expect(hasLog(h, 'contact_rejected', { status: 400, reason: 'validation', fields: 'consent' })).toBe(true);
  });

  it('500 server on unexpected errors, with the real error logged and secrets redacted', async () => {
    const h = harness({
      now: () => {
        throw new Error(`clock broken; token=${TOKEN}`);
      },
    });
    const { res, body } = await send(h, post(validBody()));
    expect(res.status).toBe(500);
    expect(body).toEqual({ ok: false, error: 'server' });
    const entry = h.logs.find((l) => l.event === 'contact_unhandled_error');
    expect(entry?.level).toBe('error');
    expect(String(entry?.fields?.message)).toContain('clock broken');
    expect(JSON.stringify(h.logs)).not.toContain(TOKEN);
  });
});

// ---------------------------------------------------------------------------
// Netlify wiring (contact.mts) — no Netlify runtime here, so Blobs must fall back to memory
// ---------------------------------------------------------------------------

describe('netlify function wiring (contact.mts)', () => {
  const fakeContext = (): Context => ({ ip: IP }) as unknown as Context;
  const WIRING_TOKEN = '987654321:AAHwiringTokenForTests_abcdefghijklmnopq';
  const ENV_KEYS = ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID', 'RESEND_API_KEY', 'CONTACT_TO_EMAIL', 'CONTACT_FROM_EMAIL', 'CONTEXT', 'NETLIFY_DEV', 'URL', 'SITE_URL', 'NODE_ENV'];
  const savedEnv: Record<string, string | undefined> = {};
  let calls: FetchCall[] = [];

  beforeAll(() => {
    // The handler reads env once, on its first call: configure Telegram before any request goes in.
    for (const key of ENV_KEYS) {
      savedEnv[key] = process.env[key];
      delete process.env[key];
    }
    process.env.TELEGRAM_BOT_TOKEN = WIRING_TOKEN;
    process.env.TELEGRAM_CHAT_ID = '77';
    process.env.URL = SITE;
    process.env.CONTEXT = 'production';
    // contact.mts calls globalThis.fetch lazily, so it can be stubbed: nothing leaves the process.
    const fake = createFakeFetch();
    calls = fake.calls;
    vi.stubGlobal('fetch', fake.fetchImpl);
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterAll(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    for (const key of ENV_KEYS) {
      const value = savedEnv[key];
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  it('exports the Netlify config (path + platform rate limit)', () => {
    expect(contactConfig.path).toBe('/api/contact');
    expect(contactConfig.rateLimit).toEqual({ windowLimit: 20, windowSize: 60, aggregateBy: ['ip', 'domain'] });
  });

  it('default export answers 405 to GET', async () => {
    const res = await contactFunction(new Request(ENDPOINT, { method: 'GET' }), fakeContext());
    expect(res.status).toBe(405);
    expect(res.headers.get('allow')).toBe('POST');
  });

  it('default export delivers through the real wiring, falling back to the in-memory store without Netlify Blobs', async () => {
    const res = await contactFunction(post(validBody({ t: Date.now() - 15_000 })), fakeContext());
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });

    expect(calls).toHaveLength(1);
    expect(calls[0]?.url).toBe(`https://api.telegram.org/bot${WIRING_TOKEN}/sendMessage`);
    expect(calls[0]?.json).not.toHaveProperty('parse_mode');
    expect(calls[0]?.init?.signal).toBeInstanceOf(AbortSignal);

    const lines = [...vi.mocked(console.log).mock.calls, ...vi.mocked(console.warn).mock.calls, ...vi.mocked(console.error).mock.calls].map((c) => String(c[0]));
    expect(lines.some((line) => line.includes('"event":"rate_limit_store"') && line.includes('"backend":"memory"'))).toBe(true);
    expect(lines.some((line) => line.includes('"event":"contact_delivered"'))).toBe(true);
    const dump = lines.join('\n');
    expect(dump).not.toContain(WIRING_TOKEN);
    expect(dump).not.toContain('John');
    expect(dump).not.toContain(IP);
  });
});


// ---------------------------------------------------------------------------
// Post-audit hardening
// ---------------------------------------------------------------------------

describe('post-audit hardening', () => {
  it('rateLimitIdentity reduces IPv6 to its /64 prefix and leaves IPv4 untouched', () => {
    expect(rateLimitIdentity('203.0.113.7')).toBe('203.0.113.7');
    const a = rateLimitIdentity('2001:db8:abcd:1234:ffff:ffff:ffff:1');
    const b = rateLimitIdentity('2001:DB8:abcd:1234::9');
    expect(a).toBe('2001:0db8:abcd:1234::/64');
    expect(b).toBe(a);
    expect(rateLimitIdentity('[2001:db8:abcd:1234::1]')).toBe(a);
    expect(rateLimitIdentity('fe80::1%eth0')).toBe('fe80:0000:0000:0000::/64');
    expect(rateLimitIdentity('2001:db8:abcd:1235::1')).not.toBe(a);
    expect(rateLimitIdentity('::zz:1')).toBe('::zz:1'); // unparsable → used as given
  });

  it('two IPv6 addresses from one /64 share the rate-limit budget', async () => {
    const h = harness({ env: { ...TELEGRAM_ENV, CONTACT_RATE_LIMIT: '2' } });
    expect((await send(h, post(validBody()), '2001:db8:abcd:1234::1')).res.status).toBe(200);
    expect((await send(h, post(validBody()), '2001:db8:abcd:1234:aaaa::2')).res.status).toBe(200);
    const third = await send(h, post(validBody()), '2001:db8:abcd:1234:bbbb::3');
    expect(third.res.status).toBe(429);
    expect(await hashIp('2001:db8:abcd:1234::1')).toBe(await hashIp('2001:db8:abcd:1234:ffff::ffff'));
  });

  it('clientIp prefers context.ip over any forwarded header (spoof-proof)', () => {
    const req = new Request(ENDPOINT, { method: 'POST', headers: { 'x-forwarded-for': '198.51.100.9, 10.0.0.1', 'x-nf-client-connection-ip': '198.51.100.10' } });
    expect(clientIp(req, { ip: IP })).toBe(IP);
    expect(clientIp(req, {})).toBe('198.51.100.10');
    expect(clientIp(new Request(ENDPOINT, { method: 'POST', headers: { 'x-forwarded-for': ' 198.51.100.9 , 10.0.0.1' } }), {})).toBe('198.51.100.9');
    expect(clientIp(new Request(ENDPOINT, { method: 'POST' }), {})).toBe('unknown');
  });

  it('redact masks bot tokens in URLs and any configured secret', () => {
    const text = `POST https://api.telegram.org/bot${TOKEN}/sendMessage failed; key=${RESEND_KEY}`;
    const out = redact(text, [TOKEN, RESEND_KEY]);
    expect(out).not.toContain(TOKEN);
    expect(out).not.toContain(RESEND_KEY);
    expect(out).toContain('/bot[redacted]/');
    expect(redact('short', ['abc'])).toBe('short'); // secrets shorter than 4 chars are ignored
  });

  it('malformed Telegram settings count as not configured (loud 503 + log)', async () => {
    const h = harness({ env: { URL: SITE, CONTEXT: 'production', TELEGRAM_BOT_TOKEN: 'not-a-token', TELEGRAM_CHAT_ID: '4242' } });
    const { res, body } = await send(h, post(validBody()));
    expect(res.status).toBe(503);
    expect(body).toEqual({ ok: false, error: 'not_configured' });
    expect(hasLog(h, 'telegram_env_malformed')).toBe(true);
    expect(h.calls).toHaveLength(0);

    const badChat = harness({ env: { URL: SITE, CONTEXT: 'production', TELEGRAM_BOT_TOKEN: TOKEN, TELEGRAM_CHAT_ID: 'channel' } });
    expect((await send(badChat, post(validBody()))).res.status).toBe(503);
  });
});
