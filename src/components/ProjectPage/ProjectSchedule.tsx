'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { addHours, format, parseISO } from 'date-fns';
import { CalendarIcon, Clock, Mail, Plus, Users } from 'lucide-react';
import { useState } from 'react';
import { Calendar } from '../ui/calendar';

type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: string;
  availableTimes: {
    day: string; // 'monday', 'tuesday', etc.
    slots: { start: string; end: string }[];
  }[];
};

type Meeting = {
  id: string;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'pending' | 'canceled';
  clientEmail?: string;
  teamMembers: string[]; // Array of team member IDs
  location?: string;
};

export default function ProjectSchedule() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showMeetingDialog, setShowMeetingDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showAvailabilityDialog, setShowAvailabilityDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('upcoming');
  const [startDateRange, setStartDateRange] = useState<Date | undefined>(new Date());
  const [endDateRange, setEndDateRange] = useState<Date | undefined>(addHours(new Date(), 30 * 24));

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'Project Manager',
      availableTimes: [
        {
          day: 'monday',
          slots: [
            { start: '09:00', end: '12:00' },
            { start: '13:00', end: '17:00' },
          ],
        },
        {
          day: 'tuesday',
          slots: [
            { start: '09:00', end: '12:00' },
            { start: '13:00', end: '17:00' },
          ],
        },
      ],
    },
    {
      id: '2',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'Designer',
      availableTimes: [
        {
          day: 'monday',
          slots: [{ start: '10:00', end: '15:00' }],
        },
        {
          day: 'wednesday',
          slots: [{ start: '09:00', end: '17:00' }],
        },
      ],
    },
    {
      id: '3',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      role: 'Developer',
      availableTimes: [
        {
          day: 'tuesday',
          slots: [{ start: '13:00', end: '18:00' }],
        },
        {
          day: 'thursday',
          slots: [{ start: '09:00', end: '17:00' }],
        },
      ],
    },
  ]);

  const [meetings, setMeetings] = useState<Meeting[]>([
    {
      id: '1',
      title: 'Project Kickoff',
      description: 'Initial meeting to discuss project scope and timeline',
      date: new Date().toISOString().split('T')[0],
      startTime: '10:00',
      endTime: '11:00',
      status: 'scheduled',
      clientEmail: 'client@example.com',
      teamMembers: ['1', '3'],
      location: 'Zoom',
    },
    {
      id: '2',
      title: 'Design Review',
      description: 'Review design mockups with client',
      date: addHours(new Date(), 48).toISOString().split('T')[0],
      startTime: '14:00',
      endTime: '15:00',
      status: 'pending',
      clientEmail: 'client@example.com',
      teamMembers: ['1', '2'],
      location: 'Conference Room A',
    },
    {
      id: '3',
      title: 'Development Sprint Planning',
      description: 'Plan the next development sprint',
      date: addHours(new Date(), 72).toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '10:30',
      status: 'scheduled',
      teamMembers: ['1', '3'],
      location: 'Zoom',
    },
  ]);

  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDescription, setMeetingDescription] = useState('');
  const [meetingStartTime, setMeetingStartTime] = useState('09:00');
  const [meetingDuration, setMeetingDuration] = useState('60');
  const [meetingLocation, setMeetingLocation] = useState('');
  const [clientEmail, setClientEmail] = useState('');

  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();

    // Calculate end time based on start time and duration
    const [startHour, startMinute] = meetingStartTime.split(':').map(Number);
    const durationMinutes = parseInt(meetingDuration);

    const endHour = Math.floor((startHour * 60 + startMinute + durationMinutes) / 60) % 24;
    const endMinute = (startMinute + durationMinutes) % 60;

    const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute
      .toString()
      .padStart(2, '0')}`;

    const newMeeting: Meeting = {
      id: Date.now().toString(),
      title: meetingTitle,
      description: meetingDescription,
      date: format(selectedDate, 'yyyy-MM-dd'),
      startTime: meetingStartTime,
      endTime,
      status: 'scheduled',
      clientEmail: clientEmail || undefined,
      teamMembers: selectedTeamMembers,
      location: meetingLocation,
    };

    setMeetings([...meetings, newMeeting]);
    resetMeetingForm();
    setShowMeetingDialog(false);
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to send invitation email to client
    // In a real app, this would call an API endpoint

    alert(`Invitation sent to ${clientEmail}`);
    setShowInviteDialog(false);
  };

  const resetMeetingForm = () => {
    setMeetingTitle('');
    setMeetingDescription('');
    setMeetingStartTime('09:00');
    setMeetingDuration('60');
    setMeetingLocation('');
    setClientEmail('');
    setSelectedTeamMembers([]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredMeetings = () => {
    switch (activeTab) {
      case 'all':
        return meetings;
      case 'upcoming':
        return meetings.filter((meeting) => {
          const meetingDate = parseISO(meeting.date);
          return meetingDate >= new Date() && meeting.status !== 'canceled';
        });
      case 'pending':
        return meetings.filter((meeting) => {
          return meeting.status === 'pending';
        });
      case 'past':
        return meetings.filter((meeting) => {
          const meetingDate = parseISO(meeting.date);
          return meetingDate < new Date() || meeting.status === 'canceled';
        });
      default:
        return meetings;
    }
  };

  return (
    <div className='container mx-auto px-4 py-6 overflow-x-hidden'>
      <div className='flex flex-col lg:flex-row gap-6'>
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
                  <TabsTrigger value='pending'>Pending</TabsTrigger>
                  <TabsTrigger value='past'>Past</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <CardDescription>View and manage all your scheduled meetings</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredMeetings().length > 0 ? (
              <div className='space-y-4'>
                {filteredMeetings().map((meeting) => {
                  return (
                    <Card key={meeting.id} className='overflow-hidden'>
                      <div className='flex flex-col sm:flex-row'>
                        <div className='flex w-full flex-col justify-between p-4 sm:w-2/3'>
                          <div>
                            <div className='flex flex-wrap items-center gap-2'>
                              <h3 className='font-semibold'>{meeting.title}</h3>
                              <Badge className={getStatusColor(meeting.status)}>
                                {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                              </Badge>
                            </div>
                            <p className='mt-1 text-sm text-gray-600'>{meeting.description}</p>
                          </div>

                          <div className='mt-4 flex flex-wrap items-center gap-2 md:gap-4'>
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
                            {meeting.location && (
                              <div className='text-sm text-gray-600'>{meeting.location}</div>
                            )}
                          </div>
                        </div>

                        <div className='border-t bg-gray-50 p-4 sm:w-1/3 sm:border-l sm:border-t-0'>
                          <h4 className='text-sm font-medium text-gray-600'>Participants</h4>

                          {meeting.clientEmail && (
                            <div className='mt-2'>
                              <div className='text-sm font-medium'>Client</div>
                              <div className='text-sm text-gray-600 break-words'>
                                {meeting.clientEmail}
                              </div>
                            </div>
                          )}

                          <div className='mt-2'>
                            <div className='text-sm font-medium'>Team Members</div>
                            <div className='mt-1 flex flex-wrap gap-1'>
                              {meeting.teamMembers.map((memberId) => {
                                const member = teamMembers.find((m) => {
                                  return m.id === memberId;
                                });
                                return (
                                  <TooltipProvider key={memberId}>
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <Badge variant='outline' className='bg-blue-50'>
                                          {member?.name.split(' ')[0]}
                                        </Badge>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>{member?.name}</p>
                                        <p className='text-xs text-gray-500'>{member?.role}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                );
                              })}
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

        {/* Create Meeting Dialog */}
        <Dialog open={showMeetingDialog} onOpenChange={setShowMeetingDialog}>
          <DialogContent className='sm:max-w-[500px] max-h-[90vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>Create New Meeting</DialogTitle>
              <DialogDescription>
                Schedule a meeting on {format(selectedDate, 'MMMM d, yyyy')}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateMeeting}>
              <div className='grid gap-4 py-4'>
                <div className='grid gap-2'>
                  <Label htmlFor='title'>Meeting Title</Label>
                  <Input
                    id='title'
                    value={meetingTitle}
                    onChange={(e) => {
                      return setMeetingTitle(e.target.value);
                    }}
                    placeholder='Project Discussion'
                    required
                  />
                </div>

                <div className='grid gap-2'>
                  <Label htmlFor='description'>Description (Optional)</Label>
                  <Input
                    id='description'
                    value={meetingDescription}
                    onChange={(e) => {
                      return setMeetingDescription(e.target.value);
                    }}
                    placeholder='Brief description of the meeting'
                  />
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <div className='grid gap-2'>
                    <Label htmlFor='startTime'>Start Time</Label>
                    <Select value={meetingStartTime} onValueChange={setMeetingStartTime}>
                      <SelectTrigger id='startTime'>
                        <SelectValue placeholder='Select time' />
                      </SelectTrigger>
                      <SelectContent>
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
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='grid gap-2'>
                    <Label htmlFor='duration'>Duration</Label>
                    <Select value={meetingDuration} onValueChange={setMeetingDuration}>
                      <SelectTrigger id='duration'>
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

                <div className='grid gap-2'>
                  <Label htmlFor='location'>Location</Label>
                  <Input
                    id='location'
                    value={meetingLocation}
                    onChange={(e) => {
                      return setMeetingLocation(e.target.value);
                    }}
                    placeholder='Zoom, Conference Room, etc.'
                  />
                </div>

                <div className='grid gap-2'>
                  <Label htmlFor='client'>Client Email (Optional)</Label>
                  <Input
                    id='client'
                    type='email'
                    value={clientEmail}
                    onChange={(e) => {
                      return setClientEmail(e.target.value);
                    }}
                    placeholder='client@example.com'
                  />
                </div>

                <div className='grid gap-2'>
                  <Label>Team Members</Label>
                  <div className='flex flex-wrap gap-2'>
                    {teamMembers.map((member) => {
                      return (
                        <div key={member.id} className='flex items-center space-x-2'>
                          <Checkbox
                            id={`member-${member.id}`}
                            checked={selectedTeamMembers.includes(member.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedTeamMembers([...selectedTeamMembers, member.id]);
                              } else {
                                setSelectedTeamMembers(
                                  selectedTeamMembers.filter((id) => {
                                    return id !== member.id;
                                  }),
                                );
                              }
                            }}
                          />
                          <Label htmlFor={`member-${member.id}`} className='text-sm'>
                            {member.name} ({member.role})
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <DialogFooter className='flex-col sm:flex-row gap-2'>
                <Button type='submit'>Create Meeting</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Send Client Invite Dialog */}
        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogContent className='sm:max-w-[500px] max-h-[90vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>Send Client Invite</DialogTitle>
              <DialogDescription>
                Allow your client to book a meeting from your available times
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSendInvite}>
              <div className='grid gap-4 py-4'>
                <div className='grid gap-2'>
                  <Label htmlFor='clientEmail'>Client Email</Label>
                  <Input
                    id='clientEmail'
                    type='email'
                    value={clientEmail}
                    onChange={(e) => {
                      return setClientEmail(e.target.value);
                    }}
                    placeholder='client@example.com'
                    required
                  />
                </div>

                <div className='grid gap-2'>
                  <Label>Available Team Members</Label>
                  <div className='flex flex-wrap gap-2'>
                    {teamMembers.map((member) => {
                      return (
                        <div key={member.id} className='flex items-center space-x-2'>
                          <Checkbox
                            id={`invite-member-${member.id}`}
                            checked={selectedTeamMembers.includes(member.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedTeamMembers([...selectedTeamMembers, member.id]);
                              } else {
                                setSelectedTeamMembers(
                                  selectedTeamMembers.filter((id) => {
                                    return id !== member.id;
                                  }),
                                );
                              }
                            }}
                          />
                          <Label htmlFor={`invite-member-${member.id}`} className='text-sm'>
                            {member.name} ({member.role})
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className='grid gap-2'>
                  <Label>Date Range (Optional)</Label>
                  <div className='flex flex-col sm:flex-row items-center gap-2'>
                    <div className='w-full'>
                      <DatePicker
                        date={startDateRange}
                        setDate={setStartDateRange}
                        placeholder='Start date'
                      />
                    </div>
                    <span className='hidden sm:inline'>to</span>
                    <span className='inline sm:hidden my-1'>to</span>
                    <div className='w-full'>
                      <DatePicker
                        date={endDateRange}
                        setDate={setEndDateRange}
                        placeholder='End date'
                      />
                    </div>
                  </div>
                </div>

                <div className='grid gap-2'>
                  <Label htmlFor='meetingPurpose'>Meeting Purpose</Label>
                  <Input id='meetingPurpose' placeholder='Brief description of the meeting' />
                </div>

                <div className='grid gap-2'>
                  <Label htmlFor='meetingDuration'>Meeting Duration</Label>
                  <Select defaultValue='60'>
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
              <DialogFooter className='flex-col sm:flex-row gap-2'>
                <Button type='submit'>Send Invite</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Manage Availability Dialog */}
        <Dialog open={showAvailabilityDialog} onOpenChange={setShowAvailabilityDialog}>
          <DialogContent className='sm:max-w-[600px] max-h-[90vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>Manage Availability Settings</DialogTitle>
              <DialogDescription>
                Configure team availability and scheduling options
              </DialogDescription>
            </DialogHeader>
            <div className='py-4'>
              <Tabs defaultValue='general'>
                <TabsList className='w-full flex flex-wrap sm:flex-nowrap'>
                  <TabsTrigger value='general' className='flex-1'>
                    General Settings
                  </TabsTrigger>
                  <TabsTrigger value='team' className='flex-1'>
                    Team Availability
                  </TabsTrigger>
                  <TabsTrigger value='sync' className='flex-1'>
                    Calendar Sync
                  </TabsTrigger>
                </TabsList>

                <TabsContent value='general' className='mt-4 space-y-4'>
                  <div className='space-y-2'>
                    <h3 className='text-sm font-medium'>Meeting Duration Options</h3>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                      <div className='flex items-center space-x-2'>
                        <Checkbox id='duration30' defaultChecked />
                        <Label htmlFor='duration30'>30 minutes</Label>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <Checkbox id='duration60' defaultChecked />
                        <Label htmlFor='duration60'>1 hour</Label>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <Checkbox id='duration90' defaultChecked />
                        <Label htmlFor='duration90'>1.5 hours</Label>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <Checkbox id='duration120' defaultChecked />
                        <Label htmlFor='duration120'>2 hours</Label>
                      </div>
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <h3 className='text-sm font-medium'>Schedule Restrictions</h3>
                    <div className='space-y-2'>
                      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2'>
                        <Label htmlFor='min-notice'>Minimum notice (hours)</Label>
                        <Input
                          id='min-notice'
                          type='number'
                          className='w-full sm:w-20'
                          defaultValue={1}
                        />
                      </div>
                      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2'>
                        <Label htmlFor='max-days'>Maximum days in advance</Label>
                        <Input
                          id='max-days'
                          type='number'
                          className='w-full sm:w-20'
                          defaultValue={30}
                        />
                      </div>
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <h3 className='text-sm font-medium'>Buffer Time</h3>
                    <div className='space-y-2'>
                      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2'>
                        <Label htmlFor='buffer-before'>Before meetings (minutes)</Label>
                        <Input
                          id='buffer-before'
                          type='number'
                          className='w-full sm:w-20'
                          defaultValue={15}
                        />
                      </div>
                      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2'>
                        <Label htmlFor='buffer-after'>After meetings (minutes)</Label>
                        <Input
                          id='buffer-after'
                          type='number'
                          className='w-full sm:w-20'
                          defaultValue={15}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value='team' className='mt-4'>
                  <div className='space-y-4'>
                    <p className='text-sm text-gray-500'>
                      Configure when your team is available for meetings. Individual settings can be
                      managed in each team member&apos;s profile.
                    </p>

                    <div className='rounded-md border'>
                      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between border-b p-3 gap-2'>
                        <div className='font-medium'>Jane Smith</div>
                        <Button variant='outline' size='sm'>
                          View Calendar
                        </Button>
                      </div>
                      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between border-b p-3 gap-2'>
                        <div className='font-medium'>John Doe</div>
                        <Button variant='outline' size='sm'>
                          View Calendar
                        </Button>
                      </div>
                      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 gap-2'>
                        <div className='font-medium'>Sarah Johnson</div>
                        <Button variant='outline' size='sm'>
                          View Calendar
                        </Button>
                      </div>
                    </div>

                    <Button variant='outline' className='w-full'>
                      <Users className='mr-2 h-4 w-4' />
                      Add Team Member
                    </Button>
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
                          <CardTitle className='text-base'>Google Calendar</CardTitle>
                          <Button variant='outline' size='sm'>
                            Connect
                          </Button>
                        </div>
                      </CardHeader>
                    </Card>

                    <Card>
                      <CardHeader className='py-3'>
                        <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2'>
                          <CardTitle className='text-base'>Microsoft Outlook</CardTitle>
                          <Button variant='outline' size='sm'>
                            Connect
                          </Button>
                        </div>
                      </CardHeader>
                    </Card>

                    <Card>
                      <CardHeader className='py-3'>
                        <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2'>
                          <CardTitle className='text-base'>Apple Calendar</CardTitle>
                          <Button variant='outline' size='sm'>
                            Connect
                          </Button>
                        </div>
                      </CardHeader>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            <DialogFooter className='flex-col sm:flex-row gap-2'>
              <Button
                onClick={() => {
                  return setShowAvailabilityDialog(false);
                }}
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
