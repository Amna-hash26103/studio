import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from './app/[locale]/layout';

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) {
    notFound();
  }

  return {
    messages: (await import(`../messages/${locale}.json`)).default,
    locale, // Return the locale
  };
});

    