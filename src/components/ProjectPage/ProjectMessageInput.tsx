'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useProject } from '@/contexts/ProjectContext';
import { useClickOutside } from '@/hooks/useClickOutside';
import { AtSign, FootprintsIcon, MessageSquare, Paperclip, Smile, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Descendant } from 'slate';
import { toast } from 'sonner';
import { Textarea } from '../ui/textarea';

interface MessageAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  file?: File;
}

interface ProjectMessageInputProps {
  onSendMessage: (content: string, attachments: File[]) => Promise<void>;
}

export default function ProjectMessageInput({ onSendMessage }: ProjectMessageInputProps) {
  const { project } = useProject();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const expandedRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initial value for Slate editor
  const initialValue: Descendant[] = [
    {
      type: 'paragraph',
      children: [{ text: '' }],
    },
  ];

  // State management
  const [isExpanded, setIsExpanded] = useState(false);
  const [message, setMessage] = useState('');
  const [editorValue, setEditorValue] = useState<Descendant[]>(initialValue);
  const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
  const [isSending, setIsSending] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  useClickOutside(expandedRef, () => {
    if (isExpanded) {
      setIsExpanded(false);
    }
  });

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';
      // Set the height to scrollHeight to fit the content
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [message]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments: MessageAttachment[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      newAttachments.push({
        id: `attachment-${Date.now()}-${i}`,
        name: file.name,
        size: file.size,
        type: file.type,
        file,
      });
    }

    setAttachments([...attachments, ...newAttachments]);

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(
      attachments.filter((a) => {
        return a.id !== id;
      }),
    );
  };

  const handleSendMessage = async () => {
    if (!message.trim() && attachments.length === 0) {
      toast.error('Message required', {
        description: 'Please add a message or attachment before sending.',
      });
      return;
    }

    setIsSending(true);
    try {
      await onSendMessage(
        message,
        attachments
          .map((a) => {
            return a.file;
          })
          .filter((f): f is File => {
            return !!f;
          }),
      );

      // Reset form
      setMessage('');
      setEditorValue(initialValue);
      setAttachments([]);
      setIsExpanded(false);

      toast.success('Message sent', {
        description: 'Your message has been sent successfully.',
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message', {
        description: 'There was a problem sending your message. Please try again.',
      });
    } finally {
      setIsSending(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className='border border-gray-200 bg-white shadow-sm'>
      {!isExpanded ? (
        <div
          className='flex items-center p-4 cursor-pointer hover:bg-gray-50 transition-colors rounded-t-lg'
          onClick={toggleExpand}
        >
          <Avatar className='h-10 w-10 mr-4'>
            <AvatarImage src='/message-icon.png' alt='Message' />
            <AvatarFallback>
              <MessageSquare className='h-5 w-5' />
            </AvatarFallback>
          </Avatar>
          <span className='text-gray-500'>Send message</span>
        </div>
      ) : (
        <div
          ref={expandedRef}
          className='space-y-4 p-4'
          onClick={(e) => {
            return e.stopPropagation();
          }}
        >
          <div className='flex items-start gap-4'>
            {/* Avatar */}
            <div className='w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0 mt-1'>
              AS
            </div>

            {/* Message area */}
            <div className='flex-1 min-w-0 space-y-3'>
              <div className='relative'>
                <Textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => {
                    return setMessage(e.target.value);
                  }}
                  placeholder='Try uploading files and adding comments...'
                  className='pr-20 text-sm min-h-[80px] focus-visible:ring-0 border-0 shadow-none resize-none py-2 overflow-hidden'
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
              </div>

              {/* Toolbar */}
              <div className='flex items-center justify-between gap-1.5 text-muted-foreground'>
                <div className='flex items-center gap-1.5'>
                  <Button variant='ghost' size='icon' className='h-8 w-8 hover:bg-gray-100'>
                    <Paperclip className='w-4 h-4' />
                  </Button>
                  <Button variant='ghost' size='icon' className='h-8 w-8 hover:bg-gray-100'>
                    <AtSign className='w-4 h-4' />
                  </Button>
                  <Button variant='ghost' size='icon' className='h-8 w-8 hover:bg-gray-100'>
                    <Smile className='w-4 h-4' />
                  </Button>
                  <Button variant='ghost' size='icon' className='h-8 w-8 hover:bg-gray-100'>
                    <FootprintsIcon className='w-4 h-4' />
                  </Button>
                  <Button variant='ghost' size='icon' className='h-8 w-8 hover:bg-gray-100'>
                    <Sparkles className='w-4 h-4' />
                  </Button>
                </div>
                <Button
                  variant='default'
                  size='sm'
                  className='text-sm text-muted-foreground hover:text-foreground text-white hover:text-white'
                  onClick={handleSendMessage}
                >
                  Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
