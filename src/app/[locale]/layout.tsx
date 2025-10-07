import {NextIntlClientProvider} from 'next-intl';
import { ReactNode } from 'react';
import {getMessages} from 'next-intl/server';
 
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
 
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
