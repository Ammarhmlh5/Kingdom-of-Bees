/**
 * Translations Index
 * فهرس الترجمات
 */

import { ar } from './ar';
import { en } from './en';
import { fr } from './fr';
import type { SupportedLocale, TranslationDictionary } from '../types';

/**
 * جميع الترجمات المتاحة
 */
export const translations: Record<SupportedLocale, TranslationDictionary> = {
  ar,
  en,
  fr,
};

/**
 * تصدير الترجمات الفردية
 */
export { ar, en, fr };
