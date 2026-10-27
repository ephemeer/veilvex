import { afterEach, describe, expect, it, vi } from 'vitest';
import { cfEnv, handleCloudflare, kvStore, type KvLike } from '../netlify/functions/lib/cloudflare.ts';
import type { Logger } from '../netlify/functions/lib/contact-core.ts';

const HOST = 'https://veilvex.pages.dev';
const quiet: Logger = { info() {}, warn() {}, error() {} };

function fakeKv() {
  const data = new Map<string, { value: string; ttl?: number }>();
  const kv: KvLike & { data: typeof data } = {
    data,
    async get(key) {
      const e = data.get(key);
      return e ? JSON.parse(e.value) : null;
    },
    async put(key, value, options) {
      data.set(key, { value, ttl: options?.expirationTtl });
    },
  };
  return kv;
}

function request(origin: string, ip = '203.0.113.7', body: Record<string, unknown> = {}) {
  return new Request(`${HOST}/api/contact`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin, 'sec-fetch-site': origin === HOST ? 'same-origin' : 'cross-site', 'CF-Connecting-IP': ip },
    body: JSON.stringify({ name: 'John Doe', contact: '+1 555 010 0100', services: ['site'], message: 'Hi', consent: true, lang: 'en', website: '', t: Date.now() - 15_000, ...body }),
  });
}

afterEach(() => vi.unstubAllGlobals());

describe('Cloudflare adapter', () => {
  it('pins production and allows exactly the request origin', () => {
    const env = cfEnv({ NETLIFY_DEV: 'true', TELEGRAM_CHAT_ID: '1', RATE_LIMIT: {} }, `${HOST}/api/contact`);
    expect(env.CONTEXT).toBe('production');
    expect(env.URL).toBe(HOST);
    expect(env.NETLIFY_DEV).toBeUndefined();
    expect(env.TELEGRAM_CHAT_ID).toBe('1');
    expect('RATE_LIMIT' in env).toBe(false);
  });

  it('KV records expire with the window (never under KV’s 60 s minimum)', async () => {
    const kv = fakeKv();
    const store = kvStore(kv, () => 1_000_000);
    await store.set('a', [1, 2], 1_000_000 + 600_000);
    await store.set('b', [3], 1_000_000 + 5_000);
    expect(kv.data.get('a')?.ttl).toBe(600);
    expect(kv.data.get('b')?.ttl).toBe(60);
    expect(await store.get('a')).toEqual([1, 2]);
    expect(await store.get('none')).toBeNull();
  });

  it('a cross-site post is refused; a same-origin post reaches delivery and is rate-limited by IP through KV', async () => {
    const sent: string[] = [];
    vi.stubGlobal('fetch', async (input: RequestInfo | URL) => {
      sent.push(String(input));
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } });
    });
    const kv = fakeKv();
    const env = { RATE_LIMIT: kv, TELEGRAM_BOT_TOKEN: '123456789:AAHunitTestToken_abcdefghijklmnopqrstuvwxyz', TELEGRAM_CHAT_ID: '42' };
    expect((await handleCloudflare(request('https://evil.example'), env, quiet)).status).toBe(403);
    const ok = await handleCloudflare(request(HOST), env, quiet);
    expect(ok.status).toBe(200);
    expect(sent.some((u) => u.startsWith('https://api.telegram.org/'))).toBe(true);
    let last = 200;
    for (let i = 0; i < 6; i++) last = (await handleCloudflare(request(HOST), env, quiet)).status;
    expect(last).toBe(429);
    expect([...kv.data.keys()].length).toBeGreaterThan(0);
    for (const e of kv.data.values()) expect(e.ttl).toBeGreaterThanOrEqual(60);
  });
});
