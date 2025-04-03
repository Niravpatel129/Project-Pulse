import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { TableCell as UITableCell } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Column, Record } from '@/types/database';
import React, { memo, useCallback } from 'react';

interface TableCellProps {
  record: Record;
  column: Column;
  editingCell: {
    recordId: string | null;
    columnId: string | null;
    originalValue: string | null;
  };
  onEdit: () => void;
  onCellChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    recordId: string,
    columnId: string,
  ) => void;
  onCellKeyDown: (e: React.KeyboardEvent) => void;
  stopEditing: () => Promise<void>;
  inputRef: React.RefObject<HTMLInputElement>;
  newTagText: { [key: string]: string };
  setNewTagText: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  handleTagInputKeyDown: (e: React.KeyboardEvent, recordId: string) => void;
  removeTag: (recordId: string, tagId: string) => void;
  addTag: (recordId: string) => void;
  columnWidths: { [key: string]: number };
  handleColumnClick: (columnId: string) => void;
  isUpdating?: boolean;
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
    isUpdating,
  }: TableCellProps) => {
    const isEditing = editingCell.recordId === record._id && editingCell.columnId === column.id;

    const handleClick = useCallback(() => {
      if (column.sortable) {
        handleColumnClick(column.id);
      }
    }, [column.id, column.sortable, handleColumnClick]);

    const handleTagRemove = useCallback(
      (e: React.MouseEvent, tagId: string) => {
        e.stopPropagation();
        removeTag(record._id, tagId);
      },
      [record._id, removeTag],
    );

    const handleTagChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewTagText((prev) => {
          return { ...prev, [record._id]: e.target.value };
        });
      },
      [record._id, setNewTagText],
    );

    const handleTagKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        return handleTagInputKeyDown(e, record._id);
      },
      [handleTagInputKeyDown, record._id],
    );

    const handleTagBlur = useCallback(() => {
      addTag(record._id);
    }, [addTag, record._id]);

    const handleCellChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        return onCellChange(e, record._id, column.id);
      },
      [onCellChange, record._id, column.id],
    );

    const cellClassName = cn(
      'relative border-r p-2',
      column.sortable && 'cursor-pointer hover:bg-gray-50',
    );

    return (
      <UITableCell
        className={cellClassName}
        style={{ width: columnWidths[column.id] }}
        onClick={handleClick}
      >
        {/* {isUpdating && (
          <div className='absolute inset-0 flex items-center justify-center bg-gray-50/50'>
            <Loader2 className='h-4 w-4 animate-spin' />
          </div>
        )} */}

        {column.id === 'tags' ? (
          <div className='flex flex-wrap gap-1'>
            {record.values.tags.map((tag) => {
              return (
                <Badge key={tag.id} variant='outline' className='bg-amber-50 text-amber-700'>
                  {tag.name}
                  <button
                    className='ml-1 hover:text-amber-900'
                    onClick={(e) => {
                      return handleTagRemove(e, tag.id);
                    }}
                  >
                    ×
                  </button>
                </Badge>
              );
            })}
            {isEditing && (
              <Input
                ref={inputRef}
                value={newTagText[record._id] || ''}
                onChange={handleTagChange}
                onKeyDown={handleTagKeyDown}
                onBlur={handleTagBlur}
                placeholder='Add tag...'
                className='h-6 w-24'
              />
            )}
          </div>
        ) : isEditing ? (
          <Input
            ref={inputRef}
            value={record.values[column.id] || ''}
            onChange={handleCellChange}
            onKeyDown={onCellKeyDown}
            onBlur={stopEditing}
            className='h-8 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none border-none shadow-none p-0 m-0'
            autoFocus
          />
        ) : (
          <div className='min-h-[32px] flex items-center' onClick={onEdit}>
            {record.values[column.id] || ''}
          </div>
        )}
      </UITableCell>
    );
  },
);
TableCellMemo.displayName = 'TableCellMemo';
