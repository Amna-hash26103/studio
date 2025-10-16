
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { format, differenceInDays, startOfDay, isBefore, isSameDay, addDays, subDays } from 'date-fns';
import {
  Loader2,
  CircleDot,
  Droplet,
  Droplets,
  Waves,
  Repeat,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DayModifiers } from 'react-day-picker';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ChartTooltip, ChartTooltipContent, ChartContainer } from "@/components/ui/chart";
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  Timestamp,
  writeBatch
} from 'firebase/firestore';

type Period = {
  id: string;
  userId: string;
  startDate: Date;
  endDate?: Date;
  duration?: number;
  notes?: string;
  createdAt: any;
};

type PeriodFirestore = Omit<Period, 'startDate' | 'endDate' | 'createdAt'> & {
  startDate: Timestamp;
  endDate?: Timestamp;
  createdAt: Timestamp;
};


type DailyLog = {
  id: string;
  userId: string;
  periodId: string;
  date: Date;
  flowLevel: 'spotting' | 'light' | 'medium' | 'heavy';
  painLevel?: number;
  mood?: string;
  symptoms?: string[];
  notes?: string;
};

type DailyLogFirestore = Omit<DailyLog, 'date'> & {
  date: Timestamp;
};

function PeriodTrackerPage() {
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [isProcessing, setIsProcessing] = useState(false);
  const [dialogState, setDialogState] = useState<{
    showStart?: boolean;
    showEnd?: boolean;
    showLog?: boolean;
    date?: Date;
  }>({});

  // Fetch periods
  const periodsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'users', user.uid, 'periods'), orderBy('startDate', 'desc'));
  }, [user, firestore]);
  
  const { data: periodsFirestore, isLoading: isLoadingPeriods } = useCollection<PeriodFirestore>(periodsQuery);

  const periods = useMemo(() => {
    return periodsFirestore?.map(p => ({
        ...p,
        startDate: p.startDate.toDate(),
        endDate: p.endDate?.toDate(),
        createdAt: p.createdAt?.toDate() || new Date(),
    })) || [];
  }, [periodsFirestore]);

  // Fetch daily logs for the active cycle
   const activeCycle = useMemo(() => periods.find((p) => !p.endDate) || null, [periods]);

  const dailyLogsQuery = useMemoFirebase(() => {
    if (!user || !firestore || !activeCycle) return null;
    return query(
        collection(firestore, 'users', user.uid, 'periods', activeCycle.id, 'dailyLogs')
    );
  }, [user, firestore, activeCycle]);

  const { data: dailyLogsFirestore, isLoading: isLoadingLogs } = useCollection<DailyLogFirestore>(dailyLogsQuery);
  
  const dailyLogs = useMemo(() => {
      return dailyLogsFirestore?.map(log => ({
          ...log,
          date: log.date.toDate()
      })) || [];
  }, [dailyLogsFirestore]);


  const periodDays = useMemo(() => {
    const days = new Set<string>();
    if (!periods) return days;
    periods.forEach((period) => {
      const start = startOfDay(period.startDate);
      const end = period.endDate
        ? startOfDay(period.endDate)
        : startOfDay(new Date());

      let current = start;
      let i = 0;
      while (current <= end && i < 365) {
        days.add(format(current, 'yyyy-MM-dd'));
        current = addDays(current, 1);
        i++;
      }
    });
    return days;
  }, [periods]);

  const handleDayClick = (day: Date) => {
    const dayStart = startOfDay(day);
    setSelectedDate(dayStart);

    if (activeCycle) {
      const activeCycleStart = startOfDay(activeCycle.startDate);
      
      if (isBefore(dayStart, activeCycleStart)) {
        toast({
            variant: 'destructive',
            title: 'Invalid Date',
            description: "You can't select a date before your current cycle started.",
        })
      } 
      else if (isBefore(dayStart, new Date()) || isSameDay(dayStart, new Date())) {
         if (isSameDay(dayStart, activeCycleStart)) {
             setDialogState({ showLog: true, date: dayStart });
         } else {
            setDialogState({ showEnd: true, date: dayStart });
         }
      }
      else {
        // Future date in active cycle - maybe log symptoms? For now, do nothing.
         toast({ title: "Future Date", description: "You can log your flow for today or past days." });
      }
    } else {
      setDialogState({ showStart: true, date: dayStart });
    }
  };

  const handleStartPeriod = async () => {
    if (!dialogState.date || !user || !firestore) return;
    setIsProcessing(true);

    const startDate = startOfDay(dialogState.date);
    
    const batch = writeBatch(firestore);

    if (activeCycle) {
      const oldPeriodRef = doc(firestore, 'users', user.uid, 'periods', activeCycle.id);
      const endDate = subDays(startDate, 1);
      batch.update(oldPeriodRef, { 
        endDate: endDate, 
        duration: differenceInDays(endDate, activeCycle.startDate) + 1 
      });
    }
    
    const newPeriodRef = doc(collection(firestore, 'users', user.uid, 'periods'));
    const newPeriodData = {
        userId: user.uid,
        startDate: startDate,
        createdAt: serverTimestamp()
    };
    batch.set(newPeriodRef, newPeriodData);
    
    try {
        await batch.commit();
        toast({
          title: "Period Logged",
          description: "Your new cycle has been successfully recorded.",
        });

        setSelectedDate(startDate);
        // Open log dialog for the new start date
        setTimeout(() => setDialogState({ showLog: true, date: startDate }), 100);
    } catch (error) {
        console.error("Error starting period:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not start new cycle.' });
    }

    setIsProcessing(false);
    // Don't close dialog here, wait for log dialog to open
  };

  const handleEndPeriod = async () => {
      if (!dialogState.date || !activeCycle || !user || !firestore) return;
      setIsProcessing(true);

      const endDate = startOfDay(dialogState.date);
      const startDate = startOfDay(activeCycle.startDate);
      
      if (isBefore(endDate, startDate)) {
          toast({
              variant: 'destructive',
              title: "End Date Error",
              description: "End date cannot be before the start date.",
          });
          setIsProcessing(false);
          return;
      }
      
      const duration = differenceInDays(endDate, startDate) + 1;
      const periodRef = doc(firestore, 'users', user.uid, 'periods', activeCycle.id);

      try {
          await updateDoc(periodRef, { endDate, duration });
          toast({
            title: "Period Ended",
            description: "Your cycle has been successfully ended.",
          });
      } catch(error) {
          console.error("Error ending period:", error);
          toast({ variant: 'destructive', title: 'Error', description: 'Could not end cycle.' });
      }

      setIsProcessing(false);
      setDialogState({});
  };
  
  const handleOpenLogDialog = () => {
    const date = dialogState.date;
    if (!date) return;

    setDialogState({}); // Close the end dialog
    setTimeout(() => setDialogState({ showLog: true, date: date }), 100); // Open log dialog
  };
  
  const handleSaveLog = async (logData: Omit<DailyLog, 'id' | 'periodId' | 'userId'> & {date: Date}) => {
    if (!activeCycle || !user || !firestore) return;

    const logDate = logData.date;
    const existingLog = dailyLogs?.find(log => isSameDay(log.date, logDate));

    try {
      if (existingLog) {
          const logRef = doc(firestore, 'users', user.uid, 'periods', activeCycle.id, 'dailyLogs', existingLog.id);
          await updateDoc(logRef, { ...logData });
      } else {
          const logRef = collection(firestore, 'users', user.uid, 'periods', activeCycle.id, 'dailyLogs');
          await addDoc(logRef, {
            userId: user.uid,
            periodId: activeCycle.id,
            ...logData
          });
      }
      toast({ title: 'Daily log saved!' });
    } catch(error) {
        console.error("Error saving log:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not save daily log.' });
    }
  };


  const periodDaysModifier = Array.from(periodDays).map(
    (dayStr) => new Date(`${dayStr}T00:00:00`)
  );

  const modifiers: DayModifiers = {
    period: periodDaysModifier,
    ...(activeCycle && { active: [activeCycle.startDate] }),
  };

  const modifiersStyles = {
    period: {
      backgroundColor: 'var(--period-day-bg)',
      color: 'var(--period-day-fg)',
    },
    active: {
      backgroundColor: 'var(--active-day-bg)',
      color: 'var(--active-day-fg)',
      fontWeight: 'bold',
    },
  };

  return (
    <>
      <div className="mx-auto max-w-5xl space-y-8">
        <style>{`
          :root {
            --period-day-bg: hsl(var(--primary) / 0.2);
            --period-day-fg: hsl(var(--primary-foreground) / 0.9);
            --active-day-bg: hsl(var(--primary));
            --active-day-fg: hsl(var(--primary-foreground));
          }
          .dark {
             --period-day-bg: hsl(var(--primary) / 0.3);
             --period-day-fg: hsl(var(--primary-foreground));
          }
        `}</style>
        <div>
          <h1 className="font-headline text-3xl font-bold">Cycle Tracker</h1>
          <p className="text-muted-foreground">Track your menstrual cycle to understand your body better.</p>
        </div>

        <CycleStats periods={periods || []} />

        <Card>
          <CardHeader>
            <CardTitle>Log Your Period</CardTitle>
             <CardDescription>Select a day to start, end, or log your flow.</CardDescription>
          </CardHeader>
          <CardContent className="p-2 md:p-6 flex justify-center">
            {isLoadingPeriods ? (
                <div className="flex items-center justify-center h-80 w-full max-w-md">
                    <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                </div>
            ) : (
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(day) => day && handleDayClick(day)}
                  month={currentMonth}
                  onMonthChange={setCurrentMonth}
                  modifiers={modifiers}
                  modifiersStyles={modifiersStyles}
                  className="w-full max-w-md"
                  disabled={isProcessing || !user}
                  footer={
                    activeCycle &&
                    <div className="text-center text-sm text-muted-foreground pt-2">
                        Active cycle started on {format(activeCycle.startDate, 'MMMM d')}
                    </div>
                  }
                />
            )}
          </CardContent>
        </Card>

        <BleedingHistory periods={periods.filter(p=>p.endDate)} />
      </div>

       <Dialog open={dialogState.showStart} onOpenChange={(isOpen) => !isOpen && setDialogState({})}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Start New Cycle?</DialogTitle>
                    <DialogDescription>
                        Do you want to start a new period cycle on {dialogState.date ? format(dialogState.date, 'MMMM d, yyyy') : ''}?
                        {activeCycle ? ' This will end your current active cycle.' : ''}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogState({})} disabled={isProcessing}>Cancel</Button>
                    <Button onClick={handleStartPeriod} disabled={isProcessing}>
                        {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Start Cycle
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <Dialog open={dialogState.showEnd} onOpenChange={(isOpen) => !isOpen && setDialogState({})}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>End Current Cycle?</DialogTitle>
                    <DialogDescription>
                        Do you want to end your current cycle on {dialogState.date ? format(dialogState.date, 'MMMM d, yyyy') : ''}? You can also log your flow for this day.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="sm:justify-between">
                    <Button variant="secondary" onClick={handleOpenLogDialog} disabled={isProcessing}>Log Flow</Button>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setDialogState({})} disabled={isProcessing}>Cancel</Button>
                      <Button onClick={handleEndPeriod} disabled={isProcessing}>
                          {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          End Cycle
                      </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        
        {dialogState.date && (
            <LogFlowDialog
                open={!!dialogState.showLog}
                onOpenChange={(isOpen) => !isOpen && setDialogState({})}
                date={dialogState.date}
                dailyLog={dailyLogs?.find(log => isSameDay(log.date, dialogState.date!))}
                onSave={handleSaveLog}
            />
        )}
    </>
  );
}

function CycleStats({ periods }: { periods: Period[] }) {
    const stats = useMemo(() => {
        const completedCycles = periods.filter(p => p.endDate).sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

        if (completedCycles.length < 2) {
            const avgPeriodDuration = completedCycles.length > 0 ? completedCycles.reduce((sum, p) => sum + (p.duration || 0), 0) / completedCycles.length : 0;
            return {
                averageCycleLength: 0,
                averagePeriodDuration: Math.round(avgPeriodDuration),
                predictedNextStart: null,
                cycleLengthData: [],
                periodDurationData: completedCycles.map(p => ({
                    name: format(p.startDate, 'MMM'),
                    duration: p.duration
                })),
            };
        }

        const cycleLengths = [];
        for (let i = 1; i < completedCycles.length; i++) {
            const currentCycleStart = startOfDay(completedCycles[i].startDate);
            const prevCycleStart = startOfDay(completedCycles[i - 1].startDate);
            cycleLengths.push(differenceInDays(currentCycleStart, prevCycleStart));
        }

        const totalCycleLength = cycleLengths.reduce((sum, length) => sum + length, 0);
        const averageCycleLength = cycleLengths.length > 0 ? totalCycleLength / cycleLengths.length : 0;

        const totalPeriodDuration = completedCycles.reduce((sum, p) => sum + (p.duration || 0), 0);
        const averagePeriodDuration = completedCycles.length > 0 ? totalPeriodDuration / completedCycles.length : 0;

        const lastCycleStart = completedCycles[completedCycles.length - 1].startDate;
        const predictedNextStart = averageCycleLength > 0 ? addDays(lastCycleStart, averageCycleLength) : null;
        
        const cycleLengthData = completedCycles.slice(1).map((p, i) => ({
             name: format(p.startDate, 'MMM'),
             length: cycleLengths[i]
        }));
        
        const periodDurationData = completedCycles.map(p => ({
            name: format(p.startDate, 'MMM'),
            duration: p.duration
        }));

        return {
            averageCycleLength: Math.round(averageCycleLength),
            averagePeriodDuration: Math.round(averagePeriodDuration),
            predictedNextStart,
            cycleLengthData,
            periodDurationData
        };

    }, [periods]);

    if (periods.length === 0) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle>Your Cycle Stats</CardTitle>
                    <CardDescription>Log at least two full cycles to see your stats and predictions.</CardDescription>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground py-10">
                    <p>No stats to show yet.</p>
                </CardContent>
            </Card>
        )
    }

    const chartConfig = {
      duration: {
        label: "Duration (Days)",
        color: "hsl(var(--primary))",
      },
      length: {
        label: "Length (Days)",
        color: "hsl(var(--primary))",
      },
    } satisfies React.ComponentProps<typeof ChartContainer>["config"];


    return (
        <Card>
            <CardHeader>
                <CardTitle>Your Cycle Stats</CardTitle>
                <CardDescription>An overview of your menstrual cycle patterns.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                    <Card className="p-4">
                        <CardHeader className="p-2 pb-0">
                           <CardTitle className="text-4xl font-bold">{stats.averageCycleLength || '-'}<span className="text-lg font-normal text-muted-foreground"> days</span></CardTitle>
                           <CardDescription className="flex items-center justify-center gap-2"><Repeat className="h-4 w-4" /> Average Cycle Length</CardDescription>
                        </CardHeader>
                    </Card>
                     <Card className="p-4">
                        <CardHeader className="p-2 pb-0">
                           <CardTitle className="text-4xl font-bold">{stats.averagePeriodDuration || '-'}<span className="text-lg font-normal text-muted-foreground"> days</span></CardTitle>
                           <CardDescription className="flex items-center justify-center gap-2"><Droplets className="h-4 w-4" /> Average Period Length</CardDescription>
                        </CardHeader>
                    </Card>
                     <Card className="p-4">
                        <CardHeader className="p-2 pb-0">
                           <CardTitle className="text-4xl font-bold">{stats.predictedNextStart ? format(stats.predictedNextStart, 'MMM d') : 'N/A'}</CardTitle>
                           <CardDescription className="flex items-center justify-center gap-2"><Target className="h-4 w-4" /> Predicted Next Period</CardDescription>
                        </CardHeader>
                    </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {stats.cycleLengthData.length > 0 && (
                        <div>
                            <h3 className="font-semibold text-center mb-4">Cycle Length History</h3>
                             <ChartContainer config={chartConfig} className="h-[250px] w-full">
                                <BarChart accessibilityLayer data={stats.cycleLengthData}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        tickLine={false}
                                        tickMargin={10}
                                        axisLine={false}
                                    />
                                    <YAxis />
                                    <ChartTooltip
                                        cursor={false}
                                        content={<ChartTooltipContent indicator="dashed" />}
                                    />
                                    <Bar dataKey="length" fill="var(--color-length)" radius={4} />
                                </BarChart>
                            </ChartContainer>
                        </div>
                    )}
                    {stats.periodDurationData.length > 0 && (
                        <div>
                            <h3 className="font-semibold text-center mb-4">Period Duration History</h3>
                            <ChartContainer config={chartConfig} className="h-[250px] w-full">
                                <BarChart accessibilityLayer data={stats.periodDurationData}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        tickLine={false}
                                        tickMargin={10}
                                        axisLine={false}
                                    />
                                    <YAxis />
                                    <ChartTooltip
                                        cursor={false}
                                        content={<ChartTooltipContent indicator="dashed" />}
                                    />
                                    <Bar dataKey="duration" fill="var(--color-duration)" radius={4} />
                                </BarChart>
                            </ChartContainer>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}


function LogFlowDialog({ open, onOpenChange, date, onSave, dailyLog }: { open: boolean, onOpenChange: (open: boolean) => void, date: Date, dailyLog?: DailyLog, onSave: (log: Omit<DailyLog, 'id'|'periodId'|'userId'> & {date: Date}) => void }) {
    
    const [flow, setFlow] = useState<'spotting' | 'light' | 'medium' | 'heavy'>('light');
    const [notes, setNotes] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    
    useEffect(() => {
        if(open && date) {
            setFlow(dailyLog?.flowLevel || 'light');
            setNotes(dailyLog?.notes || '');
        }
    }, [open, date, dailyLog]);
    
    const handleSave = async () => {
        setIsSaving(true);
        try {
            const logData = {
                date: startOfDay(date),
                flowLevel: flow,
                notes: notes,
            };
            await onSave(logData);
        } catch (error) {
            console.error("Error from onSave in dialog:", error);
        } finally {
            setIsSaving(false);
            onOpenChange(false);
        }
    }

    const flowOptions = [
        { value: 'spotting', label: 'Spotting', icon: <CircleDot /> },
        { value: 'light', label: 'Light', icon: <Droplet /> },
        { value: 'medium', label: 'Medium', icon: <Droplets /> },
        { value: 'heavy', label: 'Heavy', icon: <Waves /> },
    ];
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Log Flow</DialogTitle>
                    <DialogDescription>Log your menstrual flow for {format(date, 'MMMM d, yyyy')}</DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="space-y-2">
                        <Label>Flow</Label>
                        <RadioGroup value={flow} onValueChange={(value) => setFlow(value as any)} className="grid grid-cols-2 gap-4">
                            {flowOptions.map(option => (
                                <Label key={option.value} htmlFor={option.value} className={cn("flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer w-full transition-colors", {"border-primary bg-primary/10 text-primary": flow === option.value})}>
                                    <RadioGroupItem value={option.value} id={option.value} className="sr-only" />
                                    {React.cloneElement(option.icon as React.ReactElement, { className: cn('h-5 w-5 mb-2', flow === option.value ? 'text-primary' : 'text-red-500/50')})}
                                    <span className="text-sm font-medium">{option.label}</span>
                                </Label>
                           ))}
                        </RadioGroup>
                    </div>
                    <div className="space-y-2">
                         <Label htmlFor="notes">Notes (optional)</Label>
                         <Textarea id="notes" placeholder="e.g., cramps, fatigue, etc." value={notes} onChange={(e) => setNotes(e.target.value)} />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Log
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function BleedingHistory({ periods }: { periods: Period[] }) {
  const { user } = useUser();
  const firestore = useFirestore();

  if (periods.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bleeding History</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground py-10">
          <p>No completed cycles yet. Log your first period to get started!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bleeding History</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {periods.map((period, index) => (
          <PastCycleCard 
            key={period.id} 
            period={period} 
            index={periods.length - index} 
            userId={user?.uid} 
            firestore={firestore}
          />
        ))}
      </CardContent>
    </Card>
  );
}

function PastCycleCard({ period, index, userId, firestore }: { period: Period, index: number, userId?: string, firestore?: any }) {
  
  const dailyLogsQuery = useMemoFirebase(() => {
    if (!userId || !firestore) return null;
    return query(
        collection(firestore, 'users', userId, 'periods', period.id, 'dailyLogs'),
        orderBy('date', 'asc')
    );
  }, [userId, firestore, period.id]);

  const { data: dailyLogsFirestore } = useCollection<DailyLogFirestore>(dailyLogsQuery);
  const dailyLogs = useMemo(() => dailyLogsFirestore?.map(l => ({ ...l, date: l.date.toDate() })), [dailyLogsFirestore]);

  const flowIcons: Record<string, React.ReactNode> = {
    spotting: <CircleDot className="h-4 w-4 text-red-300" />,
    light: <Droplet className="h-4 w-4 text-red-400" />,
    medium: <Droplets className="h-4 w-4 text-red-500" />,
    heavy: <Waves className="h-4 w-4 text-red-700" />,
  };
  
  const startDate = period.startDate;
  const endDate = period.endDate ? period.endDate : new Date();
  
  const allNotes = dailyLogs?.map(log => log.notes).filter(Boolean).join('\n');
  const flowPattern = dailyLogs?.map(log => log.flowLevel);

  return (
    <Card className="bg-secondary/50">
      <CardHeader>
        <div className="flex justify-between items-center">
          <p className="text-lg font-semibold">
            Cycle #{index}
          </p>
          <p className="text-sm text-muted-foreground">
            {format(startDate, 'MMM dd')} -{' '}
            {period.endDate ? format(endDate, 'MMM dd, yyyy') : 'Ongoing'}
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-baseline">
          <span className="text-sm font-medium">Duration:</span>
          <span className="text-sm">
            {period.duration || 0} days
          </span>
        </div>
        {flowPattern && flowPattern.length > 0 && (
          <div className="space-y-1">
            <span className="text-sm font-medium">
              Flow Pattern:
            </span>
            <div className="flex gap-2 flex-wrap">
              {flowPattern.map((flow, i) => (
                <span key={i} title={flow}>
                  {flowIcons[flow.toLowerCase()]}
                </span>
              ))}
            </div>
          </div>
        )}
        {allNotes && (
          <div className="space-y-1">
            <span className="text-sm font-medium">Notes:</span>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {allNotes}
            </p>
          </div>
        )}
        {(!dailyLogs || dailyLogs.length === 0) && (
            <p className="text-sm text-muted-foreground">No daily logs for this cycle.</p>
        )}
      </CardContent>
    </Card>
  );
}

export default PeriodTrackerPage;
