
import { PlaceHolderImages } from './placeholder-images';

const user2 = PlaceHolderImages.find((img) => img.id === 'user-avatar-2');
const user3 = PlaceHolderImages.find((img) => img.id === 'user-avatar-3');
const user4 = PlaceHolderImages.find((img) => img.id === 'user-avatar-4');

const cover1 = PlaceHolderImages.find((img) => img.id === 'user-cover-4');
const cover2 = PlaceHolderImages.find((img) => img.id === 'user-cover-5');
const cover3 = PlaceHolderImages.find((img) => img.id === 'user-cover-7');


const feedPost1 = PlaceHolderImages.find((img) => img.id === 'feed-post-3');
const feedPost2 = PlaceHolderImages.find((img) => img.id === 'project-image-2');

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
  lang: 'en' | 'ur-RO';
  originalContent?: string;
  image?: { imageUrl: string; imageHint: string };
  likes: number;
  likedBy: string[];
  comments: Comment[];
  isTranslated?: boolean;
  createdAt: any;
};

export type DummyProfile = {
    id: string;
    displayName: string;
    bio: string;
    profilePhotoURL: string;
    coverPhotoURL?: string;
    posts: Post[];
};

export const DUMMY_PROFILES: Record<string, DummyProfile> = {
    "chloe-123": {
        id: "chloe-123",
        displayName: "Chloe",
        bio: "Fitness enthusiast and nature lover. Exploring how movement connects to my cycle.",
        profilePhotoURL: user2?.imageUrl || '',
        coverPhotoURL: cover1?.imageUrl,
        posts: [
             {
                id: 'post-1',
                author: 'Chloe',
                authorId: 'chloe-123',
                avatar: user2?.imageUrl,
                time: '2 hours ago',
                content: "Cycle syncing my workouts has been a game-changer! I feel so much more in tune with my body's energy levels throughout the month. Anyone else tried this?",
                lang: 'en',
                likes: 24,
                likedBy: [],
                comments: [
                    { id: 'comment-1-1', author: 'Elena', authorId: 'elena-456', avatar: user3?.imageUrl || '', content: 'Yes! I started last month and my energy during workouts is so much better.', createdAt: new Date() }
                ],
                createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
            },
        ]
    },
    "elena-456": {
        id: "elena-456",
        displayName: "Elena",
        bio: "Mindfulness practitioner and advocate for mental clarity. Always seeking peace and presence.",
        profilePhotoURL: user3?.imageUrl || '',
        coverPhotoURL: cover2?.imageUrl,
        posts: [
            {
                id: 'post-2',
                author: 'Elena',
                authorId: 'elena-456',
                avatar: user3?.imageUrl,
                time: '8 hours ago',
                content: 'Just finished a 7-day mindfulness challenge. Feeling so clear and grounded. Highly recommend taking a few minutes each day to just breathe and be present. 🧘‍♀️',
                image: feedPost1 ? { imageUrl: feedPost1.imageUrl, imageHint: feedPost1.imageHint } : undefined,
                lang: 'en',
                likes: 42,
                likedBy: [],
                comments: [],
                createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000)
            },
        ]
    },
    "jasmine-789": {
        id: "jasmine-789",
        displayName: "Jasmine",
        bio: "Artist, dreamer, and creator. Finding inspiration in the everyday and turning it into something beautiful.",
        profilePhotoURL: user4?.imageUrl || '',
        coverPhotoURL: cover3?.imageUrl,
        posts: [
            {
                id: 'post-3',
                author: 'Jasmine',
                authorId: 'jasmine-789',
                avatar: user4?.imageUrl,
                time: 'Yesterday',
                content: 'Working on a new creative project and feeling so inspired! It’s amazing what you can create when you give yourself the space to explore. ✨',
                image: feedPost2 ? { imageUrl: feedPost2.imageUrl, imageHint: feedPost2.imageHint } : undefined,
                lang: 'en',
                likes: 58,
                likedBy: [],
                comments: [],
                createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
            }
        ]
    }
};
