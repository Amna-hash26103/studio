
'use client';

import { useParams } from 'next/navigation';
import { useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, query, where, orderBy } from 'firebase/firestore';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Loader2, Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import { DUMMY_PROFILES, DummyProfile } from '@/lib/dummy-profiles';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ReadAloudButton } from '@/components/read-aloud-button';

type Post = {
    id: string;
    author: string;
    authorId: string;
    avatar?: string;
    time: string;
    content: string;
    lang: 'en' | 'ur-RO';
    originalContent?: string;
    image?: { imageUrl: string; imageHint: string };
    likes: number;
    likedBy: string[];
    comments: any[];
    isTranslated?: boolean;
    createdAt: any;
};

function PostCard({ post }: { post: Post }) {
    const contentToRead = (post.isTranslated && post.originalContent) ? post.originalContent : post.content;
    const langToRead = (post.isTranslated && post.originalContent) ? 'en' : post.lang;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar className="ring-1 ring-primary">
                            <AvatarImage src={post.avatar} />
                            <AvatarFallback>{post.author.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold">{post.author}</p>
                            <p className="text-sm text-muted-foreground">{post.time}</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-1'>
                        <ReadAloudButton textToRead={contentToRead} lang={langToRead} />
                        <Button variant="ghost" size="sm">Translate</Button>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-5 w-5" /></Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <p className="mb-4 whitespace-pre-wrap">{post.content}</p>
                {post.image && (
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                        <Image src={post.image.imageUrl} alt="Post image" data-ai-hint={post.image.imageHint} fill className="object-cover" />
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-4">
                <div className="flex w-full items-center justify-between text-muted-foreground">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" className="flex items-center gap-2">
                            <Heart className={cn("h-4 w-4")} /> {post.likes}
                        </Button>
                        <Button variant="ghost" size="sm" className="flex items-center gap-2">
                            <MessageCircle className="h-4 w-4" /> {post.comments.length}
                        </Button>
                        <Button variant="ghost" size="sm" className="flex items-center gap-2">
                            <Share2 className="h-4 w-4" /> Share
                        </Button>
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
}

export default function UserProfilePage() {
    const params = useParams();
    const userId = params.userId as string;
    const firestore = useFirestore();

    const isDummyProfile = DUMMY_PROFILES[userId];

    const userProfileRef = useMemoFirebase(() => {
        if (!firestore || !userId || isDummyProfile) return null;
        return doc(firestore, 'users', userId);
    }, [firestore, userId, isDummyProfile]);

    const { data: userProfile, isLoading: isProfileLoading } = useDoc(userProfileRef);

    const postsQuery = useMemoFirebase(() => {
        if (!firestore || !userId || isDummyProfile) return null;
        return query(
            collection(firestore, 'community_posts'),
            where('authorId', '==', userId),
            orderBy('createdAt', 'desc')
        );
    }, [firestore, userId, isDummyProfile]);

    const { data: firestorePosts, isLoading: arePostsLoading } = useCollection<Post>(postsQuery);

    let profileData: DummyProfile | null = null;
    if (isDummyProfile) {
        profileData = DUMMY_PROFILES[userId];
    } else if (userProfile) {
        profileData = {
            id: userProfile.id,
            displayName: userProfile.displayName,
            bio: userProfile.bio,
            profilePhotoURL: userProfile.profilePhotoURL,
            coverPhotoURL: userProfile.coverPhotoURL,
            posts: firestorePosts || []
        };
    }
    
    const posts = isDummyProfile ? DUMMY_PROFILES[userId].posts : firestorePosts;


    if (isProfileLoading || arePostsLoading) {
        return (
            <div className="flex h-64 w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!profileData) {
        return <div className="text-center">User profile not found.</div>;
    }

    return (
        <div className="mx-auto max-w-4xl space-y-8">
            <Card>
                <CardContent className="p-0">
                    <div className="relative h-48 w-full">
                        {profileData.coverPhotoURL && (
                            <Image
                                src={profileData.coverPhotoURL}
                                alt={`${profileData.displayName}'s cover photo`}
                                fill
                                className="object-cover"
                            />
                        )}
                        <div className="absolute -bottom-12 left-6">
                            <Avatar className="h-24 w-24 border-4 border-background ring-1 ring-primary">
                                <AvatarImage src={profileData.profilePhotoURL} />
                                <AvatarFallback>{profileData.displayName.slice(0, 2)}</AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                    <div className="pt-16 px-6 pb-6">
                        <h1 className="text-2xl font-bold">{profileData.displayName}</h1>
                        <p className="text-muted-foreground">{profileData.bio}</p>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-4">
                <h2 className="text-xl font-bold">Posts</h2>
                {posts && posts.length > 0 ? (
                    posts.map(post => <PostCard key={post.id} post={post} />)
                ) : (
                    <p className="text-muted-foreground">This user hasn't posted anything yet.</p>
                )}
            </div>
        </div>
    );
}
