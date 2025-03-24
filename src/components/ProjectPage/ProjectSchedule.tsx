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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useProject } from '@/contexts/ProjectContext';
import { newRequest } from '@/utils/newRequest';
import { addHours, format, parseISO } from 'date-fns';
import { CalendarIcon, Clock, MoreHorizontal, Plus, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Calendar } from '../ui/calendar';

type TeamMember = {
  _id: string;
  name: string;
  email: string;
  role: string;
  availableTimes: {
    day: string; // 'monday', 'tuesday', etc.
    slots: { start: string; end: string }[];
  }[];
};

type MeetingParticipant = {
  _id: string;
  name?: string;
  email?: string;
};

type Meeting = {
  _id: string;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  location?: string;
  status: 'pending' | 'scheduled' | 'completed' | 'cancelled';
  type: string;
  typeDetails: {
    videoType?: string;
    videoLink?: string;
    phoneNumber?: string;
    location?: string;
    otherDetails?: string;
  };
  project?: string;
  organizer?: {
    _id: string;
    email: string;
  };
  clientEmail?: string;
  participants: string[];
};

type APIResponse = {
  _id: string;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  location?: string;
  status: 'pending' | 'scheduled' | 'completed' | 'cancelled';
  type?: string;
  typeDetails?: {
    videoType?: string;
    videoLink?: string;
    phoneNumber?: string;
    location?: string;
    otherDetails?: string;
  };
  organizer?: {
    _id: string;
    email: string;
  };
  participants?: MeetingParticipant[];
};

export default function ProjectSchedule() {
  const { project } = useProject();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showMeetingDialog, setShowMeetingDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showAvailabilityDialog, setShowAvailabilityDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [meetingToDelete, setMeetingToDelete] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('upcoming');
  const [startDateRange, setStartDateRange] = useState<Date | undefined>(new Date());
  const [endDateRange, setEndDateRange] = useState<Date | undefined>(addHours(new Date(), 30 * 24));

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      _id: '1',
      name: project?.participants?.[0]?.name || 'Jane Smith',
      email: project?.participants?.[0]?.email || 'jane@example.com',
      role: project?.participants?.[0]?.role || 'Project Manager',
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
      _id: '2',
      name: project?.participants?.[1]?.name || 'John Doe',
      email: project?.participants?.[1]?.email || 'john@example.com',
      role: project?.participants?.[1]?.role || 'Designer',
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
      _id: '3',
      name: project?.participants?.[2]?.name || 'Sarah Johnson',
      email: project?.participants?.[2]?.email || 'sarah@example.com',
      role: project?.participants?.[2]?.role || 'Developer',
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

  // Update team members when project data changes
  useEffect(() => {
    if (project?.participants && project.participants.length > 0) {
      const updatedTeamMembers = project.participants.map((participant, index) => {
        return {
          _id: participant._id,
          name: participant.name,
          email: participant.email || `participant${index}@example.com`,
          role: participant.role,
          availableTimes: [
            {
              day: 'monday',
              slots: [{ start: '09:00', end: '17:00' }],
            },
            {
              day: 'tuesday',
              slots: [{ start: '09:00', end: '17:00' }],
            },
            {
              day: 'wednesday',
              slots: [{ start: '09:00', end: '17:00' }],
            },
            {
              day: 'thursday',
              slots: [{ start: '09:00', end: '17:00' }],
            },
            {
              day: 'friday',
              slots: [{ start: '09:00', end: '17:00' }],
            },
          ],
        };
      });
      setTeamMembers(updatedTeamMembers);
    }
  }, [project]);

  const [meetings, setMeetings] = useState<Meeting[]>([]);

  // Fetch meetings from API
  useEffect(() => {
    const fetchMeetings = async () => {
      console.log('fetching meetings');
      if (!project?._id) return;

      try {
        const response = await newRequest.get(`/meetings?projectId=${project._id}`);
        const fetchedMeetings = response.data.map((meeting: APIResponse) => {
          return {
            _id: meeting._id,
            title: meeting.title,
            description: meeting.description,
            date: meeting.date.split('T')[0], // Extract date part only
            startTime: meeting.startTime,
            endTime: meeting.endTime,
            status: meeting.status,
            clientEmail: meeting.organizer?.email,
            participants:
              meeting.participants?.map((p) => {
                return p._id;
              }) || [],
            type: meeting.type || 'other',
            typeDetails: meeting.typeDetails || {
              videoType: '',
              videoLink: '',
              phoneNumber: '',
              location: meeting.location || '',
              otherDetails: '',
            },
          };
        });
        setMeetings(fetchedMeetings);
      } catch (error) {
        console.error('Error fetching meetings:', error);
      }
    };

    fetchMeetings();
  }, [project]);

  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDescription, setMeetingDescription] = useState('');
  const [meetingStartTime, setMeetingStartTime] = useState('09:00');
  const [meetingDuration, setMeetingDuration] = useState('60');
  const [meetingType, setMeetingType] = useState<'inperson' | 'phone' | 'video' | 'other'>('other');
  const [meetingTypeDetails, setMeetingTypeDetails] = useState<{
    videoType?: string;
    videoLink?: string;
    phoneNumber?: string;
    location?: string;
    otherDetails?: string;
  }>({
    videoType: '',
    videoLink: '',
    phoneNumber: '',
    location: '',
    otherDetails: '',
  });
  const [clientEmail, setClientEmail] = useState('');

  // Set all team members as selected when opening the meeting dialog
  useEffect(() => {
    if (showMeetingDialog) {
      const allTeamMemberIds = teamMembers.map((member) => {
        return member._id;
      });
      setSelectedTeamMembers(allTeamMemberIds);
    }
  }, [showMeetingDialog, teamMembers]);

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();

    // Calculate end time based on start time and duration
    const [startHour, startMinute] = meetingStartTime.split(':').map(Number);
    const durationMinutes = parseInt(meetingDuration);

    const endHour = Math.floor((startHour * 60 + startMinute + durationMinutes) / 60) % 24;
    const endMinute = (startMinute + durationMinutes) % 60;

    const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute
      .toString()
      .padStart(2, '0')}`;

    // Check if selected team members are available at this time
    const dayOfWeek = format(selectedDate, 'EEEE').toLowerCase();
    const unavailableMembers = selectedTeamMembers.filter((memberId) => {
      const member = teamMembers.find((m) => {
        return m._id === memberId;
      });
      if (!member) return false;

      // Check if member has availability for this day
      const dayAvailability = member.availableTimes.find((a) => {
        return a.day === dayOfWeek;
      });
      if (!dayAvailability) return true; // Not available on this day

      // Check if meeting time falls within available slots
      return !dayAvailability.slots.some((slot) => {
        const slotStart = slot.start.split(':').map(Number);
        const slotEnd = slot.end.split(':').map(Number);
        const meetingStartMinutes = startHour * 60 + startMinute;
        const meetingEndMinutes = endHour * 60 + endMinute;
        const slotStartMinutes = slotStart[0] * 60 + slotStart[1];
        const slotEndMinutes = slotEnd[0] * 60 + slotEnd[1];

        return meetingStartMinutes >= slotStartMinutes && meetingEndMinutes <= slotEndMinutes;
      });
    });

    if (unavailableMembers.length > 0) {
      const unavailableNames = unavailableMembers
        .map((id) => {
          return teamMembers.find((m) => {
            return m._id === id;
          })?.name;
        })
        .join(', ');

      toast.error(`Some team members are not available at this time: ${unavailableNames}`);
      return;
    }

    const newMeeting = {
      _id: Date.now().toString(),
      title: meetingTitle,
      description: meetingDescription,
      date: format(selectedDate, 'yyyy-MM-dd'),
      startTime: meetingStartTime,
      endTime,
      status: 'scheduled',
      clientEmail: clientEmail || undefined,
      participants: selectedTeamMembers,
      type: meetingType,
      typeDetails: meetingTypeDetails,
    };

    try {
      // Make API call to create a new meeting
      const response = await newRequest.post('/meetings', {
        projectId: project?._id,
        meeting: newMeeting,
      });

      // Update local state with the new meeting from API response
      const createdMeeting = response.data;
      setMeetings([
        ...meetings,
        {
          _id: createdMeeting._id,
          title: createdMeeting.title,
          description: createdMeeting.description,
          date: createdMeeting.date.split('T')[0], // Extract date part only
          startTime: createdMeeting.startTime,
          endTime: createdMeeting.endTime,
          status: createdMeeting.status,
          clientEmail: createdMeeting.organizer?.email,
          participants: selectedTeamMembers,
          type: createdMeeting.type,
          typeDetails: createdMeeting.typeDetails,
        },
      ]);
      resetMeetingForm();
      setShowMeetingDialog(false);
    } catch (error) {
      console.error('Error creating meeting:', error);
      toast.error('Failed to create meeting. Please try again.');
    }
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to send invitation email to client
    // In a real app, this would call an API endpoint

    toast.error(`Invitation sent to ${clientEmail}`);
    setShowInviteDialog(false);
  };

  const handleDeleteMeeting = async (meetingId: string) => {
    try {
      // Make API call to delete the meeting
      await newRequest.delete(`/meetings/${meetingId}`);

      // Update local state by removing the deleted meeting
      setMeetings(
        meetings.filter((meeting) => {
          return meeting._id !== meetingId;
        }),
      );
      toast.success('Meeting deleted successfully');
    } catch (error) {
      console.error('Error deleting meeting:', error);
      toast.error('Failed to delete meeting. Please try again.');
    } finally {
      setMeetingToDelete(null);
      setShowDeleteDialog(false);
    }
  };

  const resetMeetingForm = () => {
    setMeetingTitle('');
    setMeetingDescription('');
    setMeetingStartTime('09:00');
    setMeetingDuration('60');
    setMeetingType('other');
    setMeetingTypeDetails({
      videoType: '',
      videoLink: '',
      phoneNumber: '',
      location: '',
      otherDetails: '',
    });
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
    console.log('🚀 meetings:', meetings);
    switch (activeTab) {
      case 'all':
        return meetings;
      case 'scheduled':
        return meetings.filter((meeting) => {
          const meetingDate = parseISO(meeting.date);
          return meetingDate >= new Date() && meeting.status !== 'cancelled';
        });
      case 'pending':
        return meetings.filter((meeting) => {
          return meeting.status === 'pending';
        });
      case 'past':
        return meetings.filter((meeting) => {
          const meetingDate = parseISO(meeting.date);
          return meetingDate < new Date() || meeting.status === 'cancelled';
        });
      default:
        return meetings;
    }
  };

  return (
    <div className='container'>
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

                  {/* <Button
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
                  </Button> */}
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
                            {meeting.type && (
                              <div className='text-sm text-gray-600'>
                                {meeting.type.charAt(0).toUpperCase() + meeting.type.slice(1)}
                                {meeting.typeDetails && (
                                  <>
                                    {meeting.type === 'video' && meeting.typeDetails.videoType && (
                                      <span className='ml-1'>
                                        • {meeting.typeDetails.videoType}
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
                            <h4 className='text-sm font-medium text-gray-600'>Participants</h4>
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
                                <DropdownMenuItem
                                  onClick={() => {
                                    setMeetingToDelete(meeting._id);
                                    setShowDeleteDialog(true);
                                    handleDeleteMeeting(meeting._id);
                                  }}
                                >
                                  Delete Meeting
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

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
                              {meeting.participants.map((memberId) => {
                                const member = teamMembers.find((m) => {
                                  return m._id === memberId;
                                });
                                return (
                                  <Tooltip key={memberId}>
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
                    placeholder={`${
                      project?.name.charAt(0).toUpperCase() + project?.name.slice(1) || 'Project'
                    } Discussion`}
                    required
                  />
                </div>

                <div className='grid gap-2'>
                  <Label htmlFor='description'>Description</Label>
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
                  <Label htmlFor='type'>Meeting Type</Label>
                  <Select
                    value={meetingType}
                    onValueChange={(value: 'inperson' | 'phone' | 'video' | 'other') => {
                      setMeetingType(value);
                      // Reset details when type changes but maintain controlled inputs
                      setMeetingTypeDetails({
                        videoType: '',
                        videoLink: '',
                        phoneNumber: '',
                        location: '',
                        otherDetails: '',
                      });
                    }}
                  >
                    <SelectTrigger id='type'>
                      <SelectValue placeholder='Select meeting type' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='inperson'>In Person</SelectItem>
                      <SelectItem value='phone'>Phone Call</SelectItem>
                      <SelectItem value='video'>Video Call</SelectItem>
                      <SelectItem value='other'>Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Dynamic fields based on meeting type */}
                {meetingType === 'video' && (
                  <div className='space-y-4'>
                    <div className='grid gap-2'>
                      <Label htmlFor='videoType'>Video Platform</Label>
                      <Select
                        value={meetingTypeDetails.videoType || ''}
                        onValueChange={(value) => {
                          return setMeetingTypeDetails({ ...meetingTypeDetails, videoType: value });
                        }}
                      >
                        <SelectTrigger id='videoType'>
                          <SelectValue placeholder='Select video platform' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='zoom'>Zoom</SelectItem>
                          <SelectItem value='google-meet'>Google Meet</SelectItem>
                          <SelectItem value='teams'>Microsoft Teams</SelectItem>
                          <SelectItem value='other'>Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className='grid gap-2'>
                      <Label htmlFor='videoLink'>Meeting Link</Label>
                      <Input
                        id='videoLink'
                        value={meetingTypeDetails.videoLink || ''}
                        onChange={(e) => {
                          return setMeetingTypeDetails({
                            ...meetingTypeDetails,
                            videoLink: e.target.value,
                          });
                        }}
                        placeholder='https://...'
                      />
                    </div>
                  </div>
                )}

                {meetingType === 'phone' && (
                  <div className='grid gap-2'>
                    <Label htmlFor='phoneNumber'>Phone Number</Label>
                    <Input
                      id='phoneNumber'
                      value={meetingTypeDetails.phoneNumber || ''}
                      onChange={(e) => {
                        return setMeetingTypeDetails({
                          ...meetingTypeDetails,
                          phoneNumber: e.target.value,
                        });
                      }}
                      placeholder='+1 (555) 555-5555'
                    />
                  </div>
                )}

                {meetingType === 'inperson' && (
                  <div className='grid gap-2'>
                    <Label htmlFor='location'>Location</Label>
                    <Input
                      id='location'
                      value={meetingTypeDetails.location || ''}
                      onChange={(e) => {
                        return setMeetingTypeDetails({
                          ...meetingTypeDetails,
                          location: e.target.value,
                        });
                      }}
                      placeholder='Office address or meeting room'
                    />
                  </div>
                )}

                {meetingType === 'other' && (
                  <div className='grid gap-2'>
                    <Label htmlFor='otherDetails'>Additional Details</Label>
                    <Input
                      id='otherDetails'
                      value={meetingTypeDetails.otherDetails}
                      onChange={(e) => {
                        return setMeetingTypeDetails({
                          ...meetingTypeDetails,
                          otherDetails: e.target.value,
                        });
                      }}
                      placeholder='Specify meeting details'
                    />
                  </div>
                )}

                <div className='grid gap-2'>
                  <Label>Team Members</Label>
                  <div className='flex flex-wrap gap-2'>
                    {teamMembers.map((member) => {
                      return (
                        <div key={member._id} className='flex items-center space-x-2'>
                          <Checkbox
                            id={`member-${member._id}`}
                            checked={selectedTeamMembers.includes(member._id)}
                            defaultChecked={true}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedTeamMembers([...selectedTeamMembers, member._id]);
                              } else {
                                setSelectedTeamMembers(
                                  selectedTeamMembers.filter((id) => {
                                    return id !== member._id;
                                  }),
                                );
                              }
                            }}
                          />
                          <Label htmlFor={`member-${member._id}`} className='text-sm'>
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
                        <div key={member._id} className='flex items-center space-x-2'>
                          <Checkbox
                            id={`invite-member-${member._id}`}
                            checked={selectedTeamMembers.includes(member._id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedTeamMembers([...selectedTeamMembers, member._id]);
                              } else {
                                setSelectedTeamMembers(
                                  selectedTeamMembers.filter((id) => {
                                    return id !== member._id;
                                  }),
                                );
                              }
                            }}
                          />
                          <Label htmlFor={`invite-member-${member._id}`} className='text-sm'>
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
                  <Input
                    id='meetingPurpose'
                    placeholder={`Discuss ${project?.name || 'project'} details`}
                  />
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
