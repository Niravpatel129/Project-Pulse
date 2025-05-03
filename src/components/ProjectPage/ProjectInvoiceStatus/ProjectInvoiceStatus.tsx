import { Button } from '@/components/ui/button';
import { AlertCircleIcon, BuildingIcon, CheckIcon, CreditCardIcon, MailIcon } from 'lucide-react';

export default function ProjectInvoiceStatus() {
  return (
    <div className='space-y-6'>
      {/* Invoice Status Header */}
      <div className='pb-2'>
        <h3 className='text-xl font-medium text-gray-900'>Invoice Status</h3>
        <p className='text-sm text-gray-500 mt-1'>Sent on 5/14/2025</p>
      </div>

      {/* Awaiting Payment Alert */}
      <div className='bg-amber-50/70 border border-amber-100 p-3.5 rounded-md'>
        <div className='flex items-start gap-2.5'>
          <AlertCircleIcon className='h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0' />
          <div>
            <p className='text-sm font-medium text-amber-800'>Awaiting Payment</p>
            <p className='text-xs text-amber-700 mt-1 leading-relaxed'>
              Invoice #8076 was sent to client@lafavtravels.com. Payment is due by 5/29/2025.
            </p>
          </div>
        </div>
      </div>

      {/* Invoice Details */}
      <div>
        <h4 className='text-sm font-medium text-gray-700 mb-2.5'>Invoice Details</h4>
        <div className='space-y-1'>
          <div className='flex justify-between py-1.5 text-sm'>
            <span className='text-gray-500'>Total Project Value:</span>
            <span className='font-medium text-gray-900'>$1,250.00</span>
          </div>
          <div className='flex justify-between py-1.5 text-sm'>
            <span className='text-gray-500'>Amount Due Now:</span>
            <span className='font-medium text-gray-900'>$1250.00</span>
          </div>
          <div className='flex justify-between py-1.5 text-sm'>
            <span className='text-gray-500'>Invoice Date:</span>
            <span className='font-medium text-gray-900'>5/14/2025</span>
          </div>
          <div className='flex justify-between py-1.5 text-sm'>
            <span className='text-gray-500'>Due Date:</span>
            <span className='font-medium text-gray-900'>5/29/2025</span>
          </div>
          <div className='flex justify-between py-1.5 text-sm'>
            <span className='text-gray-500'>Client Email:</span>
            <span className='font-medium text-gray-900'>client@lafavtravels.com</span>
          </div>
        </div>
      </div>

      {/* Payment Options */}
      <div>
        <h4 className='text-sm font-medium text-gray-700 mb-2.5'>Payment Options</h4>
        <div className='space-y-2'>
          <div className='flex justify-between items-center border border-gray-200 rounded-md p-3'>
            <div className='flex items-center gap-2'>
              <CreditCardIcon className='h-4 w-4 text-gray-400' />
              <span className='text-sm text-gray-700'>Credit Card</span>
            </div>
            <span className='text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-500'>Preferred</span>
          </div>
          <div className='flex justify-between items-center border border-gray-200 rounded-md p-3'>
            <div className='flex items-center gap-2'>
              <BuildingIcon className='h-4 w-4 text-gray-400' />
              <span className='text-sm text-gray-700'>Bank Transfer</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className='space-y-2 pt-1'>
        <Button className='w-full h-9 bg-blue-600 hover:bg-blue-700 transition-colors text-sm font-medium'>
          <CheckIcon className='h-3.5 w-3.5 mr-1.5' />
          Mark as Paid
        </Button>
        <Button variant='outline' className='w-full h-9 text-sm font-medium'>
          <MailIcon className='h-3.5 w-3.5 mr-1.5' />
          Resend Invoice
        </Button>
      </div>

      {/* Payment Checklist */}
      <div className='pt-2'>
        <h4 className='text-sm font-medium text-gray-700 mb-1.5'>Payment Checklist</h4>
        <p className='text-xs text-gray-500 mb-3'>Track payment progress</p>

        <div className='space-y-3'>
          <div className='flex items-start gap-2'>
            <div className='flex-shrink-0 pt-0.5'>
              <div className='h-4 w-4 rounded-sm bg-blue-600 flex items-center justify-center'>
                <CheckIcon className='h-2.5 w-2.5 text-white' />
              </div>
            </div>
            <div>
              <p className='text-sm font-medium text-gray-700'>Invoice sent to client</p>
              <p className='text-xs text-gray-500 mt-0.5'>Sent on 5/14/2025</p>
            </div>
          </div>

          <div className='flex items-start gap-2'>
            <div className='flex-shrink-0 pt-0.5'>
              <div className='h-4 w-4 rounded-sm border border-gray-300'></div>
            </div>
            <div>
              <p className='text-sm font-medium text-gray-700'>Client viewed invoice</p>
              <p className='text-xs text-gray-500 mt-0.5'>Waiting for client to view</p>
            </div>
          </div>

          <div className='flex items-start gap-2'>
            <div className='flex-shrink-0 pt-0.5'>
              <div className='h-4 w-4 rounded-sm border border-gray-300'></div>
            </div>
            <div>
              <p className='text-sm font-medium text-gray-700'>Payment received</p>
              <p className='text-xs text-gray-500 mt-0.5'>Due by 5/29/2025</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
