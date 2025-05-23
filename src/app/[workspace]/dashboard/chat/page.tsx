'use client';

import type React from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Gift, HelpCircle, Mic, Moon, Paperclip, Plus, Search, Send, Sun, Zap } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useRef, useState } from 'react';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface PromptCategory {
  category: string;
  prompts: string[];
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

// Theme Toggle Component
function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant='ghost' size='icon' className='rounded-full relative h-8 w-8'>
        <Sun className='h-4 w-4 text-gray-500' />
        <div className='absolute right-1.5 bottom-1.5 w-1.5 h-1.5 bg-green-500 rounded-full'></div>
      </Button>
    );
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Button
      variant='ghost'
      size='icon'
      className='rounded-full relative h-8 w-8'
      onClick={toggleTheme}
    >
      <Sun className='h-4 w-4 text-gray-500 dark:text-gray-400 rotate-0 scale-100 transition-all duration-200 dark:-rotate-90 dark:scale-0' />
      <Moon className='absolute h-4 w-4 text-gray-500 dark:text-gray-400 rotate-90 scale-0 transition-all duration-200 dark:rotate-0 dark:scale-100' />
      <div className='absolute right-1.5 bottom-1.5 w-1.5 h-1.5 bg-green-500 rounded-full'></div>
    </Button>
  );
}

// Action Card Component
interface ActionCardProps {
  icon: string;
  iconBg: string;
  title: string;
  onClick?: () => void;
}

function ActionCard({ icon, iconBg, title, onClick }: ActionCardProps) {
  return (
    <Card
      className='p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors duration-200 cursor-pointer border border-gray-200 dark:border-gray-800 shadow-none'
      onClick={onClick}
    >
      <div className='flex items-center'>
        <div className={`w-8 h-8 rounded-md ${iconBg} flex items-center justify-center text-base`}>
          {icon}
        </div>
        <span className='ml-3 text-sm font-medium text-gray-900 dark:text-gray-100'>{title}</span>
      </div>
      <Button
        variant='ghost'
        size='icon'
        className='rounded-full h-7 w-7 hover:bg-gray-100 dark:hover:bg-gray-800'
      >
        <Plus className='h-4 w-4 text-gray-500 dark:text-gray-400' />
      </Button>
    </Card>
  );
}

// Chat Message Component
interface ChatMessageProps {
  message: Message;
}

function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
        <div
          className={`px-4 py-3 rounded-lg text-sm ${
            isUser
              ? 'bg-black text-white dark:bg-white dark:text-black'
              : 'bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100'
          }`}
        >
          {message.content}
        </div>
        <div
          className={`text-xs text-gray-400 dark:text-gray-500 mt-1 ${
            isUser ? 'text-right' : 'text-left'
          }`}
        >
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}

// Typing Indicator Component
function TypingIndicator() {
  return (
    <div className='flex justify-start'>
      <div className='max-w-[80%]'>
        <div className='bg-gray-100 dark:bg-gray-900 px-4 py-3 rounded-lg'>
          <div className='flex items-center space-x-1'>
            <div className='flex space-x-1'>
              <div className='w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce'></div>
              <div
                className='w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce'
                style={{ animationDelay: '0.1s' }}
              ></div>
              <div
                className='w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce'
                style={{ animationDelay: '0.2s' }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Prompt List Component
interface PromptListProps {
  categories: PromptCategory[];
  onSelectPrompt: (prompt: string) => void;
}

function PromptList({ categories, onSelectPrompt }: PromptListProps) {
  const [activeTab, setActiveTab] = useState(categories[0].category);

  return (
    <div className='overflow-hidden rounded-md'>
      <Tabs defaultValue={categories[0].category} onValueChange={setActiveTab} className='w-full'>
        <div className='border-b border-gray-100 dark:border-gray-800 px-3 py-2'>
          <TabsList className='grid w-full grid-cols-4 bg-gray-50 dark:bg-gray-900'>
            {categories.map((category) => {
              return (
                <TabsTrigger
                  key={category.category}
                  value={category.category}
                  className='text-xs font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800'
                >
                  {category.category}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>
        <ScrollArea className='h-64'>
          {categories.map((category) => {
            return (
              <TabsContent key={category.category} value={category.category} className='p-0 mt-0'>
                <div className='p-1'>
                  {category.prompts.map((prompt, index) => {
                    return (
                      <div key={index}>
                        <Button
                          variant='ghost'
                          onClick={() => {
                            return onSelectPrompt(prompt);
                          }}
                          className={cn(
                            'w-full justify-start text-left text-xs p-3 h-auto rounded-md',
                            'hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors duration-150',
                            'text-gray-700 dark:text-gray-300 whitespace-normal break-words',
                            'focus:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 dark:focus-visible:ring-gray-300',
                          )}
                        >
                          {prompt}
                        </Button>
                        {index < category.prompts.length - 1 && (
                          <Separator className='my-1 bg-gray-100 dark:bg-gray-800' />
                        )}
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
            );
          })}
        </ScrollArea>
      </Tabs>
    </div>
  );
}

// Main Chat Component
export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [promptsOpen, setPromptsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => {
      return [...prev, userMessage];
    });
    setInput('');
    setCharCount(0);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 3000) {
      setInput(value);
      setCharCount(value.length);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
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
    setInput(prompt);
    setCharCount(prompt.length);
  };

  const handleAttach = () => {
    // Mock file attachment
    console.log('File attachment clicked');
  };

  const handleVoiceMessage = () => {
    // Mock voice message
    console.log('Voice message clicked');
  };

  const handleSelectPrompt = (prompt: string) => {
    setInput(prompt);
    setCharCount(prompt.length);
    setPromptsOpen(false);
  };

  const hasMessages = messages.length > 0;

  return (
    <div className='flex flex-col h-screen bg-white dark:bg-[#141414] w-full'>
      <header className='border-b border-gray-100 dark:border-[#232428] px-6 py-4 flex items-center justify-between shrink-0'>
        <h1 className='text-base font-medium text-gray-900 dark:text-white'>AI Chat</h1>
        <div className='flex items-center gap-4'>
          <Button
            variant='default'
            className='rounded-full h-8 px-4 text-xs font-medium bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-[#232323] transition-colors'
          >
            <Zap className='mr-1.5 h-3.5 w-3.5' />
            Upgrade
          </Button>
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant='ghost' size='icon' className='rounded-full h-8 w-8'>
                  <HelpCircle className='h-4 w-4 text-gray-500 dark:text-[#8b8b8b]' />
                </Button>
              </TooltipTrigger>
              <TooltipContent className='text-xs'>Help</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant='ghost' size='icon' className='rounded-full h-8 w-8'>
                  <Gift className='h-4 w-4 text-gray-500 dark:text-[#8b8b8b]' />
                </Button>
              </TooltipTrigger>
              <TooltipContent className='text-xs'>Gifts</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <ThemeToggle />
        </div>
      </header>

      <main className='flex-1 flex flex-col overflow-hidden'>
        {/* Content area (welcome screen or chat messages) */}
        <div className='flex-1 overflow-y-auto'>
          {!hasMessages ? (
            <div className='h-full flex flex-col'>
              <div className='flex-1 flex items-center justify-center'>
                <div className='max-w-3xl px-6 text-center'>
                  <div className='mb-12'>
                    <h2 className='text-4xl font-medium mb-4 text-gray-900 dark:text-white'>
                      Welcome to Script
                    </h2>
                    <p className='text-base text-gray-500 dark:text-[#8b8b8b] leading-relaxed max-w-lg mx-auto'>
                      Get started by Script a task and Chat can do the rest. Not sure where to
                      start?
                    </p>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-12 max-w-2xl mx-auto'>
                    <ActionCard
                      icon='📝'
                      iconBg='bg-amber-50 dark:bg-amber-950'
                      title='Write copy'
                      onClick={() => {
                        return handleActionCardClick('Write copy');
                      }}
                    />
                    <ActionCard
                      icon='🔮'
                      iconBg='bg-blue-50 dark:bg-blue-950'
                      title='Image generation'
                      onClick={() => {
                        return handleActionCardClick('Image generation');
                      }}
                    />
                    <ActionCard
                      icon='👤'
                      iconBg='bg-green-50 dark:bg-green-950'
                      title='Create avatar'
                      onClick={() => {
                        return handleActionCardClick('Create avatar');
                      }}
                    />
                    <ActionCard
                      icon='💻'
                      iconBg='bg-pink-50 dark:bg-pink-950'
                      title='Write code'
                      onClick={() => {
                        return handleActionCardClick('Write code');
                      }}
                    />
                  </div>

                  <div className='text-xs text-gray-400 dark:text-[#8b8b8b] mb-8'>
                    Script may generate inaccurate information about people, places, or facts.
                    Model: Script AI v1.3
                  </div>
                </div>
              </div>
            </div>
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

        {/* Chat input fixed at bottom - always visible */}
        <div className='border-t border-gray-100 dark:border-[#232428] bg-white dark:bg-[#141414] px-6 py-4 shrink-0'>
          <div className='mx-auto max-w-3xl relative'>
            <div className='border border-gray-200 dark:border-[#313131] rounded-lg overflow-hidden'>
              <Input
                value={input}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className='border-0 shadow-none text-sm py-5 px-4 bg-white dark:bg-[#141414] resize-none min-h-[56px] focus-visible:ring-0 focus-visible:ring-offset-0'
                placeholder='Summarize the latest'
              />
              <div className='flex items-center justify-between border-t border-gray-100 dark:border-[#232428] px-4 py-2 bg-gray-50 dark:bg-[#232323]'>
                <div className='flex items-center gap-3'>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={handleAttach}
                    className='text-xs text-gray-500 dark:text-[#8b8b8b] h-7 px-2 rounded hover:bg-gray-100 dark:hover:bg-[#313131]'
                  >
                    <Paperclip className='h-3.5 w-3.5 mr-1.5' />
                    Attach
                  </Button>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={handleVoiceMessage}
                    className='text-xs text-gray-500 dark:text-[#8b8b8b] h-7 px-2 rounded hover:bg-gray-100 dark:hover:bg-[#313131]'
                  >
                    <Mic className='h-3.5 w-3.5 mr-1.5' />
                    Voice Message
                  </Button>
                  <Popover open={promptsOpen} onOpenChange={setPromptsOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='text-xs text-gray-500 dark:text-[#8b8b8b] h-7 px-2 rounded hover:bg-gray-100 dark:hover:bg-[#313131]'
                      >
                        <Search className='h-3.5 w-3.5 mr-1.5' />
                        Browse Prompts
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      align='start'
                      sideOffset={8}
                      className='w-80 p-0 border border-gray-200 dark:border-[#313131] shadow-lg rounded-lg overflow-hidden'
                    >
                      <PromptList categories={samplePrompts} onSelectPrompt={handleSelectPrompt} />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className='text-xs text-gray-400 dark:text-[#8b8b8b]'>{charCount} / 3,000</div>
              </div>
            </div>
            <Button
              size='icon'
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className='absolute right-3 top-3 rounded-full h-7 w-7 bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-[#232323] transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            >
              <Send className='h-3.5 w-3.5 text-white dark:text-black' />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
