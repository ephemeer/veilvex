/**
 * Contact form — core logic (framework-agnostic, fully unit-testable).
 *
 * Everything that touches the outside world (network, clock, environment, rate-limit storage,
 * logging) is injected through `ContactDeps`, so the handler can be exercised with fakes.
 * `netlify/functions/contact.mts` wires the real dependencies.
 *
 * Request pipeline (see SECURITY.md):
 *   method / content-type / body-size gates
 *   → same-origin check (CSRF)
 *   → strict zod schema (unknown fields rejected = anti mass-assignment, control chars stripped)
 *   → 503 when no delivery channel is configured (misconfiguration must be loud)
 *   → honeypot + timing heuristics (silent 200, nothing delivered)
 *   → sliding-window rate limit per SHA-256(ip)
 *   → delivery to Telegram and/or Resend as PLAIN TEXT with timeouts
 *   → generic error codes only; real errors go to the server log.
 */
import { z } from 'zod';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const SERVICE_IDS = ['geo', 'seo', 'ads', 'site', 'app', 'ai', 'improve', 'design', 'smm'] as const;
export const LANGS = ['ru', 'en', 'az', 'de'] as const;

export type ServiceId = (typeof SERVICE_IDS)[number];
export type Lang = (typeof LANGS)[number];

/** Hard cap on the request body (bytes). Checked against Content-Length AND the bytes actually read. */
export const MAX_BODY_BYTES = 16 * 1024;
/** Application-level sliding window defaults (override with CONTACT_RATE_LIMIT / CONTACT_RATE_WINDOW). */
export const DEFAULT_RATE_LIMIT = 5;
export const DEFAULT_RATE_WINDOW_SEC = 600;
/** Site-wide ceiling for the same window (all IPs together). */
export const DEFAULT_GLOBAL_RATE_LIMIT = 60;
/** Timing heuristics for the `t` field (epoch ms at which the form was rendered). */
export const MIN_FORM_AGE_MS = 3_000;
export const MAX_FORM_AGE_MS = 24 * 60 * 60 * 1_000;
export const MAX_FUTURE_SKEW_MS = 60_000;
/** Timeout for each outbound delivery call. */
export const OUTBOUND_TIMEOUT_MS = 8_000;

export const TELEGRAM_API_BASE = 'https://api.telegram.org';
export const RESEND_API_URL = 'https://api.resend.com/emails';

/** Extra origins accepted when running locally (astro dev, serve-secure). */
const DEV_ORIGINS = [
  'http://localhost:4321',
  'http://127.0.0.1:4321',
  'http://localhost:4322',
  'http://127.0.0.1:4322',
] as const;

/** Env vars whose values must never reach a log line or a response. */
const SECRET_ENV_KEYS = ['TELEGRAM_BOT_TOKEN', 'RESEND_API_KEY'] as const;

/** Per-field cap applied BEFORE sanitisation so regexes never run on huge strings (body is ≤ 16 KB anyway). */
const RAW_FIELD_MAX = 8_000;

// ---------------------------------------------------------------------------
// Dependency interfaces
// ---------------------------------------------------------------------------

/** Minimal storage used by the sliding window. Keys are SHA-256 hashes, values are hit timestamps (epoch ms). */
export interface RateLimitStore {
  /** Stored timestamps for the key, or `null` when nothing is stored. */
  get(key: string): Promise<number[] | null>;
  /** Replace the stored timestamps. `expiresAt` (epoch ms) lets stores expire the entry; others may ignore it. */
  set(key: string, hits: number[], expiresAt: number): Promise<void>;
}

export type LogFields = Record<string, string | number | boolean | undefined>;

export interface Logger {
  info(event: string, fields?: LogFields): void;
  warn(event: string, fields?: LogFields): void;
  error(event: string, fields?: LogFields): void;
}

export interface ContactDeps {
  fetch: typeof globalThis.fetch;
  now: () => number;
  env: Readonly<Record<string, string | undefined>>;
  store: RateLimitStore;
  log: Logger;
  /** Per-call timeout for outbound delivery requests (defaults to OUTBOUND_TIMEOUT_MS). */
  outboundTimeoutMs?: number;
}

/** Structural subset of Netlify's `Context` that the core needs. */
export interface HandlerContext {
  ip?: string;
}

export type ContactHandler = (req: Request, context?: HandlerContext) => Promise<Response>;

export type ContactErrorCode =
  | 'method_not_allowed'
  | 'unsupported_media_type'
  | 'payload_too_large'
  | 'invalid_json'
  | 'validation'
  | 'forbidden'
  | 'rate_limited'
  | 'not_configured'
  | 'delivery_failed'
  | 'server';

// ---------------------------------------------------------------------------
// Sanitisation + schema
// ---------------------------------------------------------------------------

/**
 * Characters removed from every string field: every Unicode control (Cc: C0, DEL, C1 — except
 * \t \n \r, handled by whitespace collapsing) and every format character (Cf: zero-width chars,
 * bidi embeddings/overrides/isolates, soft hyphen, word joiner, BOM, invisible TAG characters
 * U+E0000–E007F used for "ASCII smuggling", interlinear annotations…), plus the Unicode line and
 * paragraph separators.
 */
const STRIP_CHARS = /(?![\t\n\r])[\p{Cc}\p{Cf}\u034F\u2028\u2029]/gu; // U+034F (CGJ) is Mn but invisible

/** Single-line field: strip control chars, collapse all whitespace to one space, trim. */
export function sanitizeLine(input: string): string {
  return input.replace(STRIP_CHARS, '').replace(/\s+/g, ' ').trim();
}

/** Multi-line field: strip control chars, normalise newlines, collapse horizontal whitespace, max one blank line. */
export function sanitizeMultiline(input: string): string {
  return input
    .replace(STRIP_CHARS, '')
    .replace(/\r\n?/g, '\n')
    .replace(/[^\S\n]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

const lineField = (min: number, max: number) =>
  z.string().max(RAW_FIELD_MAX).transform(sanitizeLine).pipe(z.string().min(min).max(max));

/**
 * Strict object: any unknown key is rejected (anti mass-assignment), so the server never
 * accepts more than the documented contract.
 */
export const contactSchema = z.strictObject({
  name: lineField(2, 80),
  contact: lineField(5, 120),
  services: z
    .array(z.enum(SERVICE_IDS))
    .max(SERVICE_IDS.length)
    .refine((ids) => new Set(ids).size === ids.length, 'services must be unique'),
  message: z.string().max(RAW_FIELD_MAX).transform(sanitizeMultiline).pipe(z.string().max(2000)),
  consent: z.literal(true),
  lang: z.enum(LANGS),
  /** Honeypot. Any non-empty value marks the request as a bot (checked after validation). */
  website: z.string().max(RAW_FIELD_MAX),
  /** Epoch ms at which the form was rendered. */
  t: z.number().int().nonnegative(),
});

export type ContactPayload = z.output<typeof contactSchema>;

const FIELD_NAMES: ReadonlySet<string> = new Set(Object.keys(contactSchema.shape));

/** Top-level field names that failed validation (never the messages — those stay server-side). */
function validationFields(error: z.ZodError): string[] {
  const fields = new Set<string>();
  for (const issue of error.issues) {
    const head = issue.path[0];
    if (typeof head === 'string' && FIELD_NAMES.has(head)) fields.add(head);
  }
  return [...fields];
}

// ---------------------------------------------------------------------------
// Same-origin (CSRF) check
// ---------------------------------------------------------------------------

function isTruthy(value: string | undefined): boolean {
  if (!value) return false;
  const v = value.trim().toLowerCase();
  return v !== '' && v !== '0' && v !== 'false' && v !== 'no' && v !== 'off';
}

/**
 * Local-development detection. `NODE_ENV !== 'production'` only counts when `CONTEXT` is unset:
 * every deployed Netlify function has CONTEXT (production / deploy-preview / branch-deploy), and
 * the Lambda runtime does not reliably set NODE_ENV, so this keeps localhost origins out of prod.
 */
export function isDevEnvironment(env: ContactDeps['env']): boolean {
  if (isTruthy(env.NETLIFY_DEV)) return true;
  if (env.CONTEXT === 'dev') return true;
  if (env.CONTEXT) return false;
  // No CONTEXT at all: assume production unless NODE_ENV says development explicitly
  // (the local scripts set CONTEXT=dev themselves).
  return env.NODE_ENV === 'development';
}

function parseOrigin(value: string): string | null {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.origin : null;
  } catch {
    return null;
  }
}

/** Origins the browser may post from: deployed URLs (Netlify sets URL/DEPLOY_PRIME_URL/DEPLOY_URL) + SITE_URL + dev origins. */
export function allowedOrigins(env: ContactDeps['env']): ReadonlySet<string> {
  const origins = new Set<string>();
  for (const key of ['SITE_URL', 'URL', 'DEPLOY_PRIME_URL', 'DEPLOY_URL'] as const) {
    const value = env[key];
    if (!value) continue;
    const origin = parseOrigin(value.trim());
    if (origin) origins.add(origin);
  }
  if (isDevEnvironment(env)) for (const origin of DEV_ORIGINS) origins.add(origin);
  return origins;
}

type OriginCheck = { ok: true } | { ok: false; reason: 'sec_fetch_site' | 'origin' | 'missing_origin' };

/**
 * Fail-closed same-origin check. If `Sec-Fetch-Site` is present it must be `same-origin` or `none`;
 * `Origin` must be present (every browser sends it on POST) and must be an allowed origin.
 * A request without an Origin header is refused — the only legitimate client is the site's own form.
 */
export function checkOrigin(req: Request, env: ContactDeps['env']): OriginCheck {
  const site = req.headers.get('sec-fetch-site')?.trim().toLowerCase();
  if (site && site !== 'same-origin' && site !== 'none') return { ok: false, reason: 'sec_fetch_site' };

  const origin = req.headers.get('origin')?.trim();
  if (!origin) return { ok: false, reason: 'missing_origin' };
  const normalized = parseOrigin(origin);
  if (!normalized || !allowedOrigins(env).has(normalized)) return { ok: false, reason: 'origin' };
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Request helpers
// ---------------------------------------------------------------------------

function isJsonContentType(header: string | null): boolean {
  if (!header) return false;
  const mediaType = header.split(';')[0]?.trim().toLowerCase();
  return mediaType === 'application/json';
}

/** Parsed Content-Length, or null when absent / not a plain non-negative integer. */
function declaredLength(header: string | null): number | null {
  if (header === null) return null;
  const value = header.trim();
  return /^\d{1,15}$/.test(value) ? Number(value) : null;
}

type BodyRead = { ok: true; text: string } | { ok: false; reason: 'too_large' | 'invalid_encoding' };

/** Reads at most `maxBytes`; stops reading (and cancels the stream) as soon as the limit is exceeded. */
async function readBodyLimited(req: Request, maxBytes: number): Promise<BodyRead> {
  const stream = req.body;
  if (!stream) return { ok: true, text: '' };

  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel().catch(() => undefined);
      return { ok: false, reason: 'too_large' };
    }
    chunks.push(value);
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    return { ok: true, text: new TextDecoder('utf-8', { fatal: true }).decode(bytes) };
  } catch {
    return { ok: false, reason: 'invalid_encoding' };
  }
}

/** `context.ip` → `x-nf-client-connection-ip` → first `x-forwarded-for` entry → 'unknown'. */
export function clientIp(req: Request, context?: HandlerContext): string {
  const fromContext = context?.ip?.trim();
  if (fromContext) return fromContext;
  const fromNetlify = req.headers.get('x-nf-client-connection-ip')?.trim();
  if (fromNetlify) return fromNetlify;
  const forwarded = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  if (forwarded) return forwarded;
  return 'unknown';
}

/**
 * IPv6 addresses are reduced to their /64 prefix before hashing (a single subscriber usually owns a
 * whole /64, so rotating addresses inside it must not reset the rate limit). IPv4 is left as is.
 */
export function rateLimitIdentity(ip: string): string {
  if (!ip.includes(':')) return ip;
  const bare = ip.replace(/^\[|\]$/g, '').split('%')[0] ?? ip; // strip brackets / zone id
  const [head = '', tail = ''] = bare.split('::');
  const left = head ? head.split(':') : [];
  const right = tail ? tail.split(':') : [];
  const missing = Math.max(0, 8 - left.length - right.length);
  const groups = [...left, ...Array.from({ length: missing }, () => '0'), ...right];
  if (groups.length !== 8 || groups.some((g) => !/^[0-9a-fA-F]{1,4}$/.test(g))) return ip; // not parseable → use as given
  return `${groups.slice(0, 4).map((g) => g.toLowerCase().padStart(4, '0')).join(':')}::/64`;
}

/** SHA-256 hex of the IP identity — the only form in which an address is stored or logged (prefix only in logs). */
export async function hashIp(ip: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(rateLimitIdentity(ip)));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

// ---------------------------------------------------------------------------
// Rate limiting (sliding window)
// ---------------------------------------------------------------------------

export interface RateLimitSettings {
  limit: number;
  windowMs: number;
}

function positiveInt(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number(value.trim());
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function rateLimitSettings(env: ContactDeps['env']): RateLimitSettings {
  return {
    limit: positiveInt(env.CONTACT_RATE_LIMIT, DEFAULT_RATE_LIMIT),
    windowMs: positiveInt(env.CONTACT_RATE_WINDOW, DEFAULT_RATE_WINDOW_SEC) * 1_000,
  };
}

/** Site-wide ceiling (all IPs together) over the same window — caps botnets / IPv6 prefix rotation. */
export function globalRateLimitSettings(env: ContactDeps['env']): RateLimitSettings {
  return {
    limit: positiveInt(env.CONTACT_GLOBAL_RATE_LIMIT, DEFAULT_GLOBAL_RATE_LIMIT),
    windowMs: positiveInt(env.CONTACT_RATE_WINDOW, DEFAULT_RATE_WINDOW_SEC) * 1_000,
  };
}

export const GLOBAL_RATE_LIMIT_KEY = 'global';

type RateLimitResult = { allowed: true } | { allowed: false; retryAfter: number };

/**
 * Sliding window: keep the timestamps of accepted submissions inside the window; reject when the
 * window already holds `limit` of them. Rejected requests are not recorded (they do not extend the
 * block). Store failures fail OPEN (logged) — the platform-level rateLimit in `config` still applies.
 */
async function applyRateLimit(deps: ContactDeps, key: string, now: number, settings: RateLimitSettings = rateLimitSettings(deps.env)): Promise<RateLimitResult> {
  const { limit, windowMs } = settings;
  const windowStart = now - windowMs;

  let hits: number[];
  try {
    const stored = await deps.store.get(key);
    hits = (stored ?? []).filter((ts) => typeof ts === 'number' && Number.isFinite(ts) && ts > windowStart);
  } catch (err) {
    deps.log.error('rate_limit_store_read_failed', describeError(err, []));
    return { allowed: true };
  }

  if (hits.length >= limit) {
    const oldest = Math.min(...hits);
    const retryAfter = Math.max(1, Math.ceil((oldest + windowMs - now) / 1_000));
    return { allowed: false, retryAfter };
  }

  hits.push(now);
  try {
    await deps.store.set(key, hits.slice(-limit), now + windowMs);
  } catch (err) {
    deps.log.error('rate_limit_store_write_failed', describeError(err, []));
  }
  return { allowed: true };
}

/** In-memory store (single instance only): local dev, tests and the fallback when Netlify Blobs is unavailable. */
export function createMemoryStore(now: () => number = () => Date.now()): RateLimitStore & { size(): number } {
  const entries = new Map<string, { hits: number[]; expiresAt: number }>();
  let writes = 0;
  const sweep = (): void => {
    const current = now();
    for (const [key, entry] of entries) if (entry.expiresAt <= current) entries.delete(key);
  };
  return {
    async get(key) {
      const entry = entries.get(key);
      if (!entry) return null;
      if (entry.expiresAt <= now()) {
        entries.delete(key);
        return null;
      }
      return [...entry.hits];
    },
    async set(key, hits, expiresAt) {
      entries.set(key, { hits: [...hits], expiresAt });
      writes += 1;
      if (writes % 256 === 0 || entries.size > 10_000) sweep();
    },
    size: () => entries.size,
  };
}

// ---------------------------------------------------------------------------
// Bot heuristics
// ---------------------------------------------------------------------------

export type BotReason = 'honeypot' | 'future_timestamp' | 'too_fast' | 'stale_form';

export function botReason(payload: ContactPayload, now: number): BotReason | null {
  if (payload.website !== '') return 'honeypot';
  if (payload.t > now + MAX_FUTURE_SKEW_MS) return 'future_timestamp';
  const age = now - payload.t;
  if (age < MIN_FORM_AGE_MS) return 'too_fast';
  if (age > MAX_FORM_AGE_MS) return 'stale_form';
  return null;
}

// ---------------------------------------------------------------------------
// Message text (plain text only — never HTML, never Markdown)
// ---------------------------------------------------------------------------

interface Labels {
  title: string;
  name: string;
  contact: string;
  services: string;
  task: string;
  none: string;
}

const LABELS: Record<Lang, Labels> = {
  ru: { title: 'Новая заявка с сайта Veilvex', name: 'Имя', contact: 'Контакт', services: 'Услуги', task: 'Задача', none: '—' },
  en: { title: 'New request from the Veilvex website', name: 'Name', contact: 'Contact', services: 'Services', task: 'Task', none: '—' },
  az: { title: 'Veilvex saytından yeni müraciət', name: 'Ad', contact: 'Əlaqə', services: 'Xidmətlər', task: 'Tapşırıq', none: '—' },
  de: { title: 'Neue Anfrage über die Veilvex-Website', name: 'Name', contact: 'Kontakt', services: 'Leistungen', task: 'Aufgabe', none: '—' },
};

const SERVICE_LABELS: Record<ServiceId, string> = {
  geo: 'GEO',
  seo: 'SEO',
  ads: 'Ads',
  site: 'Website',
  app: 'App',
  ai: 'AI automation',
  improve: 'Website improvement',
  design: 'UI/UX & branding',
  smm: 'SMM',
};

/** Fixed template; user fields are already sanitised and are inserted as plain text only. */
export function buildMessageText(payload: ContactPayload, now: number): string {
  const l = LABELS[payload.lang];
  const services =
    payload.services.length > 0 ? payload.services.map((id) => SERVICE_LABELS[id]).join(', ') : l.none;
  // The free-text message comes LAST and every line is quoted with "> ", so a message that imitates
  // the fixed fields or the footer ("Контакт: …", "lang=…") is visibly part of the quote.
  const quoted = (payload.message || l.none).split('\n').map((line) => `> ${line}`);
  return [
    l.title,
    '',
    `${l.name}: ${payload.name}`,
    `${l.contact}: ${payload.contact}`,
    `${l.services}: ${services}`,
    `lang=${payload.lang} · ${new Date(now).toISOString()}`,
    '',
    `${l.task}:`,
    ...quoted,
  ].join('\n');
}

// ---------------------------------------------------------------------------
// Delivery channels
// ---------------------------------------------------------------------------

type ChannelName = 'telegram' | 'resend';

interface Channel {
  name: ChannelName;
  send(text: string, payload: ContactPayload): Promise<void>;
}

class DeliveryError extends Error {
  channel: ChannelName;
  status: number | undefined;
  detail: string | undefined;

  constructor(channel: ChannelName, message: string, status?: number, detail?: string) {
    super(message);
    this.name = 'DeliveryError';
    this.channel = channel;
    this.status = status;
    this.detail = detail;
  }
}

async function fetchWithTimeout(deps: ContactDeps, url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), deps.outboundTimeoutMs ?? OUTBOUND_TIMEOUT_MS);
  try {
    return await deps.fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function responseSnippet(res: Response): Promise<string | undefined> {
  try {
    return (await res.text()).slice(0, 200);
  } catch {
    return undefined;
  }
}

async function sendTelegram(deps: ContactDeps, token: string, chatId: string, text: string): Promise<void> {
  const res = await fetchWithTimeout(deps, `${TELEGRAM_API_BASE}/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    // No parse_mode on purpose: the text is delivered verbatim, so user input can never become markup.
    body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
  });
  if (!res.ok) throw new DeliveryError('telegram', `telegram responded ${res.status}`, res.status, await responseSnippet(res));
}

interface ResendConfig {
  apiKey: string;
  to: string;
  from: string;
}

async function sendResend(deps: ContactDeps, cfg: ResendConfig, text: string, payload: ContactPayload): Promise<void> {
  const res = await fetchWithTimeout(deps, RESEND_API_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${cfg.apiKey}` },
    // Plain-text email only (no `html` field).
    body: JSON.stringify({ from: cfg.from, to: [cfg.to], subject: `${LABELS[payload.lang].title}: ${payload.name}`, text }),
  });
  if (!res.ok) throw new DeliveryError('resend', `resend responded ${res.status}`, res.status, await responseSnippet(res));
}

/** Channels are enabled purely by env presence. */
export function configuredChannels(deps: ContactDeps): Channel[] {
  const { env } = deps;
  const channels: Channel[] = [];

  const token = env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = env.TELEGRAM_CHAT_ID?.trim();
  if (token && chatId) {
    if (/^\d+:[\w-]{30,}$/.test(token) && /^-?\d+$/.test(chatId)) {
      channels.push({ name: 'telegram', send: (text) => sendTelegram(deps, token, chatId, text) });
    } else {
      deps.log.error('telegram_env_malformed', { token: token.length > 0, chatId: chatId.length > 0 });
    }
  }

  const apiKey = env.RESEND_API_KEY?.trim();
  const to = env.CONTACT_TO_EMAIL?.trim();
  const from = env.CONTACT_FROM_EMAIL?.trim();
  if (apiKey && to && from) {
    channels.push({ name: 'resend', send: (text, payload) => sendResend(deps, { apiKey, to, from }, text, payload) });
  }
  return channels;
}

// ---------------------------------------------------------------------------
// Logging helpers (never user content, never secrets)
// ---------------------------------------------------------------------------

/** Removes secrets from free-form text before it is logged. Also masks any Telegram bot URL. */
export function redact(text: string, secrets: readonly string[]): string {
  let out = text.replace(/\/bot[^/\s]+\//g, '/bot[redacted]/');
  for (const secret of secrets) if (secret.length >= 4) out = out.split(secret).join('[redacted]');
  return out;
}

function secretsOf(env: ContactDeps['env']): string[] {
  return SECRET_ENV_KEYS.map((key) => env[key]).filter((v): v is string => typeof v === 'string' && v.length > 0);
}

function describeError(err: unknown, secrets: readonly string[]): LogFields {
  if (err instanceof DeliveryError) {
    return { error: err.name, status: err.status, detail: err.detail ? redact(err.detail, secrets) : undefined };
  }
  if (err instanceof Error) {
    const name = err.name === 'AbortError' || err.name === 'TimeoutError' ? 'timeout' : err.name;
    return { error: name, message: redact(err.message, secrets).slice(0, 300) };
  }
  return { error: 'unknown', message: redact(String(err), secrets).slice(0, 300) };
}

// ---------------------------------------------------------------------------
// Responses
// ---------------------------------------------------------------------------

/** Same-origin API: no CORS headers, ever. */
const BASE_HEADERS: Readonly<Record<string, string>> = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
  'x-content-type-options': 'nosniff',
  'x-robots-tag': 'noindex',
};

function json(status: number, body: Record<string, unknown>, extraHeaders?: Record<string, string>): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...BASE_HEADERS, ...extraHeaders } });
}

function fail(status: number, error: ContactErrorCode, extraHeaders?: Record<string, string>): Response {
  return json(status, { ok: false, error }, extraHeaders);
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

async function handle(deps: ContactDeps, req: Request, context: HandlerContext | undefined): Promise<Response> {
  const { env, log } = deps;

  if (req.method !== 'POST') {
    log.info('contact_rejected', { status: 405, reason: 'method', method: req.method });
    return fail(405, 'method_not_allowed', { allow: 'POST' });
  }
  if (!isJsonContentType(req.headers.get('content-type'))) {
    log.info('contact_rejected', { status: 415, reason: 'content_type' });
    return fail(415, 'unsupported_media_type');
  }
  const declared = declaredLength(req.headers.get('content-length'));
  if (declared !== null && declared > MAX_BODY_BYTES) {
    log.info('contact_rejected', { status: 413, reason: 'content_length', declared });
    return fail(413, 'payload_too_large');
  }

  const now = deps.now();
  const ipHash = await hashIp(clientIp(req, context));
  const ip = ipHash.slice(0, 8); // only a hash prefix ever reaches the logs

  const origin = checkOrigin(req, env);
  if (!origin.ok) {
    log.warn('contact_rejected', { status: 403, reason: origin.reason, ip });
    return fail(403, 'forbidden');
  }

  const body = await readBodyLimited(req, MAX_BODY_BYTES);
  if (!body.ok) {
    if (body.reason === 'too_large') {
      log.info('contact_rejected', { status: 413, reason: 'body_size', ip });
      return fail(413, 'payload_too_large');
    }
    log.info('contact_rejected', { status: 400, reason: 'encoding', ip });
    return fail(400, 'invalid_json');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(body.text);
  } catch {
    log.info('contact_rejected', { status: 400, reason: 'json', ip });
    return fail(400, 'invalid_json');
  }

  const result = contactSchema.safeParse(parsed);
  if (!result.success) {
    const fields = validationFields(result.error);
    log.info('contact_rejected', { status: 400, reason: 'validation', fields: fields.join(','), ip });
    return json(400, { ok: false, error: 'validation', fields });
  }
  const payload = result.data;

  // Misconfiguration is reported before the bot heuristics, so a deploy without env vars (or
  // `npm run api:dev` without .env) fails loudly instead of silently "accepting" everything.
  const channels = configuredChannels(deps);
  if (channels.length === 0) {
    log.error('contact_not_configured', {
      hint: 'set TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID and/or RESEND_API_KEY + CONTACT_TO_EMAIL + CONTACT_FROM_EMAIL',
    });
    return fail(503, 'not_configured');
  }

  const bot = botReason(payload, now);
  if (bot) {
    // Silent drop: the bot sees a success and learns nothing, and does not consume the rate-limit budget.
    log.info('bot_dropped', { reason: bot, ip });
    return json(200, { ok: true });
  }

  const limit = await applyRateLimit(deps, ipHash, now);
  if (!limit.allowed) {
    log.warn('rate_limited', { ip, retryAfter: limit.retryAfter });
    return json(429, { ok: false, error: 'rate_limited', retryAfter: limit.retryAfter }, { 'retry-after': String(limit.retryAfter) });
  }
  const globalLimit = await applyRateLimit(deps, GLOBAL_RATE_LIMIT_KEY, now, globalRateLimitSettings(env));
  if (!globalLimit.allowed) {
    log.warn('rate_limited', { ip, scope: 'global', retryAfter: globalLimit.retryAfter });
    return json(429, { ok: false, error: 'rate_limited', retryAfter: globalLimit.retryAfter }, { 'retry-after': String(globalLimit.retryAfter) });
  }

  const text = buildMessageText(payload, now);
  const secrets = secretsOf(env);
  const results = await Promise.allSettled(channels.map((channel) => channel.send(text, payload)));

  const delivered: ChannelName[] = [];
  channels.forEach((channel, index) => {
    const outcome = results[index];
    if (!outcome) return;
    if (outcome.status === 'fulfilled') {
      delivered.push(channel.name);
      log.info('delivery_ok', { channel: channel.name, ip });
    } else {
      log.error('delivery_failed', { channel: channel.name, ip, ...describeError(outcome.reason, secrets) });
    }
  });

  if (delivered.length === 0) return fail(502, 'delivery_failed');

  log.info('contact_delivered', { ip, channels: delivered.join(','), lang: payload.lang, services: payload.services.length });
  return json(200, { ok: true });
}

/**
 * Builds the request handler. Every failure inside the pipeline is caught here: the client only
 * ever sees `{ ok: false, error: 'server' }`, the real error (with secrets redacted) goes to the log.
 */
export function createContactHandler(deps: ContactDeps): ContactHandler {
  return async (req, context) => {
    try {
      return await handle(deps, req, context);
    } catch (err) {
      deps.log.error('contact_unhandled_error', describeError(err, secretsOf(deps.env)));
      return fail(500, 'server');
    }
  };
}
