
'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Heart, MessageCircle, MoreHorizontal, Send, Share2 } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useUser } from '@/firebase';

const user1 = PlaceHolderImages.find((img) => img.id === 'user-avatar-1');
const user2 = PlaceHolderImages.find((img) => img.id === 'user-avatar-2');

type Comment = {
    id: string;
    author: string;
    avatar: string;
    content: string;
};

type Post = {
  id: number;
  author: string;
  avatar?: string;
  time: string;
  content: string;
  image?: { imageUrl: string; imageHint: string };
  likes: number;
  comments: Comment[];
};

const initialPosts: Post[] = [
  {
    id: 1,
    author: 'Elena Rodriguez',
    avatar: user1?.imageUrl,
    time: '3h ago',
    content: "Just finished a 7-day mindfulness challenge and feeling so centered. 🧘‍♀️ Taking just 10 minutes each morning to meditate has made a world of difference for my stress levels. Highly recommend! What are your favorite mindfulness practices? #mentalhealth #mindfulness #selfcare",
    image: PlaceHolderImages.find((img) => img.id === 'feed-post-3'),
    likes: 152,
    comments: [
        { id: 'c1', author: 'Chloe Chen', avatar: user2?.imageUrl || '', content: 'This is amazing! I need to try this.' }
    ],
  },
  {
    id: 2,
    author: 'Chloe Chen',
    avatar: user2?.imageUrl,
    time: '8h ago',
    content: "Cycle syncing my workouts has been a game-changer! ✨ During my follicular phase, I have so much energy for HIIT and strength training. Then I switch to yoga and long walks during my luteal phase. Anyone else try this? #cyclesyncing #womenshealth #fitness",
    likes: 210,
    comments: [],
  },
];


export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const { user } = useUser();

  const handleAddComment = (postId: number, commentText: string) => {
    if (!commentText.trim() || !user) return;

    const newComment: Comment = {
        id: uuidv4(),
        author: user.displayName || 'Anonymous User',
        avatar: user.photoURL || user1?.imageUrl || '',
        content: commentText,
    };

    setPosts(posts.map(p => 
        p.id === postId 
        ? { ...p, comments: [...p.comments, newComment] } 
        : p
    ));
  };


  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Avatar className="ring-1 ring-primary">
              <AvatarImage src={user?.photoURL || user1?.imageUrl} />
              <AvatarFallback>{user?.displayName?.slice(0,1) || 'U'}</AvatarFallback>
            </Avatar>
            <Input placeholder={`What's on your mind, ${user?.displayName?.split(' ')[0] || 'friend'}?`} className="bg-secondary" />
            <Button>Post</Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-6">
        {posts.map(post => (
          <PostCard key={post.id} post={post} onAddComment={handleAddComment} />
        ))}
      </div>
    </div>
  )
}


function PostCard({ post, onAddComment }: { post: Post, onAddComment: (postId: number, text: string) => void }) {
    const { user } = useUser();
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
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
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
                        <Heart className="h-4 w-4" /> {post.likes}
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
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.avatar} />
                        <AvatarFallback>{comment.author.slice(0,1)}</AvatarFallback>
                    </Avatar>
                    <div className="w-full rounded-lg bg-secondary px-4 py-2">
                        <p className="text-sm font-semibold">{comment.author}</p>
                        <p className="text-sm">{comment.content}</p>
                    </div>
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
