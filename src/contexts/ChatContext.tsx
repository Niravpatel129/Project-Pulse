'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export type ChatSession = {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messages: any[]; // Using any[] for now, can be typed more specifically later
};

type ChatContextType = {
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  setCurrentSession: (session: ChatSession | null) => void;
  addSession: (session: ChatSession) => void;
  updateSession: (sessionId: string, updates: Partial<ChatSession>) => void;
  deleteSession: (sessionId: string) => void;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);

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

  return (
    <ChatContext.Provider
      value={{
        sessions,
        currentSession,
        setCurrentSession,
        addSession,
        updateSession,
        deleteSession,
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
