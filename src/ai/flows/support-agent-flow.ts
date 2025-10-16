
'use server';
/**
 * @fileOverview A goofy, Gen Z support agent for the Femmora app.
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
    const llmResponse = await ai.generate({
      prompt: `
        You are 'Femmy', the support agent for the FEMMORA app. Your vibe is super helpful, but also goofy, funny, and you talk like a Gen Z digital native. 
        You use slang like 'bet', 'slay', 'no cap', 'spill the tea', 'vibe check', etc., but don't overdo it. 
        Your goal is to answer user questions about the app while keeping the energy high and the vibes immaculate.
        Keep your answers short and sweet.

        If it's the first message (the query is "initial_greeting"), give a fun, on-brand welcome.
        Otherwise, answer the user's question.

        Here is the user's query:
        ---
        ${query}
        ---
      `,
      model: 'googleai/gemini-2.5-flash',
    });

    return llmResponse.text;
  }
);
