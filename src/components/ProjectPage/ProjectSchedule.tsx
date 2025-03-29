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
import { newRequest } from '@/utils/newRequest';
import { format, parseISO } from 'date-fns';
import { CalendarIcon, Clock, Mail, MoreHorizontal, Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Calendar } from '../ui/calendar';
import ClientInviteDialog from './ClientInviteDialog';
import CreateMeetingDialog from './CreateMeetingDialog';
import ManageAvailabilityDialog from './ManageAvailabilityDialog';

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

type APIMeeting = {
  _id: string;
  meetingPurpose: string;
  meetingDuration: number;
  videoPlatform?: string;
  dateRange: {
    start: string;
    end: string;
  };
  meetingLocation: string;
  status: 'pending' | 'scheduled' | 'completed' | 'cancelled';
  scheduledTime: string | null;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
};

type TransformedMeeting = {
  _id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'scheduled' | 'completed' | 'cancelled';
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  type: string;
  typeDetails: {
    videoType: string;
    videoLink: string;
    phoneNumber: string;
    location: string;
    otherDetails: string;
  };
  createdAt: string;
  meetingDuration: number;
};

type APIResponse = {
  status: string;
  data: {
    bookingRequests: APIMeeting[];
  };
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
  const [meetings, setMeetings] = useState<TransformedMeeting[]>([]);

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

  // Fetch meetings from API
  useEffect(() => {
    const fetchMeetings = async () => {
      console.log('fetching meetings');
      if (!project?._id) return;

      try {
        const response = await newRequest.get(`/schedule?projectId=${project._id}`);
        console.log('🚀 response:', response);
        const fetchedMeetings = response.data.data.bookingRequests.map(
          (meeting: APIMeeting): TransformedMeeting => {
            return {
              _id: meeting._id,
              title: meeting.meetingPurpose,
              description: '', // No description in new format
              date: meeting.scheduledTime
                ? meeting.scheduledTime.split('T')[0]
                : meeting.dateRange.start.split('T')[0],
              startTime: meeting.scheduledTime
                ? meeting.scheduledTime.split('T')[1].substring(0, 5)
                : '09:00',
              endTime: meeting.scheduledTime
                ? new Date(
                    new Date(meeting.scheduledTime).getTime() + meeting.meetingDuration * 60000,
                  )
                    .toISOString()
                    .split('T')[1]
                    .substring(0, 5)
                : '10:00',
              status: meeting.status,
              createdBy: meeting.createdBy,
              type: meeting.meetingLocation,
              typeDetails: {
                videoType: meeting.videoPlatform,
                videoLink: '',
                phoneNumber: '',
                location: '',
                otherDetails: '',
              },
              createdAt: meeting.createdAt,
              meetingDuration: meeting.meetingDuration,
            };
          },
        );
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
  const [meetingType, setMeetingType] = useState<string>('');
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

    const newMeeting = {
      _id: Date.now().toString(),
      title: meetingTitle,
      description: meetingDescription,
      date: format(selectedDate, 'yyyy-MM-dd'),
      startTime: meetingStartTime,
      endTime,
      status: 'scheduled',
      createdBy: {
        _id: 'current-user-id', // TODO: Get actual user ID
        name: 'Current User', // TODO: Get actual user name
        email: 'current@example.com', // TODO: Get actual user email
      },
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
          createdBy: createdMeeting.createdBy,
          type: createdMeeting.type,
          typeDetails: createdMeeting.typeDetails,
          createdAt: createdMeeting.createdAt,
          meetingDuration: createdMeeting.meetingDuration,
        },
      ]);
      resetMeetingForm();
      setShowMeetingDialog(false);
    } catch (error) {
      console.error('Error creating meeting:', error);
      toast.error('Failed to create meeting. Please try again.');
    }
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
    switch (activeTab) {
      case 'all':
        return meetings;
      case 'scheduled':
        return meetings.filter((meeting) => {
          if (!meeting.date) return false;
          const meetingDate = parseISO(meeting.date);
          return meetingDate >= new Date() && meeting.status !== 'cancelled';
        });
      case 'pending':
        return meetings.filter((meeting) => {
          return meeting.status === 'pending';
        });
      case 'past':
        return meetings.filter((meeting) => {
          if (!meeting.date) return false;
          const meetingDate = parseISO(meeting.date);
          return meetingDate < new Date() || meeting.status === 'cancelled';
        });
      default:
        return meetings;
    }
  };

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

  const handleResendRequest = async (meetingId: string) => {
    try {
      // TODO: Implement resend request API call
      toast.success('Request resent successfully');
    } catch (error) {
      console.error('Error resending request:', error);
      toast.error('Failed to resend request');
    }
  };

  const handleDeleteRequest = async (meetingId: string) => {
    try {
      await newRequest.delete(`/meetings/${meetingId}`);
      setMeetings(
        meetings.filter((meeting) => {
          return meeting._id !== meetingId;
        }),
      );
      toast.success('Request deleted successfully');
    } catch (error) {
      console.error('Error deleting request:', error);
      toast.error('Failed to delete request');
    }
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
