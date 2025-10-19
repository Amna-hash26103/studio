
'use client';

import React from 'react';
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
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Bell,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  Salad,
  Settings,
  Smile,
  User,
  Droplets,
  Users,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { SupportBot } from './support-bot';
import { FemmoraLogo } from './icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { ReadAloudButton } from './read-aloud-button';
import { Loader2 } from 'lucide-react';

export function AppShell({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const router = useRouter();
  const auth = useAuth();
  const { user } = useUser();
  const pathname = usePathname();
  const { toast } = useToast();

  const mainNavItems = [
    { href: `/feed`, icon: <Users />, label: 'Community' },
    { href: `/period-tracker`, icon: <Droplets />, label: 'Period Tracker' },
    { href: `/diet`, icon: <Salad />, label: 'Diet' },
    { href: `/emotional-health`, icon: <Smile />, label: 'Emotional Health' },
    { href: `/healthcare`, icon: <HeartPulse />, label: 'Healthcare' },
  ];
  
  const accountNavItems = [
    { href: `/profile`, icon: <User />, label: 'Profile' },
    { href: `/settings`, icon: <Settings />, label: 'Settings' },
  ];


  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
      router.push(`/login`);
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not log you out. Please try again.',
      });
    }
  };

  const getActivePath = (href: string) => {
    return pathname === href;
  }
  
  const welcomeText = `Welcome back, ${user?.displayName?.split(' ')[0]}`;

  const sidebarContent = (
    <>
      <SidebarHeader className="p-4">
        <div className="flex flex-col items-center text-center gap-2 group-data-[collapsible=icon]:hidden">
          <Avatar className="h-20 w-20 border-2 border-primary">
            <AvatarImage src={user?.photoURL || undefined} />
            <AvatarFallback>{user?.displayName?.slice(0,1) || 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div className='flex items-center'>
                <span className="text-sm font-semibold truncate">{welcomeText}</span>
                 <ReadAloudButton textToRead={welcomeText} />
            </div>
            <span className="text-lg font-bold truncate">{user?.displayName?.split(' ')[0]}</span>
          </div>
        </div>
         <div className="hidden group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
            <Avatar className="h-10 w-10 border-2 border-primary">
                <AvatarImage src={user?.photoURL || undefined} />
                <AvatarFallback>{user?.displayName?.slice(0,1) || 'U'}</AvatarFallback>
            </Avatar>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarGroup>
            <SidebarGroupLabel>MAIN</SidebarGroupLabel>
            <SidebarMenu>
            {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                    asChild
                    isActive={getActivePath(item.href)}
                    tooltip={{ children: item.label }}
                >
                    <Link href={item.href}>
                    {item.icon}
                    <span>{item.label}</span>
                    </Link>
                </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
            </SidebarMenu>
        </SidebarGroup>
        <SidebarSeparator />
        <SidebarGroup>
            <SidebarGroupLabel>ACCOUNT</SidebarGroupLabel>
             <SidebarMenu>
            {accountNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                    asChild
                    isActive={getActivePath(item.href)}
                    tooltip={{ children: item.label }}
                >
                    <Link href={item.href}>
                    {item.icon}
                    <span>{item.label}</span>
                    </Link>
                </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
            </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-2 space-y-2">
        <SidebarSeparator />
         <SidebarMenu>
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
      <Link href="/feed" className="flex items-center gap-2 md:hidden">
          <FemmoraLogo className="h-8 w-8 text-primary" />
          <span className="sr-only">FEMMORA</span>
      </Link>
      <div className="md:hidden ml-auto">
        <SidebarTrigger />
      </div>
      <div className="hidden md:block">
        <SidebarTrigger />
      </div>
      <div className="w-full flex-1">
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
            <span className="sr-only">Notifications</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="flex-col items-start gap-1">
            <p className="font-medium">New post from Chloe! ✨</p>
            <p className="text-xs text-muted-foreground">
              "Cycle syncing my workouts has been a game-changer!..."
            </p>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="flex-col items-start gap-1">
            <p className="font-medium">Hydration Reminder 💧</p>
            <p className="text-xs text-muted-foreground">
              Don't forget to drink some water.
            </p>
          </DropdownMenuItem>
           <DropdownMenuSeparator />
           <DropdownMenuItem className="flex-col items-start gap-1">
            <p className="font-medium">New post from Elena!</p>
            <p className="text-xs text-muted-foreground">
              "Just finished a 7-day mindfulness challenge..."
            </p>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
  
  const mobileNavItems = [
    { href: `/feed`, icon: <Users />, label: 'Feed' },
    { href: `/period-tracker`, icon: <Droplets />, label: 'Tracker' },
    { href: `/diet`, icon: <Salad />, label: 'Diet' },
    { href: `/emotional-health`, icon: <Smile />, label: 'Wellness' },
    { href: `/settings`, icon: <Settings />, label: 'Settings' },
  ]

  const mobileNav = (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-background md:hidden">
      <div className="grid h-16 grid-cols-5 items-center">
        {mobileNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-1 text-xs ${
              getActivePath(item.href)
                ? 'text-primary'
                : 'text-muted-foreground'
            }`}
          >
            {React.cloneElement(item.icon, { size: 20 })}
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
        <div className="flex-1 flex flex-col min-h-0">
            {headerContent}
            <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10 pb-20 md:pb-8">
                {children}
            </main>
        </div>
        {isMobile && mobileNav}
      </div>
      <SupportBot />
    </SidebarProvider>
  );
}

    