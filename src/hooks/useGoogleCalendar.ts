import { useEffect, useState } from 'react';

interface GoogleCalendarState {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  events: CalendarEvent[];
}

interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  location?: string;
}

export function useGoogleCalendar() {
  const [state, setState] = useState<GoogleCalendarState>({
    isConnected: false,
    isLoading: false,
    error: null,
    events: [],
  });

  // Check if user is already connected on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('google_calendar_token');
        if (token) {
          setState((prev) => {
            return { ...prev, isConnected: true };
          });
          // Fetch events when we know we're connected
          await fetchCalendarEvents();
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      }
    };

    checkAuthStatus();
  }, []);

  const connectGoogleCalendar = async () => {
    try {
      setState((prev) => {
        return { ...prev, isLoading: true, error: null };
      });

      // TODO: Replace with your actual Google OAuth client ID
      const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

      // Get the workspace from the URL
      const hostname = window.location.hostname;
      const workspace = hostname.split('.')[0];
      const REDIRECT_URI = `${window.location.origin}/${workspace}/api/auth/google/callback`;

      console.log('🚀 REDIRECT_URI:', REDIRECT_URI);
      // Construct the Google OAuth URL
      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUrl.searchParams.append('client_id', GOOGLE_CLIENT_ID || '');
      authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
      authUrl.searchParams.append('response_type', 'code');
      authUrl.searchParams.append('scope', 'https://www.googleapis.com/auth/calendar');
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

      // Remove token from localStorage
      localStorage.removeItem('google_calendar_token');
      localStorage.removeItem('google_calendar_refresh_token');

      // TODO: Call backend to revoke token if needed
      // await fetch('/api/auth/google/revoke', { method: 'POST' });

      setState((prev) => {
        return {
          ...prev,
          isLoading: false,
          isConnected: false,
          events: [],
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

  const fetchCalendarEvents = async (timeMin?: Date, timeMax?: Date) => {
    try {
      setState((prev) => {
        return { ...prev, isLoading: true, error: null };
      });

      const token = localStorage.getItem('google_calendar_token');
      if (!token) {
        throw new Error('Not authenticated with Google Calendar');
      }

      // Default to fetching events for the next 30 days if no range specified
      const now = new Date();
      const thirtyDaysLater = new Date(now);
      thirtyDaysLater.setDate(now.getDate() + 30);

      const min = timeMin || now;
      const max = timeMax || thirtyDaysLater;

      // Call your backend API or directly call Google Calendar API
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${min.toISOString()}&timeMax=${max.toISOString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error('Failed to fetch calendar events');
      }

      const data = await response.json();
      setState((prev) => {
        return {
          ...prev,
          isLoading: false,
          events: data.items || [],
        };
      });

      return data.items;
    } catch (error) {
      setState((prev) => {
        return {
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch calendar events',
        };
      });
      return [];
    }
  };

  const createCalendarEvent = async (event: Omit<CalendarEvent, 'id'>) => {
    try {
      setState((prev) => {
        return { ...prev, isLoading: true, error: null };
      });

      const token = localStorage.getItem('google_calendar_token');
      if (!token) {
        throw new Error('Not authenticated with Google Calendar');
      }

      const response = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        },
      );

      if (!response.ok) {
        throw new Error('Failed to create calendar event');
      }

      const createdEvent = await response.json();

      setState((prev) => {
        return {
          ...prev,
          isLoading: false,
          events: [...prev.events, createdEvent],
        };
      });

      return createdEvent;
    } catch (error) {
      setState((prev) => {
        return {
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to create calendar event',
        };
      });
      throw error;
    }
  };

  const updateCalendarEvent = async (eventId: string, updates: Partial<CalendarEvent>) => {
    try {
      setState((prev) => {
        return { ...prev, isLoading: true, error: null };
      });

      const token = localStorage.getItem('google_calendar_token');
      if (!token) {
        throw new Error('Not authenticated with Google Calendar');
      }

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        },
      );

      if (!response.ok) {
        throw new Error('Failed to update calendar event');
      }

      const updatedEvent = await response.json();

      setState((prev) => {
        return {
          ...prev,
          isLoading: false,
          events: prev.events.map((event) => {
            return event.id === eventId ? updatedEvent : event;
          }),
        };
      });

      return updatedEvent;
    } catch (error) {
      setState((prev) => {
        return {
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to update calendar event',
        };
      });
      throw error;
    }
  };

  const deleteCalendarEvent = async (eventId: string) => {
    try {
      setState((prev) => {
        return { ...prev, isLoading: true, error: null };
      });

      const token = localStorage.getItem('google_calendar_token');
      if (!token) {
        throw new Error('Not authenticated with Google Calendar');
      }

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error('Failed to delete calendar event');
      }

      setState((prev) => {
        return {
          ...prev,
          isLoading: false,
          events: prev.events.filter((event) => {
            return event.id !== eventId;
          }),
        };
      });

      return true;
    } catch (error) {
      setState((prev) => {
        return {
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to delete calendar event',
        };
      });
      throw error;
    }
  };

  return {
    ...state,
    connectGoogleCalendar,
    disconnectGoogleCalendar,
    fetchCalendarEvents,
    createCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
  };
}
