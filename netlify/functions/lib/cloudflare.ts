/**
 * Cloudflare Pages adapter for the contact handler (contact-core.ts is host-agnostic: Web Crypto, fetch, zod).
 * Pure and testable; the route file functions/api/contact.ts only wires the Pages context into it.
 *
 * - Env: the project's variables and secrets (strings only). `CONTEXT` is pinned to 'production' so the
 *   core never accepts localhost origins here, and the request's own origin is the allowed origin — the form
 *   is served from the same host as the function, so that is exactly a same-origin check (SITE_URL, when set,
 *   adds the canonical domain).
 * - Client IP: Cloudflare's `CF-Connecting-IP`.
 * - Rate-limit store: Workers KV (binding RATE_LIMIT) with expirationTtl, so a hashed-address record deletes
 *   itself shortly after its window; without the binding, an in-memory store (per isolate) keeps the form
 *   working and the event is logged.
 */
import { createContactHandler, createMemoryStore } from './contact-core.ts';
import type { ContactHandler, LogFields, Logger, RateLimitStore } from './contact-core.ts';

/** The part of a Workers KV namespace the store needs. */
export interface KvLike {
  get(key: string, type: 'json'): Promise<unknown>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

const line = (level: string, event: string, fields?: LogFields) => JSON.stringify({ level, event, ...fields, ts: new Date().toISOString() });
export const cfLogger: Logger = {
  info: (e, f) => console.log(line('info', e, f)),
  warn: (e, f) => console.warn(line('warn', e, f)),
  error: (e, f) => console.error(line('error', e, f)),
};

/** KV-backed store; KV's minimum TTL is 60 s. */
export function kvStore(kv: KvLike, now: () => number = Date.now): RateLimitStore {
  return {
    async get(key) {
      const v = await kv.get(key, 'json');
      return Array.isArray(v) ? (v as number[]) : null;
    },
    async set(key, hits, expiresAt) {
      const ttl = Math.max(60, Math.ceil((expiresAt - now()) / 1000));
      await kv.put(key, JSON.stringify(hits), { expirationTtl: ttl });
    },
  };
}

export function cfEnv(raw: Record<string, unknown>, requestUrl: string): Record<string, string | undefined> {
  const env: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(raw)) if (typeof v === 'string') env[k] = v;
  env.CONTEXT = 'production';
  env.URL = new URL(requestUrl).origin;
  delete env.NETLIFY_DEV;
  return env;
}

let memory: RateLimitStore | null = null;

/** One handler per request: env and bindings come with the request on Workers. */
export function handleCloudflare(request: Request, rawEnv: Record<string, unknown>, log: Logger = cfLogger): Promise<Response> {
  const kv = rawEnv.RATE_LIMIT as KvLike | undefined;
  let store: RateLimitStore;
  if (kv && typeof kv.get === 'function' && typeof kv.put === 'function') store = kvStore(kv);
  else {
    if (!memory) {
      memory = createMemoryStore();
      log.warn('rate_limit_store', { backend: 'memory', reason: 'kv_binding_missing' });
    }
    store = memory;
  }
  const handler: ContactHandler = createContactHandler({
    fetch: (input, init) => globalThis.fetch(input, init),
    now: () => Date.now(),
    env: cfEnv(rawEnv, request.url),
    store,
    log,
  });
  return handler(request, { ip: request.headers.get('CF-Connecting-IP') ?? undefined });
}
