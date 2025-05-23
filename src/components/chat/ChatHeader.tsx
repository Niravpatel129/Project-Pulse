import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useChat } from '@/contexts/ChatContext';
import { newRequest } from '@/utils/newRequest';
import { useQuery } from '@tanstack/react-query';
import { Info, Plus } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export function ChatHeader() {
  const { clearConversation } = useChat();

  // Fetch chat settings
  const { data: settings } = useQuery({
    queryKey: ['chatSettings'],
    queryFn: async () => {
      const response = await newRequest.get('/chat-settings');
      return (
        response.data.data || {
          selectedModel: 'gpt-4',
          selectedStyle: 'default',
          webSearchEnabled: true,
        }
      );
    },
  });

  return (
    <header className='dark:border-[#232428] px-6 py-4 flex items-center justify-between shrink-0'>
      <div className='flex items-center gap-4'>
        <SidebarTrigger />
        <h1 className='text-base font-medium text-gray-900 dark:text-white'>AI Chat</h1>
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
