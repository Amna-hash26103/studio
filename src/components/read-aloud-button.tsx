
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Play, Square, Volume2 } from 'lucide-react';
import { textToSpeech } from '@/ai/flows/text-to-speech-flow';
import { useToast } from '@/hooks/use-toast';
import { translateText } from '@/ai/flows/translate-text-flow';

interface ReadAloudButtonProps {
  textToRead: string;
  lang?: string; // The target language for translation and speech
}

// Function to create a simple hash for a cache key
const createCacheKey = (text: string, lang: string) => {
    let hash = 0;
    const str = `${lang}-${text}`;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0; // Convert to 32bit integer
    }
    return `tts-audio-cache-${hash}`;
};


export function ReadAloudButton({ textToRead, lang = 'en' }: ReadAloudButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Cleanup audio when component unmounts
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
        setIsPlaying(false);
      }
    };
  }, []);

  const handlePlay = async () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }
    
    setIsLoading(true);
    
    const cacheKey = createCacheKey(textToRead, lang);

    try {
      let audioDataUri = sessionStorage.getItem(cacheKey);

      if (!audioDataUri) {
        // --- Audio not in cache, so we fetch it ---
        let textToSpeak = textToRead;

        // If a target language other than English is specified, translate the text first
        if (lang !== 'en') {
          try {
              const translationResponse = await translateText({ text: textToRead, targetLanguage: lang });
              textToSpeak = translationResponse.translatedText;
          } catch (translationError) {
              console.error(`Translation to ${lang} failed, using original text.`, translationError);
              toast({
                  variant: 'destructive',
                  title: 'Translation Failed',
                  description: `Could not translate the text.`,
              });
          }
        }

        // Generate speech from the (potentially translated) text
        const response = await textToSpeech(textToSpeak);
        audioDataUri = response.audioDataUri;
        
        // Save the newly fetched audio to session storage
        sessionStorage.setItem(cacheKey, audioDataUri);
      }

      // --- Play the audio (from cache or new) ---
      const audio = new Audio(audioDataUri);
      audioRef.current = audio;
      
      audio.play();
      setIsPlaying(true);

      audio.onended = () => {
        setIsPlaying(false);
        audioRef.current = null; // Clear the ref once done
      };
      
      audio.onerror = () => {
        setIsPlaying(false);
        audioRef.current = null;
        console.error("Error playing audio.");
        toast({
            variant: "destructive",
            title: "Playback Error",
            description: "Could not play the generated audio."
        })
      }

    } catch (error) {
      console.error('Error generating or playing speech:', error);
      toast({
        variant: 'destructive',
        title: 'Speech Error',
        description: 'Could not generate or play audio for this text.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const Icon = isPlaying ? Square : (isLoading ? Loader2 : Volume2);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handlePlay}
      disabled={isLoading}
      className="shrink-0 h-6 w-6"
    >
      <Icon className={isLoading ? 'animate-spin h-4 w-4' : 'h-4 w-4'} />
      <span className="sr-only">Read aloud</span>
    </Button>
  );
}
