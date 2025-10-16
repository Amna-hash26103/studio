'use client';

import { ChatInterface } from '@/components/chat-interface';
import { ReadAloudButton } from '@/components/read-aloud-button';

export default function HealthcarePage() {
  const headingText = "Healthcare AI";
  const descriptionText = "Your personal guide for physical health and well-being.";

  return (
    <div className="mx-auto max-w-2xl space-y-12">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h1 className="font-headline text-3xl font-bold">{headingText}</h1>
          <ReadAloudButton textToRead={headingText} />
        </div>
        <div className="flex items-center gap-2">
          <p className="text-muted-foreground">
            {descriptionText}
          </p>
          <ReadAloudButton textToRead={descriptionText} />
        </div>
      </div>
      <ChatInterface topic="health" />
    </div>
  );
}
