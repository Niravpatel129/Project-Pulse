'use client';

import { InvoicesTable } from '@/app/[workspace]/invoices/components/invoices-table';
import { useInvoices } from '@/app/[workspace]/invoices/hooks/useInvoices';
import { Button } from '@/components/ui/button';
import { LucidePiggyBank, PlusIcon } from 'lucide-react';
import { useState } from 'react';
import InvoicesDialog from '../invoices/InvoicesDialog/InvoicesDialog';

export default function ProjectPayments() {
  const [isInvoicesDialogOpen, setIsInvoicesDialogOpen] = useState(false);
  const {
    accountStatus,
    isAccountStatusLoading,
    createStripeAccount,
    invoices,
    isCreatingAccount,
  } = useInvoices();

  const handleCreateAccount = async () => {
    try {
      const data = await createStripeAccount();
      if (data.onboardingUrl) {
        window.location.href = data.onboardingUrl;
      }
    } catch (error) {
      console.error('Error creating Stripe account:', error);
    }
  };

  if (invoices) {
    return (
      <>
        <div className='flex justify-between items-center mb-4'>
          <h1 className='text-3xl font-semibold'>Invoices</h1>
          <Button
            variant='outline'
            onClick={() => {
              return setIsInvoicesDialogOpen(true);
            }}
          >
            <PlusIcon className='w-4 h-2' />
            Create Invoice
          </Button>
        </div>
        <InvoicesTable invoices={invoices} />
        <InvoicesDialog open={isInvoicesDialogOpen} onOpenChange={setIsInvoicesDialogOpen} />
      </>
    );
  }

  return (
    <>
      <InvoicesDialog open={isInvoicesDialogOpen} onOpenChange={setIsInvoicesDialogOpen} />
      {isAccountStatusLoading ? (
        <div className='flex justify-center items-center h-[300px]'>
          <div className='animate-pulse space-y-4'>
            <div className='h-16 w-16 bg-gray-200 rounded-full mx-auto'></div>
            <div className='h-8 w-64 bg-gray-200 rounded mx-auto'></div>
            <div className='h-4 w-96 bg-gray-200 rounded mx-auto'></div>
            <div className='h-4 w-80 bg-gray-200 rounded mx-auto'></div>
            <div className='h-10 w-48 bg-gray-200 rounded-md mx-auto'></div>
          </div>
        </div>
      ) : (
        <div className='flex justify-center items-center relative z-10'>
          <div className='flex flex-col justify-center p-6 max-w-2xl text-center mt-[50px]'>
            <div className='relative mb-4'>
              <div className='absolute inset-0 bg-gradient-to-r from-green-100 to-blue-100 rounded-full opacity-30 blur-md'></div>
              <div className='relative flex items-center justify-center'>
                <LucidePiggyBank className='h-16 w-16 mx-auto text-green-500 drop-shadow-md' />
              </div>
            </div>
            <div className='mx-auto'>
              <h2 className='text-3xl font-bold text-gray-800 mb-6'>Easy Invoicing & Payments</h2>
              <p className='text-gray-600 mb-8'>
                Send invoices and accept online payments. Schedule them to send in the future, and
                Bonsai will automatically send client reminders for payment.
              </p>

              <div className='mb-8 flex justify-center'>
                {!accountStatus?.chargesEnabled ? (
                  <Button
                    className='bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md'
                    onClick={handleCreateAccount}
                    disabled={isCreatingAccount}
                  >
                    {isCreatingAccount ? 'Setting up...' : 'Connect Stripe Account'}
                  </Button>
                ) : (
                  <Button
                    className='bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md'
                    onClick={() => {
                      setIsInvoicesDialogOpen(true);
                    }}
                  >
                    Create Invoice
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
