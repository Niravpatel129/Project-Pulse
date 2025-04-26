'use client';

import { useInvoiceEditor } from '@/app/[workspace]/invoices/new/hooks/useInvoiceEditor';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ColorPicker } from '@/components/ui/color-picker';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ImageUpload } from '@/components/ui/image-upload';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useProject } from '@/contexts/ProjectContext';
import { useInvoiceSettings } from '@/hooks/useInvoiceSettings';
import { useProjectModules } from '@/hooks/useProjectModules';
import { useUpdateInvoiceSettings } from '@/hooks/useUpdateInvoiceSettings';
import { newRequest } from '@/utils/newRequest';
import { useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  ChevronRightIcon,
  CreditCardIcon,
  Loader2,
  MinusIcon,
  MoreHorizontal,
  PenIcon,
  PlusIcon,
  Settings2Icon,
  TruckIcon,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface QuickInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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

export default function QuickInvoiceDialog({ open, onOpenChange }: QuickInvoiceDialogProps) {
  const { project } = useProject();
  const { modules } = useProjectModules();
  const { toast } = useToast();
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

  // State for wizard UI
  const [currentView, setCurrentView] = useState<'items' | 'settings'>('items');

  // State for settings
  const [showSettingsSidebar, setShowSettingsSidebar] = useState(false);
  const [activeSettingTab, setActiveSettingTab] = useState('general');

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
  const [dueDate, setDueDate] = useState<string>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  );

  const queryClient = useQueryClient();

  // Add a new state for tracking invoice submission
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  }, [open, project, fetchSuggestedLineItems]);

  // Reset when dialog closes
  useEffect(() => {
    if (!open) {
      hasSelectedClientRef.current = false;
      setLineItems([]);
      setMemo('');
      setAutoApplyDiscount(false);
      setCurrentView('items');
      setShowSettingsSidebar(false);
    }
  }, [open]);

  // Create line items from modules as fallback
  const createLineItemsFromModules = () => {
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
  };

  // Update invoice settings
  const handleSettingsUpdate = (updates: any) => {
    if (!invoiceSettings) return;

    updateInvoiceSettings.mutate({
      settings: {
        ...invoiceSettings,
        ...updates,
      },
    });
  };

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
          discount: autoApplyDiscount ? 10 : 0,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='p-0 max-w-5xl max-h-[90vh] overflow-hidden'>
        <DialogTitle className='sr-only'>Quick Invoice Creator</DialogTitle>
        <div className='flex flex-col h-full'>
          {/* Header */}
          <div className='border-b border-gray-200 p-4 flex justify-between items-center'>
            <div className='flex items-center gap-2'>
              <Button
                variant='ghost'
                size='icon'
                className='rounded-full'
                onClick={() => {
                  return onOpenChange(false);
                }}
              >
                <ArrowLeft className='h-4 w-4' />
              </Button>
              <h2 className='text-lg font-medium'>Quick Invoice</h2>
            </div>
            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                size='sm'
                className={`${showSettingsSidebar ? 'bg-gray-100' : ''}`}
                onClick={() => {
                  return setShowSettingsSidebar(!showSettingsSidebar);
                }}
              >
                <Settings2Icon className='h-4 w-4 mr-2' />
                Settings
              </Button>
              <Button
                size='sm'
                onClick={handleSendInvoice}
                disabled={
                  isSubmitting ||
                  sendInvoiceMutation.isPending ||
                  !currentCustomer ||
                  lineItems.length === 0 ||
                  !lineItems.some((item) => {
                    return item.name && item.price;
                  })
                }
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Sending...
                  </>
                ) : sendInvoiceMutation.isPending ? (
                  'Sending...'
                ) : (
                  'Send Invoice'
                )}
              </Button>
            </div>
          </div>

          {/* Main content */}
          <div className='flex flex-1 overflow-hidden'>
            {/* Main panel */}
            <div className={`${showSettingsSidebar ? 'w-3/5' : 'w-full'}`}>
              <ScrollArea className='h-[calc(90vh-68px)]'>
                <div className='p-6'>
                  {/* Client selection */}
                  <div className='mb-6'>
                    <h2 className='text-sm font-medium text-gray-900 mb-3'>Customer</h2>
                    {isCustomerPicked ? (
                      <div className='mb-4'>
                        <div className='flex items-start justify-between p-4 bg-gray-50 rounded-lg'>
                          <div>
                            <p className='text-sm font-medium text-gray-900'>
                              {currentCustomer.name}
                            </p>
                            <p className='text-sm text-gray-500'>{currentCustomer.email}</p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant='ghost'
                                size='icon'
                                className='h-8 w-8 hover:bg-gray-100'
                              >
                                <MoreHorizontal className='h-4 w-4 text-gray-500' />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className='w-56' align='end'>
                              <DropdownMenuItem
                                onClick={() => {
                                  setIsCustomerPicked(false);
                                  handleCustomerSelect('');
                                }}
                              >
                                Switch customer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ) : (
                      <Select
                        value={selectedCustomer}
                        onValueChange={(value) => {
                          handleCustomerSelect(value);
                          if (value && value !== 'new') {
                            setIsCustomerPicked(true);
                          }
                        }}
                      >
                        <SelectTrigger className='w-full bg-white border-gray-200'>
                          <SelectValue placeholder='Select customer' />
                        </SelectTrigger>
                        <SelectContent>
                          {project?.participants?.length > 0 &&
                            project.participants.map((participant) => {
                              return (
                                <SelectItem key={participant._id} value={participant._id}>
                                  <div className='flex items-center gap-2'>
                                    <div className='text-sm font-medium text-gray-900'>
                                      {participant.name}
                                    </div>
                                    <div className='text-xs text-gray-500'>{participant.email}</div>
                                  </div>
                                </SelectItem>
                              );
                            })}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {/* Line Items */}
                  <div className='space-y-4'>
                    <div className='flex justify-between items-center'>
                      <h3 className='text-sm font-medium'>Line Items</h3>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={addCustomLineItem}
                        className='flex items-center gap-1'
                      >
                        <PlusIcon className='h-3.5 w-3.5' />
                        Add Item
                      </Button>
                    </div>

                    {isLoading ? (
                      <div className='flex justify-center items-center py-8'>
                        <Loader2 className='h-8 w-8 animate-spin text-gray-400' />
                        <span className='ml-2 text-gray-500'>Loading suggested items...</span>
                      </div>
                    ) : (
                      <>
                        {lineItems.map((item) => {
                          return (
                            <div
                              key={item.id}
                              className='flex gap-2 items-start border p-4 rounded-md bg-gray-50'
                            >
                              <div className='flex-1 space-y-3'>
                                <div>
                                  <Label
                                    htmlFor={`name-${item.id}`}
                                    className='text-xs text-gray-500 mb-1 block'
                                  >
                                    Item Name
                                  </Label>
                                  <Input
                                    id={`name-${item.id}`}
                                    placeholder='Name'
                                    value={item.name}
                                    onChange={(e) => {
                                      return handleLineItemChange(item.id, 'name', e.target.value);
                                    }}
                                  />
                                </div>
                                <div className='grid grid-cols-3 gap-3'>
                                  <div>
                                    <Label
                                      htmlFor={`qty-${item.id}`}
                                      className='text-xs text-gray-500 mb-1 block'
                                    >
                                      Quantity
                                    </Label>
                                    <Input
                                      id={`qty-${item.id}`}
                                      placeholder='Qty'
                                      value={item.quantity}
                                      onChange={(e) => {
                                        return handleLineItemChange(
                                          item.id,
                                          'quantity',
                                          parseInt(e.target.value) || 1,
                                        );
                                      }}
                                      type='number'
                                      min='1'
                                    />
                                  </div>
                                  <div>
                                    <Label
                                      htmlFor={`price-${item.id}`}
                                      className='text-xs text-gray-500 mb-1 block'
                                    >
                                      Price ($)
                                    </Label>
                                    <Input
                                      id={`price-${item.id}`}
                                      placeholder='Price'
                                      value={item.price}
                                      onChange={(e) => {
                                        return handleLineItemChange(
                                          item.id,
                                          'price',
                                          e.target.value,
                                        );
                                      }}
                                      type='number'
                                      min='0'
                                      step='0.01'
                                    />
                                  </div>
                                  <div>
                                    <Label
                                      htmlFor={`discount-${item.id}`}
                                      className='text-xs text-gray-500 mb-1 block'
                                    >
                                      Discount (%)
                                    </Label>
                                    <Input
                                      id={`discount-${item.id}`}
                                      placeholder='Discount %'
                                      value={item.discount || 0}
                                      onChange={(e) => {
                                        return handleLineItemChange(
                                          item.id,
                                          'discount',
                                          parseInt(e.target.value) || 0,
                                        );
                                      }}
                                      type='number'
                                      min='0'
                                      max='100'
                                    />
                                  </div>
                                </div>
                                {item.moduleName && item.moduleType !== 'custom' && (
                                  <div className='text-xs text-gray-500'>
                                    From {item.moduleType}: {item.moduleName}
                                  </div>
                                )}
                              </div>
                              <Button
                                variant='ghost'
                                size='icon'
                                className='w-8 h-8 mt-6'
                                onClick={() => {
                                  return removeLineItem(item.id);
                                }}
                              >
                                <MinusIcon className='h-4 w-4 text-gray-500' />
                              </Button>
                            </div>
                          );
                        })}

                        {lineItems.length === 0 && !isLoading && (
                          <div className='text-sm text-gray-500 py-10 text-center border rounded-md'>
                            No items added. Add a custom item or select a client with associated
                            modules.
                          </div>
                        )}
                      </>
                    )}

                    {/* Quick Settings */}
                    <div className='space-y-3 pt-4 border-t mt-4'>
                      {/* Discount Toggle */}
                      <div className='flex flex-col gap-2'>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center space-x-2'>
                            <Switch
                              id='auto-discount'
                              checked={autoApplyDiscount}
                              onCheckedChange={toggleDiscount}
                            />
                            <Label htmlFor='auto-discount'>Apply discount to all items</Label>
                          </div>
                        </div>

                        {autoApplyDiscount && (
                          <div className='flex gap-2 items-end pl-8'>
                            <div className='w-24'>
                              <Label htmlFor='discount-value' className='text-xs text-gray-500'>
                                Value
                              </Label>
                              <Input
                                id='discount-value'
                                type='number'
                                min='0'
                                max={discountType === 'percentage' ? '100' : undefined}
                                value={discountValue}
                                onChange={(e) => {
                                  return handleDiscountValueChange(parseFloat(e.target.value) || 0);
                                }}
                              />
                            </div>
                            <div className='w-28'>
                              <Label htmlFor='discount-type' className='text-xs text-gray-500'>
                                Type
                              </Label>
                              <Select
                                value={discountType}
                                onValueChange={(v) => {
                                  return handleDiscountTypeChange(v as 'percentage' | 'fixed');
                                }}
                              >
                                <SelectTrigger id='discount-type'>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value='percentage'>Percentage</SelectItem>
                                  <SelectItem value='fixed'>Fixed Amount</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Tax Selection */}
                      <Collapsible>
                        <CollapsibleTrigger asChild>
                          <Button variant='ghost' className='flex w-full justify-between p-0 h-8'>
                            <span className='flex items-center text-sm font-medium'>
                              <PenIcon className='h-4 w-4 mr-2' />
                              Tax Settings
                            </span>
                            <ChevronRightIcon className='h-4 w-4' />
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className='pt-2'>
                          <Select value={selectedTax} onValueChange={setSelectedTax}>
                            <SelectTrigger className='w-full bg-white border-gray-200'>
                              <SelectValue placeholder='Select tax rate' />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='no-tax'>No Tax</SelectItem>
                              {invoiceSettings?.taxes?.map((tax) => {
                                return (
                                  <SelectItem key={tax.id} value={tax.id}>
                                    {tax.name} ({tax.rate}%)
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </CollapsibleContent>
                      </Collapsible>

                      {/* Delivery Method */}
                      <Collapsible>
                        <CollapsibleTrigger asChild>
                          <Button variant='ghost' className='flex w-full justify-between p-0 h-8'>
                            <span className='flex items-center text-sm font-medium'>
                              <TruckIcon className='h-4 w-4 mr-2' />
                              Delivery Method
                            </span>
                            <ChevronRightIcon className='h-4 w-4' />
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className='pt-2'>
                          <Select
                            value={deliveryMethod}
                            onValueChange={(value) => {
                              setDeliveryMethod(value);
                            }}
                          >
                            <SelectTrigger className='w-full bg-white border-gray-200'>
                              <SelectValue placeholder='Select delivery method' />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='email'>Email</SelectItem>
                              <SelectItem value='sms'>SMS</SelectItem>
                              <SelectItem value='both'>Both</SelectItem>
                            </SelectContent>
                          </Select>
                        </CollapsibleContent>
                      </Collapsible>

                      {/* Quick Memo */}
                      <Collapsible>
                        <CollapsibleTrigger asChild>
                          <Button variant='ghost' className='flex w-full justify-between p-0 h-8'>
                            <span className='flex items-center text-sm font-medium'>
                              <PenIcon className='h-4 w-4 mr-2' />
                              Add Memo
                            </span>
                            <ChevronRightIcon className='h-4 w-4' />
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className='pt-2'>
                          <Input
                            id='memo'
                            placeholder='Add a memo to your invoice'
                            value={memo}
                            onChange={(e) => {
                              return setMemo(e.target.value);
                            }}
                          />
                          <p className='text-xs text-gray-500 mt-1'>
                            This note will appear on the invoice
                          </p>
                        </CollapsibleContent>
                      </Collapsible>

                      {/* Due Date */}
                      <Collapsible>
                        <CollapsibleTrigger asChild>
                          <Button variant='ghost' className='flex w-full justify-between p-0 h-8'>
                            <span className='flex items-center text-sm font-medium'>
                              <CreditCardIcon className='h-4 w-4 mr-2' />
                              Due Date
                            </span>
                            <ChevronRightIcon className='h-4 w-4' />
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className='pt-2'>
                          <Input
                            id='dueDate'
                            type='date'
                            value={dueDate}
                            onChange={(e) => {
                              return setDueDate(e.target.value);
                            }}
                          />
                          <p className='text-xs text-gray-500 mt-1'>When payment is due</p>
                        </CollapsibleContent>
                      </Collapsible>
                    </div>

                    {/* Invoice Summary */}
                    <div className='border rounded-md p-3 bg-gray-50 mt-4'>
                      <h4 className='font-medium mb-2'>Invoice Summary</h4>
                      <div className='space-y-1 text-sm'>
                        <div className='flex justify-between'>
                          <span>Subtotal:</span>
                          <span>${subtotal.toFixed(2)}</span>
                        </div>
                        {discountTotal > 0 && (
                          <div className='flex justify-between text-green-600'>
                            <span>Discount:</span>
                            <span>-${discountTotal.toFixed(2)}</span>
                          </div>
                        )}
                        {taxAmount > 0 && (
                          <div className='flex justify-between'>
                            <span>Tax ({selectedTaxRate}%):</span>
                            <span>${taxAmount.toFixed(2)}</span>
                          </div>
                        )}
                        <div className='flex justify-between font-medium border-t pt-1 mt-1'>
                          <span>Total:</span>
                          <span>${total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </div>

            {/* Settings Sidebar */}
            {showSettingsSidebar && (
              <div className='w-2/5 border-l border-gray-200'>
                <ScrollArea className='h-[calc(90vh-68px)]'>
                  <Tabs
                    value={activeSettingTab}
                    onValueChange={setActiveSettingTab}
                    className='w-full'
                  >
                    <div className='border-b border-gray-200'>
                      <TabsList className='h-12 w-full justify-start bg-transparent border-b rounded-none'>
                        <TabsTrigger
                          value='general'
                          className='data-[state=active]:border-b-2 data-[state=active]:border-gray-900 data-[state=active]:shadow-none rounded-none'
                        >
                          General
                        </TabsTrigger>
                        <TabsTrigger
                          value='branding'
                          className='data-[state=active]:border-b-2 data-[state=active]:border-gray-900 data-[state=active]:shadow-none rounded-none'
                        >
                          Branding
                        </TabsTrigger>
                        <TabsTrigger
                          value='payment'
                          className='data-[state=active]:border-b-2 data-[state=active]:border-gray-900 data-[state=active]:shadow-none rounded-none'
                        >
                          Payment
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    <div className='p-4'>
                      <TabsContent value='general' className='mt-0 pt-2 border-0'>
                        {/* Currency */}
                        <div className='mb-4'>
                          <Label htmlFor='currency' className='text-sm font-medium'>
                            Currency
                          </Label>
                          <Select
                            value={localCurrency}
                            onValueChange={(value) => {
                              setLocalCurrency(value);
                              setCurrency(value);
                              handleSettingsUpdate({ currency: value });
                            }}
                          >
                            <SelectTrigger id='currency' className='w-full mt-1'>
                              <SelectValue placeholder='Select currency' />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='usd'>USD - US Dollar</SelectItem>
                              <SelectItem value='eur'>EUR - Euro</SelectItem>
                              <SelectItem value='gbp'>GBP - British Pound</SelectItem>
                              <SelectItem value='cad'>CAD - Canadian Dollar</SelectItem>
                              <SelectItem value='aud'>AUD - Australian Dollar</SelectItem>
                              <SelectItem value='jpy'>JPY - Japanese Yen</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Footer */}
                        <div className='mb-4'>
                          <Label htmlFor='footer' className='text-sm font-medium'>
                            Footer
                          </Label>
                          <Input
                            id='footer'
                            placeholder='Add a footer to your invoice'
                            value={footer}
                            onChange={(e) => {
                              setFooter(e.target.value);
                            }}
                            className='mt-1'
                          />
                          <p className='text-xs text-gray-500 mt-1'>
                            This will appear at the bottom of the invoice
                          </p>
                        </div>

                        {/* Tax ID */}
                        <div className='mb-4'>
                          <div className='flex items-center justify-between mb-1'>
                            <Label htmlFor='taxId' className='text-sm font-medium'>
                              Tax ID
                            </Label>
                            <div className='flex items-center'>
                              <Label htmlFor='showTaxId' className='text-xs text-gray-600 mr-2'>
                                Show on invoice
                              </Label>
                              <Switch
                                id='showTaxId'
                                checked={showTaxId}
                                onCheckedChange={(checked) => {
                                  setShowTaxId(checked);
                                  handleSettingsUpdate({ showTaxId: checked });
                                }}
                              />
                            </div>
                          </div>
                          <Input
                            id='taxId'
                            placeholder='Enter your tax ID'
                            value={taxId}
                            onChange={(e) => {
                              setTaxId(e.target.value);
                            }}
                            onBlur={(e) => {
                              handleSettingsUpdate({ taxId: e.target.value });
                            }}
                            className='mt-1'
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value='branding' className='mt-0 pt-2 border-0'>
                        {/* Branding */}
                        <div className='space-y-4'>
                          {/* Icons */}
                          <div className='grid grid-cols-2 gap-4'>
                            <div>
                              <Label className='text-sm font-medium'>Icon</Label>
                              <div className='mt-1'>
                                <ImageUpload
                                  label='Company Icon'
                                  value={icon}
                                  onChange={(newIcon) => {
                                    setIcon(newIcon);
                                    handleSettingsUpdate({ icon: newIcon });
                                  }}
                                />
                              </div>
                            </div>
                            <div>
                              <Label className='text-sm font-medium'>Logo</Label>
                              <div className='mt-1'>
                                <ImageUpload
                                  label='Company Logo'
                                  value={logo}
                                  onChange={(newLogo) => {
                                    setLogo(newLogo);
                                    handleSettingsUpdate({ logo: newLogo });
                                  }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Colors */}
                          <div className='grid grid-cols-2 gap-4'>
                            <div>
                              <Label className='text-sm font-medium'>Brand Color</Label>
                              <div className='mt-1'>
                                <ColorPicker
                                  label='Brand Color'
                                  value={invoiceSettings?.brandColor || ''}
                                  onChange={(value) => {
                                    handleSettingsUpdate({ brandColor: value });
                                  }}
                                />
                              </div>
                            </div>
                            <div>
                              <Label className='text-sm font-medium'>Accent Color</Label>
                              <div className='mt-1'>
                                <ColorPicker
                                  label='Accent Color'
                                  value={invoiceSettings?.accentColor || ''}
                                  onChange={(value) => {
                                    handleSettingsUpdate({ accentColor: value });
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value='payment' className='mt-0 pt-2 border-0'>
                        {/* Payment Settings */}
                        <div className='space-y-4'>
                          {/* Payment Methods */}
                          <div>
                            <Label className='text-sm font-medium'>Payment Methods</Label>
                            <div className='space-y-2 mt-2'>
                              <div className='flex items-center space-x-2 py-2 px-3 border rounded-md'>
                                <Switch id='accept-credit-cards' />
                                <Label htmlFor='accept-credit-cards'>Accept Credit Cards</Label>
                              </div>
                              <div className='flex items-center space-x-2 py-2 px-3 border rounded-md'>
                                <Switch id='accept-bank-transfer' />
                                <Label htmlFor='accept-bank-transfer'>Accept Bank Transfer</Label>
                              </div>
                              <div className='flex items-center space-x-2 py-2 px-3 border rounded-md'>
                                <Switch id='accept-paypal' />
                                <Label htmlFor='accept-paypal'>Accept PayPal</Label>
                              </div>
                            </div>
                          </div>

                          {/* Payment Terms */}
                          <div>
                            <Label className='text-sm font-medium'>Payment Terms</Label>
                            <Select defaultValue='net30'>
                              <SelectTrigger className='w-full mt-1'>
                                <SelectValue placeholder='Select payment terms' />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value='due-on-receipt'>Due on Receipt</SelectItem>
                                <SelectItem value='net15'>Net 15</SelectItem>
                                <SelectItem value='net30'>Net 30</SelectItem>
                                <SelectItem value='net60'>Net 60</SelectItem>
                                <SelectItem value='custom'>Custom</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </TabsContent>
                    </div>
                  </Tabs>
                </ScrollArea>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
