'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { newRequest } from '@/utils/newRequest';
import { DialogTitle } from '@radix-ui/react-dialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { Info, Send, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { LineItemCard } from './LineItemCard';

interface LineItem {
  name: string;
  description: string;
  price: string;
  type: string;
  qty: number;
  reasoning: string;
  discount?: string;
  taxName?: string;
  taxRate?: string;
}

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  meta?: {
    confidence?: number;
    reasoning?: string;
    processingTime?: number;
  };
  structuredData?: {
    type: 'LINE_ITEMS' | 'INVOICE_CLIENT' | 'SELECT_EXISTING_CLIENT';
    items?: LineItem[];
    client?: {
      user: string;
      contact: string;
      phone?: string;
      address: string;
      shippingAddress: string;
      taxId: string;
      accountNumber: string;
      fax?: string;
      mobile?: string;
      tollFree?: string;
      website?: string;
      internalNotes?: string;
      customFields?: Record<string, string>;
    };
    action?: () => void;
    suggestions?: string[];
  }[];
}

interface RightSidebarProps {
  setItems: React.Dispatch<React.SetStateAction<any[]>>;
  projectCurrency: string;
  setSelectedClient: (clientId: string) => void;
  onAiGeneratedClient?: (clientData: any) => void;
}

export default function RightSidebar({
  setItems,
  projectCurrency,
  setSelectedClient,
  onAiGeneratedClient,
}: RightSidebarProps) {
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! How can I help you today?',
      role: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Focus input when component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const previousMessages = messages.filter((m) => {
        return m.role !== 'assistant' || m.content !== 'Hello! How can I help you today?';
      });

      const requestBody = {
        prompt: message,
        history:
          previousMessages.length > 1
            ? previousMessages
                .slice(0, -1)
                .map((m) => {
                  return `${m.role === 'user' ? 'Human' : 'AI'}: ${m.content}`;
                })
                .join('\n\n')
            : '',
      };

      const response = await newRequest.post('/ai/smart-response', requestBody);
      return response.data;
    },
    onSuccess: (data) => {
      const assistantMessage: Message = {
        id: Date.now().toString(),
        content: data.message,
        role: 'assistant',
        timestamp: new Date(),
        meta: {
          confidence: data.confidence,
          reasoning: data.reasoning,
          processingTime: data.meta?.processingTime,
        },
        structuredData: data.structuredData,
      };
      setMessages((prev) => {
        return [...prev, assistantMessage];
      });
      inputRef.current?.focus();
    },
    onError: (error) => {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages((prev) => {
        return [...prev, errorMessage];
      });
      inputRef.current?.focus();
    },
  });

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => {
      return [...prev, newMessage];
    });
    setInput('');
    chatMutation.mutate(input);
  };

  const handleClear = () => {
    setMessages([
      {
        id: '1',
        content: 'Hello! How can I help you today?',
        role: 'assistant',
        timestamp: new Date(),
      },
    ]);
  };

  const handleAddItem = (item: LineItem) => {
    // Format the item to match the expected structure
    const formattedItem = {
      id: `item-${Date.now()}`,
      name: item.name,
      description: item.description,
      price: item.price,
      quantity: item.qty.toString(),
      currency: projectCurrency,
      type: item.type,
      taxRate: item.taxRate ? parseFloat(item.taxRate) : 0,
      discount: item.discount ? parseFloat(item.discount) : 0,
      taxable: item.taxRate ? parseFloat(item.taxRate) > 0 : true,
      taxName: item.taxName || 'Standard Tax',
    };

    // Add the item to the items array
    setItems((prev) => {
      return [...prev, formattedItem];
    });

    // Show success notification
  };

  const handleAddClient = async (clientData: any) => {
    try {
      const response = await newRequest.post('/clients', clientData);
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      const clientId = response.data.data;
      console.log('🚀 clientId:', clientId);
      setSelectedClient(clientId);
      setMessages((prev) => {
        return [
          ...prev,
          {
            id: Date.now().toString(),
            content: '✅ Client added successfully!',
            role: 'assistant',
            timestamp: new Date(),
          },
          {
            id: (Date.now() + 1).toString(),
            content: 'Now you can proceed with creating an invoice for this client.',
            role: 'assistant',
            timestamp: new Date(),
          },
        ];
      });
    } catch (error: any) {
      console.log('🚀 error:', error);
      console.error('API Error:', error.response?.data);
      if (
        error.response?.data?.status === 'fail' &&
        error.response?.data?.message?.includes('email already exists')
      ) {
        const email = error.response.data.message.split('"')[1];
        setMessages((prev) => {
          return [
            ...prev,
            {
              id: Date.now().toString(),
              content: `⚠️ A client with email ${email} already exists.`,
              role: 'assistant',
              timestamp: new Date(),
            },
          ];
        });
        return;
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            setImages((prev) => {
              return [...prev, event.target?.result as string];
            });
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  return (
    <div className='h-full bg-[#141414] border-l border-[#232428] flex flex-col'>
      {/* Header */}
      <div className='px-6 py-4 border-b border-[#232428] flex-shrink-0'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2.5'>
            <Sparkles className='w-4 h-4 text-[#8b5df8]' />
            <h2 className='text-base font-medium text-[#fafafa] tracking-tight'>AI Assistant</h2>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <ScrollArea className='flex-1 min-h-0'>
        <div className='px-5 py-4 space-y-4'>
          <div className='flex justify-end'>
            <Button
              onClick={handleClear}
              variant='ghost'
              size='icon'
              className='h-8 w-8 text-[#8C8C8C] hover:text-[#fafafa] hover:bg-[#232428]'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='16'
                height='16'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <path d='M3 6h18' />
                <path d='M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6' />
                <path d='M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2' />
              </svg>
            </Button>
          </div>
          <AnimatePresence>
            {messages.map((message, index) => {
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className={message.role === 'assistant' ? 'max-w-[85%]' : 'max-w-[85%] ml-auto'}
                >
                  {message.role === 'assistant' ? (
                    <div className='space-y-3'>
                      <div className='text-sm text-[#fafafa] leading-relaxed bg-[#232428] rounded-lg px-4 py-3'>
                        <div className='flex items-start gap-2'>
                          <div className='flex-1'>{message.content}</div>
                          {message.meta && (
                            <TooltipProvider delayDuration={0}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button className='text-[#8C8C8C] hover:text-[#fafafa] transition-colors'>
                                    <Info className='w-4 h-4' />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent className='max-w-[300px] p-3 bg-[#141414] border-[#232428] text-[#fafafa]'>
                                  <div className='space-y-2 text-xs'>
                                    {message.meta.confidence && (
                                      <div>
                                        <span className='font-medium'>Confidence:</span>{' '}
                                        {(message.meta.confidence * 100).toFixed(1)}%
                                      </div>
                                    )}
                                    {message.meta.reasoning && (
                                      <div>
                                        <span className='font-medium'>Reasoning:</span>{' '}
                                        {message.meta.reasoning}
                                      </div>
                                    )}
                                    {message.meta.processingTime && (
                                      <div>
                                        <span className='font-medium'>Processing Time:</span>{' '}
                                        {message.meta.processingTime.toFixed(2)}s
                                      </div>
                                    )}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </div>

                      {/* Line Items */}
                      {message.structuredData?.map((data, dataIndex) => {
                        return (
                          <>
                            {data.type === 'LINE_ITEMS' && (
                              <div key={`line-items-${dataIndex}`} className='space-y-2 pl-2'>
                                {data.items.map((item, itemIndex) => {
                                  return (
                                    <TooltipProvider key={itemIndex}>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <div>
                                            <LineItemCard item={item} onClick={handleAddItem} />
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent className='bg-[#141414] border-[#232428] text-[#fafafa]'>
                                          <p className='text-xs'>
                                            Click to add another instance of this item
                                          </p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  );
                                })}
                              </div>
                            )}
                            {data.type === 'INVOICE_CLIENT' && (
                              <div key={`client-${dataIndex}`} className='space-y-2 pl-2'>
                                <div className='bg-[#232428] rounded-lg border border-[#232428] p-4 space-y-3'>
                                  <div className='space-y-1'>
                                    <h4 className='font-medium text-[#fafafa]'>
                                      {data.client.user}
                                    </h4>
                                    <p className='text-sm text-[#8C8C8C]'>{data.client.contact}</p>
                                    {data.client.phone && (
                                      <p className='text-sm text-[#8C8C8C]'>{data.client.phone}</p>
                                    )}
                                    {data.client.address && (
                                      <p className='text-sm text-[#8C8C8C]'>
                                        {data.client.address}
                                      </p>
                                    )}
                                  </div>
                                  <div className='pt-2'>
                                    <Button
                                      variant='outline'
                                      size='sm'
                                      className='w-full border-[#232428] text-[#fafafa] hover:bg-[#232428]'
                                      onClick={() => {
                                        // Handle adding client
                                        const clientData = {
                                          user: {
                                            name: data.client.user,
                                            email: data.client.contact,
                                          },
                                          phone: data.client.phone,
                                          address: {
                                            street: data.client.address.split(', ')[0],
                                            city: data.client.address.split(', ')[1],
                                            state: data.client.address.split(', ')[2],
                                            country: data.client.address.split(', ')[3],
                                            zip: data.client.address.split(', ')[4],
                                          },
                                          shippingAddress: {
                                            street: data.client.shippingAddress.split(', ')[0],
                                            city: data.client.shippingAddress.split(', ')[1],
                                            state: data.client.shippingAddress.split(', ')[2],
                                            country: data.client.shippingAddress.split(', ')[3],
                                            zip: data.client.shippingAddress.split(', ')[4],
                                          },
                                          taxId: data.client.taxId,
                                          accountNumber: data.client.accountNumber,
                                          fax: data.client.fax,
                                          mobile: data.client.mobile,
                                          tollFree: data.client.tollFree,
                                          website: data.client.website,
                                          internalNotes: data.client.internalNotes,
                                          customFields: data.client.customFields || {},
                                        };
                                        handleAddClient(clientData);
                                      }}
                                    >
                                      Add Client
                                    </Button>
                                  </div>
                                  {data.suggestions && data.suggestions.length > 0 && (
                                    <div className='mt-3 pt-3 border-t border-[#232428]'>
                                      <h5 className='text-xs font-medium text-[#8C8C8C] mb-2'>
                                        Suggestions
                                      </h5>
                                      <ul className='space-y-1'>
                                        {data.suggestions.map((suggestion, index) => {
                                          return (
                                            <li key={index} className='text-xs text-[#8C8C8C]'>
                                              • {suggestion}
                                            </li>
                                          );
                                        })}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </>
                        );
                      })}
                    </div>
                  ) : (
                    <div className='rounded-lg px-4 py-3 bg-[#232428] text-[#fafafa] shadow-sm'>
                      <p className='text-sm leading-relaxed'>{message.content}</p>
                      <p className='text-xs text-[#8C8C8C] mt-1.5'>
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  )}
                </motion.div>
              );
            })}
            {chatMutation.isPending && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className='max-w-[85%]'
              >
                <div className='text-sm text-[#fafafa] leading-relaxed bg-[#232428] rounded-lg px-4 py-3'>
                  <div className='flex items-center gap-2'>
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      className='w-2 h-2 bg-[#8b5df8] rounded-full'
                    />
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: 0.2,
                      }}
                      className='w-2 h-2 bg-[#8b5df8] rounded-full'
                    />
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: 0.4,
                      }}
                      className='w-2 h-2 bg-[#8b5df8] rounded-full'
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className='p-4 flex-shrink-0'>
        <div className='relative'>
          {images.length > 0 && (
            <div className='flex gap-2 mb-2'>
              {images.map((img, idx) => {
                return (
                  <div key={idx} className='relative'>
                    <img
                      src={img}
                      alt={`pasted-${idx}`}
                      className='w-16 h-16 object-cover rounded cursor-pointer'
                      onClick={() => {
                        setPreviewImage(img);
                        setIsDialogOpen(true);
                      }}
                    />
                    <button
                      type='button'
                      className='absolute -top-2 -right-2 w-4 h-4 flex items-center justify-center bg-[#232428] rounded-full text-[#fafafa] shadow-md hover:bg-[#2A2A2F] transition'
                      onClick={() => {
                        return setImages(
                          images.filter((_, i) => {
                            return i !== idx;
                          }),
                        );
                      }}
                      aria-label='Remove image'
                    >
                      <svg
                        width='10'
                        height='10'
                        viewBox='0 0 16 16'
                        fill='none'
                        xmlns='http://www.w3.org/2000/svg'
                      >
                        <path
                          d='M4 4L12 12'
                          stroke='currentColor'
                          strokeWidth='2'
                          strokeLinecap='round'
                        />
                        <path
                          d='M12 4L4 12'
                          stroke='currentColor'
                          strokeWidth='2'
                          strokeLinecap='round'
                        />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => {
              return setInput(e.target.value);
            }}
            onKeyPress={(e) => {
              return e.key === 'Enter' && !e.shiftKey && handleSend();
            }}
            onPaste={handlePaste}
            placeholder='Type your message...'
            disabled={chatMutation.isPending}
            className='w-full px-4 py-3 text-sm border border-[#232428] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5df8]/20 focus:border-[#8b5df8] min-h-[72px] resize-none transition-colors duration-200 placeholder:text-[#8C8C8C] disabled:opacity-50 disabled:cursor-not-allowed bg-[#141414] text-[#fafafa]'
          />
          <Button
            onClick={handleSend}
            disabled={chatMutation.isPending || !input.trim()}
            className='absolute bottom-4 right-2 bg-[#8b5df8] hover:bg-[#7c3aed] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
            size='icon'
          >
            <Send className='w-3.5 h-3.5' />
          </Button>
        </div>
      </div>

      {/* Image Preview Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className='flex items-center justify-center bg-[#141414] border-[#232428]'>
          <DialogTitle className='sr-only'>Preview</DialogTitle>
          {previewImage && (
            <Image
              unoptimized
              width={1000}
              height={1000}
              src={previewImage}
              alt='Preview'
              className='max-w-[90vw] max-h-[80vh] rounded shadow-lg object-contain'
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
