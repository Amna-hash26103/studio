import { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { TranslationProvider } from '@/providers/translation-provider';

type Props = {
  children: ReactNode;
  params: { locale: string };
};

async function getMessages(locale: string) {
  try {
    return (await import(`@/messages/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: Props) {
  const messages = await getMessages(locale);

  return (
    <TranslationProvider translations={messages} locale={locale as 'en' | 'ur'}>
      {children}
    </TranslationProvider>
  );
}
