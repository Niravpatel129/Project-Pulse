'use client';
import { Invoice } from '@/app/[workspace]/invoicesOld/[id]/components/Invoice';
import { InvoicePdf } from '@/components/InvoicePdf/InvoicePdf';
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
    user: {
      name: string;
      email: string;
    };
    phone: string;
    address: {
      street: string;
      city: string;
      state: string;
      country: string;
      zip: string;
    };
    shippingAddress: {
      street: string;
      city: string;
      state: string;
      country: string;
      zip: string;
    };
    contact: {
      firstName: string;
      lastName: string;
    };
    taxId: string;
    accountNumber: string;
    fax: string;
    mobile: string;
    tollFree: string;
    website: string;
    internalNotes: string;
    customFields: Record<string, any>;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
  items: Array<{
    name: string;
    description: string;
    quantity: number;
    price: number;
    discount: number;
    tax: number;
    taxName: string;
    _id: string;
  }>;
  selectedItems: any[];
  discount: number;
  discountAmount: number;
  subtotal: number;
  tax: number;
  taxRate: number;
  taxAmount: number;
  taxId: string;
  showTaxId: boolean;
  shippingTotal: number;
  total: number;
  status: string;
  dueDate: string;
  notes: string;
  currency: string;
  deliveryOptions: string;
  workspace: string;
  createdBy: {
    _id: string;
    name: string;
  };
  requireDeposit: boolean;
  depositPercentage: number;
  teamNotes: string;
  createdAt: string;
  updatedAt: string;
  paymentIntentId?: string;
  paidAt?: string;
}

const mapCurrency = (currency: string | undefined) => {
  if (!currency) return '$';

  switch (currency.toUpperCase()) {
    case 'USD':
      return '$';
    case 'CAD':
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
  const [paymentType, setPaymentType] = useState<'full' | 'deposit' | 'custom'>('full');
  const [customAmount, setCustomAmount] = useState<string>('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);

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

  const depositAmount = invoice.total * (invoice.depositPercentage / 100);
  const getPaymentAmount = () => {
    switch (paymentType) {
      case 'deposit':
        return depositAmount;
      case 'custom':
        return parseFloat(customAmount) || 0;
      default:
        return invoice.total;
    }
  };

  if (!showPaymentForm) {
    return (
      <div className='space-y-8'>
        {/* Payment Options */}
        <div className='grid grid-cols-3 gap-4'>
          <button
            onClick={() => {
              return setPaymentType('full');
            }}
            className={`p-4 rounded-xl border transition-all ${
              paymentType === 'full'
                ? 'border-[#0066FF] bg-[#0066FF]/5'
                : 'border-[#232323] hover:border-[#333333]'
            }`}
          >
            <div className='space-y-1'>
              <div className='text-sm font-medium text-[#8C8C8C]'>Full Amount</div>
              <div className='text-lg font-semibold text-[#fafafa]'>
                {mapCurrency(invoice.currency)}
                {invoice.total.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
          </button>

          {invoice.requireDeposit && (
            <button
              onClick={() => {
                return setPaymentType('deposit');
              }}
              className={`p-4 rounded-xl border transition-all ${
                paymentType === 'deposit'
                  ? 'border-[#0066FF] bg-[#0066FF]/5'
                  : 'border-[#232323] hover:border-[#333333]'
              }`}
            >
              <div className='space-y-1'>
                <div className='text-sm font-medium text-[#8C8C8C]'>Deposit</div>
                <div className='text-lg font-semibold text-[#fafafa]'>
                  {mapCurrency(invoice.currency)}
                  {depositAmount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
            </button>
          )}

          <button
            onClick={() => {
              return setPaymentType('custom');
            }}
            className={`p-4 rounded-xl border transition-all ${
              paymentType === 'custom'
                ? 'border-[#0066FF] bg-[#0066FF]/5'
                : 'border-[#232323] hover:border-[#333333]'
            }`}
          >
            <div className='space-y-1'>
              <div className='text-sm font-medium text-[#8C8C8C]'>Custom Amount</div>
            </div>
          </button>
        </div>

        {paymentType === 'custom' && (
          <div className='space-y-2'>
            <label className='block text-sm font-medium text-[#8C8C8C]'>Enter Payment Amount</label>
            <div className='relative'>
              <span className='absolute left-4 top-1/2 -translate-y-1/2 text-[#8C8C8C]'>
                {mapCurrency(invoice.currency)}
              </span>
              <input
                type='number'
                value={customAmount}
                onChange={(e) => {
                  return setCustomAmount(e.target.value);
                }}
                className='w-full pl-10 pr-4 py-3 bg-[#232323] border border-[#232323] text-[#fafafa] rounded-xl focus:ring-2 focus:ring-[#0066FF] focus:border-[#0066FF] outline-none transition-all placeholder:text-[#8C8C8C]'
                placeholder='0.00'
                min='0'
                step='0.01'
                max={invoice.total}
              />
            </div>
            <p className='text-sm text-[#8C8C8C]'>
              Maximum amount: {mapCurrency(invoice.currency)}
              {invoice.total.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        )}

        <button
          onClick={() => {
            if (paymentType === 'custom' && (!customAmount || parseFloat(customAmount) <= 0)) {
              return;
            }
            setShowPaymentForm(true);
          }}
          disabled={paymentType === 'custom' && (!customAmount || parseFloat(customAmount) <= 0)}
          className='w-full bg-[#0066FF] text-white rounded-xl h-12 font-medium flex items-center justify-center gap-2 hover:bg-[#0052CC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
        >
          Continue to Payment
          <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between p-4 bg-[#232323] rounded-xl'>
        <div className='space-y-1'>
          <div className='text-sm font-medium text-[#8C8C8C]'>Selected Payment</div>
          <div className='text-lg font-semibold text-[#fafafa]'>
            {mapCurrency(invoice.currency)}
            {getPaymentAmount().toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </div>
        <button
          onClick={() => {
            return setShowPaymentForm(false);
          }}
          className='text-sm text-[#8C8C8C] hover:text-[#fafafa] transition-colors'
        >
          Change
        </button>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        <div className='space-y-4'>
          <div className='text-sm font-medium text-[#8C8C8C]'>Payment Details</div>
          <div className='[&_.StripeElement]:bg-[#232323] [&_.StripeElement]:text-[#fafafa] [&_.StripeElement]:border-[#232323] [&_.StripeElement]:rounded-xl [&_.StripeElement]:p-3 [&_.StripeElement]:min-h-[40px] [&_.StripeElement]:focus:ring-2 [&_.StripeElement]:focus:ring-[#0066FF] [&_.StripeElement]:focus:border-[#0066FF] [&_.StripeElement]:outline-none [&_.StripeElement]:transition-all'>
            <PaymentElement
              options={{
                layout: 'tabs',
                defaultValues: {
                  billingDetails: {
                    name: invoice?.client?.user?.name,
                    email: invoice?.client?.user?.email,
                  },
                },
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
              Pay {mapCurrency(invoice.currency)}
              {getPaymentAmount().toLocaleString(undefined, {
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

export default function InvoicePage() {
  const params = useParams();
  const invoiceId = params?.id as string;
  const workspace = params?.workspace as string;
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
  const [isDepositPayment, setIsDepositPayment] = useState(false);

  const createPaymentIntentMutation = useMutation({
    mutationFn: async () => {
      if (!invoice) throw new Error('Invoice not loaded');
      try {
        const amount = isDepositPayment
          ? invoice.total * (invoice.depositPercentage / 100)
          : invoice.total;

        const response = await newRequest.post(`/invoices/${invoiceId}/payment-intent`, {
          amount,
          currency: invoice.currency || 'USD',
          isDeposit: isDepositPayment,
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

  // Create payment intent when invoice is loaded or payment type changes
  useEffect(() => {
    if (invoice && invoice.status !== 'paid') {
      console.log('🚀 invoice:', invoice);
      createPaymentIntentMutation.mutate();
    }
  }, [invoice, isDepositPayment]);

  if (isLoading) {
    return (
      <div className='min-h-screen bg-[#141414] flex flex-col items-center py-16 px-4 antialiased dark w-full'>
        {/* Company Logo Skeleton */}
        <div className='mb-16'>
          <div className='flex items-center gap-3'>
            <div className='h-5 w-32 bg-[#232323] rounded animate-pulse' />
          </div>
        </div>

        {/* Invoice Card Skeleton */}
        <div className='w-full max-w-[440px] bg-[#181818] rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-8 mb-3'>
          <div className='flex justify-between items-start mb-10'>
            <div>
              <div className='h-8 w-48 bg-[#232323] rounded animate-pulse mb-2' />
              <div className='h-4 w-32 bg-[#232323] rounded animate-pulse' />
            </div>
          </div>

          <div className='space-y-5 mb-7'>
            {[1, 2, 3].map((i) => {
              return (
                <div key={i} className='flex justify-between items-center'>
                  <div className='h-4 w-16 bg-[#232323] rounded animate-pulse' />
                  <div className='h-4 w-32 bg-[#232323] rounded animate-pulse' />
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Methods Skeleton */}
        <div className='w-full max-w-[440px] bg-[#181818] rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-8'>
          <div className='space-y-6'>
            <div className='h-8 w-full bg-[#232323] rounded animate-pulse' />
            <div className='h-40 w-full bg-[#232323] rounded animate-pulse' />
            <div className='h-12 w-full bg-[#232323] rounded animate-pulse' />
          </div>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className='min-h-screen bg-[#141414] flex flex-col items-center justify-center py-16 px-4 antialiased dark w-full'>
        <div className='text-[#fafafa] text-center'>
          <h1 className='text-2xl font-semibold mb-2'>Invoice Not Found</h1>
          <p className='text-[#8C8C8C]'>
            The invoice youre looking for doesnt exist or you dont have permission to view it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[#141414] flex flex-col items-center py-16 px-4 antialiased dark w-full'>
      {/* Company Logo */}
      <div className='mb-16'>
        <div className='flex items-center gap-3'>
          <span className='text-[15px] font-medium text-[#fafafa] tracking-tight'>
            {invoice?.client?.user?.name}
          </span>
        </div>
      </div>

      {/* Invoice Card */}
      <div className='w-full max-w-[440px] bg-[#181818] rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-8 mb-3'>
        <div className='flex justify-between items-start mb-10'>
          <div>
            <h1 className='text-[32px] font-semibold text-[#fafafa] mb-1 tracking-tight'>
              {mapCurrency(invoice?.currency) || 'USD'}
              {invoice.total.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h1>
            <p className='text-[13px] text-[#8C8C8C]'>
              {invoice.status === 'paid'
                ? `Paid on ${new Date(invoice.paidAt || '').toLocaleDateString()}`
                : `Due ${new Date(invoice.dueDate).toLocaleDateString()}`}
            </p>
          </div>
        </div>

        <div className='space-y-5 mb-7'>
          <div className='flex justify-between items-center'>
            <span className='text-[13px] text-[#8C8C8C]'>To</span>
            <span className='text-[13px] text-[#fafafa]'>{invoice?.client?.user?.name}</span>
          </div>
          <div className='flex justify-between items-center'>
            <span className='text-[13px] text-[#8C8C8C]'>From</span>
            <span className='text-[13px] text-[#fafafa]'>{invoice.createdBy.name}</span>
          </div>
          <div className='flex justify-between items-center'>
            <span className='text-[13px] text-[#8C8C8C]'>Invoice</span>
            <span className='text-[13px] text-[#fafafa] font-mono'>{invoice.invoiceNumber}</span>
          </div>
          {invoice.status === 'paid' && (
            <div className='flex justify-between items-center'>
              <span className='text-[13px] text-[#8C8C8C]'>Status</span>
              <span className='text-[13px] text-green-500 font-medium flex items-center gap-1'>
                <CheckCircle className='w-3.5 h-3.5' /> Paid
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Payment Methods */}
      <div className='w-full max-w-[440px] bg-[#181818] rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-8'>
        {invoice.status === 'paid' ? (
          <div className='text-center py-6'>
            <CheckCircle className='text-green-500 w-12 h-12 mx-auto mb-4' />
            <h2 className='text-xl font-semibold text-[#fafafa] mb-2'>Payment Complete</h2>
            <p className='text-[#8C8C8C] mb-4'>
              This invoice has been paid on {new Date(invoice.paidAt || '').toLocaleDateString()}
            </p>
            <div className='bg-[#232323] p-4 rounded-lg text-left mb-4'>
              <div className='flex justify-between mb-2'>
                <span className='text-[#8C8C8C]'>Payment ID:</span>
                <span className='font-mono text-sm text-[#fafafa]'>{invoice.paymentIntentId}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-[#8C8C8C]'>Amount:</span>
                <span className='font-medium text-[#fafafa]'>
                  {mapCurrency(invoice.currency) || 'USD'}{' '}
                  {invoice.total.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
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
        <div className='mt-10 flex items-center justify-center gap-6 text-[13px] text-[#8C8C8C]'>
          <span>Powered by stripe</span>
          <span className='hover:text-[#fafafa] transition-colors cursor-pointer'>Terms</span>
          <span className='hover:text-[#fafafa] transition-colors cursor-pointer'>Privacy</span>
        </div>
      </div>

      {/* Invoice Preview */}
      <div className='flex flex-col items-center justify-center w-full mt-14'>
        <div className='rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-8'>
          <div className='w-full overflow-auto flex justify-center'>
            <div style={{ transform: 'scale(0.8)', transformOrigin: 'top center' }}>
              <InvoicePdf
                invoice={{
                  _id: invoice._id,
                  invoiceNumber: invoice.invoiceNumber,
                  client: {
                    _id: invoice.client._id,
                    user: {
                      name: invoice.client.user.name,
                      email: invoice.client.user.email,
                    },
                    phone: invoice.client.phone,
                    address: invoice.client.address,
                    shippingAddress: invoice.client.shippingAddress,
                    contact: invoice.client.contact,
                    taxId: invoice.client.taxId,
                    website: invoice.client.website,
                    isActive: invoice.client.isActive,
                    createdAt: invoice.client.createdAt,
                    updatedAt: invoice.client.updatedAt,
                  },
                  items: invoice.items.map((item) => {
                    return {
                      _id: item._id,
                      name: item.name,
                      description: item.description,
                      quantity: item.quantity,
                      price: item.price,
                      discount: item.discount,
                      tax: item.tax,
                      taxName: item.taxName,
                    };
                  }),
                  total: invoice.total,
                  status: invoice.status as any,
                  dueDate: invoice.dueDate,
                  notes: invoice.notes,
                  currency: invoice.currency,
                  createdBy: {
                    _id: invoice.createdBy._id,
                    name: invoice.createdBy.name,
                  },
                  createdAt: invoice.createdAt,
                }}
                isReadOnly={true}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className='max-w-4xl w-[90vw] h-[90vh] p-0 flex flex-col overflow-hidden bg-[#181818] border-[#232323]'>
          <DialogHeader className='p-6 border-b border-[#232323]'>
            <div className='flex justify-between items-center'>
              <DialogTitle className='text-xl font-semibold text-[#fafafa]'>
                Invoice #{invoice.invoiceNumber}
              </DialogTitle>
              <DialogClose asChild>
                <button className='rounded-full p-1.5 hover:bg-[#232323]'>
                  <X className='h-5 w-5 text-[#8C8C8C]' />
                  <span className='sr-only'>Close</span>
                </button>
              </DialogClose>
            </div>
            <DialogDescription className='text-[#8C8C8C]'>
              Created on {new Date(invoice.createdAt).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>

          <div className='flex-1 overflow-auto p-6'>
            {/* Invoice Header */}
            <div className='flex justify-between mb-8'>
              <div>
                <h3 className='font-semibold mb-2 text-[#fafafa]'>From</h3>
                <p className='text-[#8C8C8C]'>{invoice.createdBy.name}</p>
              </div>
              <div className='text-right'>
                <h3 className='font-semibold mb-2 text-[#fafafa]'>To</h3>
                <p className='text-[#8C8C8C]'>{invoice?.client?.user?.name}</p>
                <p className='text-[#8C8C8C]'>{invoice?.client?.user?.email}</p>
              </div>
            </div>

            {/* Invoice Info */}
            <div className='grid grid-cols-2 gap-6 mb-8'>
              <div>
                <h3 className='font-semibold mb-2 text-[#fafafa]'>Invoice Number</h3>
                <p className='font-mono text-[#8C8C8C]'>{invoice.invoiceNumber}</p>
              </div>
              <div>
                <h3 className='font-semibold mb-2 text-[#fafafa]'>Due Date</h3>
                <p className='text-[#8C8C8C]'>{new Date(invoice.dueDate).toLocaleDateString()}</p>
              </div>
              <div>
                <h3 className='font-semibold mb-2 text-[#fafafa]'>Status</h3>
                <p
                  className={
                    invoice.status === 'paid' ? 'text-green-500 font-medium' : 'text-[#8C8C8C]'
                  }
                >
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
                <h3 className='font-semibold mb-2 text-[#fafafa]'>Delivery Method</h3>
                <p className='capitalize text-[#8C8C8C]'>{invoice.deliveryOptions}</p>
              </div>
            </div>

            {/* Invoice Summary */}
            <div className='border border-[#232323] rounded-lg overflow-hidden mb-6'>
              <div className='bg-[#232323] p-4 border-b border-[#232323]'>
                <h3 className='font-semibold text-[#fafafa]'>Invoice Summary</h3>
              </div>
              <div className='p-4 space-y-4'>
                <div className='flex justify-between text-[#8C8C8C]'>
                  <span>Subtotal</span>
                  <span>
                    {mapCurrency(invoice.currency)}
                    {invoice.subtotal.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                {invoice.discount > 0 && (
                  <div className='flex justify-between text-green-500'>
                    <span>Discount</span>
                    <span>
                      -{mapCurrency(invoice.currency)}
                      {invoice.discount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                )}
                <div className='flex justify-between text-[#8C8C8C]'>
                  <span>Tax</span>
                  <span>
                    {mapCurrency(invoice.currency)}
                    {invoice.tax.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className='border-t border-[#232323] pt-4 flex justify-between font-semibold text-[#fafafa]'>
                  <span>Total</span>
                  <span>
                    {mapCurrency(invoice.currency)}
                    {invoice.total.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Info (if paid) */}
            {invoice.status === 'paid' && (
              <div className='bg-[#232323] p-4 rounded-lg'>
                <h3 className='font-semibold mb-3 text-[#fafafa]'>Payment Information</h3>
                <div className='space-y-2'>
                  <div className='flex justify-between'>
                    <span className='text-[#8C8C8C]'>Payment ID</span>
                    <span className='font-mono text-sm text-[#fafafa]'>
                      {invoice.paymentIntentId}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-[#8C8C8C]'>Payment Date</span>
                    <span className='text-[#fafafa]'>
                      {new Date(invoice.paidAt || '').toLocaleDateString()}
                    </span>
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
