
'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/wellness-chatbot-personalized-advice.ts';
import '@/ai/flows/send-welcome-email.ts';
import '@/ai/flows/translate-text-flow.ts';
import '@/ai/flows/diet-agent-flow.ts';
import '@/ai/flows/support-agent-flow.ts';

    
    