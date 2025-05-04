import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { newRequest } from '@/utils/newRequest';
import { useQueryClient } from '@tanstack/react-query';
import { GripVertical, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

// Import for drag and drop columns
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableColumn = ({ column, onRename }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: column.id,
  });
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(column.name);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleRename = () => {
    if (name.trim() && name !== column.name) {
      onRename(column.id, name);
    }
    setEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className='flex items-center gap-2 border px-3 py-2 rounded-md mb-2 bg-white'
    >
      <GripVertical className='h-5 w-5 text-gray-400 cursor-move' {...attributes} {...listeners} />
      {editing ? (
        <div className='flex flex-1 items-center gap-2'>
          <Input
            value={name}
            onChange={(e) => {
              return setName(e.target.value);
            }}
            autoFocus
            onBlur={handleRename}
            onKeyDown={(e) => {
              return e.key === 'Enter' && handleRename();
            }}
          />
          <Button size='sm' onClick={handleRename}>
            Save
          </Button>
        </div>
      ) : (
        <>
          <div className='flex-1'>
            <div className='font-medium'>{column.name}</div>
            <div className='text-xs text-gray-500'>{column.type}</div>
          </div>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => {
              return setEditing(true);
            }}
          >
            Rename
          </Button>
        </>
      )}
    </div>
  );
};

export function TableSettingsDialog({
  tableId,
  currentTableData,
  onColumnsReordered,
  onColumnRenamed,
}) {
  const [open, setOpen] = useState(false);
  const [tableName, setTableName] = useState('');
  const [columns, setColumns] = useState([]);
  const queryClient = useQueryClient();

  // Configure DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    if (currentTableData) {
      setTableName(currentTableData.name || '');
      setColumns(currentTableData.columns || []);
    }
  }, [currentTableData, open]);

  const handleUpdateTableName = async () => {
    if (!tableName.trim() || !tableId) return;

    try {
      await newRequest.put(`/tables/${tableId}`, {
        name: tableName.trim(),
      });

      toast.success('Table name updated successfully');
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      queryClient.invalidateQueries({ queryKey: ['table', tableId] });
    } catch (error) {
      console.error('Failed to update table name:', error);
      toast.error('Failed to update table name');
    }
  };

  const handleRenameColumn = async (columnId, newName) => {
    try {
      await newRequest.put(`/tables/${tableId}/columns/${columnId}`, {
        name: newName,
      });

      // Update local state
      setColumns(
        columns.map((col) => {
          return col.id === columnId ? { ...col, name: newName } : col;
        }),
      );

      // Call callback if provided
      if (onColumnRenamed) {
        onColumnRenamed(columnId, newName);
      }

      toast.success('Column renamed successfully');
      queryClient.invalidateQueries({ queryKey: ['table', tableId] });
    } catch (error) {
      console.error('Failed to rename column:', error);
      toast.error('Failed to rename column');
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setColumns((items) => {
        const oldIndex = items.findIndex((item) => {
          return item.id === active.id;
        });
        const newIndex = items.findIndex((item) => {
          return item.id === over.id;
        });

        return arrayMove(items, oldIndex, newIndex);
      });

      // Get the new order of column IDs
      const newColumnOrder = columns.map((col) => {
        return col.id;
      });

      try {
        // Send updated order to the server
        await newRequest.put(`/tables/${tableId}/columns/order`, {
          columnIds: newColumnOrder,
        });

        // Call callback if provided
        if (onColumnsReordered) {
          onColumnsReordered(newColumnOrder);
        }

        toast.success('Column order updated');
        queryClient.invalidateQueries({ queryKey: ['table', tableId] });
      } catch (error) {
        console.error('Failed to update column order:', error);
        toast.error('Failed to update column order');
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' size='icon'>
          <Settings className='h-4 w-4' />
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[600px] max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Table Settings</DialogTitle>
          <DialogDescription>
            Manage your table settings, column names, and column order
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue='general'>
          <TabsList className='mb-4'>
            <TabsTrigger value='general'>General</TabsTrigger>
            <TabsTrigger value='columns'>Columns</TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value='general' className='space-y-4'>
            <div className='grid gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='tableName'>Table Name</Label>
                <div className='flex gap-2'>
                  <Input
                    id='tableName'
                    value={tableName}
                    onChange={(e) => {
                      return setTableName(e.target.value);
                    }}
                    placeholder='Enter table name'
                  />
                  <Button onClick={handleUpdateTableName}>Save</Button>
                </div>
              </div>

              <Separator />

              <div className='space-y-2'>
                <Label>Table ID</Label>
                <div className='text-sm text-muted-foreground flex items-center gap-2 p-2 border rounded-md bg-muted/50'>
                  {tableId}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Columns Tab */}
          <TabsContent value='columns' className='space-y-4'>
            <div className='text-sm text-muted-foreground mb-4'>
              Drag to reorder columns. Click &quot;Rename&quot; to change column names.
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={columns.map((col) => {
                  return col.id;
                })}
                strategy={verticalListSortingStrategy}
              >
                <div className='space-y-2'>
                  {columns.map((column) => {
                    return (
                      <SortableColumn
                        key={column.id}
                        column={column}
                        onRename={handleRenameColumn}
                      />
                    );
                  })}
                </div>
              </SortableContext>
            </DndContext>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => {
              return setOpen(false);
            }}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
