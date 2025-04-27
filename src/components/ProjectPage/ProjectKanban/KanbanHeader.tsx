'use client';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Keyboard, Search, Settings, SlidersHorizontal, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface KanbanHeaderProps {
  title: string;
  totalTasks: number;
  filteredTasks: number;
  onSearch: (query: string) => void;
  onAddColumn: (name: string, color: string) => void;
  onBoardActions: () => void;
}

const KanbanHeader = ({
  title,
  totalTasks,
  filteredTasks,
  onSearch,
  onAddColumn,
  onBoardActions,
}: KanbanHeaderProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [newColumnColor, setNewColumnColor] = useState('#e2e8f0');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  const handleAutoSort = () => {
    console.log('Auto-sort');
  };

  const setIsKeyboardShortcutsOpen = (open: boolean) => {
    console.log('Keyboard shortcuts open', open);
  };

  return (
    <div className='w-full mb-6 py-1'>
      <div className='flex justify-between items-start mb-4'>
        <div>
          <h1 className='text-2xl font-bold'>{title}</h1>
          <p className='text-sm text-muted-foreground'>
            Showing {filteredTasks} of {totalTasks} tasks
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <div className='relative w-64'>
            <Search className='absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <Input
              value={searchQuery}
              onChange={handleSearch}
              placeholder='Search tasks...'
              className='pl-8'
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' size='icon'>
                <span className='sr-only'>Open menu</span>
                <SlidersHorizontal className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-56'>
              <DropdownMenuLabel>Board Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={handleAutoSort}>
                  <Sparkles className='mr-2 h-4 w-4' />
                  Auto-sort Tasks
                </DropdownMenuItem>

                <DropdownMenuItem onClick={onBoardActions}>
                  <Settings className='mr-2 h-4 w-4' />
                  Manage Columns
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => {
                    return setIsKeyboardShortcutsOpen(true);
                  }}
                >
                  <Keyboard className='mr-2 h-4 w-4' />
                  Keyboard Shortcuts
                  <DropdownMenuShortcut>?</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default KanbanHeader;
