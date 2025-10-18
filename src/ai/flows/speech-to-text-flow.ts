
'use server';
/**
 * @fileOverview A flow for converting speech to text.
 *
 * - speechToText - A function that takes audio data and returns transcribed text.
 * - SpeechToTextInput - The input type for the speechToText function.
 * - SpeechToTextOutput - The return type for the speechToText function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const SpeechToTextInputSchema = z.object({
  audioDataUri: z.string().describe('The audio to transcribe, as a base64 encoded data URI.'),
});
export type SpeechToTextInput = z.infer<typeof SpeechToTextInputSchema>;

const SpeechToTextOutputSchema = z.object({
  text: z.string().describe('The transcribed text.'),
});
export type SpeechToTextOutput = z.infer<typeof SpeechToTextOutputSchema>;


export async function speechToText(input: SpeechToTextInput): Promise<SpeechToTextOutput> {
  return speechToTextFlow(input);
}

const speechToTextFlow = ai.defineFlow(
  {
    name: 'speechToTextFlow',
    inputSchema: SpeechToTextInputSchema,
    outputSchema: SpeechToTextOutputSchema,
  },
  async (input) => {
    const { text } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-speech'),
      prompt: [
        {
          media: {
            url: input.audioDataUri,
          },
        },
        { text: 'Transcribe this audio.' },
      ],
    });

    return { text };
  }
);
