import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './app/[locale]/layout';
 
export default createMiddleware({
  // A list of all locales that are supported
  locales,
 
  // Used when no locale matches
  defaultLocale
});
 
export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(ur|ps|pa|ur-RO|en)/:path*']
};
