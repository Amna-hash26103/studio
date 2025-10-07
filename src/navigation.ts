import { createSharedPathnamesNavigation } from 'next-intl/navigation';
 
export const locales = ['en', 'ur', 'ps', 'pa', 'ur-RO'] as const;
export const defaultLocale = 'en';

export const { Link, redirect, usePathname, useRouter } =
  createSharedPathnamesNavigation({ locales });
