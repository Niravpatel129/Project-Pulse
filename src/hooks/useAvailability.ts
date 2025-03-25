import { newRequest } from '@/utils/newRequest';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

export type TimeSlot = {
  start: string;
  end: string;
};

export type AvailabilitySlots = {
  [key: string]: TimeSlot[];
};

export type AvailabilitySettings = {
  timezone: string;
  minimumNotice: number;
  bufferTime: number;
  preventOverlap: boolean;
  requireConfirmation: boolean;
  availabilitySlots: AvailabilitySlots;
};

const defaultSettings: AvailabilitySettings = {
  timezone: '',
  minimumNotice: 24,
  bufferTime: 0,
  preventOverlap: false,
  requireConfirmation: false,
  availabilitySlots: {
    sunday: [{ start: '09:00', end: '17:00' }],
    monday: [{ start: '09:00', end: '17:00' }],
    tuesday: [{ start: '09:00', end: '17:00' }],
    wednesday: [{ start: '09:00', end: '17:00' }],
    thursday: [{ start: '09:00', end: '17:00' }],
    friday: [{ start: '09:00', end: '17:00' }],
    saturday: [{ start: '09:00', end: '17:00' }],
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
      setSettings(response.data);
      return response.data;
    },
  });

  const { mutate: updateAvailability, isPending: isUpdating } = useMutation({
    mutationFn: async (newSettings: Partial<AvailabilitySettings>) => {
      const response = await newRequest.put('/availability/settings', newSettings);
      return response.data;
    },
    onSuccess: (data) => {
      setSettings(data);
      queryClient.invalidateQueries({ queryKey: ['availability'] });
      return true;
    },
    onError: (err) => {
      return err instanceof Error ? err.message : 'Failed to update availability settings';
    },
  });

  const updateTimeSlot = useCallback(
    (day: string, index: number, type: 'start' | 'end', value: string) => {
      setSettings((prev) => {
        return {
          ...prev,
          availabilitySlots: {
            ...prev.availabilitySlots,
            [day]: prev.availabilitySlots[day].map((slot, i) => {
              if (i === index) {
                return {
                  ...slot,
                  [type]: value,
                };
              }
              return slot;
            }),
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
  };
}
