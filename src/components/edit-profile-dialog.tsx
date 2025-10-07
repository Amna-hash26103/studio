
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
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
import { useUser, useFirestore } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { Loader2, User as UserIcon } from 'lucide-react';
import { updateProfile } from 'firebase/auth';
import { useTranslations } from 'next-intl';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface EditProfileDialogProps {
  userProfile: {
    id: string;
    displayName: string;
    email: string;
    bio: string;
    location: string;
    profilePhotoURL: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters.'),
  bio: z.string().max(160, 'Bio must be less than 160 characters.').optional(),
  location: z.string().optional(),
});

const avatarOptions = PlaceHolderImages.filter(p => p.id.startsWith('user-avatar'));

export function EditProfileDialog({
  userProfile,
  open,
  onOpenChange,
}: EditProfileDialogProps) {
  const t = useTranslations('EditProfileDialog');
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState(userProfile.profilePhotoURL);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: userProfile.displayName || '',
      bio: userProfile.bio || '',
      location: userProfile.location || '',
    },
  });

  // Reset form and selected avatar when dialog opens/closes or userProfile changes
  useEffect(() => {
    form.reset({
      displayName: userProfile.displayName || '',
      bio: userProfile.bio || '',
      location: userProfile.location || '',
    });
    setSelectedAvatarUrl(userProfile.profilePhotoURL);
  }, [userProfile, open, form]);


  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return;
    setIsSaving(true);
    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      const updatedData: any = { ...values };

      // Only update profilePhotoURL if it has changed
      if (selectedAvatarUrl !== userProfile.profilePhotoURL) {
        updatedData.profilePhotoURL = selectedAvatarUrl;
      }
      
      await updateDoc(userDocRef, updatedData);

      // Only update auth profile if display name or photo URL has changed
      if (values.displayName !== userProfile.displayName || (updatedData.profilePhotoURL && updatedData.profilePhotoURL !== userProfile.profilePhotoURL)) {
          await updateProfile(user, { 
              displayName: values.displayName,
              photoURL: updatedData.profilePhotoURL || userProfile.profilePhotoURL 
          });
      }

      toast({
        title: t('toast.profileSuccess.title'),
        description: t('toast.profileSuccess.description'),
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: 'destructive',
        title: t('toast.profileError.title'),
        description: t('toast.profileError.description'),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form id="edit-profile-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex flex-col items-center gap-4">
               <Avatar className="h-24 w-24 border-2 border-primary">
                  <AvatarImage src={selectedAvatarUrl} />
                  <AvatarFallback>
                    <UserIcon size={40} />
                  </AvatarFallback>
                </Avatar>
              
              <div className="w-full">
                <FormLabel>{t('changePictureButton')}</FormLabel>
                <div className="mt-2 grid grid-cols-4 gap-2">
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
                            <Image src={avatar.imageUrl} alt={avatar.description} fill className="object-cover" />
                        </button>
                    ))}
                </div>
              </div>
            </div>

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
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('bioLabel')}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={t('bioPlaceholder')} {...field} />
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
                  <FormLabel>{t('locationLabel')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('locationPlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            {t('cancelButton')}
          </Button>
          <Button type="submit" form="edit-profile-form" disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isSaving ? t('savingButton') : t('saveButton')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
