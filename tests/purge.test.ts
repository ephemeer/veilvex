import { describe, expect, it } from 'vitest';
import { purgeExpired, type PurgeStore } from '../netlify/functions/lib/purge.ts';

function fakeStore(entries: Record<string, number | null>): PurgeStore & { left: () => string[] } {
  const data = new Map(Object.entries(entries));
  return {
    async *keys() {
      for (const k of [...data.keys()]) yield k;
    },
    async expiresAt(k) {
      return data.get(k) ?? null;
    },
    async remove(k) {
      data.delete(k);
    },
    left: () => [...data.keys()].sort(),
  };
}

describe('rate-limit purge', () => {
  it('removes expired records and those without an expiry, keeps live ones', async () => {
    const s = fakeStore({ old: 1_000, edge: 5_000, live: 9_000, broken: null });
    expect(await purgeExpired(s, 5_000)).toEqual({ checked: 4, removed: 3 });
    expect(s.left()).toEqual(['live']);
  });
  it('an empty store is fine', async () => {
    expect(await purgeExpired(fakeStore({}), Date.now())).toEqual({ checked: 0, removed: 0 });
  });
});
