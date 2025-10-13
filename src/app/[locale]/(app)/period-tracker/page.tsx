
'use client';

import React, { useState, useMemo } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
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
  startOfDay,
} from 'date-fns';
import { Loader2, CircleDot, Droplet, Droplets, Waves } from 'lucide-react';
import type { DateRange } from 'react-day-picker';

type Period = {
  id: string;
  userId: string;
  startDate: { seconds: number; nanoseconds: number };
  endDate?: { seconds: number; nanoseconds: number };
  duration?: number;
  flowPattern?: string[];
  notes?: string;
};

export default function PeriodTrackerPage() {
  const t = useTranslations('PeriodTrackerPage');
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [isProcessing, setIsProcessing] = useState(false);

  const periodsCollectionRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'periods');
  }, [firestore, user]);

  const periodsQuery = useMemoFirebase(() => {
    if (!periodsCollectionRef) return null;
    return query(periodsCollectionRef, orderBy('startDate', 'desc'));
  }, [periodsCollectionRef]);

  const { data: periods, isLoading: isLoadingPeriods } =
    useCollection<Period>(periodsQuery);

  const periodDays = useMemo(() => {
    const days = new Set<string>();
    periods?.forEach((period) => {
      if (period.startDate) {
        const start = startOfDay(new Date(period.startDate.seconds * 1000));
        const end = period.endDate
          ? startOfDay(new Date(period.endDate.seconds * 1000))
          : start;
        
        let current = new Date(start);

        while (current <= end) {
          days.add(format(current, 'yyyy-MM-dd'));
          current.setDate(current.getDate() + 1);
        }
      }
    });
    return days;
  }, [periods]);

  const handleLogPeriod = async () => {
    if (!dateRange?.from || !user || !firestore || !periodsCollectionRef) return;
    setIsProcessing(true);

    const startDate = startOfDay(dateRange.from);
    const endDate = startOfDay(dateRange.to || dateRange.from);

    try {
      const batch = writeBatch(firestore);

      const overlappingQuery = query(
        periodsCollectionRef,
        where('startDate', '<=', endDate)
      );
      const overlappingSnap = await getDocs(overlappingQuery);
      overlappingSnap.forEach((docSnap) => {
        const period = docSnap.data() as Period;
        const periodStart = startOfDay(
          new Date(period.startDate.seconds * 1000)
        );
        const periodEnd = period.endDate
          ? startOfDay(new Date(period.endDate.seconds * 1000))
          : periodStart;
        if (startDate <= periodEnd && endDate >= periodStart) {
          batch.delete(docSnap.ref);
        }
      });

      const duration = differenceInDays(endDate, startDate) + 1;
      const newPeriodData = {
        userId: user.uid,
        startDate: startDate,
        endDate: endDate,
        duration: duration,
        createdAt: serverTimestamp(),
      };
      const newPeriodRef = doc(periodsCollectionRef);
      batch.set(newPeriodRef, newPeriodData);

      await batch.commit();

      toast({
        title: t('toast.logSuccess.title'),
        description: t('toast.logSuccess.description'),
      });
      setDateRange(undefined); 
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

  const periodDaysModifier = Array.from(periodDays).map(
    (dayStr) => new Date(`${dayStr}T00:00:00`)
  );

  const modifiers = {
    period: periodDaysModifier,
  };

  const modifiersStyles = {
    period: {
        backgroundColor: 'hsl(var(--primary))',
        color: 'hsl(var(--primary-foreground))',
        opacity: 0.8,
    },
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
              modifiersStyles={modifiersStyles}
              className="w-full max-w-md"
              disabled={isLoadingPeriods || isProcessing}
            />
          </CardContent>
          <CardFooter className="flex justify-center border-t p-4">
            <Button
              onClick={handleLogPeriod}
              disabled={!dateRange?.from || isLoadingPeriods || isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isProcessing ? t('loggingButton') : t('logButton')}
            </Button>
          </CardFooter>
        </Card>

        <BleedingHistory
          periods={periods?.filter((c) => c.endDate) || []}
        />
      </div>
    </>
  );
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
          const allNotes = period.notes || '';

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
                {period.flowPattern && period.flowPattern.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-sm font-medium">
                      {t('flowPattern')}:
                    </span>
                    <div className="flex gap-2 flex-wrap">
                      {period.flowPattern.map((flow, i) => (
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
                 {!allNotes && (!period.flowPattern || period.flowPattern.length === 0) && (
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
