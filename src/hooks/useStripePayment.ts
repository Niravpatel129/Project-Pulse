import { toast } from '@/components/ui/use-toast';
import { newRequest } from '@/utils/newRequest';
import { loadStripe } from '@stripe/stripe-js';
import { useCallback, useMemo, useState } from 'react';

export type PaymentType = 'full' | 'deposit' | 'custom';
export type PaymentStatus = 'select' | 'loading' | 'form';

interface UseStripePaymentProps {
  invoiceId: string;
  currency: string;
}

export function useStripePayment({ invoiceId, currency }: UseStripePaymentProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number | null>(null);
  const [paymentType, setPaymentType] = useState<PaymentType>('full');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('select');
  const [isLoading, setIsLoading] = useState(false);

  // Initialize Stripe instance
  const stripePromise = useMemo(() => {
    if (typeof window === 'undefined') return null;

    try {
      const isDevEnv = process.env.NODE_ENV === 'development';
      const stripeKey = isDevEnv
        ? 'pk_test_51RC3v8PRz7XrHwdQr1BXDOGT61TqgFP3gXTfzE0PCKClY4cOalNNddHl8NDwKlEogwjHSGIGBqRDiTEaeV1qoZxF005ZGgv6Cn'
        : 'pk_live_51RC3v3AShnUAruhwfThWbkHXdQmj1Swuf2W6pNrvLanujLClvv2upNwZYR1Yr0MspTeadOXa5rxKa8VtORdNgIgi00Etd76FLo';

      if (!stripeKey) {
        throw new Error('Stripe publishable key is not defined');
      }
      return loadStripe(stripeKey);
    } catch (error) {
      console.error('Error initializing Stripe:', error);
      toast({
        title: 'Error',
        description: 'Failed to initialize payment system. Please try again later.',
        variant: 'destructive',
      });
      return null;
    }
  }, []);

  const createPaymentIntent = useCallback(
    async (amount: number, type: PaymentType) => {
      if (!invoiceId) throw new Error('Invoice not loaded');
      try {
        setIsLoading(true);
        const response = await newRequest.post(`/invoices/${invoiceId}/payment-intent`, {
          amount: Math.round(amount * 100),
          currency: currency || 'USD',
          isDeposit: type === 'deposit',
        });
        return response.data;
      } catch (error) {
        console.error('Error creating payment intent:', error);
        throw error;
      }
    },
    [invoiceId, currency],
  );

  const handleSelectPayment = useCallback(
    async (amount: number, type: PaymentType) => {
      setPaymentAmount(amount);
      setPaymentType(type);
      setPaymentStatus('loading');
      setIsLoading(true);

      try {
        const data = await createPaymentIntent(amount, type);
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
          setPaymentStatus('form');
          toast({
            title: 'Payment ready',
            description: 'Please complete your payment details below.',
          });
        }
      } catch (error) {
        setPaymentStatus('select');
        toast({
          title: 'Error',
          description: 'Failed to create payment intent. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [createPaymentIntent],
  );

  const handleBackToSelection = useCallback(() => {
    setPaymentStatus('select');
    setClientSecret(null);
  }, []);

  return {
    stripePromise,
    clientSecret,
    paymentAmount,
    paymentType,
    paymentStatus,
    isLoading,
    handleSelectPayment,
    handleBackToSelection,
    setIsLoading,
  };
}
