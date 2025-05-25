'use client';

import InvoiceSheet from '@/components/InvoiceSheet/InvoiceSheet';
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
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { newRequest } from '@/utils/newRequest';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { MoreHorizontal } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { FiSidebar } from 'react-icons/fi';
import { toast } from 'sonner';
import InvoicePreview2 from './InvoicePreview2';

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

function getStatusBadge(status: string) {
  console.log('🚀 status:', status);
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

function getCustomerAvatar(name: string) {
  const initial = name?.[0]?.toUpperCase() || 'A';
  return (
    <span className='inline-flex items-center justify-center h-6 w-6 rounded-full bg-slate-100 text-slate-600 font-medium mr-2 text-xs'>
      {initial}
    </span>
  );
}

const Bills = () => {
  const [search, setSearch] = useState('');
  const [editingInvoice, setEditingInvoice] = useState<any>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: 'delete' | 'cancel';
    invoiceId: string;
  } | null>(null);
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  console.log('🚀 selectedInvoice:', selectedInvoice);
  const {
    data: invoices,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const response = await newRequest.get('/invoices2');
      return response.data;
    },
  });

  const markAsPaidMutation = useMutation({
    mutationFn: async ({ invoiceId, paymentDate }: { invoiceId: string; paymentDate: Date }) => {
      const response = await newRequest.post(`/invoices2/${invoiceId}/paid`, {
        paymentDate: paymentDate.toISOString(),
        paymentMethod: 'bank_transfer',
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice marked as paid');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to mark invoice as paid');
    },
  });

  const cancelInvoiceMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      const response = await newRequest.put(`/invoices2/${invoiceId}/status`, {
        status: 'cancelled',
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice cancelled successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to cancel invoice');
    },
  });

  const deleteInvoiceMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      const response = await newRequest.delete(`/invoices2/${invoiceId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete invoice');
    },
  });

  // Update selectedInvoice when invoices data changes
  useEffect(() => {
    if (selectedInvoice && invoices?.data?.invoices) {
      const updatedInvoice = invoices.data.invoices.find((inv: any) => {
        return inv._id === selectedInvoice._id;
      });
      if (updatedInvoice) {
        setSelectedInvoice(updatedInvoice);
      }
    }
  }, [invoices?.data?.invoices, selectedInvoice]);

  const invoiceList = invoices?.data?.invoices || [];

  // Calculate Open invoices (status: 'unpaid' or 'open')
  const openInvoices = invoiceList.filter((inv: any) => {
    return inv.status?.toLowerCase() === 'unpaid' || inv.status?.toLowerCase() === 'open';
  });
  const openAmount = openInvoices.reduce((sum: number, inv: any) => {
    return sum + (inv.totals?.total || 0);
  }, 0);

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    if (!search) return invoiceList;
    return invoiceList.filter((inv: any) => {
      return (
        inv.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) ||
        inv.customer?.name?.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [invoiceList, search]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const onRefresh = () => {
    // Add any additional refresh logic here if needed
  };

  const handleConfirmAction = () => {
    if (!pendingAction) return;

    if (pendingAction.type === 'delete') {
      deleteInvoiceMutation.mutate(pendingAction.invoiceId);
    } else {
      cancelInvoiceMutation.mutate(pendingAction.invoiceId);
    }

    setShowConfirmDialog(false);
    setPendingAction(null);
  };

  if (error) return <div>Error loading invoices</div>;

  return (
    <div>
      <motion.div
        className='flex items-center justify-between px-4 py-2 border-b border-[#E4E4E7] dark:border-[#232428]'
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          duration: 0.6,
          ease: [0.4, 0, 0.2, 1],
          delay: 0.1,
        }}
      >
        <div className='flex items-center gap-2'>
          <Button
            variant='ghost'
            size='icon'
            className='text-[#3F3F46]/60 dark:text-[#8b8b8b] hover:text-[#3F3F46] dark:hover:text-white'
            onClick={toggleSidebar}
          >
            <FiSidebar size={20} />
          </Button>
          <h1 className='text-lg font-semibold text-[#121212] dark:text-white'>Invoices</h1>
        </div>
        <div className='flex items-center gap-2'></div>
      </motion.div>
      <div className='flex h-full bg-white dark:bg-[#1A1A1A]'>
        <motion.div
          className='flex-1 py-4 px-4 overflow-hidden'
          animate={{
            marginRight: !isMobile && selectedInvoice ? '600px' : '0',
            transition: { duration: 0.3, ease: 'easeInOut' },
          }}
        >
          {/* Invoice Table */}
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
                  <th className='px-2 py-3 text-left text-[#121212] dark:text-slate-300 font-medium tracking-wide w-[60px]'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-100 dark:divide-[#232428]'>
                {filteredInvoices.map((invoice: any) => {
                  return (
                    <tr
                      key={invoice._id}
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
                                ? 'in 1 month'
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
                        {formatCurrency(
                          invoice.totals?.total || 0,
                          invoice.settings?.currency || 'CAD',
                        )}
                      </td>
                      <td className='px-4 py-3 text-[#121212] dark:text-slate-300'>
                        {invoice.issueDate ? formatDate(invoice.issueDate) : '--'}
                      </td>
                      <td className='px-2 py-3 w-[60px]'>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              className='p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-[#232428] transition-colors duration-150'
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
                              invoice.status?.toLowerCase() !== 'paid' && (
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
                                            markAsPaidMutation.mutate({
                                              invoiceId: invoice._id,
                                              paymentDate: date,
                                            });
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
                                      setPendingAction({
                                        type: 'cancel',
                                        invoiceId: invoice._id,
                                      });
                                      setShowConfirmDialog(true);
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
                                    setPendingAction({
                                      type: 'delete',
                                      invoiceId: invoice._id,
                                    });
                                    setShowConfirmDialog(true);
                                  }
                                }}
                              >
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
        {selectedInvoice &&
          (isMobile ? (
            <Sheet
              open={!!selectedInvoice}
              onOpenChange={() => {
                return setSelectedInvoice(null);
              }}
            >
              <SheetContent side='right' className='w-full sm:max-w-lg p-0'>
                <SheetHeader className='sr-only'>
                  <SheetTitle>Invoice Preview</SheetTitle>
                </SheetHeader>
                <InvoicePreview2
                  selectedInvoice={selectedInvoice}
                  setSelectedInvoice={setSelectedInvoice}
                  setEditingInvoice={setEditingInvoice}
                />
              </SheetContent>
            </Sheet>
          ) : (
            <motion.div
              className='fixed right-0 top-[53px] h-[calc(100vh-55px)] w-[600px] bg-white dark:bg-[#1A1A1A]'
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <InvoicePreview2
                selectedInvoice={selectedInvoice}
                setSelectedInvoice={setSelectedInvoice}
                setEditingInvoice={setEditingInvoice}
              />
            </motion.div>
          ))}

        {editingInvoice && (
          <InvoiceSheet
            open={!!editingInvoice}
            onOpenChange={setEditingInvoice}
            existingInvoice={editingInvoice}
          />
        )}
      </div>
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction?.type === 'delete'
                ? 'This action cannot be undone. This will permanently delete the invoice.'
                : 'This will cancel the invoice. This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              className='bg-red-600 hover:bg-red-700'
            >
              {pendingAction?.type === 'delete' ? 'Delete' : 'Cancel Invoice'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Bills;
