import { ChatInterface } from '@/components/chat-interface';

export default function DietPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-headline text-3xl font-bold">Diet AI</h1>
        <p className="text-muted-foreground">
          Your personal guide for nutrition and healthy eating.
        </p>
      </div>
      <ChatInterface topic="nutrition" />
    </div>
  );
}
