'use client';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useState } from 'react';

interface ColumnMeta {
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  visibleColumns: Record<string, boolean>;
  selectedItem?: T | null;
  onSelectItem?: (item: T) => void;
  isLoading?: boolean;
  emptyState?: {
    title: string;
    description: string;
    buttonText: string;
    onButtonClick: () => void;
  };
  columnOrder: string[];
  onColumnOrderChange: (order: string[]) => void;
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

export const TableSkeleton = ({ headers }: { headers: { className: string }[] }) => {
  return (
    <div className='overflow-x-auto rounded-lg border border-slate-100 dark:border-[#232428] shadow-sm'>
      <table className='min-w-full text-sm'>
        <thead className='!font-normal'>
          <tr className='divide-x divide-slate-100 dark:divide-[#232428] border-b border-slate-100 dark:border-[#232428] dark:bg-[#232428]'>
            {headers.map((header, index) => {
              return (
                <th
                  key={index}
                  className={`${header.className} text-left text-[#121212] dark:text-slate-300 tracking-wide font-light`}
                >
                  <Skeleton className='h-4 w-24' />
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className='divide-y divide-slate-100 dark:divide-[#232428]'>
          {[...Array(5)].map((_, index) => {
            return (
              <tr key={index} className='h-[57px] divide-x divide-slate-100 dark:divide-[#232428]'>
                {headers.map((header, cellIndex) => {
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

export function DataTable<T>({
  data,
  columns,
  visibleColumns,
  selectedItem,
  onSelectItem,
  isLoading,
  emptyState,
  columnOrder,
  onColumnOrderChange,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnOrder,
    },
    onSortingChange: setSorting,
    onColumnOrderChange: onColumnOrderChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      onColumnOrderChange(
        arrayMove(
          columnOrder,
          columnOrder.indexOf(active.id as string),
          columnOrder.indexOf(over?.id as string),
        ),
      );
    }
  };

  if (isLoading) {
    return (
      <TableSkeleton
        headers={columns.map((col) => {
          return col.meta as { className: string };
        })}
      />
    );
  }

  if (data.length === 0 && emptyState) {
    return (
      <div className='flex flex-col items-center justify-center py-24'>
        <h2 className='text-2xl font-semibold mb-2'>{emptyState.title}</h2>
        <p className='text-gray-500 mb-6 text-center'>{emptyState.description}</p>
        <Button variant='outline' onClick={emptyState.onButtonClick}>
          {emptyState.buttonText}
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
              const item = row.original as any;
              return (
                <TableRow
                  key={row.id}
                  className={`h-[57px] divide-x divide-slate-100 dark:divide-[#232428] cursor-pointer transition-colors duration-150 hover:bg-slate-50/50 dark:hover:bg-[#232428] ${
                    selectedItem === item ? 'bg-slate-50 dark:bg-[#232428]' : ''
                  }`}
                  onClick={() => {
                    return onSelectItem?.(item);
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
    </div>
  );
}
