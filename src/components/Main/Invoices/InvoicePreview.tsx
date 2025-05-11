import { SendInvoiceDialog } from '@/components/invoice/SendInvoiceDialog';
import { InvoicePdf } from '@/components/InvoicePdf/InvoicePdf';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { newRequest } from '@/utils/newRequest';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { CalendarIcon, LinkIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import InvoiceActionBar from './InvoiceActionBar';

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

interface InvoiceItem {
  _id: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
  discount: number;
  tax: number;
}

interface Invoice {
  _id: string;
  invoiceNumber: string;
  client: {
    _id: string;
    user: {
      name: string;
      email: string;
    };
  } | null;
  project?: {
    _id: string;
    name: string;
    description: string;
  };
  items: InvoiceItem[];
  dateSent: string;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'open';
  dueDate: string;
  notes?: string;
  currency: string;
  createdBy: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface InvoicePreviewProps {
  onClose?: () => void;
  selectedInvoice?: Invoice;
  invoiceId?: string;
  onInvoiceUpdate?: (invoiceId: string) => Promise<void>;
}

export default function InvoicePreview({
  onClose,
  selectedInvoice,
  invoiceId,
  onInvoiceUpdate,
}: InvoicePreviewProps) {
  const queryClient = useQueryClient();
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
  const [isEditPaymentDialogOpen, setIsEditPaymentDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [paymentDate, setPaymentDate] = useState<Date | undefined>(new Date());
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentMemo, setPaymentMemo] = useState('');

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: async () => {
      const response = await newRequest.get<{ status: string; data: Invoice }>(
        `/invoices/${invoiceId}`,
      );
      return response.data;
    },
    enabled: !!invoiceId && !selectedInvoice,
  });

  const {
    data: paymentData,
    isLoading: paymentsLoading,
    isError: paymentsError,
  } = useQuery<{ paymentHistory: Payment[]; currentBalance: number; availableCredits: number }>({
    queryKey: ['invoice-payments', invoiceId || selectedInvoice?._id],
    queryFn: async () => {
      const res = await newRequest.get(`/invoices/${invoiceId || selectedInvoice?._id}/payments`);
      return {
        paymentHistory: res.data.data.paymentHistory,
        currentBalance: res.data.data.currentBalance,
        availableCredits: res.data.data.availableCredits,
      };
    },
    enabled: !!(invoiceId || selectedInvoice?._id),
  });

  const invoice = selectedInvoice || response?.data;
  const payments = paymentData?.paymentHistory || [];

  const deletePaymentMutation = useMutation({
    mutationFn: async (paymentId: string) => {
      await newRequest.delete(
        `/invoices/${invoiceId || selectedInvoice?._id}/payments/${paymentId}`,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success('Payment deleted successfully');
      setIsDeleteAlertOpen(false);
      setSelectedPayment(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete payment');
    },
  });

  const editPaymentMutation = useMutation({
    mutationFn: async (paymentData: {
      paymentId: string;
      date: Date;
      amount: number;
      method: string;
      memo: string;
    }) => {
      await newRequest.put(
        `/invoices/${invoiceId || selectedInvoice?._id}/payments/${paymentData.paymentId}`,
        {
          date: paymentData.date,
          amount: paymentData.amount,
          method: paymentData.method,
          memo: paymentData.memo,
        },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success('Payment updated successfully');
      setIsEditPaymentDialogOpen(false);
      setSelectedPayment(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update payment');
    },
  });

  const handleEditPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setPaymentDate(new Date(payment.date));
    setPaymentAmount(payment.amount.toString());
    setPaymentMethod(payment.method);
    setPaymentMemo(payment.memo || '');
    setIsEditPaymentDialogOpen(true);
  };

  const handleDeletePayment = (paymentId: string) => {
    setSelectedPayment(
      payments.find((p) => {
        return p._id === paymentId;
      }) || null,
    );
    setIsDeleteAlertOpen(true);
  };

  const handleSendReceipt = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsReceiptDialogOpen(true);
  };

  const handleSendInvoice = () => {
    setIsSendDialogOpen(true);
  };

  const handleSendDialogClose = async (open: boolean) => {
    setIsSendDialogOpen(open);
    if (!open && invoiceId && onInvoiceUpdate) {
      // Invalidate local queries first
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['invoice', invoiceId] }),
        queryClient.invalidateQueries({ queryKey: ['invoice-payments', invoiceId] }),
      ]);

      // Update the invoice in the parent component
      await onInvoiceUpdate(invoiceId);
    }
  };

  // Transform invoice data to match SendInvoiceDialog's expected format
  const transformForSendDialog = () => {
    if (!invoice) return null;
    return {
      _id: invoice._id,
      invoiceNumber: invoice.invoiceNumber,
      client: invoice.client
        ? {
            _id: invoice.client._id,
            user: {
              name: invoice.client.user.name,
              email: invoice.client.user.email,
            },
          }
        : null,
      status: invoice.status,
      items: invoice.items.map((item) => {
        return {
          name: item.name,
          description: item.description || item.name,
          quantity: item.quantity,
          price: item.price,
          discount: item.discount || 0,
          tax: item.tax || 0,
        };
      }),
      total: invoice.total,
      businessInfo: {
        name: invoice.createdBy.name,
        address: '',
        taxId: '',
        showTaxId: false,
        logo: null,
        currency: invoice.currency,
      },
    };
  };

  if (!invoiceId && !selectedInvoice) {
    return (
      <div className='flex flex-col items-center justify-center h-full w-full bg-background'>
        <div className='flex flex-col items-center justify-center mt-32'>
          <div className='flex items-center justify-center rounded-full border-2 border-dashed border-[#444] w-32 h-32 mb-6'>
            {/* Envelope Icon */}
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='56'
              height='56'
              viewBox='0 0 24 24'
              fill='none'
              stroke='#a78bfa'
              strokeWidth='1.5'
              strokeLinecap='round'
              strokeLinejoin='round'
              className='lucide lucide-mail'
            >
              <rect width='20' height='16' x='2' y='4' rx='2' />
              <path d='m22 6-8.97 6.48a2 2 0 0 1-2.06 0L2 6' />
            </svg>
          </div>
          <div className='text-white text-xl font-semibold mb-2'>It&apos;s empty here</div>
          <div className='text-[#8C8C8C] text-base'>Choose an invoice to view details</div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className='bg-background overflow-hidden'>
        <div className='sticky top-0 z-10 bg-background'>
          <InvoiceActionBar onClose={handleClose} invoiceId={invoiceId || selectedInvoice?._id} />
        </div>
        <div className='mt-4 overflow-auto h-[calc(100vh-4rem)]'>
          <div className='flex flex-col space-y-6 pb-6 border-b border-[#232323] rounded-t-lg'>
            <div className='flex flex-col border-b border-[#232323] px-5 mt-3'>
              <Skeleton className='h-6 w-32 mb-4' />
              <div className='flex flex-col sm:flex-row gap-4 mt-2'>
                <Skeleton className='h-4 w-48' />
                <Skeleton className='h-4 w-48' />
              </div>
            </div>
            <div className='grid grid-cols-3 gap-4 px-5'>
              <Skeleton className='h-8 w-full' />
              <Skeleton className='h-8 w-full' />
              <Skeleton className='h-8 w-full' />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-background overflow-hidden'>
        <div className='sticky top-0 z-10 bg-background'>
          <InvoiceActionBar onClose={handleClose} invoiceId={invoiceId || selectedInvoice?._id} />
        </div>
        <div className='mt-4 overflow-auto h-[calc(100vh-4rem)]'>
          <div className='flex items-center justify-center h-full'>
            <span className='text-red-500'>Error loading invoice</span>
          </div>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return null;
  }

  return (
    <div className='bg-background overflow-hidden'>
      <div className='sticky top-0 z-10 bg-background'>
        <InvoiceActionBar onClose={handleClose} invoiceId={invoiceId || selectedInvoice?._id} />
      </div>
      <div className='mt-4 overflow-auto h-[calc(100vh-4rem)]'>
        <div className='flex flex-col space-y-6 pb-6 border-b border-[#232323] rounded-t-lg'>
          {/* Invoice Info Section */}
          <div className='flex flex-col border-b border-[#232323] px-5 mt-3'>
            <div className='flex items-center'>
              <span className='text-[14px] font-medium text-white'>
                Invoice #{invoice.invoiceNumber}
              </span>
              <Badge className='ml-2'>{invoice.status}</Badge>
            </div>
            <div className='flex flex-col sm:flex-row gap-4 mt-2'>
              <div className='flex items-center gap-0'>
                <span className='text-sm text-[#8C8C8C]'>Customer:</span>
                <Button variant='link' size='sm'>
                  {invoice.client?.user.name || 'N/A'}
                </Button>
              </div>
              <div className='flex items-center gap-0'>
                <span className='text-sm text-[#8C8C8C]'>Business:</span>
                <Button variant='link' size='sm'>
                  {invoice.createdBy.name}
                </Button>
              </div>
            </div>
          </div>
          <div className='grid grid-cols-3 gap-4 px-5'>
            <div className='flex flex-col'>
              <span className='text-sm text-[#8C8C8C] mb-2'>Amount</span>
              <span className='text-[14px] font-bold text-white'>
                {invoice.total} {invoice.currency}
              </span>
            </div>
            <div className='flex flex-col'>
              <span className='text-sm text-[#8C8C8C] mb-2'>Deposit Due</span>
              <span className='text-[14px] font-semibold text-[#a78bfa]'>
                ${(invoice.total / 2).toFixed(2)} <span className='text-sm'>(50%)</span>
              </span>
            </div>
            <div className='flex flex-col'>
              <span className='text-sm text-[#8C8C8C] mb-2'>Due Date</span>
              <span className='text-[14px] font-medium text-white'>
                {new Date(invoice.dueDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        {/* Timeline Section */}
        <div className='py-6 space-y-6 px-5'>
          {/* Timeline */}
          <div className='bg-[#141414] rounded-lg border border-[#232323] p-6'>
            <div className='flex flex-col space-y-6'>
              {/* Create */}
              <div className='flex flex-col sm:flex-row sm:items-center gap-4'>
                <div className='flex items-center gap-4'>
                  <span className='inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#22c55e]/20 shrink-0'>
                    <svg width='20' height='20' fill='none' viewBox='0 0 24 24'>
                      <circle cx='12' cy='12' r='10' fill='#22c55e' />
                      <path
                        d='M16 10l-4.5 4.5L8 11'
                        stroke='white'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                    </svg>
                  </span>
                  <div>
                    <div className='font-semibold text-white text-[14px] mb-1'>Create</div>
                    <div className='text-sm text-[#8C8C8C]'>
                      Created: {new Date(invoice.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className='sm:ml-auto'>
                  <Button
                    variant='outline'
                    size='sm'
                    className='bg-[#232323] border-[#333] text-white text-sm h-11 w-full sm:w-auto px-6'
                  >
                    Edit invoice
                  </Button>
                </div>
              </div>
              <Separator className='bg-[#232323]' />
              {/* Send */}
              <div className='flex flex-col sm:flex-row sm:items-center gap-4'>
                <div className='flex items-center gap-4'>
                  <span className='inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#3b82f6]/20 shrink-0'>
                    <svg width='20' height='20' fill='none' viewBox='0 0 24 24'>
                      <circle cx='12' cy='12' r='10' fill='#3b82f6' />
                      <path
                        d='M8 12l2 2 4-4'
                        stroke='white'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                    </svg>
                  </span>
                  <div>
                    <div className='font-semibold text-white text-[14px] mb-1'>Send</div>
                    <div className='text-sm text-[#8C8C8C]'>
                      Last sent:{' '}
                      {invoice.status === 'sent'
                        ? new Date(invoice.dateSent).toLocaleString()
                        : 'Not sent yet'}{' '}
                      <span className='underline cursor-pointer'>Edit date</span>
                    </div>
                  </div>
                </div>
                <div className='sm:ml-auto'>
                  <Button
                    variant='outline'
                    size='sm'
                    className='bg-[#232323] border-[#333] text-white text-sm h-11 w-full sm:w-auto px-6'
                    onClick={handleSendInvoice}
                  >
                    {invoice.status === 'sent' || invoice.status === 'paid'
                      ? 'Resend invoice'
                      : 'Send invoice'}
                  </Button>
                </div>
              </div>
              <Separator className='bg-[#232323]' />
              {/* Manage Payments */}
              <div className='flex flex-col sm:flex-row sm:items-center gap-4'>
                <div className='flex items-center gap-4'>
                  <span className='inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#a78bfa]/20 shrink-0'>
                    <svg width='20' height='20' fill='none' viewBox='0 0 24 24'>
                      <circle cx='12' cy='12' r='10' fill='#a78bfa' />
                      <path
                        d='M12 8v4l3 3'
                        stroke='white'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                    </svg>
                  </span>
                  <div>
                    <div className='font-semibold text-white text-[14px] mb-1'>Manage payments</div>
                    <div className='text-sm text-[#8C8C8C]'>
                      Amount due: {invoice.total} {invoice.currency} —{' '}
                      <span className='underline cursor-pointer'>Record a payment</span> manually
                    </div>
                  </div>
                </div>
                <div className='sm:ml-auto'>
                  <Button
                    variant='outline'
                    size='sm'
                    className='bg-[#232323] border-[#333] text-white text-sm h-11 w-full sm:w-auto px-6'
                  >
                    Record a payment
                  </Button>
                </div>
              </div>
            </div>
            {/* Payments received */}
            <div className='mt-8'>
              <div className='text-[14px] font-medium text-[#8C8C8C] mb-4'>Payments received:</div>
              {paymentsLoading ? (
                <div className='text-[14px] text-[#8C8C8C]'>Loading payments...</div>
              ) : paymentsError ? (
                <div className='text-[14px] text-red-500'>Failed to load payments.</div>
              ) : payments.length > 0 ? (
                <div className='space-y-6'>
                  {payments.map((payment) => {
                    return (
                      <div key={payment._id} className='mb-2'>
                        <div className='text-[14px] text-[#8C8C8C]'>
                          {new Date(payment.date).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}{' '}
                          - A payment for{' '}
                          <span className='font-semibold text-white'>
                            {payment.amount.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}{' '}
                            {invoice.currency}
                          </span>{' '}
                          was made using {payment.method}.
                        </div>
                        {payment.memo && payment.memo.length > 0 && (
                          <div className='text-[13px] text-[#8C8C8C] mt-1'>{payment.memo}</div>
                        )}
                        <div className='flex flex-wrap gap-1 text-[13px] font-medium mt-2 items-center'>
                          <Button
                            variant='link'
                            size='sm'
                            className='p-0 h-auto text-[#8C8C8C] hover:text-white'
                            onClick={() => {
                              return handleSendReceipt(payment);
                            }}
                          >
                            Send a receipt
                          </Button>
                          <span className='text-[#8C8C8C]'>·</span>
                          <Button
                            variant='link'
                            size='sm'
                            className='p-0 h-auto text-[#8C8C8C] hover:text-white'
                            onClick={() => {
                              return handleEditPayment(payment);
                            }}
                          >
                            Edit payment
                          </Button>
                          <span className='text-[#8C8C8C]'>·</span>
                          <Button
                            variant='link'
                            size='sm'
                            className='p-0 h-auto text-[#8C8C8C] hover:text-white'
                            onClick={() => {
                              return handleDeletePayment(payment._id);
                            }}
                          >
                            Remove payment
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                  <Separator className='bg-[#232323] my-4' />
                  <div className='flex justify-between items-center'>
                    <span className='text-[14px] text-[#8C8C8C]'>Total Paid:</span>
                    <span className='text-[14px] font-semibold text-white'>
                      {payments
                        .reduce((sum, payment) => {
                          return sum + payment.amount;
                        }, 0)
                        .toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{' '}
                      {invoice.currency}
                    </span>
                  </div>
                </div>
              ) : (
                <div className='text-[14px] text-[#8C8C8C]'>No payments recorded yet.</div>
              )}
            </div>
          </div>
          {/* Additional Info Panel */}
          <div className='bg-[#141414] rounded-lg border border-[#232323] p-6'>
            <h3 className='text-[14px] font-semibold text-white mb-5'>Additional Information</h3>
            <div className='grid grid-cols-2 gap-6'>
              <div>
                <div className='text-sm text-[#8C8C8C] mb-2'>Invoice Date</div>
                <div className='text-[14px] text-white'>
                  {new Date(invoice.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div>
                <div className='text-sm text-[#8C8C8C] mb-2'>Due Date</div>
                <div className='text-[14px] text-white'>
                  {new Date(invoice.dueDate).toLocaleDateString()}
                </div>
              </div>
              <div className='col-span-2'>
                <div className='text-sm text-[#8C8C8C] mb-2'>Notes</div>
                <div className='text-[14px] text-white'>{invoice.notes || ''}</div>
              </div>
            </div>
          </div>

          <InvoicePdf invoice={invoice as any} />
        </div>
        {/* Receipt Dialog */}
        <Dialog open={isReceiptDialogOpen} onOpenChange={setIsReceiptDialogOpen}>
          <DialogContent className='sm:max-w-[450px]'>
            <DialogHeader>
              <DialogTitle>Send Payment Receipt</DialogTitle>
              <DialogDescription>
                Share the payment receipt for ${selectedPayment?.amount.toFixed(2)} with{' '}
                {invoice.client?.user.name}
              </DialogDescription>
            </DialogHeader>
            <div className='flex flex-col items-center justify-center py-10'>
              <LinkIcon className='h-10 w-10 mb-4 text-purple-600' />
              <div className='font-bold text-lg mb-1 text-center'>Copy link</div>
              <div className='text-center text-muted-foreground text-base mb-4'>
                A link to your payment receipt with all details included
              </div>
              <Button
                variant='outline'
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success('Receipt link copied!');
                }}
              >
                Copy link
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        {/* Edit Payment Dialog */}
        <Dialog open={isEditPaymentDialogOpen} onOpenChange={setIsEditPaymentDialogOpen}>
          <DialogContent className='sm:max-w-[450px]'>
            <DialogHeader>
              <DialogTitle>Edit Payment</DialogTitle>
            </DialogHeader>
            <form className='space-y-4'>
              <div>
                <Label>Date</Label>
                <Popover modal>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      className={
                        'w-full justify-start text-left font-normal' +
                        (!paymentDate ? ' text-muted-foreground' : '')
                      }
                    >
                      <CalendarIcon className='mr-2 h-4 w-4' />
                      {paymentDate ? format(paymentDate, 'yyyy-MM-dd') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0 min-w-[300px]' align='start'>
                    <Calendar
                      mode='single'
                      selected={paymentDate}
                      onSelect={setPaymentDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>Amount</Label>
                <Input
                  type='number'
                  min='0'
                  step='any'
                  value={paymentAmount}
                  onChange={(e) => {
                    return setPaymentAmount(e.target.value);
                  }}
                  placeholder='$0.00'
                />
              </div>
              <div>
                <Label>Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder='Select a payment method...' />
                  </SelectTrigger>
                  <SelectContent className='z-[100]'>
                    <SelectItem value='credit-card'>Credit Card</SelectItem>
                    <SelectItem value='bank-transfer'>Bank Transfer</SelectItem>
                    <SelectItem value='cash'>Cash</SelectItem>
                    <SelectItem value='check'>Check</SelectItem>
                    <SelectItem value='other'>Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Memo / notes</Label>
                <Textarea
                  value={paymentMemo}
                  onChange={(e) => {
                    return setPaymentMemo(e.target.value);
                  }}
                  placeholder='Optional notes about this payment...'
                />
              </div>
            </form>
            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => {
                  setIsEditPaymentDialogOpen(false);
                  setSelectedPayment(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (selectedPayment && paymentDate) {
                    editPaymentMutation.mutate({
                      paymentId: selectedPayment._id,
                      date: paymentDate,
                      amount: parseFloat(paymentAmount),
                      method: paymentMethod,
                      memo: paymentMemo,
                    });
                  }
                }}
                disabled={
                  !paymentDate || !paymentAmount || !paymentMethod || editPaymentMutation.isPending
                }
              >
                {editPaymentMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Delete Payment Alert */}
        <Dialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
          <DialogContent className='sm:max-w-[425px]'>
            <DialogHeader>
              <DialogTitle>Delete Payment</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this payment? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className='py-4'>
              <Alert variant='destructive'>
                <AlertDescription>
                  This will permanently delete the payment of{' '}
                  <span className='font-semibold'>${selectedPayment?.amount.toFixed(2)}</span> made
                  on{' '}
                  {selectedPayment?.date &&
                    new Date(selectedPayment.date).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  .
                </AlertDescription>
              </Alert>
            </div>
            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => {
                  setIsDeleteAlertOpen(false);
                  setSelectedPayment(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant='destructive'
                onClick={() => {
                  if (selectedPayment) {
                    deletePaymentMutation.mutate(selectedPayment._id);
                  }
                }}
                disabled={deletePaymentMutation.isPending}
              >
                {deletePaymentMutation.isPending ? 'Deleting...' : 'Delete Payment'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Add SendInvoiceDialog */}
      {invoice && (
        <SendInvoiceDialog
          open={isSendDialogOpen}
          onOpenChange={handleSendDialogClose}
          invoice={transformForSendDialog()}
        />
      )}
    </div>
  );
}
