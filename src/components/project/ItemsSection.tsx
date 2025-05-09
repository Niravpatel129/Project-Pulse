'use client';

import AICard from '@/components/ui/ai-card';
import type { Attachment } from '@/components/ui/ai-input';
import AIInput from '@/components/ui/ai-input';
import { Button } from '@/components/ui/button';
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
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Hash, Loader2, Plus, Scissors, Sparkles, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import SectionFooter from './SectionFooter';
import type { AIItem, ExtendedItem, Item, Section } from './types';

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
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
  setActiveSection: React.Dispatch<React.SetStateAction<Section>>;
  handleRemoveItem: (id: string, e?: React.MouseEvent) => void;
  projectCurrency: string;
  onChatClick?: () => void;
  onSectionChange?: (section: number) => void;
};

export default function ItemsSection({
  items,
  setItems,
  setActiveSection,
  handleRemoveItem,
  projectCurrency,
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
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiPromptError, setAiPromptError] = useState('');
  const [aiGeneratedItems, setAiGeneratedItems] = useState<AIItem[]>([]);
  const [selectedAiItems, setSelectedAiItems] = useState<Record<string, boolean>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAiResultsModalOpen, setIsAiResultsModalOpen] = useState(false);
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
  const [addAnother, setAddAnother] = useState(false);
  const [batchEditSettings, setBatchEditSettings] = useState({
    taxRateId: 'standard',
    discount: 0,
  });

  const nameInputRef = useRef<HTMLInputElement>(null);
  const aiPromptInputRef = useRef<HTMLTextAreaElement>(null);
  const newTaxNameInputRef = useRef<HTMLInputElement>(null);

  const handleGenerateAiItems = () => {
    if (!aiPrompt.trim()) return;

    setIsGenerating(true);
    setAiGeneratedItems([]);
    setAiResponse(null);
    setAiPromptError(''); // Clear any previous errors

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
            reasoning:
              "Name and color extracted from prompt. Price specified as 'something like $15'. Description generated to include color, type, and standard hoodie features.",
          },
          {
            name: 'Black Regular Shirt',
            description:
              'Classic black t-shirt made from high-quality cotton, offering a comfortable regular fit with reinforced stitching and breathable fabric. Versatile for everyday use and layering.',
            price: '12.00',
            type: 'PRODUCT',
            reasoning:
              "Name ('black regular shirt') and color taken from prompt. Price estimated based on typical t-shirt prices and services table reference. Description generated to match a standard product of this type.",
          },
          {
            name: 'DTF',
            description:
              'Professional Direct to Film (DTF) printing service, using advanced technology for vibrant, detailed prints on a variety of garments. Ideal for custom apparel with lasting color and durability.',
            price: '10.00',
            type: 'SERVICE',
            reasoning:
              "Name matched to 'DTF' from services table. Price of $10 derived from services table. Description generated based on DTF printing process.",
          },
          {
            name: 'Screen',
            description:
              'Expert screen printing service delivering sharp, long-lasting designs on apparel. Utilizes high-quality inks and precision techniques for both single and bulk orders.',
            price: '14.00',
            type: 'SERVICE',
            reasoning:
              "Name matched to 'Screen' from services table. Price of $14 derived from services table. Description generated based on screen printing process and standard features.",
          },
        ],
        meta: {
          processingTime: 8.584,
          promptLength: 203,
          timestamp: '2025-05-05T21:07:25.310Z',
          feedbackMessage:
            'Successfully generated 4 items for your project based on your description.',
        },
      };

      // Simulate successful case (comment/uncomment to test error case)
      // Uncomment the line below to test the error case
      // mockResponse.lineItems = [];

      setAiResponse(mockResponse);

      if (mockResponse.lineItems && mockResponse.lineItems.length > 0) {
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
          };
        });

        setAiGeneratedItems(generatedItems);
        // Auto-select all items by default
        const allSelected = generatedItems.reduce((acc, item) => {
          acc[item.id] = true;
          return acc;
        }, {} as Record<string, boolean>);
        setSelectedAiItems(allSelected);
        setIsAiResultsModalOpen(true); // Only open modal if we have items

        // Show success toast if there's a feedback message
        if (mockResponse.meta?.feedbackMessage) {
          toast.success(mockResponse.meta.feedbackMessage);
        }
      } else {
        // Handle case where AI couldn't generate any items
        const errorMessage =
          mockResponse.meta?.feedbackMessage ||
          'Unable to generate items from your description. Please try again with more details.';
        setAiPromptError(errorMessage);
        toast.error(errorMessage);
      }

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

    // If multiple items selected, open batch edit modal for tax and discount
    if (selectedItems.length > 1) {
      setIsAiResultsModalOpen(true);
      return;
    }

    // For single item, proceed directly
    addSelectedItemsToProject(selectedItems);
  };

  // New function to actually add the items after potentially configuring them
  const addSelectedItemsToProject = (
    selectedItems: AIItem[],
    settings?: typeof batchEditSettings,
  ) => {
    // Get the selected tax rate for display purposes
    const selectedTax = taxRates.find((tax) => {
      return tax.id === (settings?.taxRateId || selectedTaxRateId);
    });
    const taxRateName = selectedTax ? selectedTax.name : '';
    const taxRate = selectedTax ? selectedTax.rate : 0;

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
        type: item.type,
        taxRate: taxRate,
        discount: settings?.discount || 0,
        taxName: taxRateName,
      } as ItemWithType;
    });

    setItems([...items, ...(formattedItems as Item[])]);
    setAiPrompt('');
    setAiGeneratedItems([]);
    setAiResponse(null);
    setSelectedAiItems({});
    setIsAiResultsModalOpen(false);

    // Show success notification
    toast.success(
      `${formattedItems.length} ${
        formattedItems.length === 1 ? 'item' : 'items'
      } added successfully`,
    );
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
    // Reset AI-related state
    setAiPromptError('');
    setAiPrompt('');
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
      const newAttachment: Attachment = {
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
      const filesArray = Array.from(fileList) as File[];

      const newAttachments: Attachment[] = filesArray.map((file) => {
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

  return (
    <div className='flex flex-col h-full relative bg-[#FAFAFA]'>
      <div className='absolute inset-0 pt-4 px-6 pb-16 overflow-y-auto'>
        <div className='mb-4'>
          <div className='flex justify-between items-center mb-3'>
            <h2 className='text-lg font-semibold text-[#111827]'>Items</h2>
          </div>
          <p className='text-[#6B7280] text-sm leading-5 mb-4'>
            Add items to your project. Include name, description, and price for each item.
          </p>

          {/* Action Buttons */}
          {items.length > 0 && (
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
                        setAiPromptError(''); // Clear any previous errors
                        setNewItem({
                          name: '',
                          description: '',
                          price: '',
                          quantity: '1',
                          taxRate: 0,
                          discount: 0,
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
                      <span className='font-medium'>Quick Add With AI</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Describe what you need and let AI generate items for you</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
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
                <motion.div className='border border-[#E5E7EB] rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-all duration-200 w-full relative'>
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
                    className='absolute top-3 right-3 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors'
                  >
                    <X size={18} />
                  </button>

                  <form
                    onSubmit={(e) => {
                      return e.preventDefault();
                    }}
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
                            className='text-sm text-gray-600 cursor-pointer'
                          >
                            Create more
                          </Label>
                        </div>
                      )}

                      {/* Spacer when editing */}
                      {editingItem && <div></div>}

                      {/* Action button */}
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
                  </form>
                </motion.div>
              )}

              {/* AI Prompt Form */}
              {currentNewItemMode === 'ai' && (
                <AICard
                  className='animate-in fade-in slide-in-from-top-2 duration-200'
                  title='Generate items with AI'
                  onClose={() => {
                    setCurrentNewItemMode('');
                    setAiPrompt('');
                    setAttachments([]);
                    setAiPromptError(null);
                  }}
                >
                  <AIInput
                    value={aiPrompt}
                    onChange={(value) => {
                      setAiPrompt(value);
                      setAiPromptError(null);
                    }}
                    onGenerate={handleGenerateAiItems}
                    isGenerating={isGenerating}
                    error={aiPromptError}
                    placeholder='Describe the items you want to add...'
                    exampleText='Example: "Add 5 hours of web development at $150/hour, 2 hours of design at $120/hour, and a $500 software license fee"'
                    attachments={attachments}
                    onAttachmentAdd={setAttachments}
                    onAttachmentRemove={removeAttachment}
                  />

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
                </AICard>
              )}
            </AnimatePresence>
          </div>

          {/* Item Cards */}
          <div className='space-y-3'>
            {items.length > 0 && (
              <>
                <div className='flex items-center mb-4'>
                  <h3 className='text-lg font-semibold text-[#111827]'>
                    {items.length > 0 ? (
                      <>
                        Your Items{' '}
                        <span className='ml-2 text-sm font-normal text-gray-500'>
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
              </>
            )}

            {items.length === 0 ? (
              <div className='bg-white rounded-xl border border-gray-200 p-6'>
                <div className='text-center py-0 px-4'>
                  <h3 className='mt-2 text-xl font-semibold text-gray-900 mb-3'>
                    Add Your First Item
                  </h3>
                  <p className='text-gray-500 mb-8 max-w-md mx-auto'>
                    Get started by adding your first item. Choose from two convenient options:
                  </p>

                  <div className='grid grid-cols-2 gap-6 max-w-2xl mx-auto'>
                    <div className='bg-white p-6 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors flex flex-col'>
                      <div className='relative'>
                        <div className='absolute inset-0 bg-gradient-to-r from-blue-100 to-blue-50 blur-xl opacity-50 rounded-full'></div>
                        <div className='bg-blue-50 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 relative'>
                          <Plus className='w-6 h-6 text-blue-600' />
                        </div>
                      </div>
                      <h4 className='font-medium text-gray-900 mb-2'>Manual Entry</h4>
                      <p className='text-sm text-gray-500 mb-4 flex-grow'>
                        Perfect for when you have all the item details ready. Enter information
                        directly into our organized form.
                      </p>
                      <Button
                        onClick={() => {
                          setCurrentNewItemMode('manual');
                          setTimeout(() => {
                            return nameInputRef.current?.focus();
                          }, 10);
                        }}
                        className='w-full bg-gray-900 hover:bg-gray-800 text-white'
                      >
                        Add Manually
                      </Button>
                    </div>

                    <div className='bg-white p-6 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors flex flex-col'>
                      <div className='relative'>
                        <div className='absolute inset-0 bg-gradient-to-r from-purple-100 to-purple-50 blur-xl opacity-50 rounded-full'></div>
                        <div className='bg-purple-50 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 relative'>
                          <Sparkles className='w-6 h-6 text-purple-600' />
                        </div>
                      </div>
                      <h4 className='font-medium text-gray-900 mb-2'>AI-Powered</h4>
                      <p className='text-sm text-gray-500 mb-4 flex-grow'>
                        Let AI help you create items. Just describe what you need in natural
                        language.
                      </p>
                      <Button
                        onClick={() => {
                          setCurrentNewItemMode('ai');
                          setTimeout(() => {
                            return aiPromptInputRef.current?.focus();
                          }, 10);
                        }}
                        className='w-full bg-gray-900 hover:bg-gray-800 text-white'
                      >
                        Use AI Assistant
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              items.map((item, index) => {
                console.log('🚀 item:', item);

                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.2 }}
                    key={item.id}
                    className='border border-[#E5E7EB] rounded-xl p-4 transition-all duration-200 ease-in-out hover:border-blue-300 group bg-white shadow-sm hover:shadow-md hover:translate-y-[-1px] relative'
                  >
                    {/* Remove button */}
                    <button
                      onClick={(e) => {
                        return handleRemoveItem(item.id, e);
                      }}
                      className='absolute top-2 right-2 p-1.5 rounded-full bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-200'
                      aria-label='Remove item'
                    >
                      <X size={16} />
                    </button>

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
                                {item.taxRate > 0 && (
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
                              <div className='mt-3 flex items-center justify-between'>
                                <div className='flex items-center gap-4'>
                                  <div className='flex items-center gap-1'>
                                    <span className='text-sm text-gray-500'>Qty:</span>
                                    <span className='text-sm font-medium text-gray-900'>
                                      {item.quantity}
                                    </span>
                                  </div>
                                  <div className='flex items-center gap-2'>
                                    <span className='text-sm text-gray-600'>
                                      {getCurrencySymbol(projectCurrency)}
                                      {item.price}
                                      <span className='text-gray-400 ml-1'>/unit</span>
                                    </span>
                                    {parseInt(item.quantity) > 1 && (
                                      <span className='text-sm font-medium text-gray-900'>
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
              onClick={() => {
                handleAddTaxRate();
                setIsNewTaxRateDialogOpen(false);
              }}
              className='bg-purple-600 hover:bg-purple-700 text-white'
            >
              <Plus size={16} className='mr-2' />
              Add Tax Rate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Generated Items Results Modal */}
      <Dialog
        open={isAiResultsModalOpen}
        onOpenChange={(open) => {
          if (!open && !isGenerating) {
            setIsAiResultsModalOpen(false);
            if (!open) {
              // When dialog closes and it wasn't from an error, clean up AI state
              if (aiGeneratedItems.length > 0) {
                setAiPrompt('');
                setAiPromptError('');
                setAiGeneratedItems([]);
                setAiResponse(null);
              }
            }
          }
        }}
      >
        <DialogContent className='sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col'>
          <DialogHeader>
            <DialogTitle className='flex items-center text-lg font-semibold'>
              <div className='mr-2 p-1.5 bg-purple-100 rounded-full'>
                <Sparkles size={18} className='text-purple-600' />
              </div>
              AI Generated Items
            </DialogTitle>
            <DialogDescription>Review and select items to add to your project</DialogDescription>
          </DialogHeader>

          {isGenerating ? (
            <div className='flex flex-col items-center justify-center py-12'>
              <div className='relative w-16 h-16'>
                <div className='absolute inset-0 flex items-center justify-center'>
                  <Loader2 size={32} className='text-purple-600 animate-spin' />
                </div>
                <div className='absolute inset-0 animate-ping rounded-full bg-purple-200 opacity-50'></div>
              </div>
              <p className='text-[#6B7280] text-base mt-4'>
                Generating items based on your description...
              </p>
            </div>
          ) : (
            <div className='overflow-y-auto flex-1 -mx-6 px-6'>
              <div className='space-y-4 mb-6'>
                <div className='flex justify-between items-center'>
                  <p className='text-sm text-gray-500'>
                    {aiGeneratedItems.length} items generated from your prompt
                  </p>

                  <div className='flex items-center gap-2'>
                    <Button
                      onClick={() => {
                        setSelectedAiItems(
                          aiGeneratedItems.reduce((acc, item) => {
                            acc[item.id] = true;
                            return acc;
                          }, {} as Record<string, boolean>),
                        );
                      }}
                      size='sm'
                      variant='outline'
                      className='text-xs h-8'
                    >
                      Select All
                    </Button>

                    <Button
                      onClick={() => {
                        setSelectedAiItems({});
                      }}
                      size='sm'
                      variant='outline'
                      className='text-xs h-8'
                    >
                      Deselect All
                    </Button>
                  </div>
                </div>

                {/* Item List with Checkboxes */}
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
                            ? 'border-purple-500 ring-1 ring-purple-200'
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
                            {selectedAiItems[item.id] && <Check size={12} className='text-white' />}
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
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {!isGenerating && (
            <>
              <Separator />
              <div className='py-4'>
                <div className='flex flex-col space-y-4'>
                  <h3 className='text-sm font-medium'>Configuration</h3>

                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='modal-tax-rate' className='text-xs text-gray-500'>
                        Tax Rate
                      </Label>
                      <Select
                        value={batchEditSettings.taxRateId}
                        onValueChange={(value) => {
                          if (value === 'add-new') {
                            setIsNewTaxRateDialogOpen(true);
                            return;
                          }
                          setBatchEditSettings({
                            ...batchEditSettings,
                            taxRateId: value,
                          });
                        }}
                      >
                        <SelectTrigger className='w-full h-9 text-sm'>
                          <SelectValue placeholder='Select tax rate' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel className='text-xs font-medium text-gray-500'>
                              Available Tax Rates
                            </SelectLabel>
                            {taxRates.map((taxRate) => {
                              return (
                                <SelectItem
                                  key={taxRate.id}
                                  value={taxRate.id}
                                  className={
                                    batchEditSettings.taxRateId === taxRate.id ? 'bg-blue-50' : ''
                                  }
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

                    <div className='space-y-2'>
                      <Label htmlFor='modal-discount' className='text-xs text-gray-500'>
                        Discount (%)
                      </Label>
                      <Input
                        id='modal-discount'
                        type='number'
                        min='0'
                        max='100'
                        value={batchEditSettings.discount}
                        onChange={(e) => {
                          setBatchEditSettings({
                            ...batchEditSettings,
                            discount: Number(e.target.value),
                          });
                        }}
                        className='h-9 text-sm'
                      />
                    </div>
                  </div>

                  <div className='flex items-center space-x-2 mt-2'>
                    <Switch
                      id='modal-taxable'
                      checked={batchEditSettings.taxRateId !== 'zero'}
                      onCheckedChange={(checked) => {
                        setBatchEditSettings({
                          ...batchEditSettings,
                          taxRateId: checked ? 'standard' : 'zero',
                        });
                      }}
                    />
                    <Label htmlFor='modal-taxable' className='text-sm cursor-pointer'>
                      Items are taxable
                    </Label>
                  </div>
                </div>
              </div>
            </>
          )}

          <DialogFooter className='space-x-2'>
            <Button
              type='button'
              variant='outline'
              onClick={() => {
                setIsAiResultsModalOpen(false);
                setAiPrompt('');
                setAiPromptError('');
              }}
              disabled={isGenerating}
            >
              Cancel
            </Button>

            <Button
              type='button'
              onClick={() => {
                const selectedItems = aiGeneratedItems.filter((item) => {
                  return selectedAiItems[item.id];
                });

                if (selectedItems.length === 0) {
                  toast.error('Please select at least one item');
                  return;
                }

                addSelectedItemsToProject(selectedItems, batchEditSettings);
                setIsAiResultsModalOpen(false);
                setCurrentNewItemMode('');
              }}
              disabled={isGenerating || Object.values(selectedAiItems).filter(Boolean).length === 0}
              className='bg-purple-600 hover:bg-purple-700 text-white'
            >
              Add {Object.values(selectedAiItems).filter(Boolean).length}{' '}
              {Object.values(selectedAiItems).filter(Boolean).length === 1 ? 'Item' : 'Items'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
