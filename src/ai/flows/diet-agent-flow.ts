
'use server';
/**
 * @fileOverview A custom diet and nutrition agent for the Femmora app.
 *
 * - dietAgent - A function that interacts with the diet agent.
 */

import { ai } from '@/ai/genkit';
import { nutritionAnalysisTool } from './nutrition-analysis-flow';
import { z } from 'zod';

const DietAgentInputSchema = z.string();
const DietAgentOutputSchema = z.string();

export async function dietAgent(query: z.infer<typeof DietAgentInputSchema>): Promise<z.infer<typeof DietAgentOutputSchema>> {
  return dietAgentFlow(query);
}

const dietAgentFlow = ai.defineFlow(
  {
    name: 'dietAgentFlow',
    inputSchema: DietAgentInputSchema,
    outputSchema: DietAgentOutputSchema,
  },
  async (query) => {
    const llmResponse = await ai.generate({
      prompt: `
        You are a friendly and expert nutritionist and diet coach for the FEMMORA app.
        Your goal is to help users with their diet and nutrition questions.
        You are conversational and provide clear, actionable advice.

        If the user asks you to analyze a meal, use the 'analyzeMealNutrition' tool to get the nutritional information.
        When you use the tool, present the results back to the user in a clear, friendly format, and also include the raw JSON data in a markdown block like this:
        \'\'\'json
        { "calories": 350, "protein": 10, ... }
        \'\'\'

        If the user asks a general question, provide a helpful and encouraging answer.

        Here is the user's query:
        ---
        ${query}
        ---
      `,
      model: 'googleai/gemini-2.5-flash',
      tools: [nutritionAnalysisTool],
    });

    const text = llmResponse.text;
    if (!text) {
        // If the model calls a tool but doesn't return text, explain what it did.
        const toolRequests = llmResponse.toolRequests;
        if (toolRequests && toolRequests.length > 0) {
            return `I'm using a tool to look that up for you.`;
        }
        return "I'm not sure how to answer that. Could you try rephrasing?";
    }

    return text;
  }
);
