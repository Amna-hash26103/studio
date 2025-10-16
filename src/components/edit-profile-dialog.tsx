
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
    coverPhotoURL?: string;
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
const coverImageOptions = PlaceHolderImages.filter(p => p.id.startsWith('user-cover'));

export function EditProfileDialog({
  userProfile,
  open,
  onOpenChange,
}: EditProfileDialogProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState(userProfile.profilePhotoURL);
  const [selectedCoverUrl, setSelectedCoverUrl] = useState(userProfile.coverPhotoURL);

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
    setSelectedCoverUrl(userProfile.coverPhotoURL);
  }, [userProfile, open, form]);


  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return;
    setIsSaving(true);
    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      const updatedData: any = { ...values };

      let authProfileNeedsUpdate = false;

      // Only update profilePhotoURL if it has changed
      if (selectedAvatarUrl !== userProfile.profilePhotoURL) {
        updatedData.profilePhotoURL = selectedAvatarUrl;
        authProfileNeedsUpdate = true;
      }
      
      // Only update coverPhotoURL if it has changed
      if (selectedCoverUrl !== userProfile.coverPhotoURL) {
          updatedData.coverPhotoURL = selectedCoverUrl;
      }

      if (values.displayName !== userProfile.displayName) {
        authProfileNeedsUpdate = true;
      }
      
      await updateDoc(userDocRef, updatedData);

      if (authProfileNeedsUpdate) {
          await updateProfile(user, { 
              displayName: values.displayName,
              photoURL: updatedData.profilePhotoURL || userProfile.profilePhotoURL 
          });
      }

      toast({
        title: "Profile Updated!",
        description: "Your changes have been saved successfully.",
      });
      onOpenChange(false);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>Make changes to your profile here. Click save when you're done.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form id="edit-profile-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
             <div className="space-y-4">
                <FormLabel>Cover Photo</FormLabel>
                <div className="relative w-full aspect-video rounded-md overflow-hidden bg-muted">
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
                            <Image src={cover.imageUrl} alt={cover.description} fill className="object-cover" />
                        </button>
                    ))}
                </div>
              </div>
            
            <div className="flex flex-col items-center gap-4">
               <Avatar className="h-24 w-24 border-2 border-primary">
                  <AvatarImage src={selectedAvatarUrl} />
                  <AvatarFallback>
                    <UserIcon size={40} />
                  </AvatarFallback>
                </Avatar>
              
              <div className="w-full">
                <FormLabel>Change Picture</FormLabel>
                <div className="mt-2 grid grid-cols-5 gap-2 sm:grid-cols-6">
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
          </form>
        </Form>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" form="edit-profile-form" disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isSaving ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
