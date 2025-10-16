
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
import { DUMMY_PROFILES } from '@/lib/dummy-profiles';

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

const initialPosts: Post[] = Object.values(DUMMY_PROFILES).flatMap(profile => profile.posts).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());


export default function FeedPage() {
  const [newPostContent, setNewPostContent] = useState('');
  const { user } = useUser();
  const firestore = useFirestore();

  const postsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'community_posts'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: firestorePosts, isLoading } = useCollection<Post>(postsQuery);
  const [localPosts, setLocalPosts] = useState<Post[]>(initialPosts);

  useEffect(() => {
    if (firestorePosts) {
      const combined = [...initialPosts];
      const firestorePostIds = new Set(initialPosts.map(p => p.id));
      
      firestorePosts.forEach(fp => {
        if (!firestorePostIds.has(fp.id)) {
            combined.push(fp);
        }
      });

      combined.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });
      
      setLocalPosts(combined);
    }
  }, [firestorePosts]);


  const handleAddPost = async () => {
    if (!newPostContent.trim() || !user || !firestore) return;

    const newPost = {
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
        await addDoc(collection(firestore, 'community_posts'), newPost);
        setNewPostContent('');
    } catch (error) {
        console.error("Error adding post:", error);
    }
  };

  const handleAddComment = async (postId: string, commentText: string) => {
    if (!commentText.trim() || !user || !firestore) return;
    
    // For initial posts, update locally
    if (Object.values(DUMMY_PROFILES).flatMap(p => p.posts).some(p => p.id === postId)) {
        const newComment = {
            id: uuidv4(),
            author: user.displayName || 'Anonymous User',
            authorId: user.uid,
            avatar: user.photoURL || user1?.imageUrl || '',
            content: commentText,
            createdAt: new Date(),
        };
        const updatedPosts = localPosts.map(p => {
            if (p.id === postId) {
                return { ...p, comments: [...p.comments, newComment] };
            }
            return p;
        });
        setLocalPosts(updatedPosts);
        return;
    }

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
        console.error("Error adding comment: ", error);
    }
  };
  
    const handleTranslatePost = async (postId: string) => {
        const postToTranslate = localPosts.find(p => p.id === postId);
        if (!postToTranslate) return;

        const currentIsTranslated = postToTranslate.isTranslated;
        const originalContent = postToTranslate.originalContent || postToTranslate.content;

        // Immediately update UI for responsiveness
        const newLocalPosts = localPosts.map(p => p.id === postId ? {...p, isTranslated: !currentIsTranslated, content: 'Translating...'} : p);
        setLocalPosts(newLocalPosts);

        if (currentIsTranslated) {
             setLocalPosts(localPosts.map(p => p.id === postId ? {...p, content: originalContent, originalContent: undefined, isTranslated: false} : p));
             return;
        }

        try {
            const { translatedText } = await translateText({
                text: originalContent,
                targetLanguage: 'ur-RO',
            });
            setLocalPosts(localPosts.map(p =>
                p.id === postId
                    ? {
                        ...p,
                        originalContent: originalContent,
                        content: translatedText,
                        isTranslated: true
                    }
                    : p
            ));
        } catch (error) {
            console.error("Translation failed:", error);
            // Revert back to original content on failure
            setLocalPosts(localPosts.map(p => p.id === postId ? {...p, content: originalContent, isTranslated: false} : p)); 
        }
    };
    
    const handleLikePost = async (postId: string) => {
        if (!user || !firestore) return;
        
        // For initial posts, update locally
        if (Object.values(DUMMY_PROFILES).flatMap(p => p.posts).some(p => p.id === postId)) {
            const updatedPosts = localPosts.map(p => {
                if (p.id === postId) {
                    const isLiked = p.likedBy.includes(user.uid);
                    const newLikedBy = isLiked ? p.likedBy.filter(uid => uid !== user.uid) : [...p.likedBy, user.uid];
                    // For dummy posts, likes count is just the length of likedBy array.
                    const newLikes = p.likes + (isLiked ? -1 : 1);
                    return { ...p, likes: newLikes, likedBy: newLikedBy };
                }
                return p;
            });
            setLocalPosts(updatedPosts);
            return;
        }
        
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
        {isLoading && localPosts.length === 0 && <p>Loading posts...</p>}
        {localPosts.map(post => (
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
                        <MessageCircle className="h-4 w-4" /> {post.comments.length}
                    </Button>
                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                        <Share2 className="h-4 w-4" /> Share
                    </Button>
                </div>
              </div>
              <CommentSection userAvatar={user?.photoURL || user1?.imageUrl} userInitial={user?.displayName?.slice(0,1) || 'U'} comments={post.comments} onAddComment={(text) => onAddComment(post.id, text)} />
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
    

    
