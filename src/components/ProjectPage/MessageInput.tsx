'use client';

import type React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Paperclip, Send } from 'lucide-react';
import { useRef, useState, useTransition } from 'react';

interface MessageInputProps {
  user: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
  };
  onSendMessage: (content: string) => Promise<void>;
}

export default function MessageInput({ user, onSendMessage }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    startTransition(async () => {
      await onSendMessage(message);
      setMessage('');
      if (inputRef.current) {
        inputRef.current.focus();
      }
    });
  };

  const recipientRole = user.role === 'PRINT_SHOP_EMPLOYEE' ? 'Client' : 'Print Shop';

  return (
    <form onSubmit={handleSubmit} className='flex gap-3 items-start mt-4'>
      <Avatar className='h-8 w-8 shrink-0 mt-1'>
        <AvatarImage src={user.avatar} alt={user.name} />
        <AvatarFallback>{user.name[0]}</AvatarFallback>
      </Avatar>
      <div className='flex-1'>
        <div className='flex items-center gap-2 rounded-lg border bg-white p-2 shadow-sm'>
          <Input
            ref={inputRef}
            value={message}
            onChange={(e) => {return setMessage(e.target.value)}}
            placeholder={`Message ${recipientRole}...`}
            className='border-0 p-0 focus-visible:ring-0 shadow-none'
            disabled={isPending}
          />
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='text-gray-500'
            disabled={isPending}
          >
            <Paperclip className='h-4 w-4' />
            <span className='sr-only'>Attach file</span>
          </Button>
          <Button
            type='submit'
            size='sm'
            className='rounded-full px-3 bg-[#5DD3D1] hover:bg-[#4BBFBD] text-white'
            disabled={!message.trim() || isPending}
          >
            <Send className='h-4 w-4 mr-1' />
            Send
          </Button>
        </div>
      </div>
    </form>
  );
}
