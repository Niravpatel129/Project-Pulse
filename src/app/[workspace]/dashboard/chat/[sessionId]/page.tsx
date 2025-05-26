'use client';

import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatInput } from '@/components/chat/ChatInput';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { WelcomeScreen } from '@/components/chat/WelcomeScreen';
import { useChat } from '@/contexts/ChatContext';
import { useParams } from 'next/navigation';
import { useEffect, useMemo } from 'react';

export default function ChatSession() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const {
    messages,
    isTyping,
    messagesEndRef,
    handleSend,
    handleActionCardClick,
    handleAttach,
    handleVoiceMessage,
    setSessionId,
  } = useChat();

  const samplePrompts = useMemo(() => {
    return [
      {
        category: 'Writing',
        prompts: [
          'Write a professional email to request a meeting',
          'Create a compelling product description for a new smartphone',
          'Draft a cover letter for a job application',
          'Write a blog post about sustainable living',
        ],
      },
      {
        category: 'Creative',
        prompts: [
          'Write a short story about a time traveler',
          'Create a poem about the changing seasons',
          'Describe a futuristic city in the year 2150',
          'Write a dialogue between two historical figures',
        ],
      },
      {
        category: 'Professional',
        prompts: [
          'Create a weekly project status update template',
          'Draft a performance review for a team member',
          'Write a business proposal for a new service',
          'Create a marketing strategy for a small business',
        ],
      },
      {
        category: 'Technical',
        prompts: [
          'Explain how blockchain technology works',
          'Write a tutorial on setting up a home network',
          'Create documentation for a REST API',
          'Explain quantum computing in simple terms',
        ],
      },
    ];
  }, []);

  // Set the session ID from the URL when the component mounts
  useEffect(() => {
    if (sessionId) {
      setSessionId(sessionId);
    }
  }, [sessionId, setSessionId]);

  const hasMessages = useMemo(() => {
    return messages.length > 0;
  }, [messages]);

  const memoizedMessages = useMemo(() => {
    return (
      <div className='px-6 py-6'>
        <div className='mx-auto max-w-3xl space-y-6'>
          {messages.map((message, index) => {
            const isLatestMessage = index === messages.length - 1;
            return (
              <ChatMessage
                key={message.id}
                message={message}
                isTyping={isTyping}
                isLatestMessage={isLatestMessage}
              />
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>
    );
  }, [messages, isTyping, messagesEndRef]);

  const memoizedWelcomeScreen = useMemo(() => {
    return <WelcomeScreen onActionCardClick={handleActionCardClick} />;
  }, [handleActionCardClick]);

  const memoizedChatInput = useMemo(() => {
    return (
      <ChatInput
        onSend={handleSend}
        isTyping={isTyping}
        onAttach={handleAttach}
        onVoiceMessage={handleVoiceMessage}
        samplePrompts={samplePrompts}
      />
    );
  }, [handleSend, isTyping, handleAttach, handleVoiceMessage, samplePrompts]);

  return (
    <div className='flex flex-col h-screen bg-white dark:bg-background w-full'>
      <ChatHeader />

      <main className='flex-1 flex flex-col overflow-hidden'>
        {/* Content area (welcome screen or chat messages) */}
        <div className='flex-1 overflow-y-auto bg-background'>
          {!hasMessages ? memoizedWelcomeScreen : memoizedMessages}
        </div>

        {/* Chat input */}
        {memoizedChatInput}
      </main>
    </div>
  );
}
