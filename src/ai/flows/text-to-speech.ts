'use server';
/**
 * @fileOverview A flow for converting text to speech using a standard TTS model.
 *
 * - textToSpeech - A function that takes text and returns an audio data URI.
 */
import { ai } from '@/ai/genkit';
import { googleAI }m'@genkit-ai/google-genai';
import { z } from 'genkit';
import wav from 'wav';

const TextToSpeechInputSchema = z.object({
  text: z.string(),
});

const TextToSpeechOutputSchema = z.object({
  audio: z.string().describe("The base64 encoded audio data URI."),
});


export async function textToSpeech(
  input: z.infer<typeof TextToSpeechInputSchema>
): Promise<z.infer<typeof TextToSpeechOutputSchema>> {
  return textToSpeechFlow(input);
}

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

const textToSpeechFlow = ai.defineFlow(
  {
    name: 'textToSpeechFlow',
    inputSchema: TextToSpeechInputSchema,
    outputSchema: TextToSpeechOutputSchema,
  },
  async ({ text }) => {
    // Note: Using a standard TTS model to avoid preview model rate limits.
    const { media } = await ai.generate({
      model: googleAI.model('tts-1'), 
      config: {
        responseModalities: ['AUDIO'],
      },
      prompt: text,
    });

    if (!media) {
      throw new Error('No media was returned from the TTS model.');
    }

    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    
    const wavBase64 = await toWav(audioBuffer);

    return {
      audio: 'data:audio/wav;base64,' + wavBase64,
    };
  }
);
