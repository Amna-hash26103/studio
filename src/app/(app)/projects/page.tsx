import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { PlusCircle } from 'lucide-react';
import Image from 'next/image';

const projects = [
  {
    id: 1,
    title: 'Sustainable Fashion Blog',
    author: 'Jane Doe',
    description: 'A blog dedicated to promoting ethical and sustainable choices in the fashion industry.',
    image: PlaceHolderImages.find((img) => img.id === 'project-image-1'),
    progress: 75,
    members: 5,
  },
  {
    id: 2,
    title: 'Wellness App for Moms',
    author: 'Sarah Smith',
    description: 'Developing a mobile app to help new mothers with postpartum mental and physical wellness.',
    image: PlaceHolderImages.find((img) => img.id === 'project-image-2'),
    progress: 40,
    members: 8,
  },
    {
    id: 3,
    title: 'Local Art Collective',
    author: 'Emily White',
    description: 'Organizing a collective for local female artists to showcase and sell their work.',
    image: PlaceHolderImages.find((img) => img.id === 'feed-post-3'),
    progress: 90,
    members: 12,
  }
];

export default function ProjectsPage() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">
            Explore, collaborate, and bring your ideas to life.
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Project
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id}>
            <CardHeader>
              {project.image && (
                <div className="relative aspect-video w-full overflow-hidden rounded-t-lg">
                  <Image src={project.image.imageUrl} alt={project.title} data-ai-hint={project.image.imageHint} fill className="object-cover" />
                </div>
              )}
              <CardTitle className="pt-4">{project.title}</CardTitle>
              <CardDescription>By {project.author}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">{project.description}</p>
              <div className="space-y-2">
                <div className='flex justify-between text-sm text-muted-foreground'>
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                </div>
                <Progress value={project.progress} />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">{project.members} members</div>
              <Button variant="secondary" size="sm">View Project</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
