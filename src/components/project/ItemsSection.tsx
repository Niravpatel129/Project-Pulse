'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Hash,
  Loader2,
  Mic,
  Paperclip,
  PencilLine,
  Plus,
  Scissors,
  Sparkles,
  X,
} from 'lucide-react';
import { useRef, useState } from 'react';
import SectionFooter from './SectionFooter';
import type { AIItem, Attachment, ExtendedItem, Item, Section } from './types';

// Define a TaxRate type
type TaxRate = {
  id: string;
  name: string;
  rate: number;
};

// We don't need EnhancedItem anymore since we can use AIItem which already has the type field
// interface EnhancedItem extends Item {
//   type?: 'PRODUCT' | 'SERVICE';
// }

type ItemWithType = Item & { type?: string };

type ItemsSectionProps = {
  items: Item[];
  setItems: (items: Item[]) => void;
  setActiveSection: React.Dispatch<React.SetStateAction<Section>>;
  handleRemoveItem: (id: string, e?: React.MouseEvent) => void;
  projectCurrency: string;
};

export default function ItemsSection({
  items,
  setItems,
  setActiveSection,
  handleRemoveItem,
  projectCurrency,
}: ItemsSectionProps) {
  // Dummy notification function since notification system was removed
  const showNotification = (message: string, type?: string) => {
    console.log(`[${type || 'info'}] ${message}`);
  };

  const [currentNewItemMode, setCurrentNewItemMode] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiGeneratedItems, setAiGeneratedItems] = useState<AIItem[]>([]);
  const [selectedAiItems, setSelectedAiItems] = useState<Record<string, boolean>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '1',
    currency: 'USD',
    taxRate: 0,
    discount: 0,
    taxable: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState<ExtendedItem | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [aiResponse, setAiResponse] = useState<any>(null);
  const [keyboardShortcutsVisible, setKeyboardShortcutsVisible] = useState(false);
  // Add tax rates state
  const [taxRates, setTaxRates] = useState<TaxRate[]>([
    { id: 'standard', name: 'Standard Rate', rate: 20 },
    { id: 'reduced', name: 'Reduced Rate', rate: 5 },
    { id: 'zero', name: 'Zero Rate', rate: 0 },
  ]);
  const [selectedTaxRateId, setSelectedTaxRateId] = useState<string>('standard');
  const [isNewTaxRateDialogOpen, setIsNewTaxRateDialogOpen] = useState(false);
  const [newTaxRate, setNewTaxRate] = useState<{ name: string; rate: number }>({
    name: '',
    rate: 0,
  });

  const nameInputRef = useRef<HTMLInputElement>(null);
  const aiPromptInputRef = useRef<HTMLTextAreaElement>(null);
  const newTaxNameInputRef = useRef<HTMLInputElement>(null);

  const handleGenerateAiItems = () => {
    if (!aiPrompt.trim()) return;

    setIsGenerating(true);
    setAiGeneratedItems([]);
    setAiResponse(null);

    // Simulate AI processing delay
    setTimeout(() => {
      // Mock response based on the provided JSON format
      const mockResponse = {
        lineItems: [
          {
            name: 'Red Turtle Hoodie',
            description:
              'Vibrant red turtle-neck style hoodie crafted from premium materials, featuring a cozy front pocket and soft inner lining for warmth. Designed for all-day comfort and style, perfect for casual wear.',
            price: '15.00',
            type: 'PRODUCT',
            currency: projectCurrency,
            reasoning:
              "Name and color extracted from prompt. Price specified as 'something like $15'. Description generated to include color, type, and standard hoodie features.",
          },
          {
            name: 'Black Regular Shirt',
            description:
              'Classic black t-shirt made from high-quality cotton, offering a comfortable regular fit with reinforced stitching and breathable fabric. Versatile for everyday use and layering.',
            price: '12.00',
            type: 'PRODUCT',
            currency: projectCurrency,
            reasoning:
              "Name ('black regular shirt') and color taken from prompt. Price estimated based on typical t-shirt prices and services table reference. Description generated to match a standard product of this type.",
          },
          {
            name: 'DTF',
            description:
              'Professional Direct to Film (DTF) printing service, using advanced technology for vibrant, detailed prints on a variety of garments. Ideal for custom apparel with lasting color and durability.',
            price: '10.00',
            type: 'SERVICE',
            currency: projectCurrency,
            reasoning:
              "Name matched to 'DTF' from services table. Price of $10 derived from services table. Description generated based on DTF printing process.",
          },
          {
            name: 'Screen',
            description:
              'Expert screen printing service delivering sharp, long-lasting designs on apparel. Utilizes high-quality inks and precision techniques for both single and bulk orders.',
            price: '14.00',
            type: 'SERVICE',
            currency: projectCurrency,
            reasoning:
              "Name matched to 'Screen' from services table. Price of $14 derived from services table. Description generated based on screen printing process and standard features.",
          },
        ],
        meta: {
          processingTime: 8.584,
          promptLength: 203,
          timestamp: '2025-05-05T21:07:25.310Z',
        },
      };

      setAiResponse(mockResponse);

      // Convert the response to our item format for display
      const generatedItems = mockResponse.lineItems.map((item, index) => {
        return {
          id: `ai-item-${Date.now()}-${index}`,
          name: item.name,
          description: item.description,
          price: item.price,
          quantity: '1',
          type: item.type,
          reasoning: item.reasoning,
          currency: projectCurrency,
        };
      });

      setAiGeneratedItems(generatedItems);
      setSelectedAiItems({});
      setIsGenerating(false);
    }, 1500);
  };

  const handleAddSelectedAiItems = () => {
    const selectedItems = aiGeneratedItems.filter((item) => {
      return selectedAiItems[item.id];
    });

    if (selectedItems.length === 0) {
      showNotification('Please select at least one item', 'error');
      return;
    }

    // Format the items to match our items array structure
    const formattedItems = selectedItems.map((item) => {
      // Format price to have 2 decimal places
      const formattedPrice = Number(item.price || 0).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      return {
        id: item.id,
        name: item.name,
        description: item.description,
        price: formattedPrice,
        quantity: item.quantity || '1',
        currency: projectCurrency, // Use project currency
        type: item.type,
      } as ItemWithType;
    });

    setItems([...items, ...(formattedItems as Item[])]);
    setAiPrompt('');
    setAiGeneratedItems([]);
    setAiResponse(null);
    setSelectedAiItems({});
  };

  const handleEditItem = (item: ExtendedItem) => {
    setEditingItem(item);
    // Find the tax rate that matches the item's tax rate, or default to standard
    const matchingTaxRate = taxRates.find((tax) => {
      return tax.rate === item.taxRate;
    });
    const taxRateId = matchingTaxRate ? matchingTaxRate.id : 'standard';
    setSelectedTaxRateId(taxRateId);

    setNewItem({
      name: item.name,
      description: item.description,
      price: item.price.replace(/,/g, ''),
      quantity: item.quantity,
      currency: item.currency || 'USD',
      taxRate: item.taxRate || 0,
      discount: item.discount || 0,
      taxable: item.taxable !== undefined ? item.taxable : true,
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

    // Format price to have 2 decimal places
    const formattedPrice = Number(newItem.price || 0).toLocaleString('en-US', {
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
        currency: projectCurrency,
        taxRate: newItem.taxRate,
        discount: newItem.discount,
        taxable: newItem.taxable,
        taxName: taxRateName, // Store the tax name for reference
        type: 'PRODUCT', // Default type for manually added items
      } as ItemWithType;

      setItems([...items, newItemObj as Item]);
      resetFormState();
    }, 300);
  };

  const handleUpdateItem = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newItem.name.trim()) return;

    setIsSubmitting(true);

    // Format price to have 2 decimal places
    const formattedPrice = Number(newItem.price || 0).toLocaleString('en-US', {
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
            taxable: newItem.taxable,
            taxName: taxRateName, // Store the tax name for reference
            ...(itemWithType.type ? { type: itemWithType.type } : { type: 'PRODUCT' }),
          } as Item;
        }
        return item;
      });

      setItems(updatedItems);
      resetFormState();
      showNotification('Item updated successfully');
    }, 300);
  };

  // New helper function to reset form state
  const resetFormState = () => {
    setEditingItem(null);
    setCurrentNewItemMode('');
    setNewItem({
      name: '',
      description: '',
      price: '',
      quantity: '1',
      currency: 'USD',
      taxRate: 0,
      discount: 0,
      taxable: true,
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

  const toggleAiItemSelection = (id: string) => {
    setSelectedAiItems((prev) => {
      return {
        ...prev,
        [id]: !prev[id],
      };
    });
  };

  // Simulate recording start/stop
  const toggleRecording = () => {
    if (isRecording) {
      // Stop recording and attach the voice note
      setIsRecording(false);
      const newAttachment = {
        id: `voice-${Date.now()}`,
        type: 'voice',
        name: `Voice note (${recordingDuration}s)`,
        timestamp: new Date().toISOString(),
      };
      setAttachments([...attachments, newAttachment]);
      setRecordingDuration(0);
      showNotification('Voice note added', 'success');
    } else {
      // Start recording
      setIsRecording(true);
      // Start duration counter
      const intervalId = setInterval(() => {
        setRecordingDuration((prev) => {
          return prev + 1;
        });
      }, 1000);

      // Store interval ID for cleanup
      return () => {
        return clearInterval(intervalId);
      };
    }
  };

  const handleFileAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList && fileList.length > 0) {
      // Properly type each file when we create the array
      const filesArray = Array.from(fileList) as File[];

      const newAttachments = filesArray.map((file) => {
        return {
          id: `file-${Date.now()}-${file.name}`,
          type: 'file',
          name: file.name,
          size: file.size,
          timestamp: new Date().toISOString(),
        };
      });

      setAttachments([...attachments, ...newAttachments]);
      showNotification(`${fileList.length} file(s) attached`, 'success');
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(
      attachments.filter((attachment) => {
        return attachment.id !== id;
      }),
    );
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

  // Function to add a new tax rate
  const handleAddTaxRate = () => {
    if (!newTaxRate.name.trim()) {
      showNotification('Tax rate name is required', 'error');
      return;
    }

    const taxRateId = `tax-${Date.now()}`;
    const newTaxRateObj: TaxRate = {
      id: taxRateId,
      name: newTaxRate.name.trim(),
      rate: newTaxRate.rate,
    };

    setTaxRates([...taxRates, newTaxRateObj]);
    setSelectedTaxRateId(taxRateId);
    setNewTaxRate({ name: '', rate: 0 });
    setIsNewTaxRateDialogOpen(false);
    showNotification(`Tax rate "${newTaxRate.name}" added successfully`);
  };

  // Function to set the tax rate in the new item from selected tax rate ID
  const updateItemTaxRate = (taxRateId: string) => {
    setSelectedTaxRateId(taxRateId);
    const selectedRate = taxRates.find((tax) => {
      return tax.id === taxRateId;
    });
    if (selectedRate) {
      setNewItem({ ...newItem, taxRate: selectedRate.rate });
    }
  };

  // Add this utility function near the other utility functions
  const calculateItemTotal = (price: string, quantity: string): string => {
    const numPrice = parseFloat(price.replace(/,/g, ''));
    const numQuantity = parseFloat(quantity || '1');
    const total = numPrice * numQuantity;

    return total.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className='flex flex-col h-full relative bg-[#FAFAFA]'>
      <div className='absolute inset-0 pt-6 px-8 pb-16 overflow-y-auto'>
        <div className='mb-6'>
          <div className='flex justify-between items-center mb-4'>
            <h2 className='text-lg font-semibold text-[#111827]'>Items</h2>
          </div>
          <p className='text-[#6B7280] text-sm leading-5 mb-6'>
            Add items to your project. Include name, description, and price for each item.
          </p>

          {/* Action Buttons */}
          <div className='flex space-x-3 mb-6'>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => {
                      if (currentNewItemMode === 'manual') {
                        return setCurrentNewItemMode('');
                      }
                      setCurrentNewItemMode('manual');
                      setAiGeneratedItems([]);
                      setAiResponse(null);

                      // Get the currently selected tax rate
                      const selectedTax = taxRates.find((tax) => {
                        return tax.id === selectedTaxRateId;
                      });
                      if (selectedTax) {
                        setNewItem((prev) => {
                          return {
                            ...prev,
                            taxRate: selectedTax.rate,
                          };
                        });
                      }

                      setTimeout(() => {
                        return nameInputRef.current?.focus();
                      }, 10);
                    }}
                    className={cn(
                      'flex items-center justify-center transition-all duration-300 h-11',
                      currentNewItemMode === 'manual'
                        ? 'bg-blue-600 text-white hover:bg-blue-700 hover:text-white shadow-md border-0'
                        : 'hover:bg-gray-100 border-2 border-gray-200',
                    )}
                    variant='outline'
                  >
                    <Plus size={18} className='mr-2' />
                    <span className='font-medium'>Add Item Manually</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Create a new item with a name, description, and price</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => {
                      if (currentNewItemMode === 'ai') {
                        return setCurrentNewItemMode('');
                      }
                      setCurrentNewItemMode('ai');
                      setEditingItem(null);
                      setNewItem({
                        name: '',
                        description: '',
                        price: '',
                        quantity: '1',
                        currency: 'USD',
                        taxRate: 0,
                        discount: 0,
                        taxable: true,
                      });
                      setTimeout(() => {
                        return aiPromptInputRef.current?.focus();
                      }, 10);
                    }}
                    className={cn(
                      'flex items-center justify-center transition-all duration-300 h-11',
                      currentNewItemMode === 'ai'
                        ? 'bg-purple-600 text-white hover:bg-purple-700 hover:text-white shadow-md border-0'
                        : 'hover:bg-gray-100 border-2 border-gray-200',
                    )}
                    variant='outline'
                  >
                    <Sparkles size={18} className='mr-2' />
                    <span className='font-medium'>Generate with AI</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Describe what you need and let AI generate items for you</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

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
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className='border border-[#E5E7EB] rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-all duration-200 w-full'
                >
                  <form
                    onSubmit={editingItem ? handleUpdateItem : handleSubmitNewItem}
                    className='space-y-4'
                  >
                    <div>
                      <label htmlFor='item-name' className='text-xs text-gray-500 mb-1 block'>
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
                        className='w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-base font-medium text-[#111827] outline-none placeholder:text-[#9CA3AF] focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors'
                        autoFocus
                        aria-label='Item name'
                      />
                    </div>
                    <div>
                      <label
                        htmlFor='item-description'
                        className='text-xs text-gray-500 mb-1 block'
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
                        className='min-h-[80px] resize-none'
                        aria-label='Item description'
                      />
                    </div>
                    <div>
                      <label htmlFor='item-price' className='text-xs text-gray-500 mb-1 block'>
                        Price ({projectCurrency})
                      </label>
                      <div className='flex-1 relative'>
                        <Input
                          type='number'
                          id='item-price'
                          step='0.01'
                          min='0'
                          value={newItem.price}
                          onChange={(e) => {
                            return setNewItem({ ...newItem, price: e.target.value });
                          }}
                          placeholder='0.00'
                          aria-label='Item price'
                          className=''
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor='item-quantity' className='text-xs text-gray-500 mb-1 block'>
                        Quantity
                      </label>
                      <Input
                        type='number'
                        id='item-quantity'
                        min='1'
                        value={newItem.quantity}
                        onChange={(e) => {
                          return setNewItem({ ...newItem, quantity: e.target.value });
                        }}
                        placeholder='1'
                        aria-label='Item quantity'
                      />
                    </div>
                    <div className='mb-4'>
                      <Label htmlFor='taxable' className='flex items-center'>
                        <Checkbox
                          id='taxable'
                          checked={newItem.taxable}
                          onCheckedChange={(checked) => {
                            setNewItem({
                              ...newItem,
                              taxable: checked as boolean,
                            });
                          }}
                          className='mr-2'
                        />
                        <span>Item is taxable</span>
                      </Label>
                    </div>
                    <div className='grid grid-cols-2 gap-3 mb-4'>
                      <div>
                        <Label htmlFor='tax-rate'>Tax Rate</Label>
                        <Select
                          value={selectedTaxRateId}
                          onValueChange={(value) => {
                            if (value === 'add-new') {
                              setIsNewTaxRateDialogOpen(true);
                              return;
                            }
                            updateItemTaxRate(value);
                          }}
                          disabled={!newItem.taxable}
                        >
                          <SelectTrigger className='w-full'>
                            <SelectValue placeholder='Select tax rate' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel className='text-sm font-medium text-gray-500'>
                                Available Tax Rates
                              </SelectLabel>
                              {taxRates.map((taxRate) => {
                                return (
                                  <SelectItem
                                    key={taxRate.id}
                                    value={taxRate.id}
                                    className={selectedTaxRateId === taxRate.id ? 'bg-blue-50' : ''}
                                  >
                                    <div className='flex justify-between w-full items-center'>
                                      <div className='flex items-center'>
                                        <span>{taxRate.name}</span>
                                      </div>
                                      <span className='text-xs font-medium bg-blue-50 text-blue-600 rounded-full px-2 py-0.5 ml-2'>
                                        {taxRate.rate}%
                                      </span>
                                    </div>
                                  </SelectItem>
                                );
                              })}
                            </SelectGroup>
                            <SelectSeparator />
                            <SelectGroup>
                              <SelectItem value='add-new' className='text-purple-600 font-medium'>
                                <div className='flex items-center'>
                                  <Plus size={14} className='mr-2' />
                                  Add New Tax Rate
                                </div>
                              </SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor='discount'>Discount (%)</Label>
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
                        />
                      </div>
                    </div>
                    <div className='flex items-center justify-end pt-2 space-x-3'>
                      <button
                        type='button'
                        onClick={() => {
                          setEditingItem(null);
                          setNewItem({
                            name: '',
                            description: '',
                            price: '',
                            quantity: '1',
                            currency: 'USD',
                            taxRate: 0,
                            discount: 0,
                            taxable: true,
                          });
                          setCurrentNewItemMode('');
                        }}
                        className='text-[#6B7280] text-sm hover:text-[#111827] transition-colors px-4 py-2 rounded-lg hover:bg-gray-100'
                      >
                        Cancel
                      </button>
                      <button
                        type='submit'
                        className={cn(
                          'bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center min-w-[80px]',
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
                          'Add'
                        )}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* AI Prompt Form */}
              {currentNewItemMode === 'ai' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className='border border-[#E5E7EB] rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-all duration-200'
                >
                  <div className='mb-4'>
                    <label className='block text-[#111827] font-medium text-sm mb-2'>
                      Generate items with AI
                    </label>
                    <div className='flex relative'>
                      <Textarea
                        ref={aiPromptInputRef}
                        value={aiPrompt}
                        onChange={(e) => {
                          return setAiPrompt(e.target.value);
                        }}
                        rows={4}
                        placeholder='Describe what the client wants...'
                        className='flex-1 border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm outline-none bg-transparent focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-colors pr-[110px]'
                        autoFocus
                      />
                      <Button
                        onClick={handleGenerateAiItems}
                        className={cn(
                          'bg-purple-600 text-white px-4 py-2 text-sm transition-all duration-200 flex items-center justify-center min-w-[100px] absolute right-2 bottom-2 cursor-pointer z-10 rounded-lg',
                          !aiPrompt.trim() || isGenerating
                            ? 'opacity-70 cursor-not-allowed'
                            : 'hover:bg-purple-700 hover:shadow',
                        )}
                        disabled={!aiPrompt.trim() || isGenerating}
                      >
                        {isGenerating ? <Loader2 size={16} className='animate-spin' /> : 'Generate'}
                      </Button>
                    </div>

                    {/* Voice and attachment controls */}
                    <div className='flex mt-3 items-center'>
                      <div className='flex space-x-2'>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={toggleRecording}
                                className={`p-2 rounded-full flex items-center justify-center transition-all duration-200 ${
                                  isRecording
                                    ? 'bg-red-100 text-red-600 shadow-sm'
                                    : 'bg-gray-100 text-gray-600'
                                } hover:bg-gray-200`}
                                title={isRecording ? 'Stop recording' : 'Record voice note'}
                                aria-label={isRecording ? 'Stop recording' : 'Record voice note'}
                              >
                                <Mic size={16} className={isRecording ? 'animate-pulse' : ''} />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{isRecording ? 'Stop recording' : 'Record voice note'}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <label className='p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all duration-200 cursor-pointer flex items-center justify-center'>
                                <Paperclip size={16} />
                                <Input
                                  type='file'
                                  multiple
                                  className='hidden'
                                  onChange={handleFileAttachment}
                                  accept='image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                                  aria-label='Attach files'
                                />
                              </label>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Attach files</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>

                      {isRecording && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className='ml-2 flex items-center'
                        >
                          <div className='w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse'></div>
                          <span className='text-xs text-gray-500'>
                            Recording {recordingDuration}s
                          </span>
                        </motion.div>
                      )}

                      <div className='flex-1'></div>

                      <div className='text-xs text-gray-500'>
                        {attachments.length > 0 &&
                          `${attachments.length} attachment${attachments.length !== 1 ? 's' : ''}`}
                      </div>
                    </div>

                    {/* Attachments display */}
                    <AnimatePresence>
                      {attachments.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className='mt-3 space-y-2 border-t border-gray-100 pt-2'
                        >
                          {attachments.map((attachment, index) => {
                            return (
                              <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ delay: index * 0.05 }}
                                key={attachment.id}
                                className='flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-xs hover:bg-gray-100 transition-colors'
                              >
                                <div className='flex items-center'>
                                  {attachment.type === 'voice' ? (
                                    <Mic size={14} className='mr-2 text-purple-500' />
                                  ) : (
                                    <Paperclip size={14} className='mr-2 text-purple-500' />
                                  )}
                                  <span className='text-gray-700'>{attachment.name}</span>
                                </div>
                                <button
                                  onClick={() => {
                                    return removeAttachment(attachment.id);
                                  }}
                                  className='text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full p-1 transition-colors'
                                  aria-label={`Remove attachment ${attachment.name}`}
                                >
                                  <X size={14} />
                                </button>
                              </motion.div>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <p className='text-[#6B7280] text-xs mt-2 italic'>
                      Example: &quot;Client needs a red turtle hoodie for $15 and a black regular
                      shirt&quot;
                    </p>
                  </div>

                  {isGenerating && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className='flex flex-col items-center justify-center py-8'
                    >
                      <div className='relative w-12 h-12'>
                        <div className='absolute inset-0 flex items-center justify-center'>
                          <Loader2 size={24} className='text-purple-600 animate-spin' />
                        </div>
                        <div className='absolute inset-0 animate-ping rounded-full bg-purple-200 opacity-50'></div>
                      </div>
                      <p className='text-[#6B7280] text-sm mt-3'>
                        Generating items based on your description...
                      </p>
                    </motion.div>
                  )}

                  {!isGenerating && aiGeneratedItems.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className='space-y-4'
                    >
                      <div className='flex justify-between items-center'>
                        <h3 className='text-base font-medium text-[#111827]'>Generated Items</h3>
                        <div className='flex space-x-2'>
                          <button
                            onClick={() => {
                              setAiPrompt('');
                              setAiGeneratedItems([]);
                              setAiResponse(null);
                            }}
                            className='text-[#6B7280] text-sm hover:text-[#111827] transition-colors px-2 py-1 rounded hover:bg-gray-100'
                          >
                            Clear
                          </button>
                          <button
                            onClick={handleGenerateAiItems}
                            className='text-[#6B7280] text-sm hover:text-[#111827] transition-colors flex items-center px-2 py-1 rounded hover:bg-gray-100'
                          >
                            <Sparkles size={14} className='mr-1' />
                            Regenerate
                          </button>
                        </div>
                      </div>

                      {/* Changed from scrollable container to normal flow */}
                      <div className='space-y-3'>
                        {aiGeneratedItems.map((item, index) => {
                          return (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              key={item.id}
                              className={`border ${
                                selectedAiItems[item.id]
                                  ? 'border-purple-500 ring-2 ring-purple-200'
                                  : 'border-[#E5E7EB]'
                              } rounded-lg p-4 transition-all duration-200 ease-in-out hover:border-purple-300 bg-white cursor-pointer shadow-sm`}
                              onClick={() => {
                                return toggleAiItemSelection(item.id);
                              }}
                            >
                              <div className='flex items-start'>
                                <div
                                  className={`w-[18px] h-[18px] rounded-[4px] border flex-shrink-0 ${
                                    selectedAiItems[item.id]
                                      ? 'bg-purple-600 border-purple-600'
                                      : 'border-[#D1D5DB]'
                                  } flex items-center justify-center mr-3 mt-[2px] transition-colors`}
                                >
                                  {selectedAiItems[item.id] && (
                                    <svg
                                      width='12'
                                      height='12'
                                      viewBox='0 0 12 12'
                                      fill='none'
                                      xmlns='http://www.w3.org/2000/svg'
                                    >
                                      <path
                                        d='M10 3L4.5 8.5L2 6'
                                        stroke='white'
                                        strokeWidth='1.5'
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                      />
                                    </svg>
                                  )}
                                </div>
                                <div className='flex-1 min-w-0'>
                                  <div className='flex justify-between items-start flex-wrap gap-2'>
                                    <div className='flex flex-wrap items-center gap-2'>
                                      <span className='text-[#111827] text-base font-medium'>
                                        {item.name}
                                      </span>
                                      <span
                                        className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                                          item.type === 'PRODUCT'
                                            ? 'bg-blue-50 text-blue-700'
                                            : 'bg-purple-50 text-purple-700'
                                        }`}
                                      >
                                        {item.type}
                                      </span>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                      <span className='text-[#111827] text-sm font-medium bg-green-50 px-2 py-0.5 rounded-full flex-shrink-0'>
                                        {getCurrencySymbol(projectCurrency)}
                                        {item.price}
                                      </span>
                                      <span className='text-[#111827] text-sm font-medium bg-gray-50 px-2 py-0.5 rounded-full flex-shrink-0'>
                                        {item.quantity || '1'}{' '}
                                        {parseInt(item.quantity || '1') === 1 ? 'unit' : 'units'}
                                      </span>
                                    </div>
                                  </div>
                                  {item.description ? (
                                    <p className='text-[#6B7280] text-sm mt-1 leading-relaxed'>
                                      {item.description}
                                    </p>
                                  ) : (
                                    <p className='text-[#9CA3AF] text-sm mt-1 italic group-hover/item:text-[#6B7280] transition-colors'>
                                      Add a description...
                                    </p>
                                  )}
                                  {item.reasoning && (
                                    <div className='mt-2 pt-2 border-t border-[#F3F4F6]'>
                                      <p className='text-[#6B7280] text-xs italic'>
                                        <span className='font-medium'>Reasoning:</span>{' '}
                                        {item.reasoning}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>

                      {aiResponse?.meta && (
                        <div className='text-[#6B7280] text-xs border-t border-[#F3F4F6] pt-2 flex justify-between'>
                          <span>Processing time: {aiResponse.meta.processingTime.toFixed(2)}s</span>
                          <span>
                            Generated: {new Date(aiResponse.meta.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      )}

                      <div className='flex justify-between pt-2'>
                        <Button
                          onClick={() => {
                            setSelectedAiItems(
                              aiGeneratedItems.reduce((acc, item) => {
                                acc[item.id] = true;
                                return acc;
                              }, {} as Record<string, boolean>),
                            );
                          }}
                          className='text-purple-600 hover:text-purple-700 border border-purple-200 hover:bg-purple-50 text-sm'
                          variant='outline'
                        >
                          Select All
                        </Button>

                        <div className='flex'>
                          <button
                            onClick={() => {
                              setAiPrompt('');
                              setAiGeneratedItems([]);
                              setAiResponse(null);
                              setCurrentNewItemMode('');
                            }}
                            className='text-[#6B7280] text-sm hover:text-[#111827] transition-colors mr-3 px-3 py-1.5 rounded hover:bg-gray-100'
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleAddSelectedAiItems}
                            className={cn(
                              'bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center',
                              Object.values(selectedAiItems).filter(Boolean).length === 0
                                ? 'opacity-70 cursor-not-allowed'
                                : 'hover:bg-purple-700 hover:shadow',
                            )}
                            disabled={Object.values(selectedAiItems).filter(Boolean).length === 0}
                          >
                            Add{' '}
                            {Object.values(selectedAiItems).filter(Boolean).length > 0
                              ? `${Object.values(selectedAiItems).filter(Boolean).length} `
                              : ''}
                            Selected Item
                            {Object.values(selectedAiItems).filter(Boolean).length !== 1 ? 's' : ''}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Item Cards */}
          <div className='space-y-3'>
            <div className='flex items-center mb-4'>
              <h3 className='text-lg font-semibold text-[#111827]'>
                {items.length > 0 ? (
                  <>
                    Your Items{' '}
                    <span className='ml-2 text-sm font-normal text-gray-500'>({items.length})</span>
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
                      setAiGeneratedItems([]);
                      setAiResponse(null);
                    }}
                    className='bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs py-1 px-3 rounded-full h-auto transition-colors duration-200'
                    variant='ghost'
                  >
                    <Plus size={14} className='mr-1' />
                    Add more
                  </Button>
                </div>
              )}
            </div>

            {items.map((item, index) => {
              const itemTotal =
                parseFloat(item.price.replace(/,/g, '')) * parseFloat(item.quantity || '1');

              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.2 }}
                  key={item.id}
                  className='border border-[#E5E7EB] rounded-xl p-4 transition-all duration-200 ease-in-out hover:border-blue-300 group bg-white shadow-sm hover:shadow-md hover:translate-y-[-1px]'
                >
                  <div className='flex justify-between items-start'>
                    <div className='flex items-start flex-1'>
                      <div className='flex-1'>
                        {/* Display mode */}
                        <div className='group/item'>
                          <div className='flex flex-col'>
                            <div className='flex items-center'>
                              <span className='text-[#111827] text-base font-semibold group-hover/item:text-black transition-colors'>
                                {item.name}
                              </span>
                              {parseInt(item.quantity) > 1 && (
                                <span className='ml-2 text-xs font-medium bg-gray-100 text-gray-600 rounded-full px-2 py-0.5'>
                                  {item.quantity}x
                                </span>
                              )}
                            </div>

                            {item.description ? (
                              <p className='text-[#6B7280] text-sm mt-1 leading-relaxed group-hover/item:text-[#4B5563] transition-colors'>
                                {item.description}
                              </p>
                            ) : (
                              <p className='text-[#9CA3AF] text-sm mt-1 italic group-hover/item:text-[#6B7280] transition-colors'>
                                Add a description...
                              </p>
                            )}

                            <div className='mt-2 flex flex-wrap items-center gap-2'>
                              {item.taxable && item.taxRate > 0 && (
                                <div className='text-xs text-blue-600 bg-blue-50 rounded-full py-0.5 px-2 flex items-center'>
                                  <Hash size={10} className='mr-1' />
                                  {item.taxName || 'Tax'}: {item.taxRate}%
                                </div>
                              )}
                              {item.discount > 0 && (
                                <div className='text-xs text-green-600 bg-green-50 rounded-full py-0.5 px-2 flex items-center'>
                                  <Scissors size={10} className='mr-1' />
                                  Discount: {item.discount}%
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className='flex flex-col items-end'>
                      <div className='flex flex-col items-end'>
                        <div className='flex items-center space-x-1'>
                          <span className='text-[#111827] text-sm font-medium'>
                            {getCurrencySymbol(projectCurrency)}
                            {item.price}
                          </span>
                          {parseInt(item.quantity) > 1 && (
                            <span className='text-gray-400 text-xs'>× {item.quantity}</span>
                          )}
                        </div>

                        {parseInt(item.quantity) > 1 && (
                          <span className='text-gray-600 text-xs font-medium mt-1'>
                            {getCurrencySymbol(projectCurrency)}
                            {calculateItemTotal(item.price, item.quantity)} total
                          </span>
                        )}
                      </div>
                      <div className='flex flex-col items-end gap-2 mt-2'>
                        <button
                          onClick={() => {
                            return handleEditItem(item as ExtendedItem);
                          }}
                          className='text-blue-600 text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 hover:underline'
                        >
                          <PencilLine size={12} />
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            return handleRemoveItem(item.id, e);
                          }}
                          className='text-red-600 text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 hover:underline'
                        >
                          <X size={12} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {items.length === 0 && (
              <div className='text-center p-8 border-2 border-dashed border-gray-200 rounded-xl bg-white transition-all duration-200 hover:border-blue-200 group'>
                <div className='flex flex-col items-center justify-center space-y-3'>
                  <div className='rounded-full bg-blue-50 p-3 group-hover:bg-blue-100 transition-colors duration-200'>
                    <Plus size={22} className='text-blue-600' />
                  </div>
                  <h3 className='text-[#111827] font-medium group-hover:text-blue-700 transition-colors duration-200'>
                    No items yet
                  </h3>
                  <p className='text-[#6B7280] text-sm max-w-[320px] leading-relaxed'>
                    Create items manually or generate them with AI to add to your project.
                  </p>
                  <div className='flex gap-3 mt-2'>
                    <Button
                      onClick={() => {
                        setCurrentNewItemMode('manual');
                        setTimeout(() => {
                          return nameInputRef.current?.focus();
                        }, 10);
                      }}
                      className='bg-blue-600 hover:bg-blue-700 text-white'
                      size='sm'
                    >
                      <Plus size={16} className='mr-2' />
                      Add Item Manually
                    </Button>
                    <Button
                      onClick={() => {
                        setCurrentNewItemMode('ai');
                        setTimeout(() => {
                          return aiPromptInputRef.current?.focus();
                        }, 10);
                      }}
                      className='bg-purple-600 hover:bg-purple-700 text-white'
                      size='sm'
                    >
                      <Sparkles size={16} className='mr-2' />
                      Generate with AI
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tax Rate Dialog */}
      <Dialog open={isNewTaxRateDialogOpen} onOpenChange={setIsNewTaxRateDialogOpen}>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle className='flex items-center text-lg font-semibold'>
              <div className='mr-2 p-1.5 bg-purple-100 rounded-full'>
                <Plus size={18} className='text-purple-600' />
              </div>
              New Tax Rate
            </DialogTitle>
            <DialogDescription>Create a new tax rate to apply to your items.</DialogDescription>
          </DialogHeader>
          <div className='grid gap-5 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='tax-name' className='text-sm font-medium'>
                Tax Name
              </Label>
              <Input
                id='tax-name'
                ref={newTaxNameInputRef}
                value={newTaxRate.name}
                onChange={(e) => {
                  return setNewTaxRate({ ...newTaxRate, name: e.target.value });
                }}
                className='w-full'
                placeholder='e.g. GST, VAT, Sales Tax'
                autoFocus
              />
              <p className='text-xs text-gray-500'>Enter a descriptive name for this tax rate</p>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='tax-percentage' className='text-sm font-medium'>
                Rate (%)
              </Label>
              <Input
                id='tax-percentage'
                type='number'
                min='0'
                max='100'
                step='0.1'
                value={newTaxRate.rate}
                onChange={(e) => {
                  return setNewTaxRate({ ...newTaxRate, rate: parseFloat(e.target.value) });
                }}
                className='w-full'
                placeholder='e.g. 7.5'
              />
              <p className='text-xs text-gray-500'>
                Enter the percentage rate without the % symbol
              </p>
            </div>
          </div>
          <DialogFooter className='flex space-x-2 justify-end'>
            <Button
              type='button'
              variant='outline'
              onClick={() => {
                return setIsNewTaxRateDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type='button'
              onClick={handleAddTaxRate}
              disabled={!newTaxRate.name.trim()}
              className='bg-purple-600 hover:bg-purple-700 text-white'
            >
              <Plus size={16} className='mr-2' />
              Add Tax Rate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <SectionFooter
        onContinue={() => {
          setActiveSection('client');
          showNotification('Moved to Client section');
        }}
        currentSection={1}
        totalSections={4}
      />
    </div>
  );
}
