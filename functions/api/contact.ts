/**
 * POST /api/contact on Cloudflare Pages (file-based route). All the work is in
 * netlify/functions/lib/cloudflare.ts + contact-core.ts — the same handler the Netlify function uses.
 * Bindings and variables (Pages → Settings): KV namespace RATE_LIMIT; TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID
 * and/or RESEND_API_KEY / CONTACT_TO_EMAIL / CONTACT_FROM_EMAIL; SITE_URL.
 */
import { handleCloudflare } from '../../netlify/functions/lib/cloudflare.ts';

export const onRequest = (ctx: { request: Request; env: Record<string, unknown> }): Promise<Response> => handleCloudflare(ctx.request, ctx.env);
