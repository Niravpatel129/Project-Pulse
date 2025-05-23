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

export const useChat = () => {
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

  return {
    messages,
    isTyping,
    messagesEndRef,
    handleSend,
    handleActionCardClick,
    handleAttach,
    handleVoiceMessage,
  };
};
