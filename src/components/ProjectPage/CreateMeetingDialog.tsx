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
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useProject } from '@/contexts/ProjectContext';
import { format } from 'date-fns';
import { Calendar, Globe, Loader2, MapPin, UserPlus, Video, X } from 'lucide-react';
import { useCallback, useEffect } from 'react';
import { useCreateMeeting } from './hooks/useCreateMeeting';

const MEETING_TYPES = [
  { value: 'video', label: 'Video Call', icon: Video },
  { value: 'phone', label: 'Phone Call', icon: Globe },
  { value: 'in-person', label: 'In Person', icon: MapPin },
  { value: 'other', label: 'Other', icon: Calendar },
];

interface CreateMeetingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date;
}

export default function CreateMeetingDialog({
  open,
  onOpenChange,
  selectedDate,
}: CreateMeetingDialogProps) {
  console.log('🚀 selectedDate:', selectedDate);
  const { project } = useProject();
  const {
    // State
    meetingTitle,
    meetingDescription,
    meetingType,
    meetingTypeDetails,
    selectedTeamMembers,
    searchQuery,
    dateRange,
    currentMonth,
    meetingStartTime,
    selectedEndTime,
    isAllDay,
    filteredParticipants,
    isConnecting,
    googleStatus,

    // Setters
    setMeetingTitle,
    setMeetingDescription,
    setMeetingType,
    setMeetingTypeDetails,
    setSearchQuery,
    setCurrentMonth,
    setMeetingStartTime,
    setSelectedEndTime,

    // Handlers
    handleAddParticipant,
    handleRemoveParticipant,
    handleSubmit,
    handleDateSelect,
    handleAllDayChange,
    handleConnect,
  } = useCreateMeeting({ selectedDate });

  useEffect(() => {
    handleDateSelect(selectedDate);
    handleDateSelect(selectedDate, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const handleFormSubmit = useCallback(
    async (e: React.FormEvent) => {
      await handleSubmit(e);
      onOpenChange(false);
    },
    [handleSubmit, onOpenChange],
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='w-full overflow-y-auto min-w-[500px] flex flex-col'>
        <SheetHeader>
          <SheetTitle>Create Meeting</SheetTitle>
        </SheetHeader>

        <div className='flex-1 mt-6 space-y-8 overflow-y-auto p-1 scrollbar-hide'>
          {/* Meeting Details */}
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

                <div className='relative'>
                  {meetingType === 'video' && (
                    <div className='mt-2 animate-in slide-in-from-top-2 duration-200'>
                      <Select
                        value={meetingTypeDetails?.videoPlatform || ''}
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
                      {meetingTypeDetails?.videoPlatform === 'custom' && (
                        <div className='mt-2 animate-in fade-in duration-200'>
                          <Input
                            placeholder='Enter video platform name'
                            value={meetingTypeDetails?.customLocation || ''}
                            onChange={(e) => {
                              setMeetingTypeDetails({
                                ...meetingTypeDetails,
                                customLocation: e.target.value,
                              });
                            }}
                            className='mt-2 animate-in fade-in duration-200'
                          />
                        </div>
                      )}
                      {meetingTypeDetails?.videoPlatform === 'google-meet' && (
                        <div className='mt-2 animate-in fade-in duration-200'>
                          {googleStatus?.connected ? (
                            <div className='flex items-center gap-2 text-sm text-green-600'>
                              <span>✓</span>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className='cursor-help'>Connected to Google Calendar</span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    Google Meet links will be automatically created and included in
                                    your meeting invitations
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          ) : (
                            <div className='space-y-2 animate-in fade-in duration-200'>
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
                    </div>
                  )}

                  {meetingType === 'phone' && (
                    <div className='mt-2 animate-in slide-in-from-top-2 duration-200'>
                      <Input
                        type='tel'
                        placeholder='Enter phone number (e.g., +1 234 567 8900)'
                        value={meetingTypeDetails?.phoneNumber || ''}
                        onChange={(e) => {
                          setMeetingTypeDetails({
                            ...meetingTypeDetails,
                            phoneNumber: e.target.value,
                          });
                        }}
                        className='mt-2 animate-in fade-in duration-200'
                      />
                    </div>
                  )}

                  {(meetingType === 'in-person' || meetingType === 'other') && (
                    <div className='mt-2 animate-in slide-in-from-top-2 duration-200'>
                      <Input
                        placeholder={
                          meetingType === 'in-person'
                            ? 'Enter physical meeting location'
                            : 'Specify meeting location or instructions'
                        }
                        value={meetingTypeDetails?.customLocation || ''}
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
              </div>

              <div className='space-y-2'>
                <Label>Participants</Label>
                <div className='space-y-4'>
                  {/* Selected Participants */}
                  <div className='min-h-[40px] transition-all duration-300'>
                    {selectedTeamMembers.length > 0 ? (
                      <div className='flex flex-wrap gap-1.5 p-2 border rounded-md bg-muted/30 transition-all duration-300 animate-in fade-in-0'>
                        {selectedTeamMembers.map((participantId) => {
                          const participant = project?.participants.find((p) => {
                            return p._id === participantId;
                          });
                          if (!participant) {
                            return (
                              <Badge
                                key={participantId}
                                variant='secondary'
                                className='flex items-center gap-1 px-2 py-0.5 text-xs transition-all duration-300 hover:bg-muted/50 animate-in slide-in-from-left-2'
                              >
                                <span className='font-medium'>{participantId}</span>
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveParticipant(participantId);
                                  }}
                                  className='ml-0.5 hover:text-destructive transition-all duration-300 cursor-pointer hover:scale-110'
                                >
                                  <X className='h-3 w-3' />
                                </div>
                              </Badge>
                            );
                          }

                          return (
                            <Badge
                              key={participantId}
                              variant='secondary'
                              className='flex items-center gap-1 px-2 py-0.5 text-xs transition-all duration-300 hover:bg-muted/50 animate-in slide-in-from-left-2'
                            >
                              <Avatar className='h-4 w-4 transition-transform duration-300 hover:scale-110'>
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
                              <span className='font-medium'>{participant.name}</span>
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveParticipant(participantId);
                                }}
                                className='ml-0.5 hover:text-destructive transition-all duration-300 cursor-pointer hover:scale-110'
                              >
                                <X className='h-3 w-3' />
                              </div>
                            </Badge>
                          );
                        })}
                      </div>
                    ) : (
                      <div className='flex items-center justify-center h-[40px] border rounded-md bg-muted/50 transition-all duration-300 animate-in fade-in-0'>
                        <p className='text-sm text-muted-foreground'>No participants added yet</p>
                      </div>
                    )}
                  </div>

                  {/* Participant Selection */}
                  <Popover
                    onOpenChange={(open) => {
                      if (!open) {
                        setSearchQuery('');
                      }
                    }}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant='outline'
                        className='w-full justify-start h-8 transition-all duration-200 hover:bg-accent/50'
                      >
                        <UserPlus className='mr-2 h-3.5 w-3.5 transition-transform duration-200 group-hover:scale-110' />
                        {selectedTeamMembers.length > 0
                          ? 'Add More Participants'
                          : 'Add Participants'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className='w-[var(--radix-popover-trigger-width)] p-0 text-sm animate-in slide-in-from-top-2 duration-200'
                      align='start'
                    >
                      <div className='space-y-2 p-3'>
                        <div className='flex items-center gap-2'>
                          <Input
                            placeholder='Search by name or email...'
                            value={searchQuery}
                            onChange={(e) => {
                              return setSearchQuery(e.target.value);
                            }}
                            className='flex-1 h-8 transition-all duration-200 focus:ring-2 focus:ring-primary/20'
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && searchQuery && !searchQuery.includes('@')) {
                                return;
                              }
                              if (
                                e.key === 'Enter' &&
                                searchQuery &&
                                !selectedTeamMembers.includes(searchQuery)
                              ) {
                                handleAddParticipant(searchQuery);
                                setSearchQuery('');
                              }
                            }}
                          />
                        </div>

                        <div className='max-h-[300px] overflow-y-auto'>
                          {filteredParticipants?.length === 0 ? (
                            <div className='flex flex-col items-center justify-center py-6 text-muted-foreground animate-in fade-in duration-200'>
                              <UserPlus className='h-6 w-6 mb-1.5' />
                              <p className='text-sm'>No participants found</p>
                              {searchQuery && (
                                <p className='text-xs mt-0.5'>
                                  Try adjusting your search or add an email manually
                                </p>
                              )}
                            </div>
                          ) : (
                            <>
                              {filteredParticipants?.map((participant) => {
                                const isSelected = selectedTeamMembers.includes(participant._id);
                                return (
                                  <div
                                    key={participant._id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (isSelected) {
                                        handleRemoveParticipant(participant._id);
                                      } else {
                                        handleAddParticipant(participant._id);
                                      }
                                    }}
                                    className={`w-full flex items-center gap-2 p-1.5 rounded transition-all duration-200 hover:bg-accent/50 cursor-pointer ${
                                      isSelected ? 'bg-accent' : ''
                                    }`}
                                  >
                                    <Avatar className='h-6 w-6 transition-transform duration-200 hover:scale-110'>
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
                                      <div className='text-sm font-medium'>{participant.name}</div>
                                      {participant.email && (
                                        <div className='text-xs text-muted-foreground'>
                                          {participant.email}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}

                              {searchQuery &&
                                searchQuery.includes('@') &&
                                !selectedTeamMembers.includes(searchQuery) && (
                                  <div
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAddParticipant(searchQuery);
                                      setSearchQuery('');
                                    }}
                                    className='text-sm w-full flex items-center gap-2 p-1.5 rounded transition-all duration-200 hover:bg-accent/50 cursor-pointer text-primary animate-in slide-in-from-bottom-2'
                                  >
                                    <UserPlus className='h-6 w-6 transition-transform duration-200 hover:scale-110' />
                                    <div className='flex-1 text-left'>
                                      <div className='font-medium'>Add {searchQuery}</div>
                                      <div className='text-xs text-muted-foreground'>
                                        External participant
                                      </div>
                                    </div>
                                  </div>
                                )}
                            </>
                          )}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className='space-y-6'>
            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label>Date Range</Label>
                <div className='flex items-center gap-2'>
                  <Popover
                    onOpenChange={(open) => {
                      if (!open) {
                        handleDateSelect(dateRange?.from);
                      }
                    }}
                  >
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
                  <Popover
                    onOpenChange={(open) => {
                      if (!open) {
                        handleDateSelect(dateRange?.to, true);
                      }
                    }}
                  >
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
                    <div>
                      <GoogleCalendarTimePicker
                        value={meetingStartTime}
                        onChange={setMeetingStartTime}
                      />
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <Label>End time</Label>
                    <div>
                      <GoogleCalendarTimePicker
                        value={selectedEndTime}
                        onChange={setSelectedEndTime}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className='flex items-center space-x-2'>
              <Checkbox id='all-day' checked={isAllDay} onCheckedChange={handleAllDayChange} />
              <Label htmlFor='all-day'>All day</Label>
            </div>
          </div>
        </div>

        <SheetFooter className='mt-1 border-t pt-3'>
          <Button
            variant='outline'
            onClick={() => {
              return onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleFormSubmit}>Create Meeting</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
