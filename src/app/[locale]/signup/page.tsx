
'use client';

import { Link, useRouter } from 'next-intl/navigation';
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
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('SignupPage');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      const user = userCredential.user;

      const defaultAvatar = PlaceHolderImages.find(p => p.id === 'user-avatar-default');
      const defaultAvatarUrl = defaultAvatar?.imageUrl || 'https://i.postimg.cc/rpZB0rnG/cute-cartoon-kid-posing-portrait.jpg';

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
        projectIds: []
      };

      await setDoc(doc(firestore, 'users', user.uid), userProfile);

      sendWelcomeEmail({ name: values.displayName, email: values.email });

      toast({
        title: t('toast.success.title'),
        description: t('toast.success.description'),
      });

      router.push(`/feed`);
    } catch (error: any) {
      console.error('Error signing up:', error);
      if (error.code === 'auth/email-already-in-use') {
        form.setError('email', {
          type: 'manual',
          message: t('toast.error.emailInUse'),
        });
      } else {
        toast({
          variant: 'destructive',
          title: t('toast.error.title'),
          description: t('toast.error.description'),
        });
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col items-center justify-center space-y-2 pt-2 pb-2">
          <Link href="/" className="mb-2 flex items-center justify-center">
            <div className="flex items-center justify-center">
              <FemmoraLogo className="h-70 w-70 text-primary" />
            </div>
          </Link>
          <CardTitle className="font-headline text-2xl">
            {t('title')}
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            {t('description')}
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
                    <FormLabel>{t('displayNameLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('displayNamePlaceholder')} {...field} />
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
                    <FormLabel>{t('emailLabel')}</FormLabel>
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
                    <FormLabel>{t('passwordLabel')}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
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
                {form.formState.isSubmitting ? t('creatingAccountButton') : t('createAccountButton')}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm">
            {t('hasAccountPrompt')}{' '}
            <Link href="/login" className="font-semibold text-primary">
              {t('logInLink')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
