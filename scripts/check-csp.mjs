#!/usr/bin/env node
/**
 * Verifies that every inline <script> in dist/ is allowed by the CSP in netlify.toml
 * (sha256 hash present) and that no inline style attributes / <style> tags exist.
 * Run after `npm run build`.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const dist = path.resolve('dist');
const toml = fs.readFileSync(path.resolve('netlify.toml'), 'utf8');
const csp = toml.match(/Content-Security-Policy\s*=\s*"([^"]+)"/)?.[1] ?? '';
const allowed = new Set([...csp.matchAll(/'sha256-([^']+)'/g)].map((m) => m[1]));
let problems = 0;
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? walk(path.join(dir, d.name)) : d.name.endsWith('.html') ? [path.join(dir, d.name)] : []));
for (const file of walk(dist)) {
  const html = fs.readFileSync(file, 'utf8');
  for (const m of html.matchAll(/<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/g)) {
    const hash = crypto.createHash('sha256').update(m[1]).digest('base64');
    if (!allowed.has(hash)) { problems++; console.log(`✗ ${path.relative(dist, file)}: inline script not in CSP (sha256-${hash}): ${m[1].slice(0, 60)}`); }
  }
  if (/<style[\s>]/.test(html)) { problems++; console.log(`✗ ${path.relative(dist, file)}: inline <style> found (CSP style-src 'self' would block it)`); }
  for (const m of html.matchAll(/\sstyle="[^"]*"/g)) { problems++; console.log(`✗ ${path.relative(dist, file)}: inline style attribute: ${m[0].slice(0, 60)}`); }
}
console.log(problems ? `${problems} CSP problem(s)` : `CSP OK — ${allowed.size} hashed inline script(s), no inline styles`);
process.exit(problems ? 1 : 0);
