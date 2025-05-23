import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BsThreeDots } from 'react-icons/bs';
import { ThemeToggle } from './ThemeToggle';

export function ChatHeader() {
  const handleDeleteChat = () => {
    // TODO: Implement chat deletion logic
    console.log('Delete chat clicked');
  };

  return (
    <header className='dark:border-[#232428] px-6 py-4 flex items-center justify-between shrink-0'>
      <h1 className='text-base font-medium text-gray-900 dark:text-white'>AI Chat</h1>
      <div className='flex items-center gap-4'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='icon' className='rounded-full h-8 w-8'>
              <BsThreeDots className='h-4 w-4 text-gray-500 dark:text-[#8b8b8b]' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem onClick={handleDeleteChat} className='text-red-600'>
              Delete Chat
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <ThemeToggle />
      </div>
    </header>
  );
}
