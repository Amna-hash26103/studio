import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, defaultLocale } from './app/[locale]/layout';

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) {
    // Optionally, redirect to the default locale if an invalid locale is provided
    // For now, we'll show a 404 page.
    notFound();
  }

  return {
    messages: (await import(`../messages/${locale}.json`)).default,
    locale, // Return the locale
  };
});

    