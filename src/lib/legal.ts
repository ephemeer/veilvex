/**
 * Legal pages (privacy policy, terms of cooperation): one edition date and the paths for every language.
 * LegalPage.astro formats the date per locale; scripts/gen-llms.mjs prints it as is.
 * Bump LEGAL_UPDATED together with any change of the legal text in src/i18n/*.ts.
 */
export const LEGAL_UPDATED = '2026-10-27';

/** Page paths without the language prefix (build the URL with localePath). */
export const LEGAL_PATHS = { privacy: '/privacy', terms: '/terms' } as const;

export type LegalDocId = keyof typeof LEGAL_PATHS;
