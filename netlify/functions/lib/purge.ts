/**
 * Removes rate-limit records whose window has passed. The contact function writes one record per hashed
 * client address with its expiry (epoch ms) in the metadata; Netlify Blobs has no TTL of its own, so without
 * this the hashes would stay forever — and the Privacy Policy promises they don't.
 */
export interface PurgeStore {
  keys(): AsyncIterable<string>;
  expiresAt(key: string): Promise<number | null>;
  remove(key: string): Promise<void>;
}

export async function purgeExpired(store: PurgeStore, now: number): Promise<{ checked: number; removed: number }> {
  let checked = 0;
  let removed = 0;
  for await (const key of store.keys()) {
    checked++;
    const exp = await store.expiresAt(key);
    // a record without a readable expiry is stale by definition: the limiter always writes one
    if (exp === null || !Number.isFinite(exp) || exp <= now) {
      await store.remove(key);
      removed++;
    }
  }
  return { checked, removed };
}
