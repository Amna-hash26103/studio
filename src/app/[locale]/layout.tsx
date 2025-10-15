import { notFound } from 'next/navigation';
import { NextIntlClientProvider, useMessages } from 'next-intl';
import { locales } from '@/navigation';
import { ReactNode } from 'react';
import { AppLayout } from '@/app/[locale]/(app)/layout';

export default function LocaleLayout({
  children,
  params: { locale },
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();

  // Receive messages provided in `i18n.ts`
  const messages = useMessages();

  // A simple way to determine if a route is authenticated or not.
  // This is not perfect, but it's a good starting point.
  // We consider login and signup pages as public.
  const isPublicRoute = children?.props?.childProp?.segment === 'login' || children?.props?.childProp?.segment === 'signup';

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {isPublicRoute ? children : <AppLayout>{children}</AppLayout>}
    </NextIntlClientProvider>
  );
}