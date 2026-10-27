import type { CaseDetails } from './types';

export const de: CaseDetails = {
  labels: {
    crumbs: 'Brotkrumennavigation',
    titleSuffix: 'Fallstudie von {brand}',
    home: 'Startseite',
    breadcrumb: 'Projekte',
    toc: 'Auf dieser Seite',
    live: 'Website live ansehen',
    newTab: 'öffnet in einem neuen Tab',
    readFull: 'Zur ausführlichen Fallstudie',
    cta: 'Ähnliches Projekt besprechen',
    ctaTitle: 'Sie brauchen etwas Ähnliches?',
    ctaText: 'Erzählen Sie uns von Ihrer Aufgabe — Kostenschätzung und Zeitplan gibt es nach einem 15‑minütigen Briefing.',
    prev: 'Vorheriges Projekt',
    next: 'Nächstes Projekt',
    all: 'Alle Projekte',
    of: 'von',
  },
  items: {
    mybuild: {
      description: 'Ein Marktplatz für Bauprojekte: Aufträge, Angebote mit Preis und Frist, Übergabe und Abnahme in Echtzeit. Umgesetzt mit Next.js, NestJS und PostgreSQL.',
      lead: 'Eine zweiseitige Plattform: Der Auftraggeber veröffentlicht einen Bauauftrag, Unternehmen bieten Preis und Frist an, und der Deal läuft Schritt für Schritt bis zur Abnahme. Zwei Dashboards, Echtzeit-Updates, Dateien und Benachrichtigungen.',
      result: 'Aufträge, Angebote und Abnahme auf einer Plattform',
      tags: ['Next.js', 'NestJS', 'PostgreSQL', 'WebSocket'],
      facts: [
        { label: 'Dauer', value: '4 Monate Entwicklung' },
        { label: 'Kosten', value: '≈ 26.500 $' },
      ],
      sections: [
        {
          id: 'about',
          title: 'Über das Projekt',
          blocks: [
            { p: 'Name und Projektdaten des Auftraggebers unterliegen einer Geheimhaltungsvereinbarung, deshalb beschreibt diese Seite, wie die Plattform funktioniert, nicht für wen. Eine öffentliche Demo mit Testdaten basiert auf demselben Code wie das Produktivsystem.' },
          ],
        },
        {
          id: 'task',
          title: 'Die Aufgabe',
          blocks: [
            { p: 'Vor der Plattform verhandelten Auftraggeber und Baufirma per Chat und Telefon. Konditionen gingen in Nachrichten verloren, Zeichnungen und Kostenvoranschläge verteilten sich auf verschiedene Unterhaltungen, und keine Seite konnte genau sagen, in welcher Phase die Arbeiten waren.' },
            { p: 'Gebraucht wurde ein System, in dem jeder Deal klare Schritte hat, jeder Schritt von beiden Seiten bestätigt wird und keiner übersprungen werden kann.' },
          ],
        },
        {
          id: 'work',
          title: 'Was wir gebaut haben',
          blocks: [
            {
              ul: [
                'Zwei Dashboards in einer Anwendung: Der Auftraggeber verwaltet seine Aufträge, die Baufirma sieht den Feed verfügbarer Aufträge, ihre eigenen Angebote und ihre Übergaben.',
                'Ein Auftragsformular mit Kategorie, Objektart, Fläche, Adresse, Budget, gewünschtem Starttermin und Dateien: Zeichnungen und Pläne werden gleich angehängt, damit die Firma nach Unterlagen kalkuliert statt nach einer mündlichen Beschreibung.',
                'Angebote mit Preis und Frist: Der Auftraggeber sieht sie nebeneinander und wählt eines aus. Preis und Frist des Deals stammen aus dem angenommenen Angebot, alle übrigen wechseln automatisch auf „nicht ausgewählt“.',
                'Übergabe der Arbeit mit Dateien und Pflichtkommentar, Abnahme durch den Auftraggeber und Rückgabe zur Nachbesserung mit neuer Übergaberunde. Die Historie aller Runden bleibt erhalten.',
                'Echtzeit-Updates: Eine Aktion der einen Seite erscheint bei der anderen ohne Neuladen der Seite.',
                'Benachrichtigungen zu jedem Ereignis im Deal, mit Zähler für ungelesene.',
                'Ein Verzeichnis der Auftragnehmer mit der Zahl abgeschlossener Aufträge und ein Bereich „Dokumente“ mit allen Dateien aller Aufträge.',
                'Privater Dateispeicher: Ein Download-Link gilt fünf Minuten und wird nur an berechtigte Nutzer ausgegeben.',
                'Dunkles und helles Theme, responsiv vom Smartphone bis zum großen Bildschirm.',
              ],
            },
          ],
        },
        {
          id: 'deal',
          title: 'Wie ein Deal abläuft',
          blocks: [
            { p: 'Der Status eines Auftrags lässt sich nicht von Hand setzen. Alle erlaubten Übergänge stehen in einer einzigen Tabelle, jede Aktion außerhalb davon wird mit einer verständlichen Erklärung abgelehnt. Status, Angebote und Benachrichtigungen ändern sich in einer Transaktion, sodass der Stand des Deals auf den Bildschirmen beider Seiten nie auseinanderläuft.' },
            {
              ol: [
                'Auftragnehmer gesucht — der Auftrag ist veröffentlicht, noch keine Angebote.',
                'Wartet auf Bestätigung — mindestens ein Angebot liegt vor, der Auftraggeber wählt.',
                'In Arbeit — ein Angebot ist angenommen, Preis und Frist stehen fest.',
                'Wartet auf Abnahme — die Firma hat die Arbeit mit Dateien und Kommentar übergeben.',
                'In Nachbesserung — der Auftraggeber hat die Arbeit zurückgegeben, die Firma bereitet die nächste Übergaberunde vor.',
                'Abgeschlossen — der Auftraggeber hat die Arbeit abgenommen.',
              ],
            },
          ],
        },
        {
          id: 'privacy',
          title: 'Was eine unbeteiligte Firma sieht',
          blocks: [
            { p: 'Datenschutz ist hier keine Fußnote, sondern eine Regel, die in der Datenausgabe selbst steckt. Eine Firma, die nicht am Deal beteiligt ist, sieht den Auftrag als „Auftragnehmer gesucht“ — egal, in welchem Zustand er tatsächlich ist. Sie sieht weder den Preis des Deals noch fremde Angebote noch die Kontaktdaten des Auftraggebers.' },
            { p: 'Dieselbe Regel gilt an drei Stellen zugleich: in der Serverantwort, bei der Zustellung der Echtzeit-Ereignisse und beim Dateizugriff.' },
          ],
        },
        {
          id: 'tech',
          title: 'Technologie',
          blocks: [
            { p: 'Next.js und React im Frontend, NestJS und PostgreSQL im Backend, durchgehend TypeScript. Echtzeit-Updates laufen über WebSocket, Authentifizierung und Dateispeicher über Supabase.' },
            { p: 'Die gemeinsamen Regeln des Deals liegen in einem eigenen Paket, das beide Seiten nutzen: Der Button auf dem Bildschirm und die Prüfung auf dem Server werden von ein und derselben Funktion berechnet und können nicht voneinander abweichen.' },
          ],
        },
        {
          id: 'timeline',
          title: 'Zeitrahmen und Kosten',
          blocks: [{ p: 'Vier Monate Entwicklung, danach Abnahmetests beim Auftraggeber. Projektkosten: rund 26.500 $.' }],
        },
      ],
      shots: [],
    },

    'target-english-courses': {
      description: 'Social Ads für eine Online-Englischschule: Zielgruppe in der GUS, zwei Traffic-Szenarien und ein Chatbot. 95 Anfragen in 10 Tagen, CTR bis 9,3 %, Klick 0,03 $.',
      lead: 'Zielgruppenwerbung für eine Online-Englischschule: Die Zielgruppe wurde auf die GUS-Länder erweitert, der Traffic zwischen Website und Instagram aufgeteilt, und ein Chatbot übernahm die häufigen Fragen.',
      result: '95 Anfragen in 10 Tagen',
      tags: ['Targeting', 'Instagram', 'Chatbot'],
      facts: [
        { label: 'Zeitraum', value: '10 Tage, April 2024' },
        { label: 'Klick zur Website', value: '0,03 $' },
      ],
      sections: [
        {
          id: 'task',
          title: 'Das Ziel',
          blocks: [{ p: 'Eine Online-Englischschule brauchte mehr Kursanfragen — über Instagram und über ihre Website.' }],
        },
        {
          id: 'work',
          title: 'Was wir getan haben',
          blocks: [
            {
              ul: [
                'Die Region erweitert: Anfangs war die Zielgruppe auf eine Stadt beschränkt, doch die Schule ist online und der Wohnort der Lernenden spielt keine Rolle — also kamen die GUS-Länder dazu.',
                'Den Traffic auf zwei Szenarien aufgeteilt: Besuche der Schul-Website und Direktnachrichten auf Instagram.',
                'Einen Chatbot angebunden, der die häufigen Fragen potenzieller Lernender beantwortet und sie auf die Website der Schule weiterleitet — der Manager steigt erst in ein bereits warmes Gespräch ein.',
                'Sowohl eigene Creatives als auch bereits gut laufende Beiträge des Accounts eingesetzt.',
              ],
            },
          ],
        },
        {
          id: 'results',
          title: 'Ergebnis nach 10 Tagen',
          blocks: [
            {
              stats: [
                { value: '95', label: 'Anfragen' },
                { value: '1,35 $', label: 'durchschnittliche Kosten pro Anfrage (je nach Zielgruppe 0,57–2,95 $)' },
                { value: '9,3 %', label: 'Klickrate der Anzeigen zur Website' },
                { value: '0,03 $', label: 'Kosten pro Klick zur Website' },
              ],
            },
          ],
        },
        {
          id: 'why',
          title: 'Was das zeigt',
          blocks: [
            { p: 'Ein gutes Beispiel dafür, dass eine einzelne Zahl Werbung nie ausreichend beschreibt: Eine Direktnachricht kostet mehr als ein Website-Besuch, verhält sich aber auch anders. Die Aufteilung in zwei Szenarien und ein Chatbot für Routinefragen brachten der Schule einen stetigen Strom an Anfragen bei kontrolliertem Budget. Die Kampagne lief im April 2024.' },
          ],
        },
      ],
      shots: [],
    },

    alfanet: {
      description: 'Eine WordPress-Website für den Internetanbieter Alfanet: drei Produkte, zwei Sprachen, kurze Anfrageformulare. 36.800 Klicks aus der Google-Suche bei 25 % CTR.',
      lead: 'Ein Informationsportal für einen Internetanbieter: Tarife, Versorgungsgebiete, Anschlussanfragen direkt per E-Mail, zwei Sprachversionen — mit Fokus auf SEO und einem kurzen Weg zur Anfrage.',
      result: 'Provider-Website: 36.800 Klicks aus Google bei 25 % CTR',
      tags: ['WordPress', 'Mehrsprachig', 'Responsiv', 'Anfrageformulare'],
      facts: [
        { label: 'Dauer', value: '≈ 2 Wochen' },
        { label: 'Übergabe', value: 'Februar 2025' },
      ],
      sections: [
        {
          id: 'client',
          title: 'Über den Kunden',
          blocks: [
            { p: 'Alfanet ist ein aserbaidschanischer Internetanbieter für Privat- und Geschäftsinternet, Fernsehen und Hosting. Für einen Provider ist die Website der erste Kontaktpunkt: Besucher kommen aus der Suche oder über eine Anzeige und müssen innerhalb einer Minute das Angebot verstehen und eine Anschlussanfrage stellen können.' },
          ],
        },
        {
          id: 'work',
          title: 'Was wir getan haben',
          blocks: [
            {
              ul: [
                'Die Website nach drei Produkten gegliedert — Internet, TV und Hosting. Jedes hat eine eigene Seite, damit Besucher aus der Suche direkt beim passenden Angebot landen.',
                'Auf WordPress umgesetzt: Die Redaktion des Anbieters ändert Texte und Tarife selbst, ohne Entwickler.',
                'Zwei Sprachversionen erstellt — Aserbaidschanisch und Russisch.',
                'Kurze Formulare für Anschlussanfragen eingebaut: Anfragen gehen direkt ins Postfach des Unternehmens, ohne Zusatzschritte und ohne Pflicht-CRM.',
                'Responsiv umgesetzt — die meisten Anfragen bei einem Provider kommen vom Smartphone.',
                'Seitenstruktur, Überschriften und Meta-Tags auf Suchanfragen zu Internet, TV und Hosting in beiden Sprachen ausgerichtet.',
              ],
            },
          ],
        },
        {
          id: 'design',
          title: 'Design und Struktur',
          blocks: [
            { p: 'Das Design entstand gemeinsam mit dem Kunden. Alfanet ist ein Technologieunternehmen, verkauft aber Einfachheit — deshalb ist die Website aufgeräumt: Kontrastreiche Akzente und Icons machen die Produkte auf einen Blick unterscheidbar, und der Weg ist kurz — Angebot wählen, Anfrage senden. Alles, was nicht zum Anschluss beiträgt, wurde von der Startseite entfernt.' },
          ],
        },
        {
          id: 'timeline',
          title: 'Zeitrahmen und Ablauf',
          blocks: [{ p: 'Rund zwei Wochen inklusive Umsetzung, Inhalten und Einrichtung der Formulare. Übergabe im Februar 2025.' }],
        },
        {
          id: 'metrics',
          title: 'Kennzahlen der Website',
          blocks: [
            { p: 'Daten aus der Google Search Console über 16 Monate und aus PageSpeed Insights, August 2026.' },
            {
              stats: [
                { value: '36.800', label: 'Klicks aus der Google-Suche bei 147.000 Impressionen' },
                { value: '25 %', label: 'Klickrate in der Suche: jede vierte Impression führt zu einem Besuch' },
                { value: '5,2', label: 'durchschnittliche Position bei Google' },
                { value: '100 / 100', label: 'SEO und Barrierefreiheit in PageSpeed Insights (Desktop)' },
              ],
            },
            {
              ul: [
                'Best Practices in PageSpeed Insights — 96 von 100.',
                'Cumulative Layout Shift 0 und Total Blocking Time 0 ms: Die Seite springt beim Laden nicht und hängt nicht an Skripten.',
              ],
            },
          ],
        },
      ],
      shots: [],
    },

    'target-personal-profile': {
      description: 'Personal Branding für einen Werbeexperten mit Lead-Magnet: 90 Anfragen à 0,95 $ in 5 Tagen und ein Kunde für 4 Monate.',
      lead: 'Personal Branding für einen Experten: Zuerst haben wir die Probleme der Zielgruppe analysiert, dann aus der häufigsten Frage einen Leitfaden als Lead-Magneten gemacht und den Traffic direkt ins Gespräch geleitet.',
      result: '90 Leads für unter 1 $ pro Lead',
      tags: ['Targeting', 'Instagram', 'Lead-Magnet'],
      facts: [
        { label: 'Zeitraum', value: '5 Tage, April 2024' },
        { label: 'Budget', value: '86 $' },
      ],
      sections: [
        {
          id: 'task',
          title: 'Das Ziel',
          blocks: [
            { p: 'Ein Projekt für einen Spezialisten für Zielgruppenwerbung: seine Bekanntheit als Experte steigern und über einen Lead-Magneten auf Instagram eine Basis interessierter Follower aufbauen.' },
          ],
        },
        {
          id: 'work',
          title: 'Was wir getan haben',
          blocks: [
            {
              ul: [
                'Die Zielgruppe analysiert: Probleme, Befürchtungen und die eine wiederkehrende Frage — wie man ein Business-Profil auf Instagram aufbereitet, bevor man Werbung schaltet.',
                'Genau dazu einen Leitfaden geschrieben und ihn zum Lead-Magneten gemacht: Wer dem Account schreibt, bekommt sofort einen Nutzen.',
                'Eine Nachrichten-Kampagne auf Instagram geschaltet und den Traffic direkt ins Gespräch geleitet, ohne Landingpages dazwischen.',
              ],
            },
          ],
        },
        {
          id: 'results',
          title: 'Ergebnis nach 5 Tagen',
          blocks: [
            {
              stats: [
                { value: '90', label: 'Anfragen per Direktnachricht' },
                { value: '0,95 $', label: 'pro Anfrage' },
                { value: '86 $', label: 'Budget der Kampagne' },
                { value: '4 Monate', label: 'Zusammenarbeit mit einem Kunden aus der Kampagne' },
              ],
            },
          ],
        },
        {
          id: 'why',
          title: 'Was das zeigt',
          blocks: [
            { p: 'Der Fall zeigt eine Mechanik, die für Experten wie für Unternehmen funktioniert: statt Werbung mit der Brechstange nützliches Material, das sich die Menschen selbst holen — und auf diesem Kontakt baut der Verkauf auf. So bleiben die Kosten pro Anfrage selbst bei kleinem Budget unter einem Dollar. Die Kampagne lief im April 2024.' },
          ],
        },
      ],
      shots: [],
    },

    shp: {
      description: 'Eine handgeschriebene Website für das Bauunternehmen SHP: Projektportfolio, drei Sprachen, Vercel und Cloudinary. PageSpeed Desktop 98, CTR in der Suche 14,7 %.',
      lead: 'Eine moderne Website in sauberem Code: schnell und responsiv, mit Fokus auf realisierte Projekte. Gehostet auf Vercel, Bilder über Cloudinary.',
      result: 'Website eines Bauunternehmens: PageSpeed 98, CTR 14,7 %',
      tags: ['HTML/CSS/JS', 'SEO', 'Vercel', 'Cloudinary'],
      facts: [
        { label: 'Dauer', value: '≈ 3 Wochen' },
        { label: 'Übergabe', value: 'Dezember 2024' },
      ],
      sections: [
        {
          id: 'client',
          title: 'Über den Kunden',
          blocks: [
            { p: 'SHP ist ein Full-Service-Unternehmen: von Konzept und Strategie über das Baumanagement bis zum Betrieb der Objekte. Zum Leistungsspektrum gehören Beton- und Dacharbeiten, Stahlbau, technische Gebäudeausrüstung (HLK, Wasser und Abwasser, Brandschutz, Elektro, BMS) sowie Planung, 3D-Visualisierung und Bauberatung. Zu den realisierten Objekten zählen Port Baku Walk, Deniz Mall, CASA Baku und Rahat Gourmet Crescent Mall.' },
          ],
        },
        {
          id: 'work',
          title: 'Was wir getan haben',
          blocks: [
            {
              ul: [
                'Die Struktur um das stärkste Argument des Unternehmens gebaut — das Projektportfolio: eigene Bereiche für Projekte, Leistungen, Über uns, Team, Lizenzen und Zertifikate sowie Kunden.',
                'In reinem HTML, CSS und JavaScript umgesetzt, ohne CMS oder Baukasten — die Seiten laden auch mit großen Fotogalerien schnell.',
                'Drei Sprachversionen erstellt: Aserbaidschanisch, Russisch und Englisch.',
                'Logos von Kunden und Partnern (Pasha Group, AZAL, Marriott International, Ritz Carlton) sowie ISO-Lizenzen und -Zertifikate gezeigt — genau das, was für Bauherren die Vertrauensfrage klärt.',
                'Cloudinary angebunden: Projektfotos werden komprimiert und in passender Größe ausgeliefert, sodass Galerien die Seite nicht bremsen.',
                'Auf Vercel bereitgestellt: HTTPS, CDN und schnelles Zurückrollen bei Updates.',
                'SEO-Grundlagen eingerichtet — Überschriften, Meta-Tags, Sitemap und semantisches Markup.',
              ],
            },
          ],
        },
        {
          id: 'design',
          title: 'Design und Struktur',
          blocks: [
            { p: 'Das Design entstand gemeinsam mit dem Kunden. Das leitende grafische Motiv sind Polyeder: Sie stehen für Präzision, Dynamik und Projekte jeder Komplexität — und passen damit zur Positionierung von SHP.' },
            { p: 'Die Farbpalette ist bewusst zurückhaltend: Im Bau entsteht Vertrauen durch ruhige Präsentation und starke Fotos realisierter Objekte, nicht durch Dekor. Große Bilder belegen die Erfahrung, kurze Leistungsbeschreibungen führen zum Kontakt.' },
          ],
        },
        {
          id: 'timeline',
          title: 'Zeitrahmen und Ablauf',
          blocks: [{ p: 'Rund drei Wochen — von der Freigabe des Layouts bis zum Livegang, inklusive Befüllung aller Bereiche und Übersetzung in drei Sprachen. Übergabe im Dezember 2024.' }],
        },
        {
          id: 'metrics',
          title: 'Kennzahlen der Website',
          blocks: [
            { p: 'Daten aus der Google Search Console und aus PageSpeed Insights, August 2026.' },
            {
              stats: [
                { value: '98 / 100', label: 'Performance in PageSpeed Insights (Desktop)' },
                { value: '1,0 s', label: 'Largest Contentful Paint; Cumulative Layout Shift 0,002' },
                { value: '14,7 %', label: 'Klickrate in der Suche: fast jede siebte Impression führt zu einem Besuch' },
                { value: '5,1', label: 'durchschnittliche Google-Position der letzten drei Monate, gegenüber 6,4 über 16 Monate' },
              ],
            },
            { ul: ['Barrierefreiheit — 90 von 100, Best Practices — 96 von 100.'] },
          ],
        },
      ],
      shots: [],
    },

    'yakitori-site': {
      description: 'Eine Speisekarten-Website für das Restaurant Yakitori in reinem HTML, CSS und JS: 15 Rubriken, zwei Sprachen als eigene Seiten, Sticky-Navigation und Lightbox.',
      lead: 'Eine Speisekarten-Website für ein asiatisches Restaurant: reines HTML, CSS und JavaScript ohne CMS und Build-Schritt, zwei Sprachversionen als eigene Seiten, Menürubriken aus Daten gerendert, Sticky-Navigation und Lightbox.',
      result: 'Speisekarten-Website mit 15 Rubriken in zwei Sprachen',
      tags: ['HTML/CSS/JS', 'Ohne Abhängigkeiten', 'Mehrsprachig', 'SEO', 'JSON-LD Restaurant', 'Cloudflare Pages'],
      facts: [
        { label: 'Dauer', value: '≈ 1 Woche' },
        { label: 'Livegang', value: '17. August 2026' },
      ],
      sections: [
        {
          id: 'client',
          title: 'Über den Kunden',
          blocks: [
            { p: 'Yakitori · Asian Food ist ein asiatisches Restaurant: Sushi und Rollen, Suppen, Nudeln, gebratener Reis, Udon, Tempura, Salate, Waffeln, Eis und Getränke, dazu ein Lieferdienst in der Stadt. Gäste kommen auf so eine Website aus einem einzigen Grund: um die Karte mit Preisen zu sehen und anzurufen. Die Seite muss also auf dem Smartphone sofort laden und ein Gericht als Foto zeigen, nicht als Zeile in einer Liste.' },
          ],
        },
        {
          id: 'work',
          title: 'Was wir getan haben',
          blocks: [
            {
              ul: [
                'Die Website in reinem HTML, CSS und JavaScript gebaut: kein CMS, kein Bundler, keine einzige externe Abhängigkeit. Die Seiten werden als fertige Dateien ausgeliefert, ein Update ist eine Ordnerkopie, und es gibt keine Plugins, die beim nächsten Release kaputtgehen.',
                'Daten und Darstellung getrennt. Die gesamte Karte liegt in einer Datendatei, aus der ein Skript sowohl das Kartenraster als auch die Rubriknavigation erzeugt. Preise oder Zutaten ändern sich, ohne das Markup anzufassen.',
                'Die beiden Sprachversionen als eigene Seiten statt als Umschalter im Browser umgesetzt: Russisch unter yakitori.az, Aserbaidschanisch unter yakitori.az/az. Jede hat ihr eigenes Canonical und einen vollständigen hreflang-Cluster (ru, az und x-default): Suchmaschinen sehen zwei eigenständige Dokumente statt eines, das seinen Text austauscht.',
                'Die Karte in 15 Rubriken gegliedert — von Sets und Kombos bis zu Limonaden — mit fünf Gruppen innerhalb von Sushi und Rollen: Hosomaki, Uramaki, warme Rollen, überbackene Rollen sowie Sushi-Burger und Reisbällchen. Die letzten drei Rubriken sind als Preisliste gesetzt und brechen automatisch in Spalten um.',
                'Eine Sticky-Navigation für die Rubriken gebaut: Der aktive Punkt wird per IntersectionObserver hervorgehoben, die Leiste lässt sich mit dem Mausrad scrollen und mit der Maus ziehen, und ein Klick direkt nach dem Ziehen wird unterdrückt — sonst würde das Ziehen versehentlich zu einer anderen Rubrik springen.',
                'Eine Lightbox ergänzt: Ein Klick auf ein Foto öffnet es im Vollbild, ein beliebiger Klick oder die Escape-Taste schließt es.',
                'Die Gerichtfotos ausschließlich per CSS zugeschnitten, ohne die Dateien anzufassen. Bei den Suppen sind Maßstab und Bildausschnitt so gewählt, dass die Schalen in einer Reihe gleich groß wirken; die Lightbox zeigt trotzdem das unveränderte Original.',
                'Vollständiges Such-Markup geschrieben: Title, Description, Canonical, hreflang, Geo-Metadaten, Open Graph und Twitter Card sowie JSON-LD Restaurant mit Telefon, Adresse, Öffnungszeiten, Koordinaten und Preisklasse.',
                'Alle Rastergrafiken in WebP umgewandelt und auf Cloudflare Pages veröffentlicht; die www-Adresse leitet auf die Hauptadresse um, damit der QR-Code auf dem gedruckten Flyer funktioniert — gedruckt wurde die www-Variante.',
              ],
            },
          ],
        },
        {
          id: 'design',
          title: 'Design und Struktur',
          blocks: [
            { p: 'Die Website stützt sich auf zwei Markenthemes. Das dunkle trägt Header, ersten Bildschirm und Footer: dunkelbrauner Grund, cremefarbener Text, goldene Schriftzüge und eine rote Linie unter dem Header. Das helle trägt die Karte selbst: Cremepapier mit Seigaiha-Muster, weiße Gerichtkarten, rote Preise. So wirkt die Seite wie eine gedruckte Speisekarte auf einem dunklen Umschlag — genau das, was das Restaurant ist.' },
            { p: 'Der erste Bildschirm ist keine Werbung: eine Überschrift, ein Satz, ein Bestell-Button und zwei Zeilen Fakten — Öffnungszeiten und Adresse. Die Telefonnummer steht im Header und noch einmal im Footer, denn bestellt wird hier per Anruf, nicht über einen Warenkorb.' },
          ],
        },
        {
          id: 'typography',
          title: 'Typografie und die aserbaidschanische Version',
          blocks: [
            { p: 'Drei Schriften, keine vierte: Montserrat für Überschriften, Gerichtnamen und Preise, Manrope für Zutaten und Beschreibungen, Noto Sans JP für die japanischen Rubrikbeschriftungen. Die Aufteilung ist nicht dekorativ: Manrope fehlen das Zeichen der Landeswährung und der aserbaidschanische Buchstabe Ə, deshalb sind alle Preise in Montserrat gesetzt, und Manrope fällt auf dieselbe Montserrat zurück — sie zeichnet das Ə in den aserbaidschanischen Beschreibungen.' },
            { p: 'Ohne das würde der Browser stillschweigend eine Systemschrift einsetzen: Im CSS sieht man es nicht, die Schrift ist zugewiesen und alles „funktioniert“, aber der Buchstabe fällt aus der Zeile. Geprüft haben wir das nicht nach Augenmaß, sondern per Skript: Es fragt den Browser, mit welcher tatsächlichen Schrift jeder Textknoten auf beiden Seiten gerendert wurde.' },
            { p: 'Die zweite aserbaidschanische Falle ist die Groß- und Kleinschreibung. Ein normales uppercase macht aus i ein I, im Aserbaidschanischen braucht es aber İ. Deshalb liegen alle Zeichenketten, die in Versalien erscheinen, bereits großgeschrieben in den Daten, und die Umwandlung läuft ins Leere.' },
          ],
        },
        {
          id: 'mobile',
          title: 'Wie sich die Website auf dem Smartphone verhält',
          blocks: [
            { p: 'Die meisten Bestellungen kommen vom Smartphone, deshalb wurde das Kartenraster in vierzehn Breiten geprüft, vom breiten Monitor bis zum schmalen Handy. Dahinter steht eine einzige Regel: Ein Gerichtname darf nirgends auf zwei Zeilen umbrechen und mit dem Preis kollidieren.' },
            {
              ul: [
                'Auf dem Tablet wird das Raster fest auf zwei Spalten gesetzt.',
                'Auf dem Smartphone rutscht der Preis unter den Namen, statt sich die Zeile mit ihm zu teilen.',
                'Auf den schmalsten Bildschirmen wird der gesamte Text eine Stufe kleiner.',
              ],
            },
            { p: 'Die Größen sind auf Montserrat abgestimmt: Bei gleichem Schriftgrad läuft sie etwa ein Fünftel breiter als Manrope, Augenmaß hilft hier also nicht.' },
          ],
        },
        {
          id: 'timeline',
          title: 'Zeitrahmen und Ablauf',
          blocks: [
            { p: 'Rund eine Woche Arbeit. Die Website ging am 17. August 2026 unter yakitori.az live, das Projekt wurde am 18. August zusammen mit dem Flyer abgeschlossen: Auf dem Flyer ist ein QR-Code zur Website gedruckt, also konnten beide nur gemeinsam abgenommen werden.' },
          ],
        },
      ],
      shots: [],
    },

    'target-body-massage': {
      description: 'Social Ads für eine Massagepraxis: Segmente aus früheren Kampagnen, das stärkste Reels-Creative — 80 Anfragen à 0,93 $ und 747 Klicks in 5 Tagen.',
      lead: 'Eine Buchungskampagne für eine Massagepraxis: Die Zielgruppe wurde anhand früherer Kampagnen segmentiert, und die Kampagne baute auf dem Reels-Video auf, das bereits die meisten Gespräche brachte.',
      result: '80 Anfragen à 0,93 $ in 5 Tagen',
      tags: ['Targeting', 'Instagram', 'Reels'],
      facts: [
        { label: 'Zeitraum', value: '5 Tage, April 2024' },
        { label: 'Budget', value: '74,70 $' },
      ],
      sections: [
        {
          id: 'task',
          title: 'Das Ziel',
          blocks: [{ p: 'Möglichst viele Anfragen für eine Maderotherapie — eine manuelle Körpermassage — gewinnen und in Buchungen verwandeln.' }],
        },
        {
          id: 'work',
          title: 'Was wir getan haben',
          blocks: [
            {
              ul: [
                'Zum Start arbeiteten wir bereits im zweiten Monat mit diesem Kunden, nichts war also geraten: Wir haben die Zielgruppe anhand der Ergebnisse früherer Kampagnen segmentiert und das aktivste Segment der Nische herausgefiltert.',
                'Ermittelt, welches der veröffentlichten Reels-Videos mehr Gespräche zu geringeren Kosten bringt — und die Kampagne darum herum aufgebaut.',
                'Den Traffic in Direktnachrichten geleitet, damit Interessierte gleich nach freien Terminen fragen, statt eine Website zu durchstöbern.',
              ],
            },
          ],
        },
        {
          id: 'results',
          title: 'Ergebnis nach 5 Tagen',
          blocks: [
            {
              stats: [
                { value: '80', label: 'Anfragen' },
                { value: '0,93 $', label: 'pro Anfrage' },
                { value: '74,70 $', label: 'Budget' },
                { value: '747', label: 'Klicks à 0,10 $' },
              ],
            },
          ],
        },
        {
          id: 'why',
          title: 'Was das zeigt',
          blocks: [
            { p: 'Die Kampagne lief nach dem Start noch über einen Monat weiter: Die Kosten pro Ergebnis stiegen, aber die Buchungen kamen weiter — genau der Belastungstest, an dem die meisten Werbekampagnen scheitern.' },
            { p: 'Der Fall zeigt außerdem den Wert gesammelter Daten: Der zweite Monat mit einem Kunden liefert Ergebnisse deutlich günstiger als der erste. Die Kampagne lief im April 2024.' },
          ],
        },
      ],
      shots: [],
    },

    'deniz-service': {
      description: 'Zweisprachige Website für den Industrielieferanten Deniz Service: Katalog mit 21 Kategorien, Zertifikats-Lightbox, saubere URLs, volles Such-Markup.',
      lead: 'Eine zweisprachige Website für einen Industrielieferanten: Katalog mit 21 Kategorien und Ankernavigation, eine eigens gebaute Zertifikatskomponente, saubere URLs auf Apache und vollständiges Such-Markup.',
      result: 'Lieferantenkatalog: 21 Kategorien und Dokumente mit einem Klick',
      tags: ['HTML/CSS/JS', 'jQuery', 'Mehrsprachig', 'SEO', 'Apache/.htaccess'],
      facts: [
        { label: 'Dauer', value: '≈ 2 Wochen' },
        { label: 'Übergabe', value: 'Juli 2026' },
      ],
      sections: [
        {
          id: 'client',
          title: 'Über den Kunden',
          blocks: [
            { p: 'Deniz Service liefert seit 2005 Material und technische Unterstützung für Öl und Gas, Metallurgie, Lebensmittel- und Chemieindustrie, Bau und Landwirtschaft. Das Unternehmen ist ein zentraler Beschaffungspartner — von explosionsgeschützter Ausrüstung und Armaturen bis zu Anschlagmitteln, HLK und persönlicher Schutzausrüstung — und vertritt elf ausländische Hersteller in Aserbaidschan. Es verfügt über ein Qualitätsmanagementsystem nach ISO 9001:2015 und eine D-U-N-S-Registrierung.' },
            { p: 'Ein solches Unternehmen braucht keine Website für den Kauf per Klick: Ingenieure und Einkäufer kommen, um zwei Dinge zu prüfen — ob das Sortiment passt und ob der Lieferant berechtigt ist, es zu liefern.' },
          ],
        },
        {
          id: 'work',
          title: 'Was wir getan haben',
          blocks: [
            {
              ul: [
                'Die Website in reinem Code gebaut — HTML, CSS, JavaScript und jQuery, ohne CMS: Die Seiten werden als fertige Dateien ausgeliefert, es gibt keine Plugins, die bei Updates brechen, und kein Admin-Panel als Angriffsfläche.',
                'Zwei Sprachversionen erstellt: Englisch im Stammverzeichnis, Aserbaidschanisch unter /az/. Jede Seite hat ihr eigenes Canonical und einen vollständigen hreflang-Cluster — en, az und x-default.',
                'Den Katalog auf eine eigene Seite verlegt: 21 Produkt- und Leistungskategorien, jede mit ausgeklapptem Inhalt. Karten auf der Startseite verlinken per Anker direkt in den passenden Block statt an den Anfang einer langen Liste.',
                'Die Komponente für den Partnerbereich von Grund auf geschrieben: Eine Leiste mit elf Marken entsteht aus einer einzigen Datendatei, ein Klick öffnet eine eigene Lightbox — Zoom per Klick und Mausrad, Pinch auf dem Smartphone, Ziehen mit Schwellenwert (damit ein Klick nicht zur versehentlichen Verschiebung wird), vertikale Vorschaubilder und Unterstützung für Marken mit mehreren Autorisierungsdokumenten.',
                'Apache per .htaccess konfiguriert: URLs ohne .html, 301-Weiterleitungen von alten Formen, erzwungenes HTTPS, Adresse ohne www und ohne abschließenden Schrägstrich — genau eine kanonische Form pro Seite. Dazu gzip, Cache-Header nach Dateityp, Sicherheits-Header und korrekte MIME-Typen für WebP und Schriften.',
                'Das Markup für Suchmaschinen geschrieben: ein JSON-LD-@graph mit Organization, WebSite, WebPage und BreadcrumbList, Open Graph und Twitter Cards sowie eine sitemap.xml mit Sprachalternativen für jede URL.',
                'Die Dokumente direkt veröffentlicht: Firmenpräsentation, ISO-Zertifikat, Laborakkreditierungen und die Autorisierungsschreiben aller elf Hersteller. Jedes PDF öffnet sich mit einem Klick, ohne Formular und Registrierung.',
                'Alle Rastergrafiken in WebP umgewandelt und Lazy Loading für Bilder aktiviert.',
              ],
            },
          ],
        },
        {
          id: 'design',
          title: 'Design und Struktur',
          blocks: [
            { p: 'Das Design entstand gemeinsam mit dem Kunden. Der erste Bildschirm ist dunkel, mit einem Produktionsfoto und einem einzigen Satz über das Unternehmen: Ein Industrielieferant gewinnt mehr, wenn er sofort sein Profil nennt, als mit einem Slogan. Darunter folgt ein Raster heller Karten auf dunklem Grund — 21 Kategorien, die sich wie ein Katalog lesen und nicht wie ein Werbeblock.' },
            { p: 'Das grafische Motiv, ein feines Polyedernetz auf den Hintergrundbildern, hält den ingenieurtechnischen Ton, ohne mit den Gerätefotos zu konkurrieren. Die Vertrauensargumente sind an einer Stelle gebündelt: Jahre am Markt, Unternehmensgrundsätze, ISO-Zertifikat und D-U-N-S-Siegel. Kontakte stehen als direkte E-Mail- und Telefonlinks neben einer Karte — ein Einkäufer will Kontakt aufnehmen, kein Formular ausfüllen.' },
          ],
        },
        {
          id: 'timeline',
          title: 'Zeitrahmen und Ablauf',
          blocks: [{ p: 'Rund zwei Wochen für Umsetzung, Kataloginhalte, die Zertifikatskomponente und die Einrichtung des Hostings. Übergabe im Juli 2026.' }],
        },
      ],
      shots: [],
    },

    'expert-solutions': {
      description: 'Eine Unternehmenswebsite für Expert Solutions, schlüsselfertige Labore für Öl und Gas: Premium-Palette, Sechseck-Motiv, Scroll-Animationen und zwei Sprachen.',
      lead: 'Eine Unternehmenswebsite für eine Firma mit 25 Jahren Erfahrung: strenge Premium-Palette, Sechsecke als technisches Motiv, sanfte Scroll-Animationen und zwei Sprachversionen.',
      result: 'Website eines Anbieters von Laborlösungen für Öl und Gas',
      tags: ['HTML/CSS/JS', 'Bootstrap', 'GSAP', 'Swiper', 'Vercel'],
      facts: [
        { label: 'Dauer', value: '≈ 3 Wochen' },
        { label: 'Übergabe', value: 'Januar 2026' },
      ],
      sections: [
        {
          id: 'client',
          title: 'Über den Kunden',
          blocks: [
            { p: 'Expert Solutions LLC baut schlüsselfertige Labore und berät den Öl- und Gassektor: Geräteauswahl, Planung, Inbetriebnahme und Konformität mit internationalen Standards. Das Team bringt 25 Jahre Erfahrung mit, die Kunden sind große Industrieabnehmer und internationale Partner. Die Website sollte ihre Sprache sprechen: streng, belegbar, ohne Marketinglärm.' },
          ],
        },
        {
          id: 'work',
          title: 'Was wir getan haben',
          blocks: [
            {
              ul: [
                'Eine Unternehmenswebsite mit schlankem Frontend gebaut: HTML, CSS, JavaScript und jQuery, mit Bootstrap als Rastergrundlage — daher die saubere Darstellung vom Smartphone bis zum breiten Monitor.',
                'Die Seite als Funnel aufgebaut: großer erster Bildschirm mit Handlungsaufforderung, Leistungskarten, ein Block mit Unternehmenswerten, das Team und Kontakt.',
                'Scroll-Animationen ergänzt: GSAP mit ScrollTrigger und SplitText für die Typografie, AOS für das Einblenden von Blöcken, Swiper für Slider, Odometer für Zahlenzähler.',
                'Ein interaktives FAQ-Akkordeon gebaut, das Routinefragen schon vor dem ersten Anruf beantwortet.',
                'Zwei Sprachversionen erstellt — Englisch und Aserbaidschanisch — für lokale und internationale Partner.',
                'Auf Vercel bereitgestellt: schnelle Auslieferung, HTTPS und Stabilität ohne eigenen Server.',
              ],
            },
          ],
        },
        {
          id: 'design',
          title: 'Design und Struktur',
          blocks: [
            { p: 'Das Design entstand gemeinsam mit dem Kunden. Die Palette lebt vom Kontrast zwischen tiefem Dunkel und klarem Weiß mit einem gold-sandfarbenen Akzent — so sieht Expertise aus, nicht laute Werbung.' },
            { p: 'Das zentrale grafische Motiv ist das Sechseck: In Bildrahmen und Grafiken verweist es auf Molekülstrukturen und technische Präzision. Der Wechsel heller und dunkler Abschnitte hält die Aufmerksamkeit über einen langen Scroll.' },
          ],
        },
        {
          id: 'timeline',
          title: 'Zeitrahmen und Ablauf',
          blocks: [{ p: 'Rund drei Wochen für Design, Umsetzung und Inhalte. Übergabe im Januar 2026.' }],
        },
      ],
      shots: [],
    },

    konteks: {
      description: 'Mehrseitige Website für Konteks, ein Bauunternehmen mit 90-jähriger Geschichte: Bereiche nach Leistungen, realisierte Objekte, drei Sprachen.',
      lead: 'Eine mehrseitige Website für ein Produktions- und Bauunternehmen: klare Architektur nach Leistungsbereichen, ein Bereich mit realisierten Objekten und drei Sprachversionen.',
      result: 'Website eines 90 Jahre alten Unternehmens in drei Sprachen',
      tags: ['WordPress', 'Mehrsprachig', 'Responsiv', 'Formulare'],
      facts: [
        { label: 'Dauer', value: '≈ 3 Wochen' },
        { label: 'Übergabe', value: 'April 2025' },
      ],
      sections: [
        {
          id: 'client',
          title: 'Über den Kunden',
          blocks: [
            { p: 'Konteks ist ein Produktions- und Bauunternehmen mit 90-jähriger Geschichte, das seit der Sowjetzeit in Aserbaidschan tätig ist. Leistungsbereiche: Herstellung und Montage stehender zylindrischer Tanks, Stahlbau, Druckprüfungen, Tankkalibrierung, Sandstrahlen und Korrosionsschutzbeschichtung von Metalloberflächen. Zu den Objekten zählen Arbeiten für LUKOIL, Pumpstationen, die Metro und der Flughafen.' },
          ],
        },
        {
          id: 'work',
          title: 'Was wir getan haben',
          blocks: [
            {
              ul: [
                'Eine mehrseitige Struktur entworfen: Jeder Leistungsbereich ist ein eigener Abschnitt mit Beschreibung der Technologie und Fotos ausgeführter Arbeiten statt einer Zeile in einer Sammelliste.',
                'Den Bereich mit realisierten Projekten prominent platziert: Für industrielle Auftraggeber ist das das wichtigste Argument.',
                'Auf WordPress umgesetzt, damit das Unternehmen Neuigkeiten und neue Objekte selbst einpflegen kann.',
                'Drei Sprachversionen erstellt — Aserbaidschanisch, Russisch und Englisch.',
                'Kontaktformulare ergänzt und Kontakte, Firmendaten und Adresse im Footer sowie in einem eigenen Bereich platziert — niemand muss suchen, wie er Kontakt aufnimmt.',
                'Responsiv umgesetzt, mit sauberer Darstellung auf Smartphones und Tablets.',
              ],
            },
          ],
        },
        {
          id: 'design',
          title: 'Design und Struktur',
          blocks: [
            { p: 'Das Design entstand gemeinsam mit dem Kunden. Ein ruhiges Farbschema und technisch präzise Formulierungen passen zum Profil des Unternehmens, Fotos und visuelle Blöcke helfen, sich in der großen Informationsmenge zurechtzufinden.' },
            { p: 'Die Website löst eine konkrete Aufgabe: Größe, Produktionskapazität und einen ununterbrochenen Ruf zu zeigen — von der Sowjetzeit bis zu aktuellen Projekten.' },
          ],
        },
        {
          id: 'timeline',
          title: 'Zeitrahmen und Ablauf',
          blocks: [{ p: 'Rund drei Wochen, angesichts des Umfangs der Bereiche und der Übersetzung in drei Sprachen. Übergabe im April 2025.' }],
        },
      ],
      shots: [],
    },

    'oqni-baku': {
      description: 'Website für das Restaurant Oqni Baku, ohne Vorlagen gebaut: Speisekarte, Kontakt, eigene 404-Seite, SEO für Google und Yandex, Google Cloud.',
      lead: 'Eine Website von Grund auf, ohne Vorlagen: Startseite, Speisekarte, Kontakt, eine gestaltete 404-Seite und ein dynamisch rotierendes Bild. SEO für Google und Yandex, gehostet auf Google Cloud.',
      result: 'Restaurant-Website mit SEO für Google und Yandex',
      tags: ['HTML/CSS/JS', 'SEO', 'Google Cloud'],
      facts: [
        { label: 'Dauer', value: '≈ 1,5 Wochen' },
        { label: 'Übergabe', value: 'April 2024' },
      ],
      sections: [
        {
          id: 'client',
          title: 'Über den Kunden',
          blocks: [
            { p: 'Oqni Baku ist ein Restaurant mit aserbaidschanischer Küche im russischen Astrachan. Die Aufgabe der Website ist einfach und typisch für die Gastronomie: Wer das Lokal über die Suche oder den Namen findet, will die Karte sehen, einen Eindruck von der Atmosphäre bekommen und Adresse und Telefonnummer finden.' },
          ],
        },
        {
          id: 'work',
          title: 'Was wir getan haben',
          blocks: [
            {
              ul: [
                'Eine Visitenkarten-Website von Grund auf entwickelt, ohne Vorlagen oder fertige Themes: Startseite, Speisekarte, Kontaktseite.',
                'Sauberes HTML, CSS und JavaScript geschrieben — die Website ist leicht und lädt auch im Mobilfunknetz schnell.',
                'Responsiv umgesetzt: Die meisten Restaurantgäste öffnen die Seite auf dem Smartphone.',
                'Ein dynamisch rotierendes Bild auf der Startseite ergänzt — ein Akzent, der die Seite ohne schwere Animationen belebt.',
                'SEO und Indexierung für Google und Yandex eingerichtet — für ein russisches Publikum ist Yandex Pflicht.',
                'Eine gestaltete 404-Seite gebaut, damit ein falscher Link nicht wie eine kaputte Website wirkt.',
                'Das Projekt auf Google Cloud gehostet.',
              ],
            },
          ],
        },
        {
          id: 'design',
          title: 'Design und Struktur',
          blocks: [
            { p: 'Das Design entstand gemeinsam mit dem Kunden. Ein Restaurant braucht keine große Website, sondern eine kurze und überzeugende: drei Seiten, große Fotos der Gerichte, eine gut lesbare Karte und Kontakt mit einem Klick. Alles andere wurde bewusst weggelassen, damit nichts von der Hauptsache ablenkt — vorbeikommen oder anrufen.' },
          ],
        },
        {
          id: 'timeline',
          title: 'Zeitrahmen und Ablauf',
          blocks: [{ p: 'Rund anderthalb Wochen vom Layout bis zum Livegang. Übergabe im April 2024.' }],
        },
      ],
      shots: [],
    },

    'yakitori-menu': {
      description: 'A4-Menübroschüre für das Restaurant Yakitori: 10 Blätter, 68 Positionen mit Fotos, RU und AZ aus einem Layout, editierbares PPTX, Druck-PDF.',
      lead: 'Eine gedruckte A4-Menübroschüre mit 10 Blättern: 68 Positionen mit Fotos, zwei Sprachversionen aus einem gemeinsamen Layout, ein editierbares PPTX für das Restaurant und ein Druck-PDF mit Schrift in Pfaden.',
      result: 'A4-Menübroschüre: 10 Blätter, 68 Positionen, RU und AZ',
      tags: ['HTML/CSS', 'PPTX', 'Druck-PDF', 'Schrift in Pfaden', 'RU / AZ'],
      facts: [
        { label: 'Dauer', value: '5 Tage' },
        { label: 'Übergabe', value: '10. August 2026' },
      ],
      sections: [
        {
          id: 'client',
          title: 'Über den Kunden',
          blocks: [
            { p: 'Yakitori · Asian Food ist ein asiatisches Restaurant. Eine gedruckte Speisekarte am Tisch ist mehr als eine Liste: Der Gast hält sie mehrere Minuten in der Hand und wählt nach dem Foto. Gebraucht wurde eine Broschüre für das gesamte Angebot, gleich in zwei Sprachen und so übergeben, dass das Restaurant den Text selbst bearbeiten und die Druckerei ohne Nacharbeit drucken kann.' },
          ],
        },
        {
          id: 'work',
          title: 'Was wir getan haben',
          blocks: [
            {
              ul: [
                'Eine A4-Menübroschüre mit 10 Blättern gesetzt: fünf physische Bögen, beidseitig bedruckt, mit Spiralbindung. Darin 68 Positionen, jede mit eigenem Foto — insgesamt 77 Aufnahmen, kein leerer Platz.',
                'Beide Sprachsätze, Russisch und Aserbaidschanisch, aus einem Layout erzeugt. Die aserbaidschanische Broschüre ist kein Fork: Markup, Styles und Konverter sind gemeinsam, nur die Textdatei ist getrennt. Drei Sicherungen brechen den Build ab, wenn sich die Quellstruktur verschiebt, ein interner Schlüssel nicht so oft vorkommt wie angegeben oder auf einer fertigen Seite sichtbarer russischer Text übrig bleibt.',
                'Ein editierbares PowerPoint statt flacher Bilder übergeben: Preise oder Namen ändert das Restaurant selbst, ohne zu uns zurückzukommen.',
                'Die Präsentation aus Messungen der gerenderten Seite erzeugt statt aus Konstanten. Box-Koordinaten, Texte mit bereits berechneten Zeilenumbrüchen und Bildpfade werden aus dem gezeichneten Layout gelesen, sodass jede Layoutänderung von selbst ins PPTX wandert.',
                'Die Fotos über einen Parameter in den Daten zugeschnitten statt im Bildbearbeitungsprogramm: Eine Formel ergibt sowohl das CSS für das Layout als auch den Bildausschnitt für PowerPoint, der Ausschnitt stimmt also in beiden überein und die Originaldateien bleiben unberührt.',
                'Drei Druckvarianten für verschiedene Bindungen erstellt — mit Spirale, ohne Spirale und eine 12-seitige Version — per Skript aus einer einzigen Quelle, ohne Projektkopien.',
              ],
            },
          ],
        },
        {
          id: 'design',
          title: 'Design und Struktur',
          blocks: [
            { p: 'Der Umschlag ist dunkel, die Innenblätter hell: Cremepapier mit Momiji-Blättern im Hintergrund, dunkle Farbe, rote Akzente und goldene Haarlinien. Kopf- und Fußzeile jedes Blatts bleiben dunkel, so liest sich die Broschüre als ein Objekt und nicht als Sammlung einzelner Seiten.' },
            { p: 'Jede Doppelseite hat ihren eigenen Kartentyp passend zur Art des Gerichts: eine Kachel mit Foto oben für die Sets, ein rundes Foto in weißem Rahmen mit Goldring für Rollen und Suppen, eine große Karte mit Foto links für warme Rollen, ein schräg gestelltes Polaroid für die Kombos und eine typografische Preisliste für die Getränke. Das letzte Blatt schließt mit einem runden Hanko-Stempel „Guten Appetit“.' },
            { p: 'Einige Entscheidungen traf der Kunde während der Arbeit, und sie veränderten das Layout spürbar. Weiße Flächen hinter den Karten nahmen etwa 70 % eines Blatts ein und verdeckten den Blätterhintergrund — sie wurden verworfen. Jetzt ist jede Karte halbtransparentes Glas mit goldener Haarlinie, der Hintergrund scheint durch, und der Preis sitzt als Etikett in der oberen rechten Ecke. Die dekorativen Kumiko-Ecken fielen aus demselben Grund weg: Das Blatt wurde ruhiger.' },
            { p: 'Eine weitere Regel ergab sich aus dem Satz selbst: Zeilenhöhen werden nie von Hand angepasst, die Abschnitte dehnen sich selbst und füllen das Blatt bis zur Fußzeile. Der knappste verbleibende Rand nach den Spiralrändern liegt unter einem Zentimeter, auf dem Blatt mit den Sets.' },
          ],
        },
        {
          id: 'print',
          title: 'Druck',
          blocks: [
            {
              ul: [
                'Gespiegelte Ränder für die Spirale: 12,2 mm auf der Bindungsseite und 6,6 mm außen. Die Vorderseite eines Blatts hat die Spirale links, die Rückseite rechts.',
                'Logo und Telefonnummern vom oberen Rand nach unten versetzt, von 2,9 mm auf 6,3–6,6 mm: Der ursprüngliche Abstand lag innerhalb der Schnitttoleranz, und die Druckerei bat um mehr Luft.',
                'Schrift in Pfaden geliefert: Das fertige PDF bettet null Schriften ein. Geprüft haben wir das mit einer Zahl, nicht nach Augenmaß — „der Text lässt sich mit der Maus markieren“ beweist hier nichts, denn neben den Pfaden wird nur für Suche und Kopieren eine Zuordnungstabelle geschrieben.',
                'Ein Verlauf mit Transparenz über einem Foto übersteht den Druck nicht: Die Abdunklung auf dem Umschlag kam aus der Druckerei magentafarben geflutet zurück. Wir haben die Abdunklung direkt ins Bild eingerechnet, und das Problem war weg.',
                'Das PDF wird per eigenem Skript erzeugt, nicht aus PowerPoint gespeichert: PowerPoint schreibt echten Text mit eingebetteten Schriften und komprimiert die Bilder neu — der Hintergrund kam mit etwa 110 dpi statt der geforderten 300 dpi an.',
              ],
            },
          ],
        },
        {
          id: 'timeline',
          title: 'Zeitrahmen und Ablauf',
          blocks: [
            { p: 'Fünf Arbeitstage. Die Karte wurde abgestimmt, gesetzt und gedruckt, die Arbeit am 10. August 2026 abgeschlossen. Das Endpaket: sechs Druck-PDFs für drei Bindungsvarianten und zwei editierbare PPTX-Dateien, Russisch und Aserbaidschanisch.' },
          ],
        },
      ],
      shots: [],
    },
  },
};
