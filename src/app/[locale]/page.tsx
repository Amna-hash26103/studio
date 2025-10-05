'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FemmoraLogo } from '@/components/icons';
import { Bot, HeartHandshake, Lightbulb, Users, Globe, Volume2, Pause, Loader2 } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useTranslations, useLocale } from 'next-intl';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState, useRef, useCallback } from 'react';
import { textToSpeech } from '@/ai/flows/text-to-speech';

const heroImage = PlaceHolderImages.find((img) => img.id === 'hero-1');

export default function LandingPage() {
  const t = useTranslations('LandingPage');
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlaySound = useCallback(async (sectionId: string, text: string) => {
    // If something is already playing or generating, do nothing.
    if (isGenerating || isPlaying) {
      // Optional: If the currently playing section is clicked, pause it.
      if (isPlaying && activeSection === sectionId) {
        audioRef.current?.pause();
        setIsPlaying(false);
        setActiveSection(null);
      }
      return;
    }

    // Stop any currently playing audio before starting a new one.
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    setIsGenerating(true);
    setActiveSection(sectionId);
    
    try {
      const response = await textToSpeech({ text });
      const audio = new Audio(response.audioDataUri);
      audioRef.current = audio;

      audio.play();
      setIsPlaying(true);
      setIsGenerating(false);

      audio.onended = () => {
        setIsPlaying(false);
        setActiveSection(null);
        audioRef.current = null;
      };
    } catch (error) {
      console.error('Error generating or playing audio:', error);
      setIsPlaying(false);
      setActiveSection(null);
      setIsGenerating(false);
    }
  }, [isPlaying, isGenerating, activeSection]);

  const AudioButton = ({ sectionId, text }: { sectionId: string; text: string }) => {
    const isLoadingThis = isGenerating && activeSection === sectionId;
    const isPlayingThis = isPlaying && activeSection === sectionId;
    const isDisabled = (isGenerating || isPlaying) && activeSection !== sectionId;

    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handlePlaySound(sectionId, text)}
        disabled={isLoadingThis || isDisabled}
        className="ml-2 h-6 w-6"
        aria-label={`Read section aloud`}
      >
        {isLoadingThis ? <Loader2 className="h-4 w-4 animate-spin" /> : (isPlayingThis ? <Pause className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />)}
      </Button>
    );
  };


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
  
  const heroText = `${t('mainHeading')}. ${t('subHeading')}`;
  const thriveText = `${t('thriveHeading')}. ${t('thriveParagraph')}`;
  const featuresText = `${t('featuresHeading')}. ${t('featuresSubHeading')}. ${features.map(f => `${f.title}. ${f.description}`).join(' ')}`;


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
        <section className="px-4 py-16 text-center md:px-6 md:py-24 lg:py-32">
          <div className="flex items-center justify-center">
            <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              {t('mainHeading')}
            </h1>
            <AudioButton sectionId='hero-section' text={heroText} />
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

        <section className="bg-secondary">
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
                 <div className="flex items-center">
                    <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">
                    {t('thriveHeading')}
                    </h2>
                    <AudioButton sectionId='thrive-section' text={thriveText} />
                </div>
                <p className="text-muted-foreground md:text-lg">
                  {t('thriveParagraph')}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-16 md:px-6 md:py-24">
          <div className="container mx-auto mb-12 max-w-2xl text-center">
            <div className="flex items-center justify-center">
                <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">
                {t('featuresHeading')}
                </h2>
                <AudioButton 
                    sectionId='features-intro' 
                    text={featuresText}
                />
            </div>
            <p className="mt-4 text-muted-foreground md:text-lg">
              {t('featuresSubHeading')}
            </p>
          </div>
          <div className="container mx-auto grid max-w-7xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.id} className="text-center">
                <CardContent className="flex flex-col items-center justify-center gap-4 p-6">
                  {feature.icon}
                    <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-muted-foreground">
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
