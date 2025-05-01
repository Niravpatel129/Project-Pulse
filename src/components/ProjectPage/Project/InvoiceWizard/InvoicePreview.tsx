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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useProject } from '@/contexts/ProjectContext';
import { useParticipantMutations } from '@/hooks/useParticipantMutations';
import { Pencil, PlusCircle, Save, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import InvoiceItemDetails from './InvoiceItemDetails';
import { InvoiceItem } from './types';

interface InvoicePreviewProps {
  selectedItems: InvoiceItem[];
  calculateSubtotal: () => number;
  calculateTotal: () => number;
  selectedClient: any | null;
  setActiveTab: (tab: string) => void;
  onUpdateItems?: (items: InvoiceItem[]) => void;
  onUpdateClient?: (client: any) => void;
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
  console.log('🚀 selectedItems:', selectedItems);
  // State for editing
  const [editedItems, setEditedItems] = useState<InvoiceItem[]>([]);
  console.log('🚀 editedItems:', editedItems);

  const [editedClient, setEditedClient] = useState<any | null>(null);
  // State for edit dialogs
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState<InvoiceItem | null>(null);
  const [editedItemValues, setEditedItemValues] = useState<Partial<InvoiceItem>>({});
  const [editedClientValues, setEditedClientValues] = useState<{
    name: string;
    email: string;
    phone: string;
    website: string;
    jobTitle: string;
    mailingAddress: string;
    comments: string;
    customFields: {
      company: string;
      address: string;
      [key: string]: string;
    };
  }>({
    name: '',
    email: '',
    phone: '',
    website: '',
    jobTitle: '',
    mailingAddress: '',
    comments: '',
    customFields: {
      company: '',
      address: '',
    },
  });

  // Edit Client Dialog
  const [customFieldKey, setCustomFieldKey] = useState('');
  const [customFieldValue, setCustomFieldValue] = useState('');

  // Use project ID from the client if available
  const { project } = useProject();
  const projectId = project._id;

  // Initialize participant mutations
  const { addParticipantMutation, addExistingContactMutation, updateParticipantMutation } =
    useParticipantMutations(projectId, (open: boolean) => {
      return setClientDialogOpen(open);
    });

  // Initialize edited items and client when props change
  useEffect(() => {
    if (selectedItems.length > 0) {
      setEditedItems([...selectedItems]);
    }

    if (selectedClient) {
      const clientId = selectedClient.id || selectedClient._id;
      const editedClientId = editedClient?.id || editedClient?._id;

      if (!editedClient || clientId !== editedClientId) {
        setEditedClient({ ...selectedClient });
      }
    }
  }, [selectedItems, selectedClient, editedClient]);

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
  const openClientEditDialog = (client: any) => {
    setEditedClientValues({
      name: client.name || '',
      email: client.email || '',
      phone: client.phone || '',
      website: client.website || '',
      jobTitle: client.jobTitle || '',
      mailingAddress: client.mailingAddress || '',
      comments: client.comments || '',
      customFields: {
        company: client.customFields?.company || '',
        address: client.customFields?.address || '',
        ...(client.customFields || {}),
      },
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

  // Save client edits from dialog with mutation support
  const saveClientEdits = () => {
    if (!editedClient || !editedClientValues) return;

    const updatedClient = {
      ...editedClient,
      ...editedClientValues,
    };
    setEditedClient(updatedClient);
    console.log('🚀 updatedClient:', updatedClient);

    // If client has an ID and is a participant in the project
    if (updatedClient._id && projectId) {
      // Use the updateParticipantMutation to update the participant details
      updateParticipantMutation.mutate({
        participantId: updatedClient._id,
        updates: {
          name: updatedClient.name,
          email: updatedClient.email,
          phone: updatedClient.phone,
          // Don't need to transform customFields as it's already the correct format
          customFields: updatedClient.customFields,
        },
      });
    } else {
      // Fall back to the regular onUpdateClient
      if (onUpdateClient) {
        onUpdateClient(updatedClient);
      }
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

  // Add a new custom field
  const addCustomField = () => {
    if (!customFieldKey.trim()) return;

    setEditedClientValues({
      ...editedClientValues,
      customFields: {
        ...editedClientValues.customFields,
        [customFieldKey.trim()]: customFieldValue,
      },
    });

    // Reset the input fields
    setCustomFieldKey('');
    setCustomFieldValue('');
  };

  // Remove a custom field
  const removeCustomField = (key: string) => {
    const updatedCustomFields = { ...editedClientValues.customFields };
    delete updatedCustomFields[key];

    setEditedClientValues({
      ...editedClientValues,
      customFields: updatedCustomFields,
    });
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

        <div className='flex flex-col items-start pb-8 border-b w-full'>
          {selectedClient ? (
            <div className='w-full'>
              <div className=''>
                <div className='flex justify-between items-start'>
                  <h4 className='font-medium mb-2'>Bill To:</h4>
                  <Button
                    size='sm'
                    variant='ghost'
                    className='rounded-full h-6 w-6 p-0'
                    onClick={() => {
                      return editedClient && openClientEditDialog(editedClient);
                    }}
                  >
                    <Pencil size={12} />
                  </Button>
                </div>
                <p>{editedClient?.name || selectedClient.name}</p>
                <p className='text-sm text-muted-foreground'>
                  {editedClient?.email || selectedClient.email}
                </p>
                {(editedClient?.customFields?.company || selectedClient.customFields?.company) && (
                  <p className='text-sm text-muted-foreground'>
                    {editedClient?.customFields?.company || selectedClient.customFields?.company}
                  </p>
                )}
                {(editedClient?.customFields?.address || selectedClient.customFields?.address) && (
                  <p className='text-sm text-muted-foreground mt-1'>
                    {editedClient?.customFields?.address || selectedClient.customFields?.address}
                  </p>
                )}
                {(editedClient?.mailingAddress || selectedClient.mailingAddress) && (
                  <p className='text-sm text-muted-foreground mt-1'>
                    {editedClient?.mailingAddress || selectedClient.mailingAddress}
                  </p>
                )}
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
        <DialogContent className='sm:max-w-[550px]'>
          <DialogHeader>
            <DialogTitle>Edit Client Information</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue='basic' className='w-full'>
            <TabsList className='grid grid-cols-3 mb-4'>
              <TabsTrigger value='basic'>Basic Info</TabsTrigger>
              <TabsTrigger value='contact'>Contact Details</TabsTrigger>
              <TabsTrigger value='custom'>Custom Fields</TabsTrigger>
            </TabsList>

            <TabsContent value='basic' className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='client-name'>Name</Label>
                  <Input
                    id='client-name'
                    value={editedClientValues.name || ''}
                    onChange={(e) => {
                      return setEditedClientValues({ ...editedClientValues, name: e.target.value });
                    }}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='client-email'>Email</Label>
                  <Input
                    id='client-email'
                    type='email'
                    value={editedClientValues.email || ''}
                    onChange={(e) => {
                      return setEditedClientValues({
                        ...editedClientValues,
                        email: e.target.value,
                      });
                    }}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='client-company'>Company</Label>
                  <Input
                    id='client-company'
                    value={editedClientValues.customFields?.company || ''}
                    onChange={(e) => {
                      return setEditedClientValues({
                        ...editedClientValues,
                        customFields: {
                          ...editedClientValues.customFields,
                          company: e.target.value,
                        },
                      });
                    }}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='client-jobTitle'>Job Title</Label>
                  <Input
                    id='client-jobTitle'
                    value={editedClientValues.jobTitle || ''}
                    onChange={(e) => {
                      return setEditedClientValues({
                        ...editedClientValues,
                        jobTitle: e.target.value,
                      });
                    }}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value='contact' className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='client-phone'>Phone</Label>
                  <Input
                    id='client-phone'
                    type='tel'
                    value={editedClientValues.phone || ''}
                    onChange={(e) => {
                      return setEditedClientValues({
                        ...editedClientValues,
                        phone: e.target.value,
                      });
                    }}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='client-website'>Website</Label>
                  <Input
                    id='client-website'
                    type='url'
                    value={editedClientValues.website || ''}
                    onChange={(e) => {
                      return setEditedClientValues({
                        ...editedClientValues,
                        website: e.target.value,
                      });
                    }}
                  />
                </div>

                <div className='space-y-2 col-span-2'>
                  <Label htmlFor='client-custom-address'>Address</Label>
                  <Input
                    id='client-custom-address'
                    value={editedClientValues.customFields?.address || ''}
                    onChange={(e) => {
                      return setEditedClientValues({
                        ...editedClientValues,
                        customFields: {
                          ...editedClientValues.customFields,
                          address: e.target.value,
                        },
                      });
                    }}
                  />
                </div>

                <div className='space-y-2 col-span-2'>
                  <Label htmlFor='client-mailingAddress'>Mailing Address</Label>
                  <Textarea
                    id='client-mailingAddress'
                    value={editedClientValues.mailingAddress || ''}
                    onChange={(e) => {
                      return setEditedClientValues({
                        ...editedClientValues,
                        mailingAddress: e.target.value,
                      });
                    }}
                    placeholder='Street, City, State, ZIP, Country'
                    rows={2}
                  />
                </div>

                <div className='space-y-2 col-span-2'>
                  <Label htmlFor='client-comments'>Comments</Label>
                  <Textarea
                    id='client-comments'
                    value={editedClientValues.comments || ''}
                    onChange={(e) => {
                      return setEditedClientValues({
                        ...editedClientValues,
                        comments: e.target.value,
                      });
                    }}
                    placeholder='Additional comments about the client'
                    rows={2}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value='custom' className='space-y-4'>
              {/* Display existing custom fields (excluding company and address which have dedicated inputs) */}
              <div className='space-y-3'>
                {Object.entries(editedClientValues.customFields || {})
                  .filter(([key]) => {
                    return !['company', 'address'].includes(key);
                  })
                  .map(([key, value]) => {
                    return (
                      <div key={key} className='flex items-center gap-2'>
                        <div className='w-1/3 font-medium text-sm'>{key}</div>
                        <Input
                          className='flex-1'
                          value={value}
                          onChange={(e) => {
                            setEditedClientValues({
                              ...editedClientValues,
                              customFields: {
                                ...editedClientValues.customFields,
                                [key]: e.target.value,
                              },
                            });
                          }}
                        />
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => {
                            return removeCustomField(key);
                          }}
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </div>
                    );
                  })}

                {/* Add new custom field */}
                <div className='flex items-center gap-2 pt-2 mt-2 border-t'>
                  <Input
                    placeholder='Field name'
                    value={customFieldKey}
                    onChange={(e) => {
                      return setCustomFieldKey(e.target.value);
                    }}
                    className='w-1/3'
                  />
                  <Input
                    placeholder='Value'
                    value={customFieldValue}
                    onChange={(e) => {
                      return setCustomFieldValue(e.target.value);
                    }}
                    className='flex-1'
                  />
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={addCustomField}
                    disabled={!customFieldKey.trim()}
                  >
                    <PlusCircle className='h-4 w-4 mr-1' />
                    Add
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>

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
