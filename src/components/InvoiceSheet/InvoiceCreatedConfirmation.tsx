import React from 'react';

interface InvoiceCreatedConfirmationProps {
  createdInvoiceData: any;
  onViewInvoice: () => void;
  onCreateAnother: () => void;
}

const InvoiceCreatedConfirmation: React.FC<InvoiceCreatedConfirmationProps> = ({
  createdInvoiceData,
  onViewInvoice,
  onCreateAnother,
}) => {
  return (
    <div className='flex flex-col items-center justify-center h-full'>
      <h2 className='text-2xl font-semibold mb-2'>Created & Sent</h2>
      <p className='mb-6 text-muted-foreground'>Your invoice was created and sent successfully</p>
      <div className='bg-muted p-6 rounded-lg w-full max-w-md mb-6'>
        <div className='mb-2 flex justify-between'>
          <span>
            Invoice No: <span className='font-mono'>{createdInvoiceData.invoiceNumber}</span>
          </span>
          <span>
            Due Date:{' '}
            <span className='font-mono'>
              {createdInvoiceData.dueDate?.toLocaleDateString?.() || createdInvoiceData.dueDate}
            </span>
          </span>
        </div>
        <div className='mb-2'>
          <div className='font-semibold'>To</div>
          <div>{createdInvoiceData.customer?.name}</div>
          <div className='text-muted-foreground'>{createdInvoiceData.customer?.email}</div>
        </div>
        <div className='mb-2 flex justify-between items-center'>
          <span>Total</span>
          <span className='text-2xl font-mono'>
            {createdInvoiceData.settings?.currency || 'CA$'}
            {createdInvoiceData.totals?.total?.toLocaleString()}
          </span>
        </div>
        {/* Add share link, etc. as needed */}
      </div>
      <div className='flex gap-4'>
        <button className='btn' onClick={onViewInvoice}>
          View invoice
        </button>
        <button className='btn btn-primary' onClick={onCreateAnother}>
          Create another
        </button>
      </div>
    </div>
  );
};

export default InvoiceCreatedConfirmation;
