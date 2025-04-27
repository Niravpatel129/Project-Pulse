'use client';
import { Button } from '@/components/ui/button';
import { ColorPicker } from '@/components/ui/color-picker';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Label } from '@/components/ui/label';
import { Keyboard, Plus, Search, SlidersHorizontal, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface KanbanHeaderProps {
  title: string;
  totalTasks: number;
  filteredTasks: number;
  onSearch: (query: string) => void;
  onAddColumn: (name: string, color: string) => void;
}

const KanbanHeader = ({
  title,
  totalTasks,
  filteredTasks,
  onSearch,
  onAddColumn,
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

  const handleAddColumn = () => {
    if (newColumnName.trim()) {
      onAddColumn(newColumnName.trim(), newColumnColor);
      setNewColumnName('');
      setNewColumnColor('#e2e8f0');
      setIsDialogOpen(false);
    }
  };

  const handleUndo = () => {
    console.log('Undo');
  };

  const handleAutoSort = () => {
    console.log('Auto-sort');
  };

  const handleReset = () => {
    console.log('Reset');
  };

  const handleTemplate = () => {
    console.log('Template');
  };

  const handleKeyboardShortcuts = () => {
    console.log('Keyboard shortcuts');
  };

  const handleTemplateDialogOpen = () => {
    console.log('Template dialog open');
  };

  const handleKeyboardShortcutsDialogOpen = () => {
    console.log('Keyboard shortcuts dialog open');
  };
  const setIsTemplateDialogOpen = (open: boolean) => {
    console.log('Template dialog open', open);
  };

  const setIsKeyboardShortcutsDialogOpen = (open: boolean) => {
    console.log('Keyboard shortcuts dialog open', open);
  };

  const setIsKeyboardShortcutsOpen = (open: boolean) => {
    console.log('Keyboard shortcuts open', open);
  };

  return (
    <div className='w-full mb-6'>
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
          <Button
            onClick={() => {
              return setIsDialogOpen(true);
            }}
            variant='outline'
            size='sm'
          >
            <Plus className='h-4 w-4 mr-1' />
            Add Column
          </Button>
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>Add New Column</DialogTitle>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='name' className='text-right'>
                Name
              </Label>
              <Input
                id='name'
                value={newColumnName}
                onChange={(e) => {
                  return setNewColumnName(e.target.value);
                }}
                className='col-span-3'
                placeholder='e.g., In Review'
              />
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='color' className='text-right'>
                Color
              </Label>
              <div className='col-span-3'>
                <ColorPicker
                  value={newColumnColor}
                  onChange={setNewColumnColor}
                  label='Column Color'
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => {
                return setIsDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button type='button' onClick={handleAddColumn}>
              Add Column
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KanbanHeader;
