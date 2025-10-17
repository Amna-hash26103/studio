
'use client';

import { ChatInterface } from '@/components/chat-interface';
import { emotionCareAgent } from '@/ai/flows/emotion-care-agent-flow';

export default function EmotionalHealthPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-12">
      <div className="mb-6">
        <h1 className="font-headline text-3xl font-bold">Emotional Support</h1>
        <p className="text-muted-foreground">
          A safe space to explore your feelings and find support.
        </p>
      </div>
      <ChatInterface 
        topic="emotionalWellbeing" 
        agent={emotionCareAgent} 
        initialMessage="Hello. It's okay to not be okay. If you feel like talking, I'm here to listen."
      />
    </div>
  );
}
