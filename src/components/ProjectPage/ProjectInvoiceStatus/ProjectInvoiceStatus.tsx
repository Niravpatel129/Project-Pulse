import { Button } from '@/components/ui/button';
import { AlertCircleIcon, BuildingIcon, CheckIcon, CreditCardIcon, MailIcon } from 'lucide-react';

export default function ProjectInvoiceStatus() {
  return (
    <div className='space-y-8'>
      {/* Invoice Status Header */}
      <div>
        <h3 className='text-2xl font-semibold'>Invoice Status</h3>
        <p className='text-gray-500'>Sent on 5/14/2025</p>
      </div>

      {/* Awaiting Payment Alert */}
      <div className='bg-amber-50 border border-amber-100 p-4 rounded-lg'>
        <div className='flex items-start gap-3'>
          <AlertCircleIcon className='h-5 w-5 text-amber-500 mt-0.5' />
          <div>
            <p className='font-medium text-amber-800'>Awaiting Payment</p>
            <p className='text-amber-700 mt-1'>
              Invoice #8076 was sent to client@lafavtravels.com. Payment is due by 5/29/2025.
            </p>
          </div>
        </div>
      </div>

      {/* Invoice Details */}
      <div>
        <h4 className='text-lg font-medium mb-3'>Invoice Details</h4>
        <div className='space-y-2'>
          <div className='flex justify-between py-2'>
            <span className='text-gray-500'>Total Project Value:</span>
            <span className='font-medium'>$1,250.00</span>
          </div>
          <div className='flex justify-between py-2'>
            <span className='text-gray-500'>Amount Due Now:</span>
            <span className='font-medium'>$1250.00</span>
          </div>
          <div className='flex justify-between py-2'>
            <span className='text-gray-500'>Invoice Date:</span>
            <span className='font-medium'>5/14/2025</span>
          </div>
          <div className='flex justify-between py-2'>
            <span className='text-gray-500'>Due Date:</span>
            <span className='font-medium'>5/29/2025</span>
          </div>
          <div className='flex justify-between py-2'>
            <span className='text-gray-500'>Client Email:</span>
            <span className='font-medium'>client@lafavtravels.com</span>
          </div>
          <div className='border-t border-gray-100 my-2'></div>
        </div>
      </div>

      {/* Payment Options */}
      <div>
        <h4 className='text-lg font-medium mb-3'>Payment Options</h4>
        <div className='space-y-3'>
          <div className='flex justify-between items-center border border-gray-200 rounded-lg p-4'>
            <div className='flex items-center gap-3'>
              <CreditCardIcon className='h-5 w-5 text-gray-500' />
              <span>Credit Card</span>
            </div>
            <span className='text-sm bg-gray-100 px-3 py-1 rounded-md'>Preferred</span>
          </div>
          <div className='flex justify-between items-center border border-gray-200 rounded-lg p-4'>
            <div className='flex items-center gap-3'>
              <BuildingIcon className='h-5 w-5 text-gray-500' />
              <span>Bank Transfer</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className='space-y-3'>
        <Button className='w-full py-5 bg-blue-600 hover:bg-blue-700'>
          <CheckIcon className='h-4 w-4 mr-2' />
          Mark as Paid
        </Button>
        <Button variant='outline' className='w-full py-5'>
          <MailIcon className='h-4 w-4 mr-2' />
          Resend Invoice
        </Button>
      </div>

      {/* Payment Checklist */}
      <div>
        <h4 className='text-2xl font-semibold'>Payment Checklist</h4>
        <p className='text-gray-500 mb-4'>Track payment progress</p>

        <div className='space-y-4'>
          <div className='flex items-start gap-3'>
            <div className='flex-shrink-0 pt-0.5'>
              <div className='h-5 w-5 rounded bg-blue-600 flex items-center justify-center'>
                <CheckIcon className='h-3 w-3 text-white' />
              </div>
            </div>
            <div>
              <p className='font-medium'>Invoice sent to client</p>
              <p className='text-sm text-gray-500'>Sent on 5/14/2025</p>
            </div>
          </div>

          <div className='flex items-start gap-3'>
            <div className='flex-shrink-0 pt-0.5'>
              <div className='h-5 w-5 rounded border border-gray-300'></div>
            </div>
            <div>
              <p className='font-medium'>Client viewed invoice</p>
              <p className='text-sm text-gray-500'>Waiting for client to view</p>
            </div>
          </div>

          <div className='flex items-start gap-3'>
            <div className='flex-shrink-0 pt-0.5'>
              <div className='h-5 w-5 rounded border border-gray-300'></div>
            </div>
            <div>
              <p className='font-medium'>Payment received</p>
              <p className='text-sm text-gray-500'>Due by 5/29/2025</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
