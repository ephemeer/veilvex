#!/usr/bin/env node
/**
 * Local harness for the contact function: `npm run api:dev` (port 8788, 127.0.0.1).
 * `astro dev` proxies /api/* here (see astro.config.mjs). Reads .env from the project root.
 */
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadContactFunction, loadDotEnv, serveFunction } from './lib/function-host.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const HOST = '127.0.0.1';
// local scripts run in the dev context (localhost origins accepted); override with CONTEXT=production to test prod rules
process.env.CONTEXT ??= 'dev';
const PORT = Number.parseInt(process.env.API_DEV_PORT ?? '8788', 10);

const envCount = loadDotEnv(path.join(ROOT, '.env'));
const { handler, routePath } = await loadContactFunction(ROOT);

const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? `${HOST}:${PORT}`}`);
  if (url.pathname !== routePath) {
    res.writeHead(404, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
    res.end('{"ok":false,"error":"not_found"}');
    return;
  }
  void serveFunction(handler, req, res);
});

server.listen(PORT, HOST, () => {
  console.log(`[dev-api] contact function → http://${HOST}:${PORT}${routePath} (.env: ${envCount} variable(s) loaded)`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 500).unref();
  });
}
