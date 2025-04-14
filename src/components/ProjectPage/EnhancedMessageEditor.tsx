'use client';

import { Button } from '@/components/ui/button';
import { EmojiPicker } from '@/components/ui/emoji-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import CharacterCount from '@tiptap/extension-character-count';
import Link from '@tiptap/extension-link';
import Mention from '@tiptap/extension-mention';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { BubbleMenu, EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  Paperclip,
  Sparkles,
  Underline as UnderlineIcon,
  X,
} from 'lucide-react';
import { forwardRef, useImperativeHandle, useState } from 'react';
import './EnhancedMessageEditor.css';
import FileUploadManagerModal from './FileComponents/FileUploadManagerModal';
import mentionSuggestion from './mentionSuggestion';

interface Participant {
  _id: string;
  name: string;
  email?: string;
  avatar?: string;
}

interface MessageAttachment {
  id: string;
  fileId: string;
  name: string;
  type: string;
  size: number;
  downloadURL: string;
}

interface LinkInputProps {
  onSubmit: (url: string) => void;
  onCancel: () => void;
}

const LinkInput = ({ onSubmit, onCancel }: LinkInputProps) => {
  const [url, setUrl] = useState('');

  const handleSubmit = () => {
    if (url) {
      onSubmit(url);
      setUrl('');
    }
  };

  return (
    <div className='flex gap-1 p-1'>
      <input
        type='text'
        placeholder='Enter URL'
        value={url}
        onChange={(e) => {
          return setUrl(e.target.value);
        }}
        className='border rounded px-2 py-1 text-sm w-48'
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSubmit();
          } else if (e.key === 'Escape') {
            onCancel();
          }
        }}
        autoFocus
      />
      <Button variant='ghost' size='sm' onClick={handleSubmit} disabled={!url}>
        Add
      </Button>
      <Button variant='ghost' size='sm' onClick={onCancel}>
        Cancel
      </Button>
    </div>
  );
};

export interface EnhancedMessageEditorRef {
  clearContent: () => void;
  getHTML: () => string;
  setContent: (content: string) => void;
  insertEmoji: (emoji: string) => void;
}

interface EnhancedMessageEditorProps {
  content: string;
  onContentChange?: (content: string) => void;
  editable?: boolean;
  maxLength?: number;
  participants?: Participant[];
  onAttachmentsChange?: (attachments: MessageAttachment[]) => void;
  attachments?: MessageAttachment[];
}

const EnhancedMessageEditor = forwardRef<EnhancedMessageEditorRef, EnhancedMessageEditorProps>(
  (
    {
      content,
      onContentChange,
      editable = true,
      maxLength = 5000,
      participants = [],
      onAttachmentsChange,
      attachments = [],
    },
    ref,
  ) => {
    const [showLinkInput, setShowLinkInput] = useState(false);
    const [isFileModalOpen, setIsFileModalOpen] = useState(false);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    const editor = useEditor({
      extensions: [
        StarterKit,
        Underline,
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            class: 'text-blue-500 hover:text-blue-700',
          },
        }),
        Placeholder.configure({
          placeholder: 'Write something...',
        }),
        CharacterCount.configure({
          limit: maxLength,
        }),
        Mention.configure({
          HTMLAttributes: {
            class: 'mention',
          },
          suggestion: {
            ...mentionSuggestion,
            items: ({ query }: { query: string }) => {
              return participants
                .filter((participant) => {
                  const searchTerm = query.toLowerCase();
                  return (
                    participant.name.toLowerCase().includes(searchTerm) ||
                    (participant.email && participant.email.toLowerCase().includes(searchTerm))
                  );
                })
                .slice(0, 5);
            },
          },
          renderHTML({ node }) {
            const participant = participants.find((p) => {
              return p._id === node.attrs.id;
            });
            return [
              'span',
              { class: 'mention', 'data-mention-id': node.attrs.id },
              participant?.name || 'Unknown',
            ];
          },
        }),
        TextAlign.configure({
          types: ['heading', 'paragraph'],
        }),
      ],
      content,
      editable,
      onUpdate: ({ editor }) => {
        const html = editor.getHTML();
        if (onContentChange) {
          onContentChange(html);
        }
      },
    });

    useImperativeHandle(ref, () => {
      return {
        clearContent: () => {
          editor?.commands.clearContent();
        },
        getHTML: () => {
          return editor?.getHTML() || '';
        },
        setContent: (content: string) => {
          editor?.commands.setContent(content);
        },
        insertEmoji: (emoji: string) => {
          editor?.commands.insertContent(emoji);
        },
      };
    });

    if (!editor) {
      return null;
    }

    const handleAddLink = (url: string) => {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
      setShowLinkInput(false);
    };

    const handleRemoveLink = () => {
      editor.chain().focus().unsetLink().run();
    };

    const isLinkActive = editor.isActive('link');

    const handleAddFile = (file: any) => {
      const newAttachment: MessageAttachment = {
        id: file._id,
        fileId: file._id,
        name: file.originalName,
        type: file.contentType,
        size: file.size,
        downloadURL: file.downloadURL,
      };

      if (onAttachmentsChange) {
        onAttachmentsChange([...attachments, newAttachment]);
      }
      setIsFileModalOpen(false);
    };

    const removeAttachment = (id: string) => {
      if (onAttachmentsChange) {
        onAttachmentsChange(
          attachments.filter((attachment) => {
            return attachment.id !== id;
          }),
        );
      }
    };

    const formatFileSize = (bytes: number) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getAttachmentIcon = (type: string) => {
      if (type.startsWith('image/')) {
        return <ImageIcon className='h-4 w-4 mr-2 text-gray-500' />;
      } else {
        return <Paperclip className='h-4 w-4 mr-2 text-gray-500' />;
      }
    };

    return (
      <div className='rounded-lg'>
        {editor && (
          <BubbleMenu
            className='flex flex-col gap-1 bg-white border rounded shadow-lg p-1'
            editor={editor}
            tippyOptions={{
              duration: 100,
              placement: 'top-start',
              popperOptions: {
                modifiers: [
                  {
                    name: 'preventOverflow',
                    options: {
                      boundary: 'viewport',
                    },
                  },
                  {
                    name: 'flip',
                    options: {
                      fallbackPlacements: ['top-start', 'top-end'],
                    },
                  },
                ],
              },
            }}
          >
            <div className='flex w-full gap-1'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => {
                  return editor.chain().focus().toggleBold().run();
                }}
                className={editor.isActive('bold') ? 'bg-gray-100' : ''}
              >
                <Bold className='h-4 w-4' />
              </Button>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => {
                  return editor.chain().focus().toggleItalic().run();
                }}
                className={editor.isActive('italic') ? 'bg-gray-100' : ''}
              >
                <Italic className='h-4 w-4' />
              </Button>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => {
                  return editor.chain().focus().toggleUnderline().run();
                }}
                className={editor.isActive('underline') ? 'bg-gray-100' : ''}
              >
                <UnderlineIcon className='h-4 w-4' />
              </Button>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => {
                  return editor.chain().focus().toggleCode().run();
                }}
                className={editor.isActive('code') ? 'bg-gray-100' : ''}
              >
                <Code className='h-4 w-4' />
              </Button>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => {
                  return editor.chain().focus().toggleHeading({ level: 1 }).run();
                }}
                className={editor.isActive('heading', { level: 1 }) ? 'bg-gray-100' : ''}
              >
                <Heading1 className='h-4 w-4' />
              </Button>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => {
                  return editor.chain().focus().toggleHeading({ level: 2 }).run();
                }}
                className={editor.isActive('heading', { level: 2 }) ? 'bg-gray-100' : ''}
              >
                <Heading2 className='h-4 w-4' />
              </Button>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => {
                  if (isLinkActive) {
                    handleRemoveLink();
                  } else {
                    setShowLinkInput(true);
                  }
                }}
                className={isLinkActive ? 'bg-gray-100' : ''}
              >
                <LinkIcon className='h-4 w-4' />
              </Button>
            </div>
            {showLinkInput && (
              <LinkInput
                onSubmit={handleAddLink}
                onCancel={() => {
                  return setShowLinkInput(false);
                }}
              />
            )}
          </BubbleMenu>
        )}
        <EditorContent editor={editor} className='prose max-w-none min-h-[200px]' />

        {attachments.length > 0 && (
          <div className='mt-2 space-y-2'>
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

        <div className='flex items-center justify-between gap-1.5 text-muted-foreground mt-2'>
          <div className='flex items-center gap-1.5'>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8 hover:bg-gray-100'
              onClick={() => {
                return setIsFileModalOpen(true);
              }}
            >
              <Paperclip className='w-4 h-4' />
            </Button>
            <EmojiPicker
              onSelect={(emoji) => {
                if (ref && 'current' in ref && ref.current) {
                  ref.current.insertEmoji(emoji);
                }
              }}
            />
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant='ghost' size='icon' className='h-8 w-8 hover:bg-gray-100'>
                  <Sparkles className='w-4 h-4' />
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
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {editor.storage.characterCount.characters() >= maxLength && (
          <div className='p-2 text-sm text-red-500 absolute bottom-0 right-0'>
            {editor.storage.characterCount.characters()}/{maxLength} characters
          </div>
        )}

        <FileUploadManagerModal
          isOpen={isFileModalOpen}
          onClose={() => {
            return setIsFileModalOpen(false);
          }}
          handleAddFileToProject={handleAddFile}
        />
      </div>
    );
  },
);

EnhancedMessageEditor.displayName = 'EnhancedMessageEditor';

export default EnhancedMessageEditor;
