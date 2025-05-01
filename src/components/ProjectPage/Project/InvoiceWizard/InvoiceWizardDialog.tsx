import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useInvoiceWizard } from '@/hooks/useInvoiceWizard';
import { ChevronLeft, Eye, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import InvoiceClient from './InvoiceClient';
import InvoiceDetails from './InvoiceDetails';
import InvoiceItems from './InvoiceItems';
import InvoicePreview from './InvoicePreview';
import InvoiceShipping from './InvoiceShipping';
import InvoiceSidebar from './InvoiceSidebar';
import { InvoiceItem } from './types';

interface InvoiceWizardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  clients?: any[];
}

const InvoiceWizardDialog = ({
  open,
  onOpenChange,
  projectId,
  clients = [],
}: InvoiceWizardDialogProps) => {
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
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [taxRate, setTaxRate] = useState(20);
  const [reducedTaxRate, setReducedTaxRate] = useState(5);
  const [selectedTax, setSelectedTax] = useState('no-tax');
  const [notes, setNotes] = useState('');
  const [shippingRequired, setShippingRequired] = useState(false);
  const [hasPhysicalProducts, setHasPhysicalProducts] = useState(false);
  const [allItems, setAllItems] = useState<InvoiceItem[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  // Shipping related states
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<any | null>(null);
  const [useShippingAddress, setUseShippingAddress] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<any>(null);

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
    setAllItems((prev: any) => {
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
    if (!selectedShippingMethod) return;

    // Create a shipping item to add to the invoice
    const shippingItem = {
      id: `shipping-${Date.now()}`,
      name: `${selectedShippingMethod.name} (${selectedShippingMethod.carrier})`,
      description: `Shipping via ${selectedShippingMethod.carrier} - ${selectedShippingMethod.estimatedDays}`,
      price: selectedShippingMethod.price,
      quantity: 1,
      type: 'shipping',
      taxable: false, // Depending on tax requirements
    };

    // Add the shipping item to the selected items
    setSelectedItems([...selectedItems, shippingItem]);

    // Optionally navigate to preview or items tab
    setActiveTab('items');

    // Show a confirmation or feedback
    console.log('Shipping added to invoice:', shippingItem);
  };

  const handleCreateInvoice = async () => {
    const result = await generateInvoice();
    if (result) {
      // Handle successful invoice creation - could close dialog or show success message
      onOpenChange(false);
    }
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

  // Function to toggle preview on mobile
  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  // Function to handle updating items from the preview component
  const handleUpdateItems = (updatedItems: any[]) => {
    setSelectedItems(updatedItems);
  };

  // Function to handle updating client from the preview component
  const handleUpdateClient = (updatedClient: any) => {
    setSelectedClient(updatedClient);
  };

  // Custom calculate functions that handle shipping items properly
  const calculateInvoiceSubtotal = () => {
    // Calculate only non-shipping items
    return selectedItems
      .filter((item) => {
        return item.type !== 'shipping';
      })
      .reduce((sum, item) => {
        const quantity = item.quantity || 1;
        return sum + item.price * quantity;
      }, 0);
  };

  const calculateShippingTotal = () => {
    // Calculate only shipping items
    return selectedItems
      .filter((item) => {
        return item.type === 'shipping';
      })
      .reduce((sum, item) => {
        return sum + item.price;
      }, 0);
  };

  const calculateInvoiceTotal = () => {
    // Calculate subtotal + shipping
    return calculateInvoiceSubtotal() + calculateShippingTotal();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-[1400px] p-0 sm:max-h-[95vh] h-full md:h-[800px] w-full'>
        <DialogTitle className='sr-only'>Invoice Wizard</DialogTitle>
        <div className='flex flex-col md:flex-row h-full overflow-hidden'>
          {/* Sidebar Navigation - Hidden on mobile, shown on tablet/desktop */}
          <div className='hidden md:block'>
            <InvoiceSidebar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              invoiceNumber={invoiceNumber}
              setInvoiceNumber={setInvoiceNumber}
              dueDate={dueDate}
              setDueDate={setDueDate}
              aiSuggestions={aiSuggestions}
              setAiSuggestions={setAiSuggestions}
              calculateSubtotal={calculateInvoiceSubtotal}
              calculateTotal={calculateInvoiceTotal}
              error={error}
              isGenerating={isGenerating}
              handleCreateInvoice={handleCreateInvoice}
              shippingRequired={shippingRequired}
              hasPhysicalProducts={hasPhysicalProducts}
            />
          </div>

          {/* Mobile Sidebar - Only visible on mobile */}
          <div className='flex md:hidden border-b p-4 justify-between items-center'>
            <h2 className='font-semibold'>Invoice Wizard</h2>
            <div className='flex items-center gap-2'>
              <Button variant='outline' size='sm' className='px-2 py-1' onClick={togglePreview}>
                {showPreview ? <ChevronLeft size={18} /> : <Eye size={18} />}
                {showPreview ? 'Back' : 'Preview'}
              </Button>
              <Button
                variant='ghost'
                size='sm'
                className='px-2 py-1'
                onClick={() => {
                  return onOpenChange(false);
                }}
              >
                <X size={18} />
              </Button>
            </div>
          </div>

          {/* Mobile Tab Navigation */}
          <div className='flex md:hidden overflow-x-auto border-b'>
            <button
              className={`p-3 ${activeTab === 'items' ? 'border-b-2 border-black' : ''}`}
              onClick={() => {
                return setActiveTab('items');
              }}
            >
              Items
            </button>
            <button
              className={`p-3 ${activeTab === 'client' ? 'border-b-2 border-black' : ''}`}
              onClick={() => {
                return setActiveTab('client');
              }}
            >
              Client
            </button>
            <button
              className={`p-3 ${activeTab === 'details' ? 'border-b-2 border-black' : ''}`}
              onClick={() => {
                return setActiveTab('details');
              }}
            >
              Details
            </button>
            {(shippingRequired || hasPhysicalProducts) && (
              <button
                className={`p-3 ${activeTab === 'shipping' ? 'border-b-2 border-black' : ''}`}
                onClick={() => {
                  return setActiveTab('shipping');
                }}
              >
                Shipping
              </button>
            )}
          </div>

          {/* Main Content */}
          <div className='flex-1 flex flex-col h-full overflow-hidden'>
            {/* Select Items Header - Desktop only */}
            <div className='hidden md:flex justify-between items-center p-4 border-b'>
              <h2 className='font-semibold'>
                {activeTab === 'items' && 'Select Items'}
                {activeTab === 'client' && 'Select Client'}
                {activeTab === 'details' && 'Invoice Details'}
                {activeTab === 'shipping' && 'Shipping Details'}
              </h2>
            </div>

            {/* Content Area */}
            <div className='flex h-full flex-col md:flex-row overflow-hidden'>
              {/* Main Content - Hidden when preview is shown on mobile */}
              <div
                className={`flex-1 p-4 overflow-y-auto pb-24 ${
                  showPreview ? 'hidden md:block' : 'block'
                }`}
              >
                {activeTab === 'items' && (
                  <InvoiceItems
                    allItems={allItems}
                    selectedItems={selectedItems}
                    toggleItemSelection={toggleItemSelection}
                    addAllItems={addAllItems}
                    removeAllItems={removeAllItems}
                  />
                )}

                {activeTab === 'client' && (
                  <InvoiceClient
                    clients={clients}
                    selectedClient={selectedClient}
                    handleSelectClient={handleSelectClient}
                  />
                )}

                {activeTab === 'details' && (
                  <InvoiceDetails
                    taxRate={taxRate}
                    setTaxRate={setTaxRate}
                    reducedTaxRate={reducedTaxRate}
                    setReducedTaxRate={setReducedTaxRate}
                    notes={notes}
                    setNotes={setNotes}
                    shippingRequired={shippingRequired}
                    setShippingRequired={setShippingRequired}
                    hasPhysicalProducts={hasPhysicalProducts}
                    selectedTax={selectedTax}
                    setSelectedTax={setSelectedTax}
                  />
                )}

                {activeTab === 'shipping' && (
                  <InvoiceShipping
                    selectedShippingMethod={selectedShippingMethod}
                    setSelectedShippingMethod={setSelectedShippingMethod}
                    selectedClient={selectedClient}
                    useShippingAddress={useShippingAddress}
                    setUseShippingAddress={setUseShippingAddress}
                    shippingAddress={shippingAddress}
                    setShippingAddress={setShippingAddress}
                    addShippingToInvoice={addShippingToInvoice}
                    setActiveTab={setActiveTab}
                  />
                )}
              </div>

              {/* Invoice Preview - Hidden by default on mobile, shown when toggled */}
              <div
                className={`${
                  showPreview ? 'block' : 'hidden md:block'
                } md:w-[400px] border-l overflow-y-auto`}
              >
                <InvoicePreview
                  selectedItems={selectedItems}
                  calculateSubtotal={calculateInvoiceSubtotal}
                  calculateTotal={calculateInvoiceTotal}
                  selectedClient={selectedClient}
                  setActiveTab={setActiveTab}
                  onUpdateItems={handleUpdateItems}
                  onUpdateClient={handleUpdateClient}
                />
              </div>
            </div>

            {/* Mobile Action Bar */}
            <div className='md:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-between gap-2'>
              <div className='text-sm'>
                <div>Total: ${calculateInvoiceTotal().toFixed(2)}</div>
                {error && <div className='text-red-500 text-xs'>{error}</div>}
              </div>
              <Button
                className='bg-black text-white hover:bg-gray-800'
                onClick={handleCreateInvoice}
                disabled={isGenerating}
              >
                {isGenerating ? 'Creating...' : 'Create Invoice'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceWizardDialog;
