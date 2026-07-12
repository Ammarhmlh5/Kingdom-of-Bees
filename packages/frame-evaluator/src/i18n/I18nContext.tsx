import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Language, Translations, translations } from './translations';

interface I18nContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  isRTL: boolean;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export interface I18nProviderProps {
  children: ReactNode;
  initialLanguage?: Language;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({
  children,
  initialLanguage = 'ar',
}) => {
  const [language, setLanguage] = useState<Language>(initialLanguage);

  const t = translations[language];
  const isRTL = language === 'ar';

  const value: I18nContextValue = {
    language,
    setLanguage,
    t,
    isRTL,
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = (): I18nContextValue => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
