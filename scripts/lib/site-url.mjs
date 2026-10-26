/**
 * Single source of truth for the public site URL.
 * Used by astro.config.mjs (Astro.site, sitemap, canonical/hreflang) and by the build-time
 * generators (robots.txt, llms.txt) so every absolute URL on the site comes from the same base.
 * Resolution: SITE_URL (explicit override) → URL (set by Netlify on every build: the site's primary
 * address — the custom domain once it is made primary, the *.netlify.app address before that) →
 * the default. So a domain change needs no code change, only a redeploy.
 */
export const DEFAULT_SITE_URL = 'https://veilvex.netlify.app';

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
