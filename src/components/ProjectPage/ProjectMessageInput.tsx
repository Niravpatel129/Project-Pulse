'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import { useClickOutside } from '@/hooks/useClickOutside';
import {
  AtSign,
  FootprintsIcon,
  ImageIcon,
  Link2,
  MessageSquare,
  Paperclip,
  Smile,
  Sparkles,
  X,
} from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { createEditor, Descendant, Editor, Text, Transforms } from 'slate';
import { withHistory } from 'slate-history';
import { Editable, Slate, withReact } from 'slate-react';
import { toast } from 'sonner';

interface MessageAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  file?: File;
}

interface Mention {
  id: string;
  name: string;
  avatar?: string;
}

interface ProjectMessageInputProps {
  onSendMessage: (content: string, attachments: File[]) => Promise<void>;
}

export default function ProjectMessageInput({ onSendMessage }: ProjectMessageInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const expandedRef = useRef<HTMLDivElement>(null);
  const [isMentionPopoverOpen, setIsMentionPopoverOpen] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionPosition, setMentionPosition] = useState<{ top: number; left: number } | null>(
    null,
  );
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Initialize Slate editor
  const editor = useMemo(() => {
    return withHistory(withReact(createEditor()));
  }, []);

  // Initial value for Slate editor
  const initialValue: Descendant[] = [
    {
      type: 'paragraph',
      children: [{ text: '' }],
    },
  ];

  const [value, setValue] = useState<Descendant[]>(initialValue);

  // Mock data for mentions - replace with actual project members
  const [mentions] = useState<Mention[]>([
    { id: '1', name: 'John Doe', avatar: '/avatars/john.jpg' },
    { id: '2', name: 'Jane Smith', avatar: '/avatars/jane.jpg' },
    { id: '3', name: 'Bob Johnson', avatar: '/avatars/bob.jpg' },
  ]);

  // Filter mentions based on search query
  const filteredMentions = mentions.filter((mention) => {
    return mention.name.toLowerCase().includes(mentionQuery.toLowerCase());
  });

  // Handle @ key press in Slate editor
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === '@') {
      const { selection } = editor;
      if (selection) {
        const [start] = Editor.nodes(editor, {
          match: (n) => {
            return Text.isText(n);
          },
          at: selection,
        });

        if (start) {
          const [node, path] = start;
          const text = node.text;
          const offset = selection.anchor.offset;
          const beforeText = text.slice(0, offset);

          // Check if @ is at the start of the line or after a space
          const isAtStart = offset === 0;
          const lastSpaceIndex = beforeText.lastIndexOf(' ');
          const isAfterSpace = lastSpaceIndex === offset - 1;

          if (isAtStart || isAfterSpace) {
            setMentionQuery('');
            const domRange = window.getSelection()?.getRangeAt(0);
            const rect = domRange?.getBoundingClientRect();

            if (rect) {
              setMentionPosition({
                top: rect.top + window.scrollY + 20,
                left: rect.left + window.scrollX,
              });
              setIsMentionPopoverOpen(true);
              setSelectedMentionIndex(0);
            }
          }
        }
      }
    } else if (isMentionPopoverOpen) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedMentionIndex((prev) => {
          return Math.min(prev + 1, filteredMentions.length - 1);
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedMentionIndex((prev) => {
          return Math.max(prev - 1, 0);
        });
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredMentions[selectedMentionIndex]) {
          handleMentionSelect(filteredMentions[selectedMentionIndex]);
        }
      } else if (e.key === 'Escape') {
        setIsMentionPopoverOpen(false);
      }
    }
  };

  // Handle mention selection
  const handleMentionSelect = (mention: Mention) => {
    const { selection } = editor;
    if (selection) {
      const [start] = Editor.nodes(editor, {
        match: (n) => {
          return Text.isText(n);
        },
        at: selection,
      });

      if (start) {
        const [node, path] = start;
        const text = node.text;
        const offset = selection.anchor.offset;
        const beforeText = text.slice(0, offset);
        const lastAtSignIndex = beforeText.lastIndexOf('@');

        if (lastAtSignIndex !== -1) {
          Transforms.delete(editor, {
            at: {
              anchor: { path, offset: lastAtSignIndex },
              focus: { path, offset },
            },
          });

          Transforms.insertText(editor, `@${mention.name} `, {
            at: { path, offset: lastAtSignIndex },
          });
        }
      }
    }
    setIsMentionPopoverOpen(false);
  };

  // Handle sending message
  const handleSendMessage = async () => {
    const text = Editor.string(editor, []);
    if (!text.trim() && attachments.length === 0) {
      toast.error('Message required', {
        description: 'Please add a message or attachment before sending.',
      });
      return;
    }

    setIsSending(true);
    try {
      await onSendMessage(
        text,
        attachments
          .map((a) => {
            return a.file;
          })
          .filter((f): f is File => {
            return !!f;
          }),
      );

      // Reset form
      setValue(initialValue);
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

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  useClickOutside(expandedRef, (e: MouseEvent) => {
    // Don't collapse if clicking inside a Popover
    const target = e.target as HTMLElement;
    if (target.closest('[role="dialog"]')) return;

    if (isExpanded) {
      setIsExpanded(false);
    }
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
    const newAttachments: MessageAttachment[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (file.size > MAX_FILE_SIZE) {
        toast.error('File too large', {
          description: `${file.name} exceeds the 5MB size limit.`,
        });
        continue;
      }

      newAttachments.push({
        id: `attachment-${Date.now()}-${i}`,
        name: file.name,
        size: file.size,
        type: file.type,
        file,
      });
    }

    if (newAttachments.length > 0) {
      setAttachments([...attachments, ...newAttachments]);
    }

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
                <Slate editor={editor} initialValue={value} onChange={setValue}>
                  <Editable
                    placeholder='Try uploading files and adding comments...'
                    className='pr-20 text-sm min-h-[80px] focus-visible:ring-0 border-0 shadow-none resize-none py-2 overflow-hidden outline-none'
                    onKeyDown={handleKeyDown}
                  />
                </Slate>
                {isMentionPopoverOpen && mentionPosition && (
                  <div
                    className='absolute z-50'
                    style={{
                      top: mentionPosition.top,
                      left: mentionPosition.left,
                    }}
                  >
                    <Command className='rounded-lg border shadow-md'>
                      <CommandInput
                        placeholder='Search people...'
                        value={mentionQuery}
                        onValueChange={setMentionQuery}
                      />
                      <CommandEmpty>No people found.</CommandEmpty>
                      <CommandGroup className='max-h-[200px] overflow-auto'>
                        {filteredMentions.map((mention, index) => {
                          return (
                            <CommandItem
                              key={mention.id}
                              onSelect={() => {
                                return handleMentionSelect(mention);
                              }}
                              className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer ${
                                index === selectedMentionIndex ? 'bg-accent' : ''
                              }`}
                            >
                              <Avatar className='h-6 w-6'>
                                <AvatarImage src={mention.avatar} alt={mention.name} />
                                <AvatarFallback>{mention.name[0]}</AvatarFallback>
                              </Avatar>
                              <span>{mention.name}</span>
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </Command>
                  </div>
                )}
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
                    onChange={handleFileUpload}
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
