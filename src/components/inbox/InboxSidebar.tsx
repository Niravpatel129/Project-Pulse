import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Mail } from 'lucide-react';
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
        'flex items-center px-6 py-3 cursor-pointer transition-colors',
        isSelected && 'bg-[#F4F4F5] dark:bg-[#232428]',
      )}
      onClick={onClick}
    >
      <div className='flex-1 min-w-0'>
        <div className='flex items-center gap-2 mb-1'>
          {thread.isUnread && <div className='w-2 h-2 rounded-full bg-[#3b82f6] flex-shrink-0' />}
          <span className='font-medium text-[#3F3F46] dark:text-[#fafafa] truncate'>
            {getEmailName(thread.participants[0])}
          </span>
          {thread.messageCount > 1 && (
            <Badge
              variant='secondary'
              className='bg-[#F4F4F5] dark:bg-[#232428] text-[#3F3F46] dark:text-[#fafafa]'
            >
              {thread.messageCount}
            </Badge>
          )}
        </div>
        <div className='text-sm text-[#3F3F46] dark:text-[#fafafa] font-medium truncate'>
          {thread.subject}
        </div>
        <div className='text-sm text-[#3F3F46]/60 dark:text-[#8C8C8C] truncate'>
          {thread.snippet}
        </div>
        <div className='text-xs text-[#3F3F46]/60 dark:text-[#8C8C8C] mt-1'>
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
    <div className='flex h-full w-[350px] min-w-0 flex-col border-r border-[#E4E4E7] dark:border-[#232428] bg-white dark:bg-[#141414] overflow-hidden'>
      {/* Header */}
      <div className='flex items-center justify-between p-4 border-b border-[#E4E4E7] dark:border-[#232428]'>
        <h2 className='text-lg font-semibold text-[#3F3F46] dark:text-[#fafafa]'>Inbox</h2>
        <Badge
          variant='secondary'
          className='bg-[#F4F4F5] dark:bg-[#232428] text-[#3F3F46] dark:text-[#fafafa]'
        >
          {threads.length}
        </Badge>
      </div>

      {/* Search */}
      <div className='p-4 border-b border-[#E4E4E7] dark:border-[#232428]'>
        <div className='relative'>
          <input
            type='text'
            placeholder='Search emails...'
            value={searchQuery}
            onChange={(e) => {
              return setSearchQuery(e.target.value);
            }}
            className='w-full px-3 py-2 pl-9 bg-[#F4F4F5] dark:bg-[#232428] text-[#3F3F46] dark:text-[#fafafa] rounded-md border border-[#E4E4E7] dark:border-[#232428] focus:outline-none focus:ring-2 focus:ring-[#8b5df8]'
          />
          <Mail className='absolute left-3 top-2.5 h-4 w-4 text-[#3F3F46]/60 dark:text-[#8C8C8C]' />
        </div>
      </div>

      {/* Thread List */}
      <div className='flex-1 w-full overflow-y-auto overflow-x-hidden min-w-0'>
        {filteredThreads.length === 0 ? (
          <div className='flex h-full items-center justify-center text-[#3F3F46]/60 dark:text-[#8C8C8C]'>
            No emails found
          </div>
        ) : (
          <div className='divide-y divide-[#E4E4E7] dark:divide-[#232428] w-full'>
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
