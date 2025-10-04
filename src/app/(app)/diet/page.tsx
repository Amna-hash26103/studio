import { ChatInterface } from '@/components/chat-interface';

export default function DietPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-12">
      <div className="mb-6 p-4">
        <h1 className="font-headline text-3xl font-bold">Diet AI</h1>
        <p className="text-muted-foreground">
          Your personal guide for nutrition and healthy eating.
        </p>
      </div>
      <div className="flex-1">
        <ChatInterface topic="nutrition" />
      </div>
    </div>
  );
}
