
'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Heart, MessageCircle, MoreHorizontal, Send, Share2 } from 'lucide-react';
import Image from 'next/image';
import { useState, useMemo, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { ReadAloudButton } from '@/components/read-aloud-button';
import { translateText } from '@/ai/flows/translate-text-flow';
import { collection, query, orderBy, serverTimestamp, addDoc, updateDoc, doc, arrayUnion, runTransaction } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';


const user1 = PlaceHolderImages.find((img) => img.id === 'user-avatar-1');
const user2 = PlaceHolderImages.find((img) => img.id === 'user-avatar-2');
const user3 = PlaceHolderImages.find((img) => img.id === 'user-avatar-3');

const postImage1 = PlaceHolderImages.find(p => p.id === 'feed-post-1');
const postImage2 = PlaceHolderImages.find(p => p.id === 'feed-post-2');
const postImage3 = PlaceHolderImages.find(p => p.id === 'feed-post-3');

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
  lang: 'en' | 'ur' | 'pa' | 'ps' | 'skr'; // Language of the content
  originalContent?: string;
  image?: { imageUrl: string; imageHint: string };
  likes: number;
  likedBy: string[];
  comments: Comment[];
  isTranslated?: boolean;
  translatedLang?: string;
  createdAt: any;
};

const DUMMY_POSTS: Post[] = [
    {
        id: 'dummy-1',
        author: 'Chloe',
        authorId: 'dummy-user-chloe',
        avatar: user2?.imageUrl,
        time: '2h ago',
        content: `Cycle syncing my workouts has been a total game-changer! 🚴‍♀️ I have so much more energy during my follicular phase and I've learned to take it easier with yoga during my luteal phase. Has anyone else tried this?`,
        lang: 'en',
        image: postImage3 ? { imageUrl: postImage3.imageUrl, imageHint: postImage3.imageHint } : undefined,
        likes: 38,
        likedBy: [],
        comments: [
            { id: uuidv4(), author: 'Jasmine', authorId: 'dummy-user-jasmine', avatar: user3?.imageUrl || '', content: 'Yes! I started a few months ago and my body feels so much more in tune. It really helps with PMS too!', createdAt: new Date() },
        ],
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
        id: 'dummy-2',
        author: 'Elena',
        authorId: 'dummy-user-elena',
        avatar: user3?.imageUrl,
        time: '1d ago',
        content: `I've been trying to balance my hormones with nutrition and started adding seed cycling to my diet. Flax and pumpkin seeds in the first half of my cycle, and sesame and sunflower in the second. Feeling cautiously optimistic! 🥑`,
        lang: 'en',
        image: postImage2 ? { imageUrl: postImage2.imageUrl, imageHint: 'healthy food' } : undefined,
        likes: 51,
        likedBy: [],
        comments: [],
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
    },
];

export default function FeedPage() {
  const [newPostContent, setNewPostContent] = useState('');
  const { user } = useUser();
  const firestore = useFirestore();
  const [allPosts, setAllPosts] = useState<Post[]>(DUMMY_POSTS);

  const postsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'community_posts'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: firestorePosts, isLoading, error: firestoreError } = useCollection<Post>(postsQuery);
  
  useEffect(() => {
    if (firestorePosts) {
      const combined = [...DUMMY_POSTS, ...firestorePosts].sort((a, b) => {
        // Handle cases where createdAt might be null or not yet a Timestamp
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : a.createdAt;
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : b.createdAt;

        // If a date is invalid or null, treat it as newer for sorting purposes
        if (!dateA) return -1;
        if (!dateB) return 1;

        return dateB.getTime() - dateA.getTime();
      });
      const uniquePosts = Array.from(new Set(combined.map(p => p.id))).map(id => combined.find(p => p.id === id)!);
      setAllPosts(uniquePosts.map(p => ({...p, content: p.originalContent || p.content, isTranslated: false, originalContent: undefined})));
    }
  }, [firestorePosts]);

  const handleAddPost = async () => {
    if (!newPostContent.trim() || !user || !firestore) return;

    const newPostData = {
        author: user.displayName || 'Anonymous',
        authorId: user.uid,
        avatar: user.photoURL || user1?.imageUrl,
        time: 'Just now',
        content: newPostContent,
        lang: 'en' as const,
        likes: 0,
        likedBy: [],
        comments: [],
        createdAt: serverTimestamp(),
    };

    try {
        await addDoc(collection(firestore, 'community_posts'), newPostData);
        setNewPostContent('');
    } catch (error) {
        console.error("Error adding post:", error);
    }
  };
  
  const handleAddComment = async (postId: string, commentText: string) => {
     if (!commentText.trim() || !user || !firestore) return;
    
    // Handle dummy posts locally
    if (postId.startsWith('dummy-')) {
        setAllPosts(prevPosts => prevPosts.map(p => {
            if (p.id === postId) {
                const newComment = {
                    id: uuidv4(),
                    author: user.displayName || 'You',
                    authorId: user.uid,
                    avatar: user.photoURL || user1?.imageUrl || '',
                    content: commentText,
                    createdAt: new Date(),
                };
                return { ...p, comments: [...p.comments, newComment] };
            }
            return p;
        }));
        return;
    }

    // Handle firestore posts
    const postRef = doc(firestore, 'community_posts', postId);
    const newComment = {
        id: uuidv4(),
        author: user.displayName || 'Anonymous User',
        authorId: user.uid,
        avatar: user.photoURL || user1?.imageUrl || '',
        content: commentText,
        createdAt: serverTimestamp(),
    };

    try {
        await updateDoc(postRef, {
            comments: arrayUnion(newComment)
        });
    } catch (error) {
        console.error("Error adding comment to Firestore:", error);
    }
  };
  
    const handleLikePost = async (postId: string) => {
        if (!user) return;
        
        // Handle dummy posts locally
        if (postId.startsWith('dummy-')) {
             setAllPosts(prevPosts => prevPosts.map(p => {
                if (p.id === postId) {
                    const isLiked = p.likedBy.includes(user.uid);
                    if (isLiked) {
                        return { ...p, likes: p.likes - 1, likedBy: p.likedBy.filter(id => id !== user.uid) };
                    } else {
                        return { ...p, likes: p.likes + 1, likedBy: [...p.likedBy, user.uid] };
                    }
                }
                return p;
            }));
            return;
        }

        // Handle firestore posts
        if (!firestore) return;
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
                    newLikes = (postData.likes || 1) - 1;
                    newLikedBy = likedBy.filter(uid => uid !== user.uid);
                } else {
                    // Like
                    newLikes = (postData.likes || 0) + 1;
                    newLikedBy = [...likedBy, user.uid];
                }
                
                transaction.update(postRef, { likes: newLikes, likedBy: newLikedBy });
            });
        } catch (e) {
            console.error("Like transaction failed: ", e);
        }
    }


  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Avatar className="ring-1 ring-primary">
              <AvatarImage src={user?.photoURL || user1?.imageUrl} />
              <AvatarFallback>{user?.displayName?.slice(0,1) || 'U'}</AvatarFallback>
            </Avatar>
            <Input 
                placeholder={`What's on your mind, ${user?.displayName?.split(' ')[0] || 'friend'}?`}
                className="bg-secondary"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddPost()}
            />
            <Button onClick={handleAddPost}>Post</Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-6">
        {isLoading && allPosts.length === 0 && <p>Loading posts...</p>}
        {firestoreError && allPosts.length === 2 && <p className="text-center text-muted-foreground">Could not load live posts. Displaying demo content.</p>}
        {allPosts.map(post => (
          <PostCard key={post.id} post={post} onAddComment={handleAddComment} onLike={handleLikePost} />
        ))}
      </div>
    </div>
  )
}


function PostCard({ post, onAddComment, onLike }: { post: Post, onAddComment: (postId: string, text: string) => void, onLike: (postId: string) => void }) {
    const { user } = useUser();
    const isLiked = user ? post.likedBy?.includes(user.uid) : false;
    
    // Use original content for read aloud if it has been translated
    const contentToRead = post.content;
    const langToRead = post.lang;
    
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
              <CommentSection userAvatar={user?.photoURL || user1?.imageUrl} userInitial={user?.displayName?.slice(0,1) || 'U'} comments={post.comments || []} onAddComment={(text) => onAddComment(post.id, text)} />
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
            {comments.map(comment => (
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
                  <Button type="submit" variant="ghost" size="icon" className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2" disabled={!commentText.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
            </form>
        </div>
    );
}

    