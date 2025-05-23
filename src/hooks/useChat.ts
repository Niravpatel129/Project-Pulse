import { newRequest, streamRequest } from '@/utils/newRequest';
import { useEffect, useRef, useState } from 'react';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  isStreaming?: boolean;
}

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const contentAccumulatorRef = useRef<{ [key: string]: string }>({});

  // Load session ID from localStorage on component mount
  useEffect(() => {
    const savedSessionId = localStorage.getItem('chatSessionId');
    if (savedSessionId) {
      setSessionId(savedSessionId);
    }
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (content: string) => {
    if (!content.trim()) return;

    // Create user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => {
      return [...prev, userMessage];
    });
    setIsTyping(true);

    // Cancel any ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // New controller for this request
    abortControllerRef.current = new AbortController();

    // Initialize content accumulator
    const streamMessageId = `ai-${userMessage.id}`;
    contentAccumulatorRef.current[streamMessageId] = '';

    // Create placeholder message
    const streamingMessage: Message = {
      id: streamMessageId,
      content: '',
      role: 'assistant',
      timestamp: new Date(),
      isStreaming: true,
    };

    setMessages((prev) => {
      return [...prev, streamingMessage];
    });

    try {
      const streamController = streamRequest({
        endpoint: '/ai/chat/stream',
        method: 'POST',
        data: {
          message: content,
          sessionId: sessionId,
        },
        onStart: (data) => {
          if (data.sessionId && (!sessionId || sessionId !== data.sessionId)) {
            setSessionId(data.sessionId);
            localStorage.setItem('chatSessionId', data.sessionId);
          }
        },
        onChunk: (data) => {
          if (data.content) {
            contentAccumulatorRef.current[streamMessageId] += data.content;
            setMessages((prev) => {
              return prev.map((msg) => {
                return msg.id === streamMessageId
                  ? { ...msg, content: contentAccumulatorRef.current[streamMessageId] }
                  : msg;
              });
            });
          }
        },
        onEnd: () => {
          setMessages((prev) => {
            return prev.map((msg) => {
              return msg.id === streamMessageId
                ? {
                    ...msg,
                    content: contentAccumulatorRef.current[streamMessageId],
                    isStreaming: false,
                  }
                : msg;
            });
          });
          setIsTyping(false);
          abortControllerRef.current = null;
        },
        onError: (error) => {
          console.error('Error in stream:', error);
          setMessages((prev) => {
            return prev.map((msg) => {
              return msg.id === streamMessageId
                ? {
                    ...msg,
                    content: 'Sorry, there was an error processing your request. Please try again.',
                    isStreaming: false,
                  }
                : msg;
            });
          });
          setIsTyping(false);
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
      setMessages((prev) => {
        return prev.map((msg) => {
          return msg.id === streamMessageId
            ? {
                ...msg,
                content: 'Connection error. Please try again later.',
                isStreaming: false,
              }
            : msg;
        });
      });
      setIsTyping(false);
    }
  };

  const handleActionCardClick = (title: string) => {
    const prompts = {
      'Write copy': 'Help me write compelling copy for my landing page',
      'Image generation': 'Generate an image of a futuristic cityscape at sunset',
      'Create avatar': 'Create a professional avatar for my LinkedIn profile',
      'Write code': 'Write a React component for a todo list application',
    };

    const prompt = prompts[title as keyof typeof prompts] || `Help me with ${title.toLowerCase()}`;
    handleSend(prompt);
  };

  const handleAttach = () => {
    // TODO: Implement file attachment
    console.log('File attachment clicked');
  };

  const handleVoiceMessage = () => {
    // TODO: Implement voice message
    console.log('Voice message clicked');
  };

  const clearConversation = async () => {
    if (!sessionId) return;

    try {
      await newRequest.delete(`/ai/chat/history/${sessionId}`);
      setMessages([]);
      contentAccumulatorRef.current = {};
      setSessionId(null);
      localStorage.removeItem('chatSessionId');
    } catch (error) {
      console.error('Error clearing conversation:', error);
    }
  };

  return {
    messages,
    isTyping,
    messagesEndRef,
    handleSend,
    handleActionCardClick,
    handleAttach,
    handleVoiceMessage,
    clearConversation,
  };
};
