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
  switch (status.toLowerCase()) {
    case 'draft':
      return 'bg-slate-100 text-slate-600 hover:bg-slate-100 border border-slate-200';
    case 'open':
      return 'bg-sky-50 text-sky-600 hover:bg-sky-50 border border-sky-200';
    case 'pending':
      return 'bg-amber-50 text-amber-600 hover:bg-amber-50 border border-amber-200';
    case 'paid':
      return 'bg-emerald-50 text-emerald-600 hover:bg-emerald-50 border border-emerald-200';
    case 'void':
      return 'bg-slate-100 text-slate-600 hover:bg-slate-100 border border-slate-200';
    default:
      return 'bg-slate-100 text-slate-600 hover:bg-slate-100 border border-slate-200';
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
    <div className='bg-white overflow-hidden rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='h-9 py-2 text-sm font-medium text-gray-600'>Amount</TableHead>
            <TableHead className='h-9 py-2 text-sm font-medium text-gray-600'>
              Invoice number
            </TableHead>
            <TableHead className='h-9 py-2 text-sm font-medium text-gray-600'>
              Customer name
            </TableHead>
            <TableHead className='h-9 py-2 text-sm font-medium text-gray-600'>
              Customer email
            </TableHead>
            <TableHead className='h-9 py-2 text-sm font-medium text-gray-600'>Due</TableHead>
            <TableHead className='h-9 py-2 text-sm font-medium text-gray-600'>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => {
            return (
              <TableRow key={invoice._id} className='hover:bg-gray-50'>
                <TableCell className='py-2'>
                  <div className='flex items-center gap-1'>
                    <span className='font-semibold'>${invoice.total.toFixed(2)}</span>
                    <span className='text-gray-600'>CAD</span>
                    <Badge
                      variant='secondary'
                      className={cn(
                        'text-sm capitalize  font-bold px-2 py-0.5 rounded',
                        getStatusBadgeColor(invoice.status),
                      )}
                    >
                      {invoice.status}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className='py-2 text-gray-600'>{invoice.invoiceNumber}</TableCell>
                <TableCell className='py-2 text-gray-600'>{invoice.client.name}</TableCell>
                <TableCell className='py-2 text-gray-500'>{invoice.client.email}</TableCell>
                <TableCell className='py-2 text-gray-600'>
                  {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '—'}
                </TableCell>
                <TableCell className='py-2 text-gray-500'>
                  {new Date(invoice.createdAt).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    hour12: true,
                  })}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
