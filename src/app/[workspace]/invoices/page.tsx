import { Button } from '@/components/ui/button';
import { ArrowRight, LucidePiggyBank } from 'lucide-react';
import Link from 'next/link';

export default function InvoiceInterface() {
  return (
    <div className='min-h-screen bg-white'>
      {/* Navigation */}
      <div className='border-b border-t'>
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
                <Button className='bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md'>
                  Create an Invoice
                </Button>
              </div>

              <div className='flex justify-center'>
                <Link href='#' className='inline-flex items-center text-green-500 font-medium'>
                  Learn More
                  <ArrowRight className='ml-2 h-4 w-4' />
                </Link>
              </div>
            </div>

            <div className='mt-8 text-center text-sm text-gray-500'>
              Have questions?{' '}
              <Link href='#' className='text-green-500'>
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
