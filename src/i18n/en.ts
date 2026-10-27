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
      terms: 'terms of service conditions contract payment stages warranty ownership',
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
      { text: 'Weekly report compiled', meta: 'PDF' },
      { text: 'Booking confirmed — 2:30 pm', meta: 'WhatsApp' },
      { text: 'Mentioned by ChatGPT', meta: 'GEO' },
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
      { value: 0.93, decimals: 2, prefix: '$', suffix: '', label: 'cost per lead', sub: 'massage studio, 80 enquiries in 5 days' },
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
      { title: 'Services & B2B', desc: 'Alfanet, Expert Solutions, a massage studio: portals and enquiries at $0.93 each.' },
    ],
  },

  cases: {
    tag: 'Cases',
    title: 'Selected projects',
    filters: { all: 'All', web: 'Websites', app: 'Apps', ads: 'Ads', design: 'Design' },
    showAll: 'Show all cases',
    items: [
      {
        title: 'Construction marketplace', result: 'Two-sided platform: orders, bids and acceptance of work in real time', tags: 'Next.js, NestJS, PostgreSQL', type: 'app',
        kind: 'Web app',
        lead: 'A two-sided platform for construction: clients post orders, contractors respond, and work is accepted right inside the system.',
        blocks: [{ h: 'Solution', items: ['A web application built with Next.js.', 'A back end on NestJS with a PostgreSQL database.', 'Separate roles for clients and contractors.', 'Order statuses update in real time.'] }],
      },
      {
        title: 'English courses', result: '95 leads in 10 days, CTR up to 9.3%', tags: 'Instagram, Facebook', type: 'ads',
        kind: 'Paid ads',
        lead: 'An advertising campaign for an online English school on Instagram and Facebook.',
        blocks: [{ h: 'Result', items: ['95 leads in 10 days.', 'Ad click-through rate of up to 9.3%.'] }, { h: 'What matters in campaigns like this', items: ['A strong offer, creatives for a specific audience and fast handling of every lead.'] }],
      },
      {
        title: 'Alfanet', result: 'Internet provider portal: plans, coverage map, online applications', tags: 'Portal, coverage map', type: 'web',
        kind: 'Website',
        lead: 'The portal of the internet provider Alfanet: plans, a coverage map and online connection requests.',
        blocks: [{ h: 'On the website', items: ['A clear overview of plans.', 'A coverage map — customers instantly see whether a connection is available.', 'An online request without a phone call.'] }],
      },
      {
        title: 'Personal brand', result: '90 leads at under $1 each', tags: 'Lead generation', type: 'ads',
        kind: 'Paid ads',
        lead: 'Lead generation for an expert growing a personal brand.',
        blocks: [{ h: 'Result', items: ['90 leads at under one dollar each.'] }],
      },
      {
        title: 'SHP Construction & Consulting', result: 'Construction company website focused on completed projects', tags: 'Corporate', type: 'web',
        kind: 'Website',
        lead: 'The corporate website of the construction company SHP Construction and Consulting.',
        blocks: [{ h: 'Focus', items: ['Completed projects are the strongest argument for clients, so they are at the centre of the site.'] }],
      },
      {
        title: 'Yakitori', result: 'A 15-section menu in two languages — fast and without a CMS', tags: 'Restaurant, RU / AZ', type: 'web',
        kind: 'Website',
        lead: 'A website and online menu for the Yakitori restaurant in Russian and Azerbaijani.',
        blocks: [{ h: 'Solution', items: ['A menu with 15 sections.', 'Two language versions.', 'Fast loading without a heavy CMS.'] }],
      },
      {
        title: 'Massage studio', result: '80 enquiries at $0.93 each in 5 days', tags: 'Local business', type: 'ads',
        kind: 'Paid ads',
        lead: 'Advertising for a massage studio — a local business that needs bookings here and now.',
        blocks: [{ h: 'Result', items: ['80 enquiries at 93 cents each in five days.'] }],
      },
      {
        title: 'Deniz Service', result: 'Industrial supplier catalogue: 21 categories and certificates', tags: 'Catalogue, B2B', type: 'web',
        kind: 'Website',
        lead: 'A catalogue for the industrial supplier Deniz Service, built for B2B clients.',
        blocks: [{ h: 'On the website', items: ['21 product categories.', 'Certificates and documents.'] }],
      },
      {
        title: 'Expert Solutions', result: 'Solutions for oil and gas laboratories — 25 years on the market', tags: 'Oil & gas, B2B', type: 'web',
        kind: 'Website',
        lead: 'The website of Expert Solutions — solutions for oil and gas laboratories.',
        blocks: [{ h: 'Focus', items: ['25 years on the market: experience and reliability are exactly what B2B clients in this industry look for.'] }],
      },
      {
        title: 'Konteks', result: 'Manufacturing and construction company with a 90-year history', tags: 'Manufacturing', type: 'web',
        kind: 'Website',
        lead: 'The website of Konteks, an industrial and construction company.',
        blocks: [{ h: 'Focus', items: ['The company’s ninety-year history is a strong argument of trust, and the site is built around it.'] }],
      },
      {
        title: 'Oqni Baku', result: 'Restaurant brochure website with SEO optimisation', tags: 'Restaurant, SEO', type: 'web',
        kind: 'Website',
        lead: 'A business-card website for the Oqni Baku restaurant.',
        blocks: [{ h: 'Solution', items: ['Search optimisation so that guests find the restaurant online.'] }],
      },
      {
        title: 'Yakitori menu', result: 'A4 menu booklet: 10 pages, 68 items, RU and AZ from one layout', tags: 'Print', type: 'design',
        kind: 'Design',
        lead: 'An A4 menu booklet for the Yakitori restaurant.',
        blocks: [{ h: 'Solution', items: ['10 pages and 68 items.', 'Russian and Azerbaijani versions from a single layout.'] }],
      },
    ],
    sheet: { kicker: 'Case', direction: 'Direction', tech: 'Stack & channels', result: 'Result', cta: 'I want the same', close: 'Close', prev: 'Previous case', next: 'Next case' },
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
      { q: 'Is the ad budget included in the price?', a: 'No. You pay the ad budget to the platform directly — usually from $200 per month; for Google Ads it can be higher because of keyword costs.' },
      { q: 'When will the ads start paying off?', a: 'Ads usually take 3–6 months to ramp up: during this time we find the combinations that consistently bring leads. We don’t promise an instant flood of clients — we promise transparency and weekly reports.' },
      { q: 'Can you improve my current website instead of building a new one?', a: 'Yes. We start with an audit and honestly tell you what can be fixed in place and what is cheaper to rebuild. We also support websites built by others.' },
      { q: 'Do you work under a contract?', a: 'Yes, always under an official contract. For large projects payment is split into stages — you pay for accepted results, not everything upfront.' },
      { q: 'Do you work with clients from other countries?', a: 'Yes. We are not tied to one country: we run projects remotely worldwide in English, Russian, Azerbaijani and German.' },
    ],
  },

  contact: {
    tag: 'Contact',
    title: 'Let’s build\nthe {{future}} together',
    lead: 'Tell us about your goal — we’ll run a 15-minute brief and propose a solution where marketing meets AI.',
    channels: { whatsapp: 'WhatsApp', telegram: 'Telegram', phone: 'Call us', email: 'Email us' },
    form: {
      title: 'Project request',
      name: 'Your name',
      namePlaceholder: 'What should we call you?',
      contact: 'Phone, WhatsApp or Telegram',
      contactPlaceholder: 'Phone with country code or @username',
      services: 'What do you need?',
      message: 'Briefly about the task',
      messagePlaceholder: 'For example: a website for a clinic and Instagram ads',
      consentPrefix: 'I agree to the processing of my data under the',
      consentLink: 'Privacy Policy',
      consentMiddle: 'and have read the',
      consentTermsLink: 'Terms of Service',
      consentSuffix: '',
      submit: 'Send request',
      sending: 'Sending…',
      note: 'We’ll reply personally, run a 15-minute brief and give you an estimate.',
      successTitle: 'Request sent!',
      successText: 'Thank you! We’ll get in touch with you shortly.',
      again: 'Send another one',
      errorName: 'Please enter your name (at least 2 characters).',
      errorContact: 'Please enter your phone, WhatsApp or Telegram.',
      errorConsent: 'Please agree to the processing of your data.',
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
    terms: 'Terms of service',
    builtWith: 'This site uses no cookies or analytics.',
  },

  legal: {
    updated: 'Last updated',
    toc: 'Contents',
    back: 'Back to the site',
    seeAlso: 'See also',
    contactsNote: 'Requests about your data can go through any of these contacts. Claims, cancellations, termination and other formal notices under a contract go by email [[email]].',
    emailTo: 'to {email}',
    emailFallback: 'to the address published on this website or in your contract',
  },

  privacy: {
    title: 'Privacy Policy',
    description: 'What data the Veilvex website receives, why, who it goes to, how long we keep it and what your rights are. No ad cookies, analytics or third-party trackers.',
    intro:
      'The short version: this site uses no advertising or analytics cookies, tracking pixels or third-party counters, and receives from you only what you send us yourself through the request form, plus the technical data no website can work without. Below are the details: exactly what we receive, on what legal basis, who we share it with, how long we keep it and how to exercise your rights.',
    clauses: false,
    sections: [
      {
        id: 'controller',
        h: 'Who we are and how to reach us',
        blocks: [
          'Veilvex is the team that runs this website and provides the services presented on it: search and AI visibility (SEO and GEO), advertising, social media, website and app development, AI automation and design. “We” in this policy means Veilvex.',
          'The controller of your personal data is the owner of the Veilvex brand. If you sign a contract with us, it names the company or sole trader that is your contracting party and is responsible for processing data within our work together. Full legal details are available on request.',
          'We have not appointed a data protection officer. You can send any request about your data through any current contact listed in this section or on the site: by email, if one is listed, or to the official Veilvex account in Telegram or WhatsApp. If you write in a messenger, we will check that the request comes from the same person who sent the original request (see section 9).',
          { contacts: true },
        ],
      },
      {
        id: 'scope',
        h: 'What this policy covers',
        blocks: [
          'This policy applies to every language version of the site, to the request form and to any correspondence with us before a contract is signed — whether through the form, a messenger or email.',
          'If we work on your project and get access to your customers’ data, that is governed by our contract with you (see section 14). How we work with clients is described in our [[terms|Terms of Service]].',
        ],
      },
      {
        id: 'data',
        h: 'What data we receive',
        blocks: [
          'From the request form — only what you type in yourself:',
          {
            ul: [
              'your name, so we know how to address you;',
              'a contact for getting back to you — a phone number, WhatsApp or a Telegram username;',
              'the services you selected and, optionally, a short description of the task;',
              'the consent checkbox and the language of the page the request was sent from.',
            ],
          },
          'Along with the request, your browser sends two technical fields used to stop bots: a hidden field that people leave empty, and the time the form was opened. Neither contains any information about you.',
          'If you write to us directly on WhatsApp, Telegram or by email, we see what the messenger shows us: your profile name and photo, your number or username, and your messages.',
          'Technical data. Like any server on the internet, our hosting receives your IP address, browser details, the requested page and the time with every request. When you submit the form, our handler also (1) computes a cryptographic hash of your IP address and keeps it, with the times of recent submissions, for a short technical window to protect against spam and limit how often requests can be sent, and (2) logs technical events: a shortened fragment of that hash, the language, the number of services selected, the delivery channel and error codes. Your name, contact and message never appear in the logs.',
          'We do not ask for — and ask you not to send through the form — special categories of data (health, beliefs and the like), identity documents or payment details. Nothing can be paid for on this site.',
        ],
      },
      {
        id: 'cookies',
        h: 'Cookies, analytics and third parties',
        blocks: [
          'This site uses no advertising or analytics cookies, tracking pixels, third-party visitor counters, advertising identifiers or browser fingerprinting.',
          'Your browser may still use technical local storage — for example, to remember the interface language you chose or other technical settings. Such entries are needed only for the site to work, stay on your device, are not used for tracking, and can be cleared in your browser settings. Strictly necessary storage needs no consent, which is why there is no cookie banner.',
          'Our Content Security Policy (CSP) restricts the loading of third-party scripts that we have not allowed.',
          'The WhatsApp and Telegram links are plain links: those services receive data only when you follow them, and their own terms apply from then on.',
        ],
      },
      {
        id: 'purposes',
        h: 'Purposes and legal bases',
        blocks: [
          'We process data only for the purposes listed below. Legal bases are given under the EU General Data Protection Regulation (GDPR); for other countries, see section 10.',
          {
            table: {
              head: ['Purpose', 'Data', 'Legal basis'],
              rows: [
                ['Reply to your request, run the brief, prepare an estimate and a contract', 'Form data, correspondence', 'Steps taken at your request before entering into a contract — Art. 6(1)(b) GDPR; the consent given in the form — Art. 6(1)(a), where the law requires consent'],
                ['Perform the contract and run the project', 'Contact details of client representatives, project correspondence', 'Contract — Art. 6(1)(b); for employees of a corporate client — legitimate interest, Art. 6(1)(f)'],
                ['Protect the form from spam and abuse, keep the site running and secure', 'IP hash, submission times, technical logs', 'Legitimate interest in operating a secure website — Art. 6(1)(f)'],
                ['Keep accounting and tax records', 'Contract, invoices, acceptance certificates', 'Legal obligation — Art. 6(1)(c)'],
                ['Defend our rights in a dispute', 'Contract and project correspondence', 'Legitimate interest — Art. 6(1)(f)'],
              ],
            },
          },
          'Filling in the form is optional — you can simply message us instead. Without a name and a contact, however, we cannot reply.',
          'We send no marketing emails without your separate consent, we do not sell data, and we do not use requests to train AI models.',
        ],
      },
      {
        id: 'recipients',
        h: 'Who receives your data',
        blocks: [
          'Requests are seen only by the members of the Veilvex team who need them to reply and to work on the project. Contractors we bring into a project receive only what they need and are bound by confidentiality obligations.',
          'Services the data passes through:',
          {
            ul: [
              'Cloudflare, Inc. (USA) — website hosting, the form handler, the rate-limit store and technical logs;',
              'Telegram — a bot delivers the request to the team’s private chat;',
              'Resend, Inc. (USA) — delivers the request as an email to the team’s mailbox, where it is stored by our email provider;',
              'WhatsApp (Meta) and Telegram — if you message us there yourself.',
            ],
          },
          'A request arrives via Telegram, by email or both — depending on which channels are enabled. It has no other recipients.',
          'We disclose data to public authorities only when the law requires it. We never sell or rent out data.',
        ],
      },
      {
        id: 'transfers',
        h: 'International transfers',
        blocks: [
          'Cloudflare and Resend are based in the USA, and Telegram operates servers in several countries. Your data may therefore be processed outside your country, including outside the EU/EEA.',
          'For transfers from the EU/EEA, the UK and Switzerland we rely on adequacy decisions (in particular the EU–U.S. Data Privacy Framework, for recipients certified under it) or on the European Commission’s Standard Contractual Clauses (Art. 46(2)(c) GDPR) built into the providers’ data processing agreements. Where neither applies — for example, when you choose a messenger to contact us — data is transferred only to the extent needed to answer your request (Art. 49(1)(b) GDPR).',
          'You can ask for a copy of the relevant safeguards using the contacts in section 1.',
        ],
      },
      {
        id: 'retention',
        h: 'How long we keep data',
        blocks: [
          {
            table: {
              head: ['Data', 'Retention'],
              rows: [
                ['Request and correspondence, if no contract follows', 'For as long as the discussion is relevant and there is a chance we will return to the task. After that we delete it as part of our periodic clean-up of archives — or sooner, at your request.'],
                ['Contract correspondence and documents', 'For the term of the contract, then as long as accounting and tax law requires and until limitation periods expire — usually 3 to 10 years, depending on the country.'],
                ['IP hash and submission times', 'Kept only for a short technical window to protect against spam and limit how often requests can be sent. The record holds no request content and is cleared automatically when the technical window expires.'],
                ['Hosting and form-handler logs', 'A limited period under Cloudflare’s rules. They contain no request content.'],
              ],
            },
          },
          'If you ask us to delete your data sooner, we will — except for anything the law requires us to keep.',
        ],
      },
      {
        id: 'rights',
        h: 'Your rights',
        blocks: [
          'At any time you can:',
          {
            ul: [
              'find out what data we hold about you and get a copy of it;',
              'have inaccurate or incomplete data corrected;',
              'have your data erased (the “right to be forgotten”);',
              'restrict processing — for example, while we look into an objection;',
              'receive the data you gave us in a machine-readable format, or have it sent to someone else (portability);',
              'object to processing based on our legitimate interest;',
              'withdraw your consent — this does not affect processing carried out before the withdrawal;',
              'lodge a complaint with a data protection authority — in the country where you live or work, or where you believe your rights were infringed.',
            ],
          },
          'How to do it: write to us through any current contact listed in section 1 or on the site — by email, if one is listed, or to the official Veilvex account in Telegram or WhatsApp. To avoid handing your data to someone else, we will check that the request comes from the person who sent the original request — for example, by asking you to write from the contact given in that request or to confirm its details. There is no charge.',
          'We reply without undue delay and within one month at the latest. For complex or numerous requests this can be extended by two further months; if so, we will tell you within the first month and explain why.',
        ],
      },
      {
        id: 'regional',
        h: 'Country-specific information',
        blocks: [
          'EU, EEA, UK and Switzerland. This policy follows the GDPR, the UK GDPR and the Swiss Federal Act on Data Protection (revFADP). For Germany: the site may store on your device only what is strictly necessary to provide the page you requested (for example, your chosen language); no consent is needed for this under § 25 TDDDG.',
          'California (CCPA/CPRA), to the extent it applies to us. In the past 12 months we have collected identifiers (name, contact), details of your request and internet activity data (section 3), from the sources and for the purposes described in sections 3 and 5. We do not sell personal information, do not share it for cross-context behavioural advertising and do not use sensitive personal information. You have the right to know what we collect, to have it deleted or corrected, and not to be discriminated against for exercising your rights.',
          'Azerbaijan. Data is processed in accordance with the Law of the Republic of Azerbaijan “On Personal Data”. Ticking the box in the form is your consent to the processing of the data you provide in order to answer your request, including its transfer abroad to the services listed in section 6. You have the right to know what data about you is processed and how, to have it corrected or destroyed, and to withdraw your consent.',
          'Other countries. If you are in a country whose law requires separate consent to the processing of personal data and its cross-border transfer in order to answer your request, ticking the box in the form or sending us a message in a messenger confirms that consent. You can withdraw it through the contacts in section 1 and exercise your rights as described in section 9.',
        ],
      },
      {
        id: 'children',
        h: 'Children',
        blocks: [
          'Our services are meant for businesses and adults. We do not knowingly collect data from anyone under 16. If you believe a child has sent us their data, let us know and we will delete it.',
        ],
      },
      {
        id: 'security',
        h: 'How we protect data',
        blocks: [
          {
            ul: [
              'the site is served over HTTPS only, and the HSTS header stops browsers from opening it over an insecure connection;',
              'a Content Security Policy (CSP) that restricts the loading of third-party scripts we have not allowed and blocks embedding the site in other pages;',
              'the form accepts requests only from our own pages; the server checks every field, rejects unknown ones, strips invisible control characters and caps the request size;',
              'submissions are rate-limited, and bots are filtered out by a hidden field and a timing check;',
              'requests are delivered as plain text — what you type never becomes HTML markup, either on the site or in the message to the team;',
              'IP addresses are stored only as hashes, and service credentials only in protected environment variables, never in the code;',
              'only team members who need it for their work can access the chat and mailbox where requests arrive.',
            ],
          },
          'No system on the internet is perfectly secure. If a breach occurs that is likely to put your rights at risk, we will notify the supervisory authority within the statutory deadline and, where required, you as well.',
        ],
      },
      {
        id: 'automated',
        h: 'Automated decision-making',
        blocks: [
          'We do not make decisions based solely on automated processing that have legal or similarly significant effects on you, and we do not profile you. People read and handle every request; the only automation is the spam filter.',
        ],
      },
      {
        id: 'client-projects',
        h: 'Data in client projects',
        blocks: [
          'When we set up advertising, a CRM, chatbots or analytics, or build a website, we may get access to your customers’ data. In that case you remain the controller and we act as your processor: we handle the data only on your instructions and for the purposes of the project.',
          'On request we sign a data processing agreement (DPA, Art. 28 GDPR) or include those terms in the contract. We use access to your accounts only for the work, never pass it on, and return it or ask you to revoke it when the project ends.',
          'As the owner of the website or business, you are responsible for the legal basis for processing your customers’ data, your own privacy policy and consent banners. We will help you prepare and set all of this up technically, but that is not a substitute for legal advice.',
        ],
      },
      {
        id: 'changes',
        h: 'Changes to this policy',
        blocks: [
          'We update this policy when the site, the services we use or the law change. The current version and its date are always published on this page. This policy is published in several languages; English is the default language of this website, and if the versions differ, the English version prevails. A new version takes effect when it is published on this page, unless the version itself states otherwise.',
        ],
      },
    ],
  },

  terms: {
    title: 'Terms of Service',
    description: 'How Veilvex works with clients: requests and estimates, contract and staged payment, cancellations and refunds, acceptance, ownership, liability.',
    intro:
      'These terms explain up front how working with us is organised — from the first request to the project handover, including payments, cancellations and refunds. The exact scope, timeline, price and obligations are always set out in the contract we sign with each client.',
    clauses: true,
    sections: [
      {
        id: 'general',
        h: 'General',
        blocks: [
          'These terms describe how Veilvex provides its services: search and AI visibility (SEO and GEO), advertising, social media, website and app development, AI automation, design and branding. They apply to requests, negotiations and projects unless the contract says otherwise.',
          'The main document of our work together is the contract or a proposal you have accepted (the “contract”). Where the contract differs from this page, the contract prevails.',
          'Our contracting party is the company or sole trader named in the contract. We share its legal details before signing.',
          'These terms are written for companies and entrepreneurs. If you order services as a consumer, the mandatory consumer protection rules of your country apply in full: nothing in these terms excludes or limits rights that cannot be waived by law, and every limitation below applies only to the extent the law permits.',
          'If any provision is invalid or unenforceable, the remaining provisions stay in force, and the invalid one is replaced by a valid provision that comes closest to its purpose.',
        ],
      },
      {
        id: 'website',
        h: 'Information on the website',
        blocks: [
          'The information on this site — service descriptions, case studies, indicative timelines — is for information only and is not a binding offer. We confirm the exact scope, price and timeline after the brief.',
          'The website and its content are provided “as is” and “as available”. We do not warrant that the information is complete, current or error-free, or that the site is available without interruption.',
          'The figures in case studies come from specific projects and do not guarantee the same results in yours.',
          'The texts, design, illustrations and code of this site belong to Veilvex. They may not be copied or used commercially without our written permission; quoting with a link to the source is welcome.',
        ],
      },
      {
        id: 'inquiries',
        h: 'Requests, estimates and proposals',
        blocks: [
          'A request through the site, a message in a messenger or a brief creates no obligation for either of us.',
          'Estimates and proposals are based on the information from the brief and remain non-binding until a contract is signed. Unless a proposal states otherwise, it is valid for 30 days.',
          'If after the brief the task turns out to be noticeably larger or smaller than described, we will revise the estimate before work begins.',
        ],
      },
      {
        id: 'workflow',
        h: 'How a project runs',
        blocks: [
          'The usual sequence:',
          {
            ul: [
              'Brief — we discuss your business, the task, timeline and budget, and give a preliminary estimate.',
              'Proposal — we fix the scope of work, stages, deliverables, price and timeline.',
              'Contract — we sign the contract and, where needed, a non-disclosure agreement (NDA) and a data processing agreement.',
              'Prepayment — you pay the advance for the first stage in the amount set in the contract; work starts once it arrives.',
              'Stages — we work stage by stage and show interim results; for advertising, SEO and social media a stage is usually one month with a report.',
              'Acceptance and revisions — you review each stage, and we make revisions within the agreed scope.',
              'Handover — we hand over the result, source files, access and instructions; the warranty period begins.',
            ],
          },
          'Each side names a contact person who makes decisions on the project. Day-to-day questions can go through a messenger; formal notices are sent by email (section 18).',
        ],
      },
      {
        id: 'payment',
        h: 'Fees and payment',
        blocks: [
          'The price, currency, payment terms and deadlines are set out in the contract. Larger projects are split into stages: you pay an advance for each stage and the balance after it is accepted, not the full amount up front.',
          'Third-party costs are not included in the price unless the contract says otherwise: advertising budgets, domains, hosting, paid services and APIs, and licences for fonts, photos and plugins. You pay them directly to the provider or we pass them on at cost. Wherever possible, such services are registered in your name.',
          'Work beyond the agreed scope is estimated separately and starts only after you approve the new estimate and timeline in writing.',
          'If payment is late, we may pause work and withhold handover of results until it arrives; deadlines move by the length of the delay.',
          'Taxes and bank fees are allocated as stated in the contract.',
        ],
      },
      {
        id: 'refunds',
        h: 'Payments, cancellations and refunds',
        blocks: [
          'A prepayment reserves our team’s time for your project. Once work on the stage it covers has started, the prepayment is non-refundable.',
          'Fees for stages that have been completed or accepted, and for service periods that have already begun, are non-refundable.',
          'If you cancel a project, you pay for the work done up to the date of cancellation — a stage in progress in proportion to the work completed, but not less than the prepayment for it once work has started — plus third-party costs we have already incurred or committed to on your behalf. Any amount you paid beyond that is refunded.',
          'Advertising budgets and third-party fees (domains, hosting, licences, paid tools and services) are not refunded by us: they are paid directly to the provider or passed on at cost, and any refund is governed by that provider’s terms.',
          'Subscriptions and monthly retainers (for example, ad management, SEO or social media) can be cancelled with effect from the end of the current paid period. The period already started is not refunded, in whole or in part.',
          'Where a refund is due, we make it to the original payment method within a reasonable time, and no later than the law requires.',
          'Please send any payment dispute or refund request by email [[email]] first, and give us 14 days to resolve it before starting a chargeback or payment reversal. This does not limit the rights you have under the law or your card scheme.',
          'If you are a consumer in the EU/EEA or the UK and conclude the contract remotely, you may withdraw from it within 14 days without giving reasons, by a clear statement sent by email [[email]]. We start work within that period only at your express request; if you then withdraw, you pay a proportionate amount for the services provided until you informed us. Once the service has been fully performed at your express request and with your acknowledgement that you lose the right of withdrawal on full performance, the right no longer applies.',
        ],
      },
      {
        id: 'acceptance',
        h: 'Acceptance and revisions',
        blocks: [
          'We hand over the result of each stage for your review. You review it within the period set in the contract or, if none is set, within 5 business days.',
          'Please send your comments by email as one consolidated list: revisions go faster and nothing contradicts anything else.',
          'The price includes the number of revision rounds stated in the contract (if none is stated, two rounds per stage) within the agreed brief. New requirements that were not in the brief are a change of scope (clause 5.3).',
          'If we receive no reasoned comments within the review period, the stage is deemed accepted. Starting to use the result — publishing the site, launching the ads — also counts as acceptance.',
        ],
      },
      {
        id: 'deadlines',
        h: 'Timelines',
        blocks: [
          'Stage deadlines are set in the contract and run from the moment the prepayment has arrived and we have the materials and access we need. They are target dates unless the contract expressly calls them binding.',
          'While we wait for materials, answers, access, decisions or payment from you, deadlines move by the waiting time. If the project is on hold for reasons on your side for longer than the contract allows (or, if it says nothing, for more than 30 days), we may invoice the work done so far and resume the project on a new schedule.',
        ],
      },
      {
        id: 'client-duties',
        h: 'What we need from you',
        blocks: [
          'To keep the project on track, the client:',
          {
            ul: [
              'provides the materials, information and access needed for the work on time (texts, logos, photos, access to the website, ad accounts and CRM);',
              'names a contact person and gives feedback within the agreed time;',
              'holds the rights to everything it gives us (texts, images, trademarks, databases) and has a lawful basis for sharing its customers’ personal data with us where the project needs it;',
              'is responsible for the accuracy of information about its product, prices and promotions, and for the product and advertising claims complying with the law and platform rules;',
              'keeps its own backups of websites, accounts and data;',
              'pays for the work and third-party costs on time.',
            ],
          },
          'The client indemnifies us against third-party claims, fines and reasonable legal costs arising from materials, data or instructions it provided, or from its products, offers and advertising claims, unless the claim was caused by our fault.',
        ],
      },
      {
        id: 'ip',
        h: 'Intellectual property',
        blocks: [
          'Exclusive rights to results created specifically for you (designs, layouts, code, texts, creatives) pass to you once the relevant stage or project has been paid in full. Until then, the results may be used for review and evaluation only.',
          'Together with the rights, we hand over the source files and materials listed in the contract.',
          'Our own pre-existing or independently developed assets (libraries, components, templates, scripts, internal tools, methods) remain ours. To the extent they form part of the result, you receive a perpetual, royalty-free, non-exclusive licence to use them as part of that result, including to modify it.',
          'Open-source components and third-party materials (fonts, stock photos, plugins, services) are used under their own licences; paid licences are registered to you or charged as expenses (clause 5.2).',
          'We may mention our work together and show non-confidential results in our portfolio unless you object in writing or the contract or an NDA prohibits it.',
        ],
      },
      {
        id: 'confidentiality',
        h: 'Confidentiality',
        blocks: [
          'Everything you tell us about your business — data, figures, plans, access credentials — is used only for the project and never disclosed to third parties, except contractors who need it for the work and are bound by the same obligations.',
          'On request, we sign a non-disclosure agreement (NDA) even before the brief.',
          'This obligation applies during our work together and for 3 years after it ends, unless the contract or NDA sets a different period. It does not cover information that is publicly available or that the law requires us to disclose.',
          'We process personal data in line with our [[privacy|Privacy Policy]] and, in client projects, also under a data processing agreement.',
        ],
      },
      {
        id: 'results',
        h: 'Results, platforms and AI',
        blocks: [
          'Marketing, SEO, GEO and advertising outcomes depend on factors outside our control: the market, your product and prices, competitors, budgets and the algorithms of search engines and AI systems. We are responsible for the agreed work, not for a particular business result — we do not guarantee sales, leads, traffic, rankings, ad performance or visibility in AI answers. Specific figures are binding only where the contract expressly sets them as guaranteed KPIs.',
          'Decisions and actions of third-party platforms — Google, Meta, TikTok, app stores, hosting providers, AI services and others — are not our responsibility: ad or app rejections, moderation, account restrictions or suspensions, changes to rules, algorithms, prices or APIs, and outages, unless caused by our breach of the platform’s rules. We help you find a way forward; beyond the agreed scope, this is additional work.',
          'We use AI-based tools in our work — for research, copy, images and code. Everything that goes into a deliverable is checked and refined by a person. If you prefer that your materials are not processed by AI services, tell us and we will record that in the contract.',
        ],
      },
      {
        id: 'warranty',
        h: 'Warranty',
        blocks: [
          'We warrant that the result, as delivered, matches the agreed brief. The warranty period is stated in the contract; if none is stated, it is 30 days after acceptance.',
          'During this period we fix, free of charge, defects in our work as delivered that you report by email with a description. If we cannot fix a defect within a reasonable time, your statutory rights remain.',
          'The warranty does not cover changes made by you or third parties, misuse, the effects of updates to hosting, browsers, platforms or third-party services, third-party components, or new features.',
          'Claims for defects or otherwise arising from the contract must be raised by email within 30 days of acceptance or, for defects that could not be noticed on acceptance, within 30 days of discovery; to the extent the law allows, later claims are excluded. This does not affect statutory periods that cannot be shortened, or claims for intent, gross negligence or injury to life, body or health.',
          'Ongoing support, further development, ad management and social media are provided under a separate contract or plan.',
        ],
      },
      {
        id: 'liability',
        h: 'Limitation of liability',
        blocks: [
          'To the extent permitted by law, our total liability arising out of or in connection with a contract, whether in contract, tort or otherwise, is limited to the fees you paid for the specific stage or service that gave rise to the claim during the 3 months before the event giving rise to it.',
          'We are not liable for indirect or consequential losses, lost profits, revenue or business opportunities, loss of goodwill, or loss or corruption of data, nor for the acts and omissions of platforms and third-party services.',
          'Where we breach an essential contractual obligation through slight negligence, our liability is limited to the foreseeable damage typical for this type of contract.',
          'None of these limitations applies to intent or gross negligence, fraud, injury to life, body or health, mandatory product liability, or any other case where the law does not allow liability to be limited or excluded.',
        ],
      },
      {
        id: 'force-majeure',
        h: 'Force majeure',
        blocks: [
          'Neither party is liable for delays or non-performance caused by circumstances beyond its reasonable control: natural disasters, armed conflict, sanctions and other acts of government, large-scale failures of communications, power grids or cloud platforms, and attacks on providers’ infrastructure.',
          'A party affected by such circumstances informs the other without delay, and deadlines move for as long as they last. If they last longer than 30 days (or the period set in the contract), either party may terminate the contract; the work done up to that point is paid for.',
        ],
      },
      {
        id: 'termination',
        h: 'Termination',
        blocks: [
          'The contract may be terminated on the grounds and in the manner it provides. If the contract does not cover this, either party may terminate it with 14 days’ notice by email.',
          'Payments and refunds on termination follow section 6.',
          'Completed and paid-for results are handed over to you together with the rights to them (section 10).',
          'We may pause work or terminate the contract with immediate effect if payment is overdue by more than 14 days (or the period set in the contract), if the task would require breaking the law or platform rules, or if the client otherwise materially breaches the contract.',
        ],
      },
      {
        id: 'law',
        h: 'Governing law and disputes',
        blocks: [
          'The governing law and the way disputes are resolved are set by the contract with the client. If the contract does not specify them, the law of the country where our contracting party is registered applies.',
          'We first try to settle any dispute by negotiation: send your claim by email [[email]], and we will reply within 30 days. If we cannot agree, the dispute goes to the court named in the contract.',
          'If you are a consumer, you keep the protection of the mandatory laws of your country of residence and, where the law allows, the right to bring proceedings in the courts where you live.',
        ],
      },
      {
        id: 'notices',
        h: 'Notices and language',
        blocks: [
          'All formal notices — requests, claims, acceptance comments, cancellations, termination and refund requests — are sent by email [[email]]. We confirm receipt. Requests about personal data can also be sent in the ways described in the [[privacy|Privacy Policy]].',
          'WhatsApp, Telegram and other messengers are fine for quick day-to-day questions, but messages there are not formal notices.',
          'These terms are published in English, Russian, Azerbaijani and German. English is the default language of this website: if the language versions differ, the English version prevails.',
        ],
      },
      {
        id: 'changes',
        h: 'Changes to these terms',
        blocks: [
          'We may update these terms. The current version and its date are published on this page.',
          'A signed contract is governed by the version in force on the date of signing, unless the parties agree in writing to switch to a newer one.',
        ],
      },
      {
        id: 'contacts',
        h: 'Contact',
        blocks: ['How to reach us:', { contacts: true }],
      },
    ],
  },

  notFound: {
    title: 'Page not found',
    text: 'This page doesn’t exist or has moved. Go back to the home page — everything is in its place there.',
    back: 'Back to home',
  },
};

export default en;
