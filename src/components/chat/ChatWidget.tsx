'use client';

import { Button } from '@/components/ui/button';
import { useChat } from '@/contexts/ChatContext';
import { PageContext, useChatWidget } from '@/hooks/useChatWidget';
import { cn } from '@/lib/utils';
import { ArrowUp, MessageCircle, Settings, Trash2, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import ChatAvatar from './ChatAvatar/ChatAvatar';
import ChatSettings from './ChatSettings';
import MessageItem from './MessageItem';

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
    wiggle,
    setWiggle,
  } = useChatWidget(pageContext);

  const { currentSession, addSession, updateSession } = useChat();

  // Settings state
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);

  // Panel resize state - set default without localStorage for SSR
  const [panelWidth, setPanelWidth] = useState(500);

  // Client-side rendering state
  const [mounted, setMounted] = useState(false);

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
      setMounted(true);
    }
  }, []);

  // Update chat session when messages change
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      const title = messages[0]?.content.slice(0, 30) + '...' || 'New Chat';

      if (currentSession) {
        updateSession(currentSession.id, {
          title,
          lastMessage: lastMessage.content,
          messages: messages.map((msg) => {
            return {
              ...msg,
              role: msg.sender === 'user' ? 'user' : 'assistant',
            };
          }),
          timestamp: new Date(),
        });
      } else {
        addSession({
          id: Date.now().toString(),
          title,
          lastMessage: lastMessage.content,
          messages: messages.map((msg) => {
            return {
              ...msg,
              role: msg.sender === 'user' ? 'user' : 'assistant',
            };
          }),
          timestamp: new Date(),
        });
      }
    }
  }, [messages, currentSession, addSession, updateSession]);

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
      <div className='p-4'>
        <div className='relative'>
          {/* Selected Mentions Tags */}
          {selectedMentions.length > 0 && (
            <div className='flex flex-wrap gap-1 p-2 rounded-t-md border-t border-x'>
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
              'flex flex-col overflow-hidden relative border-[#e6e3e2] border-2 rounded-lg',
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

                  handleSendMessage();
                  return;
                }

                if (e.key === 'Escape' && showMentions) {
                  e.preventDefault();
                  setShowMentions(false);
                }
              }}
              placeholder={isStreaming ? 'Type to queue next message...' : 'Ask anything...'}
              className='min-h-[56px] resize-none w-full px-3 py-3 pr-[70px] text-sm bg-transparent border-none ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-white'
              maxRows={6}
            />

            {/* Controls */}
            <div className='absolute bottom-3 right-2 flex items-center gap-1'>
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

              {/* Send Button */}
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                size='sm'
                className='h-8 w-8'
              >
                <ArrowUp className='aspect-square h-10 w-10 p-0' />
              </Button>
            </div>
          </div>
        </div>
        <div className='text-xs text-[#9b9897] text-center mt-1 font-thin'>
          AI can make mistakes. Please double check the responses.
        </div>
      </div>
    );
  };

  const toggleSettingsPanel = () => {
    setShowSettingsPanel(!showSettingsPanel);
  };

  // Render the chat widget
  // Only render UI elements after client-side mount to prevent hydration mismatch
  return (
    <>
      {/* Only render chat elements after mount */}
      {mounted && (
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
              className='fixed inset-0 z-40 pointer-events-none overflow-hidden '
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
                style={{ zIndex: -1 }}
              />

              {/* The actual chat panel */}
              <div
                className='absolute top-0 bottom-0 right-0  border-l shadow-lg pointer-events-auto flex flex-col bg-[#efeceb]'
                style={{
                  width: `${panelWidth}px`,
                  isolation: 'isolate',
                  position: 'fixed',
                  height: '100vh',
                  zIndex: 50,
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
                <div className='bg-[#efeceb] border-b-2 border-b-[#e5e4e0] p-3 text-[#676767] flex items-center justify-between shrink-0'>
                  <div className='flex items-center gap-2'>
                    <ChatAvatar wiggle={wiggle} setWiggle={setWiggle} />

                    <div>
                      <h3 className='font-medium text-sm'>
                        {showSettingsPanel ? 'Settings' : 'Pulse Assistant'}
                      </h3>
                      <p className='text-xs opacity-90'>
                        {showSettingsPanel
                          ? 'Customize your assistant'
                          : 'How can I help you today?'}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center gap-1'>
                    {!showSettingsPanel && (
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
                    )}
                    <Button
                      variant={showSettingsPanel ? 'secondary' : 'ghost'}
                      size='icon'
                      className='h-7 w-7 rounded-full'
                      onClick={toggleSettingsPanel}
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

                {/* Messages or Settings container */}
                {showSettingsPanel ? (
                  <ChatSettings
                    onClose={() => {
                      return setShowSettingsPanel(false);
                    }}
                  />
                ) : (
                  <>
                    {/* Messages container - using native scrolling instead of ScrollArea */}
                    <div
                      ref={scrollAreaRef}
                      className='flex-1 overflow-y-auto p-3 messages-container scrollbar-hide'
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
                      <div className='flex flex-col gap-3 scrollbar-hide'>
                        <MessageList />
                      </div>
                    </div>

                    {/* Input area */}
                    <ChatInputArea />
                  </>
                )}
              </div>
            </div>
          )}

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
            .fixed.inset-0.z-40 {
              isolation: isolate;
              contain: layout style size;
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
      )}
    </>
  );
}

export default ChatWidget;
