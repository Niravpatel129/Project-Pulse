import { newRequest } from '@/utils/newRequest';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addHours, isBefore, isValid } from 'date-fns';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { IntegrationStatus, useGoogleIntegration } from './useGoogleIntegration';

type UseClientInviteFormProps = {
  projectName?: string;
  projectId?: string;
  onSuccess: () => void;
};

type UseClientInviteFormReturn = {
  // Form state
  startDateRange: Date | undefined;
  setStartDateRange: (date: Date | undefined) => void;
  endDateRange: Date | undefined;
  setEndDateRange: (date: Date | undefined) => void;
  primaryClientEmail: string | undefined;
  setPrimaryClientEmail: (email: string | undefined) => void;
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
  const queryClient = useQueryClient();
  const [startDateRange, setStartDateRange] = useState<Date | undefined>(new Date());
  const [endDateRange, setEndDateRange] = useState<Date | undefined>(addHours(new Date(), 30 * 24));
  const [primaryClientEmail, setPrimaryClientEmail] = useState<string | undefined>();
  const [meetingPurpose, setMeetingPurpose] = useState<string>('');
  const [meetingLocation, setMeetingLocation] = useState<string>('video');
  const [videoPlatform, setVideoPlatform] = useState<string>('google-meet');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [phoneNumberType, setPhoneNumberType] = useState<string>('client-provided');
  const [customLocation, setCustomLocation] = useState<string>('');
  const [meetingDuration, setMeetingDuration] = useState<string>('60');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { isConnecting, googleStatus, handleConnect } = useGoogleIntegration();

  const validatePhoneNumber = (number: string): boolean => {
    // Basic international phone number validation
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(number.replace(/\s+/g, ''));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!primaryClientEmail) {
      newErrors.primaryClientEmail = 'Please select a primary client';
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
    setPrimaryClientEmail(undefined);
    setMeetingPurpose('');
    setMeetingLocation('video');
    setVideoPlatform('google-meet');
    setPhoneNumber('');
    setPhoneNumberType('client-provided');
    setCustomLocation('');
    setMeetingDuration('60');
    setErrors({});
  }, []);

  const sendInviteMutation = useMutation({
    mutationFn: async () => {
      const response = await newRequest.post('/schedule/invite', {
        primaryClientEmail,
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
      return response.data;
    },
    onSuccess: () => {
      toast.success(`Invitation sent to ${primaryClientEmail}`);
      onSuccess();
      resetForm();
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['schedule', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
    onError: () => {
      toast.error('Failed to send invitation');
    },
  });

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    sendInviteMutation.mutate();
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

  const isFormDisabled = sendInviteMutation.isPending || isConnecting;

  return {
    // Form state
    startDateRange,
    setStartDateRange,
    endDateRange,
    setEndDateRange,
    primaryClientEmail,
    setPrimaryClientEmail,
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
    isSubmitting: sendInviteMutation.isPending,
    // Actions
    handleSendInvite,
    handleConnect,
    isConnecting,
    googleStatus,
    resetForm,
  };
}

export default useClientInviteForm;
