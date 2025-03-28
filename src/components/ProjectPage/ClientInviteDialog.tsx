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
import { Check, ChevronsUpDown, Info, Loader2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import useClientInviteForm from './hooks/UseClientInviteFormReturn';

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
          'relative flex min-h-[2.5rem] w-full flex-wrap items-center gap-1 rounded-md border border-input bg-background px-2 py-1.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 transition-all duration-200 cursor-pointer',
          error && 'border-red-500',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
        onClick={() => {
          return !disabled && setIsOpen(!isOpen);
        }}
        role='button'
        tabIndex={0}
        onKeyDown={(e) => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
      >
        {selectedEmails.length === 0 ? (
          <span className='text-muted-foreground px-2'>Select clients to invite</span>
        ) : (
          <>
            {selectedEmails.map((email) => {
              return (
                <Badge
                  key={email}
                  variant='secondary'
                  className='flex items-center gap-1 transition-all duration-200 animate-in fade-in-0 slide-in-from-left-1'
                >
                  {email}
                  <button
                    type='button'
                    className='ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5 transition-colors duration-200'
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
        <ChevronsUpDown
          className={cn(
            'h-4 w-4 opacity-50 transition-transform duration-200 ml-auto',
            isOpen && 'rotate-180',
          )}
        />
      </div>

      <div
        className={cn(
          'absolute left-0 right-0 z-50 mt-1 rounded-md border bg-popover text-popover-foreground shadow-md outline-none transition-all duration-200',
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none',
        )}
      >
        <div className='p-1'>
          <Input
            placeholder='Search clients...'
            value={searchQuery}
            onChange={(e) => {
              return setSearchQuery(e.target.value);
            }}
            className='mb-1'
            onClick={(e) => {
              return e.stopPropagation();
            }}
          />
          <ScrollArea className='max-h-[200px] transition-all duration-200'>
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
                        'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground transition-colors duration-200',
                        selectedEmails.includes(participant.email) && 'bg-accent',
                      )}
                      onClick={() => {
                        return participant.email && toggleEmail(participant.email);
                      }}
                    >
                      <Check
                        className={cn(
                          'h-4 w-4 transition-opacity duration-200',
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
  const { project } = useProject();

  const {
    startDateRange,
    setStartDateRange,
    endDateRange,
    setEndDateRange,
    selectedClientEmails,
    setSelectedClientEmails,
    meetingPurpose,
    setMeetingPurpose,
    meetingLocation,
    setMeetingLocation,
    videoPlatform,
    setVideoPlatform,
    phoneNumber,
    setPhoneNumber,
    phoneNumberType,
    setPhoneNumberType,
    customLocation,
    setCustomLocation,
    meetingDuration,
    setMeetingDuration,
    errors,
    setErrors,
    isFormDisabled,
    isSubmitting,
    handleSendInvite,
    handleConnect,
    isConnecting,
    googleStatus,
    resetForm,
  } = useClientInviteForm({
    projectName,
    projectId: project?._id,
    onSuccess: () => {
      return onOpenChange(false);
    },
  });
  console.log('🚀 googleStatus:', googleStatus);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
                      <SelectItem value='google-meet'>Google Meet</SelectItem>
                      <SelectItem value='custom'>Other Platform</SelectItem>
                    </SelectContent>
                  </Select>
                  {videoPlatform === 'google-meet' && (
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
