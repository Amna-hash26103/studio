
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase, useFirebase } from '@/firebase';
import {
  collection,
  addDoc,
  updateDoc,
  query,
  orderBy,
  doc,
} from 'firebase/firestore';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from 'next-intl';
import {
  format,
  differenceInDays,
  isSameDay,
  isBefore,
  startOfDay,
} from 'date-fns';
import {
  Loader2,
  CircleDot,
  Droplet,
  Droplets,
  Waves,
} from 'lucide-react';
import type { DayProps } from 'react-day-picker';
import { cn } from '@/lib/utils';

type FlowIntensity = 'spotting' | 'light' | 'medium' | 'heavy';

type DailyLog = {
  flow: FlowIntensity;
  notes?: string;
};

type CycleEntry = {
  id: string;
  userId: string;
  startDate: { seconds: number; nanoseconds: number };
  endDate?: { seconds: number; nanoseconds: number };
  duration?: number;
  dailyLogs?: Record<string, DailyLog>;
  flowPattern?: string[];
};

export default function PeriodTrackerPage() {
  const t = useTranslations('PeriodTrackerPage');
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [startPeriodPrompt, setStartPeriodPrompt] = useState<{
    open: boolean;
    date?: Date;
  }>({ open: false });
  const [endPeriodPrompt, setEndPeriodPrompt] = useState<{
    open: boolean;
    date?: Date;
  }>({ open: false });
  const [logFlowDialog, setLogFlowDialog] = useState<{
    open: boolean;
    date?: Date;
  }>({ open: false });
  
  const cyclesCollectionRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'cycles');
  }, [firestore, user]);

  const cyclesQuery = useMemoFirebase(() => {
    if (!cyclesCollectionRef) return null;
    return query(cyclesCollectionRef, orderBy('startDate', 'desc'));
  }, [cyclesCollectionRef]);

  const { data: cycles, isLoading: isLoadingCycles } = useCollection<CycleEntry>(cyclesQuery);

  const activeCycle = useMemo(() => cycles?.find((c) => !c.endDate), [cycles]);
  
  const periodDays = useMemo(() => {
    const days = new Set<string>();
    cycles?.forEach((cycle) => {
      const start = startOfDay(new Date(cycle.startDate.seconds * 1000));
      const end = cycle.endDate
        ? startOfDay(new Date(cycle.endDate.seconds * 1000))
        : startOfDay(new Date()); // For active cycle, go up to today

      let current = new Date(start);
      // Ensure the loop doesn't run infinitely if end date is far in future for some reason
      let i = 0;
      while (i < 365 && (isBefore(current, end) || isSameDay(current, end))) {
        const dayStr = format(current, 'yyyy-MM-dd');
        days.add(dayStr);
        current.setDate(current.getDate() + 1);
        i++;
      }
    });
    return days;
  }, [cycles]);

  const handleLogDayClick = () => {
    if (!selectedDate) return;

    const date = startOfDay(selectedDate);
    const dayStr = format(date, 'yyyy-MM-dd');
    
    if (activeCycle) {
      const startDate = startOfDay(new Date(activeCycle.startDate.seconds * 1000));
      const isDayInActivePeriod = Array.from(periodDays).some(d => isSameDay(new Date(d), date)) && (isSameDay(date, startDate) || isBefore(startDate, date));

      if (isDayInActivePeriod) {
        setLogFlowDialog({ open: true, date });
      } else if (isBefore(date, startDate)) {
        setStartPeriodPrompt({ open: true, date });
      } else {
        setEndPeriodPrompt({ open: true, date });
      }
    } else {
      setStartPeriodPrompt({ open: true, date });
    }
  };


  const handleStartPeriod = async () => {
    if (!startPeriodPrompt.date || !cyclesCollectionRef || !user) return;
    
    const clickedDate = startPeriodPrompt.date;
    setIsProcessing(true);

    try {
      const newCycle = {
        userId: user.uid,
        startDate: clickedDate,
        dailyLogs: {
          [format(clickedDate, 'yyyy-MM-dd')]: { flow: 'light' }
        },
      };
      await addDoc(cyclesCollectionRef, newCycle);
      toast({
        title: t('toast.periodStarted', {
          date: format(clickedDate, 'LLL dd, yyyy'),
        }),
      });
      setStartPeriodPrompt({ open: false });
      // Open the flow dialog immediately after starting a period
      setLogFlowDialog({ open: true, date: clickedDate });
    } catch (error) {
      console.error('Error starting new period:', error);
      toast({
        variant: 'destructive',
        title: t('toast.logError.title'),
        description: t('toast.logError.description'),
      });
      setStartPeriodPrompt({ open: false });
    } finally {
      setIsProcessing(false);
    }
  };


  const handleEndPeriod = async () => {
    if (!activeCycle || !endPeriodPrompt.date || !firestore || !user) return;

    setIsProcessing(true);
    try {
        const startDate = new Date(activeCycle.startDate.seconds * 1000);
        // The end date is the day BEFORE the one clicked to end the period.
        const endDate = new Date(endPeriodPrompt.date);
        endDate.setDate(endDate.getDate() - 1);

        const duration = differenceInDays(endDate, startDate) + 1;

        const flowPattern: string[] = [];
        if (activeCycle.dailyLogs) {
            let current = new Date(startDate);
            while(current <= endDate) {
                const dayStr = format(current, 'yyyy-MM-dd');
                const log = activeCycle.dailyLogs[dayStr];
                if (log) {
                    const flow = log.flow.charAt(0).toUpperCase() + log.flow.slice(1);
                    flowPattern.push(flow);
                }
                current.setDate(current.getDate() + 1);
            }
        }
        
        const cycleDocRef = doc(firestore, 'users', user.uid, 'cycles', activeCycle.id);
        await updateDoc(cycleDocRef, {
            endDate: endDate,
            duration: duration,
            flowPattern: flowPattern
        });

        toast({
            title: t('toast.periodEnded', { duration: duration }),
        });
        setEndPeriodPrompt({ open: false });
    } catch (error) {
        console.error('Error ending period:', error);
        toast({
            variant: 'destructive',
            title: t('toast.logError.title'),
            description: t('toast.logError.description'),
        });
    } finally {
        setIsProcessing(false);
    }
  };
  
  const periodDaysModifier = Array.from(periodDays).map(dayStr => new Date(`${dayStr}T00:00:00`));

  const modifiers = {
    period: periodDaysModifier,
  };

  return (
    <>
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <h1 className="font-headline text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>

        <Card>
          <CardContent className="p-2 md:p-6 flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              modifiers={modifiers}
              modifiersClassNames={{
                period: 'bg-primary/20 text-primary-foreground',
              }}
              className="w-full max-w-md"
              disabled={isLoadingCycles || isProcessing}
            />
          </CardContent>
          <CardFooter className="flex justify-center border-t p-4">
              <Button onClick={handleLogDayClick} disabled={!selectedDate || isLoadingCycles || isProcessing}>
                  {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {isProcessing ? t('loggingButton') : t('logButton')}
              </Button>
          </CardFooter>
        </Card>
        
        <BleedingHistory cycles={cycles?.filter(c => c.endDate) || []} />
      </div>

      <AlertDialog open={startPeriodPrompt.open} onOpenChange={(open) => setStartPeriodPrompt({ ...startPeriodPrompt, open })}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>{t('startPeriodPrompt.title')}</AlertDialogTitle>
                  <AlertDialogDescription>
                      {t('startPeriodPrompt.description', { date: startPeriodPrompt.date ? format(startPeriodPrompt.date, 'MMMM dd, yyyy') : '' })}
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setStartPeriodPrompt({ open: false })}>{t('startPeriodPrompt.cancel')}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleStartPeriod}>
                      {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : t('startPeriodPrompt.confirm')}
                  </AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={endPeriodPrompt.open} onOpenChange={(open) => setEndPeriodPrompt({ ...endPeriodPrompt, open })}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>{t('endPeriodPrompt.title')}</AlertDialogTitle>

                  <AlertDialogDescription>
                      {t('endPeriodPrompt.description')}
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setEndPeriodPrompt({ open: false })}>{t('endPeriodPrompt.cancel')}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleEndPeriod}>
                      {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : t('endPeriodPrompt.confirm')}
                  </AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>

      {logFlowDialog.date && <LogFlowDialog {...logFlowDialog} onOpenChange={(open) => setLogFlowDialog({ ...logFlowDialog, open })} activeCycle={activeCycle} />}
    </>
  );
}


function LogFlowDialog({ open, onOpenChange, date, activeCycle } : { open: boolean, onOpenChange: (open: boolean) => void, date?: Date, activeCycle?: CycleEntry }) {
    const t = useTranslations('PeriodTrackerPage.logFlowDialog');
    const tToast = useTranslations('PeriodTrackerPage.toast');
    const { user, firestore } = useFirebase();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [flow, setFlow] = useState<FlowIntensity | undefined>();
    const [notes, setNotes] = useState('');
    
    const dayStr = date ? format(date, 'yyyy-MM-dd') : '';

    // Effect to set initial state when dialog opens
    useEffect(() => {
        if(open && date) {
            const log = activeCycle?.dailyLogs?.[dayStr];
            setFlow(log?.flow || 'light');
            setNotes(log?.notes || '');
        }
    }, [open, date, activeCycle, dayStr]);

    const handleSave = async () => {
        if (!user || !firestore || !activeCycle || !date || !flow) return;

        setIsLoading(true);
        try {
            const cycleDocRef = doc(firestore, 'users', user.uid, 'cycles', activeCycle.id);
            const newLog: DailyLog = { flow, notes };

            await updateDoc(cycleDocRef, {
                [`dailyLogs.${dayStr}`]: newLog
            });

            toast({
                description: tToast('periodUpdated', { date: format(date, 'LLL dd') }),
            });
            onOpenChange(false);
        } catch (error) {
            console.error('Error saving log:', error);
             toast({ variant: 'destructive', title: t('save'), description: tToast('logError.description') });
        } finally {
            setIsLoading(false);
        }
    };
    
    const flowOptions: {value: FlowIntensity, label: string, icon: React.ReactNode}[] = [
        { value: 'spotting', label: t('spotting'), icon: <CircleDot className="h-5 w-5" /> },
        { value: 'light', label: t('light'), icon: <Droplet className="h-5 w-5" /> },
        { value: 'medium', label: t('medium'), icon: <Droplets className="h-5 w-5" /> },
        { value: 'heavy', label: t('heavy'), icon: <Waves className="h-5 w-5" /> },
    ];

    if (!date) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('title', { date: format(date, 'MMMM dd, yyyy') })}</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    <div className="space-y-2">
                        <Label>{t('flowTitle')}</Label>
                        <RadioGroup value={flow} onValueChange={(v) => setFlow(v as FlowIntensity)} className="flex gap-2">
                           {flowOptions.map(option => (
                               <Label key={option.value} htmlFor={option.value} className={cn("flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer w-full transition-colors data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground", {"bg-primary text-primary-foreground": flow === option.value})}>
                                   <RadioGroupItem value={option.value} id={option.value} className="sr-only" />
                                   {React.cloneElement(option.icon as React.ReactElement, { className: cn('h-5 w-5', flow === option.value ? 'text-primary-foreground' : 'text-red-500')})}
                                   <span className="mt-2 text-sm font-medium">{option.label}</span>
                               </Label>
                           ))}
                        </RadioGroup>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="notes">{t('notesTitle')}</Label>
                        <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t('notesPlaceholder')} />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>{t('cancel')}</Button>
                    <Button onClick={handleSave} disabled={isLoading || !flow}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isLoading ? t('saving') : t('save')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function BleedingHistory({ cycles }: { cycles: CycleEntry[] }) {
    const t = useTranslations('PeriodTrackerPage.bleedingHistory');

    const flowIcons: Record<string, React.ReactNode> = {
        Spotting: <CircleDot className="h-4 w-4 text-red-300" title="Spotting" />,
        Light: <Droplet className="h-4 w-4 text-red-400" title="Light" />,
        Medium: <Droplets className="h-4 w-4 text-red-500" title="Medium" />,
        Heavy: <Waves className="h-4 w-4 text-red-700" title="Heavy" />,
    };

    if (cycles.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{t('title')}</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground py-10">
                    <p>{t('noHistory')}</p>
                </CardContent>
            </Card>
        );
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {cycles.map((cycle, index) => {
                    const startDate = new Date(cycle.startDate.seconds * 1000);
                    const endDate = cycle.endDate ? new Date(cycle.endDate.seconds * 1000) : new Date();
                    const allNotes = cycle.dailyLogs ? Object.values(cycle.dailyLogs).map(log => log.notes).filter(Boolean).join('\n') : '';

                    return (
                        <Card key={cycle.id} className="bg-secondary/50">
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <p className="text-lg font-semibold">{t('cycle')} #{cycles.length - index}</p>
                                    <p className="text-sm text-muted-foreground">{format(startDate, 'MMM dd')} - {format(endDate, 'MMM dd, yyyy')}</p>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between items-baseline">
                                    <span className="text-sm font-medium">{t('duration')}:</span>
                                    <span className="text-sm">{cycle.duration || 0} {t('days')}</span>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-sm font-medium">{t('flowPattern')}:</span>
                                    <div className="flex gap-2 flex-wrap">
                                        {cycle.flowPattern && cycle.flowPattern.length > 0 ? (
                                            cycle.flowPattern.map((flow, i) => (
                                                <div key={i} className="flex items-center gap-1 p-1 rounded-md" title={flow}>
                                                    {flowIcons[flow]}
                                                </div>
                                            ))
                                        ) : <span className="text-sm text-muted-foreground">-</span>}
                                    </div>
                                </div>
                                {allNotes && (
                                    <div className="space-y-1">
                                        <span className="text-sm font-medium">{t('notes')}:</span>
                                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{allNotes || t('noNotes')}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </CardContent>
        </Card>
    );
}
