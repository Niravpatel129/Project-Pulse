import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Plus } from 'lucide-react';
import { useCallback, useEffect, useMemo } from 'react';
import InvoiceItemAttachment from './InvoiceItemAttachment';
import InvoiceItemDetails from './InvoiceItemDetails';
import { InvoiceItem } from './types';

interface InvoiceItemsProps {
  allItems: InvoiceItem[];
  selectedItems: InvoiceItem[];
  toggleItemSelection: (item: InvoiceItem) => void;
  isItemSelected: (itemId: string) => boolean;
  addAllItems: (type: 'task' | 'deliverable') => void;
  removeAllItems: (type: 'task' | 'deliverable') => void;
  areAllItemsSelected: (type: 'task' | 'deliverable') => boolean;
}

const InvoiceItems = ({
  allItems,
  selectedItems,
  toggleItemSelection,
  addAllItems,
  removeAllItems,
}: InvoiceItemsProps) => {
  // Memoize filtered items to avoid recalculation on every render
  const deliverableItems = useMemo(() => {
    return allItems.filter((item) => {
      return !item.id.startsWith('task-');
    });
  }, [allItems]);

  const taskItems = useMemo(() => {
    return allItems.filter((item) => {
      return item.id.startsWith('task-');
    });
  }, [allItems]);

  // Calculate selected IDs map for efficient lookup
  const selectedIdsMap = useMemo(() => {
    const map = new Map();
    selectedItems.forEach((item) => {
      // Store both the id and _id (if available) to handle both formats
      map.set(item.id, true);
      if (item._id) map.set(item._id, true);
    });
    return map;
  }, [selectedItems]);

  // Safer item selection check that handles both id and _id
  const isSafelySelected = useCallback(
    (item: InvoiceItem) => {
      if (selectedIdsMap.has(item.id)) return true;
      if (item._id && selectedIdsMap.has(item._id)) return true;
      return false;
    },
    [selectedIdsMap],
  );

  // Directly calculate if all items are selected
  const areAllDeliverablesSelected = useMemo(() => {
    return (
      deliverableItems.length > 0 &&
      deliverableItems.every((item) => {
        return isSafelySelected(item);
      })
    );
  }, [deliverableItems, isSafelySelected]);

  const areAllTasksSelected = useMemo(() => {
    return (
      taskItems.length > 0 &&
      taskItems.every((item) => {
        return isSafelySelected(item);
      })
    );
  }, [taskItems, isSafelySelected]);

  // Force re-render when selection state changes
  useEffect(() => {
    // This effect will run whenever selectedItems changes
    // The component will re-render with the updated selection state
  }, [selectedItems, areAllDeliverablesSelected, areAllTasksSelected]);

  return (
    <Tabs defaultValue='deliverables'>
      <TabsList className='mb-4'>
        <TabsTrigger value='deliverables'>Deliverables</TabsTrigger>
        <TabsTrigger value='tasks'>Tasks & Hours</TabsTrigger>
      </TabsList>

      <TabsContent value='deliverables' className='space-y-6'>
        {deliverableItems.length > 0 ? (
          <div>
            <div className='flex justify-between items-center mb-3'>
              <h3 className='font-medium text-sm'>Project Deliverables</h3>
              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  return areAllDeliverablesSelected
                    ? removeAllItems('deliverable')
                    : addAllItems('deliverable');
                }}
                className={
                  areAllDeliverablesSelected
                    ? 'text-red-500 border-red-200 hover:bg-red-50'
                    : 'text-green-600 border-green-200 hover:bg-green-50'
                }
                disabled={!areAllDeliverablesSelected && deliverableItems.length === 0}
              >
                {areAllDeliverablesSelected ? (
                  <>
                    <Check className='h-4 w-4 mr-1' /> Remove All
                  </>
                ) : (
                  <>
                    <Plus className='h-4 w-4 mr-1' /> Add All
                  </>
                )}
              </Button>
            </div>
            <div className='space-y-4'>
              {deliverableItems.map((item) => {
                const selected = isSafelySelected(item);
                return (
                  <div
                    key={`${item._id || item.id}-${selected ? 'selected' : 'not-selected'}`}
                    className={`border rounded-lg p-4 relative ${
                      selected ? '' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className='flex justify-between'>
                      <div>
                        <div className='flex items-center gap-2 flex-wrap'>
                          <h3 className='font-medium'>{item.name}</h3>
                          <Badge
                            variant={item.status === 'completed' ? 'default' : 'outline'}
                            className='text-xs'
                          >
                            {item.status}
                          </Badge>
                          {item.type === 'physical' && (
                            <Badge
                              variant='outline'
                              className='bg-blue-50 text-blue-600 border-blue-200 text-xs'
                            >
                              Physical Product
                            </Badge>
                          )}
                          {item.labels?.map((label, index) => {
                            return (
                              <Badge
                                key={`${item._id || item.id}-label-${index}`}
                                variant='outline'
                                className='bg-gray-50 text-gray-600 border-gray-200 text-xs'
                              >
                                {label}
                              </Badge>
                            );
                          })}
                        </div>
                        <p className='text-gray-500 text-sm mt-1'>{item.description}</p>

                        {/* Display dynamic fields */}
                        {item.fields && (
                          <div className='mt-3'>
                            <div className='flex items-center gap-2 mb-2'>
                              <span className='text-sm text-gray-500'>
                                {
                                  Object.keys(item.fields).filter((key) => {
                                    return !['unitPrice', 'quantity', 'total'].includes(key);
                                  }).length
                                }{' '}
                                field details
                              </span>

                              <Popover modal>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant='outline'
                                    size='sm'
                                    className='h-7 px-2 gap-1 text-blue-600 border-blue-200 hover:bg-blue-50'
                                  >
                                    <svg
                                      viewBox='0 0 24 24'
                                      width='14'
                                      height='14'
                                      fill='none'
                                      stroke='currentColor'
                                      strokeWidth='2'
                                    >
                                      <circle cx='12' cy='12' r='10' />
                                      <path d='M12 16v-4M12 8h.01' />
                                    </svg>
                                    View Details
                                  </Button>
                                </PopoverTrigger>
                                <InvoiceItemDetails item={item} />
                              </Popover>
                            </div>

                            {/* Mini preview always visible */}
                            <div className='mb-2 text-sm text-gray-600 flex flex-wrap gap-x-3 gap-y-1'>
                              {Object.entries(item.fields)
                                .filter(([key]) => {
                                  return !['total', 'unitPrice', 'quantity'].includes(key);
                                })
                                .slice(0, 2)
                                .map(([key, value]) => {
                                  let displayValue = '';
                                  if (typeof value === 'object' && value !== null) {
                                    if (Array.isArray(value)) {
                                      displayValue =
                                        value.length > 0 ? `${value.length} items` : '';
                                    } else {
                                      displayValue =
                                        Object.keys(value).length > 0
                                          ? `${Object.keys(value).length} details`
                                          : '';
                                    }
                                  } else if (value !== null && value !== undefined) {
                                    displayValue =
                                      String(value).length > 18
                                        ? String(value).substring(0, 18) + '...'
                                        : String(value);
                                  }
                                  return displayValue ? (
                                    <div
                                      key={`${item._id || item.id}-mini-${key}`}
                                      className='flex items-center'
                                    >
                                      <span className='text-gray-500 capitalize mr-1'>
                                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                                      </span>
                                      <span>{displayValue}</span>
                                    </div>
                                  ) : null;
                                })}
                            </div>
                          </div>
                        )}

                        {/* Display attachments if available */}
                        {item.attachments && item.attachments.length > 0 && (
                          <div className='mt-3 border-t pt-2'>
                            <div className='text-xs text-gray-500 mb-2'>Attachments:</div>
                            <div className='flex gap-2 flex-wrap'>
                              {item.attachments.map((attachment, index) => {
                                return (
                                  <Popover key={`${item._id || item.id}-attachment-${index}`} modal>
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant='outline'
                                        size='sm'
                                        className='text-xs h-7 flex items-center gap-1 bg-gray-50'
                                      >
                                        <svg
                                          viewBox='0 0 24 24'
                                          width='12'
                                          height='12'
                                          fill='none'
                                          stroke='currentColor'
                                          strokeWidth='2'
                                        >
                                          <path d='M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48' />
                                        </svg>
                                        {attachment.title || 'Attachment'}
                                      </Button>
                                    </PopoverTrigger>
                                    <InvoiceItemAttachment attachment={attachment} />
                                  </Popover>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                      <Button
                        variant='outline'
                        onClick={() => {
                          return toggleItemSelection(item);
                        }}
                        className={
                          selected
                            ? 'text-red-500 hover:bg-red-50'
                            : 'text-green-500 hover:bg-green-50 border-green-200'
                        }
                      >
                        {selected ? 'Remove' : 'Add'}
                      </Button>
                    </div>

                    <div className='mt-3 flex items-center gap-2'>
                      <span className='text-gray-700'>
                        $
                        {item.fields?.unitPrice
                          ? item.fields.unitPrice.toFixed(2)
                          : item.price.toFixed(2)}
                      </span>
                      {(item.fields?.quantity || item.quantity) &&
                        (item.fields?.quantity || item.quantity) > 1 && (
                          <>
                            <span className='text-gray-400'>•</span>
                            <span className='text-gray-500 text-sm'>
                              Qty: {item.fields?.quantity || item.quantity}
                            </span>
                          </>
                        )}
                      <span className='text-gray-400'>•</span>
                      <span className='text-gray-500 text-sm'>
                        {item.date ||
                          (item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '')}
                      </span>

                      {/* Display total if available */}
                      {item.fields?.total && (
                        <>
                          <span className='text-gray-400'>•</span>
                          <span className='text-gray-700 font-medium'>
                            Total: ${item.fields.total.toFixed(2)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className='py-8 text-center text-gray-500'>
            No items found.
            <p className='text-sm mt-2'>
              If no items are showing, try refreshing the page or check your project settings.
            </p>
          </div>
        )}
      </TabsContent>

      <TabsContent value='tasks' className='space-y-6'>
        {taskItems.length > 0 ? (
          <div>
            <div className='flex justify-between items-center mb-3'>
              <h3 className='font-medium text-sm'>Project Tasks</h3>
              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  return areAllTasksSelected ? removeAllItems('task') : addAllItems('task');
                }}
                className={
                  areAllTasksSelected
                    ? 'text-red-500 border-red-200 hover:bg-red-50'
                    : 'text-green-600 border-green-200 hover:bg-green-50'
                }
                disabled={!areAllTasksSelected && taskItems.length === 0}
              >
                {areAllTasksSelected ? (
                  <>
                    <Check className='h-4 w-4 mr-1' /> Remove All
                  </>
                ) : (
                  <>
                    <Plus className='h-4 w-4 mr-1' /> Add All
                  </>
                )}
              </Button>
            </div>
            <div className='space-y-4'>
              {taskItems.map((item) => {
                const selected = isSafelySelected(item);
                return (
                  <div
                    key={`${item._id || item.id}-${selected ? 'selected' : 'not-selected'}`}
                    className={`border rounded-lg p-4 relative ${
                      selected ? '' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className='flex justify-between'>
                      <div>
                        <div className='flex items-center gap-2 flex-wrap'>
                          <h3 className='font-medium'>{item.name}</h3>
                          {item.labels?.map((label, index) => {
                            return (
                              <Badge
                                key={`${item._id || item.id}-label-${index}`}
                                variant='outline'
                                className='bg-purple-50 text-purple-600 border-purple-200 text-xs'
                              >
                                {label}
                              </Badge>
                            );
                          })}
                        </div>
                        <p className='text-gray-500 text-sm mt-1'>{item.description}</p>
                      </div>
                      <Button
                        variant='outline'
                        onClick={() => {
                          return toggleItemSelection(item);
                        }}
                        className={
                          selected
                            ? 'text-red-500 hover:bg-red-50'
                            : 'text-green-500 hover:bg-green-50 border-green-200'
                        }
                      >
                        {selected ? 'Remove' : 'Add'}
                      </Button>
                    </div>

                    <div className='mt-3 flex items-center gap-2'>
                      <span className='text-gray-700'>${item.price.toFixed(2)}</span>
                      {item.quantity && (
                        <>
                          <span className='text-gray-400'>•</span>
                          <span className='text-gray-500 text-sm'>
                            {item.quantity} {item.quantity === 1 ? 'hour' : 'hours'}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className='py-8 text-center text-gray-500'>
            Tasks from the project will appear here automatically.
            <p className='text-sm mt-2'>
              If no tasks are showing, try refreshing the page or check your project settings.
            </p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default InvoiceItems;
