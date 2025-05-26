'use client';

import { newRequest, streamRequest } from '@/utils/newRequest';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { usePathname, useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useRef, useState } from 'react';

type StreamEndData = {
  sessionId?: string;
  isNewConversation?: boolean;
};

export type Message = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  isStreaming?: boolean;
  attachments?: {
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
  }[];
};

export type ChatSession = {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messages: Message[];
};

export type ChatContextType = {
  // Session state
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  setCurrentSession: (session: ChatSession | null) => void;
  addSession: (session: ChatSession) => void;
  updateSession: (sessionId: string, updates: Partial<ChatSession>) => void;
  deleteSession: (sessionId: string) => void;
  sessionId: string | null;
  setSessionId: (sessionId: string | null) => void;
  isLoadingSessions: boolean;
  loadChatHistory: (sessionId: string) => Promise<void>;

  // Chat state
  messages: Message[];
  isTyping: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  handleSend: (content: string, attachments?: File[]) => void;
  handleActionCardClick: (title: string) => void;
  handleAttach: () => void;
  handleVoiceMessage: () => void;
  clearConversation: () => Promise<void>;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  // Session state
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const isChatRoute = pathname?.startsWith('/dashboard/chat');

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const contentAccumulatorRef = useRef<{ [key: string]: string }>({});
  const queryClient = useQueryClient();

  // Fetch conversations using React Query
  const { data: conversations = [], isLoading: isLoadingConversations } = useQuery({
    queryKey: ['chat-conversations'],
    queryFn: async () => {
      const response = await newRequest.get('/new-ai/chat/conversations');
      return response.data.conversations.map((conv: any) => {
        return {
          id: conv._id,
          title: conv.title || 'New Conversation',
          lastMessage: '',
          timestamp: new Date(conv.lastActive),
          messages: [],
        };
      });
    },
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep unused data in cache for 5 minutes
    enabled: isChatRoute, // Only run query on chat route
  });

  // Load chat history using React Query
  const { data: chatHistory, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['chat-history', sessionId],
    queryFn: async () => {
      if (!sessionId) return [];
      const response = await newRequest.get(`/new-ai/chat/history/${sessionId}`);
      return response.data.conversation.messages.map((msg: any) => {
        return {
          id: `${msg.role}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          content: msg.content,
          role: msg.role,
          timestamp: new Date(response.data.conversation.lastActive),
        };
      });
    },
    enabled: !!sessionId && isChatRoute, // Only run query on chat route and when sessionId exists
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
  });

  // Prefetch chat history for all conversations
  useEffect(() => {
    if (!isChatRoute) return; // Only prefetch on chat route

    conversations.forEach((conv) => {
      queryClient.prefetchQuery({
        queryKey: ['chat-history', conv.id],
        queryFn: async () => {
          const response = await newRequest.get(`/new-ai/chat/history/${conv.id}`);
          return response.data.conversation.messages.map((msg: any) => {
            return {
              id: `${msg.role}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              content: msg.content,
              role: msg.role,
              timestamp: new Date(response.data.conversation.lastActive),
            };
          });
        },
        staleTime: 30000,
        gcTime: 5 * 60 * 1000,
      });
    });
  }, [conversations, queryClient, isChatRoute]);

  // Update sessions when conversations data changes
  useEffect(() => {
    if (!isChatRoute) return; // Only update sessions on chat route
    setSessions(conversations);
    setIsLoadingSessions(isLoadingConversations);
  }, [conversations, isLoadingConversations, isChatRoute]);

  // Update messages when chat history changes
  useEffect(() => {
    if (!isChatRoute) return; // Only update messages on chat route
    if (chatHistory) {
      setMessages(chatHistory);
    }
  }, [chatHistory, isChatRoute]);

  // Load sessions from localStorage on mount
  useEffect(() => {
    if (!isChatRoute) return; // Only load from localStorage on chat route
    const savedSessions = localStorage.getItem('chat-sessions');
    if (savedSessions) {
      try {
        const parsedSessions = JSON.parse(savedSessions);
        setSessions(
          parsedSessions.map((session: any) => {
            return {
              ...session,
              timestamp: new Date(session.timestamp),
            };
          }),
        );
      } catch (error) {
        console.error('Error loading chat sessions:', error);
      }
    }
  }, [isChatRoute]);

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    if (!isChatRoute) return; // Only save to localStorage on chat route
    localStorage.setItem('chat-sessions', JSON.stringify(sessions));
  }, [sessions, isChatRoute]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (!isChatRoute) return; // Only scroll on chat route
    scrollToBottom();
  }, [messages, isTyping, isChatRoute]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addSession = (session: ChatSession) => {
    setSessions((prev) => {
      return [...prev, session];
    });
  };

  const updateSession = (sessionId: string, updates: Partial<ChatSession>) => {
    setSessions((prev) => {
      return prev.map((session) => {
        return session.id === sessionId ? { ...session, ...updates } : session;
      });
    });
  };

  const deleteSession = async (sessionId: string) => {
    setSessions((prev) => {
      return prev.filter((session) => {
        return session.id !== sessionId;
      });
    });
    if (currentSession?.id === sessionId) {
      setCurrentSession(null);
    }

    await newRequest.delete(`/new-ai/chat/history/${sessionId}`);
  };

  const handleSend = async (content: string, attachments?: File[]) => {
    if (!content.trim() && (!attachments || attachments.length === 0)) return;

    // Create user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date(),
    };

    // Handle attachments if any
    if (attachments && attachments.length > 0) {
      const formData = new FormData();
      attachments.forEach((file) => {
        formData.append('files', file);
      });

      try {
        const response = await newRequest.post('/new-ai/chat/upload', formData);
        userMessage.attachments = response.data.files.map((file: any) => {
          return {
            id: file.id,
            name: file.name,
            type: file.type,
            size: file.size,
            url: file.url,
          };
        });
      } catch (error) {
        console.error('Error uploading files:', error);
        // Continue with message even if file upload fails
      }
    }

    // Optimistically update messages
    setMessages((prev) => {
      return [...prev, userMessage];
    });

    // Create placeholder message for AI response
    const streamMessageId = `ai-${userMessage.id}`;
    const streamingMessage: Message = {
      id: streamMessageId,
      content: '',
      role: 'assistant',
      timestamp: new Date(),
      isStreaming: true,
    };

    // Optimistically add streaming message
    setMessages((prev) => {
      return [...prev, streamingMessage];
    });

    setIsTyping(true);

    // Cancel any ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // New controller for this request
    abortControllerRef.current = new AbortController();

    // Initialize content accumulator
    contentAccumulatorRef.current[streamMessageId] = '';

    try {
      const streamController = streamRequest({
        endpoint: '/new-ai/chat/stream',
        method: 'POST',
        data: {
          message: content,
          sessionId: sessionId || undefined,
          attachments: userMessage.attachments,
        },
        onStart: () => {
          // Remove session handling from onStart since it's now in onEnd
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
        onEnd: (data) => {
          if (data.sessionId && (!sessionId || sessionId !== data.sessionId)) {
            setSessionId(data.sessionId);
            localStorage.setItem('chatSessionId', data.sessionId);

            // Update URL with session ID as a path parameter
            const url = new URL(window.location.href);
            const pathParts = url.pathname.split('/');
            // Remove any existing session ID from the path
            const basePath = pathParts
              .filter((part) => {
                return !part.match(/^[0-9a-f]{24}$/);
              })
              .join('/');
            // Add the new session ID
            url.pathname = `${basePath}/${data.sessionId}`;
            window.history.pushState({}, '', url.toString());

            // Invalidate queries when a new conversation starts
            queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
            queryClient.invalidateQueries({ queryKey: ['chat-history', data.sessionId] });
          }

          // Update messages with final content
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

          // Update conversation list with new message
          queryClient.setQueryData(['chat-conversations'], (oldData: any) => {
            if (!oldData) return oldData;
            return oldData.map((conv: any) => {
              if (conv.id === data.sessionId) {
                return {
                  ...conv,
                  lastMessage: contentAccumulatorRef.current[streamMessageId],
                  timestamp: new Date(),
                };
              }
              return conv;
            });
          });

          setIsTyping(false);
          abortControllerRef.current = null;
        },
        onError: (error) => {
          console.error('Error in stream:', error);
          // Remove the streaming message on error
          setMessages((prev) => {
            return prev.filter((msg) => {
              return msg.id !== streamMessageId;
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
      // Remove the streaming message on error
      setMessages((prev) => {
        return prev.filter((msg) => {
          return msg.id !== streamMessageId;
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
      setMessages([]);
      contentAccumulatorRef.current = {};
      setSessionId(null);
      localStorage.removeItem('chatSessionId');

      // Invalidate queries when clearing conversation
      queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
      queryClient.invalidateQueries({ queryKey: ['chat-history'] });

      router.push('/dashboard/chat');
    } catch (error) {
      console.error('Error clearing conversation:', error);
    }
  };

  // Load chat history for a session
  const loadChatHistory = async (sessionId: string) => {
    try {
      if (!sessionId) return;

      const response = await newRequest.get(`/new-ai/chat/history/${sessionId}`);
      const { conversation } = response.data;

      // Map the messages to our Message type
      const history = conversation.messages.map((msg: any) => {
        return {
          id: `${msg.role}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Generate a unique ID since we don't have one in the response
          content: msg.content,
          role: msg.role,
          timestamp: new Date(conversation.lastActive), // Using lastActive as timestamp since we don't have per-message timestamps
        };
      });

      // Update the current session with the conversation title
      if (currentSession?.id === sessionId) {
        updateSession(sessionId, {
          title: conversation.title,
          lastMessage: history[history.length - 1]?.content || '',
          timestamp: new Date(conversation.lastActive),
        });
      }

      setMessages(history);
    } catch (error) {
      console.error('Error loading chat history:', error);
      setMessages([]);
    }
  };

  // Modify setCurrentSession to load history
  const setCurrentSessionWithHistory = async (session: ChatSession | null) => {
    setCurrentSession(session);
    if (session) {
      await loadChatHistory(session.id);
    } else {
      setMessages([]);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        // Session state
        sessions,
        currentSession,
        setCurrentSession: setCurrentSessionWithHistory,
        addSession,
        updateSession,
        deleteSession,
        sessionId,
        setSessionId,
        isLoadingSessions,
        loadChatHistory,

        // Chat state
        messages,
        isTyping,
        messagesEndRef,
        handleSend,
        handleActionCardClick,
        handleAttach,
        handleVoiceMessage,
        clearConversation,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
