import { newRequest } from '@/utils/newRequest';
import { useMutation, useQuery } from '@tanstack/react-query';
import { addHours, isBefore, isValid } from 'date-fns';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

type UseClientInviteFormProps = {
  projectName?: string;
  projectId?: string;
  onSuccess: () => void;
};

type IntegrationStatus = {
  isConnected: boolean;
  platform: 'google' | 'zoom';
};

type UseClientInviteFormReturn = {
  // Form state
  startDateRange: Date | undefined;
  setStartDateRange: (date: Date | undefined) => void;
  endDateRange: Date | undefined;
  setEndDateRange: (date: Date | undefined) => void;
  selectedClientEmails: string[];
  setSelectedClientEmails: (emails: string[]) => void;
  meetingPurpose: string;
  setMeetingPurpose: (purpose: string) => void;
  meetingLocation: string;
  setMeetingLocation: (location: string) => void;
  videoPlatform: string;
  setVideoPlatform: (platform: string) => void;
  phoneNumber: string;
  setPhoneNumber: (number: string) => void;
  phoneNumberType: string;
  setPhoneNumberType: (type: string) => void;
  customLocation: string;
  setCustomLocation: (location: string) => void;
  meetingDuration: string;
  setMeetingDuration: (duration: string) => void;
  errors: Record<string, string>;
  setErrors: (errors: Record<string, string>) => void;
  isFormDisabled: boolean;
  isSubmitting: boolean;
  // Actions
  handleSendInvite: (e: React.FormEvent) => Promise<void>;
  handleConnect: (platform: 'google') => void;
  isConnecting: boolean;
  googleStatus: IntegrationStatus | undefined;
  resetForm: () => void;
};

function useClientInviteForm({
  projectName,
  projectId,
  onSuccess,
}: UseClientInviteFormProps): UseClientInviteFormReturn {
  const [startDateRange, setStartDateRange] = useState<Date | undefined>(new Date());
  const [endDateRange, setEndDateRange] = useState<Date | undefined>(addHours(new Date(), 30 * 24));
  const [selectedClientEmails, setSelectedClientEmails] = useState<string[]>([]);
  const [meetingPurpose, setMeetingPurpose] = useState<string>('');
  const [meetingLocation, setMeetingLocation] = useState<string>('video');
  const [videoPlatform, setVideoPlatform] = useState<string>('google-meet');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [phoneNumberType, setPhoneNumberType] = useState<string>('client-provided');
  const [customLocation, setCustomLocation] = useState<string>('');
  const [meetingDuration, setMeetingDuration] = useState<string>('60');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Check integration status
  const { data: googleStatus } = useQuery({
    queryKey: ['google-integration'],
    queryFn: async () => {
      const response = await newRequest.get('/integrations/google/status');
      return response.data as IntegrationStatus;
    },
  });

  // Mock connection mutation
  const connectMutation = useMutation({
    mutationFn: async (platform: 'google') => {
      setIsConnecting(true);
      // Simulate API call
      await new Promise((resolve) => {
        return setTimeout(resolve, 2000);
      });
      return { success: true, platform };
    },
    onSuccess: (data) => {
      toast.success('Google connected successfully');
      setIsConnecting(false);
    },
    onError: () => {
      toast.error('Failed to connect. Please try again.');
      setIsConnecting(false);
    },
  });

  const handleConnect = (platform: 'google') => {
    connectMutation.mutate(platform);
  };

  const validatePhoneNumber = (number: string): boolean => {
    // Basic international phone number validation
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(number.replace(/\s+/g, ''));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (selectedClientEmails.length === 0) {
      newErrors.clientEmail = 'Please select at least one client';
    }

    if (!meetingPurpose.trim()) {
      newErrors.meetingPurpose = 'Please enter a meeting purpose';
    }

    if (!startDateRange || !isValid(startDateRange)) {
      newErrors.startDate = 'Please select a valid start date';
    }

    if (!endDateRange || !isValid(endDateRange)) {
      newErrors.endDate = 'Please select a valid end date';
    }

    if (startDateRange && endDateRange && isBefore(endDateRange, startDateRange)) {
      newErrors.dateRange = 'End date must be after start date';
    }

    if (meetingLocation === 'video' && videoPlatform === 'custom' && !customLocation.trim()) {
      newErrors.customLocation = 'Please enter the video platform name';
    }

    if (
      meetingLocation === 'phone' &&
      phoneNumberType === 'custom' &&
      !validatePhoneNumber(phoneNumber)
    ) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    if (
      (meetingLocation === 'in-person' || meetingLocation === 'other') &&
      !customLocation.trim()
    ) {
      newErrors.customLocation = 'Please enter the location details';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = useCallback(() => {
    setStartDateRange(new Date());
    setEndDateRange(addHours(new Date(), 30 * 24));
    setSelectedClientEmails([]);
    setMeetingPurpose('');
    setMeetingLocation('video');
    setVideoPlatform('google-meet');
    setPhoneNumber('');
    setPhoneNumberType('client-provided');
    setCustomLocation('');
    setMeetingDuration('60');
    setErrors({});
  }, []);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await newRequest.post('/schedule/invite', {
        clientEmails: selectedClientEmails,
        meetingPurpose,
        meetingDuration,
        startDateRange,
        endDateRange,
        projectId,
        meetingLocation,
        ...(meetingLocation === 'video' && {
          videoPlatform,
          customLocation: videoPlatform === 'custom' ? customLocation : undefined,
        }),
        ...(meetingLocation === 'phone' && {
          phoneNumberType,
          phoneNumber: phoneNumberType === 'custom' ? phoneNumber : undefined,
        }),
        ...((meetingLocation === 'in-person' || meetingLocation === 'other') && {
          customLocation,
        }),
      });

      toast.success(
        `Invitation sent to ${selectedClientEmails.length} client${
          selectedClientEmails.length > 1 ? 's' : ''
        }`,
      );
      onSuccess();
      resetForm();
    } catch (error) {
      toast.error('Failed to send invitation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMeetingLocationChange = (value: string) => {
    setErrors({});
    switch (value) {
      case 'video':
        setPhoneNumber('');
        setPhoneNumberType('client-provided');
        break;
      case 'phone':
        setVideoPlatform('google-meet');
        setCustomLocation('');
        break;
      case 'in-person':
      case 'other':
        setVideoPlatform('google-meet');
        setPhoneNumber('');
        setPhoneNumberType('client-provided');
        break;
    }
    setMeetingLocation(value);
  };

  const isFormDisabled = isSubmitting || isConnecting;

  return {
    // Form state
    startDateRange,
    setStartDateRange,
    endDateRange,
    setEndDateRange,
    selectedClientEmails,
    setSelectedClientEmails,
    meetingPurpose,
    setMeetingPurpose,
    meetingLocation,
    setMeetingLocation: handleMeetingLocationChange,
    videoPlatform,
    setVideoPlatform,
    phoneNumber,
    setPhoneNumber,
    phoneNumberType,
    setPhoneNumberType,
    customLocation,
    setCustomLocation,
    meetingDuration,
    setMeetingDuration,
    errors,
    setErrors,
    isFormDisabled,
    isSubmitting,
    // Actions
    handleSendInvite,
    handleConnect,
    isConnecting,
    googleStatus,
    resetForm,
  };
}

export default useClientInviteForm;
