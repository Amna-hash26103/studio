
import { NextRequest, NextResponse } from 'next/server';
import textToSpeech from '@google-cloud/text-to-speech';
import credentials from '../../google-services.json';

// Initialize the client with the project ID from the credentials file
const client = new textToSpeech.TextToSpeechClient({
  projectId: credentials.project_info.project_id,
});

export async function POST(req: NextRequest) {
  try {
    const { text, locale } = await req.json();

    if (!text || !locale) {
      return NextResponse.json({ error: 'Missing text or locale' }, { status: 400 });
    }

    const languageCodeMapping: Record<string, string> = {
      en: 'en-US',
      ur: 'ur-PK',
      'ur-RO': 'ur-PK', // Roman Urdu uses the Urdu voice
      ps: 'ps-AF',
      pa: 'pa-IN',
    };

    const languageCode = languageCodeMapping[locale] || 'en-US';

    // Use voice names that are confirmed to be female for the respective languages.
    const voiceNameMapping: Record<string, string> = {
        en: 'en-US-Standard-C',
        ur: 'ur-PK-Standard-C',
        'ur-RO': 'ur-PK-Standard-C',
        ps: 'ps-AF-Standard-A', // Pashto has limited standard voices, 'A' is female.
        pa: 'pa-IN-Standard-C',
    }

    const voiceName = voiceNameMapping[locale] || voiceNameMapping['en'];

    const request = {
      input: { text: text },
      voice: { 
        languageCode: languageCode,
        name: voiceName,
        ssmlGender: 'FEMALE' as const 
      },
      audioConfig: { audioEncoding: 'MP3' as const },
    };

    // Performs the text-to-speech request
    const [response] = await client.synthesizeSpeech(request);
    
    if (!response.audioContent) {
      return NextResponse.json({ error: 'Failed to generate audio content.' }, { status: 500 });
    }

    // Return the audio content as a base64 string
    const audioBase64 = Buffer.from(response.audioContent).toString('base64');
    return NextResponse.json({ audioContent: audioBase64 });

  } catch (error: any) {
    console.error('ERROR in TTS route:', error);
    return NextResponse.json({ error: error.message || 'An unknown error occurred' }, { status: 500 });
  }
}
