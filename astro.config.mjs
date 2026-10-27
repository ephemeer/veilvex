// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { siteUrl } from './scripts/lib/site-url.mjs';

// Public URL of the deployed site. Override with SITE_URL at build time.
// Shared with the robots.txt / llms.txt generators so every absolute URL uses the same base.
const site = siteUrl();

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'ignore',
  compressHTML: true,
  build: {
    // Keep ALL styles in external files so the strict CSP (style-src 'self') holds.
    inlineStylesheets: 'never',
  },
  i18n: {
    defaultLocale: 'en',
    locales: ['ru', 'en', 'az', 'de'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: { ru: 'ru', en: 'en', az: 'az', de: 'de' },
      },
    }),
  ],
  vite: {
    server: {
      // Local dev: forward /api/* to the function harness (npm run api:dev)
      proxy: {
        '/api': { target: 'http://127.0.0.1:8788', changeOrigin: false },
      },
    },
  },
});
