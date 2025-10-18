
'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Heart, MessageCircle, MoreHorizontal, Send, Share2, Bookmark } from 'lucide-react';
import Image from 'next/image';
import { useState, useMemo, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { ReadAloudButton } from '@/components/read-aloud-button';
import { translateText } from '@/ai/flows/translate-text-flow';
import { collection, query, orderBy, serverTimestamp, addDoc, updateDoc, doc, arrayUnion, arrayRemove, runTransaction } from 'firebase/firestore';
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
    userId: string;
    author: string;
    avatar: string;
    text: string;
    timestamp: any;
};

type Post = {
  id: string;
  userId: string;
  author: string;
  avatar?: string;
  time: string;
  content: string;
  lang: 'en' | 'ur' | 'pa' | 'ps' | 'skr'; // Language of the content
  originalContent?: string;
  imageUrl?: string;
  imageHint?: string;
  likes: string[]; // Array of userIds
  comments: Comment[];
  isTranslated?: boolean;
  translatedLang?: string;
  timestamp: any;
};

const DUMMY_POSTS: Post[] = [
    {
        id: 'dummy-1',
        author: 'Chloe',
        userId: 'dummy-user-chloe',
        avatar: user2?.imageUrl,
        time: '2h ago',
        content: `Cycle syncing my workouts has been a total game-changer! 🚴‍♀️ I have so much more energy during my follicular phase and I've learned to take it easier with yoga during my luteal phase. Has anyone else tried this?`,
        lang: 'en',
        imageUrl: postImage3 ? postImage3.imageUrl : undefined,
        imageHint: postImage3 ? postImage3.imageHint : undefined,
        likes: [],
        comments: [
            { id: uuidv4(), author: 'Jasmine', userId: 'dummy-user-jasmine', avatar: user3?.imageUrl || '', text: 'Yes! I started a few months ago and my body feels so much more in tune. It really helps with PMS too!', timestamp: new Date() },
        ],
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
        id: 'dummy-2',
        author: 'Elena',
        userId: 'dummy-user-elena',
        avatar: user3?.imageUrl,
        time: '1d ago',
        content: `I've been trying to balance my hormones with nutrition and started adding seed cycling to my diet. Flax and pumpkin seeds in the first half of my cycle, and sesame and sunflower in the second. Feeling cautiously optimistic! 🥑`,
        lang: 'en',
        imageUrl: postImage2 ? postImage2.imageUrl : undefined,
        imageHint: postImage2 ? 'healthy food' : undefined,
        likes: [],
        comments: [],
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
    },
];

export default function FeedPage() {
  const [newPostContent, setNewPostContent] = useState('');
  const { user } = useUser();
  const firestore = useFirestore();

  const postsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'posts'), orderBy('timestamp', 'desc'));
  }, [firestore]);

  const { data: firestorePosts, isLoading, error: firestoreError } = useCollection<Post>(postsQuery);

  const [allPosts, setAllPosts] = useState<Post[]>(DUMMY_POSTS);

  useEffect(() => {
    if (firestorePosts) {
      const combined = [...DUMMY_POSTS, ...firestorePosts].sort((a, b) => {
        const dateA = a.timestamp?.toDate ? a.timestamp.toDate() : a.timestamp;
        const dateB = b.timestamp?.toDate ? b.timestamp.toDate() : b.timestamp;

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
        userId: user.uid,
        author: user.displayName || 'Anonymous',
        avatar: user.photoURL || user1?.imageUrl,
        content: newPostContent,
        lang: 'en' as const,
        likes: [],
        comments: [],
        timestamp: serverTimestamp(),
    };

    try {
        await addDoc(collection(firestore, 'posts'), newPostData);
        setNewPostContent('');
    } catch (error) {
        console.error("Error adding post:", error);
    }
  };
  
  const handleAddComment = async (postId: string, commentText: string) => {
     if (!commentText.trim() || !user || !firestore) return;
    
    if (postId.startsWith('dummy-')) {
        setAllPosts(prevPosts => prevPosts.map(p => {
            if (p.id === postId) {
                const newComment = {
                    id: uuidv4(),
                    author: user.displayName || 'You',
                    userId: user.uid,
                    avatar: user.photoURL || user1?.imageUrl || '',
                    text: commentText,
                    timestamp: new Date(),
                };
                return { ...p, comments: [...p.comments, newComment] };
            }
            return p;
        }));
        return;
    }

    const commentRef = collection(firestore, 'posts', postId, 'comments');
    const newComment = {
        userId: user.uid,
        author: user.displayName || 'Anonymous User',
        avatar: user.photoURL || user1?.imageUrl || '',
        text: commentText,
        timestamp: serverTimestamp(),
    };

    try {
        await addDoc(commentRef, newComment);
    } catch (error) {
        console.error("Error adding comment to Firestore:", error);
    }
  };
  
    const handleLikePost = async (postId: string) => {
        if (!user || !firestore) return;
        
        if (postId.startsWith('dummy-')) {
             setAllPosts(prevPosts => prevPosts.map(p => {
                if (p.id === postId) {
                    const isLiked = p.likes.includes(user.uid);
                    if (isLiked) {
                        return { ...p, likes: p.likes.filter(id => id !== user.uid) };
                    } else {
                        return { ...p, likes: [...p.likes, user.uid] };
                    }
                }
                return p;
            }));
            return;
        }

        const postRef = doc(firestore, 'posts', postId);

        try {
            await runTransaction(firestore, async (transaction) => {
                const postDoc = await transaction.get(postRef);
                if (!postDoc.exists()) {
                    throw "Document does not exist!";
                }

                const postData = postDoc.data() as Post;
                const likes = postData.likes || [];
                
                if (likes.includes(user.uid)) {
                    transaction.update(postRef, { likes: arrayRemove(user.uid) });
                } else {
                    transaction.update(postRef, { likes: arrayUnion(user.uid) });
                }
            });
        } catch (e) {
            console.error("Like transaction failed: ", e);
        }
    }
    
    const handleSavePost = async (postId: string) => {
        if (!user || !firestore) return;
        const userRef = doc(firestore, 'users', user.uid);
        // This is a simplified local-only version for dummy posts
        if (postId.startsWith('dummy-')) {
            alert("Saving posts is a premium feature! (Not implemented for dummy posts).");
            return;
        }
        
        try {
            await updateDoc(userRef, {
                savedPosts: arrayUnion(postId)
            });
            alert("Post saved!");
        } catch (e) {
            console.error("Save post failed: ", e);
            // Check if savedPosts field exists, if not, create it
            const userRef = doc(firestore, 'users', user.uid);
            await setDoc(userRef, { savedPosts: [postId] }, { merge: true });
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
        {isLoading && <p>Loading posts...</p>}
        {firestoreError && allPosts.length <= 2 && <p className="text-center text-muted-foreground">Could not load live posts. Displaying demo content.</p>}
        {allPosts.map(post => (
          <PostCard key={post.id} post={post} onAddComment={handleAddComment} onLike={handleLikePost} onSave={handleSavePost}/>
        ))}
      </div>
    </div>
  )
}


function PostCard({ post, onAddComment, onLike, onSave }: { post: Post, onAddComment: (postId: string, text: string) => void, onLike: (postId: string) => void, onSave: (postId: string) => void }) {
    const { user } = useUser();
    const isLiked = user ? post.likes?.includes(user.uid) : false;
    
    // Comments logic for Firestore subcollection
    const firestore = useFirestore();
    const commentsQuery = useMemoFirebase(() => {
        if (!firestore || post.id.startsWith('dummy-')) return null;
        return query(collection(firestore, 'posts', post.id, 'comments'), orderBy('timestamp', 'asc'));
    }, [firestore, post.id]);
    const { data: firestoreComments } = useCollection<Comment>(commentsQuery);

    const allComments = useMemo(() => {
        const localComments = post.comments || [];
        const combined = [...localComments, ...(firestoreComments || [])];
        const unique = Array.from(new Set(combined.map(c => c.id))).map(id => combined.find(c => c.id === id)!);
        return unique.sort((a,b) => (a.timestamp?.toDate ? a.timestamp.toDate() : a.timestamp) - (b.timestamp?.toDate ? b.timestamp.toDate() : b.timestamp));
    }, [post.comments, firestoreComments]);

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
                    <p className="text-sm text-muted-foreground">{post.timestamp?.toDate ? format(post.timestamp.toDate(), 'PPp') : post.time}</p>
                  </div>
                </div>
                 <div className='flex items-center gap-1'>
                    <ReadAloudButton textToRead={contentToRead} lang={langToRead} />
                    <Button variant="ghost" size="icon" onClick={() => onSave(post.id)}>
                        <Bookmark className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-5 w-5" />
                    </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4 whitespace-pre-wrap">{post.content}</p>
              {post.imageUrl && (
                <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                  <Image src={post.imageUrl} alt="Post image" data-ai-hint={post.imageHint} fill className="object-cover" />
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-4">
               <div className="flex w-full items-center justify-between text-muted-foreground">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" className="flex items-center gap-2" onClick={() => onLike(post.id)}>
                        <Heart className={cn("h-4 w-4", isLiked && "fill-red-500 text-red-500")} /> {post.likes?.length || 0}
                    </Button>
                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" /> {allComments?.length || 0}
                    </Button>
                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                        <Share2 className="h-4 w-4" /> Share
                    </Button>
                </div>
              </div>
              <CommentSection userAvatar={user?.photoURL || user1?.imageUrl} userInitial={user?.displayName?.slice(0,1) || 'U'} comments={allComments || []} onAddComment={(text) => onAddComment(post.id, text)} />
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
                        <p className="text-sm">{comment.text}</p>
                    </div>
                     <ReadAloudButton textToRead={comment.text} lang={'en'} />
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
