'use client';

import { newRequest, streamRequest } from '@/utils/newRequest';
import { useRouter } from 'next/navigation';
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
  handleSend: (content: string) => void;
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

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const contentAccumulatorRef = useRef<{ [key: string]: string }>({});
  const router = useRouter();

  // Fetch conversations from the API
  const fetchConversations = async () => {
    try {
      setIsLoadingSessions(true);
      const response = await newRequest.get('/new-ai/chat/conversations');
      const conversations = response.data.conversations.map((conv: any) => {
        return {
          id: conv._id,
          title: conv.title || 'New Conversation',
          lastMessage: '', // We don't have lastMessage in the response
          timestamp: new Date(conv.lastActive),
          messages: [], // We don't have messages in the response
        };
      });
      setSessions(conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  // Load sessions from API on mount
  useEffect(() => {
    fetchConversations();
  }, []);

  // Load sessions from localStorage on mount
  useEffect(() => {
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
  }, []);

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('chat-sessions', JSON.stringify(sessions));
  }, [sessions]);

  // Load session ID from localStorage on component mount
  useEffect(() => {
    // First try to get session ID from URL
    const pathParts = window.location.pathname.split('/');
    const urlSessionId = pathParts.find((part) => {
      return part.match(/^[0-9a-f]{24}$/);
    });

    if (urlSessionId) {
      setSessionId(urlSessionId);
      localStorage.setItem('chatSessionId', urlSessionId);
    } else {
      // Fall back to localStorage if no session ID in URL
      const savedSessionId = localStorage.getItem('chatSessionId');
      if (savedSessionId) {
        setSessionId(savedSessionId);
      }
    }
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

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

  const deleteSession = (sessionId: string) => {
    setSessions((prev) => {
      return prev.filter((session) => {
        return session.id !== sessionId;
      });
    });
    if (currentSession?.id === sessionId) {
      setCurrentSession(null);
    }
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
        endpoint: '/new-ai/chat/stream',
        method: 'POST',
        data: {
          message: content,
          sessionId: sessionId || undefined,
        },
        onStart: (data) => {
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

            // If this is a new conversation, we might want to update the title
            if (data.isNewConversation) {
              // You can add logic here to update the conversation title if needed
              console.log('New conversation started:', data.sessionId);
            }
          }

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

      router.push('/dashboard/chat');
    } catch (error) {
      console.error('Error clearing conversation:', error);
    }
  };

  // Load chat history for a session
  const loadChatHistory = async (sessionId: string) => {
    try {
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
