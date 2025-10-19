
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FemmoraLogo } from '@/components/icons';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ReadAloudButton } from '@/components/read-aloud-button';

const SoulSpaceIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" stroke="hsl(var(--primary))" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M16.5 12.5C16.5 14.98 14.48 17 12 17C9.52 17 7.5 14.98 7.5 12.5C7.5 10.02 9.52 8 12 8C14.48 8 16.5 10.02 16.5 12.5Z" stroke="hsl(var(--primary))" stroke-width="1.5" stroke-linejoin="round"/>
        <path d
="M12 17V20" stroke="hsl(var(--primary))" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M9.5 8C9.5 8 10.42 6.5 12 6.5C13.58 6.5 14.5 8 14.5 8" stroke="hsl(var(--primary))" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
);

const HerHealthIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21.5C17.2467 21.5 21.5 17.2467 21.5 12C21.5 6.75329 17.2467 2.5 12 2.5C6.75329 2.5 2.5 6.75329 2.5 12C2.5 17.2467 6.75329 21.5 12 21.5Z" stroke="hsl(var(--primary))" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M17.8299 10.24C19.1099 11.4 19.4999 13.59 18.2299 15.32C16.6699 17.47 13.5299 18.16 11.3199 16.85C9.1099 15.54 8.0199 12.8 9.1399 10.51C9.6999 9.37 10.6699 8.52 11.7599 8.16" stroke="hsl(var(--primary))" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M6.17004 13.76C4.89004 12.6 4.50004 10.41 5.77004 8.68C7.33004 6.53 10.4701 5.84 12.6801 7.15" stroke="hsl(var(--primary))" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
);

const NourishIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org
/2000/svg">
        <path d="M12 21.5C17.2467 21.5 21.5 17.2467 21.5 12C21.5 6.75329 17.2467 2.5 12 2.5C6.75329 2.5 2.5 6.75329 2.5 12C2.5 17.2467 6.75329 21.5 12 21.5Z" stroke="hsl(var(--primary))" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M16 8.5H8C6.9 8.5 6 9.4 6 10.5V11.5C6 12.6 6.9 13.5 8 13.5H16C17.1 13.5 18 12.6 18 11.5V10.5C18 9.4 17.1 8.5 16 8.5Z" stroke="hsl(var(--primary))" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M8.5 13.5V15.5C8.5 16.6 9.4 17.5 10.5 17.5H13.5C14.6 17.5 15.5 16.6 15.5 15.5V13.5" stroke="hsl(var(--primary))" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M12 8.5V6.5" stroke="hsl(var(--primary))" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
);

const EvolveIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21.5C17.2467 21.5 21.5 17.2467 21.5 12C21.5 6.75329 17.2467 2.5 12 2.5C6.75329 2.5 2.5 6.75329 2.5 12C2.5 17.2467 6.75329 21.5 12 21.5Z" stroke="hsl(var(--primary))" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M15.5 12.5L12 9L8.5 12.5" stroke="hsl(var(--primary))" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M12 15V9" stroke="hsl(var(--primary))" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
);

const CircleIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21.5C17.2467 21.5 21.5 17.2467 21.5 12C21.5 6.75329 17.2467 2.5 12 2.5C6.75329 2.5 2.5 6.75329 2.5 12C2.5 17.2467 6.75329 21.5 12 21.5Z" stroke="hsl(var(--primary))" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="hsl(var(--primary))" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M12 2.5V4.5" stroke="hsl(var(--primary))" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M12 19.5V21.5" stroke="hsl(var(--primary))" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M21.5 12H19.5" stroke="hsl(var(--primary))" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M4.5 12H2.5" stroke="hsl(var(--primary))" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
);

const FEMMindIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21.5C17.2467 21.5 21.5 17.2467 21.5 12C21.5 6.75329 17.2467 2.5 12 2.5C6.75329 2.5 2.5 6.75329 2.5 12C2.5 17.2467 6.75329 21.5 12 21.5Z" stroke="hsl(var(--primary))" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M15 14C15 15.6569 13.6569 17 12 17C10.3431 17 9 15.6569 9 14C9 12.3431 10.3431 11 12 11C13.6569 11 15 12.3431 15 14Z" stroke="hsl(var(--primary))" stroke-width="1.5" stroke-linejoin="round"/>
        <path d="M12 11V8" stroke="hsl(var(--primary))" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M12 8C12.8284 8 13.5 7.32843 13.5 6.5C13.5 5.67157 12.8284 5 12 5C11.1716 5 10.5 5.67157 10.5 6.5C10.5 7.32843 11.1716 8 12 8Z" stroke="hsl(var(--primary))" stroke-width="1.5" stroke-linejoin="round"/>
    </svg>
);


const features = [
  {
    icon: <SoulSpaceIcon />,
    title: 'SoulSpace: Emotional Wellness Companion',
    description: 'This is your sanctuary—a safe, digital haven where every feeling is met with empathy. Gently explore your inner world with guided reflections, calming meditations, and daily check-ins that help you build emotional resilience and find peace, one breath at a time.',
  },
  {
    icon: <HerHealthIcon />,
    title: 'HerHealth: Smart Health Insights',
    description: 'Move from confusion to clarity. Track your cycle, sleep, and stress in one intuitive space, and receive science-based insights that honor your body’s unique rhythm. Our AI-driven reminders help you connect with your patterns, empowering you to take charge of your health.',
  },
  {
    icon: <NourishIcon />,
    title: 'Nourish: Personalized Diet & Nutrition Guide',
    description: 'Nourishing your body is an act of self-love. Let go of one-size-fits-all rules and embrace a routine that feels like your own. Discover daily meal plans, smart ingredient swaps, and gentle nutrition tips that celebrate your lifestyle and help you feel your best.',
  },
  {
    icon: <EvolveIcon />,
    title: 'Evolve: Gentle Fitness & Energy Flow',
    description: 'Movement should be joyful, not a chore. Connect with your body’s strength through mindful yoga, gentle stretches, and energy-based flows. Our routines are designed to make you feel alive, energized, and gracefully in tune with yourself.',
  },
  {
    icon: <CircleIcon />,
    title: 'Circle: The FEMMORA Community',
    description: 'You are not alone. Step into a heartfelt space where women lift each other up. Share your stories, celebrate milestones, and find sisterhood in live sessions and supportive discussions. Here, you are seen, heard, and valued for exactly who you are.',
  },
  {
    icon: <FEMMindIcon />,
    title: 'FEMMind: Your AI-Guided Growth Partner',
    description: 'Your journey to inner clarity starts here. FEMMind is your personal AI companion, offering tailored mindset reflections and empathetic guidance to help you navigate challenges and unlock your potential. It’s a tool for growth, designed with your heart in mind.',
  },
];

const thriveImage = PlaceHolderImages.find((img) => img.id === 'hero-1');

export default function LandingPage() {
  const heroHeading = "Empower Your Journey. Together.";
  const heroSubtext = "FEMMORA is a sanctuary for women to connect, share, and flourish. Explore wellness, creativity, and community in a space designed for you.";

  return (
    <div className="flex min-h-screen flex-col">
      <header className="container mx-auto flex h-24 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-3">
          <FemmoraLogo className="h-10 w-10 text-primary" />
          <span className="text-2xl font-bold tracking-tight">FEMMORA</span>
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
        <section className="w-full py-12 md:py-16 lg:py-20 text-center">
          <div className="container px-4 md:px-6">
            <div className="max-w-5xl mx-auto space-y-6">
               <div className="flex items-center justify-center gap-2">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                  {heroHeading}
                </h1>
                <ReadAloudButton textToRead={heroHeading} />
              </div>
               <div className="flex items-center justify-center gap-2">
                  <p className="text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto">
                    {heroSubtext}
                  </p>
                  <ReadAloudButton textToRead={heroSubtext} />
              </div>
              <div className="pt-6">
                <Button size="lg" className="text-lg px-10 py-6" asChild>
                  <Link href="/signup">Join the Community</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12">
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
                        <div key={feature.title} className="flex flex-col items-center text-center p-8 rounded-xl border bg-secondary shadow-sm hover:shadow-lg transition-shadow">
                            <div className="mb-4 text-primary">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
      </main>

      <footer className="w-full">
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

