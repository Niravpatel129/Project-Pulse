import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

type TimeSlot = {
  start: string;
  end: string;
};

type AvailabilitySlots = {
  [key: string]: TimeSlot[];
};

interface WeeklyAvailabilityProps {
  availabilitySlots: AvailabilitySlots;
  handleTimeChange: (day: string, index: number, type: 'start' | 'end', value: string) => void;
}

export default function WeeklyAvailability({
  availabilitySlots,
  handleTimeChange,
}: WeeklyAvailabilityProps) {
  const days = [
    { id: 'sunday', label: 'Sunday' },
    { id: 'monday', label: 'Monday', defaultChecked: true },
    { id: 'tuesday', label: 'Tuesday', defaultChecked: true },
    { id: 'wednesday', label: 'Wednesday', defaultChecked: true },
    { id: 'thursday', label: 'Thursday', defaultChecked: true },
    { id: 'friday', label: 'Friday', defaultChecked: true },
    { id: 'saturday', label: 'Saturday' },
  ];

  const timeOptions = Array.from({ length: 48 }, (_, i) => {
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

  return (
    <div className='space-y-1'>
      {days.map((day) => {
        return (
          <div
            key={day.id}
            className='flex items-center justify-between py-3 hover:bg-gray-50/50 rounded-lg px-2'
          >
            <div className='flex items-center space-x-4 min-w-[120px]'>
              <Switch id={day.id} defaultChecked={day.defaultChecked} />
              <Label htmlFor={day.id} className='font-medium'>
                {day.label}
              </Label>
            </div>
            <div className='flex-1 flex flex-col space-y-2'>
              {availabilitySlots[day.id].map((slot, index) => {
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
