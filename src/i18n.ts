import {getRequestConfig} from 'next-intl/server';
 
export const locales = ['en', 'ur', 'ps', 'pa', 'ur-RO'];
export const defaultLocale = 'en';

export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) {
    // Redirect to default locale if invalid
    // This can be improved with a not-found page
    locale = defaultLocale;
  }
 
  return {
    messages: (await import(`../messages/${locale}.json`)).default
  };
});