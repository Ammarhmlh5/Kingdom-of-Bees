/**
 * I18n Manager
 * مدير نظام الترجمة
 */

import type {
  I18nSystem,
  I18nConfig,
  SupportedLocale,
  TranslationDictionary,
  TranslationParams,
} from './types';

/**
 * مدير الترجمة
 */
export class I18nManager implements I18nSystem {
  private currentLocale: SupportedLocale;
  private fallbackLocale: SupportedLocale;
  private translations: Record<SupportedLocale, TranslationDictionary>;
  private listeners: Set<(locale: SupportedLocale) => void> = new Set();

  constructor(config: I18nConfig) {
    this.currentLocale = config.defaultLocale;
    this.fallbackLocale = config.fallbackLocale;
    this.translations = config.translations;
  }

  setLocale(locale: SupportedLocale): void {
    if (!this.translations[locale]) {
      console.warn(`Locale ${locale} not found, using fallback`);
      locale = this.fallbackLocale;
    }

    this.currentLocale = locale;
    this.notifyListeners(locale);
  }

  getLocale(): SupportedLocale {
    return this.currentLocale;
  }

  translate(key: string, params?: TranslationParams): string {
    const translation = this.getTranslation(key, this.currentLocale);

    if (!translation) {
      console.warn(`Translation not found for key: ${key}`);
      return key;
    }

    return this.interpolate(translation, params);
  }

  translatePlural(key: string, count: number, params?: TranslationParams): string {
    const pluralKey = this.getPluralKey(key, count);
    const translation = this.getTranslation(pluralKey, this.currentLocale);

    if (!translation) {
      // Fallback to singular form
      return this.translate(key, { ...params, count });
    }

    return this.interpolate(translation, { ...params, count });
  }

  addTranslations(locale: SupportedLocale, translations: TranslationDictionary): void {
    if (!this.translations[locale]) {
      this.translations[locale] = {};
    }

    this.translations[locale] = this.mergeDeep(
      this.translations[locale],
      translations
    );
  }

  getSupportedLocales(): SupportedLocale[] {
    return Object.keys(this.translations) as SupportedLocale[];
  }

  hasTranslation(key: string, locale?: SupportedLocale): boolean {
    const targetLocale = locale || this.currentLocale;
    return this.getTranslation(key, targetLocale) !== null;
  }

  getTextDirection(): 'ltr' | 'rtl' {
    return this.currentLocale === 'ar' ? 'rtl' : 'ltr';
  }

  /**
   * الاشتراك في تغييرات اللغة
   */
  subscribe(listener: (locale: SupportedLocale) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * إشعار المستمعين بتغيير اللغة
   */
  private notifyListeners(locale: SupportedLocale): void {
    this.listeners.forEach((listener) => listener(locale));
  }

  /**
   * الحصول على الترجمة من القاموس
   */
  private getTranslation(key: string, locale: SupportedLocale): string | null {
    const keys = key.split('.');
    let current: any = this.translations[locale];

    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        // Try fallback locale
        if (locale !== this.fallbackLocale) {
          return this.getTranslation(key, this.fallbackLocale);
        }
        return null;
      }
    }

    return typeof current === 'string' ? current : null;
  }

  /**
   * استبدال المتغيرات في النص
   */
  private interpolate(text: string, params?: TranslationParams): string {
    if (!params) return text;

    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return params[key] !== undefined ? String(params[key]) : match;
    });
  }

  /**
   * الحصول على مفتاح الجمع المناسب
   */
  private getPluralKey(key: string, count: number): string {
    const locale = this.currentLocale;

    // Arabic plural rules
    if (locale === 'ar') {
      if (count === 0) return `${key}.zero`;
      if (count === 1) return `${key}.one`;
      if (count === 2) return `${key}.two`;
      if (count >= 3 && count <= 10) return `${key}.few`;
      if (count >= 11) return `${key}.many`;
      return `${key}.other`;
    }

    // English/French plural rules
    if (count === 0) return `${key}.zero`;
    if (count === 1) return `${key}.one`;
    return `${key}.other`;
  }

  /**
   * دمج عميق للكائنات
   */
  private mergeDeep(
    target: TranslationDictionary,
    source: TranslationDictionary
  ): TranslationDictionary {
    const result = { ...target };

    for (const key in source) {
      if (source[key] instanceof Object && key in target) {
        result[key] = this.mergeDeep(
          target[key] as TranslationDictionary,
          source[key] as TranslationDictionary
        );
      } else {
        result[key] = source[key];
      }
    }

    return result;
  }
}

/**
 * إنشاء مثيل I18n Manager
 */
export function createI18nManager(config: I18nConfig): I18nManager {
  return new I18nManager(config);
}
