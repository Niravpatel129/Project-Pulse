import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2 } from 'lucide-react';
import { memo, useCallback, useContext, useMemo } from 'react';
import { SettingsContext } from './ManageAvailabilityDialog';

interface WeeklyAvailabilityProps {
  handleDayToggle?: (day: string, isEnabled: boolean) => void;
}

// Memoized time options to prevent recalculation
const useTimeOptions = () => {
  return useMemo(() => {
    // Create regular 30-minute intervals
    const options = Array.from({ length: 48 }, (_, i) => {
      const hour = Math.floor(i / 2);
      const minute = (i % 2) * 30;
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const displayTime = new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      return { value: time, label: displayTime };
    });

    // Add 11:59 PM as the last option
    const lastTime = '23:59';
    const lastDisplayTime = new Date(`2000-01-01T${lastTime}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    // Replace 11:30 PM with 11:59 PM or add it if it doesn't exist
    const lastRegularIndex = options.findIndex((option) => {
      return option.value === '23:30';
    });
    if (lastRegularIndex !== -1) {
      options[lastRegularIndex] = { value: lastTime, label: lastDisplayTime };
    } else {
      options.push({ value: lastTime, label: lastDisplayTime });
    }

    return options;
  }, []);
};

// Memoized time slot component
const TimeSlot = memo(
  ({
    slot,
    index,
    timeOptions,
    onTimeChange,
    onAdd,
    onRemove,
  }: {
    slot: { start: string; end: string };
    index: number;
    timeOptions: { value: string; label: string }[];
    onTimeChange: (type: 'start' | 'end', value: string) => void;
    onAdd: () => void;
    onRemove: () => void;
  }) => {
    return (
      <div className='flex items-center justify-end space-x-2'>
        <Select
          value={slot.start}
          onValueChange={(value) => {
            return onTimeChange('start', value);
          }}
        >
          <SelectTrigger className='w-[110px]'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {timeOptions.map((option) => {
              return (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        <span className='text-gray-500'>-</span>
        <Select
          value={slot.end}
          onValueChange={(value) => {
            return onTimeChange('end', value);
          }}
        >
          <SelectTrigger className='w-[110px]'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {timeOptions.map((option) => {
              return (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        {index === 0 ? (
          <Button variant='ghost' size='sm' className='h-8 w-8 p-0' onClick={onAdd}>
            <Plus className='h-4 w-4' />
          </Button>
        ) : (
          <Button
            variant='ghost'
            size='sm'
            className='h-8 w-8 p-0 text-red-500 hover:text-red-600'
            onClick={onRemove}
          >
            <Trash2 className='h-4 w-4' />
          </Button>
        )}
      </div>
    );
  },
);

TimeSlot.displayName = 'TimeSlot';

// Calculate hours from time slots
const calculateHours = (slots: { start: string; end: string }[]): number => {
  return slots.reduce((total, slot) => {
    const [startHour, startMinute] = slot.start.split(':').map(Number);
    const [endHour, endMinute] = slot.end.split(':').map(Number);

    const startTimeInMinutes = startHour * 60 + startMinute;
    let endTimeInMinutes = endHour * 60 + endMinute;

    // Special case for 23:59 (11:59 PM) - treat it as 24:00 (midnight)
    if (endHour === 23 && endMinute === 59) {
      endTimeInMinutes = 24 * 60;
    }

    // Handle cases where end time is earlier than start time (invalid)
    const durationInMinutes = Math.max(0, endTimeInMinutes - startTimeInMinutes);

    return total + durationInMinutes / 60;
  }, 0);
};

// Memoized day component
const DayAvailability = memo(
  ({
    day,
    label,
    slots,
    isEnabled,
    timeOptions,
    onDayToggle,
    onTimeChange,
    onAddSlot,
    onRemoveSlot,
  }: {
    day: string;
    label: string;
    slots: { start: string; end: string }[];
    isEnabled: boolean;
    timeOptions: { value: string; label: string }[];
    onDayToggle: (checked: boolean) => void;
    onTimeChange: (index: number, type: 'start' | 'end', value: string) => void;
    onAddSlot: () => void;
    onRemoveSlot: (index: number) => void;
  }) => {
    const hoursAvailable = isEnabled ? calculateHours(slots) : 0;

    return (
      <div className='flex items-base justify-between py-3 hover:bg-gray-50/50 rounded-lg px-2'>
        <div className='flex flex-col space-y-1 min-w-[120px]'>
          <div className='flex space-x-4'>
            <Switch id={day} checked={isEnabled} onCheckedChange={onDayToggle} />
            <Label htmlFor={day} className='font-medium'>
              {label}
            </Label>
          </div>
          <div className='ml-10 text-xs text-gray-500'>
            {isEnabled ? `${hoursAvailable.toFixed(1)} hours available` : 'Not available'}
          </div>
        </div>
        <div className='flex-1 flex flex-col space-y-2'>
          {slots.map((slot, index) => {
            return (
              <TimeSlot
                key={index}
                slot={slot}
                index={index}
                timeOptions={timeOptions}
                onTimeChange={(type, value) => {
                  return onTimeChange(index, type, value);
                }}
                onAdd={onAddSlot}
                onRemove={() => {
                  return onRemoveSlot(index);
                }}
              />
            );
          })}
        </div>
      </div>
    );
  },
);

DayAvailability.displayName = 'DayAvailability';

export default function WeeklyAvailability({ handleDayToggle }: WeeklyAvailabilityProps) {
  // Use context instead of direct hook
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error('WeeklyAvailability must be used within a SettingsProvider');
  }

  const { settings, updateSetting, isLoading } = context;
  const timeOptions = useTimeOptions();

  const days = useMemo(() => {
    return [
      { id: 'sunday', label: 'Sunday' },
      { id: 'monday', label: 'Monday' },
      { id: 'tuesday', label: 'Tuesday' },
      { id: 'wednesday', label: 'Wednesday' },
      { id: 'thursday', label: 'Thursday' },
      { id: 'friday', label: 'Friday' },
      { id: 'saturday', label: 'Saturday' },
    ];
  }, []);

  const addTimeSlot = useCallback(
    (day: string) => {
      if (!settings.availabilitySlots?.[day]) return;

      const newSlots = [...settings.availabilitySlots[day].slots, { start: '09:00', end: '17:00' }];
      const updatedSlots = {
        ...settings.availabilitySlots,
        [day]: {
          ...settings.availabilitySlots[day],
          slots: newSlots,
        },
      };

      updateSetting('availabilitySlots', updatedSlots);
    },
    [settings.availabilitySlots, updateSetting],
  );

  const removeTimeSlot = useCallback(
    (day: string, index: number) => {
      if (!settings.availabilitySlots?.[day]) return;

      const newSlots = settings.availabilitySlots[day].slots.filter((_, i) => {
        return i !== index;
      });
      const updatedSlots = {
        ...settings.availabilitySlots,
        [day]: {
          ...settings.availabilitySlots[day],
          slots: newSlots,
        },
      };

      updateSetting('availabilitySlots', updatedSlots);
    },
    [settings.availabilitySlots, updateSetting],
  );

  const onDayToggle = useCallback(
    (day: string, isEnabled: boolean) => {
      if (handleDayToggle) {
        handleDayToggle(day, isEnabled);
      } else {
        if (!settings.availabilitySlots?.[day]) return;

        const updatedSlots = {
          ...settings.availabilitySlots,
          [day]: {
            ...settings.availabilitySlots[day],
            isEnabled,
          },
        };

        updateSetting('availabilitySlots', updatedSlots);
      }
    },
    [handleDayToggle, settings.availabilitySlots, updateSetting],
  );

  const handleTimeChange = useCallback(
    (day: string, index: number, type: 'start' | 'end', value: string) => {
      if (!settings.availabilitySlots?.[day]) return;

      const updatedSlots = {
        ...settings.availabilitySlots,
        [day]: {
          ...settings.availabilitySlots[day],
          slots: settings.availabilitySlots[day].slots.map((slot, i) => {
            if (i === index) {
              return {
                ...slot,
                [type]: value,
              };
            }
            return slot;
          }),
        },
      };

      updateSetting('availabilitySlots', updatedSlots);
    },
    [settings.availabilitySlots, updateSetting],
  );

  // Calculate total weekly hours
  const totalWeeklyHours = useMemo(() => {
    if (!settings.availabilitySlots) return 0;

    return days.reduce((total, day) => {
      const dayData = settings.availabilitySlots[day.id];
      if (!dayData?.isEnabled) return total;
      return total + calculateHours(dayData.slots);
    }, 0);
  }, [days, settings.availabilitySlots]);

  return (
    <div className='space-y-1'>
      <div className='mb-3 text-sm font-medium text-gray-700'>
        Total weekly availability: {totalWeeklyHours.toFixed(1)} hours
      </div>
      {days.map((day) => {
        // Guard against settings being undefined during initial render
        const daySlots = settings?.availabilitySlots?.[day.id]?.slots || [];
        const isEnabled = settings?.availabilitySlots?.[day.id]?.isEnabled ?? true;

        return (
          <DayAvailability
            key={day.id}
            day={day.id}
            label={day.label}
            slots={daySlots}
            isEnabled={isEnabled}
            timeOptions={timeOptions}
            onDayToggle={(checked) => {
              return onDayToggle(day.id, checked);
            }}
            onTimeChange={(index, type, value) => {
              return handleTimeChange(day.id, index, type, value);
            }}
            onAddSlot={() => {
              return addTimeSlot(day.id);
            }}
            onRemoveSlot={(index) => {
              return removeTimeSlot(day.id, index);
            }}
          />
        );
      })}
    </div>
  );
}
