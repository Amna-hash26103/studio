import {NextIntlClientProvider, useMessages} from 'next-intl';
import { ReactNode } from 'react';
import {getMessages} from 'next-intl/server';
import { notFound } from 'next/navigation';
 
export const locales = ['en', 'ur', 'ps', 'pa', 'ur-RO'];
export const defaultLocale = 'en';

export default async function LocaleLayout({
  children,
  params: {locale}
}: {
  children: ReactNode;
  params: {locale: string};
}) {
  if (!locales.includes(locale)) {
    notFound();
  }
  
  const messages = await getMessages();
 
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}

    