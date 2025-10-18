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
import { useAuth } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
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
    if (!auth) {
        toast({
            variant: 'destructive',
            title: "Login Failed",
            description: "Authentication service is not available. Please try again later.",
        });
        return;
    }
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      toast({
        title: "Logged In!",
        description: "Welcome back!",
      });
      router.push('/feed');
    } catch (error: any) {
      console.error('Error signing in:', error);
      let description = "An unexpected error occurred. Please try again.";
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-api-key') {
        description = "Invalid email or password. Please check your credentials and try again.";
      }
      
      toast({
        variant: 'destructive',
        title: "Login Failed",
        description: description,
      });
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
            Welcome Back
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Log in to continue your journey with FEMMORA.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                    <div className="flex items-center justify-between">
                        <FormLabel>Password</FormLabel>
                        <Link
                        href="#"
                        className="text-sm text-muted-foreground hover:text-accent-foreground"
                        >
                        Forgot password?
                        </Link>
                    </div>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        className="bg-secondary/20 border-border"
                        {...field} />
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
                {form.formState.isSubmitting ? "Logging In..." : "Log In"}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link href="/signup" className="font-semibold text-accent-foreground underline">
              Sign Up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
