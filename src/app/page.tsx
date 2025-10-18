
'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FemmoraLogo } from '@/components/icons';
import { HeartHandshake, Users, Globe, Smile, BrainCircuit, Activity, UtensilsCrossed } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ReadAloudButton } from '@/components/read-aloud-button';
import { firebaseConfig } from '@/firebase/config';


const heroImage = PlaceHolderImages.find((img) => img.id === 'hero-1');

export default function LandingPage() {

  const features = [
    {
      icon: <Smile className="h-8 w-8 text-primary" />,
      title: "SoulSpace: Emotional Wellness Companion",
      description: "A safe digital haven where emotions are met with empathy. Whether you’re overwhelmed, reflective, or healing, SoulSpace listens — offering guided reflections, gentle prompts, and supportive AI companions who speak your heart’s language.",
    },
    {
      icon: <HeartHandshake className="h-8 w-8 text-primary" />,
      title: "HerHealth: Smart Health Insights",
      description: "Track your cycles, sleep, and stress in one serene space. HerHealth uses adaptive AI to understand you — recommending lifestyle tweaks, reminders, and supportive routines that honor your body’s rhythm.",
    },
    {
      icon: <UtensilsCrossed className="h-8 w-8 text-primary" />,
      title: "Nourish: Personalized Diet & Nutrition Guide",
      description: "Built for every woman’s journey — from strength to self-care. Nourish curates meal suggestions that match your mood, health goals, and culture. Each recommendation comes from a place of love, not restriction.",
    },
    {
      icon: <Activity className="h-8 w-8 text-primary" />,
      title: "Evolve: Gentle Fitness & Energy Flow",
      description: "Move at your pace — yoga, mindful movement, and women-focused workouts guided by your energy levels and emotional state. Every motion in Evolve celebrates what your body can do, not what it must.",
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Circle: The FEMMORA Community",
      description: "A beautifully moderated space for women to connect, share stories, and lift one another. From daily check-ins to creative challenges, Circle celebrates unity without comparison — a digital sisterhood of strength.",
    },
    {
      icon: <BrainCircuit className="h-8 w-8 text-primary" />,
      title: "FEMMind: Your AI-Guided Growth Partner",
      description: "Three fine-tuned, empathetic LLMs — customized to support Health, Emotional Wellness, and Life Guidance. They don’t just respond — they understand, blending science with empathy to offer advice that uplifts, not instructs.",
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
          <Button variant="ghost" asChild>
            <Link href="/login">Log In</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        
        {/* Vercel Configuration Display Section */}
        <section className="bg-yellow-100 dark:bg-yellow-900 border-y-4 border-yellow-500 my-8">
            <div className="container mx-auto px-4 md:px-6 py-8">
                <h2 className="font-headline text-3xl font-bold text-yellow-800 dark:text-yellow-200">Vercel Environment Variables</h2>
                <p className="mt-2 text-yellow-700 dark:text-yellow-300">Copy the values below into your Vercel project's Environment Variables settings. Make sure the Key matches exactly.</p>
                <div className="mt-4 p-4 bg-gray-900 text-white rounded-md font-mono text-sm overflow-x-auto">
                    <pre>
                        <code>
                            NEXT_PUBLIC_FIREBASE_API_KEY={process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'Value not found'}<br/>
                            NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN={process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'Value not found'}<br/>
                            NEXT_PUBLIC_FIREBASE_PROJECT_ID={process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'Value not found'}<br/>
                            NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET={process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'Value not found'}<br/>
                            NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID={process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 'Value not found'}<br/>
                            NEXT_PUBLIC_FIREBASE_APP_ID={process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 'Value not found'}<br/>
                            NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID={process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'Value not found'}
                        </code>
                    </pre>
                </div>
                 <p className="mt-4 text-yellow-700 dark:text-yellow-300">
                    If you see "Value not found", you need to find the correct value in your Firebase project settings under Project Settings &gt; General &gt; Your apps &gt; Firebase SDK snippet &gt; Config.
                </p>
            </div>
        </section>


        <section className="relative px-4 pt-12 pb-12 text-center md:px-6">
          <div className="container mx-auto text-center">
            <div className="flex items-center justify-center">
                <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                  Empower Your Journey. Together.
                </h1>
                <ReadAloudButton textToRead='Empower Your Journey. Together.' />
            </div>
            <div className='flex items-center justify-center'>
                 <p className="mx-auto mt-6 max-w-[700px] text-lg text-muted-foreground md:text-xl">
                    FEMMORA is a sanctuary for women to connect, share, and flourish. Explore wellness, creativity, and community in a space designed for you.
                </p>
                <ReadAloudButton textToRead="FEMMORA is a sanctuary for women to connect, share, and flourish. Explore wellness, creativity, and community in a space designed for you." />
            </div>
            <div className="mt-8 flex justify-center">
              <Button size="lg" asChild>
                <Link href="/signup">Join the Community</Link>
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
                      A Space to Thrive.
                    </h2>
                    <ReadAloudButton textToRead='A Space to Thrive.' />
                </div>
                <div className='flex items-center'>
                    <p className="text-muted-foreground md:text-lg">
                      At FEMMORA, we believe in the power of collective strength. Our platform is more than just an app; it's a movement dedicated to celebrating and supporting every woman's unique path to wellness and success.
                    </p>
                    <ReadAloudButton textToRead="At FEMMORA, we believe in the power of collective strength. Our platform is more than just an app; it's a movement dedicated to celebrating and supporting every woman's unique path to wellness and success." />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative px-4 py-16 md:px-6 md:py-20">
          <div className="container mx-auto mb-12 max-w-2xl text-center">
             <div className="flex items-center justify-center gap-4">
                <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">
                  Features Designed for You.
                </h2>
                <ReadAloudButton textToRead='Features Designed for You.' />
            </div>
            <div className='flex items-center justify-center'>
                <p className="mt-4 text-muted-foreground md:text-lg">
                    Everything you need to support your personal and professional growth, all in one place.
                </p>
                <ReadAloudButton textToRead='Everything you need to support your personal and professional growth, all in one place.' />
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
