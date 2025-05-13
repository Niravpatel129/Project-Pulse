'use client';

import { toast } from '@/components/ui/use-toast';
import { newRequest } from '@/utils/newRequest';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentIntent = searchParams.get('payment_intent');
  const paymentIntentClientSecret = searchParams.get('payment_intent_client_secret');
  const redirectStatus = searchParams.get('redirect_status');
  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!paymentIntent || !paymentIntentClientSecret) {
        setError('Invalid payment information');
        setIsVerifying(false);
        toast({
          title: 'Error',
          description: 'Invalid payment information',
          variant: 'destructive',
        });
        return;
      }

      try {
        // Verify the payment with your backend
        const response = await newRequest.post('/stripe/verify-payment', {
          paymentIntent,
          paymentIntentClientSecret,
        });

        if (response.data.success) {
          setPaymentData(response.data.data);
          toast({
            title: 'Success',
            description: 'Your payment has been processed successfully',
          });

          // Redirect back to the invoice page after successful verification
          if (response.data.data.invoice?._id) {
            router.push(`/invoice/${response.data.data.invoice._id}`);
          }
        } else {
          throw new Error('Payment verification failed');
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        setError('Failed to verify payment. Please contact support.');
        toast({
          title: 'Error',
          description: 'Failed to verify payment. Please contact support.',
          variant: 'destructive',
        });
      } finally {
        setIsVerifying(false);
      }
    };

    if (redirectStatus === 'succeeded') {
      verifyPayment();
    } else {
      setError('Payment was not successful');
      setIsVerifying(false);
      toast({
        title: 'Error',
        description: 'Payment was not successful',
        variant: 'destructive',
      });
    }
  }, [paymentIntent, paymentIntentClientSecret, redirectStatus, router]);

  if (isVerifying) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center w-full'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066FF] mx-auto'></div>
          <p className='mt-4 text-white'>Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center w-full'>
        <div className='text-center'>
          <div className='text-red-500 text-5xl mb-4'>✕</div>
          <h1 className='text-2xl font-semibold text-gray-800 mb-2'>Payment Failed</h1>
          <p className='text-gray-600 mb-6'>{error}</p>
        </div>
      </div>
    );
  }

  return <div className='min-h-screen bg-background flex items-center justify-center'></div>;
}
