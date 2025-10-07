
'use client';

import { ChatInterface } from '@/components/chat-interface';
import { useTranslations } from 'next-intl';

export default function HealthcarePage() {
  const t = useTranslations('HealthcarePage');

  return (
    <div className="mx-auto max-w-2xl space-y-12">
      <div className="mx-auto max-w-2xl space-y-12">
        <h1 className="font-headline text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">
          {t('description')}
        </p>
      </div>
      <ChatInterface topic="health" />
    </div>
  );
}
