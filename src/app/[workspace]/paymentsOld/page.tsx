'use client';

import PaymentsPage from '@/app/[workspace]/payments/page';
import { useEffect, useState } from 'react';

export default function DashboardPaymentsPage() {
  const [isLoaded, setIsLoaded] = useState(false);

  // For this implementation, we'll reuse the existing payments page
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  if (!isLoaded) {
    return <div className='container mx-auto py-8'>Loading payments...</div>;
  }

  return (
    <>
      <PaymentsPage />
    </>
  );
}
