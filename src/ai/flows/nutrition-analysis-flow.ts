
'use server';

/**
 * @fileOverview A flow for analyzing the nutritional content of a meal description.
 *
 * - analyzeNutrition - A function that takes a meal description and returns its nutritional info.
 * - NutritionAnalysisInput - The input type for the analyzeNutrition function.
 * - NutritionAnalysisOutput - The return type for the analyzeNutrition function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const NutritionAnalysisInputSchema = z.object({
  mealDescription: z.string().describe('A description of the meal, including ingredients and approximate quantities.'),
});
export type NutritionAnalysisInput = z.infer<typeof NutritionAnalysisInputSchema>;

const NutritionAnalysisOutputSchema = z.object({
  calories: z.number().describe('Estimated total calories.'),
  protein: z.number().describe('Estimated protein in grams.'),
  carbs: z.number().describe('Estimated carbohydrates in grams.'),
  fat: z.number().describe('Estimated fat in grams.'),
  fiber: z.number().describe('Estimated fiber in grams.'),
});
export type NutritionAnalysisOutput = z.infer<typeof NutritionAnalysisOutputSchema>;

export const nutritionAnalysisTool = ai.defineTool(
  {
    name: 'analyzeMealNutrition',
    description: 'Analyzes a meal description and returns estimated nutritional content.',
    inputSchema: NutritionAnalysisInputSchema,
    outputSchema: NutritionAnalysisOutputSchema,
  },
  async (input) => {
    const nutritionPrompt = ai.definePrompt({
      name: 'nutritionAnalysisPrompt',
      input: { schema: NutritionAnalysisInputSchema },
      output: { schema: NutritionAnalysisOutputSchema },
      prompt: `
        You are a clinical nutritionist AI. Your task is to analyze the following meal description and provide a highly accurate, realistic estimate of its nutritional content.

        **Methodology:**
        1. Base your estimations on standard food composition databases, such as the USDA FoodData Central.
        2. Break down the meal into its core ingredients.
        3. If portion sizes are not specified, assume common, standard portion sizes (e.g., 1 cup of rice, 4oz of chicken breast).
        4. Sum the nutritional information for the components to arrive at a final estimate for the entire meal.
        
        **Meal Description:**
        {{{mealDescription}}}

        **Output Requirements:**
        - Return only the estimated total calories, protein (g), carbohydrates (g), fat (g), and fiber (g).
        - If a value is negligible, return 0.
        - Do not return ranges, only single, whole numbers for calories and numbers with up to one decimal place for grams.
      `,
    });

    const { output } = await nutritionPrompt(input);
    return output!;
  }
);

    