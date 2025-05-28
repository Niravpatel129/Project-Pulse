'use client';

import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatInput } from '@/components/chat/ChatInput';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { WelcomeScreen } from '@/components/chat/WelcomeScreen';
import { useChat } from '@/contexts/ChatContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const samplePrompts = [
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

export default function Home() {
  const router = useRouter();
  const {
    messages,
    isTyping,
    messagesEndRef,
    handleSend,
    handleActionCardClick,
    handleAttach,
    handleVoiceMessage,
    sessionId,
  } = useChat();

  // Redirect to session page if we have a session ID
  useEffect(() => {
    if (sessionId) {
      router.push(`/dashboard/chat/${sessionId}`);
    }
  }, [sessionId, router]);

  const hasMessages = messages.length > 0;

  return (
    <div className='flex flex-col h-screen bg-white dark:bg-background w-full'>
      <ChatHeader />

      <main className='flex-1 flex flex-col overflow-hidden'>
        {/* Content area (welcome screen or chat messages) */}
        <div className='flex-1 overflow-y-auto bg-background'>
          {!hasMessages ? (
            <WelcomeScreen onActionCardClick={handleActionCardClick} />
          ) : (
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
          )}
        </div>

        {/* Chat input */}
        <ChatInput
          onSend={handleSend}
          isTyping={isTyping}
          onAttach={handleAttach}
          onVoiceMessage={handleVoiceMessage}
          samplePrompts={samplePrompts}
        />
      </main>
    </div>
  );
}
