'use client';

import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';

export default function CalendarSettingsPage() {
  const searchParams = useSearchParams();
  const { isConnected, connectGoogleCalendar, disconnectGoogleCalendar } = useGoogleCalendar();

  useEffect(() => {
    const success = searchParams.get('success');
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    if (success === 'true' && accessToken && refreshToken) {
      // Store the tokens
      localStorage.setItem('google_calendar_token', accessToken);
      localStorage.setItem('google_calendar_refresh_token', refreshToken);

      // Clear the URL parameters
      window.history.replaceState({}, '', '/settings/calendar');

      toast.success('Successfully connected to Google Calendar!');
    }
  }, [searchParams]);

  return (
    <div className='max-w-4xl mx-auto py-8'>
      <h1 className='text-2xl font-bold mb-6'>Calendar Settings</h1>

      <div className='bg-white rounded-lg shadow p-6'>
        <h2 className='text-xl font-semibold mb-4'>Google Calendar Integration</h2>

        <div className='flex items-center justify-between'>
          <div>
            <p className='text-gray-600 mb-2'>
              {isConnected
                ? 'Your account is connected to Google Calendar'
                : 'Connect your Google Calendar to sync events'}
            </p>
            {isConnected && (
              <p className='text-sm text-gray-500'>
                You can now create and manage events directly from your workspace
              </p>
            )}
          </div>

          <button
            onClick={isConnected ? disconnectGoogleCalendar : connectGoogleCalendar}
            className={`px-4 py-2 rounded-md ${
              isConnected
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {isConnected ? 'Disconnect' : 'Connect Google Calendar'}
          </button>
        </div>
      </div>
    </div>
  );
}
