import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import React, { useCallback } from 'react';

interface ColumnHeaderMenuProps {
  column: any; // AG Grid column
  deleteColumn: (columnId: string) => void;
}

const ColumnHeaderMenu: React.FC<ColumnHeaderMenuProps> = ({ column, deleteColumn }) => {
  // Get the column definition and field
  const colDef = column.getColDef();
  const field = colDef.field || '';

  // Extract the column ID from the field name (format: values.columnId)
  const columnId = field.replace('values.', '');

  const handleDeleteColumn = useCallback(() => {
    if (columnId && !isPrimaryColumn()) {
      deleteColumn(columnId);
    }
  }, [columnId, deleteColumn]);

  const isPrimaryColumn = useCallback(() => {
    // Check if this is the primary column or special column (like checkbox column)
    return colDef.checkboxSelection || !columnId || columnId === 'selected';
  }, [colDef, columnId]);

  // Don't show menu for checkbox column or if there's no valid columnId
  if (isPrimaryColumn()) {
    return null;
  }

  return (
    <div
      className='flex items-center ml-2'
      onClick={(e) => {
        return e.stopPropagation();
      }}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            size='icon'
            className='h-6 w-6 p-0 hover:bg-gray-100 rounded-full'
          >
            <MoreHorizontal className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='start'>
          <DropdownMenuItem onClick={handleDeleteColumn} className='text-destructive'>
            <Trash2 className='mr-2 h-4 w-4' />
            Delete column
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ColumnHeaderMenu;
