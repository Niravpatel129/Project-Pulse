'use client';

import InboxMain from '@/components/inbox/InboxMain';
import InboxSidebar from '@/components/inbox/InboxSidebar';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';
import { useInbox } from '@/hooks/use-inbox';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FiSettings, FiSidebar } from 'react-icons/fi';

const TABS = ['Unassigned', 'Assigned', 'Archived', 'Snoozed', 'Trash', 'Spam'];

const InboxPage = () => {
  const [selectedThreadId, setSelectedThreadId] = useState<string | undefined>();
  const { toggleSidebar } = useSidebar();
  const router = useRouter();
  const params = useParams();
  const activeTab =
    (params.state as string)?.charAt(0).toUpperCase() + (params.state as string)?.slice(1) ||
    'Unassigned';
  const { data: threads, error } = useInbox();
  console.log('🚀 activeTab:', activeTab);

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
      <div className='flex items-center justify-between px-4 pb-2 pt-3 border-b border-[#E4E4E7] dark:border-[#232428] relative z-[1] bg-background'>
        <div className='flex items-center justify-between w-full'>
          <div className='flex items-center gap-2 h-full w-full'>
            <Button
              variant='ghost'
              size='icon'
              className='text-[#3F3F46]/60 dark:text-[#8b8b8b] hover:text-[#3F3F46] dark:hover:text-white'
              onClick={toggleSidebar}
            >
              <FiSidebar size={20} />
            </Button>
            <h1 className='text-lg font-semibold text-[#121212] dark:text-white'>Inbox</h1>
          </div>
          <div className='w-full'>
            <div className='flex gap-6 overflow-x-auto'>
              {TABS.map((tab) => {
                const path = tab.toLowerCase();
                return (
                  <Link
                    key={tab}
                    href={`/dashboard/inbox/${path}`}
                    prefetch={true}
                    scroll={false}
                    className={`text-sm transition-colors duration-150 pb-1 border-b-2 whitespace-nowrap ${
                      activeTab === tab
                        ? 'font-semibold text-black dark:text-white border-black dark:border-white'
                        : 'font-normal text-gray-400 border-transparent hover:text-black dark:hover:text-white'
                    }`}
                  >
                    {tab}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className='flex items-center gap-2 w-full justify-end'>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => {
                return router.push('/dashboard/settings?tab=inbox');
              }}
            >
              <FiSettings size={20} />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='flex flex-1 overflow-hidden p-4 gap-4'>
        <div className='w-[320px] h-full flex-shrink-0'>
          <div className='h-full rounded-lg border border-slate-100 dark:border-[#232428] shadow-sm bg-white dark:bg-neutral-900 overflow-hidden'>
            <InboxSidebar
              threads={allThreads.map((thread) => {
                console.log('🚀 thread:', thread);
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
            <InboxMain selectedThreadId={selectedThreadId} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InboxPage;
