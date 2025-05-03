'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { newRequest, streamRequest } from '@/utils/newRequest';
import { MessageCircle, SendIcon, Trash2, X } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import TextareaAutosize from 'react-textarea-autosize';
import remarkGfm from 'remark-gfm';

type Message = {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isStreaming?: boolean;
};

type ChatWidgetProps = {
  pageContext?: {
    url?: string;
    title?: string;
    description?: string;
    [key: string]: any;
  };
};

export function ChatWidget({ pageContext }: ChatWidgetProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);
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
  }, []);

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
      .main-content {
        transition: margin-right 0.3s ease;
        margin-right: var(--content-margin-right, 0px);
      }
      
      @media (max-width: 768px) {
        .main-content {
          margin-right: 0 !important;
        }
      }
    `;
    document.head.appendChild(styleEl);

    // Apply the class to the main content element
    const mainContent = document.querySelector('main');
    if (mainContent) {
      mainContent.classList.add('main-content');
    }

    return () => {
      document.documentElement.style.setProperty('--content-margin-right', '0px');
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

  // Send message on Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
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
    if (!inputRef.current || !inputRef.current.value.trim() || isLoading) return;

    const messageContent = inputRef.current.value.trim();

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
    inputRef.current.value = '';
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

      {/* Chat Panel */}
      <div
        className={cn(
          'fixed top-0 right-0 bottom-0 w-[350px] bg-background border-l z-40 transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
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
        <ScrollArea className='flex-1 p-3 h-[calc(100vh-120px)]' ref={scrollAreaRef}>
          <div className='flex flex-col gap-3'>
            <MessageList />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className='p-3 border-t'>
          <div className='flex gap-2'>
            <TextareaAutosize
              ref={inputRef}
              onKeyDown={handleKeyDown}
              placeholder='Type a message...'
              className='min-h-[40px] max-h-[120px] resize-none flex-1 px-3 py-2 text-sm rounded-md border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
              disabled={isLoading}
              maxRows={4}
            />
            <Button
              onClick={handleSendMessage}
              size='icon'
              disabled={isLoading}
              className={cn('shrink-0', isLoading && 'opacity-50 cursor-not-allowed')}
            >
              <SendIcon className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </div>

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

        /* For mobile devices */
        @media (max-width: 768px) {
          .fixed.right-0.w-[350px] {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}

export default ChatWidget;
