import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Calendar, Edit, Link, MapPin } from 'lucide-react';
import Image from 'next/image';

const user = {
    name: 'Jane Doe',
    handle: 'janedoe',
    avatar: PlaceHolderImages.find(i => i.id === 'user-avatar-1'),
    cover: PlaceHolderImages.find(i => i.id === 'user-profile-cover'),
    bio: 'Digital artist & entrepreneur. Passionate about sustainability and empowering women in tech. Let\'s connect and create something amazing!',
    joined: 'Joined April 2024',
    location: 'San Francisco, CA',
    website: 'janedoe.com',
    stats: {
        posts: 42,
        followers: 1258,
        following: 340
    }
}

const galleryImages = [
    PlaceHolderImages.find(i => i.id === 'feed-post-1'),
    PlaceHolderImages.find(i => i.id === 'feed-post-2'),
    PlaceHolderImages.find(i => i.id === 'feed-post-3'),
    PlaceHolderImages.find(i => i.id === 'project-image-1'),
    PlaceHolderImages.find(i => i.id === 'project-image-2'),
]

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-12">
      <Card className="overflow-hidden">
        <div className="relative h-48 w-full">
            {user.cover && <Image src={user.cover.imageUrl} alt="Cover image" data-ai-hint={user.cover.imageHint} fill className="object-cover" />}
        </div>
        <div className="p-6">
            <div className="relative -mt-20 flex items-end justify-between">
                <Avatar className="h-32 w-32 border-4 border-background">
                    <AvatarImage src={user.avatar?.imageUrl} />
                    <AvatarFallback>{user.name.slice(0,2)}</AvatarFallback>
                </Avatar>
                <Button><Edit className="mr-2 h-4 w-4" />Edit Profile</Button>
            </div>
            <div className="mt-4">
                <h1 className="font-headline text-3xl font-bold">{user.name}</h1>
                <p className="text-sm text-muted-foreground">@{user.handle}</p>
            </div>
            <p className="mt-4 max-w-2xl">{user.bio}</p>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {user.location}</div>
                <div className="flex items-center gap-1.5"><Link className="h-4 w-4" /> <a href="#" className="hover:underline">{user.website}</a></div>
                <div className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {user.joined}</div>
            </div>
             <div className="mt-4 flex gap-6">
                <div className="text-sm"><span className="font-bold">{user.stats.posts}</span> Posts</div>
                <div className="text-sm"><span className="font-bold">{user.stats.followers}</span> Followers</div>
                <div className="text-sm"><span className="font-bold">{user.stats.following}</span> Following</div>
            </div>
        </div>
      </Card>
      
      <Tabs defaultValue="posts" className="w-full">
        <TabsList>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
        </TabsList>
        <TabsContent value="posts">
            <Card>
                <CardContent className="p-6">
                    <p>User's posts will be displayed here.</p>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="projects">
            <Card>
                <CardContent className="p-6">
                    <p>User's projects will be displayed here.</p>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="media">
             <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {galleryImages.filter(img => img).map((image, index) => (
                    <Card key={index} className="overflow-hidden">
                        <div className="relative aspect-square w-full">
                           {image && <Image src={image.imageUrl} alt={image.description} data-ai-hint={image.imageHint} fill className="object-cover" />}
                        </div>
                    </Card>
                ))}
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
