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
import { usePosPaymentCancel } from '@/hooks/usePosPaymentCancel';
import { usePosPaymentIntent } from '@/hooks/usePosPaymentIntent';
import { usePosPaymentStatus } from '@/hooks/usePosPaymentStatus';
import { formatCurrency } from '@/utils/formatCurrency';
import { useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Customer {
  name: string;
  email: string;
}

interface Invoice {
  _id: string;
  invoiceNumber: string;
  customer: Customer;
  settings: {
    currency: string;
  };
  totals: {
    total: number;
  };
}

interface TakePaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice | null;
  isLoading?: boolean;
  onCancel: () => void;
}

const TakePaymentDialog: React.FC<TakePaymentDialogProps> = ({
  open,
  onOpenChange,
  invoice,
  isLoading = false,
  onCancel,
}) => {
  const { readerId } = useWorkspace();
  const [currentPaymentIntentId, setCurrentPaymentIntentId] = useState<string | null>(null);
  const { mutate: createPaymentIntent, isPending: isCreatingPaymentIntent } = usePosPaymentIntent();
  const { data: paymentStatus, isLoading: isPaymentStatusLoading } =
    usePosPaymentStatus(currentPaymentIntentId);
  const { mutate: cancelPayment, isPending: isCanceling } = usePosPaymentCancel();
  const queryClient = useQueryClient();

  const handleCancel = () => {
    if (currentPaymentIntentId) {
      cancelPayment(
        { paymentIntentId: currentPaymentIntentId, readerId: readerId! },
        {
          onSuccess: () => {
            setCurrentPaymentIntentId(null);
            onCancel();
          },
          onError: (error) => {
            console.error('Error canceling payment:', error);
            toast.error('Failed to cancel payment');
          },
        },
      );
    } else {
      onCancel();
    }
  };

  // Create payment intent when dialog opens
  useEffect(() => {
    if (open && readerId && invoice?._id) {
      createPaymentIntent(
        {
          invoiceId: invoice._id,
          readerId,
        },
        {
          onSuccess: (response) => {
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
  }, [open, readerId, invoice?._id, createPaymentIntent, onOpenChange]);

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

  if (!invoice) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md focus-visible:ring-0'>
        <DialogHeader>
          <DialogTitle className='text-center'>Card Payment</DialogTitle>
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
