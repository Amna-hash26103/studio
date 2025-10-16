import {Pathnames} from 'next-intl/navigation';

export const locales = ['en', 'ur'] as const;

export const pathnames = {
  '/': '/',
  '/pathnames': {
    en: '/pathnames',
    ur: '/pathnames'
  }
} satisfies Pathnames<typeof locales>;

// Use the default: `always`
export const localePrefix = undefined;

export type AppPathnames = keyof typeof pathnames;