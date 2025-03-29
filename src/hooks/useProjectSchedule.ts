import { useProject } from '@/contexts/ProjectContext';
import { newRequest } from '@/utils/newRequest';
import { format, parseISO } from 'date-fns';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type TeamMember = {
  _id: string;
  name: string;
  email: string;
  role: string;
  availableTimes: {
    day: string;
    slots: { start: string; end: string }[];
  }[];
};

type APIMeeting = {
  _id: string;
  meetingPurpose: string;
  meetingDuration: number;
  videoPlatform?: string;
  meetLink?: string;
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

export function useProjectSchedule() {
  const { project } = useProject();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showMeetingDialog, setShowMeetingDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showAvailabilityDialog, setShowAvailabilityDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [meetingToDelete, setMeetingToDelete] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('upcoming');
  const [meetings, setMeetings] = useState<TransformedMeeting[]>([]);
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
      if (!project?._id) return;

      try {
        const response = await newRequest.get(`/schedule?projectId=${project._id}`);
        const fetchedMeetings = response.data.data.bookingRequests.map(
          (meeting: APIMeeting): TransformedMeeting => {
            console.log('🚀 meeting:', meeting);
            return {
              _id: meeting._id,
              title: meeting.meetingPurpose,
              description: '',
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
                videoLink: meeting.meetLink || '',
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
        _id: 'current-user-id',
        name: 'Current User',
        email: 'current@example.com',
      },
      type: meetingType,
      typeDetails: meetingTypeDetails,
    };

    try {
      const response = await newRequest.post('/meetings', {
        projectId: project?._id,
        meeting: newMeeting,
      });

      const createdMeeting = response.data;
      setMeetings([
        ...meetings,
        {
          _id: createdMeeting._id,
          title: createdMeeting.title,
          description: createdMeeting.description,
          date: createdMeeting.date.split('T')[0],
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
      await newRequest.delete(`/meetings/${meetingId}`);
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

  return {
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
  };
}
