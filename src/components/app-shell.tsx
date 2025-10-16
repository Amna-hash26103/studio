
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
  Globe,
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
import { useTranslation, languages } from '@/lib/i18n';

export function AppShell({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const router = useRouter();
  const auth = useAuth();
  const { user } = useUser();
  const pathname = usePathname();
  const { toast } = useToast();
  const { t, lang, setLanguage } = useTranslation();

  const mainNavItems = [
    { href: `/feed`, icon: <LayoutDashboard />, label: t('sidebar.feed') },
    { href: `/healthcare`, icon: <HeartPulse />, label: t('sidebar.healthcare') },
    { href: `/emotional-health`, icon: <Smile />, label: t('sidebar.emotionalHealth') },
    { href: `/diet`, icon: <Salad />, label: t('sidebar.diet') },
    { href: `/period-tracker`, icon: <Droplets />, label: t('sidebar.periodTracker') },
  ];
  
  const accountNavItems = [
    { href: `/settings`, icon: <Settings />, label: t('sidebar.settings') },
  ];


  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: t('appShell.logoutSuccessTitle'),
        description: t('appShell.logoutSuccessDescription'),
      });
      router.push(`/login`);
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: t('appShell.logoutError'),
      });
    }
  };

  const getActivePath = (href: string) => {
    return pathname === href;
  }
  
  const welcomeText = t('sidebar.welcome', { name: user?.displayName?.split(' ')[0] });

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
                 <ReadAloudButton textToRead={welcomeText} lang={lang} />
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
            <SidebarGroupLabel>{t('sidebar.main')}</SidebarGroupLabel>
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
            <SidebarGroupLabel>{t('sidebar.account')}</SidebarGroupLabel>
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
                <SidebarMenuButton onClick={handleLogout} tooltip={{ children: t('sidebar.logout') }}>
                <LogOut />
                <span>{t('sidebar.logout')}</span>
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
          <Button variant="ghost" size="icon">
            <Globe className="h-5 w-5" />
            <span className="sr-only">{t('appShell.selectLanguage')}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {languages.map(({code, name}) => (
            <DropdownMenuItem key={code} onSelect={() => setLanguage(code)}>
              {name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
            <span className="sr-only">{t('appShell.notifications')}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{t('appShell.notifications')}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="flex-col items-start gap-1">
            <p className="font-medium">{t('appShell.notification1.title')}</p>
            <p className="text-xs text-muted-foreground">
              {t('appShell.notification1.description')}
            </p>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="flex-col items-start gap-1">
            <p className="font-medium">{t('appShell.notification2.title')}</p>
            <p className="text-xs text-muted-foreground">
              {t('appShell.notification2.description')}
            </p>
          </DropdownMenuItem>
           <DropdownMenuSeparator />
           <DropdownMenuItem className="flex-col items-start gap-1">
            <p className="font-medium">{t('appShell.notification3.title')}</p>
            <p className="text-xs text-muted-foreground">
              {t('appShell.notification3.description')}
            </p>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
  
  const mobileNavItems = [
    { href: `/feed`, icon: <LayoutDashboard />, label: t('sidebar.feed') },
    { href: `/period-tracker`, icon: <Droplets />, label: t('sidebar.periodTracker') },
    { href: `/emotional-health`, icon: <Smile />, label: t('sidebar.health') },
    { href: `/settings`, icon: <Settings />, label: t('sidebar.settings') },
  ]

  const mobileNav = (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-background md:hidden">
      <div className="grid h-16 grid-cols-4 items-center">
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
        <div className="flex-1 flex flex-col min-h-0">
            {headerContent}
            <main className="flex-1 overflow-y-auto p-4 pb-20 md:p-6 lg:p-8 md:pb-8">
                {children}
            </main>
        </div>
        {isMobile && mobileNav}
      </div>
      <SupportBot />
    </SidebarProvider>
  );
}
