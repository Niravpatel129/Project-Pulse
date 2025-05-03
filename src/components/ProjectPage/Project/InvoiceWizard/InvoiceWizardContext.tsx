import { useInvoiceSettings } from '@/hooks/useInvoiceSettings';
import { useInvoiceWizard } from '@/hooks/useInvoiceWizard';
import { useUpdateInvoiceSettings } from '@/hooks/useUpdateInvoiceSettings';
import { newRequest } from '@/utils/newRequest';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
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
  taxId: string;
  setTaxId: (id: string) => void;
  showTaxId: boolean;
  setShowTaxId: (show: boolean) => void;
  discount: number;
  setDiscount: (discount: number) => void;

  // Delivery options
  sendAutomatically: boolean;
  setSendAutomatically: (send: boolean) => void;
  includePaymentLink: boolean;
  setIncludePaymentLink: (include: boolean) => void;
  scheduleReminders: boolean;
  setScheduleReminders: (schedule: boolean) => void;

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
  dueDate: Date | null;
  aiSuggestions: boolean;
  isGenerating: boolean;
  error: string | null;
  setDueDate: React.Dispatch<React.SetStateAction<Date | null>>;
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
    dueDate,
    aiSuggestions,
    isGenerating,
    error,
    setDueDate,
    setAiSuggestions,
    handleAddItem,

    handleRemoveItem,
    setSelectedItems,
  } = useInvoiceWizard();

  const { data: invoiceSettings } = useInvoiceSettings();
  const updateInvoiceSettings = useUpdateInvoiceSettings();

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
  const [taxId, setTaxId] = useState('');
  const [showTaxId, setShowTaxId] = useState(false);
  const [discount, setDiscount] = useState(0);

  // Delivery options
  const [sendAutomatically, setSendAutomatically] = useState(true);
  const [includePaymentLink, setIncludePaymentLink] = useState(true);
  const [scheduleReminders, setScheduleReminders] = useState(false);

  // Separate shipping state
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<any | null>(null);
  const [shippingItem, setShippingItem] = useState<ShippingItem | null>(null);
  const [useShippingAddress, setUseShippingAddress] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<any>(null);

  // Initialize taxId and showTaxId from invoice settings
  useEffect(() => {
    if (invoiceSettings) {
      if (invoiceSettings.taxId !== undefined) {
        setTaxId(invoiceSettings.taxId);
      }
      if (invoiceSettings.showTaxId !== undefined) {
        setShowTaxId(invoiceSettings.showTaxId);
      }
    }
  }, [invoiceSettings]);

  // Update invoice settings when taxId or showTaxId changes
  const handleTaxIdChange = (value: string) => {
    setTaxId(value);
    if (invoiceSettings) {
      updateInvoiceSettings.mutate({
        settings: {
          ...invoiceSettings,
          taxId: value,
        },
      });
    }
  };

  const handleShowTaxIdChange = (value: boolean) => {
    setShowTaxId(value);
    if (invoiceSettings) {
      updateInvoiceSettings.mutate({
        settings: {
          ...invoiceSettings,
          showTaxId: value,
        },
      });
    }
  };

  useEffect(() => {
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

    // If we're not using a custom shipping address, set the shipping address from the client
    if (!useShippingAddress && selectedClient) {
      if (selectedClient.shippingAddress) {
        setShippingAddress(selectedClient.shippingAddress);
      } else if (selectedClient.mailingAddress) {
        setShippingAddress({
          streetAddress1: selectedClient.mailingAddress,
          city: selectedClient.customFields?.city || '',
          state: selectedClient.customFields?.state || '',
          postalCode: selectedClient.customFields?.postalCode || '',
          country: selectedClient.customFields?.country || '',
        });
      } else if (selectedClient.address) {
        setShippingAddress(selectedClient.address);
      }
    }

    // Optionally navigate to a different tab
    setActiveTab('items');

    // Show a confirmation or feedback
    console.log('Shipping added to invoice:', newShippingItem);
  };

  // Function to remove shipping from the invoice
  const removeShipping = () => {
    setShippingItem(null);
  };

  // Function to check if a tax is selected
  const isTaxSelected = () => {
    return selectedTax && selectedTax !== 'no-tax';
  };

  // Function to get the effective tax rate for the selected tax
  const getEffectiveTaxRate = () => {
    if (!selectedTax || selectedTax === 'no-tax') {
      return 0;
    }

    if (selectedTax === 'standard') {
      return taxRate;
    }

    if (selectedTax === 'reduced') {
      return reducedTaxRate;
    }

    // For custom tax IDs (like "tax-1744414349118"), use the custom rate (11%)
    if (selectedTax.startsWith('tax-')) {
      // Here you would ideally look up the actual rate from your tax data
      // For now, we'll hardcode the 11% rate
      return 11;
    }

    return 0;
  };

  // Calculate total invoice amount
  const calculateInvoiceTotal = () => {
    const subtotal = calculateInvoiceSubtotal();
    const shippingTotal = calculateShippingTotal();
    const discountAmount = calculateDiscountAmount();

    let taxAmount = 0;
    if (isTaxSelected()) {
      const effectiveTaxRate = getEffectiveTaxRate();
      taxAmount = (subtotal - discountAmount) * (effectiveTaxRate / 100);
    }

    return subtotal - discountAmount + shippingTotal + taxAmount;
  };

  const handleCreateInvoice = async () => {
    // Calculate totals
    const subtotal = calculateInvoiceSubtotal();
    const shippingTotal = calculateShippingTotal();
    const discountAmount = calculateDiscountAmount();

    // Calculate tax amount based on selected tax type
    const effectiveTaxRate = getEffectiveTaxRate();
    const taxAmount = isTaxSelected() ? (subtotal - discountAmount) * (effectiveTaxRate / 100) : 0;

    const total = subtotal - discountAmount + shippingTotal + taxAmount;

    try {
      // Prepare invoice data for backend
      const invoiceData = {
        selectedItems: selectedItems,
        selectedClient: selectedClient,
        dueDate: dueDate || undefined,
        taxRate: effectiveTaxRate,
        notes,
        taxId,
        showTaxId,
        discount,
        subtotal,
        shippingTotal,
        discountAmount,
        total,
        currency: invoiceSettings?.currency || 'usd',
        selectedTax: {
          type: selectedTax,
          amount: taxAmount,
        },
        deliveryOptions: sendAutomatically ? 'email' : 'manual',
        shipping: shippingItem
          ? {
              item: shippingItem,
              address: useShippingAddress
                ? shippingAddress
                : selectedClient?.shippingAddress ||
                  (selectedClient?.mailingAddress
                    ? {
                        streetAddress1: selectedClient?.mailingAddress,
                        city: selectedClient?.customFields?.city || '',
                        state: selectedClient?.customFields?.state || '',
                        postalCode: selectedClient?.customFields?.postalCode || '',
                        country: selectedClient?.customFields?.country || '',
                      }
                    : null),
            }
          : null,
      };

      // Make API call to create invoice
      const response = await newRequest.post(`/projects/${projectId}/invoices/v2`, invoiceData);

      const result = response.data;
      console.log('Invoice created successfully:', result);
      toast.success('Invoice created successfully');

      // You might want to add navigation or success messaging here
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error('Error creating invoice');
      // Handle error state here
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

  // Calculate invoice subtotal (regular items only)
  const calculateInvoiceSubtotal = () => {
    return selectedItems.reduce((total, item) => {
      return total + Number(item.price) * (item.quantity || 1);
    }, 0);
  };

  // Calculate shipping total
  const calculateShippingTotal = () => {
    return shippingItem ? shippingItem.price : 0;
  };

  // Calculate discount amount
  const calculateDiscountAmount = () => {
    if (!discount) return 0;
    const subtotal = calculateInvoiceSubtotal();
    return (subtotal * discount) / 100;
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
    taxId,
    setTaxId: handleTaxIdChange,
    showTaxId,
    setShowTaxId: handleShowTaxIdChange,
    discount,
    setDiscount,

    // Delivery options
    sendAutomatically,
    setSendAutomatically,
    includePaymentLink,
    setIncludePaymentLink,
    scheduleReminders,
    setScheduleReminders,

    // Invoice wizard hook values
    selectedItems,
    dueDate,
    aiSuggestions,
    isGenerating,
    error,
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
