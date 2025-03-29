'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProject } from '@/contexts/ProjectContext';
import { useProjectSchedule } from '@/hooks/useProjectSchedule';
import { format, parseISO } from 'date-fns';
import { CalendarIcon, Clock, Mail, MoreHorizontal, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { Calendar } from '../ui/calendar';
import ClientInviteDialog from './ClientInviteDialog';
import CreateMeetingDialog from './CreateMeetingDialog';
import ManageAvailabilityDialog from './ManageAvailabilityDialog';

export default function ProjectSchedule() {
  const { project } = useProject();
  const {
    selectedDate,
    setSelectedDate,
    showMeetingDialog,
    setShowMeetingDialog,
    showInviteDialog,
    setShowInviteDialog,
    showAvailabilityDialog,
    setShowAvailabilityDialog,
    showDeleteDialog,
    setShowDeleteDialog,
    meetingToDelete,
    setMeetingToDelete,
    activeTab,
    setActiveTab,
    meetings,
    selectedTeamMembers,
    setSelectedTeamMembers,
    meetingTitle,
    setMeetingTitle,
    meetingDescription,
    setMeetingDescription,
    meetingStartTime,
    setMeetingStartTime,
    meetingDuration,
    setMeetingDuration,
    meetingType,
    setMeetingType,
    meetingTypeDetails,
    setMeetingTypeDetails,
    teamMembers,
    handleCreateMeeting,
    handleDeleteMeeting,
    resetMeetingForm,
    getStatusColor,
    filteredMeetings,
    handleResendRequest,
    handleDeleteRequest,
  } = useProjectSchedule();

  const [availabilitySlots, setAvailabilitySlots] = useState<{
    [key: string]: { start: string; end: string }[];
  }>({
    sunday: [{ start: '09:00', end: '17:00' }],
    monday: [{ start: '09:00', end: '17:00' }],
    tuesday: [{ start: '09:00', end: '17:00' }],
    wednesday: [{ start: '09:00', end: '17:00' }],
    thursday: [{ start: '09:00', end: '17:00' }],
    friday: [{ start: '09:00', end: '17:00' }],
    saturday: [{ start: '09:00', end: '17:00' }],
  });

  const handleAddTimeSlot = (day: string) => {
    setAvailabilitySlots((prev) => {
      return {
        ...prev,
        [day]: [...prev[day], { start: '09:00', end: '17:00' }],
      };
    });
  };

  const handleRemoveTimeSlot = (day: string, index: number) => {
    setAvailabilitySlots((prev) => {
      return {
        ...prev,
        [day]: prev[day].filter((_, i) => {
          return i !== index;
        }),
      };
    });
  };

  const handleTimeChange = (day: string, index: number, type: 'start' | 'end', value: string) => {
    setAvailabilitySlots((prev) => {
      return {
        ...prev,
        [day]: prev[day].map((slot, i) => {
          return i === index ? { ...slot, [type]: value } : slot;
        }),
      };
    });
  };

  const [selectedTimezone, setSelectedTimezone] = useState('America/Toronto');
  const [availableWhenever, setAvailableWhenever] = useState(false);

  // Render a day's availability slots
  const renderDayAvailability = (day: string, label: string, defaultChecked: boolean = false) => {
    return (
      <div className='flex items-center justify-between py-3 hover:bg-gray-50/50 rounded-lg px-2'>
        <div className='flex items-center space-x-4 min-w-[120px]'>
          <Switch id={day} defaultChecked={defaultChecked} />
          <Label htmlFor={day} className='font-medium'>
            {label}
          </Label>
        </div>
        <div className='flex-1 flex flex-col space-y-2'>
          {availabilitySlots[day].map((slot, index) => {
            return (
              <div key={index} className='flex items-center justify-end space-x-2'>
                <Select
                  value={slot.start}
                  onValueChange={(value) => {
                    return handleTimeChange(day, index, 'start', value);
                  }}
                >
                  <SelectTrigger className='w-[110px]'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='00:00'>12:00 AM</SelectItem>
                    <SelectItem value='00:30'>12:30 AM</SelectItem>
                    <SelectItem value='01:00'>1:00 AM</SelectItem>
                    <SelectItem value='01:30'>1:30 AM</SelectItem>
                    <SelectItem value='02:00'>2:00 AM</SelectItem>
                    <SelectItem value='02:30'>2:30 AM</SelectItem>
                    <SelectItem value='03:00'>3:00 AM</SelectItem>
                    <SelectItem value='03:30'>3:30 AM</SelectItem>
                    <SelectItem value='04:00'>4:00 AM</SelectItem>
                    <SelectItem value='04:30'>4:30 AM</SelectItem>
                    <SelectItem value='05:00'>5:00 AM</SelectItem>
                    <SelectItem value='05:30'>5:30 AM</SelectItem>
                    <SelectItem value='06:00'>6:00 AM</SelectItem>
                    <SelectItem value='06:30'>6:30 AM</SelectItem>
                    <SelectItem value='07:00'>7:00 AM</SelectItem>
                    <SelectItem value='07:30'>7:30 AM</SelectItem>
                    <SelectItem value='08:00'>8:00 AM</SelectItem>
                    <SelectItem value='08:30'>8:30 AM</SelectItem>
                    <SelectItem value='09:00'>9:00 AM</SelectItem>
                    <SelectItem value='09:30'>9:30 AM</SelectItem>
                    <SelectItem value='10:00'>10:00 AM</SelectItem>
                    <SelectItem value='10:30'>10:30 AM</SelectItem>
                    <SelectItem value='11:00'>11:00 AM</SelectItem>
                    <SelectItem value='11:30'>11:30 AM</SelectItem>
                    <SelectItem value='12:00'>12:00 PM</SelectItem>
                    <SelectItem value='12:30'>12:30 PM</SelectItem>
                    <SelectItem value='13:00'>1:00 PM</SelectItem>
                    <SelectItem value='13:30'>1:30 PM</SelectItem>
                    <SelectItem value='14:00'>2:00 PM</SelectItem>
                    <SelectItem value='14:30'>2:30 PM</SelectItem>
                    <SelectItem value='15:00'>3:00 PM</SelectItem>
                    <SelectItem value='15:30'>3:30 PM</SelectItem>
                    <SelectItem value='16:00'>4:00 PM</SelectItem>
                    <SelectItem value='16:30'>4:30 PM</SelectItem>
                    <SelectItem value='17:00'>5:00 PM</SelectItem>
                    <SelectItem value='17:30'>5:30 PM</SelectItem>
                    <SelectItem value='18:00'>6:00 PM</SelectItem>
                    <SelectItem value='18:30'>6:30 PM</SelectItem>
                    <SelectItem value='19:00'>7:00 PM</SelectItem>
                    <SelectItem value='19:30'>7:30 PM</SelectItem>
                    <SelectItem value='20:00'>8:00 PM</SelectItem>
                    <SelectItem value='20:30'>8:30 PM</SelectItem>
                    <SelectItem value='21:00'>9:00 PM</SelectItem>
                    <SelectItem value='21:30'>9:30 PM</SelectItem>
                    <SelectItem value='22:00'>10:00 PM</SelectItem>
                    <SelectItem value='22:30'>10:30 PM</SelectItem>
                    <SelectItem value='23:00'>11:00 PM</SelectItem>
                    <SelectItem value='23:30'>11:30 PM</SelectItem>
                  </SelectContent>
                </Select>
                <span className='text-gray-500'>-</span>
                <Select
                  value={slot.end}
                  onValueChange={(value) => {
                    return handleTimeChange(day, index, 'end', value);
                  }}
                >
                  <SelectTrigger className='w-[110px]'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='00:00'>12:00 AM</SelectItem>
                    <SelectItem value='00:30'>12:30 AM</SelectItem>
                    <SelectItem value='01:00'>1:00 AM</SelectItem>
                    <SelectItem value='01:30'>1:30 AM</SelectItem>
                    <SelectItem value='02:00'>2:00 AM</SelectItem>
                    <SelectItem value='02:30'>2:30 AM</SelectItem>
                    <SelectItem value='03:00'>3:00 AM</SelectItem>
                    <SelectItem value='03:30'>3:30 AM</SelectItem>
                    <SelectItem value='04:00'>4:00 AM</SelectItem>
                    <SelectItem value='04:30'>4:30 AM</SelectItem>
                    <SelectItem value='05:00'>5:00 AM</SelectItem>
                    <SelectItem value='05:30'>5:30 AM</SelectItem>
                    <SelectItem value='06:00'>6:00 AM</SelectItem>
                    <SelectItem value='06:30'>6:30 AM</SelectItem>
                    <SelectItem value='07:00'>7:00 AM</SelectItem>
                    <SelectItem value='07:30'>7:30 AM</SelectItem>
                    <SelectItem value='08:00'>8:00 AM</SelectItem>
                    <SelectItem value='08:30'>8:30 AM</SelectItem>
                    <SelectItem value='09:00'>9:00 AM</SelectItem>
                    <SelectItem value='09:30'>9:30 AM</SelectItem>
                    <SelectItem value='10:00'>10:00 AM</SelectItem>
                    <SelectItem value='10:30'>10:30 AM</SelectItem>
                    <SelectItem value='11:00'>11:00 AM</SelectItem>
                    <SelectItem value='11:30'>11:30 AM</SelectItem>
                    <SelectItem value='12:00'>12:00 PM</SelectItem>
                    <SelectItem value='12:30'>12:30 PM</SelectItem>
                    <SelectItem value='13:00'>1:00 PM</SelectItem>
                    <SelectItem value='13:30'>1:30 PM</SelectItem>
                    <SelectItem value='14:00'>2:00 PM</SelectItem>
                    <SelectItem value='14:30'>2:30 PM</SelectItem>
                    <SelectItem value='15:00'>3:00 PM</SelectItem>
                    <SelectItem value='15:30'>3:30 PM</SelectItem>
                    <SelectItem value='16:00'>4:00 PM</SelectItem>
                    <SelectItem value='16:30'>4:30 PM</SelectItem>
                    <SelectItem value='17:00'>5:00 PM</SelectItem>
                    <SelectItem value='17:30'>5:30 PM</SelectItem>
                    <SelectItem value='18:00'>6:00 PM</SelectItem>
                    <SelectItem value='18:30'>6:30 PM</SelectItem>
                    <SelectItem value='19:00'>7:00 PM</SelectItem>
                    <SelectItem value='19:30'>7:30 PM</SelectItem>
                    <SelectItem value='20:00'>8:00 PM</SelectItem>
                    <SelectItem value='20:30'>8:30 PM</SelectItem>
                    <SelectItem value='21:00'>9:00 PM</SelectItem>
                    <SelectItem value='21:30'>9:30 PM</SelectItem>
                    <SelectItem value='22:00'>10:00 PM</SelectItem>
                    <SelectItem value='22:30'>10:30 PM</SelectItem>
                    <SelectItem value='23:00'>11:00 PM</SelectItem>
                    <SelectItem value='23:30'>11:30 PM</SelectItem>
                  </SelectContent>
                </Select>
                <div className='flex items-center space-x-1'>
                  {index === 0 ? (
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-8 w-8 hover:bg-gray-100'
                      onClick={() => {
                        return handleAddTimeSlot(day);
                      }}
                    >
                      <Plus className='h-4 w-4' />
                    </Button>
                  ) : (
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-8 w-8 hover:bg-gray-100'
                      onClick={() => {
                        return handleRemoveTimeSlot(day, index);
                      }}
                    >
                      <X className='h-4 w-4' />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className='space-y-4'>
      <div className='flex justify-between gap-8 flex-col lg:flex-row'>
        {/* Left side - Calendar view */}
        <div className='w-full lg:w-1/3 xl:w-1/4 mb-6 lg:mb-0 min-w-[350px]'>
          <div className='w-full overflow-hidden'>
            <Card>
              <CardHeader>
                <CardTitle>Calendar</CardTitle>
                <CardDescription>Select a date to schedule a meeting</CardDescription>
              </CardHeader>
              <CardContent className='px-1 sm:px-6'>
                <div className='w-full flex justify-center'>
                  <div className='w-full'>
                    <Calendar
                      mode='single'
                      selected={selectedDate}
                      onSelect={(date) => {
                        return date && setSelectedDate(date);
                      }}
                      className='rounded-md border w-full'
                    />
                  </div>
                </div>

                <div className='mt-4 flex flex-col space-y-2'>
                  <Button
                    onClick={() => {
                      resetMeetingForm();
                      setShowMeetingDialog(true);
                    }}
                    className='w-full text-sm'
                  >
                    <Plus className='mr-2 h-4 w-4' />
                    Create Meeting
                  </Button>

                  <Button
                    variant='outline'
                    onClick={() => {
                      return setShowInviteDialog(true);
                    }}
                    className='w-full text-sm'
                  >
                    <Mail className='mr-2 h-4 w-4' />
                    Send Client Invite
                  </Button>

                  <Button
                    variant='outline'
                    onClick={() => {
                      return setShowAvailabilityDialog(true);
                    }}
                    className='w-full text-sm'
                  >
                    <Clock className='mr-2 h-4 w-4' />
                    Manage Availability
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right side - Meetings list */}
        <Card className='w-full lg:w-2/3 xl:w-3/4'>
          <CardHeader>
            <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
              <CardTitle>Meetings</CardTitle>
              <Tabs defaultValue='all' className='w-full md:w-auto' onValueChange={setActiveTab}>
                <TabsList className='w-full md:w-auto'>
                  <TabsTrigger value='all'>All</TabsTrigger>
                  <TabsTrigger value='upcoming'>Upcoming</TabsTrigger>
                  <TabsTrigger value='pending'>Pending Requests</TabsTrigger>
                  <TabsTrigger value='past'>Past</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <CardDescription>
              View and manage all your scheduled meetings and requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredMeetings().length > 0 ? (
              <div className='space-y-4'>
                {filteredMeetings().map((meeting, index) => {
                  return (
                    <Card key={index} className='overflow-hidden'>
                      <div className='flex flex-col sm:flex-row'>
                        <div className='flex w-full flex-col justify-between p-4 sm:w-2/3'>
                          <div>
                            <div className='flex flex-wrap items-center gap-2'>
                              <h3 className='font-semibold'>{meeting.title}</h3>
                              <Badge variant='outline' className={getStatusColor(meeting.status)}>
                                {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                              </Badge>
                            </div>
                            <div className='mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-600'>
                              <div className='flex items-center'>
                                <Clock className='mr-1 h-4 w-4' />
                                <span>Duration: {meeting.meetingDuration} minutes</span>
                              </div>
                              <div className='flex items-center'>
                                <CalendarIcon className='mr-1 h-4 w-4' />
                                <span>
                                  Requested:{' '}
                                  {format(parseISO(meeting.createdAt), 'MMM d, yyyy h:mm a')}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className='mt-4 flex flex-wrap items-center gap-2 md:gap-4'>
                            {meeting.status === 'scheduled' && (
                              <>
                                <div className='flex items-center'>
                                  <CalendarIcon className='mr-1 h-4 w-4 text-gray-500' />
                                  <span className='text-sm'>
                                    {format(parseISO(meeting.date), 'MMM d, yyyy')}
                                  </span>
                                </div>
                                <div className='flex items-center'>
                                  <Clock className='mr-1 h-4 w-4 text-gray-500' />
                                  <span className='text-sm'>
                                    {meeting.startTime} - {meeting.endTime}
                                  </span>
                                </div>
                              </>
                            )}
                            {meeting.type && (
                              <div className='text-sm text-gray-600 capitalize'>
                                {meeting.type.charAt(0).toUpperCase() + meeting.type.slice(1)}
                                {meeting.typeDetails && (
                                  <>
                                    {meeting.type === 'video' && meeting.typeDetails.videoType && (
                                      <span className='ml-1'>
                                        • {meeting.typeDetails.videoType.replace('-', ' ')}
                                      </span>
                                    )}
                                    {meeting.type === 'phone' &&
                                      meeting.typeDetails.phoneNumber && (
                                        <span className='ml-1'>
                                          • {meeting.typeDetails.phoneNumber}
                                        </span>
                                      )}
                                    {meeting.type === 'inperson' &&
                                      meeting.typeDetails.location && (
                                        <span className='ml-1'>
                                          • {meeting.typeDetails.location}
                                        </span>
                                      )}
                                    {meeting.type === 'other' &&
                                      meeting.typeDetails.otherDetails && (
                                        <span className='ml-1'>
                                          • {meeting.typeDetails.otherDetails}
                                        </span>
                                      )}
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className='border-t bg-gray-50 p-4 sm:w-1/3 sm:border-l sm:border-t-0'>
                          <div className='flex justify-between items-start'>
                            <h4 className='text-sm font-medium text-gray-600'>Request Details</h4>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  className='h-8 w-8 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                >
                                  <MoreHorizontal className='h-4 w-4' />
                                  <span className='sr-only'>Meeting options</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align='end'>
                                {meeting.status === 'pending' ? (
                                  <>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        return handleResendRequest(meeting._id);
                                      }}
                                    >
                                      Resend Request
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setMeetingToDelete(meeting._id);
                                        setShowDeleteDialog(true);
                                        handleDeleteRequest(meeting._id);
                                      }}
                                      className='text-red-600'
                                    >
                                      Delete Request
                                    </DropdownMenuItem>
                                  </>
                                ) : (
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setMeetingToDelete(meeting._id);
                                      setShowDeleteDialog(true);
                                      handleDeleteMeeting(meeting._id);
                                    }}
                                    className='text-red-600'
                                  >
                                    Delete Meeting
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          <div className='mt-2'>
                            <div className='text-sm font-medium'>Requested By</div>
                            <div className='text-sm text-gray-600 break-words'>
                              {meeting.createdBy.name} ({meeting.createdBy.email})
                            </div>
                          </div>

                          <div className='mt-2'>
                            <div className='text-sm font-medium'>Status</div>
                            <div className='text-sm text-gray-600'>
                              {meeting.status === 'pending' ? (
                                <span className='text-yellow-600'>Awaiting Response</span>
                              ) : meeting.status === 'scheduled' ? (
                                <span className='text-green-600'>Confirmed</span>
                              ) : meeting.status === 'cancelled' ? (
                                <span className='text-red-600'>Cancelled</span>
                              ) : (
                                <span className='text-gray-600'>Completed</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className='flex h-40 items-center justify-center rounded-lg border border-dashed'>
                <div className='text-center'>
                  <p className='text-gray-500'>No meetings found</p>
                  <Button
                    variant='outline'
                    className='mt-2'
                    onClick={() => {
                      return setShowMeetingDialog(true);
                    }}
                  >
                    Schedule a Meeting
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Replace the old Create Meeting Dialog with the new component */}
        <CreateMeetingDialog
          open={showMeetingDialog}
          onOpenChange={setShowMeetingDialog}
          selectedDate={selectedDate}
          teamMembers={teamMembers}
          onCreateMeeting={handleCreateMeeting}
          meetingStartTime={meetingStartTime}
          setMeetingStartTime={setMeetingStartTime}
          meetingDuration={meetingDuration}
          setMeetingDuration={setMeetingDuration}
          selectedTeamMembers={selectedTeamMembers}
          setSelectedTeamMembers={setSelectedTeamMembers}
          meetingTitle={meetingTitle}
          setMeetingTitle={setMeetingTitle}
          meetingDescription={meetingDescription}
          setMeetingDescription={setMeetingDescription}
          meetingType={meetingType}
          setMeetingType={setMeetingType}
          meetingTypeDetails={meetingTypeDetails}
          setMeetingTypeDetails={setMeetingTypeDetails}
        />

        {/* Keep the existing ClientInviteDialog */}
        <ClientInviteDialog
          open={showInviteDialog}
          onOpenChange={setShowInviteDialog}
          projectName={project?.name}
          participants={project?.participants || []}
        />

        {/* Replace the old Manage Availability Dialog with the new component */}
        <ManageAvailabilityDialog
          open={showAvailabilityDialog}
          onOpenChange={setShowAvailabilityDialog}
          onSave={() => {
            setShowAvailabilityDialog(false);
          }}
        />
      </div>
    </div>
  );
}
