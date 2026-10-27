/**
 * Localized JSON-LD (schema.org) for <head>, built from the page's i18n content so every language
 * describes the same entities in its own words:
 *
 *   Organization (one @id for the whole site) ← WebSite (per language) ← WebPage (per page)
 *   + on the home pages: 9 Service nodes (listed in the Organization's OfferCatalog), the 12 cases as an
 *     ItemList of CreativeWork nodes (@id = the #case-N deep link that opens the case sheet, url = the case's
 *     own page) and a FAQPage.
 *   + on a case-study page (/cases/<slug>/): an Article (@id = <page>#case) as the WebPage's main entity, and
 *     a three-step BreadcrumbList (home → cases → the case).
 *
 * Serialise with serializeJsonLd(): it escapes <, >, & and U+2028/2029 so the JSON can never close
 * the <script type="application/ld+json"> data block (CSP does not apply to data blocks).
 */
import type { Content, Lang } from '../i18n/types';
import { LANGS, localePath, plain } from '../i18n';
import { CASE_SLUGS, casePath } from '../i18n/cases/meta';

/** 'home' = full graph, 'page' = Organization + WebSite + WebPage + breadcrumbs, 'none' = no JSON-LD (noindex pages). */
export type SchemaScope = 'home' | 'page' | 'none';

export interface JsonLdInput {
  lang: Lang;
  t: Content;
  /** Astro.site — the absolute origin of the deployment */
  site: URL;
  /** Page path without the language prefix, e.g. '/' or '/privacy' */
  path: string;
  /** The page <title> */
  title: string;
  /** The meta description, plain text */
  description: string;
  scope: SchemaScope;
  /** a case-study page: its Article (scope 'page' only) */
  caseStudy?: CaseStudyLd;
}

/** What a case-study page tells the JSON-LD builder (src/lib/case-seo.ts). */
export interface CaseStudyLd {
  /** 1-based position among the cases (the #case-N of the home page) */
  position: number;
  name: string;
  description: string;
  /** the result line */
  abstract: string;
  /** the direction label (website / ads / design …) */
  genre: string;
  keywords: string[];
  /** section headings, in order */
  sections: string[];
  /** first screenshot, site-relative path */
  image?: { path: string; width: number; height: number; caption: string };
}

export type JsonLdNode = Record<string, unknown>;

export interface JsonLdGraph {
  '@context': 'https://schema.org';
  '@graph': JsonLdNode[];
}

/** Short, localized description of the OG cover (also used for og:image:alt). */
export function ogImageAlt(t: Content): string {
  return `${t.brand} — ${plain(t.hero.eyebrow)}`;
}

export function buildJsonLd({ lang, t, site, path, title, description, scope, caseStudy }: JsonLdInput): JsonLdGraph | null {
  if (scope === 'none') return null;

  const origin = new URL('/', site).href; // https://host/
  const homeUrl = new URL(localePath(lang, '/'), site).href; // https://host/en/
  const pageUrl = new URL(localePath(lang, path), site).href;
  const anchor = (id: string) => `${homeUrl}#${id}`;

  const orgId = `${origin}#organization`;
  const logoId = `${origin}#logo`;
  const coverId = `${origin}#cover`;
  const websiteId = `${homeUrl}#website`;
  const serviceId = (id: string) => anchor(`service-${id}`);
  const locale = t.locale;
  const worldwide = 'Worldwide';

  const organization: JsonLdNode = {
    '@type': 'Organization',
    '@id': orgId,
    name: t.brand,
    url: homeUrl,
    logo: { '@id': logoId },
    image: { '@id': coverId },
    description: plain(t.meta.description),
    slogan: plain(t.hero.eyebrow),
    knowsLanguage: LANGS,
    areaServed: worldwide,
    contactPoint: {
      '@type': 'ContactPoint',
      name: t.contact.form.title,
      contactType: 'sales',
      url: anchor('contact'),
      availableLanguage: LANGS,
    },
  };

  const logo: JsonLdNode = {
    '@type': 'ImageObject',
    '@id': logoId,
    url: `${origin}favicon.svg`,
    contentUrl: `${origin}favicon.svg`,
    caption: t.brand,
  };

  const cover: JsonLdNode = {
    '@type': 'ImageObject',
    '@id': coverId,
    url: `${origin}og.png`,
    contentUrl: `${origin}og.png`,
    width: 1200,
    height: 630,
    caption: ogImageAlt(t),
  };

  const website: JsonLdNode = {
    '@type': 'WebSite',
    '@id': websiteId,
    url: homeUrl,
    name: t.brand,
    description: plain(t.meta.description),
    inLanguage: locale,
    publisher: { '@id': orgId },
  };

  const webpage: JsonLdNode = {
    '@type': 'WebPage',
    '@id': pageUrl,
    url: pageUrl,
    name: title,
    description,
    inLanguage: locale,
    isPartOf: { '@id': websiteId },
    about: { '@id': orgId },
    primaryImageOfPage: { '@id': coverId },
  };

  const graph: JsonLdNode[] = [organization, logo, cover, website, webpage];

  if (scope === 'home') {
    const services: JsonLdNode[] = t.services.items.map((s) => ({
      '@type': 'Service',
      '@id': serviceId(s.id),
      name: s.title,
      serviceType: s.title,
      description: s.desc,
      url: anchor('services'),
      provider: { '@id': orgId },
      areaServed: worldwide,
      offers: { '@type': 'Offer', description: s.price, url: anchor('contact') },
    }));

    organization.hasOfferCatalog = {
      '@type': 'OfferCatalog',
      '@id': anchor('services'),
      name: t.services.tag,
      url: anchor('services'),
      itemListElement: t.services.items.map((s, i) => ({ '@type': 'ListItem', position: i + 1, item: { '@id': serviceId(s.id) } })),
    };

    const faq: JsonLdNode = {
      '@type': 'FAQPage',
      '@id': anchor('faq'),
      url: anchor('faq'),
      name: t.faq.title,
      inLanguage: locale,
      isPartOf: { '@id': pageUrl },
      mainEntity: t.faq.items.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    };

    // the cases: each CreativeWork is addressable — its @id/url opens the case sheet (Cases.astro)
    const caseId = (i: number) => anchor(`case-${i + 1}`);
    const works: JsonLdNode[] = t.cases.items.map((c, i) => ({
      '@type': 'CreativeWork',
      '@id': caseId(i),
      url: CASE_SLUGS[i] ? new URL(localePath(lang, casePath(CASE_SLUGS[i])), site).href : caseId(i),
      name: c.title,
      description: c.lead,
      abstract: c.result,
      genre: c.kind,
      keywords: c.tags,
      inLanguage: locale,
      author: { '@id': orgId },
      isPartOf: { '@id': pageUrl },
    }));
    const caseList: JsonLdNode = {
      '@type': 'ItemList',
      '@id': anchor('cases'),
      url: anchor('cases'),
      name: t.cases.title,
      numberOfItems: works.length,
      itemListElement: works.map((w, i) => ({ '@type': 'ListItem', position: i + 1, item: { '@id': w['@id'] } })),
    };

    graph.push(...services, caseList, ...works, faq);
  } else if (caseStudy) {
    // a case-study page: the Article is what the page is about; the same case on the home page is the
    // CreativeWork <home>#case-N, linked both ways (isBasedOn here, url there)
    const articleId = `${pageUrl}#case`;
    const imageNode: JsonLdNode | null = caseStudy.image
      ? {
          '@type': 'ImageObject',
          '@id': `${pageUrl}#screenshot`,
          url: new URL(caseStudy.image.path, site).href,
          contentUrl: new URL(caseStudy.image.path, site).href,
          width: caseStudy.image.width,
          height: caseStudy.image.height,
          caption: caseStudy.image.caption,
        }
      : null;
    webpage.mainEntity = { '@id': articleId };
    webpage.breadcrumb = { '@id': `${pageUrl}#breadcrumb` };
    if (imageNode) webpage.primaryImageOfPage = { '@id': imageNode['@id'] };
    graph.push({
      '@type': 'Article',
      '@id': articleId,
      url: pageUrl,
      headline: caseStudy.name,
      name: caseStudy.name,
      description: caseStudy.description,
      abstract: caseStudy.abstract,
      genre: caseStudy.genre,
      keywords: caseStudy.keywords.join(', '),
      articleSection: caseStudy.sections,
      inLanguage: locale,
      author: { '@id': orgId },
      publisher: { '@id': orgId },
      image: { '@id': imageNode ? imageNode['@id'] : coverId },
      mainEntityOfPage: { '@id': pageUrl },
      isPartOf: { '@id': websiteId },
      isBasedOn: { '@id': anchor(`case-${caseStudy.position}`) },
    });
    if (imageNode) graph.push(imageNode);
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': `${pageUrl}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: t.brand, item: homeUrl },
        { '@type': 'ListItem', position: 2, name: t.cases.tag, item: anchor('cases') },
        { '@type': 'ListItem', position: 3, name: caseStudy.name, item: pageUrl },
      ],
    });
  } else {
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': `${pageUrl}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: t.brand, item: homeUrl },
        { '@type': 'ListItem', position: 2, name: title, item: pageUrl },
      ],
    });
  }

  return { '@context': 'https://schema.org', '@graph': graph };
}

const JSON_ESC: Record<string, string> = {
  '<': '\\u003c',
  '>': '\\u003e',
  '&': '\\u0026',
  '\u2028': '\\u2028',
  '\u2029': '\\u2029',
};

/** JSON.stringify that is safe to embed in an HTML <script> data block (no "</script>", no "<!--"). */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/[<>&\u2028\u2029]/g, (c) => JSON_ESC[c] ?? c);
}
