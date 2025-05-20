'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { getTaxRates } from '@/lib/api/tax-rates';
import { cn } from '@/lib/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { Copy, Hash, Loader2, Plus, Scissors, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import SectionFooter from './SectionFooter';
import TaxRateDialog from './TaxRateDialog';
import type { ExtendedItem, Item, Section } from './types';

type ItemWithType = Item & { type?: string };

type ItemsSectionProps = {
  items: Item[];
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
  setActiveSection: React.Dispatch<React.SetStateAction<Section>>;
  handleRemoveItem: (id: string, e?: React.MouseEvent) => void;
  projectCurrency: string;
  projectId: string;
  onChatClick?: () => void;
  onSectionChange?: (section: number) => void;
};

export default function ItemsSection({
  items,
  setItems,
  setActiveSection,
  handleRemoveItem,
  projectCurrency,
  projectId,
  onChatClick,
  onSectionChange,
}: ItemsSectionProps) {
  // Replace dummy notification function with toast
  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    switch (type) {
      case 'success':
        toast.success(message);
        break;
      case 'error':
        toast.error(message);
        break;
      default:
        toast(message);
    }
  };

  const [currentNewItemMode, setCurrentNewItemMode] = useState('');
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '1',
    taxRate: 0,
    discount: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState<ExtendedItem | null>(null);
  const [keyboardShortcutsVisible, setKeyboardShortcutsVisible] = useState(false);
  // Add tax rates state
  const [selectedTaxRateId, setSelectedTaxRateId] = useState<string>('standard');
  const [isNewTaxRateDialogOpen, setIsNewTaxRateDialogOpen] = useState(false);
  const [addAnother, setAddAnother] = useState(false);
  const [removedItems, setRemovedItems] = useState<Item[]>([]);
  const [showRemovedItems, setShowRemovedItems] = useState(false);

  const nameInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Fetch tax rates from API
  const {
    data: taxRates = [
      { id: 'standard', name: 'Standard Rate', rate: 20 },
      { id: 'reduced', name: 'Reduced Rate', rate: 5 },
      { id: 'zero', name: 'Zero Rate', rate: 0 },
    ],
  } = useQuery({
    queryKey: ['taxRates', projectId],
    queryFn: getTaxRates,
  });

  const handleEditItem = (item: ExtendedItem) => {
    setEditingItem(item);
    // Find the tax rate that matches the item's tax rate, or default to standard
    const matchingTaxRate = taxRates.find((tax) => {
      return tax.rate === item.taxRate;
    });

    // If no matching tax rate is found but the item has a taxRate, add a custom tax rate
    if (!matchingTaxRate && item.taxRate !== undefined && item.taxRate > 0) {
      // Create a custom tax ID using the rate value
      const customTaxId = `custom-${item.taxRate}`;
      const customTaxName = item.taxName || `Custom (${item.taxRate}%)`;

      // Add to query cache
      queryClient.setQueryData(['taxRates', projectId], (oldData: any) => {
        // Check if this tax rate already exists in the data
        if (oldData && Array.isArray(oldData)) {
          const exists = oldData.some((tax) => {
            return tax.rate === item.taxRate;
          });
          if (!exists) {
            console.log(`Adding custom tax rate: ${customTaxName} (${item.taxRate}%)`);
            return [
              ...oldData,
              {
                id: customTaxId,
                name: customTaxName,
                rate: item.taxRate,
              },
            ];
          }
        }
        return oldData;
      });

      setSelectedTaxRateId(customTaxId);
    } else {
      const taxRateId = matchingTaxRate ? matchingTaxRate.id : 'standard';
      setSelectedTaxRateId(taxRateId);
    }

    setNewItem({
      name: item.name,
      description: item.description,
      price: item.price.replace(/,/g, ''),
      quantity: item.quantity,
      taxRate: item.taxRate || 0,
      discount: item.discount || 0,
    });
    setCurrentNewItemMode('manual');

    // Focus on the name input after switching to edit mode
    setTimeout(() => {
      nameInputRef.current?.focus();
    }, 10);
  };

  const handleSubmitNewItem = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newItem.name.trim()) return;

    setIsSubmitting(true);

    // Format price correctly - ensure it's a number first
    const numericPrice = newItem.price ? parseFloat(newItem.price) : 0;
    const formattedPrice = numericPrice.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    // Get the selected tax rate for display purposes
    const selectedTax = taxRates.find((tax) => {
      return tax.id === selectedTaxRateId;
    });
    const taxRateName = selectedTax ? selectedTax.name : '';

    // Simulate a slight delay for better UX
    setTimeout(() => {
      const newItemObj = {
        id: `item${Date.now()}`,
        name: newItem.name.trim(),
        description: newItem.description.trim(),
        price: formattedPrice,
        quantity: newItem.quantity || '1',
        taxRate: newItem.taxRate,
        discount: newItem.discount,
        taxName: taxRateName, // Store the tax name for reference
        type: 'PRODUCT', // Default type for manually added items
      } as ItemWithType;

      setItems([...items, newItemObj as Item]);

      if (addAnother) {
        // Just reset the form but keep the modal open
        setNewItem({
          name: '',
          description: '',
          price: '',
          quantity: '1',
          taxRate: newItem.taxRate, // Keep the same tax rate for next item
          discount: newItem.discount, // Keep the same discount for next item
        });
        setIsSubmitting(false);
        // Focus back on the name input for quick entry
        setTimeout(() => {
          nameInputRef.current?.focus();
        }, 10);
      } else {
        // Reset form state completely and close the modal
        resetFormState();
      }
    }, 300);
  };

  const handleUpdateItem = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newItem.name.trim()) return;

    setIsSubmitting(true);

    // Format price correctly - ensure it's a number first
    const numericPrice = newItem.price ? parseFloat(newItem.price) : 0;
    const formattedPrice = numericPrice.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    // Get the selected tax rate for display purposes
    const selectedTax = taxRates.find((tax) => {
      return tax.id === selectedTaxRateId;
    });
    const taxRateName = selectedTax ? selectedTax.name : '';

    // Simulate a slight delay for better UX
    setTimeout(() => {
      if (!editingItem) return;

      const updatedItems = items.map((item) => {
        if (item.id === editingItem.id) {
          const itemWithType = editingItem as unknown as ItemWithType;
          return {
            ...item,
            name: newItem.name.trim(),
            description: newItem.description.trim(),
            price: formattedPrice,
            quantity: newItem.quantity || '1',
            taxRate: newItem.taxRate,
            discount: newItem.discount,
            taxName: taxRateName, // Store the tax name for reference
            ...(itemWithType.type ? { type: itemWithType.type } : { type: 'PRODUCT' }),
          } as Item;
        }
        return item;
      });

      setItems(updatedItems);
      resetFormState();
      showNotification('Item updated successfully', 'success');
    }, 300);
  };

  // Replace the two conflicting useEffect hooks with a single implementation
  // Add a useEffect to initialize the tax rate when first loading the component
  useEffect(() => {
    // Log available tax rates for debugging
    console.log('Tax rates loaded:', taxRates);

    if (taxRates.length === 0) {
      console.log('No tax rates available');
      return;
    }

    // If we already have a selected tax rate ID and it's not the initial render
    if (selectedTaxRateId) {
      const selectedRate = taxRates.find((tax) => {
        return tax.id === selectedTaxRateId;
      });

      if (selectedRate) {
        console.log(`Found matching rate for ${selectedTaxRateId}:`, selectedRate);
        setNewItem((prev) => {
          return {
            ...prev,
            taxRate: selectedRate.rate,
          };
        });
        return;
      }
    }

    // Initial selection or fallback if selected ID not found
    const standardRate = taxRates.find((tax) => {
      return tax.id === 'standard';
    });
    if (standardRate) {
      console.log('Using standard tax rate as default:', standardRate);
      setSelectedTaxRateId('standard');
      setNewItem((prev) => {
        return {
          ...prev,
          taxRate: standardRate.rate,
        };
      });
    } else if (taxRates.length > 0) {
      // If no standard rate, use the first available rate
      console.log('No standard rate found, using first tax rate:', taxRates[0]);
      setSelectedTaxRateId(taxRates[0].id);
      setNewItem((prev) => {
        return {
          ...prev,
          taxRate: taxRates[0].rate,
        };
      });
    }
  }, [taxRates, selectedTaxRateId]);

  // New function to update tax rates when items with custom taxes are added
  useEffect(() => {
    // This effect will run when 'items' changes, to check for any newly added items with custom tax rates
    if (items.length === 0) return;

    // Look at the most recently added item (last in the array)
    const latestItem = items[items.length - 1];

    // If the item has a tax rate that's not in our current tax rates, add it
    if (latestItem.taxRate !== undefined && latestItem.taxRate > 0) {
      const existingTaxRate = taxRates.find((tax) => {
        return tax.rate === latestItem.taxRate;
      });

      if (!existingTaxRate) {
        // Create a custom ID for this tax rate
        const customTaxId = `custom-${latestItem.taxRate}`;
        const customTaxName = latestItem.taxName || `Custom (${latestItem.taxRate}%)`;

        console.log(
          `Adding custom tax rate from newly added item: ${customTaxName} (${latestItem.taxRate}%)`,
        );

        // Add to query cache without triggering additional renders
        queryClient.setQueryData(['taxRates', projectId], (oldData: any) => {
          if (oldData && Array.isArray(oldData)) {
            return [
              ...oldData,
              {
                id: customTaxId,
                name: customTaxName,
                rate: latestItem.taxRate,
              },
            ];
          }
          return oldData;
        });
      }
    }
  }, [items, taxRates, projectId, queryClient]);

  // New helper function to reset form state
  const resetFormState = () => {
    setEditingItem(null);
    setCurrentNewItemMode('');
    setNewItem({
      name: '',
      description: '',
      price: '',
      quantity: '1',
      taxRate: 0,
      discount: 0,
    });
    // Reset the selected tax rate to standard
    setSelectedTaxRateId('standard');
    setIsSubmitting(false);
  };

  // Handle pressing Enter in the name field to move to description
  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      document.getElementById('item-description')?.focus();
    }
  };

  // Handle pressing Enter in the description field to move to price
  const handleDescriptionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      document.getElementById('item-price')?.focus();
    }
  };

  // Function to get currency symbol
  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case 'USD':
        return '$';
      case 'CAD':
        return 'C$';
      case 'EUR':
        return '€';
      case 'GBP':
        return '£';
      default:
        return currency;
    }
  };

  // Function to set the tax rate in the new item from selected tax rate ID
  const updateItemTaxRate = (taxRateId: string) => {
    // Handle empty ID
    if (!taxRateId) {
      console.error('Empty tax rate ID provided');
      return;
    }

    console.log(`Selecting tax rate with ID: ${taxRateId}`, taxRates);
    setSelectedTaxRateId(taxRateId);

    // Find the tax rate object from the array
    const selectedRate = taxRates.find((tax) => {
      return tax.id === taxRateId;
    });

    // If the tax rate is found, update the item's tax rate
    if (selectedRate) {
      console.log(`Found matching tax rate:`, selectedRate);
      setNewItem((prev) => {
        return {
          ...prev,
          taxRate: selectedRate.rate,
        };
      });
    } else {
      console.log(
        `Tax rate with ID '${taxRateId}' not found in current list. Setting ID now and will update when rates refresh.`,
      );

      // We'll continue to use the selected ID, and when tax rates are refreshed,
      // the useEffect will update the tax rate value
    }
  };

  // Add this utility function near the other utility functions
  const calculateItemTotal = (price: string, quantity: string): string => {
    // Remove commas and convert to number
    const numPrice = parseFloat(price.replace(/,/g, ''));
    const numQuantity = parseFloat(quantity || '1');

    // Check if either value is NaN
    if (isNaN(numPrice) || isNaN(numQuantity)) {
      return '0.00';
    }

    const total = numPrice * numQuantity;

    return total.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleDuplicateItem = (item: Item) => {
    const duplicatedItem = {
      ...item,
      id: `item${Date.now()}`,
      name: `${item.name} (Copy)`,
    };
    setItems([...items, duplicatedItem]);
    toast.success('Item duplicated successfully');
  };

  // Modify the handleRemoveItem to store removed items
  const handleRemoveItemWithHistory = (id: string, e?: React.MouseEvent) => {
    const itemToRemove = items.find((item) => {
      return item.id === id;
    });
    if (itemToRemove) {
      setRemovedItems((prev) => {
        return [...prev, itemToRemove];
      });
    }
    handleRemoveItem(id, e);
  };

  const handleRestoreItem = (item: Item) => {
    setItems((prev) => {
      return [...prev, item];
    });
    setRemovedItems((prev) => {
      return prev.filter((i) => {
        return i.id !== item.id;
      });
    });
    toast.success('Item restored successfully');
  };

  return (
    <div className='flex flex-col h-full relative bg-white dark:bg-[#141414]'>
      <div className='absolute inset-0 pt-4 px-6 pb-16 overflow-y-auto'>
        <div className='mb-4'>
          <div className='flex justify-between items-center mb-3'>
            <h2 className='text-lg font-semibold text-[#3F3F46] dark:text-[#fafafa]'>Items</h2>
          </div>

          <p className='text-[#3F3F46]/60 dark:text-[#8C8C8C] text-sm leading-5 mb-4'>
            Add items to your project. Include name, description, and price for each item.
          </p>

          {/* Action Buttons - simplified without tooltips */}
          {items.length > 0 && (
            <div className='flex space-x-3 mb-6'>
              <Button
                onClick={() => {
                  if (currentNewItemMode === 'manual') {
                    return setCurrentNewItemMode('');
                  }
                  setCurrentNewItemMode('manual');

                  // Get the standard tax rate (or the first one if not found)
                  const standardTax =
                    taxRates.find((tax) => {
                      return tax.id === 'standard';
                    }) || taxRates[0];
                  setSelectedTaxRateId(standardTax ? standardTax.id : 'standard');

                  // Initialize the newItem's taxRate with the selected tax rate
                  setNewItem((prev) => {
                    return {
                      ...prev,
                      taxRate: standardTax ? standardTax.rate : 0,
                    };
                  });

                  setTimeout(() => {
                    return nameInputRef.current?.focus();
                  }, 10);
                }}
                className='bg-[#F4F4F5] dark:bg-[#232428] hover:bg-[#E4E4E7] dark:hover:bg-[#2A2A2F] text-[#3F3F46] dark:text-[#fafafa] text-xs py-1 px-3 rounded-full h-auto transition-colors duration-200'
                variant='ghost'
              >
                <Plus size={14} className='mr-1' />
                Add Item
              </Button>
            </div>
          )}

          {/* Form Container - Removing fixed height to prevent excess whitespace */}
          <div
            className={cn(
              'relative transition-all duration-300',
              currentNewItemMode ? 'mb-8' : 'min-h-0 mb-0',
            )}
          >
            {/* Add Item Form */}
            <AnimatePresence mode='wait'>
              {currentNewItemMode === 'manual' && (
                <motion.div className='border border-[#E4E4E7] dark:border-[#232428] rounded-xl p-5 bg-white dark:bg-[#141414] shadow-sm hover:shadow-md transition-all duration-200 w-full relative'>
                  {/* Close button in top-right corner */}
                  <button
                    type='button'
                    onClick={() => {
                      setEditingItem(null);
                      setNewItem({
                        name: '',
                        description: '',
                        price: '',
                        quantity: '1',
                        taxRate: 0,
                        discount: 0,
                      });
                      setCurrentNewItemMode('');
                    }}
                    className='absolute top-3 right-3 text-[#3F3F46]/60 dark:text-[#8C8C8C] hover:text-[#3F3F46] dark:hover:text-[#fafafa] p-1 rounded-full hover:bg-[#F4F4F5] dark:hover:bg-[#232428] transition-colors'
                  >
                    <X size={18} />
                  </button>

                  <form
                    onSubmit={(e) => {
                      return e.preventDefault();
                    }}
                    className='space-y-4'
                  >
                    <div className='p-1'>
                      <label
                        htmlFor='item-name'
                        className='text-xs text-[#3F3F46]/60 dark:text-[#8C8C8C] mb-1 block'
                      >
                        Item name
                      </label>
                      <Input
                        type='text'
                        id='item-name'
                        ref={nameInputRef}
                        value={newItem.name}
                        onChange={(e) => {
                          return setNewItem({ ...newItem, name: e.target.value });
                        }}
                        onKeyDown={handleNameKeyDown}
                        placeholder='Enter item name'
                        className='w-full border border-[#E4E4E7] dark:border-[#232428] rounded-lg px-3 py-2 text-base font-medium text-[#3F3F46] dark:text-[#fafafa] outline-none placeholder:text-[#3F3F46]/60 dark:placeholder:text-[#8C8C8C] focus:border-[#3F3F46]/60 dark:focus:border-[#8C8C8C] focus:ring-1 focus:ring-[#3F3F46]/60 dark:focus:ring-[#8C8C8C] transition-colors bg-white dark:bg-[#141414]'
                        autoFocus
                        aria-label='Item name'
                      />
                    </div>
                    <div className='p-1'>
                      <label
                        htmlFor='item-description'
                        className='text-xs text-[#3F3F46]/60 dark:text-[#8C8C8C] mb-1 block'
                      >
                        Description (optional)
                      </label>
                      <Textarea
                        id='item-description'
                        value={newItem.description}
                        onChange={(e) => {
                          return setNewItem({ ...newItem, description: e.target.value });
                        }}
                        onKeyDown={handleDescriptionKeyDown}
                        placeholder='Add a description'
                        className='min-h-[80px] resize-none text-[#3F3F46] dark:text-[#fafafa] bg-white dark:bg-[#141414] border-[#E4E4E7] dark:border-[#232428] placeholder:text-[#3F3F46]/60 dark:placeholder:text-[#8C8C8C]'
                        aria-label='Item description'
                      />
                    </div>
                    <div className='p-1'>
                      <label
                        htmlFor='item-price'
                        className='text-xs text-[#3F3F46]/60 dark:text-[#8C8C8C] mb-1 block'
                      >
                        Price ({projectCurrency})
                      </label>
                      <Input
                        type='text'
                        id='item-price'
                        value={newItem.price}
                        onChange={(e) => {
                          // Allow only numbers and decimal point
                          const value = e.target.value.replace(/[^0-9.]/g, '');
                          setNewItem({ ...newItem, price: value });
                        }}
                        placeholder='0.00'
                        aria-label='Item price'
                        className='bg-white dark:bg-[#141414] border-[#E4E4E7] dark:border-[#232428] text-[#3F3F46] dark:text-[#fafafa] placeholder:text-[#3F3F46]/60 dark:placeholder:text-[#8C8C8C]'
                      />
                    </div>

                    <div className='p-1'>
                      <label
                        htmlFor='item-quantity'
                        className='text-xs text-[#3F3F46]/60 dark:text-[#8C8C8C] mb-1 block'
                      >
                        Quantity
                      </label>
                      <Input
                        type='number'
                        id='item-quantity'
                        min='1'
                        step='1'
                        value={newItem.quantity}
                        onChange={(e) => {
                          // Only allow whole numbers
                          const value = Math.floor(Number(e.target.value));
                          setNewItem({ ...newItem, quantity: value.toString() });
                        }}
                        placeholder='1'
                        aria-label='Item quantity'
                        className='bg-white dark:bg-[#141414] border-[#E4E4E7] dark:border-[#232428] text-[#3F3F46] dark:text-[#fafafa] placeholder:text-[#3F3F46]/60 dark:placeholder:text-[#8C8C8C]'
                      />
                    </div>
                    <div className='grid grid-cols-2 gap-3 mb-4'>
                      <div className='p-1'>
                        <Label
                          htmlFor='tax-rate'
                          className='text-[#3F3F46] dark:text-[#fafafa] text-sm font-medium'
                        >
                          Tax Rate
                        </Label>
                        <Select
                          value={selectedTaxRateId}
                          onValueChange={(value) => {
                            console.log('Tax rate selected in dropdown:', value);
                            console.log(
                              'Available tax rates:',
                              taxRates.map((tax) => {
                                return { id: tax.id, name: tax.name };
                              }),
                            );
                            if (value === 'add-new') {
                              setIsNewTaxRateDialogOpen(true);
                              return;
                            }
                            updateItemTaxRate(value);
                          }}
                          key={`tax-select-${taxRates.length}-${selectedTaxRateId}`}
                        >
                          <SelectTrigger className='w-full bg-white dark:bg-[#141414] border-[#E4E4E7] dark:border-[#232428] text-[#3F3F46] dark:text-[#fafafa]'>
                            <SelectValue placeholder='Select tax rate' />
                          </SelectTrigger>
                          <SelectContent className='bg-white dark:bg-[#141414] border-[#E4E4E7] dark:border-[#232428]'>
                            <SelectGroup>
                              <SelectLabel className='text-sm font-medium text-[#3F3F46]/60 dark:text-[#8C8C8C]'>
                                Available Tax Rates {taxRates.length === 0 && '(None available)'}
                              </SelectLabel>
                              {taxRates.length > 0 ? (
                                taxRates.map((taxRate) => {
                                  return (
                                    <SelectItem
                                      key={taxRate.id}
                                      value={taxRate.id}
                                      className={cn(
                                        selectedTaxRateId === taxRate.id
                                          ? 'bg-[#F4F4F5] dark:bg-[#232428]'
                                          : '',
                                        'text-[#3F3F46] dark:text-[#fafafa]',
                                      )}
                                    >
                                      <div className='flex justify-between w-full items-center'>
                                        <div className='flex items-center'>
                                          <span className='text-sm'>{taxRate.name}</span>
                                        </div>
                                        <span className='text-xs font-medium bg-[#F4F4F5] dark:bg-[#232428] text-[#3F3F46] dark:text-[#fafafa] rounded-full px-2 py-0.5 ml-2'>
                                          {taxRate.rate}%
                                        </span>
                                      </div>
                                    </SelectItem>
                                  );
                                })
                              ) : (
                                <SelectItem value='default' disabled>
                                  <div className='flex items-center'>
                                    <span className='text-sm text-muted'>
                                      No tax rates available
                                    </span>
                                  </div>
                                </SelectItem>
                              )}
                            </SelectGroup>
                            <SelectSeparator className='bg-[#E4E4E7] dark:bg-[#232428]' />
                            <SelectGroup>
                              <SelectItem value='add-new' className='text-[#8b5df8] font-medium'>
                                <div className='flex items-center'>
                                  <Plus size={14} className='mr-2' />
                                  Add New Tax Rate
                                </div>
                              </SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className='p-1'>
                        <Label
                          htmlFor='discount'
                          className='text-[#3F3F46] dark:text-[#fafafa] text-sm font-medium'
                        >
                          Discount (%)
                        </Label>
                        <Input
                          id='discount'
                          type='number'
                          min='0'
                          max='100'
                          value={newItem.discount}
                          onChange={(e) => {
                            setNewItem({
                              ...newItem,
                              discount: Number(e.target.value),
                            });
                          }}
                          className='bg-white dark:bg-[#141414] border-[#E4E4E7] dark:border-[#232428] text-[#3F3F46] dark:text-[#fafafa] placeholder:text-[#3F3F46]/60 dark:placeholder:text-[#8C8C8C]'
                        />
                      </div>
                    </div>
                    <div className='flex items-center justify-between pt-4'>
                      {/* Create More toggle */}
                      {!editingItem && (
                        <div className='flex items-center space-x-2'>
                          <Switch
                            id='create-more'
                            checked={addAnother}
                            onCheckedChange={setAddAnother}
                          />
                          <Label
                            htmlFor='create-more'
                            className='text-sm text-[#3F3F46]/60 dark:text-[#8C8C8C] cursor-pointer'
                          >
                            Create more
                          </Label>
                        </div>
                      )}

                      {/* Spacer when editing */}
                      {editingItem && <div></div>}

                      {/* Action buttons */}
                      <div className='flex items-center space-x-2'>
                        {editingItem && (
                          <button
                            type='button'
                            onClick={() => {
                              resetFormState();
                            }}
                            className='px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center min-w-[100px] border border-[#E4E4E7] dark:border-[#232428] hover:bg-[#F4F4F5] dark:hover:bg-[#232428] text-[#3F3F46] dark:text-[#fafafa]'
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          type='button'
                          onClick={(e) => {
                            return editingItem ? handleUpdateItem(e) : handleSubmitNewItem(e);
                          }}
                          className={cn(
                            'bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center min-w-[100px]',
                            !newItem.name.trim() || isSubmitting
                              ? 'opacity-70 cursor-not-allowed'
                              : 'hover:bg-blue-700 hover:shadow',
                          )}
                          disabled={!newItem.name.trim() || isSubmitting}
                        >
                          {isSubmitting ? (
                            <Loader2 size={16} className='animate-spin' />
                          ) : editingItem ? (
                            'Update'
                          ) : (
                            'Add Item'
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Item Cards */}
          <div className='space-y-3 overflow-visible'>
            {items.length > 0 && (
              <>
                <div className='flex items-center mb-4'>
                  <h3 className='text-lg font-semibold text-[#3F3F46] dark:text-[#fafafa]'>
                    {items.length > 0 ? (
                      <>
                        Your Items{' '}
                        <span className='ml-2 text-sm font-normal text-[#3F3F46]/60 dark:text-[#8C8C8C]'>
                          ({items.length})
                        </span>
                      </>
                    ) : (
                      ''
                    )}
                  </h3>
                  {items.length > 0 && (
                    <div className='ml-auto flex space-x-2'>
                      <Button
                        onClick={() => {
                          if (currentNewItemMode === 'manual') {
                            return setCurrentNewItemMode('');
                          }
                          setCurrentNewItemMode('manual');
                        }}
                        className='bg-[#F4F4F5] dark:bg-[#232428] hover:bg-[#E4E4E7] dark:hover:bg-[#2A2A2F] text-[#3F3F46] dark:text-[#fafafa] text-xs py-1 px-3 rounded-full h-auto transition-colors duration-200'
                        variant='ghost'
                      >
                        <Plus size={14} className='mr-1' />
                        Add more
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}

            {items.length === 0 ? (
              <div className=''>
                <div className='text-center py-0'>
                  <Button
                    onClick={() => {
                      setCurrentNewItemMode('manual');
                      setTimeout(() => {
                        return nameInputRef.current?.focus();
                      }, 10);
                    }}
                    className='w-full bg-[#F4F4F5] dark:bg-[#454545] hover:bg-[#E4E4E7] dark:hover:bg-[#2A2A2F] text-[#3F3F46] dark:text-[#fafafa]'
                  >
                    Add Item
                  </Button>
                </div>
              </div>
            ) : (
              items.map((item, index) => {
                return (
                  <motion.div
                    key={item.id}
                    className='border border-[#E4E4E7] dark:border-[#232428] rounded-xl p-4 transition-all duration-200 ease-in-out hover:border-[#D1D1D6] dark:hover:border-[#2A2A2F] group bg-white dark:bg-[#141414] shadow-sm hover:shadow-md hover:translate-y-[-1px] relative'
                  >
                    {/* Action buttons - simplified without tooltips */}
                    <div className='absolute top-2 right-2 flex space-x-1'>
                      <button
                        onClick={() => {
                          return handleDuplicateItem(item);
                        }}
                        className='p-1.5 rounded-full bg-[#F4F4F5] dark:bg-[#232428] text-[#3F3F46]/60 dark:text-[#8C8C8C] hover:bg-[#E4E4E7] dark:hover:bg-[#2A2A2F] hover:text-[#3F3F46] dark:hover:text-[#fafafa] opacity-0 group-hover:opacity-100 transition-all duration-200'
                        aria-label='Duplicate item'
                      >
                        <Copy size={16} />
                      </button>

                      <button
                        onClick={(e) => {
                          return handleRemoveItemWithHistory(item.id, e);
                        }}
                        className='p-1.5 rounded-full bg-[#F4F4F5] dark:bg-[#232428] text-[#3F3F46]/60 dark:text-[#8C8C8C] hover:bg-[#FDE7EB] dark:hover:bg-[#411D23] hover:text-[#F43F5E] opacity-0 group-hover:opacity-100 transition-all duration-200'
                        aria-label='Remove item'
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div className='flex justify-between items-start'>
                      <div
                        className='flex items-start flex-1 cursor-pointer'
                        onClick={() => {
                          return handleEditItem(item as ExtendedItem);
                        }}
                      >
                        <div className='flex-1'>
                          {/* Display mode */}
                          <div className='group/item'>
                            <div className='flex flex-col'>
                              <div className='flex items-center'>
                                <span className='text-[#3F3F46] dark:text-[#fafafa] text-[14px] font-semibold group-hover/item:text-black dark:group-hover/item:text-white transition-colors'>
                                  {item.name}
                                </span>
                                {parseInt(item.quantity) > 1 && (
                                  <span className='ml-2 text-xs font-medium bg-[#F4F4F5] dark:bg-[#232428] text-[#3F3F46]/60 dark:text-[#8C8C8C] rounded-full px-2 py-0.5'>
                                    {item.quantity}x
                                  </span>
                                )}
                              </div>

                              {item.description ? (
                                <p className='text-[#3F3F46]/60 dark:text-[#8C8C8C] text-sm mt-1 leading-relaxed group-hover/item:text-[#3F3F46] dark:group-hover/item:text-[#fafafa] transition-colors'>
                                  {item.description}
                                </p>
                              ) : (
                                <p className='text-[#3F3F46]/60 dark:text-[#8C8C8C] text-sm mt-1 italic group-hover/item:text-[#3F3F46] dark:group-hover/item:text-[#fafafa] transition-colors'>
                                  Add a description...
                                </p>
                              )}

                              <div className='mt-2 flex flex-wrap items-center gap-2'>
                                {item.taxRate > 0 && (
                                  <div className='text-xs text-[#8b5df8] bg-[#F4F4F5] dark:bg-[#232428] rounded-full py-0.5 px-2 flex items-center'>
                                    <Hash size={10} className='mr-1' />
                                    {item.taxName || 'Tax'}: {item.taxRate}%
                                  </div>
                                )}
                                {item.discount > 0 && (
                                  <div className='text-xs text-[#eea01a] bg-[#F4F4F5] dark:bg-[#232428] rounded-full py-0.5 px-2 flex items-center'>
                                    <Scissors size={10} className='mr-1' />
                                    Discount: {item.discount}%
                                  </div>
                                )}
                              </div>
                              <div className='mt-3 flex items-center justify-between'>
                                <div className='flex items-center gap-4'>
                                  <div className='flex items-center gap-1'>
                                    <span className='text-sm text-[#3F3F46]/60 dark:text-[#8C8C8C]'>
                                      Qty:
                                    </span>
                                    <span className='text-sm font-medium text-[#3F3F46] dark:text-[#fafafa]'>
                                      {item.quantity}
                                    </span>
                                  </div>
                                  <div className='flex items-center gap-2'>
                                    <span className='text-sm text-[#3F3F46]/60 dark:text-[#8C8C8C]'>
                                      {getCurrencySymbol(projectCurrency)}
                                      {item.price}
                                      <span className='text-[#3F3F46]/60 dark:text-[#8C8C8C] ml-1'>
                                        /unit
                                      </span>
                                    </span>
                                    {parseInt(item.quantity) > 1 && (
                                      <span className='text-sm font-medium text-[#3F3F46] dark:text-[#fafafa]'>
                                        Total: {getCurrencySymbol(projectCurrency)}
                                        {calculateItemTotal(item.price, item.quantity)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Tax Rate Dialog */}
      <TaxRateDialog
        isOpen={isNewTaxRateDialogOpen}
        onOpenChange={async (open) => {
          // If dialog is being closed and the selectedTaxRateId has changed
          if (!open) {
            console.log('Dialog closing, selected tax rate ID:', selectedTaxRateId);

            // Force refresh the tax rates query and wait for completion
            await queryClient.invalidateQueries({ queryKey: ['taxRates', projectId] });
            await queryClient.refetchQueries({ queryKey: ['taxRates', projectId] });

            // After fetching, make sure the selected tax rate is still valid
            const rates = (queryClient.getQueryData(['taxRates', projectId]) as any[]) || [];
            console.log(
              'After refetch, tax rates:',
              rates.map((r) => {
                return { id: r.id, name: r.name };
              }),
            );

            if (selectedTaxRateId && rates.length > 0) {
              const found = rates.find((r) => {
                return r.id === selectedTaxRateId;
              });
              if (found) {
                console.log('Selected tax rate still valid after refetch:', found);
                updateItemTaxRate(selectedTaxRateId);
              }
            }
          }

          setIsNewTaxRateDialogOpen(open);
        }}
        selectedTaxRateId={selectedTaxRateId}
        onSelectTaxRate={updateItemTaxRate}
        projectId={projectId}
      />

      {/* Footer */}
      <SectionFooter
        onContinue={() => {
          return setActiveSection('client');
        }}
        currentSection={1}
        totalSections={4}
        isDisabled={items.length === 0}
        disabledTooltip='Please add at least one item to continue'
        onChatClick={onChatClick}
      />
    </div>
  );
}
