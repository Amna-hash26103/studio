
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
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Monitor, Moon, Sun } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useUser();
  const { theme, setTheme } = useTheme();

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account, preferences, and app settings.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Update your profile information and manage your account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={user?.email || ''} readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Button variant="outline" className="w-full sm:w-auto">
              Change Password
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild>
            <Link href="/profile">Manage Profile</Link>
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize the look and feel of the app.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-medium">Theme</h3>
            <p className="text-sm text-muted-foreground">
              Select a theme for the application.
            </p>
            <div className="flex space-x-2 rounded-lg bg-secondary p-1">
              <Button
                variant={theme === 'light' ? 'default' : 'ghost'}
                onClick={() => setTheme('light')}
                className="w-full"
              >
                <Sun className="mr-2 h-4 w-4" />
                Light
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'ghost'}
                onClick={() => setTheme('dark')}
                className="w-full"
              >
                <Moon className="mr-2 h-4 w-4" />
                Dark
              </Button>
              <Button
                variant={theme === 'system' ? 'default' : 'ghost'}
                onClick={() => setTheme('system')}
                className="w-full"
              >
                <Monitor className="mr-2 h-4 w-4" />
                System
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium">Language</h3>
            <p className="text-sm text-muted-foreground">
              Choose your preferred language.
            </p>
            <Select
              defaultValue="en"
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ur">Urdu</SelectItem>
                <SelectItem value="ur-RO">Roman Urdu</SelectItem>
                <SelectItem value="ps">Pashto</SelectItem>
                <SelectItem value="pa">Punjabi</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
