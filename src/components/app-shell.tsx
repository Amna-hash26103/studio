'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { FemmoraLogo } from './icons';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bell,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Salad,
  Search,
  Settings,
  Smile,
  User,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

const navItems = [
  { href: '/feed', icon: <LayoutDashboard />, label: 'Feed' },
  { href: '/healthcare', icon: <HeartPulse />, label: 'Healthcare' },
  { href: '/emotional-health', icon: <Smile />, label: 'Emotional Health' },
  { href: '/diet', icon: <Salad />, label: 'Diet' },
 
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
      router.push('/login');
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh!',
        description: 'Could not log you out. Please try again.',
      });
    }
  };

  const sidebarContent = (
    <>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-1 p-2">
          <FemmoraLogo className="h-20 w-20 text-primary" />
          <span className="font-headline text-lg font-bold">FEMMORA</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.href)}
                tooltip={{ children: item.label }}
              >
                <Link href={item.href}>
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
            <SidebarMenuItem>
                 <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith('/profile')}
                    tooltip={{ children: 'Profile' }}
                >
                    <Link href={`/profile`}>
                        <User />
                        <span>Profile</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip={{ children: 'Settings' }}>
              <Link href="#">
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} tooltip={{ children: 'Log Out' }}>
              <LogOut />
              <span>Log Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );

  const headerContent = (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background px-4 md:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <div className="hidden md:block">
        <SidebarTrigger />
      </div>
      <div className="w-full flex-1">
        <form>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="w-full appearance-none bg-secondary pl-9 md:w-2/3 lg:w-1/3"
              placeholder="Search..."
            />
          </div>
        </form>
      </div>
      <Button variant="ghost" size="icon" className="rounded-full">
        <Bell className="h-5 w-5" />
        <span className="sr-only">Notifications</span>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.photoURL || undefined} />
              <AvatarFallback>{user?.displayName?.slice(0,2) || 'U'}</AvatarFallback>
            </Avatar>
            <span className="sr-only">User menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{user?.displayName}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/profile">Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>Log Out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );

  const mobileNav = (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-background md:hidden">
      <div className="grid h-16 grid-cols-5 items-center">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-1 text-xs ${
              pathname.startsWith(item.href)
                ? 'text-primary'
                : 'text-muted-foreground'
            }`}
          >
            {item.icon}
            <span className="truncate">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar collapsible="icon">{sidebarContent}</Sidebar>
        <div className="flex flex-1 flex-col">
            {headerContent}
            <main className="flex-1 overflow-y-auto p-4 pb-20 md:p-6 lg:p-8 md:pb-8">
                {children}
            </main>
        </div>
        {isMobile && mobileNav}
      </div>
    </SidebarProvider>
  );
}
