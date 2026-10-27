import type { CaseDetails } from './types';

export const en: CaseDetails = {
  labels: {
    crumbs: 'Breadcrumb',
    titleSuffix: '{brand} case study',
    home: 'Home',
    breadcrumb: 'Cases',
    toc: 'On this page',
    live: 'Visit the live site',
    newTab: 'opens in a new tab',
    readFull: 'Read the full case',
    cta: 'Discuss a similar project',
    ctaTitle: 'Need something similar?',
    ctaText: 'Tell us about the task — we give an estimate and a timeline after a 15‑minute brief.',
    prev: 'Previous case',
    next: 'Next case',
    all: 'All cases',
    of: 'of',
  },
  items: {
    mybuild: {
      description: 'A construction marketplace: orders, bids with price and deadline, work submission and acceptance in real time. Built with Next.js, NestJS and PostgreSQL.',
      lead: 'A two-sided platform: the client publishes a construction order, companies bid with a price and a deadline, and the deal moves step by step through to acceptance. Two dashboards, real-time updates, files and notifications.',
      result: 'Orders, bids and work acceptance in one platform',
      tags: ['Next.js', 'NestJS', 'PostgreSQL', 'WebSocket'],
      facts: [
        { label: 'Timeline', value: '4 months of development' },
        { label: 'Cost', value: '≈ $26,500' },
      ],
      sections: [
        {
          id: 'about',
          title: 'About the project',
          blocks: [
            { p: 'The client’s name and project data are covered by a non-disclosure agreement, so this page describes how the platform works rather than whom it serves. A public demo on test data is built from the same code as the production system.' },
          ],
        },
        {
          id: 'task',
          title: 'The problem',
          blocks: [
            { p: 'Before the platform, the client and the construction company negotiated over chat and by phone. Deal terms got lost in messages, drawings and estimates were scattered across conversations, and neither side could say precisely what stage the work was at.' },
            { p: 'They needed a system where a deal has explicit steps, every step is confirmed by both sides, and none of them can be skipped.' },
          ],
        },
        {
          id: 'work',
          title: 'What we built',
          blocks: [
            {
              ul: [
                'Two dashboards in one application: the client manages their orders; the construction company sees the feed of available orders, its own bids and its work submissions.',
                'An order form with category, property type, floor area, address, budget, preferred start date and files: drawings and plans are attached upfront, so the company prices the job from documents rather than from a verbal description.',
                'Bids with a price and a deadline: the client sees them side by side and picks one. The deal price and deadline are taken from the accepted bid, and the remaining bids automatically move to “not selected”.',
                'Work submission with files and a mandatory comment, acceptance by the client, and sending work back for revision with a new submission round. The history of every round is kept.',
                'Real-time updates: an action on one side appears on the other without reloading the page.',
                'Notifications for every event in the deal, with an unread counter.',
                'A contractor directory showing the number of completed orders, plus a Documents section with every file across every order.',
                'Private file storage: a download link lives for five minutes and is issued only to someone entitled to that file.',
                'Dark and light themes, responsive from phone to large screen.',
              ],
            },
          ],
        },
        {
          id: 'deal',
          title: 'How the deal works',
          blocks: [
            { p: 'An order status cannot be set by hand. Every permitted transition is described in a single table, and any action outside it is rejected with a clear explanation. Status, bids and notifications change within one transaction, so the state of the deal cannot drift apart between the two sides’ screens.' },
            {
              ol: [
                'Looking for a contractor — the order is published, no bids yet.',
                'Awaiting confirmation — at least one bid has arrived, the client is choosing.',
                'In progress — a bid is accepted, price and deadline are fixed.',
                'Awaiting completion confirmation — the company has submitted the work with files and a comment.',
                'Under revision — the client sent the work back, the company prepares the next submission round.',
                'Completed — the client accepted the work.',
              ],
            },
          ],
        },
        {
          id: 'privacy',
          title: 'What an outside company sees',
          blocks: [
            { p: 'Privacy here is a rule built into the data itself, not a footnote. A company that is not part of the deal sees the order as “looking for a contractor”, whatever its real state. It sees neither the deal price, nor other companies’ bids, nor the client’s contacts.' },
            { p: 'The same rule applies in three places at once: in the server response, in the addressing of real-time events and in file access.' },
          ],
        },
        {
          id: 'tech',
          title: 'Technology',
          blocks: [
            { p: 'Next.js and React on the interface side, NestJS and PostgreSQL on the server side, TypeScript throughout. Real-time updates run over WebSocket; authentication and file storage are on Supabase.' },
            { p: 'The shared rules of the deal live in a separate package used by both sides, so the button on screen and the check on the server are computed by one and the same function and cannot diverge.' },
          ],
        },
        {
          id: 'timeline',
          title: 'Timeline and cost',
          blocks: [{ p: 'Four months of development, followed by acceptance testing on the client side. Project cost: about $26,500.' }],
        },
      ],
      shots: [],
    },

    'target-english-courses': {
      description: 'Paid social for an online English school: a CIS-wide audience, two traffic scenarios and a chatbot. 95 applications in 10 days, CTR up to 9.3%, $0.03 per click.',
      lead: 'Targeted ads for an online English school: the audience was widened to the CIS countries, traffic was split between the website and Instagram, and a chatbot took over the frequent questions.',
      result: '95 applications in 10 days',
      tags: ['Targeting', 'Instagram', 'Chatbot'],
      facts: [
        { label: 'Period', value: '10 days, April 2024' },
        { label: 'Cost per click', value: '$0.03' },
      ],
      sections: [
        {
          id: 'task',
          title: 'The goal',
          blocks: [{ p: 'An online English school needed more course applications — through Instagram and through its website.' }],
        },
        {
          id: 'work',
          title: 'What we did',
          blocks: [
            {
              ul: [
                'Widened the geography: the audience was initially limited to one city, but the school is online and a student’s location is irrelevant — so we added the CIS countries.',
                'Split traffic into two scenarios: visits to the school’s website and direct messages on Instagram.',
                'Connected a chatbot that handles prospective students’ frequent questions and moves them on to the school’s site — a manager joins an already warm conversation.',
                'Used both our own creatives and posts that were already performing on the account.',
              ],
            },
          ],
        },
        {
          id: 'results',
          title: 'Results over 10 days',
          blocks: [
            {
              stats: [
                { value: '95', label: 'applications' },
                { value: '$1.35', label: 'average cost per enquiry ($0.57 to $2.95 depending on the audience)' },
                { value: '9.3%', label: 'click-through rate on website ads' },
                { value: '$0.03', label: 'cost per click to the website' },
              ],
            },
          ],
        },
        {
          id: 'why',
          title: 'Why it matters',
          blocks: [
            { p: 'This is a clear example of why one number never tells the story: a direct message costs more than a site visit, but it also behaves differently. Splitting traffic into two scenarios, plus a chatbot absorbing routine questions, gave the school a steady flow of applications on a controlled budget. The campaign ran in April 2024.' },
          ],
        },
      ],
      shots: [],
    },

    alfanet: {
      description: 'A WordPress website for the ISP Alfanet: three products, two languages and short request forms. 36.8k clicks from Google search at a 25% CTR.',
      lead: 'An information portal for an internet provider: plans, coverage areas, connection requests sent straight to email, two language versions, with a focus on SEO and a fast path to action.',
      result: 'ISP website: 36.8k clicks from Google at a 25% CTR',
      tags: ['WordPress', 'Multilingual', 'Responsive', 'Request forms'],
      facts: [
        { label: 'Timeline', value: '≈ 2 weeks' },
        { label: 'Delivered', value: 'February 2025' },
      ],
      sections: [
        {
          id: 'client',
          title: 'About the client',
          blocks: [
            { p: 'Alfanet is an Azerbaijani internet service provider offering home and business internet, television and hosting. For an ISP the website is the first point of contact: a visitor arrives from search or an ad and needs to understand the offer within a minute and submit a connection request.' },
          ],
        },
        {
          id: 'work',
          title: 'What we did',
          blocks: [
            {
              ul: [
                'Split the site across three products — Internet, TV and Hosting. Each has its own page, so visitors from search land directly on the service they need.',
                'Built it on WordPress: the provider’s content manager updates copy and plans without a developer.',
                'Shipped two language versions — Azerbaijani and Russian.',
                'Added short connection request forms: submissions go straight to the company inbox, with no extra steps and no mandatory CRM.',
                'Made the layout responsive — most enquiries an ISP receives come from a phone.',
                'Wrote page structure, headings and meta tags around internet, TV and hosting queries in both languages.',
              ],
            },
          ],
        },
        {
          id: 'design',
          title: 'Design and structure',
          blocks: [
            { p: 'The design was developed together with the client. Alfanet is a technology company, but what it sells is simplicity — so the site is uncluttered: contrasting accents and icons let you tell one product from another at a glance, and the user path is short: pick a service, send a request. Anything that does not help someone get connected was removed from the homepage.' },
          ],
        },
        {
          id: 'timeline',
          title: 'Timeline and process',
          blocks: [{ p: 'About two weeks including markup, content and form setup. Delivered in February 2025.' }],
        },
        {
          id: 'metrics',
          title: 'How the site performs',
          blocks: [
            { p: 'Google Search Console data over 16 months and PageSpeed Insights, August 2026.' },
            {
              stats: [
                { value: '36.8k', label: 'clicks from Google search on 147k impressions' },
                { value: '25%', label: 'search CTR: one impression in four turns into a visit' },
                { value: '5.2', label: 'average position in Google' },
                { value: '100 / 100', label: 'SEO and accessibility in PageSpeed Insights (desktop)' },
              ],
            },
            {
              ul: [
                'Best practices in PageSpeed Insights — 96 out of 100.',
                'Cumulative Layout Shift 0 and Total Blocking Time 0 ms: the page does not shift while loading and never stalls on scripts.',
              ],
            },
          ],
        },
      ],
      shots: [],
    },

    'target-personal-profile': {
      description: 'Promoting an ad expert’s personal brand with a lead magnet built on the audience’s pain points: 90 enquiries at $0.95 in 5 days and a 4-month client.',
      lead: 'Promoting an expert’s personal brand: we first analysed the audience’s pain points, then turned the most frequent question into a lead-magnet guide and drove traffic straight into the conversation.',
      result: '90 leads at under $1 each',
      tags: ['Targeting', 'Instagram', 'Lead magnet'],
      facts: [
        { label: 'Period', value: '5 days, April 2024' },
        { label: 'Budget', value: '$86' },
      ],
      sections: [
        {
          id: 'task',
          title: 'The goal',
          blocks: [
            { p: 'A project for a targeted-advertising specialist: raise their recognition as an expert and build a base of interested followers by giving away a lead magnet on Instagram.' },
          ],
        },
        {
          id: 'work',
          title: 'What we did',
          blocks: [
            {
              ul: [
                'Analysed the audience: pain points, fears and the single recurring question — how to package a business profile on Instagram before running ads.',
                'Wrote a guide answering exactly that and turned it into a lead magnet: someone messages the account and gets value immediately.',
                'Ran a messages campaign on Instagram and drove traffic straight into the conversation, with no intermediate landing pages.',
              ],
            },
          ],
        },
        {
          id: 'results',
          title: 'Results over 5 days',
          blocks: [
            {
              stats: [
                { value: '90', label: 'direct-message enquiries' },
                { value: '$0.95', label: 'per enquiry' },
                { value: '$86', label: 'campaign budget' },
                { value: '4 months', label: 'of work with a client who came from the campaign' },
              ],
            },
          ],
        },
        {
          id: 'why',
          title: 'Why it matters',
          blocks: [
            { p: 'The case shows a mechanic that works for an expert and a business alike: instead of advertising head-on, offer useful material people take for themselves — and build the sale on that contact. With this approach the cost per enquiry stays under a dollar even on a small budget. The campaign ran in April 2024.' },
          ],
        },
      ],
      shots: [],
    },

    shp: {
      description: 'A hand-coded website for the construction company SHP: project portfolio, three languages, Vercel and Cloudinary. Desktop PageSpeed 98, search CTR 14.7%.',
      lead: 'A modern site on clean code: fast and responsive, with a focus on completed projects. Hosted on Vercel, images delivered via Cloudinary.',
      result: 'Construction company website: PageSpeed 98, search CTR 14.7%',
      tags: ['HTML/CSS/JS', 'SEO', 'Vercel', 'Cloudinary'],
      facts: [
        { label: 'Timeline', value: '≈ 3 weeks' },
        { label: 'Delivered', value: 'December 2024' },
      ],
      sections: [
        {
          id: 'client',
          title: 'About the client',
          blocks: [
            { p: 'SHP is a full-cycle company: from concept and strategy to construction management and facility operation. Its work covers concrete and roofing, steel structures, engineering systems (HVAC, water supply and sewerage, fire protection, electrical, BMS), plus design, 3D visualisation and construction consulting. Completed sites include Port Baku Walk, Deniz Mall, CASA Baku and Rahat Gourmet Crescent Mall.' },
          ],
        },
        {
          id: 'work',
          title: 'What we did',
          blocks: [
            {
              ul: [
                'Built the structure around the company’s strongest argument — its project portfolio: dedicated sections for Projects, Services, About, Team, Licences and Certificates, and Clients.',
                'Coded the site in plain HTML, CSS and JavaScript, with no CMS or page builder, so pages load fast even with heavy photo galleries.',
                'Shipped three language versions: Azerbaijani, Russian and English.',
                'Showcased client and partner logos (Pasha Group, AZAL, Marriott International, Ritz Carlton) along with ISO licences and certificates — exactly what settles the trust question for a construction buyer.',
                'Connected Cloudinary: project photos are delivered compressed and correctly sized, so galleries never slow the page down.',
                'Deployed on Vercel: HTTPS, CDN and instant rollback on updates.',
                'Set up the SEO basics — headings, meta tags, sitemap and semantic markup.',
              ],
            },
          ],
        },
        {
          id: 'design',
          title: 'Design and structure',
          blocks: [
            { p: 'The design was developed together with the client. The leading graphic motif is the polyhedron: it reads as precision, momentum and the ability to handle projects of any complexity — which matches how SHP positions itself.' },
            { p: 'The palette is deliberately restrained: in construction, trust is earned through a calm presentation and strong photography of completed sites, not decoration. Large images act as proof of experience, while short service descriptions lead to the contacts.' },
          ],
        },
        {
          id: 'timeline',
          title: 'Timeline and process',
          blocks: [{ p: 'About three weeks — from approving the layout to going live, including filling all sections and translating into three languages. Delivered in December 2024.' }],
        },
        {
          id: 'metrics',
          title: 'How the site performs',
          blocks: [
            { p: 'Google Search Console and PageSpeed Insights data, August 2026.' },
            {
              stats: [
                { value: '98 / 100', label: 'performance in PageSpeed Insights (desktop)' },
                { value: '1.0 s', label: 'Largest Contentful Paint; Cumulative Layout Shift 0.002' },
                { value: '14.7%', label: 'search CTR: close to one impression in seven turns into a visit' },
                { value: '5.1', label: 'average Google position over three months, against 6.4 over 16 months' },
              ],
            },
            { ul: ['Accessibility — 90 out of 100, best practices — 96 out of 100.'] },
          ],
        },
      ],
      shots: [],
    },

    'yakitori-site': {
      description: 'A menu website for the Yakitori restaurant in plain HTML, CSS and JS: 15 sections, two languages as separate pages, sticky navigation and a lightbox.',
      lead: 'A menu website for an Asian restaurant: plain HTML, CSS and JavaScript with no CMS and no build step, two language versions as separate pages, menu sections rendered from data, sticky navigation and a lightbox.',
      result: 'A 15-section menu site in two languages',
      tags: ['HTML/CSS/JS', 'Zero dependencies', 'Multilingual', 'SEO', 'JSON-LD Restaurant', 'Cloudflare Pages'],
      facts: [
        { label: 'Timeline', value: '≈ 1 week' },
        { label: 'Launched', value: '17 August 2026' },
      ],
      sections: [
        {
          id: 'client',
          title: 'About the client',
          blocks: [
            { p: 'Yakitori · Asian Food is an Asian restaurant: sushi and rolls, soups, noodles, fried rice, udon, tempura, salads, waffles, ice cream and drinks, plus delivery across the city. A guest comes to a site like this for one thing: to read the menu with prices and call. That means the site has to open instantly on a phone and show a dish as a photograph, not as a line in a list.' },
          ],
        },
        {
          id: 'work',
          title: 'What we did',
          blocks: [
            {
              ul: [
                'Built the site in plain HTML, CSS and JavaScript: no CMS, no bundler, not a single external dependency. Pages are served as finished files, an update is a folder copy, and there are no plugins to break on the next release.',
                'Separated data from rendering. The entire menu lives in one data file, and a script builds both the card grid and the section navigation from it. Changing a price or an ingredient list never touches the markup.',
                'Shipped the two language versions as separate pages rather than a client-side switcher: Russian on yakitori.az, Azerbaijani on yakitori.az/az. Each has its own canonical and a full hreflang cluster (ru, az and x-default): a search engine sees two self-contained documents, not one document swapping its text.',
                'Laid the menu out across 15 sections — from sets and combos to lemonades — with five groups inside sushi and rolls: hosomaki, uramaki, hot rolls, baked rolls, and the sushi burger with rice balls. The last three sections are typeset as a price list and fold into columns automatically.',
                'Built sticky section navigation: the active item is highlighted by an IntersectionObserver, the strip scrolls with the wheel and drags with the mouse, and a click right after a drag is suppressed — otherwise dragging would randomly jump to another section.',
                'Added a lightbox: clicking any photo opens it full screen; any click or the Escape key closes it.',
                'Cropped the dish photography in CSS only, without touching the files. For the soups, scale and focal point are tuned so the bowls come out the same size across a row; the lightbox still opens the untouched original.',
                'Wrote the full search markup: title, description, canonical, hreflang, geo metadata, Open Graph and a Twitter card, and JSON-LD Restaurant with the phone, address, opening hours, coordinates and price range.',
                'Converted every raster image to WebP and deployed to Cloudflare Pages; the www address redirects to the main one, which keeps the QR code on the printed flyer working — the www form is what went to press.',
              ],
            },
          ],
        },
        {
          id: 'design',
          title: 'Design and structure',
          blocks: [
            { p: 'The site runs on the brand’s two themes. The dark one covers the header, the first screen and the footer: dark brown ground, cream text, gold lettering and a red rule under the header. The light one carries the menu itself: cream paper with a seigaiha pattern, white dish cards, red prices. The result reads as a printed menu card laid on a dark cover — exactly what the restaurant is.' },
            { p: 'The first screen is not an advert: a headline, one sentence, an order button and two lines of facts — opening hours and the address. The phone number sits in the header and again in the footer, because orders here come by phone, not through a cart.' },
          ],
        },
        {
          id: 'typography',
          title: 'Typography and the Azerbaijani version',
          blocks: [
            { p: 'Three typefaces, and no fourth: Montserrat for headings, dish names and prices, Manrope for ingredient lists and descriptions, Noto Sans JP for the Japanese section labels. The split is not decorative: Manrope physically lacks the local currency sign and the Azerbaijani letter Ə, so every price is set in Montserrat, and Manrope falls back to that same Montserrat — it is what draws the Ə inside Azerbaijani dish descriptions.' },
            { p: 'Without it the browser would silently fall back to a system font: CSS gives no sign of this, the family is assigned and everything “works”, yet the letter drops out of the line. We checked it with a script rather than by eye: it asks the browser which real font rendered each text node on both pages.' },
            { p: 'The second Azerbaijani trap is casing. A plain uppercase transform turns i into I, while Azerbaijani needs İ, so every string that renders in caps is already stored capitalised in the data and the transform stays a no-op.' },
          ],
        },
        {
          id: 'mobile',
          title: 'How the site behaves on a phone',
          blocks: [
            { p: 'Most orders come in from a phone, so the menu grid was checked across fourteen widths, from a wide monitor down to a narrow handset. One rule sits behind all of them: a dish name must never break onto a second line and collide with its price.' },
            {
              ul: [
                'On a tablet the grid is forced into two columns.',
                'On a phone the price drops below the name instead of sharing a line with it.',
                'On the narrowest screens the whole text steps down a size.',
              ],
            },
            { p: 'Sizes were tuned to Montserrat: at the same size it runs about a fifth wider than Manrope, so eyeballing does not work here.' },
          ],
        },
        {
          id: 'timeline',
          title: 'Timeline and process',
          blocks: [
            { p: 'About a week of work. The site went live at yakitori.az on 17 August 2026, and the project closed on 18 August together with the flyer: the flyer carries a QR code pointing to the site, so the two could not be signed off separately.' },
          ],
        },
      ],
      shots: [],
    },

    'target-body-massage': {
      description: 'Paid social for a massage specialist: segments from past launches and the best Reels creative. 80 enquiries at $0.93 and 747 clicks at $0.10 in 5 days.',
      lead: 'A booking campaign for a massage specialist: the audience was segmented using results from earlier launches, and the campaign was built around the Reels video that already drove the most conversations.',
      result: '80 enquiries at $0.93 in 5 days',
      tags: ['Targeting', 'Instagram', 'Reels'],
      facts: [
        { label: 'Period', value: '5 days, April 2024' },
        { label: 'Budget', value: '$74.70' },
      ],
      sections: [
        {
          id: 'task',
          title: 'The goal',
          blocks: [{ p: 'Generate as many enquiries as possible for maderotherapy — a manual body massage treatment — and turn them into bookings.' }],
        },
        {
          id: 'work',
          title: 'What we did',
          blocks: [
            {
              ul: [
                'By launch we were already in our second month with this client, so nothing was guesswork: we segmented the audience using results from earlier campaigns and isolated the most active segment in the niche.',
                'Identified which of the published Reels videos produced more conversations at a lower cost — and built the campaign around it.',
                'Drove traffic into direct messages, so people could ask about available slots straight away instead of browsing a site.',
              ],
            },
          ],
        },
        {
          id: 'results',
          title: 'Results over 5 days',
          blocks: [
            {
              stats: [
                { value: '80', label: 'enquiries' },
                { value: '$0.93', label: 'per enquiry' },
                { value: '$74.70', label: 'budget' },
                { value: '747', label: 'clicks at $0.10' },
              ],
            },
          ],
        },
        {
          id: 'why',
          title: 'Why it matters',
          blocks: [
            { p: 'The campaign kept running for more than a month after launch: the cost per result rose, but bookings kept coming — and that endurance test is one most ad launches fail.' },
            { p: 'The case also shows the value of accumulated data: a second month with a client delivers results noticeably cheaper than the first. The campaign ran in April 2024.' },
          ],
        },
      ],
      shots: [],
    },

    'deniz-service': {
      description: 'A bilingual website for the industrial supplier Deniz Service: a 21-category catalogue, a custom certificates lightbox, clean URLs and full search markup.',
      lead: 'A bilingual site for an industrial supplier: a 21-category catalogue with anchor navigation, a purpose-built certificates component, clean URLs on Apache and full search markup.',
      result: 'Supplier catalogue: 21 categories and documents one click away',
      tags: ['HTML/CSS/JS', 'jQuery', 'Multilingual', 'SEO', 'Apache/.htaccess'],
      facts: [
        { label: 'Timeline', value: '≈ 2 weeks' },
        { label: 'Delivered', value: 'July 2026' },
      ],
      sections: [
        {
          id: 'client',
          title: 'About the client',
          blocks: [
            { p: 'Deniz Service has provided supply and engineering support since 2005: oil and gas, metallurgy, the food and chemical industries, construction and agriculture. It works as a single point of procurement — from explosion-proof equipment and valves to rigging, HVAC and personal protective equipment — and represents eleven foreign manufacturers in Azerbaijan. The company holds an ISO 9001:2015 quality management certificate and a D-U-N-S registration.' },
            { p: 'A business like this does not need a site that sells in one click: an engineer or a procurement officer arrives to check two things — whether the range covers what they need, and whether the supplier is authorised to supply it.' },
          ],
        },
        {
          id: 'work',
          title: 'What we did',
          blocks: [
            {
              ul: [
                'Built the site on plain code — HTML, CSS, JavaScript and jQuery, with no CMS: pages are served as ready files, so there is nothing to break on a plugin update and no admin panel to attack.',
                'Shipped two language versions: English at the root, Azerbaijani under /az/. Every page carries its own canonical and a full hreflang cluster — en, az and x-default.',
                'Moved the catalogue onto its own page: 21 product and service categories, each broken down into what it includes. Cards on the homepage link by anchor straight into the relevant block instead of the top of a long list.',
                'Wrote the Partners section component from scratch: a strip of eleven brands is generated from a single data file, and a click opens a custom lightbox — click and wheel zoom, pinch on phones, drag with a threshold (so a click never turns into an accidental nudge), vertical thumbnails and support for brands with more than one authorisation document.',
                'Configured Apache through .htaccess: URLs without .html, 301 redirects from the old forms, forced HTTPS, the non-www address and no trailing slash — exactly one canonical form per page. The same file handles gzip, cache headers by file type, security headers and correct MIME types for WebP and fonts.',
                'Wrote the markup search engines read: a JSON-LD @graph with Organization, WebSite, WebPage and BreadcrumbList nodes, Open Graph and Twitter cards, and a sitemap.xml with language alternates on every URL.',
                'Published the documents directly: the company presentation, the ISO certificate, laboratory accreditations and authorisation letters from all eleven manufacturers. Each PDF opens in one click, with no form and no sign-up.',
                'Converted all raster graphics to WebP and enabled lazy loading for images.',
              ],
            },
          ],
        },
        {
          id: 'design',
          title: 'Design and structure',
          blocks: [
            { p: 'The design was developed together with the client. The opening screen is dark, with a production photograph and a single sentence about the company: an industrial supplier gains more from naming its profile immediately than from a slogan. Below sits a grid of light cards on a dark background — 21 categories that read as a catalogue rather than an advertising block.' },
            { p: 'The graphic motif, a thin mesh of polyhedra across the background images, keeps the engineering tone without competing with the equipment photography. The trust arguments are gathered in one place: years in business, company principles, the ISO certificate and the D-U-N-S mark. Contacts are direct email and phone links next to a map — a procurement officer wants to get in touch, not fill in a form.' },
          ],
        },
        {
          id: 'timeline',
          title: 'Timeline and process',
          blocks: [{ p: 'About two weeks for markup, catalogue content, the certificates component and hosting setup. Delivered in July 2026.' }],
        },
      ],
      shots: [],
    },

    'expert-solutions': {
      description: 'A corporate website for Expert Solutions, turnkey labs for oil and gas: a premium palette, hexagon motif, scroll animations and two languages.',
      lead: 'A corporate site for a company with 25 years of experience: a strict premium palette, hexagons as an engineering motif, smooth scroll animations and two language versions.',
      result: 'Website of a lab-solutions provider for oil and gas',
      tags: ['HTML/CSS/JS', 'Bootstrap', 'GSAP', 'Swiper', 'Vercel'],
      facts: [
        { label: 'Timeline', value: '≈ 3 weeks' },
        { label: 'Delivered', value: 'January 2026' },
      ],
      sections: [
        {
          id: 'client',
          title: 'About the client',
          blocks: [
            { p: 'Expert Solutions LLC builds turnkey laboratories and consults for the oil and gas sector: equipment selection, design, commissioning and compliance with international standards. The team has 25 years of experience and its clients are large industrial buyers and international partners. The site had to speak their language: rigorous, evidence-led, with no marketing noise.' },
          ],
        },
        {
          id: 'work',
          title: 'What we did',
          blocks: [
            {
              ul: [
                'Built a corporate site on a plain front end: HTML, CSS, JavaScript and jQuery, with Bootstrap as the grid foundation — hence correct rendering from phone to wide monitor.',
                'Laid the page out as a funnel: a large opening screen with a call to action, service cards, a company values block, an introduction to the team, and contacts.',
                'Added scroll animations: GSAP with ScrollTrigger and SplitText for typography, AOS for block reveals, Swiper for sliders, Odometer for number counters.',
                'Built an interactive FAQ accordion that answers routine questions before the first call.',
                'Shipped two language versions — English and Azerbaijani — for local and international partners.',
                'Deployed on Vercel: delivery speed, HTTPS and stability without running a server.',
              ],
            },
          ],
        },
        {
          id: 'design',
          title: 'Design and structure',
          blocks: [
            { p: 'The design was developed together with the client. The palette is built on the contrast of deep dark and clean white with a gold-sand accent — that is what expertise looks like, as opposed to loud advertising.' },
            { p: 'The core graphic motif is the hexagon: in photo frames and graphic elements it references molecular structure and engineering precision. Alternating light and dark sections hold attention across a long scroll.' },
          ],
        },
        {
          id: 'timeline',
          title: 'Timeline and process',
          blocks: [{ p: 'About three weeks for design, markup and content. Delivered in January 2026.' }],
        },
      ],
      shots: [],
    },

    konteks: {
      description: 'A multi-page website for Konteks, a construction company with a 90-year history: sections by service area, completed projects, three languages.',
      lead: 'A multi-page site for a manufacturing and construction company: a clear architecture by service area, a section of completed projects and three language versions.',
      result: 'Website of a 90-year-old company in three languages',
      tags: ['WordPress', 'Multilingual', 'Responsive', 'Forms'],
      facts: [
        { label: 'Timeline', value: '≈ 3 weeks' },
        { label: 'Delivered', value: 'April 2025' },
      ],
      sections: [
        {
          id: 'client',
          title: 'About the client',
          blocks: [
            { p: 'Konteks is a manufacturing and construction organisation with a 90-year history, operating in Azerbaijan since the Soviet period. Its areas of work: fabrication and installation of vertical cylindrical tanks, steel structures, hydrotesting, tank calibration, sandblasting and anti-corrosion painting of metal surfaces. Its sites include work for LUKOIL, pumping stations, the metro and the airport.' },
          ],
        },
        {
          id: 'work',
          title: 'What we did',
          blocks: [
            {
              ul: [
                'Designed a multi-page structure: every service area is its own section with a description of the technology and photos of completed work, rather than one line in a shared list.',
                'Put the completed projects section front and centre: for an industrial buyer that is the main argument.',
                'Built it on WordPress so the company can add news and new sites itself.',
                'Shipped three language versions — Azerbaijani, Russian and English.',
                'Added enquiry forms and placed contacts, company details and the address in the footer and a dedicated section — a buyer never has to hunt for a way to get in touch.',
                'Made the layout responsive, with correct rendering on phones and tablets.',
              ],
            },
          ],
        },
        {
          id: 'design',
          title: 'Design and structure',
          blocks: [
            { p: 'The design was developed together with the client. A calm colour scheme and engineering precision in the wording match the company’s technical profile, while photographs and visual blocks help navigate a large volume of information.' },
            { p: 'The site solves a specific task: to convey scale, production capacity and an unbroken reputation — from the Soviet period to current projects.' },
          ],
        },
        {
          id: 'timeline',
          title: 'Timeline and process',
          blocks: [{ p: 'About three weeks, given the number of sections and the translation into three languages. Delivered in April 2025.' }],
        },
      ],
      shots: [],
    },

    'oqni-baku': {
      description: 'A landing site for the restaurant Oqni Baku, built without templates: menu, contacts, a custom 404, SEO for Google and Yandex, hosted on Google Cloud.',
      lead: 'A site built from scratch without templates: home, menu, contacts, a custom 404 page and a dynamic rotating image. SEO for Google and Yandex, hosted on Google Cloud.',
      result: 'Restaurant landing site with SEO for Google and Yandex',
      tags: ['HTML/CSS/JS', 'SEO', 'Google Cloud'],
      facts: [
        { label: 'Timeline', value: '≈ 1.5 weeks' },
        { label: 'Delivered', value: 'April 2024' },
      ],
      sections: [
        {
          id: 'client',
          title: 'About the client',
          blocks: [
            { p: 'Oqni Baku is an Azerbaijani cuisine restaurant in Astrakhan, Russia. The job of the site is simple and typical for hospitality: someone finds the place in search or by name and needs to see the menu, get a feel for the atmosphere and find the address and phone number.' },
          ],
        },
        {
          id: 'work',
          title: 'What we did',
          blocks: [
            {
              ul: [
                'Built a landing site from scratch, with no templates or ready-made themes: home, menu page, contacts page.',
                'Wrote clean HTML, CSS and JavaScript — the site is lightweight and opens fast even on mobile data.',
                'Made the layout responsive: most restaurant visitors open the site on a phone.',
                'Added a dynamic rotating image on the homepage — an accent that brings the page to life without heavy animation.',
                'Set up SEO and indexing for both Google and Yandex — for a Russian audience, Yandex is a must.',
                'Designed a proper 404 page, so a broken link never looks like a broken site.',
                'Hosted the project on Google Cloud.',
              ],
            },
          ],
        },
        {
          id: 'design',
          title: 'Design and structure',
          blocks: [
            { p: 'The design was developed together with the client. A restaurant does not need a big website — it needs a short, convincing one: three pages, large food photography, a readable menu and one-click contacts. Everything else was left out on purpose, so nothing dilutes the main action — visiting or calling.' },
          ],
        },
        {
          id: 'timeline',
          title: 'Timeline and process',
          blocks: [{ p: 'About a week and a half from layout to launch. Delivered in April 2024.' }],
        },
      ],
      shots: [],
    },

    'yakitori-menu': {
      description: 'A printed A4 menu book for the Yakitori restaurant: 10 sheets, 68 items with photos, RU and AZ from one layout, an editable PPTX and a print-ready PDF.',
      lead: 'A printed A4 menu book across 10 sheets: 68 items with photography, two language versions built from one layout, an editable PPTX for the restaurant and a print PDF with the type converted to outlines.',
      result: 'An A4 menu book: 10 sheets, 68 items, RU and AZ',
      tags: ['HTML/CSS', 'PPTX', 'Print PDF', 'Type as outlines', 'RU / AZ'],
      facts: [
        { label: 'Timeline', value: '5 days' },
        { label: 'Delivered', value: '10 August 2026' },
      ],
      sections: [
        {
          id: 'client',
          title: 'About the client',
          blocks: [
            { p: 'Yakitori · Asian Food is an Asian restaurant. A printed menu on the table is not just a list: the guest holds it for several minutes and chooses by the photograph. What was needed was a book covering the full range, in two languages at once, delivered so that the restaurant could edit the text itself and the printer could go to press without touch-ups.' },
          ],
        },
        {
          id: 'work',
          title: 'What we did',
          blocks: [
            {
              ul: [
                'Laid out an A4 menu book across 10 sheets: five physical sheets, double-sided, spiral bound. It carries 68 items, each with its own photograph — 77 shots in total, with no empty slots.',
                'Built both language sets, Russian and Azerbaijani, from one layout. The Azerbaijani book is not a fork: the markup, the styles and the converter are shared, and only the text file is separate. Three safety checks fail the build if the source structure drifts, if a service key appears a different number of times than declared, or if visible Russian text is left on a finished page.',
                'Delivered an editable PowerPoint rather than flat images: the restaurant changes a price or a name itself, without coming back to us.',
                'Generated the deck from measurements of the rendered page rather than from constants. Box coordinates, text with line breaks already resolved and image paths are read off the drawn layout, so a layout edit travels into the PPTX by itself.',
                'Cropped the photography with a parameter in the data instead of in an image editor: one formula becomes CSS for the layout and a source rectangle for PowerPoint, so the crop matches in both and the original files stay untouched.',
                'Produced three print variants for different bindings — spiral, no spiral and a 12-page version — generated by script from a single source, with no duplicated project files.',
              ],
            },
          ],
        },
        {
          id: 'design',
          title: 'Design and structure',
          blocks: [
            { p: 'The cover is dark and the inner sheets are light: cream paper with a momiji leaf background, dark ink, red accents and gold hairlines. The header and footer of every sheet stay dark, so the book reads as one object rather than a set of unrelated pages.' },
            { p: 'Each spread has its own card archetype matched to the type of dish: a tile with the photo on top for the sets, a round photo in a white frame with a gold ring for rolls and soups, a large card with the photo on the left for hot rolls, a tilted polaroid for the combos, and a typographic price list for the drinks. The last sheet closes with a round hanko seal reading “Enjoy your meal”.' },
            { p: 'Some decisions came from the client mid-project, and they changed the layout noticeably. White panels behind the cards took up around 70% of a sheet and hid the leaf background — they were rejected. A card is now translucent glass with a gold hairline, the background shows through it, and the price sits as a tag in the top right corner. The decorative kumiko corners went for the same reason: the sheet became calmer.' },
            { p: 'One more rule came out of the layout itself: row heights are never hand-tuned, the sections stretch on their own and fill the sheet down to the footer. The worst remaining slack after the spiral margins is under a centimetre, on the sets sheet.' },
          ],
        },
        {
          id: 'print',
          title: 'Print',
          blocks: [
            {
              ul: [
                'Mirrored margins for the spiral: 12.2 mm on the binding side and 6.6 mm on the outer one. The front of a sheet keeps the spiral on the left, the back on the right.',
                'The logo and phone numbers moved down from the top edge, from 2.9 mm to 6.3–6.6 mm: the original figure was inside the trim tolerance and the printer asked for more room.',
                'Type delivered as outlines: the finished PDF embeds zero fonts. We verified it with a number, not by eye — “the text can be selected with the mouse” proves nothing here, since a lookup table is written alongside the outlines purely for search and copying.',
                'A gradient with transparency over a photograph does not survive press: the darkening on the cover came back from the printer flooded magenta. We baked the darkening into the image itself and the problem disappeared.',
                'The PDF is assembled by our own script rather than saved out of PowerPoint: PowerPoint writes real text with embedded fonts and recompresses the images — the background arrived at roughly 110 dpi against a 300 dpi requirement.',
              ],
            },
          ],
        },
        {
          id: 'timeline',
          title: 'Timeline and process',
          blocks: [
            { p: 'Five days of work. The menu was approved, produced and printed, and the work closed on 10 August 2026. The final package: six print PDFs for three binding options, plus two editable PPTX files in Russian and Azerbaijani.' },
          ],
        },
      ],
      shots: [],
    },
  },
};
