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
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useSidebar } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { newRequest } from '@/utils/newRequest';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Calendar, FilterIcon, Ticket, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FiSidebar, FiX } from 'react-icons/fi';
import { VscListFilter, VscSearch } from 'react-icons/vsc';
import { toast } from 'sonner';
import InvoiceCards from './InvoiceCards';
import InvoicePreview2 from './InvoicePreview2';
import { InvoiceTable } from './InvoiceTable';

const Bills = () => {
  const [editingInvoice, setEditingInvoice] = useState<any>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: 'delete' | 'cancel';
    invoiceId: string;
  } | null>(null);
  const [activeFilters, setActiveFilters] = useState<{
    dueDate?: string;
    customer?: string;
    status?: string;
  }>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleColumns, setVisibleColumns] = useState({
    Invoice: true,
    Status: true,
    'Due Date': true,
    Customer: true,
    Amount: true,
    'Issue Date': true,
    Actions: true,
  });
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

  // Filter invoices based on active filters
  const filteredInvoices = invoiceList.filter((invoice: any) => {
    // Search query filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        invoice.invoiceNumber?.toLowerCase().includes(searchLower) ||
        invoice.customer?.name?.toLowerCase().includes(searchLower) ||
        invoice.customer?.email?.toLowerCase().includes(searchLower) ||
        invoice.status?.toLowerCase().includes(searchLower) ||
        invoice.totals?.total?.toString().includes(searchQuery);

      if (!matchesSearch) return false;
    }

    // Due Date filter
    if (activeFilters.dueDate) {
      const dueDate = new Date(invoice.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      switch (activeFilters.dueDate) {
        case 'today':
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          if (dueDate < today || dueDate >= tomorrow) return false;
          break;
        case 'this_week':
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 7);
          if (dueDate < weekStart || dueDate >= weekEnd) return false;
          break;
        case 'this_month':
          const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
          const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          if (dueDate < monthStart || dueDate > monthEnd) return false;
          break;
      }
    }

    // Customer filter
    if (activeFilters.customer && activeFilters.customer !== 'all') {
      if (invoice.customer?.name !== activeFilters.customer) return false;
    }

    // Status filter
    if (activeFilters.status) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDate = new Date(invoice.dueDate);

      if (activeFilters.status === 'overdue') {
        // An invoice is overdue if:
        // 1. It's not paid
        // 2. It has a due date
        // 3. The due date is in the past
        // and not cancelled or draft
        if (
          invoice.status?.toLowerCase() === 'paid' ||
          !invoice.dueDate ||
          dueDate >= today ||
          invoice.status?.toLowerCase() === 'cancelled' ||
          invoice.status?.toLowerCase() === 'draft'
        ) {
          return false;
        }
      } else {
        // For other statuses, check exact match
        if (invoice.status?.toLowerCase() !== activeFilters.status.toLowerCase()) {
          return false;
        }
      }
    }

    return true;
  });

  // Calculate Open invoices (status: 'unpaid' or 'open')
  const openInvoices = filteredInvoices.filter((inv: any) => {
    return inv.status?.toLowerCase() === 'unpaid' || inv.status?.toLowerCase() === 'open';
  });
  const openAmount = openInvoices.reduce((sum: number, inv: any) => {
    return sum + (inv.totals?.total || 0);
  }, 0);

  // Calculate Overdue invoices
  const overdueInvoices = invoiceList.filter((inv: any) => {
    if (inv.status?.toLowerCase() === 'paid' || !inv.dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(inv.dueDate);
    return dueDate < today;
  });
  const overdueAmount = overdueInvoices.reduce((sum: number, inv: any) => {
    return sum + (inv.totals?.total || 0);
  }, 0);

  // Calculate Paid invoices
  const paidInvoices = invoiceList.filter((inv: any) => {
    return inv.status?.toLowerCase() === 'paid';
  });
  const paidAmount = paidInvoices.reduce((sum: number, inv: any) => {
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

  const handleFilterChange = (type: 'dueDate' | 'customer' | 'status', value: string | null) => {
    setActiveFilters((prev) => {
      if (value === null) {
        const { [type]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [type]: value };
    });
  };

  const removeFilter = (type: 'dueDate' | 'customer' | 'status') => {
    handleFilterChange(type, null);
  };

  const toggleColumn = (column: string) => {
    setVisibleColumns((prev) => {
      return {
        ...prev,
        [column]: !prev[column],
      };
    });
  };

  if (error) return <div>Error loading invoices</div>;

  return (
    <div>
      <div className='flex items-center justify-between px-4 pb-2 pt-3 border-b border-[#E4E4E7] dark:border-[#232428] relative z-[1] bg-background'>
        <div className='flex items-center gap-2 h-full'>
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
      </div>
      <div className='flex h-full bg-white dark:bg-[#1A1A1A]'>
        <motion.div
          className='flex-1 py-4 px-4 overflow-hidden'
          animate={{
            marginRight: !isMobile && selectedInvoice ? '600px' : '0',
            transition: { duration: 0.3, ease: 'easeInOut' },
          }}
        >
          <div className='mb-4'>
            <InvoiceCards
              onFilter={(status) => {
                return handleFilterChange('status', status);
              }}
              openAmount={openAmount}
              openCount={openInvoices.length}
              paidAmount={paidAmount}
              paidCount={paidInvoices.length}
              overdueAmount={overdueAmount}
              overdueCount={overdueInvoices.length}
            />
          </div>
          <div className='flex items-center justify-between w-full'>
            <div className='flex items-center gap-1 mb-4 h-9 w-full'>
              <div className='relative flex items-center max-w-xs w-full'>
                <VscSearch className='w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-[#3F3F46]/60 dark:text-[#8b8b8b]' />
                <Input
                  className='rounded-none pl-7 pr-10 border-slate-100 dark:border-[#232428]'
                  placeholder='Search or filter'
                  value={searchQuery}
                  onChange={(e) => {
                    return setSearchQuery(e.target.value);
                  }}
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type='button'
                      className='absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none'
                      aria-label='Filter'
                    >
                      <VscListFilter className='w-4 h-4' />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className='text-xs w-[240px]'>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <Calendar className='mr-2 w-4 h-4' /> Due Date
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem
                          onClick={() => {
                            return handleFilterChange('dueDate', 'today');
                          }}
                        >
                          Today
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            return handleFilterChange('dueDate', 'this_week');
                          }}
                        >
                          This Week
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            return handleFilterChange('dueDate', 'this_month');
                          }}
                        >
                          This Month
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            return handleFilterChange('dueDate', 'this_year');
                          }}
                        >
                          This Year
                        </DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <User className='mr-2 w-4 h-4' /> Customer
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem
                          onClick={() => {
                            return handleFilterChange('customer', 'all');
                          }}
                        >
                          All Customers
                        </DropdownMenuItem>
                        {invoiceList &&
                          Array.from(
                            new Set(
                              invoiceList
                                .map((inv) => {
                                  return inv.customer?.name;
                                })
                                .filter((name): name is string => {
                                  return Boolean(name);
                                }),
                            ),
                          ).map((name: string) => {
                            return (
                              <DropdownMenuItem
                                key={name}
                                onClick={() => {
                                  return handleFilterChange('customer', String(name));
                                }}
                              >
                                {String(name)}
                              </DropdownMenuItem>
                            );
                          })}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <Ticket className='mr-2 w-4 h-4' /> Status
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem
                          onClick={() => {
                            return handleFilterChange('status', 'paid');
                          }}
                        >
                          Paid
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            return handleFilterChange('status', 'unpaid');
                          }}
                        >
                          Unpaid
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            return handleFilterChange('status', 'overdue');
                          }}
                        >
                          Overdue
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            return handleFilterChange('status', 'draft');
                          }}
                        >
                          Draft
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            return handleFilterChange('status', 'cancelled');
                          }}
                        >
                          Cancelled
                        </DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {/* Active Filters */}
              <div className='flex items-center gap-2 h-full'>
                {Object.entries(activeFilters).map(([type, value]) => {
                  return (
                    <div
                      key={`${type}-${value}`}
                      className='bg-[#e5e4e0] rounded-none text-[#878787] p-2 text-sm cursor-pointer group flex items-center gap-1 h-full hover:bg-[#d4d3cf] transition-colors dark:bg-[#1c1c1c] dark:border'
                      onClick={() => {
                        return removeFilter(type as 'dueDate' | 'customer' | 'status');
                      }}
                    >
                      <FiX className='w-0 h-4 group-hover:w-4 transition-all duration-300' />
                      <span className='text-xs group-hover:text-[#878787] font-medium'>
                        {type === 'dueDate' && value === 'today' && 'Due Today'}
                        {type === 'dueDate' && value === 'this_week' && 'Due This Week'}
                        {type === 'dueDate' && value === 'this_month' && 'Due This Month'}
                        {type === 'dueDate' && value === 'this_year' && 'Due This Year'}
                        {type === 'customer' && value === 'all' && 'All Customers'}
                        {type === 'customer' && value !== 'all' && `Customer: ${value}`}
                        {type === 'status' && value.charAt(0).toUpperCase() + value.slice(1)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className='w-9 h-9 p-0' variant='outline'>
                    <FilterIcon className='w-4 h-4' />
                    <span className='sr-only'>Filter</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='w-48'>
                  <DropdownMenuItem className='font-medium text-sm text-muted-foreground'>
                    Visible Columns
                  </DropdownMenuItem>
                  {Object.entries(visibleColumns).map(([column, isVisible]) => {
                    return (
                      <DropdownMenuItem
                        key={column}
                        className='flex items-center gap-2'
                        onSelect={(e) => {
                          e.preventDefault();
                          toggleColumn(column);
                        }}
                      >
                        <Checkbox
                          checked={isVisible}
                          onCheckedChange={() => {
                            return toggleColumn(column);
                          }}
                        />
                        <span>{column}</span>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <InvoiceTable
            invoices={filteredInvoices}
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
            visibleColumns={visibleColumns}
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
