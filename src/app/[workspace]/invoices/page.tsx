'use client';

import { Button } from '@/components/ui/button';
import { newRequest } from '@/utils/newRequest';
import { AlertCircle, LucidePiggyBank } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import InvoiceTable from './components/InvoiceTable';
import { Invoice } from './types';

export default function InvoiceInterface() {
  const [isLoading, setIsLoading] = useState(false);
  const [accountStatus, setAccountStatus] = useState(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const checkAccountStatus = async () => {
      try {
        const res = await newRequest.get('/stripe/connect/account-status');
        if (res.data.success) {
          setAccountStatus(res.data.data);
        }
      } catch (error) {
        console.error('Error checking account status:', error);
      }
    };

    const fetchInvoices = async () => {
      try {
        const res = await newRequest.get('/invoices');
        if (res.data.status === 'success') {
          setInvoices(res.data.data);
        }
      } catch (error) {
        console.error('Error fetching invoices:', error);
      }
    };

    checkAccountStatus();
    fetchInvoices();
  }, []);

  const handleCreateAccount = async () => {
    try {
      setIsLoading(true);
      const res = await newRequest.post('/stripe/connect/create-account');

      if (res.data.success && res.data.data.onboardingUrl) {
        window.location.href = res.data.data.onboardingUrl;
      } else {
        console.error('Failed to get onboarding URL');
      }
    } catch (error) {
      console.error('Error creating Stripe account:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const status = searchParams.get('status');

  return (
    <div className='min-h-screen bg-white'>
      {/* Navigation */}
      <div className='border-b'>
        <div className='container mx-auto px-4'>
          <nav className='flex space-x-8 gap-4'>
            <Link href='#' className='border-b-2 border-green-500 py-4 font-medium text-green-600'>
              Invoices
            </Link>
            <Link href='#' className='py-4 font-medium text-gray-600'>
              Settings
            </Link>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className='container mx-auto px-4 py-8 relative'>
        {status === 'error' && (
          <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-lg'>
            <div className='flex items-center'>
              <AlertCircle className='h-5 w-5 text-red-500 mr-2' />
              <p className='text-red-700'>
                There was an error connecting your Stripe account. Please try again.
              </p>
            </div>
          </div>
        )}

        {accountStatus?.chargesEnabled ? (
          <div className='space-y-6'>
            <div className='flex justify-between items-center'>
              <h1 className='text-2xl font-bold text-gray-800'>Invoices</h1>
              <Button
                className='bg-green-500 hover:bg-green-600 text-white'
                onClick={() => {
                  return router.push('/invoices/new');
                }}
              >
                Create New Invoice
              </Button>
            </div>

            <InvoiceTable invoices={invoices} />
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
                  <Button
                    className='bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md'
                    onClick={handleCreateAccount}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Setting up...' : 'Connect Stripe Account'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
