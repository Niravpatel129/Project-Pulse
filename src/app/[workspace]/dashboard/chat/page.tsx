'use client';

import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatInput } from '@/components/chat/ChatInput';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { WelcomeScreen } from '@/components/chat/WelcomeScreen';
import { useEffect, useRef, useState } from 'react';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

const mockResponses = [
  "I'd be happy to help you with that! Let me break this down for you...",
  "That's an interesting question. Here's what I think about it:",
  "Based on what you've shared, I can suggest a few approaches:",
  'Let me provide you with a comprehensive answer to that:',
  "Great question! Here's my take on this topic:",
];

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (content: string) => {
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

    // Mock AI response with delay
    setTimeout(() => {
      const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: randomResponse,
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages((prev) => {
        return [...prev, assistantMessage];
      });
      setIsTyping(false);
    }, 1500 + Math.random() * 1000); // Random delay between 1.5-2.5s
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
    // Mock file attachment
    console.log('File attachment clicked');
  };

  const handleVoiceMessage = () => {
    // Mock voice message
    console.log('Voice message clicked');
  };

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
                {messages.map((message) => {
                  return <ChatMessage key={message.id} message={message} />;
                })}
                {isTyping && <TypingIndicator />}
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
