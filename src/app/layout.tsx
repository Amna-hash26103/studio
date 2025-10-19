import type { Metadata, Viewport } from 'next';
import { Alegreya, Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { FirebaseClientProvider } from '@/firebase';
import { ReactNode, Suspense } from 'react';
import { ThemeProvider } from '@/components/theme-provider';

const fontHeadline = Alegreya({
  subsets: ['latin'],
  variable: '--font-headline',
  weight: ['400', '700'],
});

const fontBody = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: "Femmora: Women's Wellness Hub",
  description:
    'A safe and empowering space for women to connect, grow, and thrive.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-body antialiased',
          fontHeadline.variable,
          fontBody.variable
        )}
      >
        <Suspense fallback={<div>Loading...</div>}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <FirebaseClientProvider>
                {children}
              <Toaster />
            </FirebaseClientProvider>
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  );
}
