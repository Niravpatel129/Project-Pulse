import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { GoogleCalendarTimePicker } from '@/components/ui/google-calendar-time-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { addMinutes, format } from 'date-fns';
import { Calendar, Globe, MapPin, Video } from 'lucide-react';
import { useState } from 'react';

type TeamMember = {
  _id: string;
  name: string;
  email: string;
  role: string;
  availableTimes: {
    day: string;
    slots: { start: string; end: string }[];
  }[];
};

interface CreateMeetingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date;
  teamMembers: TeamMember[];
  onCreateMeeting: (e: React.FormEvent) => Promise<void>;
  meetingStartTime: string;
  setMeetingStartTime: (time: string) => void;
  meetingDuration: string;
  setMeetingDuration: (duration: string) => void;
  selectedTeamMembers: string[];
  setSelectedTeamMembers: (members: string[]) => void;
  meetingTitle: string;
  setMeetingTitle: (title: string) => void;
  meetingDescription: string;
  setMeetingDescription: (description: string) => void;
  meetingType: string;
  setMeetingType: (type: string) => void;
  meetingTypeDetails: {
    videoType?: string;
    videoLink?: string;
    phoneNumber?: string;
    location?: string;
    otherDetails?: string;
  };
  setMeetingTypeDetails: (details: {
    videoType?: string;
    videoLink?: string;
    phoneNumber?: string;
    location?: string;
    otherDetails?: string;
  }) => void;
}

const MEETING_TYPES = [
  { value: 'video', label: 'Video Call', icon: Video },
  { value: 'in-person', label: 'In Person', icon: MapPin },
  { value: 'phone', label: 'Phone Call', icon: Globe },
];

const DURATION_OPTIONS = [
  { value: '15', label: '15 minutes' },
  { value: '30', label: '30 minutes' },
  { value: '45', label: '45 minutes' },
  { value: '60', label: '1 hour' },
  { value: '90', label: '1.5 hours' },
  { value: '120', label: '2 hours' },
];

export default function CreateMeetingDialog({
  open,
  onOpenChange,
  selectedDate,
  teamMembers,
  onCreateMeeting,
  meetingStartTime,
  setMeetingStartTime,
  meetingDuration,
  setMeetingDuration,
  selectedTeamMembers,
  setSelectedTeamMembers,
  meetingTitle,
  setMeetingTitle,
  meetingDescription,
  setMeetingDescription,
  meetingType,
  setMeetingType,
  meetingTypeDetails,
  setMeetingTypeDetails,
}: CreateMeetingDialogProps) {
  const [step, setStep] = useState(1);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedEndTime, setSelectedEndTime] = useState('');
  const [isAllDay, setIsAllDay] = useState(false);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>({
    from: selectedDate,
    to: selectedDate,
  });

  const handleNext = () => {
    if (step === 1 && !meetingTitle) return;
    if (step === 2 && (!meetingStartTime || !selectedEndTime)) return;
    if (step === 3 && selectedTeamMembers.length === 0) return;

    setStep((prev) => {
      return Math.min(prev + 1, 3);
    });
  };

  const handleBack = () => {
    setStep((prev) => {
      return Math.max(prev - 1, 1);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreateMeeting(e);
    onOpenChange(false);
  };

  const handleDateSelect = (date: Date | undefined, isEndDate: boolean = false) => {
    if (date) {
      if (isEndDate) {
        setDateRange((prev) => {
          return { ...prev!, to: date };
        });
      } else {
        setDateRange((prev) => {
          return { from: date, to: prev?.to || date };
        });
      }
      if (!isAllDay) {
        setMeetingStartTime('');
        setSelectedEndTime('');
      }
    }
  };

  const handleStartTimeSelect = (time: string) => {
    setMeetingStartTime(time);
    const [hours, minutes] = time.split(':').map(Number);
    const startDate = new Date(dateRange?.from || selectedDate);
    startDate.setHours(hours, minutes, 0, 0);

    const duration = parseInt(meetingDuration) || 30;
    const endDate = addMinutes(startDate, duration);
    setSelectedEndTime(
      endDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='w-full overflow-y-auto'>
        <SheetHeader>
          <SheetTitle>Create Meeting</SheetTitle>
        </SheetHeader>

        <div className='mt-6 space-y-8'>
          {/* Step 1: Meeting Details */}
          <div className='space-y-6'>
            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label>Title</Label>
                <Input
                  value={meetingTitle}
                  onChange={(e) => {
                    return setMeetingTitle(e.target.value);
                  }}
                  placeholder='Add title'
                  className='w-full'
                />
              </div>

              <div className='space-y-2'>
                <Label>Description (optional)</Label>
                <Textarea
                  value={meetingDescription}
                  onChange={(e) => {
                    return setMeetingDescription(e.target.value);
                  }}
                  placeholder='Add description'
                  className='w-full'
                />
              </div>

              <div className='space-y-2'>
                <Label>Meeting Type</Label>
                <div className='grid grid-cols-3 gap-2'>
                  {MEETING_TYPES.map((type) => {
                    const Icon = type.icon;
                    return (
                      <Button
                        key={type.value}
                        variant={meetingType === type.value ? 'default' : 'outline'}
                        className='flex flex-col items-center gap-2 h-auto py-3'
                        onClick={() => {
                          return setMeetingType(type.value);
                        }}
                      >
                        <Icon className='w-5 h-5' />
                        <span className='text-xs'>{type.label}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Meeting Type Details */}
          <div className='space-y-6'>
            {meetingType === 'video' && (
              <div className='space-y-2'>
                <Label>Video Platform</Label>
                <Input
                  value={meetingTypeDetails.videoType}
                  onChange={(e) => {
                    return setMeetingTypeDetails({
                      ...meetingTypeDetails,
                      videoType: e.target.value,
                    });
                  }}
                  placeholder='e.g., Zoom, Google Meet'
                />
                <Label>Meeting Link</Label>
                <Input
                  value={meetingTypeDetails.videoLink}
                  onChange={(e) => {
                    return setMeetingTypeDetails({
                      ...meetingTypeDetails,
                      videoLink: e.target.value,
                    });
                  }}
                  placeholder='https://'
                />
              </div>
            )}

            {meetingType === 'in-person' && (
              <div className='space-y-2'>
                <Label>Location</Label>
                <Input
                  value={meetingTypeDetails.location}
                  onChange={(e) => {
                    return setMeetingTypeDetails({
                      ...meetingTypeDetails,
                      location: e.target.value,
                    });
                  }}
                  placeholder='Enter location'
                />
              </div>
            )}

            {meetingType === 'phone' && (
              <div className='space-y-2'>
                <Label>Phone Number</Label>
                <Input
                  value={meetingTypeDetails.phoneNumber}
                  onChange={(e) => {
                    return setMeetingTypeDetails({
                      ...meetingTypeDetails,
                      phoneNumber: e.target.value,
                    });
                  }}
                  placeholder='Enter phone number'
                />
              </div>
            )}
          </div>

          {/* Step 2: Date & Time */}
          <div className='space-y-6'>
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label>Start date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant='outline' className='w-full justify-start font-normal'>
                        <Calendar className='mr-2 h-4 w-4' />
                        {format(dateRange?.from || selectedDate, 'MMM d, yyyy')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-[300px] p-0' align='start'>
                      <CalendarComponent
                        mode='single'
                        selected={dateRange?.from}
                        onSelect={(date) => {
                          return handleDateSelect(date);
                        }}
                        className=''
                        month={currentMonth}
                        onMonthChange={setCurrentMonth}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                {!isAllDay && (
                  <div className='space-y-2'>
                    <Label>Start time</Label>
                    <GoogleCalendarTimePicker
                      value={meetingStartTime}
                      onChange={setMeetingStartTime}
                    />
                  </div>
                )}
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label>End date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant='outline' className='w-full justify-start font-normal'>
                        <Calendar className='mr-2 h-4 w-4' />
                        {format(dateRange?.to || selectedDate, 'MMM d, yyyy')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-[300px] p-0' align='start'>
                      <CalendarComponent
                        mode='single'
                        selected={dateRange?.to}
                        onSelect={(date) => {
                          return handleDateSelect(date, true);
                        }}
                        className=''
                        month={currentMonth}
                        onMonthChange={setCurrentMonth}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                {!isAllDay && (
                  <div className='space-y-2'>
                    <Label>End time</Label>
                    <GoogleCalendarTimePicker
                      value={selectedEndTime}
                      onChange={setSelectedEndTime}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className='flex items-center space-x-2'>
              <Checkbox
                id='all-day'
                checked={isAllDay}
                onCheckedChange={(checked) => {
                  setIsAllDay(checked as boolean);
                  if (checked) {
                    setMeetingStartTime('');
                    setSelectedEndTime('');
                  }
                }}
              />
              <Label htmlFor='all-day'>All day</Label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex justify-end gap-2 pt-4 border-t'>
            <Button
              variant='outline'
              onClick={() => {
                return onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Create Meeting</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
