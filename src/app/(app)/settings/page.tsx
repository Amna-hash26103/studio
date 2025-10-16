
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { useTheme } from 'next-themes';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Bot, Monitor, Moon, Sun, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { Textarea } from '@/components/ui/textarea';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';


const formSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters.'),
  bio: z.string().max(160, 'Bio must be less than 160 characters.').optional(),
  location: z.string().optional(),
});

const avatarOptions = PlaceHolderImages.filter(p => p.id.startsWith('user-avatar'));
const coverImageOptions = PlaceHolderImages.filter(p => p.id.startsWith('user-cover'));

function ProfileSettings() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    
    const userProfileRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user]);

    const { data: userProfile, isLoading: isProfileLoading } = useDoc(userProfileRef);

    const [isSaving, setIsSaving] = useState(false);
    const [selectedAvatarUrl, setSelectedAvatarUrl] = useState<string | undefined>(undefined);
    const [selectedCoverUrl, setSelectedCoverUrl] = useState<string | undefined>(undefined);
    
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            displayName: '',
            bio: '',
            location: '',
        },
    });

    useEffect(() => {
        if (userProfile) {
            form.reset({
                displayName: userProfile.displayName || '',
                bio: userProfile.bio || '',
                location: userProfile.location || '',
            });
            setSelectedAvatarUrl(userProfile.profilePhotoURL);
            setSelectedCoverUrl(userProfile.coverPhotoURL);
        }
    }, [userProfile, form]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!user || !userProfile) return;
        setIsSaving(true);
        try {
            const userDocRef = doc(firestore, 'users', user.uid);
            const updatedData: any = { 
                ...userProfile,
                ...values,
            };

            let authProfileNeedsUpdate = false;
            
            if (selectedAvatarUrl && selectedAvatarUrl !== userProfile.profilePhotoURL) {
                updatedData.profilePhotoURL = selectedAvatarUrl;
                authProfileNeedsUpdate = true;
            }
            
            if (selectedCoverUrl && selectedCoverUrl !== userProfile.coverPhotoURL) {
                updatedData.coverPhotoURL = selectedCoverUrl;
            }

            if (values.displayName !== userProfile.displayName) {
                authProfileNeedsUpdate = true;
            }
            
            await setDoc(userDocRef, updatedData, { merge: true });

            if (authProfileNeedsUpdate) {
                await updateProfile(user, { 
                    displayName: values.displayName,
                    photoURL: selectedAvatarUrl || userProfile.profilePhotoURL 
                });
            }

            toast({
                title: "Profile Updated!",
                description: "Your changes have been saved successfully.",
            });
        } catch (error) {
            console.error('Error updating profile:', error);
            toast({
                variant: 'destructive',
                title: "Update failed",
                description: "There was a problem saving your profile. Please try again.",
            });
        } finally {
            setIsSaving(false);
        }
    };
    
    if (isUserLoading || isProfileLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Profile</CardTitle>
                    <CardDescription>Manage your public profile information.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
                <CardFooter>
                    <Skeleton className="h-10 w-24" />
                </CardFooter>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>This is how others will see you on the site.</CardDescription>
            </CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label>Cover Photo</Label>
                            <div className="relative w-full aspect-[16/9] rounded-md overflow-hidden bg-muted">
                                {selectedCoverUrl ? <Image src={selectedCoverUrl} alt="Selected cover" fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center text-muted-foreground">No cover selected</div> }
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                {coverImageOptions.map(cover => (
                                    <button
                                        type="button"
                                        key={cover.id}
                                        onClick={() => setSelectedCoverUrl(cover.imageUrl)}
                                        className={cn(
                                            "relative aspect-video w-full overflow-hidden rounded-md ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring",
                                            selectedCoverUrl === cover.imageUrl && "ring-2 ring-primary"
                                        )}
                                    >
                                        <Image src={cover.imageUrl} alt={cover.description} fill className="object-cover" data-ai-hint={cover.imageHint} />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Profile Picture</Label>
                            <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 md:grid-cols-8">
                                {avatarOptions.map(avatar => (
                                    <button
                                        type="button"
                                        key={avatar.id}
                                        onClick={() => setSelectedAvatarUrl(avatar.imageUrl)}
                                        className={cn(
                                            "relative aspect-square w-full overflow-hidden rounded-full ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring",
                                            selectedAvatarUrl === avatar.imageUrl && "ring-2 ring-primary"
                                        )}
                                    >
                                        <Image src={avatar.imageUrl} alt={avatar.description} fill className="object-cover" data-ai-hint={avatar.imageHint} />
                                    </button>
                                ))}
                            </div>
                        </div>
                         <FormField
                            control={form.control}
                            name="displayName"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Display Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Your full name" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                        <FormField
                            control={form.control}
                            name="bio"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Bio</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Tell us a little about yourself" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="location"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Location</FormLabel>
                                <FormControl>
                                    <Input placeholder="Where are you in the world?" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isSaving ? "Saving..." : "Save Profile"}
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    );
}

export default function SettingsPage() {
  const { user } = useUser();
  const { theme, setTheme } = useTheme();
  const [botName, setBotName] = useState('Aura');
  const { toast } = useToast();

  useEffect(() => {
    const storedBotName = localStorage.getItem('chatbotName');
    if (storedBotName) {
      setBotName(storedBotName);
    }
  }, []);

  const handleSaveBotName = () => {
    localStorage.setItem('chatbotName', botName);
    toast({
      title: 'Chatbot name saved!',
      description: `Your support assistant is now named ${botName}.`,
    });
    // Force a re-render of other components if necessary by dispatching a custom event
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your profile, account, and app preferences.
        </p>
      </div>

      <ProfileSettings />

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Manage your account details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={user?.email || ''} readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Button variant="outline" className="w-full sm:w-auto">
              Change Password
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Customize the look and feel of the app.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-medium">Theme</h3>
            <p className="text-sm text-muted-foreground">
              Choose how the app looks on your device.
            </p>
            <div className="flex space-x-2 rounded-lg bg-secondary p-1">
              <Button
                variant={theme === 'light' ? 'default' : 'ghost'}
                onClick={() => setTheme('light')}
                className="w-full"
              >
                <Sun className="mr-2 h-4 w-4" />
                Light
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'ghost'}
                onClick={() => setTheme('dark')}
                className="w-full"
              >
                <Moon className="mr-2 h-4 w-4" />
                Dark
              </Button>
              <Button
                variant={theme === 'system' ? 'default' : 'ghost'}
                onClick={() => setTheme('system')}
                className="w-full"
              >
                <Monitor className="mr-2 h-4 w-4" />
                System
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot /> Chatbot
          </CardTitle>
          <CardDescription>
            Personalize your AI support assistant.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="botName">Chatbot Name</Label>
            <Input
              id="botName"
              value={botName}
              onChange={(e) => setBotName(e.target.value)}
              placeholder="e.g., Aura"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveBotName}>Save Name</Button>
        </CardFooter>
      </Card>
    </div>
  );
}

    