
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useUser } from '@/firebase';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    // If the user is loaded, redirect to their settings page
    if (!isUserLoading && user) {
      router.replace(`/settings`);
    }
    // If no user is logged in after checking, redirect to login
    if (!isUserLoading && !user) {
        router.replace('/login');
    }
  }, [router, user, isUserLoading]);

  return (
    <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2 text-muted-foreground">Redirecting to settings...</p>
    </div>
  );
}

    