import { SendInvoiceDialog } from '@/components/invoice/SendInvoiceDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useInvoiceSettings } from '@/hooks/useInvoiceSettings';
import { useUpdateInvoiceSettings } from '@/hooks/useUpdateInvoiceSettings';
import { newRequest } from '@/utils/newRequest';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import html2pdf from 'html2pdf.js';
import { CalendarIcon, CreditCard, MoreHorizontal, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { BusinessSettings } from './BusinessSettings';
import { Invoice } from './Invoice';
import { PaymentUrl } from './PaymentUrl';

interface Payment {
  _id: string;
  amount: number;
  date: string;
  method: string;
  memo?: string;
  status?: string;
  type?: string;
  remainingBalance?: number;
  balanceBefore?: number;
  balanceAfter?: number;
  createdBy?: { _id: string; name: string };
}

type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'unpaid' | 'open';

interface InvoiceItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
  discount: number;
  tax: number;
  total?: number;
}

interface BusinessInfo {
  name: string;
  address: string;
  taxId: string;
  showTaxId: boolean;
  logo: string | null;
  currency: string;
}

interface InvoiceClient {
  name: string;
  email: string;
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
  taxId: string;
  website: string;
}

interface ExtendedInvoice {
  _id: string;
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientId: string;
  status: InvoiceStatus;
  items: Array<{
    id: string;
    name: string;
    description?: string;
    quantity: number;
    price: number;
    discount: number;
    tax: number;
    total?: number;
  }>;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  dueDate: string;
  issueDate: string;
  createdAt: string;
  updatedAt: string;
  notes: string;
  terms: string;
  paymentMethod: string;
  paymentDate: string | null;
  currency: string;
  createdBy: string;
  requireDeposit: boolean;
  depositPercentage: number;
  teamNotes: string;
  client: InvoiceClient;
  payments?: Payment[];
  businessInfo?: BusinessInfo;
  remainingBalance?: number;
}

type ProjectManagementInvoice = {
  _id: string;
  client: {
    _id: string;
    user: {
      name: string;
      email: string;
    };
  };
  items: Array<{
    name: string;
    description: string;
    quantity: number;
    price: number;
    discount: number;
    tax: number;
  }>;
  total: number;
  status: string;
  dueDate: string;
  notes: string;
  currency: string;
  taxRate: number;
  taxId: string;
  showTaxId: boolean;
  requireDeposit: boolean;
  depositPercentage: number;
  discount: number;
  discountAmount: number;
  subtotal: number;
  taxAmount: number;
  teamNotes?: string;
  businessInfo: BusinessInfo;
};

interface InvoiceTabProps {
  invoice: ExtendedInvoice;
}

export function InvoiceTab({ invoice }: InvoiceTabProps) {
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
  const [isEditPaymentDialogOpen, setIsEditPaymentDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isBusinessSettingsOpen, setIsBusinessSettingsOpen] = useState(false);
  const [isEditInvoiceOpen, setIsEditInvoiceOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentDate, setPaymentDate] = useState<Date | undefined>(new Date());
  const [paymentAmount, setPaymentAmount] = useState(invoice.total.toFixed(2));
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentMemo, setPaymentMemo] = useState('');
  const [amountTouched, setAmountTouched] = useState(false);
  const queryClient = useQueryClient();
  const { data: invoiceSettings } = useInvoiceSettings();
  const updateInvoiceSettings = useUpdateInvoiceSettings();
  const invoiceRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);

  const markAsSentMutation = useMutation({
    mutationFn: async () => {
      await newRequest.put(`/invoices/${invoice.id}`, { status: 'sent' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success('Invoice marked as sent');
      setIsSendDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to mark invoice as sent');
    },
  });

  const recordPaymentMutation = useMutation({
    mutationFn: async () => {
      await newRequest.post(`/invoices/${invoice.id}/payments`, {
        date: paymentDate,
        amount: parseFloat(paymentAmount),
        method: paymentMethod,
        memo: paymentMemo,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success('Payment recorded successfully');
      setPaymentSuccess(true);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to record payment');
    },
  });

  const deletePaymentMutation = useMutation({
    mutationFn: async (paymentId: string) => {
      await newRequest.delete(`/invoices/${invoice.id}/payments/${paymentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success('Payment deleted successfully');
      setIsEditPaymentDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete payment');
    },
  });

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return;

    const element = invoiceRef.current;
    const opt = {
      margin: 1,
      filename: `invoice-${invoice.invoiceNumber}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
    };

    try {
      await html2pdf().set(opt).from(element).save();
      toast.success('PDF downloaded successfully');
    } catch (error) {
      toast.error('Failed to download PDF');
    }
  };

  const handleSendInvoice = async () => {
    try {
      await markAsSentMutation.mutateAsync();
    } catch (error) {
      console.error('Failed to send invoice:', error);
    }
  };

  const handleRecordPayment = async () => {
    try {
      await recordPaymentMutation.mutateAsync();
    } catch (error) {
      console.error('Failed to record payment:', error);
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    try {
      await deletePaymentMutation.mutateAsync(paymentId);
    } catch (error) {
      console.error('Failed to delete payment:', error);
    }
  };

  const transformForSendDialog = (invoice: ExtendedInvoice) => {
    return {
      _id: invoice._id,
      invoiceNumber: invoice.invoiceNumber,
      client: {
        _id: invoice.clientId,
        user: {
          name: invoice.client.name,
          email: invoice.client.email,
        },
      },
      status: invoice.status,
      items: invoice.items.map((item) => {
        return {
          name: item.name,
          description: item.description || '',
          quantity: item.quantity,
          price: item.price,
          discount: item.discount,
          tax: item.tax,
        };
      }),
      total: invoice.total,
      remainingBalance: invoice.remainingBalance || invoice.total,
      payments: invoice.payments || [],
      businessInfo: invoice.businessInfo,
    };
  };

  return (
    <PaymentUrl invoiceId={invoice._id}>
      {(paymentUrl) => {
        return (
          <div className='space-y-6'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-4'>
                <Badge variant={invoice.status === 'paid' ? 'secondary' : 'default'}>
                  {invoice.status}
                </Badge>
                <span className='text-sm text-muted-foreground'>
                  Invoice #{invoice.invoiceNumber}
                </span>
              </div>
              <div className='flex items-center space-x-2'>
                <Button variant='outline' onClick={handleDownloadPDF}>
                  Download PDF
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='outline' size='icon'>
                      <MoreHorizontal className='h-4 w-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem
                      onClick={() => {
                        return setIsEditInvoiceOpen(true);
                      }}
                    >
                      Edit Invoice
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        return setIsBusinessSettingsOpen(true);
                      }}
                    >
                      Business Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className='text-destructive'
                      onClick={() => {
                        setInvoiceToDelete(invoice._id);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      Delete Invoice
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div ref={invoiceRef}>
              <Invoice invoice={invoice} paymentUrl={paymentUrl} />
            </div>

            <div className='flex justify-end space-x-2'>
              {invoice.status === 'draft' && (
                <Button
                  onClick={() => {
                    return setIsSendDialogOpen(true);
                  }}
                >
                  <Send className='mr-2 h-4 w-4' />
                  Send Invoice
                </Button>
              )}
              {invoice.status !== 'paid' && (
                <Button
                  onClick={() => {
                    return setIsPaymentDialogOpen(true);
                  }}
                >
                  <CreditCard className='mr-2 h-4 w-4' />
                  Record Payment
                </Button>
              )}
            </div>

            <SendInvoiceDialog
              open={isSendDialogOpen}
              onOpenChange={setIsSendDialogOpen}
              invoice={transformForSendDialog(invoice)}
              onSend={handleSendInvoice}
              paymentUrl={paymentUrl}
            />

            <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Record Payment</DialogTitle>
                  <DialogDescription>Record a payment for this invoice.</DialogDescription>
                </DialogHeader>
                <div className='space-y-4'>
                  <div className='space-y-2'>
                    <Label>Payment Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant='outline'
                          className='w-full justify-start text-left font-normal'
                        >
                          <CalendarIcon className='mr-2 h-4 w-4' />
                          {paymentDate ? format(paymentDate, 'PPP') : 'Pick a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className='w-auto p-0'>
                        <Calendar
                          mode='single'
                          selected={paymentDate}
                          onSelect={setPaymentDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className='space-y-2'>
                    <Label>Amount</Label>
                    <Input
                      type='number'
                      value={paymentAmount}
                      onChange={(e) => {
                        setPaymentAmount(e.target.value);
                        setAmountTouched(true);
                      }}
                      onBlur={() => {
                        return setAmountTouched(true);
                      }}
                    />
                    {amountTouched && parseFloat(paymentAmount) > invoice.total && (
                      <p className='text-sm text-destructive'>Amount cannot exceed invoice total</p>
                    )}
                  </div>
                  <div className='space-y-2'>
                    <Label>Payment Method</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger>
                        <SelectValue placeholder='Select payment method' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='credit_card'>Credit Card</SelectItem>
                        <SelectItem value='bank_transfer'>Bank Transfer</SelectItem>
                        <SelectItem value='cash'>Cash</SelectItem>
                        <SelectItem value='check'>Check</SelectItem>
                        <SelectItem value='other'>Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='space-y-2'>
                    <Label>Memo</Label>
                    <Textarea
                      value={paymentMemo}
                      onChange={(e) => {
                        return setPaymentMemo(e.target.value);
                      }}
                      placeholder='Add a note about this payment'
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant='outline'
                    onClick={() => {
                      return setIsPaymentDialogOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleRecordPayment}
                    disabled={
                      !paymentDate ||
                      !paymentAmount ||
                      !paymentMethod ||
                      parseFloat(paymentAmount) > invoice.total
                    }
                  >
                    Record Payment
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the invoice and all
                    associated data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                    onClick={() => {
                      if (invoiceToDelete) {
                        // Handle delete
                        setIsDeleteDialogOpen(false);
                      }
                    }}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {isBusinessSettingsOpen && (
              <BusinessSettings
                open={isBusinessSettingsOpen}
                onOpenChange={setIsBusinessSettingsOpen}
              />
            )}
          </div>
        );
      }}
    </PaymentUrl>
  );
}
