import { useProject } from '@/contexts/ProjectContext';
import { addMinutes } from 'date-fns';
import { useCallback, useEffect, useMemo, useState } from 'react';

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
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>(
    project?.participants.map((p) => {
      return p._id;
    }) || [],
  );
  const [meetingTypeDetails, setMeetingTypeDetails] = useState<{
    videoPlatform?: string;
    customLocation?: string;
    phoneNumber?: string;
  }>({});

  // Initialize meetingTypeDetails when meetingType changes
  useEffect(() => {
    const newDetails =
      {
        video: { videoPlatform: 'google-meet', customLocation: '' },
        phone: { phoneNumber: '' },
        'in-person': { customLocation: '' },
        other: { customLocation: '' },
      }[meetingType] || {};

    setMeetingTypeDetails(newDetails);
  }, [meetingType]);

  const handleAddParticipant = useCallback((participantId: string) => {
    setSelectedTeamMembers((prev) => {
      return prev.includes(participantId) ? prev : [...prev, participantId];
    });
  }, []);

  const handleRemoveParticipant = useCallback((participantId: string) => {
    setSelectedTeamMembers((prev) => {
      return prev.filter((id) => {
        return id !== participantId;
      });
    });
  }, []);

  const handleAddManualEmail = useCallback(() => {
    if (manualEmail && !selectedTeamMembers.includes(manualEmail)) {
      setSelectedTeamMembers((prev) => {
        return [...prev, manualEmail];
      });
      setManualEmail('');
      setShowManualEmailInput(false);
    }
  }, [manualEmail, selectedTeamMembers]);

  const filteredParticipants = useMemo(() => {
    if (!project?.participants || !searchQuery) return project?.participants || [];

    const searchLower = searchQuery.toLowerCase();
    return project.participants.filter((participant) => {
      return (
        participant.name.toLowerCase().includes(searchLower) ||
        participant.email?.toLowerCase().includes(searchLower)
      );
    });
  }, [project?.participants, searchQuery]);

  const handleNext = useCallback(() => {
    if (step === 1 && !meetingTitle) return;
    if (step === 2 && (!meetingStartTime || !selectedEndTime)) return;
    if (step === 3 && selectedTeamMembers.length === 0) return;

    setStep((prev) => {
      return Math.min(prev + 1, 3);
    });
  }, [step, meetingTitle, meetingStartTime, selectedEndTime, selectedTeamMembers.length]);

  const handleBack = useCallback(() => {
    setStep((prev) => {
      return Math.max(prev - 1, 1);
    });
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      await onCreateMeeting(e);
    },
    [onCreateMeeting],
  );

  const handleDateSelect = useCallback(
    (date: Date | undefined, isEndDate: boolean = false) => {
      if (!date) return;

      setDateRange((prev) => {
        if (isEndDate) {
          return { ...prev, to: date };
        }
        return { from: date, to: prev.to };
      });

      if (!isAllDay) {
        setMeetingStartTime('');
        setSelectedEndTime('');
      }
    },
    [isAllDay],
  );

  const handleStartTimeSelect = useCallback(
    (time: string) => {
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
    },
    [dateRange.from, meetingDuration],
  );

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
    meetingTypeDetails,
    filteredParticipants,
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
