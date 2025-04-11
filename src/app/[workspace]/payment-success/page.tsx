'use client';

import { toast } from '@/components/ui/use-toast';
import { newRequest } from '@/utils/newRequest';
import { CheckCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PaymentSuccessPage() {
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
  }, [paymentIntent, paymentIntentClientSecret, redirectStatus]);

  if (isVerifying) {
    return (
      <div className='min-h-screen bg-[#fafafa] flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066FF] mx-auto'></div>
          <p className='mt-4 text-gray-600'>Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-[#fafafa] flex items-center justify-center'>
        <div className='text-center max-w-md p-8 bg-white rounded-xl shadow-sm'>
          <div className='text-red-500 text-5xl mb-4'>✕</div>
          <h1 className='text-2xl font-semibold text-gray-800 mb-2'>Payment Failed</h1>
          <p className='text-gray-600 mb-6'>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[#fafafa] flex items-center justify-center'>
      <div className='text-center max-w-md p-8 bg-white rounded-xl shadow-sm'>
        <CheckCircle className='text-green-500 w-16 h-16 mx-auto mb-4' />
        <h1 className='text-2xl font-semibold text-gray-800 mb-2'>Payment Successful!</h1>
        <p className='text-gray-600 mb-6'>Your payment has been processed successfully.</p>

        {paymentData?.invoice && (
          <div className='bg-gray-50 p-4 rounded-lg text-left mb-6'>
            <div className='flex justify-between mb-2'>
              <span className='text-gray-500'>Invoice Number:</span>
              <span className='font-medium'>{paymentData.invoice.invoiceNumber}</span>
            </div>
            <div className='flex justify-between mb-2'>
              <span className='text-gray-500'>Amount Paid:</span>
              <span className='font-medium'>
                {paymentData.invoice.currency || 'USD'} {paymentData.invoice.total.toFixed(2)}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-500'>Date:</span>
              <span className='font-medium'>
                {new Date(paymentData.invoice.paidAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
