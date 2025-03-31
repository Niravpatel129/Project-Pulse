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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasInteracted, setHasInteracted] = useState(false);
  const [validatedFields, setValidatedFields] = useState<Set<string>>(new Set());
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: selectedDate,
    to: selectedDate,
  });
  const [currentMonth, setCurrentMonth] = useState<Date>(selectedDate);
  const [selectedEndTime, setSelectedEndTime] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [showManualEmailInput, setShowManualEmailInput] = useState(false);
  const [filteredParticipants, setFilteredParticipants] = useState<TeamMember[]>([]);

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

  const { project } = useProject();

  const validateForm = useCallback(() => {
    if (!hasInteracted) return true;

    const newErrors: Record<string, string> = {};

    // Only validate fields that have been interacted with
    if (validatedFields.has('title') && !meetingTitle?.trim()) {
      newErrors.title = 'Please enter a meeting title';
    }

    if (validatedFields.has('meetingType')) {
      if (!meetingType) {
        newErrors.meetingType = 'Please select a meeting type';
      } else {
        // Validate meeting type specific details only if the type has been selected
        switch (meetingType) {
          case 'video':
            if (
              meetingTypeDetails.videoPlatform === 'custom' &&
              !meetingTypeDetails.customLocation?.trim()
            ) {
              newErrors.customLocation = 'Please enter the video platform name';
            }
            break;
          case 'phone':
            if (!meetingTypeDetails.phoneNumber?.trim()) {
              newErrors.phoneNumber = 'Please enter a phone number';
            } else if (
              !/^\+?[1-9]\d{1,14}$/.test(meetingTypeDetails.phoneNumber.replace(/\s+/g, ''))
            ) {
              newErrors.phoneNumber = 'Please enter a valid phone number';
            }
            break;
          case 'in-person':
          case 'other':
            if (!meetingTypeDetails.customLocation?.trim()) {
              newErrors.customLocation =
                meetingType === 'in-person'
                  ? 'Please enter the physical meeting location'
                  : 'Please specify meeting location or instructions';
            }
            break;
        }
      }
    }

    if (validatedFields.has('dateRange')) {
      if (!dateRange?.from || !dateRange?.to) {
        newErrors.dateRange = 'Please select a date range';
      } else if (dateRange.to < dateRange.from) {
        newErrors.dateRange = 'End date must be after start date';
      }
    }

    // Time validation only if date range has been validated
    if (
      validatedFields.has('dateRange') &&
      !isAllDay &&
      meetingType &&
      dateRange?.from &&
      dateRange?.to
    ) {
      if (!meetingStartTime) {
        newErrors.startTime = 'Please select a start time';
      }
      if (!selectedEndTime) {
        newErrors.endTime = 'Please select an end time';
      }
    }

    if (validatedFields.has('participants') && selectedTeamMembers.length === 0) {
      newErrors.participants = 'Please add at least one participant';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [
    meetingTitle,
    meetingType,
    meetingTypeDetails,
    dateRange,
    meetingStartTime,
    selectedEndTime,
    selectedTeamMembers,
    isAllDay,
    hasInteracted,
    validatedFields,
  ]);

  // Handle field validation
  const handleFieldValidation = useCallback(
    (field: string) => {
      setValidatedFields((prev) => {
        return new Set([...prev, field]);
      });
      if (!hasInteracted) {
        setHasInteracted(true);
      }
    },
    [hasInteracted],
  );

  // Optimize validation effect with debounce
  useEffect(() => {
    if (!hasInteracted) return;

    const timeoutId = setTimeout(() => {
      validateForm();
    }, 300); // 300ms debounce

    return () => {
      return clearTimeout(timeoutId);
    };
  }, [validateForm, hasInteracted]);

  const handleFormSubmit = useCallback(
    async (e: React.FormEvent) => {
      if (!validateForm()) {
        return;
      }
      await handleSubmit(e);
      onOpenChange(false);
    },
    [validateForm, handleSubmit, onOpenChange],
  );

  // Memoize error messages rendering
  const errorMessages = useMemo(() => {
    if (Object.keys(errors).length === 0) return null;

    return (
      <TooltipContent side='top' className='max-w-[300px]'>
        <div className='space-y-1'>
          <p className='font-medium'>Missing required fields:</p>
          <ul className='text-sm space-y-0.5'>
            {Object.entries(errors).map(([field, message]) => {
              return (
                <li key={field} className='text-muted-foreground bg-gray-100 rounded-md p-1'>
                  {message}
                </li>
              );
            })}
          </ul>
        </div>
      </TooltipContent>
    );
  }, [errors]);

  // Memoize button disabled state
  const isButtonDisabled = useMemo(() => {
    return Object.keys(errors).length > 0;
  }, [errors]);

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
                    handleFieldValidation('title');
                    if (errors.title) {
                      setErrors({ ...errors, title: '' });
                    }
                  }}
                  onBlur={() => {
                    handleFieldValidation('title');
                    if (!meetingTitle.trim()) {
                      setErrors({ ...errors, title: 'Please enter a meeting title' });
                    }
                  }}
                  placeholder='Add title'
                  className={`w-full ${errors.title ? 'border-red-500' : ''}`}
                />
                {errors.title && <p className='text-sm text-red-500'>{errors.title}</p>}
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
                    handleFieldValidation('meetingType');
                    if (errors.meetingType) {
                      setErrors({ ...errors, meetingType: '' });
                    }
                  }}
                  onOpenChange={(open) => {
                    if (!open && !meetingType) {
                      handleFieldValidation('meetingType');
                      setErrors({ ...errors, meetingType: 'Please select a meeting type' });
                    }
                  }}
                >
                  <SelectTrigger className={errors.meetingType ? 'border-red-500' : ''}>
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
                {errors.meetingType && <p className='text-sm text-red-500'>{errors.meetingType}</p>}

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
                          if (errors.customLocation) {
                            setErrors({ ...errors, customLocation: '' });
                          }
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
                              if (errors.customLocation) {
                                setErrors({ ...errors, customLocation: '' });
                              }
                            }}
                            onBlur={() => {
                              if (!meetingTypeDetails.customLocation?.trim()) {
                                setErrors({
                                  ...errors,
                                  customLocation: 'Please enter the video platform name',
                                });
                              }
                            }}
                            className={`mt-2 animate-in fade-in duration-200 ${
                              errors.customLocation ? 'border-red-500' : ''
                            }`}
                          />
                          {errors.customLocation && (
                            <p className='text-sm text-red-500 mt-1'>{errors.customLocation}</p>
                          )}
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
                          if (errors.phoneNumber) {
                            setErrors({ ...errors, phoneNumber: '' });
                          }
                        }}
                        onBlur={() => {
                          if (!meetingTypeDetails.phoneNumber?.trim()) {
                            setErrors({ ...errors, phoneNumber: 'Please enter a phone number' });
                          } else if (
                            !/^\+?[1-9]\d{1,14}$/.test(
                              meetingTypeDetails.phoneNumber.replace(/\s+/g, ''),
                            )
                          ) {
                            setErrors({
                              ...errors,
                              phoneNumber: 'Please enter a valid phone number',
                            });
                          }
                        }}
                        className={`mt-2 animate-in fade-in duration-200 ${
                          errors.phoneNumber ? 'border-red-500' : ''
                        }`}
                      />
                      {errors.phoneNumber && (
                        <p className='text-sm text-red-500 mt-1'>{errors.phoneNumber}</p>
                      )}
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
                          if (errors.customLocation) {
                            setErrors({ ...errors, customLocation: '' });
                          }
                        }}
                        onBlur={() => {
                          if (!meetingTypeDetails.customLocation?.trim()) {
                            setErrors({
                              ...errors,
                              customLocation:
                                meetingType === 'in-person'
                                  ? 'Please enter the physical meeting location'
                                  : 'Please specify meeting location or instructions',
                            });
                          }
                        }}
                        className={errors.customLocation ? 'border-red-500' : ''}
                      />
                      {errors.customLocation && (
                        <p className='text-sm text-red-500 mt-1'>{errors.customLocation}</p>
                      )}
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
                                  onClick={() => {
                                    return handleRemoveParticipant(participantId);
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
                                onClick={() => {
                                  return handleRemoveParticipant(participantId);
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
                          errors.participants ? 'border-red-500' : ''
                        }`}
                      >
                        <p className='text-sm text-muted-foreground'>No participants added yet</p>
                      </div>
                    )}
                  </div>
                  {errors.participants && (
                    <p className='text-sm text-red-500'>{errors.participants}</p>
                  )}

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
                                if (errors.participants) {
                                  setErrors({ ...errors, participants: '' });
                                }
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
                                  <button
                                    key={participant._id}
                                    onClick={() => {
                                      if (isSelected) {
                                        handleRemoveParticipant(participant._id);
                                      } else {
                                        handleAddParticipant(participant._id);
                                        if (errors.participants) {
                                          setErrors({ ...errors, participants: '' });
                                        }
                                      }
                                    }}
                                    className={`w-full flex items-center gap-2 p-1.5 rounded transition-all duration-200 hover:bg-accent/50 ${
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
                                  </button>
                                );
                              })}

                              {searchQuery &&
                                searchQuery.includes('@') &&
                                !selectedTeamMembers.includes(searchQuery) && (
                                  <button
                                    onClick={() => {
                                      setSelectedTeamMembers([...selectedTeamMembers, searchQuery]);
                                      setSearchQuery('');
                                      if (errors.participants) {
                                        setErrors({ ...errors, participants: '' });
                                      }
                                    }}
                                    className='text-sm w-full flex items-center gap-2 p-1.5 rounded transition-all duration-200 hover:bg-accent/50 text-primary animate-in slide-in-from-bottom-2'
                                  >
                                    <UserPlus className='h-6 w-6 transition-transform duration-200 hover:scale-110' />
                                    <div className='flex-1 text-left'>
                                      <div className='font-medium'>Add {searchQuery}</div>
                                      <div className='text-xs text-muted-foreground'>
                                        External participant
                                      </div>
                                    </div>
                                  </button>
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
                          errors.dateRange ? 'border-red-500' : ''
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
                          if (errors.dateRange) {
                            setErrors({ ...errors, dateRange: '' });
                          }
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
                          errors.dateRange ? 'border-red-500' : ''
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
                          if (errors.dateRange) {
                            setErrors({ ...errors, dateRange: '' });
                          }
                        }}
                        className=''
                        month={currentMonth}
                        onMonthChange={setCurrentMonth}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                {errors.dateRange && <p className='text-sm text-red-500'>{errors.dateRange}</p>}
              </div>

              {!isAllDay && (
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label>Start time</Label>
                    <div className={errors.startTime ? 'border border-red-500 rounded-md' : ''}>
                      <GoogleCalendarTimePicker
                        value={meetingStartTime}
                        onChange={(value) => {
                          setMeetingStartTime(value);
                          if (errors.startTime) {
                            setErrors({ ...errors, startTime: '' });
                          }
                        }}
                      />
                    </div>
                    {errors.startTime && <p className='text-sm text-red-500'>{errors.startTime}</p>}
                  </div>
                  <div className='space-y-2'>
                    <Label>End time</Label>
                    <div className={errors.endTime ? 'border border-red-500 rounded-md' : ''}>
                      <GoogleCalendarTimePicker
                        value={selectedEndTime}
                        onChange={(value) => {
                          setSelectedEndTime(value);
                          if (errors.endTime) {
                            setErrors({ ...errors, endTime: '' });
                          }
                        }}
                      />
                    </div>
                    {errors.endTime && <p className='text-sm text-red-500'>{errors.endTime}</p>}
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
                    setErrors({ ...errors, startTime: '', endTime: '' });
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
                <Button
                  onClick={handleFormSubmit}
                  disabled={hasInteracted && Object.keys(errors).length > 0}
                >
                  Create Meeting
                </Button>
              </div>
            </TooltipTrigger>
            {hasInteracted && errorMessages}
          </Tooltip>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
