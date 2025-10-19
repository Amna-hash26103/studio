'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FemmoraLogo } from '@/components/icons';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ReadAloudButton } from '@/components/read-aloud-button';

const heroImage = PlaceHolderImages.find((img) => img.id === 'hero-1');

// Custom SVG Icons
const SoulSpaceIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="#E55A5A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8.25 10.5C8.25 9.80964 8.80964 9.25 9.5 9.25C10.1904 9.25 10.75 9.80964 10.75 10.5C10.75 11.1904 10.1904 11.75 9.5 11.75C8.80964 11.75 8.25 11.1904 8.25 10.5Z" fill="#E55A5A"/>
    <path d="M13.25 10.5C13.25 9.80964 13.8096 9.25 14.5 9.25C15.1904 9.25 15.75 9.80964 15.75 10.5C15.75 11.1904 15.1904 11.75 14.5 11.75C13.8096 11.75 13.25 11.1904 13.25 10.5Z" fill="#E55A5A"/>
    <path d="M16 14.5C15.3921 15.6531 13.7785 16.5 12 16.5C10.2215 16.5 8.60792 15.6531 8 14.5" stroke="#E55A5A" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const HerHealthIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.3395 3.39135C12.1236 3.16334 11.7801 3.15344 11.5521 3.36935L4.54226 9.94318C4.30154 10.1698 4.3828 10.5658 4.67389 10.686L8.4901 12.247C8.75168 12.3533 9.04944 12.2241 9.15575 11.9625L11.761 5.8443C11.8673 5.58272 11.7381 5.28496 11.4765 5.17865L12.3395 3.39135Z" stroke="#E55A5A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20.6412 11.6739C19.011 10.1118 16.7371 10.2558 15.3409 11.8279L11.8596 15.6591C10.4634 17.2312 10.6074 19.5051 12.2376 21.0672C13.8678 22.6293 16.1417 22.4853 17.5379 20.9132L21.0192 17.082C22.4154 15.51 22.2714 13.236 20.6412 11.6739Z" stroke="#E55A5A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const NourishIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21.5C17.2467 21.5 21.5 17.2467 21.5 12C21.5 6.75329 17.2467 2.5 12 2.5C6.75329 2.5 2.5 6.75329 2.5 12C2.5 17.2467 6.75329 21.5 12 21.5Z" stroke="#E55A5A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 8L10.5 10L12 12L13.5 10L12 8Z" stroke="#E55A5A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 12L14 13.5L12 12L14 10.5L16 12Z" stroke="#E55A5A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 16L13.5 14L12 12L10.5 14L12 16Z" stroke="#E55A5A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8 12L10 10.5L12 12L10 13.5L8 12Z" stroke="#E55A5A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const EvolveIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 12H6L9 3L15 21L18 12H21" stroke="#E55A5A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const CircleIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10.5 10.5C11.8807 10.5 13 9.38071 13 8C13 6.61929 11.8807 5.5 10.5 5.5C9.11929 5.5 8 6.61929 8 8C8 9.38071 9.11929 10.5 10.5 10.5Z" stroke="#E55A5A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 18.5C16 16.567 13.9853 15 11.5 15C9.01472 15 7 16.567 7 18.5" stroke="#E55A5A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M17.5 12.5C18.8807 12.5 20 11.3807 20 10C20 8.61929 18.8807 7.5 17.5 7.5C16.1193 7.5 15 8.61929 15 10C15 11.3807 16.1193 12.5 17.5 12.5Z" stroke="#E55A5A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M21 18.5C21 17.567 20.3284 16.766 19.5 16.25" stroke="#E55A5A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M4 18.5C4 17.567 4.67157 16.766 5.5 16.25" stroke="#E55A5A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const FEMMindIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17 9.5L19 7.5L17 5.5" stroke="#E55A5A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M7 18.5L5 16.5L7 14.5" stroke="#E55A5A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 5.5H12C8.68629 5.5 6 8.18629 6 11.5C6 14.8137 8.68629 17.5 12 17.5H14" stroke="#E55A5A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);


export default function LandingPage() {
  const features = [
    {
      icon: <SoulSpaceIcon />,
      title: 'SoulSpace: Emotional Wellness Companion',
      description: "A safe digital haven where emotions are met with empathy. Whether you're overwhelmed, reflective, or healing, SoulSpace listens — offering guided reflections, gentle prompts, and supportive AI companions who speak your heart's language.",
    },
    {
      icon: <HerHealthIcon />,
      title: 'HerHealth: Smart Health Insights',
      description: "Track your cycles, sleep, and stress in one serene space. HerHealth uses adaptive AI to understand you — recommending lifestyle tweaks, reminders, and supportive routines that honor your body's rhythm.",
    },
    {
      icon: <NourishIcon />,
      title: 'Nourish: Personalized Diet & Nutrition Guide',
      description: "Built for every woman's journey — from strength to self-care. Nourish curates meal suggestions that match your mood, health goals, and culture. Each recommendation comes from a place of love, not restriction.",
    },
    {
      icon: <EvolveIcon />,
      title: 'Evolve: Gentle Fitness & Energy Flow',
      description: "Move at your pace — yoga, mindful movement, and women-focused workouts guided by your energy levels and emotional state. Every motion in Evolve celebrates what your body can do, not what it must.",
    },
    {
      icon: <CircleIcon />,
      title: 'Circle: The FEMMORA Community',
      description: 'A beautifully moderated space for women to connect, share stories, and lift one another. From daily check-ins to creative challenges, Circle celebrates unity without comparison — a digital sisterhood of strength.',
    },
    {
      icon: <FEMMindIcon />,
      title: 'FEMMind: Your AI-Guided Growth Partner',
      description: 'Three fine-tuned, empathetic LLMs — customized to support Health, Emotional Wellness, and Life Guidance. They dont just respond — they understand, blending science with empathy to offer advice that uplifts, not instructs.',
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <FemmoraLogo className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold tracking-tight">FEMMORA</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/login">Log In</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        <section className="w-full py-20 md:py-32 lg:py-40 text-center">
          <div className="container px-4 md:px-6">
            <div className="max-w-3xl mx-auto space-y-4">
              <div className="flex items-center justify-center gap-2">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                  Empower Your Journey. Together.
                </h1>
                <ReadAloudButton textToRead='Empower Your Journey. Together.' />
              </div>
              <div className='flex items-center justify-center gap-2'>
                <p className="text-lg text-muted-foreground md:text-xl">
                  FEMMORA is a sanctuary for women to connect, share, and flourish. Explore wellness, creativity, and community in a space designed for you.
                </p>
                <ReadAloudButton textToRead="FEMMORA is a sanctuary for women to connect, share, and flourish. Explore wellness, creativity, and community in a space designed for you." />
              </div>
              <Button size="lg" asChild>
                <Link href="/signup">Join the Community</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="bg-background py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-2 lg:gap-24">
              <div className="relative h-80 w-full overflow-hidden rounded-xl md:h-[450px]">
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
                 <div className="flex items-center gap-2">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                      A Space to Thrive.
                    </h2>
                    <ReadAloudButton textToRead='A Space to Thrive.' />
                </div>
                <div className='flex items-center justify-center gap-2'>
                    <p className="text-muted-foreground md:text-lg">
                      At FEMMORA, we believe in the power of collective strength. Our platform is more than just an app; it's a movement dedicated to celebrating and supporting every woman's unique path to wellness and success.
                    </p>
                    <ReadAloudButton textToRead="At FEMMORA, we believe in the power of collective strength. Our platform is more than just an app; it's a movement dedicated to celebrating and supporting every woman's unique path to wellness and success." />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-background py-16 md:py-24">
          <div className="container mx-auto text-center">
             <div className="flex items-center justify-center gap-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                  Features Designed for You
                </h2>
                <ReadAloudButton textToRead='Features Designed for You' />
            </div>
             <div className='flex items-center justify-center gap-2'>
                <p className="mt-4 max-w-prose mx-auto text-muted-foreground md:text-lg">
                    Everything you need to support your personal and professional growth, all in one place.
                </p>
                <ReadAloudButton textToRead='Everything you need to support your personal and professional growth, all in one place.' />
            </div>
          </div>
          <div className="container mx-auto mt-12 grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index} className="bg-card border-primary/50 text-left">
                <CardContent className="flex flex-col gap-4 p-6">
                  {feature.icon}
                  <h3 className="text-lg font-bold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="bg-background">
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
              Privacy
            </Link>
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Terms
            </Link>
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Contact
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
