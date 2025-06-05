import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Filter, Search } from 'lucide-react';
import { useState } from 'react';

interface EmailThread {
  threadId: string;
  subject: string;
  participants: string[];
  messageCount: number;
  snippet: string;
  timestamp: Date;
  isUnread: boolean;
}

interface InboxSidebarProps {
  threads?: EmailThread[];
  selectedThreadId?: string;
  onThreadSelect?: (threadId: string) => void;
}

const ThreadItem = ({
  thread,
  isSelected,
  onClick,
}: {
  thread: EmailThread;
  isSelected: boolean;
  onClick: () => void;
}) => {
  const getEmailName = (email: string) => {
    const name = email.split('@')[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  return (
    <div
      className={cn(
        'flex items-center px-4 py-3 cursor-pointer transition-colors duration-150 hover:bg-slate-50/50 dark:hover:bg-[#232428]',
        isSelected && 'bg-slate-50 dark:bg-[#232428]',
      )}
      onClick={onClick}
    >
      <div className='flex-1 min-w-0'>
        <div className='flex items-center gap-2 mb-1'>
          {thread.isUnread && <div className='w-2 h-2 rounded-full bg-[#3b82f6] flex-shrink-0' />}
          <span className='text-sm font-medium text-[#121212] dark:text-white truncate'>
            {getEmailName(thread.participants[0])}
          </span>
          {thread.messageCount > 1 && (
            <Badge
              variant='secondary'
              className='bg-slate-100 dark:bg-[#232428] text-[#121212] dark:text-slate-300 text-xs'
            >
              {thread.messageCount}
            </Badge>
          )}
        </div>
        <div className='text-sm text-[#121212] dark:text-white font-medium truncate'>
          {thread.subject}
        </div>
        <div className='text-sm text-muted-foreground truncate'>{thread.snippet}</div>
      </div>
    </div>
  );
};

export default function InboxSidebar({
  threads = [],
  selectedThreadId,
  onThreadSelect,
}: InboxSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const filteredThreads = threads.filter((thread) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      thread.subject.toLowerCase().includes(searchLower) ||
      thread.participants.some((p) => {
        return p.toLowerCase().includes(searchLower);
      }) ||
      thread.snippet.toLowerCase().includes(searchLower);

    if (filter === 'all') return matchesSearch;
    if (filter === 'unread') return matchesSearch && thread.isUnread;
    if (filter === 'read') return matchesSearch && !thread.isUnread;
    return matchesSearch;
  });

  return (
    <div className='flex h-full w-full min-w-0 flex-col bg-white dark:bg-neutral-900 overflow-hidden'>
      {/* Header */}
      <div className='flex items-center justify-between p-4 border-b border-slate-100 dark:border-[#232428]'>
        <h2 className='text-base font-medium text-[#121212] dark:text-white'>Inbox</h2>
        <Badge
          variant='secondary'
          className='bg-slate-100 dark:bg-[#232428] text-[#121212] dark:text-slate-300 text-xs'
        >
          {threads.length}
        </Badge>
      </div>

      {/* Search */}
      <div className='p-4 border-b border-slate-100 dark:border-[#232428]'>
        <div className='flex gap-2'>
          <div className='relative flex-1'>
            <input
              type='text'
              placeholder='Search emails...'
              value={searchQuery}
              onChange={(e) => {
                return setSearchQuery(e.target.value);
              }}
              className='w-full h-9 px-3 pl-9 bg-transparent text-sm text-[#121212] dark:text-white rounded-md border border-slate-200 dark:border-[#232428] focus:outline-none focus:ring-1 focus:ring-slate-300 dark:focus:ring-[#232428] placeholder:text-muted-foreground'
            />
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='outline'
                size='icon'
                className='h-9 w-9 shrink-0 border-slate-200 dark:border-[#232428]'
              >
                <Filter className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-[200px]'>
              <DropdownMenuItem
                className={cn('text-sm', filter === 'all' && 'bg-slate-50 dark:bg-[#232428]')}
                onClick={() => {
                  return setFilter('all');
                }}
              >
                All emails
              </DropdownMenuItem>
              <DropdownMenuItem
                className={cn('text-sm', filter === 'unread' && 'bg-slate-50 dark:bg-[#232428]')}
                onClick={() => {
                  return setFilter('unread');
                }}
              >
                Unread
              </DropdownMenuItem>
              <DropdownMenuItem
                className={cn('text-sm', filter === 'read' && 'bg-slate-50 dark:bg-[#232428]')}
                onClick={() => {
                  return setFilter('read');
                }}
              >
                Read
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Thread List */}
      <div className='flex-1 w-full overflow-y-auto overflow-x-hidden min-w-0 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-[#232428] scrollbar-track-transparent hover:scrollbar-thumb-slate-300 dark:hover:scrollbar-thumb-[#2a2a2f]'>
        {filteredThreads.length === 0 ? (
          <div className='flex h-full items-center justify-center text-sm text-muted-foreground'>
            No emails found
          </div>
        ) : (
          <div className='divide-y divide-slate-100 dark:divide-[#232428] w-full'>
            {filteredThreads.map((thread) => {
              return (
                <ThreadItem
                  key={thread.threadId}
                  thread={thread}
                  isSelected={selectedThreadId === thread.threadId}
                  onClick={() => {
                    return onThreadSelect?.(thread.threadId);
                  }}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
