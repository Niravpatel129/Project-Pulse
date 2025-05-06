'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Loader2, Mic, Paperclip, PencilLine, Plus, Sparkles, X } from 'lucide-react';
import { useRef, useState } from 'react';
import SectionFooter from './SectionFooter';
import type { AIItem, Attachment, Item, Section } from './types';

type ItemsSectionProps = {
  items: Item[];
  setItems: (items: Item[]) => void;
  showNotification: (message: string, type?: string) => void;
  setActiveSection: React.Dispatch<React.SetStateAction<Section>>;
  handleRemoveItem: (id: string, e?: React.MouseEvent) => void;
};

export default function ItemsSection({
  items,
  setItems,
  showNotification,
  setActiveSection,
  handleRemoveItem,
}: ItemsSectionProps) {
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
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [aiResponse, setAiResponse] = useState<any>(null);
  const [keyboardShortcutsVisible, setKeyboardShortcutsVisible] = useState(false);
  const [inlineEditingItem, setInlineEditingItem] = useState<string | null>(null);
  const [inlineEditValues, setInlineEditValues] = useState<{
    name: string;
    description: string;
    price: string;
    quantity: string;
  }>({
    name: '',
    description: '',
    price: '',
    quantity: '1',
  });

  const nameInputRef = useRef<HTMLInputElement>(null);
  const aiPromptInputRef = useRef<HTMLTextAreaElement>(null);

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
            price: '$15.00',
            type: 'PRODUCT',
            reasoning:
              "Name and color extracted from prompt. Price specified as 'something like $15'. Description generated to include color, type, and standard hoodie features.",
          },
          {
            name: 'Black Regular Shirt',
            description:
              'Classic black t-shirt made from high-quality cotton, offering a comfortable regular fit with reinforced stitching and breathable fabric. Versatile for everyday use and layering.',
            price: '$12.00',
            type: 'PRODUCT',
            reasoning:
              "Name ('black regular shirt') and color taken from prompt. Price estimated based on typical t-shirt prices and services table reference. Description generated to match a standard product of this type.",
          },
          {
            name: 'DTF',
            description:
              'Professional Direct to Film (DTF) printing service, using advanced technology for vibrant, detailed prints on a variety of garments. Ideal for custom apparel with lasting color and durability.',
            price: '$10.00',
            type: 'SERVICE',
            reasoning:
              "Name matched to 'DTF' from services table. Price of $10 derived from services table. Description generated based on DTF printing process.",
          },
          {
            name: 'Screen',
            description:
              'Expert screen printing service delivering sharp, long-lasting designs on apparel. Utilizes high-quality inks and precision techniques for both single and bulk orders.',
            price: '$14.00',
            type: 'SERVICE',
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
          price: item.price.replace('$', ''),
          type: item.type,
          reasoning: item.reasoning,
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
      return {
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price.replace('$', ''),
        quantity: item.quantity || '1',
      };
    });

    setItems([...items, ...formattedItems]);
    setAiPrompt('');
    setAiGeneratedItems([]);
    setAiResponse(null);
    setSelectedAiItems({});

    showNotification(
      `Added ${selectedItems.length} item${selectedItems.length > 1 ? 's' : ''}`,
      'success',
    );
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

    // Simulate a slight delay for better UX
    setTimeout(() => {
      const newItemObj = {
        id: `item${Date.now()}`,
        name: newItem.name.trim(),
        description: newItem.description.trim(),
        price: formattedPrice,
        quantity: newItem.quantity || '1',
      };

      setItems([...items, newItemObj]);
      setNewItem({ name: '', description: '', price: '', quantity: '1' });
      setIsSubmitting(false);
      showNotification('Item added successfully');
    }, 300);
  };

  const handleEditItem = (item: Item) => {
    setEditingItem(item);
    setNewItem({
      name: item.name,
      description: item.description,
      price: item.price.replace(/,/g, ''),
      quantity: item.quantity || '1',
    });
    setCurrentNewItemMode('manual');
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

    // Simulate a slight delay for better UX
    setTimeout(() => {
      if (!editingItem) return;

      const updatedItems = items.map((item) => {
        return item.id === editingItem.id
          ? {
              ...item,
              name: newItem.name.trim(),
              description: newItem.description.trim(),
              price: formattedPrice,
              quantity: newItem.quantity || '1',
            }
          : item;
      });

      setItems(updatedItems);
      setNewItem({ name: '', description: '', price: '', quantity: '1' });
      setEditingItem(null);
      setIsSubmitting(false);
      showNotification('Item updated successfully');
    }, 300);
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

  // Function to start inline editing for an item
  const startInlineEdit = (item: Item) => {
    setInlineEditingItem(item.id);
    setInlineEditValues({
      name: item.name,
      description: item.description,
      price: item.price.replace(/,/g, ''),
      quantity: item.quantity || '1',
    });
  };

  // Function to save inline edits
  const saveInlineEdit = (itemId: string) => {
    if (!inlineEditValues.name.trim()) {
      showNotification('Item name cannot be empty', 'error');
      return;
    }

    setIsSubmitting(true);

    // Format price to have 2 decimal places
    const formattedPrice = Number(inlineEditValues.price || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    // Update the item
    const updatedItems = items.map((item) => {
      return item.id === itemId
        ? {
            ...item,
            name: inlineEditValues.name.trim(),
            description: inlineEditValues.description.trim(),
            price: formattedPrice,
            quantity: inlineEditValues.quantity || '1',
          }
        : item;
    });

    setTimeout(() => {
      setItems(updatedItems);
      setInlineEditingItem(null);
      setIsSubmitting(false);
      showNotification('Item updated successfully');
    }, 300);
  };

  // Function to cancel inline editing
  const cancelInlineEdit = () => {
    setInlineEditingItem(null);
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

          <p className='text-[#6B7280] text-sm leading-5 mb-6'>
            Add items to your project. Include name, description, and price for each item.
            <button
              onClick={() => {
                return setKeyboardShortcutsVisible(true);
              }}
              className='ml-1 text-blue-600 underline-offset-2 hover:underline focus:outline-none focus:underline transition-colors'
              aria-label='View keyboard shortcuts'
            >
              View shortcuts
            </button>
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
                      setNewItem({ name: '', description: '', price: '', quantity: '1' });
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
                      <textarea
                        id='item-description'
                        value={newItem.description}
                        onChange={(e) => {
                          return setNewItem({ ...newItem, description: e.target.value });
                        }}
                        onKeyDown={handleDescriptionKeyDown}
                        placeholder='Add a description'
                        className='w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm text-[#6B7280] outline-none resize-none min-h-[80px] placeholder:text-[#9CA3AF] focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors'
                        aria-label='Item description'
                      />
                    </div>
                    <div>
                      <label htmlFor='item-price' className='text-xs text-gray-500 mb-1 block'>
                        Price
                      </label>
                      <div className='relative'>
                        <span className='absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B7280] font-medium'>
                          $
                        </span>
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
                          className='pl-7'
                          aria-label='Item price'
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
                    <div className='flex items-center justify-end pt-2 space-x-3'>
                      <button
                        type='button'
                        onClick={() => {
                          setEditingItem(null);
                          setNewItem({ name: '', description: '', price: '', quantity: '1' });
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
                                <input
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
                                        ${item.price}
                                      </span>
                                      <span className='text-[#111827] text-sm font-medium bg-gray-50 px-2 py-0.5 rounded-full flex-shrink-0'>
                                        Qty: {item.quantity || '1'}
                                      </span>
                                    </div>
                                  </div>
                                  {item.description && (
                                    <p className='text-[#6B7280] text-sm mt-1 leading-relaxed'>
                                      {item.description}
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
            <div className='flex items-center mb-3'>
              <h3 className='text-lg font-semibold text-[#111827]'>
                {items.length > 0 ? 'Your Items' : ''}
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
                    className='bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs py-1 px-3 rounded-full h-auto'
                    variant='ghost'
                  >
                    <Plus size={14} className='mr-1' />
                    Add more
                  </Button>
                </div>
              )}
            </div>

            {items.map((item, index) => {
              const isEditing = inlineEditingItem === item.id;

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
                      <button
                        onClick={(e) => {
                          return handleRemoveItem(item.id, e);
                        }}
                        className='mr-3 mt-1 text-[#D1D5DB] hover:text-[#EF4444] transition-colors group-hover:opacity-100 opacity-0 focus:outline-none focus:text-[#EF4444] h-6 w-6 flex items-center justify-center rounded-full hover:bg-[#FEE2E2]'
                        aria-label={`Remove ${item.name}`}
                      >
                        <X size={16} className='transition-transform group-hover:scale-110' />
                      </button>

                      <div className='flex-1'>
                        {isEditing ? (
                          // Inline editing form
                          <div className='space-y-2'>
                            <div>
                              <Input
                                type='text'
                                value={inlineEditValues.name}
                                onChange={(e) => {
                                  return setInlineEditValues({
                                    ...inlineEditValues,
                                    name: e.target.value,
                                  });
                                }}
                                className='border-blue-300 focus-visible:ring-blue-100'
                                placeholder='Item name'
                                autoFocus
                              />
                            </div>

                            <div>
                              <textarea
                                value={inlineEditValues.description}
                                onChange={(e) => {
                                  return setInlineEditValues({
                                    ...inlineEditValues,
                                    description: e.target.value,
                                  });
                                }}
                                className='w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-[#6B7280] outline-none resize-none min-h-[60px] placeholder:text-[#9CA3AF] focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors'
                                placeholder='Add a description'
                              />
                            </div>

                            <div className='flex items-center space-x-3'>
                              <div className='relative flex-1 max-w-[120px]'>
                                <span className='absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B7280] font-medium'>
                                  $
                                </span>
                                <Input
                                  type='number'
                                  id='item-price'
                                  step='0.01'
                                  min='0'
                                  value={inlineEditValues.price}
                                  onChange={(e) => {
                                    return setInlineEditValues({
                                      ...inlineEditValues,
                                      price: e.target.value,
                                    });
                                  }}
                                  placeholder='0.00'
                                  className='pl-7'
                                  aria-label='Item price'
                                />
                              </div>

                              <div className='relative flex-1 max-w-[100px]'>
                                <span className='absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B7280] font-medium'>
                                  Qty:
                                </span>
                                <Input
                                  type='number'
                                  min='1'
                                  value={inlineEditValues.quantity}
                                  onChange={(e) => {
                                    return setInlineEditValues({
                                      ...inlineEditValues,
                                      quantity: e.target.value,
                                    });
                                  }}
                                  className='pl-9'
                                  placeholder='1'
                                />
                              </div>

                              <div className='flex space-x-2 ml-3'>
                                <Button
                                  onClick={() => {
                                    return cancelInlineEdit();
                                  }}
                                  variant='ghost'
                                  size='sm'
                                  className='text-gray-500 hover:text-gray-700 hover:bg-gray-100 h-8 w-8 p-0'
                                >
                                  <X size={16} />
                                </Button>
                                <Button
                                  onClick={() => {
                                    return saveInlineEdit(item.id);
                                  }}
                                  variant='ghost'
                                  size='sm'
                                  className='text-green-600 hover:text-green-700 hover:bg-green-50 h-8 w-8 p-0'
                                  disabled={isSubmitting || !inlineEditValues.name.trim()}
                                >
                                  {isSubmitting ? (
                                    <Loader2 size={16} className='animate-spin' />
                                  ) : (
                                    <Check size={16} />
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          // Display mode
                          <div
                            className='cursor-pointer group/item'
                            onClick={() => {
                              return startInlineEdit(item);
                            }}
                          >
                            <div className='flex flex-col'>
                              <span className='text-[#111827] text-base font-semibold group-hover/item:text-black transition-colors'>
                                {item.name}
                              </span>
                              {item.description ? (
                                <p className='text-[#6B7280] text-sm mt-1 leading-relaxed group-hover/item:text-[#4B5563] transition-colors'>
                                  {item.description}
                                </p>
                              ) : (
                                <p className='text-[#9CA3AF] text-sm mt-1 italic group-hover/item:text-[#6B7280] transition-colors'>
                                  Add a description...
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className='flex flex-col items-end'>
                      {!isEditing && (
                        <>
                          <div className='flex flex-col items-end space-y-1'>
                            <span className='text-[#111827] text-sm font-medium bg-green-50 px-3 py-1 rounded-full'>
                              ${item.price}
                            </span>
                            <span className='text-[#111827] text-sm font-medium bg-gray-50 px-3 py-1 rounded-full'>
                              Qty: {item.quantity || '1'}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              return startInlineEdit(item);
                            }}
                            className='text-blue-600 text-xs mt-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 hover:underline'
                          >
                            <PencilLine size={12} />
                            Edit
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {items.length === 0 && (
              <div className='text-center p-10 border-2 border-dashed border-gray-200 rounded-xl bg-white'>
                <div className='flex flex-col items-center justify-center space-y-3'>
                  <div className='rounded-full bg-blue-50 p-3'>
                    <Plus size={24} className='text-blue-600' />
                  </div>
                  <h3 className='text-[#111827] font-medium'>No items yet</h3>
                  <p className='text-[#6B7280] text-sm max-w-[300px]'>
                    Use the buttons above to add items manually or generate them with AI.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <SectionFooter
        onContinue={() => {
          setActiveSection('client');
          showNotification('Moved to Client section');
        }}
        currentSection={1}
        totalSections={3}
      />
    </div>
  );
}
