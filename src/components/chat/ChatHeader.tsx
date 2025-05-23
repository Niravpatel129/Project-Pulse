import { Button } from '@/components/ui/button';
import { useChat } from '@/contexts/ChatContext';
import { Plus } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export function ChatHeader() {
  const { clearConversation } = useChat();

  return (
    <header className='dark:border-[#232428] px-6 py-4 flex items-center justify-between shrink-0'>
      <h1 className='text-base font-medium text-gray-900 dark:text-white'>AI Chat</h1>
      <div className='flex items-center gap-4'>
        <Button variant='ghost' size='icon' className='h-9 w-9' onClick={clearConversation}>
          <Plus className='h-5 w-5' />
        </Button>
        <ThemeToggle />
      </div>
    </header>
  );
}
