'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { AlertCircle, Check, FileText, Loader2, Plus, Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import { Textarea } from './ui/textarea';

export default function HomePage() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className='flex min-h-screen items-center justify-center bg-[#FAFAFA]'>
      <div className='text-center'>
        <h1 className='text-3xl font-bold mb-6'>Project Management</h1>
        <p className='text-muted-foreground mb-8 max-w-md mx-auto'>
          Create and manage projects with items, clients, and notes all in one place.
        </p>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size='lg' className='gap-2'>
              <FileText size={18} />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className='max-w-[1200px] w-[95vw] h-[90vh] p-0 overflow-hidden'>
            <ProjectManagement
              onClose={() => {
                return setDialogOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function ProjectManagement({ onClose }) {
  const [activeSection, setActiveSection] = useState('items');
  const [selectedClient, setSelectedClient] = useState('client1');
  const [showAiPrompt, setShowAiPrompt] = useState(false);
  const [aiGeneratedItems, setAiGeneratedItems] = useState([]);
  const [selectedAiItems, setSelectedAiItems] = useState({});
  const [showAddItemForm, setShowAddItemForm] = useState(false);
  const [currentNewItemMode, setCurrentNewItemMode] = useState();
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: '',
  });
  const [items, setItems] = useState([
    {
      id: 'item1',
      name: 'Website Design',
      description: 'Homepage and 5 subpages',
      price: '2,500.00',
    },
    { id: 'item2', name: 'Logo Design', description: '3 concepts with revisions', price: '850.00' },
    {
      id: 'item3',
      name: 'Brand Guidelines',
      description: 'Color palette and typography',
      price: '1,200.00',
    },
  ]);
  const [clients, setClients] = useState([
    { id: 'client1', name: 'Acme Corporation', email: 'contact@acmecorp.com' },
    { id: 'client2', name: 'Globex Industries', email: 'info@globex.com' },
    { id: 'client3', name: 'Stark Enterprises', email: 'tony@stark.com' },
  ]);
  const [notes, setNotes] = useState(
    'Project deadline is end of Q2. Client prefers minimalist design approach.',
  );
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [editingItem, setEditingItem] = useState(null);
  const [deletedItem, setDeletedItem] = useState(null);
  const [showUndoNotification, setShowUndoNotification] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [keyboardShortcutsVisible, setKeyboardShortcutsVisible] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);

  const nameInputRef = { current: null };
  const undoTimeoutRef = { current: null };
  const aiPromptInputRef = { current: null };

  // Calculate total
  const total = items
    .reduce((sum, item) => {
      return sum + Number.parseFloat(item.price.replace(/,/g, ''));
    }, 0)
    .toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  const handleAddItem = () => {
    setShowAddItemForm(true);
    setShowAiPrompt(false);
    setTimeout(() => {
      return nameInputRef.current?.focus();
    }, 10);
  };

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

    setItems((prev) => {
      return [...prev, ...formattedItems];
    });
    setShowAiPrompt(false);
    setAiPrompt('');
    setAiGeneratedItems([]);
    setAiResponse(null);
    setSelectedAiItems({});

    showNotification(
      `Added ${selectedItems.length} item${selectedItems.length > 1 ? 's' : ''}`,
      'success',
    );
  };

  const handleRemoveItem = (id, e) => {
    if (e) {
      e.stopPropagation();
    }

    // Store the deleted item for potential undo
    const itemToDelete = items.find((item) => {
      return item.id === id;
    });
    setDeletedItem(itemToDelete);

    // Remove the item
    setItems(
      items.filter((item) => {
        return item.id !== id;
      }),
    );

    // Show undo notification
    setShowUndoNotification(true);

    // Clear any existing timeout
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
    }

    // Set a timeout to clear the undo option
    undoTimeoutRef.current = setTimeout(() => {
      setShowUndoNotification(false);
      setDeletedItem(null);
    }, 5000);

    showNotification('Item removed', 'info');
  };

  const handleUndoDelete = () => {
    if (deletedItem) {
      setItems((prev) => {
        return [...prev, deletedItem];
      });
      setShowUndoNotification(false);
      setDeletedItem(null);
      if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current);
      }
      showNotification('Item restored', 'success');
    }
  };

  const handleSubmitNewItem = (e) => {
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
      setShowAddItemForm(false);
      setIsSubmitting(false);
      showNotification('Item added successfully');
    }, 300);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setNewItem({
      name: item.name,
      description: item.description,
      price: item.price.replace(/,/g, ''),
    });
  };

  const handleUpdateItem = (e) => {
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
  const handleNameKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      document.getElementById('item-description')?.focus();
    }
  };

  // Handle pressing Enter in the description field to move to price
  const handleDescriptionKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      document.getElementById('item-price')?.focus();
    }
  };

  const toggleAiItemSelection = (id) => {
    setSelectedAiItems((prev) => {
      return {
        ...prev,
        [id]: !prev[id],
      };
    });
  };

  return (
    <div className='flex h-full bg-[#FAFAFA]'>
      {/* Notification */}
      {notification.show && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-md shadow-md flex items-center space-x-2 transition-all duration-300 ease-in-out ${
            notification.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : notification.type === 'error'
              ? 'bg-red-50 text-red-800 border border-red-200'
              : 'bg-blue-50 text-blue-800 border border-blue-200'
          }`}
        >
          {notification.type === 'success' && <Check size={16} className='text-green-500' />}
          {notification.type === 'error' && <AlertCircle size={16} className='text-red-500' />}
          {notification.type === 'info' && <AlertCircle size={16} className='text-blue-500' />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Undo notification */}
      {showUndoNotification && (
        <div className='fixed bottom-4 right-4 z-50 px-4 py-3 bg-gray-800 text-white rounded-md shadow-lg flex items-center space-x-3'>
          <span>Item removed</span>
          <button
            onClick={handleUndoDelete}
            className='text-blue-300 hover:text-blue-200 font-medium'
          >
            Undo
          </button>
          <button
            onClick={() => {
              return setShowUndoNotification(false);
            }}
            className='ml-2 text-gray-400 hover:text-gray-300'
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Left Sidebar */}
      <div className='w-[300px] bg-white p-6 border-r border-[#F3F4F6] flex flex-col'>
        <div className='mb-6'>
          <h1 className='text-xl font-semibold mb-2 text-[#111827]'>New Project</h1>
          <p className='text-[#4B5563] text-sm leading-5'>
            Create new project to help manage items, clients and notes in one place.
          </p>
        </div>

        <div className='space-y-3 flex-grow'>
          <button
            className={`flex items-center w-full text-left p-2 rounded-md ${
              activeSection === 'items' ? 'bg-[#F9FAFB]' : ''
            } hover:bg-[#F9FAFB] transition-colors`}
            onClick={() => {
              return setActiveSection('items');
            }}
          >
            <div
              className={`w-6 h-6 rounded-full ${
                activeSection === 'items' ? 'bg-[#111827]' : 'border border-[#D1D5DB]'
              } flex items-center justify-center mr-3 transition-colors`}
            >
              {activeSection === 'items' ? (
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
              ) : (
                <span className='text-[#6B7280] text-xs'>1</span>
              )}
            </div>
            <span
              className={`text-sm ${
                activeSection === 'items' ? 'text-[#111827] font-medium' : 'text-[#6B7280]'
              }`}
            >
              Items
            </span>
          </button>

          <button
            className={`flex items-center w-full text-left p-2 rounded-md ${
              activeSection === 'client' ? 'bg-[#F9FAFB]' : ''
            } hover:bg-[#F9FAFB] transition-colors`}
            onClick={() => {
              return setActiveSection('client');
            }}
          >
            <div
              className={`w-6 h-6 rounded-full ${
                activeSection === 'client' ? 'bg-[#111827]' : 'border border-[#D1D5DB]'
              } flex items-center justify-center mr-3 transition-colors`}
            >
              {activeSection === 'client' ? (
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
              ) : (
                <span className='text-[#6B7280] text-xs'>2</span>
              )}
            </div>
            <span
              className={`text-sm ${
                activeSection === 'client' ? 'text-[#111827] font-medium' : 'text-[#6B7280]'
              }`}
            >
              Client
            </span>
          </button>

          <button
            className={`flex items-center w-full text-left p-2 rounded-md ${
              activeSection === 'comments' ? 'bg-[#F9FAFB]' : ''
            } hover:bg-[#F9FAFB] transition-colors`}
            onClick={() => {
              return setActiveSection('comments');
            }}
          >
            <div
              className={`w-6 h-6 rounded-full ${
                activeSection === 'comments' ? 'bg-[#111827]' : 'border border-[#D1D5DB]'
              } flex items-center justify-center mr-3 transition-colors`}
            >
              {activeSection === 'comments' ? (
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
              ) : (
                <span className='text-[#6B7280] text-xs'>3</span>
              )}
            </div>
            <span
              className={`text-sm ${
                activeSection === 'comments' ? 'text-[#111827] font-medium' : 'text-[#6B7280]'
              }`}
            >
              Comments
            </span>
          </button>
        </div>

        {/* Total at bottom of sidebar */}
        <div className='mt-auto pt-6 border-t border-[#E5E7EB]'>
          <div className='flex justify-between items-center mb-3'>
            <span className='text-[#6B7280] text-sm'>Total</span>
            <span className='text-[#111827] text-base font-medium'>${total}</span>
          </div>
          <div className='flex items-center'>
            <span className='text-[#6B7280] text-xs'>project.example.com/acme-corp</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='flex-1 flex flex-col h-full overflow-hidden'>
        {activeSection === 'items' && (
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
                        return setCurrentNewItemMode(null);
                      }
                      return setCurrentNewItemMode('manual');
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
                        return setCurrentNewItemMode(null);
                      }
                      return setCurrentNewItemMode('ai');
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
                          ref={(el) => {
                            nameInputRef.current = el;
                            return undefined;
                          }}
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
                              setShowAddItemForm(false);
                              setEditingItem(null);
                              setNewItem({ name: '', description: '', price: '' });
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
                          ref={(el) => {
                            aiPromptInputRef.current = el;
                            return undefined;
                          }}
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
                          {isGenerating ? (
                            <Loader2 size={16} className='animate-spin' />
                          ) : (
                            'Generate'
                          )}
                        </Button>
                      </div>
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
                                          <span className='font-medium'>Reasoning:</span>{' '}
                                          {item.reasoning}
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
                            <span>
                              Processing time: {aiResponse.meta.processingTime.toFixed(2)}s
                            </span>
                            <span>
                              Generated: {new Date(aiResponse.meta.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        )}

                        <div className='flex justify-end pt-2'>
                          <button
                            onClick={() => {
                              setShowAiPrompt(false);
                              setAiPrompt('');
                              setAiGeneratedItems([]);
                              setAiResponse(null);
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
                            <span className='text-[#111827] text-sm font-medium'>
                              ${item.price}
                            </span>
                            <span className='text-[#9CA3AF] text-xs mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity'>
                              Click to edit
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className='absolute bottom-0 left-0 right-0 flex items-center justify-between py-4 border-t border-[#E5E7EB] px-8 bg-[#FAFAFA] z-10'>
              <Button
                onClick={() => {
                  setActiveSection('client');
                  showNotification('Moved to Client section');
                }}
              >
                Continue
              </Button>
              <div className='flex items-center text-[#6B7280] text-xs'>
                <span>press</span>
                <span className='mx-1 px-1 border border-[#D1D5DB] rounded text-[11px]'>Enter</span>
                <span className='ml-0.5'>↵</span>
              </div>
              <div className='flex items-center'>
                <div className='w-4 h-4 rounded-full border-2 border-[#D1D5DB] border-t-[#6B7280] animate-spin mr-2'></div>
                <span className='text-[#6B7280] text-xs'>1/3 steps</span>
              </div>
            </div>
          </div>
        )}

        {/* Client Section */}
        {activeSection === 'client' && (
          <div className='flex flex-col h-full relative'>
            <div className='absolute inset-0 pt-6 px-8 pb-16 overflow-y-auto'>
              <div className='mb-8'>
                <div className='flex justify-between items-center mb-4'>
                  <h2 className='text-lg font-semibold text-[#111827]'>Select Client</h2>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => {
                      return showNotification('Draft saved', 'success');
                    }}
                  >
                    Save as draft
                  </Button>
                </div>
                <p className='text-[#6B7280] text-sm leading-5 mb-6'>
                  Choose an existing client or create a new one for this project.
                </p>

                <div className='space-y-4'>
                  {clients.map((client) => {
                    return (
                      <div
                        key={client.id}
                        className={`border ${
                          selectedClient === client.id ? 'border-[#111827]' : 'border-[#E5E7EB]'
                        } rounded-md p-4 cursor-pointer hover:border-[#111827] transition-colors`}
                        onClick={() => {
                          setSelectedClient(client.id);
                          showNotification(`Selected ${client.name}`, 'info');
                        }}
                      >
                        <div className='flex items-center'>
                          <div className='w-8 h-8 rounded-full bg-[#EDE9FE] flex items-center justify-center mr-3'>
                            <span className='text-[#5B21B6] text-sm font-medium'>
                              {client.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className='text-[#111827] text-sm font-medium'>{client.name}</div>
                            <div className='text-[#6B7280] text-xs'>{client.email}</div>
                          </div>
                          {selectedClient === client.id && (
                            <div className='ml-auto w-6 h-6 rounded-full bg-[#10B981] flex items-center justify-center'>
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
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  <button
                    className='flex items-center border border-[#E5E7EB] rounded-md p-4 w-full hover:bg-[#F9FAFB] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200'
                    onClick={() => {
                      return showNotification('Client creation coming soon', 'info');
                    }}
                  >
                    <svg
                      width='20'
                      height='20'
                      viewBox='0 0 20 20'
                      fill='none'
                      xmlns='http://www.w3.org/2000/svg'
                      className='mr-3'
                    >
                      <path
                        d='M10 4.16666V15.8333M4.16667 10H15.8333'
                        stroke='#6B7280'
                        strokeWidth='1.5'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                    </svg>
                    <span className='text-[#6B7280] text-sm'>Create new client</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className='absolute bottom-0 left-0 right-0 flex items-center justify-between py-4 border-t border-[#E5E7EB] px-8 bg-[#FAFAFA] z-10'>
              <Button
                onClick={() => {
                  setActiveSection('comments');
                  showNotification('Moved to Comments section');
                }}
              >
                Continue
              </Button>
              <div className='flex items-center text-[#6B7280] text-xs'>
                <span>press</span>
                <span className='mx-1 px-1 border border-[#D1D5DB] rounded text-[11px]'>Enter</span>
                <span className='ml-0.5'>↵</span>
              </div>
              <div className='flex items-center'>
                <div className='w-4 h-4 rounded-full border-2 border-[#D1D5DB] border-t-[#6B7280] animate-spin mr-2'></div>
                <span className='text-[#6B7280] text-xs'>2/3 steps</span>
              </div>
            </div>
          </div>
        )}

        {/* Comments Section */}
        {activeSection === 'comments' && (
          <div className='flex flex-col h-full relative'>
            <div className='absolute inset-0 pt-6 px-8 pb-16 overflow-y-auto'>
              <div className='mb-8'>
                <div className='flex justify-between items-center mb-4'>
                  <h2 className='text-lg font-semibold text-[#111827]'>Project Notes</h2>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => {
                      return showNotification('Draft saved', 'success');
                    }}
                  >
                    Save as draft
                  </Button>
                </div>
                <p className='text-[#6B7280] text-sm leading-5 mb-6'>
                  Add any additional notes or comments about this project.
                </p>

                <div className='space-y-4'>
                  <div className='border border-[#E5E7EB] rounded-md p-4'>
                    <label className='block text-[#111827] font-medium text-sm mb-2'>
                      Project Notes
                    </label>
                    <textarea
                      className='w-full min-h-[120px] border border-[#E5E7EB] rounded-md p-3 text-sm outline-none focus:border-[#9CA3AF] transition-colors bg-transparent'
                      value={notes}
                      onChange={(e) => {
                        return setNotes(e.target.value);
                      }}
                      placeholder='Add any notes or comments about this project...'
                    />
                  </div>

                  <div className='border border-[#E5E7EB] rounded-md p-4'>
                    <label className='block text-[#111827] font-medium text-sm mb-2'>
                      Project Settings
                    </label>

                    <div className='space-y-3'>
                      <div className='flex items-center'>
                        <input
                          type='checkbox'
                          id='setting1'
                          className='w-4 h-4 rounded-sm border-[#D1D5DB] mr-2'
                        />
                        <label htmlFor='setting1' className='text-[#111827] text-sm'>
                          Send client notifications
                        </label>
                      </div>

                      <div className='flex items-center'>
                        <input
                          type='checkbox'
                          id='setting2'
                          className='w-4 h-4 rounded-sm border-[#D1D5DB] mr-2'
                          defaultChecked
                        />
                        <label htmlFor='setting2' className='text-[#111827] text-sm'>
                          Track time spent on project
                        </label>
                      </div>

                      <div className='flex items-center'>
                        <input
                          type='checkbox'
                          id='setting3'
                          className='w-4 h-4 rounded-sm border-[#D1D5DB] mr-2'
                        />
                        <label htmlFor='setting3' className='text-[#111827] text-sm'>
                          Make project private
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className='absolute bottom-0 left-0 right-0 flex items-center justify-between py-4 border-t border-[#E5E7EB] px-8 bg-[#FAFAFA] z-10'>
              <div className='flex gap-3'>
                <Button variant='outline' onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    showNotification('Project completed successfully!', 'success');
                    setTimeout(() => {
                      return onClose();
                    }, 1500);
                  }}
                >
                  Complete Project
                </Button>
              </div>
              <div className='flex items-center text-[#6B7280] text-xs'>
                <span>press</span>
                <span className='mx-1 px-1 border border-[#D1D5DB] rounded text-[11px]'>Enter</span>
                <span className='ml-0.5'>↵</span>
              </div>
              <div className='flex items-center'>
                <div className='w-4 h-4 rounded-full border-2 border-[#D1D5DB] border-t-[#6B7280] animate-spin mr-2'></div>
                <span className='text-[#6B7280] text-xs'>3/3 steps</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
