#!/usr/bin/env node
/**
 * Generates public/llms.txt (concise, RU + EN) and public/llms-full.txt (full RU + EN, links to AZ/DE)
 * following the llms.txt convention (https://llmstxt.org): H1 = site name, a blockquote summary,
 * free-form notes, then H2 sections with lists/links.
 *
 * Everything is derived from the i18n content (src/i18n/*.ts) — the same objects that render the
 * pages — so the files never drift from the site copy. Runs on "prebuild" (see package.json), so
 * Netlify regenerates them on every build. Node ≥ 22.18 strips TypeScript types natively, which is
 * why the content files can be imported as-is (they only use erasable TS syntax).
 *
 * Absolute URLs use the same base as the build: SITE_URL || Netlify's URL || https://veilvex.netlify.app
 * (scripts/lib/site-url.mjs, shared with astro.config.mjs).
 */
import fs from 'node:fs';
import path from 'node:path';
import { siteUrl } from './lib/site-url.mjs';

const { ru } = await import('../src/i18n/ru.ts');
const { en } = await import('../src/i18n/en.ts');
const { az } = await import('../src/i18n/az.ts');
const { de } = await import('../src/i18n/de.ts');

const site = siteUrl();
const DEFAULT_LANG = 'en';
const LANG_NAMES = { ru: 'Русский', en: 'English', az: 'Azərbaycan', de: 'Deutsch' };
const ALL = [ru, en, az, de];

/** Labels that have no counterpart in the Content model (everything else comes from `t`). */
const LABELS = {
  ru: { updated: 'Обновлено', languages: 'Языковые версии', models: 'Нейросети', full: 'Полная версия для LLM', byDefault: 'по умолчанию', page: 'Страница' },
  en: { updated: 'Last updated', languages: 'Language versions', models: 'AI models', full: 'Full version for LLMs', byDefault: 'default', page: 'Page' },
};

/** Build date in ISO form; SOURCE_DATE_EPOCH makes the output reproducible. */
const now = process.env.SOURCE_DATE_EPOCH ? new Date(Number(process.env.SOURCE_DATE_EPOCH) * 1000) : new Date();
const updated = now.toISOString().slice(0, 10);

/** Absolute localized URL: url('ru', '/privacy') → https://site/ru/privacy/ */
const url = (lang, p = '/', hash = '') => {
  const prefix = lang === DEFAULT_LANG ? '' : `/${lang}`;
  const clean = p === '/' ? '' : p.replace(/\/+$/, '');
  return `${site}${prefix}${clean}/${hash ? `#${hash}` : ''}`;
};

/** Plain text: strip {{highlight}} markers, forced line breaks and non-breaking spaces. */
const plain = (s) => s.replace(/\{\{(.+?)\}\}/g, '$1').replace(/\n/g, ' ').replace(/\u00A0/g, ' ').replace(/\s{2,}/g, ' ').trim();

/** Numbers exactly as the site renders them (About stats). */
const num = (t, s) => `${s.prefix}${s.value.toLocaleString(t.locale, { minimumFractionDigits: s.decimals, maximumFractionDigits: s.decimals })}${s.suffix}`;

const line = (...parts) => parts.filter(Boolean).join(' ');

/* ------------------------------------------------------------------------------------------ */
/* Shared header: H1, blockquote summary, free-form notes (no headings before the H2 sections). */
/* ------------------------------------------------------------------------------------------ */
function header(full) {
  const langs = ALL.map((t) => `${LANG_NAMES[t.lang]}${t.lang === DEFAULT_LANG ? ` (${LABELS.ru.byDefault} / ${LABELS.en.byDefault})` : ''}: ${url(t.lang)}`).join(' · ');
  return [
    `# ${ru.brand}`,
    '',
    `> ${plain(ru.meta.description)} ${plain(en.meta.description)}`,
    '',
    `${ru.brand} — ${plain(ru.hero.eyebrow)}. ${plain(ru.hero.lead)}`,
    `${en.brand} — ${plain(en.hero.eyebrow)}. ${plain(en.hero.lead)}`,
    '',
    `- ${LABELS.ru.languages} / ${LABELS.en.languages}: ${langs}`,
    full ? `- llms.txt: ${site}/llms.txt` : `- ${LABELS.ru.full} / ${LABELS.en.full}: ${site}/llms-full.txt`,
    `- Sitemap: ${site}/sitemap-index.xml`,
    `- ${LABELS.ru.updated} / ${LABELS.en.updated}: ${updated}`,
    '',
  ];
}

/* ------------------------------------------------------------------------------------------ */
/* llms.txt — concise section per language: one link list, nested lists where the site has them. */
/* ------------------------------------------------------------------------------------------ */
function concise(t) {
  const L = LABELS[t.lang];
  const home = url(t.lang);
  const link = (label, hash, note) => `- [${label}](${url(t.lang, '/', hash)}): ${note}`;
  const geoSteps = t.geo.steps.map((s, i) => `${i + 1}) ${s.title} — ${s.desc}`).join(' ');
  return [
    `## ${LANG_NAMES[t.lang]}`,
    '',
    `- [${plain(t.meta.title)}](${home}): ${plain(t.hero.lead)} ${t.hero.chips.map((c) => `${c.title} ${c.sub}`).join(' · ')}.`,
    link(t.geo.tag, 'geo', `${plain(t.geo.title)} ${plain(t.geo.lead)} ${geoSteps} ${L.models}: ${t.geo.models.join(', ')}.`),
    link(t.services.tag, 'services', plain(t.services.lead)),
    ...t.services.items.map((s) => `  - ${s.title} — ${s.desc} ${s.bullets.join(', ')} (${s.price})`),
    link(t.process.tag, 'process', `${plain(t.process.lead)} ${t.process.steps.map((s, i) => `${i + 1}. ${s.title}`).join(' → ')}.`),
    link(t.trust.tag, 'trust', `${plain(t.trust.lead)} ${t.trust.items.map((i) => i.title).join('; ')}.`),
    link(t.industries.tag, 'industries', plain(t.industries.title)),
    ...t.industries.items.map((i) => `  - ${i.title} — ${i.desc}`),
    link(t.cases.tag, 'cases', t.cases.title),
    ...t.cases.items.map((c) => `  - ${c.title} — ${c.result} (${c.tags})`),
    link(t.pricing.tag, 'pricing', `${plain(t.pricing.note)} ${t.pricing.valueNote}.`),
    ...t.pricing.tiers.map((p) => `  - ${p.title} — ${p.value}`),
    link(t.faq.title, 'faq', `${t.faq.items.length} Q&A`),
    ...t.faq.items.map((f) => `  - ${f.q} — ${f.a}`),
    link(t.contact.tag, 'contact', `${plain(t.contact.lead)} ${t.contact.form.title}: ${url(t.lang, '/', 'contact')} — ${t.contact.form.note}`),
    `- [${t.footer.privacy}](${url(t.lang, '/privacy')}): ${t.privacy.intro} ${t.footer.builtWith}`,
    '',
  ];
}

/* ------------------------------------------------------------------------------------------ */
/* llms-full.txt — the full page content per language, section by section.                    */
/* ------------------------------------------------------------------------------------------ */
function full(t) {
  const L = LABELS[t.lang];
  const home = url(t.lang);
  const h3 = (tag, title) => ['', `### ${line(tag, title && `— ${plain(title)}`)}`, ''];
  return [
    `## ${LANG_NAMES[t.lang]} (${t.lang})`,
    '',
    `${L.page}: ${home} (${t.locale})`,
    '',
    ...h3(t.brand, t.hero.eyebrow),
    `${plain(t.hero.title)} ${plain(t.hero.lead)}`,
    '',
    `${t.hero.badge}. ${t.hero.chips.map((c) => `${c.title} ${c.sub}`).join(' · ')}.`,
    '',
    `${t.about.tag}: ${plain(t.about.text)}`,
    '',
    ...t.about.stats.map((s) => `- ${num(t, s)} ${s.label} — ${s.sub}`),
    '',
    `${t.platforms.tag}: ${t.platforms.items.join(', ')}.`,
    '',
    `${t.trust.items.map((i) => i.title).join(' · ')}.`,
    ...h3(t.geo.tag, t.geo.title),
    plain(t.geo.lead),
    '',
    ...t.geo.steps.map((s, i) => `${i + 1}. **${s.title}** — ${s.desc}`),
    '',
    `${L.models}: ${t.geo.models.join(', ')}.`,
    ...h3(t.services.tag, t.services.title),
    plain(t.services.lead),
    '',
    ...t.services.items.flatMap((s) => [`- **${s.title}** — ${s.desc} (${s.price})`, ...s.bullets.map((b) => `  - ${b}`)]),
    ...h3(t.process.tag, t.process.title),
    plain(t.process.lead),
    '',
    ...t.process.steps.map((s, i) => `${i + 1}. **${s.title}** (${s.badge}) — ${s.desc}`),
    ...h3(t.trust.tag, t.trust.title),
    plain(t.trust.lead),
    '',
    ...t.trust.items.map((i) => `- **${i.title}** — ${i.desc}`),
    ...h3(t.industries.tag, t.industries.title),
    ...t.industries.items.map((i) => `- **${i.title}** — ${i.desc}`),
    ...h3(t.cases.tag, t.cases.title),
    // the whole story of each case, as the case sheet shows it (kind, stack & channels, result, lead, blocks);
    // the link opens that case on the page
    ...t.cases.items.flatMap((c, i) => [
      `- **${c.title}** — ${c.result} (${c.kind}; ${c.tags}): ${url(t.lang, '/', `case-${i + 1}`)}`,
      `  ${c.lead}`,
      ...c.blocks.map((b) => `  - **${b.h}** — ${b.items.join(' ')}`),
    ]),
    ...h3(t.pricing.tag, t.pricing.title),
    `${plain(t.pricing.note)} ${t.pricing.valueNote}.`,
    '',
    ...t.pricing.tiers.flatMap((p) => [`- **${p.title}** (${p.badge}) — ${p.value}.`, ...p.features.map((f) => `  - ${f}`)]),
    ...h3(t.faq.tag, t.faq.title),
    ...t.faq.items.flatMap((f) => [`**${f.q}**`, f.a, '']),
    ...h3(t.contact.tag, t.contact.title),
    plain(t.contact.lead),
    '',
    `${t.contact.form.title}: ${url(t.lang, '/', 'contact')} — ${t.contact.form.note}`,
    '',
    `${t.footer.about} ${t.footer.builtWith}`,
    ...h3(t.footer.privacy, null),
    `${url(t.lang, '/privacy')} — ${t.privacy.updated}`,
    '',
    t.privacy.intro,
    '',
    ...t.privacy.sections.map((s) => `- **${s.h}** — ${s.p.join(' ')}`),
    '',
  ];
}

/** AZ / DE: links only (the full text lives on the pages themselves). */
function linksOnly(t) {
  return [
    `## ${LANG_NAMES[t.lang]} (${t.lang})`,
    '',
    `- [${plain(t.meta.title)}](${url(t.lang)}): ${plain(t.meta.description)} ${plain(t.hero.lead)}`,
    `- [${t.services.tag}](${url(t.lang, '/', 'services')}): ${t.services.items.map((s) => s.title).join(' · ')}`,
    `- [${t.contact.tag}](${url(t.lang, '/', 'contact')}): ${t.contact.form.title}`,
    `- [${t.footer.privacy}](${url(t.lang, '/privacy')}): ${t.privacy.intro}`,
    '',
  ];
}

const llms = [...header(false), ...concise(ru), ...concise(en)].join('\n');
const llmsFull = [...header(true), ...full(ru), ...full(en), ...linksOnly(az), ...linksOnly(de)].join('\n');

const outDir = path.resolve('public');
fs.mkdirSync(outDir, { recursive: true });
for (const [name, text] of [['llms.txt', llms], ['llms-full.txt', llmsFull]]) {
  if (/<\/?script|nexum/i.test(text)) throw new Error(`${name}: unexpected content`);
  fs.writeFileSync(path.join(outDir, name), text.replace(/\n{3,}/g, '\n\n'));
  console.log(`${name} → public/${name} (${text.split('\n').length} lines, ${updated}, ${site})`);
}
