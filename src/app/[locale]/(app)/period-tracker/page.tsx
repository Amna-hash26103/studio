
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  useUser,
  useFirestore,
  useCollection,
  useMemoFirebase,
} from '@/firebase';
import {
  collection,
  addDoc,
  updateDoc,
  query,
  orderBy,
  doc,
  writeBatch,
  serverTimestamp,
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
import { useTranslations } from 'next-intl';
import { format, differenceInDays, startOfDay, isBefore, isSameDay, addDays } from 'date-fns';
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
  date: { seconds: number; nanoseconds: number };
  flowLevel: 'spotting' | 'light' | 'medium' | 'heavy';
  painLevel?: number;
  mood?: string;
  symptoms?: string[];
  notes?: string;
};

export default function PeriodTrackerPage() {
  const t = useTranslations('PeriodTrackerPage');
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [isProcessing, setIsProcessing] = useState(false);
  const [dialogState, setDialogState] = useState<{
    showStart?: boolean;
    showEnd?: boolean;
    showLog?: boolean;
    date?: Date;
  }>({});

  const periodsCollectionRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'periods');
  }, [firestore, user]);

  const periodsQuery = useMemoFirebase(() => {
    if (!periodsCollectionRef) return null;
    return query(periodsCollectionRef, orderBy('startDate', 'desc'));
  }, [periodsCollectionRef]);

  const { data: periods, isLoading: isLoadingPeriods } = useCollection<Period>(periodsQuery);

  const activeCycle = useMemo(() => periods?.find((p) => !p.endDate) || null, [periods]);
  const pastCycles = useMemo(() => periods?.filter((p) => p.endDate) || [], [periods]);

  const dailyLogsCollectionRef = useMemoFirebase(() => {
      if (!firestore || !user || !activeCycle) return null;
      return collection(firestore, 'users', user.uid, 'periods', activeCycle.id, 'dailyLogs');
  }, [firestore, user, activeCycle]);
  
  const { data: dailyLogs } = useCollection<DailyLog>(dailyLogsCollectionRef);


  const periodDays = useMemo(() => {
    const days = new Set<string>();
    periods?.forEach((period) => {
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
    if (!dialogState.date || !user || !firestore || !periodsCollectionRef) return;
    setIsProcessing(true);

    const startDate = startOfDay(dialogState.date);
    
    try {
        const batch = writeBatch(firestore);

        if (activeCycle) {
            const activeDocRef = doc(firestore, 'users', user.uid, 'periods', activeCycle.id);
            batch.delete(activeDocRef);
        }
        
        const newPeriodData = {
            userId: user.uid,
            startDate: startDate,
            createdAt: serverTimestamp(),
        };

        const newPeriodRef = doc(periodsCollectionRef);
        batch.set(newPeriodRef, newPeriodData);
        
        await batch.commit();

        toast({
            title: t('toast.logSuccess.title'),
            description: t('toast.logSuccess.description'),
        });

        setDialogState({});
        setSelectedDate(startDate);
        setTimeout(() => setDialogState({ showLog: true, date: startDate }), 100);

    } catch (error) {
        console.error('Error starting period:', error);
        toast({
            variant: 'destructive',
            title: t('toast.logError.title'),
            description: t('toast.logError.description'),
        });
    } finally {
        setIsProcessing(false);
        setDialogState({});
    }
  };

  const handleEndPeriod = async () => {
      if (!dialogState.date || !user || !firestore || !activeCycle) return;
      setIsProcessing(true);

      const endDate = startOfDay(dialogState.date);
      const startDate = startOfDay(new Date(activeCycle.startDate.seconds * 1000));
      
      if (isBefore(endDate, startDate)) {
          toast({
              variant: 'destructive',
              title: t('toast.endDateError.title'),
              description: t('toast.endDateError.description'),
          });
          setIsProcessing(false);
          return;
      }

      try {
          const periodDocRef = doc(firestore, 'users', user.uid, 'periods', activeCycle.id);
          const duration = differenceInDays(endDate, startDate) + 1;
          
          await updateDoc(periodDocRef, {
              endDate: endDate,
              duration: duration,
          });

          toast({
              title: t('toast.logSuccess.title'),
              description: t('toast.endSuccessDescription'),
          });

          setDialogState({});
      } catch (error) {
          console.error('Error ending period:', error);
          toast({
              variant: 'destructive',
              title: t('toast.logError.title'),
              description: t('toast.logError.description'),
          });
      } finally {
          setIsProcessing(false);
          setDialogState({});
      }
  };
  
  const handleOpenLogDialog = () => {
    const date = dialogState.date;
    setDialogState({ showLog: true, date: date });
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
          <h1 className="font-headline text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('logPeriodTitle')}</CardTitle>
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
                    {t('activeCycleFooter', {date: format(new Date(activeCycle.startDate.seconds * 1000), 'MMMM d')})}
                </div>
              }
            />
          </CardContent>
        </Card>

        <BleedingHistory periods={pastCycles} t={t} />
      </div>

       <Dialog open={dialogState.showStart} onOpenChange={(isOpen) => !isOpen && setDialogState({})}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('dialogs.start.title')}</DialogTitle>
                    <DialogDescription>
                        {t('dialogs.start.description', { date: dialogState.date ? format(dialogState.date, 'MMMM d, yyyy') : '' })}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogState({})} disabled={isProcessing}>{t('dialogs.cancel')}</Button>
                    <Button onClick={handleStartPeriod} disabled={isProcessing}>
                        {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t('dialogs.start.confirm')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <Dialog open={dialogState.showEnd} onOpenChange={(isOpen) => !isOpen && setDialogState({})}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('dialogs.end.title')}</DialogTitle>
                    <DialogDescription>
                        {t('dialogs.end.description', { date: dialogState.date ? format(dialogState.date, 'MMMM d, yyyy') : '' })}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="sm:justify-between">
                    <Button variant="secondary" onClick={handleOpenLogDialog} disabled={isProcessing}>{t('logFlowDialog.title')}</Button>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setDialogState({})} disabled={isProcessing}>{t('dialogs.cancel')}</Button>
                      <Button onClick={handleEndPeriod} disabled={isProcessing}>
                          {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          {t('dialogs.end.confirm')}
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
                dailyLog={dailyLogs?.find(log => isSameDay(new Date(log.date.seconds * 1000), dialogState.date!))}
                t={t}
            />
        )}
    </>
  );
}

function LogFlowDialog({ open, onOpenChange, date, activeCycle, dailyLog, t }: { open: boolean, onOpenChange: (open: boolean) => void, date: Date, activeCycle: Period, dailyLog?: DailyLog, t: (key: string, values?: any) => string }) {
    const { user } = useUser();
    const firestore = useFirestore();
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
        if (!user || !firestore) return;
        setIsSaving(true);
        try {
            const dailyLogsColRef = collection(firestore, 'users', user.uid, 'periods', activeCycle.id, 'dailyLogs');
            
            const logData = {
                date: startOfDay(date),
                flowLevel: flow,
                notes: notes,
                userId: user.uid,
            };

            if (dailyLog) {
                const logDocRef = doc(dailyLogsColRef, dailyLog.id);
                await updateDoc(logDocRef, logData);
            } else {
                await addDoc(dailyLogsColRef, logData);
            }

            toast({ title: t('logFlowDialog.toast.logSuccess.title') });
            onOpenChange(false);
        } catch (error) {
            console.error("Failed to save daily log", error);
            toast({ variant: 'destructive', title: t('logFlowDialog.toast.logError.title'), description: t('logFlowDialog.toast.logError.description') });
        } finally {
            setIsSaving(false);
        }
    }

    const flowOptions = [
        { value: 'spotting', label: t('logFlowDialog.flow.spotting'), icon: <CircleDot /> },
        { value: 'light', label: t('logFlowDialog.flow.light'), icon: <Droplet /> },
        { value: 'medium', label: t('logFlowDialog.flow.medium'), icon: <Droplets /> },
        { value: 'heavy', label: t('logFlowDialog.flow.heavy'), icon: <Waves /> },
    ];
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('logFlowDialog.title')}</DialogTitle>
                    <DialogDescription>{t('logFlowDialog.description')}</DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="space-y-2">
                        <Label>{t('logFlowDialog.flow.label')}</Label>
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
                         <Label htmlFor="notes">{t('logFlowDialog.notes.label')}</Label>
                         <Textarea id="notes" placeholder={t('logFlowDialog.notes.placeholder')} value={notes} onChange={(e) => setNotes(e.target.value)} />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>{t('logFlowDialog.cancel')}</Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t('logFlowDialog.save')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}


function BleedingHistory({ periods, t }: { periods: Period[], t: (key: string, values?: any) => string }) {
  if (periods.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('bleedingHistory.title')}</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground py-10">
          <p>{t('bleedingHistory.noHistory')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('bleedingHistory.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {periods.map((period, index) => (
          <PastCycleCard key={period.id} period={period} index={periods.length - index} t={t} />
        ))}
      </CardContent>
    </Card>
  );
}

function PastCycleCard({ period, index, t }: { period: Period, index: number, t: (key: string, values?: any) => string }) {
  const { user } = useUser();
  const firestore = useFirestore();

  const dailyLogsCollectionRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'periods', period.id, 'dailyLogs');
  }, [firestore, user, period.id]);

  const { data: dailyLogs } = useCollection<DailyLog>(dailyLogsCollectionRef);

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
            {t('bleedingHistory.cycle')} #{index}
          </p>
          <p className="text-sm text-muted-foreground">
            {format(startDate, 'MMM dd')} -{' '}
            {period.endDate ? format(endDate, 'MMM dd, yyyy') : t('bleedingHistory.ongoing')}
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-baseline">
          <span className="text-sm font-medium">{t('bleedingHistory.duration')}:</span>
          <span className="text-sm">
            {period.duration || 0} {t('bleedingHistory.days')}
          </span>
        </div>
        {flowPattern.length > 0 && (
          <div className="space-y-1">
            <span className="text-sm font-medium">
              {t('bleedingHistory.flowPattern')}:
            </span>
            <div className="flex gap-2 flex-wrap">
              {flowPattern.map((flow, i) => (
                <span key={i} title={t(`bleedingHistory.flowLevels.${flow}`)}>
                  {flowIcons[flow.toLowerCase()]}
                </span>
              ))}
            </div>
          </div>
        )}
        {allNotes && (
          <div className="space-y-1">
            <span className="text-sm font-medium">{t('bleedingHistory.notes')}:</span>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {allNotes}
            </p>
          </div>
        )}
        {!allNotes && (
            <p className="text-sm text-muted-foreground">{t('bleedingHistory.noNotes')}</p>
        )}
      </CardContent>
    </Card>
  );
}
