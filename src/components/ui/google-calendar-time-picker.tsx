import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { Clock } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

interface GoogleCalendarTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function GoogleCalendarTimePicker({
  value,
  onChange,
  disabled = false,
}: GoogleCalendarTimePickerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timeSlotRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  // Generate time slots in 30-minute intervals
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  }, []);

  // Format time for display
  const displayTime = useMemo(() => {
    if (!value) return '';
    const [hours, minutes] = value.split(':').map(Number);
    return format(new Date().setHours(hours, minutes), 'h:mm a');
  }, [value]);

  // Initialize input value when editing starts
  const handleStartEditing = () => {
    if (value) {
      const [hours, minutes] = value.split(':').map(Number);
      setInputValue(format(new Date().setHours(hours, minutes), 'h:mm a'));
    }
    setIsEditing(true);
  };

  // Parse and validate time input
  const parseTimeInput = (input: string): string | null => {
    // Handle 24-hour format (e.g., "14:00")
    const time24Match = input.match(/^(\d{1,2}):(\d{2})$/);
    if (time24Match) {
      const [_, hours, minutes] = time24Match;
      const hour = parseInt(hours);
      const minute = parseInt(minutes);
      if (hour >= 0 && hour < 24 && minute >= 0 && minute < 60) {
        return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      }
    }

    // Handle 12-hour format (e.g., "2:30 PM")
    const time12Match = input.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
    if (time12Match) {
      const [_, hours, minutes, period] = time12Match;
      let hour = parseInt(hours);
      const minute = parseInt(minutes);

      if (period.toLowerCase() === 'pm' && hour !== 12) {
        hour += 12;
      } else if (period.toLowerCase() === 'am' && hour === 12) {
        hour = 0;
      }

      if (hour >= 0 && hour < 24 && minute >= 0 && minute < 60) {
        return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      }
    }

    // Handle numeric input (e.g., "430" -> "4:30 AM")
    const numericMatch = input.match(/^(\d{1,4})$/);
    if (numericMatch) {
      const num = parseInt(numericMatch[1]);
      const hours = Math.floor(num / 100);
      const minutes = num % 100;

      if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      }
    }

    return null;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setError(null);

    const parsedTime = parseTimeInput(newValue);
    if (parsedTime) {
      onChange(parsedTime);
      setIsDropdownOpen(true);
    } else if (newValue) {
      setError('Invalid time');
      setIsDropdownOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const parsedTime = parseTimeInput(inputValue);
      if (parsedTime) {
        onChange(parsedTime);
        setIsEditing(false);
        setInputValue('');
        setError(null);
      }
    }
  };

  const handleBlur = () => {
    const parsedTime = parseTimeInput(inputValue);
    if (parsedTime) {
      onChange(parsedTime);
      setIsEditing(false);
      setInputValue('');
      setError(null);
    }
  };

  const handleTimeSelect = (time: string) => {
    onChange(time);
    setIsEditing(false);
    setInputValue('');
    setError(null);
  };

  // Find the closest matching time slot
  const findClosestTimeSlot = (input: string): string | null => {
    if (!input) return null;

    const parsedTime = parseTimeInput(input);
    if (!parsedTime) return null;

    const [hours, minutes] = parsedTime.split(':').map(Number);
    const inputMinutes = hours * 60 + minutes;

    let closestTime = null;
    let minDiff = Infinity;

    timeSlots.forEach((time) => {
      const [slotHours, slotMinutes] = time.split(':').map(Number);
      const slotMinutesTotal = slotHours * 60 + slotMinutes;
      const diff = Math.abs(slotMinutesTotal - inputMinutes);

      if (diff < minDiff) {
        minDiff = diff;
        closestTime = time;
      }
    });

    return closestTime;
  };

  // Scroll to matching time slot when typing
  useEffect(() => {
    if (isEditing && !error) {
      const closestTime = findClosestTimeSlot(inputValue);
      if (closestTime && timeSlotRefs.current[closestTime]) {
        timeSlotRefs.current[closestTime]?.scrollIntoView({
          block: 'nearest',
          behavior: 'instant',
        });
      }
    }
  }, [inputValue, isEditing, error]);

  return (
    <div className='relative'>
      {isEditing ? (
        <div className='space-y-1'>
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder='2:00 PM'
            className={`w-full ${error ? 'border-red-500' : ''}`}
            autoFocus
          />
          {error && <p className='text-sm text-red-500'>{error}</p>}
        </div>
      ) : (
        <Button
          variant='outline'
          className='w-full justify-start text-left font-normal'
          onClick={() => {
            return !disabled && handleStartEditing();
          }}
          disabled={disabled}
        >
          <Clock className='mr-2 h-4 w-4' />
          {value ? displayTime : 'Select time'}
        </Button>
      )}

      {isEditing && !error && (
        <div className='absolute z-10 mt-1 w-full rounded-md border bg-popover p-2 shadow-md'>
          <ScrollArea className='h-[200px]'>
            <div className='space-y-1'>
              {timeSlots.map((time) => {
                const [hours, minutes] = time.split(':').map(Number);
                const displayTime = format(new Date().setHours(hours, minutes), 'h:mm a');
                return (
                  <Button
                    key={time}
                    ref={(el) => {
                      timeSlotRefs.current[time] = el;
                    }}
                    variant={value === time ? 'default' : 'ghost'}
                    className='w-full justify-start'
                    onClick={() => {
                      return handleTimeSelect(time);
                    }}
                  >
                    {displayTime}
                  </Button>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
