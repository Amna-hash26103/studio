
'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FemmoraLogo } from '@/components/icons';
import { HeartHandshake, Users, Globe } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ReadAloudButton } from '@/components/read-aloud-button';


const heroImage = PlaceHolderImages.find((img) => img.id === 'hero-1');

export default function LandingPage() {
  const features = [
    {
      icon: <HeartHandshake className="h-8 w-8 text-primary" />,
      title: 'Supportive Community',
      description:
        'Connect with like-minded women in a safe and empowering space.',
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: 'Expert-led Workshops',
      description:
        'Grow your skills with workshops on wellness, career, and creativity.',
    },
    {
      icon: <Globe className="h-8 w-8 text-primary" />,
      title: 'Global Connections',
      description:
        'Build a network of inspiring women from around the world.',
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <FemmoraLogo className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold tracking-tight">FEMMORA</span>
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
        
        <section className="relative w-full h-[50vh] md:h-[70vh] flex items-center justify-center text-center px-4">
          <div className="absolute inset-0 bg-primary/10">
              {heroImage && (
                  <Image
                      src={heroImage.imageUrl}
                      alt={heroImage.description}
                      data-ai-hint={heroImage.imageHint}
                      fill
                      className="object-cover"
                      priority
                  />
              )}
               <div className="absolute inset-0 bg-black/40" />
          </div>
          <div className="relative z-10 space-y-6">
            <div className="flex items-center justify-center">
                <h1 className="text-4xl font-bold tracking-tighter text-white sm:text-5xl md:text-6xl lg:text-7xl">
                  Empower Your Journey. Together.
                </h1>
                <ReadAloudButton textToRead='Empower Your Journey. Together.' />
            </div>
            <div className='flex items-center justify-center'>
                 <p className="mx-auto mt-4 max-w-[700px] text-lg text-gray-200 md:text-xl">
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

        <section className="bg-background py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
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
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
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

        <section className="bg-muted/40 py-16 md:py-24">
          <div className="container mx-auto text-center">
             <div className="flex items-center justify-center gap-4">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                  Features Designed for You
                </h2>
                <ReadAloudButton textToRead='Features Designed for You' />
            </div>
            <div className='flex items-center justify-center'>
                <p className="mt-4 max-w-prose mx-auto text-muted-foreground md:text-lg">
                    Everything you need to support your personal and professional growth, all in one place.
                </p>
                <ReadAloudButton textToRead='Everything you need to support your personal and professional growth, all in one place.' />
            </div>
          </div>
          <div className="container mx-auto mt-12 grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index} className="bg-card">
                <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
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

    