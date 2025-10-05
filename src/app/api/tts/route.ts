import { NextResponse } from 'next/server';

// Map locales to Google Cloud TTS language codes
const localeToLanguageCode: Record<string, string> = {
  en: 'en-US',
  ur: 'ur-PK',
  ps: 'ps-AF',
  pa: 'pa-IN',
};

export async function POST(request: Request) {
  try {
    const { text, locale } = await request.json();

    if (!text || !locale) {
      return NextResponse.json({ error: 'Missing text or locale' }, { status: 400 });
    }

    const languageCode = localeToLanguageCode[locale];
    if (!languageCode) {
      return NextResponse.json({ error: `Unsupported locale: ${locale}` }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      console.error('GOOGLE_API_KEY is not set in environment variables.');
      return NextResponse.json({ error: 'Server configuration error: Missing API key.' }, { status: 500 });
    }

    const ttsResponse = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: { text },
        // Using a standard, high-quality voice. Different voices can be selected.
        voice: { languageCode, name: `${languageCode}-Standard-A` }, 
        audioConfig: { audioEncoding: 'MP3' },
      }),
    });

    if (!ttsResponse.ok) {
      const errorBody = await ttsResponse.json();
      console.error('Google TTS API Error:', errorBody);
      return NextResponse.json({ error: 'Failed to synthesize speech.' }, { status: ttsResponse.status });
    }

    const data = await ttsResponse.json();
    const audioContent = data.audioContent; // This is a Base64 string

    if (!audioContent) {
        return NextResponse.json({ error: 'No audio content returned from API.' }, { status: 500 });
    }

    return NextResponse.json({ audio: `data:audio/mp3;base64,${audioContent}` });

  } catch (error) {
    console.error('Error in TTS API route:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
