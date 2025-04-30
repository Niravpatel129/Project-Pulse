import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { Pencil, PlusCircle, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import InvoiceItemDetails from './InvoiceItemDetails';
import { Client, InvoiceItem } from './types';

interface InvoicePreviewProps {
  selectedItems: InvoiceItem[];
  calculateSubtotal: () => number;
  calculateTotal: () => number;
  selectedClient: Client | null;
  setActiveTab: (tab: string) => void;
  onUpdateItems?: (items: InvoiceItem[]) => void;
  onUpdateClient?: (client: Client) => void;
}

const InvoicePreview = ({
  selectedItems,
  calculateSubtotal,
  calculateTotal,
  selectedClient,
  setActiveTab,
  onUpdateItems,
  onUpdateClient,
}: InvoicePreviewProps) => {
  // State for editing
  const [editMode, setEditMode] = useState<Record<string, boolean>>({});
  const [editedItems, setEditedItems] = useState<InvoiceItem[]>([]);
  const [editedClient, setEditedClient] = useState<Client | null>(null);

  // State for edit dialogs
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState<InvoiceItem | null>(null);
  const [editedItemValues, setEditedItemValues] = useState<Partial<InvoiceItem>>({});
  const [editedClientValues, setEditedClientValues] = useState<Partial<Client>>({});

  // Initialize edited items and client when props change
  useEffect(() => {
    if (selectedItems.length > 0) {
      setEditedItems([...selectedItems]);
    }
    if (selectedClient && (!editedClient || selectedClient.id !== editedClient.id)) {
      setEditedClient({ ...selectedClient });
    }
  }, [selectedItems, selectedClient, editedClient]);

  // Toggle edit mode for a specific field
  const toggleEdit = (field: string, save = true) => {
    setEditMode((prev) => {
      const newState = {
        ...prev,
        [field]: !prev[field],
      };

      // When exiting edit mode, save changes if needed
      if (save && prev[field] && !newState[field]) {
        if (field.startsWith('client-') && editedClient && onUpdateClient) {
          onUpdateClient(editedClient);
        } else if (onUpdateItems) {
          onUpdateItems(editedItems);
        }
      }

      return newState;
    });
  };

  // Handle edit of client fields
  const handleClientEdit = (field: string, value: string) => {
    if (!editedClient) return;

    const updatedClient = {
      ...editedClient,
      [field]: value,
    };

    setEditedClient(updatedClient);
  };

  // Handle edit of item fields
  const handleItemEdit = (itemId: string, field: string, value: any) => {
    const updatedItems = editedItems.map((item) => {
      return item.id === itemId
        ? {
            ...item,
            [field]: field === 'price' || field === 'quantity' ? Number(value) : value,
            ...(field === 'fields' ? { fields: { ...item.fields, ...value } } : {}),
          }
        : item;
    });

    setEditedItems(updatedItems);

    // Auto-update after a short delay
    if (onUpdateItems) {
      setTimeout(() => {
        return onUpdateItems(updatedItems);
      }, 500);
    }
  };

  // Open item edit dialog
  const openItemEditDialog = (item: InvoiceItem) => {
    setCurrentEditItem(item);
    setEditedItemValues({
      name: item.name,
      description: item.description,
      price: item.price,
      quantity: item.quantity || 1,
    });
    setItemDialogOpen(true);
  };

  // Open client edit dialog
  const openClientEditDialog = (client: Client) => {
    setEditedClientValues({
      name: client.name,
      email: client.email,
      company: client.company,
    });
    setClientDialogOpen(true);
  };

  // Save item edits from dialog
  const saveItemEdits = () => {
    if (!currentEditItem || !editedItemValues) return;

    const updatedItems = editedItems.map((item) => {
      return item.id === currentEditItem.id
        ? {
            ...item,
            ...editedItemValues,
            fields: {
              ...item.fields,
              unitPrice:
                typeof editedItemValues.price === 'number' ? editedItemValues.price : item.price,
              quantity:
                typeof editedItemValues.quantity === 'number'
                  ? editedItemValues.quantity
                  : item.quantity || 1,
            },
          }
        : item;
    });

    setEditedItems(updatedItems);
    if (onUpdateItems) {
      onUpdateItems(updatedItems);
    }

    setItemDialogOpen(false);
  };

  // Save client edits from dialog
  const saveClientEdits = () => {
    if (!editedClient || !editedClientValues) return;

    const updatedClient = { ...editedClient, ...editedClientValues };
    setEditedClient(updatedClient);

    if (onUpdateClient) {
      onUpdateClient(updatedClient);
    }

    setClientDialogOpen(false);
  };

  // Add a custom item
  const addCustomItem = () => {
    const newItem: InvoiceItem = {
      id: `custom-${Date.now()}`,
      name: 'Custom Item',
      description: 'Custom item added manually',
      price: 0,
      quantity: 1,
      date: new Date().toLocaleDateString(),
      status: 'completed',
      type: 'digital',
      fields: { unitPrice: 0, quantity: 1 },
    };

    const updatedItems = [...editedItems, newItem];
    setEditedItems(updatedItems);

    // Open edit dialog for the new item
    openItemEditDialog(newItem);

    // Update parent with new item
    if (onUpdateItems) {
      onUpdateItems(updatedItems);
    }
  };

  // Remove an item from the invoice
  const removeItem = (itemId: string) => {
    const updatedItems = editedItems.filter((item) => {
      return item.id !== itemId;
    });
    setEditedItems(updatedItems);

    if (onUpdateItems) {
      onUpdateItems(updatedItems);
    }
  };

  return (
    <>
      <div className='w-full md:w-[400px] p-4 flex flex-col overflow-y-auto'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='font-semibold'>Invoice Preview</h2>
          <Button variant='outline' className='gap-1' onClick={addCustomItem}>
            <PlusCircle size={16} />
            <span className='hidden sm:inline'>Add Custom Item</span>
          </Button>
        </div>

        <div className='flex flex-col items-center justify-center py-10 border-b relative'>
          {selectedClient ? (
            <div className='w-full flex items-center gap-3 p-3 border rounded-lg'>
              <Avatar className='h-12 w-12'>
                <AvatarImage src={editedClient?.avatar || '/placeholder.svg'} />
                <AvatarFallback>
                  {(editedClient?.name || selectedClient.name).charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className='flex-1'>
                <h3 className='font-medium'>{editedClient?.name || selectedClient.name}</h3>
                <p className='text-sm text-muted-foreground'>
                  {editedClient?.company || selectedClient.company}
                </p>
                <p className='text-sm text-muted-foreground'>
                  {editedClient?.email || selectedClient.email}
                </p>
              </div>
              <Button
                size='sm'
                variant='ghost'
                className='rounded-full h-6 w-6 p-0 absolute top-2 right-2'
                onClick={() => {
                  return editedClient && openClientEditDialog(editedClient);
                }}
              >
                <Pencil size={12} />
              </Button>
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
              <span>Qty</span>
              <span>Price</span>
              <span>Total</span>
            </div>
          </div>

          {editedItems.length === 0 ? (
            <div className='text-center py-8 text-gray-500'>No items added to invoice</div>
          ) : (
            <div className='space-y-2 mt-2'>
              {editedItems.map((item) => {
                console.log('🚀 item:', item);
                const itemQuantity = item.fields?.quantity || item.quantity || 1;
                const itemPrice = item.fields?.unitPrice || item.price;
                const itemTotal = itemQuantity * itemPrice;

                return (
                  <div
                    key={item.id}
                    className='flex justify-between items-start py-2 border-b relative group'
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
                            key in item.fields! &&
                            item.fields![key] !== null &&
                            item.fields![key] !== undefined
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
                                    displayValue = value.length > 0 ? `${value.length} items` : '';
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
                                  ? `${key.replace(/([A-Z])/g, ' $1').trim()}: ${displayValue}`
                                  : '';
                              })
                              .filter((text) => {
                                return text;
                              })
                              .join(', ')}
                            {item.fields && Object.keys(item.fields).length > 2 ? '...' : ''}

                            {/* Add View Details button */}
                            {item.fields && Object.entries(item.fields).length > 0 && (
                              <div className='flex items-center gap-2 mt-1'>
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
                                  <InvoiceItemDetails item={item} />
                                </Popover>
                              </div>
                            )}
                          </div>
                        )}
                    </div>
                    <div className='flex gap-8 text-sm'>
                      <span>{itemQuantity}</span>
                      <span>${itemPrice.toFixed(2)}</span>
                      <span>${itemTotal.toFixed(2)}</span>
                    </div>
                    <div className='absolute bottom-2 right-0 flex opacity-0 group-hover:opacity-100'>
                      <Button
                        size='sm'
                        variant='ghost'
                        className='rounded-full h-6 w-6 p-0 mr-1 text-red-500 hover:text-red-700 hover:bg-red-50'
                        onClick={() => {
                          return removeItem(item.id);
                        }}
                      >
                        <svg
                          width='14'
                          height='14'
                          viewBox='0 0 24 24'
                          fill='none'
                          xmlns='http://www.w3.org/2000/svg'
                        >
                          <path
                            d='M6 6L18 18M6 18L18 6'
                            stroke='currentColor'
                            strokeWidth='2'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                          />
                        </svg>
                      </Button>
                      <Button
                        size='sm'
                        variant='ghost'
                        className='rounded-full h-6 w-6 p-0'
                        onClick={() => {
                          return openItemEditDialog(item);
                        }}
                      >
                        <Pencil size={12} />
                      </Button>
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

      {/* Edit Item Dialog */}
      <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='item-name' className='text-right'>
                Name
              </Label>
              <Input
                id='item-name'
                value={editedItemValues.name || ''}
                onChange={(e) => {
                  return setEditedItemValues({ ...editedItemValues, name: e.target.value });
                }}
                className='col-span-3'
              />
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='item-description' className='text-right'>
                Description
              </Label>
              <Textarea
                id='item-description'
                value={editedItemValues.description || ''}
                onChange={(e) => {
                  return setEditedItemValues({ ...editedItemValues, description: e.target.value });
                }}
                className='col-span-3'
              />
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='item-price' className='text-right'>
                Price
              </Label>
              <Input
                id='item-price'
                type='number'
                step='0.01'
                value={editedItemValues.price || 0}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  if (!isNaN(value)) {
                    setEditedItemValues({ ...editedItemValues, price: value });
                  }
                }}
                className='col-span-3'
              />
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='item-quantity' className='text-right'>
                Quantity
              </Label>
              <Input
                id='item-quantity'
                type='number'
                value={editedItemValues.quantity || 1}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  if (!isNaN(value)) {
                    setEditedItemValues({ ...editedItemValues, quantity: value });
                  }
                }}
                className='col-span-3'
              />
            </div>
          </div>
          <DialogFooter>
            <Button type='submit' onClick={saveItemEdits}>
              <Save className='mr-2 h-4 w-4' />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Client Dialog */}
      <Dialog open={clientDialogOpen} onOpenChange={setClientDialogOpen}>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>Edit Client Information</DialogTitle>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='client-name' className='text-right'>
                Name
              </Label>
              <Input
                id='client-name'
                value={editedClientValues.name || ''}
                onChange={(e) => {
                  return setEditedClientValues({ ...editedClientValues, name: e.target.value });
                }}
                className='col-span-3'
              />
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='client-company' className='text-right'>
                Company
              </Label>
              <Input
                id='client-company'
                value={editedClientValues.company || ''}
                onChange={(e) => {
                  return setEditedClientValues({ ...editedClientValues, company: e.target.value });
                }}
                className='col-span-3'
              />
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='client-email' className='text-right'>
                Email
              </Label>
              <Input
                id='client-email'
                type='email'
                value={editedClientValues.email || ''}
                onChange={(e) => {
                  return setEditedClientValues({ ...editedClientValues, email: e.target.value });
                }}
                className='col-span-3'
              />
            </div>
          </div>
          <DialogFooter>
            <Button type='submit' onClick={saveClientEdits}>
              <Save className='mr-2 h-4 w-4' />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InvoicePreview;
