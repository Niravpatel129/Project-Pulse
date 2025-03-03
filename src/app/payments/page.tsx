'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
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
import { useAuth } from '@/contexts/AuthContext';
import {
  AlertCircle,
  ArrowUpDown,
  BarChart3,
  Building2,
  CalendarClock,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  MoreHorizontal,
  Plus,
  Receipt,
  Search,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface Payment {
  id: string;
  customer: string;
  project: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue' | 'Scheduled' | 'Draft';
  date: string;
  dueDate: string;
  paymentMethod: string;
  notes: string;
}

type PaymentViewMode = 'all' | 'upcoming' | 'overdue';

// Mock payment data
const MOCK_PAYMENTS: Payment[] = [
  {
    id: 'INV-2024-001',
    customer: 'Acme Corporation',
    project: 'Enterprise CRM Implementation',
    amount: 25000,
    status: 'Paid',
    date: '2024-04-10',
    dueDate: '2024-04-30',
    paymentMethod: 'Bank Transfer',
    notes: 'Initial payment for CRM implementation project.',
  },
  {
    id: 'INV-2024-002',
    customer: 'Fashion Forward Inc.',
    project: 'Mobile App Development - Retail',
    amount: 35000,
    status: 'Pending',
    date: '2024-04-05',
    dueDate: '2024-04-25',
    paymentMethod: 'Credit Card',
    notes: 'First installment for mobile app development.',
  },
  {
    id: 'INV-2024-003',
    customer: 'Midwest Healthcare Group',
    project: 'Digital Transformation Strategy',
    amount: 75000,
    status: 'Paid',
    date: '2024-03-20',
    dueDate: '2024-04-05',
    paymentMethod: 'Bank Transfer',
    notes: 'Final payment for digital transformation strategy project.',
  },
  {
    id: 'INV-2024-004',
    customer: 'Global Financial Services',
    project: 'Data Warehouse Migration',
    amount: 120000,
    status: 'Overdue',
    date: '2024-03-01',
    dueDate: '2024-03-31',
    paymentMethod: 'Bank Transfer',
    notes: 'Second milestone payment for data warehouse migration project.',
  },
  {
    id: 'INV-2024-005',
    customer: 'National Retail Chain',
    project: 'Cybersecurity Audit & Remediation',
    amount: 45000,
    status: 'Scheduled',
    date: '2024-04-15',
    dueDate: '2024-05-15',
    paymentMethod: 'Bank Transfer',
    notes: 'Payment for security audit services.',
  },
  {
    id: 'INV-2024-006',
    customer: 'Artisan Goods Marketplace',
    project: 'E-commerce Platform Upgrade',
    amount: 28500,
    status: 'Pending',
    date: '2024-04-08',
    dueDate: '2024-04-28',
    paymentMethod: 'Credit Card',
    notes: 'Deposit for e-commerce platform upgrade project.',
  },
  {
    id: 'INV-2024-007',
    customer: 'Continental Manufacturing',
    project: 'Supply Chain Optimization',
    amount: 65000,
    status: 'Paid',
    date: '2024-03-25',
    dueDate: '2024-04-15',
    paymentMethod: 'Bank Transfer',
    notes: 'Initial consulting fee for supply chain optimization.',
  },
  {
    id: 'INV-2024-008',
    customer: 'Acme Corporation',
    project: 'Enterprise CRM Implementation',
    amount: 35000,
    status: 'Scheduled',
    date: '2024-05-01',
    dueDate: '2024-05-30',
    paymentMethod: 'Bank Transfer',
    notes: 'Second milestone payment for CRM implementation.',
  },
  {
    id: 'INV-2024-009',
    customer: 'Sunset Hospitality Group',
    project: 'Digital Marketing Strategy',
    amount: 18500,
    status: 'Pending',
    date: '2024-04-12',
    dueDate: '2024-05-02',
    paymentMethod: 'Credit Card',
    notes: 'Monthly retainer for digital marketing services.',
  },
  {
    id: 'INV-2024-010',
    customer: 'Global Financial Services',
    project: 'Data Warehouse Migration',
    amount: 95000,
    status: 'Draft',
    date: '2024-05-15',
    dueDate: '2024-06-15',
    paymentMethod: 'Unspecified',
    notes: 'Third milestone payment for data warehouse project.',
  },
];

// Payment summary calculations
const calculatePaymentSummary = (payments: Payment[]) => {
  const total = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const paid = payments
    .filter((payment) => payment.status === 'Paid')
    .reduce((sum, payment) => sum + payment.amount, 0);
  const pending = payments
    .filter((payment) => payment.status === 'Pending')
    .reduce((sum, payment) => sum + payment.amount, 0);
  const overdue = payments
    .filter((payment) => payment.status === 'Overdue')
    .reduce((sum, payment) => sum + payment.amount, 0);
  const scheduled = payments
    .filter((payment) => payment.status === 'Scheduled')
    .reduce((sum, payment) => sum + payment.amount, 0);

  return { total, paid, pending, overdue, scheduled };
};

export default function PaymentsPage() {
  const { isAuthenticated, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<PaymentViewMode>('all');
  const [sortColumn, setSortColumn] = useState('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [payments, setPayments] = useState<Payment[]>(MOCK_PAYMENTS);

  // Function to handle column sorting
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Filter payments based on search, status, and view mode
  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.project.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;

    // Apply view mode filter
    const today = new Date();
    let matchesViewMode = true;
    if (viewMode === 'upcoming') {
      const dueDate = new Date(payment.dueDate);
      matchesViewMode = dueDate >= today && payment.status !== 'Paid';
    } else if (viewMode === 'overdue') {
      const date = new Date(payment.date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      matchesViewMode = date <= thirtyDaysAgo;
    }

    return matchesSearch && matchesStatus && matchesViewMode;
  });

  // Calculate payment summary from filtered payments
  const paymentSummary = calculatePaymentSummary(filteredPayments);

  // Sort the filtered payments
  const sortedPayments = [...filteredPayments].sort((a, b) => {
    // Handle different column types appropriately
    let comparison = 0;

    if (sortColumn === 'amount') {
      // Numeric comparison
      comparison = a.amount - b.amount;
    } else if (sortColumn === 'date' || sortColumn === 'dueDate') {
      // Date comparison
      comparison = new Date(a[sortColumn]).getTime() - new Date(b[sortColumn]).getTime();
    } else {
      // String comparison
      const aValue = String(a[sortColumn as keyof typeof a]).toLowerCase();
      const bValue = String(b[sortColumn as keyof typeof b]).toLowerCase();
      comparison = aValue.localeCompare(bValue);
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Function to render payment status badge
  const renderStatusBadge = (status: string) => {
    let className = '';
    let icon = null;

    switch (status) {
      case 'Paid':
        className = 'bg-green-100 text-green-800';
        icon = <CheckCircle2 className='h-3 w-3 mr-1' />;
        break;
      case 'Pending':
        className = 'bg-blue-100 text-blue-800';
        icon = <Clock className='h-3 w-3 mr-1' />;
        break;
      case 'Overdue':
        className = 'bg-red-100 text-red-800';
        icon = <AlertCircle className='h-3 w-3 mr-1' />;
        break;
      case 'Scheduled':
        className = 'bg-purple-100 text-purple-800';
        icon = <CalendarClock className='h-3 w-3 mr-1' />;
        break;
      case 'Draft':
        className = 'bg-slate-100 text-slate-800';
        icon = <FileText className='h-3 w-3 mr-1' />;
        break;
      default:
        className = 'bg-slate-100 text-slate-800';
        break;
    }

    return (
      <Badge className={`${className} flex items-center`}>
        {icon}
        {status}
      </Badge>
    );
  };

  // Helper for column header with sorting
  const SortableColumnHeader = ({ column, label }: { column: string; label: string }) => (
    <div className='flex items-center cursor-pointer' onClick={() => handleSort(column)}>
      {label}
      <ArrowUpDown className='ml-2 h-4 w-4' />
    </div>
  );

  return (
    <div className='container mx-auto py-8'>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-8'>
        <div>
          <h1 className='text-3xl font-bold'>Payments</h1>
          <p className='text-muted-foreground mt-1'>
            Manage invoices, track payments, and monitor financial transactions
          </p>
        </div>
        <div className='flex space-x-2'>
          <Button variant='outline'>
            <Download className='mr-2 h-4 w-4' />
            Export
          </Button>
          <Button variant='outline'>
            <BarChart3 className='mr-2 h-4 w-4' />
            Reports
          </Button>
          <Button asChild>
            <Link href='/payments/new'>
              <Plus className='mr-2 h-4 w-4' />
              New Invoice
            </Link>
          </Button>
        </div>
      </div>

      {/* Payment summary cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8'>
        <Card>
          <CardHeader className='py-4'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>Total</CardTitle>
          </CardHeader>
          <CardContent className='py-0'>
            <div className='text-2xl font-bold'>{formatCurrency(paymentSummary.total)}</div>
          </CardContent>
          <CardFooter className='py-4'>
            <span className='text-xs text-muted-foreground'>
              {filteredPayments.length} invoices total
            </span>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className='py-4'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>Paid</CardTitle>
          </CardHeader>
          <CardContent className='py-0'>
            <div className='text-2xl font-bold text-green-600'>
              {formatCurrency(paymentSummary.paid)}
            </div>
          </CardContent>
          <CardFooter className='py-4'>
            <span className='text-xs text-muted-foreground'>
              {payments.filter((p) => p.status === 'Paid').length} paid invoices
            </span>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className='py-4'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>Pending</CardTitle>
          </CardHeader>
          <CardContent className='py-0'>
            <div className='text-2xl font-bold text-blue-600'>
              {formatCurrency(paymentSummary.pending)}
            </div>
          </CardContent>
          <CardFooter className='py-4'>
            <span className='text-xs text-muted-foreground'>
              {payments.filter((p) => p.status === 'Pending').length} pending invoices
            </span>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className='py-4'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>Overdue</CardTitle>
          </CardHeader>
          <CardContent className='py-0'>
            <div className='text-2xl font-bold text-red-600'>
              {formatCurrency(paymentSummary.overdue)}
            </div>
          </CardContent>
          <CardFooter className='py-4'>
            <span className='text-xs text-muted-foreground'>
              {payments.filter((p) => p.status === 'Overdue').length} overdue invoices
            </span>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className='py-4'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>Scheduled</CardTitle>
          </CardHeader>
          <CardContent className='py-0'>
            <div className='text-2xl font-bold text-purple-600'>
              {formatCurrency(paymentSummary.scheduled)}
            </div>
          </CardContent>
          <CardFooter className='py-4'>
            <span className='text-xs text-muted-foreground'>
              {payments.filter((p) => p.status === 'Scheduled').length} scheduled invoices
            </span>
          </CardFooter>
        </Card>
      </div>

      {/* Filters and search */}
      <div className='flex flex-col md:flex-row gap-4 mb-8'>
        <div className='relative flex-1'>
          <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Search invoices...'
            className='pl-8'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Tabs
          value={viewMode}
          onValueChange={(value) => setViewMode(value as PaymentViewMode)}
          className='w-full md:w-auto'
        >
          <TabsList className='grid w-full grid-cols-3'>
            <TabsTrigger value='all'>All</TabsTrigger>
            <TabsTrigger value='upcoming'>Upcoming</TabsTrigger>
            <TabsTrigger value='overdue'>Overdue</TabsTrigger>
          </TabsList>
        </Tabs>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className='w-full md:w-[180px]'>
            <SelectValue placeholder='Filter by status' />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Status</SelectLabel>
              <SelectItem value='all'>All Statuses</SelectItem>
              <SelectItem value='Paid'>Paid</SelectItem>
              <SelectItem value='Pending'>Pending</SelectItem>
              <SelectItem value='Overdue'>Overdue</SelectItem>
              <SelectItem value='Scheduled'>Scheduled</SelectItem>
              <SelectItem value='Draft'>Draft</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Payments table */}
      {sortedPayments.length > 0 ? (
        <div className='rounded-md border shadow-sm overflow-hidden'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <SortableColumnHeader column='id' label='Invoice' />
                </TableHead>
                <TableHead>
                  <SortableColumnHeader column='customer' label='Customer' />
                </TableHead>
                <TableHead className='hidden md:table-cell'>
                  <SortableColumnHeader column='project' label='Project' />
                </TableHead>
                <TableHead>
                  <SortableColumnHeader column='amount' label='Amount' />
                </TableHead>
                <TableHead className='hidden md:table-cell'>
                  <SortableColumnHeader column='date' label='Date' />
                </TableHead>
                <TableHead>
                  <SortableColumnHeader column='dueDate' label='Due Date' />
                </TableHead>
                <TableHead>
                  <SortableColumnHeader column='status' label='Status' />
                </TableHead>
                <TableHead className='text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className='font-medium'>
                    <Link
                      href={`/payments/${payment.id}`}
                      className='hover:underline text-primary flex items-center'
                    >
                      <Receipt className='h-4 w-4 mr-2 text-muted-foreground' />
                      {payment.id}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center'>
                      <Building2 className='h-4 w-4 mr-2 text-muted-foreground' />
                      {payment.customer}
                    </div>
                  </TableCell>
                  <TableCell className='hidden md:table-cell max-w-[200px] truncate'>
                    {payment.project}
                  </TableCell>
                  <TableCell className='font-medium'>{formatCurrency(payment.amount)}</TableCell>
                  <TableCell className='hidden md:table-cell'>{formatDate(payment.date)}</TableCell>
                  <TableCell>{formatDate(payment.dueDate)}</TableCell>
                  <TableCell>{renderStatusBadge(payment.status)}</TableCell>
                  <TableCell className='text-right'>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' size='icon' className='h-8 w-8'>
                          <MoreHorizontal className='h-4 w-4' />
                          <span className='sr-only'>Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/payments/${payment.id}`}>View Invoice</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/payments/${payment.id}/edit`}>Edit Invoice</Link>
                        </DropdownMenuItem>
                        {payment.status === 'Pending' && (
                          <DropdownMenuItem>Mark as Paid</DropdownMenuItem>
                        )}
                        {payment.status !== 'Paid' && payment.status !== 'Draft' && (
                          <DropdownMenuItem asChild>
                            <Link href={`/payments/${payment.id}/reminders`}>Send Reminder</Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/payments/${payment.id}/download`}>Download PDF</Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className='text-center py-12'>
          <div className='inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4'>
            <Receipt className='h-6 w-6 text-muted-foreground' />
          </div>
          <h3 className='text-lg font-medium'>No invoices found</h3>
          <p className='text-muted-foreground mt-2 mb-4'>
            {searchQuery || statusFilter !== 'all' || viewMode !== 'all'
              ? "Try adjusting your search or filters to find what you're looking for."
              : 'Get started by creating your first invoice.'}
          </p>
          {!searchQuery && statusFilter === 'all' && viewMode === 'all' && (
            <Button asChild>
              <Link href='/payments/new'>
                <Plus className='mr-2 h-4 w-4' />
                New Invoice
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
