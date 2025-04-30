import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Plus } from 'lucide-react';
import { ReactNode } from 'react';
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
  isItemSelected,
  addAllItems,
  removeAllItems,
  areAllItemsSelected,
}: InvoiceItemsProps) => {
  return (
    <Tabs defaultValue='deliverables'>
      <TabsList className='mb-4'>
        <TabsTrigger value='deliverables'>Deliverables</TabsTrigger>
        <TabsTrigger value='tasks'>Tasks & Hours</TabsTrigger>
      </TabsList>

      <TabsContent value='deliverables' className='space-y-6'>
        {allItems.filter((item) => {
          return !item.id.startsWith('task-');
        }).length > 0 ? (
          <div>
            <div className='flex justify-between items-center mb-3'>
              <h3 className='font-medium text-sm'>Project Deliverables</h3>
              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  return areAllItemsSelected('deliverable')
                    ? removeAllItems('deliverable')
                    : addAllItems('deliverable');
                }}
                className={
                  areAllItemsSelected('deliverable')
                    ? 'text-red-500 border-red-200 hover:bg-red-50'
                    : 'text-green-600 border-green-200 hover:bg-green-50'
                }
                disabled={
                  !areAllItemsSelected('deliverable') &&
                  allItems.filter((item) => {
                    return !item.id.startsWith('task-');
                  }).length === 0
                }
              >
                {areAllItemsSelected('deliverable') ? (
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
              {allItems
                .filter((item) => {
                  return !item.id.startsWith('task-');
                })
                .map((item) => {
                  const selected = isItemSelected(item.id);
                  return (
                    <div
                      key={item.id}
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
                                  key={`${item.id}-label-${index}`}
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

                                <Popover>
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
                                  <PopoverContent className='w-80 p-0'>
                                    <div className='px-4 py-3 border-b'>
                                      <h3 className='font-medium'>{item.name}</h3>
                                      <p className='text-sm text-gray-500'>{item.description}</p>
                                    </div>
                                    <div className='p-4 max-h-[300px] overflow-y-auto'>
                                      {Object.entries(item.fields)
                                        .filter(([key]) => {
                                          return !['total', 'unitPrice', 'quantity'].includes(key);
                                        })
                                        .map(([key, value]) => {
                                          // Format the value based on its type
                                          let displayValue: ReactNode = '';
                                          if (typeof value === 'object' && value !== null) {
                                            if (Array.isArray(value)) {
                                              // Handle array values (like multiSelectColors)
                                              displayValue = (
                                                <div className='flex gap-1 mt-1 flex-wrap'>
                                                  {value.map((v: any, i: number) => {
                                                    return (
                                                      <Badge
                                                        key={`${key}-${i}`}
                                                        variant='outline'
                                                        className='text-xs'
                                                      >
                                                        {String(v)}
                                                      </Badge>
                                                    );
                                                  })}
                                                </div>
                                              );
                                            } else {
                                              // Handle object values (like sizeBreakdown)
                                              displayValue = (
                                                <div className='grid grid-cols-2 gap-2 mt-1'>
                                                  {Object.entries(value).map(([k, v]) => {
                                                    return (
                                                      <div
                                                        key={`${key}-${k}`}
                                                        className='flex justify-between items-center p-1 bg-gray-50 rounded text-xs'
                                                      >
                                                        <span className='font-medium'>{k}:</span>
                                                        <span>{String(v)}</span>
                                                      </div>
                                                    );
                                                  })}
                                                </div>
                                              );
                                            }
                                          } else if (value !== null && value !== undefined) {
                                            // Format based on content and type
                                            if (typeof value === 'number') {
                                              displayValue = value.toString();
                                            } else if (typeof value === 'string') {
                                              // Check if it's a URL
                                              if (value.match(/^https?:\/\//)) {
                                                displayValue = (
                                                  <a
                                                    href={value}
                                                    target='_blank'
                                                    rel='noopener noreferrer'
                                                    className='text-blue-500 hover:underline truncate block'
                                                  >
                                                    {value.length > 30
                                                      ? `${value.substring(0, 30)}...`
                                                      : value}
                                                  </a>
                                                );
                                              } else {
                                                displayValue = value;
                                              }
                                            } else {
                                              displayValue = String(value);
                                            }
                                          }

                                          return (
                                            <div
                                              key={`popover-${item.id}-field-${key}`}
                                              className='mb-3'
                                            >
                                              <div className='text-sm font-medium capitalize'>
                                                {key.replace(/([A-Z])/g, ' $1').trim()}
                                              </div>
                                              <div className='text-sm text-gray-700'>
                                                {displayValue}
                                              </div>
                                            </div>
                                          );
                                        })}
                                    </div>
                                  </PopoverContent>
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
                                        key={`${item.id}-mini-${key}`}
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
                                    <Popover key={`${item.id}-attachment-${index}`}>
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
                                      <PopoverContent className='w-72 p-0'>
                                        <div className='p-3 border-b flex flex-col gap-1'>
                                          <h3 className='font-medium'>
                                            {attachment.title || 'Attachment'}
                                          </h3>
                                          <p className='text-xs text-gray-500'>
                                            {attachment.type || 'File'}
                                          </p>
                                        </div>
                                        <div className='p-3'>
                                          {attachment.url &&
                                          attachment.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                            <div className='aspect-video bg-gray-100 rounded flex items-center justify-center overflow-hidden'>
                                              <img
                                                src={attachment.url}
                                                alt={attachment.title || 'Preview'}
                                                className='max-w-full max-h-full object-contain'
                                              />
                                            </div>
                                          ) : (
                                            <div className='aspect-video bg-gray-100 rounded flex items-center justify-center'>
                                              <div className='text-center'>
                                                <svg
                                                  viewBox='0 0 24 24'
                                                  className='w-8 h-8 mx-auto text-gray-400'
                                                  fill='none'
                                                  stroke='currentColor'
                                                  strokeWidth='2'
                                                >
                                                  <path d='M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z' />
                                                  <path d='M14 2v6h6M16 13H8M16 17H8M10 9H8' />
                                                </svg>
                                                <p className='mt-1 text-sm text-gray-600'>
                                                  File Preview Not Available
                                                </p>
                                              </div>
                                            </div>
                                          )}

                                          <div className='mt-3'>
                                            <a
                                              href={attachment.url}
                                              target='_blank'
                                              rel='noopener noreferrer'
                                              className='w-full flex items-center justify-center gap-1 p-1 bg-blue-50 text-blue-600 rounded text-sm hover:bg-blue-100 transition-colors'
                                            >
                                              <svg
                                                viewBox='0 0 24 24'
                                                width='14'
                                                height='14'
                                                fill='none'
                                                stroke='currentColor'
                                                strokeWidth='2'
                                              >
                                                <path d='M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3' />
                                              </svg>
                                              View Full Size
                                            </a>
                                          </div>
                                        </div>
                                      </PopoverContent>
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
        {allItems.filter((item) => {
          return item.id.startsWith('task-');
        }).length > 0 ? (
          <div>
            <div className='flex justify-between items-center mb-3'>
              <h3 className='font-medium text-sm'>Project Tasks</h3>
              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  return areAllItemsSelected('task') ? removeAllItems('task') : addAllItems('task');
                }}
                className={
                  areAllItemsSelected('task')
                    ? 'text-red-500 border-red-200 hover:bg-red-50'
                    : 'text-green-600 border-green-200 hover:bg-green-50'
                }
                disabled={
                  !areAllItemsSelected('task') &&
                  allItems.filter((item) => {
                    return item.id.startsWith('task-');
                  }).length === 0
                }
              >
                {areAllItemsSelected('task') ? (
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
              {allItems
                .filter((item) => {
                  return item.id.startsWith('task-');
                })
                .map((item) => {
                  const selected = isItemSelected(item.id);
                  return (
                    <div
                      key={item.id}
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
                                  key={`${item.id}-label-${index}`}
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
