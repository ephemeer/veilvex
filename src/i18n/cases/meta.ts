/**
 * Language-independent facts of the 12 case-study pages (/cases/<slug>/): the URL slug, the live client
 * site (per language, where the client site has that language — otherwise its closest version) and the
 * screenshots under public/cases/<slug>/. Order = the order of `cases.items` in src/i18n/*.ts: entry i
 * is case i + 1 (#case-N in the case sheet).
 *
 * Plain data with type-only imports, so Node can load it as-is (scripts/gen-llms.mjs).
 */
import type { CaseType, Lang } from '../types';

export const CASE_SLUGS = [
  'mybuild',
  'target-english-courses',
  'alfanet',
  'target-personal-profile',
  'shp',
  'yakitori-site',
  'target-body-massage',
  'deniz-service',
  'expert-solutions',
  'konteks',
  'oqni-baku',
  'yakitori-menu',
] as const;

export type CaseSlug = (typeof CASE_SLUGS)[number];

export interface CaseShot {
  /** file stem under public/cases/<slug>/: `<n>.webp` (1280 wide) and `<n>-640.webp` */
  n: number;
  width: number; // of the 1280 file
  height: number;
}

export interface CaseMeta {
  slug: CaseSlug;
  /** the live client site, per page language; absent when there is no public site to show */
  live?: Record<Lang, string>;
  /** real screenshots of the client site (alt text per language lives in the CaseDetail) */
  shots: CaseShot[];
}

const same = (url: string): Record<Lang, string> => ({ ru: url, en: url, az: url, de: url });

export const CASE_META: Record<CaseSlug, CaseMeta> = {
  mybuild: { slug: 'mybuild', shots: [] },
  'target-english-courses': { slug: 'target-english-courses', shots: [] },
  alfanet: {
    slug: 'alfanet',
    live: { ru: 'https://alfanet.az/ru/main/', en: 'https://alfanet.az/', az: 'https://alfanet.az/', de: 'https://alfanet.az/' },
    shots: [],
  },
  'target-personal-profile': { slug: 'target-personal-profile', shots: [] },
  shp: {
    slug: 'shp',
    live: { ru: 'https://shp.az/ru', en: 'https://shp.az/', az: 'https://shp.az/az', de: 'https://shp.az/' },
    shots: [],
  },
  'yakitori-site': {
    slug: 'yakitori-site',
    live: { ru: 'https://yakitori.az/', en: 'https://yakitori.az/', az: 'https://yakitori.az/az', de: 'https://yakitori.az/' },
    shots: [],
  },
  'target-body-massage': { slug: 'target-body-massage', shots: [] },
  'deniz-service': {
    slug: 'deniz-service',
    live: same('https://denizservice.com/'),
    shots: [],
  },
  'expert-solutions': {
    slug: 'expert-solutions',
    live: same('https://www.expertsolutions.az/'),
    shots: [],
  },
  konteks: {
    slug: 'konteks',
    live: { ru: 'https://konteks.net/ru', en: 'https://konteks.net/en', az: 'https://konteks.net/az', de: 'https://konteks.net/en' },
    shots: [],
  },
  'oqni-baku': {
    slug: 'oqni-baku',
    // no live link: the source only had a Vercel preview URL with a personal account name in it
    shots: [],
  },
  'yakitori-menu': { slug: 'yakitori-menu', shots: [] },
};

/** The request-form service a case's CTA preselects (contact.ts reads ?service=), by case type. */
export const CASE_SERVICE: Record<CaseType, string> = { web: 'site', app: 'app', ads: 'ads', design: 'design' };

/** Path of a case page without the language prefix — pass it through localePath(). */
export const casePath = (slug: CaseSlug): string => `/cases/${slug}`;
