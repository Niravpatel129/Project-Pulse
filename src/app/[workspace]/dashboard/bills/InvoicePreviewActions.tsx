import { Calendar } from '@/components/ui/calendar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { usePosPaymentIntent } from '@/hooks/usePosPaymentIntent';
import { newRequest } from '@/utils/newRequest';
import { ReactNode } from 'react';
import { toast } from 'sonner';

interface InvoicePreviewActionsProps {
  invoice: any;
  onMarkAsPaid: (invoiceId: string, paymentDate: Date) => void;
  onCancel: (invoiceId: string) => void;
  onDelete: (invoiceId: string) => void;
  handleEdit: () => void;
  trigger?: ReactNode;
  onTakePayment?: (invoice: any) => void;
}

const InvoicePreviewActions = ({
  invoice,
  onMarkAsPaid,
  onCancel,
  onDelete,
  handleEdit,
  trigger,
  onTakePayment,
}: InvoicePreviewActionsProps) => {
  const { readerId } = useWorkspace();
  const { mutate: createPaymentIntent, isPending: isCreatingPaymentIntent } = usePosPaymentIntent();

  const handleDownload = async () => {
    try {
      const response = await newRequest.get(`/invoices2/${invoice._id}/download`, {
        responseType: 'blob',
      });

      // Create a blob from the PDF data
      const pdfBlob = new Blob([response.data], {
        type: 'application/pdf',
      });

      // Create a URL for the blob
      const url = window.URL.createObjectURL(pdfBlob);

      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.download = `Invoice-${invoice.invoiceNumber}.pdf`;

      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the URL object
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download invoice');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/invoice/${invoice._id}`);
    toast.success('Invoice link copied to clipboard');
  };

  const handleTakePayment = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!readerId) {
      toast.error('Reader ID is required for payment');
      return;
    }
    if (onTakePayment) {
      onTakePayment(invoice);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleEdit();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger || (
          <button
            className='w-9 h-9 flex items-center justify-center rounded-md bg-gray-50 dark:bg-neutral-800 text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors duration-150'
            onClick={(e) => {
              return e.stopPropagation();
            }}
            aria-label='Actions'
          >
            <svg width='16' height='16' fill='none' viewBox='0 0 24 24'>
              <circle cx='12' cy='5' r='1.5' fill='currentColor' />
              <circle cx='12' cy='12' r='1.5' fill='currentColor' />
              <circle cx='12' cy='19' r='1.5' fill='currentColor' />
            </svg>
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem onClick={handleCopyLink}>Copy link</DropdownMenuItem>
        <DropdownMenuItem onClick={handleEditClick}>Edit</DropdownMenuItem>
        <DropdownMenuItem onClick={handleDownload}>Download</DropdownMenuItem>
        {readerId &&
          invoice.status?.toLowerCase() !== 'paid' &&
          invoice.status?.toLowerCase() !== 'cancelled' && (
            <DropdownMenuItem onClick={handleTakePayment} disabled={isCreatingPaymentIntent}>
              {isCreatingPaymentIntent ? 'Initializing...' : 'Take Payment'}
            </DropdownMenuItem>
          )}
        {invoice.status?.toLowerCase() !== 'cancelled' &&
          invoice.status?.toLowerCase() !== 'paid' &&
          invoice.status?.toLowerCase() !== 'draft' && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger
                onClick={(e) => {
                  return e.stopPropagation();
                }}
              >
                Mark as paid
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className='p-0'>
                <div
                  className='p-2'
                  onClick={(e) => {
                    return e.stopPropagation();
                  }}
                >
                  <Calendar
                    mode='single'
                    onSelect={(date) => {
                      if (date && invoice._id) {
                        onMarkAsPaid(invoice._id, date);
                      }
                    }}
                    disabled={(date) => {
                      return date > new Date();
                    }}
                  />
                </div>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          )}
        {invoice.status?.toLowerCase() !== 'cancelled' &&
          invoice.status?.toLowerCase() !== 'paid' && (
            <DropdownMenuItem
              className='text-red-600'
              onClick={(e) => {
                e.stopPropagation();
                if (invoice._id) {
                  onCancel(invoice._id);
                }
              }}
            >
              Cancel
            </DropdownMenuItem>
          )}
        {invoice.status?.toLowerCase() === 'cancelled' && (
          <DropdownMenuItem
            className='text-red-600'
            onClick={(e) => {
              e.stopPropagation();
              if (invoice._id) {
                onDelete(invoice._id);
              }
            }}
          >
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default InvoicePreviewActions;
