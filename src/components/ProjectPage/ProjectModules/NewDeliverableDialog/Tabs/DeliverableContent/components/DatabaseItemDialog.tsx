import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { newRequest } from '@/utils/newRequest';
import { useQuery } from '@tanstack/react-query';
import { Check, Database, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DatabaseItemDialogProps } from '../types';
import { getIconForTableType } from '../utils/helpers';
import SharedDisplayItemDetails from './SharedDisplayItemDetails';

// DatabaseItemDialog component for selecting database items
const DatabaseItemDialog = ({
  isOpen,
  onClose,
  selectedDatabaseId,
  setSelectedDatabaseId,
  selectedItem,
  onSelectItem,
  onSave,
  alignment,
  setAlignment,
  initialVisibleColumns = {},
}: DatabaseItemDialogProps) => {
  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleColumns, setVisibleColumns] =
    useState<Record<string, boolean>>(initialVisibleColumns);

  // Reset search when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  // Reset visibility settings when initialVisibleColumns changes
  useEffect(() => {
    if (Object.keys(initialVisibleColumns).length > 0) {
      setVisibleColumns(initialVisibleColumns);
    }
  }, [initialVisibleColumns]);

  // Fetch tables using React Query
  const { data: tables = [] } = useQuery<any[]>({
    queryKey: ['tables'],
    queryFn: async () => {
      const response = await newRequest.get('/tables/workspace');
      return response.data.data;
    },
  });

  // Also fetch column definitions to understand what each field represents
  const { data: tableColumns = [] } = useQuery<any[]>({
    queryKey: ['tableColumns', selectedDatabaseId],
    queryFn: async () => {
      if (!selectedDatabaseId) return [];
      const response = await newRequest.get(`/tables/${selectedDatabaseId}`);
      return response.data.data?.columns || [];
    },
    enabled: !!selectedDatabaseId,
  });

  // Fetch items for selected database
  const { data: databaseItemsRaw = [] } = useQuery({
    queryKey: ['tableItems', selectedDatabaseId],
    queryFn: async () => {
      if (!selectedDatabaseId) return [];
      const response = await newRequest.get(`/tables/${selectedDatabaseId}/records`);
      return response.data.data;
    },
    enabled: !!selectedDatabaseId,
  });

  // Set up initial column visibility when columns change
  useEffect(() => {
    if (tableColumns.length > 0 && Object.keys(visibleColumns).length === 0) {
      const initialVisibility: Record<string, boolean> = {};
      tableColumns.forEach((column: any) => {
        // By default show all columns except internal/system ones
        const isSystem = ['id', 'position', '_id', '__v', 'createdAt', 'updatedAt'].includes(
          column.name,
        );
        initialVisibility[column.id] = !isSystem;
      });
      setVisibleColumns(initialVisibility);
    }
  }, [tableColumns, visibleColumns]);

  // Process raw records into usable format
  const databaseItems = databaseItemsRaw.map((row: any) => {
    // Create a base item with row ID
    const item: any = {
      id: row.rowId,
      position: row.position,
    };

    // Process each record and combine values
    row.records.forEach((record: any) => {
      // Find the column definition to get the column name
      const column = tableColumns.find((col: any) => {
        return col.id === record.columnId;
      });
      if (column && record.values[record.columnId] !== undefined) {
        // Use column name as the key if available, otherwise use columnId
        const key = column.name || record.columnId;
        item[key] = record.values[record.columnId];

        // If this is the first column or marked as primary, also set it as name for convenience
        if (column.isPrimaryKey || column.order === 0) {
          item.name = record.values[record.columnId];
        }
      }
    });

    return item;
  });

  // Transform tables into the format expected by the component
  const databases = tables.map((table: any) => {
    return {
      id: table._id,
      name: table.name,
      description: table.description || 'No description',
      icon: getIconForTableType(table.name),
    };
  });

  // Save handler
  const handleSave = () => {
    onSave(selectedItem, selectedDatabaseId, visibleColumns, alignment);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className='fixed inset-0 bg-black/70 z-50 flex items-center justify-center'
      onClick={onClose}
    >
      <div
        className='bg-white rounded-lg shadow-xl border border-neutral-200 w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col'
        onClick={(e) => {
          return e.stopPropagation();
        }}
      >
        <div className='p-4 border-b border-neutral-200 flex justify-between items-center'>
          <h3 className='font-medium text-lg'>Select Database Item</h3>
          <Button variant='ghost' size='icon' onClick={onClose} className='h-8 w-8 rounded-full'>
            <X size={16} />
          </Button>
        </div>

        <div className='p-4 border-b border-neutral-100 bg-neutral-50'>
          {/* Database type selector */}
          <div className='mb-2'>
            <Label className='text-sm text-neutral-700'>Database Type</Label>
            <Select
              value={selectedDatabaseId || ''}
              onValueChange={(value) => {
                return setSelectedDatabaseId(value || null);
              }}
            >
              <SelectTrigger className='w-full mt-1'>
                <SelectValue placeholder='Select a database' />
              </SelectTrigger>
              <SelectContent>
                {databases.map((database) => {
                  return (
                    <SelectItem key={database.id} value={database.id}>
                      {database.name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className='p-4 flex-grow overflow-auto'>
          {selectedDatabaseId ? (
            <>
              <div className='mb-4 relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-4 w-4 text-neutral-400'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                    />
                  </svg>
                </div>
                <Input
                  type='text'
                  placeholder='Search items...'
                  value={searchTerm}
                  onChange={(e) => {
                    return setSearchTerm(e.target.value);
                  }}
                  className='pl-10 pr-4 py-2 border-neutral-200 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50'
                />
              </div>

              {databaseItems.length > 0 ? (
                <div className='grid grid-cols-1 gap-2.5 min-h-[200px] max-h-[400px] overflow-y-auto pr-1'>
                  {databaseItems
                    .filter((item: any) => {
                      // Search in all string values
                      return Object.entries(item).some(([key, value]) => {
                        return (
                          typeof value === 'string' &&
                          value.toLowerCase().includes(searchTerm.toLowerCase())
                        );
                      });
                    })
                    .map((item: any) => {
                      return (
                        <div
                          key={item.id}
                          className={`p-3.5 border rounded-lg flex items-start gap-3 cursor-pointer hover:bg-neutral-50 transition-colors ${
                            selectedItem?.id === item.id
                              ? 'bg-blue-50 border-blue-200 shadow-sm'
                              : 'border-neutral-200'
                          }`}
                          onClick={() => {
                            return onSelectItem(item);
                          }}
                        >
                          {selectedItem?.id === item.id ? (
                            <div className='mt-1 h-5 w-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0'>
                              <Check className='h-3 w-3 text-white' />
                            </div>
                          ) : (
                            <div className='mt-1 h-5 w-5 border-2 border-neutral-200 rounded-full flex-shrink-0'></div>
                          )}
                          <div className='flex-1 min-w-0'>
                            <SharedDisplayItemDetails
                              item={item}
                              tableColumns={tableColumns}
                              visibleColumns={visibleColumns}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className='text-center py-10 bg-neutral-50 rounded-lg border border-dashed border-neutral-200'>
                  <Database className='h-10 w-10 mx-auto text-neutral-300 mb-3' />
                  <p className='text-neutral-700 font-medium mb-1'>No records found</p>
                  <p className='text-neutral-500 text-sm max-w-xs mx-auto'>
                    This table doesn&apos;t contain any records yet. Try selecting a different
                    database.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className='text-center py-8'>
              <Database className='h-12 w-12 mx-auto text-neutral-300 mb-3' />
              <p className='text-neutral-600 font-medium'>Select a database type</p>
              <p className='text-neutral-500 text-sm mt-1'>Choose from the dropdown above</p>
            </div>
          )}
        </div>

        <div className='p-4 border-t border-neutral-200 flex justify-between'>
          <div className='flex items-center gap-2'>
            <Label className='text-xs text-neutral-500'>Alignment:</Label>
            <div className='flex flex-wrap gap-1'>
              <Button
                type='button'
                size='sm'
                variant={alignment === 'left' ? 'default' : 'outline'}
                onClick={() => {
                  return setAlignment('left');
                }}
                className='h-7 text-xs'
              >
                Left
              </Button>
              <Button
                type='button'
                size='sm'
                variant={alignment === 'center' ? 'default' : 'outline'}
                onClick={() => {
                  return setAlignment('center');
                }}
                className='h-7 text-xs'
              >
                Center
              </Button>
              <Button
                type='button'
                size='sm'
                variant={alignment === 'right' ? 'default' : 'outline'}
                onClick={() => {
                  return setAlignment('right');
                }}
                className='h-7 text-xs'
              >
                Right
              </Button>
            </div>
          </div>

          <div className='flex gap-2'>
            <Button variant='outline' onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!selectedItem}>
              Select Item
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseItemDialog;
