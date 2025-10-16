
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
import { useState, useEffect, useMemo } from 'react';
import { EditProfileDialog } from '@/components/edit-profile-dialog';
import { ReadAloudButton } from '@/components/read-aloud-button';
import { Input } from '@/components/ui/input';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '@/lib/utils';
import { translateText } from '@/ai/flows/translate-text-flow';
import { useRouter } from 'next/navigation';


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
  const router = useRouter();

  // Redirect to settings page since profile editing is moved there
  useEffect(() => {
    router.replace('/settings');
  }, [router]);

  return (
    <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2 text-muted-foreground">Redirecting to settings...</p>
    </div>
  );
}

    