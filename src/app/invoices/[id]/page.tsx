import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { newRequest } from '@/utils/newRequest';
import { format } from 'date-fns';
import { ArrowLeft, Download, Mail, MoreHorizontal, Printer } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

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
  updatedAt: string;
}

async function getInvoice(id: string): Promise<Invoice> {
  try {
    console.log('Fetching invoice with ID:', id);
    const response = await newRequest.get<{ data: Invoice }>(`/invoices/${id}`);
    console.log('API Response:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching invoice:', error);
    notFound();
  }
}

interface PageProps {
  params: {
    id: string;
  };
}

export default async function InvoicePage({ params }: PageProps) {
  const { id } = params;
  const invoice = await getInvoice(id);

  const formatCurrency = (amount: number, currency: string) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    });
    return formatter.format(amount);
  };

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

  return (
    <div className='max-w-[1200px] mx-auto px-8 py-8'>
      {/* Header */}
      <div className='flex items-center justify-between mb-8'>
        <div className='flex items-center gap-4'>
          <Link href='/invoices'>
            <Button variant='ghost' size='icon' className='hover:bg-gray-100'>
              <ArrowLeft className='w-5 h-5' />
            </Button>
          </Link>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>Invoice #{invoice.invoiceNumber}</h1>
            <p className='text-sm text-gray-600'>
              Created on {format(new Date(invoice.createdAt), 'MMMM d, yyyy')}
            </p>
          </div>
        </div>
        <div className='flex items-center gap-3'>
          <Button variant='outline' className='gap-2'>
            <Mail className='w-4 h-4' />
            Send
          </Button>
          <Button variant='outline' className='gap-2'>
            <Download className='w-4 h-4' />
            Download
          </Button>
          <Button variant='outline' className='gap-2'>
            <Printer className='w-4 h-4' />
            Print
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' size='icon'>
                <MoreHorizontal className='w-4 h-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-48'>
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className='text-red-600'>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content */}
      <div className='grid grid-cols-12 gap-8'>
        {/* Left Column */}
        <div className='col-span-8 space-y-6'>
          {/* Status Card */}
          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <h2 className='text-lg font-semibold text-gray-900'>Status</h2>
                  <div className='mt-2'>{getStatusBadge(invoice.status)}</div>
                </div>
                <div className='text-right'>
                  <p className='text-sm text-gray-600'>Due Date</p>
                  <p className='text-lg font-semibold text-gray-900'>
                    {format(new Date(invoice.dueDate), 'MMMM d, yyyy')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Details */}
          <Card>
            <CardContent className='p-6'>
              <div className='grid grid-cols-2 gap-8'>
                <div>
                  <h3 className='text-sm font-medium text-gray-600 mb-2'>Bill To</h3>
                  <div className='space-y-1'>
                    <p className='text-base font-medium text-gray-900'>
                      {invoice.client?.name || '—'}
                    </p>
                    <p className='text-sm text-gray-600'>{invoice.client?.email || '—'}</p>
                  </div>
                </div>
                <div>
                  <h3 className='text-sm font-medium text-gray-600 mb-2'>From</h3>
                  <div className='space-y-1'>
                    <p className='text-base font-medium text-gray-900'>{invoice.createdBy.name}</p>
                    <p className='text-sm text-gray-600'>Your Company Name</p>
                    <p className='text-sm text-gray-600'>123 Business Street</p>
                    <p className='text-sm text-gray-600'>City, State, ZIP</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items Table */}
          <Card>
            <CardContent className='p-6'>
              <table className='w-full'>
                <thead>
                  <tr className='border-b'>
                    <th className='text-left py-3 text-sm font-medium text-gray-600'>Item</th>
                    <th className='text-right py-3 text-sm font-medium text-gray-600'>Quantity</th>
                    <th className='text-right py-3 text-sm font-medium text-gray-600'>Rate</th>
                    <th className='text-right py-3 text-sm font-medium text-gray-600'>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item) => {
                    return (
                      <tr key={item._id} className='border-b'>
                        <td className='py-4'>
                          <div>
                            <p className='text-base font-medium text-gray-900'>{item.name}</p>
                            <p className='text-sm text-gray-600'>{item.description}</p>
                          </div>
                        </td>
                        <td className='py-4 text-right text-base text-gray-900'>{item.quantity}</td>
                        <td className='py-4 text-right text-base text-gray-900'>
                          {formatCurrency(item.price, invoice.currency)}
                        </td>
                        <td className='py-4 text-right text-base text-gray-900'>
                          {formatCurrency(item.price * item.quantity, invoice.currency)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} className='py-4 text-right text-base font-medium text-gray-900'>
                      Subtotal
                    </td>
                    <td className='py-4 text-right text-base font-medium text-gray-900'>
                      {formatCurrency(invoice.total, invoice.currency)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={3} className='py-4 text-right text-base font-medium text-gray-900'>
                      Total
                    </td>
                    <td className='py-4 text-right text-2xl font-bold text-gray-900'>
                      {formatCurrency(invoice.total, invoice.currency)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </CardContent>
          </Card>

          {/* Notes */}
          {invoice.notes && (
            <Card>
              <CardContent className='p-6'>
                <h3 className='text-sm font-medium text-gray-600 mb-2'>Notes</h3>
                <p className='text-base text-gray-900 whitespace-pre-wrap'>{invoice.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column */}
        <div className='col-span-4 space-y-6'>
          {/* Payment Status */}
          <Card>
            <CardContent className='p-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>Payment Status</h3>
              <div className='space-y-4'>
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-gray-600'>Amount Due</span>
                  <span className='text-lg font-semibold text-gray-900'>
                    {formatCurrency(invoice.total, invoice.currency)}
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-gray-600'>Due Date</span>
                  <span className='text-base text-gray-900'>
                    {format(new Date(invoice.dueDate), 'MMM d, yyyy')}
                  </span>
                </div>
                <Button className='w-full'>Mark as Paid</Button>
              </div>
            </CardContent>
          </Card>

          {/* Activity */}
          <Card>
            <CardContent className='p-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>Activity</h3>
              <div className='space-y-4'>
                <div className='flex items-start gap-3'>
                  <div className='w-2 h-2 rounded-full bg-blue-500 mt-2'></div>
                  <div>
                    <p className='text-sm font-medium text-gray-900'>Invoice created</p>
                    <p className='text-xs text-gray-600'>
                      {format(new Date(invoice.createdAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                {invoice.status === 'paid' && (
                  <div className='flex items-start gap-3'>
                    <div className='w-2 h-2 rounded-full bg-green-500 mt-2'></div>
                    <div>
                      <p className='text-sm font-medium text-gray-900'>Payment received</p>
                      <p className='text-xs text-gray-600'>
                        {format(new Date(invoice.updatedAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
