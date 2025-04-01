import { newRequest } from '@/utils/newRequest';
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
        setState((prev) => {
          return { ...prev, isLoading: true };
        });

        // Check with the server if the user is connected
        try {
          const response = await newRequest.get('/calendar/google/status');

          if (response.data.isConnected) {
            setState((prev) => {
              return { ...prev, isConnected: true, isLoading: false };
            });
            // Fetch events when we know we're connected
            await fetchCalendarEvents();
            return;
          }
        } catch (err) {
          console.error('Server connection check failed, falling back to local storage:', err);
        }

        // Fallback to local storage check if server check fails
        const token = localStorage.getItem('google_calendar_token');
        if (token) {
          setState((prev) => {
            return { ...prev, isConnected: true, isLoading: false };
          });
          // Fetch events when we know we're connected
          await fetchCalendarEvents();
        } else {
          setState((prev) => {
            return { ...prev, isLoading: false };
          });
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        setState((prev) => {
          return { ...prev, isLoading: false, error: 'Failed to verify connection status' };
        });
      }
    };

    checkAuthStatus();
  }, []);

  const connectGoogleCalendar = async () => {
    try {
      setState((prev) => {
        return { ...prev, isLoading: true, error: null };
      });

      const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

      const REDIRECT_URI = `${window.location.origin}/sync/google/callback`;

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

      // Call server to revoke access
      await newRequest.post('/calendar/google/disconnect');

      // Remove token from localStorage
      localStorage.removeItem('google_calendar_token');
      localStorage.removeItem('google_calendar_refresh_token');

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
    // do nothing for now
  };

  const createCalendarEvent = async (event: Omit<CalendarEvent, 'id'>) => {
    try {
      setState((prev) => {
        return { ...prev, isLoading: true, error: null };
      });

      try {
        // Try to create event via our server first
        const response = await newRequest.post('/calendar/google/events', event);

        setState((prev) => {
          return {
            ...prev,
            isLoading: false,
            events: [...prev.events, response.data],
          };
        });

        return response.data;
      } catch (err) {
        console.error('Server event creation failed, trying direct Google API:', err);

        // Fallback to direct Google API call
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
      }
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

      try {
        // Try to update event via our server first
        const response = await newRequest.put(`/calendar/google/events/${eventId}`, updates);

        setState((prev) => {
          return {
            ...prev,
            isLoading: false,
            events: prev.events.map((event) => {
              return event.id === eventId ? response.data : event;
            }),
          };
        });

        return response.data;
      } catch (err) {
        console.error('Server event update failed, trying direct Google API:', err);

        // Fallback to direct Google API call
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
      }
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

      try {
        // Try to delete event via our server first
        await newRequest.delete(`/calendar/google/events/${eventId}`);

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
      } catch (err) {
        console.error('Server event deletion failed, trying direct Google API:', err);

        // Fallback to direct Google API call
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
      }
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
