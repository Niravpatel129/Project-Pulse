import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useEmailChain } from '@/hooks/use-email-chain';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import InboxReply from './InboxReply';

interface InboxMainProps {
  selectedThreadId?: string;
}

interface Thread {
  id: string;
  sender: {
    name: string;
    email: string;
  };
  recipient: string;
  subject: string;
  timestamp: string;
  content: string;
  isRead: boolean;
}

export default function InboxMain({ selectedThreadId }: InboxMainProps) {
  const [expandedThreads, setExpandedThreads] = useState<Set<string>>(new Set());
  const { data: emailChain, isLoading, error } = useEmailChain(selectedThreadId);

  const toggleThread = (threadId: string) => {
    setExpandedThreads((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(threadId)) {
        newSet.delete(threadId);
      } else {
        newSet.add(threadId);
      }
      return newSet;
    });
  };

  const renderThread = (thread: Thread) => {
    const isExpanded = expandedThreads.has(thread.id);

    return (
      <div
        key={thread.id}
        className='border border-slate-100 dark:border-[#232428] rounded-lg mb-4'
      >
        <div
          className='flex items-center gap-4 p-4 justify-between w-full cursor-pointer transition-colors'
          onClick={() => {
            return toggleThread(thread.id);
          }}
        >
          {/* Avatar  */}
          <div className='flex items-start gap-4 w-full'>
            <Avatar className='h-7 w-7'>
              <AvatarFallback className='bg-[#656973] text-white dark:text-white dark:bg-[#656973] text-[10px]'>
                {thread.sender.name
                  .split(' ')
                  .map((n) => {
                    return n[0];
                  })
                  .join('')}
              </AvatarFallback>
            </Avatar>
            <div className='flex-1'>
              <div className='flex justify-between items-start'>
                <div>
                  <div className='font-medium text-sm text-[#121212] dark:text-white leading-tight'>
                    {thread.sender.name}{' '}
                    <span className='text-muted-foreground text-sm'>
                      &lt;{thread.sender.email}&gt;
                    </span>
                  </div>
                  <div
                    className='text-sm text-muted-foreground'
                    style={{
                      display: isExpanded ? 'block' : 'none',
                    }}
                  >
                    To: {thread.recipient}
                  </div>
                  <div
                    className='text-sm text-muted-foreground'
                    style={{
                      display: isExpanded ? 'block' : 'none',
                    }}
                  >
                    Subject: {thread.subject}
                  </div>
                  <div
                    className='text-sm text-muted-foreground'
                    style={{
                      display: !isExpanded ? 'block' : 'none',
                    }}
                  >
                    {thread.content.length > 100
                      ? `${thread.content.substring(0, 100)}...`
                      : thread.content}
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='text-sm text-muted-foreground'>{thread.timestamp}</div>
                  {isExpanded ? (
                    <ChevronUp className='h-4 w-4 text-muted-foreground' />
                  ) : (
                    <ChevronDown className='h-4 w-4 text-muted-foreground' />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        {isExpanded && (
          <>
            <div className='border-t border-slate-100 dark:border-[#232428] h-[1px]' />
            <div className='p-4 min-h-[100px]'>
              <div className='text-sm mt-2 text-[#121212] dark:text-white'>{thread.content}</div>
            </div>
          </>
        )}
      </div>
    );
  };

  if (!selectedThreadId) {
    return (
      <div className='flex items-center justify-center h-full'>
        <p className='text-muted-foreground'>Select a thread to view its contents</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-full'>
        <p className='text-muted-foreground'>Loading thread...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex items-center justify-center h-full'>
        <p className='text-red-500'>Error loading thread: {(error as Error).message}</p>
      </div>
    );
  }

  if (!emailChain) {
    return (
      <div className='flex items-center justify-center h-full'>
        <p className='text-muted-foreground'>No thread data available</p>
      </div>
    );
  }

  return (
    <div className='p-4'>
      <h2 className='text-xl font-bold mb-4 text-[#121212] dark:text-white'>
        {emailChain.subject}
      </h2>

      <div className='flex flex-col gap-0'>
        {emailChain.messages.map((message) => {
          return renderThread(message);
        })}
        <InboxReply />
      </div>
    </div>
  );
}
