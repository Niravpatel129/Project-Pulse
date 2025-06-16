'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenu as LabelMenu,
  DropdownMenuContent as LabelMenuContent,
  DropdownMenuItem as LabelMenuItem,
  DropdownMenuSeparator as LabelMenuSeparator,
  DropdownMenuTrigger as LabelMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input as DropdownInput, Input } from '@/components/ui/input';
import { useSidebar } from '@/components/ui/sidebar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useClients } from '@/hooks/useClients';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { newRequest } from '@/utils/newRequest';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { Loader2, MoreHorizontal, Plus, Tag, UserRound } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { FiSidebar } from 'react-icons/fi';

interface Customer {
  _id: string;
  user: {
    _id: string;
    name: string;
    email?: string;
  };
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  labels?: string[];
}

const TABLE_HEADERS = [
  { id: 'name', label: 'Name', className: 'px-4 py-3 w-[220px]' },
  { id: 'email', label: 'Email', className: 'px-4 py-3 w-[250px]' },
  { id: 'phone', label: 'Phone', className: 'px-4 py-3 w-[180px]' },
  { id: 'labels', label: 'Labels', className: 'px-4 py-3 w-[220px]' },
  { id: 'updatedAt', label: 'Updated', className: 'px-4 py-3 w-[180px]' },
  { id: 'status', label: 'Status', className: 'px-4 py-3 w-[120px]' },
  { id: 'createdAt', label: 'Created', className: 'px-4 py-3 w-[180px]' },
  { id: 'actions', label: 'Actions', className: 'px-4 py-3 w-[80px]' },
];

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}
    >
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}

// Lazy-load the (large) dialog so it only mounts when actually opened.
const AddCustomerDialog = dynamic<any>(
  () => {
    return import('@/app/customers/components/AddCustomerDialog').then((m) => {
      return m.AddCustomerDialog;
    });
  },
  { ssr: false },
);

// Inline label selector component for cleaner UX
const LabelSelector = ({
  customer,
  labelOptions,
  onAdd,
  onRemove,
}: {
  customer: Customer;
  labelOptions: string[];
  onAdd: (customer: Customer, label: string) => void;
  onRemove: (customer: Customer, label: string) => void;
}) => {
  const [input, setInput] = useState('');

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (trimmed) {
      onAdd(customer, trimmed);
      setInput('');
    }
  };

  return (
    <LabelMenu>
      <LabelMenuTrigger asChild>
        <div
          className='flex items-center gap-1 flex-wrap max-w-[200px] cursor-pointer'
          onClick={(e) => {
            // Only open dropdown if not clicking the remove button
            if ((e.target as HTMLElement).tagName !== 'BUTTON') {
              e.preventDefault();
            }
          }}
        >
          {customer.labels && customer.labels.length > 0 ? (
            customer.labels.map((l) => {
              return (
                <Badge
                  key={l}
                  variant='secondary'
                  className='mb-0.5 group relative px-2.5 transition-[padding,background] duration-150 ease-in-out hover:pr-7'
                >
                  <span className='truncate block'>{l}</span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onRemove(customer, l);
                    }}
                    className='absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 inline-flex items-center justify-center opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity duration-150 ease-in-out text-muted-foreground'
                  >
                    ×
                  </button>
                </Badge>
              );
            })
          ) : (
            <span className='text-muted-foreground text-xs'>Add label</span>
          )}
          <Tag className='w-3 h-3 text-muted-foreground' />
        </div>
      </LabelMenuTrigger>
      <LabelMenuContent className='w-56'>
        <div className='px-2 py-2'>
          <DropdownInput
            placeholder='Create or search'
            value={input}
            onChange={(e) => {
              return setInput(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
        </div>
        <LabelMenuSeparator />
        {labelOptions.length === 0 && <LabelMenuItem disabled>No labels yet</LabelMenuItem>}
        {labelOptions.map((l) => {
          return (
            <LabelMenuItem
              key={l}
              onSelect={() => {
                return onAdd(customer, l);
              }}
            >
              {l}
            </LabelMenuItem>
          );
        })}
        {input.trim() && !labelOptions.includes(input.trim()) && (
          <>
            <LabelMenuSeparator />
            <LabelMenuItem onSelect={handleSubmit}>+ Add &quot;{input.trim()}&quot;</LabelMenuItem>
          </>
        )}
      </LabelMenuContent>
    </LabelMenu>
  );
};

export default function CustomersPage() {
  const { toggleSidebar } = useSidebar();
  const { clients: rawClients, isLoading } = useClients();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [visibleColumns, setVisibleColumns] = useLocalStorage('customer-visible-columns', {
    Name: true,
    Email: true,
    Phone: true,
    Labels: true,
    Updated: true,
    Status: true,
    Created: true,
    Actions: true,
  });

  const customers: Customer[] = useMemo(() => {
    return rawClients.map((c: any) => {
      return {
        _id: c._id,
        user: c.user,
        phone: c.phone,
        isActive: c.isActive,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        labels: c.labels,
      } as Customer;
    });
  }, [rawClients]);

  // Derived counts and filtered list are memoized to avoid expensive recalculations
  const { totalCustomers, activeCustomers, inactiveCustomers, filteredCustomers } = useMemo(() => {
    const total = customers.length;
    const active = customers.filter((c) => {
      return c.isActive;
    }).length;
    const inactive = total - active;

    const list = customers.filter((c) => {
      const q = search.toLowerCase();
      const matchesSearch =
        c.user.name.toLowerCase().includes(q) || c.user.email?.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === 'all' || (statusFilter === 'active' ? c.isActive : !c.isActive);
      return matchesSearch && matchesStatus;
    });

    return {
      totalCustomers: total,
      activeCustomers: active,
      inactiveCustomers: inactive,
      filteredCustomers: list,
    } as const;
  }, [customers, search, statusFilter]);

  const queryClient = useQueryClient();

  // Collect label options from existing customers
  const [labelOptions, setLabelOptions] = useState<string[]>([]);

  useEffect(() => {
    const allLabels = new Set<string>();
    rawClients.forEach((c: any) => {
      (c.labels || []).forEach((l: string) => {
        return allLabels.add(l);
      });
    });
    setLabelOptions(Array.from(allLabels));
  }, [rawClients]);

  const addLabelMutation = useMutation({
    mutationFn: async ({ customerId, label }: { customerId: string; label: string }) => {
      await newRequest.patch(`/clients/${customerId}/labels`, { labels: [label] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  const removeLabelMutation = useMutation({
    mutationFn: async ({ customerId, label }: { customerId: string; label: string }) => {
      // Send a request to remove the label
      await newRequest.delete(`/clients/${customerId}/labels/${encodeURIComponent(label)}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  const handleAddLabel = (customer: Customer, label: string) => {
    if (!customer.labels?.includes(label)) {
      addLabelMutation.mutate({ customerId: customer._id, label });
    }
  };

  const handleRemoveLabel = (customer: Customer, label: string) => {
    removeLabelMutation.mutate({ customerId: customer._id, label });
  };

  const handleCreateLabel = (customer: Customer) => {
    const newLabel = prompt('New label name');
    if (newLabel) {
      setLabelOptions((prev) => {
        return prev.includes(newLabel) ? prev : [...prev, newLabel];
      });
      handleAddLabel(customer, newLabel);
    }
  };

  const columns = TABLE_HEADERS.map((header) => {
    return {
      id: header.id,
      accessorKey: header.id,
      header: header.label,
      meta: { className: header.className },
      cell: ({ row }: { row: { original: Customer } }) => {
        const customer = row.original;
        switch (header.id) {
          case 'name':
            return (
              <div className='flex items-center gap-2 max-w-[220px]'>
                <div className='w-8 h-8 rounded-full bg-muted flex items-center justify-center'>
                  <UserRound className='w-4 h-4 text-muted-foreground' />
                </div>
                <span className='font-medium truncate'>{customer.user.name}</span>
              </div>
            );
          case 'email':
            return <span className='truncate'>{customer.user.email || '-'}</span>;
          case 'phone':
            return <span>{customer.phone || '-'}</span>;
          case 'labels':
            return (
              <LabelSelector
                customer={customer}
                labelOptions={labelOptions}
                onAdd={handleAddLabel}
                onRemove={handleRemoveLabel}
              />
            );
          case 'updatedAt':
            return <span>{customer.updatedAt ? formatDate(customer.updatedAt) : '-'}</span>;
          case 'status':
            return <StatusBadge active={customer.isActive} />;
          case 'createdAt':
            return <span>{formatDate(customer.createdAt)}</span>;
          case 'actions':
            return (
              <Button variant='ghost' size='icon' className='h-8 w-8 p-0'>
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            );
          default:
            return null;
        }
      },
    };
  });

  const table = useReactTable({
    data: filteredCustomers,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const toggleColumn = (column: string) => {
    setVisibleColumns((prev) => {
      return { ...prev, [column]: !prev[column] };
    });
  };

  return (
    <div className='flex flex-col h-full w-full'>
      {/* Header */}
      <div className='flex items-center justify-between px-4 pb-2 pt-3 border-b border-[#E4E4E7] dark:border-[#232428] bg-background'>
        <div className='flex items-center gap-2'>
          <Button variant='ghost' size='icon' onClick={toggleSidebar}>
            <FiSidebar size={20} className='text-muted-foreground' />
          </Button>
          <h1 className='text-lg font-semibold'>Customers</h1>
        </div>
        <Button
          variant='outline'
          size='sm'
          onClick={() => {
            return setAddDialogOpen(true);
          }}
          className='h-8 px-4'
        >
          <Plus className='w-4 h-4 mr-2' /> Add Customer
        </Button>
      </div>

      {/* Summary Cards */}
      <div className='px-4 pt-4'>
        <div className='grid grid-cols-3 gap-2 sm:gap-4 mb-6'>
          <SummaryCard label='Total' count={totalCustomers} />
          <SummaryCard label='Active' count={activeCustomers} />
          <SummaryCard label='Inactive' count={inactiveCustomers} />
        </div>
      </div>

      {/* Controls */}
      <div className='px-4 flex items-center gap-2 mb-4'>
        <div className='relative w-full max-w-xs'>
          <Input
            placeholder='Search customers...'
            className='pl-9'
            value={search}
            onChange={(e) => {
              return setSearch(e.target.value);
            }}
          />
          <span className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground'>
            <svg
              width='14'
              height='14'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
            >
              <circle cx='11' cy='11' r='8' />
              <line x1='21' y1='21' x2='16.65' y2='16.65' />
            </svg>
          </span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' size='icon' className='w-9 h-9'>
              <svg
                width='16'
                height='16'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                viewBox='0 0 24 24'
              >
                <path d='M4 4h16v2H4zm2 6h12v2H6zm4 6h4v2h-4z' />
              </svg>
              <span className='sr-only'>Columns</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-48'>
            <DropdownMenuItem className='font-medium text-sm text-muted-foreground'>
              Visible Columns
            </DropdownMenuItem>
            {Object.entries(visibleColumns).map(([column, isVisible]) => {
              return (
                <DropdownMenuItem
                  key={column}
                  className='flex items-center gap-2'
                  onSelect={(e) => {
                    e.preventDefault();
                    toggleColumn(column);
                  }}
                >
                  <Checkbox
                    checked={isVisible}
                    onCheckedChange={() => {
                      return toggleColumn(column);
                    }}
                  />
                  <span>{column}</span>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className='flex-1 overflow-auto px-4'>
        {isLoading ? (
          <div className='flex items-center justify-center h-40'>
            <Loader2 className='w-6 h-6 animate-spin text-muted-foreground' />
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className='flex flex-col items-center justify-center h-40 text-muted-foreground'>
            No customers found
          </div>
        ) : (
          <div>
            <Table>
              <TableHeader>
                <TableRow className='bg-muted/50'>
                  {table.getHeaderGroups()[0].headers.map((header) => {
                    if (
                      !visibleColumns[
                        header.column.id.charAt(0).toUpperCase() + header.column.id.slice(1)
                      ]
                    )
                      return null;
                    return (
                      <TableHead
                        key={header.id}
                        className={(header.column.columnDef.meta as any).className}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    );
                  })}
                </TableRow>
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => {
                  return (
                    <TableRow key={row.id} className='divide-x divide-muted-foreground/10'>
                      {row.getVisibleCells().map((cell) => {
                        if (
                          !visibleColumns[
                            cell.column.id.charAt(0).toUpperCase() + cell.column.id.slice(1)
                          ]
                        )
                          return null;
                        return (
                          <TableCell
                            key={cell.id}
                            className={(cell.column.columnDef.meta as any).className}
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
          </div>
        )}
      </div>

      <AddCustomerDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
    </div>
  );
}

function SummaryCard({ label, count }: { label: string; count: number }) {
  return (
    <div className='border bg-background text-card-foreground rounded-lg h-[100px] flex flex-col justify-center px-4'>
      <p className='text-sm text-muted-foreground'>{label}</p>
      <p className='text-2xl font-mono font-medium'>{count.toLocaleString()}</p>
    </div>
  );
}
