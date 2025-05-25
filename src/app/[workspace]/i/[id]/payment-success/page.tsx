'use client';

import { toast } from '@/components/ui/use-toast';
import { newRequest } from '@/utils/newRequest';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const invoiceId = params.id as string;
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
        const response = await newRequest.post(`/invoices2/${invoiceId}/payment-success`, {
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
          router.push(`/i/${invoiceId}`);
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
  }, [paymentIntent, paymentIntentClientSecret, redirectStatus, router, invoiceId]);

  if (isVerifying) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center w-full'>
        <div className='text-center space-y-6'>
          <div className='relative'>
            <div className='animate-spin rounded-full h-16 w-16 border-2 border-zinc-200 border-t-zinc-800 mx-auto transition-all duration-300'></div>
            <div className='absolute inset-0 flex items-center justify-center'>
              <div className='h-8 w-8 rounded-full bg-background'></div>
            </div>
          </div>
          <p className='text-zinc-600 text-sm font-medium tracking-wide'>
            Verifying your payment...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center w-full'>
        <div className='text-center space-y-8 max-w-sm px-4'>
          <div className='space-y-3'>
            <div className='text-red-500 text-base font-medium'>{error}</div>
            <p className='text-zinc-500 text-sm'>
              We couldn&apos;t process your payment. Please try again or contact support.
            </p>
          </div>
          <button
            onClick={() => {
              return router.back();
            }}
            className='px-6 py-2.5 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-all duration-200 shadow-sm hover:shadow-md'
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-background flex items-center justify-center w-full'>
      <div className='text-center space-y-6 max-w-sm px-4'>
        <div className='space-y-3'>
          <div className='text-zinc-900 text-lg font-medium'>Payment Successful!</div>
          <p className='text-zinc-500 text-sm'>You will be redirected shortly...</p>
        </div>
        <div className='h-1 w-24 bg-zinc-800 mx-auto rounded-full animate-pulse'></div>
      </div>
    </div>
  );
}
