'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FemmoraLogo } from '@/components/icons';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useAuth, useFirestore } from '@/firebase';
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { sendWelcomeEmail } from '@/ai/flows/send-welcome-email';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const formSchema = z.object({
  displayName: z.string().min(2, {
    message: 'Display name must be at least 2 characters.',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  password: z.string().min(6, {
    message: 'Password must be at least 6 characters.',
  }),
});

export default function SignupPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!auth || !firestore) {
         toast({
            variant: 'destructive',
            title: "Signup Failed",
            description: "Authentication service is not available. Please try again later.",
        });
        return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      const user = userCredential.user;

      const defaultAvatar = PlaceHolderImages.find(p => p.id === 'user-avatar-1');
      const defaultAvatarUrl = defaultAvatar?.imageUrl || 'https://i.postimg.cc/rpZB0rnG/cute-cartoon-kid-posing-portrait.jpg';
      
      const defaultCover = PlaceHolderImages.find(p => p.id === 'user-profile-cover');
      const defaultCoverUrl = defaultCover?.imageUrl;

      await updateProfile(user, {
        displayName: values.displayName,
        photoURL: defaultAvatarUrl,
      });

      const userProfile = {
        id: user.uid,
        displayName: values.displayName,
        email: values.email,
        bio: '',
        interests: [],
        location: '',
        profilePhotoURL: defaultAvatarUrl,
        coverPhotoURL: defaultCoverUrl,
        projectIds: []
      };

      await setDoc(doc(firestore, 'users', user.uid), userProfile);

      sendWelcomeEmail({ name: values.displayName, email: values.email });

      toast({
        title: "Account Created!",
        description: "Welcome to FEMMORA! We’re so glad to have you here 💜",
      });

      router.push('/feed');
    } catch (error: any) {
      console.error('Error signing up:', error);
      if (error.code === 'auth/email-already-in-use') {
        form.setError('email', {
          type: 'manual',
          message: "This email is already in use. Please log in instead.",
        });
      } else {
        toast({
          variant: 'destructive',
          title: "Signup Failed",
          description: "There was a problem creating your account. Please try again.",
        });
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 font-body">
      <Card className="w-full max-w-md border-0 shadow-lg bg-card">
        <CardHeader className="flex flex-col items-center justify-center space-y-4 pt-8 pb-4">
           <Link href="/" className="mb-2 flex items-center justify-center">
            <FemmoraLogo className="h-24 w-24 text-primary" />
          </Link>
          <CardTitle className="font-headline text-3xl font-bold text-foreground">
            Join FEMMORA
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Create your account and start your journey of empowerment.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-8 pb-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Name" {...field} className="bg-secondary/20 border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        className="bg-secondary/20 border-border"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} className="bg-secondary/20 border-border"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Processing..." : "Create Account"}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-accent-foreground underline">
              Log In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
