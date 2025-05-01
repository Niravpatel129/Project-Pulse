import { useInvoiceWizard } from '@/hooks/useInvoiceWizard';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { InvoiceItem } from './types';

// Create a shipping item type
export type ShippingItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  carrier: string;
  estimatedDays: string;
};

type InvoiceWizardContextType = {
  // States
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedClient: any | null;
  setSelectedClient: (client: any) => void;
  taxRate: number;
  setTaxRate: (rate: number) => void;
  reducedTaxRate: number;
  setReducedTaxRate: (rate: number) => void;
  selectedTax: string;
  setSelectedTax: (tax: string) => void;
  notes: string;
  setNotes: (notes: string) => void;
  shippingRequired: boolean;
  setShippingRequired: (required: boolean) => void;
  hasPhysicalProducts: boolean;
  allItems: InvoiceItem[];
  setAllItems: (items: InvoiceItem[]) => void;
  showPreview: boolean;
  setShowPreview: (show: boolean) => void;

  // Shipping related states - now separate
  selectedShippingMethod: any | null;
  setSelectedShippingMethod: (method: any) => void;
  shippingItem: ShippingItem | null;
  setShippingItem: (item: ShippingItem | null) => void;
  useShippingAddress: boolean;
  setUseShippingAddress: (use: boolean) => void;
  shippingAddress: any;
  setShippingAddress: (address: any) => void;

  // Invoice wizard hook values
  selectedItems: InvoiceItem[];
  invoiceNumber: string;
  dueDate: Date;
  aiSuggestions: boolean;
  isGenerating: boolean;
  error: string | null;
  setInvoiceNumber: (number: string) => void;
  setDueDate: React.Dispatch<React.SetStateAction<Date>>;
  setAiSuggestions: (suggestions: boolean) => void;
  setSelectedItems: (items: InvoiceItem[]) => void;

  // Functions
  handleSelectClient: (client: any) => void;
  addShippingToInvoice: () => void;
  removeShipping: () => void;
  handleCreateInvoice: () => void;
  isItemSelected: (itemId: string) => boolean;
  toggleItemSelection: (item: any) => void;
  addAllItems: (type: 'task' | 'deliverable') => void;
  removeAllItems: (type: 'task' | 'deliverable') => void;
  areAllItemsSelected: (type: 'task' | 'deliverable') => boolean;
  togglePreview: () => void;
  handleUpdateItems: (updatedItems: any[]) => void;
  handleUpdateClient: (updatedClient: any) => void;
  calculateInvoiceSubtotal: () => number;
  calculateShippingTotal: () => number;
  calculateInvoiceTotal: () => number;
  handleAddItem: (item: any) => void;
  handleRemoveItem: (itemId: string) => void;
};

const InvoiceWizardContext = createContext<InvoiceWizardContextType | undefined>(undefined);

export const useInvoiceWizardContext = () => {
  const context = useContext(InvoiceWizardContext);
  if (context === undefined) {
    throw new Error('useInvoiceWizardContext must be used within an InvoiceWizardProvider');
  }
  return context;
};

interface InvoiceWizardProviderProps {
  children: ReactNode;
  projectId: string;
}

export const InvoiceWizardProvider = ({ children, projectId }: InvoiceWizardProviderProps) => {
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

  // Separate shipping state
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<any | null>(null);
  const [shippingItem, setShippingItem] = useState<ShippingItem | null>(null);
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

    // Create a shipping item
    const newShippingItem: ShippingItem = {
      id: `shipping-${Date.now()}`,
      name: `${selectedShippingMethod.name}`,
      description: `Shipping via ${selectedShippingMethod.carrier} - ${selectedShippingMethod.estimatedDays}`,
      price: selectedShippingMethod.price,
      carrier: selectedShippingMethod.carrier,
      estimatedDays: selectedShippingMethod.estimatedDays,
    };

    // Set the shipping item
    setShippingItem(newShippingItem);

    // Optionally navigate to a different tab
    setActiveTab('items');

    // Show a confirmation or feedback
    console.log('Shipping added to invoice:', newShippingItem);
  };

  // Function to remove shipping from the invoice
  const removeShipping = () => {
    setShippingItem(null);
  };

  const handleCreateInvoice = async () => {
    // For now, just console log instead of generating the invoice
    console.log('Creating invoice with data:', {
      selectedItems,
      selectedClient,
      invoiceNumber,
      dueDate,
      taxRate,
      notes,
      shipping: shippingItem
        ? {
            item: shippingItem,
            address: useShippingAddress ? shippingAddress : null,
          }
        : null,
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

  // Calculate invoice subtotal (regular items only)
  const calculateInvoiceSubtotal = () => {
    return selectedItems.reduce((sum, item) => {
      const quantity = item.quantity || 1;
      return sum + item.price * quantity;
    }, 0);
  };

  // Calculate shipping total
  const calculateShippingTotal = () => {
    return shippingItem ? shippingItem.price : 0;
  };

  // Calculate total invoice amount
  const calculateInvoiceTotal = () => {
    return calculateInvoiceSubtotal() + calculateShippingTotal();
  };

  const value = {
    activeTab,
    setActiveTab,
    selectedClient,
    setSelectedClient,
    taxRate,
    setTaxRate,
    reducedTaxRate,
    setReducedTaxRate,
    selectedTax,
    setSelectedTax,
    notes,
    setNotes,
    shippingRequired,
    setShippingRequired,
    hasPhysicalProducts,
    allItems,
    setAllItems,
    showPreview,
    setShowPreview,
    selectedShippingMethod,
    setSelectedShippingMethod,
    shippingItem,
    setShippingItem,
    useShippingAddress,
    setUseShippingAddress,
    shippingAddress,
    setShippingAddress,

    // Invoice wizard hook values
    selectedItems,
    invoiceNumber,
    dueDate,
    aiSuggestions,
    isGenerating,
    error,
    setInvoiceNumber,
    setDueDate,
    setAiSuggestions,
    setSelectedItems,

    // Functions
    handleSelectClient,
    addShippingToInvoice,
    removeShipping,
    handleCreateInvoice,
    isItemSelected,
    toggleItemSelection,
    addAllItems,
    removeAllItems,
    areAllItemsSelected,
    togglePreview,
    handleUpdateItems,
    handleUpdateClient,
    calculateInvoiceSubtotal,
    calculateShippingTotal,
    calculateInvoiceTotal,
    handleAddItem,
    handleRemoveItem,
  };

  return <InvoiceWizardContext.Provider value={value}>{children}</InvoiceWizardContext.Provider>;
};
