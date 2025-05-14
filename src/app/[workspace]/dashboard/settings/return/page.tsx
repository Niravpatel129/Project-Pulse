'use client';

import { useWorkspace } from '@/contexts/WorkspaceContext';
import { newRequest } from '@/utils/newRequest';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function StripeReturn() {
  const router = useRouter();
  const { workspace } = useWorkspace();

  // Query to check the account status
  const { data: stripeStatus, isLoading } = useQuery({
    queryKey: ['stripe-account-status'],
    queryFn: async () => {
      const response = await newRequest.get('/stripe/connect/account-status');
      return response.data.data;
    },
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.push('/dashboard/settings');
    }, 5000);

    return () => {
      return clearTimeout(timeout);
    };
  }, [router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <div className='text-center space-y-4'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto'></div>
          <p className='text-muted-foreground'>Verifying your Stripe account...</p>
        </div>
      </div>
    );
  }

  // Show success or error state
  return (
    <div className='min-h-screen bg-background flex items-center justify-center'>
      <div className='max-w-md w-full mx-auto p-6'>
        <div className='text-center space-y-4'>
          {stripeStatus?.detailsSubmitted ? (
            <>
              <CheckCircle className='h-12 w-12 text-green-500 mx-auto' />
              <h1 className='text-2xl font-bold text-foreground'>Setup Complete!</h1>
              <p className='text-muted-foreground'>
                Your Stripe account has been successfully connected. You can now start accepting
                payments.
              </p>
            </>
          ) : (
            <>
              <XCircle className='h-12 w-12 text-red-500 mx-auto' />
              <h1 className='text-2xl font-bold text-foreground'>Setup Incomplete</h1>
              <p className='text-muted-foreground'>
                Your Stripe account setup is incomplete. Please make sure to complete all required
                steps.
              </p>
            </>
          )}
          <p className='text-sm text-muted-foreground'>
            Redirecting you back to settings in a few seconds...
          </p>
        </div>
      </div>
    </div>
  );
}
