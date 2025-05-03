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
import { Textarea } from '@/components/ui/textarea';
import { useProject } from '@/contexts/ProjectContext';
import { format } from 'date-fns';
import { Pencil, Percent, PlusCircle, Save, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import ClientDetailsDialog from './ClientDetailsDialog';
import { useInvoiceWizardContext } from './InvoiceWizardContext';
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
  // Get shipping information from context
  const {
    shippingItem,
    removeShipping,
    calculateShippingTotal,
    shippingRequired,
    taxId,
    showTaxId,
    dueDate,
    discount,
  } = useInvoiceWizardContext();

  // State for editing
  const [editedItems, setEditedItems] = useState<InvoiceItem[]>([]);
  const [editedClient, setEditedClient] = useState<any | null>(null);

  // State for edit dialogs
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState<InvoiceItem | null>(null);
  const [editedItemValues, setEditedItemValues] = useState<Partial<InvoiceItem>>({});

  // Use project ID from the client if available
  const { project } = useProject();
  const projectId = project._id;

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

  // Handle updated client from dialog
  const handleClientUpdated = (updatedClient: any) => {
    setEditedClient(updatedClient);

    if (onUpdateClient) {
      onUpdateClient(updatedClient);
    }
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

  // Add a confirmation for removing shipping
  const handleRemoveShipping = () => {
    if (window.confirm('Remove shipping from invoice?')) {
      removeShipping();
    }
  };

  // Calculate discount amount
  const calculateDiscountAmount = () => {
    if (!discount) return 0;
    const subtotal = calculateSubtotal();
    return (subtotal * discount) / 100;
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

        <div className='flex flex-col py-4 border-b w-full items-center'>
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

        {/* Shipping as a separate section */}
        {shippingItem && (
          <div className='mt-6'>
            <div className='flex justify-between items-center mb-2'>
              {/* <Button
                variant='ghost'
                size='sm'
                className='h-8 text-red-500 flex items-center gap-1'
                onClick={handleRemoveShipping}
              >
                <Trash2 size={14} />
                <span>Remove</span>
              </Button> */}
            </div>
            <div className='p-3 border rounded-md bg-white hover:bg-gray-50 transition-colors relative group'>
              <X
                size={14}
                className='text-black absolute top-2 right-2 cursor-pointer hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity'
                onClick={handleRemoveShipping}
              />
              <div className='flex justify-between items-start'>
                <div>
                  <h5 className='font-medium'>{shippingItem.name}</h5>
                  <p className='text-sm text-muted-foreground mt-1'>{shippingItem.description}</p>
                </div>
              </div>
              <div className='flex justify-between items-center mt-2 text-sm'>
                <span>Shipping Cost</span>
                <span className='font-medium'>${shippingItem.price.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Display Tax ID if enabled */}
        {showTaxId && taxId && (
          <div className='mt-4 mb-2 p-3 border rounded-md bg-white'>
            <div className='flex flex-col'>
              <h5 className='font-medium mb-1'>Tax ID</h5>
              <p className='text-sm text-muted-foreground'>{taxId}</p>
            </div>
          </div>
        )}

        {/* Display Due Date if set */}
        {dueDate && (
          <div className='mt-4 mb-2 p-3 border rounded-md bg-white'>
            <div className='flex flex-col'>
              <h5 className='font-medium mb-1'>Due Date</h5>
              <p className='text-sm text-muted-foreground'>{format(dueDate, 'MMMM do, yyyy')}</p>
            </div>
          </div>
        )}

        <div className='mt-4 flex-1 overflow-y-auto'>
          <h4 className='font-medium mb-2'>Items</h4>
          <div className='space-y-2 mb-4'>
            {editedItems.map((item) => {
              return (
                <div
                  key={item._id}
                  className='p-3 border rounded-md bg-white hover:bg-gray-50 transition-colors group'
                >
                  <div className='flex justify-between items-start'>
                    <div>
                      <div className='flex items-center gap-2'>
                        <h5 className='font-medium'>{item.name}</h5>
                      </div>
                      <p className='text-sm text-muted-foreground mt-1 line-clamp-2'>
                        {item.description}
                      </p>
                    </div>
                    <div className='flex opacity-0 group-hover:opacity-100 transition-opacity'>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-8 w-8'
                        onClick={() => {
                          return openItemEditDialog(item);
                        }}
                      >
                        <Pencil size={14} />
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-8 w-8 text-red-500'
                        onClick={() => {
                          return removeItem(item.id);
                        }}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                  <div className='flex justify-between items-center mt-2 text-sm'>
                    <span>
                      {item.quantity || 1} x ${item.price}
                    </span>
                    <span className='font-medium'>
                      ${((item.quantity || 1) * item.price).toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}

            {editedItems.length === 0 && !shippingItem && (
              <div className='text-center p-4 border rounded-lg'>
                <p className='text-muted-foreground'>No items added</p>
                <Button
                  variant='link'
                  className='mt-1'
                  onClick={() => {
                    return setActiveTab('items');
                  }}
                >
                  Add items
                </Button>
              </div>
            )}
          </div>

          <div className='mt-4 space-y-2'>
            <div className='flex justify-between'>
              <span className='text-sm'>Subtotal</span>
              <span className='font-medium'>${calculateSubtotal().toFixed(2)}</span>
            </div>

            {/* Show discount in totals if there's a discount applied */}
            {discount > 0 && (
              <div className='flex justify-between'>
                <span className='text-sm flex items-center gap-1'>
                  <Percent size={12} className='text-emerald-600' /> Discount ({discount}%)
                </span>
                <span className='font-medium text-emerald-600'>
                  -${calculateDiscountAmount().toFixed(2)}
                </span>
              </div>
            )}

            {/* Show shipping in totals if there's a shipping item */}
            {shippingItem && (
              <div className='flex justify-between'>
                <span className='text-sm'>Shipping</span>
                <span className='font-medium'>${calculateShippingTotal().toFixed(2)}</span>
              </div>
            )}

            <div className='flex justify-between border-t pt-2'>
              <span className='text-sm font-medium'>Total</span>
              <span className='font-medium'>${calculateTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Item Edit Dialog */}
      <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <div>
              <Label htmlFor='item-name'>Name</Label>
              <Input
                id='item-name'
                value={editedItemValues.name || ''}
                onChange={(e) => {
                  return setEditedItemValues({ ...editedItemValues, name: e.target.value });
                }}
              />
            </div>
            <div>
              <Label htmlFor='item-description'>Description</Label>
              <Textarea
                id='item-description'
                value={editedItemValues.description || ''}
                onChange={(e) => {
                  return setEditedItemValues({
                    ...editedItemValues,
                    description: e.target.value,
                  });
                }}
              />
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='item-price'>Price ($)</Label>
                <Input
                  id='item-price'
                  type='number'
                  min='0'
                  step='0.01'
                  value={editedItemValues.price || 0}
                  onChange={(e) => {
                    return setEditedItemValues({
                      ...editedItemValues,
                      price: parseFloat(e.target.value),
                    });
                  }}
                />
              </div>
              <div>
                <Label htmlFor='item-quantity'>Quantity</Label>
                <Input
                  id='item-quantity'
                  type='number'
                  min='1'
                  value={editedItemValues.quantity || 1}
                  onChange={(e) => {
                    return setEditedItemValues({
                      ...editedItemValues,
                      quantity: parseInt(e.target.value, 10),
                    });
                  }}
                />
              </div>
            </div>
            {/* Total calculation */}
            <div className='pt-2 border-t'>
              <div className='flex justify-between'>
                <span className='text-sm'>Total:</span>
                <span className='font-medium'>
                  ${((editedItemValues.price || 0) * (editedItemValues.quantity || 1)).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                return setItemDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={saveItemEdits}>
              <Save size={16} className='mr-2' />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Client Edit Dialog */}
      {clientDialogOpen && editedClient && (
        <ClientDetailsDialog
          client={editedClient}
          open={clientDialogOpen}
          onOpenChange={setClientDialogOpen}
          onClientUpdated={handleClientUpdated}
        />
      )}
    </>
  );
};

export default InvoicePreview;
