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
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
  isLoading?: boolean;
}

interface PaymentMethodDetails {
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  } | null;
}

interface TransferData {
  destination: string;
  amount?: number;
}

interface PaymentStatus {
  paymentIntentId: string;
  status:
    | 'succeeded'
    | 'processing'
    | 'requires_payment_method'
    | 'requires_confirmation'
    | 'requires_action'
    | 'canceled';
  amount: number;
  amount_received: number;
  currency: string;
  payment_method: string | null;
  payment_method_types: string[];
  created: number;
  client_secret: string;
  payment_method_details: PaymentMethodDetails;
  transfer_data: TransferData | null;
  metadata: Record<string, string>;
}

interface PosPaymentIntentResponse {
  status: string;
  data: {
    id: string;
    status: string;
    amount: number;
    amount_received: number;
    currency: string;
    payment_method: null | any;
    payment_method_types: string[];
    created: number;
    client_secret: string;
    payment_method_details: {
      card: null | any;
    };
    transfer_data: null | any;
    metadata: {
      invoiceId: string;
      workspaceId: string;
    };
  };
}

export const TakePaymentDialog: React.FC<TakePaymentDialogProps> = ({
  open,
  onOpenChange,
  invoice,
  onCancel,
  isLoading = false,
}) => {
  const { readerId } = useWorkspace();
  const [isCanceling, setIsCanceling] = useState(false);
  const [currentPaymentIntentId, setCurrentPaymentIntentId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { mutate: createPaymentIntent, isPending: isCreatingPaymentIntent } = usePosPaymentIntent();

  // Add polling for payment status
  const { data: paymentStatus } = useQuery<PaymentStatus | null>({
    queryKey: ['payment-status', currentPaymentIntentId],
    queryFn: async () => {
      if (!currentPaymentIntentId) return null;
      const response = await newRequest.get<{ status: string; data: PaymentStatus }>(
        `/pos/payment-status?paymentIntentId=${currentPaymentIntentId}`,
      );
      return response.data.data;
    },
    enabled: !!currentPaymentIntentId && open,
    refetchInterval: 2000,
    refetchIntervalInBackground: false,
  });

  useEffect(() => {
    if (open && readerId && invoice._id) {
      createPaymentIntent(
        { invoiceId: invoice._id, readerId },
        {
          onSuccess: (response: PosPaymentIntentResponse) => {
            if (response.status === 'success' && response.data.id) {
              console.log('Setting payment intent ID:', response.data.id);
              setCurrentPaymentIntentId(response.data.id);
            }
          },
          onError: (error) => {
            console.error('Error creating payment intent:', error);
            setCurrentPaymentIntentId(null);
            toast.error('Failed to initialize payment');
            onOpenChange(false);
          },
        },
      );
    }
  }, [open, readerId, invoice._id, createPaymentIntent, onOpenChange]);

  // Reset payment intent ID when dialog closes
  useEffect(() => {
    if (!open) {
      setCurrentPaymentIntentId(null);
    }
  }, [open]);

  // Handle successful payment
  useEffect(() => {
    if (paymentStatus?.status === 'succeeded') {
      toast.success('Payment successful!');
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      onOpenChange(false);
    }
  }, [paymentStatus?.status, queryClient, onOpenChange]);

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
      const response = await newRequest.post<{ status: string; message?: string }>(
        '/pos/cancel-payment-intent',
        {
          paymentIntentId: currentPaymentIntentId,
          readerId,
        },
      );

      if (response.data.status === 'success') {
        console.log('Payment cancelled successfully, clearing payment intent ID');
        setCurrentPaymentIntentId(null);
        toast.success('Payment cancelled successfully');
        onCancel();
      } else {
        throw new Error(response.data.message || 'Failed to cancel payment');
      }
    } catch (error: any) {
      console.error('Error canceling payment:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel payment');
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
          {isLoading || isCreatingPaymentIntent ? (
            <LoadingSpinner size='lg' variant='primary' />
          ) : (
            <>
              <div className='text-lg font-semibold text-center mt-2'>
                {paymentStatus?.status === 'processing'
                  ? 'Processing payment...'
                  : 'Complete payment on terminal'}
              </div>
              <DialogDescription className='text-center mb-2'>
                {paymentStatus?.status === 'processing'
                  ? 'Please wait while we process your payment'
                  : 'Ask the client to follow the instructions on the terminal'}
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
            disabled={
              isCanceling || isCreatingPaymentIntent || paymentStatus?.status === 'processing'
            }
          >
            {isCanceling ? 'Canceling...' : 'Cancel'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TakePaymentDialog;
