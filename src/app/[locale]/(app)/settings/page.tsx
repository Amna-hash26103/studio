
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUser } from '@/firebase';
import { useTheme } from 'next-themes';
import { useLocale, useTranslations } from 'next-intl';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Link, usePathname, useRouter } from '@/navigation';
import { Monitor, Moon, Sun } from 'lucide-react';

export default function SettingsPage() {
  const t = useTranslations('SettingsPage');
  const { user } = useUser();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();

  const handleLanguageChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  const localeItems = [
    { value: 'en', label: t('appearance.language.languages.en') },
    { value: 'ur', label: t('appearance.language.languages.ur') },
    { value: 'ur-RO', label: t('appearance.language.languages.ur-RO') },
    { value: 'ps', label: t('appearance.language.languages.ps') },
    { value: 'pa', label: t('appearance.language.languages.pa') },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('account.title')}</CardTitle>
          <CardDescription>{t('account.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t('account.emailLabel')}</Label>
            <Input id="email" type="email" value={user?.email || ''} readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t('account.passwordLabel')}</Label>
            <Button variant="outline" className="w-full sm:w-auto">
              {t('account.changePasswordButton')}
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild>
            <Link href="/profile">{t('account.manageProfileButton')}</Link>
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('appearance.title')}</CardTitle>
          <CardDescription>{t('appearance.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-medium">{t('appearance.theme.title')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('appearance.theme.description')}
            </p>
            <div className="flex space-x-2 rounded-lg bg-secondary p-1">
              <Button
                variant={theme === 'light' ? 'default' : 'ghost'}
                onClick={() => setTheme('light')}
                className="w-full"
              >
                <Sun className="mr-2 h-4 w-4" />
                {t('appearance.theme.light')}
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'ghost'}
                onClick={() => setTheme('dark')}
                className="w-full"
              >
                <Moon className="mr-2 h-4 w-4" />
                {t('appearance.theme.dark')}
              </Button>
              <Button
                variant={theme === 'system' ? 'default' : 'ghost'}
                onClick={() => setTheme('system')}
                className="w-full"
              >
                <Monitor className="mr-2 h-4 w-4" />
                {t('appearance.theme.system')}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium">{t('appearance.language.title')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('appearance.language.description')}
            </p>
            <Select
              value={currentLocale}
              onValueChange={handleLanguageChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {localeItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
