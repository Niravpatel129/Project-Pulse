import { useState } from 'react';

interface GoogleCalendarState {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useGoogleCalendar() {
  const [state, setState] = useState<GoogleCalendarState>({
    isConnected: false,
    isLoading: false,
    error: null,
  });

  const connectGoogleCalendar = async () => {
    try {
      setState((prev) => {
        return { ...prev, isLoading: true, error: null };
      });

      // TODO: Replace with your actual Google OAuth client ID
      const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      const REDIRECT_URI = `${window.location.origin}/api/auth/google/callback`;

      // Construct the Google OAuth URL
      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUrl.searchParams.append('client_id', GOOGLE_CLIENT_ID || '');
      authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
      authUrl.searchParams.append('response_type', 'code');
      authUrl.searchParams.append('scope', 'https://www.googleapis.com/auth/calendar.readonly');
      authUrl.searchParams.append('access_type', 'offline');
      authUrl.searchParams.append('prompt', 'consent');

      // Redirect to Google OAuth
      window.location.href = authUrl.toString();
    } catch (error) {
      setState((prev) => {
        return {
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to connect to Google Calendar',
        };
      });
    }
  };

  const disconnectGoogleCalendar = async () => {
    try {
      setState((prev) => {
        return { ...prev, isLoading: true, error: null };
      });

      // TODO: Implement disconnect logic with your backend
      // For now, we'll just update the local state
      setState((prev) => {
        return {
          ...prev,
          isLoading: false,
          isConnected: false,
        };
      });
    } catch (error) {
      setState((prev) => {
        return {
          ...prev,
          isLoading: false,
          error:
            error instanceof Error ? error.message : 'Failed to disconnect from Google Calendar',
        };
      });
    }
  };

  return {
    ...state,
    connectGoogleCalendar,
    disconnectGoogleCalendar,
  };
}
