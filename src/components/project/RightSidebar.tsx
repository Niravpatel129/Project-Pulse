'use client';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { newRequest } from '@/utils/newRequest';
import { useMutation } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { Info, Send, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
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
    type: string;
    items: LineItem[];
  }[];
}

interface RightSidebarProps {
  setItems: React.Dispatch<React.SetStateAction<any[]>>;
  projectCurrency: string;
}

export default function RightSidebar({ setItems, projectCurrency }: RightSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! How can I help you today?',
      role: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Focus input when component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await newRequest.post('/ai/smart-response', { prompt: message });
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
    toast.success('Item added successfully');
  };

  return (
    <div className='h-full bg-white border-l border-neutral-100 flex flex-col'>
      {/* Header */}
      <div className='px-6 py-4 border-b border-neutral-100 flex-shrink-0'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2.5'>
            <Sparkles className='w-4 h-4 text-purple-500' />
            <h2 className='text-base font-medium text-neutral-900 tracking-tight'>AI Assistant</h2>
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
              className='h-8 w-8 text-neutral-500 hover:text-neutral-700'
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
                    <div className='text-sm text-neutral-800 leading-relaxed bg-neutral-50 rounded-lg px-4 py-3'>
                      <div className='flex items-start gap-2'>
                        <div className='flex-1'>
                          {message.content}
                          {message.structuredData?.map((data, dataIndex) => {
                            if (data.type === 'LINE_ITEMS') {
                              return (
                                <div key={dataIndex} className='mt-4 space-y-2'>
                                  {data.items.map((item, itemIndex) => {
                                    return (
                                      <LineItemCard
                                        key={itemIndex}
                                        item={item}
                                        onClick={handleAddItem}
                                      />
                                    );
                                  })}
                                </div>
                              );
                            }
                            return null;
                          })}
                        </div>
                        {message.meta && (
                          <TooltipProvider delayDuration={0}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button className='text-neutral-400 hover:text-neutral-600 transition-colors'>
                                  <Info className='w-4 h-4' />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent className='max-w-[300px] p-3'>
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
                  ) : (
                    <div className='rounded-lg px-4 py-3 bg-purple-50 text-neutral-800 shadow-sm'>
                      <p className='text-sm leading-relaxed'>{message.content}</p>
                      <p className='text-xs text-neutral-500 mt-1.5'>
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
                <div className='text-sm text-neutral-800 leading-relaxed bg-neutral-50 rounded-lg px-4 py-3'>
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
                      className='w-2 h-2 bg-purple-500 rounded-full'
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
                      className='w-2 h-2 bg-purple-500 rounded-full'
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
                      className='w-2 h-2 bg-purple-500 rounded-full'
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className='p-4 border-t border-neutral-100 flex-shrink-0'>
        <div className='relative'>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => {
              return setInput(e.target.value);
            }}
            onKeyPress={(e) => {
              return e.key === 'Enter' && !e.shiftKey && handleSend();
            }}
            placeholder='Type your message...'
            disabled={chatMutation.isPending}
            className='w-full px-4 py-3 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 min-h-[72px] resize-none transition-colors duration-200 placeholder:text-neutral-400 disabled:opacity-50 disabled:cursor-not-allowed'
          />
          <Button
            onClick={handleSend}
            disabled={chatMutation.isPending || !input.trim()}
            className='absolute bottom-4 right-2 bg-purple-500 hover:bg-purple-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
            size='icon'
          >
            <Send className='w-3.5 h-3.5' />
          </Button>
        </div>
      </div>
    </div>
  );
}
