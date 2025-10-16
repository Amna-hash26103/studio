
'use client';

import { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { Bot, Loader2, Send } from 'lucide-react';
import { wellnessChatbotPersonalizedAdvice } from '@/ai/flows/wellness-chatbot-personalized-advice';
import type { WellnessChatbotPersonalizedAdviceInput } from '@/ai/flows/wellness-chatbot-personalized-advice';
import { ReadAloudButton } from './read-aloud-button';
import { useTranslation } from '@/lib/i18n';

const healthAvatar = PlaceHolderImages.find(
  (img) => img.id === 'health-avatar'
);
const emotionalAvatar = PlaceHolderImages.find(
  (img) => img.id === 'emotional-avatar'
);
const nutritionAvatar = PlaceHolderImages.find(
  (img) => img.id === 'nutrition-avatar'
);
const userAvatar = PlaceHolderImages.find((img) => img.id === 'user-avatar-1');

type Topic = 'health' | 'emotionalWellbeing' | 'nutrition';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatInterfaceProps {
    topic: Topic;
    agent?: (query: string) => Promise<string>;
    initialMessage?: string;
}

export function ChatInterface({ topic, agent, initialMessage }: ChatInterfaceProps) {
  const { t, lang } = useTranslation();
  
  const avatars: Record<Topic, typeof healthAvatar> = {
    health: healthAvatar,
    emotionalWellbeing: emotionalAvatar,
    nutrition: nutritionAvatar,
  };
  
  const placeholders: Record<Topic, string> = {
    health: t('chat.placeholders.health'),
    emotionalWellbeing: t('chat.placeholders.emotionalWellbeing'),
    nutrition: t('chat.placeholders.nutrition'),
  };
  
  const defaultInitialMessages: Record<Topic, Message> = {
      health: {
          role: 'assistant',
          content: t('chat.initialMessages.health'),
      },
      emotionalWellbeing: {
          role: 'assistant',
          content: t('chat.initialMessages.emotionalWellbeing'),
      },
      nutrition: {
          role: 'assistant',
          content: t('chat.initialMessages.nutrition'),
      },
  }
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    setMessages([ initialMessage ? { role: 'assistant', content: initialMessage } : defaultInitialMessages[topic] ]);
  }, [topic, initialMessage, t]); // Add 't' to dependencies

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
        let responseText;
        if (agent) {
            responseText = await agent(input);
        } else {
            // Fallback to the generic wellness bot if no specific agent is provided
            const aiInput: WellnessChatbotPersonalizedAdviceInput = {
                topic: topic,
                query: input,
            };
            const response = await wellnessChatbotPersonalizedAdvice(aiInput);
            responseText = response.advice;
        }

      const assistantMessage: Message = {
        role: 'assistant',
        content: responseText,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        role: 'assistant',
        content: t('chat.errorMessage'),
      };
      setMessages((prev) => [...prev, errorMessage]);
      console.error('Error calling AI:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardContent ref={scrollRef} className="h-[60vh] overflow-y-auto p-4">
        <div className="space-y-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                'flex items-start gap-3',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <Avatar className="h-8 w-8 border">
                  <AvatarImage src={avatars[topic]?.imageUrl} />
                  <AvatarFallback>
                    <Bot />
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  'max-w-xs rounded-lg px-4 py-2 md:max-w-md',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary'
                )}
              >
                <p className="whitespace-pre-wrap text-sm">{message.content}</p>
              </div>
               <ReadAloudButton textToRead={message.content} lang={lang} />
              {message.role === 'user' && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userAvatar?.imageUrl} />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isLoading && (
              <div className="flex items-start gap-3 justify-start">
                <Avatar className="h-8 w-8 border">
                  <AvatarImage src={avatars[topic]?.imageUrl} />
                  <AvatarFallback>
                    <Bot />
                  </AvatarFallback>
                </Avatar>
                <div className="max-w-xs rounded-lg px-4 py-2 md:max-w-md bg-secondary flex items-center">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <form onSubmit={handleSendMessage} className="flex w-full items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholders[topic]}
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
