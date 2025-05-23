import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus } from 'lucide-react';

interface ActionCardProps {
  icon: string;
  iconBg: string;
  title: string;
  onClick?: () => void;
}

export function ActionCard({ icon, iconBg, title, onClick }: ActionCardProps) {
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
