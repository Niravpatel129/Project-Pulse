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
import { Invoice } from '../types';
import { InvoiceSkeleton } from './InvoiceSkeleton';

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case 'paid':
      return 'bg-green-50 text-green-700 hover:bg-green-50';
    case 'pending':
      return 'bg-yellow-50 text-yellow-700 hover:bg-yellow-50';
    case 'draft':
      return 'bg-gray-50 text-gray-700 hover:bg-gray-50';
    case 'overdue':
      return 'bg-red-50 text-red-700 hover:bg-red-50';
    default:
      return 'bg-gray-50 text-gray-700 hover:bg-gray-50';
  }
};

interface InvoiceTableProps {
  invoices: Invoice[];
  isLoading?: boolean;
}

export default function InvoiceTable({ invoices, isLoading = false }: InvoiceTableProps) {
  if (isLoading) {
    return <InvoiceSkeleton />;
  }

  return (
    <div className='bg-background overflow-hidden rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow className='bg-muted/50'>
            <TableHead className='h-9 py-2'>Invoice #</TableHead>
            <TableHead className='h-9 py-2'>Client</TableHead>
            <TableHead className='h-9 py-2'>Amount</TableHead>
            <TableHead className='h-9 py-2'>Status</TableHead>
            <TableHead className='h-9 py-2'>Due Date</TableHead>
            <TableHead className='h-9 py-2'>Created</TableHead>
            <TableHead className='h-9 py-2'>Created By</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => {
            return (
              <TableRow key={invoice._id}>
                <TableCell className='py-2 font-medium'>{invoice.invoiceNumber}</TableCell>
                <TableCell className='py-2'>
                  <div className='space-y-0.5'>
                    <div className='text-sm font-medium'>{invoice.client.name}</div>
                    <div className='text-xs text-gray-500'>{invoice.client.email}</div>
                  </div>
                </TableCell>
                <TableCell className='py-2'>${invoice.total.toFixed(2)}</TableCell>
                <TableCell className='py-2'>
                  <Badge
                    variant='outline'
                    className={cn('text-xs font-medium', getStatusBadgeColor(invoice.status))}
                  >
                    {invoice.status}
                  </Badge>
                </TableCell>
                <TableCell className='py-2'>
                  {new Date(invoice.dueDate).toLocaleDateString()}
                </TableCell>
                <TableCell className='py-2'>
                  {new Date(invoice.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className='py-2'>{invoice.createdBy.name}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
