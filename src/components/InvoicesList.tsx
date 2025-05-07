import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { newRequest } from '@/utils/newRequest';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Plus, RefreshCw, Search } from 'lucide-react';
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
    <div className='min-h-screen bg-gray-50/50'>
      <div className='max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12 py-10'>
        {/* Main White Container */}
        <div className='bg-white rounded-2xl shadow-sm border border-gray-100/50'>
          {/* Header Section */}
          <div className='px-8 py-8 border-b border-gray-100/50'>
            <h1 className='text-3xl font-semibold text-gray-900 mb-3'>Invoices</h1>
            <p className='text-base text-gray-500'>Manage and track your invoices</p>
          </div>

          {/* Main Content Grid */}
          <div className='p-8'>
            <div className='grid grid-cols-12 gap-8'>
              {/* Left Column - Summary Cards */}
              <div className='col-span-12 lg:col-span-8 space-y-8'>
                {/* Summary Cards Grid */}
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5'>
                  {[
                    { label: 'Overdue', value: overdue, suffix: currency },
                    { label: 'Due within next 30 days', value: dueSoon, suffix: currency },
                    { label: 'Average time to get paid', value: avgTime, suffix: 'days' },
                    {
                      label: 'Upcoming payout',
                      value: payout,
                      suffix: lastUpdated,
                      icon: RefreshCw,
                    },
                  ].map((card, index) => {
                    return (
                      <motion.div
                        key={card.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className='bg-gray-50/50 rounded-xl p-6 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-gray-100/50 hover:shadow-[0_4px_12px_-4px_rgba(0,0,0,0.1)] transition-all duration-200'
                      >
                        <div className='flex flex-col gap-2'>
                          <span className='text-sm font-medium text-gray-500 tracking-wide'>
                            {card.label}
                          </span>
                          <span className='text-2xl font-semibold text-gray-900 tracking-tight'>
                            {formatValue(card.value, card.suffix)}
                          </span>
                          {card.icon ? (
                            <div className='flex items-center gap-2 text-xs text-gray-400'>
                              <card.icon className='w-3.5 h-3.5' />
                              <span>Updated {card.suffix}</span>
                            </div>
                          ) : (
                            <span className='text-xs text-gray-400'>{card.suffix}</span>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Action Bar */}
                <div className='flex justify-between items-center'>
                  <div className='flex gap-4'>
                    <Button
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
                <div className='bg-gray-50/50 rounded-xl p-5 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-gray-100/50'>
                  <div className='flex flex-wrap gap-5 items-center'>
                    <div className='flex-1 min-w-[240px]'>
                      <div className='relative'>
                        <Search className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
                        <input
                          type='text'
                          className='w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-200 bg-white'
                          placeholder='Search invoices...'
                        />
                      </div>
                    </div>
                    <div className='flex gap-4'>
                      {[
                        { label: 'All customers', type: 'select' },
                        { label: 'All statuses', type: 'select' },
                        { label: 'From', type: 'date' },
                        { label: 'To', type: 'date' },
                      ].map((filter) => {
                        return filter.type === 'select' ? (
                          <select
                            key={filter.label}
                            className='border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-200 min-w-[140px] bg-white'
                          >
                            <option>{filter.label}</option>
                          </select>
                        ) : (
                          <input
                            key={filter.label}
                            type='date'
                            className='border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-200 min-w-[140px] bg-white'
                            placeholder={filter.label}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className='flex gap-3 items-center border-b border-gray-200 pb-3'>
                  {statusTabs.map((tab) => {
                    return (
                      <button
                        key={tab.key}
                        className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                          activeTab === tab.key
                            ? 'bg-blue-50/50 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-50/50'
                        }`}
                        onClick={() => {
                          return setActiveTab(tab.key);
                        }}
                      >
                        {tab.label}
                        {tab.key !== 'all' && (
                          <span className='ml-2 text-xs font-medium bg-gray-100/50 px-2.5 py-1 rounded-full'>
                            {tab.key === 'unpaid' ? unpaidCount : draftCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Invoice Table or Empty State */}
                {loading ? (
                  <div className='p-10 text-center text-gray-500 bg-gray-50/50 rounded-xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-gray-100/50'>
                    Loading invoices...
                  </div>
                ) : filteredInvoices.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className='flex flex-col items-center justify-center py-20 gap-6 bg-gray-50/50 rounded-xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-gray-100/50'
                  >
                    <div className='text-xl font-medium text-gray-700 tracking-tight'>
                      Ready to get paid? Approve your draft invoice.
                    </div>
                    <div className='flex gap-4'>
                      <Button
                        variant='outline'
                        onClick={() => {
                          return router.push('/invoices/new');
                        }}
                        className='rounded-xl border-gray-200 hover:bg-gray-50 transition-all duration-200 px-5 py-2.5'
                      >
                        Create a new invoice
                      </Button>
                      <Button
                        variant='outline'
                        className='rounded-xl border-gray-200 hover:bg-gray-50 transition-all duration-200 px-5 py-2.5'
                      >
                        View drafts
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <div className='bg-gray-50/50 rounded-xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-gray-100/50 overflow-hidden'>
                    <div className='overflow-x-auto'>
                      <table className='min-w-full divide-y divide-gray-200'>
                        <thead className='bg-white/50'>
                          <tr>
                            {['Status', 'Date', 'Number', 'Customer', 'Amount due', 'Actions'].map(
                              (header) => {
                                return (
                                  <th
                                    key={header}
                                    className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                                  >
                                    {header}
                                  </th>
                                );
                              },
                            )}
                          </tr>
                        </thead>
                        <tbody className='bg-white divide-y divide-gray-200'>
                          {paginatedInvoices.map((invoice) => {
                            return (
                              <motion.tr
                                key={invoice._id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className='hover:bg-gray-50/50 cursor-pointer transition-all duration-200'
                                onClick={() => {
                                  return router.push(`/invoice/${invoice._id}`);
                                }}
                              >
                                <td className='px-6 py-4 whitespace-nowrap'>
                                  {getStatusBadge(invoice.status)}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                                  {format(new Date(invoice.dueDate), 'MMM d, yyyy')}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                                  {invoice.invoiceNumber}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                                  {invoice.client?.name || '—'}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                                  {formatCurrency(invoice.total, invoice.currency)}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-right'>
                                  <Button
                                    size='sm'
                                    variant='link'
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      router.push(`/invoice/${invoice._id}`);
                                    }}
                                    className='text-blue-600 hover:text-blue-800 transition-colors duration-200'
                                  >
                                    Approve
                                  </Button>
                                </td>
                              </motion.tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination Controls */}
                    <div className='flex items-center justify-between px-6 py-5 border-t bg-white/50'>
                      <div className='flex items-center gap-3'>
                        <span className='text-sm text-gray-600'>Show:</span>
                        <select
                          className='border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-200 bg-white'
                          value={perPage}
                          onChange={(e) => {
                            setPerPage(Number(e.target.value));
                            setCurrentPage(1);
                          }}
                        >
                          {[10, 25, 50, 100].map((n) => {
                            return (
                              <option key={n} value={n}>
                                {n}
                              </option>
                            );
                          })}
                        </select>
                        <span className='text-sm text-gray-600'>per page</span>
                      </div>
                      <div className='flex items-center gap-3'>
                        <button
                          className='px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent transition-all duration-200 bg-white'
                          onClick={() => {
                            return setCurrentPage((p) => {
                              return Math.max(1, p - 1);
                            });
                          }}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </button>
                        <span className='text-sm text-gray-600'>
                          Page {currentPage} of {totalPages === 0 ? 1 : totalPages}
                        </span>
                        <button
                          className='px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent transition-all duration-200 bg-white'
                          onClick={() => {
                            return setCurrentPage((p) => {
                              return Math.min(totalPages, p + 1);
                            });
                          }}
                          disabled={currentPage === totalPages || totalPages === 0}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Quick Actions & Stats */}
              <div className='col-span-12 lg:col-span-4 space-y-8'>
                <div className='bg-gray-50/50 rounded-xl p-6 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-gray-100/50'>
                  <h2 className='text-lg font-semibold text-gray-900 mb-5'>Quick Actions</h2>
                  <div className='space-y-4'>
                    <Button
                      className='w-full justify-start bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 px-5 py-2.5 rounded-xl flex items-center gap-3 transition-all duration-200'
                      onClick={() => {
                        return router.push('/invoices/new');
                      }}
                    >
                      <Plus className='w-4 h-4' />
                      New Invoice
                    </Button>
                    <Button className='w-full justify-start bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 px-5 py-2.5 rounded-xl flex items-center gap-3 transition-all duration-200'>
                      <RefreshCw className='w-4 h-4' />
                      Refresh List
                    </Button>
                  </div>
                </div>

                <div className='bg-gray-50/50 rounded-xl p-6 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-gray-100/50'>
                  <h2 className='text-lg font-semibold text-gray-900 mb-5'>Recent Activity</h2>
                  <div className='space-y-5'>
                    <div className='flex items-start gap-4'>
                      <div className='w-2 h-2 rounded-full bg-blue-500 mt-2'></div>
                      <div>
                        <p className='text-sm font-medium text-gray-900'>
                          New invoice #1234 created
                        </p>
                        <p className='text-xs text-gray-500 mt-1'>2 hours ago</p>
                      </div>
                    </div>
                    <div className='flex items-start gap-4'>
                      <div className='w-2 h-2 rounded-full bg-green-500 mt-2'></div>
                      <div>
                        <p className='text-sm font-medium text-gray-900'>Invoice #1233 paid</p>
                        <p className='text-xs text-gray-500 mt-1'>5 hours ago</p>
                      </div>
                    </div>
                    <div className='flex items-start gap-4'>
                      <div className='w-2 h-2 rounded-full bg-yellow-500 mt-2'></div>
                      <div>
                        <p className='text-sm font-medium text-gray-900'>Invoice #1232 overdue</p>
                        <p className='text-xs text-gray-500 mt-1'>1 day ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
