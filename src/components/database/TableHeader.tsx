import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Column, SortConfig } from '@/types/database';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  BarChart2,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  GripVertical,
  Info,
  Key,
  Palette,
  Pencil,
  Plus,
  Settings2,
  Trash2,
  Type,
} from 'lucide-react';
import React, { memo } from 'react';
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
    return (
      <TableHeader className='sticky top-0 z-10'>
        <TableRow className='bg-white hover:bg-white'>
          <TableHead className='w-10 border-r'>
            <Checkbox checked={allSelected} onCheckedChange={toggleSelectAll} />
          </TableHead>
          {columns.map((column, index) => {
            return (
              <DraggableColumnHeader
                key={column.id}
                column={column}
                index={index}
                columnWidths={columnWidths}
                handleResizeStart={handleResizeStart}
                moveColumn={moveColumn}
              >
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <GripVertical className='h-4 w-4 text-gray-400 cursor-move' />
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
                        className='h-7 w-32'
                        autoFocus
                      />
                    ) : (
                      <>
                        <span className='font-medium'>{column.name}</span>
                        {column.isPrimary && <Key className='h-3 w-3 text-primary' />}
                      </>
                    )}
                  </div>
                  <div className='flex items-center gap-1'>
                    {column.sortable && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='h-7 w-7 hover:bg-gray-100'
                              onClick={() => {
                                return onSort(column.id);
                              }}
                            >
                              {sortConfig?.key === column.id ? (
                                sortConfig.direction === 'asc' ? (
                                  <ChevronUp className='h-3.5 w-3.5 text-primary' />
                                ) : (
                                  <ChevronDown className='h-3.5 w-3.5 text-primary' />
                                )
                              ) : (
                                <ChevronDown className='h-3.5 w-3.5 text-gray-500' />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {sortConfig?.key === column.id
                              ? `Sorted ${
                                  sortConfig.direction === 'asc' ? 'ascending' : 'descending'
                                }`
                              : 'Sort column'}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant='ghost'
                                size='icon'
                                className='h-7 w-7 hover:bg-gray-100'
                              >
                                <Settings2 className='h-3.5 w-3.5' />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className='w-64 p-2' align='end'>
                              <div className='space-y-1'>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  className='w-full justify-start'
                                  onClick={() => {
                                    return onRenameColumn(column.id, column.name);
                                  }}
                                >
                                  <Pencil className='mr-2 h-4 w-4' />
                                  <span>Rename</span>
                                </Button>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  className='w-full justify-start'
                                  onClick={() => {
                                    return onToggleVisibility(column.id);
                                  }}
                                >
                                  {column.hidden ? (
                                    <>
                                      <Eye className='mr-2 h-4 w-4' />
                                      <span>Show</span>
                                    </>
                                  ) : (
                                    <>
                                      <EyeOff className='mr-2 h-4 w-4' />
                                      <span>Hide</span>
                                    </>
                                  )}
                                </Button>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  className='w-full justify-start'
                                  onClick={() => {
                                    return onSetPrimary(column.id);
                                  }}
                                  disabled={column.isPrimary}
                                >
                                  <Key className='mr-2 h-4 w-4' />
                                  <span>{column.isPrimary ? 'Primary Key' : 'Set as Primary'}</span>
                                </Button>
                                <div className='h-px bg-border my-1' />
                                <Button variant='ghost' size='sm' className='w-full justify-start'>
                                  <Type className='mr-2 h-4 w-4' />
                                  <span>Change Type</span>
                                </Button>
                                <Button variant='ghost' size='sm' className='w-full justify-start'>
                                  <GripVertical className='mr-2 h-4 w-4' />
                                  <span>Adjust Width</span>
                                </Button>

                                <Button variant='ghost' size='sm' className='w-full justify-start'>
                                  <Palette className='mr-2 h-4 w-4' />
                                  <span>Column Color</span>
                                </Button>
                                <Button variant='ghost' size='sm' className='w-full justify-start'>
                                  <Info className='mr-2 h-4 w-4' />
                                  <span>Add Description</span>
                                </Button>
                                <Button variant='ghost' size='sm' className='w-full justify-start'>
                                  <BarChart2 className='mr-2 h-4 w-4' />
                                  <span>Column Statistics</span>
                                </Button>
                                <div className='h-px bg-border my-1' />
                                <div className='flex items-center gap-1 px-2 py-1  rounded-md'>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant='ghost'
                                          size='icon'
                                          className='h-7 w-7 hover:bg-gray-200'
                                        >
                                          <AlignLeft className='h-3.5 w-3.5' />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Align left</TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant='ghost'
                                          size='icon'
                                          className='h-7 w-7 hover:bg-gray-200'
                                        >
                                          <AlignCenter className='h-3.5 w-3.5' />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Align center</TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant='ghost'
                                          size='icon'
                                          className='h-7 w-7 hover:bg-gray-200'
                                        >
                                          <AlignRight className='h-3.5 w-3.5' />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Align right</TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                                <div className='h-px bg-border my-1' />
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  className='w-full justify-start text-destructive hover:text-destructive'
                                  onClick={() => {
                                    return onDeleteColumn(column.id);
                                  }}
                                  disabled={column.isPrimary}
                                >
                                  <Trash2 className='mr-2 h-4 w-4' />
                                  <span>Delete</span>
                                </Button>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </TooltipTrigger>
                        <TooltipContent>Column settings</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </DraggableColumnHeader>
            );
          })}
          <TableHead className='w-10'>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant='ghost' size='icon' className='h-8 w-8' onClick={onAddColumn}>
                    <Plus className='h-4 w-4' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Add new column</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </TableHead>
        </TableRow>
      </TableHeader>
    );
  },
);
TableHeaderMemo.displayName = 'TableHeaderMemo';
