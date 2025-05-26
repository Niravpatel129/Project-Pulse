import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useChat } from '@/contexts/ChatContext';
import { newRequest } from '@/utils/newRequest';
import { useQuery } from '@tanstack/react-query';
import { Check, ChevronDown, Info, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ThemeToggle } from './ThemeToggle';

interface Agent {
  _id: string;
  name: string;
  sections: {
    id: string;
    type: string;
    title: string;
    content?: string;
    tools?: any[];
  }[];
  createdAt: string;
  updatedAt: string;
}

const LOCAL_STORAGE_SELECTED_AGENTS_KEY = 'selectedChatAgents';

export function ChatHeader() {
  const { clearConversation, selectedAgents, setSelectedAgents } = useChat();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const { data: agents = [], isSuccess: agentsLoaded } = useQuery<Agent[]>({
    queryKey: ['agents'],
    queryFn: async () => {
      const response = await newRequest.get('/agents');
      return response.data.data.agents;
    },
  });

  // Load selected agents from localStorage on mount or when agents list is updated
  useEffect(() => {
    if (typeof window !== 'undefined' && agentsLoaded && agents.length > 0) {
      const storedAgentsJson = localStorage.getItem(LOCAL_STORAGE_SELECTED_AGENTS_KEY);
      if (storedAgentsJson) {
        try {
          const parsedAgents: Agent[] = JSON.parse(storedAgentsJson);
          // Filter parsedAgents to ensure they are still valid and exist in the current agents list
          const validStoredAgents = parsedAgents.filter((storedAgent) => {
            return agents.some((currentAgent) => {
              return currentAgent._id === storedAgent._id;
            });
          });
          setSelectedAgents(validStoredAgents);
        } catch (error) {
          console.error('Failed to parse selected agents from localStorage:', error);
          localStorage.removeItem(LOCAL_STORAGE_SELECTED_AGENTS_KEY); // Clear corrupted data
        }
      }
    }
  }, [agentsLoaded, agents, setSelectedAgents]);

  // Save selected agents to localStorage when they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // This effect runs after the initial load effect, so it's safe to save.
      // If selectedAgents is populated from localStorage, this will save that state.
      // If user deselects all, it will save an empty array.
      localStorage.setItem(LOCAL_STORAGE_SELECTED_AGENTS_KEY, JSON.stringify(selectedAgents));
    }
  }, [selectedAgents]);

  const toggleAgent = (agent: Agent) => {
    setSelectedAgents((prev: Agent[]) => {
      const isSelected = prev.some((a) => {
        return a._id === agent._id;
      });
      if (isSelected) {
        return prev.filter((a) => {
          return a._id !== agent._id;
        });
      } else {
        return [...prev, agent];
      }
    });
  };

  return (
    <header className='dark:border-[#232428] px-6 py-4 flex items-center justify-between shrink-0'>
      <div className='flex items-center gap-4'>
        <SidebarTrigger />
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant='ghost'
              className={`flex items-center gap-2 px-2 ${!isOpen ? 'focus-visible:ring-0' : ''}`}
            >
              <h1 className='text-base font-medium text-gray-900 dark:text-white'>
                {selectedAgents.length > 0
                  ? selectedAgents
                      .map((agent) => {
                        return agent.name;
                      })
                      .join(', ')
                  : 'Select Agents'}
              </h1>
              <ChevronDown className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='start' className='w-48'>
            <DropdownMenuItem
              onClick={() => {
                router.push('/dashboard/chat/agents');
                setIsOpen(false);
              }}
            >
              Manage Agents
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {agents.map((agent) => {
              const isSelected = selectedAgents.some((a) => {
                return a._id === agent._id;
              });
              return (
                <DropdownMenuItem
                  key={agent._id}
                  onClick={(e) => {
                    e.preventDefault();
                    toggleAgent(agent);
                  }}
                  className='flex items-center justify-between'
                >
                  <span>{agent.name}</span>
                  {isSelected && <Check className='h-4 w-4' />}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className='flex items-center gap-4'>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant='ghost' size='icon' className='h-9 w-9'>
              <Info className='h-5 w-5' />
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-80 p-4'>
            <div className='space-y-3'>
              <h4 className='font-medium'>AI Model Settings</h4>
              <div className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Model:</span>
                  <span className='font-medium'>{'Claude Opus 4 (May 22, 2025)'}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Context :</span>
                  <span className='font-medium'>{'194,231 Tokens'}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Temperature:</span>
                  <span className='font-medium'>0.8</span>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <Button variant='ghost' size='icon' className='h-9 w-9' onClick={clearConversation}>
          <Plus className='h-5 w-5' />
        </Button>
        <ThemeToggle />
      </div>
    </header>
  );
}
