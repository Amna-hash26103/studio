'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';

type Locale = 'en' | 'ur';

interface TranslationContextType {
  t: (key: string) => string;
  language: Locale;
  changeLanguage: (lang: Locale) => void;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({
  children,
  translations,
  locale
}: {
  children: ReactNode;
  translations: any;
  locale: Locale;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const get = (obj: any, path: string) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  };

  const t = useCallback(
    (key: string): string => {
      return get(translations, key) || key;
    },
    [translations]
  );
  
  const changeLanguage = (newLocale: Locale) => {
    // This will replace the current path with the new locale.
    // e.g., from /en/settings to /ur/settings
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.replace(newPath);
  };

  const value = useMemo(() => ({
    t,
    language: locale,
    changeLanguage,
  }), [t, locale, changeLanguage]);

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
  return context;
}
