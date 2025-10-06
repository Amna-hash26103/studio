
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { useAuth, useFirestore } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile, User } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { ScrollArea } from './ui/scroll-area';

const avatarGallery = [
  'https://i.postimg.cc/rpZB0rnG/cute-cartoon-kid-posing-portrait.jpg',
  'https://i.postimg.cc/hGZkzdyj/cute-cartoon-kid-posing-portrait-1.jpg',
  'https://i.postimg.cc/6QQsp004/cute-cartoon-kid-posing-portrait-2.jpg',
  'https://i.postimg.cc/mrrxgwwZ/cute-cartoon-kid-posing-portrait-3.jpg',
  'https://i.postimg.cc/XvvMY88M/cute-cartoon-kid-posing-portrait-4.jpg',
  'https://i.postimg.cc/XvvMY8gR/cute-cartoon-kid-posing-portrait-5.jpg',
  'https://i.postimg.cc/hGGFtrrK/cute-cartoon-kid-posing-portrait-6.jpg'
];


const profileFormSchema = z.object({
  displayName: z.string().min(2, {
    message: 'Display name must be at least 2 characters.',
  }),
  bio: z.string().max(160, 'Bio must not be longer than 160 characters.').optional(),
  location: z.string().max(50, 'Location must not be longer than 50 characters.').optional(),
  profilePhotoURL: z.string().url().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface EditProfileDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  userProfile: {
    displayName: string;
    profilePhotoURL?: string;
    bio?: string;
    location?: string;
  };
}

export function EditProfileDialog({ isOpen, onOpenChange, user, userProfile }: EditProfileDialogProps) {
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(userProfile.profilePhotoURL || null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: userProfile.displayName || '',
      bio: userProfile.bio || '',
      location: userProfile.location || '',
      profilePhotoURL: userProfile.profilePhotoURL || '',
    },
    mode: 'onChange',
  });

  async function onSubmit(data: ProfileFormValues) {
    setIsSaving(true);
    try {
      const newProfilePhotoURL = selectedAvatar || userProfile.profilePhotoURL;
      
      const userDocRef = doc(firestore, 'users', user.uid);
      await updateDoc(userDocRef, {
        displayName: data.displayName,
        bio: data.bio,
        location: data.location,
        profilePhotoURL: newProfilePhotoURL,
      });

      if (auth.currentUser && (auth.currentUser.displayName !== data.displayName || auth.currentUser.photoURL !== newProfilePhotoURL)) {
        await updateProfile(auth.currentUser, {
          displayName: data.displayName,
          photoURL: newProfilePhotoURL,
        });
        await auth.currentUser.reload();
      }

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'There was a problem updating your profile.',
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md grid-rows-[auto_1fr] max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Choose a new avatar and update your details. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full overflow-hidden">
            <ScrollArea className="flex-grow px-6">
              <div className="space-y-4 py-4">
                <div className='space-y-2'>
                  <FormLabel>Avatar</FormLabel>
                  <div className="grid grid-cols-4 gap-2">
                    {avatarGallery.map((url) => (
                      <button
                        type="button"
                        key={url}
                        onClick={() => setSelectedAvatar(url)}
                        className={cn(
                          'relative aspect-square w-full overflow-hidden rounded-full ring-2 ring-transparent transition-all hover:opacity-80',
                          selectedAvatar === url ? 'ring-primary ring-offset-2' : 'ring-transparent'
                        )}
                      >
                        <Image src={url} alt="Avatar option" fill className="object-cover" />
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
                        <Input placeholder="Your Name" {...field} />
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
                        <Textarea
                          placeholder="Tell us a little bit about yourself"
                          className="resize-none"
                          {...field}
                        />
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
                        <Input placeholder="Your Location" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </ScrollArea>
            <div className="p-6 pt-4 flex justify-end border-t">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 'Save changes'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
