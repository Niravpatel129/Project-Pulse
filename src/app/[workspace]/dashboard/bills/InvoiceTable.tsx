import { AddCustomerDialog } from '@/app/customers/components/AddCustomerDialog';
import { Button } from '@/components/ui/button';
import { DateTooltip } from '@/components/ui/date-tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers';
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useQueryClient } from '@tanstack/react-query';
import {
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { useState } from 'react';

interface ColumnMeta {
  className?: string;
}

const TABLE_HEADERS = [
  { id: 'invoice', label: 'Invoice', className: 'px-4 py-3' },
  { id: 'status', label: 'Status', className: 'px-4 py-3' },
  { id: 'dueDate', label: 'Due Date', className: 'px-4 py-3' },
  { id: 'customer', label: 'Customer', className: 'px-4 py-3' },
  { id: 'amount', label: 'Amount', className: 'px-4 py-3' },
  { id: 'issueDate', label: 'Issue Date', className: 'px-4 py-3' },
  { id: 'actions', label: 'Actions', className: 'px-4 py-3 w-[80px]' },
];

function formatCurrency(amount: number, currency: string = 'CAD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getRelativeTime(date: string) {
  const now = new Date();
  const then = new Date(date);
  const diff = then.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  if (days === -1) return 'Due yesterday';
  if (days > 0) return `Due in ${days} days`;
  return `${Math.abs(days)} days overdue`;
}

function getStatusBadge(status: string) {
  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    overdue: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',
    open: 'bg-yellow-100 text-yellow-800',
    sent: 'bg-blue-100 text-blue-800',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        statusColors[status as keyof typeof statusColors] || 'bg-gray-100'
      }`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export const InvoiceSkeleton = () => {
  return (
    <div className='overflow-x-auto rounded-lg border border-slate-100 dark:border-[#232428] shadow-sm'>
      <table className='min-w-full text-sm'>
        <thead className='!font-normal'>
          <tr className='divide-x divide-slate-100 dark:divide-[#232428] border-b border-slate-100 dark:border-[#232428] dark:bg-[#232428]'>
            {TABLE_HEADERS.map((header, index) => {
              return (
                <th
                  key={index}
                  className={`${header.className} text-left text-[#121212] dark:text-slate-300  tracking-wide font-light`}
                >
                  {header.label}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className='divide-y divide-slate-100 dark:divide-[#232428]'>
          {[...Array(5)].map((_, index) => {
            return (
              <tr key={index} className='h-[57px] divide-x divide-slate-100 dark:divide-[#232428]'>
                {TABLE_HEADERS.map((header, cellIndex) => {
                  return (
                    <td key={cellIndex} className={header.className}>
                      <Skeleton className='h-4 w-24' />
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

interface InvoiceTableProps {
  invoices: Invoice[];
  selectedInvoice: Invoice | null;
  setSelectedInvoice: (invoice: Invoice) => void;
  setEditingInvoice: (invoice: Invoice) => void;
  onMarkAsPaid: (invoiceId: string, paymentDate: Date) => void;
  onCancel: (invoiceId: string) => void;
  onDelete: (invoiceId: string) => void;
  isLoading: boolean;
  visibleColumns: Record<string, boolean>;
}

interface Invoice {
  _id: string;
  invoiceNumber: string;
  status: string;
  dueDate?: string;
  customer?: {
    id: {
      _id: string;
      user: {
        name: string;
        email: string;
      };
      contact?: {
        firstName?: string;
        lastName?: string;
      };
      phone?: string;
      mobile?: string;
      fax?: string;
      tollFree?: string;
      taxId?: string;
      accountNumber?: string;
      address?: {
        street?: string;
        city?: string;
        state?: string;
        country?: string;
        zip?: string;
      };
      shippingAddress?: {
        street?: string;
        city?: string;
        state?: string;
        country?: string;
        zip?: string;
      };
      website?: string;
      internalNotes?: string;
      customFields?: Record<string, any>;
      isActive: boolean;
    };
  };
  totals?: {
    total: number;
  };
  currency: string;
  issueDate?: string;
}

const DraggableHeader = ({ header, column }: { header: any; column: any }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: column.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    position: 'relative' as const,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <TableHead
      ref={setNodeRef}
      style={style}
      className={`${header.column.columnDef.meta?.className} text-left text-[#121212] dark:text-slate-300 tracking-wide font-medium cursor-grab active:cursor-grabbing py-[18px]`}
      {...attributes}
      {...listeners}
    >
      {flexRender(header.column.columnDef.header, header.getContext())}
    </TableHead>
  );
};

export const InvoiceTable = ({
  invoices,
  selectedInvoice,
  setSelectedInvoice,
  setEditingInvoice,
  onMarkAsPaid,
  onCancel,
  onDelete,
  isLoading,
  visibleColumns,
}: InvoiceTableProps) => {
  const [isEditCustomerDialogOpen, setIsEditCustomerDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnOrder, setColumnOrder] = useLocalStorage(
    'invoice-column-order',
    TABLE_HEADERS.map((header) => {
      return header.id;
    }),
  );
  const queryClient = useQueryClient();

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

  const columns = TABLE_HEADERS.map((header) => {
    return {
      id: header.id,
      accessorKey: header.id,
      header: header.label,
      meta: { className: header.className } as ColumnMeta,
      cell: ({ row }: { row: { original: Invoice } }) => {
        const invoice = row.original;
        switch (header.id) {
          case 'invoice':
            return (
              <div className='flex flex-col gap-1'>
                <span className='text-[#121212] dark:text-white font-medium'>
                  {invoice.invoiceNumber}
                </span>
              </div>
            );
          case 'status':
            return getStatusBadge(invoice.status);
          case 'dueDate':
            return invoice.dueDate ? (
              <div className='h-full'>
                <DateTooltip date={invoice.dueDate}>
                  <span className='font-medium'>{formatDate(invoice.dueDate)}</span>
                </DateTooltip>
                <div className='text-xs text-muted-foreground'>
                  {getRelativeTime(invoice.dueDate)}
                </div>
              </div>
            ) : (
              '-'
            );
          case 'customer':
            return (
              <div className='flex flex-col'>
                <span className='text-[#121212] dark:text-white font-medium text-left'>
                  {invoice.customer?.id?.user?.name || '-'}
                </span>
                <span className='text-xs text-muted-foreground'>
                  {invoice.customer?.id?.user?.email || '-'}
                </span>
              </div>
            );
          case 'amount':
            return (
              <span className='text-[#121212] dark:text-white font-medium'>
                {formatCurrency(invoice.totals?.total || 0, invoice.currency)}
              </span>
            );
          case 'issueDate':
            return (
              <DateTooltip date={invoice.issueDate}>
                <span className='text-[#121212] dark:text-slate-300 font-medium'>
                  {invoice.issueDate ? formatDate(invoice.issueDate) : '-'}
                </span>
              </DateTooltip>
            );
          case 'actions':
            return (
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant='ghost'
                    className='h-8 w-8 p-0'
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <MoreHorizontal className='h-4 w-4' />
                    <span className='sr-only'>Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingInvoice(invoice);
                    }}
                  >
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkAsPaid(invoice._id, new Date());
                    }}
                  >
                    Mark as paid
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onCancel(invoice._id);
                    }}
                  >
                    Cancel
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(invoice._id);
                    }}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            );
          default:
            return null;
        }
      },
    };
  });

  const table = useReactTable({
    data: invoices,
    columns,
    state: {
      sorting,
      columnOrder,
    },
    onSortingChange: setSorting,
    onColumnOrderChange: setColumnOrder,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setColumnOrder((columns) => {
        const oldIndex = columns.indexOf(active.id as string);
        const newIndex = columns.indexOf(over?.id as string);
        return arrayMove(columns, oldIndex, newIndex);
      });
    }
  };

  if (isLoading) {
    return <InvoiceSkeleton />;
  }

  if (invoices.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-24'>
        <h2 className='text-2xl font-semibold mb-2'>No invoices</h2>
        <p className='text-gray-500 mb-6 text-center'>
          You haven&apos;t created any invoices yet.
          <br />
          Go ahead and create your first one.
        </p>
        <Button
          variant='outline'
          onClick={() => {
            return setEditingInvoice({} as any);
          }}
        >
          Create invoice
        </Button>
      </div>
    );
  }

  return (
    <div className='overflow-x-auto rounded-lg border border-slate-100 dark:border-[#232428] shadow-sm'>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToHorizontalAxis]}
      >
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => {
              return (
                <TableRow
                  key={headerGroup.id}
                  className='divide-x divide-slate-100 dark:divide-[#232428] border-b border-slate-100 dark:border-[#232428] dark:bg-[#232428] !font-normal'
                >
                  <SortableContext items={columnOrder} strategy={horizontalListSortingStrategy}>
                    {headerGroup.headers.map((header) => {
                      if (!visibleColumns[header.column.columnDef.header as string]) return null;
                      return (
                        <DraggableHeader key={header.id} header={header} column={header.column} />
                      );
                    })}
                  </SortableContext>
                </TableRow>
              );
            })}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => {
              return (
                <TableRow
                  key={row.id}
                  className={`h-[57px] divide-x divide-slate-100 dark:divide-[#232428] cursor-pointer transition-colors duration-150 hover:bg-slate-50/50 dark:hover:bg-[#232428] ${
                    selectedInvoice?._id === row.original._id ? 'bg-slate-50 dark:bg-[#232428]' : ''
                  }`}
                  onClick={() => {
                    return setSelectedInvoice(row.original);
                  }}
                >
                  {row.getVisibleCells().map((cell) => {
                    if (!visibleColumns[cell.column.columnDef.header as string]) return null;
                    return (
                      <TableCell
                        key={cell.id}
                        className={
                          (cell.column.columnDef.meta as { className?: string } | undefined)
                            ?.className
                        }
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </DndContext>
      <AddCustomerDialog
        open={isEditCustomerDialogOpen}
        onOpenChange={setIsEditCustomerDialogOpen}
        initialData={editingCustomer}
        onEdit={(updatedCustomer) => {
          const updatedInvoices = invoices.map((invoice) => {
            if (invoice.customer?.id === updatedCustomer.id) {
              return {
                ...invoice,
                customer: updatedCustomer,
              };
            }
            return invoice;
          });

          queryClient.invalidateQueries({ queryKey: ['invoices'] });

          setIsEditCustomerDialogOpen(false);
          setEditingCustomer(null);
        }}
      />
    </div>
  );
};
