/// <reference types="node" />
/**
 * Case-study content (src/i18n/cases/*.ts): what TypeScript cannot check on its own — the same section
 * anchors in every language (a language switch keeps #section), one alt text per screenshot, real
 * screenshot files of a sane weight, meta descriptions of search-snippet length, money in dollars only and
 * nothing carried over from the source material (another agency's name or contacts).
 */
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { CASE_DETAILS, CASE_META, CASE_SLUGS } from '../src/i18n/cases';
import { LANGS } from '../src/i18n';

const PUBLIC = path.resolve(__dirname, '..', 'public');

describe('case details', () => {
  it('every language has every case, with the same section anchors in the same order', () => {
    for (const slug of CASE_SLUGS) {
      const ids = (lang: (typeof LANGS)[number]) => CASE_DETAILS[lang].items[slug].sections.map((s) => s.id);
      for (const lang of LANGS) {
        const list = ids(lang);
        expect(list, `${lang}/${slug}`).toEqual(ids('en'));
        expect(new Set(list).size, `${lang}/${slug}: unique ids`).toBe(list.length);
        expect(list.length, `${lang}/${slug}: sections`).toBeGreaterThanOrEqual(4);
      }
    }
  });

  it('one alt text per screenshot; every screenshot exists in both sizes and stays under 150 KB', () => {
    for (const slug of CASE_SLUGS) {
      const shots = CASE_META[slug].shots;
      for (const lang of LANGS) expect(CASE_DETAILS[lang].items[slug].shots.length, `${lang}/${slug}`).toBe(shots.length);
      for (const s of shots) {
        for (const file of [`${s.n}.webp`, `${s.n}-640.webp`]) {
          const p = path.join(PUBLIC, 'cases', slug, file);
          expect(fs.existsSync(p), p).toBe(true);
          expect(fs.statSync(p).size, p).toBeLessThanOrEqual(150_000);
        }
      }
    }
  });

  it('meta descriptions fit a search snippet and differ from each other', () => {
    for (const lang of LANGS) {
      const all = CASE_SLUGS.map((s) => CASE_DETAILS[lang].items[s].description);
      for (const d of all) expect(d.length, `${lang}: ${d}`).toBeLessThanOrEqual(160);
      expect(new Set(all).size).toBe(all.length);
    }
  });

  it('live links are https; money is in dollars; nothing from the source material', () => {
    for (const slug of CASE_SLUGS) for (const url of Object.values(CASE_META[slug].live ?? {})) expect(url).toMatch(/^https:\/\//);
    const text = JSON.stringify(CASE_DETAILS);
    expect(text).not.toMatch(/манат|\bAZN\b|₼|₽|рубл|\bmanat|euro|€/i);
    expect(text).not.toMatch(/my\s?digital\s?home|994\s?50\s?493|mdh@|wa\.me/i);
  });
});
