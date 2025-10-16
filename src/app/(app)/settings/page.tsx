
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
import { Bot, Monitor, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { user } = useUser();
  const { theme, setTheme } = useTheme();
  const [botName, setBotName] = useState('Aura');
  const { toast } = useToast();

  useEffect(() => {
    const storedBotName = localStorage.getItem('chatbotName');
    if (storedBotName) {
      setBotName(storedBotName);
    }
  }, []);

  const handleSaveBotName = () => {
    localStorage.setItem('chatbotName', botName);
    toast({
      title: 'Chatbot name saved!',
      description: `Your support assistant is now named ${botName}.`,
    });
    // Force a re-render of other components if necessary by dispatching a custom event
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and app preferences.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Manage your account details.</CardDescription>
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
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Customize the look and feel of the app.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-medium">Theme</h3>
            <p className="text-sm text-muted-foreground">
              Choose how the app looks on your device.
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot /> Chatbot
          </CardTitle>
          <CardDescription>
            Personalize your AI support assistant.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="botName">Chatbot Name</Label>
            <Input
              id="botName"
              value={botName}
              onChange={(e) => setBotName(e.target.value)}
              placeholder="e.g., Aura"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveBotName}>Save Name</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
