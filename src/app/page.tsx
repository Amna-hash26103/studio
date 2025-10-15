'use client';
import { defaultLocale } from '@/navigation';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function RootPage() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only redirect if the current path is the root
    if (pathname === '/') {
      router.replace(`/${defaultLocale}`);
    }
  }, [router, pathname]);

  return null;
}