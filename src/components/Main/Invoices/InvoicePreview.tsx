import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import InvoiceActionBar from './InvoiceActionBar';

export default function InvoicePreview() {
  return (
    <div className='bg-background min-h-screen'>
      <InvoiceActionBar />
      <div className=''>
        <div className='flex flex-col space-y-6 pb-6 border-b border-[#232323]  rounded-t-lg'>
          {/* Invoice Info Section */}
          <div className='flex flex-col border-b border-[#232323] px-5 mt-3'>
            <div className='flex items-center'>
              <span className='text-[14px] font-medium text-white'>Invoice #INV-202505-0020</span>
              <Badge className='ml-2'>Paid</Badge>
            </div>
            <div className='flex flex-col sm:flex-row gap-4 mt-2'>
              <div className='flex items-center gap-0'>
                <span className='text-sm text-[#8C8C8C]'>Customer:</span>
                <Button variant='link' size='sm'>
                  asd
                </Button>
              </div>
              <div className='flex items-center gap-0'>
                <span className='text-sm text-[#8C8C8C]'>Business:</span>
                <Button variant='link' size='sm'>
                  Bolo Create
                </Button>
              </div>
            </div>
          </div>
          <div className='grid grid-cols-3 gap-4 px-5'>
            <div className='flex flex-col'>
              <span className='text-sm text-[#8C8C8C] mb-2'>Amount</span>
              <span className='text-[14px] font-bold text-white'>$26.40</span>
            </div>
            <div className='flex flex-col'>
              <span className='text-sm text-[#8C8C8C] mb-2'>Deposit Due</span>
              <span className='text-[14px] font-semibold text-[#a78bfa]'>
                $13.20 <span className='text-sm'>(50%)</span>
              </span>
            </div>
            <div className='flex flex-col'>
              <span className='text-sm text-[#8C8C8C] mb-2'>Due Date</span>
              <span className='text-[14px] font-medium text-white'>Due in 29 days</span>
            </div>
          </div>
        </div>

        {/* Timeline Section */}
        <div className='py-6 space-y-6 px-5'>
          {/* Timeline */}
          <div className='bg-[#141414] rounded-lg border border-[#232323] p-6'>
            <div className='flex flex-col space-y-6'>
              {/* Create */}
              <div className='flex flex-col sm:flex-row sm:items-center gap-4'>
                <div className='flex items-center gap-4'>
                  <span className='inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#22c55e]/20 shrink-0'>
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
                    <div className='font-semibold text-white text-[14px] mb-1'>Create</div>
                    <div className='text-sm text-[#8C8C8C]'>Created: 5/8/2025, 11:26:20 PM</div>
                  </div>
                </div>
                <div className='sm:ml-auto'>
                  <Button
                    variant='outline'
                    size='sm'
                    className='bg-[#232323] border-[#333] text-white text-sm h-11 w-full sm:w-auto px-6'
                  >
                    Edit invoice
                  </Button>
                </div>
              </div>
              <Separator className='bg-[#232323]' />
              {/* Send */}
              <div className='flex flex-col sm:flex-row sm:items-center gap-4'>
                <div className='flex items-center gap-4'>
                  <span className='inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#3b82f6]/20 shrink-0'>
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
                    <div className='font-semibold text-white text-[14px] mb-1'>Send</div>
                    <div className='text-sm text-[#8C8C8C]'>
                      Last sent: Marked as sent 5/9/2025, 12:11:10 AM{' '}
                      <span className='underline cursor-pointer'>Edit date</span>
                    </div>
                  </div>
                </div>
                <div className='sm:ml-auto'>
                  <Button
                    variant='outline'
                    size='sm'
                    className='bg-[#232323] border-[#333] text-white text-sm h-11 w-full sm:w-auto px-6'
                  >
                    Resend invoice
                  </Button>
                </div>
              </div>
              <Separator className='bg-[#232323]' />
              {/* Manage Payments */}
              <div className='flex flex-col sm:flex-row sm:items-center gap-4'>
                <div className='flex items-center gap-4'>
                  <span className='inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#a78bfa]/20 shrink-0'>
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
                    <div className='font-semibold text-white text-[14px] mb-1'>Manage payments</div>
                    <div className='text-sm text-[#8C8C8C]'>
                      Amount due: $26.40 —{' '}
                      <span className='underline cursor-pointer'>Record a payment</span> manually
                    </div>
                  </div>
                </div>
                <div className='sm:ml-auto'>
                  <Button
                    variant='default'
                    size='sm'
                    className='bg-[#232323] text-white text-sm h-11 w-full sm:w-auto px-6'
                  >
                    Record a payment
                  </Button>
                </div>
              </div>
            </div>
            {/* Payments received */}
            <div className='mt-8'>
              <div className='text-sm text-[#8C8C8C] mb-3'>Payments received:</div>
              <div className='text-sm text-[#8C8C8C]'>No payments recorded yet.</div>
            </div>
          </div>

          {/* Additional Info Panel */}
          <div className='bg-[#141414] rounded-lg border border-[#232323] p-6'>
            <h3 className='text-[14px] font-semibold text-white mb-5'>Additional Information</h3>
            <div className='grid grid-cols-2 gap-6'>
              <div>
                <div className='text-sm text-[#8C8C8C] mb-2'>Invoice Date</div>
                <div className='text-[14px] text-white'>May 8, 2025</div>
              </div>
              <div>
                <div className='text-sm text-[#8C8C8C] mb-2'>Due Date</div>
                <div className='text-[14px] text-white'>June 6, 2025</div>
              </div>
              <div className='col-span-2'>
                <div className='text-sm text-[#8C8C8C] mb-2'>Payment Terms</div>
                <div className='text-[14px] text-white'>Net 30</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
