import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { ArchiveIcon, Link2Icon, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
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
              <TableHead className=''></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => {
              const invoiceDate = new Date(invoice.createdAt);
              const currentYear = new Date().getFullYear();
              const dateFormat =
                invoiceDate.getFullYear() === currentYear ? 'MMM dd, HH:mm' : 'MMM dd, yyyy HH:mm';

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
                    <span className='font-medium text-muted-foreground'>
                      {invoice.invoiceNumber}
                    </span>
                  </TableCell>
                  <TableCell className='px-4 py-3'>
                    <span className='font-medium text-muted-foreground'>{invoice.client.name}</span>
                  </TableCell>
                  <TableCell className='px-4 py-3'>
                    <span className='text-sm text-muted-foreground'>{invoice.client.email}</span>
                  </TableCell>
                  <TableCell className='px-4 py-3'>
                    <span className='text-sm text-muted-foreground'>
                      {format(invoiceDate, dateFormat)}
                    </span>
                  </TableCell>
                  <TableCell className='px-4 py-3'>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        asChild
                        onClick={(e) => {
                          return e.stopPropagation();
                        }}
                      >
                        <button className='p-1 hover:bg-muted rounded-md'>
                          <MoreHorizontal className='h-4 w-4 text-muted-foreground' />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='start'>
                        <DropdownMenuItem
                          className='flex gap-1'
                          onClick={(e) => {
                            e.stopPropagation();
                            return toast.success('Invoice archived');
                          }}
                        >
                          <ArchiveIcon className='w-4 h-4 mr-2' />
                          Archive
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className='flex gap-1'
                          onClick={(e) => {
                            e.stopPropagation();
                            return toast.success('Invoice archived');
                          }}
                        >
                          <Link href={`/invoices/${invoice._id}`} className='flex gap-1'>
                            <Link2Icon className='w-4 h-4 mr-2' />
                            Payment link
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
