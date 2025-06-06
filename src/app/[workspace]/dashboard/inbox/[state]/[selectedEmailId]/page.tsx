'use client';

import InboxMain from '@/components/inbox/InboxMain';
import InboxSidebar from '@/components/inbox/InboxSidebar';
import { useInbox } from '@/hooks/use-inbox';
import { useEffect, useState } from 'react';

const InboxPage = () => {
  const [selectedThreadId, setSelectedThreadId] = useState<string | undefined>();
  const { data: threads, error } = useInbox();

  useEffect(() => {
    if (threads?.pages?.[0]?.data?.[0]?.threadId && !selectedThreadId) {
      setSelectedThreadId(threads.pages[0].data[0].threadId);
    }
  }, [threads, selectedThreadId]);

  if (error) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <p className='text-red-500'>Error loading inbox: {error.message}</p>
      </div>
    );
  }

  const allThreads =
    threads?.pages.flatMap((page) => {
      return page.data;
    }) || [];

  return (
    <div className='flex flex-col h-screen w-full overflow-hidden'>
      {/* Topbar */}

      {/* Main Content */}
      <div className='flex flex-1 overflow-hidden p-4 gap-4'>
        <div className='w-[320px] h-full flex-shrink-0'>
          <div className='h-full rounded-lg border border-slate-100 dark:border-[#232428] shadow-sm bg-white dark:bg-neutral-900 overflow-hidden'>
            <InboxSidebar
              threads={allThreads.map((thread) => {
                return {
                  threadId: thread.threadId,
                  subject: thread.subject,
                  participants: thread.participants.map((p) => {
                    return p.name;
                  }),
                  snippet: thread.latestMessage.content,
                  timestamp: new Date(thread.latestMessage.timestamp),
                  isUnread: !thread.isRead,
                  emails: thread.emails,
                };
              })}
            />
          </div>
        </div>
        <div className='flex-1 h-full min-w-0'>
          <div className='h-full rounded-lg border border-slate-100 dark:border-[#232428] shadow-sm bg-white dark:bg-neutral-900 overflow-hidden'>
            <InboxMain />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InboxPage;
