
'use client';

import { ChatInterface } from '@/components/chat-interface';
import { ReadAloudButton } from '@/components/read-aloud-button';
import { healthcareAgent } from '@/ai/flows/healthcare-agent-flow';
import { useTranslation } from '@/lib/i18n';

export default function HealthcarePage() {
  const { t, lang } = useTranslation();
  const headingText = t('healthcare.title');
  const descriptionText = t('healthcare.subtitle');

  return (
    <div className="mx-auto max-w-2xl space-y-12">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h1 className="font-headline text-3xl font-bold">{headingText}</h1>
          <ReadAloudButton textToRead={headingText} lang={lang} />
        </div>
        <div className="flex items-center gap-2">
          <p className="text-muted-foreground">
            {descriptionText}
          </p>
          <ReadAloudButton textToRead={descriptionText} lang={lang} />
        </div>
      </div>
      <ChatInterface 
        topic="health" 
        agent={healthcareAgent}
        initialMessage={t('healthcare.initialMessage')}
      />
    </div>
  );
}
