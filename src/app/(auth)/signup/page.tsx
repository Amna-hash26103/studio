'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { useAuth } from '@/firebase';
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { setDoc, doc, getFirestore } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { sendWelcomeEmail } from '@/ai/flows/send-welcome-email';

// ✅ Validation Schema using Zod
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
  const firestore = getFirestore(auth.app);
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

  // ✅ Handle Signup Submission
  async function onSubmit(values: z.infer<typeof formSchema>) {
    // 🔹 Special Case: Test email flow without registration
    if (
      values.displayName === 'amna' &&
      values.email === 'amna26103@gmail.com' &&
      values.password === 'amna1234.,@'
    ) {
      try {
        await sendWelcomeEmail({ name: values.displayName, email: values.email });
        toast({
          title: 'Email Sent!',
          description: `A welcome email has been sent to ${values.email}. This user was not registered.`,
        });
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: error.message || 'Could not send the test email.',
        });
      }
      return;
    }

    // 🔹 Regular User Signup Flow
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: values.displayName,
      });

      // ✅ Correct Firestore path: store user profile in "users/{uid}"
      const userProfile = {
        id: user.uid,
        displayName: values.displayName,
        email: values.email,
        bio: '',
        interests: [],
        location: '',
        profilePhotoURL: user.photoURL || '',
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(firestore, 'users', user.uid), userProfile);

      // ✅ Send Welcome Email (non-blocking)
      sendWelcomeEmail({ name: values.displayName, email: values.email });

      toast({
        title: 'Account Created!',
        description: 'Welcome to FEMMORA! We’re so glad to have you here 💜',
      });

      router.push('/feed');
    } catch (error: any) {
      console.error('Error signing up:', error);
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description:
          error.message ||
          'There was a problem creating your account. Please try again.',
      });
    }
  }

  // ✅ JSX Layout
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="mb-4 inline-block">
            <FemmoraLogo className="mx-auto h-35 w-35 text-primary" />
          </Link>
          <CardTitle className="font-headline text-2xl">
            Join FEMMORA
          </CardTitle>
          <CardDescription>
            Create your account and start your journey of empowerment.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Name" {...field} />
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
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? 'Processing...' : 'Create Account'}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-primary">
              Log In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
