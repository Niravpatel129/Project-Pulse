import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case 'paid':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'draft':
      return 'bg-gray-100 text-gray-800';
    case 'overdue':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function InvoiceTable({ invoices }) {
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
            <TableHead>Created</TableHead>
            <TableHead>Created By</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => {
            return (
              <TableRow key={invoice._id} className='hover:bg-gray-50'>
                <TableCell className='font-medium'>{invoice.invoiceNumber}</TableCell>
                <TableCell>
                  <div className='text-sm text-gray-900'>{invoice.client.name}</div>
                  <div className='text-sm text-gray-500'>{invoice.client.email}</div>
                </TableCell>
                <TableCell>
                  ${invoice.total.toFixed(2)} {invoice.currency}
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(
                      invoice.status,
                    )}`}
                  >
                    {invoice.status}
                  </span>
                </TableCell>
                <TableCell className='text-gray-500'>
                  {new Date(invoice.dueDate).toLocaleDateString()}
                </TableCell>
                <TableCell className='text-gray-500'>
                  {new Date(invoice.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className='text-gray-500'>{invoice.createdBy.name}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
