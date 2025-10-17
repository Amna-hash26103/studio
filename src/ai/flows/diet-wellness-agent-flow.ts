
'use server';
/**
 * @fileOverview A gentle and supportive AI companion for diet and wellness.
 *
 * - dietWellnessAgent - A function that interacts with the diet and wellness agent.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const DietWellnessAgentInputSchema = z.object({
    query: z.string(),
    waterIntake: z.number().optional().describe("User's reported water intake in glasses for the day."),
    bowelMovements: z.array(z.object({
        type: z.string().describe("The type of bowel movement based on the Bristol Stool Chart."),
        createdAt: z.date().describe("The timestamp of the bowel movement."),
    })).optional().describe("A list of the user's bowel movements for the day.")
});
export type DietWellnessAgentInput = z.infer<typeof DietWellnessAgentInputSchema>;

const DietWellnessAgentOutputSchema = z.string();
export type DietWellnessAgentOutput = z.infer<typeof DietWellnessAgentOutputSchema>;

export async function dietWellnessAgent(input: DietWellnessAgentInput): Promise<DietWellnessAgentOutput> {
  return dietWellnessAgentFlow(input);
}

const dietWellnessAgentFlow = ai.defineFlow(
  {
    name: 'dietWellnessAgentFlow',
    inputSchema: DietWellnessAgentInputSchema,
    outputSchema: DietWellnessAgentOutputSchema,
  },
  async (input) => {
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

**User's Current Context:**
{{#if waterIntake}}
- Water Intake: {{waterIntake}} glasses. (A good goal is 8 glasses. If lower, gently encourage more hydration).
{{/if}}
{{#if bowelMovements}}
- Bowel Movements Today: {{bowelMovements.length}}. (Types 3 and 4 on the Bristol scale are ideal. Types 1-2 suggest constipation, while 5-7 suggest diarrhea. Tailor advice accordingly, e.g., suggesting more fiber and water for constipation).
{{/if}}

Based on this context and the user's query, provide detailed and personalized advice.

**User Query:**
---
{{{query}}}
---
`,
      model: 'googleai/gemini-2.5-flash',
    });

    return llmResponse.text;
  }
);
