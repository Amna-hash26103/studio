
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
import { signInWithEmailAndPassword, signInAnonymously } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  password: z.string().min(1, {
    message: 'Password is required.',
  }),
});

export default function LoginPage() {
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // 🔹 Special Case: Test user login
    if (
      values.email === 'amna26103@gmail.com' &&
      values.password === 'amna1234.,@'
    ) {
      try {
        // We can sign in anonymously to get a valid session for testing
        await signInAnonymously(auth);
        toast({
          title: 'Logged In!',
          description: 'Welcome back, Test User!',
        });
        router.push('/feed');
      } catch (error: any) {
        console.error('Error signing in anonymously for test:', error);
        toast({
          variant: 'destructive',
          title: 'Uh oh! Test Login Failed.',
          description: 'Could not create an anonymous session for testing.',
        });
      }
      return;
    }

    // 🔹 Regular Login Flow
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      toast({
        title: 'Logged In!',
        description: 'Welcome back!',
      });
      router.push('/feed');
    } catch (error: any) {
      console.error('Error signing in:', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description:
          'Invalid email or password. Please try again.',
      });
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col items-center justify-center space-y-2 pt-2 pb-2">
          <Link href="/" className="mb-2 flex items-center justify-center">
            <div className="flex items-center justify-center">
              <FemmoraLogo className="h-40 w-40 text-primary" />
            </div>
          </Link>
          <CardTitle className="font-headline text-2xl">
            Welcome Back
          </CardTitle>
          <CardDescription>
            Log in to continue your journey with FEMMORA.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    <div className="flex items-center justify-between">
                        <FormLabel>Password</FormLabel>
                        <Link
                        href="#"
                        className="text-sm text-muted-foreground hover:text-primary"
                        >
                        Forgot password?
                        </Link>
                    </div>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Logging In...' : 'Log In'}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm">
            Don't have an account?{' '}
            <Link href="/signup" className="font-semibold text-primary">
              Sign Up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
