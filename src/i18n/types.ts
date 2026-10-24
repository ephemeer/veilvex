/**
 * Content model shared by all languages.
 * Every language file (ru.ts, en.ts, az.ts, de.ts) must export an object of this exact shape —
 * TypeScript fails the build if a translation is missing a field.
 *
 * Inline emphasis: wrap words in {{...}} to render them highlighted (lime) — e.g. "found in {{Google}}".
 * Line breaks in headlines: use "\n" where the design wants a forced break (desktop only).
 */

export type Lang = 'ru' | 'en' | 'az' | 'de';

export type CaseType = 'web' | 'app' | 'ads' | 'design';

export interface Stat {
  /** Numeric value to count up to (plain number, e.g. 95, 0.93, 9.3) */
  value: number;
  /** Decimal places when rendering (0 or 1 or 2) */
  decimals: number;
  prefix: string; // e.g. "$"
  suffix: string; // e.g. "%"
  label: string;
  sub: string;
}

export interface ServiceItem {
  id: string; // stable id used by the form's "what do you need" chips
  title: string;
  desc: string;
  bullets: [string, string, string];
  price: string; // e.g. "стоимость после аудита"
}

export interface Content {
  lang: Lang;
  locale: string; // BCP-47 for <html lang>, e.g. "ru-RU"
  brand: string; // "Veilvex"

  meta: {
    title: string;
    description: string;
    ogTitle: string;
    ogDescription: string;
  };

  nav: {
    services: string;
    process: string;
    geo: string;
    cases: string;
    pricing: string;
    contact: string;
    cta: string;
    menu: string;
    close: string;
    language: string;
    skipToContent: string;
  };

  /** ⌘K command bar: quick jumps between sections, languages and the request form. */
  command: {
    open: string; // trigger label for assistive tech, e.g. "Поиск и навигация"
    title: string; // dialog title (visually hidden) + listbox label
    placeholder: string;
    sections: string; // group: page sections
    actions: string; // group: actions
    request: string; // action: jump to the form and focus the name field
    current: string; // marker next to the active language
    empty: string; // "Nothing found"
    hintNav: string; // footer hint after ↑↓
    hintOpen: string; // footer hint after ↵
    hintClose: string; // footer hint after esc
    /** Extra search terms per item: lower-case, space separated synonyms, Latin spellings, product names. */
    keywords: {
      services: string;
      process: string;
      geo: string;
      cases: string;
      pricing: string;
      faq: string;
      contact: string;
      privacy: string;
      request: string;
      ru: string;
      en: string;
      az: string;
      de: string;
    };
  };

  hero: {
    eyebrow: string;
    title: string; // "\n" allowed
    lead: string;
    primary: string;
    secondary: string;
    badge: string; // small "new" pill, e.g. "GEO: продвижение в ответах ИИ"
    badgeLink: string; // link label, e.g. "Подробнее"
    live: string; // "ИИ анализирует ваш рынок"
    chips: { title: string; sub: string }[]; // 3 chips
  };

  /** Mock "product" UI shown under the hero (Linear-style screenshot). */
  mock: {
    appName: string;
    sidebar: string[]; // 5 items
    chartTitle: string;
    chartSub: string;
    kpis: { label: string; value: string; delta: string }[]; // 3
    feedTitle: string;
    feed: { text: string; meta: string }[]; // 3
    aiTitle: string;
    aiAnswer: string; // may contain {{brand}} highlight
    searchQuery: string; // "агентство digital-маркетинга"
    searchTop: string; // "1-е место, органика"
  };

  platforms: {
    tag: string;
    items: string[]; // text wordmarks for the marquee
  };

  about: {
    tag: string;
    text: string; // {{...}} highlights allowed
    stats: Stat[]; // 4
  };

  services: {
    tag: string;
    title: string; // "\n" allowed
    lead: string;
    items: ServiceItem[]; // 9
    more: string;
    discuss: string;
  };

  process: {
    tag: string;
    title: string;
    lead: string;
    steps: { title: string; desc: string; badge: string }[]; // 5
  };

  geo: {
    tag: string;
    title: string;
    lead: string; // {{GEO}} highlight allowed
    steps: { title: string; desc: string }[]; // 3
    models: string[]; // ChatGPT, Gemini, …
    chat: {
      name: string;
      status: string;
      typing: string;
      sample: string;
      question: string;
      answer: string; // may contain {{brand}}
      meter: string;
    };
    more: string;
  };

  trust: {
    tag: string;
    title: string;
    lead: string;
    items: { title: string; desc: string }[]; // 6
  };

  industries: {
    tag: string;
    title: string;
    items: { title: string; desc: string }[]; // 4
  };

  cases: {
    tag: string;
    title: string;
    filters: { all: string; web: string; app: string; ads: string; design: string };
    showAll: string; // mobile: reveal the remaining cases
    items: { title: string; result: string; tags: string; type: CaseType }[]; // 12
  };

  pricing: {
    tag: string;
    title: string;
    note: string;
    valueNote: string; // small line under the price value, e.g. "exact estimate after a 15-minute brief"
    tiers: {
      badge: string;
      title: string;
      value: string;
      features: [string, string, string, string];
      cta: string;
      popular: boolean;
    }[]; // 6
  };

  faq: {
    tag: string;
    title: string;
    items: { q: string; a: string }[]; // 7
  };

  contact: {
    tag: string;
    title: string;
    lead: string;
    channels: { whatsapp: string; telegram: string; phone: string; email: string };
    form: {
      title: string;
      name: string;
      namePlaceholder: string;
      contact: string;
      contactPlaceholder: string;
      services: string;
      message: string;
      messagePlaceholder: string;
      consentPrefix: string;
      consentLink: string;
      consentSuffix: string; // text after the link (needed by AZ word order); '' when unused
      submit: string;
      sending: string;
      note: string;
      successTitle: string;
      successText: string;
      again: string;
      errorName: string;
      errorContact: string;
      errorConsent: string;
      errorGeneric: string;
      errorRate: string;
      errorOffline: string;
    };
  };

  footer: {
    about: string;
    explore: string;
    contact: string;
    legal: string;
    rights: string;
    privacy: string;
    builtWith: string;
  };

  privacy: {
    title: string;
    updated: string;
    intro: string;
    back: string;
    sections: { h: string; p: string[] }[];
  };

  notFound: {
    title: string;
    text: string;
    back: string;
  };
}
