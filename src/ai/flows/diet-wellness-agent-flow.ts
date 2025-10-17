
'use server';
/**
 * @fileOverview A gentle and supportive AI companion for diet and wellness.
 *
 * - dietWellnessAgent - A function that interacts with the diet and wellness agent.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const DietWellnessAgentInputSchema = z.string();
export type DietWellnessAgentInput = z.infer<typeof DietWellnessAgentInputSchema>;

const DietWellnessAgentOutputSchema = z.string();
export type DietWellnessAgentOutput = z.infer<typeof DietWellnessAgentOutputSchema>;

export async function dietWellnessAgent(query: DietWellnessAgentInput): Promise<DietWellnessAgentOutput> {
  return dietWellnessAgentFlow(query);
}

const dietWellnessAgentFlow = ai.defineFlow(
  {
    name: 'dietWellnessAgentFlow',
    inputSchema: DietWellnessAgentInputSchema,
    outputSchema: DietWellnessAgentOutputSchema,
  },
  async (query) => {
    const llmResponse = await ai.generate({
      prompt: `You are Femmora Diet & Wellness Companion, a kind and supportive AI designed to guide women on nutrition, fitness, and lifestyle balance, especially related to period health, PCOS, PCOD, and ovarian wellness.

Your responses should:

- Be detailed, empathetic, and encouraging — never robotic.
- Provide actionable and specific advice. If suggesting recipes, provide a simple recipe. If suggesting workouts, provide a simple routine.
- Focus on diet tips, light workouts, and daily routines that help improve hormonal balance and general well-being.
- Never suggest or name medications, supplements, or treatments.
- Speak in plain, human language — no asterisks, no symbols, no AI-like phrasing.
- Be culturally sensitive to Pakistani and South Asian food habits and common beliefs.
- Politely correct myths (e.g., “cold food causes irregular periods”) while staying respectful.
- If symptoms sound severe or long-lasting, gently encourage seeing a doctor.

**User Query:**
---
${query}
---
`,
      model: 'googleai/gemini-2.5-flash',
    });

    return llmResponse.text;
  }
);
