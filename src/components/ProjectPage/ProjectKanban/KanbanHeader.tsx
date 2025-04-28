'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Archive, Plus } from 'lucide-react';
import { useState } from 'react';

export type KanbanHeaderProps = {
  title: string;
  totalTasks: number;
  filteredTasks: number;
  onSearch: (query: string) => void;
  onAddColumn: (name: string, color: string) => void;
  onBoardActions: () => void;
  onToggleArchived?: () => void;
  showArchived?: boolean;
};

const KanbanHeader = ({
  title,
  totalTasks,
  filteredTasks,
  onSearch,
  onAddColumn,
  onBoardActions,
  onToggleArchived,
  showArchived = false,
}: KanbanHeaderProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    onSearch(e.target.value);
  };

  // Open the board settings directly to add column section
  const handleAddColumn = () => {
    onBoardActions(); // Open the board actions dialog which contains the add column form
  };

  const handleAutoSort = () => {
    console.log('Auto-sort');
  };

  const setIsKeyboardShortcutsOpen = (open: boolean) => {
    console.log('Keyboard shortcuts open', open);
  };

  return (
    <div className='flex flex-col md:flex-row items-start md:items-center justify-between space-y-2 md:space-y-0 pb-4 pt-2'>
      <div>
        <h1 className='text-xl font-semibold'>{title}</h1>
        <p className='text-sm text-muted-foreground'>
          {filteredTasks} {filteredTasks === 1 ? 'task' : 'tasks'}
          {filteredTasks !== totalTasks ? ` (filtered from ${totalTasks})` : ''}
        </p>
      </div>
      <div className='flex items-center space-x-2 w-full md:w-auto'>
        <Input
          type='search'
          placeholder='Search tasks...'
          className='h-9 w-full md:w-[200px]'
          onChange={handleSearch}
          value={searchQuery}
        />
        {onToggleArchived && (
          <Button
            variant={showArchived ? 'secondary' : 'outline'}
            size='sm'
            onClick={onToggleArchived}
            className='flex items-center gap-1'
          >
            <Archive className='h-4 w-4' />
            {showArchived ? 'Hide Archived' : 'Show Archived'}
          </Button>
        )}
        <Button
          variant='outline'
          size='sm'
          className='flex items-center gap-1'
          onClick={handleAddColumn}
        >
          <Plus className='h-4 w-4' />
          Add Column
        </Button>
      </div>
    </div>
  );
};

export default KanbanHeader;
