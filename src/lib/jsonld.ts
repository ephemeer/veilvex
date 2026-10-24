/**
 * Localized JSON-LD (schema.org) for <head>, built from the page's i18n content so every language
 * describes the same entities in its own words:
 *
 *   Organization (one @id for the whole site) ← WebSite (per language) ← WebPage (per page)
 *   + on the home pages: 9 Service nodes (listed in the Organization's OfferCatalog) and a FAQPage.
 *
 * Serialise with serializeJsonLd(): it escapes <, >, & and U+2028/2029 so the JSON can never close
 * the <script type="application/ld+json"> data block (CSP does not apply to data blocks).
 */
import type { Content, Lang } from '../i18n/types';
import { LANGS, localePath, plain } from '../i18n';

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

export function buildJsonLd({ lang, t, site, path, title, description, scope }: JsonLdInput): JsonLdGraph | null {
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

    graph.push(...services, faq);
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
