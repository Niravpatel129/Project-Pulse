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
import { DownloadCloud, Link as LinkIcon } from 'lucide-react';
import { useRef } from 'react';
import { toast } from 'sonner';

type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'unpaid' | 'open';

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
  status: InvoiceStatus;
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
  total: number;
  remainingBalance?: number;
  payments?: Array<{
    _id: string;
    amount: number;
    date: string;
    method: string;
    memo?: string;
    status?: string;
  }>;
}

interface SendInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice;
}

// Utility function to transform invoice data for PDF generation
export function transformInvoiceForPDF(invoice: Invoice) {
  // Calculate item totals first
  const itemsWithTotals = invoice.items.map((item, index) => {
    const itemTotal = item.price * item.quantity;
    return {
      id: `item-${index}`,
      name: item.name,
      description: item.description,
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
  // Calculate tax as percentage of subtotal
  const taxRate = invoice.items[0]?.tax || 0; // Get tax rate from first item
  const tax = (subtotal - discount) * (taxRate / 100);
  const total = subtotal - discount + tax;

  return {
    _id: invoice._id,
    id: invoice._id,
    invoiceNumber: invoice.invoiceNumber,
    clientName: invoice.client?.user?.name || '',
    clientId: invoice.client?._id || '',
    status: invoice.status as InvoiceStatus,
    items: itemsWithTotals,
    subtotal,
    discount,
    tax,
    total,
    dueDate: new Date().toISOString(),
    issueDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes: '',
    terms: '',
    paymentMethod: '',
    paymentDate: null,
    currency: invoice.businessInfo?.currency || 'CAD',
    createdBy: '',
    requireDeposit: false,
    depositPercentage: 0,
    teamNotes: '',
    client: {
      name: invoice.client?.user?.name || '',
      email: invoice.client?.user?.email || '',
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
      taxId: '',
      website: '',
    },
    businessInfo: invoice.businessInfo,
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
        className='sm:max-w-[700px] bg-[#181818] text-white border-[#232323]'
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
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
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

            {/* Download PDF */}
            <div
              className='cursor-pointer border border-[#232323] rounded-2xl p-8 flex flex-col items-center justify-center transition-shadow hover:shadow-md hover:border-[#313131] group bg-[#232323]'
              onClick={handleDownloadPDF}
            >
              <DownloadCloud className='h-8 w-8 mb-4 text-[#8b8b8b] group-hover:text-white' />
              <div className='font-bold text-lg mb-1 text-center text-white'>Download PDF</div>
              <div className='text-center text-[#8b8b8b] text-base'>
                Your invoice all in one document
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
