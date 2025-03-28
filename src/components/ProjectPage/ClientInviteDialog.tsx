import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useProject } from '@/contexts/ProjectContext';
import { cn } from '@/lib/utils';
import { newRequest } from '@/utils/newRequest';
import { useMutation, useQuery } from '@tanstack/react-query';
import { addHours, isBefore, isValid } from 'date-fns';
import { Check, ChevronsUpDown, Info, Loader2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

type Participant = {
  _id: string;
  name: string;
  email?: string;
  role: string;
  avatar?: string;
  status?: string;
};

type ClientInviteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName?: string;
  participants: Participant[];
};

type IntegrationStatus = {
  isConnected: boolean;
  platform: 'google' | 'zoom';
};

type ClientMultiSelectProps = {
  participants: Participant[];
  selectedEmails: string[];
  onChange: (emails: string[]) => void;
  disabled?: boolean;
  error?: string;
};

function ClientMultiSelect({
  participants,
  selectedEmails,
  onChange,
  disabled,
  error,
}: ClientMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredParticipants = participants.filter((participant) => {
    return participant.email?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const toggleEmail = (email: string) => {
    if (selectedEmails.includes(email)) {
      onChange(
        selectedEmails.filter((e) => {
          return e !== email;
        }),
      );
    } else {
      onChange([...selectedEmails, email]);
    }
  };

  return (
    <div className='relative space-y-2' ref={containerRef}>
      <div
        className={cn(
          'relative flex min-h-[2.5rem] w-full flex-wrap items-center gap-1 rounded-md border border-input bg-background px-2 py-1.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
          error && 'border-red-500',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        {selectedEmails.length === 0 ? (
          <span className='text-muted-foreground px-2'>Select clients to invite</span>
        ) : (
          <>
            {selectedEmails.map((email) => {
              return (
                <Badge key={email} variant='secondary' className='flex items-center gap-1'>
                  {email}
                  <button
                    type='button'
                    className='ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5'
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange(
                        selectedEmails.filter((e) => {
                          return e !== email;
                        }),
                      );
                    }}
                    disabled={disabled}
                  >
                    <X className='h-3 w-3' />
                  </button>
                </Badge>
              );
            })}
          </>
        )}
        <button
          type='button'
          className='absolute right-2 top-1/2 -translate-y-1/2'
          onClick={() => {
            return setIsOpen(!isOpen);
          }}
          disabled={disabled}
        >
          <ChevronsUpDown className='h-4 w-4 opacity-50' />
        </button>
      </div>

      {isOpen && (
        <div className='absolute left-0 right-0 z-50 mt-1 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in'>
          <div className='p-1'>
            <Input
              placeholder='Search clients...'
              value={searchQuery}
              onChange={(e) => {
                return setSearchQuery(e.target.value);
              }}
              className='mb-1'
            />
            <ScrollArea className='max-h-[200px]'>
              <div className='space-y-1'>
                {filteredParticipants.length === 0 ? (
                  <div className='py-2 text-center text-sm text-muted-foreground'>
                    No clients found
                  </div>
                ) : (
                  filteredParticipants.map((participant) => {
                    return (
                      <button
                        key={participant._id}
                        type='button'
                        className={cn(
                          'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground',
                          selectedEmails.includes(participant.email) && 'bg-accent',
                        )}
                        onClick={() => {
                          return participant.email && toggleEmail(participant.email);
                        }}
                      >
                        <Check
                          className={cn(
                            'h-4 w-4',
                            participant.email && selectedEmails.includes(participant.email)
                              ? 'opacity-100'
                              : 'opacity-0',
                          )}
                        />
                        <span className='flex-1 text-left'>
                          {participant.email || 'No email available'}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      )}
      {error && <p className='text-sm text-red-500'>{error}</p>}
    </div>
  );
}

export default function ClientInviteDialog({
  open,
  onOpenChange,
  projectName,
  participants,
}: ClientInviteDialogProps) {
  const [startDateRange, setStartDateRange] = useState<Date | undefined>(new Date());
  const [endDateRange, setEndDateRange] = useState<Date | undefined>(addHours(new Date(), 30 * 24));
  const [selectedClientEmails, setSelectedClientEmails] = useState<string[]>([]);
  const [meetingPurpose, setMeetingPurpose] = useState<string>('');
  const [meetingLocation, setMeetingLocation] = useState<string>('video');
  const [videoPlatform, setVideoPlatform] = useState<string>('zoom');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [phoneNumberType, setPhoneNumberType] = useState<string>('client-provided');
  const [customLocation, setCustomLocation] = useState<string>('');
  const [meetingDuration, setMeetingDuration] = useState<string>('60');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { project } = useProject();
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  // Reset irrelevant fields when meeting location changes
  useEffect(() => {
    setErrors({});
    switch (meetingLocation) {
      case 'video':
        setPhoneNumber('');
        setPhoneNumberType('client-provided');
        break;
      case 'phone':
        setVideoPlatform('zoom');
        setCustomLocation('');
        break;
      case 'in-person':
      case 'other':
        setVideoPlatform('zoom');
        setPhoneNumber('');
        setPhoneNumberType('client-provided');
        break;
    }
  }, [meetingLocation]);

  // Check integration status
  const { data: googleStatus } = useQuery({
    queryKey: ['google-integration'],
    queryFn: async () => {
      const response = await newRequest.get('/integrations/google/status');
      return response.data as IntegrationStatus;
    },
  });

  const { data: zoomStatus } = useQuery({
    queryKey: ['zoom-integration'],
    queryFn: async () => {
      const response = await newRequest.get('/integrations/zoom/status');
      return response.data as IntegrationStatus;
    },
  });

  // Mock connection mutation
  const connectMutation = useMutation({
    mutationFn: async (platform: 'google' | 'zoom') => {
      setIsConnecting(true);
      // Simulate API call
      await new Promise((resolve) => {
        return setTimeout(resolve, 2000);
      });
      return { success: true, platform };
    },
    onSuccess: (data) => {
      toast.success(`${data.platform === 'google' ? 'Google' : 'Zoom'} connected successfully`);
      setIsConnecting(false);
    },
    onError: () => {
      toast.error('Failed to connect. Please try again.');
      setIsConnecting(false);
    },
  });

  const handleConnect = (platform: 'google' | 'zoom') => {
    connectMutation.mutate(platform);
  };

  const validatePhoneNumber = (number: string): boolean => {
    // Basic international phone number validation
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(number.replace(/\s+/g, ''));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (selectedClientEmails.length === 0) {
      newErrors.clientEmail = 'Please select at least one client';
    }

    if (!meetingPurpose.trim()) {
      newErrors.meetingPurpose = 'Please enter a meeting purpose';
    }

    if (!startDateRange || !isValid(startDateRange)) {
      newErrors.startDate = 'Please select a valid start date';
    }

    if (!endDateRange || !isValid(endDateRange)) {
      newErrors.endDate = 'Please select a valid end date';
    }

    if (startDateRange && endDateRange && isBefore(endDateRange, startDateRange)) {
      newErrors.dateRange = 'End date must be after start date';
    }

    if (meetingLocation === 'video' && videoPlatform === 'custom' && !customLocation.trim()) {
      newErrors.customLocation = 'Please enter the video platform name';
    }

    if (
      meetingLocation === 'phone' &&
      phoneNumberType === 'custom' &&
      !validatePhoneNumber(phoneNumber)
    ) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    if (
      (meetingLocation === 'in-person' || meetingLocation === 'other') &&
      !customLocation.trim()
    ) {
      newErrors.customLocation = 'Please enter the location details';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setStartDateRange(new Date());
    setEndDateRange(addHours(new Date(), 30 * 24));
    setSelectedClientEmails([]);
    setMeetingPurpose('');
    setMeetingLocation('video');
    setVideoPlatform('zoom');
    setPhoneNumber('');
    setPhoneNumberType('client-provided');
    setCustomLocation('');
    setMeetingDuration('60');
    setErrors({});
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await newRequest.post('/schedule/invite', {
        clientEmails: selectedClientEmails,
        meetingPurpose,
        meetingDuration,
        startDateRange,
        endDateRange,
        projectId: project?._id,
        meetingLocation,
        ...(meetingLocation === 'video' && {
          videoPlatform,
          customLocation: videoPlatform === 'custom' ? customLocation : undefined,
        }),
        ...(meetingLocation === 'phone' && {
          phoneNumberType,
          phoneNumber: phoneNumberType === 'custom' ? phoneNumber : undefined,
        }),
        ...((meetingLocation === 'in-person' || meetingLocation === 'other') && {
          customLocation,
        }),
      });

      toast.success(
        `Invitation sent to ${selectedClientEmails.length} client${
          selectedClientEmails.length > 1 ? 's' : ''
        }`,
      );
      onOpenChange(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to send invitation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormDisabled = isSubmitting || isConnecting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px] max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Send Client Invite</DialogTitle>
          <DialogDescription>
            Allow your clients to book a meeting from your available times
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSendInvite}>
          <div className='grid gap-6 py-4'>
            {/* Client Selection Section */}
            <div className='space-y-4'>
              <div className='flex items-center gap-2'>
                <Label htmlFor='clientEmail'>Client Selection</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className='cursor-help'>
                      <Info className='h-4 w-4 text-muted-foreground' />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Select one or more clients to invite</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <ClientMultiSelect
                participants={participants}
                selectedEmails={selectedClientEmails}
                onChange={setSelectedClientEmails}
                disabled={isFormDisabled}
                error={errors.clientEmail}
              />
            </div>

            {/* Meeting Details Section */}
            <div className='space-y-4'>
              <div className='flex items-center gap-2'>
                <Label>Meeting Details</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className='cursor-help'>
                      <Info className='h-4 w-4 text-muted-foreground' />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Set the meeting schedule and purpose</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              <div className='grid gap-2'>
                <Label>Date Range</Label>
                <div className='flex flex-col sm:flex-row items-center gap-2'>
                  <div className='w-full'>
                    <DatePicker
                      date={startDateRange}
                      setDate={setStartDateRange}
                      placeholder='Start date'
                      minDate={new Date()}
                      maxDate={endDateRange}
                      className={errors.startDate ? 'border-red-500' : ''}
                      disabled={isFormDisabled}
                    />
                    {errors.startDate && <p className='text-sm text-red-500'>{errors.startDate}</p>}
                  </div>
                  <span className='hidden sm:inline'>to</span>
                  <span className='inline sm:hidden my-1'>to</span>
                  <div className='w-full'>
                    <DatePicker
                      date={endDateRange}
                      setDate={setEndDateRange}
                      placeholder='End date'
                      minDate={startDateRange || new Date()}
                      className={errors.endDate ? 'border-red-500' : ''}
                      disabled={isFormDisabled}
                    />
                    {errors.endDate && <p className='text-sm text-red-500'>{errors.endDate}</p>}
                  </div>
                </div>
                {errors.dateRange && <p className='text-sm text-red-500'>{errors.dateRange}</p>}
              </div>

              <div className='grid gap-2'>
                <Label htmlFor='meetingPurpose'>Meeting Purpose</Label>
                <Input
                  id='meetingPurpose'
                  value={meetingPurpose}
                  onChange={(e) => {
                    return setMeetingPurpose(e.target.value);
                  }}
                  placeholder={`Discuss ${projectName || 'project'} details`}
                  className={errors.meetingPurpose ? 'border-red-500' : ''}
                  disabled={isFormDisabled}
                />
                {errors.meetingPurpose && (
                  <p className='text-sm text-red-500'>{errors.meetingPurpose}</p>
                )}
              </div>
            </div>

            {/* Meeting Location Section */}
            <div className='space-y-4'>
              <div className='flex items-center gap-2'>
                <Label>Meeting Location</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className='cursor-help'>
                      <Info className='h-4 w-4 text-muted-foreground' />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Choose how you want to meet</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              <Select
                value={meetingLocation}
                onValueChange={setMeetingLocation}
                disabled={isFormDisabled}
              >
                <SelectTrigger id='meetingLocation'>
                  <SelectValue placeholder='Select meeting location' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='video'>Video Call</SelectItem>
                  <SelectItem value='phone'>Phone Call</SelectItem>
                  <SelectItem value='in-person'>In Person</SelectItem>
                  <SelectItem value='other'>Other</SelectItem>
                </SelectContent>
              </Select>

              {meetingLocation === 'video' && (
                <div className='grid gap-2'>
                  <Label htmlFor='videoPlatform'>Video Platform</Label>
                  <Select value={videoPlatform} onValueChange={setVideoPlatform}>
                    <SelectTrigger id='videoPlatform'>
                      <SelectValue placeholder='Select video platform' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='zoom'>Zoom</SelectItem>
                      <SelectItem value='google-meet'>Google Meet</SelectItem>
                      <SelectItem value='custom'>Other Platform</SelectItem>
                    </SelectContent>
                  </Select>
                  {videoPlatform === 'google-meet' && (
                    <div className='space-y-2'>
                      {googleStatus?.isConnected ? (
                        <div className='flex items-center gap-2 text-sm text-green-600'>
                          <span>✓</span>
                          <span>Connected to Google Calendar</span>
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
                  {videoPlatform === 'zoom' && (
                    <div className='space-y-2'>
                      {zoomStatus?.isConnected ? (
                        <div className='flex items-center gap-2 text-sm text-green-600'>
                          <span>✓</span>
                          <span>Connected to Zoom</span>
                        </div>
                      ) : (
                        <div className='space-y-2'>
                          <p className='text-sm text-muted-foreground'>
                            Connect your Zoom account to schedule meetings directly
                          </p>
                          <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            onClick={() => {
                              return handleConnect('zoom');
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
                              'Connect Zoom'
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                  {videoPlatform === 'custom' && (
                    <div>
                      <Input
                        placeholder='Enter video platform name'
                        value={customLocation}
                        onChange={(e) => {
                          return setCustomLocation(e.target.value);
                        }}
                        className={errors.customLocation ? 'border-red-500' : ''}
                      />
                      {errors.customLocation && (
                        <p className='text-sm text-red-500'>{errors.customLocation}</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {meetingLocation === 'phone' && (
                <div className='grid gap-2'>
                  <Label htmlFor='phoneNumberType'>Phone Number</Label>
                  <Select value={phoneNumberType} onValueChange={setPhoneNumberType}>
                    <SelectTrigger id='phoneNumberType'>
                      <SelectValue placeholder='Select phone number source' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='client-provided'>
                        Client will provide their number
                      </SelectItem>
                      <SelectItem value='custom'>Specify a number</SelectItem>
                    </SelectContent>
                  </Select>
                  {phoneNumberType === 'custom' && (
                    <div className='space-y-2'>
                      <Input
                        type='tel'
                        placeholder='Enter phone number (e.g., +1 234 567 8900)'
                        value={phoneNumber}
                        onChange={(e) => {
                          return setPhoneNumber(e.target.value);
                        }}
                        className={errors.phoneNumber ? 'border-red-500' : ''}
                      />
                      {errors.phoneNumber && (
                        <p className='text-sm text-red-500'>{errors.phoneNumber}</p>
                      )}
                      <p className='text-sm text-muted-foreground'>
                        Please include country code for international numbers
                      </p>
                    </div>
                  )}
                </div>
              )}

              {meetingLocation === 'in-person' && (
                <div className='grid gap-2'>
                  <Label htmlFor='inPersonLocation'>Meeting Location</Label>
                  <Input
                    id='inPersonLocation'
                    placeholder='Enter physical meeting location'
                    value={customLocation}
                    onChange={(e) => {
                      return setCustomLocation(e.target.value);
                    }}
                    className={errors.customLocation ? 'border-red-500' : ''}
                  />
                  {errors.customLocation && (
                    <p className='text-sm text-red-500'>{errors.customLocation}</p>
                  )}
                </div>
              )}

              {meetingLocation === 'other' && (
                <div className='grid gap-2'>
                  <Label htmlFor='customLocation'>Meeting Details</Label>
                  <Input
                    id='customLocation'
                    placeholder='Specify meeting location or instructions'
                    value={customLocation}
                    onChange={(e) => {
                      return setCustomLocation(e.target.value);
                    }}
                    className={errors.customLocation ? 'border-red-500' : ''}
                  />
                  {errors.customLocation && (
                    <p className='text-sm text-red-500'>{errors.customLocation}</p>
                  )}
                </div>
              )}
            </div>

            {/* Meeting Duration Section */}
            <div className='space-y-4'>
              <div className='flex items-center gap-2'>
                <Label htmlFor='meetingDuration'>Meeting Duration</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className='cursor-help'>
                      <Info className='h-4 w-4 text-muted-foreground' />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Set the expected meeting duration</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Select
                value={meetingDuration}
                onValueChange={setMeetingDuration}
                disabled={isFormDisabled}
              >
                <SelectTrigger id='meetingDuration'>
                  <SelectValue placeholder='Select duration' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='30'>30 minutes</SelectItem>
                  <SelectItem value='60'>1 hour</SelectItem>
                  <SelectItem value='90'>1.5 hours</SelectItem>
                  <SelectItem value='120'>2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className='flex-col sm:flex-row gap-2 mt-6'>
            <Button type='submit' disabled={isFormDisabled} className='w-full sm:w-auto'>
              {isSubmitting ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Sending Invite...
                </>
              ) : (
                'Send Invite'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
