'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { newRequest, streamRequest } from '@/utils/newRequest';
import { Maximize2, MessageCircle, Minimize2, RefreshCw, SendIcon, Trash2, X } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import TextareaAutosize from 'react-textarea-autosize';

type Message = {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isStreaming?: boolean;
};

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  // Store accumulated content for each streaming message
  const contentAccumulatorRef = useRef<{ [key: string]: string }>({});
  // Prevent autoscroll on user interaction
  const userScrollingRef = useRef(false);
  // Track last message ID for scroll position restoration
  const lastMessageIdRef = useRef<string | null>(null);

  // Load session ID from localStorage on component mount
  useEffect(() => {
    const savedSessionId = localStorage.getItem('chatSessionId');
    if (savedSessionId) {
      setSessionId(savedSessionId);
    }
  }, []);

  // Auto-scroll to bottom when messages array length changes
  useEffect(() => {
    if (messages.length > 0 && !userScrollingRef.current) {
      scrollToBottom();
    }
    // Track the latest message for scroll restoration
    if (messages.length > 0) {
      lastMessageIdRef.current = messages[messages.length - 1].id;
    }
  }, [messages.length]);

  // Scroll to bottom helper function
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'instant' });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, []);

  // Handle scroll events to detect user scrolling
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

  const toggleChat = () => {
    setIsOpen(!isOpen);
    // Reset full screen when closing chat
    if (isOpen) {
      setIsFullScreen(false);
    } else {
      // Focus input when opening chat
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
      // Delay scroll to make sure the chat is fully rendered
      setTimeout(scrollToBottom, 100);
    }
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
    // Refocus after state change
    setTimeout(() => {
      inputRef.current?.focus();
      scrollToBottom();
    }, 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearConversation = async () => {
    if (!sessionId || isLoading) return;

    try {
      setIsLoading(true);
      await newRequest.delete(`/ai/chat/history/${sessionId}`);
      setMessages([]);
      // Clear content accumulator
      contentAccumulatorRef.current = {};
    } catch (error) {
      console.error('Error clearing conversation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setupStreamConnection = (userMessageId: string, messageContent: string) => {
    // Cancel any ongoing stream request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create a new AbortController for this request
    abortControllerRef.current = new AbortController();

    // Initialize content accumulator for this message
    const streamMessageId = `ai-${userMessageId}`;
    contentAccumulatorRef.current[streamMessageId] = '';

    // Create empty AI message placeholder for streaming
    const streamingMessage: Message = {
      id: streamMessageId,
      content: '',
      sender: 'ai',
      timestamp: new Date(),
      isStreaming: true,
    };

    // Add streaming placeholder message to state
    setMessages((prev) => {
      return [...prev, streamingMessage];
    });
    setIsStreaming(true);

    // Reset user scrolling when starting a new stream
    userScrollingRef.current = false;

    try {
      const streamController = streamRequest({
        endpoint: '/ai/chat/stream',
        method: 'POST',
        data: {
          message: messageContent,
          sessionId: sessionId,
        },
        onStart: (data) => {
          // Save session ID if it's new
          if (data.sessionId && (!sessionId || sessionId !== data.sessionId)) {
            setSessionId(data.sessionId);
            localStorage.setItem('chatSessionId', data.sessionId);
          }
        },
        onChunk: (data) => {
          // Accumulate content outside of React state
          if (data.content) {
            contentAccumulatorRef.current[streamMessageId] += data.content;
          }

          // Update DOM directly for streaming content
          const streamElement = document.getElementById(`stream-content-${userMessageId}`);
          if (streamElement) {
            // Use innerHTML to update content without re-rendering
            const formattedContent = contentAccumulatorRef.current[streamMessageId];
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = `<div class="markdown-content">${formattedContent}</div>`;

            // Replace content to prevent ReactMarkdown from re-parsing
            while (streamElement.firstChild) {
              streamElement.removeChild(streamElement.firstChild);
            }
            streamElement.appendChild(tempDiv);

            // Scroll only if user isn't manually scrolling
            if (!userScrollingRef.current) {
              scrollToBottom();
            }
          } else {
            // If element not found, update via React state (should only happen once)
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
          // Final state update with complete message
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

          // Clean up after streaming completes
          setIsStreaming(false);
          setIsLoading(false);
          abortControllerRef.current = null;
          // Scroll to bottom after final update
          setTimeout(scrollToBottom, 50);
        },
        onError: (error) => {
          console.error('Error in stream:', error);

          // Handle error during streaming
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

      // Store cancel function in abortController ref
      if (abortControllerRef.current) {
        const originalAbort = abortControllerRef.current.abort;
        abortControllerRef.current.abort = () => {
          streamController.cancel();
          originalAbort.call(abortControllerRef.current);
        };
      }
    } catch (error) {
      console.error('Error in setupStreamConnection:', error);

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

  const handleSendMessage = async () => {
    if (!inputRef.current || !inputRef.current.value.trim() || isLoading) return;

    const messageContent = inputRef.current.value.trim();

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageContent,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => {
      return [...prev, userMessage];
    });

    // Clear the input field
    inputRef.current.value = '';
    setIsLoading(true);

    // Reset user scrolling when sending a new message
    userScrollingRef.current = false;
    setTimeout(scrollToBottom, 50);

    try {
      // Use streaming API
      setupStreamConnection(userMessage.id, messageContent);
    } catch (error) {
      console.error('Error sending message:', error);

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

  // Optimized message rendering with memoization to prevent re-renders
  const MessageItem = React.memo(({ message }: { message: Message }) => {
    const messageRef = useRef<HTMLDivElement>(null);

    // Effect to highlight newly rendered messages
    useEffect(() => {
      if (message.id === lastMessageIdRef.current && messageRef.current) {
        // Add a subtle highlight animation for new messages
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
          <div className='text-sm leading-relaxed prose prose-sm dark:prose-invert prose-p:my-1 prose-pre:bg-zinc-800 prose-pre:dark:bg-zinc-900 prose-pre:p-2 prose-pre:rounded prose-code:text-xs prose-code:bg-zinc-200 prose-code:dark:bg-zinc-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-[""] prose-code:after:content-[""] prose-a:text-primary prose-a:no-underline hover:prose-a:underline max-w-full'>
            {message.isStreaming ? (
              <>
                <div id={`stream-content-${message.id.replace('ai-', '')}`}>
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
                <span className='inline-block w-1.5 h-4 ml-1 bg-primary animate-pulse'></span>
              </>
            ) : (
              <ReactMarkdown>{message.content}</ReactMarkdown>
            )}
          </div>
        ) : (
          <p className='text-sm leading-relaxed'>{message.content}</p>
        )}
      </div>
    );
  });

  // Add display name to the memoized component
  MessageItem.displayName = 'MessageItem';

  // Optimize message list rendering
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
        {isPolling && (
          <div className='flex items-center justify-center py-2'>
            <RefreshCw className='h-4 w-4 animate-spin text-muted-foreground' />
            <span className='ml-2 text-xs text-muted-foreground'>Processing your request...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </>
    );
  };

  const ChatContent = () => {
    return (
      <div className='shadow-lg border rounded-lg bg-background overflow-hidden h-full w-full'>
        {/* Chat Header */}
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
              onClick={toggleFullScreen}
              title={isFullScreen ? 'Exit full screen' : 'Full screen view'}
            >
              {isFullScreen ? <Minimize2 className='h-4 w-4' /> : <Maximize2 className='h-4 w-4' />}
            </Button>
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
            {!isFullScreen && (
              <Button
                variant='ghost'
                size='icon'
                className='h-7 w-7 rounded-full'
                onClick={toggleChat}
                title='Close chat'
              >
                <X className='h-4 w-4' />
              </Button>
            )}
          </div>
        </div>

        {/* Chat Messages */}
        <ScrollArea
          className={cn('p-3', isFullScreen ? 'h-[calc(80vh-85px)]' : 'h-96')}
          ref={scrollAreaRef}
        >
          <div className='flex flex-col gap-3'>
            <MessageList />
          </div>
        </ScrollArea>

        {/* Chat Input */}
        <div className='p-3 border-t'>
          <div className='flex gap-2'>
            <TextareaAutosize
              ref={inputRef}
              onKeyDown={handleKeyDown}
              placeholder='Type a message...'
              className='min-h-[40px] max-h-[120px] resize-none flex-1 px-3 py-2 text-sm rounded-md border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
              disabled={isLoading}
              maxRows={4}
              autoFocus={isOpen}
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
    );
  };

  return (
    <div className='fixed bottom-4 right-4 z-50'>
      {/* Chat Button */}
      {!isOpen && (
        <Button
          onClick={toggleChat}
          variant='default'
          size='icon'
          className={cn(
            'h-12 w-12 rounded-full shadow-lg transition-all duration-300',
            isOpen && !isFullScreen && 'rotate-45 bg-destructive hover:bg-destructive/90',
          )}
        >
          {isOpen && !isFullScreen ? <X /> : <MessageCircle />}
        </Button>
      )}

      {isFullScreen ? (
        <Dialog
          open={isOpen}
          onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) setIsFullScreen(false);
          }}
        >
          <DialogContent className='max-w-3xl w-[90vw] h-[85vh] p-0 border-none shadow-none overflow-hidden focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0'>
            <DialogTitle className='sr-only'>Pulse Assistant</DialogTitle>
            <ChatContent />
          </DialogContent>
        </Dialog>
      ) : (
        isOpen && (
          <div className='absolute bottom-2 right-0 w-80 md:w-96 rounded-lg shadow-lg overflow-hidden animate-in slide-in-from-bottom duration-300'>
            <ChatContent />
          </div>
        )
      )}

      {/* Add styles for message highlight animation */}
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
      `}</style>
    </div>
  );
}

export default ChatWidget;
