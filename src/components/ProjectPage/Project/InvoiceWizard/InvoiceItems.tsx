import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import InvoiceItemAttachment from './InvoiceItemAttachment';
import InvoiceItemDetails from './InvoiceItemDetails';
import { InvoiceItem } from './types';

interface InvoiceItemsProps {
  allItems: any[];
  selectedItems: any[];
  toggleItemSelection: (item: any) => void;
  addAllItems: (type: 'task' | 'deliverable') => void;
  removeAllItems: (type: 'task' | 'deliverable') => void;
}

const InvoiceItems = ({
  allItems,
  selectedItems,
  toggleItemSelection,
  addAllItems,
  removeAllItems,
}: InvoiceItemsProps) => {
  // Track if we're in the middle of a bulk operation
  const isProcessingBulkOperation = useRef(false);

  // Normalize all items to ensure consistent _id usage
  const normalizedAllItems = useMemo(() => {
    return allItems.map((item) => {
      // Always use _id for consistency
      const itemId = item._id || item.id;
      return {
        ...item,
        _id: itemId,
        // Mark if the item is a task based on ID prefix
        isTask: item.id?.startsWith('task-') || false,
      };
    });
  }, [allItems]);

  // Separate tasks and deliverables based on ID format
  const taskItems = useMemo(() => {
    return normalizedAllItems.filter((item) => {
      return item.isTask || item.id?.startsWith('task-');
    });
  }, [normalizedAllItems]);

  const deliverableItems = useMemo(() => {
    return normalizedAllItems.filter((item) => {
      return !item.isTask && !item.id?.startsWith('task-');
    });
  }, [normalizedAllItems]);

  // Create Set of selected IDs for faster lookup
  const selectedIdsSet = useMemo(() => {
    const idSet = new Set<string>();
    selectedItems.forEach((item) => {
      // Always use _id for consistency
      const itemId = item._id || item.id;
      if (itemId) {
        idSet.add(itemId);
      }
    });
    return idSet;
  }, [selectedItems]);

  // Force a re-render when selection changes
  const [renderCounter, setRenderCounter] = useState(0);

  // Update render counter when selection changes
  useEffect(() => {
    if (!isProcessingBulkOperation.current) {
      setRenderCounter((prev) => {
        return prev + 1;
      });
    }
  }, [selectedItems, selectedIdsSet]);

  // Check if an item is selected
  const isItemSelected = useCallback(
    (item: InvoiceItem): boolean => {
      const itemId = item._id || item.id;
      return selectedIdsSet.has(itemId);
    },
    [selectedIdsSet],
  );

  // Check if all items of a type are selected
  const areAllSelected = useCallback(
    (type: 'task' | 'deliverable'): boolean => {
      const items = type === 'task' ? taskItems : deliverableItems;
      return (
        items.length > 0 &&
        items.every((item) => {
          return isItemSelected(item);
        })
      );
    },
    [taskItems, deliverableItems, isItemSelected],
  );

  // Handle Add All action
  const handleAddAll = (type: 'task' | 'deliverable') => {
    try {
      isProcessingBulkOperation.current = true;
      console.log(`Adding all ${type} items`);
      addAllItems(type);
    } finally {
      // Reset the flag and force a re-render
      setTimeout(() => {
        isProcessingBulkOperation.current = false;
        setRenderCounter((prev) => {
          return prev + 1;
        });
      }, 0);
    }
  };

  // Handle Remove All action
  const handleRemoveAll = (type: 'task' | 'deliverable') => {
    try {
      isProcessingBulkOperation.current = true;

      // Get all the items that should be removed
      const itemsToRemove = type === 'task' ? taskItems : deliverableItems;

      console.log(
        `Removing ${itemsToRemove.length} ${type} items with IDs:`,
        itemsToRemove
          .map((item) => {
            return item._id || item.id;
          })
          .join(', '),
      );

      // First call the parent's removeAll function
      removeAllItems(type);

      // Additionally, ensure each item is individually removed to sync editedItems
      // This helps ensure both selectedItems and editedItems stay in sync
      itemsToRemove.forEach((item) => {
        if (isItemSelected(item)) {
          // Use normalized item to ensure _id consistency
          const normalizedItem = {
            ...item,
            _id: item._id || item.id,
          };
          console.log(`Ensuring item removed: ${normalizedItem._id}`);
          toggleItemSelection(normalizedItem);
        }
      });
    } finally {
      // Reset the flag and force a re-render
      setTimeout(() => {
        isProcessingBulkOperation.current = false;
        setRenderCounter((prev) => {
          return prev + 1;
        });
      }, 0);
    }
  };

  // Handle toggling a single item
  const handleToggleItem = (item: InvoiceItem) => {
    // Ensure we pass the item with _id property for consistent handling
    const normalizedItem = {
      ...item,
      _id: item._id || item.id,
    };

    console.log(
      `Toggling item "${item.name}" (${normalizedItem._id}), currently selected: ${isItemSelected(
        item,
      )}`,
    );
    toggleItemSelection(normalizedItem);
  };

  return (
    <Tabs defaultValue='deliverables'>
      <TabsList className='mb-4'>
        <TabsTrigger value='deliverables'>Deliverables</TabsTrigger>
        <TabsTrigger value='tasks'>Tasks & Hours</TabsTrigger>
      </TabsList>

      <TabsContent value='deliverables' className='space-y-6' key={`deliverables-${renderCounter}`}>
        {deliverableItems.length > 0 ? (
          <div>
            <div className='flex justify-between items-center mb-3'>
              <h3 className='font-medium text-sm'>Project Deliverables</h3>
            </div>
            <div className='space-y-4'>
              {deliverableItems.map((item) => {
                const itemId = item._id;
                const selected = isItemSelected(item);

                return (
                  <div
                    key={`${itemId}-${selected ? 'selected' : 'not-selected'}-${renderCounter}`}
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
                                key={`${itemId}-label-${index}`}
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
                                      key={`${itemId}-mini-${key}`}
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
                                  <Popover key={`${itemId}-attachment-${index}`} modal>
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
                          return handleToggleItem(item);
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
              If no items are showing, add a deliverable to the project.
            </p>
          </div>
        )}
      </TabsContent>

      <TabsContent value='tasks' className='space-y-6' key={`tasks-${renderCounter}`}>
        {taskItems.length > 0 ? (
          <div>
            <div className='flex justify-between items-center mb-3'>
              <h3 className='font-medium text-sm'>Project Tasks</h3>
            </div>
            <div className='space-y-4'>
              {taskItems.map((item) => {
                const itemId = item._id || item.id;
                const selected = isItemSelected(item);

                return (
                  <div
                    key={`${itemId}-${selected ? 'selected' : 'not-selected'}-${renderCounter}`}
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
                                key={`${itemId}-label-${index}`}
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
                          return handleToggleItem(item);
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
              If no tasks are showing, add a task or deliverable to the project.
            </p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default InvoiceItems;
