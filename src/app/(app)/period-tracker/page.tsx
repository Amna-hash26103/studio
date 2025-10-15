
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DayModifiers } from 'react-day-picker';

type Period = {
  id: string;
  userId: string;
  startDate: { seconds: number; nanoseconds: number };
  endDate?: { seconds: number; nanoseconds: number };
  duration?: number;
  notes?: string;
  createdAt: { seconds: number; nanoseconds: number };
};

type DailyLog = {
  id: string;
  periodId: string;
  date: { seconds: number; nanoseconds: number };
  flowLevel: 'spotting' | 'light' | 'medium' | 'heavy';
  painLevel?: number;
  mood?: string;
  symptoms?: string[];
  notes?: string;
};

// --- DUMMY DATA ---
const today = new Date();
const initialPeriods: Period[] = [
  {
    id: 'past-cycle-1',
    userId: 'dummy-user',
    startDate: { seconds: Math.floor(subDays(today, 35).getTime() / 1000), nanoseconds: 0 },
    endDate: { seconds: Math.floor(subDays(today, 30).getTime() / 1000), nanoseconds: 0 },
    duration: 6,
    notes: 'This was a typical cycle.',
    createdAt: { seconds: Math.floor(subDays(today, 35).getTime() / 1000), nanoseconds: 0 },
  },
  { // Active cycle
    id: 'active-cycle-1',
    userId: 'dummy-user',
    startDate: { seconds: Math.floor(subDays(today, 5).getTime() / 1000), nanoseconds: 0 },
    createdAt: { seconds: Math.floor(subDays(today, 5).getTime() / 1000), nanoseconds: 0 },
  }
];

const initialDailyLogs: DailyLog[] = [
  { id: 'log-1', periodId: 'past-cycle-1', date: { seconds: Math.floor(subDays(today, 35).getTime() / 1000), nanoseconds: 0 }, flowLevel: 'light', notes: 'Cramps today' },
  { id: 'log-2', periodId: 'past-cycle-1', date: { seconds: Math.floor(subDays(today, 34).getTime() / 1000), nanoseconds: 0 }, flowLevel: 'medium', notes: '' },
  { id: 'log-3', periodId: 'past-cycle-1', date: { seconds: Math.floor(subDays(today, 33).getTime() / 1000), nanoseconds: 0 }, flowLevel: 'medium', notes: '' },
  { id: 'log-4', periodId: 'past-cycle-1', date: { seconds: Math.floor(subDays(today, 32).getTime() / 1000), nanoseconds: 0 }, flowLevel: 'heavy', notes: 'Feeling tired' },
  { id: 'log-5', periodId: 'past-cycle-1', date: { seconds: Math.floor(subDays(today, 31).getTime() / 1000), nanoseconds: 0 }, flowLevel: 'light', notes: '' },
  { id: 'log-6', periodId: 'past-cycle-1', date: { seconds: Math.floor(subDays(today, 30).getTime() / 1000), nanoseconds: 0 }, flowLevel: 'spotting', notes: '' },
  { id: 'log-7', periodId: 'active-cycle-1', date: { seconds: Math.floor(subDays(today, 5).getTime() / 1000), nanoseconds: 0 }, flowLevel: 'light', notes: '' },
  { id: 'log-8', periodId: 'active-cycle-1', date: { seconds: Math.floor(subDays(today, 4).getTime() / 1000), nanoseconds: 0 }, flowLevel: 'medium', notes: 'Headache' },
  { id: 'log-9', periodId: 'active-cycle-1', date: { seconds: Math.floor(subDays(today, 3).getTime() / 1000), nanoseconds: 0 }, flowLevel: 'medium', notes: '' },
];
// --- END DUMMY DATA ---

function PeriodTrackerPage() {
  const { toast } = useToast();

  const [periods, setPeriods] = useState<Period[]>(initialPeriods);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>(initialDailyLogs);
  const [isLoadingPeriods, setIsLoadingPeriods] = useState(false);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [isProcessing, setIsProcessing] = useState(false);
  const [dialogState, setDialogState] = useState<{
    showStart?: boolean;
    showEnd?: boolean;
    showLog?: boolean;
    date?: Date;
  }>({});

  const activeCycle = useMemo(() => periods.find((p) => !p.endDate) || null, [periods]);
  const pastCycles = useMemo(() => periods.filter((p) => p.endDate).sort((a,b) => b.startDate.seconds - a.startDate.seconds), [periods]);

  const periodDays = useMemo(() => {
    const days = new Set<string>();
    periods.forEach((period) => {
      const start = startOfDay(new Date(period.startDate.seconds * 1000));
      const end = period.endDate
        ? startOfDay(new Date(period.endDate.seconds * 1000))
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
      const activeCycleStart = startOfDay(new Date(activeCycle.startDate.seconds * 1000));
      
      if (isBefore(dayStart, activeCycleStart)) {
        setDialogState({ showStart: true, date: dayStart });
      } 
      else {
        if (isSameDay(dayStart, activeCycleStart)) {
          setDialogState({ showLog: true, date: dayStart });
        } else {
          setDialogState({ showEnd: true, date: dayStart });
        }
      }
    } else {
      setDialogState({ showStart: true, date: dayStart });
    }
  };

  const handleStartPeriod = async () => {
    if (!dialogState.date) return;
    setIsProcessing(true);

    const startDate = startOfDay(dialogState.date);
    
    // In a real app, you would make an API call. Here, we just update state.
    setTimeout(() => {
      const newPeriod: Period = {
        id: uuidv4(),
        userId: 'dummy-user',
        startDate: { seconds: Math.floor(startDate.getTime() / 1000), nanoseconds: 0 },
        createdAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 },
      };
      
      // End any existing active cycle before starting a new one
      setPeriods(prev => [...prev.filter(p => p.endDate), newPeriod]);

      toast({
        title: "Period Logged",
        description: "Your cycle has been successfully recorded.",
      });
      setIsProcessing(false);
      setDialogState({});
      setSelectedDate(startDate);
      // Open log dialog for the new start date
      setTimeout(() => setDialogState({ showLog: true, date: startDate }), 100);
    }, 500);
  };

  const handleEndPeriod = async () => {
      if (!dialogState.date || !activeCycle) return;
      setIsProcessing(true);

      const endDate = startOfDay(dialogState.date);
      const startDate = startOfDay(new Date(activeCycle.startDate.seconds * 1000));
      
      if (isBefore(endDate, startDate)) {
          toast({
              variant: 'destructive',
              title: "End Date Error",
              description: "End date cannot be before the start date.",
          });
          setIsProcessing(false);
          return;
      }

      // In a real app, you would make an API call. Here, we just update state.
      setTimeout(() => {
        const duration = differenceInDays(endDate, startDate) + 1;
        setPeriods(prev => prev.map(p => p.id === activeCycle.id ? { ...p, endDate: { seconds: Math.floor(endDate.getTime() / 1000), nanoseconds: 0 }, duration } : p));
        
        toast({
            title: "Period Logged",
            description: "Your cycle has been successfully ended.",
        });
        setIsProcessing(false);
        setDialogState({});
      }, 500);
  };
  
  const handleOpenLogDialog = () => {
    const date = dialogState.date;
    setDialogState({ showLog: true, date: date });
  };
  
  const handleSaveLog = (logData: Omit<DailyLog, 'id' | 'periodId'>) => {
    if (!activeCycle) return;
    const existingLog = dailyLogs.find(log => isSameDay(new Date(log.date.seconds * 1000), new Date(logData.date.seconds * 1000)));

    if (existingLog) {
        setDailyLogs(prev => prev.map(log => log.id === existingLog.id ? { ...existingLog, ...logData } : log));
    } else {
        const newLog: DailyLog = {
            id: uuidv4(),
            periodId: activeCycle.id,
            ...logData,
        };
        setDailyLogs(prev => [...prev, newLog]);
    }
  };


  const periodDaysModifier = Array.from(periodDays).map(
    (dayStr) => new Date(`${dayStr}T00:00:00`)
  );

  const modifiers: DayModifiers = {
    period: periodDaysModifier,
    ...(activeCycle && { active: [new Date(activeCycle.startDate.seconds * 1000)] }),
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

        <Card>
          <CardHeader>
            <CardTitle>Log Your Period</CardTitle>
          </CardHeader>
          <CardContent className="p-2 md:p-6 flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(day) => day && handleDayClick(day)}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
              className="w-full max-w-md"
              disabled={isLoadingPeriods || isProcessing}
              footer={
                activeCycle &&
                <div className="text-center text-sm text-muted-foreground pt-2">
                    Active cycle started on {format(new Date(activeCycle.startDate.seconds * 1000), 'MMMM d')}
                </div>
              }
            />
          </CardContent>
        </Card>

        <BleedingHistory periods={pastCycles} dailyLogs={dailyLogs} />
      </div>

       <Dialog open={dialogState.showStart} onOpenChange={(isOpen) => !isOpen && setDialogState({})}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Start New Cycle?</DialogTitle>
                    <DialogDescription>
                        Do you want to start a new period cycle on {dialogState.date ? format(dialogState.date, 'MMMM d, yyyy') : ''}?
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
        
        {dialogState.date && activeCycle && (
            <LogFlowDialog
                open={!!dialogState.showLog}
                onOpenChange={(isOpen) => !isOpen && setDialogState({})}
                date={dialogState.date}
                activeCycle={activeCycle}
                dailyLog={dailyLogs.find(log => log.periodId === activeCycle.id && isSameDay(new Date(log.date.seconds * 1000), dialogState.date!))}
                onSave={handleSaveLog}
            />
        )}
    </>
  );
}

function LogFlowDialog({ open, onOpenChange, date, onSave, dailyLog }: { open: boolean, onOpenChange: (open: boolean) => void, date: Date, activeCycle: Period, dailyLog?: DailyLog, onSave: (log: Omit<DailyLog, 'id'|'periodId'>) => void }) {
    const { toast } = useToast();
    
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
        // Simulate API call
        setTimeout(() => {
            const logData = {
                date: { seconds: Math.floor(startOfDay(date).getTime() / 1000), nanoseconds: 0 },
                flowLevel: flow,
                notes: notes,
            };
            onSave(logData);

            toast({ title: 'Daily log saved!' });
            setIsSaving(false);
            onOpenChange(false);
        }, 500);
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


function BleedingHistory({ periods, dailyLogs }: { periods: Period[], dailyLogs: DailyLog[] }) {
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
          <PastCycleCard key={period.id} period={period} dailyLogs={dailyLogs.filter(l => l.periodId === period.id)} index={periods.length - index} />
        ))}
      </CardContent>
    </Card>
  );
}

function PastCycleCard({ period, dailyLogs, index }: { period: Period, dailyLogs: DailyLog[], index: number }) {
  const flowIcons: Record<string, React.ReactNode> = {
    spotting: <CircleDot className="h-4 w-4 text-red-300" />,
    light: <Droplet className="h-4 w-4 text-red-400" />,
    medium: <Droplets className="h-4 w-4 text-red-500" />,
    heavy: <Waves className="h-4 w-4 text-red-700" />,
  };
  
  const startDate = new Date(period.startDate.seconds * 1000);
  const endDate = period.endDate ? new Date(period.endDate.seconds * 1000) : new Date();
  
  const sortedLogs = useMemo(() => dailyLogs?.sort((a,b) => a.date.seconds - b.date.seconds) || [], [dailyLogs]);
  const allNotes = sortedLogs.map(log => log.notes).filter(Boolean).join('\n');
  const flowPattern = sortedLogs.map(log => log.flowLevel);

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
        {flowPattern.length > 0 && (
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
        {!allNotes && !flowPattern.length && (
            <p className="text-sm text-muted-foreground">No notes for this cycle.</p>
        )}
      </CardContent>
    </Card>
  );
}

export default PeriodTrackerPage;
