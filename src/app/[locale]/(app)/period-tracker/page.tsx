
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
import { cn } from '@/lib/utils';
import type { DayPicker, DayModifiers } from 'react-day-picker';

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

  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

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

  const { data: cycles, isLoading: isLoadingCycles } =
    useCollection<CycleEntry>(cyclesQuery);

  const activeCycle = useMemo(
    () => cycles?.find((c) => !c.endDate),
    [cycles]
  );
  
  const periodDays = useMemo(() => {
    const days = new Map<string, { label: string; isPeriod: boolean }>();
    cycles?.forEach((cycle) => {
      const start = new Date(cycle.startDate.seconds * 1000);
      const end = cycle.endDate
        ? new Date(cycle.endDate.seconds * 1000)
        : new Date();
      let current = start;
      let dayCount = 1;
      while (current <= end) {
        const dayStr = format(current, 'yyyy-MM-dd');
        if (!cycle.endDate && isBefore(new Date(), current) && !isSameDay(new Date(), current)) break;
        
        days.set(dayStr, { label: `Day ${dayCount}`, isPeriod: true });
        
        if (isSameDay(current, new Date()) && !cycle.endDate) {
          break; 
        }
        current.setDate(current.getDate() + 1);
        dayCount++;
      }
    });
    return days;
  }, [cycles]);

  useEffect(() => {
    const handleDateSelection = async () => {
      if (!selectedDate || isLoading || isLoadingCycles) return;

      const clickedDate = startOfDay(selectedDate);
      const dayStr = format(clickedDate, 'yyyy-MM-dd');
      const isPeriodDay = periodDays.has(dayStr);

      if (activeCycle) {
        const startDate = startOfDay(new Date(activeCycle.startDate.seconds * 1000));
        
        if (isPeriodDay) {
           setLogFlowDialog({ open: true, date: clickedDate });
        } else if (isBefore(clickedDate, startDate)) {
          // Date before active cycle, do nothing for now
        } else {
          // Date is after the start date but not logged, prompt to end
           setEndPeriodPrompt({ open: true, date: clickedDate });
        }
      } else { // No active cycle
        if (isPeriodDay) {
            // This case shouldn't happen if there's no active cycle, but as a safeguard
            console.warn("Clicked a period day but no active cycle found.");
            return;
        }
        
        // Start a new cycle
        setIsLoading(true);
        try {
          if (!cyclesCollectionRef) throw new Error("Collection reference is not available.");
          const newCycle = {
            userId: user!.uid,
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
          // Immediately open log dialog for the first day
          setLogFlowDialog({ open: true, date: clickedDate });
        } catch (error) {
          console.error('Error starting new period:', error);
          toast({
            variant: 'destructive',
            title: t('toast.logError.title'),
            description: t('toast.logError.description'),
          });
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    // We wrap in a timeout to allow the state update from `onSelect` to render first
    // before we trigger potentially blocking logic or dialogs.
    const timer = setTimeout(() => {
        handleDateSelection();
    }, 0);
    
    return () => clearTimeout(timer);

  }, [selectedDate]); // This effect now triggers the logic


  const handleEndPeriod = async () => {
    if (!activeCycle || !endPeriodPrompt.date || !firestore || !user) return;

    setIsLoading(true);
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
        setIsLoading(false);
    }
  };


  const DayContent: DayPicker['components']['Day'] = ({ date }) => {
    const dayStr = format(date, 'yyyy-MM-dd');
    const dayInfo = periodDays.get(dayStr);
    
    return (
      <div className="relative flex h-full w-full items-center justify-center">
        <span>{format(date, 'd')}</span>
        {dayInfo && (
          <span className="absolute bottom-0 right-1 text-[10px] font-semibold text-primary/80">
            {dayInfo.label.split(' ')[1]}
          </span>
        )}
      </div>
    );
  };


  return (
    <>
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <h1 className="font-headline text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>

        <Card>
          <CardContent className="p-2 md:p-6">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              modifiers={{
                period: Array.from(periodDays.keys()).map(d => new Date(d)),
              }}
              modifiersClassNames={{
                period: 'bg-primary/20 text-primary-foreground rounded-none',
              }}
              components={{ Day: DayContent }}
              className="w-full"
              disabled={isLoading || isLoadingCycles}
            />
          </CardContent>
        </Card>
        
        <BleedingHistory cycles={cycles?.filter(c => c.endDate) || []} />
      </div>

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
                  <AlertDialogAction onClick={handleEndPeriod} disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {t('endPeriodPrompt.confirm')}
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
    const { user, firestore } = useFirebase();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const dayStr = date ? format(date, 'yyyy-MM-dd') : '';
    const existingLog = activeCycle?.dailyLogs?.[dayStr];

    const [flow, setFlow] = useState<FlowIntensity | undefined>(existingLog?.flow);
    const [notes, setNotes] = useState(existingLog?.notes || '');
    
    useEffect(() => {
        if(open && activeCycle && date) {
            const dayStr = format(date, 'yyyy-MM-dd');
            const log = activeCycle.dailyLogs?.[dayStr];
            setFlow(log?.flow);
            setNotes(log?.notes || '');
        } else if (open) {
            // This handles the case for the very first day of a new cycle
            const log = activeCycle?.dailyLogs?.[dayStr];
            setFlow(log?.flow || 'light'); // Default to light on first day
            setNotes(log?.notes || '');
        }
    }, [activeCycle, date, open]);

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
                description: t('toast.periodUpdated', { date: format(date, 'LLL dd') }),
            });
            onOpenChange(false);
        } catch (error) {
            console.error('Error saving log:', error);
             toast({ variant: 'destructive', title: t('toast.logError.title'), description: t('toast.logError.description') });
        } finally {
            setIsLoading(false);
        }
    };
    
    const flowOptions: {value: FlowIntensity, label: string, icon: React.ReactNode}[] = [
        { value: 'spotting', label: t('spotting'), icon: <CircleDot className="h-5 w-5 text-red-300" /> },
        { value: 'light', label: t('light'), icon: <Droplet className="h-5 w-5 text-red-400" /> },
        { value: 'medium', label: t('medium'), icon: <Droplets className="h-5 w-5 text-red-500" /> },
        { value: 'heavy', label: t('heavy'), icon: <Waves className="h-5 w-5 text-red-700" /> },
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
                               <Label key={option.value} htmlFor={option.value} className={cn("flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer w-full", flow === option.value && "border-primary")}>
                                   <RadioGroupItem value={option.value} id={option.value} className="sr-only" />
                                   {option.icon}
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
                                    <CardTitle className="text-lg">{t('cycle')} #{cycles.length - index}</CardTitle>
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


    