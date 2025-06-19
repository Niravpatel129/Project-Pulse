'use client';

import { useWorkspace } from '@/contexts/WorkspaceContext';
import { newRequest } from '@/utils/newRequest';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function StripeRefresh() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const { workspace } = useWorkspace();

  useEffect(() => {
    const refreshOnboarding = async () => {
      try {
        // Get a new onboarding URL
        const response = await newRequest.post('/stripe/connect/create-account', {
          refreshUrl: window.location.origin + '/dashboard/settings?tab=payment-integrations',
          redirectUrl: window.location.origin + '/dashboard/settings?tab=payment-integrations',
        });

        if (!response.data.success || !response.data.data.onboardingUrl) {
          throw new Error('Failed to refresh Stripe onboarding session');
        }

        // Redirect to the new onboarding URL
        window.location.href = response.data.data.onboardingUrl;
      } catch (error) {
        console.error('Error refreshing Stripe onboarding:', error);
        toast.error('Failed to refresh onboarding session');

        // Redirect back to settings after error
        setTimeout(() => {
          router.push('/dashboard/settings');
        }, 3000);
      } finally {
        setIsLoading(false);
      }
    };

    refreshOnboarding();
  }, [router]);

  return (
    <div className='min-h-screen bg-background flex items-center justify-center'>
      <div className='max-w-md w-full mx-auto p-6'>
        <div className='text-center space-y-4'>
          {isLoading ? (
            <>
              <RefreshCw className='h-12 w-12 text-primary mx-auto animate-spin' />
              <h1 className='text-2xl font-bold text-foreground'>Refreshing Your Session</h1>
              <p className='text-muted-foreground'>
                Please wait while we refresh your Stripe onboarding session...
              </p>
            </>
          ) : (
            <>
              <ArrowRight className='h-12 w-12 text-primary mx-auto' />
              <h1 className='text-2xl font-bold text-foreground'>Redirecting</h1>
              <p className='text-muted-foreground'>Taking you back to the settings page...</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
