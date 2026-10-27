/**
 * Single source of truth for the public site URL.
 * Used by astro.config.mjs (Astro.site, sitemap, canonical/hreflang) and by the build-time
 * generators (robots.txt, llms.txt) so every absolute URL on the site comes from the same base.
 * Resolution: SITE_URL (set it in the host's build variables: on Cloudflare Pages always, since Pages
 * exposes only per-deployment URLs) → URL (set by Netlify on every build) → the default (the Pages
 * project address). A domain change needs no code change, only SITE_URL and a redeploy.
 */
export const DEFAULT_SITE_URL = 'https://veilvex.pages.dev';

/** Public origin without a trailing slash, e.g. "https://veilvex.netlify.app". */
export function siteUrl() {
  const raw = (process.env.SITE_URL || process.env.URL || DEFAULT_SITE_URL).trim();
  let url;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(`SITE_URL is not a valid absolute URL: "${raw}"`);
  }
  if (!/^https?:$/.test(url.protocol)) throw new Error(`SITE_URL must be http(s): "${raw}"`);
  // the value is written into public files (robots.txt, llms.txt, sitemap, canonical) — never with credentials
  if (url.username || url.password) throw new Error('SITE_URL must not contain credentials (user:password@)');
  return url.href.replace(/\/+$/, '');
}
