
'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Heart, MessageCircle, Send, Bookmark } from 'lucide-react';
import Image from 'next/image';
import { useState, useMemo, useEffect } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { ReadAloudButton } from '@/components/read-aloud-button';
import { collection, query, orderBy, serverTimestamp, addDoc, updateDoc, doc, arrayUnion, arrayRemove, runTransaction, setDoc } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';


const user1 = PlaceHolderImages.find((img) => img.id === 'user-avatar-1');

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
  time?: string;
  content: string;
  lang: 'en' | 'ur' | 'pa' | 'ps' | 'skr'; // Language of the content
  originalContent?: string;
  imageUrl?: string;
  imageHint?: string;
  likes: string[]; // Array of userIds
  comments?: Comment[];
  isTranslated?: boolean;
  translatedLang?: string;
  timestamp: any;
};

export default function FeedPage() {
  const [newPostContent, setNewPostContent] = useState('');
  const { user } = useUser();
  const firestore = useFirestore();

  const postsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'posts'), orderBy('timestamp', 'desc'));
  }, [firestore]);

  const { data: firestorePosts, isLoading, error: firestoreError } = useCollection<Post>(postsQuery);
  
  const handleAddPost = async () => {
    if (!newPostContent.trim() || !user || !firestore) return;

    const newPostData = {
        userId: user.uid,
        author: user.displayName || 'Anonymous',
        avatar: user.photoURL || user1?.imageUrl,
        content: newPostContent,
        lang: 'en' as const,
        likes: [],
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
        
        try {
            await updateDoc(userRef, {
                savedPosts: arrayUnion(postId)
            });
            alert("Post saved!");
        } catch (e) {
            console.error("Save post failed: ", e);
            // If the field doesn't exist, create it.
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
        {firestoreError && <p className="text-center text-muted-foreground">Could not load live posts. There might be an issue with your connection or permissions.</p>}
        {firestorePosts?.map(post => (
          <PostCard key={post.id} post={post} onAddComment={handleAddComment} onLike={handleLikePost} onSave={handleSavePost}/>
        ))}
      </div>
    </div>
  )
}


function PostCard({ post, onAddComment, onLike, onSave }: { post: Post, onAddComment: (postId: string, text: string) => void, onLike: (postId: string) => void, onSave: (postId: string) => void }) {
    const { user } = useUser();
    const isLiked = user ? post.likes?.includes(user.uid) : false;
    
    const firestore = useFirestore();
    const commentsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'posts', post.id, 'comments'), orderBy('timestamp', 'asc'));
    }, [firestore, post.id]);
    const { data: firestoreComments } = useCollection<Comment>(commentsQuery);

    const allComments = useMemo(() => {
        const localComments = post.comments || [];
        const combined = [...localComments, ...(firestoreComments || [])];
        const unique = Array.from(new Set(combined.map(c => c.id))).map(id => combined.find(c => c.id === id)!);
        return unique.sort((a,b) => {
            const dateA = a.timestamp?.toDate ? a.timestamp.toDate() : a.timestamp;
            const dateB = b.timestamp?.toDate ? b.timestamp.toDate() : b.timestamp;
            if (!dateA || !dateB) return 0;
            return dateA.getTime() - dateB.getTime();
        });
    }, [post.comments, firestoreComments]);

    const contentToRead = post.content;
    const langToRead = post.lang;
    
    const timeAgo = post.timestamp?.toDate ? formatDistanceToNow(post.timestamp.toDate(), { addSuffix: true }) : post.time;
    
    return (
        <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Avatar className="ring-1 ring-primary">
                      <AvatarImage src={post.avatar} />
                      <AvatarFallback>{post.author?.slice(0,2) || 'A'}</AvatarFallback>
                    </Avatar>
                  <div>
                    <p className="font-semibold">{post.author}</p>
                    <p className="text-sm text-muted-foreground">{timeAgo}</p>
                  </div>
                </div>
                 <div className='flex items-center gap-1'>
                    <ReadAloudButton textToRead={contentToRead} lang={langToRead} />
                    <Button variant="ghost" size="icon" onClick={() => onSave(post.id)}>
                        <Bookmark className="h-5 w-5" />
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
                        <AvatarFallback>{comment.author?.slice(0,1) || 'A'}</AvatarFallback>
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

    