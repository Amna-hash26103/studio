import { ChatInterface } from '@/components/chat-interface';

export default function EmotionalHealthPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-headline text-3xl font-bold">Emotional Health AI</h1>
        <p className="text-muted-foreground">
          Your personal guide for mindfulness and emotional balance.
        </p>
      </div>
      <ChatInterface topic="emotionalWellbeing" />
    </div>
  );
}
