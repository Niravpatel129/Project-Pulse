import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { newRequest } from '@/utils/newRequest';
import { motion } from 'framer-motion';
import { MoreHorizontal } from 'lucide-react';

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
        <thead>
          <tr className='divide-x divide-slate-100 dark:divide-[#232428] border-b border-slate-100 dark:border-[#232428] dark:bg-[#232428]'>
            <th className='px-4 py-3 text-left text-[#121212] dark:text-slate-300 font-medium tracking-wide'>
              Invoice
            </th>
            <th className='px-4 py-3 text-left text-[#121212] dark:text-slate-300 font-medium tracking-wide'>
              Status
            </th>
            <th className='px-4 py-3 text-left text-[#121212] dark:text-slate-300 font-medium tracking-wide'>
              Due Date
            </th>
            <th className='px-4 py-3 text-left text-[#121212] dark:text-slate-300 font-medium tracking-wide'>
              Customer
            </th>
            <th className='px-4 py-3 text-left text-[#121212] dark:text-slate-300 font-medium tracking-wide'>
              Amount
            </th>
            <th className='px-4 py-3 text-left text-[#121212] dark:text-slate-300 font-medium tracking-wide'>
              Issue Date
            </th>
            <th className='px-2 py-3 text-left text-[#121212] dark:text-slate-300 font-medium tracking-wide w-[80px]'>
              Actions
            </th>
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
          <tr className='divide-x divide-slate-100 dark:divide-[#232428] border-b border-slate-100 dark:border-[#232428] dark:bg-[#232428]'>
            <th className='px-4 py-3 text-left text-[#121212] dark:text-slate-300 font-medium tracking-wide'>
              Invoice
            </th>
            <th className='px-4 py-3 text-left text-[#121212] dark:text-slate-300 font-medium tracking-wide'>
              Status
            </th>
            <th className='px-4 py-3 text-left text-[#121212] dark:text-slate-300 font-medium tracking-wide'>
              Due Date
            </th>
            <th className='px-4 py-3 text-left text-[#121212] dark:text-slate-300 font-medium tracking-wide'>
              Customer
            </th>
            <th className='px-4 py-3 text-left text-[#121212] dark:text-slate-300 font-medium tracking-wide'>
              Amount
            </th>
            <th className='px-4 py-3 text-left text-[#121212] dark:text-slate-300 font-medium tracking-wide'>
              Issue Date
            </th>
            <th className='px-2 py-3 text-left text-[#121212] dark:text-slate-300 font-medium tracking-wide w-[80px]'>
              Actions
            </th>
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
                <td className='px-4 py-3'>
                  <div className='flex flex-col gap-1'>
                    <span className='font-medium text-[#121212] dark:text-white'>
                      {invoice.invoiceNumber}
                    </span>
                  </div>
                </td>
                <td className='px-4 py-3'>{getStatusBadge(invoice.status)}</td>
                <td className='px-4 py-3 text-[#121212] dark:text-slate-300 h-full'>
                  {invoice.dueDate ? (
                    <div className='h-full'>
                      {formatDate(invoice.dueDate)}
                      <div className='text-slate-400 dark:text-slate-500 ml-0 text-xs'>
                        {invoice.dueDate > new Date().toISOString()
                          ? getRelativeTime(invoice.dueDate)
                          : 'overdue ' +
                            formatDate(invoice.dueDate) +
                            ' ' +
                            formatDate(new Date().toISOString())}
                      </div>
                    </div>
                  ) : (
                    '--'
                  )}
                </td>
                <td className='px-4 py-3 text-[#121212] dark:text-slate-300 h-full'>
                  <div className='h-full flex items-center'>
                    <span>{invoice.customer?.name}</span>
                  </div>
                </td>
                <td className='px-4 py-3 font-medium text-[#121212] dark:text-white'>
                  <span
                    className={invoice.status?.toLowerCase() === 'cancelled' ? 'line-through' : ''}
                  >
                    {formatCurrency(
                      invoice.totals?.total || 0,
                      invoice.settings?.currency || 'CAD',
                    )}
                  </span>
                </td>
                <td className='px-4 py-3 text-[#121212] dark:text-slate-300'>
                  {invoice.issueDate ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>{formatDate(invoice.issueDate)}</TooltipTrigger>
                        <TooltipContent>
                          <p>{formatDateTime(invoice.issueDate)}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    '--'
                  )}
                </td>
                <td className='px-2 py-3 w-[60px]'>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className='p-1.5 hover:bg-slate-100 dark:hover:bg-[#232428] transition-colors duration-150'
                        onClick={(e) => {
                          return e.stopPropagation();
                        }}
                        aria-label='Actions'
                      >
                        <MoreHorizontal className='w-4 h-4 text-slate-400 dark:text-slate-500' />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      <DropdownMenuItem>Open invoice</DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(
                            `${window.location.origin}/invoice/${invoice._id}`,
                          );
                        }}
                      >
                        Copy link
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            const response = await newRequest.get(
                              `/invoices2/${invoice._id}/download`,
                              { responseType: 'blob' },
                            );

                            // Create a blob from the PDF data
                            const pdfBlob = new Blob([response.data], {
                              type: 'application/pdf',
                            });

                            // Create a URL for the blob
                            const url = window.URL.createObjectURL(pdfBlob);

                            // Create a temporary link element
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = `Invoice-${invoice.invoiceNumber}.pdf`;

                            // Append to body, click, and remove
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);

                            // Clean up the URL object
                            window.URL.revokeObjectURL(url);
                          } catch (error) {
                            console.error('Error downloading PDF:', error);
                          }
                        }}
                      >
                        Download
                      </DropdownMenuItem>
                      {invoice.status?.toLowerCase() !== 'cancelled' &&
                        invoice.status?.toLowerCase() !== 'paid' &&
                        invoice.status?.toLowerCase() !== 'draft' && (
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger
                              onClick={(e) => {
                                return e.stopPropagation();
                              }}
                            >
                              Mark as paid
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent className='p-0'>
                              <div
                                className='p-2'
                                onClick={(e) => {
                                  return e.stopPropagation();
                                }}
                              >
                                <Calendar
                                  mode='single'
                                  onSelect={(date) => {
                                    if (date && invoice._id) {
                                      onMarkAsPaid(invoice._id, date);
                                    }
                                  }}
                                  disabled={(date) => {
                                    return date > new Date();
                                  }}
                                />
                              </div>
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>
                        )}
                      {invoice.status?.toLowerCase() !== 'cancelled' &&
                        invoice.status?.toLowerCase() !== 'paid' && (
                          <DropdownMenuItem
                            className='text-red-600'
                            onClick={(e) => {
                              e.stopPropagation();
                              if (invoice._id) {
                                onCancel(invoice._id);
                              }
                            }}
                          >
                            Cancel
                          </DropdownMenuItem>
                        )}
                      {invoice.status?.toLowerCase() === 'cancelled' && (
                        <DropdownMenuItem
                          className='text-red-600'
                          onClick={(e) => {
                            e.stopPropagation();
                            if (invoice._id) {
                              onDelete(invoice._id);
                            }
                          }}
                        >
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
