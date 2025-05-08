'use client';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AnimatePresence, motion } from 'framer-motion';
import { Send, Sparkles } from 'lucide-react';
import { useState } from 'react';

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

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setInput('');
    // Here you would typically make an API call to your AI service
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
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className='p-4 border-t border-neutral-100'>
        <div className='relative'>
          <textarea
            value={input}
            onChange={(e) => {
              return setInput(e.target.value);
            }}
            onKeyPress={(e) => {
              return e.key === 'Enter' && !e.shiftKey && handleSend();
            }}
            placeholder='Type your message...'
            className='w-full px-4 py-3 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 min-h-[72px] resize-none transition-colors duration-200 placeholder:text-neutral-400'
          />
          <Button
            onClick={handleSend}
            className='absolute bottom-2 right-2 bg-purple-500 hover:bg-purple-600 transition-colors duration-200'
            size='icon'
          >
            <Send className='w-3.5 h-3.5' />
          </Button>
        </div>
      </div>
    </div>
  );
}
