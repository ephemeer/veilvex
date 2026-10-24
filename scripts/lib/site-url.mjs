/**
 * Single source of truth for the public site URL.
 * Used by astro.config.mjs (Astro.site, sitemap, canonical/hreflang) and by the build-time
 * generators (robots.txt, llms.txt) so every absolute URL on the site comes from the same base.
 * Override with SITE_URL at build time (Netlify → Environment variables).
 */
export const DEFAULT_SITE_URL = 'https://veilvex.netlify.app';

/** Public origin without a trailing slash, e.g. "https://veilvex.netlify.app". */
export function siteUrl() {
  const raw = (process.env.SITE_URL || DEFAULT_SITE_URL).trim();
  let url;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(`SITE_URL is not a valid absolute URL: "${raw}"`);
  }
  if (!/^https?:$/.test(url.protocol)) throw new Error(`SITE_URL must be http(s): "${raw}"`);
  return url.href.replace(/\/+$/, '');
}
