'use client';

import { ChatInterface } from '@/components/chat-interface';
import { useTranslations } from 'next-intl';

export default function EmotionalHealthPage() {
  const t = useTranslations('EmotionalHealthPage');

  return (
    <div className="mx-auto max-w-2xl space-y-12">
      <div className="mb-6">
        <h1 className="font-headline text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">
          {t('description')}
        </p>
      </div>
      <ChatInterface topic="emotionalWellbeing" />
    </div>
  );
}
