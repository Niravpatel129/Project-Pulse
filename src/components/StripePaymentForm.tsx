import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { Lock } from 'lucide-react';
import { useEffect, useState } from 'react';

interface StripePaymentFormProps {
  clientSecret: string;
  invoice: {
    _id: string;
    invoiceNumber: string;
    from: string;
    to: string;
    items: Array<{
      description: string;
      quantity: number;
      price: number;
      total: number;
      _id: string;
    }>;
    totals: {
      subtotal: number;
      taxAmount: number;
      vatAmount: number;
      discount: number;
      total: number;
    };
    settings: {
      currency: string;
      salesTax: {
        enabled: boolean;
        rate: number;
      };
      vat: {
        enabled: boolean;
        rate: number;
      };
    };
  };
  onBack: () => void;
  setIsLoading: (loading: boolean) => void;
}

export function StripePaymentForm({
  clientSecret,
  invoice,
  onBack,
  setIsLoading,
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isElementsReady, setIsElementsReady] = useState(false);

  // When elements are ready, turn off the loading state
  useEffect(() => {
    if (elements) {
      setIsElementsReady(true);
      // Add a small delay to ensure elements are fully ready
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 300);
      return () => {
        return clearTimeout(timer);
      };
    }
  }, [elements, setIsLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw submitError;
      }

      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
      });

      if (confirmError) {
        throw confirmError;
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setIsProcessing(false);
    }
  };

  if (!isElementsReady) {
    return (
      <div className='space-y-6'>
        <div className='bg-[#F4F4F5] dark:bg-[#232323] p-4 rounded-xl'>
          <div className='py-12 flex flex-col items-center justify-center'>
            <div className='w-10 h-10 border-4 border-[#0066FF] border-t-transparent rounded-full animate-spin mb-4'></div>
            <p className='text-[#3F3F46]/60 dark:text-[#8C8C8C]'>Loading payment form...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <form onSubmit={handleSubmit} className='space-y-6'>
        <div className='space-y-4'>
          <div>
            <PaymentElement
              options={{
                layout: 'accordion',
                defaultValues: {
                  billingDetails: {
                    name: invoice.to,
                    email: '',
                  },
                },
                paymentMethodOrder: ['card', 'apple_pay', 'google_pay'],
              }}
            />
          </div>
        </div>

        {error && (
          <div className='p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-500'>
            {error}
          </div>
        )}

        <button
          type='submit'
          disabled={!stripe || isProcessing}
          className='w-full bg-[#0066FF] text-white rounded-xl h-12 font-medium flex items-center justify-center gap-2 hover:bg-[#0052CC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {isProcessing ? (
            <>
              <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin' />
              Processing...
            </>
          ) : (
            <>
              Pay {invoice.settings.currency}
              {invoice.totals.total.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
              <Lock className='w-4 h-4' />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
