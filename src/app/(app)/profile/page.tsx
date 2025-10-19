
'use client';

import { useState } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Edit, Mail, MapPin, User as UserIcon, Calendar } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { EditProfileDialog } from '@/components/edit-profile-dialog';
import Image from 'next/image';
import { ReadAloudButton } from '@/components/read-aloud-button';

type UserProfile = {
  id: string;
  displayName: string;
  email: string;
  bio: string;
  location: string;
  profilePhotoURL: string;
  coverPhotoURL?: string;
  createdAt: any;
};

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const userProfileRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const {
    data: userProfile,
    isLoading: isProfileLoading,
    error,
  } = useDoc<UserProfile>(userProfileRef);

  const getJoinedDate = () => {
    if (user?.metadata.creationTime) {
        return new Date(user.metadata.creationTime).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
        });
    }
    return 'A while ago';
  }

  const isLoading = isUserLoading || isProfileLoading;

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (!user || !userProfile) {
    return (
      <div className="text-center">
        <p>Could not load user profile. Please try again later.</p>
        {error && <p className="text-red-500">{error.message}</p>}
      </div>
    );
  }

  return (
    <>
      <Card className="w-full max-w-4xl mx-auto overflow-hidden">
        <CardContent className="p-0">
          <div className="relative h-48 md:h-64 w-full">
            {userProfile.coverPhotoURL ? (
                <Image
                    src={userProfile.coverPhotoURL}
                    alt="Cover photo"
                    fill
                    className="object-cover"
                />
            ) : (
                <div className="w-full h-full bg-muted"></div>
            )}
            <div className="absolute top-4 right-4">
               <Button
                variant="secondary"
                onClick={() => setIsEditDialogOpen(true)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </div>
          </div>
          <div className="relative p-6 -mt-16 z-10 flex flex-col md:flex-row items-center md:items-end gap-6">
            <Avatar className="w-32 h-32 border-4 border-background">
              <AvatarImage src={userProfile.profilePhotoURL} />
              <AvatarFallback className="text-4xl">
                {userProfile.displayName?.charAt(0) || <UserIcon />}
              </AvatarFallback>
            </Avatar>
             <div className="flex flex-col items-center md:items-start space-y-1">
                <div className="flex items-center gap-2">
                    <h1 className="text-3xl font-bold">{userProfile.displayName}</h1>
                    <ReadAloudButton textToRead={userProfile.displayName} />
                </div>
                <div className="flex items-center gap-2">
                    <p className="text-muted-foreground">{userProfile.bio || "No bio yet."}</p>
                    {userProfile.bio && <ReadAloudButton textToRead={userProfile.bio} />}
                </div>
            </div>
          </div>
          <div className="px-6 pb-6 pt-2 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
             <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" /> 
                <span>{userProfile.location || 'Unknown Location'}</span>
                {userProfile.location && <ReadAloudButton textToRead={userProfile.location} />}
            </div>
            <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" /> 
                <span>{userProfile.email}</span>
            </div>
             <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Joined in {getJoinedDate()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <EditProfileDialog
        userProfile={userProfile}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </>
  );
}

function ProfileSkeleton() {
  return (
    <Card className="w-full max-w-4xl mx-auto overflow-hidden">
      <CardContent className="p-0">
        <Skeleton className="h-48 md:h-64 w-full" />
        <div className="relative p-6 -mt-16 z-10 flex flex-col md:flex-row items-center md:items-end gap-6">
          <Skeleton className="w-32 h-32 rounded-full border-4 border-background" />
          <div className="flex flex-col items-center md:items-start space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="px-6 pb-6 pt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </CardContent>
    </Card>
  );
}

    