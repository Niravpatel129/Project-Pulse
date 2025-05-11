import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  discount?: number;
  tax?: number;
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
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'open' | 'unpaid';
  dueDate: string;
  notes?: string;
  currency: string;
  createdBy: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

interface InvoicesTableProps {
  invoices: Invoice[];
  onViewInvoice: (invoiceId: string) => void;
}

export function InvoicesTable({ invoices, onViewInvoice }: InvoicesTableProps) {
  const getStatusBadge = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return <Badge variant='secondary'>Paid</Badge>;
      case 'overdue':
        return <Badge variant='destructive'>Overdue</Badge>;
      case 'unpaid':
      case 'open':
        return <Badge variant='default'>Open</Badge>;
      case 'draft':
        return <Badge variant='outline'>Draft</Badge>;
      case 'sent':
        return <Badge variant='default'>Sent</Badge>;
      case 'cancelled':
        return <Badge variant='destructive'>Cancelled</Badge>;
      default:
        return <Badge variant='default'>{status}</Badge>;
    }
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
            <TableHead>Invoice #</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => {
            return (
              <TableRow key={invoice._id}>
                <TableCell>{invoice.invoiceNumber}</TableCell>
                <TableCell>{invoice.client?.user.name || 'N/A'}</TableCell>
                <TableCell>{formatCurrency(invoice.total, invoice.currency)}</TableCell>
                <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                <TableCell>{format(new Date(invoice.dueDate), 'MMM d, yyyy')}</TableCell>
                <TableCell>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => {
                      return onViewInvoice(invoice._id);
                    }}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
