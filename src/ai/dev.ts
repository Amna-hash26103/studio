'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/wellness-chatbot-personalized-advice.ts';
import '@/ai/flows/send-welcome-email.ts';
