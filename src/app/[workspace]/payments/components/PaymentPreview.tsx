import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Payment {
  _id: string;
  amount: number;
  status: string;
  method: string;
  date: string;
  memo?: string;
  invoice?: {
    _id: string;
    invoiceNumber: string;
    currency: string;
    client?: {
      user?: {
        name: string;
      };
    };
  };
}

interface PaymentPreviewProps {
  payment: Payment;
  onClose: () => void;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'bg-green-500/10 text-green-500';
    case 'failed':
      return 'bg-red-500/10 text-red-500';
    case 'pending':
      return 'bg-yellow-500/10 text-yellow-500';
    default:
      return 'bg-gray-500/10 text-gray-500';
  }
};

export function PaymentPreview({ payment, onClose }: PaymentPreviewProps) {
  return (
    <div className='h-full overflow-y-auto'>
      <div className='sticky top-0 z-10 bg-background border-b border-[#232428] p-4'>
        <div className='flex items-center justify-between'>
          <h2 className='text-lg font-semibold text-white'>Payment Details</h2>
          <Button
            variant='ghost'
            size='icon'
            className='text-[#8b8b8b] hover:text-white'
            onClick={onClose}
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='24'
              height='24'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
              className='lucide lucide-x'
            >
              <path d='M18 6 6 18' />
              <path d='m6 6 12 12' />
            </svg>
          </Button>
        </div>
      </div>

      <div className='py-4 space-y-6'>
        <div className='flex flex-col space-y-6 pb-6 border-b border-[#232323] rounded-t-lg'>
          <div className='flex flex-col border-b border-[#232323] px-4'>
            <div className='flex items-center'>
              <span className='text-[14px] font-medium text-white'>
                Payment #{payment._id.slice(-6)}
              </span>
              <Badge variant='secondary' className={`ml-2 ${getStatusColor(payment.status)}`}>
                {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
              </Badge>
            </div>
            <div className='flex flex-col sm:flex-row gap-4 mt-2 mb-2'>
              <div className='flex items-center gap-0'>
                <span className='text-sm text-[#8C8C8C]'>Customer:</span>
                <span className='text-sm text-white ml-1'>
                  {payment.invoice?.client?.user?.name || 'N/A'}
                </span>
              </div>
              <div className='flex items-center gap-0'>
                <span className='text-sm text-[#8C8C8C]'>Invoice:</span>
                <span className='text-sm text-white ml-1'>
                  {payment.invoice?.invoiceNumber || 'N/A'}
                </span>
              </div>
            </div>
          </div>
          <div className='grid grid-cols-2 gap-4 px-4'>
            <div className='flex flex-col'>
              <span className='text-sm text-[#8C8C8C] mb-2'>Amount</span>
              <span className='text-[14px] font-bold text-white'>
                {payment.amount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{' '}
                {payment.invoice?.currency}
              </span>
            </div>
            <div className='flex flex-col'>
              <span className='text-sm text-[#8C8C8C] mb-2'>Method</span>
              <span className='text-[14px] font-medium text-white capitalize'>
                {payment.method.replace('-', ' ')}
              </span>
            </div>
          </div>
        </div>
        <div className='px-4'>
          <div className='bg-[#141414] rounded-lg border border-[#232323] p-6'>
            <h3 className='text-[14px] font-semibold text-white mb-5'>Additional Information</h3>
            <div className='grid grid-cols-1 gap-6'>
              {payment.memo && (
                <div>
                  <div className='text-sm text-[#8C8C8C] mb-2'>Memo</div>
                  <div className='text-[14px] text-white'>{payment.memo}</div>
                </div>
              )}
              <div>
                <div className='text-sm text-[#8C8C8C] mb-2'>Payment ID</div>
                <div className='text-[14px] text-white'>{payment._id}</div>
              </div>
              <div>
                <div className='text-sm text-[#8C8C8C] mb-2'>Date</div>
                <div className='text-[14px] text-white'>
                  {new Date(payment.date).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
