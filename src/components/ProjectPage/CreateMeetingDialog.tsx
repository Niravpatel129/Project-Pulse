import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { GoogleCalendarTimePicker } from '@/components/ui/google-calendar-time-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useProject } from '@/contexts/ProjectContext';
import { format } from 'date-fns';
import { Calendar, Globe, Loader2, MapPin, UserPlus, Video, X } from 'lucide-react';
import { useCreateMeeting } from './hooks/useCreateMeeting';
import { useGoogleIntegration } from './hooks/useGoogleIntegration';

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

const MEETING_TYPES = [
  { value: 'video', label: 'Video Call', icon: Video },
  { value: 'phone', label: 'Phone Call', icon: Globe },
  { value: 'in-person', label: 'In Person', icon: MapPin },
  { value: 'other', label: 'Other', icon: Calendar },
];

const DURATION_OPTIONS = [
  { value: '15', label: '15 minutes' },
  { value: '30', label: '30 minutes' },
  { value: '45', label: '45 minutes' },
  { value: '60', label: '1 hour' },
  { value: '90', label: '1.5 hours' },
  { value: '120', label: '2 hours' },
];

interface CreateMeetingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date;
  teamMembers: TeamMember[];
  onCreateMeeting: (e: React.FormEvent) => Promise<void>;
}

export default function CreateMeetingDialog({
  open,
  onOpenChange,
  selectedDate,
  teamMembers,
  onCreateMeeting,
}: CreateMeetingDialogProps) {
  const { isConnecting, googleStatus, handleConnect } = useGoogleIntegration();
  const {
    step,
    showCalendar,
    currentMonth,
    meetingStartTime,
    selectedEndTime,
    isAllDay,
    dateRange,
    searchQuery,
    manualEmail,
    showManualEmailInput,
    meetingTitle,
    meetingDescription,
    meetingType,
    meetingDuration,
    selectedTeamMembers,
    meetingTypeDetails,
    filteredParticipants,
    setShowCalendar,
    setCurrentMonth,
    setMeetingStartTime,
    setSelectedEndTime,
    setIsAllDay,
    setDateRange,
    setSearchQuery,
    setManualEmail,
    setShowManualEmailInput,
    setMeetingTitle,
    setMeetingDescription,
    setMeetingType,
    setMeetingDuration,
    setSelectedTeamMembers,
    setMeetingTypeDetails,
    handleAddParticipant,
    handleRemoveParticipant,
    handleAddManualEmail,
    handleNext,
    handleBack,
    handleSubmit,
    handleDateSelect,
    handleStartTimeSelect,
  } = useCreateMeeting({ selectedDate, onCreateMeeting });

  const { project } = useProject();

  const handleFormSubmit = async (e: React.FormEvent) => {
    await handleSubmit(e);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='w-full overflow-y-auto min-w-[500px]'>
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
                <Select value={meetingType} onValueChange={setMeetingType}>
                  <SelectTrigger>
                    <SelectValue placeholder='Select meeting type' />
                  </SelectTrigger>
                  <SelectContent>
                    {MEETING_TYPES.map((type) => {
                      const Icon = type.icon;
                      return (
                        <SelectItem key={type.value} value={type.value}>
                          <div className='flex items-center gap-2'>
                            <Icon className='w-4 h-4' />
                            <span>{type.label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label>Participants</Label>
                <div className='space-y-4'>
                  {/* Selected Participants */}
                  <div className='flex flex-wrap gap-2'>
                    {selectedTeamMembers.map((participantId) => {
                      // Check if it's a manual email (doesn't match project participant ID format)
                      if (!participantId.includes('_')) {
                        return (
                          <Badge
                            key={participantId}
                            variant='secondary'
                            className='flex items-center gap-1'
                          >
                            <Avatar className='h-4 w-4'>
                              <AvatarFallback>
                                {participantId.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span>{participantId}</span>
                            <button
                              onClick={() => {
                                return handleRemoveParticipant(participantId);
                              }}
                              className='ml-1 hover:text-destructive'
                            >
                              <X className='h-3 w-3' />
                            </button>
                          </Badge>
                        );
                      }

                      const participant = project?.participants.find((p) => {
                        return p._id === participantId;
                      });
                      if (!participant) return null;
                      return (
                        <Badge
                          key={participantId}
                          variant='secondary'
                          className='flex items-center gap-1'
                        >
                          <Avatar className='h-4 w-4'>
                            <AvatarImage src={participant.avatar} />
                            <AvatarFallback>
                              {participant.name
                                .split(' ')
                                .map((n) => {
                                  return n[0];
                                })
                                .join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span>{participant.name}</span>
                          <button
                            onClick={() => {
                              return handleRemoveParticipant(participantId);
                            }}
                            className='ml-1 hover:text-destructive'
                          >
                            <X className='h-3 w-3' />
                          </button>
                        </Badge>
                      );
                    })}
                  </div>

                  {/* Participant Selection */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant='outline' className='w-full justify-start'>
                        <UserPlus className='mr-2 h-4 w-4' />
                        Add Participants
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className='w-[var(--radix-popover-trigger-width)] p-0 text-sm'
                      align='start'
                    >
                      <div className='space-y-2 p-4'>
                        <div className='flex items-center gap-2'>
                          <Input
                            placeholder='Search or add email...'
                            value={searchQuery}
                            onChange={(e) => {
                              return setSearchQuery(e.target.value);
                            }}
                            className='flex-1'
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && searchQuery && !searchQuery.includes('@')) {
                                return;
                              }
                              if (
                                e.key === 'Enter' &&
                                searchQuery &&
                                !selectedTeamMembers.includes(searchQuery)
                              ) {
                                setSelectedTeamMembers([...selectedTeamMembers, searchQuery]);
                                setSearchQuery('');
                              }
                            }}
                          />
                        </div>

                        <div className='max-h-[300px] overflow-y-auto'>
                          {filteredParticipants?.map((participant) => {
                            const isSelected = selectedTeamMembers.includes(participant._id);
                            return (
                              <button
                                key={participant._id}
                                onClick={() => {
                                  if (isSelected) {
                                    handleRemoveParticipant(participant._id);
                                  } else {
                                    handleAddParticipant(participant._id);
                                  }
                                }}
                                className={`w-full flex items-center gap-2 p-2 rounded hover:bg-accent ${
                                  isSelected ? 'bg-accent' : ''
                                }`}
                              >
                                <Avatar className='h-6 w-6'>
                                  <AvatarImage src={participant.avatar} />
                                  <AvatarFallback>
                                    {participant.name
                                      .split(' ')
                                      .map((n) => {
                                        return n[0];
                                      })
                                      .join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div className='flex-1 text-left'>
                                  <div className='font-medium'>{participant.name}</div>
                                  {participant.email && (
                                    <div className='text-sm text-muted-foreground'>
                                      {participant.email}
                                    </div>
                                  )}
                                </div>
                                <Checkbox checked={isSelected} className='h-4 w-4' />
                              </button>
                            );
                          })}

                          {/* Show "Add email" option if search query is a valid email and not already selected */}
                          {searchQuery &&
                            searchQuery.includes('@') &&
                            !selectedTeamMembers.includes(searchQuery) && (
                              <button
                                onClick={() => {
                                  setSelectedTeamMembers([...selectedTeamMembers, searchQuery]);
                                  setSearchQuery('');
                                }}
                                className='text-sm w-full flex items-center gap-2 p-2 rounded hover:bg-accent text-primary'
                              >
                                <UserPlus className='h-6 w-6' />
                                <div className='flex-1 text-left'>
                                  <div className='font-medium'>Add {searchQuery}</div>
                                </div>
                              </button>
                            )}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </div>

          {/* Meeting Type Details */}
          <div className='space-y-6'>
            {meetingType === 'video' && (
              <div className='space-y-2'>
                <Label>Video Platform</Label>
                <Select
                  value={meetingTypeDetails.videoPlatform}
                  onValueChange={(value) => {
                    setMeetingTypeDetails({
                      ...meetingTypeDetails,
                      videoPlatform: value,
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select video platform' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='google-meet'>Google Meet</SelectItem>
                    <SelectItem value='custom'>Other Platform</SelectItem>
                  </SelectContent>
                </Select>
                {meetingTypeDetails.videoPlatform === 'google-meet' && (
                  <div className='space-y-2'>
                    {googleStatus?.connected ? (
                      <div className='flex items-center gap-2 text-sm text-green-600'>
                        <span>✓</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className='cursor-help'>Connected to Google Calendar</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              Google Meet links will be automatically created and included in your
                              meeting invitations
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    ) : (
                      <div className='space-y-2'>
                        <p className='text-sm text-muted-foreground'>
                          Connect your Google account to schedule meetings directly
                        </p>
                        <Button
                          type='button'
                          variant='outline'
                          size='sm'
                          onClick={() => {
                            return handleConnect('google');
                          }}
                          disabled={isConnecting}
                          className='w-full'
                        >
                          {isConnecting ? (
                            <>
                              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                              Connecting...
                            </>
                          ) : (
                            'Connect Google Calendar'
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
                {meetingTypeDetails.videoPlatform === 'custom' && (
                  <Input
                    placeholder='Enter video platform name'
                    value={meetingTypeDetails.customLocation}
                    onChange={(e) => {
                      setMeetingTypeDetails({
                        ...meetingTypeDetails,
                        customLocation: e.target.value,
                      });
                    }}
                  />
                )}
              </div>
            )}

            {meetingType === 'phone' && (
              <div className='space-y-2'>
                <Label>Phone Number Source</Label>
                <Select
                  value={meetingTypeDetails.phoneNumberType}
                  onValueChange={(value) => {
                    setMeetingTypeDetails({
                      ...meetingTypeDetails,
                      phoneNumberType: value,
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select phone number source' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='client-provided'>
                      Client will provide their number
                    </SelectItem>
                    <SelectItem value='custom'>Specify a number</SelectItem>
                  </SelectContent>
                </Select>
                {meetingTypeDetails.phoneNumberType === 'custom' && (
                  <Input
                    type='tel'
                    placeholder='Enter phone number (e.g., +1 234 567 8900)'
                    value={meetingTypeDetails.phoneNumber}
                    onChange={(e) => {
                      setMeetingTypeDetails({
                        ...meetingTypeDetails,
                        phoneNumber: e.target.value,
                      });
                    }}
                  />
                )}
              </div>
            )}

            {(meetingType === 'in-person' || meetingType === 'other') && (
              <div className='space-y-2'>
                <Label>Location</Label>
                <Input
                  placeholder={
                    meetingType === 'in-person'
                      ? 'Enter physical meeting location'
                      : 'Specify meeting location or instructions'
                  }
                  value={meetingTypeDetails.customLocation}
                  onChange={(e) => {
                    setMeetingTypeDetails({
                      ...meetingTypeDetails,
                      customLocation: e.target.value,
                    });
                  }}
                />
              </div>
            )}
          </div>

          {/* Step 2: Date & Time */}
          <div className='space-y-6'>
            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label>Date Range</Label>
                <div className='flex items-center gap-2'>
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
                  <span className='text-muted-foreground'>To</span>
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
              </div>

              {!isAllDay && (
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label>Start time</Label>
                    <GoogleCalendarTimePicker
                      value={meetingStartTime}
                      onChange={setMeetingStartTime}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>End time</Label>
                    <GoogleCalendarTimePicker
                      value={selectedEndTime}
                      onChange={setSelectedEndTime}
                    />
                  </div>
                </div>
              )}
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
            <Button onClick={handleFormSubmit}>Create Meeting</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
