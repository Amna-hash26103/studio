
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase, useFirebase } from '@/firebase';
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
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from 'next-intl';
import {
  format,
  differenceInDays,
  isSameDay,
  startOfDay,
} from 'date-fns';
import { Loader2, CircleDot, Droplet, Droplets, Waves } from 'lucide-react';
import type { DateRange } from 'react-day-picker';

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

  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [isProcessing, setIsProcessing] = useState(false);
  
  const cyclesCollectionRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'cycles');
  }, [firestore, user]);

  const cyclesQuery = useMemoFirebase(() => {
    if (!cyclesCollectionRef) return null;
    return query(cyclesCollectionRef, orderBy('startDate', 'desc'));
  }, [cyclesCollectionRef]);

  const { data: cycles, isLoading: isLoadingCycles } = useCollection<CycleEntry>(cyclesQuery);

  const periodDays = useMemo(() => {
    const days = new Set<string>();
    cycles?.forEach((cycle) => {
      if (cycle.startDate) {
        const start = startOfDay(new Date(cycle.startDate.seconds * 1000));
        const end = cycle.endDate ? startOfDay(new Date(cycle.endDate.seconds * 1000)) : start;
        let current = start;
        while (current <= end) {
          days.add(format(current, 'yyyy-MM-dd'));
          current.setDate(current.getDate() + 1);
        }
      }
    });
    return days;
  }, [cycles]);

  const handleLogPeriod = async () => {
    if (!dateRange?.from || !user || !firestore || !cyclesCollectionRef) return;
    setIsProcessing(true);

    const startDate = startOfDay(dateRange.from);
    const endDate = startOfDay(dateRange.to || dateRange.from);

    try {
        const batch = writeBatch(firestore);

        // Find and delete any existing cycles that overlap with the new range
        const overlappingQuery = query(
            cyclesCollectionRef,
            where('startDate', '<=', endDate),
        );
        const overlappingSnap = await getDocs(overlappingQuery);
        overlappingSnap.forEach(docSnap => {
            const cycle = docSnap.data() as CycleEntry;
            const cycleStart = startOfDay(new Date(cycle.startDate.seconds * 1000));
            const cycleEnd = cycle.endDate ? startOfDay(new Date(cycle.endDate.seconds * 1000)) : cycleStart;
            if (startDate <= cycleEnd && endDate >= cycleStart) {
                batch.delete(docSnap.ref);
            }
        });

        // Create the new cycle
        const duration = differenceInDays(endDate, startDate) + 1;
        const newCycleData = {
            userId: user.uid,
            startDate: startDate,
            endDate: endDate,
            duration: duration,
        };
        const newCycleRef = doc(cyclesCollectionRef);
        batch.set(newCycleRef, newCycleData);
        
        await batch.commit();

        toast({
            title: t('toast.logSuccess.title'),
            description: t('toast.logSuccess.description'),
        });
        setDateRange(undefined); // Reset selection
    } catch (error) {
        console.error('Error logging period:', error);
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
          <CardHeader>
            <CardTitle>{t('logPeriodTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="p-2 md:p-6 flex justify-center">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={setDateRange}
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
              <Button onClick={handleLogPeriod} disabled={!dateRange?.from || isLoadingCycles || isProcessing}>
                  {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {isProcessing ? t('loggingButton') : t('logButton')}
              </Button>
          </CardFooter>
        </Card>
        
        <BleedingHistory cycles={cycles?.filter(c => c.endDate) || []} />
      </div>
    </>
  );
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
                                {cycle.flowPattern && cycle.flowPattern.length > 0 && (
                                    <div className="space-y-1">
                                        <span className="text-sm font-medium">{t('flowPattern')}:</span>
                                        <div className="flex gap-2 flex-wrap">
                                            {
                                                cycle.flowPattern.map((flow, i) => (
                                                    <div key={i} className="flex items-center gap-1 p-1 rounded-md" title={flow}>
                                                        {flowIcons[flow]}
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    </div>
                                )}
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
