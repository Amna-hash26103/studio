
'use server';
/**
 * @fileOverview A flow for translating text from one language to another.
 *
 * - translateText - A function that translates text.
 * - TranslateTextInput - The input type for the translateText function.
 * - TranslateTextOutput - The return type for the translateText function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TranslateTextInputSchema = z.object({
  text: z.string().describe('The text to translate.'),
  targetLanguage: z.string().describe('The target language code (e.g., "en", "ur").'),
});
export type TranslateTextInput = z.infer<typeof TranslateTextInputSchema>;

const TranslateTextOutputSchema = z.object({
  translatedText: z.string().describe('The translated text.'),
});
export type TranslateTextOutput = z.infer<typeof TranslateTextOutputSchema>;

export async function translateText(input: TranslateTextInput): Promise<TranslateTextOutput> {
  return translateTextFlow(input);
}

const romanUrduExamples = `
Example 1:
English: "Empower Your Journey. Together."
Roman Urdu: "Apne Safar ko Taqat dein. Ek Saath."

Example 2:
English: "A Space to Thrive"
Roman Urdu: "Aage Barhne ki Jagah"

Example 3:
English: "FEMMORA is a sanctuary for women to connect, share, and flourish."
Roman Urdu: "FEMMORA khawateen ke liye jurrne, apni baat kehne, aur aage barhne ki ek panahgah hai."
`;

const translateTextFlow = ai.defineFlow(
  {
    name: 'translateTextFlow',
    inputSchema: TranslateTextInputSchema,
    outputSchema: TranslateTextOutputSchema,
  },
  async input => {
    let systemPrompt: string;

    // Handle Roman Urdu specifically
    if (input.targetLanguage.toLowerCase() === 'ur-ro') {
      systemPrompt = `Translate the following English text into natural, conversational Roman Urdu (Urdu written in the Latin alphabet). Your translations should be easy to read and sound like how a native speaker would write. Use the following examples for style guidance:\n${romanUrduExamples}\n\nReturn only the translated text.`;
    } 
    // Handle other languages that need a specific script or style
    else if (input.targetLanguage === 'ur') {
        systemPrompt = `Translate the following English text into Urdu, using the Nastaliq script. Return only the translated text.`;
    } else if (input.targetLanguage === 'pa') {
        systemPrompt = `Translate the following English text into Punjabi, using the Shahmukhi script. Return only the translated text.`;
    } else if (input.targetLanguage === 'ps') {
        systemPrompt = `Translate the following English text into Pashto. Return only the translated text.`;
    } else if (input.targetLanguage === 'skr') {
        systemPrompt = `Translate the following English text into Saraiki, using the Shahmukhi script. Return only the translated text.`;
    }
    // Default for all other languages
    else {
      systemPrompt = `Translate the following English text to the language with code "${input.targetLanguage}". Return only the translated text.`;
    }
    
    const llmResponse = await ai.generate({
      prompt: `${systemPrompt}\n\nText to translate: "${input.text}"`,
      model: 'googleai/gemini-2.5-flash',
      output: {
        schema: TranslateTextOutputSchema,
      },
    });

    return llmResponse.output!;
  }
);
