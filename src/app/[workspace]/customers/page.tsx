'use client';

import CustomersPage from '@/app/customers/page';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardCustomersPage() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);

  // For this implementation, we'll reuse the existing customers page
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  if (!isLoaded) {
    return <div className='container mx-auto py-8'>Loading customers...</div>;
  }

  return (
    <>
      <CustomersPage />
    </>
  );
}
