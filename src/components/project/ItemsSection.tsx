'use client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Loader2, Mic, Paperclip, Plus, Sparkles, X } from 'lucide-react';
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
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [aiResponse, setAiResponse] = useState<any>(null);
  const [keyboardShortcutsVisible, setKeyboardShortcutsVisible] = useState(false);

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
      };

      setItems([...items, newItemObj]);
      setNewItem({ name: '', description: '', price: '' });
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
            }
          : item;
      });

      setItems(updatedItems);
      setNewItem({ name: '', description: '', price: '' });
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

  return (
    <div className='flex flex-col h-full relative'>
      <div className='absolute inset-0 pt-6 px-8 pb-16 overflow-y-auto'>
        <div className='mb-8'>
          <div className='flex justify-between items-center mb-4'>
            <h2 className='text-lg font-semibold text-[#111827]'>Project Items</h2>
          </div>

          <p className='text-[#6B7280] text-sm leading-5 mb-6'>
            Add items to your project. Include name, description, and price for each item.
            <button
              onClick={() => {
                return setKeyboardShortcutsVisible(true);
              }}
              className='ml-1 text-[#111827] hover:underline focus:outline-none focus:underline'
              aria-label='View keyboard shortcuts'
            >
              View shortcuts
            </button>
          </p>

          {/* Action Buttons */}
          <div className='flex space-x-3 mb-6'>
            <Button
              onClick={() => {
                if (currentNewItemMode === 'manual') {
                  return setCurrentNewItemMode('');
                }
                setCurrentNewItemMode('manual');
                setTimeout(() => {
                  return nameInputRef.current?.focus();
                }, 10);
              }}
              className={cn(
                'flex-1 flex items-center justify-center',
                currentNewItemMode === 'manual' &&
                  'bg-[#111827] text-white hover:bg-[#111827] hover:text-white',
              )}
              variant='outline'
            >
              <Plus size={16} className='mr-2' />
              <span>Add Item Manually</span>
            </Button>
            <Button
              onClick={() => {
                // unfocus to null if it is ai already
                if (currentNewItemMode === 'ai') {
                  return setCurrentNewItemMode('');
                }
                setCurrentNewItemMode('ai');
                setTimeout(() => {
                  return aiPromptInputRef.current?.focus();
                }, 10);
              }}
              className={cn(
                'flex-1 flex items-center justify-center',
                currentNewItemMode === 'ai' &&
                  'bg-[#111827] text-white hover:bg-[#111827] hover:text-white',
              )}
              variant='outline'
            >
              <Sparkles size={16} className='mr-2' />
              <span>Generate with AI</span>
            </Button>
          </div>

          {/* Add Item Form */}
          {currentNewItemMode === 'manual' && (
            <div className='border border-[#E5E7EB] rounded-lg p-4 mb-6 transition-all duration-200 ease-in-out bg-white shadow-sm'>
              <form
                onSubmit={editingItem ? handleUpdateItem : handleSubmitNewItem}
                className='space-y-3'
              >
                <div>
                  <input
                    type='text'
                    id='item-name'
                    ref={nameInputRef}
                    value={newItem.name}
                    onChange={(e) => {
                      return setNewItem({ ...newItem, name: e.target.value });
                    }}
                    onKeyDown={handleNameKeyDown}
                    placeholder='Item name'
                    className='w-full border-b border-[#E5E7EB] pb-2 text-base font-medium text-[#111827] outline-none placeholder:text-[#9CA3AF] focus:border-[#9CA3AF] transition-colors bg-transparent'
                    autoFocus
                    aria-label='Item name'
                  />
                </div>
                <div>
                  <textarea
                    id='item-description'
                    value={newItem.description}
                    onChange={(e) => {
                      return setNewItem({ ...newItem, description: e.target.value });
                    }}
                    onKeyDown={handleDescriptionKeyDown}
                    placeholder='Item description (optional)'
                    className='w-full border-none text-sm text-[#6B7280] outline-none resize-none min-h-[40px] placeholder:text-[#9CA3AF] bg-transparent'
                    aria-label='Item description'
                  />
                </div>
                <div className='flex items-center justify-between pt-1'>
                  <div className='relative'>
                    <span className='absolute left-0 top-[2px] text-[#6B7280]'>$</span>
                    <input
                      type='number'
                      id='item-price'
                      step='0.01'
                      min='0'
                      value={newItem.price}
                      onChange={(e) => {
                        return setNewItem({ ...newItem, price: e.target.value });
                      }}
                      placeholder='0.00'
                      className='border-none text-sm text-[#111827] outline-none w-[100px] pl-3 bg-transparent'
                      aria-label='Item price'
                    />
                  </div>
                  <div className='flex space-x-3'>
                    <button
                      type='button'
                      onClick={() => {
                        setEditingItem(null);
                        setNewItem({ name: '', description: '', price: '' });
                        setCurrentNewItemMode('');
                      }}
                      className='text-[#6B7280] text-sm hover:text-[#111827] transition-colors'
                    >
                      Cancel
                    </button>
                    <button
                      type='submit'
                      className='bg-[#111827] text-white px-4 py-1.5 rounded-md text-sm hover:bg-[#1F2937] transition-colors flex items-center justify-center min-w-[60px]'
                      disabled={!newItem.name.trim() || isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 size={14} className='animate-spin' />
                      ) : editingItem ? (
                        'Update'
                      ) : (
                        'Add'
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* AI Prompt Form */}
          {currentNewItemMode === 'ai' && (
            <div className='border border-[#E5E7EB] rounded-lg p-4 mb-6 bg-white shadow-sm'>
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
                    className='flex-1 border border-[#E5E7EB] rounded-l-md px-3 py-2 text-sm outline-none bg-transparent focus:border-[#9CA3AF] transition-colors'
                    autoFocus
                  />
                  <Button
                    onClick={handleGenerateAiItems}
                    className='bg-[#111827] text-white px-4 py-2 text-sm hover:bg-[#1F2937] transition-colors flex items-center justify-center min-w-[100px] absolute right-2 bottom-2 cursor-pointer z-10'
                    disabled={!aiPrompt.trim() || isGenerating}
                  >
                    {isGenerating ? <Loader2 size={16} className='animate-spin' /> : 'Generate'}
                  </Button>
                </div>

                {/* Voice and attachment controls */}
                <div className='flex mt-2 items-center'>
                  <div className='flex space-x-2'>
                    <button
                      onClick={toggleRecording}
                      className={`p-2 rounded-full flex items-center justify-center ${
                        isRecording ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                      } hover:bg-gray-200 transition-colors`}
                      title={isRecording ? 'Stop recording' : 'Record voice note'}
                    >
                      <Mic size={16} className={isRecording ? 'animate-pulse' : ''} />
                    </button>

                    <label className='p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer flex items-center justify-center'>
                      <Paperclip size={16} />
                      <input
                        type='file'
                        multiple
                        className='hidden'
                        onChange={handleFileAttachment}
                        accept='image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                      />
                    </label>
                  </div>

                  {isRecording && (
                    <div className='ml-2 flex items-center'>
                      <div className='w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse'></div>
                      <span className='text-xs text-gray-500'>Recording {recordingDuration}s</span>
                    </div>
                  )}

                  <div className='flex-1'></div>

                  <div className='text-xs text-gray-500'>
                    {attachments.length > 0 &&
                      `${attachments.length} attachment${attachments.length !== 1 ? 's' : ''}`}
                  </div>
                </div>

                {/* Attachments display */}
                {attachments.length > 0 && (
                  <div className='mt-3 space-y-2 border-t border-gray-100 pt-2'>
                    {attachments.map((attachment) => {
                      return (
                        <div
                          key={attachment.id}
                          className='flex items-center justify-between bg-gray-50 rounded px-3 py-2 text-xs'
                        >
                          <div className='flex items-center'>
                            {attachment.type === 'voice' ? (
                              <Mic size={14} className='mr-2 text-blue-500' />
                            ) : (
                              <Paperclip size={14} className='mr-2 text-blue-500' />
                            )}
                            <span className='text-gray-700'>{attachment.name}</span>
                          </div>
                          <button
                            onClick={() => {
                              return removeAttachment(attachment.id);
                            }}
                            className='text-gray-400 hover:text-gray-600'
                          >
                            <X size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                <p className='text-[#6B7280] text-xs mt-2'>
                  Example: &quot;Client needs a red turtle hoodie for $15 and a black regular
                  shirt&quot;
                </p>
              </div>

              {isGenerating && (
                <div className='flex flex-col items-center justify-center py-8'>
                  <Loader2 size={24} className='text-[#111827] animate-spin mb-4' />
                  <p className='text-[#6B7280] text-sm'>
                    Generating items based on your description...
                  </p>
                </div>
              )}

              {!isGenerating && aiGeneratedItems.length > 0 && (
                <div className='space-y-4'>
                  <div className='flex justify-between items-center'>
                    <h3 className='text-base font-medium text-[#111827]'>Generated Items</h3>
                    <div className='flex space-x-2'>
                      <button
                        onClick={() => {
                          setAiPrompt('');
                          setAiGeneratedItems([]);
                          setAiResponse(null);
                        }}
                        className='text-[#6B7280] text-sm hover:text-[#111827] transition-colors'
                      >
                        Clear
                      </button>
                      <button
                        onClick={handleGenerateAiItems}
                        className='text-[#6B7280] text-sm hover:text-[#111827] transition-colors flex items-center'
                      >
                        <Sparkles size={14} className='mr-1' />
                        Regenerate
                      </button>
                    </div>
                  </div>

                  <div className='space-y-3 max-h-[320px] overflow-y-auto pr-2'>
                    {aiGeneratedItems.map((item) => {
                      return (
                        <div
                          key={item.id}
                          className={`border ${
                            selectedAiItems[item.id] ? 'border-[#111827]' : 'border-[#E5E7EB]'
                          } rounded-lg p-4 transition-all duration-200 ease-in-out hover:border-[#D1D5DB] bg-white cursor-pointer`}
                          onClick={() => {
                            return toggleAiItemSelection(item.id);
                          }}
                        >
                          <div className='flex items-start'>
                            <div
                              className={`w-[18px] h-[18px] rounded-[4px] border ${
                                selectedAiItems[item.id]
                                  ? 'bg-[#111827] border-[#111827]'
                                  : 'border-[#D1D5DB]'
                              } flex items-center justify-center mr-3 mt-[2px]`}
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
                            <div className='flex-1'>
                              <div className='flex justify-between items-start'>
                                <div>
                                  <span className='text-[#111827] text-base font-medium'>
                                    {item.name}
                                  </span>
                                  <span className='ml-2 text-xs px-2 py-0.5 bg-[#F3F4F6] rounded-full'>
                                    {item.type}
                                  </span>
                                </div>
                                <span className='text-[#111827] text-sm font-medium'>
                                  ${item.price}
                                </span>
                              </div>
                              {item.description && (
                                <p className='text-[#6B7280] text-sm mt-1 leading-relaxed'>
                                  {item.description}
                                </p>
                              )}
                              {item.reasoning && (
                                <div className='mt-2 pt-2 border-t border-[#F3F4F6]'>
                                  <p className='text-[#6B7280] text-xs italic'>
                                    <span className='font-medium'>Reasoning:</span> {item.reasoning}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
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

                  <div className='flex justify-end pt-2'>
                    <button
                      onClick={() => {
                        setAiPrompt('');
                        setAiGeneratedItems([]);
                        setAiResponse(null);
                        setCurrentNewItemMode('');
                      }}
                      className='text-[#6B7280] text-sm hover:text-[#111827] transition-colors mr-3'
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddSelectedAiItems}
                      className='bg-[#111827] text-white px-4 py-2 rounded-md text-sm hover:bg-[#1F2937] transition-colors flex items-center'
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
              )}
            </div>
          )}

          {/* Item Cards */}
          <div className='space-y-3'>
            {items.map((item) => {
              return (
                <div
                  key={item.id}
                  className='border border-[#E5E7EB] rounded-lg p-4 transition-all duration-200 ease-in-out hover:border-[#D1D5DB] group bg-white shadow-sm hover:shadow-md hover:translate-y-[-1px]'
                >
                  <div className='flex justify-between items-start'>
                    <div className='flex items-start flex-1'>
                      <button
                        onClick={(e) => {
                          return handleRemoveItem(item.id, e);
                        }}
                        className='mr-3 mt-1 text-[#D1D5DB] hover:text-[#6B7280] transition-colors group-hover:opacity-100 opacity-60 focus:outline-none focus:text-[#6B7280] h-5 w-5 flex items-center justify-center rounded-full hover:bg-[#F3F4F6]'
                        aria-label={`Remove ${item.name}`}
                      >
                        <svg
                          width='16'
                          height='16'
                          viewBox='0 0 20 20'
                          fill='none'
                          xmlns='http://www.w3.org/2000/svg'
                          className='transition-transform group-hover:scale-110'
                        >
                          <path
                            d='M5 10H15'
                            stroke='currentColor'
                            strokeWidth='1.5'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                          />
                        </svg>
                      </button>
                      <div
                        className='flex-1 cursor-pointer group/item'
                        onClick={() => {
                          return handleEditItem(item);
                        }}
                      >
                        <div className='flex flex-col'>
                          <span className='text-[#111827] text-base font-medium group-hover/item:text-black transition-colors'>
                            {item.name}
                          </span>
                          {item.description && (
                            <p className='text-[#6B7280] text-sm mt-1 leading-relaxed group-hover/item:text-[#4B5563] transition-colors'>
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className='flex flex-col items-end'>
                      <span className='text-[#111827] text-sm font-medium'>${item.price}</span>
                      <span className='text-[#9CA3AF] text-xs mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity'>
                        Click to edit
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {items.length === 0 && (
              <div className='text-[#6B7280] text-sm text-center'>No items added yet</div>
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
