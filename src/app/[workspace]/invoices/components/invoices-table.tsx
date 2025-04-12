import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
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
import { useProject } from '@/contexts/ProjectContext';
import { cn } from '@/lib/utils';
import { newRequest } from '@/utils/newRequest';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  ArchiveIcon,
  BookOpenIcon,
  CheckIcon,
  Link2Icon,
  MoreHorizontal,
  PencilIcon,
  XIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { Invoice } from '../types';
import { InvoiceDetailsModal } from './invoice-details-modal';
interface InvoicesTableProps {
  invoices: Invoice[];
}

export function InvoicesTable({ invoices }: InvoicesTableProps) {
  const queryClient = useQueryClient();
  const { project } = useProject();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const updateInvoiceStatus = (invoice: Invoice, status: string) => {
    newRequest
      .patch(`/projects/${project?._id}/invoices/${invoice._id}`, {
        status,
      })
      .then(() => {
        toast.success(`Invoice status updated to ${status}`);
        queryClient.invalidateQueries({
          queryKey: ['invoices'],
        });
      })
      .catch(() => {
        toast.error(`Failed to update invoice status to ${status}`);
      });
  };

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
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger className='flex gap-1'>
                            <PencilIcon className='w-4 h-4 mr-2' />
                            Update Status
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            {invoice.status !== 'draft' && (
                              <DropdownMenuItem
                                className='flex gap-1'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateInvoiceStatus(invoice, 'draft');
                                }}
                              >
                                <PencilIcon className='w-4 h-4 mr-2' />
                                Draft
                              </DropdownMenuItem>
                            )}

                            {invoice.status !== 'paid' && (
                              <DropdownMenuItem
                                className='flex gap-1'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateInvoiceStatus(invoice, 'paid');
                                }}
                              >
                                <CheckIcon className='w-4 h-4 mr-2' />
                                Mark as Paid
                              </DropdownMenuItem>
                            )}

                            {invoice.status !== 'cancelled' && (
                              <DropdownMenuItem
                                className='flex gap-1'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateInvoiceStatus(invoice, 'cancelled');
                                }}
                              >
                                <XIcon className='w-4 h-4 mr-2' />
                                Cancelled
                              </DropdownMenuItem>
                            )}

                            {invoice.status !== 'archived' && (
                              <DropdownMenuItem
                                className='flex gap-1'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateInvoiceStatus(invoice, 'archived');
                                }}
                              >
                                <ArchiveIcon className='w-4 h-4 mr-2' />
                                Archived
                              </DropdownMenuItem>
                            )}
                            {invoice.status !== 'open' && (
                              <DropdownMenuItem
                                className='flex gap-1'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateInvoiceStatus(invoice, 'open');
                                }}
                              >
                                <BookOpenIcon className='w-4 h-4 mr-2' />
                                Open
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        <DropdownMenuItem
                          className='flex gap-1'
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <Link href={`/invoice/${invoice._id}`} className='flex gap-1 w-full'>
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
