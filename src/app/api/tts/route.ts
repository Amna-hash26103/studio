import { NextRequest, NextResponse } from 'next/server';
import textToSpeech from '@google-cloud/text-to-speech';
import { Readable } from 'stream';
import credentials from '../../google-services.json';

// Initialize the client with the project ID from the credentials file
const client = new textToSpeech.TextToSpeechClient({
  projectId: credentials.project_info.project_id,
});


async function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

export async function POST(req: NextRequest) {
  try {
    const { text, locale } = await req.json();

    if (!text || !locale) {
      return NextResponse.json({ error: 'Missing text or locale' }, { status: 400 });
    }

    const languageCodeMapping: Record<string, string> = {
      en: 'en-US',
      ur: 'ur-PK',
      ps: 'ps-AF',
      pa: 'pa-IN',
    };

    const languageCode = languageCodeMapping[locale] || 'en-US';

    const voiceNameMapping: Record<string, string> = {
        en: 'en-US-Standard-A',
        ur: 'ur-PK-Standard-A',
        ps: 'ps-AF-Standard-A',
        pa: 'pa-IN-Standard-A',
    }


    const request = {
      input: { text: text },
      voice: { 
        languageCode: languageCode,
        name: voiceNameMapping[locale],
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
