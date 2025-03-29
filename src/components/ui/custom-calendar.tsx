import { cn } from '@/lib/utils';
import {
  eachDayOfInterval,
  endOfMonth,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Button } from './button';

interface CustomCalendarProps {
  selected: Date | null;
  onSelect: (date: Date | null) => void;
  disabled?: { before: Date }[];
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

export function CustomCalendar({
  selected,
  onSelect,
  disabled,
  minDate,
  maxDate,
  className,
}: CustomCalendarProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const previousMonth = () => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev.getFullYear(), prev.getMonth() - 1);
      return newDate;
    });
  };

  const nextMonth = () => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev.getFullYear(), prev.getMonth() + 1);
      return newDate;
    });
  };

  const isDateDisabled = (date: Date) => {
    if (minDate && isBefore(date, minDate)) return true;
    if (maxDate && isAfter(date, maxDate)) return true;
    if (!disabled) return false;
    return disabled.some(({ before }) => {
      return isBefore(date, before);
    });
  };

  const isPreviousMonthDisabled = () => {
    if (minDate) {
      const firstDayOfPreviousMonth = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() - 1,
        1,
      );
      return isBefore(firstDayOfPreviousMonth, minDate);
    }
    if (!disabled) return false;
    const firstDayOfCurrentMonth = startOfMonth(currentMonth);
    return isBefore(firstDayOfCurrentMonth, disabled[0].before);
  };

  const isNextMonthDisabled = () => {
    if (maxDate) {
      const firstDayOfNextMonth = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        1,
      );
      return isAfter(firstDayOfNextMonth, maxDate);
    }
    return false;
  };

  return (
    <div className={cn('w-full select-none', className)}>
      <div className='flex items-center justify-between mb-4'>
        <h2 className='text-lg font-semibold'>{format(currentMonth, 'MMMM yyyy')}</h2>
        <div className='flex gap-2'>
          <Button
            variant='outline'
            size='icon'
            onClick={previousMonth}
            disabled={isPreviousMonthDisabled()}
          >
            <ChevronLeft className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            size='icon'
            onClick={nextMonth}
            disabled={isNextMonthDisabled()}
          >
            <ChevronRight className='h-4 w-4' />
          </Button>
        </div>
      </div>
      <div className='grid grid-cols-7 gap-1'>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => {
          return (
            <div key={day} className='text-center text-sm font-medium text-muted-foreground py-2'>
              {day}
            </div>
          );
        })}
        {days.map((day, index) => {
          const isSelected = selected && isSameDay(day, selected);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isCurrentDay = isToday(day);
          const dateDisabled = isDateDisabled(day);

          return (
            <Button
              key={day.toISOString()}
              variant={isSelected ? 'default' : 'ghost'}
              className={cn(
                'h-12 w-full p-0 font-normal',
                !isCurrentMonth && 'text-muted-foreground/50',
                isCurrentDay && 'bg-accent text-accent-foreground',
                dateDisabled && 'opacity-50 cursor-not-allowed',
              )}
              disabled={dateDisabled}
              onClick={() => {
                return onSelect(day);
              }}
            >
              {format(day, 'd')}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
