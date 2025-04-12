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
import { useState } from 'react';
import { Invoice } from '../types';
import { InvoiceDetailsModal } from './invoice-details-modal';

interface InvoicesTableProps {
  invoices: Invoice[];
}

export function InvoicesTable({ invoices }: InvoicesTableProps) {
  console.log('🚀 invoices:', invoices);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  return (
    <>
      <div className='rounded-lg border bg-card shadow-sm'>
        <Table>
          <TableHeader>
            <TableRow className='hover:bg-transparent'>
              <TableHead className='h-12 px-4 text-sm font-medium text-muted-foreground'>
                Amount
              </TableHead>
              <TableHead className='h-12 px -4 text-sm font-medium text-muted-foreground'>
                Invoice #
              </TableHead>
              <TableHead className='h-12 px-4 text-sm font-medium text-muted-foreground'>
                Customer Name
              </TableHead>
              <TableHead className='h-12 px-4 text-sm font-medium text-muted-foreground'>
                Customer Email
              </TableHead>
              <TableHead className='h-12 px-4 text-sm font-medium text-muted-foreground'>
                Created
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => {
              return (
                <TableRow
                  key={invoice._id}
                  className='group transition-colors hover:bg-muted/50 cursor-pointer'
                  onClick={() => {
                    return setSelectedInvoice(invoice);
                  }}
                >
                  <TableCell className='px-4 py-3'>
                    <div className='flex gap-2'>
                      <span className='font-medium text-foreground'>
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: invoice.currency.toUpperCase(),
                        }).format(invoice.total)}
                      </span>
                      <span className='uppercase text-muted-foreground'>{invoice.currency}</span>
                      <Badge
                        variant={
                          invoice.status === 'paid'
                            ? 'default'
                            : invoice.status === 'draft'
                            ? 'secondary'
                            : 'destructive'
                        }
                        className={cn(
                          'transition-colors w-fit rounded-sm',
                          invoice.status === 'paid' &&
                            'bg-green-100 text-green-800 hover:bg-green-200',
                          invoice.status === 'draft' &&
                            'bg-gray-100 text-gray-800 hover:bg-gray-200',
                          invoice.status === 'overdue' &&
                            'bg-red-100 text-red-800 hover:bg-red-200',
                        )}
                      >
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className='px-4 py-3'>
                    <span className='font-medium text-foreground'>{invoice.invoiceNumber}</span>
                  </TableCell>
                  <TableCell className='px-4 py-3'>
                    <span className='font-medium text-foreground'>{invoice.client.name}</span>
                  </TableCell>
                  <TableCell className='px-4 py-3'>
                    <span className='text-sm text-muted-foreground'>{invoice.client.email}</span>
                  </TableCell>
                  <TableCell className='px-4 py-3'>
                    <span className='text-sm text-foreground'>
                      {format(new Date(invoice.createdAt), 'MMM dd, yyyy HH:mm')}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <InvoiceDetailsModal
        invoice={selectedInvoice}
        onClose={() => {
          return setSelectedInvoice(null);
        }}
      />
    </>
  );
}
