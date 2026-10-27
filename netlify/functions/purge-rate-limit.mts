/**
 * Daily clean-up of the contact form's rate-limit store (Netlify scheduled function: it has no public URL).
 * Deletes every hashed-address record whose window is over, so nothing outlives its 10-minute purpose by
 * more than a day (Privacy Policy, retention).
 */
import { getStore } from '@netlify/blobs';
import type { Config } from '@netlify/functions';
import { purgeExpired } from './lib/purge.ts';

const STORE_NAME = 'contact-rate-limit';

export default async (): Promise<Response> => {
  const blobs = getStore({ name: STORE_NAME, consistency: 'strong' });
  const result = await purgeExpired(
    {
      async *keys() {
        for await (const page of blobs.list({ paginate: true })) for (const b of page.blobs) yield b.key;
      },
      async expiresAt(key) {
        const meta = await blobs.getMetadata(key);
        const v = Number(meta?.metadata?.expiresAt);
        return Number.isFinite(v) ? v : null;
      },
      remove: (key) => blobs.delete(key),
    },
    Date.now(),
  );
  console.log(JSON.stringify({ event: 'rate_limit_purge', ...result }));
  return new Response(null, { status: 204 });
};

export const config: Config = { schedule: '@daily' };
