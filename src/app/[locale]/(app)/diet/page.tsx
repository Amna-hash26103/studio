
'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { dietAgent } from '@/ai/flows/diet-agent-flow';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ChatInterface } from '@/components/chat-interface';
import { v4 as uuidv4 } from 'uuid';

type MealLog = {
  id: string;
  userId: string;
  description: string;
  createdAt: { seconds: number };
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
};

const initialMealLogs: MealLog[] = [
    {
        id: '1',
        userId: 'dummy-user',
        description: 'A bowl of oatmeal with blueberries and almonds',
        createdAt: { seconds: Math.floor(Date.now() / 1000) - 3600 * 2 }, // 2 hours ago
        calories: 350,
        protein: 10,
        carbs: 60,
        fat: 10,
        fiber: 8,
    },
    {
        id: '2',
        userId: 'dummy-user',
        description: 'Grilled chicken salad with avocado dressing',
        createdAt: { seconds: Math.floor(Date.now() / 1000) - 3600 * 24 }, // yesterday
        calories: 450,
        protein: 35,
        carbs: 15,
        fat: 28,
        fiber: 7,
    }
];


const formSchema = z.object({
  mealDescription: z.string().min(10, {
    message: 'Please describe your meal in at least 10 characters.',
  }),
});

export default function DietPage() {
  const { toast } = useToast();
  const [mealLogs, setMealLogs] = useState<MealLog[]>(initialMealLogs);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mealDescription: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Use the new diet agent to get nutritional info
      const response = await dietAgent(`Analyze this meal: ${values.mealDescription}`);
      
      // A simple way to find the JSON data from the agent's response
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
      if (!jsonMatch || !jsonMatch[1]) {
        throw new Error("Could not parse nutritional data from AI response.");
      }

      const nutritionData = JSON.parse(jsonMatch[1]);
      
      const newLog: MealLog = {
        id: uuidv4(),
        userId: 'dummy-user', // Replace with actual user ID
        description: values.mealDescription,
        createdAt: { seconds: Math.floor(Date.now() / 1000) },
        ...nutritionData,
      };

      setMealLogs(prevLogs => [newLog, ...prevLogs]);

      toast({
        title: 'Meal Logged!',
        description: 'Your meal and its nutritional info have been saved.',
      });
      form.reset();
    } catch (error) {
      console.error('Error logging meal:', error);
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: "We couldn't analyze your meal right now. Please try again.",
      });
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold">Diet AI</h1>
        <p className="text-muted-foreground">Your personal guide for nutrition and healthy eating.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Log a Meal</CardTitle>
          <CardDescription>Describe what you ate, and our AI will estimate the nutritional content.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="mealDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meal Description</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., A bowl of oatmeal with blueberries and almonds"
                        {...field}
                        disabled={form.formState.isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {form.formState.isSubmitting ? 'Analyzing...' : 'Analyze & Log Meal'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <MealHistory logs={mealLogs} isLoading={isLoadingLogs} />
      
      <div className="mt-8">
        <h2 className="font-headline text-2xl font-bold">Ask Your Diet Guide</h2>
        <p className="text-muted-foreground">Have questions about nutrition? Ask your AI assistant below.</p>
        <div className="mt-4">
          <ChatInterface topic="nutrition" useDietAgent={true} />
        </div>
      </div>
    </div>
  );
}

function MealHistory({ logs, isLoading }: { logs: MealLog[] | null, isLoading: boolean }) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Meal History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
             <div key={i} className="p-4 rounded-lg border bg-muted animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
             </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (!logs || logs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Meal History</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground py-10">
          <p>You haven't logged any meals yet. Add one above to get started!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Meal History</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {logs.map((log) => (
          <MealLogCard key={log.id} log={log} />
        ))}
      </CardContent>
    </Card>
  );
}

function MealLogCard({ log }: { log: MealLog }) {
  const nutritionInfo = [
    { label: 'Calories', value: log.calories.toFixed(0), unit: '' },
    { label: 'Protein', value: log.protein.toFixed(1), unit: 'g' },
    { label: 'Carbs', value: log.carbs.toFixed(1), unit: 'g' },
    { label: 'Fat', value: log.fat.toFixed(1), unit: 'g' },
    { label: 'Fiber', value: log.fiber.toFixed(1), unit: 'g' },
  ];

  return (
    <Card className="bg-secondary/50">
      <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold">{log.description}</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(log.createdAt.seconds * 1000), 'MMMM d, yyyy, h:mm a')}
              </p>
            </div>
          </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 text-center">
          {nutritionInfo.map((item) => (
            <div key={item.label} className="flex flex-col items-center justify-center p-2 rounded-lg bg-background">
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className="text-lg font-bold">{item.value}{item.unit}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
