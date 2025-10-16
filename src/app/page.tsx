
'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FemmoraLogo } from '@/components/icons';
import { HeartHandshake, Users, Globe, Smile, BrainCircuit, Activity, UtensilsCrossed } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ReadAloudButton } from '@/components/read-aloud-button';
import { useTranslation, languages } from '@/lib/i18n';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


const heroImage = PlaceHolderImages.find((img) => img.id === 'hero-1');

export default function LandingPage() {
  const { t, setLanguage, lang } = useTranslation();

  const features = [
    {
      icon: <Smile className="h-8 w-8 text-primary" />,
      title: t('landing.features.soulspace.title'),
      description: t('landing.features.soulspace.description'),
    },
    {
      icon: <HeartHandshake className="h-8 w-8 text-primary" />,
      title: t('landing.features.herhealth.title'),
      description: t('landing.features.herhealth.description'),
    },
    {
      icon: <UtensilsCrossed className="h-8 w-8 text-primary" />,
      title: t('landing.features.nourish.title'),
      description: t('landing.features.nourish.description'),
    },
    {
      icon: <Activity className="h-8 w-8 text-primary" />,
      title: t('landing.features.evolve.title'),
      description: t('landing.features.evolve.description'),
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: t('landing.features.circle.title'),
      description: t('landing.features.circle.description'),
    },
    {
      icon: <BrainCircuit className="h-8 w-8 text-primary" />,
      title: t('landing.features.femmind.title'),
      description: t('landing.features.femmind.description'),
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="container mx-auto flex h-26 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <FemmoraLogo className="h-14 w-14 text-primary" />
          <span className="text-2xl font-bold tracking-tight leading-none">FEMMORA</span>
        </Link>
        <nav className="flex items-center gap-2">
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Globe className="h-5 w-5" />
                <span className="sr-only">Select language</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {languages.map(({code, name}) => (
                <DropdownMenuItem key={code} onSelect={() => setLanguage(code)}>
                  {name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" asChild>
            <Link href="/login">{t('landing.login')}</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">{t('landing.signup')}</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        <section className="relative px-4 pt-12 pb-12 text-center md:px-6">
          <div className="container mx-auto text-center">
            <div className="flex items-center justify-center">
                <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                  {t('landing.hero.title')}
                </h1>
                <ReadAloudButton textToRead={t('landing.hero.title')} lang={lang} />
            </div>
            <div className='flex items-center justify-center'>
                 <p className="mx-auto mt-6 max-w-[700px] text-lg text-muted-foreground md:text-xl">
                    {t('landing.hero.subtitle')}
                </p>
                <ReadAloudButton textToRead={t('landing.hero.subtitle')} lang={lang} />
            </div>
            <div className="mt-8 flex justify-center">
              <Button size="lg" asChild>
                <Link href="/signup">{t('landing.hero.cta')}</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="bg-secondary py-8">
          <div className="container mx-auto px-4 md:px-6">
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
                      {t('landing.thrive.title')}
                    </h2>
                    <ReadAloudButton textToRead={t('landing.thrive.title')} lang={lang} />
                </div>
                <div className='flex items-center'>
                    <p className="text-muted-foreground md:text-lg">
                      {t('landing.thrive.subtitle')}
                    </p>
                    <ReadAloudButton textToRead={t('landing.thrive.subtitle')} lang={lang} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative px-4 py-16 md:px-6 md:py-20">
          <div className="container mx-auto mb-12 max-w-2xl text-center">
             <div className="flex items-center justify-center gap-4">
                <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">
                  {t('landing.features.title')}
                </h2>
                <ReadAloudButton textToRead={t('landing.features.title')} lang={lang} />
            </div>
            <div className='flex items-center justify-center'>
                <p className="mt-4 text-muted-foreground md:text-lg">
                    {t('landing.features.subtitle')}
                </p>
                <ReadAloudButton textToRead={t('landing.features.subtitle')} lang={lang} />
            </div>
          </div>
          <div className="container mx-auto grid max-w-7xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index} className="bg-card shadow-md transition-shadow hover:shadow-lg">
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
              © {new Date().getFullYear()} FEMMORA. {t('landing.footer.rights')}
            </span>
          </div>
          <nav className="flex gap-4">
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {t('landing.footer.privacy')}
            </Link>
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {t('landing.footer.terms')}
            </Link>
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {t('landing.footer.contact')}
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
