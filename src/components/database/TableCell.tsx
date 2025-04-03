import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TableCell as UITableCell } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Column, Record as DatabaseRecord } from '@/types/database';
import { Plus, X } from 'lucide-react';
import React, { memo } from 'react';

interface TableCellProps {
  record: DatabaseRecord;
  column: Column;
  editingCell: { recordId: number; columnId: string } | null;
  onEdit: () => void;
  onCellChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    recordId: number,
    columnId: string,
  ) => void;
  onCellKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  stopEditing: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
  newTagText: Record<string, string>;
  setNewTagText: (value: Record<string, string>) => void;
  handleTagInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, recordId: number) => void;
  removeTag: (recordId: number, tagId: string) => void;
  addTag: (recordId: number) => void;
  columnWidths: Record<string, number>;
  handleColumnClick: (columnId: string) => void;
}

export const TableCellMemo = memo(
  ({
    record,
    column,
    editingCell,
    onEdit,
    onCellChange,
    onCellKeyDown,
    stopEditing,
    inputRef,
    newTagText,
    setNewTagText,
    handleTagInputKeyDown,
    removeTag,
    addTag,
    columnWidths,
    handleColumnClick,
  }: TableCellProps) => {
    return (
      <UITableCell
        className={`border-r min-h-[40px] h-[40px] transition-colors ${
          editingCell?.recordId === record.id && editingCell?.columnId === column.id
            ? 'bg-blue-50'
            : ''
        } ${column.sortable ? 'cursor-pointer hover:bg-gray-50' : ''}`}
        onClick={(e) => {
          if (column.sortable && !editingCell?.recordId) {
            e.stopPropagation();
            handleColumnClick(column.id);
          } else {
            onEdit();
          }
        }}
        style={{
          width: columnWidths[column.id] || 200,
          maxWidth: columnWidths[column.id] || 200,
        }}
      >
        {column.id === 'tags' ? (
          <div className='flex flex-wrap gap-1 items-center'>
            {record.tags?.map((tag) => {
              return (
                <Badge
                  key={tag.id}
                  variant='outline'
                  className='bg-amber-50 text-amber-700 hover:bg-amber-50 border-amber-200 flex items-center gap-1'
                >
                  {tag.name}
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-4 w-4 p-0 hover:bg-amber-100'
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTag(record.id, tag.id);
                    }}
                  >
                    <X className='h-3 w-3' />
                  </Button>
                </Badge>
              );
            })}
            <div className='flex items-center'>
              <Input
                value={newTagText[record.id] || ''}
                onChange={(e) => {
                  setNewTagText({
                    ...newTagText,
                    [record.id]: e.target.value,
                  });
                }}
                onKeyDown={(e) => {
                  return handleTagInputKeyDown(e, record.id);
                }}
                className='h-6 w-20 min-w-20 text-xs'
                placeholder='Add tag...'
                onClick={(e) => {
                  return e.stopPropagation();
                }}
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-6 w-6 ml-1'
                      onClick={(e) => {
                        e.stopPropagation();
                        addTag(record.id);
                      }}
                    >
                      <Plus className='h-3 w-3' />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Add tag</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        ) : (
          <div className='min-h-[28px] h-[28px] flex items-center w-full'>
            {editingCell?.recordId === record.id && editingCell?.columnId === column.id ? (
              <Input
                ref={inputRef}
                value={record[column.id] || ''}
                onChange={(e) => {
                  return onCellChange(e, record.id, column.id);
                }}
                onBlur={stopEditing}
                onKeyDown={onCellKeyDown}
                className='h-8 m-0 p-2 w-full'
                autoFocus
              />
            ) : column.id === 'name' ? (
              <div className='font-medium'>
                {record.id}. {record[column.id]}
              </div>
            ) : (
              record[column.id]
            )}
          </div>
        )}
      </UITableCell>
    );
  },
);
TableCellMemo.displayName = 'TableCellMemo';
