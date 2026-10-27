/**
 * Content model of the case-study pages (src/components/CasePage.astro). One module per language
 * (ru.ts, en.ts, az.ts, de.ts) exports a `CaseDetails`; `items` is a Record over every slug, so
 * TypeScript fails the build when a language misses a case or a case misses a field.
 *
 * The case title, its kind (direction label) and its type come from `cases.items` in the main i18n
 * files — the same words as on the card and in the case sheet.
 *
 * Section ids are the in-page anchors (#work, #timeline …) and must be the same in every language, so a
 * language switch keeps the reader on the same section (tests/case-details.test.ts checks it).
 */
import type { CaseSlug } from './meta';

/** One piece of a section body. `ol` is for real sequences (steps, statuses), `stats` for headline numbers. */
export type CaseBlock =
  | { p: string }
  | { ul: string[] }
  | { ol: string[] }
  | { stats: { value: string; label: string }[] };

export interface CaseSection {
  /** stable anchor id, identical in all languages, unique within the page */
  id: string;
  title: string;
  blocks: CaseBlock[];
}

export interface CaseDetail {
  /** meta description: one sentence, ≤ 160 characters */
  description: string;
  /** the opening paragraph under the H1 */
  lead: string;
  /** the result in one line (hero) */
  result: string;
  /** technologies / channels, one chip each */
  tags: string[];
  /** headline facts next to the result: timeline, delivery date, cost or budget (label → value) */
  facts: { label: string; value: string }[];
  /** numbered sections, in reading order (the table of contents lists them) */
  sections: CaseSection[];
  /** alt text of each screenshot in CASE_META[slug].shots, same order */
  shots: string[];
}

/** Page chrome. `{brand}` in titleSuffix is replaced with the brand name. */
export interface CaseLabels {
  titleSuffix: string; // "кейс {brand}" → "Alfanet — кейс Veilvex"
  crumbs: string; // aria-label of the breadcrumb nav
  home: string; // breadcrumb root
  breadcrumb: string; // "Кейсы" → /#cases
  toc: string; // table of contents heading / phone toggle
  live: string; // live-site button
  newTab: string; // screen-reader note on external links
  readFull: string; // the case sheet's link to this page
  cta: string; // "Обсудить похожий проект"
  ctaTitle: string;
  ctaText: string;
  prev: string;
  next: string;
  all: string; // "Все кейсы"
  of: string; // "Кейс 03 из 12"
}

export interface CaseDetails {
  labels: CaseLabels;
  items: Record<CaseSlug, CaseDetail>;
}
