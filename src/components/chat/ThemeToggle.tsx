import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant='ghost' size='icon' className='rounded-full relative h-8 w-8'>
        <Sun className='h-4 w-4 text-gray-500' />
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
    </Button>
  );
}
