import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { newRequest } from '@/utils/newRequest';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DownloadCloud, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';

interface Invoice {
  _id: string;
  invoiceNumber: string;
  client?: {
    _id: string;
    user: {
      name: string;
      email: string;
    };
  } | null;
  status: string;
  items: Array<{
    name: string;
    description: string;
    quantity: number;
    price: number;
    discount: number;
    tax: number;
  }>;
  businessInfo: {
    name: string;
    address: string;
    taxId: string;
    showTaxId: boolean;
    logo: string | null;
    currency: string;
  };
}

interface SendInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice;
}

export function SendInvoiceDialog({ open, onOpenChange, invoice }: SendInvoiceDialogProps) {
  const queryClient = useQueryClient();
  const isPaid = invoice.status === 'paid';

  const markAsSentMutation = useMutation({
    mutationFn: async () => {
      await newRequest.put(`/invoices/${invoice._id}`, { status: 'sent' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success('Invoice marked as sent');
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to mark invoice as sent');
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          onOpenChange(false);
        }
      }}
    >
      <DialogContent
        className='sm:max-w-[700px]'
        onClick={(e) => {
          return e.stopPropagation();
        }}
      >
        <DialogHeader>
          <DialogTitle>Send Invoice</DialogTitle>
          <DialogDescription>
            {isPaid ? (
              <span className='text-yellow-600'>
                This invoice has already been paid. You can still share the invoice details.
              </span>
            ) : (
              `Share invoice #${invoice?.invoiceNumber} with ${invoice?.client?.user?.name}`
            )}
          </DialogDescription>
        </DialogHeader>
        <div className='py-6'>
          <div className='grid grid-cols-2 gap-6'>
            <div
              className='cursor-pointer border rounded-2xl p-8 flex flex-col items-center justify-center transition-shadow hover:shadow-md hover:border-primary group bg-blue-50'
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success('Invoice link copied!');
              }}
            >
              <LinkIcon className='h-8 w-8 mb-4 text-blue-600 group-hover:text-blue-700' />
              <div className='font-bold text-lg mb-1 text-center'>Copy link</div>
              <div className='text-center text-muted-foreground text-base'>
                A link to your invoice with all details included
              </div>
            </div>
            <div
              className='cursor-pointer border rounded-2xl p-8 flex flex-col items-center justify-center transition-shadow hover:shadow-md hover:border-primary group bg-indigo-50'
              onClick={() => {
                window.open(`/api/invoices/${invoice._id}/pdf`, '_blank');
              }}
            >
              <DownloadCloud className='h-8 w-8 mb-4 text-indigo-600 group-hover:text-indigo-700' />
              <div className='font-bold text-lg mb-1 text-center'>Download PDF</div>
              <div className='text-center text-muted-foreground text-base'>
                Your invoice all in one document
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant='outline'
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onOpenChange(false);
            }}
          >
            Close
          </Button>
          {!isPaid && invoice.status !== 'sent' && (
            <Button
              onClick={() => {
                return markAsSentMutation.mutate();
              }}
              disabled={markAsSentMutation.isPending}
            >
              {markAsSentMutation.isPending ? 'Marking...' : 'Mark invoice as sent'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
