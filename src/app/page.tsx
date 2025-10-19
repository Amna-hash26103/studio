'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FemmoraLogo } from '@/components/icons';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const SoulSpaceIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 21.5C17.2467 21.5 21.5 17.2467 21.5 12C21.5 6.75329 17.2467 2.5 12 2.5C6.75329 2.5 2.5 6.75329 2.5 12C2.5 17.2467 6.75329 21.5 12 21.5Z" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 10.5C16 12.9853 14.2091 15 12 15C9.79086 15 8 12.9853 8 10.5C8 8.01472 9.79086 6 12 6C14.2091 6 16 8.01472 16 10.5Z" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M12 15L12 18" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const HerHealthIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 21.5C17.2467 21.5 21.5 17.2467 21.5 12C21.5 6.75329 17.2467 2.5 12 2.5C6.75329 2.5 2.5 6.75329 2.5 12C2.5 17.2467 6.75329 21.5 12 21.5Z" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15 9L9 15" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15 15L9 9" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const NourishIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 21.5C17.2467 21.5 21.5 17.2467 21.5 12C21.5 6.75329 17.2467 2.5 12 2.5C6.75329 2.5 2.5 6.75329 2.5 12C2.5 17.2467 6.75329 21.5 12 21.5Z" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 8L10.5 10L12 12L13.5 10L12 8Z" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 12L14 13.5L12 12L14 10.5L16 12Z" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 16L13.5 14L12 12L10.5 14L12 16Z" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 12L10 10.5L12 12L10 13.5L8 12Z" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const EvolveIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 21.5C17.2467 21.5 21.5 17.2467 21.5 12C21.5 6.75329 17.2467 2.5 12 2.5C6.75329 2.5 2.5 6.75329 2.5 12C2.5 17.2467 6.75329 21.5 12 21.5Z" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 12H16" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 8V16" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CircleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 21.5C17.2467 21.5 21.5 17.2467 21.5 12C21.5 6.75329 17.2467 2.5 12 2.5C6.75329 2.5 2.5 6.75329 2.5 12C2.5 17.2467 6.75329 21.5 12 21.5Z" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const FEMMindIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 21.5C17.2467 21.5 21.5 17.2467 21.5 12C21.5 6.75329 17.2467 2.5 12 2.5C6.75329 2.5 2.5 6.75329 2.5 12C2.5 17.2467 6.75329 21.5 12 21.5Z" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 15.5C9 15.5 9.83333 17 12 17C14.1667 17 15 15.5 15 15.5" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 9.5C9 9.5 9.83333 11 12 11C14.1667 11 15 9.5 15 9.5" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const features = [
  {
    icon: <SoulSpaceIcon />,
    title: 'SoulSpace',
    description: 'An emotional wellness companion to guide you through your feelings.',
  },
  {
    icon: <HerHealthIcon />,
    title: 'HerHealth',
    description: 'Smart health insights for cycle tracking and body awareness.',
  },
  {
    icon: <NourishIcon />,
    title: 'Nourish',
    description: 'A personalized diet and nutrition guide for holistic well-being.',
  },
  {
    icon: <EvolveIcon />,
    title: 'Evolve',
    description: 'Gentle fitness routines and energy flows to align with your body.',
  },
  {
    icon: <CircleIcon />,
    title: 'Circle',
    description: 'Connect with the FEMMORA community in a safe and supportive space.',
  },
  {
    icon: <FEMMindIcon />,
    title: 'FEMMind',
    description: 'Your AI-guided partner for personal and professional growth.',
  },
];

const thriveImage = PlaceHolderImages.find((img) => img.id === 'hero-1');

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="container mx-auto flex h-24 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-3">
          <FemmoraLogo className="h-10 w-10 text-primary" />
          <span className="text-2xl font-bold tracking-tight font-headline text-foreground">FEMMORA</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Log In</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        <section className="w-full py-16 md:py-24 lg:py-32 text-center">
          <div className="container px-4 md:px-6">
            <div className="max-w-4xl mx-auto space-y-6">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl text-foreground">
                Empower Your Journey. Together.
              </h1>
              <p className="text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto">
                FEMMORA is a sanctuary for women to connect, share, and flourish. Explore wellness, creativity, and community in a space designed for you.
              </p>
              <div className="pt-6">
                <Button size="lg" asChild>
                  <Link href="/signup">Join the Community</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-16 md:py-24">
            <div className="container px-4 md:px-6">
                <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl">
                        {thriveImage && (
                            <Image
                                src={thriveImage.imageUrl}
                                alt={thriveImage.description}
                                data-ai-hint={thriveImage.imageHint}
                                fill
                                className="object-cover"
                            />
                        )}
                    </div>
                    <div className="space-y-4 text-center lg:text-left">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">A Space to Thrive</h2>
                        <p className="text-muted-foreground md:text-lg">
                            We believe in the power of collective strength. FEMMORA is more than just an app—it's a movement dedicated to supporting every woman's unique journey. Share your story, find inspiration, and grow with us.
                        </p>
                    </div>
                </div>
            </div>
        </section>
        
        <section className="w-full py-16 md:py-24">
            <div className="container px-4 md:px-6">
                <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Features Designed for You</h2>
                    <p className="text-muted-foreground md:text-lg">
                        Everything you need to support your personal and professional growth, all in one place.
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature) => (
                        <div key={feature.title} className="flex flex-col items-center text-center p-6 rounded-xl border bg-card shadow-sm hover:shadow-md transition-shadow">
                            <div className="mb-4 text-primary">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                            <p className="text-muted-foreground text-sm">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>

      </main>

      <footer>
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-8 md:flex-row md:px-6">
          <div className="flex items-center gap-2">
            <FemmoraLogo className="h-6 w-6 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} FEMMORA — Empowering women worldwide.
            </span>
          </div>
          <nav className="flex gap-4 sm:gap-6">
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              About
            </Link>
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Community
            </Link>
             <Link
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Contact
            </Link>
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
          </nav>
        </div>
      </footer>
    </div>
  );
}
