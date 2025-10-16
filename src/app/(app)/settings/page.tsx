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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { user } = useUser();
  const { theme, setTheme } = useTheme();

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

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
              defaultValue={i18n.language}
              onValueChange={handleLanguageChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('appearance.language.selectPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ur">Urdu</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
