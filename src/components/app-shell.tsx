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
import { usePathname } from 'next/navigation';
import {
  Bell,
  Bot,
  Briefcase,
  Home,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Search,
  Settings,
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

const navItems = [
  { href: '/feed', icon: <LayoutDashboard />, label: 'Feed' },
  { href: '/chatbot', icon: <Bot />, label: 'Wellness AI' },
  { href: '/projects', icon: <Briefcase />, label: 'Projects' },
  { href: '/messages', icon: <MessageSquare />, label: 'Messages' },
  { href: '/profile', icon: <User />, label: 'Profile' },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const pathname = usePathname();

  const sidebarContent = (
    <>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 p-2">
          <FemmoraLogo className="h-8 w-8 text-primary" />
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
            <SidebarMenuButton asChild tooltip={{ children: 'Log Out' }}>
              <Link href="/">
                <LogOut />
                <span>Log Out</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );

  const headerContent = (
    <header className="flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <div className="md:hidden">
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
              <AvatarImage src="https://picsum.photos/seed/user1/40/40" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <span className="sr-only">User menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Jane Doe</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/profile">Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/">Log Out</Link>
          </DropdownMenuItem>
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
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full">
        <Sidebar collapsible="icon">{sidebarContent}</Sidebar>
        <SidebarInset>
          {headerContent}
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            {children}
          </main>
          {isMobile && <div className="h-16" />} 
        </SidebarInset>
        {isMobile && mobileNav}
      </div>
    </SidebarProvider>
  );
}
