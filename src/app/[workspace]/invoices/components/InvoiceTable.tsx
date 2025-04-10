import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case 'paid':
      return 'bg-green-50 text-green-700';
    case 'pending':
      return 'bg-yellow-50 text-yellow-700';
    case 'draft':
      return 'bg-gray-50 text-gray-700';
    case 'overdue':
      return 'bg-red-50 text-red-700';
    default:
      return 'bg-gray-50 text-gray-700';
  }
};

export default function InvoiceTable({ invoices }) {
  return (
    <div className='rounded-lg border border-gray-100 bg-white shadow-sm'>
      <Table>
        <TableHeader>
          <TableRow className='border-b border-gray-100 hover:bg-transparent'>
            <TableHead className='h-10 px-3 text-xs font-medium text-gray-500'>Invoice #</TableHead>
            <TableHead className='h-10 px-3 text-xs font-medium text-gray-500'>Client</TableHead>
            <TableHead className='h-10 px-3 text-xs font-medium text-gray-500'>Amount</TableHead>
            <TableHead className='h-10 px-3 text-xs font-medium text-gray-500'>Status</TableHead>
            <TableHead className='h-10 px-3 text-xs font-medium text-gray-500'>Due Date</TableHead>
            <TableHead className='h-10 px-3 text-xs font-medium text-gray-500'>Created</TableHead>
            <TableHead className='h-10 px-3 text-xs font-medium text-gray-500'>
              Created By
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => {
            return (
              <TableRow
                key={invoice._id}
                className='border-b border-gray-50 transition-colors hover:bg-gray-50/50'
              >
                <TableCell className='px-3 py-2'>
                  <span className='text-sm font-medium text-gray-900'>{invoice.invoiceNumber}</span>
                </TableCell>
                <TableCell className='px-3 py-2'>
                  <div className='space-y-0.5'>
                    <div className='text-sm font-medium text-gray-900'>{invoice.client.name}</div>
                    <div className='text-xs text-gray-500'>{invoice.client.email}</div>
                  </div>
                </TableCell>
                <TableCell className='px-3 py-2'>
                  <span className='text-sm font-medium text-gray-900'>
                    ${invoice.total.toFixed(2)} {invoice.currency}
                  </span>
                </TableCell>
                <TableCell className='px-3 py-2'>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                      getStatusBadgeColor(invoice.status),
                    )}
                  >
                    {invoice.status}
                  </span>
                </TableCell>
                <TableCell className='px-3 py-2 text-xs text-gray-500'>
                  {new Date(invoice.dueDate).toLocaleDateString()}
                </TableCell>
                <TableCell className='px-3 py-2 text-xs text-gray-500'>
                  {new Date(invoice.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className='px-3 py-2 text-xs text-gray-500'>
                  {invoice.createdBy.name}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
