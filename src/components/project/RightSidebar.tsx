'use client';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Sparkles, User } from 'lucide-react';
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
    <div className='h-full bg-white border-l border-[#F3F4F6] flex flex-col'>
      {/* Header */}
      <div className='p-4 border-b border-[#F3F4F6]'>
        <div className='flex items-center gap-2'>
          <Sparkles className='w-5 h-5 text-purple-600' />
          <h2 className='text-lg font-semibold text-[#111827]'>AI Assistant</h2>
        </div>
        <p className='text-sm text-[#6B7280] mt-1'>Ask me anything about your project</p>
      </div>

      {/* Chat Messages */}
      <ScrollArea className='flex-1'>
        <div className='p-4 space-y-4'>
          {messages.map((message) => {
            return (
              <div key={message.id}>
                {message.role === 'assistant' ? (
                  <div className='text-sm text-[#111827] leading-relaxed'>{message.content}</div>
                ) : (
                  <div className='flex items-start gap-3 justify-end'>
                    <div className='max-w-[80%] rounded-lg p-3 bg-blue-50 text-[#111827]'>
                      <p className='text-sm'>{message.content}</p>
                      <p className='text-xs text-[#6B7280] mt-1'>
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                    <div className='w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0'>
                      <User className='w-4 h-4 text-blue-600' />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className='p-4'>
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
            className='w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[80px] resize-none'
          />
          <Button
            onClick={handleSend}
            className='absolute bottom-2 right-2 bg-purple-600 hover:bg-purple-700'
            size='icon'
          >
            <Send className='w-4 h-4' />
          </Button>
        </div>
      </div>
    </div>
  );
}
