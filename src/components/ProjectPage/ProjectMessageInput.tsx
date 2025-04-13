'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useProject } from '@/contexts/ProjectContext';
import { useClickOutside } from '@/hooks/useClickOutside';
import {
  Bold,
  Code,
  FootprintsIcon,
  Heading1,
  Heading2,
  ImageIcon,
  Italic,
  Link2,
  MessageSquare,
  Paperclip,
  Quote,
  Search,
  Smile,
  Sparkles,
  Strikethrough,
  Underline,
  X,
} from 'lucide-react';
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BaseEditor, createEditor, Descendant, Editor, Element, Text, Transforms } from 'slate';
import { withHistory } from 'slate-history';
import { Editable, ReactEditor, Slate, useFocused, useSelected, withReact } from 'slate-react';
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

type CustomElement = {
  type: 'paragraph' | 'heading-one' | 'heading-two' | 'block-quote' | 'mention';
  children: CustomText[];
};
type CustomText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
};

type CustomEditor = BaseEditor &
  ReactEditor & {
    history: {
      redos: any[];
      undos: any[];
    };
  };

export default function ProjectMessageInput({ onSendMessage }: ProjectMessageInputProps) {
  const { project } = useProject();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const expandedRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const [isMentionPopoverOpen, setIsMentionPopoverOpen] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionPosition, setMentionPosition] = useState<{ top: number; left: number } | null>(
    null,
  );
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const mentionInputRef = useRef<HTMLInputElement>(null);
  const [showFloatingToolbar, setShowFloatingToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });
  const floatingToolbarRef = useRef<HTMLDivElement>(null);

  // Initialize Slate editor
  const editor = useMemo(() => {
    const editor = withHistory(withReact(createEditor())) as CustomEditor;

    const { isInline, isVoid } = editor;

    editor.isInline = (element: any) => {
      return element.type === 'mention' ? true : isInline(element);
    };

    editor.isVoid = (element: any) => {
      return element.type === 'mention' ? true : isVoid(element);
    };

    return editor;
  }, []);

  // Initial value for Slate editor
  const initialValue: Descendant[] = [
    {
      type: 'paragraph',
      children: [{ text: '' }],
    },
  ];

  const [value, setValue] = useState<Descendant[]>(initialValue);

  // Use project participants for mentions
  const mentions = useMemo(() => {
    return (
      project?.participants.map((participant) => {
        return {
          id: participant._id,
          name: participant.name,
          avatar: participant.avatar,
        };
      }) || []
    );
  }, [project?.participants]);

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
            const editorRect = editorRef.current?.getBoundingClientRect();

            if (rect && editorRect) {
              setMentionPosition({
                top: rect.top - editorRect.top + 20,
                left: rect.left - editorRect.left,
              });
              setIsMentionPopoverOpen(true);
              setSelectedMentionIndex(0);
              // Focus the input after a small delay to ensure it's mounted
              setTimeout(() => {
                mentionInputRef.current?.focus();
              }, 0);
            }
          }
        }
      }
    }

    // Handle keyboard shortcuts for formatting
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          toggleFormat('bold');
          break;
        case 'i':
          e.preventDefault();
          toggleFormat('italic');
          break;
        case 'u':
          e.preventDefault();
          toggleFormat('underline');
          break;
        case 's':
          e.preventDefault();
          toggleFormat('strikethrough');
          break;
      }
    }

    // Handle backspace/delete for block elements
    if (e.key === 'Backspace' || e.key === 'Delete') {
      const { selection } = editor;
      if (selection) {
        const [node] = Editor.nodes(editor, {
          match: (n) => {
            return (
              Element.isElement(n) &&
              n.type !== undefined &&
              ['heading-one', 'heading-two', 'block-quote'].includes(n.type)
            );
          },
        });
      }
    }
  };

  const renderElement = useCallback((props) => {
    const { attributes, children, element } = props;

    switch (element.type) {
      case 'mention':
        return <MentionComponent {...props} />;
      case 'heading-one':
        return (
          <h1 {...attributes} className='text-2xl font-bold'>
            {children}
          </h1>
        );
      case 'heading-two':
        return (
          <h2 {...attributes} className='text-xl font-bold'>
            {children}
          </h2>
        );
      case 'block-quote':
        return (
          <blockquote {...attributes} className='border-l-4 border-gray-200 pl-4 italic'>
            {children}
          </blockquote>
        );
      default:
        return <p {...attributes}>{children}</p>;
    }
  }, []);

  const renderLeaf = useCallback((props) => {
    const { attributes, children, leaf } = props;
    let newChildren = children;

    if (leaf.bold) {
      newChildren = <strong>{newChildren}</strong>;
    }
    if (leaf.italic) {
      newChildren = <em>{newChildren}</em>;
    }
    if (leaf.underline) {
      newChildren = <u>{newChildren}</u>;
    }
    if (leaf.strikethrough) {
      newChildren = <s>{newChildren}</s>;
    }
    if (leaf.code) {
      newChildren = <code className='bg-gray-100 px-1 rounded'>{newChildren}</code>;
    }

    return <span {...attributes}>{newChildren}</span>;
  }, []);

  const MentionComponent = ({
    attributes,
    children,
    element,
  }: {
    attributes: any;
    children: ReactNode;
    element: any;
  }) => {
    const selected = useSelected();
    const focused = useFocused();

    return (
      <span
        {...attributes}
        contentEditable={false}
        style={{
          padding: '3px 3px 2px',
          margin: '0 1px',
          verticalAlign: 'baseline',
          display: 'inline-block',
          borderRadius: '4px',
          backgroundColor: '#eee',
          fontSize: '0.9em',
          boxShadow: selected && focused ? '0 0 0 2px #B4D5FF' : 'none',
        }}
      >
        @{element.character}
        {children}
      </span>
    );
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

          const mentionNode: any = {
            type: 'mention',
            character: mention.name,
            userId: mention.id,
            children: [{ text: '' }],
          };

          Transforms.insertNodes(editor, mentionNode);
          Transforms.insertText(editor, ' ');

          // Move cursor to the end of the inserted content
          const newSelection = {
            anchor: Editor.end(editor, []),
            focus: Editor.end(editor, []),
          };
          Transforms.select(editor, newSelection);
          ReactEditor.focus(editor);
        }
      }
    }
    setIsMentionPopoverOpen(false);
  };

  // Handle mention popover keyboard navigation
  const handleMentionPopoverKeyDown = (e: React.KeyboardEvent) => {
    if (!isMentionPopoverOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedMentionIndex((prev) => {
          return Math.min(prev + 1, filteredMentions.length - 1);
        });
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedMentionIndex((prev) => {
          return Math.max(prev - 1, 0);
        });
        break;
      case 'Enter':
        e.preventDefault();
        e.stopPropagation();
        const selectedMention = filteredMentions[selectedMentionIndex];
        if (selectedMention) {
          handleMentionSelect(selectedMention);
        }
        break;
      case 'Escape':
        e.preventDefault();
        e.stopPropagation();
        setIsMentionPopoverOpen(false);
        break;
      case 'Backspace':
        if (mentionQuery === '') {
          e.preventDefault();
          e.stopPropagation();
          setIsMentionPopoverOpen(false);
        }
        break;
    }
  };

  // Update mention query as user types
  const handleMentionQueryChange = (value: string) => {
    setMentionQuery(value);
    setSelectedMentionIndex(0);
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

    // Extract all mentions from the editor
    const mentionedUserIds: string[] = [];
    const nodes = Editor.nodes(editor, {
      at: [],
      match: (n) => {
        const node = n as unknown as { type: string; userId: string };
        return node.type === 'mention';
      },
    });

    for (const [node] of nodes) {
      const mentionNode = node as unknown as { type: string; userId: string };
      mentionedUserIds.push(mentionNode.userId);
    }

    console.log('Mentioned user IDs:', mentionedUserIds);

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

      // Reset everything after successful send
      setValue(initialValue);
      setAttachments([]);
      setIsExpanded(false);
      setIsMentionPopoverOpen(false);
      setMentionQuery('');
      setMentionPosition(null);
      setSelectedMentionIndex(0);

      // Properly reset the editor
      editor.history = { redos: [], undos: [] };
      editor.children = initialValue;
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };
      editor.operations = [];
      editor.marks = null;

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

  const toggleFormat = (format: string) => {
    const isActive = isFormatActive(format);
    Transforms.setNodes(
      editor,
      { [format]: isActive ? null : true },
      { match: Text.isText, split: true },
    );
  };

  const isFormatActive = (format: string) => {
    const [match] = Editor.nodes(editor, {
      match: (n) => {
        return n[format] === true;
      },
      universal: true,
    });
    return !!match;
  };

  const toggleBlock = (format: CustomElement['type']) => {
    const isActive = isBlockActive(format);
    Transforms.setNodes(editor, { type: isActive ? 'paragraph' : format } as Partial<Element>, {
      match: (n) => {
        return Element.isElement(n) && Editor.isBlock(editor, n);
      },
    });
  };

  const isBlockActive = (format: CustomElement['type']) => {
    const [match] = Editor.nodes(editor, {
      match: (n) => {
        return Element.isElement(n) && n.type === format;
      },
    });
    return !!match;
  };

  // Add mouse selection handling
  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      setShowFloatingToolbar(false);
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const editorRect = editorRef.current?.getBoundingClientRect();

    if (editorRect) {
      // Calculate position relative to the editor
      const top = rect.top - editorRect.top - 40;
      const left = rect.left - editorRect.left;

      // Ensure the toolbar stays within the editor bounds
      const toolbarWidth = 200; // Approximate width of the toolbar
      const adjustedLeft = Math.min(Math.max(left, 0), editorRect.width - toolbarWidth);

      setToolbarPosition({
        top,
        left: adjustedLeft,
      });
      setShowFloatingToolbar(true);
    }
  }, []);

  // Handle selection change
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleSelectionChange = () => {
      clearTimeout(timeoutId);

      timeoutId = setTimeout(() => {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed) {
          setShowFloatingToolbar(false);
          return;
        }

        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const editorRect = editorRef.current?.getBoundingClientRect();

        if (editorRect) {
          // Calculate position relative to the editor
          const top = rect.top - editorRect.top - 40;
          const left = rect.left - editorRect.left;

          // Ensure the toolbar stays within the editor bounds
          const toolbarWidth = 200; // Approximate width of the toolbar
          const adjustedLeft = Math.min(Math.max(left, 0), editorRect.width - toolbarWidth);

          setToolbarPosition({
            top,
            left: adjustedLeft,
          });
          setShowFloatingToolbar(true);
        }
      }, 50);
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    document.addEventListener('mouseup', handleSelectionChange);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('selectionchange', handleSelectionChange);
      document.removeEventListener('mouseup', handleSelectionChange);
    };
  }, []);

  // Close toolbar when clicking outside
  useClickOutside(floatingToolbarRef, () => {
    setShowFloatingToolbar(false);
  });

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
                  <div ref={editorRef}>
                    <Editable
                      renderElement={renderElement}
                      renderLeaf={renderLeaf}
                      placeholder='Try uploading files and adding comments...'
                      className='pr-20 text-sm  focus-visible:ring-0 border-0 shadow-none resize-none px-3 overflow-hidden outline-none'
                      onKeyDown={handleKeyDown}
                      onMouseUp={handleMouseUp}
                    />
                  </div>
                </Slate>

                {showFloatingToolbar && (
                  <div
                    ref={floatingToolbarRef}
                    className='absolute z-50 flex items-center gap-1 bg-white border rounded-lg shadow-lg p-1 backdrop-blur-sm bg-white/90'
                    style={{
                      top: toolbarPosition.top,
                      left: toolbarPosition.left,
                    }}
                  >
                    <div className='flex items-center gap-1 border-r pr-1'>
                      <Button
                        variant='ghost'
                        size='icon'
                        className={`h-8 w-8 hover:bg-gray-100 ${
                          isFormatActive('bold') ? 'bg-gray-100' : ''
                        }`}
                        onClick={() => {
                          return toggleFormat('bold');
                        }}
                        title='Bold (Ctrl+B)'
                      >
                        <Bold className='w-4 h-4' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        className={`h-8 w-8 hover:bg-gray-100 ${
                          isFormatActive('italic') ? 'bg-gray-100' : ''
                        }`}
                        onClick={() => {
                          return toggleFormat('italic');
                        }}
                        title='Italic (Ctrl+I)'
                      >
                        <Italic className='w-4 h-4' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        className={`h-8 w-8 hover:bg-gray-100 ${
                          isFormatActive('underline') ? 'bg-gray-100' : ''
                        }`}
                        onClick={() => {
                          return toggleFormat('underline');
                        }}
                        title='Underline (Ctrl+U)'
                      >
                        <Underline className='w-4 h-4' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        className={`h-8 w-8 hover:bg-gray-100 ${
                          isFormatActive('strikethrough') ? 'bg-gray-100' : ''
                        }`}
                        onClick={() => {
                          return toggleFormat('strikethrough');
                        }}
                        title='Strikethrough (Ctrl+S)'
                      >
                        <Strikethrough className='w-4 h-4' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        className={`h-8 w-8 hover:bg-gray-100 ${
                          isFormatActive('code') ? 'bg-gray-100' : ''
                        }`}
                        onClick={() => {
                          return toggleFormat('code');
                        }}
                        title='Code'
                      >
                        <Code className='w-4 h-4' />
                      </Button>
                    </div>
                    <div className='flex items-center gap-1'>
                      <Button
                        variant='ghost'
                        size='icon'
                        className={`h-8 w-8 hover:bg-gray-100 ${
                          isBlockActive('heading-one') ? 'bg-gray-100' : ''
                        }`}
                        onClick={() => {
                          return toggleBlock('heading-one');
                        }}
                        title='Heading 1'
                      >
                        <Heading1 className='w-4 h-4' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        className={`h-8 w-8 hover:bg-gray-100 ${
                          isBlockActive('heading-two') ? 'bg-gray-100' : ''
                        }`}
                        onClick={() => {
                          return toggleBlock('heading-two');
                        }}
                        title='Heading 2'
                      >
                        <Heading2 className='w-4 h-4' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        className={`h-8 w-8 hover:bg-gray-100 ${
                          isBlockActive('block-quote') ? 'bg-gray-100' : ''
                        }`}
                        onClick={() => {
                          return toggleBlock('block-quote');
                        }}
                        title='Quote'
                      >
                        <Quote className='w-4 h-4' />
                      </Button>
                    </div>
                  </div>
                )}

                {isMentionPopoverOpen && mentionPosition && (
                  <div
                    className='absolute z-50'
                    style={{
                      top: mentionPosition.top,
                      left: mentionPosition.left,
                    }}
                    onKeyDown={handleMentionPopoverKeyDown}
                  >
                    <div className='rounded-lg border bg-white shadow-md w-[300px] overflow-hidden'>
                      <div className='flex items-center border-b px-3 py-2'>
                        <Search className='mr-2 h-4 w-4 shrink-0 opacity-50' />
                        <input
                          ref={mentionInputRef}
                          type='text'
                          placeholder='Search people...'
                          value={mentionQuery}
                          onChange={(e) => {
                            return handleMentionQueryChange(e.target.value);
                          }}
                          className='flex h-8 w-full rounded-md bg-transparent text-sm outline-none placeholder:text-gray-500'
                          onKeyDown={handleMentionPopoverKeyDown}
                        />
                      </div>
                      <div className='max-h-[200px] overflow-y-auto'>
                        {filteredMentions.length === 0 ? (
                          <div className='py-6 text-center text-sm text-gray-500'>
                            No people found.
                          </div>
                        ) : (
                          <div className='p-1'>
                            {filteredMentions.map((mention, index) => {
                              return (
                                <div
                                  key={mention.id}
                                  onClick={() => {
                                    return handleMentionSelect(mention);
                                  }}
                                  className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded-sm ${
                                    index === selectedMentionIndex ? 'bg-gray-100' : ''
                                  }`}
                                >
                                  <Avatar className='h-6 w-6'>
                                    <AvatarImage src={mention.avatar} alt={mention.name} />
                                    <AvatarFallback>{mention.name[0]}</AvatarFallback>
                                  </Avatar>
                                  <span className='text-sm'>{mention.name}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
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
