'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useSidebar } from '@/components/ui/sidebar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { newRequest } from '@/utils/newRequest';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { Calendar, Loader2, MoreHorizontal, Plus, Tag, User, UserRound } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FiFilter as FilterIcon, FiSidebar, FiX } from 'react-icons/fi';
import { VscListFilter, VscSearch } from 'react-icons/vsc';

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

// Lazy-load the dialog
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
  const [open, setOpen] = useState(false);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (trimmed) {
      onAdd(customer, trimmed);
      setInput('');
    }
  };

  return (
    <div
      className='relative'
      onClick={(e) => {
        return e.stopPropagation();
      }}
    >
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <div className='flex items-center gap-1 flex-wrap max-w-[200px] cursor-pointer'>
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
                      type='button'
                      onClick={(e) => {
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
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-56' align='start'>
          <div className='px-2 py-2'>
            <Input
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
          <DropdownMenuSeparator />
          {labelOptions.length === 0 && <DropdownMenuItem disabled>No labels yet</DropdownMenuItem>}
          {labelOptions.map((l) => {
            return (
              <DropdownMenuItem
                key={l}
                onSelect={() => {
                  onAdd(customer, l);
                  setOpen(false);
                }}
              >
                {l}
              </DropdownMenuItem>
            );
          })}
          {input.trim() && !labelOptions.includes(input.trim()) && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => {
                  handleSubmit();
                  setOpen(false);
                }}
              >
                + Add &quot;{input.trim()}&quot;
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default function CustomersPage() {
  const { toggleSidebar } = useSidebar();
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [activeFilters, setActiveFilters] = useState<{
    createdDate?: string;
    labels?: string;
    status?: string;
  }>({});
  const [searchQuery, setSearchQuery] = useState('');
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
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const observerTarget = useRef<HTMLDivElement>(null);
  const [customersList, setCustomersList] = useState<any[]>([]);

  const {
    data: customersData,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['customers', activeFilters, searchQuery],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await newRequest.get('/clients', {
        params: {
          page: pageParam,
          limit: 10,
          ...activeFilters,
          search: searchQuery,
        },
      });
      return {
        data: response.data.data,
        success: response.data.success,
        message: response.data.message,
      };
    },
    getNextPageParam: () => {
      return undefined;
    }, // Disable pagination for now
    initialPageParam: 1,
  });

  // Update customersList when new data arrives
  useEffect(() => {
    if (customersData?.pages) {
      const allCustomers = customersData.pages.flatMap((page) => {
        return page.data || [];
      });
      setCustomersList(allCustomers);
    }
  }, [customersData?.pages]);

  // Setup intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage && !isLoading) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 },
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, isLoading]);

  // Update selectedCustomer when customers data changes
  useEffect(() => {
    if (selectedCustomer && customersList) {
      const updatedCustomer = customersList.find((c: any) => {
        return c._id === selectedCustomer._id;
      });
      if (updatedCustomer) {
        setSelectedCustomer(updatedCustomer);
      }
    }
  }, [customersList, selectedCustomer]);

  const handleFilterChange = (type: 'createdDate' | 'labels' | 'status', value: string) => {
    setActiveFilters((prev) => {
      return {
        ...prev,
        [type]: value,
      };
    });
  };

  const removeFilter = (type: 'createdDate' | 'labels' | 'status') => {
    setActiveFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[type];
      return newFilters;
    });
  };

  const toggleColumn = (column: string) => {
    setVisibleColumns((prev) => {
      return { ...prev, [column]: !prev[column] };
    });
  };

  // Calculate customer statistics
  const { totalCustomers, activeCustomers, inactiveCustomers } = useMemo(() => {
    const total = customersList.length;
    const active = customersList.filter((c) => {
      return c.isActive;
    }).length;
    const inactive = total - active;

    return {
      totalCustomers: total,
      activeCustomers: active,
      inactiveCustomers: inactive,
    };
  }, [customersList]);

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
    data: customersList,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const labelOptions = useMemo(() => {
    const allLabels = new Set<string>();
    customersList.forEach((c: any) => {
      (c.labels || []).forEach((l: string) => {
        return allLabels.add(l);
      });
    });
    return Array.from(allLabels);
  }, [customersList]);

  const addLabelMutation = useMutation({
    mutationFn: async ({ customerId, label }: { customerId: string; label: string }) => {
      await newRequest.patch(`/clients/${customerId}/labels`, { labels: [label] });
    },
    onMutate: async ({ customerId, label }) => {
      await queryClient.cancelQueries({ queryKey: ['customers'] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(['customers']);

      // Optimistically update the customer
      queryClient.setQueryData(['customers'], (old: any) => {
        const oldData = old?.data || [];
        return {
          ...old,
          data: oldData.map((customer: any) => {
            if (customer._id === customerId) {
              return {
                ...customer,
                labels: [...(customer.labels || []), label],
              };
            }
            return customer;
          }),
        };
      });

      return { previousData };
    },
    onError: (err, { customerId, label }, context) => {
      queryClient.setQueryData(['customers'], context?.previousData);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  const removeLabelMutation = useMutation({
    mutationFn: async ({ customerId, label }: { customerId: string; label: string }) => {
      await newRequest.delete(`/clients/${customerId}/labels/${encodeURIComponent(label)}`);
    },
    onMutate: async ({ customerId, label }) => {
      await queryClient.cancelQueries({ queryKey: ['customers'] });

      const previousData = queryClient.getQueryData(['customers']);

      queryClient.setQueryData(['customers'], (old: any) => {
        const oldData = old?.data || [];
        return {
          ...old,
          data: oldData.map((customer: any) => {
            if (customer._id === customerId) {
              return {
                ...customer,
                labels: (customer.labels || []).filter((l) => {
                  return l !== label;
                }),
              };
            }
            return customer;
          }),
        };
      });

      return { previousData };
    },
    onError: (err, { customerId, label }, context) => {
      queryClient.setQueryData(['customers'], context?.previousData);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
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
    if (newLabel && !labelOptions.includes(newLabel)) {
      handleAddLabel(customer, newLabel);
    }
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
          <SummaryCard
            label='Total'
            count={totalCustomers}
            onClick={() => {
              return removeFilter('status');
            }}
            active={!activeFilters.status}
          />
          <SummaryCard
            label='Active'
            count={activeCustomers}
            onClick={() => {
              return handleFilterChange('status', 'active');
            }}
            active={activeFilters.status === 'active'}
          />
          <SummaryCard
            label='Inactive'
            count={inactiveCustomers}
            onClick={() => {
              return handleFilterChange('status', 'inactive');
            }}
            active={activeFilters.status === 'inactive'}
          />
        </div>
      </div>

      {/* Controls */}
      <div className='px-4 flex items-center justify-between mb-4'>
        <div className='flex items-center gap-2'>
          <div className='relative flex items-center max-w-xs w-full'>
            <VscSearch className='w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-[#3F3F46]/60 dark:text-[#8b8b8b]' />
            <Input
              className='rounded-none pl-7 pr-10 border-slate-100 dark:border-[#232428]'
              placeholder='Search or filter'
              value={searchQuery}
              onChange={(e) => {
                return setSearchQuery(e.target.value);
              }}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type='button'
                  className='absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none'
                  aria-label='Filter'
                >
                  <VscListFilter className='w-4 h-4' />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className='text-xs w-[240px]'>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Calendar className='mr-2 w-4 h-4' /> Created Date
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem
                      onClick={() => {
                        return handleFilterChange('createdDate', 'today');
                      }}
                    >
                      Today
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        return handleFilterChange('createdDate', 'this_week');
                      }}
                    >
                      This Week
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        return handleFilterChange('createdDate', 'this_month');
                      }}
                    >
                      This Month
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        return handleFilterChange('createdDate', 'this_year');
                      }}
                    >
                      This Year
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Tag className='mr-2 w-4 h-4' /> Labels
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {Array.from(
                      new Set(
                        customersList
                          .flatMap((c) => {
                            return c.labels || [];
                          })
                          .filter(Boolean),
                      ),
                    ).map((label) => {
                      return (
                        <DropdownMenuItem
                          key={label}
                          onClick={() => {
                            return handleFilterChange('labels', label);
                          }}
                        >
                          {label}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <User className='mr-2 w-4 h-4' /> Status
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem
                      onClick={() => {
                        return handleFilterChange('status', 'active');
                      }}
                    >
                      Active
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        return handleFilterChange('status', 'inactive');
                      }}
                    >
                      Inactive
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Active Filters */}
          <div className='flex items-center gap-2 h-full'>
            {Object.entries(activeFilters).map(([type, value]) => {
              return (
                <div
                  key={`${type}-${value}`}
                  className='bg-[#e5e4e0] rounded-none text-[#878787] p-2 text-sm cursor-pointer group flex items-center gap-1 h-full hover:bg-[#d4d3cf] transition-colors dark:bg-[#1c1c1c] dark:border'
                  onClick={() => {
                    return removeFilter(type as 'status' | 'createdDate' | 'labels');
                  }}
                >
                  <FiX className='w-0 h-4 group-hover:w-4 transition-all duration-300' />
                  <span className='text-xs group-hover:text-[#878787] font-medium'>
                    {type === 'createdDate' && value === 'today' && 'Created Today'}
                    {type === 'createdDate' && value === 'this_week' && 'Created This Week'}
                    {type === 'createdDate' && value === 'this_month' && 'Created This Month'}
                    {type === 'createdDate' && value === 'this_year' && 'Created This Year'}
                    {type === 'labels' && `Label: ${value}`}
                    {type === 'status' && value.charAt(0).toUpperCase() + value.slice(1)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className='w-9 h-9 p-0' variant='outline'>
                <FilterIcon className='w-4 h-4' />
                <span className='sr-only'>Filter</span>
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
      </div>

      {/* Table */}
      <div className='flex-1 overflow-auto px-4'>
        {isLoading ? (
          <div className='flex items-center justify-center h-40'>
            <Loader2 className='w-6 h-6 animate-spin text-muted-foreground' />
          </div>
        ) : customersList.length === 0 ? (
          <div className='flex flex-col items-center justify-center h-40 text-muted-foreground'>
            No customers found
          </div>
        ) : (
          <div>
            <Table>
              <TableHeader>
                <TableRow className='bg-muted/50'>
                  {table.getHeaderGroups()[0].headers.map((header) => {
                    if (!visibleColumns[header.column.columnDef.header as string]) return null;
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
                    <TableRow
                      key={row.id}
                      className={`h-[57px] divide-x divide-slate-100 dark:divide-[#232428] cursor-pointer transition-colors duration-150 hover:bg-slate-50/50 dark:hover:bg-[#232428] ${
                        selectedCustomer?._id === row.original._id
                          ? 'bg-slate-50 dark:bg-[#232428]'
                          : ''
                      }`}
                      onClick={() => {
                        return setSelectedCustomer(row.original);
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
            {/* Infinite scroll observer */}
            <div ref={observerTarget} className='h-4' />
          </div>
        )}
      </div>

      {/* Mobile Preview Sheet */}
      {isMobile && selectedCustomer && (
        <Sheet
          open={!!selectedCustomer}
          onOpenChange={() => {
            return setSelectedCustomer(null);
          }}
        >
          <SheetContent side='bottom' className='h-[80vh]'>
            <SheetHeader>
              <SheetTitle>Customer Details</SheetTitle>
            </SheetHeader>
            {/* Add customer preview content here */}
          </SheetContent>
        </Sheet>
      )}

      <AddCustomerDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        initialData={editingCustomer}
        onEdit={(updatedCustomer) => {
          queryClient.invalidateQueries({ queryKey: ['customers'] });
          setAddDialogOpen(false);
          setEditingCustomer(null);
        }}
      />
    </div>
  );
}

function SummaryCard({
  label,
  count,
  onClick,
  active,
}: {
  label: string;
  count: number;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={`border bg-background text-card-foreground rounded-lg h-[100px] flex flex-col justify-center px-4 transition-colors ${
        active ? 'border-primary' : ''
      }`}
    >
      <p className='text-sm text-muted-foreground'>{label}</p>
      <p className='text-2xl font-mono font-medium'>{count.toLocaleString()}</p>
    </button>
  );
}
