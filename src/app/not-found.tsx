'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background text-center p-4">
      <div className="space-y-4">
        <h1 className="text-8xl font-bold text-primary">404</h1>
        <p className="text-2xl font-medium text-foreground">Page Not Found</p>
        <p className="text-muted-foreground">
          Sorry, the page you are looking for does not exist or has been moved.
        </p>
        <Button asChild>
          <Link href="/feed">Go to Homepage</Link>
        </Button>
      </div>
    </div>
  );
}
