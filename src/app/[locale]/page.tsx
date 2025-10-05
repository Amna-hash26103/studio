'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FemmoraLogo } from '@/components/icons';
import { Bot, HeartHandshake, Lightbulb, Users, Globe, Play, Pause, Loader2 } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useTranslations, useLocale } from 'next-intl';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState, useRef, useEffect, useCallback } from 'react';

const heroImage = PlaceHolderImages.find((img) => img.id === 'hero-1');

export default function LandingPage() {
  const t = useTranslations('LandingPage');
  const locale = useLocale();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlayPause = useCallback(async (sectionId: string, textToRead: string) => {
    if (activeSection === sectionId && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    setActiveSection(sectionId);

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToRead, locale }),
      });

      if (!response.ok) {
        // Log the detailed error from the API route for easier debugging
        const errorBody = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
        console.error('TTS API responded with an error:', response.status, errorBody);
        throw new Error(`Failed to fetch audio: ${errorBody.error || 'Unknown server error'}`);
      }

      const { audio: audioSrc } = await response.json();
      
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      const newAudio = new Audio(audioSrc);
      audioRef.current = newAudio;

      newAudio.oncanplaythrough = () => {
        newAudio.play();
        setIsLoading(false);
        setIsPlaying(true);
      };

      newAudio.onended = () => {
        setIsPlaying(false);
        setActiveSection(null);
      };
      
      newAudio.onerror = (e) => {
        console.error('Error playing audio:', e);
        alert(`Could not play audio. There was an unexpected error.`);
        setIsLoading(false);
        setIsPlaying(false);
        setActiveSection(null);
      };

    } catch (error: any) {
      console.error('Error in handlePlayPause:', error);
      alert(error.message || 'Failed to generate audio. Please try again later.');
      setIsLoading(false);
      setActiveSection(null);
    }
  }, [activeSection, isPlaying, isLoading, locale]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const features = [
    {
      id: 'featureSupportiveCommunity',
      icon: <Users className="h-8 w-8 text-primary" />,
      title: t('featureSupportiveCommunityTitle'),
      description: t('featureSupportiveCommunityDescription'),
    },
    {
      id: 'featureAIWellness',
      icon: <Bot className="h-8 w-8 text-primary" />,
      title: t('featureAIWellnessTitle'),
      description: t('featureAIWellnessDescription'),
    },
    {
      id: 'featureProjectCollaboration',
      icon: <Lightbulb className="h-8 w-8 text-primary" />,
      title: t('featureProjectCollaborationTitle'),
      description: t('featureProjectCollaborationDescription'),
    },
    {
      id: 'featureHolisticWellbeing',
      icon: <HeartHandshake className="h-8 w-8 text-primary" />,
      title: t('featureHolisticWellbeingTitle'),
      description: t('featureHolisticWellbeingDescription'),
    },
  ];
  
  const textContent = {
    'hero-section': `${t('mainHeading')} ${t('subHeading')}`,
    'thrive-section': `${t('thriveHeading')} ${t('thriveParagraph')}`,
    'features-intro': `${t('featuresHeading')} ${t('featuresSubHeading')}`
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="container mx-auto flex h-26 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <FemmoraLogo className="h-14 w-14 text-primary" />
          <span className="text-2xl font-bold tracking-tight leading-none">FEMMORA</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/login">{t('login')}</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">{t('signup')}</Link>
          </Button>

           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Globe className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <Link href="/en" locale="en">English</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/ur" locale="ur">اردو</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/ps" locale="ps">پښتو</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/pa" locale="pa">پنجابی</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </header>

      <main className="flex-1">
        {/* Section ID: hero-section */}
        <section id="hero-section" className="px-4 py-16 text-center md:px-6 md:py-24 lg:py-32">
          <div className="flex items-center justify-center gap-4">
            <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              {t('mainHeading')}
            </h1>
            <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handlePlayPause('hero-section', textContent['hero-section'])}
                disabled={isLoading && activeSection !== 'hero-section'}
                aria-label="Read hero section aloud"
              >
                {isLoading && activeSection === 'hero-section' ? <Loader2 className="h-6 w-6 animate-spin" /> : (isPlaying && activeSection === 'hero-section' ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />)}
            </Button>
          </div>
          <p className="mx-auto mt-6 max-w-[700px] text-lg text-muted-foreground md:text-xl">
            {t('subHeading')}
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/signup">{t('joinButton')}</Link>
            </Button>
          </div>
        </section>

        {/* Section ID: thrive-section */}
        <section id="thrive-section" className="bg-secondary">
          <div className="container mx-auto px-4 py-16 md:px-6 md:py-24">
            <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-2 lg:gap-16">
              <div className="relative h-64 w-full overflow-hidden rounded-lg shadow-xl md:h-96">
                {heroImage && (
                  <Image
                    src={heroImage.imageUrl}
                    alt={heroImage.description}
                    data-ai-hint={heroImage.imageHint}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
              <div className="space-y-4">
                 <div className="flex items-center gap-4">
                    <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">
                    {t('thriveHeading')}
                    </h2>
                     <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handlePlayPause('thrive-section', textContent['thrive-section'])}
                        disabled={isLoading && activeSection !== 'thrive-section'}
                        aria-label="Read thrive section aloud"
                      >
                        {isLoading && activeSection === 'thrive-section' ? <Loader2 className="h-6 w-6 animate-spin" /> : (isPlaying && activeSection === 'thrive-section' ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />)}
                    </Button>
                </div>
                <p className="text-muted-foreground md:text-lg">
                  {t('thriveParagraph')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section ID: features-intro */}
        <section id="features-intro" className="px-4 py-16 md:px-6 md:py-24">
          <div className="container mx-auto mb-12 max-w-2xl text-center">
            <div className="flex items-center justify-center gap-4">
                <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">
                {t('featuresHeading')}
                </h2>
                 <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handlePlayPause('features-intro', textContent['features-intro'])}
                    disabled={isLoading && activeSection !== 'features-intro'}
                    aria-label="Read features intro aloud"
                  >
                    {isLoading && activeSection === 'features-intro' ? <Loader2 className="h-6 w-6 animate-spin" /> : (isPlaying && activeSection === 'features-intro' ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />)}
                </Button>
            </div>
            <p className="mt-4 text-muted-foreground md:text-lg">
              {t('featuresSubHeading')}
            </p>
          </div>
          <div className="container mx-auto grid max-w-7xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.id}>
                <CardContent className="flex flex-col items-center justify-center gap-4 p-6 text-center">
                  {feature.icon}
                    <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-center text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="bg-muted">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-8 md:flex-row md:px-6">
          <div className="flex items-center gap-2">
            <FemmoraLogo className="h-6 w-6 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} FEMMORA. All rights reserved.
            </span>
          </div>
          <nav className="flex gap-4">
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {t('footerPrivacy')}
            </Link>
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {t('footerTerms')}
            </Link>
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {t('footerContact')}
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
