import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Client, useInvoiceWizard } from '@/hooks/useInvoiceWizard';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Check, Plus, PlusCircle, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

const InvoiceWizardDialog = ({
  open,
  onOpenChange,
  clients = [],
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  clients?: Client[];
}) => {
  const {
    selectedItems,
    invoiceNumber,
    dueDate,
    aiSuggestions,
    isGenerating,
    error,
    setInvoiceNumber,
    setDueDate,
    setAiSuggestions,
    handleAddItem,
    calculateSubtotal,
    calculateTotal,
    generateInvoice,
    handleRemoveItem,
    setSelectedItems,
  } = useInvoiceWizard();

  const [activeTab, setActiveTab] = useState('items');
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [taxRate, setTaxRate] = useState(20);
  const [reducedTaxRate, setReducedTaxRate] = useState(5);
  const [notes, setNotes] = useState('');
  const [shippingRequired, setShippingRequired] = useState(false);
  const [hasPhysicalProducts, setHasPhysicalProducts] = useState(false);
  const [removedItems, setRemovedItems] = useState<any[]>([]);
  const [allItems, setAllItems] = useState<any[]>([]);

  // Shipping related states
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<any>(null);
  const [useShippingAddress, setUseShippingAddress] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<any>(null);

  const shippingMethods = [
    {
      id: 'standard',
      name: 'Standard Shipping',
      carrier: 'USPS',
      estimatedDays: '3-5 business days',
      price: 5.99,
    },
    {
      id: 'express',
      name: 'Express Shipping',
      carrier: 'FedEx',
      estimatedDays: '1-2 business days',
      price: 12.99,
    },
    {
      id: 'overnight',
      name: 'Overnight Shipping',
      carrier: 'UPS',
      estimatedDays: 'Next business day',
      price: 24.99,
    },
  ];

  useEffect(() => {
    // Check if any selected items are physical products
    const physical = selectedItems.some((item) => {
      return item.type === 'physical';
    });
    setHasPhysicalProducts(physical);
    if (physical) {
      setShippingRequired(true);
    }

    // Update allItems with selectedItems that aren't already there
    setAllItems((prev) => {
      const existingIds = new Set(
        prev.map((item) => {
          return item.id;
        }),
      );
      const newItems = selectedItems.filter((item) => {
        return !existingIds.has(item.id);
      });
      return [...prev, ...newItems];
    });
  }, [selectedItems]);

  const handleSelectClient = (client: any) => {
    setSelectedClient(client);
  };

  const addShippingToInvoice = () => {
    // Implementation would add shipping to the invoice
    console.log('Adding shipping method:', selectedShippingMethod);
  };

  const formatAddress = (address: any) => {
    if (!address) return null;

    return (
      <div className='space-y-1'>
        <p>{address.line1}</p>
        {address.line2 && <p>{address.line2}</p>}
        <p>
          {address.city}, {address.state} {address.postalCode}
        </p>
        <p>{address.country}</p>
      </div>
    );
  };

  const handleCreateInvoice = async () => {
    const result = await generateInvoice();
    if (result) {
      // Handle successful invoice creation - could close dialog or show success message
      onOpenChange(false);
    }
  };

  const handleItemRemove = (item: any) => {
    setRemovedItems((prev) => {
      return [...prev, item];
    });
    handleRemoveItem(item.id);
  };

  const handleAddRemovedItem = (item: any) => {
    handleAddItem(item);
    setRemovedItems((prev) => {
      return prev.filter((removedItem) => {
        return removedItem.id !== item.id;
      });
    });
  };

  // Function to check if an item is in the selectedItems array
  const isItemSelected = (itemId: string) => {
    return selectedItems.some((item) => {
      return item.id === itemId;
    });
  };

  // Toggle item selection
  const toggleItemSelection = (item: any) => {
    if (isItemSelected(item.id)) {
      handleRemoveItem(item.id);
    } else {
      // Transform item with fields if needed
      const processedItem = { ...item };

      // If the item has fields.unitPrice, fields.quantity, etc., make sure they're accessible at the top level
      if (item.fields) {
        if (item.fields.unitPrice !== undefined) {
          processedItem.price = item.fields.unitPrice;
        }
        if (item.fields.quantity !== undefined) {
          processedItem.quantity = item.fields.quantity;
        }
        // Add a type field for physical products if we have data suggesting it's physical
        if (
          item.fields.sizeBreakdown ||
          (item.fields.multiSelectColors && item.fields.multiSelectColors.length > 0) ||
          item.labels?.some((label) => {
            return ['apparel', 'physical', 'print', 'promotional'].includes(label.toLowerCase());
          })
        ) {
          processedItem.type = 'physical';
        }
      }

      handleAddItem(processedItem);
    }
  };

  // Replace the addAllItems function with a version that adds all items at once
  const addAllItems = (type: 'task' | 'deliverable') => {
    // Get all items of the specified type that aren't already selected
    const itemsToAdd = allItems.filter((item) => {
      const isTask = item.id.startsWith('task-');
      return (type === 'task' ? isTask : !isTask) && !isItemSelected(item.id);
    });

    // Add all items at once by updating the state directly
    if (itemsToAdd.length > 0) {
      setSelectedItems([...selectedItems, ...itemsToAdd]);
    }
  };

  const removeAllItems = (type: 'task' | 'deliverable') => {
    // Keep only items that are NOT of the specified type
    setSelectedItems(
      selectedItems.filter((item) => {
        const isTask = item.id.startsWith('task-');
        // If type is 'task', keep non-tasks. If type is 'deliverable', keep tasks.
        return type === 'task' ? !isTask : isTask;
      }),
    );
  };

  // Function to check if all items of a type are selected
  const areAllItemsSelected = (type: 'task' | 'deliverable') => {
    const typeItems = allItems.filter((item) => {
      const isTask = item.id.startsWith('task-');
      return type === 'task' ? isTask : !isTask;
    });

    // If there are no items of this type, return false
    if (typeItems.length === 0) return false;

    // Check if all items of this type are selected
    return typeItems.every((item) => {
      return isItemSelected(item.id);
    });
  };

  // Function to check if any items of a type are selected
  const areAnyItemsSelected = (type: 'task' | 'deliverable') => {
    return selectedItems.some((item) => {
      const isTask = item.id.startsWith('task-');
      return type === 'task' ? isTask : !isTask;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-[1400px] p-0 overflow-hidden'>
        <DialogTitle className='sr-only'>Invoice Wizard</DialogTitle>
        <div className='flex h-[800px]'>
          {/* Sidebar Navigation */}
          <div className='w-[280px] border-r'>
            <div className='flex justify-between items-center p-4'>
              <h2 className='font-semibold'>Invoice Wizard</h2>
            </div>

            <div className='p-1'>
              <button
                className={`flex items-center gap-3 w-full p-4 rounded-md ${
                  activeTab === 'items' ? 'bg-gray-100' : ''
                }`}
                onClick={() => {
                  return setActiveTab('items');
                }}
              >
                <div className={`p-1 rounded ${activeTab === 'items' ? 'bg-gray-200' : ''}`}>
                  <svg
                    viewBox='0 0 24 24'
                    width='18'
                    height='18'
                    strokeWidth='2'
                    stroke='currentColor'
                    fill='none'
                  >
                    <path d='M4 6h16M4 12h16M4 18h16' />
                  </svg>
                </div>
                <span className={activeTab === 'items' ? 'font-medium' : ''}>Items</span>
              </button>

              <button
                className={`flex items-center gap-3 w-full p-4 rounded-md ${
                  activeTab === 'client' ? 'bg-gray-100' : ''
                }`}
                onClick={() => {
                  return setActiveTab('client');
                }}
              >
                <div className={`p-1 rounded ${activeTab === 'client' ? 'bg-gray-200' : ''}`}>
                  <svg
                    viewBox='0 0 24 24'
                    width='18'
                    height='18'
                    strokeWidth='2'
                    stroke='currentColor'
                    fill='none'
                  >
                    <circle cx='12' cy='8' r='4' />
                    <path d='M20 21a8 8 0 10-16 0' />
                  </svg>
                </div>
                <span className={activeTab === 'client' ? 'font-medium' : ''}>Client</span>
              </button>

              <button
                className={`flex items-center gap-3 w-full p-4 rounded-md ${
                  activeTab === 'details' ? 'bg-gray-100' : ''
                }`}
                onClick={() => {
                  return setActiveTab('details');
                }}
              >
                <div className={`p-1 rounded ${activeTab === 'details' ? 'bg-gray-200' : ''}`}>
                  <svg
                    viewBox='0 0 24 24'
                    width='18'
                    height='18'
                    strokeWidth='2'
                    stroke='currentColor'
                    fill='none'
                  >
                    <path d='M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z' />
                    <path d='M14 2v6h6M16 13H8M16 17H8M10 9H8' />
                  </svg>
                </div>
                <span className={activeTab === 'details' ? 'font-medium' : ''}>Details</span>
              </button>

              {(shippingRequired || hasPhysicalProducts) && (
                <button
                  className={`flex items-center gap-3 w-full p-4 rounded-md ${
                    activeTab === 'shipping' ? 'bg-gray-100' : ''
                  }`}
                  onClick={() => {
                    return setActiveTab('shipping');
                  }}
                >
                  <div className={`p-1 rounded ${activeTab === 'shipping' ? 'bg-gray-200' : ''}`}>
                    <svg
                      viewBox='0 0 24 24'
                      width='18'
                      height='18'
                      strokeWidth='2'
                      stroke='currentColor'
                      fill='none'
                    >
                      <path d='M5 8h14M5 8a2 2 0 100-4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2v-8' />
                      <path d='M15 19l-2-2m0 0l-2 2m2-2v-4' />
                    </svg>
                  </div>
                  <span className={activeTab === 'shipping' ? 'font-medium' : ''}>Shipping</span>
                </button>
              )}
            </div>

            <div className='p-4 border-t mt-auto'>
              <div className='mb-4'>
                <label className='text-sm text-gray-500'>Invoice Number</label>
                <Input
                  value={invoiceNumber}
                  onChange={(e) => {
                    setInvoiceNumber(e.target.value);
                  }}
                  className='mt-1'
                />
              </div>

              <div>
                <label className='text-sm text-gray-500'>Due Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant='outline' className='w-full justify-between mt-1'>
                      {format(dueDate, 'MMMM do, yyyy')}
                      <svg
                        viewBox='0 0 24 24'
                        width='16'
                        height='16'
                        strokeWidth='2'
                        stroke='currentColor'
                        fill='none'
                      >
                        <path d='M6 9l6 6 6-6' />
                      </svg>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0 min-w-[300px]'>
                    <Calendar
                      mode='single'
                      selected={dueDate}
                      onSelect={(date) => {
                        if (date) setDueDate(date);
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className='flex items-center justify-between mt-4'>
                <span className='text-sm'>AI Suggestions</span>
                <Switch
                  checked={aiSuggestions}
                  onCheckedChange={(value) => {
                    setAiSuggestions(value);
                  }}
                />
              </div>

              <div className='mt-6 space-y-2'>
                <div className='flex justify-between'>
                  <span className='text-sm'>Subtotal</span>
                  <span className='font-medium'>${calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm'>Total</span>
                  <span className='font-medium'>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              {error && <div className='text-red-500 text-sm mt-2'>{error}</div>}

              <Button
                className='w-full mt-4 bg-black text-white hover:bg-gray-800'
                onClick={handleCreateInvoice}
                disabled={isGenerating}
              >
                {isGenerating ? 'Creating...' : 'Create Invoice'}
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className='flex-1 flex flex-col'>
            {/* Select Items Header */}
            <div className='flex justify-between items-center p-4 border-b'>
              <h2 className='font-semibold'>
                {activeTab === 'items' && 'Select Items'}
                {activeTab === 'client' && 'Select Client'}
                {activeTab === 'details' && 'Invoice Details'}
                {activeTab === 'shipping' && 'Shipping Details'}
              </h2>
            </div>

            {/* Content Area */}
            <div className='flex h-full'>
              {/* Main Content */}
              <div className='flex-1 p-4 overflow-y-auto'>
                {activeTab === 'items' && (
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
                                            variant={
                                              item.status === 'completed' ? 'default' : 'outline'
                                            }
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
                                        <p className='text-gray-500 text-sm mt-1'>
                                          {item.description}
                                        </p>

                                        {/* Display dynamic fields */}
                                        {item.fields && (
                                          <div className='mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm'>
                                            {Object.entries(item.fields).map(([key, value]) => {
                                              // Skip displaying these fields as we show them separately
                                              if (
                                                key === 'total' ||
                                                key === 'unitPrice' ||
                                                key === 'quantity'
                                              )
                                                return null;

                                              // Format the value based on its type
                                              let displayValue: React.ReactNode = '';
                                              if (typeof value === 'object' && value !== null) {
                                                if (Array.isArray(value)) {
                                                  // Handle array values (like multiSelectColors)
                                                  displayValue = value.join(', ');
                                                } else {
                                                  // Handle object values (like sizeBreakdown)
                                                  displayValue = Object.entries(value)
                                                    .map(([k, v]) => {
                                                      return `${k}: ${v}`;
                                                    })
                                                    .join(', ');
                                                }
                                              } else if (value !== null && value !== undefined) {
                                                // Convert primitive values to string
                                                displayValue = String(value);
                                              }

                                              return (
                                                <div
                                                  key={`${item.id}-field-${key}`}
                                                  className='flex'
                                                >
                                                  <span className='text-gray-500 capitalize mr-2'>
                                                    {key.replace(/([A-Z])/g, ' $1').trim()}:
                                                  </span>
                                                  <span className='text-gray-700'>
                                                    {displayValue}
                                                  </span>
                                                </div>
                                              );
                                            })}
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
                                          (item.createdAt
                                            ? new Date(item.createdAt).toLocaleDateString()
                                            : '')}
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

                                    {/* Display attachments if available */}
                                    {item.attachments && item.attachments.length > 0 && (
                                      <div className='mt-3 border-t pt-2'>
                                        <div className='text-xs text-gray-500 mb-1'>
                                          Attachments:
                                        </div>
                                        <div className='flex gap-2 flex-wrap'>
                                          {item.attachments.map((attachment, index) => {
                                            return (
                                              <Badge
                                                key={`${item.id}-attachment-${index}`}
                                                variant='outline'
                                                className='text-xs flex items-center gap-1'
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
                                              </Badge>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      ) : (
                        <div className='py-8 text-center text-gray-500'>
                          No items found.
                          <p className='text-sm mt-2'>
                            If no items are showing, try refreshing the page or check your project
                            settings.
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
                                return areAllItemsSelected('task')
                                  ? removeAllItems('task')
                                  : addAllItems('task');
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
                                        <p className='text-gray-500 text-sm mt-1'>
                                          {item.description}
                                        </p>
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
                                        ${item.price.toFixed(2)}
                                      </span>
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
                            If no tasks are showing, try refreshing the page or check your project
                            settings.
                          </p>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                )}

                {activeTab === 'client' && (
                  <motion.div
                    key='client'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className='space-y-4'
                  >
                    <div className='relative'>
                      <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
                      <Input placeholder='Search clients...' className='w-full pl-8' />
                    </div>

                    <div className='space-y-2'>
                      {clients.map((client: any) => {
                        return (
                          <div
                            key={client.id}
                            className={cn(
                              'border rounded-lg p-4 cursor-pointer hover:border-primary/50 transition-colors',
                              selectedClient?.id === client.id && 'border-primary bg-primary/5',
                            )}
                            onClick={() => {
                              return handleSelectClient(client);
                            }}
                          >
                            <div className='flex items-center justify-between'>
                              <div className='flex items-center gap-3'>
                                <Avatar>
                                  <AvatarImage src={client.avatar || '/placeholder.svg'} />
                                  <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <h3 className='font-medium'>{client.name}</h3>
                                  <p className='text-sm text-muted-foreground'>{client.company}</p>
                                  <p className='text-sm text-muted-foreground'>{client.email}</p>
                                </div>
                              </div>
                              {selectedClient?._id === client._id && (
                                <Check className='h-5 w-5 text-primary' />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <Button className='w-full'>
                      <Plus className='mr-2 h-4 w-4' />
                      Add New Client
                    </Button>
                  </motion.div>
                )}

                {activeTab === 'details' && (
                  <motion.div
                    key='details'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className='space-y-6'
                  >
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div>
                        <Label htmlFor='tax-rate'>Standard Tax Rate (%)</Label>
                        <Input
                          id='tax-rate'
                          type='number'
                          value={taxRate}
                          onChange={(e) => {
                            return setTaxRate(Number(e.target.value));
                          }}
                          className='mt-1'
                        />
                      </div>
                      <div>
                        <Label htmlFor='reduced-tax-rate'>Reduced Tax Rate (%)</Label>
                        <Input
                          id='reduced-tax-rate'
                          type='number'
                          value={reducedTaxRate}
                          onChange={(e) => {
                            return setReducedTaxRate(Number(e.target.value));
                          }}
                          className='mt-1'
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor='currency'>Currency</Label>
                      <select
                        id='currency'
                        className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1'
                        defaultValue='USD'
                      >
                        <option value='USD'>USD ($)</option>
                        <option value='EUR'>EUR (€</option>
                        <option value='GBP'>GBP (£)</option>
                        <option value='CAD'>CAD (C$)</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor='notes'>Notes</Label>
                      <Textarea
                        id='notes'
                        placeholder='Add any notes or payment instructions...'
                        className='mt-1 h-32'
                        value={notes}
                        onChange={(e) => {
                          return setNotes(e.target.value);
                        }}
                      />
                    </div>

                    <div>
                      <Label className='flex items-center gap-2'>
                        <Switch checked={true} onCheckedChange={() => {}} />
                        <span>Send invoice to client automatically</span>
                      </Label>
                    </div>

                    <div>
                      <Label className='flex items-center gap-2'>
                        <Switch checked={true} onCheckedChange={() => {}} />
                        <span>Include payment link</span>
                      </Label>
                    </div>

                    <div>
                      <Label className='flex items-center gap-2'>
                        <Switch checked={false} onCheckedChange={() => {}} />
                        <span>Schedule automatic reminders</span>
                      </Label>
                    </div>
                    <div>
                      <Label className='flex items-center gap-2'>
                        <Switch
                          checked={shippingRequired || hasPhysicalProducts}
                          onCheckedChange={(checked) => {
                            return setShippingRequired(checked);
                          }}
                          disabled={hasPhysicalProducts} // Disable if we already have physical products
                        />
                        <span>
                          {hasPhysicalProducts
                            ? 'Shipping required for physical products'
                            : 'Add shipping to this invoice'}
                        </span>
                      </Label>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'shipping' && (
                  <motion.div
                    key='shipping'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className='space-y-6'
                  >
                    <div>
                      <h3 className='font-medium mb-3'>Shipping Method</h3>
                      <RadioGroup
                        value={selectedShippingMethod?.id || ''}
                        onValueChange={(value) => {
                          const method = shippingMethods.find((m) => {
                            return m.id === value;
                          });
                          setSelectedShippingMethod(method || null);
                        }}
                      >
                        {shippingMethods.map((method) => {
                          return (
                            <div key={method.id} className='flex items-center space-x-2 mb-2'>
                              <RadioGroupItem value={method.id} id={method.id} />
                              <Label htmlFor={method.id} className='flex-1 cursor-pointer'>
                                <div className='flex justify-between items-center'>
                                  <div>
                                    <span className='font-medium'>{method.name}</span>
                                    <p className='text-sm text-muted-foreground'>
                                      {method.carrier} - {method.estimatedDays}
                                    </p>
                                  </div>
                                  <span className='font-medium'>${method.price.toFixed(2)}</span>
                                </div>
                              </Label>
                            </div>
                          );
                        })}
                      </RadioGroup>

                      <Button
                        className='mt-4 w-full'
                        onClick={addShippingToInvoice}
                        disabled={!selectedShippingMethod}
                      >
                        Add Shipping to Invoice
                      </Button>
                    </div>

                    <Separator />

                    <div>
                      <h3 className='font-medium mb-3'>Shipping Address</h3>

                      {selectedClient ? (
                        <div className='space-y-4'>
                          <div className='flex items-center gap-2'>
                            <Switch
                              checked={useShippingAddress}
                              onCheckedChange={setUseShippingAddress}
                              id='use-shipping-address'
                            />
                            <Label htmlFor='use-shipping-address'>
                              Use different shipping address
                            </Label>
                          </div>

                          {useShippingAddress ? (
                            <Card>
                              <CardContent className='pt-4'>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                  <div>
                                    <Label htmlFor='shipping-line1'>Address Line 1</Label>
                                    <Input
                                      id='shipping-line1'
                                      className='mt-1'
                                      value={shippingAddress?.line1 || ''}
                                      onChange={(e) => {
                                        return setShippingAddress({
                                          ...(shippingAddress || {}),
                                          line1: e.target.value,
                                          city: shippingAddress?.city || '',
                                          state: shippingAddress?.state || '',
                                          postalCode: shippingAddress?.postalCode || '',
                                          country: shippingAddress?.country || '',
                                        });
                                      }}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor='shipping-line2'>
                                      Address Line 2 (Optional)
                                    </Label>
                                    <Input
                                      id='shipping-line2'
                                      className='mt-1'
                                      value={shippingAddress?.line2 || ''}
                                      onChange={(e) => {
                                        return setShippingAddress({
                                          ...(shippingAddress || {}),
                                          line2: e.target.value,
                                        });
                                      }}
                                    />
                                  </div>
                                </div>
                                <div className='grid grid-cols-2 gap-4 mt-4'>
                                  <div>
                                    <Label htmlFor='shipping-city'>City</Label>
                                    <Input
                                      id='shipping-city'
                                      className='mt-1'
                                      value={shippingAddress?.city || ''}
                                      onChange={(e) => {
                                        return setShippingAddress({
                                          ...(shippingAddress || {}),
                                          city: e.target.value,
                                        });
                                      }}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor='shipping-state'>State/Province</Label>
                                    <Input
                                      id='shipping-state'
                                      className='mt-1'
                                      value={shippingAddress?.state || ''}
                                      onChange={(e) => {
                                        return setShippingAddress({
                                          ...(shippingAddress || {}),
                                          state: e.target.value,
                                        });
                                      }}
                                    />
                                  </div>
                                </div>
                                <div className='grid grid-cols-2 gap-4 mt-4'>
                                  <div>
                                    <Label htmlFor='shipping-postal'>Postal Code</Label>
                                    <Input
                                      id='shipping-postal'
                                      className='mt-1'
                                      value={shippingAddress?.postalCode || ''}
                                      onChange={(e) => {
                                        return setShippingAddress({
                                          ...(shippingAddress || {}),
                                          postalCode: e.target.value,
                                        });
                                      }}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor='shipping-country'>Country</Label>
                                    <Input
                                      id='shipping-country'
                                      className='mt-1'
                                      value={shippingAddress?.country || ''}
                                      onChange={(e) => {
                                        return setShippingAddress({
                                          ...(shippingAddress || {}),
                                          country: e.target.value,
                                        });
                                      }}
                                    />
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ) : (
                            <div>
                              {selectedClient.shippingAddress ? (
                                <Card>
                                  <CardContent className='pt-4'>
                                    {formatAddress(selectedClient.shippingAddress)}
                                  </CardContent>
                                </Card>
                              ) : (
                                <div className='text-center p-4 border rounded-lg'>
                                  <p className='text-muted-foreground'>
                                    No shipping address available for this client.
                                  </p>
                                  <p className='text-sm mt-2'>
                                    Please add a shipping address or select a different client.
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className='text-center p-6 border rounded-lg'>
                          <p className='text-muted-foreground'>Please select a client first.</p>
                          <Button
                            variant='link'
                            onClick={() => {
                              return setActiveTab('client');
                            }}
                            className='mt-2'
                          >
                            Go to Client Selection
                          </Button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Invoice Preview */}
              <div className='w-[400px] border-l p-4 flex flex-col overflow-y-auto'>
                <div className='flex justify-between items-center mb-4'>
                  <h2 className='font-semibold'>Invoice Preview</h2>
                  <Button variant='outline' className='gap-1'>
                    <PlusCircle size={16} />
                    Add Custom Item
                  </Button>
                </div>

                <div className='flex flex-col items-center justify-center py-10 border-b'>
                  {selectedClient ? (
                    <div className='w-full flex items-center gap-3 p-3 border rounded-lg'>
                      <Avatar className='h-12 w-12'>
                        <AvatarImage src={selectedClient.avatar || '/placeholder.svg'} />
                        <AvatarFallback>{selectedClient.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className='font-medium'>{selectedClient.name}</h3>
                        <p className='text-sm text-muted-foreground'>{selectedClient.company}</p>
                        <p className='text-sm text-muted-foreground'>{selectedClient.email}</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className='w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-2'>
                        <svg
                          viewBox='0 0 24 24'
                          width='24'
                          height='24'
                          strokeWidth='2'
                          stroke='currentColor'
                          fill='none'
                        >
                          <circle cx='12' cy='8' r='4' />
                          <path d='M20 21a8 8 0 10-16 0' />
                        </svg>
                      </div>
                      <p className='text-gray-500'>No client selected</p>
                      <Button
                        variant='link'
                        className='mt-1'
                        onClick={() => {
                          return setActiveTab('client');
                        }}
                      >
                        Select Client
                      </Button>
                    </>
                  )}
                </div>

                <div className='mt-4'>
                  <div className='flex justify-between font-medium border-b pb-2'>
                    <span>Item</span>
                    <div className='flex gap-8'>
                      <span>Quantity</span>
                      <span>Price</span>
                      <span>Total</span>
                    </div>
                  </div>

                  {selectedItems.length === 0 ? (
                    <div className='text-center py-8 text-gray-500'>No items added to invoice</div>
                  ) : (
                    <div className='space-y-2 mt-2'>
                      {selectedItems.map((item) => {
                        return (
                          <div
                            key={item.id}
                            className='flex justify-between items-start py-2 border-b'
                          >
                            <div className='max-w-[180px]'>
                              <div className='font-medium'>{item.name}</div>
                              {item.labels && item.labels.length > 0 && (
                                <div className='flex flex-wrap gap-1 mt-1'>
                                  {item.labels.map((label, index) => {
                                    return (
                                      <Badge
                                        key={`${item.id}-preview-${index}`}
                                        variant='outline'
                                        className='text-xs px-1 py-0'
                                      >
                                        {label}
                                      </Badge>
                                    );
                                  })}
                                </div>
                              )}
                              {/* Show a brief summary of dynamic fields */}
                              {item.fields &&
                                Object.keys(item.fields).filter((key) => {
                                  return (
                                    !['unitPrice', 'quantity', 'total'].includes(key) &&
                                    item.fields[key] !== null &&
                                    item.fields[key] !== undefined
                                  );
                                }).length > 0 && (
                                  <div className='text-xs text-gray-500 mt-1 truncate'>
                                    {Object.entries(item.fields)
                                      .filter(([key]) => {
                                        return !['unitPrice', 'quantity', 'total'].includes(key);
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
                                            String(value).length > 15
                                              ? String(value).substring(0, 15) + '...'
                                              : String(value);
                                        }
                                        return displayValue
                                          ? `${key
                                              .replace(/([A-Z])/g, ' $1')
                                              .trim()}: ${displayValue}`
                                          : '';
                                      })
                                      .filter((text) => {
                                        return text;
                                      })
                                      .join(', ')}
                                    {Object.keys(item.fields).filter((key) => {
                                      return (
                                        !['unitPrice', 'quantity', 'total'].includes(key) &&
                                        item.fields[key] !== null &&
                                        item.fields[key] !== undefined
                                      );
                                    }).length > 2
                                      ? '...'
                                      : ''}
                                  </div>
                                )}
                            </div>
                            <div className='flex gap-8 text-sm'>
                              <span>{item.fields?.quantity || item.quantity || 1}</span>
                              <span>${(item.fields?.unitPrice || item.price).toFixed(2)}</span>
                              <span>
                                $
                                {(
                                  (item.fields?.quantity || item.quantity || 1) *
                                  (item.fields?.unitPrice || item.price)
                                ).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className='mt-auto space-y-2'>
                  <div className='flex justify-between'>
                    <span>Subtotal</span>
                    <span>${calculateSubtotal().toFixed(2)}</span>
                  </div>
                  <div className='flex justify-between font-semibold'>
                    <span>Total</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
                <div className='pb-24'></div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceWizardDialog;
