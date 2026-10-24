/**
 * Minimal host for the Netlify Functions v2 handler in plain Node (no Netlify CLI needed).
 * Shared by scripts/dev-api.mjs and scripts/serve-secure.mjs.
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import { pathToFileURL } from 'node:url';

/**
 * Loads KEY=VALUE pairs from a .env file into process.env (existing variables win).
 * Supports comments, blank lines, `export KEY=…`, single/double quotes and trailing ` # comments`.
 * @param {string} file
 * @returns {number} number of variables set
 */
export function loadDotEnv(file) {
  if (!existsSync(file)) return 0;
  let count = 0;
  for (const rawLine of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const match = /^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(line);
    if (!match) continue;
    const key = match[1];
    let value = (match[2] ?? '').trim();
    if ((value.startsWith('"') && value.endsWith('"') && value.length >= 2) || (value.startsWith("'") && value.endsWith("'") && value.length >= 2)) {
      value = value.slice(1, -1);
    } else {
      const comment = value.indexOf(' #');
      if (comment !== -1) value = value.slice(0, comment).trim();
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
      count += 1;
    }
  }
  return count;
}

/**
 * Imports netlify/functions/contact.mts (Node strips the types natively).
 * @param {string} rootDir project root
 */
export async function loadContactFunction(rootDir) {
  const file = path.join(rootDir, 'netlify', 'functions', 'contact.mts');
  const mod = await import(pathToFileURL(file).href);
  if (typeof mod.default !== 'function') throw new Error(`${file} has no default export`);
  /** @type {string} */
  const routePath = typeof mod.config?.path === 'string' ? mod.config.path : '/api/contact';
  return { handler: mod.default, routePath };
}

/**
 * Converts a Node IncomingMessage into a Fetch Request (method, all headers, streamed body, full URL).
 * @param {import('node:http').IncomingMessage} req
 * @param {string} [protocol]
 */
export function toWebRequest(req, protocol = 'http') {
  const host = req.headers.host ?? '127.0.0.1';
  const url = new URL(req.url ?? '/', `${protocol}://${host}`);
  const headers = new Headers();
  for (let i = 0; i + 1 < req.rawHeaders.length; i += 2) headers.append(req.rawHeaders[i], req.rawHeaders[i + 1]);
  const method = (req.method ?? 'GET').toUpperCase();
  const hasBody = method !== 'GET' && method !== 'HEAD';
  /** @type {RequestInit & { duplex?: 'half' }} */
  const init = { method, headers };
  if (hasBody) {
    init.body = Readable.toWeb(req);
    init.duplex = 'half';
  }
  return new Request(url, init);
}

/**
 * Writes a Fetch Response to a Node ServerResponse. `baseHeaders` are applied first; headers set by
 * the function override them (case-insensitively).
 * @param {import('node:http').ServerResponse} res
 * @param {Response} response
 * @param {Record<string, string>} [baseHeaders]
 */
export async function writeWebResponse(res, response, baseHeaders = {}) {
  /** @type {Record<string, string>} */
  const headers = {};
  for (const [name, value] of Object.entries(baseHeaders)) headers[name.toLowerCase()] = value;
  for (const [name, value] of response.headers) headers[name.toLowerCase()] = value;
  const body = Buffer.from(await response.arrayBuffer());
  headers['content-length'] = String(body.byteLength);
  res.writeHead(response.status, headers);
  res.end(body);
}

/**
 * The function only needs `ip` from Netlify's context; everything else is left empty.
 * @param {import('node:net').Socket | undefined} socket
 */
export function fakeContext(socket) {
  return { ip: socket?.remoteAddress ?? '127.0.0.1', site: {} };
}

/**
 * Runs the contact function for one HTTP exchange. Never throws: a crash becomes a generic 500.
 * @param {(req: Request, context: unknown) => Promise<Response>} handler
 * @param {import('node:http').IncomingMessage} req
 * @param {import('node:http').ServerResponse} res
 * @param {Record<string, string>} [baseHeaders]
 */
export async function serveFunction(handler, req, res, baseHeaders = {}) {
  try {
    const response = await handler(toWebRequest(req), fakeContext(req.socket));
    await writeWebResponse(res, response, baseHeaders);
  } catch (err) {
    console.error('[function-host] handler crashed:', err instanceof Error ? err.message : err);
    if (!res.headersSent) {
      res.writeHead(500, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
    }
    res.end('{"ok":false,"error":"server"}');
  }
}
