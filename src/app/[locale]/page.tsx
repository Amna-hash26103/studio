
'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FemmoraLogo } from '@/components/icons';
import { Bot, HeartHandshake, Lightbulb, Users, Globe, Volume2 } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useTranslations } from 'next-intl';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLocale } from 'next-intl';
import { useState, useRef, useEffect } from 'react';

const heroImage = PlaceHolderImages.find((img) => img.id === 'hero-1');

export default function LandingPage() {
  const t = useTranslations('LandingPage');
  const locale = useLocale();

  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const loadVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };
    // Voices are loaded asynchronously
    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();

    // Cleanup speechSynthesis on component unmount
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const audioContent = {
    hero: `${t('mainHeading')} ${t('subHeading')}`,
    thrive: `${t('thriveHeading')} ${t('thriveParagraph')}`,
    features: `${t('featuresHeading')} ${t('featuresSubHeading')}`,
  };

  const handlePlayPause = (section: keyof typeof audioContent) => {
    if (isPlaying === section) {
      window.speechSynthesis.cancel();
      setIsPlaying(null);
      return;
    }

    if (isLoading) {
      window.speechSynthesis.cancel();
      setIsLoading(null);
      setIsPlaying(null);
    }
    
    setIsLoading(section);
    
    const textToSpeak = audioContent[section];
    const newUtterance = new SpeechSynthesisUtterance(textToSpeak);
    
    const femaleVoice = voices.find(
      (voice) => voice.lang.startsWith('en') && (voice.name.includes('Female') || voice.name.includes('Woman') || voice.name.includes('Zira') || voice.gender === 'female')
    ) || voices.find(v => v.lang.startsWith('en'));
    
    if (femaleVoice) {
      newUtterance.voice = femaleVoice;
    }

    newUtterance.lang = 'en-US';

    newUtterance.onstart = () => {
        setIsLoading(null);
        setIsPlaying(section);
    };

    newUtterance.onend = () => {
      setIsPlaying(null);
      utteranceRef.current = null;
    };
    
    newUtterance.onerror = (event) => {
      console.error('SpeechSynthesis Error:', event.error);
      setIsLoading(null);
      setIsPlaying(null);
    };

    utteranceRef.current = newUtterance;
    window.speechSynthesis.speak(newUtterance);
  };

  const features = [
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: t('featureSupportiveCommunityTitle'),
      description: t('featureSupportiveCommunityDescription'),
    },
    {
      icon: <Bot className="h-8 w-8 text-primary" />,
      title: t('featureAIWellnessTitle'),
      description: t('featureAIWellnessDescription'),
    },
    {
      icon: <Lightbulb className="h-8 w-8 text-primary" />,
      title: t('featureProjectCollaborationTitle'),
      description: t('featureProjectCollaborationDescription'),
    },
    {
      icon: <HeartHandshake className="h-8 w-8 text-primary" />,
      title: t('featureHolisticWellbeingTitle'),
      description: t('featureHolisticWellbeingDescription'),
    },
  ];

  const renderSpeakerButton = (section: keyof typeof audioContent) => {
    if (locale !== 'en') return null;

    const Icon = Volume2;
    const isSpinning = isLoading === section || isPlaying === section;
    
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handlePlayPause(section)}
        className="ml-2"
        aria-label={`Read ${section.replace('-', ' ')} aloud`}
      >
        <Icon className={`h-6 w-6 ${isSpinning ? 'animate-pulse' : ''}`} />
      </Button>
    );
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
                <Link href="/ur-RO" locale="ur-RO">Roman Urdu</Link>
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
        <section className="relative px-4 pt-16 pb-4 text-center md:px-6 md:pt-24 lg:pt-32">
          <div className="container mx-auto text-center">
            <div className="flex items-center justify-center gap-4">
                <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                  {t('mainHeading')}
                </h1>
                {renderSpeakerButton('hero')}
            </div>
            <p className="mx-auto mt-6 max-w-[700px] text-lg text-muted-foreground md:text-xl">
              {t('subHeading')}
            </p>
            <div className="mt-8 flex justify-center">
              <Button size="lg" asChild>
                <Link href="/signup">{t('joinButton')}</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="bg-secondary">
          <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
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
                    {renderSpeakerButton('thrive')}
                </div>
                <p className="text-muted-foreground md:text-lg">
                  {t('thriveParagraph')}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="relative px-4 py-16 md:px-6 md:py-24">
          <div className="container mx-auto mb-12 max-w-2xl text-center">
             <div className="flex items-center justify-center gap-4">
                <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">
                  {t('featuresHeading')}
                </h2>
                {renderSpeakerButton('features')}
            </div>
            <p className="mt-4 text-muted-foreground md:text-lg">
              {t('featuresSubHeading')}
            </p>
          </div>
          <div className="container mx-auto grid max-w-7xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <Card key={index} className="z-10 bg-background/80 backdrop-blur-sm">
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
