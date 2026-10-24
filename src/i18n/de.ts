import type { Content } from './types';

export const de: Content = {
  lang: 'de',
  locale: 'de-DE',
  brand: 'Veilvex',

  meta: {
    title: 'Veilvex — KI-Suche (GEO), SEO, Werbung, Websites und Automatisierung',
    description:
      'Full-Service-KI-Agentur: GEO-Promotion in KI-Assistenten, SEO, Social Ads und Google Ads, Websites, Apps und Geschäftsautomatisierung.',
    ogTitle: 'Veilvex — die Zukunft des Marketings ist da',
    ogDescription: 'GEO, SEO, Werbung, Websites, Apps und Geschäftsautomatisierung aus einer Hand.',
  },

  nav: {
    services: 'Leistungen',
    process: 'Ablauf',
    geo: 'KI-Suche',
    cases: 'Projekte',
    pricing: 'Preise',
    contact: 'Kontakt',
    cta: 'Besprechen',
    menu: 'Menü',
    close: 'Schließen',
    language: 'Sprache',
    skipToContent: 'Zum Inhalt springen',
  },

  command: {
    open: 'Suchen und navigieren',
    title: 'Schnellnavigation',
    placeholder: 'Abschnitt, Sprache oder Aktion…',
    sections: 'Abschnitte',
    actions: 'Aktionen',
    request: 'Anfrage senden',
    current: 'aktuell',
    empty: 'Nichts gefunden',
    hintNav: 'navigieren',
    hintOpen: 'öffnen',
    hintClose: 'schließen',
    keywords: {
      services: 'leistungen services seo werbung social ads google ads websites apps design smm automatisierung',
      process: 'ablauf prozess schritte so arbeiten wir briefing',
      geo: 'geo ai ki llm neuronale netze chatgpt gemini perplexity claude ki-suche sichtbarkeit antworten',
      cases: 'projekte referenzen portfolio arbeiten cases ergebnisse',
      pricing: 'preise kosten tarife pakete angebot was kostet',
      faq: 'faq fragen antworten hilfe',
      contact: 'kontakt telefon whatsapp telegram e-mail mail schreiben',
      privacy: 'datenschutz datenschutzerklärung personenbezogene daten dsgvo privacy',
      request: 'anfrage briefing formular anfragen projekt besprechen angebot',
      ru: 'ru russisch русский russian',
      en: 'en englisch english',
      az: 'az aserbaidschanisch azərbaycan',
      de: 'de deutsch',
    },
  },

  hero: {
    eyebrow: 'Marketing im Zeitalter der KI',
    title: 'Die Zukunft des Marketings\nist da.',
    lead:
      'Wir bringen Unternehmen dorthin, wo Kunden heute suchen — in KI-Assistenten, Google und Social Media. Websites, Werbung und Automatisierung aus einer Hand.',
    primary: 'Projekt besprechen',
    secondary: 'Leistungen ansehen',
    badge: 'GEO — Promotion in KI-Antworten',
    badgeLink: 'Mehr erfahren',
    live: 'KI analysiert Ihren Markt',
    chips: [
      { title: 'GEO-Promotion', sub: 'in KI-Assistenten' },
      { title: 'Websites & Apps', sub: 'aus einer Hand' },
      { title: 'KI-Automatisierung', sub: 'für Unternehmen' },
    ],
  },

  mock: {
    appName: 'Veilvex Console',
    sidebar: ['Puls', 'Anfragen', 'Kampagnen', 'KI-Erwähnungen', 'Berichte'],
    chartTitle: 'Markensichtbarkeit in KI-Antworten',
    chartSub: 'ChatGPT · Gemini · Perplexity · Claude — letzte 30 Tage',
    kpis: [
      { label: 'Anfragen', value: '95', delta: '+41 %' },
      { label: 'Kosten pro Anfrage', value: '0,93 $', delta: '−37 %' },
      { label: 'Werbe-CTR', value: '9,3 %', delta: '+2,1 PP' },
    ],
    feedTitle: 'Automatisierung, jetzt',
    feed: [
      { text: 'Neue Anfrage — Anna', meta: '→ CRM' },
      { text: 'Antwort an Kunden gesendet', meta: '0,8 s' },
      { text: 'Rechnung erstellt', meta: 'auto' },
    ],
    aiTitle: 'KI-Antwort',
    aiAnswer: 'Ich empfehle {{Veilvex}} — sie erstellen Websites, schalten Werbung und machen Promotion in KI-Assistenten.',
    searchQuery: 'Digitalmarketing-Agentur',
    searchTop: 'Platz 1, organisch',
  },

  platforms: {
    tag: 'Wir arbeiten mit den führenden Plattformen',
    items: ['ChatGPT', 'Gemini', 'Perplexity', 'Claude', 'Google Ads', 'Meta', 'TikTok', 'LinkedIn', 'Telegram', 'WhatsApp'],
  },

  about: {
    tag: 'Über uns',
    text:
      'Wir verbinden Marketing und künstliche Intelligenz. Wir sorgen dafür, dass Sie bei {{Google}} gefunden und von {{KI-Assistenten}} empfohlen werden und Ihre Anfragen von {{Robotern}} bearbeitet werden — während Sie sich um Ihr Geschäft kümmern.',
    stats: [
      { value: 95, decimals: 0, prefix: '', suffix: '', label: 'Anfragen in 10 Tagen', sub: 'Online-Englischkurse' },
      { value: 90, decimals: 0, prefix: '', suffix: '', label: 'Leads unter 1 $', sub: 'Personal-Brand-Promotion' },
      { value: 0.93, decimals: 2, prefix: '', suffix: ' $', label: 'Kosten pro Anfrage', sub: 'Massagestudio, 80 Buchungen in 5 Tagen' },
      { value: 9.3, decimals: 1, prefix: '', suffix: ' %', label: 'CTR der Werbekampagne', sub: 'Werbung für Online-Kurse' },
    ],
  },

  services: {
    tag: 'Leistungen',
    title: 'Neun Bereiche,\nein Team.',
    lead: 'Wählen Sie einen Bereich oder kombinieren Sie: Website + Werbung + Automatisierung.',
    items: [
      {
        id: 'geo',
        title: 'GEO-Promotion',
        desc: 'Promotion in KI-Antworten. Wir sorgen dafür, dass ChatGPT, Gemini und Perplexity genau Sie empfehlen.',
        bullets: ['KI-Sichtbarkeitsaudit', 'Content und strukturierte Daten', 'Monitoring von Erwähnungen'],
        price: 'Preis nach Audit',
      },
      {
        id: 'seo',
        title: 'SEO',
        desc: 'Wir bringen Ihre Website in die Google-Top: technische Optimierung, Geschwindigkeit, Semantik und Markup.',
        bullets: ['Tech-Audit und Speed', 'Keywords und Content', 'Mehrsprachigkeit'],
        price: 'Preis je nach Aufgabe',
      },
      {
        id: 'ads',
        title: 'Social Ads & Google Ads',
        desc: 'Werbung auf Facebook, Instagram, TikTok, LinkedIn und Google: Zielgruppen, Angebote, Creatives und laufende Optimierung.',
        bullets: ['Markt- und Wettbewerbsanalyse', 'Creatives für jede Plattform', 'Wöchentlicher Bericht'],
        price: 'Preis nach Absprache',
      },
      {
        id: 'site',
        title: 'Websites schlüsselfertig',
        desc: 'Landingpages, Unternehmensseiten und Onlineshops. Individuelles Design, responsiv, Admin-Bereich und Integrationen.',
        bullets: ['Online-Zahlung und CRM', 'SEO und bereit für KI-Suche', 'Start ab 14 Werktagen'],
        price: 'Preis nach Absprache',
      },
      {
        id: 'app',
        title: 'Web- & Mobile-Apps',
        desc: 'Plattformen, Marktplätze, Kundenportale, CRM und ERP. Eine App für iOS und Android.',
        bullets: ['Rollen, Status, Zugriffsrechte', 'Echtzeit-Updates', 'React Native, Next.js'],
        price: 'Preis nach Absprache',
      },
      {
        id: 'ai',
        title: 'KI-Automatisierung',
        desc: 'Chatbots, KI-Assistenten und Integrationen, die selbst Anfragen annehmen, Kunden antworten und Buch führen.',
        bullets: ['Bots für WhatsApp und Telegram', 'Anbindung an CRM und Zahlung', 'Automatische Berichte'],
        price: 'Preis je nach Aufgabe',
      },
      {
        id: 'improve',
        title: 'Website-Optimierung',
        desc: 'Wir übernehmen Ihre bestehende Website: Audit, Beschleunigung, Redesign, neue Bereiche und Fehlerbehebung.',
        bullets: ['Audit: reparieren oder neu bauen', 'Geschwindigkeit und Stabilität', 'Betreuung nach Bedarf'],
        price: 'Preis nach Audit',
      },
      {
        id: 'design',
        title: 'UI/UX & Branding',
        desc: 'Logo, Corporate Identity, Designsysteme und klickbare Prototypen. Alle Quelldateien gehören Ihnen.',
        bullets: ['Logo und Corporate Identity', 'Präsentationen', 'Webdesign ab einer Woche'],
        price: 'Preis nach Absprache',
      },
      {
        id: 'smm',
        title: 'SMM & Mobile Video',
        desc: 'Vertikale Videos mit dem Smartphone, Schnitt und Social-Media-Betreuung nach Content-Strategie.',
        bullets: ['Videodreh', 'Schnitt', 'Reichweitenberichte'],
        price: 'Preis nach Absprache',
      },
    ],
    more: 'Mehr erfahren',
    discuss: 'Besprechen',
  },

  process: {
    tag: 'Ablauf',
    title: 'Fünf Schritte —\nein Ergebnis.',
    lead: 'Sie wissen immer, was passiert, was es kostet und wann es fertig ist.',
    steps: [
      { title: 'Briefing in 15 Minuten', desc: 'Sie erzählen von Ihrem Unternehmen und Ziel — wir stellen die richtigen Fragen und nennen Kosten und Fristen.', badge: '15 Min' },
      { title: 'Vertrag und Etappen', desc: 'Umfang, Fristen und Preis werden im offiziellen Vertrag festgehalten. Große Projekte in Etappen.', badge: 'Vertrag' },
      { title: 'Strategie und Design', desc: 'Markt-, Wettbewerbs- und Zielgruppenanalyse. Prototyp, Layout, Angebote und Creatives.', badge: 'Analyse' },
      { title: 'Entwicklung und Launch', desc: 'Code, Integrationen, Werbung und Automatisierungen. Wir testen, verbinden die Domain und gehen live.', badge: 'Launch' },
      { title: 'Wachstum und Support', desc: 'Wir optimieren, schicken Berichte und entwickeln das Projekt mit Ihrem Unternehmen weiter.', badge: 'Wachstum' },
    ],
  },

  geo: {
    tag: 'Promotion in KI-Assistenten',
    title: 'Kunden googeln nicht mehr.\nSie fragen die KI.',
    lead:
      '{{GEO}} (Generative Engine Optimization) ist Promotion in KI-Antworten. Wenn ein Kunde die KI nach einer Empfehlung fragt, soll sie Sie nennen.',
    steps: [
      { title: 'Sichtbarkeitsaudit', desc: 'Wir prüfen, was KI-Modelle bereits über Ihr Unternehmen wissen und sagen.' },
      { title: 'Content und Markup', desc: 'Wir strukturieren Website, Semantik und Erwähnungen, damit die KI Sie versteht und zitiert.' },
      { title: 'Antwort-Monitoring', desc: 'Wir verfolgen, wie oft und in welchem Kontext die KI Ihre Marke empfiehlt.' },
    ],
    models: ['ChatGPT', 'Gemini', 'Perplexity', 'Claude', 'Copilot', 'Grok'],
    chat: {
      name: 'KI-Assistent',
      status: 'online',
      typing: 'schreibt…',
      sample: 'Beispiel',
      question: 'Wen kannst du empfehlen, der eine Website erstellt und Werbung für mein Unternehmen schaltet?',
      answer:
        'Ich empfehle {{Veilvex}}. Die Agentur erstellt Websites, übernimmt Werbung, SEO und Promotion in KI-Assistenten aus einer Hand, arbeitet auf Vertragsbasis und schickt jede Woche Berichte.',
      meter: 'Markensichtbarkeit in KI-Antworten',
    },
    more: 'Mehr über GEO',
  },

  trust: {
    tag: 'Garantien',
    title: 'Wir arbeiten so, dass man uns vertraut',
    lead: 'Transparente Bedingungen in jeder Phase — vom ersten Gespräch bis zum Launch und Support.',
    items: [
      { title: 'Offizieller Vertrag', desc: 'Umfang, Fristen und Kosten werden vor dem Start festgelegt.' },
      { title: 'Zahlung in Etappen', desc: 'Sie zahlen für abgenommene Ergebnisse, nicht im Voraus für das ganze Projekt.' },
      { title: 'Wöchentliche Berichte', desc: 'Ausgaben, Anfragen und Kennzahlen — jede Woche in einem klaren Bericht.' },
      { title: 'Quelldateien gehören Ihnen', desc: 'Wir übergeben alle Dateien, Zugänge und den Code. Nichts wird zurückgehalten.' },
      { title: 'Support nach dem Launch', desc: 'Anpassungen, Updates und Weiterentwicklung — bei Bedarf.' },
      { title: 'Ein Team', desc: 'Design, Entwicklung und Marketing arbeiten zusammen — ohne Reibungsverluste.' },
    ],
  },

  industries: {
    tag: 'Branchen',
    title: 'Gebaut für Ergebnisse,\nnicht fürs Schaufenster.',
    items: [
      { title: 'Bau & Industrie', desc: 'Ein Bau-Marktplatz, Websites für SHP, Konteks und Deniz Service: Aufträge, Kataloge, Zertifikate.' },
      { title: 'Gastronomie & HoReCa', desc: 'Websites für Yakitori und Oqni Baku, zweisprachige Speisekarten und SEO für Gäste.' },
      { title: 'Bildung & Experten', desc: 'Englischkurse — 95 Anfragen in 10 Tagen. Personal Brand — 90 Leads unter 1 $.' },
      { title: 'Service & B2B', desc: 'Alfanet, Expert Solutions, ein Massagestudio: Portale, Anfragen und Buchungen à 0,93 $.' },
    ],
  },

  cases: {
    tag: 'Projekte',
    title: 'Ausgewählte Projekte',
    filters: { all: 'Alle', web: 'Websites', app: 'Apps', ads: 'Werbung', design: 'Design' },
    showAll: 'Alle Projekte anzeigen',
    items: [
      { title: 'Marktplatz für den Bau', result: 'Zweiseitige Plattform: Aufträge, Angebote und Abnahme in Echtzeit', tags: 'Next.js, NestJS, PostgreSQL', type: 'app' },
      { title: 'Englischkurse', result: '95 Anfragen in 10 Tagen, CTR bis 9,3 %', tags: 'Instagram, Facebook', type: 'ads' },
      { title: 'Alfanet', result: 'Provider-Portal: Tarife, Abdeckungskarte, Online-Anträge', tags: 'Portal, Abdeckungskarte', type: 'web' },
      { title: 'Personal Brand', result: '90 Leads für unter 1 $ pro Lead', tags: 'Leadgenerierung', type: 'ads' },
      { title: 'SHP Construction & Consulting', result: 'Website eines Bauunternehmens mit Fokus auf realisierte Objekte', tags: 'Unternehmensseite', type: 'web' },
      { title: 'Yakitori', result: 'Speisekarte mit 15 Rubriken in zwei Sprachen — schnell und ohne CMS', tags: 'Restaurant, RU / AZ', type: 'web' },
      { title: 'Massagestudio', result: '80 Buchungen à 0,93 $ in 5 Tagen', tags: 'Lokales Geschäft', type: 'ads' },
      { title: 'Deniz Service', result: 'Katalog eines Industrielieferanten: 21 Kategorien und Zertifikate', tags: 'Katalog, B2B', type: 'web' },
      { title: 'Expert Solutions', result: 'Lösungen für Öl- und Gaslabore — 25 Jahre am Markt', tags: 'Öl & Gas, B2B', type: 'web' },
      { title: 'Konteks', result: 'Produktions- und Bauunternehmen mit 90-jähriger Geschichte', tags: 'Produktion', type: 'web' },
      { title: 'Oqni Baku', result: 'Visitenkarten-Website eines Restaurants mit SEO-Optimierung', tags: 'Restaurant, SEO', type: 'web' },
      { title: 'Yakitori-Speisekarte', result: 'A4-Menübroschüre: 10 Seiten, 68 Positionen, RU und AZ aus einem Layout', tags: 'Print', type: 'design' },
    ],
  },

  pricing: {
    tag: 'Preise',
    title: 'Der Preis richtet sich nach Ihrer Aufgabe',
    note:
      'Die Kosten jedes Projekts besprechen wir individuell: Nach einem 15-minütigen Briefing nennen wir ein genaues Angebot und den Zeitplan. Das Werbebudget zahlen Sie direkt an die Plattformen.',
    valueNote: 'Genaues Angebot nach einem 15-minütigen Briefing',
    tiers: [
      { badge: 'Website', title: 'Website schlüsselfertig', value: 'Nach Absprache', features: ['Individuelles Design', 'Responsiv + Admin-Bereich', 'SEO + bereit für KI-Suche', 'Start ab 14 Werktagen'], cta: 'Besprechen', popular: false },
      { badge: 'beliebt', title: 'Social Ads oder Google Ads', value: 'Nach Absprache', features: ['Strategie, Angebote, Creatives', 'Einrichtung und Start', 'Laufende Optimierung', 'Wöchentlicher Bericht'], cta: 'Besprechen', popular: true },
      { badge: 'App', title: 'Webanwendung', value: 'Nach Absprache', features: ['Rollen, Status, Rechte', 'Integrationen und Zahlung', 'Echtzeit und Benachrichtigungen', 'Zahlung für abgenommene Etappen'], cta: 'Besprechen', popular: false },
      { badge: 'SMM', title: 'SMM & Content', value: 'Nach Absprache', features: ['Instagram, TikTok u. a.', 'Dreh alle 2 Wochen', '3 Posts und 2 Stories pro Woche', 'Reichweitenberichte'], cta: 'Besprechen', popular: false },
      { badge: 'Design', title: 'UI/UX & Branding', value: 'Nach Absprache', features: ['Website-UI/UX', 'Logo und Corporate Identity', 'Präsentationen', 'Alle Quelldateien gehören Ihnen'], cta: 'Besprechen', popular: false },
      { badge: 'KI', title: 'GEO, SEO & Automatisierung', value: 'Nach Absprache', features: ['Sichtbarkeitsaudit in KI und Google', 'Chatbots und KI-Assistenten', 'CRM-Integrationen', 'Angebot nach Audit'], cta: 'Besprechen', popular: false },
    ],
  },

  faq: {
    tag: 'Fragen',
    title: 'Häufige Fragen',
    items: [
      { q: 'Was ist GEO und warum braucht mein Unternehmen das?', a: 'Immer mehr Menschen scrollen nicht durch Suchergebnisse, sondern fragen KI um Rat. GEO ist die Arbeit an Website, Content und Markenerwähnungen, damit KI-Assistenten Ihr Unternehmen verstehen und in ihren Antworten empfehlen.' },
      { q: 'Wovon hängt der Preis ab?', a: 'Von Umfang und Komplexität: Anzahl der Seiten, Rollen und Status in einer App, Integrationen, Werbeplattformen. Ein genaues Angebot nennen wir nach einem kurzen Briefing — es dauert etwa 15 Minuten.' },
      { q: 'Ist das Werbebudget im Preis enthalten?', a: 'Nein. Das Budget zahlen Sie direkt an die Werbeplattform — meist ab 350 ₼ pro Monat; bei Google Ads kann es wegen der Keyword-Kosten höher sein.' },
      { q: 'Wann rechnet sich die Werbung?', a: 'Werbung braucht meist 3–6 Monate Anlaufzeit: In dieser Zeit finden wir die Kombinationen, die stabil Anfragen bringen. Wir versprechen keinen sofortigen Kundenstrom — wir versprechen Transparenz und wöchentliche Berichte.' },
      { q: 'Können Sie meine bestehende Website verbessern, statt eine neue zu bauen?', a: 'Ja. Zuerst machen wir ein Audit und sagen ehrlich, was sich vor Ort beheben lässt und was günstiger neu zu bauen ist. Wir betreuen auch Websites, die nicht von uns stammen.' },
      { q: 'Arbeiten Sie mit Vertrag?', a: 'Ja, immer mit offiziellem Vertrag. Bei großen Projekten wird die Zahlung in Etappen aufgeteilt — Sie zahlen für abgenommene Ergebnisse, nicht alles im Voraus.' },
      { q: 'Arbeiten Sie mit Kunden aus anderen Ländern?', a: 'Ja. Wir führen Projekte remote auf Russisch, Englisch und Aserbaidschanisch.' },
    ],
  },

  contact: {
    tag: 'Kontakt',
    title: 'Lassen Sie uns gemeinsam\ndie Zukunft bauen',
    lead: 'Erzählen Sie uns von Ihrem Ziel — wir führen ein 15-minütiges Briefing durch und schlagen eine Lösung an der Schnittstelle von Marketing und KI vor.',
    channels: { whatsapp: 'WhatsApp', telegram: 'Telegram', phone: 'Anrufen', email: 'E-Mail schreiben' },
    form: {
      title: 'Projektanfrage',
      name: 'Ihr Name',
      namePlaceholder: 'Wie dürfen wir Sie ansprechen?',
      contact: 'Telefon, WhatsApp oder Telegram',
      contactPlaceholder: '+994 50 000 00 00 oder @username',
      services: 'Was brauchen Sie?',
      message: 'Kurz zur Aufgabe',
      messagePlaceholder: 'Zum Beispiel: eine Website für eine Klinik und Werbung auf Instagram',
      consentPrefix: 'Ich akzeptiere die',
      consentLink: 'Datenschutzerklärung',
      consentSuffix: '',
      submit: 'Anfrage senden',
      sending: 'Wird gesendet…',
      note: 'Wir antworten persönlich, führen ein 15-minütiges Briefing durch und nennen ein Angebot.',
      successTitle: 'Anfrage gesendet!',
      successText: 'Vielen Dank! Wir melden uns in Kürze bei Ihnen.',
      again: 'Noch eine senden',
      errorName: 'Bitte geben Sie Ihren Namen ein (mindestens 2 Zeichen).',
      errorContact: 'Bitte geben Sie Telefon, WhatsApp oder Telegram an.',
      errorConsent: 'Bitte stimmen Sie der Datenschutzerklärung zu.',
      errorGeneric: 'Senden fehlgeschlagen. Bitte versuchen Sie es in einer Minute erneut.',
      errorRate: 'Zu viele Anfragen hintereinander. Bitte warten Sie einige Minuten und versuchen Sie es erneut.',
      errorOffline: 'Keine Internetverbindung. Prüfen Sie Ihr Netzwerk und versuchen Sie es erneut.',
    },
  },

  footer: {
    about: 'Marketing, Websites und Automatisierung mit KI — für Unternehmen, die vorne sein wollen.',
    explore: 'Navigation',
    contact: 'Kontakt',
    legal: 'Rechtliches',
    rights: 'Alle Rechte vorbehalten',
    privacy: 'Datenschutzerklärung',
    builtWith: 'Diese Website verwendet keine Cookies und keine Analysetools.',
  },

  privacy: {
    title: 'Datenschutzerklärung',
    updated: 'Fassung vom 23. Oktober 2026',
    intro:
      'In einfachen Worten: Die Website setzt keine Cookies, nutzt keine Analysetools und erhält nur das, was Sie selbst über das Anfrageformular senden. Die Einzelheiten folgen unten, der Reihe nach.',
    back: 'Zur Website',
    sections: [
      { h: 'Wer die Daten verarbeitet', p: ['Verantwortlicher für die Verarbeitung personenbezogener Daten ist Veilvex, das Team, das diese Website betreibt und die dort vorgestellten Leistungen erbringt: Sichtbarkeit in Suchmaschinen und KI-Assistenten, Werbung, SMM, Entwicklung von Websites und Apps, Automatisierung und Design.'] },
      { h: 'Welche Daten wir erhalten', p: ['Das Anfrageformular enthält folgende Felder: Name, Kontakt für die Rückmeldung (Telefon, WhatsApp oder Telegram), die gewählten Leistungen, eine kurze Beschreibung der Aufgabe und ein Pflicht-Häkchen für die Zustimmung zu dieser Erklärung.', 'Nach dem Absenden wird die Anfrage über eine verschlüsselte Verbindung (HTTPS) an den Messenger oder die E-Mail des Teams übermittelt. Die Website führt keine Datenbank mit Anfragen und speichert sie auf dem Server nicht länger, als für die Zustellung nötig ist.', 'Die Hosting-Server erhalten, wie alle Server im Internet, die technischen Daten der Anfrage: IP-Adresse, Browsertyp, Zeitpunkt der Anfrage. Wir nutzen sie ausschließlich zum Schutz vor Spam und Missbrauch (Begrenzung der Anfragehäufigkeit) und bringen sie nicht mit Ihnen in Verbindung.'] },
      { h: 'Was wir nicht erheben', p: ['Wir setzen keine Cookies und nutzen keine Zähler, Tracking-Pixel oder Werbe-IDs. Im Browser bleibt höchstens die gewählte Sprache gespeichert.', 'Bitte geben Sie in Ihrer Anfrage keine besonderen Kategorien von Daten (zu Gesundheit, religiösen oder politischen Überzeugungen u. Ä.) und keine Zahlungsdaten an — auf der Website kann nichts bezahlt werden.'] },
      { h: 'Zwecke und Rechtsgrundlagen', p: ['Wir nutzen die Daten, um Ihre Anfrage zu beantworten, die Aufgabe zu besprechen, ein Angebot zu erstellen und, falls Sie sich für eine Zusammenarbeit entscheiden, einen Vertrag zu schließen und zu erfüllen.', 'Rechtsgrundlagen: Ihre Einwilligung (das Häkchen im Formular und das Absenden der Anfrage), vorvertragliche Maßnahmen auf Ihre Anfrage, unser berechtigtes Interesse, Ihre Anfrage zu beantworten, sowie gesetzliche Pflichten zur Aufbewahrung von Vertragsunterlagen.', 'Wir nutzen Ihre Daten nicht für Werbe-Mailings und verkaufen sie nicht.'] },
      { h: 'Weitergabe an Dritte', p: ['Die Daten einer Anfrage erhalten nur die Mitarbeiter von Veilvex, die sie für die Antwort benötigen. Für die Zustellung der Anfrage nutzen wir Hosting-Dienste und Messenger (zum Beispiel Telegram oder einen E-Mail-Anbieter) — diese verarbeiten die Daten nach ihren eigenen Datenschutzbestimmungen.'] },
      { h: 'Speicherdauer und Ihre Rechte', p: ['Die Korrespondenz zu einer Anfrage bewahren wir auf, solange die Abstimmung und das Projekt laufen, und danach innerhalb der Fristen, die das Gesetz für Vertragsunterlagen vorschreibt.', 'Sie können eine Kopie, Berichtigung oder Löschung Ihrer Daten verlangen und Ihre Einwilligung widerrufen. Schreiben Sie uns über einen der im Abschnitt „Kontakt“ genannten Wege — wir antworten innerhalb von 30 Tagen.'] },
      { h: 'Sicherheit', p: ['Die Website läuft ausschließlich über HTTPS, verwendet eine strikte Content Security Policy (CSP), prüft alle eingehenden Daten auf dem Server und begrenzt die Anfragehäufigkeit. Geheimnisse und Zugangsschlüssel werden außerhalb des Website-Codes aufbewahrt.'] },
      { h: 'Änderungen dieser Erklärung', p: ['Wir können diese Erklärung aktualisieren. Die aktuelle Fassung und ihr Datum sind stets auf dieser Seite veröffentlicht.'] },
    ],
  },

  notFound: {
    title: 'Seite nicht gefunden',
    text: 'Diese Seite gibt es nicht oder sie ist umgezogen. Zurück zur Startseite — dort ist alles an seinem Platz.',
    back: 'Zur Startseite',
  },
};

export default de;
