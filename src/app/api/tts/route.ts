
import { NextRequest, NextResponse } from 'next/server';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { z } from 'zod';

const client = new TextToSpeechClient();

const requestSchema = z.object({
  text: z.string().min(1),
  locale: z.string().min(2),
});

// Maps our app's locales to specific Google Cloud TTS voice configurations.
// We are selecting standard, female voices for consistency.
const voiceMap: { [key: string]: { languageCode: string; name: string } } = {
  en: { languageCode: 'en-US', name: 'en-US-Standard-C' },
  ur: { languageCode: 'ur-PK', name: 'ur-PK-Standard-A' },
  pa: { languageCode: 'pa-IN', name: 'pa-IN-Standard-A' },
  // Pashto ('ps') is not currently supported by Google Cloud TTS, so it's omitted.
  // The frontend will hide the button for this locale.
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { text, locale } = parsed.data;

    const voiceConfig = voiceMap[locale];
    if (!voiceConfig) {
      return NextResponse.json({ error: `Unsupported language: ${locale}` }, { status: 400 });
    }

    const request = {
      input: { text },
      voice: voiceConfig,
      audioConfig: { audioEncoding: 'MP3' as const },
    };

    const [response] = await client.synthesizeSpeech(request);
    const audioContent = response.audioContent;

    if (!audioContent) {
      return NextResponse.json({ error: 'Failed to synthesize speech' }, { status: 500 });
    }

    // Convert the audio content to a base64 string to send as JSON
    const audioBase64 = Buffer.from(audioContent).toString('base64');

    return NextResponse.json({ audio: `data:audio/mp3;base64,${audioBase64}` });
  } catch (error) {
    console.error('Error in TTS API route:', error);
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
}
