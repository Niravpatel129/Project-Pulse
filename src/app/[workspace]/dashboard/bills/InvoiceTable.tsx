import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { MoreHorizontal } from 'lucide-react';

const TABLE_HEADERS = [
  { label: 'Invoice', className: 'px-4 py-3' },
  { label: 'Status', className: 'px-4 py-3' },
  { label: 'Due Date', className: 'px-4 py-3' },
  { label: 'Customer', className: 'px-4 py-3' },
  { label: 'Amount', className: 'px-4 py-3' },
  { label: 'Issue Date', className: 'px-4 py-3' },
  { label: 'Actions', className: 'px-2 py-3 w-[80px]' },
];

function formatCurrency(amount: number, currency: string = 'CAD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleString('en-US', { month: 'short', day: 'numeric' });
}

function getRelativeTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return `overdue ${Math.abs(diffDays)} days`;
  } else if (diffDays === 0) {
    return 'due today';
  } else if (diffDays === 1) {
    return 'due tomorrow';
  } else if (diffDays < 7) {
    return `in ${diffDays} days`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `in ${weeks} ${weeks === 1 ? 'week' : 'weeks'}`;
  } else {
    const months = Math.floor(diffDays / 30);
    return `in ${months} ${months === 1 ? 'month' : 'months'}`;
  }
}

function formatDateTime(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function getStatusBadge(status: string) {
  if (status === 'Overdue')
    return (
      <span className='bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide'>
        Overdue
      </span>
    );
  if (status === 'Draft' || status === 'draft')
    return (
      <span className='bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide'>
        Draft
      </span>
    );
  if (status === 'Paid' || status === 'paid')
    return (
      <span className='bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-400 px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide'>
        Paid
      </span>
    );
  if (status === 'Cancelled' || status === 'cancelled')
    return (
      <span className='bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide'>
        Cancelled
      </span>
    );
  return (
    <span className='bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-400 px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide'>
      Unpaid
    </span>
  );
}

export const InvoiceSkeleton = () => {
  return (
    <div className='overflow-x-auto rounded-lg border border-slate-100 dark:border-[#232428] shadow-sm'>
      <table className='min-w-full text-sm'>
        <thead className='!font-normal'>
          <tr className='divide-x divide-slate-100 dark:divide-[#232428] border-b border-slate-100 dark:border-[#232428] dark:bg-[#232428]'>
            {TABLE_HEADERS.map((header, index) => {
              return (
                <th
                  key={index}
                  className={`${header.className} text-left text-[#121212] dark:text-slate-300  tracking-wide font-light`}
                >
                  {header.label}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className='divide-y divide-slate-100 dark:divide-[#232428]'>
          {[...Array(5)].map((_, index) => {
            return (
              <tr key={index} className='h-[57px] divide-x divide-slate-100 dark:divide-[#232428]'>
                <td className='px-4 py-3'>
                  <Skeleton className='h-4 w-24' />
                </td>
                <td className='px-4 py-3'>
                  <Skeleton className='h-5 w-16 rounded-full' />
                </td>
                <td className='px-4 py-3'>
                  <div className='space-y-1'>
                    <Skeleton className='h-4 w-20' />
                    <Skeleton className='h-3 w-16' />
                  </div>
                </td>
                <td className='px-4 py-3'>
                  <Skeleton className='h-4 w-32' />
                </td>
                <td className='px-4 py-3'>
                  <Skeleton className='h-4 w-20' />
                </td>
                <td className='px-4 py-3'>
                  <Skeleton className='h-4 w-16' />
                </td>
                <td className='px-2 py-3'>
                  <Skeleton className='h-8 w-8 rounded-md' />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

interface InvoiceTableProps {
  invoices: any[];
  selectedInvoice: any;
  setSelectedInvoice: (invoice: any) => void;
  setEditingInvoice: (invoice: any) => void;
  onMarkAsPaid: (invoiceId: string, paymentDate: Date) => void;
  onCancel: (invoiceId: string) => void;
  onDelete: (invoiceId: string) => void;
  isLoading: boolean;
  visibleColumns: Record<string, boolean>;
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
}: InvoiceTableProps) => {
  if (isLoading) {
    return <InvoiceSkeleton />;
  }

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
            return setEditingInvoice({});
          }}
        >
          Create invoice
        </Button>
      </div>
    );
  }

  return (
    <div className='overflow-x-auto rounded-lg border border-slate-100 dark:border-[#232428] shadow-sm'>
      <table className='min-w-full text-sm'>
        <thead>
          <tr className='divide-x divide-slate-100 dark:divide-[#232428] border-b border-slate-100 dark:border-[#232428] dark:bg-[#232428] !font-normal'>
            {TABLE_HEADERS.map((header, index) => {
              if (!visibleColumns[header.label]) return null;
              return (
                <th
                  key={index}
                  className={`${header.className} text-left text-[#121212] dark:text-slate-300 tracking-wide font-medium`}
                >
                  {header.label}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className='divide-y divide-slate-100 dark:divide-[#232428]'>
          {invoices.map((invoice: any) => {
            return (
              <motion.tr
                key={invoice._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className={`h-[57px] divide-x divide-slate-100 dark:divide-[#232428] cursor-pointer transition-colors duration-150 hover:bg-slate-50/50 dark:hover:bg-[#232428] ${
                  selectedInvoice?._id === invoice._id ? 'bg-slate-50 dark:bg-[#232428]' : ''
                }`}
                onClick={() => {
                  return setSelectedInvoice(invoice);
                }}
              >
                {visibleColumns['Invoice'] && (
                  <td className='px-4 py-3'>
                    <div className='flex flex-col gap-1'>
                      <span className='text-[#121212] dark:text-white font-medium'>
                        {invoice.invoiceNumber}
                      </span>
                    </div>
                  </td>
                )}
                {visibleColumns['Status'] && (
                  <td className='px-4 py-3'>{getStatusBadge(invoice.status)}</td>
                )}
                {visibleColumns['Due Date'] && (
                  <td className='px-4 py-3 text-[#121212] dark:text-slate-300 h-full'>
                    {invoice.dueDate ? (
                      <div className='h-full'>
                        <span className='font-medium'>{formatDate(invoice.dueDate)}</span>
                        <div className='text-xs text-muted-foreground'>
                          {getRelativeTime(invoice.dueDate)}
                        </div>
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>
                )}
                {visibleColumns['Customer'] && (
                  <td className='px-4 py-3'>
                    <div className='flex flex-col'>
                      <span className='text-[#121212] dark:text-white font-medium'>
                        {invoice.customer?.name || '-'}
                      </span>
                      <span className='text-xs text-muted-foreground'>
                        {invoice.customer?.email || '-'}
                      </span>
                    </div>
                  </td>
                )}
                {visibleColumns['Amount'] && (
                  <td className='px-4 py-3'>
                    <span className='text-[#121212] dark:text-white font-medium'>
                      {formatCurrency(invoice.totals?.total || 0, invoice.currency)}
                    </span>
                  </td>
                )}
                {visibleColumns['Issue Date'] && (
                  <td className='px-4 py-3'>
                    <span className='text-[#121212] dark:text-slate-300 font-medium'>
                      {invoice.issueDate ? formatDate(invoice.issueDate) : '-'}
                    </span>
                  </td>
                )}
                {visibleColumns['Actions'] && (
                  <td className='px-2 py-3'>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
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
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingInvoice(invoice);
                          }}
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onMarkAsPaid(invoice._id, new Date());
                          }}
                        >
                          Mark as paid
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onCancel(invoice._id);
                          }}
                        >
                          Cancel
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(invoice._id);
                          }}
                          className='text-red-600'
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                )}
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
