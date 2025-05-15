import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
      _id: string;
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
  const router = useRouter();

  const receiptData = {
    _id: payment._id,
    receiptNumber: `RCP-${payment._id.slice(-6)}`,
    client: {
      _id: payment.invoice?.client?._id || '',
      user: {
        name: payment.invoice?.client?.user?.name || 'N/A',
        email: '',
      },
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        country: '',
        zip: '',
      },
    },
    items: [
      {
        _id: '1',
        name: 'Payment',
        description: payment.memo,
        quantity: 1,
        price: payment.amount,
        tax: 0,
        taxName: '',
      },
    ],
    total: payment.amount,
    status: payment.status.toLowerCase() as 'completed' | 'pending' | 'failed',
    date: payment.date,
    notes: payment.memo || '',
    currency: payment.invoice?.currency || 'USD',
    paymentMethod: payment.method,
    createdBy: {
      _id: '',
      name: '',
    },
  };

  return (
    <div className='h-full overflow-y-auto'>
      <div className='sticky top-0 z-10 bg-background border-b border-[#E4E4E7] dark:border-[#232428] p-4'>
        <div className='flex items-center justify-between'>
          <h2 className='text-lg font-semibold text-[#3F3F46] dark:text-white'>Payment Details</h2>
          <Button
            variant='ghost'
            size='icon'
            className='text-[#3F3F46]/60 dark:text-[#8b8b8b] hover:text-[#3F3F46] dark:hover:text-white'
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
        <div className='flex flex-col space-y-6 pb-6 border-b border-[#E4E4E7] dark:border-[#232323] rounded-t-lg'>
          <div className='flex flex-col border-b border-[#E4E4E7] dark:border-[#232323] px-4'>
            <div className='flex items-center'>
              <span className='text-[14px] font-medium text-[#3F3F46] dark:text-white'>
                Payment #{payment._id.slice(-6)}
              </span>
              <Badge variant='secondary' className={`ml-2 ${getStatusColor(payment.status)}`}>
                {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
              </Badge>
            </div>
            <div className='flex flex-col sm:flex-row gap-4 mt-2 mb-2'>
              <div className='flex items-center gap-0'>
                <span className='text-sm text-[#3F3F46]/60 dark:text-[#8C8C8C]'>Customer:</span>
                <span className='text-sm text-[#3F3F46] dark:text-white ml-1'>
                  {payment.invoice?.client?.user?.name || 'N/A'}
                </span>
              </div>
              <div className='flex items-center gap-0'>
                <span className='text-sm text-[#3F3F46]/60 dark:text-[#8C8C8C]'>Invoice:</span>
                <Button
                  variant='link'
                  size='sm'
                  onClick={() => {
                    router.push(`/dashboard/invoices?inv=${payment.invoice?._id}`);
                  }}
                >
                  <span className='text-sm text-[#3F3F46] dark:text-white ml-1 hover:underline'>
                    {payment.invoice?.invoiceNumber || 'N/A'}
                  </span>
                </Button>
              </div>
            </div>
          </div>
          <div className='grid grid-cols-2 gap-4 px-4'>
            <div className='flex flex-col'>
              <span className='text-sm text-[#3F3F46]/60 dark:text-[#8C8C8C] mb-2'>Amount</span>
              <span className='text-[14px] font-bold text-[#3F3F46] dark:text-white'>
                {payment.amount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{' '}
                {payment.invoice?.currency}
              </span>
            </div>
            <div className='flex flex-col'>
              <span className='text-sm text-[#3F3F46]/60 dark:text-[#8C8C8C] mb-2'>Method</span>
              <span className='text-[14px] font-medium text-[#3F3F46] dark:text-white capitalize'>
                {payment.method.replace('-', ' ')}
              </span>
            </div>
          </div>
        </div>
        <div className='px-4'>
          <div className='bg-white dark:bg-[#141414] rounded-lg border border-[#E4E4E7] dark:border-[#232323] p-6'>
            <h3 className='text-[14px] font-semibold text-[#3F3F46] dark:text-white mb-5'>
              Additional Information
            </h3>
            <div className='grid grid-cols-1 gap-6'>
              {payment.memo && (
                <div>
                  <div className='text-sm text-[#3F3F46]/60 dark:text-[#8C8C8C] mb-2'>Memo</div>
                  <div className='text-[14px] text-[#3F3F46] dark:text-white'>{payment.memo}</div>
                </div>
              )}
              <div>
                <div className='text-sm text-[#3F3F46]/60 dark:text-[#8C8C8C] mb-2'>Payment ID</div>
                <div className='text-[14px] text-[#3F3F46] dark:text-white'>{payment._id}</div>
              </div>
              <div>
                <div className='text-sm text-[#3F3F46]/60 dark:text-[#8C8C8C] mb-2'>Date</div>
                <div className='text-[14px] text-[#3F3F46] dark:text-white'>
                  {new Date(payment.date).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Receipt Section */}
        <div className='px-4 mt-8'>
          <div className='flex items-center justify-between mb-5'>
            <Button
              variant='outline'
              size='sm'
              className='bg-[#F4F4F5] dark:bg-[#232323] border-[#E4E4E7] dark:border-[#333] text-[#3F3F46] dark:text-white text-sm h-8 px-4'
              onClick={() => {
                window.open(`/portal/payments/receipt/${payment._id}`, '_blank');
              }}
            >
              <Download className='w-4 h-4 mr-2' />
              Download Receipt
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
