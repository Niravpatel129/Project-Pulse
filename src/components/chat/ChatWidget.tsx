'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { newRequest, streamRequest } from '@/utils/newRequest';
import { AtSign, MessageCircle, Paperclip, Send, Trash2, X } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import TextareaAutosize from 'react-textarea-autosize';
import remarkGfm from 'remark-gfm';

type Message = {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isStreaming?: boolean;
};

type TableInfo = {
  id: string;
  name: string;
  description?: string;
};

type ChatWidgetProps = {
  pageContext?: {
    url?: string;
    title?: string;
    description?: string;
    tables?: TableInfo[];
    [key: string]: any;
  };
};

export function ChatWidget({ pageContext }: ChatWidgetProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [tables, setTables] = useState<TableInfo[]>([]);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const mentionTriggerRef = useRef<HTMLButtonElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const contentAccumulatorRef = useRef<{ [key: string]: string }>({});
  const userScrollingRef = useRef(false);
  const lastMessageIdRef = useRef<string | null>(null);

  // Load session ID from localStorage on component mount
  useEffect(() => {
    const savedSessionId = localStorage.getItem('chatSessionId');
    if (savedSessionId) {
      setSessionId(savedSessionId);
    }

    // Set sample tables for demo (in real app, get from pageContext)
    const demoTables: TableInfo[] = pageContext?.tables || [
      { id: '1', name: 'users', description: 'User accounts and profiles' },
      { id: '2', name: 'orders', description: 'Customer orders data' },
      { id: '3', name: 'products', description: 'Product catalog information' },
      { id: '4', name: 'customers', description: 'Customer information' },
      { id: '5', name: 'payments', description: 'Payment transactions' },
      { id: '6', name: 'inventory', description: 'Product inventory' },
    ];
    setTables(demoTables);
  }, [pageContext]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0 && !userScrollingRef.current) {
      scrollToBottom();
    }
    if (messages.length > 0) {
      lastMessageIdRef.current = messages[messages.length - 1].id;
    }
  }, [messages.length]);

  // Scroll to bottom helper
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'instant' });
    }
  }, []);

  // Global styling for page shifting
  useEffect(() => {
    // Apply the class-based styling when the chat is open
    document.documentElement.style.setProperty('--content-margin-right', isOpen ? '350px' : '0px');

    // Create and add a style element for dynamic styles
    const styleEl = document.createElement('style');
    styleEl.innerHTML = `
      body {
        transition: padding-right 0.3s ease;
        padding-right: var(--content-margin-right, 0px);
      }
      
      /* Target app-specific navigation elements */
      header.fixed, 
      header.sticky,
      header.fixed.top-0, 
      .fixed.top-0,
      nav.fixed {
        transition: width 0.3s ease;
        width: calc(100% - var(--content-margin-right, 0px));
      }
      
      /* For mobile */
      @media (max-width: 768px) {
        body {
          padding-right: 0 !important;
        }
        header.fixed, 
        header.sticky,
        header.fixed.top-0,
        .fixed.top-0,
        nav.fixed {
          width: 100% !important;
        }
      }
    `;
    document.head.appendChild(styleEl);

    // Apply class to body for more styling options
    if (isOpen) {
      document.body.classList.add('chat-open');
    } else {
      document.body.classList.remove('chat-open');
    }

    return () => {
      document.documentElement.style.setProperty('--content-margin-right', '0px');
      document.body.classList.remove('chat-open');
      document.head.removeChild(styleEl);
    };
  }, [isOpen]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  // Handle scroll events
  const handleScroll = useCallback(() => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current;
      const isScrolledToBottom =
        scrollArea.scrollHeight - scrollArea.scrollTop <= scrollArea.clientHeight + 100;
      userScrollingRef.current = !isScrolledToBottom;
    }
  }, []);

  // Add scroll event listener
  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (scrollArea) {
      scrollArea.addEventListener('scroll', handleScroll);
      return () => {
        return scrollArea.removeEventListener('scroll', handleScroll);
      };
    }
  }, [handleScroll]);

  // Toggle chat open/closed
  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  // Handle text input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Store cursor position for mention insertion
    if (e.target.selectionStart) {
      setCursorPosition(e.target.selectionStart);
    }

    // Find if cursor is right after an @ symbol
    const beforeCursor = value.substring(0, cursorPosition);
    const match = beforeCursor.match(/@([^\s@]*)$/);

    if (match) {
      setShowMentions(true);
      setMentionFilter(match[1]?.toLowerCase() || '');
    } else {
      setShowMentions(false);
    }
  };

  // Handle @ button click
  const handleAtButtonClick = () => {
    const newValue =
      inputValue.substring(0, cursorPosition) + '@' + inputValue.substring(cursorPosition);
    setInputValue(newValue);
    setShowMentions(true);
    setMentionFilter('');

    // Focus back on input and place cursor after @
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        const newPosition = cursorPosition + 1;
        inputRef.current.setSelectionRange(newPosition, newPosition);
        setCursorPosition(newPosition);
      }
    }, 0);
  };

  // Handle mention selection
  const handleSelectMention = (tableName: string) => {
    // Replace the @filter with the selected table name
    const beforeCursor = inputValue.substring(0, cursorPosition);
    const match = beforeCursor.match(/@([^\s@]*)$/);

    if (match) {
      const start = beforeCursor.lastIndexOf('@');
      const newValue =
        inputValue.substring(0, start) + `@${tableName} ` + inputValue.substring(cursorPosition);

      setInputValue(newValue);
      setShowMentions(false);

      // Set cursor position after the inserted mention
      const newPosition = start + tableName.length + 2; // +2 for @ and space
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.setSelectionRange(newPosition, newPosition);
          setCursorPosition(newPosition);
        }
      }, 0);
    } else {
      // If no match (user clicked @ button), insert at cursor
      const newValue =
        inputValue.substring(0, cursorPosition) +
        `@${tableName} ` +
        inputValue.substring(cursorPosition);

      setInputValue(newValue);
      setShowMentions(false);

      // Set cursor position after the inserted mention
      const newPosition = cursorPosition + tableName.length + 2; // +2 for @ and space
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.setSelectionRange(newPosition, newPosition);
          setCursorPosition(newPosition);
        }
      }, 0);
    }
  };

  // Send message on Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();

      if (showMentions) {
        // If mentions dropdown is open, pressing Enter should do nothing
        return;
      }

      handleSendMessage();
    }

    // Update cursor position for mention insertion
    if (e.key !== 'Enter' && e.key !== 'Tab') {
      setTimeout(() => {
        if (inputRef.current?.selectionStart) {
          setCursorPosition(inputRef.current.selectionStart);
        }
      }, 0);
    }

    // Close mentions dropdown on escape
    if (e.key === 'Escape') {
      setShowMentions(false);
    }
  };

  // Clear conversation history
  const clearConversation = async () => {
    if (!sessionId || isLoading) return;

    try {
      setIsLoading(true);
      await newRequest.delete(`/ai/chat/history/${sessionId}`);
      setMessages([]);
      contentAccumulatorRef.current = {};
    } catch (error) {
      console.error('Error clearing conversation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Stream response from AI
  const setupStreamConnection = (userMessageId: string, messageContent: string) => {
    // Cancel ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // New controller for this request
    abortControllerRef.current = new AbortController();

    // Initialize content accumulator
    const streamMessageId = `ai-${userMessageId}`;
    contentAccumulatorRef.current[streamMessageId] = '';

    // Create placeholder message
    const streamingMessage: Message = {
      id: streamMessageId,
      content: '',
      sender: 'ai',
      timestamp: new Date(),
      isStreaming: true,
    };

    // Add placeholder to messages
    setMessages((prev) => {
      return [...prev, streamingMessage];
    });
    setIsStreaming(true);
    userScrollingRef.current = false;

    try {
      const streamController = streamRequest({
        endpoint: '/ai/chat/stream',
        method: 'POST',
        data: {
          message: messageContent,
          sessionId: sessionId,
          pageContext: pageContext || null,
        },
        onStart: (data) => {
          // Save session ID
          if (data.sessionId && (!sessionId || sessionId !== data.sessionId)) {
            setSessionId(data.sessionId);
            localStorage.setItem('chatSessionId', data.sessionId);
          }
        },
        onChunk: (data) => {
          // Accumulate content
          if (data.content) {
            contentAccumulatorRef.current[streamMessageId] += data.content;
          }

          // Update DOM directly for streaming
          const streamElement = document.getElementById(`stream-content-${userMessageId}`);
          if (streamElement) {
            streamElement.textContent = contentAccumulatorRef.current[streamMessageId];
            if (!userScrollingRef.current) {
              scrollToBottom();
            }
          } else {
            // Fallback to React state update
            setMessages((prev) => {
              return prev.map((msg) => {
                if (msg.id === streamMessageId) {
                  return { ...msg, content: contentAccumulatorRef.current[streamMessageId] };
                }
                return msg;
              });
            });
          }
        },
        onEnd: () => {
          // Final update with complete content
          setMessages((prev) => {
            return prev.map((msg) => {
              if (msg.id === streamMessageId) {
                return {
                  ...msg,
                  content: contentAccumulatorRef.current[streamMessageId],
                  isStreaming: false,
                };
              }
              return msg;
            });
          });

          setIsStreaming(false);
          setIsLoading(false);
          abortControllerRef.current = null;
          setTimeout(scrollToBottom, 50);
        },
        onError: (error) => {
          console.error('Error in stream:', error);

          // Update with error message
          setMessages((prev) => {
            return prev.map((msg) => {
              if (msg.id === streamMessageId) {
                return {
                  ...msg,
                  content: 'Sorry, there was an error processing your request. Please try again.',
                  isStreaming: false,
                };
              }
              return msg;
            });
          });

          setIsStreaming(false);
          setIsLoading(false);
          abortControllerRef.current = null;
        },
      });

      // Store cancel function
      if (abortControllerRef.current) {
        const originalAbort = abortControllerRef.current.abort;
        abortControllerRef.current.abort = () => {
          streamController.cancel();
          originalAbort.call(abortControllerRef.current);
        };
      }
    } catch (error) {
      console.error('Error in setupStreamConnection:', error);

      // Update with error message
      setMessages((prev) => {
        return prev.map((msg) => {
          if (msg.id === streamMessageId) {
            return {
              ...msg,
              content: 'Connection error. Please try again later.',
              isStreaming: false,
            };
          }
          return msg;
        });
      });

      setIsStreaming(false);
      setIsLoading(false);
    }
  };

  // Send message handler
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const messageContent = inputValue.trim();

    // Create user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageContent,
      sender: 'user',
      timestamp: new Date(),
    };

    // Add to messages
    setMessages((prev) => {
      return [...prev, userMessage];
    });

    // Clear input
    setInputValue('');
    setIsLoading(true);
    userScrollingRef.current = false;
    setTimeout(scrollToBottom, 50);

    try {
      // Stream response
      setupStreamConnection(userMessage.id, messageContent);
    } catch (error) {
      console.error('Error sending message:', error);

      // Show error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, there was an error processing your request. Please try again.',
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages((prev) => {
        return [...prev, errorMessage];
      });
      setIsLoading(false);
    }
  };

  // Filter tables based on user input
  const filteredTables = React.useMemo(() => {
    if (!mentionFilter) return tables;
    return tables.filter((table) => {
      return table.name.toLowerCase().includes(mentionFilter.toLowerCase());
    });
  }, [tables, mentionFilter]);

  // Message component
  const MessageItem = React.memo(({ message }: { message: Message }) => {
    const messageRef = useRef<HTMLDivElement>(null);

    // Highlight new messages
    useEffect(() => {
      if (message.id === lastMessageIdRef.current && messageRef.current) {
        messageRef.current.classList.add('new-message-highlight');
        setTimeout(() => {
          messageRef.current?.classList.remove('new-message-highlight');
        }, 1000);
      }
    }, [message.id]);

    return (
      <div
        ref={messageRef}
        className={cn(
          'flex w-full max-w-[80%] gap-2 p-3 rounded-lg transition-all',
          message.sender === 'user' ? 'ml-auto bg-primary text-primary-foreground' : 'bg-muted',
        )}
      >
        {message.sender === 'ai' ? (
          <div className='text-sm leading-relaxed prose prose-sm dark:prose-invert prose-p:my-1 prose-pre:bg-zinc-800 prose-pre:dark:bg-zinc-900 prose-pre:p-2 prose-pre:rounded prose-code:text-xs prose-code:bg-zinc-200 prose-code:dark:bg-zinc-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-[""] prose-code:after:content-[""] prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-table:border-collapse prose-table:w-full prose-td:border prose-td:p-2 prose-th:border prose-th:p-2 prose-th:bg-muted max-w-full'>
            {message.isStreaming ? (
              <>
                <div
                  id={`stream-content-${message.id.replace('ai-', '')}`}
                  className='whitespace-pre-wrap'
                >
                  {message.content}
                </div>
                <span className='inline-block w-1.5 h-4 ml-1 bg-primary animate-pulse'></span>
              </>
            ) : (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
            )}
          </div>
        ) : (
          <p className='text-sm leading-relaxed'>{message.content}</p>
        )}
      </div>
    );
  });

  // Add display name
  MessageItem.displayName = 'MessageItem';

  // Message list component
  const MessageList = () => {
    return (
      <>
        {messages.length === 0 ? (
          <div className='text-center text-muted-foreground p-4'>
            <p className='text-sm'>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            return <MessageItem key={message.id} message={message} />;
          })
        )}
        <div ref={messagesEndRef} />
      </>
    );
  };

  // Chat panel content
  const ChatPanelContent = () => {
    return (
      <div className='flex flex-col h-full'>
        {/* Header */}
        <div className='bg-primary p-3 text-primary-foreground flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Avatar className='h-8 w-8'>
              <AvatarImage src='/ai-avatar.png' alt='AI Assistant' />
              <AvatarFallback className='bg-primary-foreground text-primary'>AI</AvatarFallback>
            </Avatar>
            <div>
              <h3 className='font-medium text-sm'>Pulse Assistant</h3>
              <p className='text-xs opacity-90'>How can I help you today?</p>
            </div>
          </div>
          <div className='flex items-center gap-1'>
            <Button
              variant='ghost'
              size='icon'
              className='h-7 w-7 rounded-full'
              onClick={clearConversation}
              disabled={!sessionId || isLoading || messages.length === 0}
              title='Clear conversation'
            >
              <Trash2 className='h-4 w-4' />
            </Button>
            <Button
              variant='ghost'
              size='icon'
              className='h-7 w-7 rounded-full'
              onClick={toggleChat}
              title='Close chat'
            >
              <X className='h-4 w-4' />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className='flex-1 p-3' ref={scrollAreaRef}>
          <div className='flex flex-col gap-3'>
            <MessageList />
          </div>
        </ScrollArea>

        {/* Enhanced Input Area */}
        <div className='p-3 border-t'>
          <div className='relative'>
            {/* Text Input */}
            <div className='flex flex-col rounded-md border bg-background overflow-hidden'>
              <TextareaAutosize
                ref={inputRef}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder='Type a message...'
                className='min-h-[56px] resize-none flex-1 px-3 pt-3 pb-9 text-sm bg-transparent border-none ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0'
                disabled={isLoading}
                maxRows={6}
              />

              {/* Controls */}
              <div className='absolute bottom-0 left-0 right-0 p-1.5 flex items-center justify-between border-t bg-muted/50'>
                <div className='flex items-center gap-1'>
                  {/* @ Mention Button */}
                  <Button
                    ref={mentionTriggerRef}
                    variant='ghost'
                    size='icon'
                    className='h-7 w-7 rounded-full text-muted-foreground hover:text-foreground'
                    onClick={handleAtButtonClick}
                    title='Mention a table'
                  >
                    <AtSign className='h-4 w-4' />
                  </Button>

                  {/* Attachment Button (placeholder) */}
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-7 w-7 rounded-full text-muted-foreground hover:text-foreground'
                    title='Add attachment'
                  >
                    <Paperclip className='h-4 w-4' />
                  </Button>
                </div>

                {/* Send Button */}
                <Button
                  onClick={handleSendMessage}
                  size='sm'
                  className={cn(
                    'h-7 rounded-full px-3',
                    (!inputValue.trim() || isLoading) && 'opacity-50 cursor-not-allowed',
                  )}
                  disabled={!inputValue.trim() || isLoading}
                >
                  <Send className='h-3.5 w-3.5 mr-1' />
                  <span className='text-xs'>Send</span>
                </Button>
              </div>
            </div>

            {/* Table Mention Dropdown */}
            {showMentions && (
              <div className='absolute bottom-full left-0 mb-1 w-full bg-popover rounded-md border shadow-md'>
                <Command className='rounded-lg'>
                  <CommandInput
                    placeholder='Search tables...'
                    value={mentionFilter}
                    onValueChange={setMentionFilter}
                    className='h-9'
                  />
                  <CommandEmpty>No tables found</CommandEmpty>
                  <CommandGroup className='max-h-60 overflow-auto'>
                    {filteredTables.map((table) => {
                      return (
                        <CommandItem
                          key={table.id}
                          value={table.name}
                          onSelect={() => {
                            return handleSelectMention(table.name);
                          }}
                          className='flex items-center justify-between'
                        >
                          <div className='flex items-center'>
                            <div className='bg-primary/10 text-primary p-1 rounded mr-2'>
                              <span className='text-xs font-mono'>@{table.name}</span>
                            </div>
                            {table.description && (
                              <span className='text-xs text-muted-foreground truncate max-w-[150px]'>
                                {table.description}
                              </span>
                            )}
                          </div>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </Command>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // This wrapper component handles the resizable panel layout
  const LayoutWithPanel = () => {
    if (!isOpen) return null;

    return (
      <div className='fixed inset-0 z-40 bg-transparent' style={{ pointerEvents: 'none' }}>
        <PanelGroup direction='horizontal' autoSaveId='chat-panel-layout'>
          <Panel defaultSize={80} minSize={60} style={{ pointerEvents: 'auto' }}>
            <div className='invisible'>Content space</div>
          </Panel>

          <PanelResizeHandle
            className='w-1 transition-colors bg-border hover:bg-primary'
            style={{ pointerEvents: 'auto' }}
          />

          <Panel
            defaultSize={20}
            minSize={15}
            maxSize={50}
            className='bg-background border-l'
            style={{ pointerEvents: 'auto' }}
          >
            <ChatPanelContent />
          </Panel>
        </PanelGroup>
      </div>
    );
  };

  return (
    <>
      {/* Trigger Button - only show when chat is closed */}
      {!isOpen && (
        <div className='fixed bottom-4 right-4 z-50'>
          <Button
            onClick={toggleChat}
            variant='default'
            size='icon'
            className='h-12 w-12 rounded-full shadow-lg'
          >
            <MessageCircle />
          </Button>
        </div>
      )}

      {/* Resizable Panel System */}
      <LayoutWithPanel />

      {/* Styles */}
      <style jsx global>{`
        @keyframes highlight {
          0% {
            background-color: rgba(59, 130, 246, 0.2);
          }
          100% {
            background-color: transparent;
          }
        }
        .new-message-highlight {
          animation: highlight 1s ease-out;
        }

        /* Table styles for markdown content */
        .prose table {
          width: 100%;
          border-collapse: collapse;
          margin: 1em 0;
          overflow-x: auto;
          display: block;
        }
        .prose thead {
          background-color: rgba(0, 0, 0, 0.05);
        }
        .prose th {
          font-weight: 600;
          border: 1px solid rgba(0, 0, 0, 0.2);
          padding: 0.5em;
        }
        .prose td {
          border: 1px solid rgba(0, 0, 0, 0.2);
          padding: 0.5em;
        }
        .dark .prose th,
        .dark .prose td {
          border-color: rgba(255, 255, 255, 0.2);
        }
        .dark .prose thead {
          background-color: rgba(255, 255, 255, 0.05);
        }
      `}</style>
    </>
  );
}

export default ChatWidget;
