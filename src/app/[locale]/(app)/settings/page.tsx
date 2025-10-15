
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
    { value: 'en', label: t('langEnglish') },
    { value: 'ur', label: t('langUrdu') },
    { value: 'ur-RO', label: t('langRomanUrdu') },
    { value: 'ps', label: t('langPashto') },
    { value: 'pa', label: t('langPunjabi') },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('accountTitle')}</CardTitle>
          <CardDescription>{t('accountDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t('accountEmailLabel')}</Label>
            <Input id="email" type="email" value={user?.email || ''} readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t('accountPasswordLabel')}</Label>
            <Button variant="outline" className="w-full sm:w-auto">
              {t('accountChangePasswordButton')}
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild>
            <Link href="/profile">{t('accountManageProfileButton')}</Link>
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('appearanceTitle')}</CardTitle>
          <CardDescription>{t('appearanceDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-medium">{t('themeTitle')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('themeDescription')}
            </p>
            <div className="flex space-x-2 rounded-lg bg-secondary p-1">
              <Button
                variant={theme === 'light' ? 'default' : 'ghost'}
                onClick={() => setTheme('light')}
                className="w-full"
              >
                <Sun className="mr-2 h-4 w-4" />
                {t('themeLight')}
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'ghost'}
                onClick={() => setTheme('dark')}
                className="w-full"
              >
                <Moon className="mr-2 h-4 w-4" />
                {t('themeDark')}
              </Button>
              <Button
                variant={theme === 'system' ? 'default' : 'ghost'}
                onClick={() => setTheme('system')}
                className="w-full"
              >
                <Monitor className="mr-2 h-4 w-4" />
                {t('themeSystem')}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium">{t('languageTitle')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('languageDescription')}
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
