import { useInvoiceEditor } from '@/app/[workspace]/invoices/new/hooks/useInvoiceEditor';
import { useToast } from '@/components/ui/use-toast';
import { useProject } from '@/contexts/ProjectContext';
import { useInvoiceSettings } from '@/hooks/useInvoiceSettings';
import { useProjectModules } from '@/hooks/useProjectModules';
import { useUpdateInvoiceSettings } from '@/hooks/useUpdateInvoiceSettings';
import { newRequest } from '@/utils/newRequest';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';

interface SuggestedLineItem {
  id: string;
  moduleId: string;
  moduleType?: string;
  moduleName: string;
  name: string;
  price: string;
  quantity: number;
  discount?: number;
}

export function useQuickInvoice(open: boolean, onOpenChange: (open: boolean) => void) {
  const { project } = useProject();
  const { modules } = useProjectModules();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    handleCustomerSelect,
    selectedCustomer,
    selectedItems,
    handleSaveItem,
    sendInvoiceMutation,
    currentCustomer,
    currency,
    setCurrency,
    deliveryMethod,
    setDeliveryMethod,
    selectedTax,
    setSelectedTax,
  } = useInvoiceEditor();

  const { data: invoiceSettings } = useInvoiceSettings();
  const updateInvoiceSettings = useUpdateInvoiceSettings();

  // Line items and basic settings
  const hasSelectedClientRef = useRef(false);
  const [lineItems, setLineItems] = useState<SuggestedLineItem[]>([]);
  const [autoApplyDiscount, setAutoApplyDiscount] = useState(false);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState(10);
  const [memo, setMemo] = useState('');
  const [footer, setFooter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localCurrency, setLocalCurrency] = useState(invoiceSettings?.currency || 'usd');
  const [icon, setIcon] = useState(invoiceSettings?.icon || '');
  const [logo, setLogo] = useState(invoiceSettings?.logo || '');
  const [showTaxId, setShowTaxId] = useState(invoiceSettings?.showTaxId || false);
  const [taxId, setTaxId] = useState(invoiceSettings?.taxId || '');
  const [isCustomerPicked, setIsCustomerPicked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dueDate, setDueDate] = useState<string>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  );

  // Fetch suggested line items from backend
  const fetchSuggestedLineItems = useCallback(
    async (projectId: string) => {
      if (!projectId) return [];

      setIsLoading(true);
      try {
        const response = await newRequest.get(`/projects/${projectId}/suggested-line-items`);
        return response.data.data || [];
      } catch (error) {
        console.error('Error fetching suggested line items:', error);
        toast({
          title: "Couldn't fetch suggested items",
          description: 'Using module data instead',
          variant: 'destructive',
        });
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [toast],
  );

  // Create line items from modules as fallback
  const createLineItemsFromModules = useCallback(() => {
    if (!modules?.length) return;

    const defaultItems = modules.map((module) => {
      const price = inferPriceFromModule(module);

      return {
        id: `module-item-${module._id}`,
        moduleId: module._id,
        moduleType: 'module',
        moduleName: module.name || '',
        name: module.name || '',
        price: price || '',
        quantity: 1,
        discount: 0,
      };
    });

    setLineItems(defaultItems);
  }, [modules]);

  // Try to extract price from module data (fallback method)
  const inferPriceFromModule = (module: any): string => {
    if (!module) return '';

    // Common price field names
    const priceFields = ['price', 'cost', 'rate', 'fee', 'amount', 'budget', 'value'];

    // Check direct fields
    for (const field of priceFields) {
      if (module[field] !== undefined && module[field] !== null) {
        const value = module[field];
        if (typeof value === 'number') return value.toString();
        if (typeof value === 'string' && !isNaN(parseFloat(value))) {
          return parseFloat(value).toString();
        }
      }
    }

    // Look for any property that might contain a numeric value
    for (const key in module) {
      const value = module[key];
      if (typeof value === 'number' && value > 0) {
        return value.toString();
      }
      if (typeof value === 'string' && !isNaN(parseFloat(value)) && parseFloat(value) > 0) {
        return parseFloat(value).toString();
      }
    }

    return '';
  };

  // Fetch suggested items when dialog opens
  useEffect(() => {
    if (open && project?._id) {
      fetchSuggestedLineItems(project._id).then((suggestedItems) => {
        if (suggestedItems && suggestedItems.length > 0) {
          // Convert API response to our format
          const formattedItems = suggestedItems.map((item: any, index: number) => {
            return {
              id: `api-item-${index}-${Date.now()}`,
              moduleId: item.moduleId || '',
              moduleType: item.moduleType || '',
              moduleName: item.moduleType || 'Module',
              name: item.name || 'Service',
              price: item.price?.toString() || '',
              quantity: 1,
              discount: 0,
            };
          });
          setLineItems(formattedItems);
        } else {
          // Fallback to module-based generation if API returns empty
          createLineItemsFromModules();
        }
      });
    }
  }, [open, project, fetchSuggestedLineItems, createLineItemsFromModules]);

  // Reset when dialog closes
  useEffect(() => {
    if (!open) {
      hasSelectedClientRef.current = false;
      setLineItems([]);
      setMemo('');
      setAutoApplyDiscount(false);
      setIsCustomerPicked(false);
    }
  }, [open]);

  // Select first client when dialog opens, only once
  useEffect(() => {
    if (open && !hasSelectedClientRef.current && project?.participants?.length > 0) {
      const firstParticipant = project.participants[0];
      if (firstParticipant && firstParticipant._id) {
        handleCustomerSelect(firstParticipant._id);
        hasSelectedClientRef.current = true;
      }
    }
  }, [open, project, handleCustomerSelect]);

  // Handle updating line item fields
  const handleLineItemChange = (
    itemId: string,
    field: keyof SuggestedLineItem,
    value: string | number,
  ) => {
    setLineItems((prevItems) => {
      return prevItems.map((item) => {
        return item.id === itemId ? { ...item, [field]: value } : item;
      });
    });
  };

  // Add a new custom line item
  const addCustomLineItem = () => {
    setLineItems((prevItems) => {
      return [
        ...prevItems,
        {
          id: `custom-item-${Date.now()}`,
          moduleId: '',
          moduleType: 'custom',
          moduleName: 'Custom',
          name: 'Custom Service',
          price: '',
          quantity: 1,
          discount: autoApplyDiscount ? discountValue : 0,
        },
      ];
    });
  };

  // Remove a line item
  const removeLineItem = (itemId: string) => {
    setLineItems((prevItems) => {
      return prevItems.filter((item) => {
        return item.id !== itemId;
      });
    });
  };

  // Apply discount to all items
  const toggleDiscount = (enabled: boolean) => {
    setAutoApplyDiscount(enabled);

    // Apply/remove discount to all items
    setLineItems((prevItems) => {
      return prevItems.map((item) => {
        return {
          ...item,
          discount: enabled ? discountValue : 0,
        };
      });
    });
  };

  const handleDiscountTypeChange = (type: 'percentage' | 'fixed') => {
    setDiscountType(type);
    if (autoApplyDiscount) {
      // Apply new discount type to all items
      setLineItems((prevItems) => {
        return prevItems.map((item) => {
          return {
            ...item,
            discountType: type,
            discount: discountValue,
          };
        });
      });
    }
  };

  const handleDiscountValueChange = (value: number) => {
    setDiscountValue(value);
    if (autoApplyDiscount) {
      // Apply new discount value to all items
      setLineItems((prevItems) => {
        return prevItems.map((item) => {
          return {
            ...item,
            discount: value,
          };
        });
      });
    }
  };

  // Handle settings update
  const handleSettingsUpdate = (updates: any) => {
    if (!invoiceSettings) return;

    updateInvoiceSettings.mutate({
      settings: {
        ...invoiceSettings,
        ...updates,
      },
    });
  };

  const handleSendInvoice = async () => {
    // Only proceed if we have a customer and project
    if (!currentCustomer || !project?._id) {
      console.log('Missing information');
      toast({
        title: 'Missing information',
        description: 'Customer and project are required',
        variant: 'destructive',
      });
      return;
    }

    // Set submitting state to true to show loading indicator
    setIsSubmitting(true);

    try {
      const itemsToCreate = lineItems.filter((item) => {
        return item.name && item.price;
      });

      if (itemsToCreate.length === 0) {
        toast({
          title: 'No valid items',
          description: 'Please add at least one item with name and price',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }

      // Create all product items one by one
      const createdItemIds: string[] = [];

      // Create items sequentially to ensure all are created before sending invoice
      for (const item of itemsToCreate) {
        const productItem = {
          name: item.name,
          description: item.name,
          quantity: item.quantity || 1,
          price: parseFloat(item.price) || 0,
          discount: item.discount || 0,
          projects: [project._id],
          modules: item.moduleId ? [item.moduleId] : [],
          currency: localCurrency || 'usd',
          memo: memo,
        };

        try {
          console.log('Creating product item:', productItem);
          const response = await newRequest.post('/product-catalog', productItem);
          console.log('Product item created:', response.data.data.product._id);

          if (response.data?.data?.product?._id) {
            createdItemIds.push(response.data.data.product._id);
          }
        } catch (error) {
          console.error('Error creating product item:', error);
          // Continue with other items even if one fails
        }
      }

      // Check if we have any successfully created items
      if (createdItemIds.length === 0) {
        console.log('No items could be created. Please try again.');
        toast({
          title: 'Failed to create invoice',
          description: 'No items could be created. Please try again.',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }

      // Create invoice payload
      const invoiceData = {
        clientId: currentCustomer.id,
        items: createdItemIds,
        deliveryMethod,
        memo,
        footer,
        tax:
          selectedTax && selectedTax !== 'no-tax'
            ? {
                id: selectedTax,
                name:
                  invoiceSettings?.taxes?.find((tax) => {
                    return tax.id === selectedTax;
                  })?.name || '',
                rate: selectedTaxRate,
              }
            : null,
      };

      console.log('Sending invoice with data:', invoiceData);

      // Explicitly call the project invoice endpoint
      const invoiceResponse = await newRequest.post(
        `/projects/${project._id}/invoices`,
        invoiceData,
      );

      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      console.log('Invoice created successfully:', invoiceResponse.data);

      // Close dialog and show success message
      onOpenChange(false);
      toast({
        title: 'Invoice sent successfully',
        description: `Invoice sent to ${currentCustomer.name}`,
      });
    } catch (error: any) {
      console.error('Error creating invoice:', error);
      toast({
        title: 'Failed to create invoice',
        description:
          error.response?.data?.message || 'An error occurred while creating the invoice',
        variant: 'destructive',
      });
    } finally {
      // Always reset submitting state
      setIsSubmitting(false);
    }
  };

  // Calculate subtotal
  const subtotal = lineItems.reduce((sum, item) => {
    const price = parseFloat(item.price) || 0;
    const quantity = item.quantity || 1;
    return sum + price * quantity;
  }, 0);

  // Calculate discount total
  const discountTotal = lineItems.reduce((sum, item) => {
    const price = parseFloat(item.price) || 0;
    const quantity = item.quantity || 1;
    const discount = item.discount || 0;
    return sum + (price * quantity * discount) / 100;
  }, 0);

  // Get selected tax rate
  const selectedTaxRate =
    invoiceSettings?.taxes?.find((tax) => {
      return tax.id === selectedTax;
    })?.rate || 0;

  // Calculate tax amount (if applicable)
  const taxableAmount = subtotal - discountTotal;
  const taxAmount =
    selectedTax && selectedTax !== 'no-tax' ? (taxableAmount * selectedTaxRate) / 100 : 0;

  // Calculate final total
  const total = subtotal - discountTotal + taxAmount;

  return {
    // State
    lineItems,
    isLoading,
    autoApplyDiscount,
    discountType,
    discountValue,
    memo,
    setMemo,
    footer,
    setFooter,
    localCurrency,
    setLocalCurrency,
    icon,
    setIcon,
    logo,
    setLogo,
    showTaxId,
    setShowTaxId,
    taxId,
    setTaxId,
    isCustomerPicked,
    setIsCustomerPicked,
    dueDate,
    setDueDate,
    isSubmitting,

    // Functions
    handleLineItemChange,
    addCustomLineItem,
    removeLineItem,
    toggleDiscount,
    handleDiscountTypeChange,
    handleDiscountValueChange,
    handleSettingsUpdate,
    handleSendInvoice,

    // Calculations
    subtotal,
    discountTotal,
    selectedTaxRate,
    taxAmount,
    total,

    // From other hooks
    project,
    modules,
    handleCustomerSelect,
    selectedCustomer,
    currentCustomer,
    currency,
    setCurrency,
    deliveryMethod,
    setDeliveryMethod,
    selectedTax,
    setSelectedTax,
    invoiceSettings,
    sendInvoiceMutation,
  };
}
