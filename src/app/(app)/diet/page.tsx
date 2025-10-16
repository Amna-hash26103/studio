
'use client';

import React, { useState, useEffect } from 'react';
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
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { dietAgent } from '@/ai/flows/diet-agent-flow';
import { Loader2, Minus, Plus, GlassWater, Bean } from 'lucide-react';
import { format } from 'date-fns';
import { ChatInterface } from '@/components/chat-interface';
import { v4 as uuidv4 } from 'uuid';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { scheduleReminder } from '@/lib/reminders';

type MealLog = {
  id: string;
  description: string;
  createdAt: Date;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
};

const formSchema = z.object({
  mealDescription: z.string().min(10, {
    message: 'Please describe your meal in at least 10 characters.',
  }),
});

type PoopLog = {
    id: string;
    type: string;
    createdAt: Date;
};

const initialMealLogs: MealLog[] = [
    {
        id: uuidv4(),
        description: 'Grilled chicken salad with avocado and vinaigrette',
        createdAt: new Date(new Date().setDate(new Date().getDate() - 1)),
        calories: 450,
        protein: 35,
        carbs: 15,
        fat: 25,
        fiber: 8,
    },
    {
        id: uuidv4(),
        description: 'Oatmeal with berries, nuts, and a drizzle of honey',
        createdAt: new Date(),
        calories: 320,
        protein: 10,
        carbs: 55,
        fat: 8,
        fiber: 10,
    },
    {
        id: uuidv4(),
        description: 'Lentil soup with a side of whole wheat bread',
        createdAt: new Date(new Date().setDate(new Date().getDate() - 2)),
        calories: 380,
        protein: 18,
        carbs: 65,
        fat: 5,
        fiber: 15,
    }
]

export default function DietPage() {
  const { toast } = useToast();
  const [mealLogs, setMealLogs] = useState<MealLog[]>(initialMealLogs);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false); 

  const [waterIntake, setWaterIntake] = useState(3); // in glasses
  const [poopLogs, setPoopLogs] = useState<PoopLog[]>([
    { id: uuidv4(), type: '4', createdAt: new Date(new Date().setHours(8, 15, 0)) }
  ]);

  useEffect(() => {
    const waterTimeout = scheduleReminder('water');
    const mealTimeout = scheduleReminder('meal');

    return () => {
      clearTimeout(waterTimeout);
      clearTimeout(mealTimeout);
    };
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mealDescription: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await dietAgent(`Analyze this meal: ${values.mealDescription}`);
      
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
      if (!jsonMatch || !jsonMatch[1]) {
        throw new Error("Could not parse nutritional data from AI response.");
      }

      const nutritionData = JSON.parse(jsonMatch[1]);
      
      const newLog: MealLog = {
        id: uuidv4(),
        description: values.mealDescription,
        createdAt: new Date(),
        ...nutritionData,
      };

      setMealLogs(prev => [newLog, ...prev].sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime()));

      toast({
        title: 'Meal Logged!',
        description: 'Your meal and its nutritional info have been saved locally.',
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

  const handleLogPoop = (type: string) => {
    if (!type) return;
    const newLog: PoopLog = {
        id: uuidv4(),
        type,
        createdAt: new Date(),
    };
    setPoopLogs(prev => [...prev, newLog].sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime()));
    toast({
        title: "Bowel Movement Logged",
        description: `You've logged a Type ${type} movement.`
    })
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold">Diet & Digestion</h1>
        <p className="text-muted-foreground">Track your meals, hydration, and digestive health.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <WaterTracker waterIntake={waterIntake} setWaterIntake={setWaterIntake} />
        <PoopTracker logs={poopLogs} onLog={handleLogPoop} />
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

function WaterTracker({ waterIntake, setWaterIntake }: { waterIntake: number, setWaterIntake: (fn: (prev: number) => number) => void }) {
    const glasses = Array.from({ length: 8 });

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <GlassWater /> Water Intake
                </CardTitle>
                <CardDescription>Log your daily water intake. Aim for 8 glasses a day!</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center gap-4">
                <div className="flex flex-col items-center gap-2">
                    <div className="text-5xl font-bold text-primary">{waterIntake}</div>
                    <div className="text-muted-foreground">glasses</div>
                </div>
                 <div className="grid grid-cols-4 gap-2">
                    {glasses.map((_, i) => (
                        <GlassWater
                        key={i}
                        className={`h-10 w-10 transition-colors ${
                            i < waterIntake ? 'text-blue-500 fill-blue-300' : 'text-slate-300'
                        }`}
                        />
                    ))}
                </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                 <Button variant="outline" size="icon" onClick={() => setWaterIntake(p => Math.max(0, p - 1))} disabled={waterIntake === 0}>
                    <Minus className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => setWaterIntake(p => p + 1)}>
                    <Plus className="h-4 w-4" />
                </Button>
            </CardFooter>
        </Card>
    );
}

function PoopTracker({ logs, onLog }: { logs: PoopLog[], onLog: (type: string) => void }) {
    const bristolScale = [
        { value: '1', label: 'Type 1: Separate hard lumps' },
        { value: '2', label: 'Type 2: Lumpy and sausage-like' },
        { value: '3', label: 'Type 3: Sausage shape with cracks' },
        { value: '4', label: 'Type 4: Smooth, soft sausage' },
        { value: '5', label: 'Type 5: Soft blobs with clear edges' },
        { value: '6', label: 'Type 6: Mushy, ragged edges' },
        { value: '7', label: 'Type 7: Liquid consistency' },
    ];
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bean /> Bowel Movement Tracker
                </CardTitle>
                <CardDescription>Log your movements using the Bristol Stool Chart.</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="space-y-4">
                    <Select onValueChange={(value) => onLog(value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Log a new movement..." />
                        </SelectTrigger>
                        <SelectContent>
                            {bristolScale.map(item => (
                                <SelectItem key={item.value} value={item.value}>
                                    {item.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                     <div className="space-y-2">
                        <h4 className="font-medium text-sm">Today's Logs</h4>
                        {logs.length > 0 ? (
                            <div className="space-y-2 rounded-lg border p-3">
                                {logs.map(log => (
                                    <div key={log.id} className="flex justify-between items-center text-sm">
                                        <span>Type {log.type}</span>
                                        <span className="text-muted-foreground">{format(log.createdAt, 'h:mm a')}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">No movements logged today.</p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
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
    { label: 'Calories', value: (log.calories || 0).toFixed(0), unit: '' },
    { label: 'Protein', value: (log.protein || 0).toFixed(1), unit: 'g' },
    { label: 'Carbs', value: (log.carbs || 0).toFixed(1), unit: 'g' },
    { label: 'Fat', value: (log.fat || 0).toFixed(1), unit: 'g' },
    { label: 'Fiber', value: (log.fiber || 0).toFixed(1), unit: 'g' },
  ];

  return (
    <Card className="bg-secondary/50">
      <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold">{log.description}</p>
              <p className="text-sm text-muted-foreground">
                {log.createdAt ? format(log.createdAt, 'MMMM d, yyyy, h:mm a') : 'Just now'}
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

