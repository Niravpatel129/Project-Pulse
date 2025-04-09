'use client';

import { newRequest } from '@/utils/newRequest';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function StripeReturnPage() {
  const router = useRouter();

  useEffect(() => {
    const checkAccountStatus = async () => {
      try {
        const res = await newRequest.get('/stripe/connect/account-status');
        if (res.data.success) {
          // Redirect to invoices page with success message
          router.push('/invoices?status=success');
        }
      } catch (error) {
        console.error('Error checking account status:', error);
        router.push('/invoices?status=error');
      }
    };

    checkAccountStatus();
  }, [router]);

  return (
    <div className='min-h-screen bg-white flex items-center justify-center'>
      <div className='text-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto'></div>
        <p className='mt-4 text-gray-600'>Completing your Stripe account setup...</p>
      </div>
    </div>
  );
}
