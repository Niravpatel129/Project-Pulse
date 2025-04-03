import { Input } from '@/components/ui/input';
import { TableCell as UITableCell } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Column, Record } from '@/types/database';
import React, { memo, useCallback, useRef } from 'react';

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
    const cellRef = useRef<HTMLTableCellElement>(null);

    const handleClick = useCallback(() => {
      onEdit();
      if (column.sortable) {
        handleColumnClick(column.id);
      }

      // Focus the input when the cell is clicked and it's in editing mode
      if (isEditing && inputRef.current) {
        inputRef.current.focus();
      }
    }, [column.id, column.sortable, handleColumnClick, isEditing, inputRef]);

    const handleCellChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        return onCellChange(e, record._id, column.id);
      },
      [onCellChange, record._id, column.id],
    );

    const cellClassName = cn(
      'relative border-r p-2',
      column.sortable && 'cursor-pointer hover:bg-gray-50 p-3',
    );

    return (
      <UITableCell
        className={cellClassName}
        style={{ width: columnWidths[column.id] }}
        ref={cellRef}
        onClick={handleClick}
      >
        {isEditing ? (
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
          <div className='min-h-[32px] flex items-center'>{record.values[column.id] || ''}</div>
        )}
      </UITableCell>
    );
  },
);
TableCellMemo.displayName = 'TableCellMemo';
