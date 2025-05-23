import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { BsRobot } from 'react-icons/bs';
import { ThemeToggle } from './ThemeToggle';

export function ChatHeader() {
  return (
    <header className='dark:border-[#232428] px-6 py-4 flex items-center justify-between shrink-0'>
      <h1 className='text-base font-medium text-gray-900 dark:text-white'>AI Chat</h1>
      <div className='flex items-center gap-4'>
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant='ghost' size='icon' className='rounded-full h-8 w-8' disabled>
                <BsRobot className='h-4 w-4 text-gray-500 dark:text-[#8b8b8b]' />
              </Button>
            </TooltipTrigger>
            <TooltipContent className='text-xs'>Script AI</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <ThemeToggle />
      </div>
    </header>
  );
}
