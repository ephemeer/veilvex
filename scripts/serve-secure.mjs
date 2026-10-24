#!/usr/bin/env node
/**
 * Serves ./dist with the same response headers Netlify applies (parsed from netlify.toml), so the
 * strict CSP can be checked locally: `npm run build && npm run serve:secure` → http://127.0.0.1:4322
 *
 * Also mounts the contact function at its route (/api/contact) exactly like scripts/dev-api.mjs,
 * so the form can be submitted end-to-end. Only files inside dist/ are ever served.
 */
import { promises as fs, readFileSync } from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadContactFunction, loadDotEnv, serveFunction } from './lib/function-host.mjs';
import { headersForPath, parseNetlifyHeaders } from './lib/netlify-headers.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const HOST = '127.0.0.1';
// local scripts run in the dev context (localhost origins accepted); override with CONTEXT=production to test prod rules
process.env.CONTEXT ??= 'dev';
const PORT = Number.parseInt(process.env.PORT ?? '4322', 10);

/** @type {Record<string, string>} */
const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.pdf': 'application/pdf',
};

const envCount = loadDotEnv(path.join(ROOT, '.env'));
const rules = parseNetlifyHeaders(readFileSync(path.join(ROOT, 'netlify.toml'), 'utf8'));
const { handler, routePath } = await loadContactFunction(ROOT);

let distReal;
try {
  distReal = await fs.realpath(DIST);
} catch {
  console.error(`[serve-secure] ${DIST} does not exist — run "npm run build" first.`);
  process.exit(1);
}

function contentTypeFor(file) {
  return CONTENT_TYPES[path.extname(file).toLowerCase()] ?? 'application/octet-stream';
}

function isInsideDist(file) {
  return file === distReal || file.startsWith(distReal + path.sep);
}

/**
 * Maps a URL path to a file inside dist/ (directory → index.html, `/page` → page.html).
 * Returns null when nothing matches; throws 'forbidden' when the path escapes dist/.
 */
async function resolveStatic(pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  if (decoded.includes('\0')) return null;

  const normalized = path.posix.normalize('/' + decoded); // collapses ../ segments
  const target = path.resolve(distReal, '.' + normalized);
  if (!isInsideDist(target)) throw new Error('forbidden');

  const candidates = [target, path.join(target, 'index.html'), `${target}.html`];
  for (const candidate of candidates) {
    try {
      const stat = await fs.stat(candidate);
      if (!stat.isFile()) continue;
      const real = await fs.realpath(candidate); // symlinks must also stay inside dist/
      if (!isInsideDist(real)) throw new Error('forbidden');
      return real;
    } catch (err) {
      if (err instanceof Error && err.message === 'forbidden') throw err;
    }
  }
  return null;
}

function send(res, status, pathname, body, contentType) {
  const headers = {};
  for (const [name, value] of Object.entries(headersForPath(rules, pathname))) headers[name.toLowerCase()] = value;
  headers['content-type'] = contentType;
  headers['content-length'] = String(body.byteLength);
  res.writeHead(status, headers);
  res.end(body);
}

async function notFound(res, pathname) {
  try {
    const page = await fs.readFile(path.join(distReal, '404.html'));
    send(res, 404, pathname, page, CONTENT_TYPES['.html']);
  } catch {
    send(res, 404, pathname, Buffer.from('Not found'), CONTENT_TYPES['.txt']);
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? `${HOST}:${PORT}`}`);
  const pathname = url.pathname;

  if (pathname === routePath) {
    await serveFunction(handler, req, res, headersForPath(rules, pathname));
    return;
  }

  const method = req.method ?? 'GET';
  if (method !== 'GET' && method !== 'HEAD') {
    res.writeHead(405, { allow: 'GET, HEAD', 'content-type': 'text/plain; charset=utf-8' });
    res.end('Method Not Allowed');
    return;
  }

  try {
    const file = await resolveStatic(pathname);
    if (!file) {
      await notFound(res, pathname);
      return;
    }
    const body = method === 'HEAD' ? Buffer.alloc(0) : await fs.readFile(file);
    const headers = {};
    for (const [name, value] of Object.entries(headersForPath(rules, pathname))) headers[name.toLowerCase()] = value;
    headers['content-type'] = contentTypeFor(file);
    if (method === 'HEAD') headers['content-length'] = String((await fs.stat(file)).size);
    else headers['content-length'] = String(body.byteLength);
    res.writeHead(200, headers);
    res.end(body);
  } catch (err) {
    if (err instanceof Error && err.message === 'forbidden') {
      send(res, 403, pathname, Buffer.from('Forbidden'), CONTENT_TYPES['.txt']);
      return;
    }
    console.error('[serve-secure] error:', err instanceof Error ? err.message : err);
    send(res, 500, pathname, Buffer.from('Internal Server Error'), CONTENT_TYPES['.txt']);
  }
});

server.listen(PORT, HOST, () => {
  console.log(
    `[serve-secure] serving ${path.relative(ROOT, distReal)}/ → http://${HOST}:${PORT} ` +
      `(${rules.length} header rule(s) from netlify.toml, function at ${routePath}, .env: ${envCount} variable(s))`,
  );
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 500).unref();
  });
}
