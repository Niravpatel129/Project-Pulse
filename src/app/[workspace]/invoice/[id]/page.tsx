'use client';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { newRequest } from '@/utils/newRequest';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useMutation, useQuery } from '@tanstack/react-query';
import { CheckCircle, Lock, X } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Invoice {
  _id: string;
  invoiceNumber: string;
  client: {
    _id: string;
    name: string;
    email: string;
  };
  items: string[];
  subtotal: number;
  tax: number;
  total: number;
  status: string;
  dueDate: string;
  currency: string;
  deliveryMethod: string;
  workspace: string;
  createdBy: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  paymentIntentId?: string;
  paidAt?: string;
}

const mapCurrency = (currency: string) => {
  switch (currency.toUpperCase()) {
    case 'USD':
      return '$';
    case 'EUR':
      return '€';
    case 'GBP':
      return '£';
    default:
      return currency;
  }
};

function PaymentForm({
  clientSecret,
  invoice,
  workspace,
}: {
  clientSecret: string;
  invoice: Invoice;
  workspace: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message || 'An error occurred');
      setIsProcessing(false);
      return;
    }

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success`,
      },
    });

    if (confirmError) {
      setError(confirmError.message || 'An error occurred');
    }
    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <PaymentElement />
      {error && <div className='text-red-500 text-sm mt-2'>{error}</div>}
      <button
        type='submit'
        disabled={!stripe || isProcessing}
        className='w-full bg-[#0066FF] text-white rounded-lg h-10 font-medium flex items-center justify-center gap-2 hover:bg-[#0052CC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed capitalize'
      >
        {isProcessing
          ? 'Processing...'
          : `Pay ${mapCurrency(invoice.currency || 'USD')}${invoice.total.toFixed(2)}`}
        <Lock className='w-3.5 h-3.5' />
      </button>
    </form>
  );
}

export default function InvoicePage() {
  const params = useParams();
  const invoiceId = params.id as string;
  const workspace = params.workspace as string;
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const { data: invoice, isLoading } = useQuery<Invoice>({
    queryKey: ['invoice', workspace, invoiceId],
    queryFn: async () => {
      const response = await newRequest.get(`/invoices/${invoiceId}`);
      return response.data.data;
    },
  });

  const [stripePromise] = useState(() => {
    try {
      const stripeKey =
        'pk_live_51RC3v3AShnUAruhwfThWbkHXdQmj1Swuf2W6pNrvLanujLClvv2upNwZYR1Yr0MspTeadOXa5rxKa8VtORdNgIgi00Etd76FLo';
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
  });

  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const createPaymentIntentMutation = useMutation({
    mutationFn: async () => {
      if (!invoice) throw new Error('Invoice not loaded');
      try {
        const response = await newRequest.post(`/invoices/${invoiceId}/payment-intent`, {
          amount: invoice.total,
          currency: invoice.currency || 'USD',
        });
        return response.data;
      } catch (error) {
        console.error('Error creating payment intent:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        toast({
          title: 'Payment intent created',
          description: 'Please complete your payment details below.',
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create payment intent. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Create payment intent when invoice is loaded
  useEffect(() => {
    if (invoice && !clientSecret && invoice.status !== 'paid') {
      createPaymentIntentMutation.mutate();
    }
  }, [invoice]);

  if (isLoading || (createPaymentIntentMutation.isPending && invoice?.status !== 'paid')) {
    return (
      <div className='min-h-screen bg-[#fafafa] flex items-center justify-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-[#0066FF]'></div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className='min-h-screen bg-[#fafafa] flex items-center justify-center'>
        <div className='text-gray-500'>Invoice not found</div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[#fafafa] flex flex-col items-center py-16 px-4 antialiased'>
      {/* Company Logo */}
      <div className='mb-16'>
        <div className='flex items-center gap-3'>
          <div className='w-6 h-6 rounded-full bg-[#0066FF]' />
          <span className='text-[15px] font-medium text-gray-900 tracking-tight'>
            {invoice.client.name}
          </span>
        </div>
      </div>

      {/* Invoice Card */}
      <div className='w-full max-w-[440px] bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-8 mb-3'>
        <div className='flex justify-between items-start mb-10'>
          <div>
            <h1 className='text-[32px] font-semibold text-gray-900 mb-1 tracking-tight'>
              {mapCurrency(invoice.currency) || 'USD'}
              {invoice.total.toFixed(2)}
            </h1>
            <p className='text-[13px] text-gray-500'>
              {invoice.status === 'paid'
                ? `Paid on ${new Date(invoice.paidAt || '').toLocaleDateString()}`
                : `Due ${new Date(invoice.dueDate).toLocaleDateString()}`}
            </p>
          </div>
          <button className='text-gray-400 hover:text-gray-600 transition-colors'>
            <span className='sr-only'>Download invoice</span>
            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={1.5}
                d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
              />
            </svg>
          </button>
        </div>

        <div className='space-y-5 mb-7'>
          <div className='flex justify-between items-center'>
            <span className='text-[13px] text-gray-500'>To</span>
            <span className='text-[13px] text-gray-900'>{invoice.client.name}</span>
          </div>
          <div className='flex justify-between items-center'>
            <span className='text-[13px] text-gray-500'>From</span>
            <span className='text-[13px] text-gray-900'>{invoice.createdBy.name}</span>
          </div>
          <div className='flex justify-between items-center'>
            <span className='text-[13px] text-gray-500'>Invoice</span>
            <span className='text-[13px] text-gray-900 font-mono'>{invoice.invoiceNumber}</span>
          </div>
          {invoice.status === 'paid' && (
            <div className='flex justify-between items-center'>
              <span className='text-[13px] text-gray-500'>Status</span>
              <span className='text-[13px] text-green-600 font-medium flex items-center gap-1'>
                <CheckCircle className='w-3.5 h-3.5' /> Paid
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => {
            return setIsDetailsModalOpen(true);
          }}
          className='w-full text-[13px] text-gray-500 text-left hover:text-gray-900 transition-colors'
        >
          View invoice and payment details →
        </button>
      </div>

      {/* Payment Methods */}
      <div className='w-full max-w-[440px] bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-8'>
        {invoice.status === 'paid' ? (
          <div className='text-center py-6'>
            <CheckCircle className='text-green-500 w-12 h-12 mx-auto mb-4' />
            <h2 className='text-xl font-semibold text-gray-900 mb-2'>Payment Complete</h2>
            <p className='text-gray-500 mb-4'>
              This invoice has been paid on {new Date(invoice.paidAt || '').toLocaleDateString()}
            </p>
            <div className='bg-gray-50 p-4 rounded-lg text-left mb-4'>
              <div className='flex justify-between mb-2'>
                <span className='text-gray-500'>Payment ID:</span>
                <span className='font-mono text-sm'>{invoice.paymentIntentId}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-500'>Amount:</span>
                <span className='font-medium'>
                  {invoice.currency || 'USD'} {invoice.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentForm clientSecret={clientSecret} invoice={invoice} workspace={workspace} />
            </Elements>
          )
        )}

        {/* Footer */}
        <div className='mt-10 flex items-center justify-center gap-6 text-[13px] text-gray-400'>
          <span>Powered by stripe</span>
          <span className='hover:text-gray-600 transition-colors cursor-pointer'>Terms</span>
          <span className='hover:text-gray-600 transition-colors cursor-pointer'>Privacy</span>
        </div>
      </div>

      {/* Invoice Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className='max-w-4xl w-[90vw] h-[90vh] p-0 flex flex-col'>
          <DialogHeader className='p-6 border-b'>
            <div className='flex justify-between items-center'>
              <DialogTitle className='text-xl font-semibold'>
                Invoice #{invoice.invoiceNumber}
              </DialogTitle>
              <DialogClose asChild>
                <button className='rounded-full p-1.5 hover:bg-gray-100'>
                  <X className='h-5 w-5' />
                  <span className='sr-only'>Close</span>
                </button>
              </DialogClose>
            </div>
            <DialogDescription>
              Created on {new Date(invoice.createdAt).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>

          <div className='flex-1 overflow-auto p-6'>
            {/* Invoice Header */}
            <div className='flex justify-between mb-8'>
              <div>
                <h3 className='font-semibold mb-2'>From</h3>
                <p>{invoice.createdBy.name}</p>
              </div>
              <div className='text-right'>
                <h3 className='font-semibold mb-2'>To</h3>
                <p>{invoice.client.name}</p>
                <p>{invoice.client.email}</p>
              </div>
            </div>

            {/* Invoice Info */}
            <div className='grid grid-cols-2 gap-6 mb-8'>
              <div>
                <h3 className='font-semibold mb-2'>Invoice Number</h3>
                <p className='font-mono'>{invoice.invoiceNumber}</p>
              </div>
              <div>
                <h3 className='font-semibold mb-2'>Due Date</h3>
                <p>{new Date(invoice.dueDate).toLocaleDateString()}</p>
              </div>
              <div>
                <h3 className='font-semibold mb-2'>Status</h3>
                <p className={invoice.status === 'paid' ? 'text-green-600 font-medium' : ''}>
                  {invoice.status === 'paid' ? (
                    <span className='flex items-center gap-1.5'>
                      <CheckCircle className='w-4 h-4' /> Paid
                    </span>
                  ) : (
                    'Unpaid'
                  )}
                </p>
              </div>
              <div>
                <h3 className='font-semibold mb-2'>Delivery Method</h3>
                <p className='capitalize'>{invoice.deliveryMethod}</p>
              </div>
            </div>

            {/* Invoice Summary */}
            <div className='border rounded-lg overflow-hidden mb-6'>
              <div className='bg-gray-50 p-4 border-b'>
                <h3 className='font-semibold'>Invoice Summary</h3>
              </div>
              <div className='p-4 space-y-4'>
                <div className='flex justify-between'>
                  <span>Subtotal</span>
                  <span>
                    {mapCurrency(invoice.currency)}
                    {invoice.subtotal.toFixed(2)}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span>Tax</span>
                  <span>
                    {mapCurrency(invoice.currency)}
                    {invoice.tax.toFixed(2)}
                  </span>
                </div>
                <div className='border-t pt-4 flex justify-between font-semibold'>
                  <span>Total</span>
                  <span>
                    {mapCurrency(invoice.currency)}
                    {invoice.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Info (if paid) */}
            {invoice.status === 'paid' && (
              <div className='bg-gray-50 p-4 rounded-lg'>
                <h3 className='font-semibold mb-3'>Payment Information</h3>
                <div className='space-y-2'>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Payment ID</span>
                    <span className='font-mono text-sm'>{invoice.paymentIntentId}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Payment Date</span>
                    <span>{new Date(invoice.paidAt || '').toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
