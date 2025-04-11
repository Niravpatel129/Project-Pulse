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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useProject } from '@/contexts/ProjectContext';
import { Calendar, Info, Loader2 } from 'lucide-react';
import { useState } from 'react';
import useClientInviteForm from './hooks/UseClientInviteFormReturn';
import ManageAvailabilityDialog from './ManageAvailabilityDialog';

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
};

export default function ClientInviteDialog({
  open,
  onOpenChange,
  projectName,
  participants,
}: ClientInviteDialogProps) {
  const { project } = useProject();
  const [showAvailabilityDialog, setShowAvailabilityDialog] = useState(false);

  const {
    startDateRange,
    setStartDateRange,
    endDateRange,
    setEndDateRange,
    primaryClientEmail,
    setPrimaryClientEmail,
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

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className='sm:max-w-[600px] max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Schedule a Meeting</DialogTitle>
            <DialogDescription>
              Let your clients book a time that works for everyone
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSendInvite}>
            <div className='space-y-8 py-4'>
              {/* Step 1: Who to Meet */}
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <div className='flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground'>
                      1
                    </div>
                    <Label className='text-base'>Who would you like to meet with?</Label>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className='cursor-help'>
                        <Info className='h-4 w-4 text-muted-foreground' />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Select the client who will book the meeting</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className='space-y-2'>
                  <Select
                    value={primaryClientEmail}
                    onValueChange={setPrimaryClientEmail}
                    disabled={isFormDisabled}
                  >
                    <SelectTrigger
                      id='primaryClient'
                      className={errors.primaryClientEmail ? 'border-red-500' : ''}
                    >
                      <SelectValue placeholder='Select client' />
                    </SelectTrigger>
                    <SelectContent>
                      {participants.map((participant) => {
                        return (
                          <SelectItem key={participant._id} value={participant.email || ''}>
                            {participant.email || 'No email available'}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {errors.primaryClientEmail && (
                    <p className='text-sm text-red-500'>{errors.primaryClientEmail}</p>
                  )}
                </div>
              </div>

              {/* Step 2: When to Meet */}
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <div className='flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground'>
                      2
                    </div>
                    <Label className='text-base'>When would you like to meet?</Label>
                  </div>
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    onClick={() => {
                      return setShowAvailabilityDialog(true);
                    }}
                    className='h-8 text-xs text-muted-foreground hover:text-primary'
                  >
                    <Calendar className='h-3 w-3 mr-1' />
                    Set your availability
                  </Button>
                </div>
                <div className='grid gap-4'>
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
                      {errors.startDate && (
                        <p className='text-sm text-red-500'>{errors.startDate}</p>
                      )}
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
                  <div>
                    <Label htmlFor='meetingDuration'>Duration</Label>
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
                  {errors.dateRange && <p className='text-sm text-red-500'>{errors.dateRange}</p>}
                </div>
              </div>

              {/* Step 3: How to Meet */}
              <div className='space-y-4'>
                <div className='flex items-center gap-2'>
                  <div className='flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground'>
                    3
                  </div>
                  <Label className='text-base'>How would you like to meet?</Label>
                </div>
                <div className='grid gap-4'>
                  <Select
                    value={meetingLocation}
                    onValueChange={setMeetingLocation}
                    disabled={isFormDisabled}
                  >
                    <SelectTrigger id='meetingLocation'>
                      <SelectValue placeholder='Select meeting type' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='video'>Video Call</SelectItem>
                      <SelectItem value='phone'>Phone Call</SelectItem>
                      <SelectItem value='in-person'>In Person</SelectItem>
                      <SelectItem value='other'>Other</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Location-specific fields */}
                  {meetingLocation === 'video' && (
                    <div className='space-y-2'>
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
                                    Google Meet links will be automatically created and included in
                                    your meeting invitations
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
                        <Input
                          placeholder='Enter video platform name'
                          value={customLocation}
                          onChange={(e) => {
                            return setCustomLocation(e.target.value);
                          }}
                          className={errors.customLocation ? 'border-red-500' : ''}
                        />
                      )}
                    </div>
                  )}

                  {meetingLocation === 'phone' && (
                    <div className='space-y-2'>
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
                        <Input
                          type='tel'
                          placeholder='Enter phone number (e.g., +1 234 567 8900)'
                          value={phoneNumber}
                          onChange={(e) => {
                            return setPhoneNumber(e.target.value);
                          }}
                          className={errors.phoneNumber ? 'border-red-500' : ''}
                        />
                      )}
                    </div>
                  )}

                  {(meetingLocation === 'in-person' || meetingLocation === 'other') && (
                    <Input
                      placeholder={
                        meetingLocation === 'in-person'
                          ? 'Enter physical meeting location'
                          : 'Specify meeting location or instructions'
                      }
                      value={customLocation}
                      onChange={(e) => {
                        return setCustomLocation(e.target.value);
                      }}
                      className={errors.customLocation ? 'border-red-500' : ''}
                    />
                  )}
                </div>
              </div>

              {/* Step 4: Meeting Purpose */}
              <div className='space-y-4'>
                <div className='flex items-center gap-2'>
                  <div className='flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground'>
                    4
                  </div>
                  <Label className='text-base'>What is the purpose of this meeting?</Label>
                </div>
                <Input
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

            <DialogFooter className='mt-6'>
              <Button type='submit' disabled={isFormDisabled}>
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

      <ManageAvailabilityDialog
        open={showAvailabilityDialog}
        onOpenChange={setShowAvailabilityDialog}
        onSave={() => {
          setShowAvailabilityDialog(false);
        }}
      />
    </>
  );
}
