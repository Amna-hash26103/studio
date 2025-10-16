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
import handlebars from 'handlebars';

// Manually register the 'eq' helper for the template at the module level
handlebars.registerHelper('eq', function (a, b) {
  return a === b;
});

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

const translationPrompt = ai.definePrompt({
  name: 'translationPrompt',
  input: { schema: TranslateTextInputSchema },
  output: { schema: TranslateTextOutputSchema },
  prompt: `
    {{#if (eq targetLanguage 'ur-RO')}}
    Translate the following text into natural, conversational Roman Urdu (Urdu written in English characters). 
    Your translations should be easy to read and sound like how a native speaker would write Urdu using the English alphabet.

    Here are some examples of the style I want:
    Example 1:
    English: "Empower Your Journey. Together."
    Roman Urdu: "Apne Safar ko Taqat dein. Ek Saath."

    Example 2:
    English: "A Space to Thrive"
    Roman Urdu: "Aage Barhne ki Jagah"

    Example 3:
    English: "FEMMORA is a sanctuary for women to connect, share, and flourish."
    Roman Urdu: "FEMMORA khawateen ke liye jurrne, apni baat kehne, aur aage barhne ki ek panahgah hai."

    Now, please translate the following text in the same style.
    {{else}}
    Translate the following text to {{targetLanguage}}.
    {{/if}}

    Text: {{{text}}}

    Return only the translated text.`,
});

const translateTextFlow = ai.defineFlow(
  {
    name: 'translateTextFlow',
    inputSchema: TranslateTextInputSchema,
    outputSchema: TranslateTextOutputSchema,
  },
  async input => {
    const { output } = await translationPrompt(input);
    return output!;
  }
);
