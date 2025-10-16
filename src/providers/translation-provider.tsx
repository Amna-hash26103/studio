'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { translations } from '@/lib/translations';

type Locale = 'en' | 'ur';

// Helper function to get nested values from an object using a string path
const get = (obj: any, path: string) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

interface TranslationContextType {
  language: Locale;
  changeLanguage: (lang: Locale) => void;
  t: (key: string) => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Locale>('en');

  useEffect(() => {
    const detectedLanguage =
      typeof window !== 'undefined'
        ? (localStorage.getItem('language') as Locale) ||
          (navigator.language.split('-')[0] as Locale)
        : 'en';
    if (detectedLanguage === 'ur') {
      setLanguage('ur');
    } else {
      setLanguage('en');
    }
  }, []);

  const changeLanguage = useCallback((lang: Locale) => {
    setLanguage(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang);
    }
  }, []);

  const t = useCallback(
    (key: string): string => {
      const messages = translations[language];
      const translation = get(messages, key);
      return translation || key;
    },
    [language]
  );

  const value = useMemo(() => ({
    language,
    changeLanguage,
    t,
  }), [language, changeLanguage, t]);

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return { t: context.t };
}

export function useLanguage() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a TranslationProvider');
  }
  return {
    language: context.language,
    changeLanguage: context.changeLanguage,
  };
}
