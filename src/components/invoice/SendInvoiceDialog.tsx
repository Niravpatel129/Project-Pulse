import { Invoice } from '@/app/[workspace]/invoicesOld/[id]/components/Invoice';
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
import { Link as LinkIcon } from 'lucide-react';
import { useRef } from 'react';
import { toast } from 'sonner';

type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'unpaid' | 'open';

interface ClientAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  zip: string;
}

interface Client {
  _id: string;
  user: {
    name: string;
    email: string;
  };
  phone: string;
  address: ClientAddress;
  shippingAddress: ClientAddress;
  contact: {
    firstName: string;
    lastName: string;
  };
  taxId: string;
  website: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface InvoiceItem {
  _id: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
  discount: number;
  tax: number;
  taxName: string;
}

interface Invoice {
  _id: string;
  invoiceNumber: string;
  client: Client;
  items: InvoiceItem[];
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'unpaid' | 'open';
  dueDate: string;
  notes: string;
  currency: string;
  createdBy: {
    _id: string;
    name: string;
  };
  createdAt: string;
  subtotal?: number;
  discount?: number;
  tax?: number;
  remainingBalance?: number;
  totalPaid?: number;
  payments?: Array<{
    _id: string;
    amount: number;
    date: string;
    method: string;
    memo?: string;
    status?: string;
  }>;
  businessInfo?: {
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

// Utility function to transform invoice data for PDF generation
export function transformInvoiceForPDF(invoice: Invoice) {
  // Calculate item totals first
  const itemsWithTotals = invoice.items.map((item) => {
    const itemTotal = item.price * item.quantity;
    return {
      id: item._id,
      name: item.name,
      description: item.description || '',
      quantity: item.quantity,
      price: item.price,
      discount: item.discount,
      tax: item.tax,
      total: itemTotal,
    };
  });

  // Calculate summary totals
  const subtotal = itemsWithTotals.reduce((sum, item) => {
    return sum + item.total;
  }, 0);
  const discount = itemsWithTotals.reduce((sum, item) => {
    return sum + (item.discount || 0);
  }, 0);
  const tax = itemsWithTotals.reduce((sum, item) => {
    return sum + (item.tax || 0);
  }, 0);
  const total = subtotal - discount + tax;

  // Calculate total paid from payments
  const totalPaid =
    invoice.payments?.reduce((sum, payment) => {
      return sum + (payment.amount || 0);
    }, 0) || 0;
  const remainingBalance = total - totalPaid;

  return {
    id: invoice._id,
    invoiceNumber: invoice.invoiceNumber,
    clientName: invoice?.client?.user?.name,
    clientId: invoice?.client?._id,
    client: {
      name: invoice?.client?.user?.name,
      email: invoice?.client?.user?.email,
      phone: invoice?.client?.phone,
      address: invoice?.client?.address,
      shippingAddress: invoice?.client?.shippingAddress,
      taxId: invoice?.client?.taxId,
      website: invoice?.client?.website,
    },
    status: invoice.status,
    items: itemsWithTotals,
    subtotal,
    discount,
    tax,
    total,
    dueDate: invoice.dueDate,
    issueDate: invoice.createdAt,
    createdAt: invoice.createdAt,
    updatedAt: invoice.createdAt,
    notes: invoice.notes,
    terms: '',
    paymentMethod: '',
    paymentDate: null,
    currency: invoice.currency,
    createdBy: invoice?.createdBy?.name,
    requireDeposit: false,
    depositPercentage: 0,
    teamNotes: '',
    payments: invoice.payments || [],
    remainingBalance,
  };
}

export function SendInvoiceDialog({ open, onOpenChange, invoice }: SendInvoiceDialogProps) {
  const queryClient = useQueryClient();
  const isPaid = invoice.status === 'paid';
  const invoiceRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (typeof window === 'undefined') return;
    if (!invoiceRef.current) return;

    try {
      // Dynamically import html2pdf only on the client side
      const html2pdf = (await import('html2pdf.js')).default;

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

  const markAsSentMutation = useMutation({
    mutationFn: async () => {
      await newRequest.put(`/invoices/${invoice._id}`, { status: 'sent' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice', invoice._id] });
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
        className='sm:max-w-[400px] bg-[#181818] text-white border-[#232323]'
        onClick={(e) => {
          return e.stopPropagation();
        }}
      >
        <DialogHeader>
          <DialogTitle className='text-white'>Send Invoice</DialogTitle>
          <DialogDescription className='text-[#8b8b8b]'>
            {isPaid ? (
              <span className='text-yellow-500'>
                This invoice has already been paid. You can still share the invoice details.
              </span>
            ) : (
              `Share invoice #${invoice?.invoiceNumber} with ${invoice?.client?.user?.name}`
            )}
          </DialogDescription>
        </DialogHeader>
        <div className='py-6'>
          <div className=''>
            {/* Share Options */}
            <div
              className='cursor-pointer border border-[#232323] rounded-2xl p-8 flex flex-col items-center justify-center transition-shadow hover:shadow-md hover:border-[#313131] group bg-[#232323]'
              onClick={() => {
                const publicUrl = `${window.location.origin}/invoice/${invoice._id}`;
                console.log('🚀 publicUrl:', publicUrl);

                navigator.clipboard.writeText(publicUrl);
                toast.success('Invoice link copied!');
              }}
            >
              <LinkIcon className='h-8 w-8 mb-4 text-[#8b8b8b] group-hover:text-white' />
              <div className='font-bold text-lg mb-1 text-center text-white'>Copy link</div>
              <div className='text-center text-[#8b8b8b] text-base'>
                Share a link to this invoice
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant='outline'
            className='bg-[#232323] text-white border border-[#313131] hover:bg-[#232323]/80'
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
              className='bg-[#313131] text-white border border-[#313131] hover:bg-[#232323]/80'
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
          <Invoice invoice={transformInvoiceForPDF(invoice)} />
        </div>
      </div>
    </Dialog>
  );
}
