import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { MoreVertical, Paperclip, Search, Smile } from 'lucide-react';

const conversations = [
    { id: 1, name: 'Sarah Smith', avatar: PlaceHolderImages.find(i=>i.id==='user-avatar-2'), lastMessage: "Let's catch up tomorrow!", time: "10m", unread: 2 },
    { id: 2, name: 'Emily White', avatar: PlaceHolderImages.find(i=>i.id==='user-avatar-3'), lastMessage: "I loved your project idea!", time: "1h", unread: 0 },
    { id: 3, name: 'Project Group: Wellness App', avatar: null, lastMessage: "Jane: Great work on the mockups!", time: "3h", unread: 5 },
]

export default function MessagesPage() {
  return (
    <Card className="h-[80vh] w-full">
      <div className="grid h-full grid-cols-1 md:grid-cols-3">
        <div className="flex flex-col border-r">
          <CardHeader className="p-4">
            <div className="flex items-center justify-between">
                <h2 className="font-headline text-2xl font-bold">Messages</h2>
            </div>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search messages..." className="pl-9" />
            </div>
          </CardHeader>
          <ScrollArea className="flex-1">
            <div className="space-y-1 p-2">
                {conversations.map(conv => (
                    <button key={conv.id} className={cn("flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors", conv.id === 1 ? "bg-secondary" : "hover:bg-secondary/50")}>
                        <Avatar>
                            <AvatarImage src={conv.avatar?.imageUrl} />
                            <AvatarFallback>{conv.name.slice(0,2)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 overflow-hidden">
                            <div className="flex items-baseline justify-between">
                                <p className="truncate font-semibold">{conv.name}</p>
                                <p className="text-xs text-muted-foreground">{conv.time}</p>
                            </div>
                            <div className="flex items-center justify-between">
                                <p className="truncate text-sm text-muted-foreground">{conv.lastMessage}</p>
                                {conv.unread > 0 && <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">{conv.unread}</span>}
                            </div>
                        </div>
                    </button>
                ))}
            </div>
          </ScrollArea>
        </div>
        <div className="flex flex-col md:col-span-2">
           <CardHeader className="flex flex-row items-center justify-between border-b p-4">
               <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src={conversations[0].avatar?.imageUrl} />
                        <AvatarFallback>{conversations[0].name.slice(0,2)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold">{conversations[0].name}</p>
                        <p className="text-sm text-green-500">Online</p>
                    </div>
               </div>
               <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5" />
               </Button>
           </CardHeader>
           <CardContent className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                    {/* Placeholder chat messages */}
                     <div className="flex items-start gap-3 justify-end">
                        <div className="max-w-xs rounded-lg bg-primary px-4 py-2 text-primary-foreground md:max-w-md">Hey Sarah! How are you?</div>
                        <Avatar><AvatarImage src={PlaceHolderImages.find(i=>i.id==='user-avatar-1')?.imageUrl} /><AvatarFallback>ME</AvatarFallback></Avatar>
                    </div>
                    <div className="flex items-start gap-3 justify-start">
                        <Avatar><AvatarImage src={conversations[0].avatar?.imageUrl} /><AvatarFallback>SS</AvatarFallback></Avatar>
                        <div className="max-w-xs rounded-lg bg-secondary px-4 py-2 md:max-w-md">I'm good, thanks! Just working on the project. How about you?</div>
                    </div>
                </div>
           </CardContent>
           <div className="border-t p-4">
             <div className="relative">
                <Input placeholder="Type a message..." className="pr-28" />
                <div className="absolute right-2 top-1/2 flex -translate-y-1/2 gap-1">
                    <Button variant="ghost" size="icon"><Smile className="h-5 w-5" /></Button>
                    <Button variant="ghost" size="icon"><Paperclip className="h-5 w-5" /></Button>
                </div>
             </div>
           </div>
        </div>
      </div>
    </Card>
  );
}
