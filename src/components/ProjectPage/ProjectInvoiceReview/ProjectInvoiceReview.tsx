import BlockWrapper from '@/components/wrappers/BlockWrapper';
import { CalendarIcon, Clock3Icon, FileCheckIcon, Package2Icon } from 'lucide-react';

export default function ProjectInvoiceReview() {
  return (
    <BlockWrapper className='py-6 px-8 border-b border-gray-100'>
      <div className='space-y-8'>
        {/* Header: Project title and date */}
        <div className='flex justify-between items-start'>
          <div className='space-y-1'>
            <h1 className='text-2xl font-medium text-gray-900'>Project Review</h1>
            <p className='text-sm text-gray-500'>Website redesign and branding</p>
          </div>
          <div className='flex items-center text-sm text-gray-500'>
            <CalendarIcon className='mr-2 h-4 w-4' />
            <span>April 25 - May 15, 2025</span>
          </div>
        </div>

        {/* Project metrics */}
        <div className='grid grid-cols-3 gap-12'>
          {/* Status */}
          <div className='flex items-center gap-3'>
            <div className='flex items-center justify-center w-9 h-9 rounded-full bg-gray-50'>
              <Package2Icon className='h-4 w-4 text-gray-500' />
            </div>
            <div>
              <p className='text-xs text-gray-500 mb-1'>Project Status</p>
              <p className='text-sm font-medium text-gray-900'>Invoice Sent</p>
            </div>
          </div>

          {/* Time */}
          <div className='flex items-center gap-3'>
            <div className='flex items-center justify-center w-9 h-9 rounded-full bg-gray-50'>
              <Clock3Icon className='h-4 w-4 text-gray-500' />
            </div>
            <div>
              <p className='text-xs text-gray-500 mb-1'>Time Tracked</p>
              <p className='text-sm font-medium text-gray-900'>32 hours</p>
            </div>
          </div>

          {/* Deliverables */}
          <div className='flex items-center gap-3'>
            <div className='flex items-center justify-center w-9 h-9 rounded-full bg-gray-50'>
              <FileCheckIcon className='h-4 w-4 text-gray-500' />
            </div>
            <div>
              <p className='text-xs text-gray-500 mb-1'>Deliverables</p>
              <p className='text-sm font-medium text-gray-900'>5 completed</p>
            </div>
          </div>
        </div>
      </div>
    </BlockWrapper>
  );
}
