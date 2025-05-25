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
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useSidebar } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { newRequest } from '@/utils/newRequest';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { FiSidebar } from 'react-icons/fi';
import { toast } from 'sonner';
import InvoicePreview2 from './InvoicePreview2';
import { InvoiceTable } from './InvoiceTable';

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
  const [editingInvoice, setEditingInvoice] = useState<any>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: 'delete' | 'cancel';
    invoiceId: string;
  } | null>(null);
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const { toggleSidebar } = useSidebar();

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
      <div className='flex items-center justify-between px-4 pb-2 pt-3 border-b border-[#E4E4E7] dark:border-[#232428] relative z-[1] bg-background'>
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
      </div>
      <div className='flex h-full bg-white dark:bg-[#1A1A1A]'>
        <motion.div
          className='flex-1 py-4 px-4 overflow-hidden'
          animate={{
            marginRight: !isMobile && selectedInvoice ? '600px' : '0',
            transition: { duration: 0.3, ease: 'easeInOut' },
          }}
        >
          <InvoiceTable
            invoices={invoiceList}
            selectedInvoice={selectedInvoice}
            setSelectedInvoice={setSelectedInvoice}
            setEditingInvoice={setEditingInvoice}
            onMarkAsPaid={(invoiceId, paymentDate) => {
              markAsPaidMutation.mutate({ invoiceId, paymentDate });
            }}
            onCancel={(invoiceId) => {
              setPendingAction({
                type: 'cancel',
                invoiceId,
              });
              setShowConfirmDialog(true);
            }}
            onDelete={(invoiceId) => {
              setPendingAction({
                type: 'delete',
                invoiceId,
              });
              setShowConfirmDialog(true);
            }}
            isLoading={isLoading}
          />
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
                  onMarkAsPaid={(invoiceId, paymentDate) => {
                    markAsPaidMutation.mutate({ invoiceId, paymentDate });
                  }}
                  onCancel={(invoiceId) => {
                    setPendingAction({
                      type: 'cancel',
                      invoiceId,
                    });
                    setShowConfirmDialog(true);
                  }}
                  onDelete={(invoiceId) => {
                    setPendingAction({
                      type: 'delete',
                      invoiceId,
                    });
                    setShowConfirmDialog(true);
                  }}
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
                onMarkAsPaid={(invoiceId, paymentDate) => {
                  markAsPaidMutation.mutate({ invoiceId, paymentDate });
                }}
                onCancel={(invoiceId) => {
                  setPendingAction({
                    type: 'cancel',
                    invoiceId,
                  });
                  setShowConfirmDialog(true);
                }}
                onDelete={(invoiceId) => {
                  setPendingAction({
                    type: 'delete',
                    invoiceId,
                  });
                  setShowConfirmDialog(true);
                }}
              />
            </motion.div>
          ))}

        <InvoiceSheet
          open={!!editingInvoice}
          onOpenChange={setEditingInvoice}
          existingInvoice={editingInvoice}
        />
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
