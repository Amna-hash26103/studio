
'use client';

import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Heart,
  MessageCircle,
  Bookmark,
  Send,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react';
import {
  useUser,
  useFirestore,
  useCollection,
  useMemoFirebase,
} from '@/firebase';
import {
  collection,
  query,
  orderBy,
  addDoc,
  serverTimestamp,
  doc,
  writeBatch,
  arrayUnion,
  arrayRemove,
  Timestamp,
} from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { PlaceHolderImages } from '@/lib/placeholder-images';

// Types
type UserProfileInfo = {
  displayName: string;
  photoURL: string;
};

type CommentType = {
  id: string;
  userId: string;
  text: string;
  createdAt: Timestamp;
  userProfile: UserProfileInfo;
};

type PostType = {
  id: string;
  userId: string;
  content: string;
  imageUrl?: string;
  createdAt: Timestamp | Date; // Allow Date for dummy data
  likes: string[];
  userProfile: UserProfileInfo;
};

const userAvatar1 = PlaceHolderImages.find(p => p.id === 'user-avatar-1');
const feedPost1 = PlaceHolderImages.find(p => p.id === 'feed-post-1');
const feedPost2 = PlaceHolderImages.find(p => p.id === 'feed-post-2');

const dummyPosts: PostType[] = [
  {
    id: 'dummy-1',
    userId: 'dummy-user-1',
    content: "Just finished a great workout! Feeling energized and ready to take on the day. What's your favorite way to stay active?",
    imageUrl: feedPost1?.imageUrl,
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    likes: ['user1', 'user2', 'user3'],
    userProfile: {
      displayName: 'Chloe',
      photoURL: userAvatar1?.imageUrl || '',
    },
  },
  {
    id: 'dummy-2',
    userId: 'dummy-user-2',
    content: "Shared a beautiful moment with a friend over coffee today. It's the small connections that make life rich. ☕️",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    likes: ['user1', 'user4'],
    userProfile: {
      displayName: 'Elena',
      photoURL: userAvatar1?.imageUrl || '',
    },
  },
    {
    id: 'dummy-3',
    userId: 'dummy-user-3',
    content: "Experimenting with a new healthy recipe tonight! It's a quinoa salad with roasted vegetables and a lemon-tahini dressing. So delicious and nutritious! 🥗",
    imageUrl: feedPost2?.imageUrl,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    likes: ['user1', 'user2', 'user3', 'user4', 'user5'],
    userProfile: {
      displayName: 'Sofia',
      photoURL: userAvatar1?.imageUrl || '',
    },
  },
];


// --- Main Feed Page ---
export default function FeedPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  // Fetch posts
  const postsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'posts'), orderBy('createdAt', 'desc'));
  }, [firestore]);
  const { data: posts, isLoading: isLoadingPosts } = useCollection<PostType>(postsQuery);

  const displayPosts = !isLoadingPosts && posts && posts.length > 0 ? posts : dummyPosts;

  if (isLoadingPosts) {
    return (
      <div className="mx-auto w-full max-w-2xl space-y-4">
        <PostSkeleton />
        <PostSkeleton />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      {user && firestore && (
        <CreatePostCard user={user} firestore={firestore} />
      )}
      <div className="space-y-4">
        {(!posts || posts.length === 0) && (
            <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                    <p>No posts yet! Be the first to share something with the community.</p>
                    <p className="text-xs mt-2">(Showing sample posts below)</p>
                </CardContent>
            </Card>
        )}
        {displayPosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUser={user}
            isDummy={!post.createdAt || !('seconds' in post.createdAt)}
          />
        ))}
      </div>
    </div>
  );
}

// --- Create Post Component ---
const createPostSchema = z.object({
  content: z.string().min(1, 'Post cannot be empty').max(500),
});

function CreatePostCard({
  user,
  firestore,
}: {
  user: any;
  firestore: any;
}) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof createPostSchema>>({
    resolver: zodResolver(createPostSchema),
    defaultValues: { content: '' },
  });

  const onSubmit = async (values: z.infer<typeof createPostSchema>) => {
    form.clearErrors();
    if (!user.displayName) {
        toast({
            variant: 'destructive',
            title: 'Profile Incomplete',
            description: 'Please set a display name before posting.',
        });
        return;
    }
    try {
      await addDoc(collection(firestore, 'posts'), {
        userId: user.uid,
        content: values.content,
        createdAt: serverTimestamp(),
        likes: [],
        userProfile: {
            displayName: user.displayName,
            photoURL: user.photoURL || '',
        }
      });
      form.reset();
      toast({ title: 'Post created!' });
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not create post. Please try again.',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Post</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex gap-4">
              <Avatar>
                <AvatarImage src={user.photoURL} />
                <AvatarFallback>
                  {user.displayName?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Textarea
                        placeholder="What's on your mind?"
                        className="h-24 resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-between items-center">
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled
                className="cursor-not-allowed"
              >
                <ImageIcon className="h-5 w-5" />
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="gap-2"
              >
                {form.formState.isSubmitting && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Post
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// --- Post Card Component ---
function PostCard({
  post,
  currentUser,
  isDummy,
}: {
  post: PostType;
  currentUser: any;
  isDummy?: boolean;
}) {
  const [showComments, setShowComments] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  const isLiked = useMemo(
    () => !isDummy && currentUser && post.likes.includes(currentUser.uid),
    [post.likes, currentUser, isDummy]
  );

  const handleLike = async () => {
    if (isDummy || !currentUser || !firestore) return;
    const postRef = doc(firestore, 'posts', post.id);
    try {
      await writeBatch(firestore)
        .update(postRef, {
          likes: isLiked
            ? arrayRemove(currentUser.uid)
            : arrayUnion(currentUser.uid),
        })
        .commit();
    } catch (error) {
      console.error('Error liking post:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not update like status.',
      });
    }
  };

  const getTimeAgo = () => {
    if (!post.createdAt) return 'just now';
    if (post.createdAt instanceof Date) { // For dummy data
        return formatDistanceToNow(post.createdAt, { addSuffix: true });
    }
    return formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true }); // For Firestore timestamps
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={post.userProfile?.photoURL} />
            <AvatarFallback>
              {post.userProfile?.displayName?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{post.userProfile?.displayName}</p>
            <p className="text-xs text-muted-foreground">
              {getTimeAgo()}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap">{post.content}</p>
        {post.imageUrl && (
          <div className="mt-4 relative aspect-video w-full overflow-hidden rounded-xl">
            <Image
              src={post.imageUrl}
              alt="Post image"
              fill
              className="object-cover"
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t px-6 pt-4">
        <div className="flex gap-4">
          <Button variant="ghost" size="sm" onClick={handleLike} disabled={isDummy}>
            <Heart
              className={cn('mr-2 h-5 w-5', isLiked && 'fill-red-500 text-red-500')}
            />
            {post.likes.length}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            disabled={isDummy}
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            {isDummy ? '0' : <CommentsCount postId={post.id} />}
          </Button>
        </div>
        <Button variant="ghost" size="sm" disabled={isDummy}>
          <Bookmark className="mr-2 h-5 w-5" />
        </Button>
      </CardFooter>
      {showComments && !isDummy && <CommentSection post={post} currentUser={currentUser} />}
    </Card>
  );
}

// --- Comment Section ---
function CommentSection({
  post,
  currentUser,
}: {
  post: PostType;
  currentUser: any;
}) {
  const firestore = useFirestore();
  const { toast } = useToast();

  const commentsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'posts', post.id, 'comments'),
      orderBy('createdAt', 'asc')
    );
  }, [firestore, post.id]);
  const { data: comments, isLoading: isLoadingComments } = useCollection<CommentType>(commentsQuery);
  
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !currentUser || !firestore) return;
    if (!currentUser.displayName) {
        toast({
            variant: 'destructive',
            title: 'Profile Incomplete',
            description: 'Please set a display name before commenting.',
        });
        return;
    }
    setIsSubmitting(true);
    try {
      await addDoc(collection(firestore, 'posts', post.id, 'comments'), {
        userId: currentUser.uid,
        text: commentText,
        createdAt: serverTimestamp(),
        userProfile: {
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL || '',
        }
      });
      setCommentText('');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not add comment.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border-t p-6">
      <div className="space-y-4">
        {isLoadingComments && <Loader2 className="mx-auto h-6 w-6 animate-spin" />}
        {!isLoadingComments && comments?.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">
            No comments yet.
          </p>
        )}
        {comments?.map((comment) => (
          <div key={comment.id} className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={comment.userProfile?.photoURL} />
              <AvatarFallback>
                {comment.userProfile?.displayName?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-semibold">
                {comment.userProfile?.displayName}
              </p>
              <p className="text-sm">{comment.text}</p>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleAddComment} className="mt-4 flex items-center gap-2">
        <Input
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Add a comment..."
          disabled={isSubmitting}
        />
        <Button type="submit" size="icon" disabled={isSubmitting || !commentText.trim()}>
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
}

// --- Helper Components ---
function CommentsCount({ postId }: { postId: string }) {
  const firestore = useFirestore();
  const commentsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'posts', postId, 'comments'));
  }, [firestore, postId]);
  const { data: comments } = useCollection(commentsQuery);
  return <>{comments?.length || 0}</>;
}

function PostSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </CardContent>
      <CardFooter className="flex justify-between border-t px-6 pt-4">
        <div className="flex gap-4">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
        <Skeleton className="h-8 w-16" />
      </CardFooter>
    </Card>
  );
}

    