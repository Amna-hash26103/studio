import { ChatInterface } from '@/components/chat-interface';

export default function ChatbotPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-headline text-3xl font-bold">Wellness AI</h1>
        <p className="text-muted-foreground">
          Your personal guides for health, mind, and nutrition.
        </p>
      </div>
      <ChatInterface />
    </div>
  );
}
