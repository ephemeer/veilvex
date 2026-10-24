#!/usr/bin/env node
/**
 * Verifies that every inline <script> in dist/ is allowed by the CSP in netlify.toml
 * (sha256 hash present) and that no inline style attributes / <style> tags exist.
 *
 * <script type="application/ld+json"> blocks are data, not code: browsers never execute them, so
 * CSP script-src does not apply. They are skipped by the hash check but still validated — the body
 * must be well-formed JSON and must not contain "</script" or "<!--", which could break out of the
 * data block during HTML parsing (src/lib/jsonld.ts escapes <, >, & for exactly that reason).
 *
 * Run after `npm run build`.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const dist = path.resolve('dist');
const toml = fs.readFileSync(path.resolve('netlify.toml'), 'utf8');
const csp = toml.match(/Content-Security-Policy\s*=\s*"([^"]+)"/)?.[1] ?? '';
const allowed = new Set([...csp.matchAll(/'sha256-([^']+)'/g)].map((m) => m[1]));
const isJsonLd = (attrs) => /\stype\s*=\s*["']?application\/ld\+json["']?/i.test(attrs);
let problems = 0;
let dataBlocks = 0;
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? walk(path.join(dir, d.name)) : d.name.endsWith('.html') ? [path.join(dir, d.name)] : []));
for (const file of walk(dist)) {
  const rel = path.relative(dist, file);
  const html = fs.readFileSync(file, 'utf8');
  for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    const [, attrs, body] = m;
    if (/\ssrc\s*=/.test(attrs)) continue; // external, covered by script-src 'self'
    if (isJsonLd(attrs)) {
      dataBlocks++;
      try { JSON.parse(body); } catch (e) { problems++; console.log(`✗ ${rel}: JSON-LD block is not valid JSON (${e.message})`); }
      if (/<\/script|<!--|<script/i.test(body)) { problems++; console.log(`✗ ${rel}: JSON-LD block contains unescaped HTML markup`); }
      continue;
    }
    const hash = crypto.createHash('sha256').update(body).digest('base64');
    if (!allowed.has(hash)) { problems++; console.log(`✗ ${rel}: inline script not in CSP (sha256-${hash}): ${body.slice(0, 60)}`); }
  }
  if (/<style[\s>]/.test(html)) { problems++; console.log(`✗ ${rel}: inline <style> found (CSP style-src 'self' would block it)`); }
  for (const m of html.matchAll(/\sstyle="[^"]*"/g)) { problems++; console.log(`✗ ${rel}: inline style attribute: ${m[0].slice(0, 60)}`); }
}
console.log(problems ? `${problems} CSP problem(s)` : `CSP OK — ${allowed.size} hashed inline script(s), ${dataBlocks} valid JSON-LD data block(s), no inline styles`);
process.exit(problems ? 1 : 0);
