'use client';

interface InvoiceProps {
  invoice: {
    id: number;
    status: string;
    customer: string;
    amountDue: number;
    dueDaysAgo: number;
    createdAt: string;
    lastSent: string;
    isOnlinePayments: boolean;
  };
}

export function Invoice({ invoice }: InvoiceProps) {
  // Example item for demonstration
  const items = [
    {
      description: 'Professional Services',
      quantity: 1,
      price: invoice.amountDue,
      amount: invoice.amountDue,
    },
  ];
  return (
    <div
      className='bg-white rounded-lg border border-gray-200 shadow-sm invoice-paper'
      style={{
        width: '8.5in',
        minHeight: '11in',
        padding: '2.5rem 2rem',
        transform: 'scale(0.8)',
        transformOrigin: 'top center',
        margin: '-2rem auto',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      }}
    >
      <style>{`
        @media print {
          .invoice-paper {
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 1in;
            transform: none;
            box-shadow: none;
            border: none;
          }
        }
      `}</style>
      {/* Header */}
      <div className='flex justify-between items-start mb-10'>
        <div></div>
        <div className='text-right'>
          <h1 className='text-4xl font-semibold tracking-tight text-gray-900'>INVOICE</h1>
          <div className='mt-2'>
            <div className='font-semibold text-gray-800'>Your Company Name</div>
            <div className='text-gray-500 text-sm'>123 Business Street</div>
            <div className='text-gray-500 text-sm'>City, State 12345</div>
            <div className='text-gray-500 text-sm'>Canada</div>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className='flex justify-between items-start border-t border-b border-gray-200 py-6 mb-8'>
        <div>
          <div className='text-gray-500 text-sm mb-1'>Bill to</div>
          <div className='font-semibold text-lg text-gray-900'>{invoice.customer}</div>
        </div>
        <div className='text-right space-y-1 text-sm'>
          <div>
            <span className='font-semibold text-gray-900'>Invoice Number:</span>{' '}
            <span className='ml-2'>{invoice.id}</span>
          </div>
          <div>
            <span className='font-semibold text-gray-900'>Invoice Date:</span>{' '}
            <span className='ml-2'>{invoice.createdAt}</span>
          </div>
          <div>
            <span className='font-semibold text-gray-900'>Payment Due:</span>{' '}
            <span className='ml-2'>{invoice.createdAt}</span>
          </div>
          <div className='bg-gray-100 rounded px-2 py-1 mt-2 inline-block font-semibold text-gray-700'>
            Amount Due (CAD): <span className='text-black'>${invoice.amountDue.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className='rounded-lg overflow-hidden border border-gray-200 mb-8'>
        <table className='w-full text-sm'>
          <thead>
            <tr className='bg-gray-700 text-white'>
              <th className='py-3 px-4 text-left font-semibold'>Items</th>
              <th className='py-3 px-4 text-center font-semibold'>Quantity</th>
              <th className='py-3 px-4 text-right font-semibold'>Price</th>
              <th className='py-3 px-4 text-right font-semibold'>Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => {
              return (
                <tr key={idx} className='border-t border-gray-200 bg-white'>
                  <td className='py-3 px-4'>{item.description}</td>
                  <td className='py-3 px-4 text-center'>{item.quantity}</td>
                  <td className='py-3 px-4 text-right'>${item.price.toFixed(2)}</td>
                  <td className='py-3 px-4 text-right'>${item.amount.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary Section */}
      <div className='flex flex-col items-end'>
        <div className='w-full max-w-md'>
          <div className='flex justify-between py-2 text-base'>
            <span className='font-semibold text-gray-700'>Total:</span>
            <span className='font-semibold text-gray-900'>${invoice.amountDue.toFixed(2)}</span>
          </div>
          {/* Example payment row, can be dynamic */}
          <div className='flex justify-between py-2 text-sm text-gray-500 border-b border-gray-200'>
            <span>Payment on {invoice.createdAt} using cash:</span>
            <span>${invoice.amountDue.toFixed(2)}</span>
          </div>
          <div className='flex justify-between py-4 text-lg font-bold'>
            <span>Amount Due (CAD):</span>
            <span>${(0).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
