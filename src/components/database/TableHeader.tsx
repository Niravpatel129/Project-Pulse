import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { iconMap } from '@/lib/icons';
import { Column, SortConfig } from '@/types/database';
import { ChevronDown, Key, Pencil, Plus, Trash2 } from 'lucide-react';
import React, { memo, useState } from 'react';
import { DraggableColumnHeader } from './DraggableColumnHeader';

interface TableHeaderProps {
  columns: Column[];
  sortConfig: SortConfig;
  onSort: (id: string) => void;
  onAddColumn: () => void;
  allSelected: boolean;
  toggleSelectAll: (checked: boolean) => void;
  onRenameColumn: (id: string, name: string) => void;
  onToggleVisibility: (id: string) => void;
  onSetPrimary: (id: string) => void;
  onDeleteColumn: (id: string) => void;
  renamingColumn: { id: string; name: string } | null;
  newColumnName: string;
  setNewColumnName: (name: string) => void;
  saveColumnRename: () => void;
  columnWidths: Record<string, number>;
  handleResizeStart: (e: React.MouseEvent, columnId: string) => void;
  moveColumn: (dragIndex: number, hoverIndex: number) => void;
}

export const TableHeaderMemo = memo(
  ({
    columns,
    sortConfig,
    onSort,
    onAddColumn,
    allSelected,
    toggleSelectAll,
    onRenameColumn,
    onToggleVisibility,
    onSetPrimary,
    onDeleteColumn,
    renamingColumn,
    newColumnName,
    setNewColumnName,
    saveColumnRename,
    columnWidths,
    handleResizeStart,
    moveColumn,
  }: TableHeaderProps) => {
    const [hoveredColumn, setHoveredColumn] = useState<string | null>(null);

    return (
      <TableHeader className='sticky top-0 z-10'>
        <TableRow className='bg-[#f8f9fa] hover:bg-[#f8f9fa] border-b border-t-0 border-[#e0e0e0]'>
          <TableHead className='w-10 border-r p-0'>
            <div className='flex items-center justify-center h-full'>
              <Checkbox
                checked={allSelected}
                onCheckedChange={toggleSelectAll}
                className='rounded-none border-[#dadce0]'
              />
            </div>
          </TableHead>
          {columns.map((column, index) => {
            if (!column) return;
            const Icon = iconMap[column.icon];

            const isHovered = hoveredColumn === column.id;
            return (
              <DraggableColumnHeader
                key={column.id}
                column={column}
                index={index}
                columnWidths={columnWidths}
                handleResizeStart={handleResizeStart}
                moveColumn={moveColumn}
              >
                <div
                  className='flex items-center justify-between h-9 px-2 select-none'
                  onMouseEnter={() => {
                    return setHoveredColumn(column.id);
                  }}
                  onMouseLeave={() => {
                    return setHoveredColumn(null);
                  }}
                  onClick={() => {
                    return onSort(column.id);
                  }}
                >
                  <div className='flex items-center gap-1'>
                    {renamingColumn?.id === column.id ? (
                      <Input
                        value={newColumnName}
                        onChange={(e) => {
                          return setNewColumnName(e.target.value);
                        }}
                        onBlur={saveColumnRename}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            saveColumnRename();
                          }
                        }}
                        className='h-7 w-32 border-blue-500 focus-visible:ring-1 focus-visible:ring-blue-500'
                        autoFocus
                      />
                    ) : (
                      <div className='flex items-center gap-1'>
                        {Icon && <Icon className='h-4 w-4 text-[#5f6368]' />}
                        <span className='font-medium text-[#5f6368]'>{column.name}</span>
                        {column.isPrimary && <Key className='h-3 w-3 text-blue-500' />}
                      </div>
                    )}
                  </div>
                  <div className='flex items-center'>
                    {/* Always render the button but conditionally show it based on hover state */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant='ghost'
                              size='icon'
                              className={`h-6 w-6 rounded-full hover:bg-gray-200 ${
                                isHovered ? 'opacity-100' : 'opacity-0'
                              } transition-opacity`}
                              onClick={(e) => {
                                return e.stopPropagation();
                              }}
                            >
                              <ChevronDown className='h-3 w-3 text-[#5f6368]' />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className='w-64 p-2 shadow-lg rounded-lg' align='end'>
                            <div className='space-y-1'>
                              <Button
                                variant='ghost'
                                size='sm'
                                className='w-full justify-start text-[#3c4043]'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  return onRenameColumn(column.id, column.name);
                                }}
                              >
                                <Pencil className='mr-2 h-4 w-4' />
                                <span>Rename</span>
                              </Button>

                              <div className='h-px bg-[#e0e0e0] my-1' />
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant='ghost'
                                    size='sm'
                                    className='w-full justify-start text-[#d93025] hover:text-[#d93025] hover:bg-red-50'
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      return onDeleteColumn(column.id);
                                    }}
                                    disabled={column.isPrimary}
                                  >
                                    <Trash2 className='mr-2 h-4 w-4' />
                                    <span>Delete</span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Delete column</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </TooltipTrigger>
                      <TooltipContent>More</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </DraggableColumnHeader>
            );
          })}
          <TableHead className='w-10 p-0'>
            <div className='flex items-center justify-center h-full'>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-7 w-7 rounded-full hover:bg-gray-200'
                      onClick={onAddColumn}
                    >
                      <Plus className='h-4 w-4 text-[#5f6368]' />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Add column</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </TableHead>
        </TableRow>
      </TableHeader>
    );
  },
);
TableHeaderMemo.displayName = 'TableHeaderMemo';
