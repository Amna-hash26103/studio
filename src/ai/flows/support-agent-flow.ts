
'use server';
/**
 * @fileOverview A cool and chill support agent for the Femmora app.
 *
 * - supportAgent - A function that interacts with the support agent.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const SupportAgentInputSchema = z.string();
const SupportAgentOutputSchema = z.string();

export async function supportAgent(query: z.infer<typeof SupportAgentInputSchema>): Promise<z.infer<typeof SupportAgentOutputSchema>> {
  return supportAgentFlow(query);
}

const supportAgentFlow = ai.defineFlow(
  {
    name: 'supportAgentFlow',
    inputSchema: SupportAgentInputSchema,
    outputSchema: SupportAgentOutputSchema,
  },
  async (query) => {
    const isGreeting = query.startsWith('initial_greeting');
    const botName = isGreeting ? query.split('initial_greeting_for_')[1] || 'Aura' : 'the support agent';

    const llmResponse = await ai.generate({
      prompt: `
        You are '${botName}', the support agent for the FEMMORA app. Your vibe is helpful, cool, and chill. 
        You're like a friendly guide who knows the app inside and out. You're relaxed, clear, and encouraging. 
        Keep your answers concise and easy to understand.

        If it's the first message (the query contains "initial_greeting"), give a warm, relaxed welcome and introduce yourself by name.
        Otherwise, answer the user's question.

        Here is the user's query:
        ---
        ${isGreeting ? "Introduce yourself." : query}
        ---
      `,
      model: 'googleai/gemini-2.5-flash',
    });

    return llmResponse.text;
  }
);
