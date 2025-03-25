import { newRequest } from '@/utils/newRequest';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

export type TimeSlot = {
  start: string;
  end: string;
};

export type DayAvailability = {
  isEnabled: boolean;
  slots: TimeSlot[];
};

export type AvailabilitySlots = {
  [key: string]: DayAvailability;
};

export type AvailabilitySettings = {
  timezone: string;
  minimumNotice: number;
  bufferTime: number;
  preventOverlap: boolean;
  requireConfirmation: boolean;
  availabilitySlots: {
    sunday: DayAvailability;
    monday: DayAvailability;
    tuesday: DayAvailability;
    wednesday: DayAvailability;
    thursday: DayAvailability;
    friday: DayAvailability;
    saturday: DayAvailability;
  };
};

const defaultSettings: AvailabilitySettings = {
  timezone: '',
  minimumNotice: 24,
  bufferTime: 0,
  preventOverlap: false,
  requireConfirmation: false,
  availabilitySlots: {
    sunday: { isEnabled: true, slots: [{ start: '09:00', end: '17:00' }] },
    monday: { isEnabled: true, slots: [{ start: '09:00', end: '17:00' }] },
    tuesday: { isEnabled: true, slots: [{ start: '09:00', end: '17:00' }] },
    wednesday: { isEnabled: true, slots: [{ start: '09:00', end: '17:00' }] },
    thursday: { isEnabled: true, slots: [{ start: '09:00', end: '17:00' }] },
    friday: { isEnabled: true, slots: [{ start: '09:00', end: '17:00' }] },
    saturday: { isEnabled: true, slots: [{ start: '09:00', end: '17:00' }] },
  },
};

export function useAvailability() {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<AvailabilitySettings>(defaultSettings);

  const { isLoading, error } = useQuery({
    queryKey: ['availability'],
    queryFn: async () => {
      const response = await newRequest.get('/availability/settings');
      console.log('🚀 response.data:', response.data);

      // Directly use the backend structure
      setSettings(response.data);
      return response.data;
    },
  });

  const { mutate: updateAvailability, isPending: isUpdating } = useMutation({
    mutationFn: async (newSettings: Partial<AvailabilitySettings>) => {
      const response = await newRequest.put('/availability/settings', newSettings);
      return response.data;
    },
    onMutate: async (newSettings) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['availability'] });

      // Snapshot the previous value
      const previousSettings = settings;

      // Optimistically update to the new value
      setSettings((current) => {
        return {
          ...current,
          ...newSettings,
        };
      });

      // Return a context object with the snapshotted value
      return { previousSettings };
    },
    onError: (err, newSettings, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousSettings) {
        setSettings(context.previousSettings);
      }
      return err instanceof Error ? err.message : 'Failed to update availability settings';
    },
    onSuccess: () => {
      // Don't update settings from response since PUT doesn't return full settings
      queryClient.invalidateQueries({ queryKey: ['availability'] });
      return true;
    },
  });

  const updateTimeSlot = useCallback(
    (day: string, index: number, type: 'start' | 'end', value: string) => {
      setSettings((prev) => {
        return {
          ...prev,
          availabilitySlots: {
            ...prev.availabilitySlots,
            [day]: {
              ...prev.availabilitySlots[day],
              slots: prev.availabilitySlots[day].slots.map((slot, i) => {
                if (i === index) {
                  return {
                    ...slot,
                    [type]: value,
                  };
                }
                return slot;
              }),
            },
          },
        };
      });
    },
    [],
  );

  const fetchAvailability = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['availability'] });
  }, [queryClient]);

  return {
    settings,
    isLoading: isLoading || isUpdating,
    error,
    fetchAvailability,
    updateAvailability,
    updateTimeSlot,
    setSettings,
  };
}
