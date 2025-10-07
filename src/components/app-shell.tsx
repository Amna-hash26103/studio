
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
import { usePathname, useRouter } from 'next/navigation';
import {
  Bell,
  Globe,
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
import { useTranslations, useLocale } from 'next-intl';
import { locales } from '@/app/[locale]/layout';


export function AppShell({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const router = useRouter();
  const auth = useAuth();
  const { user } = useUser();
  const t = useTranslations('AppShell');
  const locale = useLocale();
  const pathname = usePathname();

  const getPathWithoutLocale = () => {
    if (!pathname) return '/';
    const segments = pathname.split('/');
    if (locales.includes(segments[1])) {
      return `/${segments.slice(2).join('/')}`;
    }
    return pathname;
  }
  const pathWithoutLocale = getPathWithoutLocale();

  const mainNavItems = [
    { href: `/feed`, icon: <LayoutDashboard />, label: t('nav.feed') },
    { href: `/healthcare`, icon: <HeartPulse />, label: t('nav.healthcare') },
    { href: `/emotional-health`, icon: <Smile />, label: t('nav.emotionalHealth') },
    { href: `/diet`, icon: <Salad />, label: t('nav.diet') },
  ];

  const accountNavItems = [
      { href: `/profile`, icon: <User />, label: t('nav.profile') },
      { href: '#', icon: <Settings />, label: t('nav.settings') },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: t('toast.logoutSuccess.title'),
        description: t('toast.logoutSuccess.description'),
      });
      router.push(`/${locale}/login`);
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast({
        variant: 'destructive',
        title: t('toast.logoutError.title'),
        description: t('toast.logoutError.description'),
      });
    }
  };

  const getActivePath = (href: string) => {
    // This function will check if the current pathname (without locale) matches the link's href
    const currentPath = `/${pathname.split('/').slice(2).join('/')}`;
    return currentPath === href;
  }

  const sidebarContent = (
    <>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex flex-col items-center gap-2 text-center">
            <Avatar className="h-20 w-20 border-2 border-primary">
                <AvatarImage src={user?.photoURL || undefined} />
                <AvatarFallback>{user?.displayName?.slice(0,2) || 'U'}</AvatarFallback>
            </Avatar>
            <div className='group-data-[collapsible=icon]:hidden text-center'>
                 <p className="font-semibold">{user?.displayName}</p>
                 <p className="text-xs text-muted-foreground">{t('welcomeBack')}</p>
            </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarGroup>
            <SidebarGroupLabel>{t('nav.mainGroup')}</SidebarGroupLabel>
            <SidebarMenu>
            {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                    asChild
                    isActive={getActivePath(item.href)}
                    tooltip={{ children: item.label }}
                >
                    <Link href={`/${locale}${item.href}`}>
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
            <SidebarGroupLabel>{t('nav.accountGroup')}</SidebarGroupLabel>
            <SidebarMenu>
            {accountNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                    asChild
                    isActive={getActivePath(item.href)}
                    tooltip={{ children: item.label }}
                >
                    <Link href={item.href === '#' ? '#' : `/${locale}${item.href}`}>
                    {item.icon}
                    <span>{item.label}</span>
                    </Link>
                </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
            </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} tooltip={{ children: t('nav.logout') }}>
              <LogOut />
              <span>{t('nav.logout')}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );

  const localeItems = [
    { locale: 'en', label: 'English' },
    { locale: 'ur', label: 'اردو' },
    { locale: 'ur-RO', label: 'Roman Urdu' },
    { locale: 'ps', label: 'پښتو' },
    { locale: 'pa', label: 'پنجابی' },
  ];

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
              placeholder={t('searchPlaceholder')}
            />
          </div>
        </form>
      </div>
      <Button variant="ghost" size="icon" className="rounded-full">
        <Bell className="h-5 w-5" />
        <span className="sr-only">{t('notifications')}</span>
      </Button>
       <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <Globe className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {localeItems.map((item) => (
            <DropdownMenuItem key={item.locale} asChild>
              <Link href={pathWithoutLocale} locale={item.locale}>
                {item.label}
              </Link>
            </DropdownMenuItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
  
  const mobileNavItems = [
    { href: `/feed`, icon: <LayoutDashboard />, label: t('nav.feed') },
    { href: `/healthcare`, icon: <HeartPulse />, label: t('nav.healthcare') },
    { href: `/emotional-health`, icon: <Smile />, label: t('nav.emotionalHealth') },
    { href: `/diet`, icon: <Salad />, label: t('nav.diet') },
    { href: `/profile`, icon: <User />, label: t('nav.profile') },
  ]

  const mobileNav = (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-background md:hidden">
      <div className="grid h-16 grid-cols-5 items-center">
        {mobileNavItems.map((item) => (
          <Link
            key={item.href}
            href={`/${locale}${item.href}`}
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
    </SidebarProvider>
  );
}
