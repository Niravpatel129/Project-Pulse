import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
import { newRequest } from '@/utils/newRequest';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

export type IntegrationStatus = {
  connected: boolean;
  isExpired: boolean;
  services: {
    calendar: {
      connected: boolean;
      isExpired: boolean;
      calendarId: string;
      isSynced: boolean;
    };
  };
};

export function useGoogleIntegration() {
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const { connectGoogleCalendar } = useGoogleCalendar();

  // Check integration status
  const { data: googleStatus } = useQuery({
    queryKey: ['google-integration'],
    queryFn: async () => {
      const response = await newRequest.get('/calendar/google/status');
      return response.data as IntegrationStatus;
    },
  });

  // Mock connection mutation
  const connectMutation = useMutation({
    mutationFn: async (platform: 'google') => {
      setIsConnecting(true);
      try {
        // First check if user is already connected
        const statusResponse = await newRequest.get('/calendar/google/status');
        const status = statusResponse.data as IntegrationStatus;

        if (
          status.connected &&
          status.services.calendar.connected &&
          !status.services.calendar.isExpired
        ) {
          return { success: true, platform };
        }

        await connectGoogleCalendar();
        return { success: false, platform };
      } catch (error) {
        throw error;
      } finally {
        setIsConnecting(false);
      }
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Google connected successfully');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to connect. Please try again.');
    },
  });

  const handleConnect = (platform: 'google') => {
    connectMutation.mutate(platform);
  };

  return {
    isConnecting,
    googleStatus,
    handleConnect,
  };
}
