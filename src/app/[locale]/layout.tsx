import {NextIntlClientProvider, useMessages} from 'next-intl';
import { ReactNode } from 'react';
import {getMessages, getRequestConfig} from 'next-intl/server';
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
  const messages = await getMessages();

  if (!locales.includes(locale)) {
    notFound();
  }
 
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
