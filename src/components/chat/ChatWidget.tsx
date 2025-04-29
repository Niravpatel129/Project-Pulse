'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { newRequest } from '@/utils/newRequest';
import { MessageCircle, RefreshCw, SendIcon, Trash2, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

type Message = {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
};

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll to bottom of messages when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Load session ID from localStorage when component mounts
  useEffect(() => {
    const savedSessionId = localStorage.getItem('chatSessionId');
    if (savedSessionId) {
      setSessionId(savedSessionId);
    }

    return () => {
      // Clear polling interval when component unmounts
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
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

    try {
      const response = await newRequest.post('/ai/chat', {
        message: userMessage.content,
        sessionId: sessionId,
      });

      // Check if the response indicates a queued job
      if (response.data.status === 'processing' && response.data.jobId) {
        // Save the job ID
        const newJobId = response.data.jobId;
        setJobId(newJobId);

        // Save session ID if it's new
        if (response.data.sessionId && (!sessionId || sessionId !== response.data.sessionId)) {
          setSessionId(response.data.sessionId);
          localStorage.setItem('chatSessionId', response.data.sessionId);
        }

        // Start polling for job status
        pollJobStatus(newJobId);
      } else {
        // Direct response (not queued)
        // Save session ID if it's returned
        if (response.data.sessionId && (!sessionId || sessionId !== response.data.sessionId)) {
          setSessionId(response.data.sessionId);
          localStorage.setItem('chatSessionId', response.data.sessionId);
        }

        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: response.data.answer || 'Sorry, I could not process your request.',
          sender: 'ai',
          timestamp: new Date(),
        };

        setMessages((prev) => {
          return [...prev, aiMessage];
        });
        setIsLoading(false);
      }
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

  return (
    <div className='fixed bottom-4 right-4 z-50'>
      {/* Chat Button */}
      <Button
        onClick={toggleChat}
        variant='default'
        size='icon'
        className={cn(
          'h-12 w-12 rounded-full shadow-lg transition-all duration-300',
          isOpen && 'rotate-45 bg-destructive hover:bg-destructive/90',
        )}
      >
        {isOpen ? <X /> : <MessageCircle />}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <div className='absolute bottom-16 right-0 w-80 md:w-96 rounded-lg shadow-lg border bg-background overflow-hidden animate-in slide-in-from-bottom duration-300'>
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
                onClick={clearConversation}
                disabled={!sessionId || isLoading || messages.length === 0}
                title='Clear conversation'
              >
                <Trash2 className='h-4 w-4' />
              </Button>
            </div>
          </div>

          {/* Chat Messages */}
          <ScrollArea className='h-96 p-3'>
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
                      <p className='text-sm leading-relaxed'>{message.content}</p>
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

          {/* Chat Input */}
          <div className='p-3 border-t'>
            <div className='flex gap-2'>
              <Textarea
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder='Type a message...'
                className='min-h-[40px] max-h-[120px] resize-none'
                disabled={isLoading}
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
        </div>
      )}
    </div>
  );
}

export default ChatWidget;
