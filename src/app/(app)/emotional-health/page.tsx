
'use client';

import { ChatInterface } from '@/components/chat-interface';
import { emotionCareAgent } from '@/ai/flows/emotion-care-agent-flow';
import { ReadAloudButton } from '@/components/read-aloud-button';

export default function EmotionalHealthPage() {
  const headingText = "Emotional Support";
  const descriptionText = "A safe space to explore your feelings and find support.";
  return (
    <div className="mx-auto max-w-2xl space-y-12">
      <div className="mb-6">
        <div className="flex items-center gap-2">
            <h1 className="font-headline text-3xl font-bold">{headingText}</h1>
            <ReadAloudButton textToRead={headingText} />
        </div>
        <div className="flex items-center gap-2">
            <p className="text-muted-foreground">{descriptionText}</p>
            <ReadAloudButton textToRead={descriptionText} />
        </div>
      </div>
      <ChatInterface 
        topic="emotionalWellbeing" 
        agent={emotionCareAgent} 
        initialMessage="Hello. It's okay to not be okay. If you feel like talking, I'm here to listen."
      />
    </div>
  );
}
