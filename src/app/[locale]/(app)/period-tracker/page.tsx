'use client';

import React, { useState, useMemo } from 'react';
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
  where,
  getDocs,
  serverTimestamp,
  getDoc,
  setDoc,
  deleteDoc,
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
  DialogDescription,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from 'next-intl';
import { format, differenceInDays, startOfDay, isBefore } from 'date-fns';
import {
  Loader2,
  CircleDot,
  Droplet,
  Droplets,
  Waves,
  HeartCrack,
  Smile,
  Meh,
  Frown,
  Plus,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Period = {
  id: string;
  userId: string;
  startDate: { seconds: number; nanoseconds: number };
  endDate?: { seconds: number; nanoseconds: number };
  duration?: number;
  flowPattern?: string[];
  notes?: string;
  dailyLogs?: Record<string, DailyLog>;
};

type DailyLog = {
  id?: string; // Not always present on the sub-object
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

  const { data: periods, isLoading: isLoadingPeriods } = useCollection<Period>(
    periodsQuery
  );

  const { activeCycle, pastCycles } = useMemo(() => {
    const active = periods?.find((p) => !p.endDate) || null;
    const past = periods?.filter((p) => p.endDate) || [];
    return { activeCycle: active, pastCycles: past };
  }, [periods]);

  const periodDays = useMemo(() => {
    const days = new Set<string>();
    periods?.forEach((period) => {
      if (period.startDate) {
        const start = startOfDay(new Date(period.startDate.seconds * 1000));
        const end = period.endDate
          ? startOfDay(new Date(period.endDate.seconds * 1000))
          : activeCycle ? (dialogState.date ? dialogState.date : new Date()) : start;

        let current = new Date(start);
        while (current <= end) {
          days.add(format(current, 'yyyy-MM-dd'));
          current.setDate(current.getDate() + 1);
        }
      }
    });
    return days;
  }, [periods, activeCycle, dialogState.date]);

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    const dayStr = format(day, 'yyyy-MM-dd');
    const startOfDayClicked = startOfDay(day);
    
    if (activeCycle) {
      const activeCycleStart = startOfDay(new Date(activeCycle.startDate.seconds * 1000));
      if (isBefore(startOfDayClicked, activeCycleStart)) {
         setDialogState({ showStart: true, date: day });
      } else {
         const isLogged = activeCycle.dailyLogs && activeCycle.dailyLogs[dayStr];
         if(isLogged) {
            setDialogState({ showLog: true, date: day });
         } else {
            setDialogState({ showEnd: true, date: day });
         }
      }
    } else {
      setDialogState({ showStart: true, date: day });
    }
  };

  const handleStartPeriod = async () => {
    if (!dialogState.date || !user || !firestore || !periodsCollectionRef) return;
    setIsProcessing(true);

    const startDate = startOfDay(dialogState.date);
    
    try {
        const batch = writeBatch(firestore);

        // If there's an active cycle, delete it to start a new one.
        if (activeCycle) {
            const activeDocRef = doc(firestore, 'users', user.uid, 'periods', activeCycle.id);
            batch.delete(activeDocRef);
        }
        
        // Overwrite any existing period that this new one might overlap with
        const newPeriodData = {
            userId: user.uid,
            startDate: startDate,
            createdAt: serverTimestamp(),
            dailyLogs: {},
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

    } catch (error) {
        console.error('Error starting period:', error);
        toast({
            variant: 'destructive',
            title: t('toast.logError.title'),
            description: t('toast.logError.description'),
        });
    } finally {
        setIsProcessing(false);
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
            description: "Your period has been marked as ended.",
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
    }
};


  const periodDaysModifier = Array.from(periodDays).map(
    (dayStr) => new Date(`${dayStr}T00:00:00`)
  );

  const modifiers = {
    period: periodDaysModifier,
    selected: selectedDate,
  };

  const modifiersStyles = {
    period: {
      backgroundColor: 'hsl(var(--primary))',
      color: 'hsl(var(--primary-foreground))',
      opacity: 0.8,
    },
    selected: {
        backgroundColor: 'hsl(var(--primary))',
        color: 'hsl(var(--primary-foreground))',
        opacity: 1,
    }
  };

  return (
    <>
      <div className="mx-auto max-w-5xl space-y-8">
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
              onSelect={setSelectedDate}
              onDayClick={handleDayClick}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
              className="w-full max-w-md"
              disabled={isLoadingPeriods || isProcessing}
            />
          </CardContent>
        </Card>

        <BleedingHistory periods={pastCycles} />
      </div>

       <AlertDialog open={dialogState.showStart} onOpenChange={() => setDialogState({})}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('dialogs.start.title')}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('dialogs.start.description', { date: dialogState.date ? format(dialogState.date, 'MMMM d, yyyy') : '' })}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isProcessing}>{t('dialogs.cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleStartPeriod} disabled={isProcessing}>
                        {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t('dialogs.start.confirm')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={dialogState.showEnd} onOpenChange={() => setDialogState({})}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('dialogs.end.title')}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('dialogs.end.description', { date: dialogState.date ? format(dialogState.date, 'MMMM d, yyyy') : '' })}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isProcessing}>{t('dialogs.cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleEndPeriod} disabled={isProcessing}>
                        {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t('dialogs.end.confirm')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        
        {dialogState.date && activeCycle && (
            <LogFlowDialog
                open={!!dialogState.showLog}
                onOpenChange={() => setDialogState({})}
                date={dialogState.date}
                activeCycle={activeCycle}
            />
        )}
    </>
  );
}

function LogFlowDialog({ open, onOpenChange, date, activeCycle }: { open: boolean, onOpenChange: (open: boolean) => void, date: Date, activeCycle: Period }) {
    const t = useTranslations('PeriodTrackerPage.logFlowDialog');
    const { user, firestore } = useFirebase();
    const { toast } = useToast();
    const dayStr = format(date, 'yyyy-MM-dd');
    
    const [flow, setFlow] = useState<'spotting' | 'light' | 'medium' | 'heavy'>('light');
    const [notes, setNotes] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    
    React.useEffect(() => {
        if(open && date) {
            const log = activeCycle?.dailyLogs?.[dayStr];
            setFlow(log?.flowLevel || 'light');
            setNotes(log?.notes || '');
        }
    }, [open, date, activeCycle, dayStr]);
    
    const handleSave = async () => {
        if (!user || !firestore) return;
        setIsSaving(true);
        try {
            const periodDocRef = doc(firestore, 'users', user.uid, 'periods', activeCycle.id);
            const newLog: DailyLog = {
                date: date,
                flowLevel: flow,
                notes: notes,
            };

            await updateDoc(periodDocRef, {
                [`dailyLogs.${dayStr}`]: newLog
            });

            toast({ title: t('toast.logSuccess.title') });
            onOpenChange(false);
        } catch (error) {
            console.error("Failed to save daily log", error);
            toast({ variant: 'destructive', title: t('toast.logError.title'), description: t('toast.logError.description') });
        } finally {
            setIsSaving(false);
        }
    }

    const flowOptions = [
        { value: 'spotting', label: t('flow.spotting'), icon: <CircleDot /> },
        { value: 'light', label: t('flow.light'), icon: <Droplet /> },
        { value: 'medium', label: t('flow.medium'), icon: <Droplets /> },
        { value: 'heavy', label: t('flow.heavy'), icon: <Waves /> },
    ];
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('title', { date: format(date, 'MMMM d') })}</DialogTitle>
                    <DialogDescription>{t('description')}</DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="space-y-2">
                        <Label>{t('flow.label')}</Label>
                        <RadioGroup value={flow} onValueChange={(value) => setFlow(value as any)} className="grid grid-cols-2 gap-4">
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
                         <Label htmlFor="notes">{t('notes.label')}</Label>
                         <Textarea id="notes" placeholder={t('notes.placeholder')} value={notes} onChange={(e) => setNotes(e.target.value)} />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>{t('cancel')}</Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t('save')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function BleedingHistory({ periods }: { periods: Period[] }) {
  const t = useTranslations('PeriodTrackerPage.bleedingHistory');

  const flowIcons: Record<string, React.ReactNode> = {
    spotting: <CircleDot className="h-4 w-4 text-red-300" title="Spotting" />,
    light: <Droplet className="h-4 w-4 text-red-400" title="Light" />,
    medium: <Droplets className="h-4 w-4 text-red-500" title="Medium" />,
    heavy: <Waves className="h-4 w-4 text-red-700" title="Heavy" />,
  };

  if (periods.length === 0) {
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
        {periods.map((period, index) => {
          const startDate = new Date(period.startDate.seconds * 1000);
          const endDate = period.endDate
            ? new Date(period.endDate.seconds * 1000)
            : new Date();
          
          const dailyLogs = period.dailyLogs ? Object.values(period.dailyLogs).sort((a,b) => a.date.seconds - b.date.seconds) : [];
          const allNotes = dailyLogs.map(log => log.notes).filter(Boolean).join('\n');
          const flowPattern = dailyLogs.map(log => log.flowLevel);

          return (
            <Card key={period.id} className="bg-secondary/50">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <p className="text-lg font-semibold">
                    {t('cycle')} #{periods.length - index}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(startDate, 'MMM dd')} -{' '}
                    {format(endDate, 'MMM dd, yyyy')}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-medium">{t('duration')}:</span>
                  <span className="text-sm">
                    {period.duration || 0} {t('days')}
                  </span>
                </div>
                {flowPattern && flowPattern.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-sm font-medium">
                      {t('flowPattern')}:
                    </span>
                    <div className="flex gap-2 flex-wrap">
                      {flowPattern.map((flow, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-1 p-1 rounded-md"
                          title={flow}
                        >
                          {flowIcons[flow.toLowerCase()]}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {allNotes && (
                  <div className="space-y-1">
                    <span className="text-sm font-medium">{t('notes')}:</span>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {allNotes || t('noNotes')}
                    </p>
                  </div>
                )}
                 {!allNotes && (!flowPattern || flowPattern.length === 0) && (
                    <p className="text-sm text-muted-foreground">{t('noNotes')}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </CardContent>
    </Card>
  );
}
