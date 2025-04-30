import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useInvoiceWizard } from '@/hooks/useInvoiceWizard';
import { useEffect, useState } from 'react';
import InvoiceClient from './InvoiceClient';
import InvoiceDetails from './InvoiceDetails';
import InvoiceItems from './InvoiceItems';
import InvoicePreview from './InvoicePreview';
import InvoiceShipping from './InvoiceShipping';
import InvoiceSidebar from './InvoiceSidebar';
import { Client, InvoiceItem, ShippingMethod } from './types';

interface InvoiceWizardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  clients?: Client[];
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
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [taxRate, setTaxRate] = useState(20);
  const [reducedTaxRate, setReducedTaxRate] = useState(5);
  const [notes, setNotes] = useState('');
  const [shippingRequired, setShippingRequired] = useState(false);
  const [hasPhysicalProducts, setHasPhysicalProducts] = useState(false);
  const [removedItems, setRemovedItems] = useState<InvoiceItem[]>([]);
  const [allItems, setAllItems] = useState<InvoiceItem[]>([]);

  // Shipping related states
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<ShippingMethod | null>(null);
  const [useShippingAddress, setUseShippingAddress] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<any>(null);

  const shippingMethods: ShippingMethod[] = [
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

  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
  };

  const addShippingToInvoice = () => {
    // Implementation would add shipping to the invoice
    console.log('Adding shipping method:', selectedShippingMethod);
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
  const toggleItemSelection = (item: InvoiceItem) => {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-[1400px] p-0 overflow-hidden'>
        <DialogTitle className='sr-only'>Invoice Wizard</DialogTitle>
        <div className='flex h-[800px]'>
          {/* Sidebar Navigation */}
          <InvoiceSidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            invoiceNumber={invoiceNumber}
            setInvoiceNumber={setInvoiceNumber}
            dueDate={dueDate}
            setDueDate={setDueDate}
            aiSuggestions={aiSuggestions}
            setAiSuggestions={setAiSuggestions}
            calculateSubtotal={calculateSubtotal}
            calculateTotal={calculateTotal}
            error={error}
            isGenerating={isGenerating}
            handleCreateInvoice={handleCreateInvoice}
            shippingRequired={shippingRequired}
            hasPhysicalProducts={hasPhysicalProducts}
          />

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
              <div className='flex-1 p-4 overflow-y-auto pb-24'>
                {activeTab === 'items' && (
                  <InvoiceItems
                    allItems={allItems}
                    selectedItems={selectedItems}
                    toggleItemSelection={toggleItemSelection}
                    isItemSelected={isItemSelected}
                    addAllItems={addAllItems}
                    removeAllItems={removeAllItems}
                    areAllItemsSelected={areAllItemsSelected}
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
                  />
                )}

                {activeTab === 'shipping' && (
                  <InvoiceShipping
                    shippingMethods={shippingMethods}
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

              {/* Invoice Preview */}
              <InvoicePreview
                selectedItems={selectedItems}
                calculateSubtotal={calculateSubtotal}
                calculateTotal={calculateTotal}
                selectedClient={selectedClient}
                setActiveTab={setActiveTab}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceWizardDialog;
