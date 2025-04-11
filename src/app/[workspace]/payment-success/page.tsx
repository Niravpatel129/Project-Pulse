'use client';

import { toast } from '@/components/ui/use-toast';
import { newRequest } from '@/utils/newRequest';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentIntent = searchParams.get('payment_intent');
  const paymentIntentClientSecret = searchParams.get('payment_intent_client_secret');
  const redirectStatus = searchParams.get('redirect_status');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!paymentIntent || !paymentIntentClientSecret) {
        toast({
          title: 'Error',
          description: 'Invalid payment information',
          variant: 'destructive',
        });
        router.push('/');
        return;
      }

      try {
        // Verify the payment with your backend
        const response = await newRequest.post('/stripe/verify-payment', {
          paymentIntent,
          paymentIntentClientSecret,
        });

        if (response.data.success) {
          toast({
            title: 'Success',
            description: 'Your payment has been processed successfully',
          });
          // Redirect to the invoice page or dashboard
          router.push('/invoices');
        } else {
          throw new Error('Payment verification failed');
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        toast({
          title: 'Error',
          description: 'Failed to verify payment. Please contact support.',
          variant: 'destructive',
        });
        router.push('/');
      }
    };

    if (redirectStatus === 'succeeded') {
      verifyPayment();
    } else {
      toast({
        title: 'Error',
        description: 'Payment was not successful',
        variant: 'destructive',
      });
      router.push('/');
    }
  }, [paymentIntent, paymentIntentClientSecret, redirectStatus, router]);

  return (
    <div className='min-h-screen bg-[#fafafa] flex items-center justify-center'>
      <div className='text-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066FF] mx-auto'></div>
        <p className='mt-4 text-gray-600'>Verifying your payment...</p>
      </div>
    </div>
  );
}
