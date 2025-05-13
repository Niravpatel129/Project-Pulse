import { BusinessSettings } from '@/app/[workspace]/invoicesOld/[id]/components/BusinessSettings';
import { SendInvoiceDialog } from '@/components/invoice/SendInvoiceDialog';
import { InvoicePdf } from '@/components/InvoicePdf/InvoicePdf';
import ProjectManagement from '@/components/project/ProjectManagement';
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
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useInvoiceSettings } from '@/hooks/useInvoiceSettings';
import { newRequest } from '@/utils/newRequest';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { CalendarIcon, CheckCircle2, Download, LinkIcon } from 'lucide-react';
import { useRef, useState } from 'react';
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
  dateSent: string;
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
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'open';
  dueDate: string;
  notes?: string;
  currency: string;
  requireDeposit: boolean;
  depositPercentage: number;
  createdBy: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  starred: boolean;
}

interface ProjectManagementInvoice {
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
  businessInfo: {
    name: string;
    address: string;
    taxId: string;
    showTaxId: boolean;
    logo: string | null;
    currency: string;
  };
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
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
  const [isEditPaymentDialogOpen, setIsEditPaymentDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentDate, setPaymentDate] = useState<Date | undefined>(new Date());
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentMemo, setPaymentMemo] = useState('');
  const [amountTouched, setAmountTouched] = useState(false);
  const [isBusinessSettingsOpen, setIsBusinessSettingsOpen] = useState(false);
  const [isEditInvoiceOpen, setIsEditInvoiceOpen] = useState(false);
  const { data: invoiceSettings } = useInvoiceSettings();

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
            _id: invoice?.client?._id,
            user: {
              name: invoice?.client?.user?.name,
              email: invoice?.client?.user?.email,
            },
            phone: '',
            address: {
              street: '',
              city: '',
              state: '',
              country: '',
              zip: '',
            },
            shippingAddress: {
              street: '',
              city: '',
              state: '',
              country: '',
              zip: '',
            },
            contact: {
              firstName: '',
              lastName: '',
            },
            taxId: '',
            website: '',
            isActive: true,
            createdAt: invoice.createdAt,
            updatedAt: invoice.updatedAt,
          }
        : null,
      status: invoice.status,
      items: invoice.items.map((item) => {
        return {
          _id: item._id,
          name: item.name,
          description: item.description || item.name,
          quantity: item.quantity,
          price: item.price,
          discount: item.discount || 0,
          tax: item.tax || 0,
          taxName: '',
        };
      }),
      total: invoice.total,
      dueDate: invoice.dueDate,
      notes: invoice.notes || '',
      currency: invoice.currency,
      createdBy: invoice.createdBy,
      createdAt: invoice.createdAt,
      businessInfo: {
        name: invoice?.createdBy?.name,
        address: '',
        taxId: '',
        showTaxId: false,
        logo: null,
        currency: invoice.currency,
      },
    };
  };

  const recordPaymentMutation = useMutation({
    mutationFn: async () => {
      await newRequest.post(`/invoices/${invoiceId || selectedInvoice?._id}/payments`, {
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

  // Transform invoice data to match ProjectManagement expected format
  const transformForProjectManagement = (): ProjectManagementInvoice => {
    if (!invoice) return null;
    return {
      _id: invoice._id,
      client: {
        _id: invoice.client?._id || '',
        user: {
          name: invoice.client?.user.name || '',
          email: invoice.client?.user.email || '',
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
      taxRate:
        invoice.items.reduce((sum, item) => {
          return sum + (item.tax || 0);
        }, 0) / invoice.items.length || 0,
      taxId: invoiceSettings?.taxId || '',
      showTaxId: invoiceSettings?.showTaxId || false,
      requireDeposit: invoice.requireDeposit,
      depositPercentage: invoice.depositPercentage,
      discount: 0,
      discountAmount: 0,
      subtotal: invoice.items.reduce((sum, item) => {
        return sum + item.price * item.quantity;
      }, 0),
      taxAmount: invoice.items.reduce((sum, item) => {
        return sum + (item.tax || 0);
      }, 0),
      teamNotes: '',
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

  const handleDownloadPDF = () => {
    if (!invoiceRef.current) return;

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Get the invoice content
    const invoiceContent = invoiceRef.current.innerHTML;

    // Write the invoice content to the new window
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice ${invoice?.invoiceNumber}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            
            body {
              font-family: 'Inter', sans-serif;
              margin: 0;
              padding: 0;
              background: #141414;
            }
            
            .invoice-paper {
              width: 8.5in;
              min-height: 11in;
              padding: 2.5rem 2rem;
              margin: 0 auto;
              background: #141414;
              color: #fafafa;
              border: 1px solid #232428;
              box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
            }
            
            .invoice-paper table {
              width: 100%;
              border-collapse: collapse;
            }
            
            .invoice-paper th {
              background: #232428;
              color: white;
              text-align: left;
              padding: 0.75rem 1rem;
              font-weight: 600;
            }
            
            .invoice-paper td {
              padding: 0.75rem 1rem;
              border-top: 1px solid #232428;
              color: #8C8C8C;
            }
            
            .invoice-paper h1 {
              font-size: 2rem;
              font-weight: 600;
              color: #fafafa;
            }
            
            .invoice-paper .text-sm {
              font-size: 0.875rem;
            }
            
            .invoice-paper .text-base {
              font-size: 1rem;
            }
            
            .invoice-paper .font-semibold {
              font-weight: 600;
            }
            
            .invoice-paper .text-[#8C8C8C] {
              color: #8C8C8C;
            }
            
            .invoice-paper .text-[#fafafa] {
              color: #fafafa;
            }
            
            .invoice-paper .border-[#232428] {
              border-color: #232428;
            }
            
            .invoice-paper .bg-[#232428] {
              background-color: #232428;
            }
            
            @media print {
              body {
                background: white;
              }
              
              .invoice-paper {
                width: 100%;
                height: 100%;
                margin: 0;
                padding: 1in;
                transform: none;
                box-shadow: none;
                border: none;
                background: white;
                color: black;
              }
              
              .invoice-paper th {
                background: #f3f4f6;
                color: black;
              }
              
              .invoice-paper td {
                border-color: #e5e7eb;
                color: #374151;
              }
              
              .invoice-paper h1 {
                color: black;
              }
              
              .invoice-paper .text-[#8C8C8C] {
                color: #6b7280;
              }
              
              .invoice-paper .text-[#fafafa] {
                color: black;
              }
              
              .invoice-paper .border-[#232428] {
                border-color: #e5e7eb;
              }
              
              .invoice-paper .bg-[#232428] {
                background-color: #f3f4f6;
              }
            }
          </style>
        </head>
        <body>
          ${invoiceContent}
        </body>
      </html>
    `);

    // Wait for the content to load
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 1000);
  };

  if (!invoiceId && !selectedInvoice) {
    return (
      <div className='flex flex-col items-center justify-center h-full w-full bg-background'>
        <div className='flex flex-col items-center justify-center'>
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

  if (error) {
    return (
      <div className='bg-background overflow-hidden'>
        <div className='sticky top-0 z-10 bg-background'>
          <InvoiceActionBar
            onClose={handleClose}
            invoiceId={invoiceId || selectedInvoice?._id}
            invoice={invoice}
          />
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
        <InvoiceActionBar
          onClose={handleClose}
          invoiceId={invoiceId || selectedInvoice?._id}
          invoice={invoice}
          onEditInvoice={() => {
            return setIsEditInvoiceOpen(true);
          }}
        />
      </div>
      <div className='mt-2 overflow-auto h-[calc(100vh-4rem)]'>
        <div className='flex flex-col space-y-6 pb-6 border-b border-[#232323] rounded-t-lg'>
          {/* Invoice Info Section */}
          <div className='flex flex-col border-b border-[#232323] px-5 '>
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
                <Button
                  variant='link'
                  size='sm'
                  onClick={() => {
                    return setIsBusinessSettingsOpen(true);
                  }}
                >
                  {invoiceSettings?.businessName || 'Set Up Business'}
                </Button>
              </div>
            </div>
          </div>
          <div className='grid grid-cols-3 gap-4 px-5'>
            <div className='flex flex-col'>
              <span className='text-sm text-[#8C8C8C] mb-2'>Amount</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className='text-[14px] font-bold text-white border-b border-dashed border-[#232428] cursor-help'>
                      {invoice.total.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{' '}
                      {invoice.currency}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className='bg-[#141414] text-[#fafafa] border border-[#232428] shadow-md rounded-md p-3'>
                    <div className='space-y-2 w-[180px]'>
                      <div className='flex justify-between items-center'>
                        <span className='text-[#8C8C8C] text-xs'>Subtotal</span>
                        <span className='text-[#fafafa] text-xs font-medium'>
                          {invoice.items
                            .reduce((sum, item) => {
                              return sum + item.price * item.quantity;
                            }, 0)
                            .toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}{' '}
                          {invoice.currency}
                        </span>
                      </div>
                      <div className='flex justify-between items-center'>
                        <span className='text-[#8C8C8C] text-xs'>Tax</span>
                        <span className='text-[#fafafa] text-xs font-medium'>
                          {invoice.items
                            .reduce((sum, item) => {
                              return sum + (item.tax || 0);
                            }, 0)
                            .toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}{' '}
                          {invoice.currency}
                        </span>
                      </div>
                      <div className='flex justify-between items-center'>
                        <span className='text-[#8C8C8C] text-xs'>Discount</span>
                        <span className='text-[#8b5df8] text-xs font-medium'>
                          -
                          {invoice.items
                            .reduce((sum, item) => {
                              return sum + (item.discount || 0);
                            }, 0)
                            .toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}{' '}
                          {invoice.currency}
                        </span>
                      </div>
                      <div className='pt-1 border-t border-[#232428] flex justify-between items-center'>
                        <span className='text-[#fafafa] text-xs font-medium'>Total</span>
                        <span className='text-[#fafafa] text-xs font-bold'>
                          {invoice.total.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}{' '}
                          {invoice.currency}
                        </span>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            {invoice.requireDeposit && (
              <div className='flex flex-col'>
                <span className='text-sm text-[#8C8C8C] mb-2'>Deposit Due</span>
                <span className='text-[14px] font-semibold text-[#a78bfa]'>
                  $
                  {(invoice.total * (invoice.depositPercentage / 100)).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{' '}
                  <span className='text-sm'>({invoice.depositPercentage}% )</span>
                </span>
              </div>
            )}
            <div className='flex flex-col'>
              <span className='text-sm text-[#8C8C8C] mb-2'>Due Date</span>
              <span className='text-[14px] font-medium text-white'>
                {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'No due date'}
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
                    onClick={() => {
                      return setIsEditInvoiceOpen(true);
                    }}
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
                      Amount due:{' '}
                      {(
                        invoice.total -
                        payments.reduce((sum, payment) => {
                          return sum + payment.amount;
                        }, 0)
                      ).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{' '}
                      {invoice.currency} —{' '}
                      <span
                        className='underline cursor-pointer'
                        onClick={() => {
                          return setIsPaymentDialogOpen(true);
                        }}
                      >
                        Record a payment
                      </span>{' '}
                      manually
                    </div>
                  </div>
                </div>
                <div className='sm:ml-auto'>
                  <Button
                    variant='outline'
                    size='sm'
                    className='bg-[#232323] border-[#333] text-white text-sm h-11 w-full sm:w-auto px-6'
                    onClick={() => {
                      return setIsPaymentDialogOpen(true);
                    }}
                  >
                    {payments.reduce((sum, payment) => {
                      return sum + payment.amount;
                    }, 0) >= invoice.total
                      ? 'Record Overpayment'
                      : 'Record a payment'}
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

          <div className='flex items-center justify-between mb-5'>
            <h3 className='text-[14px] font-semibold text-white'>Invoice</h3>
            <Button
              variant='outline'
              size='sm'
              className='bg-[#232323] border-[#333] text-white text-sm h-8 px-4'
              onClick={handleDownloadPDF}
            >
              <Download className='w-4 h-4 mr-2' />
              Download PDF
            </Button>
          </div>
          <div className='w-full overflow-auto flex justify-center'>
            <div
              style={{ transform: 'scale(0.8)', transformOrigin: 'top center' }}
              ref={invoiceRef}
            >
              <InvoicePdf invoice={invoice as any} />
            </div>
          </div>
        </div>
        {/* Receipt Dialog */}
        <Dialog open={isReceiptDialogOpen} onOpenChange={setIsReceiptDialogOpen}>
          <DialogContent className='sm:max-w-[450px]'>
            <DialogHeader>
              <DialogTitle>Send Payment Receipt</DialogTitle>
              <DialogDescription>
                Share the payment receipt for $
                {selectedPayment?.amount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{' '}
                with {invoice.client?.user.name}
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
                  const receiptUrl = `${window.location.origin}/portal/payments/receipt/${selectedPayment?._id}`;
                  navigator.clipboard.writeText(receiptUrl);
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
                  <span className='font-semibold'>
                    $
                    {selectedPayment?.amount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>{' '}
                  made on{' '}
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

      {/* Payment Dialog */}
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
                      ? `$${(parseFloat(paymentAmount) - invoice.total).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })} overpayment`
                      : parseFloat(paymentAmount) === invoice.total
                      ? 'Invoice will be fully paid'
                      : `$${(invoice.total - parseFloat(paymentAmount)).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })} remaining after this payment`}
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

      {/* Business Settings Dialog */}
      <BusinessSettings open={isBusinessSettingsOpen} onOpenChange={setIsBusinessSettingsOpen} />

      {/* Edit Invoice Dialog */}
      <Dialog open={isEditInvoiceOpen} onOpenChange={setIsEditInvoiceOpen}>
        <DialogContent className='max-w-[90vw] h-[90vh] p-0'>
          <DialogTitle className='sr-only'>Edit Invoice</DialogTitle>
          <ProjectManagement
            onClose={() => {
              setIsEditInvoiceOpen(false);
              if (invoiceId && onInvoiceUpdate) {
                onInvoiceUpdate(invoiceId);
              }
            }}
            existingInvoice={transformForProjectManagement()}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
