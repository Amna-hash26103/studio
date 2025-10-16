
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Bot, Loader2, MessageSquare, Send, X } from 'lucide-react';
import { useUser } from '@/firebase';
import { supportAgent } from '@/ai/flows/support-agent-flow';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useTranslation } from '@/lib/i18n';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function SupportBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [botName, setBotName] = useState('Aura');
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();
  const { t } = useTranslation();
  const userAvatar = PlaceHolderImages.find((img) => img.id === 'user-avatar-1');
  const auraAvatar = PlaceHolderImages.find((img) => img.id === 'logo');

  useEffect(() => {
    const fetchBotName = () => {
      const storedName = localStorage.getItem('chatbotName');
      setBotName(storedName || 'Aura');
    };

    fetchBotName();

    // Listen for changes from the settings page
    window.addEventListener('storage', fetchBotName);
    return () => {
      window.removeEventListener('storage', fetchBotName);
    };
  }, []);


  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setIsLoading(true);
      const greetingQuery = `initial_greeting_for_${botName}`;
      supportAgent(greetingQuery).then((response) => {
        setMessages([{ role: 'assistant', content: response }]);
        setIsLoading(false);
      }).catch(err => {
        console.error("Support agent initial greeting failed:", err);
        setMessages([{ role: 'assistant', content: t('supportBot.initialError') }]);
        setIsLoading(false);
      });
    }
  }, [isOpen, messages.length, botName, t]);

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
      const response = await supportAgent(input);
      const assistantMessage: Message = { role: 'assistant', content: response };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        role: 'assistant',
        content: t('supportBot.errorMessage'),
      };
      setMessages((prev) => [...prev, errorMessage]);
      console.error('Error calling support agent:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="icon"
          className="rounded-full w-14 h-14 shadow-lg"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={t('supportBot.toggleAriaLabel')}
        >
          {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
        </Button>
      </div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md flex flex-col h-[70vh] p-0">
          <DialogHeader className="p-4 border-b">
            <DialogTitle className="flex items-center gap-3">
              <Avatar className='h-10 w-10'>
                <AvatarImage src={auraAvatar?.imageUrl} />
                <AvatarFallback>A</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span>{botName}</span>
                <span className="text-xs font-normal text-muted-foreground">{t('supportBot.title')}</span>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6">
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
                    <AvatarImage src={auraAvatar?.imageUrl} />
                    <AvatarFallback>
                      <Bot />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    'max-w-xs rounded-lg px-4 py-2 md:max-w-sm',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary'
                  )}
                >
                  <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                </div>
                {message.role === 'user' && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.photoURL || userAvatar?.imageUrl} />
                    <AvatarFallback>{user?.displayName?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3 justify-start">
                <Avatar className="h-8 w-8 border">
                   <AvatarImage src={auraAvatar?.imageUrl} />
                  <AvatarFallback>
                    <Bot />
                  </AvatarFallback>
                </Avatar>
                <div className="max-w-xs rounded-lg px-4 py-2 md:max-w-sm bg-secondary flex items-center">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="p-4 border-t">
            <form onSubmit={handleSendMessage} className="flex w-full items-center gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('supportBot.placeholder', { botName: botName })}
                disabled={isLoading}
                autoComplete="off"
              />
              <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
