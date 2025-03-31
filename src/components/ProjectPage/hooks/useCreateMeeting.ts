import { useProject } from '@/contexts/ProjectContext';
import { addMinutes } from 'date-fns';
import { useEffect, useState } from 'react';
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
  onCreateMeeting: (e: React.FormEvent) => Promise<void>;
}

export function useCreateMeeting({ selectedDate, onCreateMeeting }: UseCreateMeetingProps) {
  const { project } = useProject();
  const { isConnecting, googleStatus, handleConnect } = useGoogleIntegration();
  const [step, setStep] = useState(1);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(selectedDate);
  const [meetingStartTime, setMeetingStartTime] = useState('');
  const [selectedEndTime, setSelectedEndTime] = useState('');
  const [isAllDay, setIsAllDay] = useState(false);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: selectedDate,
    to: selectedDate,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [showManualEmailInput, setShowManualEmailInput] = useState(false);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDescription, setMeetingDescription] = useState('');
  const [meetingType, setMeetingType] = useState('');
  const [meetingDuration, setMeetingDuration] = useState('30');
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]);
  const [meetingTypeDetails, setMeetingTypeDetails] = useState({
    videoPlatform: '',
    customLocation: '',
    phoneNumber: '',
  });
  const [filteredParticipants, setFilteredParticipants] = useState<TeamMember[]>([]);

  // Initialize selectedTeamMembers with project participants
  useEffect(() => {
    if (project?.participants) {
      setSelectedTeamMembers(
        project.participants.map((p) => {
          return p._id;
        }),
      );
    }
  }, [project?.participants]);

  // Update filtered participants when search query or project participants change
  useEffect(() => {
    if (!project?.participants) return;

    const searchLower = searchQuery.toLowerCase();
    const filtered = project.participants
      .map((p) => {
        return {
          _id: p._id,
          name: p.name,
          email: p.email || '',
          role: p.role,
          avatar: p.avatar,
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
  }, [searchQuery, project?.participants]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreateMeeting(e);
  };

  const handleDateSelect = (date: Date | undefined, isEndDate: boolean = false) => {
    if (date) {
      if (isEndDate) {
        setDateRange((prev) => {
          return { ...prev, to: date };
        });
      } else {
        setDateRange((prev) => {
          return { from: date, to: prev.to };
        });
      }
      if (!isAllDay) {
        setMeetingStartTime('');
        setSelectedEndTime('');
      }
    }
  };

  const handleStartTimeSelect = (time: string) => {
    setMeetingStartTime(time);
    const [hours, minutes] = time.split(':').map(Number);
    const startDate = new Date(dateRange.from);
    startDate.setHours(hours, minutes, 0, 0);

    const duration = parseInt(meetingDuration) || 30;
    const endDate = addMinutes(startDate, duration);
    setSelectedEndTime(
      endDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
    );
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
    dateRange,
    searchQuery,
    manualEmail,
    showManualEmailInput,
    meetingTitle,
    meetingDescription,
    meetingType,
    meetingDuration,
    selectedTeamMembers,
    meetingTypeDetails,
    filteredParticipants,
    isConnecting,
    googleStatus,

    // Setters
    setShowCalendar,
    setCurrentMonth,
    setMeetingStartTime,
    setSelectedEndTime,
    setIsAllDay,
    setDateRange,
    setSearchQuery,
    setManualEmail,
    setShowManualEmailInput,
    setMeetingTitle,
    setMeetingDescription,
    setMeetingType,
    setMeetingDuration,
    setSelectedTeamMembers,
    setMeetingTypeDetails,

    // Handlers
    handleAddParticipant,
    handleRemoveParticipant,
    handleAddManualEmail,
    handleNext,
    handleBack,
    handleSubmit,
    handleDateSelect,
    handleStartTimeSelect,
    handleAllDayChange,
    handleConnect,
  };
}
