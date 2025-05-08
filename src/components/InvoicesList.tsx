import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { newRequest } from '@/utils/newRequest';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { ChevronDown, DownloadCloud, LinkIcon, Plus, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import ProjectManagement from './project/ProjectManagement';

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
  createdBy: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

interface Activity {
  _id: string;
  type: 'created' | 'paid' | 'overdue' | 'updated';
  invoiceNumber: string;
  timestamp: string;
  description: string;
}

interface ApiResponse {
  status: string;
  results: number;
  data: Invoice[];
}

interface ActivitiesResponse {
  status: string;
  data: Activity[];
}

const statusTabs = [
  { key: 'open', label: 'Open' },
  { key: 'draft', label: 'Draft' },
  { key: 'all', label: 'All invoices' },
];

function CreateInvoiceDialog() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleClose = () => {
    setOpen(false);
    queryClient.invalidateQueries({ queryKey: ['invoices'] });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant='outline'
          className='bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 px-5 py-2.5 rounded-xl flex items-center gap-2.5 transition-all duration-200 shadow-sm hover:shadow'
        >
          <Plus className='w-4 h-4' />
          Create an invoice
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-[90vw] h-[90vh] p-0'>
        <DialogTitle className='sr-only'>Create New Invoice</DialogTitle>
        <ProjectManagement onClose={handleClose} initialStatus='draft' />
      </DialogContent>
    </Dialog>
  );
}

export default function InvoicesList() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('all');
  const [perPage, setPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Fetch invoices with React Query
  const {
    data: invoicesData,
    isLoading: isLoadingInvoices,
    error: invoicesError,
  } = useQuery({
    queryKey: ['invoices', activeTab, searchQuery, dateRange],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (activeTab !== 'all') params.status = activeTab;
      if (searchQuery) params.search = searchQuery;
      if (dateRange.from) params.from = dateRange.from;
      if (dateRange.to) params.to = dateRange.to;

      const response = await newRequest.get<ApiResponse>('/invoices', { params });
      return response.data.data;
    },
  });

  // Fetch activities with React Query
  const { data: activities = [] } = useQuery({
    queryKey: ['invoice-activities'],
    queryFn: async () => {
      const response = await newRequest.get<ActivitiesResponse>('/invoices/activities');
      return response.data.data;
    },
  });

  const markAsSentMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      await newRequest.put(`/invoices/${invoiceId}`, { status: 'sent' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice marked as sent');
      setIsSendDialogOpen(false);
      setSelectedInvoice(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to mark invoice as sent');
    },
  });

  const approveInvoiceMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      await newRequest.put(`/invoices/${invoiceId}`, { status: 'open' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice approved');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to approve invoice');
    },
  });

  const deleteInvoiceMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      await newRequest.delete(`/invoices/${invoiceId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete invoice');
    },
  });

  const markAsPaidMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      const response = await newRequest.post(`/invoices/${invoiceId}/paid`, {
        paymentDate: new Date().toISOString(),
        paymentMethod: 'bank_transfer',
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice marked as paid');
    },
    onError: () => {
      toast.error('Failed to mark invoice as paid');
    },
  });

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Handle status filter
  const handleStatusChange = (status: string) => {
    setActiveTab(status);
  };

  // Handle date range filter
  const handleDateRangeChange = (field: 'from' | 'to', value: string) => {
    setDateRange((prev) => {
      return { ...prev, [field]: value };
    });
  };

  // Handle invoice actions
  const handleDeleteInvoice = async (invoiceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      deleteInvoiceMutation.mutate(invoiceId);
    }
  };

  const handleMarkAsPaid = async (invoiceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    markAsPaidMutation.mutate(invoiceId);
  };

  const handleSendInvoice = (invoice: Invoice, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedInvoice(invoice);
    setIsSendDialogOpen(true);
  };

  // Filtered invoices for tab
  const filteredInvoices = (invoicesData || []).filter((invoice) => {
    if (activeTab === 'all') return true;
    return invoice.status === activeTab;
  });

  // Pagination logic
  const totalPages = Math.ceil((filteredInvoices?.length || 0) / perPage);
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage,
  );

  const getStatusBadge = (status: string) => {
    const statusColors = {
      draft: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
      open: 'bg-yellow-100 text-yellow-800',
      sent: 'bg-blue-100 text-blue-800',
    };
    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || 'bg-gray-100'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatCurrency = (amount: number, currency: string) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    });
    return formatter.format(amount);
  };

  const formatValue = (value: number | string, suffix: string) => {
    if (typeof value === 'number') {
      if (suffix === 'days') {
        return `${value} days`;
      }
      return formatCurrency(value, suffix);
    }
    return value;
  };

  return (
    <div className='max-w-[1600px]'>
      <div className='px-8 py-8'>
        <div className='flex justify-between items-center'>
          <div>
            <h1 className='text-4xl font-bold text-gray-900 mb-4'>Invoices</h1>
          </div>
          <CreateInvoiceDialog />
        </div>
      </div>

      <div className='p-8'>
        <div className='grid grid-cols-12 gap-8'>
          <div className='col-span-12 lg:col-span-8'>
            {/* Error Banner */}
            {invoicesError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className='bg-red-50/50 border-l-4 border-red-500 text-red-800 px-5 py-4 rounded-xl flex items-center gap-3'
              >
                <span className='font-medium text-lg'>!</span>
                <span className='text-sm'>
                  {invoicesError instanceof Error ? invoicesError.message : 'An error occurred'}
                </span>
                <button
                  className='ml-auto text-red-400 hover:text-red-600 transition-colors duration-200'
                  onClick={() => {
                    return handleStatusChange('all');
                  }}
                >
                  &times;
                </button>
              </motion.div>
            )}

            {/* Filters */}
            <div className='bg-white rounded-xl border border-gray-100/50'>
              <div className='flex items-center gap-4'>
                <div className='relative flex-1'>
                  <Search className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
                  <Input
                    type='text'
                    className='w-full pl-11 pr-4 py-2.5 text-base'
                    placeholder='Search invoices...'
                    value={searchQuery}
                    onChange={(e) => {
                      return handleSearch(e.target.value);
                    }}
                  />
                </div>
                <Select value={activeTab} onValueChange={handleStatusChange}>
                  <SelectTrigger className='w-[140px]'>
                    <SelectValue placeholder='All statuses' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All statuses</SelectItem>
                    <SelectItem value='open'>Open</SelectItem>
                    <SelectItem value='draft'>Draft</SelectItem>
                    <SelectItem value='paid'>Paid</SelectItem>
                    <SelectItem value='overdue'>Overdue</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type='date'
                  className='w-[140px]'
                  placeholder='From'
                  value={dateRange.from}
                  onChange={(e) => {
                    return handleDateRangeChange('from', e.target.value);
                  }}
                />
                <Input
                  type='date'
                  className='w-[140px]'
                  placeholder='To'
                  value={dateRange.to}
                  onChange={(e) => {
                    return handleDateRangeChange('to', e.target.value);
                  }}
                />
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={handleStatusChange} className='my-8'>
              <TabsList>
                {statusTabs.map((tab) => {
                  const count = (invoicesData || []).filter((inv) => {
                    return tab.key === 'all' ? true : inv.status === tab.key;
                  }).length;
                  return (
                    <TabsTrigger
                      key={tab.key}
                      value={tab.key}
                      className='px-5 py-2.5 text-base font-medium'
                    >
                      {tab.label}
                      {tab.key !== 'all' && (
                        <span className='ml-2 text-sm font-semibold bg-gray-100/50 px-2.5 py-1 rounded-full'>
                          {count}
                        </span>
                      )}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </Tabs>

            {/* Invoice Table or Empty State */}
            {isLoadingInvoices ? (
              <Card>
                <CardContent className='p-10 text-center text-gray-600 text-base'>
                  Loading invoices...
                </CardContent>
              </Card>
            ) : !filteredInvoices || filteredInvoices.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card>
                  <CardContent className='flex flex-col items-center justify-center py-20 gap-6'>
                    <div className='w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center'>
                      <svg
                        className='w-8 h-8 text-blue-600'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                        xmlns='http://www.w3.org/2000/svg'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                        />
                      </svg>
                    </div>
                    <div className='text-center space-y-2'>
                      <h3 className='text-2xl font-semibold text-gray-900 tracking-tight'>
                        No invoices found
                      </h3>
                      <p className='text-base text-gray-600 max-w-md'>
                        {activeTab === 'all'
                          ? "Get started by creating your first invoice. It's quick and easy!"
                          : activeTab === 'open'
                          ? "You don't have any open invoices at the moment."
                          : "You don't have any draft invoices. Create one to get started!"}
                      </p>
                    </div>
                    <div className='flex gap-4'>
                      <Button
                        onClick={() => {
                          return router.push('/invoices/new');
                        }}
                        className='bg-blue-600 hover:bg-blue-700 text-white'
                      >
                        Create new invoice
                      </Button>
                      {activeTab !== 'all' && (
                        <Button
                          variant='outline'
                          onClick={() => {
                            return handleStatusChange('all');
                          }}
                        >
                          View all invoices
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow className='hover:bg-transparent'>
                      <TableHead className='text-base font-semibold text-gray-800 py-4'>
                        Status
                      </TableHead>
                      <TableHead className='text-base font-semibold text-gray-800 py-4'>
                        Date
                      </TableHead>
                      <TableHead className='text-base font-semibold text-gray-800 py-4'>
                        Number
                      </TableHead>
                      <TableHead className='text-base font-semibold text-gray-800 py-4'>
                        Customer
                      </TableHead>
                      <TableHead className='text-base font-semibold text-gray-800 py-4 text-right'>
                        Amount due
                      </TableHead>
                      <TableHead className='text-base font-semibold text-gray-800 py-4 text-right'>
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedInvoices.map((invoice) => {
                      return (
                        <TableRow
                          key={invoice._id}
                          className='hover:bg-gray-50/50 cursor-pointer transition-all duration-200'
                          onClick={(e) => {
                            if (isSendDialogOpen && selectedInvoice?._id === invoice._id) {
                              e.preventDefault();
                              e.stopPropagation();
                              return;
                            }
                            router.push(`/invoices/${invoice._id}`);
                          }}
                        >
                          <TableCell className='py-4'>{getStatusBadge(invoice.status)}</TableCell>
                          <TableCell className='text-base text-gray-700 py-4'>
                            {format(new Date(invoice.dueDate), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell className='text-base font-medium text-gray-900 py-4'>
                            {invoice.invoiceNumber}
                          </TableCell>
                          <TableCell className='text-base text-gray-700 py-4'>
                            {invoice.client?.user.name || invoice.project?.name || '—'}
                          </TableCell>
                          <TableCell className='text-base font-semibold text-gray-900 py-4 text-right'>
                            {formatCurrency(invoice.total, invoice.currency)}
                          </TableCell>
                          <TableCell className='text-right py-4'>
                            <div className='flex justify-end items-center gap-2'>
                              <DropdownMenu modal={false}>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    size='icon'
                                    variant='ghost'
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                    }}
                                    aria-label='More actions'
                                    className='border border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-700 focus:ring-0 focus:outline-none shadow-none p-0 w-6 h-6 rounded-full flex items-center justify-center'
                                  >
                                    <ChevronDown className='w-6 h-6' />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align='end' className='w-48'>
                                  <DropdownMenuItem
                                    className='text-base py-2.5'
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      router.push(`/invoices/${invoice._id}`);
                                    }}
                                  >
                                    View
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className='text-base py-2.5'
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      router.push(`/invoices/${invoice._id}/edit`);
                                    }}
                                  >
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className='text-base py-2.5'
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      router.push(`/invoices/new?duplicate=${invoice._id}`);
                                    }}
                                  >
                                    Duplicate
                                  </DropdownMenuItem>
                                  {invoice.status === 'draft' && (
                                    <DropdownMenuItem
                                      className='text-base py-2.5 text-green-600'
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        approveInvoiceMutation.mutate(invoice._id);
                                      }}
                                    >
                                      Approve
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className='text-base py-2.5'
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setSelectedInvoice(invoice);
                                      setIsSendDialogOpen(true);
                                    }}
                                  >
                                    Send invoice
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className='text-base py-2.5'
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      window.open(`/api/invoices/${invoice._id}/pdf`, '_blank');
                                    }}
                                  >
                                    Export as PDF
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className='text-base py-2.5'
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      window.print();
                                    }}
                                  >
                                    Print
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className='text-base py-2.5 text-red-600'
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleDeleteInvoice(invoice._id, e);
                                    }}
                                  >
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                {/* Move Dialog outside of table */}
                {selectedInvoice && (
                  <Dialog
                    open={isSendDialogOpen}
                    onOpenChange={(open) => {
                      if (!open) {
                        setIsSendDialogOpen(false);
                        setSelectedInvoice(null);
                      }
                    }}
                  >
                    <DialogContent className='sm:max-w-[700px]'>
                      <DialogHeader>
                        <DialogTitle>Send Invoice</DialogTitle>
                        <DialogDescription>
                          {selectedInvoice.status === 'paid' ? (
                            <span className='text-yellow-600'>
                              This invoice has already been paid. You can still share the invoice
                              details.
                            </span>
                          ) : (
                            `Share invoice #${selectedInvoice.invoiceNumber} with ${
                              selectedInvoice.client?.user?.name ||
                              selectedInvoice.project?.name ||
                              'the client'
                            }`
                          )}
                        </DialogDescription>
                      </DialogHeader>
                      <div className='py-6'>
                        <div className='grid grid-cols-2 gap-6'>
                          <div
                            className='cursor-pointer border rounded-2xl p-8 flex flex-col items-center justify-center transition-shadow hover:shadow-md hover:border-primary group bg-blue-50'
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              navigator.clipboard.writeText(window.location.href);
                              toast.success('Invoice link copied!');
                            }}
                          >
                            <LinkIcon className='h-8 w-8 mb-4 text-blue-600 group-hover:text-blue-700' />
                            <div className='font-bold text-lg mb-1 text-center'>Copy link</div>
                            <div className='text-center text-muted-foreground text-base'>
                              A link to your invoice with all details included
                            </div>
                          </div>
                          <div
                            className='cursor-pointer border rounded-2xl p-8 flex flex-col items-center justify-center transition-shadow hover:shadow-md hover:border-primary group bg-indigo-50'
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              window.open(`/api/invoices/${selectedInvoice._id}/pdf`, '_blank');
                            }}
                          >
                            <DownloadCloud className='h-8 w-8 mb-4 text-indigo-600 group-hover:text-indigo-700' />
                            <div className='font-bold text-lg mb-1 text-center'>Download PDF</div>
                            <div className='text-center text-muted-foreground text-base'>
                              Your invoice all in one document
                            </div>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant='outline'
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsSendDialogOpen(false);
                            setSelectedInvoice(null);
                          }}
                        >
                          Close
                        </Button>
                        {!selectedInvoice.status.includes('paid') &&
                          selectedInvoice.status !== 'sent' && (
                            <Button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                return markAsSentMutation.mutate(selectedInvoice._id);
                              }}
                              disabled={markAsSentMutation.isPending}
                            >
                              {markAsSentMutation.isPending ? 'Marking...' : 'Mark invoice as sent'}
                            </Button>
                          )}
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}

                {/* Pagination Controls */}
                <div className='flex items-center justify-between px-8 py-6 border-t bg-white/50'>
                  <div className='flex items-center gap-4'>
                    <span className='text-base font-medium text-gray-700'>Show:</span>
                    <Select
                      value={perPage.toString()}
                      onValueChange={(value) => {
                        setPerPage(Number(value));
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className='w-[100px] text-base'>
                        <SelectValue placeholder='Select' />
                      </SelectTrigger>
                      <SelectContent>
                        {[10, 25, 50, 100].map((n) => {
                          return (
                            <SelectItem key={n} value={n.toString()} className='text-base'>
                              {n}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <span className='text-base font-medium text-gray-700'>per page</span>
                  </div>
                  <div className='flex items-center gap-4'>
                    <Button
                      variant='outline'
                      onClick={() => {
                        return setCurrentPage((p) => {
                          return Math.max(1, p - 1);
                        });
                      }}
                      disabled={currentPage === 1}
                      className='text-base'
                    >
                      Previous
                    </Button>
                    <span className='text-base font-medium text-gray-700'>
                      Page {currentPage} of {totalPages === 0 ? 1 : totalPages}
                    </span>
                    <Button
                      variant='outline'
                      onClick={() => {
                        return setCurrentPage((p) => {
                          return Math.min(totalPages, p + 1);
                        });
                      }}
                      disabled={currentPage === totalPages || totalPages === 0}
                      className='text-base'
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Right Column - Recent Activity */}
          <div className='col-span-12 lg:col-span-4 space-y-0'>
            <Card>
              <CardHeader>
                <CardTitle className='text-xl font-semibold text-gray-900'>
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-5'>
                {activities.length === 0 ? (
                  <p className='text-base text-gray-600'>No recent activities</p>
                ) : (
                  activities.map((activity) => {
                    const getActivityColor = (type: Activity['type']) => {
                      switch (type) {
                        case 'created':
                          return 'bg-blue-500';
                        case 'paid':
                          return 'bg-green-500';
                        case 'overdue':
                          return 'bg-yellow-500';
                        default:
                          return 'bg-gray-500';
                      }
                    };

                    return (
                      <div key={activity._id} className='flex items-start gap-4'>
                        <div
                          className={`w-2 h-2 rounded-full ${getActivityColor(activity.type)} mt-2`}
                        ></div>
                        <div>
                          <p className='text-base font-medium text-gray-900'>
                            {activity.description}
                          </p>
                          <p className='text-sm text-gray-600 mt-1'>
                            {format(new Date(activity.timestamp), 'MMM d, yyyy h:mm a')}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
