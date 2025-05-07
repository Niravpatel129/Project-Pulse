import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { ChevronDown, Plus, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface InvoiceItem {
  name: string;
  description: string;
  quantity: number;
  price: number;
  discount: number;
  tax: number;
  _id: string;
}

interface Invoice {
  _id: string;
  invoiceNumber: string;
  client: {
    _id: string;
    name: string;
    email: string;
  } | null;
  project?: {
    _id: string;
    name: string;
    description: string;
  };
  items: InvoiceItem[];
  total: number;
  status: string;
  dueDate: string;
  notes: string;
  currency: string;
  createdBy: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

interface ApiResponse {
  status: string;
  results: number;
  data: Invoice[];
}

const statusTabs = [
  { key: 'unpaid', label: 'Unpaid' },
  { key: 'draft', label: 'Draft' },
  { key: 'all', label: 'All invoices' },
];

export default function InvoicesList() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [error, setError] = useState<string | null>(null);
  const [perPage, setPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await newRequest.get<ApiResponse>('/invoices');
        setInvoices(response.data.data || []);
      } catch (error) {
        console.error('Failed to fetch invoices:', error);
        setInvoices([]);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  // Placeholder stats
  const overdue = 0;
  const dueSoon = 0;
  const avgTime = 0;
  const payout = 'None';
  const currency = 'CAD';
  const lastUpdated = '11 minutes ago';

  // Tab counts
  const unpaidCount = invoices.filter((inv) => {
    return inv.status === 'unpaid';
  }).length;
  const draftCount = invoices.filter((inv) => {
    return inv.status === 'draft';
  }).length;

  // Filtered invoices for tab
  const filteredInvoices =
    activeTab === 'all'
      ? invoices
      : invoices.filter((inv) => {
          return activeTab === 'unpaid' ? inv.status === 'unpaid' : inv.status === 'draft';
        });

  // Example error for demo
  useEffect(() => {
    // setError('Oops! There was an issue with approving your draft. Please try again.');
  }, []);

  // Pagination logic
  const totalPages = Math.ceil(filteredInvoices.length / perPage);
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
          <Button
            variant='outline'
            className='bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 px-5 py-2.5 rounded-xl flex items-center gap-2.5 transition-all duration-200 shadow-sm hover:shadow'
            onClick={() => {
              return router.push('/invoices/new');
            }}
          >
            <Plus className='w-4 h-4' />
            Create an invoice
          </Button>
        </div>
      </div>

      <div className='p-8'>
        <div className='grid grid-cols-12 gap-8'>
          <div className='col-span-12 lg:col-span-8'>
            {/* Action Bar */}
            <div className='flex justify-end items-center'></div>

            {/* Error Banner */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className='bg-red-50/50 border-l-4 border-red-500 text-red-800 px-5 py-4 rounded-xl flex items-center gap-3'
              >
                <span className='font-medium text-lg'>!</span>
                <span className='text-sm'>{error}</span>
                <button
                  className='ml-auto text-red-400 hover:text-red-600 transition-colors duration-200'
                  onClick={() => {
                    return setError(null);
                  }}
                >
                  &times;
                </button>
              </motion.div>
            )}

            {/* Filters */}
            <div className=' bg-white rounded-xl border border-gray-100/50'>
              <div className='flex items-center gap-4'>
                <div className='relative flex-1'>
                  <Search className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
                  <Input
                    type='text'
                    className='w-full pl-11 pr-4 py-2.5 text-base'
                    placeholder='Search invoices...'
                  />
                </div>
                {[
                  { label: 'All customers', type: 'select' },
                  { label: 'All statuses', type: 'select' },
                  { label: 'From', type: 'date' },
                  { label: 'To', type: 'date' },
                ].map((filter) => {
                  return filter.type === 'select' ? (
                    <Select key={filter.label}>
                      <SelectTrigger className='w-[140px]'>
                        <SelectValue placeholder={filter.label} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={filter.label}>{filter.label}</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      key={filter.label}
                      type='date'
                      className='w-[140px]'
                      placeholder={filter.label}
                    />
                  );
                })}
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className='my-8'>
              <TabsList>
                {statusTabs.map((tab) => {
                  return (
                    <TabsTrigger
                      key={tab.key}
                      value={tab.key}
                      className='px-5 py-2.5 text-base font-medium'
                    >
                      {tab.label}
                      {tab.key !== 'all' && (
                        <span className='ml-2 text-sm font-semibold bg-gray-100/50 px-2.5 py-1 rounded-full'>
                          {tab.key === 'unpaid' ? unpaidCount : draftCount}
                        </span>
                      )}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </Tabs>

            {/* Invoice Table or Empty State */}
            {loading ? (
              <Card>
                <CardContent className='p-10 text-center text-gray-600 text-base'>
                  Loading invoices...
                </CardContent>
              </Card>
            ) : filteredInvoices.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card>
                  <CardContent className='flex flex-col items-center justify-center py-20 gap-6'>
                    <div className='text-2xl font-semibold text-gray-800 tracking-tight'>
                      Ready to get paid? Approve your draft invoice.
                    </div>
                    <div className='flex gap-4'>
                      <Button
                        variant='outline'
                        onClick={() => {
                          return router.push('/invoices/new');
                        }}
                      >
                        Create a new invoice
                      </Button>
                      <Button variant='outline'>View drafts</Button>
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
                          onClick={() => {
                            return router.push(`/invoice/${invoice._id}`);
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
                            {invoice.client?.name || '—'}
                          </TableCell>
                          <TableCell className='text-base font-semibold text-gray-900 py-4 text-right'>
                            {formatCurrency(invoice.total, invoice.currency)}
                          </TableCell>
                          <TableCell className='text-right py-4 '>
                            <div className='flex justify-end items-center gap-2'>
                              <Button
                                size='sm'
                                variant='ghost'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/invoice/${invoice._id}`);
                                }}
                                className='font-semibold text-base text-blue-600 hover:bg-transparent hover:text-blue-700 focus:ring-0 focus:outline-none shadow-none border-none px-0 hover:underline'
                              >
                                Approve
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    size='icon'
                                    variant='ghost'
                                    onClick={(e) => {
                                      e.stopPropagation();
                                    }}
                                    aria-label='More actions'
                                    className='border border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-700 focus:ring-0 focus:outline-none shadow-none p-0 w-6 h-6 rounded-full flex items-center justify-center'
                                  >
                                    <ChevronDown className='w-6 h-6' />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align='end' className='w-48'>
                                  <DropdownMenuItem className='text-base py-2.5'>
                                    View
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className='text-base py-2.5'>
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className='text-base py-2.5'>
                                    Duplicate
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className='text-base py-2.5'>
                                    Send invoice
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className='text-base py-2.5'>
                                    Export as PDF
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className='text-base py-2.5'>
                                    Print
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className='text-base py-2.5 text-red-600'>
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
                <div className='flex items-start gap-4'>
                  <div className='w-2 h-2 rounded-full bg-blue-500 mt-2'></div>
                  <div>
                    <p className='text-base font-medium text-gray-900'>New invoice #1234 created</p>
                    <p className='text-sm text-gray-600 mt-1'>2 hours ago</p>
                  </div>
                </div>
                <div className='flex items-start gap-4'>
                  <div className='w-2 h-2 rounded-full bg-green-500 mt-2'></div>
                  <div>
                    <p className='text-base font-medium text-gray-900'>Invoice #1233 paid</p>
                    <p className='text-sm text-gray-600 mt-1'>5 hours ago</p>
                  </div>
                </div>
                <div className='flex items-start gap-4'>
                  <div className='w-2 h-2 rounded-full bg-yellow-500 mt-2'></div>
                  <div>
                    <p className='text-base font-medium text-gray-900'>Invoice #1232 overdue</p>
                    <p className='text-sm text-gray-600 mt-1'>1 day ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
