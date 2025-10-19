
'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Moon, Sun, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ReadAloudButton } from '@/components/read-aloud-button';

const settingsSchema = z.object({
  botName: z.string().min(2, {
    message: 'Bot name must be at least 2 characters.',
  }),
});

export default function SettingsPage() {
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);

  // Bot name state and effect
  const [botName, setBotName] = useState('Aura');
  useEffect(() => {
    const storedName = localStorage.getItem('chatbotName');
    if (storedName) {
      setBotName(storedName);
    }
  }, []);

  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    values: {
      botName: botName,
    },
  });
  
  // Update form default value when botName state changes
  useEffect(() => {
    form.reset({ botName });
  }, [botName, form]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const onSubmit = (values: z.infer<typeof settingsSchema>) => {
    try {
      localStorage.setItem('chatbotName', values.botName);
      setBotName(values.botName); // Update state to reflect change immediately
      toast({
        title: 'Settings Saved',
        description: 'Your new settings have been applied.',
      });
       // Trigger a storage event to notify other components like the support bot
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not save settings.',
      });
      console.error('Error saving settings:', error);
    }
  };

  const pageTitle = "Settings";
  const pageDescription = "Manage your account and app preferences.";
  const appearanceTitle = "Appearance";
  const appearanceDescription = "Customize the look and feel of the app.";
  const generalTitle = "General";
  const generalDescription = "Manage general application settings.";

  if (!mounted) {
    return null; // or a loading skeleton
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
         <div className="flex items-center gap-2">
            <h1 className="font-headline text-3xl font-bold">{pageTitle}</h1>
            <ReadAloudButton textToRead={pageTitle} />
         </div>
         <div className="flex items-center gap-2">
            <p className="text-muted-foreground">{pageDescription}</p>
            <ReadAloudButton textToRead={pageDescription} />
         </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>{appearanceTitle}</CardTitle>
            <ReadAloudButton textToRead={appearanceTitle} />
          </div>
          <div className="flex items-center gap-2">
            <CardDescription>{appearanceDescription}</CardDescription>
            <ReadAloudButton textToRead={appearanceDescription} />
          </div>
        </CardHeader>
        <CardContent>
          <ThemeSwitcher />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>{generalTitle}</CardTitle>
            <ReadAloudButton textToRead={generalTitle} />
          </div>
          <div className="flex items-center gap-2">
            <CardDescription>{generalDescription}</CardDescription>
            <ReadAloudButton textToRead={generalDescription} />
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="botName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Support Bot Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Aura" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { name: 'Light', value: 'light', icon: Sun },
    { name: 'Dark', value: 'dark', icon: Moon },
    { name: 'System', value: 'system', icon: Monitor },
  ];
  
  const themeLabel = "Theme";

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{themeLabel}</label>
        <ReadAloudButton textToRead={themeLabel} />
      </div>
      <div className="grid grid-cols-3 gap-2 rounded-lg border p-1">
        {themes.map((t) => (
          <Button
            key={t.value}
            variant="ghost"
            size="sm"
            className={cn(
              'flex items-center justify-center gap-2',
              theme === t.value && 'bg-accent text-accent-foreground'
            )}
            onClick={() => setTheme(t.value)}
          >
            <t.icon className="h-4 w-4" />
            <span className="truncate">{t.name}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
