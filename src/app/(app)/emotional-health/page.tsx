
'use client';

import { ChatInterface } from '@/components/chat-interface';
import { emotionCareAgent } from '@/ai/flows/emotion-care-agent-flow';
import { useTranslation } from '@/lib/i18n';

export default function EmotionalHealthPage() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto max-w-2xl space-y-12">
      <div className="mb-6">
        <h1 className="font-headline text-3xl font-bold">{t('emotionalHealth.title')}</h1>
        <p className="text-muted-foreground">
          {t('emotionalHealth.subtitle')}
        </p>
      </div>
      <ChatInterface 
        topic="emotionalWellbeing" 
        agent={emotionCareAgent} 
        initialMessage={t('emotionalHealth.initialMessage')}
      />
    </div>
  );
}
