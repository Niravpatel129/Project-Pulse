'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import React, { useState } from 'react';

export interface Column<T> {
  key: string;
  header: string | React.ReactNode;
  cell: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string | number;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchKeys?: (keyof T)[];
  pagination?: boolean;
  pageSize?: number;
  className?: string;
  emptyState?: React.ReactNode;
  onRowClick?: (item: T) => void;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  searchable = false,
  searchPlaceholder = 'Search...',
  searchKeys = [],
  pagination = false,
  pageSize = 10,
  className,
  emptyState,
  onRowClick,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Handle sorting
  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortDirection('asc');
    }
  };

  // Filter data based on search
  const filteredData = React.useMemo(() => {
    if (!search || !searchable || searchKeys.length === 0) return data;

    return data.filter((item) => {
      return searchKeys.some((key) => {
        const value = item[key as keyof T];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(search.toLowerCase());
        } else if (typeof value === 'number') {
          return value.toString().includes(search);
        }
        return false;
      });
    });
  }, [data, search, searchable, searchKeys]);

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!sortBy) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortBy as keyof T];
      const bValue = b[sortBy as keyof T];

      let comparison = 0;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime();
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortBy, sortDirection]);

  // Paginate data
  const paginatedData = React.useMemo(() => {
    if (!pagination) return sortedData;

    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return sortedData.slice(start, end);
  }, [sortedData, pagination, page, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const renderSortIcon = (key: string) => {
    if (sortBy !== key) return null;
    return sortDirection === 'asc' ? (
      <ArrowUp className='h-4 w-4' />
    ) : (
      <ArrowDown className='h-4 w-4' />
    );
  };

  return (
    <div className='space-y-4'>
      {searchable && (
        <div className='relative'>
          <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            type='search'
            placeholder={searchPlaceholder}
            className='pl-9'
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1); // Reset to first page on search
            }}
          />
        </div>
      )}

      <div className={`rounded-md border ${className}`}>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => {
                return (
                  <TableHead
                    key={column.key}
                    className={column.sortable ? 'cursor-pointer select-none' : ''}
                    onClick={() => {
                      if (column.sortable) {
                        handleSort(column.key);
                      }
                    }}
                  >
                    <div className='flex items-center gap-1'>
                      {column.header}
                      {column.sortable && renderSortIcon(column.key)}
                    </div>
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((item) => {
                return (
                  <TableRow
                    key={keyExtractor(item)}
                    className={onRowClick ? 'cursor-pointer' : ''}
                    onClick={() => {
                      return onRowClick && onRowClick(item);
                    }}
                  >
                    {columns.map((column) => {
                      return (
                        <TableCell key={`${keyExtractor(item)}-${column.key}`}>
                          {column.cell(item)}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center'>
                  {emptyState || <div className='text-muted-foreground'>No results found</div>}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && totalPages > 1 && (
        <div className='flex items-center justify-between'>
          <div className='text-sm text-muted-foreground'>
            Page {page} of {totalPages}
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                return setPage((prev) => {
                  return Math.max(prev - 1, 1);
                });
              }}
              disabled={page === 1}
            >
              <ChevronLeft className='h-4 w-4' />
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                return setPage((prev) => {
                  return Math.min(prev + 1, totalPages);
                });
              }}
              disabled={page === totalPages}
            >
              <ChevronRight className='h-4 w-4' />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
