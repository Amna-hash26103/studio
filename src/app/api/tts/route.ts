import { NextRequest, NextResponse } from 'next/server';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import services from '@/app/google-services.json';

// Map locales to Google's voice codes.
// You can find more voices here: https://cloud.google.com/text-to-speech/docs/voices
const localeToVoice: Record<string, { languageCode: string; name: string }> = {
  en: { languageCode: 'en-US', name: 'en-US-Standard-A' },
  ur: { languageCode: 'ur-PK', name: 'ur-PK-Standard-A' },
  ps: { languageCode: 'ps-AF', name: 'ps-AF-Standard-A' },
  pa: { languageCode: 'pa-IN', name: 'pa-IN-Standard-A' },
};

// Initialize the client, telling it which project to use.
// In a deployed environment (like Firebase App Hosting), it will automatically
// find the necessary authentication credentials.
const ttsClient = new TextToSpeechClient({
    projectId: services.project_info.project_id,
});


export async function POST(req: NextRequest) {
  try {
    const { text, locale } = await req.json();

    if (!text || !locale) {
      return NextResponse.json({ error: 'Missing text or locale' }, { status: 400 });
    }

    const voice = localeToVoice[locale];
    if (!voice) {
      return NextResponse.json({ error: `Unsupported locale: ${locale}` }, { status: 400 });
    }

    const request = {
      input: { text },
      voice: {
        languageCode: voice.languageCode,
        name: voice.name,
      },
      audioConfig: { audioEncoding: 'MP3' as const },
    };

    const [response] = await ttsClient.synthesizeSpeech(request);

    const audioContent = response.audioContent;
    
    if (!audioContent) {
      return NextResponse.json({ error: 'No audio content in response' }, { status: 500 });
    }

    // Convert Uint8Array to a Buffer, then to a Base64 string for transport over JSON
    const audioBase64 = Buffer.from(audioContent as Uint8Array).toString('base64');
    const audioSrc = `data:audio/mp3;base64,${audioBase64}`;
    
    return NextResponse.json({ audio: audioSrc });

  } catch (error: any) {
    console.error('Error calling Google TTS API:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
