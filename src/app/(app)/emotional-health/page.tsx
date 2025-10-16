'use client';

import { ChatInterface } from '@/components/chat-interface';

export default function EmotionalHealthPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-12">
      <div className="mb-6">
        <h1 className="font-headline text-3xl font-bold">Navigating Sadness</h1>
        <p className="text-muted-foreground">
          A safe space to explore your feelings and find a path forward.
        </p>
      </div>
      <ChatInterface topic="emotionalWellbeing" />
    </div>
  );
}
