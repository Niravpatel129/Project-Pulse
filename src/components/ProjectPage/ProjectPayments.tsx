'use client';

import { InvoicesTable } from '@/app/[workspace]/invoices/components/invoices-table';
import { useInvoices } from '@/app/[workspace]/invoices/hooks/useInvoices';
import { Button } from '@/components/ui/button';
import { LucidePiggyBank, PlusIcon, ZapIcon } from 'lucide-react';
import { useState } from 'react';
import InvoicesDialog from '../invoices/InvoicesDialog/InvoicesDialog';
import QuickInvoiceDialog from '../invoices/QuickInvoiceDialog/QuickInvoiceDialog';

export default function ProjectPayments() {
  const [isInvoicesDialogOpen, setIsInvoicesDialogOpen] = useState(false);
  const [isQuickInvoiceDialogOpen, setIsQuickInvoiceDialogOpen] = useState(false);
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

  if (invoices?.length > 0) {
    return (
      <>
        <div className='flex justify-between items-center mb-4'>
          <h1 className='text-3xl font-semibold'>Invoices</h1>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              onClick={() => {
                return setIsQuickInvoiceDialogOpen(true);
              }}
            >
              <ZapIcon className='w-4 h-4 mr-2' />
              Quick Invoice
            </Button>
            <Button
              variant='outline'
              onClick={() => {
                return setIsInvoicesDialogOpen(true);
              }}
            >
              <PlusIcon className='w-4 h-4 mr-2' />
              Create Invoice
            </Button>
          </div>
        </div>
        <InvoicesTable invoices={invoices} />
        <InvoicesDialog open={isInvoicesDialogOpen} onOpenChange={setIsInvoicesDialogOpen} />
        <QuickInvoiceDialog
          open={isQuickInvoiceDialogOpen}
          onOpenChange={setIsQuickInvoiceDialogOpen}
        />
      </>
    );
  }

  return (
    <>
      <InvoicesDialog open={isInvoicesDialogOpen} onOpenChange={setIsInvoicesDialogOpen} />
      <QuickInvoiceDialog
        open={isQuickInvoiceDialogOpen}
        onOpenChange={setIsQuickInvoiceDialogOpen}
      />
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
                HourBlock will automatically send client reminders for payment.
              </p>

              <div className='mb-8 flex justify-center gap-2'>
                {!accountStatus?.chargesEnabled ? (
                  <Button
                    className='bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md'
                    onClick={handleCreateAccount}
                    disabled={isCreatingAccount}
                  >
                    {isCreatingAccount ? 'Setting up...' : 'Connect Stripe Account'}
                  </Button>
                ) : (
                  <div className='flex gap-2'>
                    <Button
                      className='bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md'
                      onClick={() => {
                        return setIsQuickInvoiceDialogOpen(true);
                      }}
                    >
                      <ZapIcon className='w-4 h-4 mr-2' />
                      Quick Invoice
                    </Button>
                    <Button
                      className='bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md'
                      onClick={() => {
                        return setIsInvoicesDialogOpen(true);
                      }}
                    >
                      <PlusIcon className='w-4 h-4 mr-2' />
                      Create Invoice
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
