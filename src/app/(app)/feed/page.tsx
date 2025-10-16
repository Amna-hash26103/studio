'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Heart, MessageCircle, MoreHorizontal, Send, Share2 } from 'lucide-react';
import Image from 'next/image';

const user1 = PlaceHolderImages.find((img) => img.id === 'user-avatar-1');
const user2 = PlaceHolderImages.find((img) => img.id === 'user-avatar-2');

const posts = [
  {
    id: 1,
    author: 'Jane Doe',
    avatar: user1?.imageUrl,
    time: '2h ago',
    content: "Just launched my new project on sustainable fashion! ✨ It's been a long journey, but so rewarding. Check it out on my profile and let me know what you think! #sustainability #fashion #womeninbusiness",
    image: PlaceHolderImages.find((img) => img.id === 'feed-post-1'),
    likes: 128,
    comments: 12,
  },
  {
    id: 2,
    author: 'Sarah Smith',
    avatar: user2?.imageUrl,
    time: '5h ago',
    content: "Feeling so grateful for this community. Had a tough week, but reading all your supportive comments on my last post really lifted my spirits. Thank you all! ❤️",
    likes: 256,
    comments: 34,
  },
];


export default function FeedPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Avatar className="ring-1 ring-primary">
              <AvatarImage src={user1?.imageUrl} />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <Input placeholder="What's on your mind, Jane?" className="bg-secondary" />
            <Button>Post</Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-6">
        {posts.map(post => (
          <Card key={post.id}>
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
                        <MessageCircle className="h-4 w-4" /> {post.comments}
                    </Button>
                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                        <Share2 className="h-4 w-4" /> Share
                    </Button>
                </div>
              </div>
              <div className="flex w-full items-center gap-2">
                <Avatar className="ring-1 ring-primary">
                  <AvatarImage src={user1?.imageUrl} />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div className="relative w-full">
                  <Input placeholder="Write a comment..." className="pr-10" />
                  <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
