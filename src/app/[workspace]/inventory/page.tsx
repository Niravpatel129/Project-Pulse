'use client';

import InventoryPage from '@/app/inventory/page';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardInventoryPage() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);

  // For this implementation, we'll reuse the existing inventory page
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  if (!isLoaded) {
    return <div className='container mx-auto py-8'>Loading inventory...</div>;
  }

  return (
    <>
      <InventoryPage />
    </>
  );
}
