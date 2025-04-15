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
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArchiveIcon,
  BookOpenIcon,
  CheckIcon,
  Link2Icon,
  MoreHorizontal,
  PencilIcon,
  TrashIcon,
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

const tableVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const rowVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.2,
    },
  },
};

export function InvoicesTable({ invoices }: InvoicesTableProps) {
  const queryClient = useQueryClient();
  const { project } = useProject();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [deletingInvoiceId, setDeletingInvoiceId] = useState<string | null>(null);
  const [updatingInvoiceId, setUpdatingInvoiceId] = useState<string | null>(null);

  const deleteInvoice = (invoiceId: string) => {
    setDeletingInvoiceId(invoiceId);
    newRequest
      .delete(`/projects/${project?._id}/invoices/${invoiceId}`)
      .then(() => {
        toast.success('Invoice deleted successfully');
        queryClient.invalidateQueries({
          queryKey: ['invoices'],
        });
      })
      .catch(() => {
        toast.error('Failed to delete invoice');
      })
      .finally(() => {
        setDeletingInvoiceId(null);
      });
  };

  const updateInvoiceStatus = (invoice: Invoice, status: string) => {
    setUpdatingInvoiceId(invoice._id);
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
      })
      .finally(() => {
        setUpdatingInvoiceId(null);
      });
  };

  return (
    <>
      <motion.div
        className='rounded-lg border bg-card shadow-sm'
        initial='hidden'
        animate='visible'
        variants={tableVariants}
      >
        <Table>
          <TableHeader>
            <TableRow className='hover:bg-transparent'>
              <TableHead className='h-12 px-4 text-sm font-medium text-muted-foreground'>
                Amount
              </TableHead>
              <TableHead className='h-12 px-4 text-sm font-medium text-muted-foreground'>
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
              <TableHead className='h-12 px-4'></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence initial={false}>
              {invoices.map((invoice) => {
                const invoiceDate = new Date(invoice.createdAt);
                const currentYear = new Date().getFullYear();
                const isDeleting = deletingInvoiceId === invoice._id;
                const isUpdating = updatingInvoiceId === invoice._id;

                return (
                  <motion.tr
                    key={invoice._id}
                    className={cn(
                      'group transition-colors hover:bg-muted/50 cursor-pointer',
                      (isDeleting || isUpdating) && 'opacity-70',
                    )}
                    onClick={() => {
                      return setSelectedInvoice(invoice);
                    }}
                    variants={rowVariants}
                    initial='hidden'
                    animate='visible'
                    exit='exit'
                    layout
                  >
                    <TableCell className='px-4 py-3'>
                      <div className='flex gap-2'>
                        <motion.span className='font-medium text-foreground' layout>
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: invoice.currency.toUpperCase(),
                          }).format(invoice.subtotal)}
                        </motion.span>
                        <motion.span className='uppercase text-muted-foreground' layout>
                          {invoice.currency}
                        </motion.span>
                        <motion.div layout>
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
                              invoice.status === 'open' &&
                                'bg-blue-100 text-blue-800 hover:bg-blue-200',
                            )}
                          >
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </Badge>
                        </motion.div>
                      </div>
                    </TableCell>
                    <TableCell className='px-4 py-3'>
                      <motion.span className='font-medium text-muted-foreground' layout>
                        {invoice.invoiceNumber}
                      </motion.span>
                    </TableCell>
                    <TableCell className='px-4 py-3'>
                      <motion.span className='font-medium text-muted-foreground' layout>
                        {invoice.client.name}
                      </motion.span>
                    </TableCell>
                    <TableCell className='px-4 py-3'>
                      <motion.span className='text-sm text-muted-foreground' layout>
                        {invoice.client.email}
                      </motion.span>
                    </TableCell>
                    <TableCell className='px-4 py-3'>
                      <motion.span className='text-sm text-muted-foreground' layout>
                        {invoiceDate.toLocaleString(undefined, {
                          year: invoiceDate.getFullYear() !== currentYear ? 'numeric' : undefined,
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </motion.span>
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
                          <DropdownMenuItem
                            className='flex gap-1 text-red-600 hover:text-red-700'
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteInvoice(invoice._id);
                            }}
                          >
                            <TrashIcon className='w-4 h-4 mr-2' />
                            Delete Invoice
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </TableBody>
        </Table>
      </motion.div>

      <AnimatePresence>
        {selectedInvoice && (
          <InvoiceDetailsModal
            invoice={selectedInvoice}
            onClose={() => {
              return setSelectedInvoice(null);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
