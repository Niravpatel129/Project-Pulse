'use client';

import CalendarPage from '@/app/calendar/page';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardCalendarPage() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);

  // For this implementation, we'll reuse the existing calendar page
  useEffect(() => {
    // Ensure any potential date-related issues are handled before rendering
    const handleDashboardLoad = () => {
      // Make sure global Date object is available
      if (typeof Date === 'undefined') {
        console.error('Date object is not available');
        return;
      }

      setIsLoaded(true);
    };

    handleDashboardLoad();
  }, []);

  return (
    <>
      <CalendarPage />
    </>
  );
}
