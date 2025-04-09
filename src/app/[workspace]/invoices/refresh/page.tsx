'use client';

import { newRequest } from '@/utils/newRequest';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function StripeRefreshPage() {
  const router = useRouter();

  useEffect(() => {
    const createAccountLink = async () => {
      try {
        const res = await newRequest.post('/stripe/connect/create-account-link');
        if (res.data.success && res.data.data.url) {
          // Redirect to Stripe onboarding URL
          window.location.href = res.data.data.url;
        } else {
          router.push('/invoices?status=error');
        }
      } catch (error) {
        console.error('Error creating account link:', error);
        router.push('/invoices?status=error');
      }
    };

    createAccountLink();
  }, [router]);

  return (
    <div className='min-h-screen bg-white flex items-center justify-center'>
      <div className='text-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto'></div>
        <p className='mt-4 text-gray-600'>Redirecting to Stripe...</p>
      </div>
    </div>
  );
}
