'use client';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { newRequest } from '@/utils/newRequest';
import { useMutation } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { Send, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export default function RightSidebar() {
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
      const response = await newRequest.post('/chat', { message });
      return response.data;
    },
    onSuccess: (data) => {
      const assistantMessage: Message = {
        id: Date.now().toString(),
        content: data.reply,
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages((prev) => {
        return [...prev, assistantMessage];
      });
      // Focus input after receiving response
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
      // Focus input after error
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

  return (
    <div className='h-full bg-white border-l border-neutral-100 flex flex-col'>
      {/* Header */}
      <div className='px-6 py-4 border-b border-neutral-100'>
        <div className='flex items-center gap-2.5'>
          <Sparkles className='w-4 h-4 text-purple-500' />
          <h2 className='text-base font-medium text-neutral-900 tracking-tight'>AI Assistant</h2>
        </div>
      </div>

      {/* Chat Messages */}
      <ScrollArea className='flex-1'>
        <div className='px-5 py-4 space-y-4'>
          <AnimatePresence>
            {messages.map((message) => {
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className={message.role === 'assistant' ? 'max-w-[85%]' : 'max-w-[85%] ml-auto'}
                >
                  {message.role === 'assistant' ? (
                    <div className='text-sm text-neutral-800 leading-relaxed bg-neutral-50 rounded-lg px-4 py-3'>
                      {message.content}
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
      <div className='p-4 border-t border-neutral-100'>
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
            className='absolute bottom-2 right-2 bg-purple-500 hover:bg-purple-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
            size='icon'
          >
            <Send className='w-3.5 h-3.5' />
          </Button>
        </div>
      </div>
    </div>
  );
}
