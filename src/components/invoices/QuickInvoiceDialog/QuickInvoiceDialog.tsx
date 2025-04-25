'use client';

import { useInvoiceEditor } from '@/app/[workspace]/invoices/new/hooks/useInvoiceEditor';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { useProject } from '@/contexts/ProjectContext';
import { useProjectModules } from '@/hooks/useProjectModules';
import { newRequest } from '@/utils/newRequest';
import { ChevronDownIcon, EyeIcon, Loader2, MinusIcon, PlusIcon } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface QuickInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SuggestedLineItem {
  id: string;
  moduleId: string;
  moduleName: string;
  description: string;
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
  } = useInvoiceEditor();

  // Use a ref to track if we've already selected a client
  const hasSelectedClientRef = useRef(false);

  // Track module-based line items
  const [lineItems, setLineItems] = useState<SuggestedLineItem[]>([]);
  const [autoApplyDiscount, setAutoApplyDiscount] = useState(false);
  const [memo, setMemo] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  // Fetch suggested items when dialog opens and client is selected
  useEffect(() => {
    if (open && project?._id) {
      fetchSuggestedLineItems(project._id).then((suggestedItems) => {
        if (suggestedItems.length > 0) {
          setLineItems(suggestedItems);
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
    }
  }, [open]);

  // Create line items from modules as fallback
  const createLineItemsFromModules = () => {
    if (!modules?.length) return;

    console.log('Creating line items from modules:', modules);

    const defaultItems = modules.map((module) => {
      const price = inferPriceFromModule(module);

      return {
        id: `module-item-${module._id}`,
        moduleId: module._id,
        moduleName: module.name,
        description: module.name,
        price: price || '',
        quantity: 1,
        discount: 0,
      };
    });

    setLineItems(defaultItems);
  };

  // Select first client when dialog opens, only once
  useEffect(() => {
    // Only do this when dialog opens and we haven't selected a client yet
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
          moduleName: 'Custom',
          description: 'Custom Service',
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

    // Apply/remove 10% discount to all items
    setLineItems((prevItems) => {
      return prevItems.map((item) => {
        return {
          ...item,
          discount: enabled ? 10 : 0,
        };
      });
    });
  };

  const handleSendInvoice = () => {
    // First create items for each line item
    if (currentCustomer) {
      lineItems.forEach((item) => {
        // Only create items with both description and price
        if (item.description && item.price) {
          const customItem = {
            id: `${item.id}-${Date.now()}`,
            description: item.description,
            quantity: item.quantity || 1,
            unitPrice: parseFloat(item.price) || 0,
            projectIds: [project?._id || ''],
            moduleIds: item.moduleId ? [item.moduleId] : [],
            options: {},
            currency: currency || 'usd',
            discount: item.discount || 0,
            memo: memo,
          };

          handleSaveItem(customItem);
        }
      });
    }

    // Then send the invoice
    setTimeout(() => {
      sendInvoiceMutation.mutate(undefined, {
        onSuccess: () => {
          onOpenChange(false);
          toast({
            title: 'Invoice sent successfully',
            description: `Invoice sent to ${currentCustomer?.name}`,
          });
        },
      });
    }, 100);
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

  // Calculate final total
  const total = subtotal - discountTotal;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='p-5 max-w-xl'>
        <DialogTitle className='text-xl font-semibold mb-4'>Quick Invoice</DialogTitle>

        <div className='space-y-4'>
          {/* Client selection */}
          <div>
            <Label htmlFor='client'>Client</Label>
            <Select value={selectedCustomer} onValueChange={handleCustomerSelect}>
              <SelectTrigger id='client' className='w-full'>
                <SelectValue placeholder='Select client' />
              </SelectTrigger>
              <SelectContent>
                {project?.participants?.map((participant) => {
                  return (
                    <SelectItem key={participant._id} value={participant._id}>
                      {participant.name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Module Data Inspector - for debugging */}
          <Collapsible className='w-full border rounded-md'>
            <CollapsibleTrigger className='flex w-full items-center justify-between p-2 text-sm font-medium'>
              <div className='flex items-center'>
                <EyeIcon className='mr-2 h-4 w-4' />
                Module Data Inspector
              </div>
              <ChevronDownIcon className='h-4 w-4' />
            </CollapsibleTrigger>
            <CollapsibleContent className='p-2'>
              <div className='text-xs font-mono bg-gray-50 p-2 rounded max-h-40 overflow-auto'>
                <p className='font-semibold'>Modules ({modules?.length || 0}):</p>
                {modules?.map((module, index) => {
                  return (
                    <div key={module._id} className='mt-1'>
                      <p className='font-medium'>
                        {index + 1}. {module.name}
                      </p>
                      <p>Fields: {Object.keys(module).join(', ')}</p>
                      {typeof module.data === 'object' && (
                        <p>Nested data fields: {Object.keys(module.data || {}).join(', ')}</p>
                      )}
                    </div>
                  );
                })}

                <p className='font-semibold mt-3'>Current Line Items:</p>
                {lineItems.map((item, index) => {
                  return (
                    <div key={item.id} className='mt-1'>
                      <p>
                        {index + 1}. {item.description}: ${item.price || '0'} (From:{' '}
                        {item.moduleName})
                      </p>
                    </div>
                  );
                })}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Line Items */}
          <div className='space-y-3'>
            <div className='flex justify-between items-center'>
              <h3 className='font-medium'>Line Items</h3>
              <Button
                variant='outline'
                size='sm'
                onClick={addCustomLineItem}
                className='flex items-center gap-1'
              >
                <PlusIcon className='h-3.5 w-3.5' />
                Add Custom Item
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
                      className='flex gap-2 items-start border p-3 rounded-md bg-gray-50'
                    >
                      <div className='flex-1 space-y-2'>
                        <Input
                          placeholder='Description'
                          value={item.description}
                          onChange={(e) => {
                            return handleLineItemChange(item.id, 'description', e.target.value);
                          }}
                        />
                        <div className='flex gap-2'>
                          <div className='w-24'>
                            <Input
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
                          <div className='w-24'>
                            <Input
                              placeholder='Price'
                              value={item.price}
                              onChange={(e) => {
                                return handleLineItemChange(item.id, 'price', e.target.value);
                              }}
                              type='number'
                              min='0'
                              step='0.01'
                            />
                          </div>
                          <div className='w-24'>
                            <Input
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
                        {item.moduleName && item.moduleName !== 'Custom' && (
                          <div className='text-xs text-gray-500'>
                            From module: {item.moduleName}
                          </div>
                        )}
                      </div>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='w-8 h-8 mt-1'
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
                  <div className='text-sm text-gray-500 py-4 text-center'>
                    No items added. Add a custom item or select a client with associated modules.
                  </div>
                )}
              </>
            )}

            {/* Apply Discount Option */}
            <div className='flex items-center justify-between border-t pt-3'>
              <div className='flex items-center space-x-2'>
                <Switch
                  id='auto-discount'
                  checked={autoApplyDiscount}
                  onCheckedChange={toggleDiscount}
                />
                <Label htmlFor='auto-discount'>Apply 10% discount to all items</Label>
              </div>
            </div>

            {/* Memo Field */}
            <div>
              <Label htmlFor='memo'>Memo</Label>
              <Input
                id='memo'
                placeholder='Add a memo to your invoice'
                value={memo}
                onChange={(e) => {
                  return setMemo(e.target.value);
                }}
              />
              <p className='text-xs text-gray-500 mt-1'>This note will appear on the invoice</p>
            </div>

            {/* Invoice Summary */}
            <div className='border rounded-md p-3 bg-gray-50'>
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
                <div className='flex justify-between font-medium border-t pt-1 mt-1'>
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className='flex gap-2 justify-end pt-2 border-t'>
            <Button
              variant='outline'
              onClick={() => {
                return onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendInvoice}
              disabled={
                sendInvoiceMutation.isPending ||
                !currentCustomer ||
                lineItems.length === 0 ||
                !lineItems.some((item) => {
                  return item.description && item.price;
                })
              }
            >
              {sendInvoiceMutation.isPending ? 'Sending...' : 'Send Invoice'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
