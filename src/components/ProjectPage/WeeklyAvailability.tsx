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
import { AvailabilitySettings, useAvailability } from '@/hooks/useAvailability';
import { Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo } from 'react';

interface WeeklyAvailabilityProps {
  handleDayToggle?: (day: string, isEnabled: boolean) => void;
}

export default function WeeklyAvailability({ handleDayToggle }: WeeklyAvailabilityProps) {
  const { updateAvailability, settings, setSettings } = useAvailability();

  // Ensure the component uses the passed availabilitySlots prop
  useEffect(() => {
    if (settings.availabilitySlots && Object.keys(settings.availabilitySlots).length > 0) {
      setSettings((prevSettings) => {
        return {
          ...prevSettings,
          availabilitySlots: settings.availabilitySlots,
        };
      });
    }
  }, [settings.availabilitySlots, setSettings]);

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

  const timeOptions = useMemo(() => {
    return Array.from({ length: 48 }, (_, i) => {
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
  }, []);

  const addTimeSlot = useCallback(
    (day: string) => {
      const newSlots = [...settings.availabilitySlots[day].slots, { start: '09:00', end: '17:00' }];
      const updatedSlots = {
        ...settings.availabilitySlots,
        [day]: {
          ...settings.availabilitySlots[day],
          slots: newSlots,
        },
      };

      updateAvailability({
        availabilitySlots: updatedSlots as AvailabilitySettings['availabilitySlots'],
      });
    },
    [settings.availabilitySlots, updateAvailability],
  );

  const removeTimeSlot = useCallback(
    (day: string, index: number) => {
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

      updateAvailability({
        availabilitySlots: updatedSlots as AvailabilitySettings['availabilitySlots'],
      });
    },
    [settings.availabilitySlots, updateAvailability],
  );

  const onDayToggle = useCallback(
    (day: string, isEnabled: boolean) => {
      if (handleDayToggle) {
        handleDayToggle(day, isEnabled);
      } else {
        const updatedSlots = {
          ...settings.availabilitySlots,
          [day]: {
            ...settings.availabilitySlots[day],
            isEnabled,
          },
        };

        updateAvailability({
          availabilitySlots: updatedSlots as AvailabilitySettings['availabilitySlots'],
        });
      }
    },
    [handleDayToggle, settings.availabilitySlots, updateAvailability],
  );

  const handleTimeChange = useCallback(
    (day: string, index: number, type: 'start' | 'end', value: string) => {
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

      setSettings((prev) => {
        return {
          ...prev,
          availabilitySlots: updatedSlots as AvailabilitySettings['availabilitySlots'],
        };
      });

      updateAvailability({
        availabilitySlots: updatedSlots as AvailabilitySettings['availabilitySlots'],
      });
    },
    [settings.availabilitySlots, setSettings, updateAvailability],
  );

  return (
    <div className='space-y-1'>
      {days.map((day) => {
        const daySlots = settings.availabilitySlots[day.id]?.slots || [];
        const isEnabled = settings.availabilitySlots[day.id]?.isEnabled ?? true;

        return (
          <div
            key={day.id}
            className='flex items-base justify-between py-3 hover:bg-gray-50/50 rounded-lg px-2'
          >
            <div className='flex space-x-4 min-w-[120px]'>
              <Switch
                id={day.id}
                checked={isEnabled}
                onCheckedChange={(checked) => {
                  return onDayToggle(day.id, checked);
                }}
              />
              <Label htmlFor={day.id} className='font-medium'>
                {day.label}
              </Label>
            </div>
            <div className='flex-1 flex flex-col space-y-2'>
              {daySlots.map((slot, index) => {
                return (
                  <div key={index} className='flex items-center justify-end space-x-2'>
                    <Select
                      value={slot.start}
                      onValueChange={(value) => {
                        return handleTimeChange(day.id, index, 'start', value);
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
                        return handleTimeChange(day.id, index, 'end', value);
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
                      <Button
                        variant='ghost'
                        size='sm'
                        className='h-8 w-8 p-0'
                        onClick={() => {
                          return addTimeSlot(day.id);
                        }}
                      >
                        <Plus className='h-4 w-4' />
                      </Button>
                    ) : (
                      <Button
                        variant='ghost'
                        size='sm'
                        className='h-8 w-8 p-0 text-red-500 hover:text-red-600'
                        onClick={() => {
                          return removeTimeSlot(day.id, index);
                        }}
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
