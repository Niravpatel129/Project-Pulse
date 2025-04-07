import { useProject } from '@/contexts/ProjectContext';
import { newRequest } from '@/utils/newRequest';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useGoogleIntegration } from './useGoogleIntegration';

type TeamMember = {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  availableTimes?: {
    day: string;
    slots: { start: string; end: string }[];
  }[];
};

interface UseCreateMeetingProps {
  selectedDate: Date;
}

export function useCreateMeeting({ selectedDate }: UseCreateMeetingProps) {
  const { project } = useProject();
  const queryClient = useQueryClient();
  const { isConnecting, googleStatus, handleConnect } = useGoogleIntegration();
  const [step, setStep] = useState(1);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(selectedDate);
  const [meetingStartTime, setMeetingStartTime] = useState('');
  const [selectedEndTime, setSelectedEndTime] = useState('');
  const [isAllDay, setIsAllDay] = useState(false);
  // const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
  //   from: selectedDate,
  //   to: selectedDate,
  // });
  const [fromDate, setFromDate] = useState<Date>(selectedDate);
  const [toDate, setToDate] = useState<Date>(selectedDate);
  const [searchQuery, setSearchQuery] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [showManualEmailInput, setShowManualEmailInput] = useState(false);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDescription, setMeetingDescription] = useState('');
  const [meetingType, setMeetingType] = useState('');
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]);
  const [meetingTypeDetails, setMeetingTypeDetails] = useState({
    videoPlatform: '',
    customLocation: '',
    phoneNumber: '',
  });
  const [filteredParticipants, setFilteredParticipants] = useState<TeamMember[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  console.log('🚀 errors:', errors);

  // Initialize selectedTeamMembers with project participants
  useEffect(() => {
    if (project?.clients) {
      setSelectedTeamMembers(
        project.clients.map((c) => {
          return c.user._id;
        }),
      );
    }
  }, [project?.clients]);

  // Update filtered participants when search query or project participants change
  useEffect(() => {
    if (!project?.clients) return;

    const searchLower = searchQuery.toLowerCase();
    const filtered = project.clients
      .map((c) => {
        return {
          _id: c.user._id,
          name: c.user.name,
          email: c.user.email || '',
          role: 'client',
          avatar: c.user.avatar,
          availableTimes: [],
        };
      })
      .filter((participant) => {
        return (
          participant.name.toLowerCase().includes(searchLower) ||
          participant.email.toLowerCase().includes(searchLower)
        );
      });
    setFilteredParticipants(filtered);
  }, [searchQuery, project?.clients]);

  // Initialize meetingTypeDetails when meetingType changes
  useEffect(() => {
    switch (meetingType) {
      case 'video':
        setMeetingTypeDetails({
          videoPlatform: 'google-meet',
          customLocation: '',
          phoneNumber: '',
        });
        break;
      case 'phone':
        setMeetingTypeDetails({
          videoPlatform: '',
          customLocation: '',
          phoneNumber: '',
        });
        break;
      case 'in-person':
      case 'other':
        setMeetingTypeDetails({
          videoPlatform: '',
          customLocation: '',
          phoneNumber: '',
        });
        break;
      default:
        setMeetingTypeDetails({
          videoPlatform: '',
          customLocation: '',
          phoneNumber: '',
        });
    }
  }, [meetingType]);

  const handleAddParticipant = (participantId: string) => {
    if (!selectedTeamMembers.includes(participantId)) {
      setSelectedTeamMembers([...selectedTeamMembers, participantId]);
    }
  };

  const handleRemoveParticipant = (participantId: string) => {
    setSelectedTeamMembers((prev) => {
      return prev.filter((id) => {
        return id !== participantId;
      });
    });
  };

  const handleAddManualEmail = () => {
    if (manualEmail && !selectedTeamMembers.includes(manualEmail)) {
      setSelectedTeamMembers([...selectedTeamMembers, manualEmail]);
      setManualEmail('');
      setShowManualEmailInput(false);
    }
  };

  const handleNext = () => {
    if (step === 1 && !meetingTitle) return;
    if (step === 2 && (!meetingStartTime || !selectedEndTime)) return;
    if (step === 3 && selectedTeamMembers.length === 0) return;

    setStep((prev) => {
      return Math.min(prev + 1, 3);
    });
  };

  const handleBack = () => {
    setStep((prev) => {
      return Math.max(prev - 1, 1);
    });
  };

  const createMeetingMutation = useMutation({
    mutationFn: async () => {
      const response = await newRequest.post('/schedule/book', {
        title: meetingTitle,
        type: meetingType,
        duration: (parseInt(selectedEndTime) - parseInt(meetingStartTime)) * 60,
        participants: selectedTeamMembers,
        startTime: meetingStartTime,
        endTime: selectedEndTime,
        videoPlatform: meetingTypeDetails.videoPlatform,
        customLocation: meetingTypeDetails.customLocation,
        phoneNumber: meetingTypeDetails.phoneNumber,
        fromDate: fromDate,
        toDate: toDate,
        projectId: project?._id,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Meeting created successfully');

      queryClient.invalidateQueries({ queryKey: ['schedule', project?._id] });
    },
    onError: (error) => {
      console.error('🚀 error:', error);
      toast.error('Failed to create meeting');
    },
  });

  const handleSubmit = async ({ onOpenChange, event }) => {
    event.preventDefault();

    // Create a new errors object instead of updating the existing one multiple times
    const newErrors = {
      meetingTitle: '',
      meetingType: '',
      meetingDuration: '',
      selectedTeamMembers: '',
      meetingStartTime: '',
      selectedEndTime: '',
      fromDate: '',
      toDate: '',
      phoneNumber: '',
      videoPlatform: '',
      customLocation: '',
    };

    // phone number only required if meeting type is phone
    if (meetingType === 'phone') {
      if (!meetingTypeDetails.phoneNumber) {
        newErrors.phoneNumber = 'Phone number is required';
      }
    }

    if (meetingType === 'video') {
      if (!meetingTypeDetails.videoPlatform || meetingTypeDetails.videoPlatform === '') {
        newErrors.videoPlatform = 'Video platform is required';
      }
    }

    if (meetingType === 'in-person' || meetingType === 'other') {
      if (!meetingTypeDetails.customLocation || meetingTypeDetails.customLocation === '') {
        newErrors.customLocation = 'Custom location is required';
      }
    }

    // Validate required fields
    if (!meetingTitle) {
      newErrors.meetingTitle = 'Meeting title is required';
    }

    if (!meetingType) {
      newErrors.meetingType = 'Meeting type is required';
    }

    if (selectedTeamMembers.length === 0) {
      newErrors.selectedTeamMembers = 'At least one participant is required';
    }

    if (!isAllDay && !meetingStartTime) {
      newErrors.meetingStartTime = 'Meeting start time is required';
    }

    if (!isAllDay && !selectedEndTime) {
      newErrors.selectedEndTime = 'Meeting end time is required';
    }

    if (!fromDate) {
      newErrors.fromDate = 'From date is required';
    }

    if (!toDate) {
      newErrors.toDate = 'To date is required';
    }

    const filteredErrors = Object.fromEntries(
      Object.entries(newErrors).filter(([_, value]) => {
        return value !== '';
      }),
    );

    setErrors(filteredErrors);

    if (Object.values(filteredErrors).length > 0) {
      return;
    } else {
      try {
        const duration = parseInt(selectedEndTime) - parseInt(meetingStartTime);

        if (duration <= 0) {
          toast.error('Meeting duration cannot be negative');
          return;
        }

        await createMeetingMutation.mutateAsync();
        onOpenChange(false);
      } catch (error) {
        console.error('🚀 error:', error);
      }
    }
  };

  const handleAllDayChange = (checked: boolean) => {
    setIsAllDay(checked);
    if (checked) {
      setMeetingStartTime('');
      setSelectedEndTime('');
    }
  };

  return {
    // State
    step,
    showCalendar,
    currentMonth,
    meetingStartTime,
    selectedEndTime,
    isAllDay,
    searchQuery,
    manualEmail,
    showManualEmailInput,
    meetingTitle,
    meetingDescription,
    meetingType,
    selectedTeamMembers,
    meetingTypeDetails,
    filteredParticipants,
    isConnecting,
    googleStatus,
    fromDate,
    toDate,

    // Setters
    setShowCalendar,
    setCurrentMonth,
    setMeetingStartTime,
    setSelectedEndTime,
    setIsAllDay,
    setFromDate,
    setToDate,
    setSearchQuery,
    setManualEmail,
    setShowManualEmailInput,
    setMeetingTitle,
    setMeetingDescription,
    setMeetingType,
    setSelectedTeamMembers,
    setMeetingTypeDetails,
    setErrors,

    // Handlers
    handleAddParticipant,
    handleRemoveParticipant,
    handleAddManualEmail,
    handleNext,
    handleBack,
    handleSubmit,
    handleAllDayChange,
    handleConnect,

    // errors
    errors,
  };
}
