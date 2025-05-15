'use client';
import { InvoicePdf } from '@/components/InvoicePdf/InvoicePdf';
import { PaymentForm } from '@/components/PaymentForm/PaymentForm';
import { PaymentSelector } from '@/components/PaymentForm/PaymentSelector';
import { useStripePayment } from '@/hooks/useStripePayment';
import { Invoice } from '@/types/invoice';
import { newRequest } from '@/utils/newRequest';
import { Elements } from '@stripe/react-stripe-js';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function InvoicePage() {
  const params = useParams();
  const invoiceId = params?.id as string;
  const workspace = params?.workspace as string;

  const { data: invoice, isLoading: queryLoading } = useQuery<Invoice>({
    queryKey: ['invoice', workspace, invoiceId],
    queryFn: async () => {
      const response = await newRequest.get(`/invoices/${invoiceId}/public`);
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => {
      return previousData;
    }, // Use previous data as placeholder during refetch
  });

  const {
    stripePromise,
    clientSecret,
    paymentAmount,
    paymentStatus,
    isLoading,
    handleSelectPayment,
    handleBackToSelection,
    setIsLoading,
  } = useStripePayment({
    invoiceId,
    currency: invoice?.currency || 'USD',
  });

  // Render the payment section based on status
  const renderPaymentSection = () => {
    if (!invoice) return null;

    // If invoice is already paid
    if (invoice.status === 'paid') {
      return (
        <div className='text-center py-6'>
          <CheckCircle className='text-green-500 w-12 h-12 mx-auto mb-4' />
          <h2 className='text-xl font-semibold text-[#fafafa] mb-2'>Payment Complete</h2>
          <p className='text-[#8C8C8C] mb-4'>
            This invoice has been paid on {new Date(invoice.paidAt || '').toLocaleDateString()}
          </p>
          <div className='bg-[#232323] p-4 rounded-lg text-left mb-4'>
            <div className='flex justify-between'>
              <span className='text-[#8C8C8C]'>Amount:</span>
              <span className='font-medium text-[#fafafa]'>
                {invoice.currency || 'USD'}{' '}
                {invoice.total.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        </div>
      );
    }

    // If we're loading (either creating payment intent or initializing Stripe)
    if (isLoading) {
      return (
        <div className='space-y-6'>
          <div className='bg-[#232323] p-4 rounded-xl'>
            <div className='py-12 flex flex-col items-center justify-center'>
              <div className='w-10 h-10 border-4 border-[#0066FF] border-t-transparent rounded-full animate-spin mb-4'></div>
              <p className='text-[#8C8C8C]'>Preparing payment form...</p>
            </div>
          </div>
        </div>
      );
    }

    // If we're selecting a payment option
    if (paymentStatus === 'select') {
      return (
        <PaymentSelector
          invoice={invoice}
          onSelectPayment={handleSelectPayment}
          loading={isLoading}
        />
      );
    }

    // If we have a client secret and payment amount, show the payment form
    if (clientSecret && paymentAmount !== null && stripePromise) {
      return (
        <Elements
          key={clientSecret}
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              theme: 'night',
              variables: {
                colorPrimary: '#0066FF',
                colorBackground: '#232323',
                colorText: '#fafafa',
                colorDanger: '#ef4444',
                fontFamily: 'system-ui, sans-serif',
                spacingUnit: '4px',
                borderRadius: '12px',
              },
              rules: {
                '.Tab': {
                  border: '1px solid #333',
                  borderRadius: '8px',
                },
                '.Tab:hover': {
                  color: 'var(--colorText)',
                },
                '.Tab--selected': {
                  borderColor: '#0066FF',
                  backgroundColor: 'rgba(0, 102, 255, 0.1)',
                },
                '.TabIcon': {
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                },
                '.TabLabel': {
                  fontWeight: '500',
                },
              },
            },
          }}
        >
          <PaymentForm
            clientSecret={clientSecret}
            invoice={invoice}
            paymentAmount={paymentAmount}
            onBack={handleBackToSelection}
            setIsLoading={setIsLoading}
          />
        </Elements>
      );
    }

    return null;
  };

  if (queryLoading) {
    return (
      <div className='min-h-screen bg-[#141414] flex flex-col items-center py-16 px-4 antialiased dark w-full'>
        <div className='mb-16'>
          <div className='flex items-center gap-3'>
            <div className='h-5 w-32 bg-[#232323] rounded animate-pulse' />
          </div>
        </div>
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
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className='min-h-screen bg-[#141414] flex flex-col items-center justify-center py-16 px-4 antialiased dark w-full'>
        <div className='text-[#fafafa] text-center'>
          <h1 className='text-2xl font-semibold mb-2'>Invoice Not Found</h1>
          <p className='text-[#8C8C8C]'>
            The invoice you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission
            to view it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[#141414] flex flex-col items-center py-16 px-4 antialiased dark w-full min-w-screen'>
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
              {invoice.currency || 'USD'}{' '}
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
        {renderPaymentSection()}

        {/* Footer */}
        <div className='mt-10 flex items-center justify-center gap-6 text-[13px] text-[#8C8C8C]'>
          <span>Powered by Stripe</span>
          <span className='hover:text-[#fafafa] transition-colors cursor-pointer'>Terms</span>
          <span className='hover:text-[#fafafa] transition-colors cursor-pointer'>Privacy</span>
        </div>
      </div>

      {/* Invoice Preview */}
      <div className='flex flex-col items-center justify-center w-full mt-14'>
        <div className='w-full max-w-4xl mx-auto'>
          <InvoicePdf
            invoice={{
              _id: invoice._id,
              invoiceNumber: invoice.invoiceNumber,
              client: {
                _id: invoice?.client?._id,
                user: {
                  name: invoice?.client?.user?.name,
                  email: invoice?.client?.user?.email,
                },
                phone: invoice?.client?.phone,
                address: invoice?.client?.address,
                shippingAddress: invoice?.client?.shippingAddress,
                contact: invoice?.client?.contact,
                taxId: invoice?.client?.taxId,
                website: invoice?.client?.website,
                isActive: invoice?.client?.isActive,
                createdAt: invoice?.client?.createdAt,
                updatedAt: invoice?.client?.updatedAt,
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
  );
}
