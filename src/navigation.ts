import {
  createLocalizedPathnamesNavigation,
  Pathnames,
} from 'next-intl/navigation';

export const locales = ['en', 'ur', 'ps', 'pa', 'ur-RO'] as const;
export const defaultLocale = 'en';
export const localePrefix = 'always'; // Default

// The `pathnames` object holds pairs of internal
// and external paths, separated by locale.
export const pathnames = {
  // If all locales use the same path, use
  // the special `/` path.
  '/': '/',
  '/blog': '/blog',

  // If locales use different paths, specify
  // an object for each locale.
  '/about': {
    en: '/about',
    ur: '/about',
    ps: '/about',
    pa: '/about',
    'ur-RO': '/about',
  },
} satisfies Pathnames<typeof locales>;

export const {Link, redirect, usePathname, useRouter, getPathname} =
  createLocalizedPathnamesNavigation({
    locales,
    localePrefix,
    pathnames,
  });
