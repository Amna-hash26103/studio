
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();

  // Redirect to settings page since profile editing is moved there
  useEffect(() => {
    router.replace('/settings');
  }, [router]);

  return (
    <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2 text-muted-foreground">Redirecting to settings...</p>
    </div>
  );
}
