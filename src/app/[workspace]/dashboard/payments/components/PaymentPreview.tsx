import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useRef } from 'react';

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
  const receiptRef = useRef<HTMLDivElement>(null);

  // Transform payment data into receipt format
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

  const handleDownloadPDF = () => {
    if (!receiptRef.current) return;

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Get the receipt content
    const receiptContent = receiptRef.current.innerHTML;

    // Write the receipt content to the new window
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt ${receiptData.receiptNumber}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            
            body {
              font-family: 'Inter', sans-serif;
              margin: 0;
              padding: 0;
              background: #141414;
            }
            
            .receipt-paper {
              width: 8.5in;
              min-height: 11in;
              padding: 2.5rem 2rem;
              margin: 0 auto;
              background: #141414;
              color: #fafafa;
              border: 1px solid #232428;
              box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
            }
            
            .receipt-paper table {
              width: 100%;
              border-collapse: collapse;
            }
            
            .receipt-paper th {
              background: #232428;
              color: white;
              text-align: left;
              padding: 0.75rem 1rem;
              font-weight: 600;
            }
            
            .receipt-paper td {
              padding: 0.75rem 1rem;
              border-top: 1px solid #232428;
              color: #8C8C8C;
            }
            
            .receipt-paper h1 {
              font-size: 2rem;
              font-weight: 600;
              color: #fafafa;
            }
            
            .receipt-paper .text-sm {
              font-size: 0.875rem;
            }
            
            .receipt-paper .text-base {
              font-size: 1rem;
            }
            
            .receipt-paper .font-semibold {
              font-weight: 600;
            }
            
            .receipt-paper .text-[#8C8C8C] {
              color: #8C8C8C;
            }
            
            .receipt-paper .text-[#fafafa] {
              color: #fafafa;
            }
            
            .receipt-paper .border-[#232428] {
              border-color: #232428;
            }
            
            .receipt-paper .bg-[#232428] {
              background-color: #232428;
            }
            
            @media print {
              body {
                background: white;
              }
              
              .receipt-paper {
                width: 100%;
                height: 100%;
                margin: 0;
                padding: 1in;
                transform: none;
                box-shadow: none;
                border: none;
                background: white;
                color: black;
              }
              
              .receipt-paper th {
                background: #f3f4f6;
                color: black;
              }
              
              .receipt-paper td {
                border-color: #e5e7eb;
                color: #374151;
              }
              
              .receipt-paper h1 {
                color: black;
              }
              
              .receipt-paper .text-[#8C8C8C] {
                color: #6b7280;
              }
              
              .receipt-paper .text-[#fafafa] {
                color: black;
              }
              
              .receipt-paper .border-[#232428] {
                border-color: #e5e7eb;
              }
              
              .receipt-paper .bg-[#232428] {
                background-color: #f3f4f6;
              }
            }
          </style>
        </head>
        <body>
          ${receiptContent}
        </body>
      </html>
    `);

    // Wait for the content to load
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 1000);
  };

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

        {/* Receipt Section */}
        <div className='px-4 mt-8'>
          <div className='flex items-center justify-between mb-5'>
            <Button
              variant='outline'
              size='sm'
              className='bg-[#232323] border-[#333] text-white text-sm h-8 px-4'
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
