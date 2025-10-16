
'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Calendar, MapPin, Edit, Heart, MessageCircle, MoreHorizontal, Send, Share2 } from 'lucide-react';
import Image from 'next/image';
import { useUser, useDoc, useMemoFirebase, useFirestore, useCollection } from '@/firebase';
import { collection, doc, query, where, orderBy, runTransaction, updateDoc, arrayUnion } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect } from 'react';
import { EditProfileDialog } from '@/components/edit-profile-dialog';
import { ReadAloudButton } from '@/components/read-aloud-button';
import { Input } from '@/components/ui/input';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '@/lib/utils';
import { translateText } from '@/ai/flows/translate-text-flow';


type Comment = {
    id: string;
    author: string;
    authorId: string;
    avatar: string;
    content: string;
    createdAt: any;
};

type Post = {
  id: string;
  author: string;
  authorId: string,
  avatar?: string;
  time: string;
  content: string;
  lang: 'en' | 'ur-RO'; // Language of the content
  originalContent?: string;
  image?: { imageUrl: string; imageHint: string };
  likes: number;
  likedBy: string[];
  comments: Comment[];
  isTranslated?: boolean;
  createdAt: any;
};

const galleryImages = [
    PlaceHolderImages.find(i => i.id === 'feed-post-1'),
    PlaceHolderImages.find(i => i.id === 'feed-post-2'),
    PlaceHolderImages.find(i => i.id === 'feed-post-3'),
    PlaceHolderImages.find(i => i.id === 'project-image-1'),
    PlaceHolderImages.find(i => i.id === 'project-image-2'),
]

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const userProfileRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userProfileRef);

  const userPostsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
        collection(firestore, 'community_posts'), 
        where('authorId', '==', user.uid),
        orderBy('createdAt', 'desc')
    );
  }, [user, firestore]);

  const { data: userPosts, isLoading: isLoadingPosts } = useCollection<Post>(userPostsQuery);

  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const initialPost: Post = {
        id: 'initial-user-post-1',
        author: user?.displayName || "You",
        authorId: user?.uid || 'user-id',
        avatar: user?.photoURL || PlaceHolderImages.find(p => p.id === 'user-avatar-1')?.imageUrl,
        time: 'Just now',
        content: 'Just set up my profile! Excited to connect with everyone here. ✨',
        lang: 'en',
        likes: 0,
        likedBy: [],
        comments: [],
        isTranslated: false,
        createdAt: new Date(),
    };

    if (userPosts) {
      const combined = [initialPost, ...userPosts];
       // Deduplicate posts
      const uniquePosts = Array.from(new Map(combined.map(p => [p.id, p])).values());
      uniquePosts.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });
      setPosts(uniquePosts);
    } else {
      setPosts([initialPost]);
    }
  }, [userPosts, user]);
  
  const handleTranslatePost = async (postId: string) => {
      const postToTranslate = posts.find(p => p.id === postId);
      if (!postToTranslate) return;

      // Optimistically toggle translation state
      const originalContent = postToTranslate.originalContent || postToTranslate.content;
      const isCurrentlyTranslated = postToTranslate.isTranslated;

      const updatedPosts = posts.map(p => 
        p.id === postId ? { ...p, isTranslated: !isCurrentlyTranslated } : p
      );
      setPosts(updatedPosts);
      
      // If we are showing the original, just revert the content
      if (isCurrentlyTranslated) {
          const revertPosts = posts.map(p => 
            p.id === postId ? { ...p, content: originalContent, originalContent: undefined, isTranslated: false } : p
          );
          setPosts(revertPosts);
          return;
      }
      
      // Otherwise, fetch translation
      try {
          const { translatedText } = await translateText({
              text: postToTranslate.content,
              targetLanguage: 'ur-RO',
          });
          const translatedPosts = posts.map(p =>
              p.id === postId
                  ? {
                      ...p,
                      originalContent: originalContent,
                      content: translatedText,
                      isTranslated: true
                  }
                  : p
          );
          setPosts(translatedPosts);
      } catch (error) {
          console.error("Translation failed:", error);
          // Revert optimistic update on failure
          setPosts(posts.map(p => p.id === postId ? { ...p, isTranslated: false } : p));
      }
  };

  const handleLikePost = async (postId: string) => {
      if (!user || !firestore || postId.startsWith('initial-')) {
          const updatedPosts = posts.map(p => {
              if (p.id === postId) {
                  const isLiked = p.likedBy.includes(user?.uid || '');
                  const newLikedBy = isLiked ? p.likedBy.filter(uid => uid !== user?.uid) : [...p.likedBy, user?.uid || ''];
                  const newLikes = newLikedBy.length;
                  return { ...p, likes: newLikes, likedBy: newLikedBy };
              }
              return p;
          });
          setPosts(updatedPosts);
          return;
      };
      
      const postRef = doc(firestore, 'community_posts', postId);

      try {
          await runTransaction(firestore, async (transaction) => {
              const postDoc = await transaction.get(postRef);
              if (!postDoc.exists()) {
                  throw "Document does not exist!";
              }

              const postData = postDoc.data() as Post;
              const likedBy = postData.likedBy || [];
              let newLikes;
              let newLikedBy;

              if (likedBy.includes(user.uid)) {
                  // Unlike
                  newLikes = postData.likes - 1;
                  newLikedBy = likedBy.filter(uid => uid !== user.uid);
              } else {
                  // Like
                  newLikes = postData.likes + 1;
                  newLikedBy = [...likedBy, user.uid];
              }
              
              transaction.update(postRef, { likes: newLikes, likedBy: newLikedBy });
          });
      } catch (e) {
          console.error("Like transaction failed: ", e);
      }
  }

  const handleAddComment = async (postId: string, commentText: string) => {
    if (!commentText.trim() || !user || !firestore) return;
    
    const newComment = {
        id: uuidv4(),
        author: user.displayName || 'Anonymous User',
        authorId: user.uid,
        avatar: user.photoURL || PlaceHolderImages.find(p => p.id === 'user-avatar-1')?.imageUrl || '',
        content: commentText,
        createdAt: new Date(), // Using client-side date for optimistic update
    };

    const updatedPosts = posts.map(p => {
        if (p.id === postId) {
            const updatedComments = [...(p.comments || []), newComment];
            return { ...p, comments: updatedComments };
        }
        return p;
    });
    setPosts(updatedPosts);
    
    if (postId.startsWith('initial-')) {
        return;
    }

    const postRef = doc(firestore, 'community_posts', postId);
    try {
        await updateDoc(postRef, {
            comments: arrayUnion({ ...newComment, createdAt: new Date() }) // Use serverTimestamp in real app if needed
        });
    } catch (error) {
        console.error("Error adding comment: ", error);
        // Revert local state on error if needed
    }
  };


  const defaultCoverImage = PlaceHolderImages.find(i => i.id === 'user-profile-cover');
  const coverImage = userProfile?.coverPhotoURL || defaultCoverImage?.imageUrl;
  const coverImageHint = userProfile?.coverPhotoURL ? 'user custom cover' : defaultCoverImage?.imageHint;

  const isLoading = isUserLoading || (user && isProfileLoading);

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

  if (!userProfile) {
    return (
        <div className="mx-auto max-w-2xl space-y-12">
            <Card>
                <CardContent className="p-6 text-center">
                    <p>Could not load user profile. It might not exist yet or there was an error.</p>
                     <Button onClick={() => setIsEditDialogOpen(true)} variant="outline" className="mt-4">
                        Create Profile
                    </Button>
                </CardContent>
            </Card>
             {user && <EditProfileDialog userProfile={{id: user.uid, displayName: user.displayName || '', email: user.email || '', bio: '', location: '', profilePhotoURL: user.photoURL || '', coverPhotoURL: ''}} open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} />}
        </div>
    )
  }


  return (
    <>
    <div className="mx-auto max-w-2xl space-y-12">
      <Card className="overflow-hidden">
        <div className="relative h-48 w-full">
            {coverImage && <Image src={coverImage} alt="Cover image" data-ai-hint={coverImageHint} fill className="object-cover" />}
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
                <div className="text-sm"><span className="font-bold">{posts?.length || 0}</span> Posts</div>
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
            {isLoadingPosts ? (
                 <Card><CardContent className="p-6">Loading posts...</CardContent></Card>
            ) : posts && posts.length > 0 ? (
                <div className="space-y-6">
                    {posts.map(post => (
                        <PostCard key={post.id} post={post} onAddComment={handleAddComment} onTranslate={handleTranslatePost} onLike={handleLikePost} />
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="p-6 text-center text-muted-foreground">
                        <p>You haven't made any posts yet.</p>
                    </CardContent>
                </Card>
            )}
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


function PostCard({ post, onAddComment, onTranslate, onLike }: { post: Post, onAddComment: (postId: string, text: string) => void, onTranslate: (postId: string) => void, onLike: (postId: string) => void }) {
    const { user } = useUser();
    const isLiked = user ? post.likedBy?.includes(user.uid) : false;

    // Use original content for read aloud if it has been translated
    const contentToRead = (post.isTranslated && post.originalContent) ? post.originalContent : post.content;
    const langToRead = (post.isTranslated && post.originalContent) ? 'en' : post.lang;
    const userAvatar = PlaceHolderImages.find(i => i.id === 'user-avatar-1');
    
    return (
        <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="ring-1 ring-primary">
                    <AvatarImage src={post.avatar} />
                    <AvatarFallback>{post.author.slice(0,2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{post.author}</p>
                    <p className="text-sm text-muted-foreground">{post.time}</p>
                  </div>
                </div>
                 <div className='flex items-center gap-1'>
                    <ReadAloudButton textToRead={contentToRead} lang={langToRead} />
                    <Button variant="ghost" size="sm" onClick={() => onTranslate(post.id)}>
                        {post.isTranslated ? 'Show Original' : 'Translate'}
                    </Button>
                    <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-5 w-5" />
                    </Button>
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
                    <Button variant="ghost" size="sm" className="flex items-center gap-2" onClick={() => onLike(post.id)}>
                        <Heart className={cn("h-4 w-4", isLiked && "fill-red-500 text-red-500")} /> {post.likes}
                    </Button>
                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" /> {post.comments?.length || 0}
                    </Button>
                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                        <Share2 className="h-4 w-4" /> Share
                    </Button>
                </div>
              </div>
              <CommentSection userAvatar={user?.photoURL || userAvatar?.imageUrl} userInitial={user?.displayName?.slice(0,1) || 'U'} comments={post.comments} onAddComment={(text) => onAddComment(post.id, text)} />
            </CardFooter>
        </Card>
    );
}

function CommentSection({ comments, onAddComment, userAvatar, userInitial }: { comments: Comment[], onAddComment: (text: string) => void, userAvatar?: string, userInitial: string }) {
    const [commentText, setCommentText] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        onAddComment(commentText);
        setCommentText('');
    };

    return (
        <div className="w-full space-y-4">
            {comments && comments.map(comment => (
                <div key={comment.id} className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.avatar} />
                        <AvatarFallback>{comment.author.slice(0,1)}</AvatarFallback>
                    </Avatar>
                    <div className="w-full rounded-lg bg-secondary px-4 py-2 flex-1">
                        <p className="text-sm font-semibold">{comment.author}</p>
                        <p className="text-sm">{comment.content}</p>
                    </div>
                     <ReadAloudButton textToRead={comment.content} lang={'en'} />
                </div>
            ))}
            <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">
                <Avatar className="ring-1 ring-primary">
                  <AvatarImage src={userAvatar} />
                  <AvatarFallback>{userInitial}</AvatarFallback>
                </Avatar>
                <div className="relative w-full">
                  <Input 
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..." 
                    className="pr-10" 
                  />
                  <Button type="submit" variant="ghost" size="icon" className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
            </form>
        </div>
    );
}

    
