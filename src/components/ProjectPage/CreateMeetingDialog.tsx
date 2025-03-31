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
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useCreateMeeting } from './hooks/useCreateMeeting';
import { useGoogleIntegration } from './hooks/useGoogleIntegration';

type TeamMember = {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  availableTimes?: {
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
    videoPlatform?: string;
    customLocation?: string;
    phoneNumber?: string;
  };
  setMeetingTypeDetails: (details: {
    videoPlatform?: string;
    customLocation?: string;
    phoneNumber?: string;
  }) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isAllDay: boolean;
  setIsAllDay: (isAllDay: boolean) => void;
}

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
  searchQuery,
  setSearchQuery,
  isAllDay,
  setIsAllDay,
}: CreateMeetingDialogProps) {
  const { isConnecting, googleStatus, handleConnect } = useGoogleIntegration();
  const [hasInteracted, setHasInteracted] = useState(false);
  const [validatedFields, setValidatedFields] = useState<Set<string>>(new Set());
  const [blurredFields, setBlurredFields] = useState<Set<string>>(new Set());
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: selectedDate,
    to: selectedDate,
  });
  const [currentMonth, setCurrentMonth] = useState<Date>(selectedDate);
  const [selectedEndTime, setSelectedEndTime] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [showManualEmailInput, setShowManualEmailInput] = useState(false);
  const { project } = useProject();
  const [filteredParticipants, setFilteredParticipants] = useState<TeamMember[]>([]);

  // Update filtered participants when search query or project participants change
  useEffect(() => {
    if (!project?.participants) return;

    const searchLower = searchQuery.toLowerCase();
    const filtered = project.participants
      .map((p) => {
        return {
          _id: p._id,
          name: p.name,
          email: p.email || '',
          role: p.role,
          avatar: p.avatar,
          availableTimes: [],
        };
      })
      .filter((participant) => {
        return (
          participant.name.toLowerCase().includes(searchLower) ||
          participant.email.toLowerCase().includes(searchLower)
        );
      });
    setFilteredParticipants(filtered);
  }, [searchQuery, project?.participants]);

  // Initialize meetingTypeDetails when meetingType changes
  useEffect(() => {
    switch (meetingType) {
      case 'video':
        setMeetingTypeDetails({
          videoPlatform: 'google-meet',
          customLocation: '',
        });
        break;
      case 'phone':
        setMeetingTypeDetails({
          phoneNumber: '',
        });
        break;
      case 'in-person':
      case 'other':
        setMeetingTypeDetails({
          customLocation: '',
        });
        break;
      default:
        setMeetingTypeDetails({});
    }
  }, [meetingType, setMeetingTypeDetails]);

  const {
    step,
    showCalendar,
    handleAddParticipant,
    handleRemoveParticipant,
    handleAddManualEmail,
    handleNext,
    handleBack,
    handleSubmit,
    handleDateSelect,
    handleStartTimeSelect,
  } = useCreateMeeting({ selectedDate, onCreateMeeting });

  const handleFormSubmit = useCallback(
    async (e: React.FormEvent) => {
      await handleSubmit(e);
      onOpenChange(false);
    },
    [handleSubmit, onOpenChange],
  );

  // Add new memoized button disabled state
  const isButtonDisabled = useMemo(() => {
    // Check if all required fields have valid values
    const hasValidTitle = meetingTitle?.trim().length > 0;
    const hasValidMeetingType = meetingType?.length > 0;
    const hasValidDateRange = dateRange?.from && dateRange?.to && dateRange.to >= dateRange.from;
    const hasValidParticipants = selectedTeamMembers.length > 0;

    // Check meeting type specific requirements
    const hasValidMeetingTypeDetails = (() => {
      if (!meetingType) return false;
      switch (meetingType) {
        case 'video':
          return (
            meetingTypeDetails.videoPlatform === 'google-meet' ||
            (meetingTypeDetails.videoPlatform === 'custom' &&
              meetingTypeDetails.customLocation?.trim().length > 0)
          );
        case 'phone':
          return (
            meetingTypeDetails.phoneNumber?.trim().length > 0 &&
            /^\+?[1-9]\d{1,14}$/.test(meetingTypeDetails.phoneNumber.replace(/\s+/g, ''))
          );
        case 'in-person':
        case 'other':
          return meetingTypeDetails.customLocation?.trim().length > 0;
        default:
          return false;
      }
    })();

    // Check time requirements if not all-day
    const hasValidTime = isAllDay || (meetingStartTime?.length > 0 && selectedEndTime?.length > 0);

    return !(
      hasValidTitle &&
      hasValidMeetingType &&
      hasValidMeetingTypeDetails &&
      hasValidDateRange &&
      hasValidTime &&
      hasValidParticipants
    );
  }, [
    meetingTitle,
    meetingType,
    meetingTypeDetails,
    dateRange,
    meetingStartTime,
    selectedEndTime,
    selectedTeamMembers,
    isAllDay,
  ]);

  // Helper function to check if a field should show validation
  const shouldShowValidation = (field: string) => {
    return blurredFields.has(field);
  };

  // Add new memoized error messages for tooltip
  const errorMessages = useMemo(() => {
    if (!isButtonDisabled) return null;

    const messages: string[] = [];

    // Only show messages for fields that have been interacted with
    if (shouldShowValidation('title') && !meetingTitle?.trim()) {
      messages.push('Please enter a meeting title');
    }
    if (shouldShowValidation('meetingType') && !meetingType) {
      messages.push('Please select a meeting type');
    }
    if (
      shouldShowValidation('dateRange') &&
      (!dateRange?.from || !dateRange?.to || dateRange.to < dateRange.from)
    ) {
      messages.push('Please select a valid date range');
    }
    if (shouldShowValidation('startTime') && !isAllDay && !meetingStartTime) {
      messages.push('Please select start time');
    }
    if (shouldShowValidation('endTime') && !isAllDay && !selectedEndTime) {
      messages.push('Please select end time');
    }
    if (shouldShowValidation('participants') && selectedTeamMembers.length === 0) {
      messages.push('Please add at least one participant');
    }

    // Meeting type specific messages
    if (meetingType) {
      switch (meetingType) {
        case 'video':
          if (
            shouldShowValidation('customLocation') &&
            meetingTypeDetails.videoPlatform === 'custom' &&
            !meetingTypeDetails.customLocation?.trim()
          ) {
            messages.push('Please enter the video platform name');
          }
          break;
        case 'phone':
          if (shouldShowValidation('phoneNumber')) {
            if (!meetingTypeDetails.phoneNumber?.trim()) {
              messages.push('Please enter a phone number');
            } else if (
              !/^\+?[1-9]\d{1,14}$/.test(meetingTypeDetails.phoneNumber.replace(/\s+/g, ''))
            ) {
              messages.push('Please enter a valid phone number');
            }
          }
          break;
        case 'in-person':
        case 'other':
          if (
            shouldShowValidation('customLocation') &&
            !meetingTypeDetails.customLocation?.trim()
          ) {
            messages.push(
              meetingType === 'in-person'
                ? 'Please enter the physical meeting location'
                : 'Please specify meeting location or instructions',
            );
          }
          break;
      }
    }

    if (messages.length === 0) return null;

    return (
      <TooltipContent side='top' className='max-w-[300px] text-black  bg-gray-100'>
        <div className='space-y-1'>
          <p className='font-medium'>Missing required fields:</p>
          <ul className='text-sm space-y-0.5'>
            {messages.map((message, index) => {
              return (
                <li key={index} className='text-muted-foreground bg-gray-100 rounded-md p-1'>
                  {message}
                </li>
              );
            })}
          </ul>
        </div>
      </TooltipContent>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isButtonDisabled,
    meetingTitle,
    meetingType,
    meetingTypeDetails,
    dateRange,
    meetingStartTime,
    selectedEndTime,
    selectedTeamMembers,
    isAllDay,
    blurredFields,
  ]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='w-full overflow-y-auto min-w-[500px] flex flex-col'>
        <SheetHeader>
          <SheetTitle>Create Meeting</SheetTitle>
        </SheetHeader>

        <div
          className='flex-1 mt-6 space-y-8 overflow-y-auto p-1 scrollbar-hide'
          onFocus={() => {
            if (!hasInteracted) {
              setHasInteracted(true);
            }
          }}
        >
          {/* Step 1: Meeting Details */}
          <div className='space-y-6'>
            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label>Title</Label>
                <Input
                  value={meetingTitle}
                  onChange={(e) => {
                    setMeetingTitle(e.target.value);
                  }}
                  onBlur={() => {
                    setBlurredFields((prev) => {
                      return new Set([...prev, 'title']);
                    });
                  }}
                  placeholder='Add title'
                  className={`w-full ${
                    shouldShowValidation('title') && !meetingTitle?.trim() ? 'border-red-500' : ''
                  }`}
                />
              </div>

              <div className='space-y-2'>
                <Label>Description (optional)</Label>
                <Textarea
                  value={meetingDescription}
                  onChange={(e) => {
                    setMeetingDescription(e.target.value);
                  }}
                  placeholder='Add description'
                  className='w-full'
                />
              </div>

              <div className='space-y-2'>
                <Label>Meeting Type</Label>
                <Select
                  value={meetingType}
                  onValueChange={(value) => {
                    setMeetingType(value);
                    setBlurredFields((prev) => {
                      return new Set([...prev, 'meetingType']);
                    });
                  }}
                  onOpenChange={(open) => {
                    if (!open && !meetingType) {
                      setMeetingType('');
                      setBlurredFields((prev) => {
                        return new Set([...prev, 'meetingType']);
                      });
                    }
                  }}
                >
                  <SelectTrigger
                    className={
                      shouldShowValidation('meetingType') && !meetingType ? 'border-red-500' : ''
                    }
                  >
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
                        value={meetingTypeDetails.videoPlatform}
                        onValueChange={(value) => {
                          setMeetingTypeDetails({
                            ...meetingTypeDetails,
                            videoPlatform: value,
                          });
                          setBlurredFields((prev) => {
                            return new Set([...prev, 'videoPlatform']);
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
                      {meetingTypeDetails.videoPlatform === 'custom' && (
                        <div className='mt-2 animate-in fade-in duration-200'>
                          <Input
                            placeholder='Enter video platform name'
                            value={meetingTypeDetails.customLocation}
                            onChange={(e) => {
                              setMeetingTypeDetails({
                                ...meetingTypeDetails,
                                customLocation: e.target.value,
                              });
                            }}
                            onBlur={() => {
                              setBlurredFields((prev) => {
                                return new Set([...prev, 'customLocation']);
                              });
                            }}
                            className={`mt-2 animate-in fade-in duration-200 ${
                              shouldShowValidation('customLocation') &&
                              meetingTypeDetails.videoPlatform === 'custom' &&
                              !meetingTypeDetails.customLocation?.trim()
                                ? 'border-red-500'
                                : ''
                            }`}
                          />
                        </div>
                      )}
                      {meetingTypeDetails.videoPlatform === 'google-meet' && (
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
                        value={meetingTypeDetails.phoneNumber}
                        onChange={(e) => {
                          setMeetingTypeDetails({
                            ...meetingTypeDetails,
                            phoneNumber: e.target.value,
                          });
                        }}
                        onBlur={() => {
                          setBlurredFields((prev) => {
                            return new Set([...prev, 'phoneNumber']);
                          });
                        }}
                        className={`mt-2 animate-in fade-in duration-200 ${
                          shouldShowValidation('phoneNumber') &&
                          (!meetingTypeDetails.phoneNumber?.trim() ||
                            !/^\+?[1-9]\d{1,14}$/.test(
                              meetingTypeDetails.phoneNumber.replace(/\s+/g, ''),
                            ))
                            ? 'border-red-500'
                            : ''
                        }`}
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
                        value={meetingTypeDetails.customLocation}
                        onChange={(e) => {
                          setMeetingTypeDetails({
                            ...meetingTypeDetails,
                            customLocation: e.target.value,
                          });
                        }}
                        onBlur={() => {
                          setBlurredFields((prev) => {
                            return new Set([...prev, 'customLocation']);
                          });
                        }}
                        className={
                          shouldShowValidation('customLocation') &&
                          !meetingTypeDetails.customLocation?.trim()
                            ? 'border-red-500'
                            : ''
                        }
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
                          console.log('🚀 selectedTeamMembers:', selectedTeamMembers);
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
                                    console.log('Removing participant:', participantId);
                                    console.log(
                                      'Current selectedTeamMembers:',
                                      selectedTeamMembers,
                                    );
                                    setSelectedTeamMembers(
                                      selectedTeamMembers.filter((id) => {
                                        return id !== participantId;
                                      }),
                                    );
                                    console.log(
                                      'After removal - selectedTeamMembers:',
                                      selectedTeamMembers,
                                    );
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
                                  console.log('Removing participant:', participantId);
                                  console.log('Current selectedTeamMembers:', selectedTeamMembers);
                                  setSelectedTeamMembers(
                                    selectedTeamMembers.filter((id) => {
                                      return id !== participantId;
                                    }),
                                  );
                                  console.log(
                                    'After removal - selectedTeamMembers:',
                                    selectedTeamMembers,
                                  );
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
                      <div
                        className={`flex items-center justify-center h-[40px] border rounded-md bg-muted/50 transition-all duration-300 animate-in fade-in-0 ${
                          shouldShowValidation('participants') && !selectedTeamMembers.length
                            ? 'border-red-500'
                            : ''
                        }`}
                      >
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
                                setSelectedTeamMembers([...selectedTeamMembers, searchQuery]);
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
                                        setSelectedTeamMembers(
                                          selectedTeamMembers.filter((id) => {
                                            return id !== participant._id;
                                          }),
                                        );
                                      } else {
                                        setSelectedTeamMembers([
                                          ...selectedTeamMembers,
                                          participant._id,
                                        ]);
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
                                    <Checkbox
                                      checked={isSelected}
                                      className='h-3.5 w-3.5 transition-all duration-200 hover:scale-110'
                                    />
                                  </div>
                                );
                              })}

                              {searchQuery &&
                                searchQuery.includes('@') &&
                                !selectedTeamMembers.includes(searchQuery) && (
                                  <div
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedTeamMembers([...selectedTeamMembers, searchQuery]);
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

          {/* Step 2: Date & Time */}
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
                      <Button
                        variant='outline'
                        className={`w-full justify-start font-normal ${
                          shouldShowValidation('dateRange') &&
                          (!dateRange?.from || !dateRange?.to || dateRange.to < dateRange.from)
                            ? 'border-red-500'
                            : ''
                        }`}
                      >
                        <Calendar className='mr-2 h-4 w-4' />
                        {format(dateRange?.from || selectedDate, 'MMM d, yyyy')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-[300px] p-0' align='start'>
                      <CalendarComponent
                        mode='single'
                        selected={dateRange?.from}
                        onSelect={(date) => {
                          handleDateSelect(date);
                          setBlurredFields((prev) => {
                            return new Set([...prev, 'dateRange']);
                          });
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
                      <Button
                        variant='outline'
                        className={`w-full justify-start font-normal ${
                          shouldShowValidation('dateRange') &&
                          (!dateRange?.from || !dateRange?.to || dateRange.to < dateRange.from)
                            ? 'border-red-500'
                            : ''
                        }`}
                      >
                        <Calendar className='mr-2 h-4 w-4' />
                        {format(dateRange?.to || selectedDate, 'MMM d, yyyy')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-[300px] p-0' align='start'>
                      <CalendarComponent
                        mode='single'
                        selected={dateRange?.to}
                        onSelect={(date) => {
                          handleDateSelect(date, true);
                          setBlurredFields((prev) => {
                            return new Set([...prev, 'dateRange']);
                          });
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
                    <div
                      className={
                        shouldShowValidation('startTime') && !meetingStartTime
                          ? 'border border-red-500 rounded-md'
                          : ''
                      }
                    >
                      <GoogleCalendarTimePicker
                        value={meetingStartTime}
                        onChange={(value) => {
                          setMeetingStartTime(value);
                          setBlurredFields((prev) => {
                            return new Set([...prev, 'startTime']);
                          });
                        }}
                      />
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <Label>End time</Label>
                    <div
                      className={
                        shouldShowValidation('endTime') && !selectedEndTime
                          ? 'border border-red-500 rounded-md'
                          : ''
                      }
                    >
                      <GoogleCalendarTimePicker
                        value={selectedEndTime}
                        onChange={(value) => {
                          setSelectedEndTime(value);
                          setBlurredFields((prev) => {
                            return new Set([...prev, 'endTime']);
                          });
                        }}
                      />
                    </div>
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
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Button onClick={handleFormSubmit} disabled={isButtonDisabled}>
                  Create Meeting
                </Button>
              </div>
            </TooltipTrigger>
            {errorMessages}
          </Tooltip>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
