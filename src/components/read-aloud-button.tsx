
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Play, Square, Volume2 } from 'lucide-react';
import { textToSpeech } from '@/ai/flows/text-to-speech-flow';
import { useToast } from '@/hooks/use-toast';
import { translateText } from '@/ai/flows/translate-text-flow';

interface ReadAloudButtonProps {
  textToRead: string;
  lang?: string; // The language of the textToRead
}

// For now, let's hardcode the target "reading" language.
// In the future, this could come from user settings.
const TARGET_READING_LANGUAGE = 'ur-RO'; 

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
      }
    };
  }, []);

  const handlePlay = async () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }
    
    if (audioRef.current) {
        audioRef.current.play();
        setIsPlaying(true);
        return;
    }

    setIsLoading(true);
    try {
      let textToSpeak = textToRead;

      // Translate if the source language is different from the target reading language
      if (lang !== TARGET_READING_LANGUAGE) {
        try {
            const translationResponse = await translateText({ text: textToRead, targetLanguage: TARGET_READING_LANGUAGE });
            textToSpeak = translationResponse.translatedText;
        } catch (translationError) {
            console.error("Translation failed, using original text.", translationError);
            // Optional: toast a message that translation failed
        }
      }

      const response = await textToSpeech(textToSpeak);
      const audio = new Audio(response.audioDataUri);
      audioRef.current = audio;
      
      audio.play();
      setIsPlaying(true);

      audio.onended = () => {
        setIsPlaying(false);
        audioRef.current = null; // Clear the ref once done
      };

    } catch (error) {
      console.error('Error generating speech:', error);
      toast({
        variant: 'destructive',
        title: 'Speech Error',
        description: 'Could not generate audio for this text.',
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
      className="shrink-0"
    >
      <Icon className={isLoading ? 'animate-spin' : ''} />
      <span className="sr-only">Read aloud</span>
    </Button>
  );
}
