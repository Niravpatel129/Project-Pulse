import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FiChevronDown } from 'react-icons/fi';
import InvoiceActionBar from './InvoiceActionBar';

export default function InvoicePreview() {
  return (
    <div className='bg-[#141414] min-h-screen'>
      <InvoiceActionBar />
      {/* Header Section */}
      <div className='flex flex-col md:flex-row md:items-center md:justify-between px-8 py-6 border-b border-[#232323] bg-[#181818]'>
        <div className='flex items-center gap-4 mb-4 md:mb-0'>
          <span className='px-2 py-1 rounded bg-[#2d2d2d] text-xs font-semibold text-[#a78bfa] border border-[#232323]'>
            Sent
          </span>
          <span className='px-2 py-1 rounded bg-[#2d2d2d] text-xs font-semibold text-[#f5a623] border border-[#232323]'>
            50% Deposit Required
          </span>
        </div>
        <div className='flex items-center gap-6'>
          <div className='flex flex-col items-end'>
            <span className='text-xs text-[#8C8C8C]'>Amount</span>
            <span className='text-2xl font-bold text-white'>$26.40</span>
          </div>
          <Separator orientation='vertical' className='bg-[#232323] h-10 mx-2' />
          <div className='flex flex-col items-end'>
            <span className='text-xs text-[#8C8C8C]'>Deposit Due</span>
            <span className='text-lg font-semibold text-[#a78bfa]'>
              $13.20 <span className='text-xs'>(50%)</span>
            </span>
          </div>
          <Separator orientation='vertical' className='bg-[#232323] h-10 mx-2' />
          <div className='flex flex-col items-end'>
            <span className='text-xs text-[#8C8C8C]'>Due Date</span>
            <span className='text-base font-medium text-white'>Due in 29 days</span>
          </div>
        </div>
      </div>
      {/* Invoice Info Section */}
      <div className='flex flex-col md:flex-row md:items-center md:justify-between px-8 py-4 border-b border-[#232323] bg-[#181818]'>
        <div className='flex items-center gap-4'>
          <span className='text-2xl font-bold text-white'>Invoice #INV-202505-0020</span>
          <Button variant='ghost' size='icon' className='text-[#8C8C8C]'>
            <FiChevronDown size={18} />
          </Button>
        </div>
        <div className='flex items-center gap-6 mt-4 md:mt-0'>
          <div className='flex items-center gap-2'>
            <span className='text-xs text-[#8C8C8C]'>Customer</span>
            <Button
              variant='outline'
              size='sm'
              className='bg-[#232323] border-[#333] text-white px-3 py-1 rounded-md'
            >
              asd
            </Button>
          </div>
          <div className='flex items-center gap-2'>
            <span className='text-xs text-[#8C8C8C]'>Business</span>
            <Button
              variant='outline'
              size='sm'
              className='bg-[#232323] border-[#333] text-white px-3 py-1 rounded-md'
            >
              Bolo Create
            </Button>
          </div>
        </div>
      </div>
      {/* Timeline Section */}
      <div className='px-8 py-6'>
        <div className='flex flex-col md:flex-row gap-6'>
          {/* Timeline */}
          <div className='flex-1 bg-[#181818] rounded-lg border border-[#232323] p-6'>
            <div className='flex flex-col gap-6'>
              {/* Create */}
              <div className='flex items-center gap-4'>
                <span className='inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#22c55e]/20'>
                  <svg width='20' height='20' fill='none' viewBox='0 0 24 24'>
                    <circle cx='12' cy='12' r='10' fill='#22c55e' />
                    <path
                      d='M16 10l-4.5 4.5L8 11'
                      stroke='white'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                </span>
                <div>
                  <div className='font-semibold text-white'>Create</div>
                  <div className='text-xs text-[#8C8C8C]'>Created: 5/8/2025, 11:26:20 PM</div>
                </div>
                <div className='ml-auto'>
                  <Button
                    variant='outline'
                    size='sm'
                    className='bg-[#232323] border-[#333] text-white'
                  >
                    Edit invoice
                  </Button>
                </div>
              </div>
              <Separator className='bg-[#232323]' />
              {/* Send */}
              <div className='flex items-center gap-4'>
                <span className='inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#3b82f6]/20'>
                  <svg width='20' height='20' fill='none' viewBox='0 0 24 24'>
                    <circle cx='12' cy='12' r='10' fill='#3b82f6' />
                    <path
                      d='M8 12l2 2 4-4'
                      stroke='white'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                </span>
                <div>
                  <div className='font-semibold text-white'>Send</div>
                  <div className='text-xs text-[#8C8C8C]'>
                    Last sent: Marked as sent 5/9/2025, 12:11:10 AM{' '}
                    <span className='underline cursor-pointer'>Edit date</span>
                  </div>
                </div>
                <div className='ml-auto'>
                  <Button
                    variant='outline'
                    size='sm'
                    className='bg-[#232323] border-[#333] text-white'
                  >
                    Resend invoice
                  </Button>
                </div>
              </div>
              <Separator className='bg-[#232323]' />
              {/* Manage Payments */}
              <div className='flex items-center gap-4'>
                <span className='inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#a78bfa]/20'>
                  <svg width='20' height='20' fill='none' viewBox='0 0 24 24'>
                    <circle cx='12' cy='12' r='10' fill='#a78bfa' />
                    <path
                      d='M12 8v4l3 3'
                      stroke='white'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                </span>
                <div>
                  <div className='font-semibold text-white'>Manage payments</div>
                  <div className='text-xs text-[#8C8C8C]'>
                    Amount due: $26.40 —{' '}
                    <span className='underline cursor-pointer'>Record a payment</span> manually
                  </div>
                </div>
                <div className='ml-auto'>
                  <Button variant='default' size='sm' className='bg-[#232323] text-white'>
                    Record a payment
                  </Button>
                </div>
              </div>
            </div>
            {/* Payments received */}
            <div className='mt-8'>
              <div className='text-xs text-[#8C8C8C] mb-2'>Payments received:</div>
              <div className='text-sm text-[#8C8C8C]'>No payments recorded yet.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
