import { useProject } from '@/contexts/ProjectContext';
import { addMinutes } from 'date-fns';
import { useState } from 'react';

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

interface UseCreateMeetingProps {
  selectedDate: Date;
  onCreateMeeting: (e: React.FormEvent) => Promise<void>;
}

export function useCreateMeeting({ selectedDate, onCreateMeeting }: UseCreateMeetingProps) {
  const { project } = useProject();
  const [step, setStep] = useState(1);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(selectedDate);
  const [meetingStartTime, setMeetingStartTime] = useState('');
  const [selectedEndTime, setSelectedEndTime] = useState('');
  const [isAllDay, setIsAllDay] = useState(false);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>({
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
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>(
    project?.participants.map((p) => {
      return p._id;
    }) || [],
  );

  const handleAddParticipant = (participantId: string) => {
    if (!selectedTeamMembers.includes(participantId)) {
      setSelectedTeamMembers([...selectedTeamMembers, participantId]);
    }
  };

  const handleRemoveParticipant = (participantId: string) => {
    console.log('handleRemoveParticipant called with:', participantId);
    console.log('Current selectedTeamMembers:', selectedTeamMembers);
    setSelectedTeamMembers((prev) => {
      const newMembers = prev.filter((id) => {
        return id !== participantId;
      });
      console.log('New selectedTeamMembers:', newMembers);
      return newMembers;
    });
  };

  const handleAddManualEmail = () => {
    if (manualEmail && !selectedTeamMembers.includes(manualEmail)) {
      setSelectedTeamMembers([...selectedTeamMembers, manualEmail]);
      setManualEmail('');
      setShowManualEmailInput(false);
    }
  };

  const filteredParticipants = project?.participants.filter((participant) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      participant.name.toLowerCase().includes(searchLower) ||
      participant.email?.toLowerCase().includes(searchLower)
    );
  });

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
          return { ...prev!, to: date };
        });
      } else {
        setDateRange((prev) => {
          return { from: date, to: prev?.to || date };
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
    const startDate = new Date(dateRange?.from || selectedDate);
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

  return {
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
    handleAddParticipant,
    handleRemoveParticipant,
    handleAddManualEmail,
    handleNext,
    handleBack,
    handleSubmit,
    handleDateSelect,
    handleStartTimeSelect,
  };
}
