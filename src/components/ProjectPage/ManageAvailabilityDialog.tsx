import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAvailability } from '@/hooks/useAvailability';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
import { regions, timezones } from '@/lib/timezones';
import { useEffect, useState } from 'react';
import { FcCheckmark, FcGoogle } from 'react-icons/fc';
import WeeklyAvailability from './WeeklyAvailability';

interface ManageAvailabilityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

export default function ManageAvailabilityDialog({
  open,
  onOpenChange,
  onSave,
}: ManageAvailabilityDialogProps) {
  const [activeTab, setActiveTab] = useState('availability');
  const {
    isConnected,
    isLoading: isGoogleLoading,
    error: googleError,
    connectGoogleCalendar,
    disconnectGoogleCalendar,
  } = useGoogleCalendar();
  const { settings, isLoading, error, fetchAvailability, updateAvailability } = useAvailability();

  useEffect(() => {
    if (open) {
      fetchAvailability();
    }
  }, [open, fetchAvailability]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[900px] max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Manage Availability Settings</DialogTitle>
          <DialogDescription>Set your weekly availability for meetings</DialogDescription>
        </DialogHeader>
        <div className='py-4'>
          <Tabs defaultValue='availability' onValueChange={setActiveTab}>
            <TabsList className='w-full flex flex-wrap sm:flex-nowrap'>
              <TabsTrigger value='availability' className='flex-1'>
                Availability
              </TabsTrigger>
              <TabsTrigger value='sync' className='flex-1'>
                Calendar Sync
              </TabsTrigger>
            </TabsList>

            <TabsContent value='availability' className='mt-4'>
              <div className='flex gap-8'>
                {/* Left side - Weekly schedule */}
                <div className='flex-1 space-y-6'>
                  <div className='flex items-center justify-between'>
                    <h3 className='text-sm font-medium'>Weekly Hours</h3>
                  </div>

                  <WeeklyAvailability availabilitySlots={settings.availabilitySlots} />
                </div>

                {/* Right side - Settings */}
                <div className='w-[300px] flex flex-col space-y-6 border-l border-border p-6'>
                  <div>
                    <h3 className='mb-4 text-lg font-semibold'>Scheduling Settings</h3>
                    <div className='space-y-6'>
                      <div className='space-y-2'>
                        <Label>Timezone</Label>
                        <Select
                          value={settings.timezone}
                          onValueChange={(value) => {
                            return updateAvailability({ timezone: value });
                          }}
                        >
                          <SelectTrigger className='w-[268px]'>
                            <SelectValue placeholder='Select your timezone' />
                          </SelectTrigger>
                          <SelectContent className='w-[268px]'>
                            {regions.map((region) => {
                              return (
                                <SelectGroup key={region}>
                                  <SelectLabel>{region}</SelectLabel>
                                  {timezones
                                    .filter((tz) => {
                                      return tz.region === region;
                                    })
                                    .map((tz) => {
                                      return (
                                        <SelectItem key={tz.value} value={tz.value}>
                                          {tz.label} ({tz.offset})
                                        </SelectItem>
                                      );
                                    })}
                                </SelectGroup>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className='space-y-2'>
                        <Label>Minimum Scheduling Notice</Label>
                        <Select
                          value={settings.minimumNotice.toString()}
                          onValueChange={(value) => {
                            return updateAvailability({ minimumNotice: parseInt(value) });
                          }}
                        >
                          <SelectTrigger className='w-[268px]'>
                            <SelectValue placeholder='Select minimum notice' />
                          </SelectTrigger>
                          <SelectContent className='w-[268px]'>
                            <SelectItem value='0'>No minimum</SelectItem>
                            <SelectItem value='1'>1 hour before</SelectItem>
                            <SelectItem value='24'>24 hours before</SelectItem>
                            <SelectItem value='48'>48 hours before</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className='space-y-2'>
                        <Label>Buffer Time Between Meetings</Label>
                        <Select
                          value={settings.bufferTime.toString()}
                          onValueChange={(value) => {
                            return updateAvailability({ bufferTime: parseInt(value) });
                          }}
                        >
                          <SelectTrigger className='w-[268px]'>
                            <SelectValue placeholder='Select buffer time' />
                          </SelectTrigger>
                          <SelectContent className='w-[268px]'>
                            <SelectItem value='0'>No buffer</SelectItem>
                            <SelectItem value='5'>5 minutes</SelectItem>
                            <SelectItem value='10'>10 minutes</SelectItem>
                            <SelectItem value='15'>15 minutes</SelectItem>
                            <SelectItem value='30'>30 minutes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className='space-y-4'>
                        {/* Additional Settings */}
                        <div className='space-y-3'>
                          <div className='flex items-center space-x-2'>
                            <Checkbox
                              id='prevent-overlap'
                              checked={settings.preventOverlap}
                              onCheckedChange={(checked) => {
                                return updateAvailability({ preventOverlap: checked as boolean });
                              }}
                            />
                            <Label htmlFor='prevent-overlap' className='text-sm'>
                              Prevent overlapping meetings
                            </Label>
                          </div>
                          <div className='flex items-center space-x-2'>
                            <Checkbox
                              id='require-confirmation'
                              checked={settings.requireConfirmation}
                              onCheckedChange={(checked) => {
                                return updateAvailability({
                                  requireConfirmation: checked as boolean,
                                });
                              }}
                            />
                            <Label htmlFor='require-confirmation' className='text-sm'>
                              Require confirmation
                            </Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value='sync' className='mt-4'>
              <div className='space-y-4'>
                <p className='text-sm text-gray-500'>
                  Connect your external calendars to automatically sync availability.
                </p>

                <Card>
                  <CardHeader className='py-3'>
                    <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2'>
                      <div className='flex items-center gap-2 justify-center'>
                        <FcGoogle className='w-5 h-5' />
                        <CardTitle className='text-base'>Google Calendar</CardTitle>
                        {isConnected && (
                          <>
                            <FcCheckmark className='w-5 h-5 text-green-500' />
                          </>
                        )}
                      </div>
                      {googleError && <p className='text-sm text-red-500'>{googleError}</p>}
                      <Button
                        variant='default'
                        size='sm'
                        className='bg-black hover:bg-black/90 text-white'
                        onClick={isConnected ? disconnectGoogleCalendar : connectGoogleCalendar}
                        disabled={isGoogleLoading}
                      >
                        {isGoogleLoading ? 'Connecting...' : isConnected ? 'Disconnect' : 'Connect'}
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        {/* <DialogFooter className='flex-col sm:flex-row gap-2'>
          {activeTab === 'availability' && (
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          )}
        </DialogFooter> */}
      </DialogContent>
    </Dialog>
  );
}
