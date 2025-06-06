'use client';

import InboxMain from '@/components/inbox/InboxMain';
import InboxSidebar from '@/components/inbox/InboxSidebar';
import { useSidebar } from '@/components/ui/sidebar';
import { useInbox } from '@/hooks/use-inbox';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const InboxPage = () => {
  const [selectedThreadId, setSelectedThreadId] = useState<string | undefined>();
  const params = useParams();
  const { toggleSidebar } = useSidebar();
  const router = useRouter();
  const activeTab =
    (params.state as string)?.charAt(0).toUpperCase() + (params.state as string)?.slice(1) ||
    'Unassigned';
  const { data: threads, error } = useInbox();

  // Automatically select the first thread when threads data is available
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

  // Flatten the pages array to get all threads
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
              selectedThreadId={selectedThreadId}
              onThreadSelect={setSelectedThreadId}
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
