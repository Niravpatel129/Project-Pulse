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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Message, PageContext, useChatWidget } from '@/hooks/useChatWidget';
import { cn } from '@/lib/utils';
import { MessageCircle, Send, Settings, Trash2, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import TextareaAutosize from 'react-textarea-autosize';
import remarkGfm from 'remark-gfm';

type ChatWidgetProps = {
  pageContext?: PageContext;
};

export function ChatWidget({ pageContext }: ChatWidgetProps = {}) {
  const {
    // State
    isOpen,
    messages,
    isLoading,
    isStreaming,
    showMentions,
    selectedMentions,
    filteredTables,

    // Refs
    inputRef,
    messagesEndRef,
    scrollAreaRef,

    // Actions
    toggleChat,
    handleInputChange,
    handleAtButtonClick,
    handleKeyDown,
    handleSendMessage,
    clearConversation,
    handleSelectMention,
    removeMention,
    handleStopStreaming,
    setShowMentions,
  } = useChatWidget(pageContext);

  // Settings dialog state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [contextSettings, setContextSettings] = useState('');

  // Panel resize state - set default without localStorage for SSR
  const [panelWidth, setPanelWidth] = useState(350);

  const [isResizing, setIsResizing] = useState(false);
  const resizeStartXRef = useRef(0);
  const initialWidthRef = useRef(0);

  // Initialize panel width from localStorage after mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedWidth = localStorage.getItem('chat-panel-width');
      if (savedWidth) {
        setPanelWidth(parseInt(savedWidth, 10));
      }
    }
  }, []);

  // Handle settings changes
  const handleContextSettingsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContextSettings(e.target.value);
  };

  const handleSaveSettings = () => {
    // Save context settings to localStorage
    localStorage.setItem('chat-context-settings', contextSettings);
    setIsSettingsOpen(false);
  };

  // Load settings on initial render
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('chat-context-settings');
      if (savedSettings) {
        setContextSettings(savedSettings);
      }
    }
  }, []);

  // Block body scrolling when chat is open
  useEffect(() => {
    if (isOpen) {
      // Save the current body overflow
      const originalOverflow = document.body.style.overflow;

      // Block body scrolling
      document.body.classList.add('chat-open');

      // Restore on cleanup
      return () => {
        document.body.classList.remove('chat-open');
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Implement custom scrolling for the messages container
  useEffect(() => {
    if (!isOpen || !scrollAreaRef.current) return;

    const messagesContainer = scrollAreaRef.current;

    // Custom wheel event handler
    const handleWheel = (e: WheelEvent) => {
      // Stop propagation immediately
      e.preventDefault();
      e.stopPropagation();

      // Calculate new scroll position (positive deltaY should scroll down)
      messagesContainer.scrollTop += e.deltaY;
    };

    // Add event listeners
    messagesContainer.addEventListener('wheel', handleWheel, { passive: false });

    // Clean up
    return () => {
      messagesContainer.removeEventListener('wheel', handleWheel);
    };
  }, [isOpen, scrollAreaRef]);

  // Handle resize start
  const handleResizeStart = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsResizing(true);
    resizeStartXRef.current = e.clientX;
    initialWidthRef.current = panelWidth;

    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
  };

  // Handle resize events
  useEffect(() => {
    const handleResizeMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const deltaX = resizeStartXRef.current - e.clientX;
      const newWidth = Math.min(
        Math.max(initialWidthRef.current + deltaX, 250),
        window.innerWidth * 0.5,
      );
      setPanelWidth(newWidth);
    };

    const handleResizeEnd = () => {
      setIsResizing(false);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';

      // Save width to localStorage when resizing ends
      if (typeof window !== 'undefined') {
        localStorage.setItem('chat-panel-width', panelWidth.toString());
      }
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleResizeMove);
      window.addEventListener('mouseup', handleResizeEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleResizeMove);
      window.removeEventListener('mouseup', handleResizeEnd);
    };
  }, [isResizing, panelWidth]);

  // Adjust layout when chat is open
  useEffect(() => {
    if (isOpen) {
      // Add class to body to trigger layout adjustments
      document.body.classList.add('chat-open');

      // Add padding to body to create space for chat panel
      document.body.style.paddingRight = `${panelWidth}px`;
      document.body.style.transition = 'padding-right 0.2s ease';

      // Adjust fixed elements
      const fixedElements = document.querySelectorAll(
        'header.fixed, header.sticky, .fixed.top-0, nav.fixed',
      );
      fixedElements.forEach((el) => {
        if (el instanceof HTMLElement) {
          el.style.width = `calc(100% - ${panelWidth}px)`;
          el.style.transition = 'width 0.2s ease';
        }
      });
    } else {
      // Remove class from body
      document.body.classList.remove('chat-open');

      // Reset body padding
      document.body.style.paddingRight = '0';

      // Reset fixed elements
      const fixedElements = document.querySelectorAll(
        'header.fixed, header.sticky, .fixed.top-0, nav.fixed',
      );
      fixedElements.forEach((el) => {
        if (el instanceof HTMLElement) {
          el.style.width = '100%';
        }
      });
    }

    return () => {
      // Clean up
      document.body.classList.remove('chat-open');
      document.body.style.paddingRight = '0';
      document.body.style.transition = '';

      // Reset fixed elements
      const fixedElements = document.querySelectorAll(
        'header.fixed, header.sticky, .fixed.top-0, nav.fixed',
      );
      fixedElements.forEach((el) => {
        if (el instanceof HTMLElement) {
          el.style.width = '100%';
          el.style.transition = '';
        }
      });
    };
  }, [isOpen, panelWidth]);

  // Update during resize
  useEffect(() => {
    if (isOpen && isResizing) {
      // Update body padding
      document.body.style.paddingRight = `${panelWidth}px`;

      // Update fixed elements
      const fixedElements = document.querySelectorAll(
        'header.fixed, header.sticky, .fixed.top-0, nav.fixed',
      );
      fixedElements.forEach((el) => {
        if (el instanceof HTMLElement) {
          el.style.width = `calc(100% - ${panelWidth}px)`;
        }
      });
    }
  }, [isOpen, panelWidth, isResizing]);

  // Message component
  const MessageItem = React.memo(({ message }: { message: Message }) => {
    const messageRef = useRef<HTMLDivElement>(null);

    return (
      <div
        ref={messageRef}
        className={cn(
          'flex w-full max-w-[80%] gap-2 p-3 rounded-lg transition-all',
          message.sender === 'user' ? 'ml-auto bg-primary text-primary-foreground' : 'bg-muted',
        )}
      >
        <div className='flex flex-col w-full'>
          {/* Show mentions as tags if present */}
          {message.mentions && message.mentions.length > 0 && (
            <div className='flex flex-wrap gap-1 mb-2'>
              {message.mentions.map((mention) => {
                return (
                  <div
                    key={mention.id}
                    className='px-2 py-0.5 text-xs rounded-full bg-primary-foreground/20 flex items-center'
                  >
                    <span>@{mention.name}</span>
                  </div>
                );
              })}
            </div>
          )}

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

  // Enhanced Input Area component
  const ChatInputArea = () => {
    return (
      <div className='p-3 border-t'>
        <div className='relative'>
          {/* Selected Mentions Tags */}
          {selectedMentions.length > 0 && (
            <div className='flex flex-wrap gap-1 p-2 bg-background rounded-t-md border-t border-x'>
              {selectedMentions.map((mention) => {
                return (
                  <div
                    key={mention.id}
                    className='px-2 py-1 text-xs rounded-full bg-primary/10 flex items-center gap-1'
                  >
                    <span>@{mention.name}</span>
                    <button
                      onClick={() => {
                        return removeMention(mention.id);
                      }}
                      className='h-4 w-4 rounded-full hover:bg-muted flex items-center justify-center'
                    >
                      <X className='h-3 w-3' />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Text Input */}
          <div
            className={cn(
              'flex flex-col rounded-md border bg-background overflow-hidden',
              selectedMentions.length > 0 && 'rounded-t-none border-t-0',
            )}
          >
            <TextareaAutosize
              ref={inputRef}
              // Use defaultValue instead of value to make this an uncontrolled component
              defaultValue=''
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();

                  if (showMentions) {
                    return; // If mentions dropdown is open, do nothing
                  }

                  handleSendMessage(contextSettings);
                  return;
                }

                if (e.key === 'Escape' && showMentions) {
                  e.preventDefault();
                  setShowMentions(false);
                }
              }}
              placeholder={isStreaming ? 'Type to queue next message...' : 'Type a message...'}
              className='min-h-[56px] resize-none flex-1 px-3 pt-3 pb-9 text-sm bg-transparent border-none ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0'
              maxRows={6}
            />

            {/* Controls */}
            <div className='absolute bottom-0 left-0 right-0 p-1.5 flex items-center justify-between border-t bg-muted/50'>
              <div className='flex items-center gap-1'>
                {isStreaming && (
                  <Button
                    onClick={handleStopStreaming}
                    variant='ghost'
                    size='sm'
                    className='text-destructive'
                  >
                    <X className='h-3.5 w-3.5 mr-1' />
                    <span className='text-xs'>Stop</span>
                  </Button>
                )}
              </div>

              {/* Send Button */}
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  handleSendMessage(contextSettings);
                }}
                size='sm'
              >
                <Send className='h-3.5 w-3.5 mr-1' />
                <span className='text-xs'>{isStreaming ? 'Interrupt & Send' : 'Send'}</span>
              </Button>
            </div>
          </div>

          {/* Table Mention Dropdown */}
          {showMentions && (
            <div className='absolute bottom-full left-0 mb-1 w-full bg-popover rounded-md border shadow-md'>
              <Command className='rounded-lg'>
                <CommandInput placeholder='Search tables...' className='h-9' />
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
    );
  };

  // Render the chat widget
  return (
    <>
      {/* Floating trigger button - only shown when chat is closed */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className='fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors'
          aria-label='Open chat'
        >
          <MessageCircle className='h-5 w-5' />
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div
          className='fixed inset-0 z-50 pointer-events-none overflow-hidden'
          aria-hidden='false'
          style={{
            contain: 'strict',
            isolation: 'isolate',
          }}
        >
          {/* Invisible backdrop to capture clicks outside the panel */}
          <div
            className='absolute inset-0 bg-transparent pointer-events-auto'
            onClick={toggleChat}
          />

          {/* The actual chat panel */}
          <div
            className='absolute top-0 bottom-0 right-0 bg-background border-l shadow-lg pointer-events-auto flex flex-col'
            style={{
              width: `${panelWidth}px`,
              isolation: 'isolate',
              position: 'fixed',
              height: '100vh',
              zIndex: 999,
            }}
            onClick={(e) => {
              return e.stopPropagation();
            }}
          >
            {/* Resize handle */}
            <div
              className='absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50 z-10'
              onMouseDown={handleResizeStart}
            />

            {/* Header */}
            <div className='bg-primary p-3 text-primary-foreground flex items-center justify-between shrink-0'>
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
                  disabled={messages.length === 0 || isLoading}
                  title='Clear conversation'
                >
                  <Trash2 className='h-4 w-4' />
                </Button>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-7 w-7 rounded-full'
                  onClick={() => {
                    return setIsSettingsOpen(true);
                  }}
                  title='Settings'
                >
                  <Settings className='h-4 w-4' />
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

            {/* Messages container - using native scrolling instead of ScrollArea */}
            <div
              ref={scrollAreaRef}
              className='flex-1 overflow-y-auto p-3 messages-container'
              // Prevent touch scrolling from propagating on mobile
              onTouchStart={(e) => {
                return e.stopPropagation();
              }}
              onTouchMove={(e) => {
                return e.stopPropagation();
              }}
              onTouchEnd={(e) => {
                return e.stopPropagation();
              }}
            >
              <div className='flex flex-col gap-3'>
                <MessageList />
              </div>
            </div>

            {/* Input area */}
            <ChatInputArea />
          </div>
        </div>
      )}

      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className='sm:max-w-[500px]'>
          <DialogHeader>
            <DialogTitle>Assistant Settings</DialogTitle>
            <DialogDescription>
              Configure context settings to customize how the assistant responds to your queries.
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='context'>Context Information</Label>
              <Textarea
                id='context'
                placeholder='Enter information you want to include in the AI prompt (e.g., project details, preferences, background information)'
                className='h-40'
                value={contextSettings}
                onChange={handleContextSettingsChange}
              />
              <p className='text-xs text-muted-foreground'>
                This information will be passed to the AI to provide better, more tailored
                responses.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                return setIsSettingsOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveSettings}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Styles */}
      <style jsx global>{`
        /* Control body scrolling when chat is open */
        body.chat-open {
          /* Prevent default scrolling on the main body */
          overflow: hidden !important;
        }

        /* Adjust fixed/sticky elements when chat is open */
        header.fixed,
        header.sticky,
        .fixed.top-0,
        nav.fixed {
          transition: width 0.2s ease;
        }

        /* Create a full isolation barrier between chat panel and main content */
        .fixed.inset-0.z-50 {
          isolation: isolate;
          contain: layout style size;
          z-index: 9999 !important;
        }

        /* Prevent body scrolling when chat is open on mobile */
        @media (max-width: 768px) {
          body.chat-open {
            position: fixed;
            width: 100%;
            height: 100%;
            padding-right: 0 !important; /* Don't add padding on mobile */
          }
        }

        /* Extreme isolation for messages container */
        .messages-container {
          /* Scroll isolation properties */
          overscroll-behavior: contain;
          -ms-overflow-style: none;
          scrollbar-width: thin;

          /* Create a new stacking context and isolate from parent */
          isolation: isolate;
          contain: strict;

          /* Prevent touch propagation */
          touch-action: pan-y;

          /* Additional scroll properties for iOS */
          -webkit-overflow-scrolling: touch;
        }

        /* Styling for scrollbar */
        .messages-container::-webkit-scrollbar {
          width: 4px;
        }

        .messages-container::-webkit-scrollbar-track {
          background: transparent;
        }

        .messages-container::-webkit-scrollbar-thumb {
          background-color: rgba(0, 0, 0, 0.2);
          border-radius: 2px;
        }

        .dark .messages-container::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.2);
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
