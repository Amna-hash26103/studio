'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Heart, MessageCircle, MoreHorizontal, Send, Share2, Languages } from 'lucide-react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { translateText } from '@/ai/flows/translate-text-flow';

const user1 = PlaceHolderImages.find((img) => img.id === 'user-avatar-1');
const user2 = PlaceHolderImages.find((img) => img.id === 'user-avatar-2');

type Post = {
  id: number;
  author: string;
  avatar?: string;
  time: string;
  content: string;
  originalContent: string;
  lang: string;
  image?: { imageUrl: string; imageHint: string; };
  likes: number;
  comments: number;
  isTranslated: boolean;
  translation?: string;
};

const initialPosts: Post[] = [
  {
    id: 1,
    author: 'Jane Doe',
    avatar: user1?.imageUrl,
    time: '2h ago',
    content: "Just launched my new project on sustainable fashion! ✨ It's been a long journey, but so rewarding. Check it out on my profile and let me know what you think! #sustainability #fashion #womeninbusiness",
    originalContent: "Just launched my new project on sustainable fashion! ✨ It's been a long journey, but so rewarding. Check it out on my profile and let me know what you think! #sustainability #fashion #womeninbusiness",
    lang: 'en',
    image: PlaceHolderImages.find((img) => img.id === 'feed-post-1'),
    likes: 128,
    comments: 12,
    isTranslated: false,
  },
  {
    id: 2,
    author: 'Sarah Smith',
    avatar: user2?.imageUrl,
    time: '5h ago',
    content: "Feeling so grateful for this community. Had a tough week, but reading all your supportive comments on my last post really lifted my spirits. Thank you all! ❤️",
    originalContent: "Feeling so grateful for this community. Had a tough week, but reading all your supportive comments on my last post really lifted my spirits. Thank you all! ❤️",
    lang: 'en',
    likes: 256,
    comments: 34,
    isTranslated: false,
  },
];


export default function FeedPage() {
  const t = useTranslations('FeedPage');
  const locale = useLocale();
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [translatingPostId, setTranslatingPostId] = useState<number | null>(null);

  const handleTranslate = async (postId: number) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    if (post.isTranslated) {
      // Revert to original content
      setPosts(posts.map(p => p.id === postId ? { ...p, content: p.originalContent, isTranslated: false } : p));
      return;
    }
    
    // If we already have a translation, just show it
    if (post.translation) {
      setPosts(posts.map(p => p.id === postId ? { ...p, content: post.translation!, isTranslated: true } : p));
      return;
    }

    setTranslatingPostId(postId);
    try {
      const response = await translateText({ text: post.originalContent, targetLanguage: locale });
      const translatedText = response.translatedText;
      setPosts(posts.map(p => p.id === postId ? { ...p, content: translatedText, translation: translatedText, isTranslated: true } : p));
    } catch (error) {
      console.error("Translation failed:", error);
      // Optionally show a toast to the user
    } finally {
      setTranslatingPostId(null);
    }
  };


  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Avatar className="ring-1 ring-primary">
              <AvatarImage src={user1?.imageUrl} />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <Input placeholder={t('postPlaceholder')} className="bg-secondary" />
            <Button>{t('postButton')}</Button>
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
              {post.isTranslated && <p className="mb-4 text-sm text-muted-foreground italic">Translated from {post.lang}</p>}
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
                        <Share2 className="h-4 w-4" /> {t('shareButton')}
                    </Button>
                </div>
                {post.lang !== locale && (
                   <Button variant="ghost" size="sm" onClick={() => handleTranslate(post.id)} disabled={translatingPostId === post.id} className="flex items-center gap-2">
                      <Languages className="h-4 w-4" /> {post.isTranslated ? 'Show Original' : 'Translate'}
                   </Button>
                )}
              </div>
              <div className="flex w-full items-center gap-2">
                <Avatar className="ring-1 ring-primary">
                  <AvatarImage src={user1?.imageUrl} />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div className="relative w-full">
                  <Input placeholder={t('commentPlaceholder')} className="pr-10" />
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
