/**
 * I18n System Types
 * أنواع نظام الترجمة
 */

/**
 * اللغات المدعومة
 */
export type SupportedLocale = 'ar' | 'en' | 'fr';

/**
 * نص متعدد اللغات
 */
export interface LocalizedString {
  ar: string;
  en: string;
  fr?: string;
}

/**
 * قاموس الترجمة
 */
export interface TranslationDictionary {
  [key: string]: string | TranslationDictionary;
}

/**
 * معاملات الترجمة
 */
export interface TranslationParams {
  [key: string]: string | number;
}

/**
 * خيارات الجمع
 */
export interface PluralOptions {
  zero?: string;
  one?: string;
  two?: string;
  few?: string;
  many?: string;
  other: string;
}

/**
 * تكوين I18n
 */
export interface I18nConfig {
  defaultLocale: SupportedLocale;
  fallbackLocale: SupportedLocale;
  translations: Record<SupportedLocale, TranslationDictionary>;
}

/**
 * واجهة نظام I18n
 */
export interface I18nSystem {
  /**
   * تعيين اللغة الحالية
   */
  setLocale(locale: SupportedLocale): void;

  /**
   * الحصول على اللغة الحالية
   */
  getLocale(): SupportedLocale;

  /**
   * ترجمة مفتاح
   */
  translate(key: string, params?: TranslationParams): string;

  /**
   * ترجمة مع دعم الجمع
   */
  translatePlural(key: string, count: number, params?: TranslationParams): string;

  /**
   * إضافة ترجمات جديدة
   */
  addTranslations(locale: SupportedLocale, translations: TranslationDictionary): void;

  /**
   * الحصول على جميع اللغات المدعومة
   */
  getSupportedLocales(): SupportedLocale[];

  /**
   * التحقق من وجود ترجمة
   */
  hasTranslation(key: string, locale?: SupportedLocale): boolean;

  /**
   * الحصول على اتجاه النص
   */
  getTextDirection(): 'ltr' | 'rtl';
}

/**
 * دالة مساعدة لإنشاء نص متعدد اللغات
 */
export function createLocalizedString(
  ar: string,
  en: string,
  fr?: string
): LocalizedString {
  return {
    ar,
    en,
    ...(fr && { fr }),
  };
}

/**
 * دالة مساعدة للحصول على النص بلغة معينة
 */
export function getLocalizedText(
  text: LocalizedString | string,
  locale: SupportedLocale
): string {
  if (typeof text === 'string') {
    return text;
  }

  return text[locale] || text.en || text.ar;
}
