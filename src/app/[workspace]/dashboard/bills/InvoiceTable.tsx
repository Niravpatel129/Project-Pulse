import { AddCustomerDialog } from '@/app/[workspace]/dashboard/customers/components/AddCustomerDialog';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { DateTooltip } from '@/components/ui/date-tooltip';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import InvoicePreviewActions from './InvoicePreviewActions';

interface Invoice {
  _id: string;
  invoiceNumber: string;
  status: string;
  dueDate?: string;
  customer?: {
    id: {
      _id: string;
      user: {
        name: string;
        email: string;
      };
      contact?: {
        firstName?: string;
        lastName?: string;
      };
      phone?: string;
      mobile?: string;
      fax?: string;
      tollFree?: string;
      taxId?: string;
      accountNumber?: string;
      address?: {
        street?: string;
        city?: string;
        state?: string;
        country?: string;
        zip?: string;
      };
      shippingAddress?: {
        street?: string;
        city?: string;
        state?: string;
        country?: string;
        zip?: string;
      };
      website?: string;
      internalNotes?: string;
      customFields?: Record<string, any>;
      isActive: boolean;
    };
  };
  totals?: {
    total: number;
  };
  currency: string;
  issueDate?: string;
}

const TABLE_HEADERS = [
  { id: 'invoice', label: 'Invoice', className: 'px-4 py-3 w-[150px]' },
  { id: 'status', label: 'Status', className: 'px-4 py-3 w-[150px]' },
  { id: 'dueDate', label: 'Due Date', className: 'px-4 py-3 w-[150px]' },
  { id: 'customer', label: 'Customer', className: 'px-4 py-3 w-[250px]' },
  { id: 'amount', label: 'Amount', className: 'px-4 py-3 w-[120px]' },
  { id: 'issueDate', label: 'Issue Date', className: 'px-4 py-3 w-[150px]' },
  { id: 'actions', label: 'Actions', className: 'px-4 py-3 w-[80px]' },
];

function formatCurrency(amount: number, currency: string = 'CAD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getRelativeTime(date: string) {
  const now = new Date();
  const then = new Date(date);
  const diff = then.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  if (days === -1) return 'Due yesterday';
  if (days > 0) return `Due in ${days} days`;
  return `${Math.abs(days)} days overdue`;
}

function getStatusBadge(status: string) {
  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    overdue: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',
    open: 'bg-yellow-100 text-yellow-800',
    sent: 'bg-blue-100 text-blue-800',
    partially_paid: 'bg-purple-100 text-purple-800',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        statusColors[status as keyof typeof statusColors] || 'bg-gray-100'
      }`}
    >
      {status
        .replace(/_/g, ' ')
        .split(' ')
        .map((word) => {
          return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(' ')}
    </span>
  );
}

interface InvoiceTableProps {
  invoices: Invoice[];
  selectedInvoice: Invoice | null;
  setSelectedInvoice: (invoice: Invoice) => void;
  setEditingInvoice: (invoice: Invoice) => void;
  onMarkAsPaid: (invoiceId: string, paymentDate: Date) => void;
  onCancel: (invoiceId: string) => void;
  onDelete: (invoiceId: string) => void;
  isLoading: boolean;
  visibleColumns: Record<string, boolean>;
  onTakePayment?: (invoice: Invoice) => void;
}

export const InvoiceTable = ({
  invoices,
  selectedInvoice,
  setSelectedInvoice,
  setEditingInvoice,
  onMarkAsPaid,
  onCancel,
  onDelete,
  isLoading,
  visibleColumns,
  onTakePayment,
}: InvoiceTableProps) => {
  const [isEditCustomerDialogOpen, setIsEditCustomerDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [columnOrder, setColumnOrder] = useLocalStorage(
    'invoice-column-order',
    TABLE_HEADERS.map((header) => {
      return header.id;
    }),
  );
  const queryClient = useQueryClient();

  const columns = TABLE_HEADERS.map((header) => {
    return {
      id: header.id,
      accessorKey: header.id,
      header: header.label,
      meta: { className: header.className },
      cell: ({ row }: { row: { original: Invoice } }) => {
        const invoice = row.original;
        switch (header.id) {
          case 'invoice':
            return (
              <div className='flex flex-col gap-1 max-w-[150px]'>
                <span className='text-[#121212] dark:text-white font-medium truncate'>
                  {invoice.invoiceNumber}
                </span>
              </div>
            );
          case 'status':
            return getStatusBadge(invoice.status);
          case 'dueDate':
            return invoice.dueDate ? (
              <div className='h-full max-w-[150px]'>
                <DateTooltip date={invoice.dueDate}>
                  <span className='font-medium truncate'>{formatDate(invoice.dueDate)}</span>
                </DateTooltip>
                <div className='text-xs text-muted-foreground truncate'>
                  {getRelativeTime(invoice.dueDate)}
                </div>
              </div>
            ) : (
              '-'
            );
          case 'customer':
            return (
              <div className='flex flex-col max-w-[250px]'>
                <span
                  className='text-[#121212] dark:text-white font-medium text-left truncate hover:underline cursor-pointer'
                  onClick={(e) => {
                    if (invoice.customer?.id) {
                      e.stopPropagation();
                      setEditingCustomer(invoice.customer?.id);
                      setIsEditCustomerDialogOpen(true);
                    }
                  }}
                >
                  {invoice.customer?.id?.user?.name || '-'}
                </span>
                <span className='text-xs text-muted-foreground truncate cursor-pointer'>
                  {invoice.customer?.id?.user?.email || '-'}
                </span>
              </div>
            );
          case 'amount':
            return (
              <span className='text-[#121212] dark:text-white font-medium max-w-[120px] truncate'>
                {formatCurrency(invoice.totals?.total || 0, invoice.currency)}
              </span>
            );
          case 'issueDate':
            return (
              <DateTooltip date={invoice.issueDate}>
                <span className='text-[#121212] dark:text-slate-300 font-medium max-w-[150px] truncate'>
                  {invoice.issueDate ? formatDate(invoice.issueDate) : '-'}
                </span>
              </DateTooltip>
            );
          case 'actions':
            return (
              <InvoicePreviewActions
                invoice={invoice}
                onMarkAsPaid={onMarkAsPaid}
                onCancel={onCancel}
                onDelete={onDelete}
                handleEdit={() => {
                  return setEditingInvoice(invoice);
                }}
                onTakePayment={onTakePayment}
                trigger={
                  <Button
                    variant='ghost'
                    className='h-8 w-8 p-0'
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <MoreHorizontal className='h-4 w-4' />
                    <span className='sr-only'>Open menu</span>
                  </Button>
                }
              />
            );
          default:
            return null;
        }
      },
    } as ColumnDef<Invoice>;
  });

  if (invoices.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-24'>
        <h2 className='text-2xl font-semibold mb-2'>No invoices</h2>
        <p className='text-gray-500 mb-6 text-center'>
          You haven&apos;t created any invoices yet.
          <br />
          Go ahead and create your first one.
        </p>
        <Button
          variant='outline'
          onClick={() => {
            return setEditingInvoice({} as any);
          }}
        >
          Create invoice
        </Button>
      </div>
    );
  }

  return (
    <>
      <DataTable
        data={invoices}
        columns={columns}
        visibleColumns={visibleColumns}
        selectedItem={selectedInvoice}
        onSelectItem={setSelectedInvoice}
        isLoading={isLoading}
        emptyState={{
          title: 'No invoices',
          description: "You haven't created any invoices yet.\nGo ahead and create your first one.",
          buttonText: 'Create invoice',
          onButtonClick: () => {
            return setEditingInvoice({} as any);
          },
        }}
        columnOrder={columnOrder}
        onColumnOrderChange={setColumnOrder}
      />
      <AddCustomerDialog
        open={isEditCustomerDialogOpen}
        onOpenChange={setIsEditCustomerDialogOpen}
        initialData={editingCustomer}
        onEdit={(updatedCustomer) => {
          const updatedInvoices = invoices.map((invoice) => {
            if (invoice.customer?.id === updatedCustomer.id) {
              return {
                ...invoice,
                customer: updatedCustomer,
              };
            }
            return invoice;
          });

          queryClient.invalidateQueries({ queryKey: ['invoices'] });

          setIsEditCustomerDialogOpen(false);
          setEditingCustomer(null);
        }}
      />
    </>
  );
};
