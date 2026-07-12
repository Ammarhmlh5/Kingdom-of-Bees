/**
 * I18n System
 * نظام الترجمة
 */

// Export types
export type {
  SupportedLocale,
  LocalizedString,
  TranslationDictionary,
  TranslationParams,
  PluralOptions,
  I18nConfig,
  I18nSystem,
} from './types';

// Export utilities
export { createLocalizedString, getLocalizedText } from './types';

// Export I18n Manager
export { I18nManager, createI18nManager } from './I18nManager';

// Export translations
export { translations, ar, en, fr } from './translations';

// Export React Context and Hooks
export {
  I18nProvider,
  useI18n,
  useTranslation,
  useLocale,
  useTextDirection,
} from './I18nContext';

// Export default I18n instance factory
import { createI18nManager } from './I18nManager';
import { translations } from './translations';
import type { I18nManager } from './I18nManager';

/**
 * إنشاء مثيل I18n افتراضي
 */
export function createDefaultI18n(): I18nManager {
  return createI18nManager({
    defaultLocale: 'ar',
    fallbackLocale: 'en',
    translations,
  });
}
