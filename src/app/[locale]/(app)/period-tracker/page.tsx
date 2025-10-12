'use client';

import { useState } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from 'next-intl';
import { format, differenceInDays } from 'date-fns';
import { Calendar as CalendarIcon, Trash2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';
import { v4 as uuidv4 } from 'uuid';

type CycleEntry = {
  id: string;
  userId: string;
  startDate: { seconds: number; nanoseconds: number; };
  endDate: { seconds: number; nanoseconds: number; };
};

export default function PeriodTrackerPage() {
  const t = useTranslations('PeriodTrackerPage');
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const cyclesCollectionRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'cycles');
  }, [firestore, user]);

  const cyclesQuery = useMemoFirebase(() => {
    if (!cyclesCollectionRef) return null;
    return query(cyclesCollectionRef, orderBy('startDate', 'desc'));
  }, [cyclesCollectionRef]);

  const { data: cycles, isLoading: isLoadingCycles } = useCollection<CycleEntry>(cyclesQuery);

  const handleLogPeriod = async () => {
    if (!user || !firestore || !dateRange?.from || !dateRange?.to) {
      toast({
        variant: 'destructive',
        title: t('toast.logError.title'),
        description: 'Please select a valid date range.',
      });
      return;
    }

    setIsLoading(true);
    try {
      const newCycle = {
        userId: user.uid,
        startDate: dateRange.from,
        endDate: dateRange.to,
      };
      await addDoc(cyclesCollectionRef!, newCycle);
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
      setIsLoading(false);
    }
  };

  const handleDeleteCycle = async (cycleId: string) => {
    if (!user || !firestore) return;
    try {
      await deleteDoc(doc(firestore, 'users', user.uid, 'cycles', cycleId));
      toast({
        title: t('toast.deleteSuccess.title'),
        description: t('toast.deleteSuccess.description'),
      });
    } catch (error) {
      console.error('Error deleting cycle:', error);
      toast({
        variant: 'destructive',
        title: t('toast.deleteError.title'),
        description: t('toast.deleteError.description'),
      });
    }
  };
  
  const cycleDays = useMemo(() => {
    const days = new Set<string>();
    cycles?.forEach(cycle => {
        const start = new Date(cycle.startDate.seconds * 1000);
        const end = new Date(cycle.endDate.seconds * 1000);
        let current = start;
        while(current <= end) {
            days.add(format(current, 'yyyy-MM-dd'));
            current.setDate(current.getDate() + 1);
        }
    });
    return Array.from(days).map(dayStr => new Date(dayStr));
  }, [cycles]);


  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('logPeriodTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={'outline'}
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !dateRange && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, 'LLL dd, y')} -{' '}
                          {format(dateRange.to, 'LLL dd, y')}
                        </>
                      ) : (
                        format(dateRange.from, 'LLL dd, y')
                      )
                    ) : (
                      <span>{t('startDateLabel')} - {t('endDateLabel')}</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={1}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <Button onClick={handleLogPeriod} disabled={isLoading || !dateRange?.from || !dateRange?.to} className="w-full">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isLoading ? t('loggingButton') : t('logButton')}
            </Button>
          </CardContent>
        </Card>

        <Card>
            <CardContent className="p-2 flex justify-center">
                <Calendar
                    mode="multiple"
                    selected={cycleDays}
                    modifiersClassNames={{
                        selected: 'bg-primary/80 text-primary-foreground',
                    }}
                    className="p-0"
                />
            </CardContent>
        </Card>

      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{t('cycleHistoryTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingCycles ? (
            <div className="flex justify-center items-center h-24">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : cycles && cycles.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('historyHeaderStartDate')}</TableHead>
                  <TableHead>{t('historyHeaderEndDate')}</TableHead>
                  <TableHead className="text-right">{t('historyHeaderDuration')}</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cycles.map((cycle) => {
                  const startDate = new Date(cycle.startDate.seconds * 1000);
                  const endDate = new Date(cycle.endDate.seconds * 1000);
                  const duration = differenceInDays(endDate, startDate) + 1;
                  return (
                    <TableRow key={cycle.id}>
                      <TableCell>{format(startDate, 'LLL dd, yyyy')}</TableCell>
                      <TableCell>{format(endDate, 'LLL dd, yyyy')}</TableCell>
                      <TableCell className="text-right">{duration} {t('days')}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteCycle(cycle.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground">{t('noCyclesLogged')}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
