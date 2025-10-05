import { NextRequest, NextResponse } from 'next/server';

// Map locales to Google's voice codes.
// You can find more voices here: https://cloud.google.com/text-to-speech/docs/voices
const localeToVoice: Record<string, { languageCode: string; name: string }> = {
  en: { languageCode: 'en-US', name: 'en-US-Standard-A' },
  ur: { languageCode: 'ur-PK', name: 'ur-PK-Standard-A' },
  ps: { languageCode: 'ps-AF', name: 'ps-AF-Standard-A' },
  pa: { languageCode: 'pa-IN', name: 'pa-IN-Standard-A' },
};


export async function POST(req: NextRequest) {
  const { text, locale } = await req.json();
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'Google API key is not configured.' }, { status: 500 });
  }

  if (!text || !locale) {
    return NextResponse.json({ error: 'Missing text or locale' }, { status: 400 });
  }

  const voice = localeToVoice[locale];
  if (!voice) {
    return NextResponse.json({ error: `Unsupported locale: ${locale}` }, { status: 400 });
  }

  const ttsUrl = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;

  try {
    const response = await fetch(ttsUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: { text },
        voice: {
          languageCode: voice.languageCode,
          name: voice.name,
        },
        audioConfig: { audioEncoding: 'MP3' },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error('Google TTS API Error:', errorBody);
      return NextResponse.json({ error: 'Failed to synthesize speech', details: errorBody }, { status: response.status });
    }

    const data = await response.json();
    const audioContent = data.audioContent;
    
    if (!audioContent) {
      return NextResponse.json({ error: 'No audio content in response' }, { status: 500 });
    }

    const audioSrc = `data:audio/mp3;base64,${audioContent}`;
    return NextResponse.json({ audio: audioSrc });

  } catch (error) {
    console.error('Error calling Google TTS API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
