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
import { Message, PageContext, useChatWidget } from '@/hooks/useChatWidget';
import { cn } from '@/lib/utils';
import { MessageCircle, Send, Trash2, X } from 'lucide-react';
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
  } = useChatWidget(pageContext);

  // Panel resize state
  const [panelWidth, setPanelWidth] = useState(350);
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartXRef = useRef(0);
  const initialWidthRef = useRef(0);

  // Update body padding when chat panel width changes
  useEffect(() => {
    if (isOpen) {
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
    } else {
      document.body.style.paddingRight = '0px';

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
  }, [isOpen, panelWidth]);

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
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleResizeMove);
      window.addEventListener('mouseup', handleResizeEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleResizeMove);
      window.removeEventListener('mouseup', handleResizeEnd);
    };
  }, [isResizing]);

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
              onKeyDown={handleKeyDown}
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
              <Button onClick={handleSendMessage} size='sm'>
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
              disabled={messages.length === 0 || isLoading}
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
        <ScrollArea className='flex-1 p-3 overflow-y-auto' ref={scrollAreaRef}>
          <div className='flex flex-col gap-3'>
            <MessageList />
          </div>
        </ScrollArea>

        {/* Use the custom input area component */}
        <ChatInputArea />
      </div>
    );
  };

  // Update the LayoutWithPanel component to properly handle resize and content shifting
  const LayoutWithPanel = () => {
    if (!isOpen) return null;

    return (
      <div className='fixed inset-0 z-40 flex h-screen'>
        <div className='relative flex flex-grow'>
          {/* Main content area - empty but takes up space */}
          <div className='flex-grow'></div>

          {/* Chat panel */}
          <div
            id='chat-panel'
            className={cn(
              'bg-background border-l shadow-lg h-full flex flex-col relative',
              isResizing && 'select-none transition-none',
            )}
            style={{ width: `${panelWidth}px`, minWidth: '250px', maxWidth: '50vw' }}
          >
            {/* Custom resize handle */}
            <div
              className={cn(
                'absolute left-0 top-0 bottom-0 cursor-col-resize transition-colors z-10',
                isResizing ? 'bg-primary w-px' : 'bg-border hover:bg-primary w-px',
              )}
              onMouseDown={handleResizeStart}
            ></div>

            {/* Overlay when resizing */}
            {isResizing && (
              <div className='absolute inset-0 bg-primary/5 z-10 pointer-events-none' />
            )}

            <ChatPanelContent />
          </div>
        </div>
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
