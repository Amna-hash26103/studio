
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

export function ReadAloudButton({ textToRead, lang = 'en' }: ReadAloudButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Cleanup audio when component unmounts or language changes
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
        setIsPlaying(false);
      }
    };
  }, [lang]);

  const handlePlay = async () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }
    
    // If audio for the current language is already loaded, just play it
    if (audioRef.current) {
        audioRef.current.play();
        setIsPlaying(true);
        return;
    }

    setIsLoading(true);
    try {
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
                description: `Could not translate the text to the selected language.`,
            });
            // We can still try to speak the original text
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
