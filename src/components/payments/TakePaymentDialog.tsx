import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { usePosPaymentIntent } from '@/hooks/usePosPaymentIntent';
import { newRequest } from '@/utils/newRequest';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Customer {
  id: {
    _id: string;
    user: {
      name: string;
      email: string;
    };
    workspace: string;
    phone: string;
    address: {
      street: string;
      city: string;
      state: string;
      country: string;
      zip: string;
    };
    shippingAddress: {
      street: string;
      city: string;
      state: string;
      country: string;
      zip: string;
    };
    contact: {
      firstName: string;
      lastName: string;
    };
    taxId: string;
    accountNumber: string;
    fax: string;
    mobile: string;
    tollFree: string;
    website: string;
    internalNotes: string;
    customFields: Record<string, any>;
    isActive: boolean;
    deletedAt: string | null;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  name: string;
  email: string;
}

interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
  total: number;
  _id: string;
}

interface InvoiceTotals {
  subtotal: number;
  taxAmount: number;
  vatAmount: number;
  discount: number;
  total: number;
  _id: string;
}

interface InvoiceSettings {
  deposit: {
    enabled: boolean;
    percentage: number;
  };
  salesTax: {
    enabled: boolean;
    rate: number;
  };
  vat: {
    enabled: boolean;
    rate: number;
  };
  discount: {
    enabled: boolean;
    amount: number;
  };
  currency: string;
  dateFormat: string;
  decimals: string;
  _id: string;
}

interface Invoice {
  customer: Customer;
  _id: string;
  workspace: string;
  invoiceNumber: string;
  createdBy: string;
  invoiceTitle: string;
  attachments: any[];
  from: string;
  to: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  totals: InvoiceTotals;
  internalNote: string;
  logo: string;
  settings: InvoiceSettings;
  status: string;
  paymentMethod: string;
  depositPaidAt: string | null;
  depositPaymentAmount: number;
  requireDeposit: boolean;
  depositPercentage: number;
  statusHistory: Array<{
    status: string;
    changedAt: string;
    reason: string;
    _id: string;
  }>;
  createdAt: string;
  updatedAt: string;
  __v: number;
  paymentIntentId: string;
}

interface TakePaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice;
  onCancel: () => void;
}

export const TakePaymentDialog: React.FC<TakePaymentDialogProps> = ({
  open,
  onOpenChange,
  invoice,
  onCancel,
}) => {
  const { readerId } = useWorkspace();
  const [isCanceling, setIsCanceling] = useState(false);
  const [currentPaymentIntentId, setCurrentPaymentIntentId] = useState<string | null>(null);

  const { mutate: createPaymentIntent, isPending: isCreatingPaymentIntent } = usePosPaymentIntent();

  useEffect(() => {
    if (open && readerId && invoice._id) {
      createPaymentIntent(
        { invoiceId: invoice._id, readerId },
        {
          onSuccess: (response) => {
            if (response.status === 'success' && response.data.client_secret) {
              setCurrentPaymentIntentId(response.data.client_secret.split('_secret_')[0]);
            }
          },
          onError: (error) => {
            toast.error('Failed to initialize payment');
            console.error('Error creating payment intent:', error);
          },
        },
      );
    }
  }, [open, readerId, invoice._id, createPaymentIntent]);

  const formatCurrency = (amount: number) => {
    return amount.toFixed(2);
  };

  const handleCancel = async () => {
    if (!currentPaymentIntentId) {
      toast.error('No payment intent found');
      return;
    }

    if (!readerId) {
      toast.error('No reader found');
      return;
    }

    setIsCanceling(true);
    try {
      const response = await newRequest.post('/pos/cancel-payment-intent', {
        paymentIntentId: currentPaymentIntentId,
        readerId,
      });

      if (response.data.status === 'success') {
        toast.success('Payment cancelled successfully');
        onCancel();
      } else {
        throw new Error(response.data.message || 'Failed to cancel payment');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel payment');
      console.error('Error canceling payment:', error);
    } finally {
      setIsCanceling(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle className='text-center'>Front counter</DialogTitle>
        </DialogHeader>
        <div className='flex flex-col items-center justify-center py-4 gap-4'>
          {isCreatingPaymentIntent ? (
            <LoadingSpinner size='lg' variant='primary' />
          ) : (
            <>
              <div className='text-lg font-semibold text-center mt-2'>
                Complete payment on terminal
              </div>
              <DialogDescription className='text-center mb-2'>
                Ask the client to follow the instructions on the terminal
              </DialogDescription>
              <div className='w-full space-y-4'>
                <div className='text-center'>
                  <div className='text-sm text-gray-500'>Invoice #{invoice.invoiceNumber}</div>
                  <div className='text-3xl font-bold text-center mt-2'>
                    {invoice.settings.currency} {formatCurrency(invoice.totals.total)}
                  </div>
                </div>
                <div className='text-sm text-gray-600 text-center mt-1'>
                  <div>Customer: {invoice.customer.name}</div>
                  <div>Email: {invoice.customer.email}</div>
                </div>
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button
            variant='outline'
            className='w-full'
            onClick={handleCancel}
            disabled={isCanceling || isCreatingPaymentIntent}
          >
            {isCanceling ? 'Canceling...' : 'Cancel'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TakePaymentDialog;
