import { ChatInterface } from '@/components/chat-interface';

export default function HealthcarePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-12">
      <div className="mx-auto max-w-2xl space-y-12">
        <h1 className="font-headline text-3xl font-bold">Healthcare AI</h1>
        <p className="text-muted-foreground">
          Your personal guide for physical health and well-being.
        </p>
      </div>
      <ChatInterface topic="health" />
    </div>
  );
}
