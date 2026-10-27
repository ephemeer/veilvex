/**
 * <head> data of a case-study page (src/pages/cases/[slug].astro and its [lang] twin): the path without
 * the language prefix, a unique <title> and description, and the facts the JSON-LD Article is built from
 * (src/lib/jsonld.ts).
 */
import type { Content, Lang } from '../i18n/types';
import { CASE_META, CASE_SLUGS, casePath, getCaseDetails, type CaseSlug } from '../i18n/cases';
import type { CaseStudyLd } from './jsonld';

export function caseSeo(lang: Lang, t: Content, slug: CaseSlug) {
  const { labels, items } = getCaseDetails(lang);
  const i = CASE_SLUGS.indexOf(slug);
  const card = t.cases.items[i]!;
  const d = items[slug];
  const shot = CASE_META[slug].shots[0];
  const caseStudy: CaseStudyLd = {
    position: i + 1,
    name: card.title,
    description: d.description,
    abstract: d.result,
    genre: card.kind,
    keywords: d.tags,
    sections: d.sections.map((s) => s.title),
    image: shot ? { path: `/cases/${slug}/${shot.n}.webp`, width: shot.width, height: shot.height, caption: d.shots[0] ?? card.title } : undefined,
  };
  return {
    path: casePath(slug),
    title: `${card.title} — ${labels.titleSuffix.replace('{brand}', t.brand)}`,
    description: d.description,
    caseStudy,
  };
}
