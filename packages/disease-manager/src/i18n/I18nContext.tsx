/**
 * I18n React Context
 * سياق React للترجمة
 */

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import type { I18nManager } from './I18nManager';
import type { SupportedLocale, TranslationParams } from './types';
import { createDefaultI18n } from './index';

/**
 * واجهة سياق I18n
 */
interface I18nContextValue {
  /**
   * مدير الترجمة
   */
  i18n: I18nManager;

  /**
   * اللغة الحالية
   */
  locale: SupportedLocale;

  /**
   * تغيير اللغة
   */
  setLocale: (locale: SupportedLocale) => void;

  /**
   * دالة الترجمة
   */
  t: (key: string, params?: TranslationParams) => string;

  /**
   * دالة الترجمة مع الجمع
   */
  tPlural: (key: string, count: number, params?: TranslationParams) => string;

  /**
   * اتجاه النص
   */
  direction: 'ltr' | 'rtl';
}

/**
 * سياق I18n
 */
const I18nContext = createContext<I18nContextValue | undefined>(undefined);

/**
 * خصائص I18nProvider
 */
interface I18nProviderProps {
  /**
   * مدير I18n (اختياري - سيتم إنشاء واحد افتراضي)
   */
  i18n?: I18nManager;

  /**
   * اللغة الافتراضية (اختياري)
   */
  defaultLocale?: SupportedLocale;

  /**
   * المكونات الفرعية
   */
  children: React.ReactNode;
}

/**
 * مزود سياق I18n
 */
export function I18nProvider({
  i18n: providedI18n,
  defaultLocale,
  children,
}: I18nProviderProps): JSX.Element {
  // إنشاء أو استخدام مدير I18n المقدم
  const i18n = useMemo(() => {
    if (providedI18n) {
      return providedI18n;
    }
    const instance = createDefaultI18n();
    if (defaultLocale) {
      instance.setLocale(defaultLocale);
    }
    return instance;
  }, [providedI18n, defaultLocale]);

  // حالة اللغة الحالية
  const [locale, setLocaleState] = useState<SupportedLocale>(i18n.getLocale());

  // حالة اتجاه النص
  const [direction, setDirection] = useState<'ltr' | 'rtl'>(i18n.getTextDirection());

  // تغيير اللغة
  const setLocale = (newLocale: SupportedLocale) => {
    i18n.setLocale(newLocale);
    setLocaleState(newLocale);
    setDirection(i18n.getTextDirection());
  };

  // الاشتراك في تغييرات اللغة
  useEffect(() => {
    const unsubscribe = i18n.subscribe((newLocale) => {
      setLocaleState(newLocale);
      setDirection(i18n.getTextDirection());
    });

    return unsubscribe;
  }, [i18n]);

  // دالة الترجمة
  const t = (key: string, params?: TranslationParams): string => {
    return i18n.translate(key, params);
  };

  // دالة الترجمة مع الجمع
  const tPlural = (key: string, count: number, params?: TranslationParams): string => {
    return i18n.translatePlural(key, count, params);
  };

  // قيمة السياق
  const value: I18nContextValue = useMemo(
    () => ({
      i18n,
      locale,
      setLocale,
      t,
      tPlural,
      direction,
    }),
    [i18n, locale, direction]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/**
 * Hook للوصول إلى سياق I18n
 */
export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }

  return context;
}

/**
 * Hook للترجمة (اختصار)
 */
export function useTranslation() {
  const { t, tPlural, locale, direction } = useI18n();

  return {
    t,
    tPlural,
    locale,
    direction,
  };
}

/**
 * Hook للحصول على اللغة الحالية
 */
export function useLocale(): [SupportedLocale, (locale: SupportedLocale) => void] {
  const { locale, setLocale } = useI18n();
  return [locale, setLocale];
}

/**
 * Hook للحصول على اتجاه النص
 */
export function useTextDirection(): 'ltr' | 'rtl' {
  const { direction } = useI18n();
  return direction;
}
