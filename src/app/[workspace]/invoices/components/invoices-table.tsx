import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Invoice } from '../types';

interface InvoicesTableProps {
  invoices: Invoice[];
}

export function InvoicesTable({ invoices }: InvoicesTableProps) {
  return (
    <div className='rounded-lg border bg-card shadow-sm'>
      <Table>
        <TableHeader>
          <TableRow className='hover:bg-transparent'>
            <TableHead className='h-12 px-4 text-sm font-medium text-muted-foreground'>
              Invoice #
            </TableHead>
            <TableHead className='h-12 px-4 text-sm font-medium text-muted-foreground'>
              Client
            </TableHead>
            <TableHead className='h-12 px-4 text-sm font-medium text-muted-foreground'>
              Due Date
            </TableHead>
            <TableHead className='h-12 px-4 text-sm font-medium text-muted-foreground'>
              Total
            </TableHead>
            <TableHead className='h-12 px-4 text-sm font-medium text-muted-foreground'>
              Status
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => {
            return (
              <TableRow key={invoice._id} className='group transition-colors hover:bg-muted/50'>
                <TableCell className='px-4 py-3'>
                  <span className='font-medium text-foreground'>{invoice.invoiceNumber}</span>
                </TableCell>
                <TableCell className='px-4 py-3'>
                  <div className='space-y-0.5'>
                    <div className='font-medium text-foreground'>{invoice.client.name}</div>
                    <div className='text-sm text-muted-foreground'>{invoice.client.email}</div>
                  </div>
                </TableCell>
                <TableCell className='px-4 py-3'>
                  <span className='text-sm text-foreground'>
                    {format(new Date(invoice.dueDate), 'MMM dd, yyyy')}
                  </span>
                </TableCell>
                <TableCell className='px-4 py-3'>
                  <span className='font-medium text-foreground'>
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: invoice.currency.toUpperCase(),
                    }).format(invoice.total)}
                  </span>
                </TableCell>
                <TableCell className='px-4 py-3'>
                  <Badge
                    variant={
                      invoice.status === 'paid'
                        ? 'default'
                        : invoice.status === 'draft'
                        ? 'secondary'
                        : 'destructive'
                    }
                    className={cn(
                      'transition-colors',
                      invoice.status === 'paid' && 'bg-green-100 text-green-800 hover:bg-green-200',
                      invoice.status === 'draft' && 'bg-gray-100 text-gray-800 hover:bg-gray-200',
                      invoice.status === 'overdue' && 'bg-red-100 text-red-800 hover:bg-red-200',
                    )}
                  >
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
