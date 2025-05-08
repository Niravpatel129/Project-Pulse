import { SendInvoiceDialog } from '@/components/invoice/SendInvoiceDialog';
import ProjectManagement from '@/components/project/ProjectManagement';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
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
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useInvoiceSettings } from '@/hooks/useInvoiceSettings';
import { useUpdateInvoiceSettings } from '@/hooks/useUpdateInvoiceSettings';
import { newRequest } from '@/utils/newRequest';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import html2pdf from 'html2pdf.js';
import {
  CalendarIcon,
  CheckCircle2,
  CreditCard,
  Info,
  Link as LinkIcon,
  MoreHorizontal,
  Send,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { BusinessSettings } from './BusinessSettings';
import { Invoice } from './Invoice';

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
  console.log('🚀 invoice:', invoice);
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

  const markAsSentMutation = useMutation({
    mutationFn: async () => {
      // Assuming the API expects a PATCH or PUT to /invoices/:id with status: 'sent'
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
      await newRequest.put(`/invoices/${invoice.id}/payments/${paymentData.paymentId}`, {
        date: paymentData.date,
        amount: paymentData.amount,
        method: paymentData.method,
        memo: paymentData.memo,
      });
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

  // Fetch payments for this invoice
  const {
    data: paymentData,
    isLoading: paymentsLoading,
    isError: paymentsError,
  } = useQuery<{ paymentHistory: Payment[]; currentBalance: number; availableCredits: number }>({
    queryKey: ['invoice-payments', invoice.id],
    queryFn: async () => {
      const res = await newRequest.get(`/invoices/${invoice.id}/payments`);
      return {
        paymentHistory: res.data.data.paymentHistory,
        currentBalance: res.data.data.currentBalance,
        availableCredits: res.data.data.availableCredits,
      };
    },
  });
  const payments = paymentData?.paymentHistory || [];

  // Calculate remaining amount due
  const calculateRemainingAmount = () => {
    if (!paymentData) return invoice.total;
    return paymentData.currentBalance;
  };

  const remainingAmount = calculateRemainingAmount();

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'default';
      case 'overdue':
        return 'destructive';
      case 'sent':
        return 'secondary';
      case 'draft':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getDueDaysAgo = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();

    // Reset time part to compare dates only
    const dueDateOnly = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const diffTime = Math.abs(todayOnly.getTime() - dueDateOnly.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'today';
    if (todayOnly > dueDateOnly) {
      if (diffDays === 1) return 'yesterday';
      return `${diffDays} days ago`;
    } else {
      if (diffDays === 1) return 'tomorrow';
      return `in ${diffDays} days`;
    }
  };

  const dueDaysAgo = getDueDaysAgo(invoice.dueDate);

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

  const confirmDeletePayment = () => {
    if (selectedPayment) {
      deletePaymentMutation.mutate(selectedPayment._id);
      setIsDeleteAlertOpen(false);
      setSelectedPayment(null);
    }
  };

  const handleSendReceipt = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsReceiptDialogOpen(true);
  };

  // Transform invoice data to match SendInvoiceDialog's expected format
  const transformForSendDialog = () => {
    return {
      _id: invoice._id,
      invoiceNumber: invoice.invoiceNumber,
      client: invoice.client
        ? {
            _id: invoice.clientId,
            user: {
              name: invoice.clientName,
              email: invoice.client.email,
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
      businessInfo: {
        name: invoiceSettings?.businessName || '',
        address: invoiceSettings?.businessAddress || '',
        taxId: invoiceSettings?.taxId || '',
        showTaxId: invoiceSettings?.showTaxId || false,
        logo: invoiceSettings?.logo || null,
        currency: invoiceSettings?.currency || 'usd',
      },
    };
  };

  // Transform invoice data to match ProjectManagement expected format
  const transformForProjectManagement = (): ProjectManagementInvoice => {
    return {
      _id: invoice._id,
      client: {
        _id: invoice.clientId,
        user: {
          name: invoice.clientName,
          email: invoice.client.email,
        },
      },
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
      status: invoice.status,
      dueDate: invoice.dueDate,
      notes: invoice.notes || '',
      currency: invoice.currency,
      taxRate: invoice.tax || 0,
      taxId: invoice.client.taxId || '',
      showTaxId: !!invoice.client.taxId,
      requireDeposit: invoice.requireDeposit || false,
      depositPercentage: invoice.depositPercentage || 0,
      discount: invoice.discount || 0,
      discountAmount: invoice.discount || 0,
      subtotal: invoice.subtotal,
      taxAmount: invoice.tax || 0,
      teamNotes: invoice.teamNotes || '',
      businessInfo: {
        name: invoiceSettings?.businessName || '',
        address: invoiceSettings?.businessAddress || '',
        taxId: invoiceSettings?.taxId || '',
        showTaxId: invoiceSettings?.showTaxId || false,
        logo: invoiceSettings?.logo || null,
        currency: invoiceSettings?.currency || 'usd',
      },
    };
  };

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return;

    const element = invoiceRef.current;
    const opt = {
      margin: 0,
      filename: `invoice-${invoice.invoiceNumber}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        letterRendering: true,
      },
      jsPDF: {
        unit: 'in',
        format: 'letter',
        orientation: 'portrait',
        compress: true,
      },
    };

    try {
      // Clone the element to avoid modifying the original
      const clonedElement = element.cloneNode(true) as HTMLElement;
      // Remove any transform/scale styles that might affect the PDF
      clonedElement.style.transform = 'none';
      clonedElement.style.margin = '0';
      clonedElement.style.padding = '0';

      await html2pdf().set(opt).from(clonedElement).save();
      toast.success('PDF downloaded successfully');
    } catch (error) {
      toast.error('Failed to download PDF');
      console.error('PDF download error:', error);
    }
  };

  return (
    <>
      {/* Header */}
      <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6'>
        <div>
          <h1 className='text-2xl font-bold mb-1'>Invoice #{invoice.invoiceNumber}</h1>
          <div className='flex items-center gap-6 mt-2'>
            <div className='flex flex-col'>
              <span className='text-xs text-muted-foreground font-medium mb-0.5'>Status</span>
              <Badge
                variant={getStatusColor(invoice.status)}
                className={`px-3 rounded capitalize ${
                  invoice.status.toLowerCase() === 'paid'
                    ? 'bg-green-100 text-green-700 hover:bg-green-100'
                    : invoice.status.toLowerCase() === 'overdue'
                    ? 'bg-red-100 text-red-700 hover:bg-red-100'
                    : invoice.status.toLowerCase() === 'sent'
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-100'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {invoice.status}
              </Badge>
            </div>
            <div className='flex flex-col'>
              <span className='text-xs text-muted-foreground font-medium mb-0.5'>Customer</span>
              <span className='text-muted-foreground text-sm'>
                <span className='text-primary font-medium cursor-pointer underline underline-offset-2'>
                  {invoice.clientName}
                </span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className='inline ml-1 w-4 h-4 text-muted-foreground align-middle cursor-pointer' />
                    </TooltipTrigger>
                    <TooltipContent>Customer info</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </span>
            </div>
            <div className='flex flex-col'>
              <span className='text-xs text-muted-foreground font-medium mb-0.5'>Business</span>
              <span className='text-muted-foreground text-sm'>
                <span className='text-primary font-medium cursor-pointer underline underline-offset-2'>
                  {invoiceSettings?.taxId ? 'Your Business' : 'Set Up Business'}
                </span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info
                        className='inline ml-1 w-4 h-4 text-muted-foreground align-middle cursor-pointer'
                        onClick={() => {
                          return setIsBusinessSettingsOpen(true);
                        }}
                      />
                    </TooltipTrigger>
                    <TooltipContent>Business settings</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </span>
            </div>
          </div>
        </div>
        <div className='flex flex-col items-end gap-2'>
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-1 bg-white rounded-full border p-1 px-2'>
              <span className='text-sm font-medium'>Stripe Invoice Payments</span>
              <Switch
                checked={true}
                disabled
                className='scale-90 bg-green-600 data-[state=checked]:bg-green-600'
              />
              <span className='ml-1 text-xs font-semibold text-green-600'>CONNECTED</span>
            </div>
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                return setIsBusinessSettingsOpen(true);
              }}
            >
              Business Settings
            </Button>
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button variant='outline' size='sm' className='px-3'>
                  <MoreHorizontal className='w-4 h-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem
                  onClick={() => {
                    return setIsEditInvoiceOpen(true);
                  }}
                >
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem>Delete</DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadPDF}>Download PDF</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className='flex items-center gap-6 mt-2'>
            <div className='flex flex-col items-end'>
              <span className='text-xs text-muted-foreground font-medium mb-0.5'>Amount</span>
              <div className='text-lg font-semibold'>${invoice.total.toFixed(2)}</div>
            </div>
            <div className='flex flex-col items-end'>
              <span className='text-xs text-muted-foreground font-medium mb-0.5'>Due Date</span>
              <div className='text-sm text-muted-foreground'>
                {getDueDaysAgo(invoice.dueDate) === 'today'
                  ? 'Today'
                  : `Due ${getDueDaysAgo(invoice.dueDate)}`}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Separator className='mb-6' />

      {/* Steps */}
      <Card className='mb-6'>
        <CardContent className='py-6'>
          {/* Create Step */}
          <div className='flex items-center gap-4 mb-8'>
            <div className='rounded-full bg-green-100 p-2'>
              <CheckCircle2 className='w-6 h-6 text-green-600' />
            </div>
            <div>
              <div className='font-medium'>Create</div>
              <div className='text-sm text-muted-foreground'>
                Created:{' '}
                <span className='font-mono'>on {new Date(invoice.createdAt).toLocaleString()}</span>
              </div>
            </div>
            <div className='ml-auto'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  return setIsEditInvoiceOpen(true);
                }}
              >
                Edit invoice
              </Button>
            </div>
          </div>
          <Separator />
          {/* Send Step */}
          <div className='flex items-center gap-4 my-8'>
            <div className='rounded-full bg-blue-100 p-2'>
              <Send className='w-6 h-6 text-blue-600' />
            </div>
            <div>
              <div className='font-medium'>Send</div>
              <div className='text-sm text-muted-foreground'>
                Last sent:{' '}
                <span className='font-mono'>
                  Marked as sent {new Date(invoice.updatedAt).toLocaleString()}.
                </span>{' '}
                <span className='text-primary cursor-pointer underline underline-offset-2'>
                  Edit date
                </span>
              </div>
              {invoice.status === 'overdue' && (
                <div className='mt-2'>
                  <Alert className='p-2 bg-muted/50 border-0'>
                    <AlertDescription>
                      <span className='font-semibold'>
                        Overdue invoices are{' '}
                        <span className='text-primary'>3x more likely to get paid</span>
                      </span>{' '}
                      when you send reminders.{' '}
                      <span className='text-primary cursor-pointer underline underline-offset-2'>
                        Schedule reminders.
                      </span>
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </div>
            <div className='ml-auto'>
              <Button
                size='sm'
                variant={
                  invoice.status === 'sent' || invoice.status === 'paid' ? 'outline' : 'default'
                }
                onClick={() => {
                  return setIsSendDialogOpen(true);
                }}
              >
                {invoice.status === 'sent' || invoice.status === 'paid'
                  ? 'Resend invoice'
                  : 'Send invoice'}
              </Button>
            </div>
          </div>
          <Separator />
          {/* Manage Payments Step */}
          <div className='flex items-center gap-4 mt-8'>
            <div className='rounded-full bg-purple-100 p-2'>
              <CreditCard className='w-6 h-6 text-purple-600' />
            </div>
            <div>
              <div className='font-medium'>Manage payments</div>
              <div className='text-sm text-muted-foreground'>
                {invoice.status === 'paid' ? (
                  <>
                    Amount due: <span className='font-mono'>(${remainingAmount.toFixed(2)})</span> —{' '}
                    <span
                      className='text-primary cursor-pointer underline underline-offset-2'
                      onClick={() => {
                        return setIsPaymentDialogOpen(true);
                      }}
                    >
                      Manage overpayment
                    </span>{' '}
                    manually
                  </>
                ) : (
                  <>
                    Amount due: <span className='font-mono'>${remainingAmount.toFixed(2)}</span> —{' '}
                    <span
                      className='text-primary cursor-pointer underline underline-offset-2'
                      onClick={() => {
                        return setIsPaymentDialogOpen(true);
                      }}
                    >
                      Record a payment
                    </span>{' '}
                    manually
                  </>
                )}
              </div>
            </div>
            <div className='ml-auto'>
              {invoice.status === 'paid' ? (
                <Badge
                  variant='outline'
                  className='bg-green-50 text-green-700 border-green-200 hover:bg-green-50 px-3 py-1'
                >
                  PAID
                </Badge>
              ) : (
                <Button
                  size='sm'
                  onClick={() => {
                    return setIsPaymentDialogOpen(true);
                  }}
                >
                  Record a payment
                </Button>
              )}
            </div>
          </div>

          {/* Payment History Section */}
          <div className='mt-6'>
            <Separator className='mb-4' />
            <div className='space-y-4'>
              <h3 className='font-medium text-sm text-muted-foreground'>Payments received:</h3>
              {paymentsLoading && (
                <div className='text-sm text-muted-foreground'>Loading payments...</div>
              )}
              {paymentsError && (
                <div className='text-sm text-red-600'>Failed to load payments.</div>
              )}
              {payments && payments.length > 0 ? (
                <div className='space-y-6'>
                  {payments.map((payment: Payment, idx: number) => {
                    return (
                      <div key={payment._id} className='mb-2'>
                        <div>
                          {new Date(payment.date).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}{' '}
                          - A payment for{' '}
                          <b>
                            $
                            {Number(payment.amount).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </b>{' '}
                          was made using {payment.method}.
                        </div>
                        {payment.memo && payment.memo.length > 0 && (
                          <div className='text-xs text-muted-foreground mb-1'>{payment.memo}</div>
                        )}
                        <div className='flex flex-wrap gap-1 text-sm font-medium mt-1 items-center'>
                          <Button
                            variant='link'
                            size='sm'
                            className='p-0 h-auto'
                            onClick={() => {
                              return handleSendReceipt(payment);
                            }}
                          >
                            Send a receipt
                          </Button>
                          <span className='text-gray-400'>·</span>
                          <Button
                            variant='link'
                            size='sm'
                            className='p-0 h-auto'
                            onClick={() => {
                              return handleEditPayment(payment);
                            }}
                          >
                            Edit payment
                          </Button>
                          <span className='text-gray-400'>·</span>
                          <Button
                            variant='link'
                            size='sm'
                            className='p-0 h-auto'
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
                </div>
              ) : (
                !paymentsLoading && (
                  <div className='text-sm text-muted-foreground'>No payments recorded yet.</div>
                )
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <SendInvoiceDialog
        open={isSendDialogOpen}
        onOpenChange={setIsSendDialogOpen}
        invoice={transformForSendDialog()}
      />

      <Dialog
        open={isPaymentDialogOpen}
        onOpenChange={(open) => {
          setIsPaymentDialogOpen(open);
          if (!open) setPaymentSuccess(false);
        }}
      >
        <DialogContent className='sm:max-w-[450px]' forceMount>
          <DialogHeader>
            <DialogTitle>Record a payment for this invoice</DialogTitle>
          </DialogHeader>
          {!paymentSuccess ? (
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
                    setAmountTouched(true);
                    return setPaymentAmount(e.target.value);
                  }}
                  onBlur={() => {
                    return setAmountTouched(true);
                  }}
                  placeholder='$0.00'
                />
                {amountTouched && (
                  <div
                    className={`text-xs mt-1 ${
                      !paymentAmount || isNaN(parseFloat(paymentAmount))
                        ? 'text-red-600'
                        : parseFloat(paymentAmount) > invoice.total
                        ? 'text-yellow-600'
                        : parseFloat(paymentAmount) === invoice.total
                        ? 'text-green-700'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {!paymentAmount || isNaN(parseFloat(paymentAmount))
                      ? 'Amount cannot be blank'
                      : parseFloat(paymentAmount) > invoice.total
                      ? `$${(parseFloat(paymentAmount) - invoice.total).toFixed(2)} overpayment`
                      : parseFloat(paymentAmount) === invoice.total
                      ? 'Invoice will be fully paid'
                      : `$${(invoice.total - parseFloat(paymentAmount)).toFixed(
                          2,
                        )} remaining after this payment`}
                  </div>
                )}
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
          ) : (
            <div className='flex flex-col items-center justify-center py-10'>
              <CheckCircle2 className='w-16 h-16 text-green-500 mb-4' />
              <div className='text-2xl font-bold mb-2'>The payment was recorded</div>
              <div className='text-muted-foreground mb-6 text-center'>
                Get paid 3 times faster. Accept Credit Cards or Bank Payments and get paid faster
                with online payments.
              </div>
            </div>
          )}
          <DialogFooter>
            {!paymentSuccess ? (
              <>
                <Button
                  variant='outline'
                  onClick={() => {
                    return setIsPaymentDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type='submit'
                  disabled={
                    !paymentDate ||
                    !paymentAmount ||
                    !paymentMethod ||
                    recordPaymentMutation.isPending
                  }
                  onClick={(e) => {
                    e.preventDefault();
                    recordPaymentMutation.mutate();
                  }}
                >
                  {recordPaymentMutation.isPending ? 'Recording...' : 'Submit'}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant='outline'
                  onClick={() => {
                    setIsPaymentDialogOpen(false);
                    setPaymentSuccess(false);
                  }}
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setIsReceiptDialogOpen(true);
                  }}
                >
                  Send a receipt
                </Button>
              </>
            )}
          </DialogFooter>
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
                  setAmountTouched(true);
                  return setPaymentAmount(e.target.value);
                }}
                onBlur={() => {
                  return setAmountTouched(true);
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

      {/* Receipt Dialog */}
      <Dialog open={isReceiptDialogOpen} onOpenChange={setIsReceiptDialogOpen}>
        <DialogContent className='sm:max-w-[450px]'>
          <DialogHeader>
            <DialogTitle>Send Payment Receipt</DialogTitle>
            <DialogDescription>
              Share the payment receipt for ${selectedPayment?.amount.toFixed(2)} with{' '}
              {invoice.clientName}
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
                <span className='font-semibold'>${selectedPayment?.amount.toFixed(2)}</span> made on{' '}
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
              onClick={confirmDeletePayment}
              disabled={deletePaymentMutation.isPending}
            >
              {deletePaymentMutation.isPending ? 'Deleting...' : 'Delete Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Business Settings Dialog */}
      <BusinessSettings open={isBusinessSettingsOpen} onOpenChange={setIsBusinessSettingsOpen} />

      {/* Edit Invoice Dialog */}
      <Dialog open={isEditInvoiceOpen} onOpenChange={setIsEditInvoiceOpen}>
        <DialogContent className='max-w-[90vw] h-[90vh] p-0'>
          <DialogTitle className='sr-only'>Edit Invoice</DialogTitle>
          <ProjectManagement
            onClose={() => {
              return setIsEditInvoiceOpen(false);
            }}
            existingInvoice={transformForProjectManagement()}
          />
        </DialogContent>
      </Dialog>

      {/* Hidden Invoice component for PDF generation */}
      <div className='hidden'>
        <div
          ref={invoiceRef}
          style={{
            transform: 'none',
            margin: 0,
            padding: 0,
            width: '100%',
            maxWidth: 'none',
            border: 'none',
            boxShadow: 'none',
          }}
        >
          <Invoice invoice={invoice} />
        </div>
      </div>
    </>
  );
}
