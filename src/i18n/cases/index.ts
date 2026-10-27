import type { Lang } from '../types';
import type { CaseDetails } from './types';
import { ru } from './ru';
import { en } from './en';
import { az } from './az';
import { de } from './de';

export { CASE_SLUGS, CASE_META, CASE_SERVICE, casePath } from './meta';
export type { CaseSlug, CaseMeta, CaseShot } from './meta';
export type { CaseBlock, CaseDetail, CaseDetails, CaseLabels, CaseSection } from './types';

/** Case-study content per language. A Record over Lang: a missing language fails type-checking. */
export const CASE_DETAILS: Record<Lang, CaseDetails> = { ru, en, az, de };

export function getCaseDetails(lang: Lang): CaseDetails {
  return CASE_DETAILS[lang];
}
