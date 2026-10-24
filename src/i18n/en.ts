import type { Content } from './types';

export const en: Content = {
  lang: 'en',
  locale: 'en-US',
  brand: 'Veilvex',

  meta: {
    title: 'Veilvex — AI search (GEO), SEO, paid ads, websites & automation',
    description:
      'Full-cycle AI agency: GEO promotion in AI assistants, SEO, paid social and Google Ads, websites, apps and business automation.',
    ogTitle: 'Veilvex — the future of marketing is here',
    ogDescription: 'GEO, SEO, paid ads, websites, apps and business automation — end to end.',
  },

  nav: {
    services: 'Services',
    process: 'Process',
    geo: 'AI search',
    cases: 'Cases',
    pricing: 'Pricing',
    contact: 'Contact',
    cta: 'Discuss',
    menu: 'Menu',
    close: 'Close',
    language: 'Language',
    skipToContent: 'Skip to content',
  },

  command: {
    open: 'Search and navigate',
    title: 'Quick navigation',
    placeholder: 'Section, language or action…',
    sections: 'Sections',
    actions: 'Actions',
    request: 'Send a request',
    current: 'current',
    empty: 'Nothing found',
    hintNav: 'navigate',
    hintOpen: 'open',
    hintClose: 'close',
    keywords: {
      services: 'services seo paid social ads google ads websites apps design smm automation',
      process: 'process steps workflow how we work brief',
      geo: 'geo ai llm neural networks chatgpt gemini perplexity claude ai search visibility answers',
      cases: 'cases portfolio work projects results',
      pricing: 'pricing prices cost plans rates estimate how much',
      faq: 'faq questions answers help',
      contact: 'contact phone whatsapp telegram email reach us',
      privacy: 'privacy policy personal data gdpr',
      request: 'request brief form order discuss project quote',
      ru: 'ru russian русский',
      en: 'en english',
      az: 'az azerbaijani azərbaycan',
      de: 'de german deutsch',
    },
  },

  hero: {
    eyebrow: 'Marketing in the age of AI',
    title: 'The future of marketing\nis here.',
    lead:
      'We promote businesses where customers search today — in AI assistants, Google and social media. Websites, advertising and automation, end to end.',
    primary: 'Discuss a project',
    secondary: 'Explore services',
    badge: 'GEO — promotion in AI answers',
    badgeLink: 'Learn more',
    live: 'AI is analysing your market',
    chips: [
      { title: 'GEO promotion', sub: 'in AI assistants' },
      { title: 'Websites & apps', sub: 'end to end' },
      { title: 'AI automation', sub: 'for business' },
    ],
  },

  mock: {
    appName: 'Veilvex Console',
    sidebar: ['Pulse', 'Leads', 'Campaigns', 'AI mentions', 'Reports'],
    views: [
      { title: 'Business pulse', sub: 'Leads · ads · AI — last 30 days' },
      { title: 'Leads from every channel', sub: 'Website · WhatsApp · Instagram — last 30 days' },
      { title: 'Campaign performance', sub: 'Instagram · Facebook · Google Ads — last 30 days' },
      { title: 'Brand visibility in AI answers', sub: 'ChatGPT · Gemini · Perplexity · Claude — last 30 days' },
      { title: 'Weekly reports', sub: 'Spend · leads · metrics — last 30 days' },
    ],
    kpis: [
      { label: 'Leads', value: '95', delta: '+41%' },
      { label: 'Cost per lead', value: '$0.93', delta: '−37%' },
      { label: 'Ad CTR', value: '9.3%', delta: '+2.1 pp' },
    ],
    feedTitle: 'Automation, now',
    feed: [
      { text: 'New lead — Anna', meta: '→ CRM' },
      { text: 'Reply sent to client', meta: '0.8 s' },
      { text: 'Invoice issued', meta: 'auto' },
    ],
    aiTitle: 'AI answer',
    aiAnswer: 'I recommend {{Veilvex}} — they build websites, run ads and promote brands in AI assistants.',
    searchQuery: 'digital marketing agency',
    searchTop: '#1, organic',
  },

  platforms: {
    tag: 'We work with the leading platforms',
    items: ['ChatGPT', 'Gemini', 'Perplexity', 'Claude', 'Google Ads', 'Meta', 'TikTok', 'LinkedIn', 'Telegram', 'WhatsApp'],
  },

  about: {
    tag: 'About',
    text:
      'We connect marketing and artificial intelligence. We make sure you’re found on {{Google}}, recommended by {{AI assistants}} and that your leads are handled by {{robots}} — while you run your business.',
    stats: [
      { value: 95, decimals: 0, prefix: '', suffix: '', label: 'leads in 10 days', sub: 'online English courses' },
      { value: 90, decimals: 0, prefix: '', suffix: '', label: 'leads under $1 each', sub: 'personal brand promotion' },
      { value: 0.93, decimals: 2, prefix: '$', suffix: '', label: 'cost per lead', sub: 'massage studio, 80 bookings in 5 days' },
      { value: 9.3, decimals: 1, prefix: '', suffix: '%', label: 'ad campaign CTR', sub: 'online course ads' },
    ],
  },

  services: {
    tag: 'Services',
    title: 'Nine services,\none team.',
    lead: 'Take a single service or build a bundle: website + ads + automation.',
    items: [
      {
        id: 'geo',
        title: 'GEO promotion',
        desc: 'Promotion inside AI answers. We make ChatGPT, Gemini and Perplexity recommend you.',
        bullets: ['AI visibility audit', 'Content and structured data', 'Mention monitoring'],
        price: 'price after audit',
      },
      {
        id: 'seo',
        title: 'SEO',
        desc: 'We take your site to the top of Google: technical optimisation, speed, semantics and markup.',
        bullets: ['Tech audit and speed', 'Keywords and content', 'Multilingual SEO'],
        price: 'price per task',
      },
      {
        id: 'ads',
        title: 'Paid social & Google Ads',
        desc: 'Ads on Facebook, Instagram, TikTok, LinkedIn and Google: audiences, offers, creatives and constant optimisation.',
        bullets: ['Market and competitor research', 'Creatives for every platform', 'Weekly report'],
        price: 'price by agreement',
      },
      {
        id: 'site',
        title: 'Turnkey websites',
        desc: 'Landing pages, corporate sites and online stores. Unique design, responsive layout, admin panel and integrations.',
        bullets: ['Online payments and CRM', 'SEO and AI-search readiness', 'Launch from 14 working days'],
        price: 'price by agreement',
      },
      {
        id: 'app',
        title: 'Web & mobile apps',
        desc: 'Platforms, marketplaces, client portals, CRM and ERP. One app for both iOS and Android.',
        bullets: ['Roles, statuses, permissions', 'Real-time updates', 'React Native, Next.js'],
        price: 'price by agreement',
      },
      {
        id: 'ai',
        title: 'AI business automation',
        desc: 'Chatbots, AI assistants and integrations that take orders, answer clients and keep records on their own.',
        bullets: ['Bots for WhatsApp and Telegram', 'CRM and payment integration', 'Automatic reports, no routine'],
        price: 'price per task',
      },
      {
        id: 'improve',
        title: 'Website improvement',
        desc: 'We take over your current site: audit, speed-up, redesign, new sections and bug fixes.',
        bullets: ['Audit: fix or rebuild', 'Speed and stability', 'Support on demand'],
        price: 'price after audit',
      },
      {
        id: 'design',
        title: 'UI/UX & branding',
        desc: 'Logo, brand identity, design systems and clickable prototypes. All source files are yours.',
        bullets: ['Logo and brand identity', 'Presentations', 'Website design from one week'],
        price: 'price by agreement',
      },
      {
        id: 'smm',
        title: 'SMM & mobile video',
        desc: 'Vertical videos shot on a phone, editing and social media management based on a content strategy.',
        bullets: ['Video shooting', 'Editing', 'Reach reports'],
        price: 'price by agreement',
      },
    ],
    more: 'Learn more',
    discuss: 'Discuss',
  },

  process: {
    tag: 'Process',
    title: 'Five steps —\none result.',
    lead: 'You always know what’s happening, what it costs and when it will be ready.',
    steps: [
      { title: 'A 15-minute brief', desc: 'Tell us about your business and goal — we ask the right questions and give an estimate and timeline.', badge: '15 min' },
      { title: 'Contract and stages', desc: 'Scope, timeline and price are fixed in an official contract. Large projects go in stages.', badge: 'contract' },
      { title: 'Strategy and design', desc: 'Market, competitor and audience analysis. Prototype, mock-ups, offers and creatives.', badge: 'research' },
      { title: 'Build and launch', desc: 'Code, integrations, ads and automations. We test, connect the domain and go live.', badge: 'launch' },
      { title: 'Growth and support', desc: 'We optimise, send reports and grow the project together with your business.', badge: 'growth' },
    ],
  },

  geo: {
    tag: 'Promotion in AI assistants',
    title: 'Customers don’t google anymore.\nThey ask AI.',
    lead:
      '{{GEO}} (Generative Engine Optimization) is promotion inside AI answers. When a customer asks AI to recommend a company, it should name you.',
    steps: [
      { title: 'Visibility audit', desc: 'We check what AI models already know and say about your business.' },
      { title: 'Content and markup', desc: 'We structure your site, semantics and mentions so AI understands and cites you.' },
      { title: 'Answer monitoring', desc: 'We track how often and in what context AI recommends your brand.' },
    ],
    models: ['ChatGPT', 'Gemini', 'Perplexity', 'Claude', 'Copilot', 'Grok'],
    chat: {
      name: 'AI assistant',
      status: 'online',
      typing: 'typing…',
      sample: 'example',
      question: 'Can you recommend someone to build a website and run ads for my business?',
      answer:
        'I recommend {{Veilvex}}. The agency builds websites and handles paid ads, SEO and promotion in AI assistants end to end, works under contract and sends reports every week.',
      meter: 'Brand visibility in AI answers',
    },
    more: 'More about GEO',
  },

  trust: {
    tag: 'Guarantees',
    title: 'We work so you can trust us',
    lead: 'Transparent terms at every stage — from the first call to launch and support.',
    items: [
      { title: 'Official contract', desc: 'Scope, timeline and cost are fixed before we start.' },
      { title: 'Staged payments', desc: 'You pay for accepted results, not upfront for the whole project.' },
      { title: 'Weekly reports', desc: 'Spend, leads and metrics in a clear report every week.' },
      { title: 'The source files are yours', desc: 'We hand over all files, accesses and code. Nothing is held back.' },
      { title: 'Support after launch', desc: 'Edits, updates and growth — whenever you need them.' },
      { title: 'One team', desc: 'Design, development and marketing work together — nothing gets lost in between.' },
    ],
  },

  industries: {
    tag: 'Industries',
    title: 'Built for results,\nnot for the showcase.',
    items: [
      { title: 'Construction & industry', desc: 'A construction marketplace, websites for SHP, Konteks and Deniz Service: orders, catalogues, certificates.' },
      { title: 'Restaurants & HoReCa', desc: 'Websites for Yakitori and Oqni Baku, bilingual menus and SEO for guests.' },
      { title: 'Education & experts', desc: 'English courses — 95 leads in 10 days. Personal brand — 90 leads under $1.' },
      { title: 'Services & B2B', desc: 'Alfanet, Expert Solutions, a massage studio: portals, applications and bookings at $0.93.' },
    ],
  },

  cases: {
    tag: 'Cases',
    title: 'Selected projects',
    filters: { all: 'All', web: 'Websites', app: 'Apps', ads: 'Ads', design: 'Design' },
    showAll: 'Show all cases',
    items: [
      { title: 'Construction marketplace', result: 'Two-sided platform: orders, bids and acceptance of work in real time', tags: 'Next.js, NestJS, PostgreSQL', type: 'app' },
      { title: 'English courses', result: '95 leads in 10 days, CTR up to 9.3%', tags: 'Instagram, Facebook', type: 'ads' },
      { title: 'Alfanet', result: 'Internet provider portal: plans, coverage map, online applications', tags: 'Portal, coverage map', type: 'web' },
      { title: 'Personal brand', result: '90 leads at under $1 each', tags: 'Lead generation', type: 'ads' },
      { title: 'SHP Construction & Consulting', result: 'Construction company website focused on completed projects', tags: 'Corporate', type: 'web' },
      { title: 'Yakitori', result: 'A 15-section menu in two languages — fast and without a CMS', tags: 'Restaurant, RU / AZ', type: 'web' },
      { title: 'Massage studio', result: '80 bookings at $0.93 each in 5 days', tags: 'Local business', type: 'ads' },
      { title: 'Deniz Service', result: 'Industrial supplier catalogue: 21 categories and certificates', tags: 'Catalogue, B2B', type: 'web' },
      { title: 'Expert Solutions', result: 'Solutions for oil and gas laboratories — 25 years on the market', tags: 'Oil & gas, B2B', type: 'web' },
      { title: 'Konteks', result: 'Manufacturing and construction company with a 90-year history', tags: 'Manufacturing', type: 'web' },
      { title: 'Oqni Baku', result: 'Restaurant brochure website with SEO optimisation', tags: 'Restaurant, SEO', type: 'web' },
      { title: 'Yakitori menu', result: 'A4 menu booklet: 10 pages, 68 items, RU and AZ from one layout', tags: 'Print', type: 'design' },
    ],
  },

  pricing: {
    tag: 'Pricing',
    title: 'Pricing that fits your task',
    note:
      'We discuss the cost of every project individually: after a 15-minute brief we give an exact estimate and timeline. The ad budget is paid to the platforms directly.',
    valueNote: 'Exact estimate after a 15-minute brief',
    tiers: [
      { badge: 'website', title: 'Turnkey website', value: 'By agreement', features: ['Unique design', 'Responsive + admin panel', 'SEO + AI-search readiness', 'Launch from 14 working days'], cta: 'Discuss', popular: false },
      { badge: 'popular', title: 'Paid social or Google Ads', value: 'By agreement', features: ['Strategy, offers, creatives', 'Campaign setup and launch', 'Ongoing optimisation', 'Weekly report'], cta: 'Discuss', popular: true },
      { badge: 'app', title: 'Web application', value: 'By agreement', features: ['Roles, statuses, permissions', 'Integrations and payments', 'Real-time and notifications', 'Pay for accepted stages'], cta: 'Discuss', popular: false },
      { badge: 'smm', title: 'SMM & content', value: 'By agreement', features: ['Instagram, TikTok and more', 'Shooting every 2 weeks', '3 posts and 2 stories a week', 'Reach reports'], cta: 'Discuss', popular: false },
      { badge: 'design', title: 'UI/UX & branding', value: 'By agreement', features: ['Website UI/UX', 'Logo and brand identity', 'Presentations', 'All source files are yours'], cta: 'Discuss', popular: false },
      { badge: 'ai', title: 'GEO, SEO & automation', value: 'By agreement', features: ['AI and Google visibility audit', 'Chatbots and AI assistants', 'CRM integrations', 'Estimate after audit'], cta: 'Discuss', popular: false },
    ],
  },

  faq: {
    tag: 'FAQ',
    title: 'Frequently asked questions',
    items: [
      { q: 'What is GEO and why does my business need it?', a: 'More and more people don’t scroll search results — they ask AI for advice. GEO is work on your website, content and brand mentions so that AI assistants understand your business and recommend it in their answers.' },
      { q: 'What does the price depend on?', a: 'On scope and complexity: number of pages, roles and statuses in an app, integrations, ad platforms. We give an exact estimate after a short brief — it takes about 15 minutes.' },
      { q: 'Is the ad budget included in the price?', a: 'No. You pay the ad budget to the platform directly — usually from 350 ₼ per month; for Google Ads it can be higher because of keyword costs.' },
      { q: 'When will the ads start paying off?', a: 'Ads usually take 3–6 months to ramp up: during this time we find the combinations that consistently bring leads. We don’t promise an instant flood of clients — we promise transparency and weekly reports.' },
      { q: 'Can you improve my current website instead of building a new one?', a: 'Yes. We start with an audit and honestly tell you what can be fixed in place and what is cheaper to rebuild. We also support websites built by others.' },
      { q: 'Do you work under a contract?', a: 'Yes, always under an official contract. For large projects payment is split into stages — you pay for accepted results, not everything upfront.' },
      { q: 'Do you work with clients from other countries?', a: 'Yes. We run projects remotely in Russian, English and Azerbaijani.' },
    ],
  },

  contact: {
    tag: 'Contact',
    title: 'Let’s build\nthe future together',
    lead: 'Tell us about your goal — we’ll run a 15-minute brief and propose a solution where marketing meets AI.',
    channels: { whatsapp: 'WhatsApp', telegram: 'Telegram', phone: 'Call us', email: 'Email us' },
    form: {
      title: 'Project request',
      name: 'Your name',
      namePlaceholder: 'What should we call you?',
      contact: 'Phone, WhatsApp or Telegram',
      contactPlaceholder: '+994 50 000 00 00 or @username',
      services: 'What do you need?',
      message: 'Briefly about the task',
      messagePlaceholder: 'For example: a website for a clinic and Instagram ads',
      consentPrefix: 'I agree to the',
      consentLink: 'privacy policy',
      consentSuffix: '',
      submit: 'Send request',
      sending: 'Sending…',
      note: 'We’ll reply personally, run a 15-minute brief and give you an estimate.',
      successTitle: 'Request sent!',
      successText: 'Thank you! We’ll get in touch with you shortly.',
      again: 'Send another one',
      errorName: 'Please enter your name (at least 2 characters).',
      errorContact: 'Please enter your phone, WhatsApp or Telegram.',
      errorConsent: 'Please agree to the privacy policy.',
      errorGeneric: 'Could not send. Please try again in a minute.',
      errorRate: 'Too many requests in a row. Please wait a few minutes and try again.',
      errorOffline: 'No internet connection. Check your network and try again.',
    },
  },

  footer: {
    about: 'Marketing, websites and automation with AI — for businesses that want to be first.',
    explore: 'Explore',
    contact: 'Contact',
    legal: 'Legal',
    rights: 'All rights reserved',
    privacy: 'Privacy policy',
    builtWith: 'This site uses no cookies or analytics.',
  },

  privacy: {
    title: 'Privacy policy',
    updated: 'Last updated on 23 October 2026',
    intro:
      'In plain words: this site sets no cookies, uses no analytics and receives only what you send us yourself through the request form. The details, in order, are below.',
    back: 'Back to the site',
    sections: [
      { h: 'Who processes the data', p: ['The data controller is Veilvex, the team that runs this site and provides the services presented on it: promotion in search engines and AI assistants, advertising, SMM, website and app development, automation and design.'] },
      { h: 'What data we receive', p: ['The request form has the following fields: your name, a contact for getting back to you (phone, WhatsApp or Telegram), the services you selected, a short description of the task and a mandatory checkbox confirming that you agree to this policy.', 'Once sent, the request is delivered to us over a secure connection (HTTPS) to the team’s messenger or email. The site keeps no database of requests and does not store them on the server any longer than delivery takes.', 'Hosting servers, like any servers on the internet, receive the technical data of a request: IP address, browser type and time of the request. We use it only to protect against spam and abuse (rate limiting) and never link it to you.'] },
      { h: 'What we do not collect', p: ['We set no cookies and use no counters, tracking pixels or advertising identifiers. The only thing your browser may remember is the language you chose.', 'Please do not include special categories of data (about health, religious or political views and the like) or payment details in your request — nothing can be paid for on this site.'] },
      { h: 'Purposes and legal grounds', p: ['We use the data to reply to your request, discuss the task, prepare an estimate and, if you decide to work with us, conclude and perform a contract.', 'Legal grounds: your consent (the checkbox in the form and the sending of the request), steps taken at your request before entering into a contract, our legitimate interest in answering your enquiry and the legal requirements for keeping contractual documents.', 'We do not use your data for marketing mailings and do not sell it.'] },
      { h: 'Sharing with third parties', p: ['Request data is seen only by the Veilvex staff who need it to reply. To deliver the request we use hosting services and messengers (for example, Telegram or an email provider), which process data under their own privacy policies.'] },
      { h: 'Retention periods and your rights', p: ['We keep the correspondence about a request for as long as the discussion and the project last, and afterwards for the periods the law requires for contractual documents.', 'You can request a copy, correction or deletion of your data, and you can withdraw your consent. Write to us by any of the means listed in the Contact section — we will reply within 30 days.'] },
      { h: 'Security', p: ['The site works over HTTPS only, applies a strict Content Security Policy (CSP), validates all incoming data on the server and limits the request rate. Secrets and access keys are stored outside the site’s code.'] },
      { h: 'Changes to this policy', p: ['We may update this policy. The current version and its date are always published on this page.'] },
    ],
  },

  notFound: {
    title: 'Page not found',
    text: 'This page doesn’t exist or has moved. Go back to the home page — everything is in its place there.',
    back: 'Back to home',
  },
};

export default en;
