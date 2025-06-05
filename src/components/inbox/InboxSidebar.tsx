import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Search } from 'lucide-react';
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
          <span className='font-medium text-[#121212] dark:text-white truncate'>
            {getEmailName(thread.participants[0])}
          </span>
          {thread.messageCount > 1 && (
            <Badge
              variant='secondary'
              className='bg-slate-100 dark:bg-[#232428] text-[#121212] dark:text-slate-300'
            >
              {thread.messageCount}
            </Badge>
          )}
        </div>
        <div className='text-sm text-[#121212] dark:text-white font-medium truncate'>
          {thread.subject}
        </div>
        <div className='text-sm text-muted-foreground truncate'>{thread.snippet}</div>
        <div className='text-xs text-muted-foreground mt-1'>
          {format(thread.timestamp, 'MMM d, h:mm a')}
        </div>
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

  const filteredThreads = threads.filter((thread) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      thread.subject.toLowerCase().includes(searchLower) ||
      thread.participants.some((p) => {
        return p.toLowerCase().includes(searchLower);
      }) ||
      thread.snippet.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className='flex h-full w-[350px] min-w-0 flex-col border-r border-slate-100 dark:border-[#232428] bg-white dark:bg-[#141414] overflow-hidden'>
      {/* Header */}
      <div className='flex items-center justify-between p-4 border-b border-slate-100 dark:border-[#232428]'>
        <h2 className='text-lg font-semibold text-[#121212] dark:text-white'>Inbox</h2>
        <Badge
          variant='secondary'
          className='bg-slate-100 dark:bg-[#232428] text-[#121212] dark:text-slate-300'
        >
          {threads.length}
        </Badge>
      </div>

      {/* Search */}
      <div className='p-4 border-b border-slate-100 dark:border-[#232428]'>
        <div className='relative'>
          <input
            type='text'
            placeholder='Search emails...'
            value={searchQuery}
            onChange={(e) => {
              return setSearchQuery(e.target.value);
            }}
            className='w-full px-3 py-2 pl-9 bg-slate-50 dark:bg-[#232428] text-[#121212] dark:text-white rounded-md border border-slate-100 dark:border-[#232428] focus:outline-none focus:ring-2 focus:ring-[#8b5df8]'
          />
          <Search className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
        </div>
      </div>

      {/* Thread List */}
      <div className='flex-1 w-full overflow-y-auto overflow-x-hidden min-w-0'>
        {filteredThreads.length === 0 ? (
          <div className='flex h-full items-center justify-center text-muted-foreground'>
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
