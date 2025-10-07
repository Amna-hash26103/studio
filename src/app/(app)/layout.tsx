'use client';
import { AppShell } from '@/components/app-shell';
import { useUser } from '@/firebase';
import { useRouter } from 'next-intl/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslations } from 'next-intl';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const t = useTranslations('AppLayout');

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/login');
    }
  }, [isUserLoading, user, router]);

  if (isUserLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
            </div>
            <p className="mt-4 text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }
  
  return <AppShell>{children}</AppShell>;
}
