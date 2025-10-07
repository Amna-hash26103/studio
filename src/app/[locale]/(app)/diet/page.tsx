
'use client';

import { ChatInterface } from '@/components/chat-interface';
import { useTranslations } from 'next-intl';

export default function DietPage() {
  const t = useTranslations('DietPage');
  return (
    <div className="mx-auto max-w-2xl space-y-12">
      <div className="mb-6 p-4">
        <h1 className="font-headline text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">
          {t('description')}
        </p>
      </div>
      <div className="flex-1">
        <ChatInterface topic="nutrition" />
      </div>
    </div>
  );
}
