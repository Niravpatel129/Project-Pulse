import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { newRequest } from '@/utils/newRequest';
import { useQueryClient } from '@tanstack/react-query';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import React, { useCallback, useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Input } from '../ui/input';

interface ColumnHeaderMenuProps {
  column: any; // AG Grid column
  deleteColumn: (columnId: string) => void;
  renameColumn?: (columnId: string, newName: string) => void;
}

const ColumnHeaderMenu: React.FC<ColumnHeaderMenuProps> = ({
  column,
  deleteColumn,
  renameColumn,
}) => {
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const queryClient = useQueryClient();
  const params = useParams();
  // Get the column definition and field
  const colDef = column.getColDef();
  console.log('🚀 column:', column);
  const field = colDef.field || '';
  const columnName = colDef.headerName || '';

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

  const handleRenameColumn = () => {
    setNewColumnName(columnName);
    setIsRenameDialogOpen(true);
  };

  const submitRenameColumn = async () => {
    try {
      await newRequest.patch(`/tables/${params.tableId}/columns/${columnId}`, {
        column: {
          name: newColumnName,
        },
      });

      // Update the column name in the grid
      if (renameColumn) {
        renameColumn(columnId, newColumnName);
      }

      // Force the column header to update in the grid
      if (column.getColDef) {
        const columnDef = column.getColDef();
        columnDef.headerName = newColumnName;
        column.setColDef(columnDef);
      }

      setIsRenameDialogOpen(false);
      toast.success('Column renamed successfully');
      queryClient.invalidateQueries({ queryKey: ['table', params.tableId] });
    } catch (error) {
      toast.error('Failed to rename column');
      console.error('Error renaming column:', error);
    }
  };

  return (
    <div
      className='flex items-center ml-2'
      onClick={(e) => {
        return e.stopPropagation();
      }}
    >
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename column</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            <Input
              type='text'
              value={newColumnName}
              onChange={(e) => {
                return setNewColumnName(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  submitRenameColumn();
                }
              }}
              autoFocus
            />
          </DialogDescription>
          <DialogFooter>
            <Button type='submit' onClick={submitRenameColumn}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
          <DropdownMenuItem onClick={handleRenameColumn}>
            <Pencil className='mr-2 h-4 w-4' />
            Rename column
          </DropdownMenuItem>
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
