
'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Heart, MessageCircle, MoreHorizontal, Send, Share2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { ReadAloudButton } from '@/components/read-aloud-button';
import { translateText } from '@/ai/flows/translate-text-flow';
import { collection, query, orderBy, serverTimestamp, addDoc, updateDoc, doc, arrayUnion, runTransaction } from 'firebase/firestore';
import { cn } from '@/lib/utils';

const user1 = PlaceHolderImages.find((img) => img.id === 'user-avatar-1');

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

export default function FeedPage() {
  const [newPostContent, setNewPostContent] = useState('');
  const { user } = useUser();
  const firestore = useFirestore();

  const postsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'community_posts'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: posts, isLoading, error: firestoreError } = useCollection<Post>(postsQuery);

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
    
    const newComment = {
        id: uuidv4(),
        author: user.displayName || 'Anonymous User',
        authorId: user.uid,
        avatar: user.photoURL || user1?.imageUrl || '',
        content: commentText,
        createdAt: serverTimestamp(),
    };
    
    const postRef = doc(firestore, 'community_posts', postId);

    try {
        await updateDoc(postRef, {
            comments: arrayUnion(newComment)
        });
    } catch (error) {
        console.error("Error adding comment to Firestore:", error);
    }
  };
  
    const handleTranslatePost = async (postId: string) => {
        if(!firestore) return;
        const postRef = doc(firestore, 'community_posts', postId);
        const post = posts?.find(p => p.id === postId);
        if (!post) return;

        const currentIsTranslated = post.isTranslated;
        const originalContent = post.originalContent || post.content;

        if (currentIsTranslated) {
             await updateDoc(postRef, { content: originalContent, originalContent: null, isTranslated: false });
             return;
        }

        try {
            const { translatedText } = await translateText({
                text: originalContent,
                targetLanguage: 'ur-RO',
            });
            await updateDoc(postRef, {
                originalContent: originalContent,
                content: translatedText,
                isTranslated: true
            });
        } catch (error) {
            console.error("Translation failed:", error);
        }
    };
    
    const handleLikePost = async (postId: string) => {
        if (!user || !firestore) return;
        
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
        {isLoading && <p>Loading posts...</p>}
        {firestoreError && <p className="text-center text-muted-foreground">Could not load live posts. Displaying demo content.</p>}
        {posts && posts.map(post => (
          <PostCard key={post.id} post={post} onAddComment={handleAddComment} onTranslate={handleTranslatePost} onLike={handleLikePost} />
        ))}
      </div>
    </div>
  )
}


function PostCard({ post, onAddComment, onTranslate, onLike }: { post: Post, onAddComment: (postId: string, text: string) => void, onTranslate: (postId: string) => void, onLike: (postId: string) => void }) {
    const { user } = useUser();
    const isLiked = user ? post.likedBy?.includes(user.uid) : false;

    // Use original content for read aloud if it has been translated
    const contentToRead = (post.isTranslated && post.originalContent) ? post.originalContent : post.content;
    const langToRead = (post.isTranslated && post.originalContent) ? 'en' : post.lang;
    
    return (
        <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Link href={`/profile/${post.authorId}`}>
                    <Avatar className="ring-1 ring-primary">
                      <AvatarImage src={post.avatar} />
                      <AvatarFallback>{post.author.slice(0,2)}</AvatarFallback>
                    </Avatar>
                  </Link>
                  <div>
                    <Link href={`/profile/${post.authorId}`} className="font-semibold hover:underline">{post.author}</Link>
                    <p className="text-sm text-muted-foreground">{post.time}</p>
                  </div>
                </div>
                 <div className='flex items-center gap-1'>
                    <ReadAloudButton textToRead={contentToRead} lang={langToRead} />
                    <Button variant="ghost" size="sm" onClick={() => onTranslate(post.id)}>
                        {post.content === 'Translating...' ? 'Translating...' : (post.isTranslated ? 'Show Original' : 'Translate')}
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
              <CommentSection userAvatar={user?.photoURL || user1?.imageUrl} userInitial={user?.displayName?.slice(0,1) || 'U'} comments={post.comments || []} onAddComment={(text) => onAddComment(post.id, text)} />
            </CardFooter>
        </Card>
    );
}

function CommentSection({ comments, onAddComment, userAvatar, userInitial }: { comments: Comment[], onAddComment: (text: string) => void, userAvatar?: string, userInitial: string }) {
    const [commentText, setCommentText] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddComment(commentText);
        setCommentText('');
    };

    return (
        <div className="w-full space-y-4">
            {comments.map(comment => (
                <div key={comment.id} className="flex items-start gap-3">
                    <Link href={`/profile/${comment.authorId}`}>
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={comment.avatar} />
                            <AvatarFallback>{comment.author.slice(0,1)}</AvatarFallback>
                        </Avatar>
                    </Link>
                    <div className="w-full rounded-lg bg-secondary px-4 py-2 flex-1">
                        <Link href={`/profile/${comment.authorId}`} className="text-sm font-semibold hover:underline">{comment.author}</Link>
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
    

    
