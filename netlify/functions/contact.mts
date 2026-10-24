/// <reference types="node" />
/**
 * POST /api/contact — Netlify Functions v2 entry point.
 *
 * All request logic lives in ./lib/contact-core.ts (pure, unit-tested). This file only wires the
 * real dependencies: process/Netlify env, global fetch, the clock, a Netlify Blobs rate-limit store
 * (with an in-memory fallback for local dev) and a JSON console logger.
 */
import { getStore } from '@netlify/blobs';
import type { Config, Context } from '@netlify/functions';
import { createContactHandler, createMemoryStore } from './lib/contact-core.ts';
import type { ContactHandler, LogFields, Logger, RateLimitStore } from './lib/contact-core.ts';

const STORE_NAME = 'contact-rate-limit';

// ---------------------------------------------------------------------------
// Logging: one JSON line per event. The core never passes user content or secrets here.
// ---------------------------------------------------------------------------

function formatLine(level: string, event: string, fields?: LogFields): string {
  return JSON.stringify({ level, event, ...fields, ts: new Date().toISOString() });
}

const logger: Logger = {
  info: (event, fields) => console.log(formatLine('info', event, fields)),
  warn: (event, fields) => console.warn(formatLine('warn', event, fields)),
  error: (event, fields) => console.error(formatLine('error', event, fields)),
};

// ---------------------------------------------------------------------------
// Environment: process.env (Lambda / local scripts) merged with Netlify.env when available.
// ---------------------------------------------------------------------------

function readEnv(): Record<string, string | undefined> {
  const env: Record<string, string | undefined> = { ...process.env };
  if (typeof Netlify !== 'undefined' && Netlify?.env && typeof Netlify.env.toObject === 'function') {
    try {
      Object.assign(env, Netlify.env.toObject());
    } catch {
      // ignore: process.env is enough
    }
  }
  return env;
}

// ---------------------------------------------------------------------------
// Rate-limit store: Netlify Blobs (strong consistency), created lazily on the first request.
// Outside Netlify (`npm run api:dev`, tests) getStore() throws → in-memory store. If Blobs fails at
// runtime the instance also degrades to memory (logged) instead of crashing or losing the limit.
// ---------------------------------------------------------------------------

function errorName(err: unknown): string {
  return err instanceof Error ? err.name : 'unknown';
}

function createRateLimitStore(log: Logger): RateLimitStore {
  let backend: RateLimitStore | null = null;

  const useMemory = (reason: string, err?: unknown): RateLimitStore => {
    log.warn('rate_limit_store', { backend: 'memory', reason, error: err === undefined ? undefined : errorName(err) });
    backend = createMemoryStore();
    return backend;
  };

  const resolve = (): RateLimitStore => {
    if (backend) return backend;
    try {
      const blobs = getStore({ name: STORE_NAME, consistency: 'strong' });
      backend = {
        async get(key) {
          const value: unknown = await blobs.get(key, { type: 'json' });
          return Array.isArray(value) ? (value as number[]) : null;
        },
        async set(key, hits, expiresAt) {
          await blobs.setJSON(key, hits, { metadata: { expiresAt } });
        },
      };
      log.info('rate_limit_store', { backend: 'netlify-blobs' });
      return backend;
    } catch (err) {
      return useMemory('blobs_unavailable', err);
    }
  };

  return {
    async get(key) {
      try {
        return await resolve().get(key);
      } catch (err) {
        return useMemory('blobs_read_failed', err).get(key);
      }
    },
    async set(key, hits, expiresAt) {
      try {
        await resolve().set(key, hits, expiresAt);
      } catch (err) {
        await useMemory('blobs_write_failed', err).set(key, hits, expiresAt);
      }
    },
  };
}

// ---------------------------------------------------------------------------
// Handler (built on the first request so env + store are read at runtime, not at bundle time)
// ---------------------------------------------------------------------------

let handler: ContactHandler | undefined;

function getHandler(): ContactHandler {
  if (!handler) {
    handler = createContactHandler({
      fetch: (input, init) => globalThis.fetch(input, init),
      now: () => Date.now(),
      env: readEnv(),
      store: createRateLimitStore(logger),
      log: logger,
    });
  }
  return handler;
}

export default async (req: Request, context: Context): Promise<Response> => getHandler()(req, context);

export const config: Config = {
  path: '/api/contact',
  // Platform-level limit (edge, before the function runs). The application-level sliding window
  // (5 submissions / 10 min per IP by default) is enforced inside the function.
  rateLimit: { windowLimit: 20, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
