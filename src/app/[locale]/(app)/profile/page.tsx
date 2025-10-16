'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Calendar, MapPin, Edit } from 'lucide-react';
import Image from 'next/image';
import { useUser, useDoc, useMemoFirebase, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import { EditProfileDialog } from '@/components/edit-profile-dialog';

const galleryImages = [
    PlaceHolderImages.find(i => i.id === 'feed-post-1'),
    PlaceHolderImages.find(i => i.id === 'feed-post-2'),
    PlaceHolderImages.find(i => i.id === 'feed-post-3'),
    PlaceHolderImages.find(i => i.id === 'project-image-1'),
    PlaceHolderImages.find(i => i.id === 'project-image-2'),
]

export default function ProfilePage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading } = useDoc(userProfileRef);

  const coverImage = PlaceHolderImages.find(i => i.id === 'user-profile-cover');

  if (isLoading) {
    return (
        <div className="mx-auto max-w-2xl space-y-12">
            <Card className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <div className="p-6">
                    <div className="relative -mt-20 flex items-end justify-between">
                        <Skeleton className="h-32 w-32 rounded-full border-4 border-background" />
                    </div>
                    <div className="mt-4 space-y-2">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="mt-4 h-16 w-full" />
                     <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="mt-4 flex gap-6">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                </div>
            </Card>
        </div>
    )
  }

  // If after loading, there is still no user profile, show a message
  if (!userProfile) {
    return (
        <div className="mx-auto max-w-2xl space-y-12">
            <Card>
                <CardContent className="p-6 text-center">
                    <p>Could not load user profile. It might not exist yet.</p>
                </CardContent>
            </Card>
        </div>
    )
  }


  return (
    <>
    <div className="mx-auto max-w-2xl space-y-12">
      <Card className="overflow-hidden">
        <div className="relative h-48 w-full">
            {coverImage && <Image src={coverImage.imageUrl} alt="Cover image" data-ai-hint={coverImage.imageHint} fill className="object-cover" />}
        </div>
        <div className="p-6">
            <div className="relative -mt-20 flex items-end justify-between">
                <Avatar className="h-32 w-32 border-4 border-primary">
                    <AvatarImage src={userProfile?.profilePhotoURL || user?.photoURL || undefined} />
                    <AvatarFallback>{userProfile?.displayName?.slice(0,2)}</AvatarFallback>
                </Avatar>
                <Button onClick={() => setIsEditDialogOpen(true)} variant="outline">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Profile
                </Button>
            </div>
            <div className="mt-4">
                <h1 className="font-headline text-3xl font-bold">{userProfile?.displayName}</h1>
                <p className="text-sm text-muted-foreground">@{userProfile?.email.split('@')[0]}</p>
            </div>
            <p className="mt-4 max-w-2xl">{userProfile?.bio || "No bio yet."}</p>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                {userProfile?.location && <div className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {userProfile.location}</div>}
                {user?.metadata.creationTime && <div className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> Joined {new Date(user.metadata.creationTime).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</div>}
            </div>
             <div className="mt-4 flex gap-6">
                <div className="text-sm"><span className="font-bold">{0}</span> Posts</div>
                <div className="text-sm"><span className="font-bold">{0}</span> Followers</div>
                <div className="text-sm"><span className="font-bold">{0}</span> Following</div>
            </div>
        </div>
      </Card>
      
      <Tabs defaultValue="posts" className="w-full">
        <TabsList>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
        </TabsList>
        <TabsContent value="posts">
            <Card>
                <CardContent className="p-6">
                    <p>User's posts will be displayed here.</p>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="projects">
            <Card>
                <CardContent className="p-6">
                    <p>User's projects will be displayed here.</p>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="media">
             <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {galleryImages.filter(img => img).map((image, index) => (
                    image && (
                        <Card key={index} className="overflow-hidden">
                            <div className="relative aspect-square w-full">
                               <Image src={image.imageUrl} alt={image.description} data-ai-hint={image.imageHint} fill className="object-cover" />
                            </div>
                        </Card>
                    )
                ))}
            </div>
        </TabsContent>
      </Tabs>
    </div>
    {userProfile && <EditProfileDialog userProfile={userProfile} open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} />}
    </>
  );
}
