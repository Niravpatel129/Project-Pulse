import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

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
}

export default function InboxMain({ selectedThreadId }: InboxMainProps) {
  const [expandedThreads, setExpandedThreads] = useState<Set<string>>(new Set());

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
          className='flex items-center gap-4 p-4 justify-between w-full cursor-pointer hover:bg-slate-50/50 dark:hover:bg-[#232428] transition-colors'
          onClick={() => {
            return toggleThread(thread.id);
          }}
        >
          {/* Avatar  */}
          <div className='flex items-start gap-4 w-full'>
            <Avatar className='h-8 w-8'>
              <AvatarFallback className='bg-[#656973] text-white dark:text-white dark:bg-[#656973] text-xs'>
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
                  <div className='text-sm text-muted-foreground'>To: {thread.recipient}</div>
                  <div className='text-sm text-muted-foreground'>Subject: {thread.subject}</div>
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

  // Mock data for demonstration
  const mockThreads: Thread[] = [
    {
      id: '1',
      sender: {
        name: 'Heather Hahnenberg',
        email: 'someone@email.com',
      },
      recipient: 'Nirav Patel',
      subject: 'Random Subject',
      timestamp: '1 week ago',
      content:
        'hi. iam not sure cause iam working . but i call you afternoon around 3.30 to see if you are in the store',
    },
    {
      id: '2',
      sender: {
        name: 'John Doe',
        email: 'john@email.com',
      },
      recipient: 'Nirav Patel',
      subject: 'Project Update',
      timestamp: '2 days ago',
      content: 'Here is the latest update on the project. We have made significant progress...',
    },
  ];

  return (
    <div className='p-4'>
      <h2 className='text-xl font-bold mb-4 text-[#121212] dark:text-white'>
        Heroku app &quot;toastify&quot; log data transfer notification
      </h2>

      <div className='flex flex-col gap-4'>
        {mockThreads.map((thread) => {
          return renderThread(thread);
        })}
      </div>
    </div>
  );
}
