import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';

interface Invoice {
  _id: string;
  invoiceNumber: string;
  client?: {
    _id: string;
    user: {
      name: string;
      email: string;
    };
  };
  project?: {
    _id: string;
    name: string;
  };
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'open';
  dueDate: string;
  createdAt: string;
  currency: string;
}

interface InvoicesTableProps {
  invoices: Invoice[];
}

export function InvoicesTable({ invoices }: InvoicesTableProps) {
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
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${formatter.format(amount)} ${currency.toUpperCase()}`;
  };

  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Number</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead className='text-right'>Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => {
            return (
              <TableRow key={invoice._id}>
                <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                <TableCell>{format(new Date(invoice.createdAt), 'MMM d, yyyy')}</TableCell>
                <TableCell className='font-medium'>{invoice.invoiceNumber}</TableCell>
                <TableCell>{invoice.client?.user.name || invoice.project?.name || '—'}</TableCell>
                <TableCell className='text-right font-semibold'>
                  {formatCurrency(invoice.total, invoice.currency)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
