import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { newRequest } from '@/utils/newRequest';
import { Copy, Download } from 'lucide-react';
import React from 'react';

interface InvoiceCreatedConfirmationProps {
  createdInvoiceData: any;
  onViewInvoice: () => void;
  onCreateAnother: () => void;
  isEditing?: boolean;
}

const InvoiceCreatedConfirmation: React.FC<InvoiceCreatedConfirmationProps> = ({
  createdInvoiceData,
  onViewInvoice,
  onCreateAnother,
  isEditing,
}) => {
  console.log('🚀 createdInvoiceData:', createdInvoiceData);
  return (
    <div className='h-full bg-neutral-50 flex flex-col'>
      <div className='flex-1 overflow-y-auto p-8'>
        <div className='mx-auto max-w-lg space-y-12'>
          {/* Header */}
          <div className='space-y-3'>
            <h1 className='text-2xl font-medium text-neutral-900 tracking-tight'>
              {isEditing ? 'Updated & Sent' : 'Created & Sent'}
            </h1>
            <p className='text-sm text-neutral-500 leading-relaxed'>
              Your invoice was {isEditing ? 'updated' : 'created'} and sent successfully
            </p>
          </div>

          {/* Invoice Summary */}
          <div className='bg-white border border-neutral-200 rounded-lg p-8 space-y-8'>
            {/* Invoice Meta */}
            <div className='flex justify-between text-xs text-neutral-500 font-mono'>
              <span>{createdInvoiceData.invoiceNumber}</span>
              <span>
                {createdInvoiceData.dueDate?.toLocaleDateString?.() || createdInvoiceData.dueDate}
              </span>
            </div>

            {/* Recipient */}
            <div className='space-y-2'>
              <div className='text-xs text-neutral-400 uppercase tracking-wide'>To</div>
              <div className='space-y-1'>
                <div className='text-sm text-neutral-900'>{createdInvoiceData.customer?.name}</div>
                <div className='text-xs text-neutral-500'>{createdInvoiceData.customer?.email}</div>
              </div>
            </div>

            {/* Total */}
            <div className='pt-4 border-t border-neutral-100'>
              <div className='flex justify-between items-baseline'>
                <span className='text-xs text-neutral-400 uppercase tracking-wide'>Total</span>
                <span className='text-xl font-medium text-neutral-900 font-mono'>
                  {createdInvoiceData.settings?.currency || 'CA$'}{' '}
                  {createdInvoiceData.totals?.total?.toLocaleString(undefined, {
                    minimumFractionDigits: createdInvoiceData.settings?.decimals === 'yes' ? 2 : 0,
                    maximumFractionDigits: createdInvoiceData.settings?.decimals === 'yes' ? 2 : 0,
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Share Section */}
          <div className='space-y-4'>
            <div className='text-xs text-neutral-400 uppercase tracking-wide'>Share</div>
            <div className='flex gap-2'>
              <Input
                value={`${window.location.origin}/invoice/${createdInvoiceData._id}`}
                readOnly
                className='flex-1 text-xs font-mono bg-white border-neutral-200 focus:border-neutral-300 transition-colors'
              />
              <Button
                variant='outline'
                size='icon'
                className='shrink-0 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-all duration-150'
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${window.location.origin}/invoice/${createdInvoiceData._id}`,
                  );
                }}
              >
                <Copy className='h-3 w-3 text-neutral-500' />
              </Button>
              <Button
                variant='outline'
                size='icon'
                className='shrink-0 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-all duration-150'
                onClick={async () => {
                  try {
                    const response = await newRequest.get(
                      `/invoices2/${createdInvoiceData._id}/download`,
                      { responseType: 'blob' },
                    );

                    // Create a blob from the PDF data
                    const pdfBlob = new Blob([response.data], { type: 'application/pdf' });

                    // Create a URL for the blob
                    const url = window.URL.createObjectURL(pdfBlob);

                    // Create a temporary link element
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `Invoice-${createdInvoiceData.invoiceNumber}.pdf`;

                    // Append to body, click, and remove
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);

                    // Clean up the URL object
                    window.URL.revokeObjectURL(url);
                  } catch (error) {
                    console.error('Error downloading PDF:', error);
                  }
                }}
              >
                <Download className='h-3 w-3 text-neutral-500' />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Actions - Fixed Bottom */}
      <div className='flex-shrink-0 border-t border-neutral-200 bg-white p-4'>
        <div className='mx-auto max-w-lg flex gap-3'>
          <Button
            variant='outline'
            className='flex-1 text-xs border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-all duration-150'
            onClick={onViewInvoice}
          >
            View invoice
          </Button>
          {!isEditing && (
            <Button
              className='flex-1 text-xs bg-neutral-900 hover:bg-neutral-800 transition-all duration-150'
              onClick={onCreateAnother}
            >
              Create another
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceCreatedConfirmation;
