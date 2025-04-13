'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmojiPicker } from '@/components/ui/emoji-picker';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useProject } from '@/contexts/ProjectContext';
import { useAiEnhancement } from '@/hooks/useAiEnhancement';
import { useClickOutside } from '@/hooks/useClickOutside';
import { cn } from '@/lib/utils';
import { ImageIcon, Link2, MessageSquare, Paperclip, Sparkles, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import EnhancedMessageEditor, { EnhancedMessageEditorRef } from './EnhancedMessageEditor';

interface MessageAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
}

interface ProjectMessageInputProps {
  onSend: (data: any) => void;
}

const QUICK_ENHANCE_OPTIONS = [
  { label: 'Make it more professional', value: 'professional' },
  { label: 'Make it more friendly', value: 'friendly' },
  { label: 'Fix grammar and spelling', value: 'grammar' },
  { label: 'Make it more concise', value: 'concise' },
  { label: 'Make it more detailed', value: 'detailed' },
];

const ProjectMessageInput = ({ onSend }: ProjectMessageInputProps) => {
  const { project } = useProject();
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
  const [customEnhancePrompt, setCustomEnhancePrompt] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const expandedRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<EnhancedMessageEditorRef>(null);
  const [isSending, setIsSending] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [enhancementResult, setEnhancementResult] = useState<{
    original: string;
    enhanced: string;
  } | null>(null);

  const { mutate: enhanceText, isPending: isEnhancing } = useAiEnhancement();

  const handleSend = async () => {
    if (!content.trim() && attachments.length === 0) {
      toast.error('Please enter a message or attach a file');
      return;
    }

    setIsSending(true);
    try {
      await onSend({ content, attachments });
      setContent('');
      editorRef.current?.clearContent();
      setAttachments([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newAttachments: MessageAttachment[] = Array.from(files).map((file) => {
      return {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type,
        size: file.size,
      };
    });

    setAttachments((prev) => {
      return [...prev, ...newAttachments];
    });
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => {
      return prev.filter((attachment) => {
        return attachment.id !== id;
      });
    });
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  useClickOutside(expandedRef, (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('[role="dialog"]')) return;

    if (isExpanded) {
      setIsExpanded(false);
    }
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getAttachmentIcon = (type: string) => {
    if (type === 'link') {
      return <Link2 className='h-4 w-4 mr-2 text-gray-500' />;
    } else if (type.startsWith('image/')) {
      return <ImageIcon className='h-4 w-4 mr-2 text-gray-500' />;
    } else {
      return <Paperclip className='h-4 w-4 mr-2 text-gray-500' />;
    }
  };

  const handleFileSelect = (type: 'file' | 'image') => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = type === 'image' ? 'image/*' : '*/*';
      fileInputRef.current.click();
    }
  };

  const handleEnhanceText = async (enhanceType: string) => {
    const selectedText = editorRef.current?.enhanceSelection();
    if (!selectedText) {
      toast.error('Please select some text to enhance');
      return;
    }

    enhanceText(
      {
        text: selectedText,
        enhanceType,
        customPrompt: customEnhancePrompt,
      },
      {
        onSuccess: (data) => {
          setEnhancementResult({
            original: data.originalText,
            enhanced: data.enhancedText,
          });
          editorRef.current?.updateSelection(data.enhancedText);
          setCustomEnhancePrompt('');
          toast.success('Text enhanced!', {
            description: 'Your text has been enhanced.',
          });
        },
      },
    );
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
            <div className='w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0 mt-1'>
              AS
            </div>

            <div className='flex-1 min-w-0 space-y-3'>
              <div className='relative'>
                <EnhancedMessageEditor
                  ref={editorRef}
                  content={content}
                  onContentChange={setContent}
                  maxLength={5000}
                  participants={project?.participants || []}
                />
              </div>

              {attachments.length > 0 && (
                <div className='space-y-2'>
                  {attachments.map((attachment) => {
                    return (
                      <div
                        key={attachment.id}
                        className='flex items-center justify-between bg-gray-50 p-2 rounded'
                      >
                        <div className='flex items-center'>
                          {getAttachmentIcon(attachment.type)}
                          <span className='text-sm'>{attachment.name}</span>
                          {attachment.size > 0 && (
                            <span className='text-xs text-gray-500 ml-2'>
                              ({formatFileSize(attachment.size)})
                            </span>
                          )}
                        </div>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => {
                            return removeAttachment(attachment.id);
                          }}
                          className='h-6 w-6 p-0'
                        >
                          <X className='h-4 w-4' />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className='flex items-center justify-between gap-1.5 text-muted-foreground'>
                <div className='flex items-center gap-1.5'>
                  <input
                    type='file'
                    ref={fileInputRef}
                    className='hidden'
                    onChange={handleFileChange}
                    multiple
                    accept='*/*'
                  />
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8 hover:bg-gray-100'
                    onClick={() => {
                      return handleFileSelect('file');
                    }}
                  >
                    <Paperclip className='w-4 h-4' />
                  </Button>
                  <EmojiPicker
                    onSelect={(emoji) => {
                      return editorRef.current?.insertEmoji(emoji);
                    }}
                  />
                  <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-8 w-8 hover:bg-gray-100'
                        disabled={isEnhancing}
                      >
                        <Sparkles className={cn('w-4 h-4', isEnhancing && 'animate-spin')} />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-80 p-3' align='start'>
                      <div className='space-y-4'>
                        <div className='space-y-2'>
                          <h4 className='font-medium leading-none'>Enhance text with AI</h4>
                          <p className='text-sm text-muted-foreground'>
                            Tell AI how to enhance your selected text
                          </p>
                        </div>

                        {enhancementResult && (
                          <div className='space-y-2 rounded-md border p-2'>
                            <div className='space-y-1'>
                              <p className='text-xs font-medium text-muted-foreground'>Original</p>
                              <p className='text-sm'>{enhancementResult.original}</p>
                            </div>
                            <div className='my-2 border-t' />
                            <div className='space-y-1'>
                              <p className='text-xs font-medium text-muted-foreground'>Enhanced</p>
                              <p className='text-sm'>{enhancementResult.enhanced}</p>
                            </div>
                          </div>
                        )}

                        <div className='space-y-2'>
                          <Input
                            type='text'
                            placeholder='Enter custom instructions...'
                            value={customEnhancePrompt}
                            onChange={(e) => {
                              return setCustomEnhancePrompt(e.target.value);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && customEnhancePrompt) {
                                handleEnhanceText(customEnhancePrompt);
                              }
                            }}
                            disabled={isEnhancing}
                          />
                        </div>
                        <div className='space-y-2'>
                          <p className='text-sm font-medium'>Quick options</p>
                          <div className='grid gap-2'>
                            {QUICK_ENHANCE_OPTIONS.map((option) => {
                              return (
                                <Button
                                  key={option.value}
                                  variant='outline'
                                  className='justify-start'
                                  onClick={() => {
                                    return handleEnhanceText(option.value);
                                  }}
                                  disabled={isEnhancing}
                                >
                                  <Sparkles className='mr-2 h-4 w-4' />
                                  {option.label}
                                  {isEnhancing && (
                                    <span className='ml-2 h-4 w-4 animate-spin rounded-full border-2 border-zinc-800 border-r-transparent' />
                                  )}
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <Button
                  variant='default'
                  size='sm'
                  className='text-sm text-muted-foreground hover:text-foreground text-white hover:text-white'
                  onClick={handleSend}
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
};

export default ProjectMessageInput;
