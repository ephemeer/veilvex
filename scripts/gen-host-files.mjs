#!/usr/bin/env node
/**
 * Host files for Cloudflare Pages (and any host that reads them, Netlify included), generated on `prebuild`
 * from netlify.toml so the security headers and redirects have ONE source of truth:
 *   public/_headers   — every [[headers]] rule (CSP, HSTS, caching …)
 *   public/_redirects — every [[redirects]] rule (the old /en/ links → English at /)
 * Never edit the two files by hand.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseNetlifyHeaders } from './lib/netlify-headers.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const toml = fs.readFileSync(path.join(ROOT, 'netlify.toml'), 'utf8');

const header = '# Generated from netlify.toml by scripts/gen-host-files.mjs — do not edit.\n';
const rules = parseNetlifyHeaders(toml);
if (!rules.length) throw new Error('netlify.toml has no [[headers]] rules');
let headers = header;
for (const r of rules) {
  headers += `${r.for}\n`;
  for (const [k, v] of Object.entries(r.values)) {
    if (/[\r\n]/.test(v)) throw new Error(`header ${k} has a line break`);
    headers += `  ${k}: ${v}\n`;
  }
}

// [[redirects]] blocks: from / to / status (the only keys this site uses)
const redirects = [];
for (const block of toml.split(/^\[\[redirects\]\]\s*$/m).slice(1)) {
  const body = block.split(/^\[/m)[0];
  const get = (k) => body.match(new RegExp(`^\\s*${k}\\s*=\\s*"?([^"\\n]+)"?`, 'm'))?.[1]?.trim();
  const from = get('from');
  const to = get('to');
  const status = get('status') ?? '301';
  if (!from || !to) throw new Error('a [[redirects]] block without from/to');
  redirects.push(`${from} ${to} ${status}`);
}

fs.writeFileSync(path.join(ROOT, 'public', '_headers'), headers);
fs.writeFileSync(path.join(ROOT, 'public', '_redirects'), header + redirects.join('\n') + '\n');
console.log(`host files: ${rules.length} header rule(s), ${redirects.length} redirect(s) → public/_headers, public/_redirects`);
