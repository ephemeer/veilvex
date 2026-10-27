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
      terms: 'bedingungen zusammenarbeit agb vertrag zahlung etappen gewährleistung nutzungsrechte terms',
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
    views: [
      { title: 'Puls des Unternehmens', sub: 'Anfragen · Werbung · KI — letzte 30 Tage' },
      { title: 'Anfragen aus allen Kanälen', sub: 'Website · WhatsApp · Instagram — letzte 30 Tage' },
      { title: 'Kampagnenleistung', sub: 'Instagram · Facebook · Google Ads — letzte 30 Tage' },
      { title: 'Markensichtbarkeit in KI-Antworten', sub: 'ChatGPT · Gemini · Perplexity · Claude — letzte 30 Tage' },
      { title: 'Wöchentliche Berichte', sub: 'Ausgaben · Anfragen · Kennzahlen — letzte 30 Tage' },
    ],
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
      { text: 'Wochenbericht erstellt', meta: 'PDF' },
      { text: 'Termin bestätigt — 14:30', meta: 'WhatsApp' },
      { text: 'Erwähnung in ChatGPT', meta: 'GEO' },
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
      { value: 0.93, decimals: 2, prefix: '', suffix: ' $', label: 'Kosten pro Anfrage', sub: 'Massagestudio, 80 Anfragen in 5 Tagen' },
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
      { title: 'Service & B2B', desc: 'Alfanet, Expert Solutions, ein Massagestudio: Portale und Anfragen à 0,93 $.' },
    ],
  },

  cases: {
    tag: 'Projekte',
    title: 'Ausgewählte Projekte',
    filters: { all: 'Alle', web: 'Websites', app: 'Apps', ads: 'Werbung', design: 'Design' },
    showAll: 'Alle Projekte anzeigen',
    items: [
      {
        title: 'Marktplatz für den Bau', result: 'Zweiseitige Plattform: Aufträge, Angebote und Abnahme in Echtzeit', tags: 'Next.js, NestJS, PostgreSQL', type: 'app',
        kind: 'Web-App',
        lead: 'Eine zweiseitige Plattform für das Bauwesen: Auftraggeber stellen Aufträge ein, Ausführende reagieren darauf, und die Abnahme erfolgt direkt im System.',
        blocks: [{ h: 'Lösung', items: ['Eine Webanwendung mit Next.js.', 'Ein Backend mit NestJS und einer PostgreSQL-Datenbank.', 'Getrennte Rollen für Auftraggeber und Ausführende.', 'Auftragsstatus aktualisieren sich in Echtzeit.'] }],
      },
      {
        title: 'Englischkurse', result: '95 Anfragen in 10 Tagen, CTR bis 9,3 %', tags: 'Instagram, Facebook', type: 'ads',
        kind: 'Werbung',
        lead: 'Eine Werbekampagne für eine Online-Englischschule auf Instagram und Facebook.',
        blocks: [{ h: 'Ergebnis', items: ['95 Anfragen in 10 Tagen.', 'Klickrate der Anzeigen bis zu 9,3 Prozent.'] }, { h: 'Worauf es bei solchen Kampagnen ankommt', items: ['Ein starkes Angebot, Creatives für eine konkrete Zielgruppe und eine schnelle Bearbeitung jeder Anfrage.'] }],
      },
      {
        title: 'Alfanet', result: 'Provider-Portal: Tarife, Abdeckungskarte, Online-Anträge', tags: 'Portal, Abdeckungskarte', type: 'web',
        kind: 'Website',
        lead: 'Das Portal des Internetanbieters Alfanet: Tarife, Abdeckungskarte und Online-Anfragen für einen Anschluss.',
        blocks: [{ h: 'Auf der Website', items: ['Eine klare Tarifübersicht.', 'Eine Abdeckungskarte — Kunden sehen sofort, ob ein Anschluss verfügbar ist.', 'Eine Online-Anfrage ohne Anruf.'] }],
      },
      {
        title: 'Personal Brand', result: '90 Leads für unter 1 $ pro Lead', tags: 'Leadgenerierung', type: 'ads',
        kind: 'Werbung',
        lead: 'Lead-Generierung für einen Experten, der seine persönliche Marke aufbaut.',
        blocks: [{ h: 'Ergebnis', items: ['90 Leads für unter einen Dollar pro Lead.'] }],
      },
      {
        title: 'SHP Construction & Consulting', result: 'Website eines Bauunternehmens mit Fokus auf realisierte Objekte', tags: 'Unternehmensseite', type: 'web',
        kind: 'Website',
        lead: 'Die Unternehmenswebsite der Baufirma SHP Construction and Consulting.',
        blocks: [{ h: 'Schwerpunkt', items: ['Realisierte Projekte sind das stärkste Argument für Auftraggeber, deshalb stehen sie im Mittelpunkt der Website.'] }],
      },
      {
        title: 'Yakitori', result: 'Speisekarte mit 15 Rubriken in zwei Sprachen — schnell und ohne CMS', tags: 'Restaurant, RU / AZ', type: 'web',
        kind: 'Website',
        lead: 'Website und Online-Speisekarte des Restaurants Yakitori auf Russisch und Aserbaidschanisch.',
        blocks: [{ h: 'Lösung', items: ['Eine Speisekarte mit 15 Bereichen.', 'Zwei Sprachversionen.', 'Schnelles Laden ohne schweres CMS.'] }],
      },
      {
        title: 'Massagestudio', result: '80 Anfragen à 0,93 $ in 5 Tagen', tags: 'Lokales Geschäft', type: 'ads',
        kind: 'Werbung',
        lead: 'Werbung für einen Massagesalon — ein lokales Geschäft, das Buchungen hier und jetzt braucht.',
        blocks: [{ h: 'Ergebnis', items: ['80 Anfragen für je 93 Cent in fünf Tagen.'] }],
      },
      {
        title: 'Deniz Service', result: 'Katalog eines Industrielieferanten: 21 Kategorien und Zertifikate', tags: 'Katalog, B2B', type: 'web',
        kind: 'Website',
        lead: 'Ein Katalog für den Industrielieferanten Deniz Service, gemacht für B2B-Kunden.',
        blocks: [{ h: 'Auf der Website', items: ['21 Produktkategorien.', 'Zertifikate und Dokumente.'] }],
      },
      {
        title: 'Expert Solutions', result: 'Lösungen für Öl- und Gaslabore — 25 Jahre am Markt', tags: 'Öl & Gas, B2B', type: 'web',
        kind: 'Website',
        lead: 'Die Website von Expert Solutions — Lösungen für Öl- und Gaslabore.',
        blocks: [{ h: 'Schwerpunkt', items: ['25 Jahre am Markt: Erfahrung und Zuverlässigkeit sind genau das, was B2B-Kunden dieser Branche suchen.'] }],
      },
      {
        title: 'Konteks', result: 'Produktions- und Bauunternehmen mit 90-jähriger Geschichte', tags: 'Produktion', type: 'web',
        kind: 'Website',
        lead: 'Die Website von Konteks, einem Produktions- und Bauunternehmen.',
        blocks: [{ h: 'Schwerpunkt', items: ['Die neunzigjährige Geschichte des Unternehmens ist ein starkes Vertrauensargument — die Website ist darum herum aufgebaut.'] }],
      },
      {
        title: 'Oqni Baku', result: 'Visitenkarten-Website eines Restaurants mit SEO-Optimierung', tags: 'Restaurant, SEO', type: 'web',
        kind: 'Website',
        lead: 'Eine Visitenkarten-Website für das Restaurant Oqni Baku.',
        blocks: [{ h: 'Lösung', items: ['Suchmaschinenoptimierung, damit Gäste das Restaurant online finden.'] }],
      },
      {
        title: 'Yakitori-Speisekarte', result: 'A4-Menübroschüre: 10 Seiten, 68 Positionen, RU und AZ aus einem Layout', tags: 'Print', type: 'design',
        kind: 'Design',
        lead: 'Eine Speisekarten-Broschüre im A4-Format für das Restaurant Yakitori.',
        blocks: [{ h: 'Lösung', items: ['10 Seiten und 68 Positionen.', 'Russische und aserbaidschanische Version aus einem Layout.'] }],
      },
    ],
    sheet: { kicker: 'Projekt', direction: 'Bereich', tech: 'Technologien & Kanäle', result: 'Ergebnis', cta: 'Das will ich auch', close: 'Schließen', prev: 'Vorheriges Projekt', next: 'Nächstes Projekt' },
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
      { q: 'Ist das Werbebudget im Preis enthalten?', a: 'Nein. Das Budget zahlen Sie direkt an die Werbeplattform — meist ab 200 $ pro Monat; bei Google Ads kann es wegen der Keyword-Kosten höher sein.' },
      { q: 'Wann rechnet sich die Werbung?', a: 'Werbung braucht meist 3–6 Monate Anlaufzeit: In dieser Zeit finden wir die Kombinationen, die stabil Anfragen bringen. Wir versprechen keinen sofortigen Kundenstrom — wir versprechen Transparenz und wöchentliche Berichte.' },
      { q: 'Können Sie meine bestehende Website verbessern, statt eine neue zu bauen?', a: 'Ja. Zuerst machen wir ein Audit und sagen ehrlich, was sich vor Ort beheben lässt und was günstiger neu zu bauen ist. Wir betreuen auch Websites, die nicht von uns stammen.' },
      { q: 'Arbeiten Sie mit Vertrag?', a: 'Ja, immer mit offiziellem Vertrag. Bei großen Projekten wird die Zahlung in Etappen aufgeteilt — Sie zahlen für abgenommene Ergebnisse, nicht alles im Voraus.' },
      { q: 'Arbeiten Sie mit Kunden aus anderen Ländern?', a: 'Ja. Wir sind an kein Land gebunden: wir führen Projekte weltweit remote auf Deutsch, Englisch, Russisch und Aserbaidschanisch.' },
    ],
  },

  contact: {
    tag: 'Kontakt',
    title: 'Lassen Sie uns gemeinsam\ndie {{Zukunft}} bauen',
    lead: 'Erzählen Sie uns von Ihrem Ziel — wir führen ein 15-minütiges Briefing durch und schlagen eine Lösung an der Schnittstelle von Marketing und KI vor.',
    channels: { whatsapp: 'WhatsApp', telegram: 'Telegram', phone: 'Anrufen', email: 'E-Mail schreiben' },
    form: {
      title: 'Projektanfrage',
      name: 'Ihr Name',
      namePlaceholder: 'Wie dürfen wir Sie ansprechen?',
      contact: 'Telefon, WhatsApp oder Telegram',
      contactPlaceholder: 'Nummer mit Ländervorwahl oder @username',
      services: 'Was brauchen Sie?',
      message: 'Kurz zur Aufgabe',
      messagePlaceholder: 'Zum Beispiel: eine Website für eine Klinik und Werbung auf Instagram',
      consentPrefix: 'Ich bin mit der Verarbeitung meiner Angaben gemäß der',
      consentLink: 'Datenschutzerklärung',
      consentMiddle: 'einverstanden und habe die',
      consentTermsLink: 'Bedingungen der Zusammenarbeit',
      consentSuffix: 'gelesen',
      submit: 'Anfrage senden',
      sending: 'Wird gesendet…',
      note: 'Wir antworten persönlich, führen ein 15-minütiges Briefing durch und nennen ein Angebot.',
      successTitle: 'Anfrage gesendet!',
      successText: 'Vielen Dank! Wir melden uns in Kürze bei Ihnen.',
      again: 'Noch eine senden',
      errorName: 'Bitte geben Sie Ihren Namen ein (mindestens 2 Zeichen).',
      errorContact: 'Bitte geben Sie Telefon, WhatsApp oder Telegram an.',
      errorConsent: 'Bitte willigen Sie in die Verarbeitung Ihrer Angaben ein.',
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
    terms: 'Bedingungen der Zusammenarbeit',
    builtWith: 'Diese Website verwendet keine Cookies und keine Analysetools.',
  },

  legal: {
    updated: 'Fassung vom',
    toc: 'Inhalt',
    back: 'Zur Website',
    seeAlso: 'Siehe auch',
    contactsNote: 'Förmliche Mitteilungen, auch zum Vertrag, können Sie über jeden dieser Kontakte oder per E-Mail [[email]] senden.',
    emailTo: 'an {email}',
    emailFallback: 'an die auf dieser Website veröffentlichte oder in Ihrem Vertrag genannte Adresse',
  },

  privacy: {
    title: 'Datenschutzerklärung',
    description: 'Welche Daten die Veilvex-Website erhält, wozu, an wen sie gehen, wie lange wir sie speichern und welche Rechte Sie haben. Ohne Werbe-Cookies und Tracker.',
    intro:
      'Kurz gesagt: Diese Website verwendet keine Werbe- oder Analyse-Cookies, keine Tracking-Pixel und keine Zähldienste Dritter und erhält von Ihnen nur das, was Sie uns selbst über das Anfrageformular senden, sowie die technischen Daten, ohne die keine Website funktioniert. Im Folgenden erfahren Sie im Einzelnen, was wir erhalten, auf welcher Rechtsgrundlage, an wen wir es weitergeben, wie lange wir es speichern und wie Sie Ihre Rechte wahrnehmen.',
    clauses: false,
    sections: [
      {
        id: 'controller',
        h: 'Verantwortlicher und Kontakt',
        blocks: [
          'Veilvex ist das Team, das diese Website betreibt und die dort vorgestellten Leistungen erbringt: Sichtbarkeit in Suchmaschinen und KI-Assistenten (SEO und GEO), Werbung, Social Media, Entwicklung von Websites und Apps, KI-Automatisierung und Design. „Wir“ bezeichnet in dieser Erklärung Veilvex.',
          'Verantwortlicher für die Verarbeitung Ihrer personenbezogenen Daten ist der Inhaber der Marke Veilvex. Schließen Sie mit uns einen Vertrag, ist darin das Unternehmen bzw. der Einzelunternehmer benannt, der Ihr Vertragspartner ist und für die Datenverarbeitung im Rahmen der Zusammenarbeit verantwortlich ist. Die vollständigen Angaben teilen wir Ihnen auf Anfrage mit.',
          'Einen Datenschutzbeauftragten haben wir nicht benannt. Anfragen zu Ihren Daten können Sie über jeden aktuellen Kontakt aus diesem Abschnitt oder von der Website senden: per E-Mail, sofern angegeben, oder an den offiziellen Veilvex-Account in Telegram oder WhatsApp. Schreiben Sie uns über einen Messenger, prüfen wir, ob die Anfrage von derselben Person stammt, die die ursprüngliche Anfrage gesendet hat (siehe Abschnitt 9).',
          { contacts: true },
        ],
      },
      {
        id: 'scope',
        h: 'Geltungsbereich',
        blocks: [
          'Diese Erklärung gilt für alle Sprachversionen der Website, für das Anfrageformular und für die Korrespondenz mit uns vor Vertragsschluss — ob über das Formular, einen Messenger oder per E-Mail.',
          'Erhalten wir bei der Arbeit an Ihrem Projekt Zugriff auf Daten Ihrer Kunden, regelt dies der Vertrag mit Ihnen (siehe Abschnitt 14). Wie die Zusammenarbeit mit Kunden abläuft, beschreiben unsere [[terms|Bedingungen der Zusammenarbeit]].',
        ],
      },
      {
        id: 'data',
        h: 'Welche Daten wir erhalten',
        blocks: [
          'Über das Anfrageformular nur das, was Sie selbst eingeben:',
          {
            ul: [
              'Ihren Namen, damit wir Sie richtig ansprechen;',
              'einen Kontakt für die Rückmeldung — Telefonnummer, WhatsApp oder Telegram-Benutzername;',
              'die gewählten Leistungen und, wenn Sie möchten, eine kurze Beschreibung der Aufgabe;',
              'das Einwilligungshäkchen und die Sprache der Seite, von der die Anfrage gesendet wurde.',
            ],
          },
          'Zusammen mit der Anfrage übermittelt Ihr Browser zwei technische Felder zum Schutz vor Bots: ein verstecktes Feld, das Menschen leer lassen, und den Zeitpunkt, zu dem das Formular geöffnet wurde. Angaben zu Ihrer Person enthalten sie nicht.',
          'Schreiben Sie uns direkt über WhatsApp, Telegram oder per E-Mail, sehen wir, was der jeweilige Dienst anzeigt: Profilname und -bild, Nummer oder Benutzername sowie Ihre Nachrichten.',
          'Technische Daten. Wie jeder Server im Internet erhält unser Hosting bei jedem Aufruf Ihre IP-Adresse, Angaben zum Browser, die aufgerufene Seite und die Uhrzeit. Wenn Sie das Formular absenden, (1) berechnet unser Formular-Handler zusätzlich einen kryptografischen Hash Ihrer IP-Adresse und speichert ihn mit den Zeitpunkten der letzten Anfragen für ein kurzes technisches Zeitfenster, um vor Spam zu schützen und die Häufigkeit der Anfragen zu begrenzen; (2) protokolliert er technische Ereignisse: ein gekürztes Fragment dieses Hashs, die Sprache, die Zahl der gewählten Leistungen, den Zustellkanal und Fehlercodes. Name, Kontakt und Nachrichtentext gelangen nicht in die Protokolle.',
          'Bitte senden Sie uns über das Formular keine besonderen Kategorien personenbezogener Daten (etwa zu Gesundheit oder Weltanschauung), keine Ausweisdokumente und keine Zahlungsdaten — auf der Website kann nichts bezahlt werden.',
        ],
      },
      {
        id: 'cookies',
        h: 'Cookies, Analyse und Dienste Dritter',
        blocks: [
          'Die Website verwendet keine Werbe- oder Analyse-Cookies, keine Tracking-Pixel, keine Besucherzähler Dritter, keine Werbe-IDs und kein Browser-Fingerprinting.',
          'Ihr Browser kann jedoch einen technischen lokalen Speicher nutzen — etwa, um die gewählte Sprache der Oberfläche oder technische Einstellungen zu speichern. Solche Einträge dienen nur dem Betrieb der Website, bleiben auf Ihrem Gerät, werden nicht zum Tracking verwendet und lassen sich in den Browsereinstellungen löschen. Für technisch erforderliche Speicherung ist keine Einwilligung nötig, deshalb gibt es kein Cookie-Banner.',
          'Unsere Content Security Policy (CSP) beschränkt das Einbinden nicht freigegebener Skripte Dritter.',
          'Die Links zu WhatsApp und Telegram sind einfache Links: Diese Dienste erhalten erst Daten, wenn Sie einem Link folgen; ab dann gelten deren eigene Bestimmungen.',
        ],
      },
      {
        id: 'purposes',
        h: 'Zwecke und Rechtsgrundlagen',
        blocks: [
          'Wir verarbeiten Daten ausschließlich zu den unten genannten Zwecken. Die Rechtsgrundlagen richten sich nach der Datenschutz-Grundverordnung (DSGVO); Hinweise zu anderen Ländern finden Sie in Abschnitt 10.',
          {
            table: {
              head: ['Zweck', 'Daten', 'Rechtsgrundlage'],
              rows: [
                ['Ihre Anfrage beantworten, Briefing, Angebot und Vertrag vorbereiten', 'Formulardaten, Korrespondenz', 'Vorvertragliche Maßnahmen auf Ihre Anfrage — Art. 6 Abs. 1 lit. b DSGVO; die im Formular erteilte Einwilligung — Art. 6 Abs. 1 lit. a, soweit das Gesetz eine Einwilligung verlangt'],
                ['Vertrag erfüllen und Projekt durchführen', 'Kontaktdaten der Ansprechpartner, Projektkorrespondenz', 'Vertrag — Art. 6 Abs. 1 lit. b; bei Beschäftigten eines Firmenkunden berechtigtes Interesse — Art. 6 Abs. 1 lit. f'],
                ['Formular vor Spam und Missbrauch schützen, Betrieb und Sicherheit der Website gewährleisten', 'IP-Hash, Zeitpunkte der Anfragen, technische Protokolle', 'Berechtigtes Interesse am sicheren Betrieb der Website — Art. 6 Abs. 1 lit. f'],
                ['Buchhaltung und steuerliche Aufbewahrung', 'Vertrag, Rechnungen, Abnahmeprotokolle', 'Rechtliche Verpflichtung — Art. 6 Abs. 1 lit. c'],
                ['Rechtsverteidigung im Streitfall', 'Vertrag und Projektkorrespondenz', 'Berechtigtes Interesse — Art. 6 Abs. 1 lit. f'],
              ],
            },
          },
          'Das Ausfüllen des Formulars ist freiwillig — Sie können uns auch einfach im Messenger schreiben. Ohne Namen und Kontakt können wir jedoch nicht antworten.',
          'Ohne Ihre gesonderte Einwilligung versenden wir keine Werbung, wir verkaufen keine Daten und nutzen Anfragen nicht zum Training von KI-Modellen.',
        ],
      },
      {
        id: 'recipients',
        h: 'Empfänger',
        blocks: [
          'Anfragen sehen nur die Mitglieder des Veilvex-Teams, die sie für die Antwort und die Projektarbeit benötigen. Auftragnehmer, die wir in ein Projekt einbinden, erhalten nur das Nötige und sind zur Vertraulichkeit verpflichtet.',
          'Dienste, über die Daten laufen:',
          {
            ul: [
              'Cloudflare, Inc. (USA) — Hosting der Website, Formular-Handler, Speicher für die Anfragebegrenzung und technische Protokolle;',
              'Telegram — ein Bot stellt die Anfrage in einen geschlossenen Chat des Teams zu;',
              'Resend, Inc. (USA) — stellt die Anfrage per E-Mail an das Team-Postfach zu, wo sie bei unserem E-Mail-Anbieter gespeichert wird;',
              'WhatsApp (Meta) und Telegram — wenn Sie uns dort selbst schreiben.',
            ],
          },
          'Eine Anfrage erreicht uns über Telegram, per E-Mail oder auf beiden Wegen — je nachdem, welche Kanäle aktiviert sind. Weitere Empfänger gibt es nicht.',
          'Behörden geben wir Daten nur heraus, wenn das Gesetz es verlangt. Wir verkaufen oder vermieten keine Daten.',
        ],
      },
      {
        id: 'transfers',
        h: 'Übermittlung in Drittländer',
        blocks: [
          'Cloudflare und Resend haben ihren Sitz in den USA, Telegram betreibt Server in mehreren Ländern. Ihre Daten können daher außerhalb Ihres Landes verarbeitet werden, auch außerhalb der EU bzw. des EWR.',
          'Für Übermittlungen aus der EU/dem EWR, dem Vereinigten Königreich und der Schweiz stützen wir uns auf Angemessenheitsbeschlüsse (insbesondere das EU-U.S. Data Privacy Framework für dort zertifizierte Empfänger) oder auf die Standardvertragsklauseln der Europäischen Kommission (Art. 46 Abs. 2 lit. c DSGVO) in den Auftragsverarbeitungsverträgen der Anbieter. Wo beides nicht greift — etwa wenn Sie selbst einen Messenger für die Kontaktaufnahme wählen —, werden Daten nur in dem Umfang übermittelt, der zur Beantwortung Ihrer Anfrage erforderlich ist (Art. 49 Abs. 1 lit. b DSGVO).',
          'Eine Kopie der jeweiligen Garantien erhalten Sie über die Kontakte in Abschnitt 1.',
        ],
      },
      {
        id: 'retention',
        h: 'Speicherdauer',
        blocks: [
          {
            table: {
              head: ['Daten', 'Speicherdauer'],
              rows: [
                ['Anfrage und Korrespondenz ohne anschließenden Vertrag', 'Solange das Gespräch aktuell ist und die Aussicht besteht, dass wir auf die Aufgabe zurückkommen. Danach löschen wir sie im Rahmen der regelmäßigen Bereinigung unserer Archive — oder früher, wenn Sie es verlangen.'],
                ['Korrespondenz und Unterlagen zu einem Vertrag', 'Für die Vertragslaufzeit, danach so lange, wie handels- und steuerrechtliche Aufbewahrungspflichten es verlangen und bis zum Ablauf der Verjährungsfristen — je nach Land in der Regel 3 bis 10 Jahre.'],
                ['IP-Hash und Zeitpunkte der Anfragen', 'Nur für ein kurzes technisches Zeitfenster zum Schutz vor Spam und zur Begrenzung der Anfragehäufigkeit. Der Eintrag enthält keinen Anfrageinhalt und wird nach Ablauf des technischen Zeitfensters automatisch bereinigt.'],
                ['Protokolle des Hostings und des Formular-Handlers', 'Für einen begrenzten Zeitraum nach den Regeln von Cloudflare. Sie enthalten keinen Anfrageinhalt.'],
              ],
            },
          },
          'Bitten Sie uns um eine frühere Löschung, kommen wir dem nach — ausgenommen Daten, die wir von Gesetzes wegen aufbewahren müssen.',
        ],
      },
      {
        id: 'rights',
        h: 'Ihre Rechte',
        blocks: [
          'Sie haben jederzeit das Recht,',
          {
            ul: [
              'Auskunft darüber zu verlangen, welche Daten wir über Sie gespeichert haben, und eine Kopie zu erhalten (Art. 15 DSGVO);',
              'unrichtige oder unvollständige Daten berichtigen zu lassen (Art. 16);',
              'die Löschung Ihrer Daten zu verlangen (Art. 17);',
              'die Einschränkung der Verarbeitung zu verlangen — etwa solange wir einen Widerspruch prüfen (Art. 18);',
              'die von Ihnen bereitgestellten Daten in einem maschinenlesbaren Format zu erhalten oder an einen anderen übermitteln zu lassen (Art. 20);',
              'einer Verarbeitung, die auf unserem berechtigten Interesse beruht, zu widersprechen (Art. 21);',
              'eine Einwilligung zu widerrufen — die Rechtmäßigkeit der bis dahin erfolgten Verarbeitung bleibt unberührt (Art. 7 Abs. 3);',
              'sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren — insbesondere in dem Land, in dem Sie leben oder arbeiten oder in dem der mutmaßliche Verstoß stattfand (Art. 77); in Deutschland ist das die Aufsichtsbehörde Ihres Bundeslandes.',
            ],
          },
          'So gehen Sie vor: Schreiben Sie uns über einen aktuellen Kontakt aus Abschnitt 1 oder von der Website — per E-Mail, sofern angegeben, oder an den offiziellen Veilvex-Account in Telegram oder WhatsApp. Damit wir keine Daten an Unbefugte herausgeben, prüfen wir, ob die Anfrage von der Person stammt, die die ursprüngliche Anfrage gesendet hat — etwa indem wir Sie bitten, von dem dort angegebenen Kontakt zu schreiben oder Einzelheiten der Anfrage zu bestätigen. Das ist für Sie kostenlos.',
          'Wir antworten unverzüglich, spätestens innerhalb eines Monats. Bei komplexen oder zahlreichen Anträgen kann sich die Frist um weitere zwei Monate verlängern; darüber informieren wir Sie innerhalb des ersten Monats unter Angabe der Gründe.',
        ],
      },
      {
        id: 'regional',
        h: 'Hinweise für einzelne Länder',
        blocks: [
          'EU, EWR, Vereinigtes Königreich und Schweiz. Diese Erklärung folgt der DSGVO, der UK GDPR und dem Schweizer Datenschutzgesetz (revDSG). Für Deutschland: Die Website speichert auf Ihrem Endgerät höchstens, was für die von Ihnen aufgerufene Seite unbedingt erforderlich ist (etwa die gewählte Sprache); dafür ist nach § 25 TDDDG keine Einwilligung erforderlich.',
          'Kalifornien (CCPA/CPRA), soweit auf uns anwendbar. In den letzten 12 Monaten haben wir Identifikatoren (Name, Kontakt), Angaben zu Ihrer Anfrage und Daten zur Internetaktivität (Abschnitt 3) aus den in den Abschnitten 3 und 5 genannten Quellen und zu den dort genannten Zwecken erhoben. Wir verkaufen keine personenbezogenen Informationen, geben sie nicht für kontextübergreifende verhaltensbasierte Werbung weiter („share“) und nutzen keine sensiblen Informationen. Sie haben das Recht zu erfahren, welche Daten wir erheben, deren Löschung und Berichtigung zu verlangen und wegen der Ausübung Ihrer Rechte nicht benachteiligt zu werden.',
          'Aserbaidschan. Die Verarbeitung erfolgt im Einklang mit dem Gesetz der Republik Aserbaidschan „Über personenbezogene Daten“. Das Häkchen im Formular ist Ihre Einwilligung in die Verarbeitung der angegebenen Daten zur Beantwortung Ihrer Anfrage, einschließlich der Übermittlung an die in Abschnitt 6 genannten Dienste im Ausland. Sie haben das Recht zu erfahren, welche Daten über Sie wie verarbeitet werden, deren Berichtigung oder Vernichtung zu verlangen und Ihre Einwilligung zu widerrufen.',
          'Andere Länder. Wenn Sie sich in einem Land befinden, dessen Recht für die Beantwortung Ihrer Anfrage eine gesonderte Einwilligung in die Verarbeitung personenbezogener Daten und deren grenzüberschreitende Übermittlung verlangt, bestätigen das Häkchen im Formular oder eine Nachricht an uns über einen Messenger diese Einwilligung. Sie können sie über die Kontakte aus Abschnitt 1 widerrufen; Ihre Rechte üben Sie wie in Abschnitt 9 beschrieben aus.',
        ],
      },
      {
        id: 'children',
        h: 'Kinder',
        blocks: [
          'Unsere Leistungen richten sich an Unternehmen und Erwachsene. Wir erheben wissentlich keine Daten von Personen unter 16 Jahren. Sollte ein Kind uns Daten gesendet haben, geben Sie uns bitte Bescheid — wir löschen sie.',
        ],
      },
      {
        id: 'security',
        h: 'Datensicherheit',
        blocks: [
          {
            ul: [
              'Die Website ist ausschließlich über HTTPS erreichbar; der HSTS-Header verhindert, dass Browser sie über eine unverschlüsselte Verbindung öffnen.',
              'Eine Content Security Policy (CSP) beschränkt das Einbinden nicht freigegebener Skripte Dritter und sperrt das Einbetten der Website in fremde Seiten.',
              'Das Formular nimmt Anfragen nur von unseren eigenen Seiten an; der Server prüft jedes Feld, weist unbekannte Felder zurück, entfernt unsichtbare Steuerzeichen und begrenzt die Größe der Anfrage.',
              'Die Zahl der Anfragen ist begrenzt; Bots werden durch ein verstecktes Feld und eine Zeitprüfung herausgefiltert.',
              'Anfragen werden als reiner Text zugestellt — Ihre Eingaben werden weder auf der Website noch in der Nachricht an das Team zu HTML-Code.',
              'IP-Adressen speichern wir nur als Hash, Zugangsschlüssel für Dienste nur in geschützten Umgebungsvariablen, nie im Code.',
              'Zugriff auf den Chat und das Postfach mit den Anfragen haben nur Teammitglieder, die ihn für ihre Arbeit brauchen.',
            ],
          },
          'Absolute Sicherheit gibt es im Internet nicht. Kommt es zu einer Verletzung des Schutzes personenbezogener Daten, die ein Risiko für Ihre Rechte darstellt, melden wir dies fristgerecht der Aufsichtsbehörde und benachrichtigen, wo erforderlich, auch Sie.',
        ],
      },
      {
        id: 'automated',
        h: 'Automatisierte Entscheidungen',
        blocks: [
          'Wir treffen keine ausschließlich automatisierten Entscheidungen, die Ihnen gegenüber rechtliche Wirkung entfalten oder Sie in ähnlicher Weise erheblich beeinträchtigen, und erstellen kein Profiling. Jede Anfrage wird von Menschen gelesen und bearbeitet; automatisch arbeitet nur der Spamfilter.',
        ],
      },
      {
        id: 'client-projects',
        h: 'Daten in Kundenprojekten',
        blocks: [
          'Wenn wir Werbung, ein CRM, Chatbots oder Analysetools einrichten oder eine Website entwickeln, erhalten wir unter Umständen Zugriff auf Daten Ihrer Kunden. Verantwortlicher bleiben dann Sie; wir sind Ihr Auftragsverarbeiter und verarbeiten die Daten nur nach Ihren Weisungen und für die Zwecke des Projekts.',
          'Auf Wunsch schließen wir einen Auftragsverarbeitungsvertrag (AVV, Art. 28 DSGVO) oder nehmen entsprechende Regelungen in den Vertrag auf. Zugänge zu Ihren Konten nutzen wir nur für die Arbeit, geben sie nicht weiter und geben sie nach Projektende zurück bzw. bitten Sie, sie zu entziehen.',
          'Als Betreiber der Website oder Inhaber des Unternehmens sind Sie für die Rechtsgrundlage der Verarbeitung Ihrer Kundendaten, Ihre eigene Datenschutzerklärung und Einwilligungsbanner verantwortlich. Wir helfen bei Vorbereitung und technischer Umsetzung — eine Rechtsberatung ersetzt das nicht.',
        ],
      },
      {
        id: 'changes',
        h: 'Änderungen dieser Erklärung',
        blocks: [
          'Wir passen diese Erklärung an, wenn sich die Website, die eingesetzten Dienste oder die Rechtslage ändern. Die aktuelle Fassung und ihr Datum sind stets auf dieser Seite veröffentlicht. Diese Erklärung ist in mehreren Sprachen veröffentlicht; Standardsprache der Website ist Englisch, und bei Abweichungen ist die englische Fassung maßgeblich. Eine neue Fassung tritt mit ihrer Veröffentlichung auf dieser Seite in Kraft, sofern sie selbst nichts anderes bestimmt.',
        ],
      },
    ],
  },

  terms: {
    title: 'Bedingungen der Zusammenarbeit',
    description: 'So arbeitet Veilvex mit Kunden: Anfrage und Angebot, Vertrag und Zahlung in Etappen, Stornierung und Erstattung, Abnahme, Nutzungsrechte, Haftung.',
    intro:
      'Diese Bedingungen erklären vorab, wie die Zusammenarbeit mit uns abläuft — von der ersten Anfrage bis zur Übergabe des Projekts, einschließlich Zahlung, Stornierung und Erstattung. Umfang, Termine, Preis und Pflichten im Einzelnen legt stets der Vertrag fest, den wir mit jedem Kunden schließen.',
    clauses: true,
    sections: [
      {
        id: 'general',
        h: 'Allgemeines',
        blocks: [
          'Diese Bedingungen beschreiben, wie Veilvex seine Leistungen erbringt: Sichtbarkeit in Suchmaschinen und KI-Assistenten (SEO und GEO), Werbung, Social Media, Entwicklung von Websites und Apps, KI-Automatisierung, Design und Branding. Sie gelten für Anfragen, Verhandlungen und Projekte, soweit der Vertrag nichts anderes bestimmt.',
          'Maßgebliches Dokument der Zusammenarbeit ist der Vertrag oder ein von Ihnen angenommenes Angebot (im Folgenden „Vertrag“). Weicht der Vertrag von dieser Seite ab, hat der Vertrag Vorrang.',
          'Unser Vertragspartner ist das im Vertrag genannte Unternehmen bzw. der dort genannte Einzelunternehmer. Die vollständigen Angaben teilen wir vor der Unterzeichnung mit.',
          'Die Leistungen von Veilvex richten sich ausschließlich an Unternehmen und dienen gewerblichen bzw. unternehmerischen Zwecken (B2B). Mit der Anfrage oder der Zahlung (auch wenn sie vom privaten Konto einer natürlichen Person erfolgt) bestätigt der Kunde, dass er in Ausübung seiner gewerblichen oder selbstständigen beruflichen Tätigkeit handelt; Verbraucherschutzrecht findet auf das Verhältnis der Parteien keine Anwendung.',
          'Sollte eine Bestimmung unwirksam oder undurchführbar sein, bleiben die übrigen wirksam; an die Stelle der unwirksamen tritt eine wirksame Regelung, die ihrem Zweck am nächsten kommt.',
        ],
      },
      {
        id: 'website',
        h: 'Angaben auf der Website',
        blocks: [
          'Die Angaben auf dieser Website — Leistungsbeschreibungen, Fallstudien, ungefähre Zeitrahmen — dienen der Information und sind kein verbindliches Angebot. Genauen Umfang, Preis und Termine nennen wir nach dem Briefing.',
          'Die Website und ihre Inhalte werden „wie besehen“ und „wie verfügbar“ bereitgestellt. Wir übernehmen keine Gewähr dafür, dass die Informationen vollständig, aktuell und fehlerfrei sind oder dass die Website jederzeit ohne Unterbrechung erreichbar ist.',
          'Die Zahlen in den Fallstudien stammen aus konkreten Projekten und garantieren nicht dieselben Ergebnisse in Ihrem.',
          'Texte, Design, Illustrationen und Code dieser Website gehören Veilvex. Eine Vervielfältigung oder kommerzielle Nutzung ist nur mit unserer schriftlichen Zustimmung zulässig; Zitate mit Quellenangabe sind erlaubt.',
        ],
      },
      {
        id: 'inquiries',
        h: 'Anfragen, Kostenschätzungen und Angebote',
        blocks: [
          'Eine Anfrage über die Website, eine Nachricht im Messenger oder ein Briefing verpflichtet weder Sie noch uns zu etwas.',
          'Kostenschätzungen und Angebote beruhen auf den Informationen aus dem Briefing und sind bis zur Vertragsunterzeichnung unverbindlich. Sofern im Angebot nicht anders angegeben, gilt es 30 Tage.',
          'Stellt sich nach dem Briefing heraus, dass die Aufgabe deutlich größer oder kleiner ist als beschrieben, passen wir die Schätzung vor Arbeitsbeginn an.',
        ],
      },
      {
        id: 'workflow',
        h: 'Ablauf eines Projekts',
        blocks: [
          'Der übliche Ablauf:',
          {
            ul: [
              'Briefing — wir besprechen Ihr Unternehmen, die Aufgabe, Zeitrahmen und Budget und nennen eine erste Kostenschätzung.',
              'Angebot — wir legen Leistungsumfang, Etappen, Ergebnisse, Preis und Termine fest.',
              'Vertrag — wir unterzeichnen den Vertrag und bei Bedarf eine Vertraulichkeitsvereinbarung (NDA) und einen Auftragsverarbeitungsvertrag.',
              'Anzahlung — Sie leisten die im Vertrag vereinbarte Anzahlung für die erste Etappe; die Arbeit beginnt nach deren Eingang.',
              'Etappen — wir arbeiten Etappe für Etappe und zeigen Zwischenergebnisse; bei Werbung, SEO und Social Media ist eine Etappe meist ein Monat mit Bericht.',
              'Abnahme und Korrekturen — Sie prüfen das Ergebnis jeder Etappe, wir nehmen Korrekturen in dem im Vertrag oder Kostenvoranschlag ausdrücklich vereinbarten Umfang vor.',
              'Übergabe — wir übergeben Ergebnis, Quelldateien, Zugänge und Anleitungen.',
            ],
          },
          'Jede Seite benennt eine Ansprechperson, die Entscheidungen zum Projekt trifft. Projektfragen, Abstimmungen und förmliche Mitteilungen können per E-Mail oder über Telegram, WhatsApp oder den Projekt-Chat erfolgen (Abschnitt 18).',
        ],
      },
      {
        id: 'payment',
        h: 'Vergütung und Zahlung',
        blocks: [
          'Preis, Währung, Zahlungsweise und Fristen regelt der Vertrag. Größere Projekte teilen wir in Etappen auf: Sie zahlen eine Anzahlung je Etappe und den Rest nach deren Abnahme — nicht den Gesamtbetrag im Voraus.',
          'Kosten Dritter sind im Preis nicht enthalten, sofern der Vertrag nichts anderes bestimmt: Werbebudgets, Domains, Hosting, kostenpflichtige Dienste und APIs sowie Lizenzen für Schriften, Fotos und Plugins. Sie zahlen diese direkt an den Anbieter, oder wir stellen sie zum Selbstkostenpreis weiter in Rechnung. Solche Dienste schließen wir nach Möglichkeit auf Ihren Namen ab.',
          'Leistungen über den vereinbarten Umfang hinaus schätzen wir gesondert und beginnen erst, nachdem Sie die neue Schätzung und die Termine schriftlich bestätigt haben.',
          'Bei Zahlungsverzug dürfen wir die Arbeit und die Übergabe von Ergebnissen bis zum Zahlungseingang zurückhalten; Termine verschieben sich um die Dauer des Verzugs.',
          'Steuern und Bankgebühren werden wie im Vertrag vereinbart getragen.',
        ],
      },
      {
        id: 'refunds',
        h: 'Zahlung, Stornierung und Erstattung',
        blocks: [
          'Eine Anzahlung reserviert die Kapazität unseres Teams für Ihr Projekt. Sobald die Arbeit an der Etappe, für die sie geleistet wurde, begonnen hat, wird die Anzahlung nicht erstattet.',
          'Vergütungen für abgeschlossene oder abgenommene Etappen und für bereits begonnene Leistungszeiträume werden nicht erstattet.',
          'Stornieren Sie ein Projekt, vergüten Sie die bis zur Stornierung erbrachten Leistungen — eine laufende Etappe anteilig, nach Arbeitsbeginn jedoch mindestens in Höhe der dafür geleisteten Anzahlung — sowie Kosten Dritter, die wir für Sie bereits aufgewendet oder verbindlich zugesagt haben. Darüber hinaus gezahlte Beträge erstatten wir.',
          'Werbebudgets und Gebühren Dritter (Domains, Hosting, Lizenzen, kostenpflichtige Tools und Dienste) erstatten wir nicht: Sie werden direkt an den Anbieter gezahlt oder zum Selbstkostenpreis weiterberechnet; über eine Erstattung entscheiden die Bedingungen des Anbieters.',
          'Abonnements und monatliche Betreuungsverträge (z. B. Kampagnenbetreuung, SEO oder Social Media) können zum Ende des laufenden bezahlten Zeitraums gekündigt werden. Ein bereits begonnener Zeitraum wird weder ganz noch anteilig erstattet.',
          'Steht Ihnen eine Erstattung zu, erfolgt sie über das ursprünglich verwendete Zahlungsmittel innerhalb einer angemessenen Frist, spätestens innerhalb der gesetzlichen Frist.',
          'Bitte richten Sie Zahlungsstreitigkeiten und Erstattungswünsche zunächst an uns — per E-Mail [[email]] oder über einen Messenger (Abschnitt 18) — und geben Sie uns 14 Tage Zeit für eine Lösung, bevor Sie eine Rückbuchung (Chargeback) veranlassen.',
        ],
      },
      {
        id: 'acceptance',
        h: 'Abnahme und Korrekturen',
        blocks: [
          'Das Ergebnis jeder Etappe übergeben wir Ihnen zur Prüfung. Sie prüfen es innerhalb der im Vertrag vereinbarten Frist, ohne Vereinbarung innerhalb von 3 Werktagen.',
          'Bitte senden Sie Ihre Anmerkungen als eine gesammelte Liste — per E-Mail oder im Projekt-Chat. Anmerkungen müssen begründet sein und sich darauf beziehen, ob das Ergebnis dem ursprünglichen Briefing entspricht.',
          'Korrekturschleifen sind nur dann und nur in dem Umfang im Preis enthalten, wie sie im Vertrag oder Kostenvoranschlag ausdrücklich festgelegt sind. Leistungen über den ausdrücklich vereinbarten Umfang hinaus sowie Änderungen der ursprünglichen Vorgaben werden gesondert vergütet (Ziffer 5.3).',
          'Gehen innerhalb der Prüffrist (ohne Vereinbarung innerhalb von 3 Werktagen) keine begründeten Anmerkungen im Rahmen des ursprünglichen Briefings ein, gilt die Etappe als vollständig und vorbehaltlos abgenommen. Auch die Inbetriebnahme des Ergebnisses — Veröffentlichung der Website, Start der Werbung — gilt als Abnahme.',
        ],
      },
      {
        id: 'deadlines',
        h: 'Termine',
        blocks: [
          'Die Termine der Etappen regelt der Vertrag. Sie laufen ab Eingang der Anzahlung und sobald uns die nötigen Materialien und Zugänge vorliegen. Sie sind Zieltermine, sofern der Vertrag sie nicht ausdrücklich als verbindlich bezeichnet.',
          'Solange wir auf Materialien, Antworten, Zugänge, Entscheidungen oder Zahlungen von Ihnen warten, verschieben sich die Termine um die Wartezeit. Ruht das Projekt aus Gründen auf Ihrer Seite länger als im Vertrag vorgesehen (ohne Regelung länger als 30 Tage), dürfen wir die bisher erbrachten Leistungen abrechnen und das Projekt nach einem neuen Zeitplan fortsetzen.',
        ],
      },
      {
        id: 'client-duties',
        h: 'Mitwirkung des Kunden',
        blocks: [
          'Damit das Projekt im Plan bleibt, wird der Kunde',
          {
            ul: [
              'die für die Arbeit nötigen Materialien, Informationen und Zugänge rechtzeitig bereitstellen (Texte, Logos, Fotos, Zugänge zur Website, zu Werbekonten und zum CRM);',
              'eine Ansprechperson benennen und innerhalb der vereinbarten Fristen Feedback geben;',
              'die Rechte an allem innehaben, was er uns überlässt (Texte, Bilder, Marken, Datenbanken), und über eine Rechtsgrundlage verfügen, uns personenbezogene Daten seiner Kunden zu übermitteln, soweit das Projekt sie erfordert;',
              'für die Richtigkeit der Angaben zu Produkt, Preisen und Aktionen sowie dafür einstehen, dass Produkt und Werbeaussagen den Gesetzen und Plattformregeln entsprechen;',
              'eigene Sicherungskopien seiner Websites, Konten und Daten vorhalten;',
              'Leistungen und Kosten Dritter fristgerecht bezahlen.',
            ],
          },
          'Der Kunde stellt uns von Ansprüchen Dritter, Bußgeldern und angemessenen Rechtsverfolgungskosten frei, die aus von ihm bereitgestellten Materialien, Daten oder Weisungen oder aus seinen Produkten, Angeboten und Werbeaussagen entstehen, es sei denn, wir haben den Anspruch zu vertreten.',
        ],
      },
      {
        id: 'ip',
        h: 'Nutzungsrechte',
        blocks: [
          'Die ausschließlichen Nutzungsrechte an Ergebnissen, die eigens für Sie erstellt wurden (Design, Layouts, Code, Texte, Kreativmaterial), gehen mit vollständiger Bezahlung der jeweiligen Etappe bzw. des Projekts auf Sie über. Bis dahin dürfen die Ergebnisse nur zur Ansicht und Prüfung genutzt werden.',
          'Zusammen mit den Rechten übergeben wir die im Vertrag genannten Quelldateien und Materialien.',
          'Unsere eigenen, vorbestehenden oder unabhängig entwickelten Bausteine (Bibliotheken, Komponenten, Vorlagen, Skripte, interne Werkzeuge, Methoden) bleiben unser Eigentum. Soweit sie Teil des Ergebnisses sind, erhalten Sie ein unbefristetes, unentgeltliches, nicht ausschließliches Nutzungsrecht ausschließlich zur Verwendung innerhalb Ihres eigenen Projekts — ohne das Recht, sie aus dem Produkt herauszulösen, zu kopieren, zu vervielfältigen, unterzulizenzieren oder an Dritte weiterzuverkaufen.',
          'Open-Source-Komponenten und Materialien Dritter (Schriften, Stockfotos, Plugins, Dienste) werden nach deren Lizenzen genutzt; kostenpflichtige Lizenzen laufen auf Sie oder werden als Kosten abgerechnet (Ziffer 5.2).',
          'Wir dürfen die Zusammenarbeit erwähnen und nicht vertrauliche Ergebnisse in unserem Portfolio zeigen, sofern Sie nicht schriftlich widersprechen und Vertrag oder NDA dies nicht ausschließen.',
        ],
      },
      {
        id: 'confidentiality',
        h: 'Vertraulichkeit',
        blocks: [
          'Alles, was Sie uns über Ihr Unternehmen mitteilen — Daten, Zahlen, Pläne, Zugänge —, verwenden wir ausschließlich für das Projekt und geben es nicht an Dritte weiter, außer an Auftragnehmer, die es für die Arbeit benötigen und den gleichen Pflichten unterliegen.',
          'Auf Wunsch unterzeichnen wir schon vor dem Briefing eine Vertraulichkeitsvereinbarung (NDA).',
          'Die Verpflichtung gilt während der Zusammenarbeit und 1 Jahr nach deren Ende, sofern Vertrag oder NDA keine andere Frist vorsehen. Sie gilt nicht für öffentlich bekannte Informationen und für Angaben, deren Offenlegung gesetzlich vorgeschrieben ist. Die Vertraulichkeit hindert uns nicht daran, allgemeine Erfahrungen, Kenntnisse, Ideen und technische Lösungen aus der Zusammenarbeit in unserer weiteren Arbeit zu nutzen.',
          'Personenbezogene Daten verarbeiten wir gemäß unserer [[privacy|Datenschutzerklärung]] und in Kundenprojekten zusätzlich nach einem Auftragsverarbeitungsvertrag.',
        ],
      },
      {
        id: 'results',
        h: 'Ergebnisse, Plattformen und KI',
        blocks: [
          'Alle Leistungen — Marketing, Werbung, SEO und GEO, Social Media, Entwicklung, Automatisierung und Design — erbringen wir nach bestem Bemühen (Best Efforts), ohne ausdrückliche oder stillschweigende Zusicherung von Rentabilität, Umsätzen, Anfragen, Conversions, Besucherzahlen, Rankings, Sichtbarkeit in KI-Antworten, unterbrechungsfreiem Betrieb oder Eignung für einen bestimmten wirtschaftlichen Zweck. Die Ergebnisse hängen von Faktoren ab, die wir nicht beeinflussen: vom Markt, von Ihrem Produkt und Ihren Preisen, vom Wettbewerb, von Budgets und von den Algorithmen der Suchmaschinen und KI-Systeme. Konkrete Kennzahlen sind nur verbindlich, wenn der Vertrag sie ausdrücklich als garantierte KPI festlegt.',
          'Sämtliche Entscheidungen und Maßnahmen von Google, Meta, TikTok, Telegram, App-Stores, Hosting-Anbietern, Domain-Registraren, KI-Anbietern und allen anderen Plattformen Dritter — Moderation, abgelehnte Anzeigen und Apps, Shadowbans, Einschränkung und Sperrung von Konten, Änderungen von Regeln, Algorithmen, Preisen oder APIs sowie Ausfälle — liegen vollständig außerhalb der Verantwortung von Veilvex und begründen keinen Anspruch auf Erstattung oder Schadensersatz. Unterstützung bei solchen Fragen über den vereinbarten Umfang hinaus ist eine zusätzliche, vergütungspflichtige Leistung.',
          'Wir dürfen KI-gestützte Werkzeuge und neuronale Netze in jeder Phase der Arbeit frei einsetzen — für Recherche, Texte, Bilder, Code und Automatisierung. Wir garantieren nicht, dass ein Ergebnis KI-Erkennungstools Dritter besteht, und haften nicht für Ausfälle, API-Änderungen, Einschränkungen oder Entscheidungen von KI-Modellen und -Diensten Dritter.',
        ],
      },
      {
        id: 'after-acceptance',
        h: 'Abschluss der Abnahme und weitere Betreuung',
        blocks: [
          'Das Ergebnis wird ausschließlich im Rahmen der Abnahme (Abschnitt 7) geprüft: Alle Anmerkungen dazu teilt der Kunde innerhalb der Prüffrist mit.',
          'Ist eine Etappe oder ein Projekt abgenommen — auch automatisch mit Ablauf der Prüffrist oder durch Inbetriebnahme des Ergebnisses durch den Kunden —, gelten die Pflichten von Veilvex für diese Etappe als vollständig erfüllt, und das Ergebnis wird „wie besehen“ (as is) ohne jede Gewährleistung übergeben.',
          'Spätere Änderungen, Korrekturen, Aktualisierungen, Support und Weiterentwicklung erbringen wir nur gegen gesonderte Vergütung oder auf Grundlage eines gesonderten Betreuungsvertrags, sofern der Einzelvertrag nicht ausdrücklich etwas anderes vorsieht.',
          'Wir haften nicht für die Funktion des Ergebnisses nach Änderungen durch den Kunden oder Dritte, bei unsachgemäßer Nutzung oder nach Updates bei Hosting, Browsern, Plattformen, Komponenten oder Diensten Dritter.',
          'Soweit gesetzlich zulässig, sind Ansprüche in Bezug auf eine abgenommene Etappe oder ein abgenommenes Projekt ausgeschlossen; Fälle, in denen die Haftung gesetzlich nicht beschränkt werden kann, regelt Ziffer 14.4.',
        ],
      },
      {
        id: 'liability',
        h: 'Haftungsbeschränkung',
        blocks: [
          'Soweit gesetzlich zulässig, ist unsere Gesamthaftung aus oder im Zusammenhang mit einem Vertrag — gleich aus welchem Rechtsgrund — auf die Vergütung begrenzt, die Sie für die konkrete Etappe oder Leistung, aus der der Anspruch entsteht, in den 3 Monaten vor dem anspruchsbegründenden Ereignis gezahlt haben.',
          'Wir haften nicht für mittelbare Schäden und Folgeschäden, entgangenen Gewinn, Umsatz- oder Geschäftseinbußen, Rufschäden oder den Verlust bzw. die Beschädigung von Daten, ebenso wenig für Handlungen und Unterlassungen von Plattformen und Diensten Dritter.',
          'Bei leicht fahrlässiger Verletzung wesentlicher Vertragspflichten (Kardinalpflichten) ist unsere Haftung auf den vertragstypischen, vorhersehbaren Schaden begrenzt.',
          'Keine dieser Beschränkungen gilt bei Vorsatz und grober Fahrlässigkeit, Arglist, Verletzung von Leben, Körper oder Gesundheit, nach dem Produkthaftungsgesetz und in allen anderen Fällen, in denen das Gesetz eine Beschränkung oder einen Ausschluss der Haftung nicht zulässt.',
        ],
      },
      {
        id: 'force-majeure',
        h: 'Höhere Gewalt',
        blocks: [
          'Keine Partei haftet für Verzögerungen oder Nichterfüllung infolge von Umständen außerhalb ihres zumutbaren Einflusses: Naturkatastrophen, bewaffnete Konflikte, Sanktionen und andere behördliche Maßnahmen, großflächige Ausfälle von Kommunikationsnetzen, Stromnetzen oder Cloud-Plattformen sowie Angriffe auf die Infrastruktur von Anbietern.',
          'Die betroffene Partei informiert die andere unverzüglich; Termine verschieben sich um die Dauer der Umstände. Dauern sie länger als 30 Tage (oder die im Vertrag genannte Frist), kann jede Partei den Vertrag beenden; die bis dahin erbrachten Leistungen werden vergütet.',
        ],
      },
      {
        id: 'termination',
        h: 'Kündigung',
        blocks: [
          'Der Vertrag kann aus den Gründen und in der Form beendet werden, die er vorsieht. Enthält er keine Regelung, kann jede Partei ihn mit einer Frist von 14 Tagen auf einem der in Abschnitt 18 genannten Wege kündigen.',
          'Zahlungen und Erstattungen bei Beendigung richten sich nach Abschnitt 6.',
          'Fertige und bezahlte Ergebnisse übergeben wir Ihnen zusammen mit den Rechten daran (Abschnitt 10).',
          'Wir können die Arbeit ruhen lassen oder den Vertrag fristlos kündigen, wenn eine Zahlung mehr als 14 Tage (oder die im Vertrag genannte Frist) überfällig ist, wenn die Aufgabe einen Verstoß gegen Gesetze oder Plattformregeln erfordern würde oder wenn der Kunde den Vertrag auf andere Weise wesentlich verletzt.',
        ],
      },
      {
        id: 'law',
        h: 'Anwendbares Recht und Streitigkeiten',
        blocks: [
          'Anwendbares Recht und Gerichtsstand bestimmt der Vertrag mit dem Kunden. Enthält er keine Regelung, gilt das Recht des Landes, in dem unser Vertragspartner registriert ist.',
          'Streitigkeiten versuchen wir zunächst einvernehmlich beizulegen: Bitte richten Sie Beanstandungen auf einem der in Abschnitt 18 genannten Wege an uns; wir antworten innerhalb von 30 Tagen. Gelingt keine Einigung, sind die Gerichte am Sitz unseres Vertragspartners zuständig, sofern der Vertrag nichts anderes bestimmt.',
        ],
      },
      {
        id: 'notices',
        h: 'Mitteilungen und Sprache',
        blocks: [
          'Korrespondenz über Telegram, WhatsApp und Projekt-Chats zwischen den Kontakten der Vertreter der Parteien hat dieselbe volle Rechtswirkung wie eine E-Mail [[email]] — auch für die Abstimmung von Briefing, Zusatzleistungen und Kostenvoranschlägen, die Übergabe von Etappen, die Abnahme, Beanstandungen, Stornierungen, Kündigungen, Erstattungswünsche und andere förmliche Mitteilungen. „Schriftlich“ im Sinne dieser Bedingungen umfasst auch solche Nachrichten.',
          'Eine Nachricht gilt als zugegangen, sobald sie an den Kontakt des Vertreters der anderen Partei zugestellt ist, der im Vertrag oder auf der Website angegeben ist oder in der Projektkorrespondenz verwendet wird. Jede Partei ist selbst für den Zugang zu ihren Konten verantwortlich und teilt Änderungen ihrer Kontakte mit. Anfragen zu personenbezogenen Daten können Sie auch auf den in der [[privacy|Datenschutzerklärung]] beschriebenen Wegen senden.',
          'Diese Bedingungen sind auf Englisch, Russisch, Aserbaidschanisch und Deutsch veröffentlicht. Standardsprache dieser Website ist Englisch: Weichen die Sprachfassungen voneinander ab, ist die englische Fassung maßgeblich.',
        ],
      },
      {
        id: 'changes',
        h: 'Änderungen dieser Bedingungen',
        blocks: [
          'Wir können diese Bedingungen aktualisieren. Die aktuelle Fassung und ihr Datum sind auf dieser Seite veröffentlicht.',
          'Für einen unterzeichneten Vertrag gilt die Fassung zum Zeitpunkt der Unterzeichnung, sofern die Parteien nicht schriftlich den Wechsel zu einer neueren vereinbaren.',
        ],
      },
      {
        id: 'contacts',
        h: 'Kontakt',
        blocks: ['Förmliche Mitteilungen und Projektkorrespondenz nehmen wir über jeden dieser Kontakte entgegen (Abschnitt 18): WhatsApp [[whatsapp]], Telegram [[telegram]] sowie per E-Mail [[email]].', { contacts: true }],
      },
    ],
  },

  notFound: {
    title: 'Seite nicht gefunden',
    text: 'Diese Seite gibt es nicht oder sie ist umgezogen. Zurück zur Startseite — dort ist alles an seinem Platz.',
    back: 'Zur Startseite',
  },
};

export default de;
