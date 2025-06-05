import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn, formatShortRelativeTime } from '@/lib/utils';
import { Filter, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface EmailThread {
  threadId: string;
  subject: string;
  participants: string[];
  snippet: string;
  timestamp: Date;
  isUnread: boolean;
  emails: any[];
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
        'flex items-center px-4 py-3 transition-colors duration-150',
        !isSelected && 'cursor-pointer hover:bg-slate-50/50 dark:hover:bg-[#232428]',
        isSelected && 'bg-slate-100 dark:bg-[#2a2a2f]',
      )}
      onClick={onClick}
    >
      <div className='flex-1 min-w-0'>
        <div className='flex items-center gap-2 mb-1'>
          {thread.isUnread && !isSelected && (
            <div className='w-2 h-2 rounded-full bg-[#3b82f6] flex-shrink-0' />
          )}
          <span className='text-sm font-medium text-[#121212] dark:text-white truncate'>
            {getEmailName(thread.participants[0])}
          </span>
          {thread.emails.length > 1 && (
            <Badge
              variant='secondary'
              className='bg-slate-100 dark:bg-[#232428] text-[#121212] dark:text-slate-300 text-xs'
            >
              {thread.emails.length}
            </Badge>
          )}
          <span className='text-xs text-muted-foreground ml-auto'>
            {formatShortRelativeTime(thread.timestamp)}
          </span>
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
  console.log('🚀 threads:', threads);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [localThreads, setLocalThreads] = useState(threads);
  const previousThreadsRef = useRef<EmailThread[]>([]);

  // Only update local threads when threads prop changes and we don't have local state yet
  useEffect(() => {
    if (localThreads.length === 0) {
      setLocalThreads(threads);
      previousThreadsRef.current = threads;
    } else {
      // Check for new messages
      const newThreads = threads.filter((thread) => {
        return !previousThreadsRef.current.some((prevThread) => {
          return prevThread.threadId === thread.threadId;
        });
      });

      if (newThreads.length > 0) {
        toast.info('New messages received', {
          description: `${newThreads.length} new message${
            newThreads.length > 1 ? 's' : ''
          } in your inbox`,
        });
      }

      setLocalThreads(threads);
      previousThreadsRef.current = threads;
    }
  }, [threads]);

  const handleThreadSelect = (threadId: string) => {
    // Immediately mark as read in local state
    setLocalThreads((prevThreads) => {
      return prevThreads.map((thread) => {
        return thread.threadId === threadId ? { ...thread, isUnread: false } : thread;
      });
    });
    onThreadSelect?.(threadId);
  };

  const filteredThreads = localThreads.filter((thread) => {
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
                    return handleThreadSelect(thread.threadId);
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
