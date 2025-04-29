'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { newRequest, streamRequest } from '@/utils/newRequest';
import { Maximize2, MessageCircle, Minimize2, RefreshCw, SendIcon, Trash2, X } from 'lucide-react';
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import FocusLock from 'react-focus-lock';
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
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Safe scrolling that doesn't interfere with user focus
  const scrollToBottom = useCallback(() => {
    if (!shouldAutoScroll || !scrollAreaRef.current) return;
    // We need to access scrollAreaRef.current.scrollTo, but ScrollArea from shadcn doesn't
    // directly expose this. Let's find the actual scrollable element.
    const scrollableElement = scrollAreaRef.current.querySelector(
      '[data-radix-scroll-area-viewport]',
    );
    if (scrollableElement) {
      scrollableElement.scrollTop = scrollableElement.scrollHeight;
    }
  }, [shouldAutoScroll]);

  // Improved scroll detection that's less aggressive
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    // Get the actual target as it will be the scrollable viewport
    const target = e.target as HTMLDivElement;
    const { scrollHeight, scrollTop, clientHeight } = target;
    // Consider "at bottom" if within 100px of the bottom
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShouldAutoScroll(isAtBottom);
  };

  // Scroll after messages update
  useLayoutEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Set up persistent focus handling
  useEffect(() => {
    // Load session ID when component mounts
    const savedSessionId = localStorage.getItem('chatSessionId');
    if (savedSessionId) {
      setSessionId(savedSessionId);
    }

    // Clean up on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    // Reset full screen when closing chat
    if (isOpen) {
      setIsFullScreen(false);
    }
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  // Fixed input change handler to maintain cursor position
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const cursorPosition = e.target.selectionStart;
    const value = e.target.value;

    setInput(value);

    // Use requestAnimationFrame to restore cursor position after render
    requestAnimationFrame(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.selectionStart = cursorPosition;
        inputRef.current.selectionEnd = cursorPosition;
      }
    });
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
    } catch (error) {
      console.error('Error clearing conversation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Explicitly enable auto-scrolling when user sends a message
  const enableAutoScroll = useCallback(() => {
    setShouldAutoScroll(true);
  }, []);

  const pollJobStatus = async (jobId: string) => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    setIsPolling(true);

    // Poll every 2 seconds
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const response = await newRequest.get(`/ai/chat/status/${jobId}`);
        const { status, answer, sessionId: newSessionId } = response.data;

        if (status === 'completed') {
          // Save session ID if it's new
          if (newSessionId && (!sessionId || sessionId !== newSessionId)) {
            setSessionId(newSessionId);
            localStorage.setItem('chatSessionId', newSessionId);
          }

          // Add AI response to messages
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: answer || 'Sorry, I could not process your request.',
            sender: 'ai',
            timestamp: new Date(),
          };

          setMessages((prev) => {
            return [...prev, aiMessage];
          });

          // Clear polling
          clearInterval(pollingIntervalRef.current!);
          pollingIntervalRef.current = null;
          setIsPolling(false);
          setJobId(null);
          setIsLoading(false);
        } else if (status === 'failed') {
          // Handle failed job
          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: 'Sorry, there was an error processing your request. Please try again.',
            sender: 'ai',
            timestamp: new Date(),
          };

          setMessages((prev) => {
            return [...prev, errorMessage];
          });

          // Clear polling
          clearInterval(pollingIntervalRef.current!);
          pollingIntervalRef.current = null;
          setIsPolling(false);
          setJobId(null);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error polling job status:', error);

        // Add error message
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: 'Error checking message status. Please try again later.',
          sender: 'ai',
          timestamp: new Date(),
        };

        setMessages((prev) => {
          return [...prev, errorMessage];
        });

        // Clear polling
        clearInterval(pollingIntervalRef.current!);
        pollingIntervalRef.current = null;
        setIsPolling(false);
        setJobId(null);
        setIsLoading(false);
      }
    }, 2000);
  };

  const setupStreamConnection = (userMessageId: string) => {
    // Cancel any ongoing stream request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create a new AbortController for this request
    abortControllerRef.current = new AbortController();

    // Create empty AI message placeholder for streaming
    const streamingMessage: Message = {
      id: `ai-${userMessageId}`,
      content: '',
      sender: 'ai',
      timestamp: new Date(),
      isStreaming: true,
    };

    setMessages((prev) => {
      return [...prev, streamingMessage];
    });
    setIsStreaming(true);
    enableAutoScroll();

    try {
      // Use our streamRequest utility instead of fetch
      const streamController = streamRequest({
        endpoint: '/ai/chat/stream',
        method: 'POST',
        data: {
          message: input.trim(),
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
          // Update streaming message with new chunk
          setMessages((prev) => {
            return prev.map((msg) => {
              if (msg.id === `ai-${userMessageId}`) {
                return {
                  ...msg,
                  content: msg.content + (data.content || ''),
                };
              }
              return msg;
            });
          });
        },
        onEnd: () => {
          // Streaming is complete
          setMessages((prev) => {
            return prev.map((msg) => {
              if (msg.id === `ai-${userMessageId}`) {
                return { ...msg, isStreaming: false };
              }
              return msg;
            });
          });
          setIsStreaming(false);
          setIsLoading(false);
          abortControllerRef.current = null;
        },
        onError: (error) => {
          console.error('Error in stream:', error);

          // Handle error during streaming
          setMessages((prev) => {
            return prev.map((msg) => {
              if (msg.id === `ai-${userMessageId}`) {
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
          if (msg.id === `ai-${userMessageId}`) {
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
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => {
      return [...prev, userMessage];
    });
    setInput('');
    setIsLoading(true);
    enableAutoScroll();

    try {
      // Use streaming API
      setupStreamConnection(userMessage.id);
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

  const ChatContent = () => {
    return (
      <div className='shadow-lg border bg-background overflow-hidden h-full w-full'>
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
          className={cn('p-3', isFullScreen ? 'h-[calc(100vh-110px)]' : 'h-96')}
          onScrollCapture={handleScroll}
          ref={scrollAreaRef}
        >
          <div className='flex flex-col gap-3'>
            {messages.length === 0 ? (
              <div className='text-center text-muted-foreground p-4'>
                <p className='text-sm'>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => {
                return (
                  <div
                    key={message.id}
                    className={cn(
                      'flex w-full max-w-[80%] gap-2 p-3 rounded-lg',
                      message.sender === 'user'
                        ? 'ml-auto bg-primary text-primary-foreground'
                        : 'bg-muted',
                    )}
                  >
                    {message.sender === 'ai' ? (
                      <div className='text-sm leading-relaxed prose prose-sm dark:prose-invert prose-p:my-1 prose-pre:bg-zinc-800 prose-pre:dark:bg-zinc-900 prose-pre:p-2 prose-pre:rounded prose-code:text-xs prose-code:bg-zinc-200 prose-code:dark:bg-zinc-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-[""] prose-code:after:content-[""] prose-a:text-primary prose-a:no-underline hover:prose-a:underline max-w-full'>
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                        {message.isStreaming && (
                          <span className='inline-block w-1.5 h-4 ml-1 bg-primary animate-pulse'></span>
                        )}
                      </div>
                    ) : (
                      <p className='text-sm leading-relaxed'>{message.content}</p>
                    )}
                  </div>
                );
              })
            )}
            {isPolling && (
              <div className='flex items-center justify-center py-2'>
                <RefreshCw className='h-4 w-4 animate-spin text-muted-foreground' />
                <span className='ml-2 text-xs text-muted-foreground'>
                  Processing your request...
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Chat Input with FocusLock */}
        <FocusLock disabled={!isOpen} returnFocus>
          <div className='p-3 border-t'>
            <div className='flex gap-2'>
              <TextareaAutosize
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder='Type a message...'
                className='min-h-[40px] max-h-[120px] resize-none flex-1 px-3 py-2 text-sm rounded-md border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                disabled={isLoading}
                autoFocus={isOpen}
                maxRows={4}
              />
              <Button
                onClick={handleSendMessage}
                size='icon'
                disabled={!input.trim() || isLoading}
                className={cn('shrink-0', isLoading && 'opacity-50 cursor-not-allowed')}
              >
                <SendIcon className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </FocusLock>
      </div>
    );
  };

  return (
    <div className='fixed bottom-4 right-4 z-50'>
      {/* Chat Button */}
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

      {/* Use Dialog only for fullscreen mode */}
      {isFullScreen ? (
        <Dialog
          open={isOpen}
          onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) setIsFullScreen(false);
          }}
        >
          <DialogContent className='p-0 border-none shadow-lg fixed inset-0 w-full h-full max-w-full translate-x-0 translate-y-0 top-0 left-0 rounded-none'>
            <ChatContent />
          </DialogContent>
        </Dialog>
      ) : (
        // Use custom positioning for the small widget at bottom right
        isOpen && (
          <div className='absolute bottom-16 right-0 w-80 md:w-96 rounded-lg shadow-lg overflow-hidden animate-in slide-in-from-bottom duration-300'>
            <ChatContent />
          </div>
        )
      )}
    </div>
  );
}

export default ChatWidget;
