'use client';
import InboxSidebar from '@/components/inbox/InboxSidebar';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';
import { EmailChainProvider } from '@/contexts/EmailChainContext';
import { useInbox } from '@/hooks/use-inbox';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import React from 'react';
import { FiSettings, FiSidebar } from 'react-icons/fi';

const TABS = ['Unassigned', 'Assigned', 'Archived', 'Snoozed', 'Trash', 'Spam'];

const InboxLayout = ({ children }: { children: React.ReactNode }) => {
  const { toggleSidebar } = useSidebar();
  const router = useRouter();
  const params = useParams();
  const activeTab =
    (params.state as string)?.charAt(0).toUpperCase() + (params.state as string)?.slice(1) ||
    'Unassigned';

  const { data: threads, error, isLoading } = useInbox();

  const allThreads =
    threads?.pages.flatMap((page) => {
      return page.data;
    }) || [];

  return (
    <EmailChainProvider>
      <div className='w-full'>
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
                      className={`text-sm transition-all duration-300 pb-1 border-b-2 whitespace-nowrap ${
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

        <div className='flex flex-1 overflow-hidden p-4 gap-4'>
          <div className='flex flex-col w-full overflow-hidden'>
            {/* Main Content */}
            <div className='flex flex-1 overflow-hidden gap-4 max-h-[calc(100vh-100px)]'>
              <div className='w-[320px] h-full flex-shrink-0'>
                <div className='h-full rounded-lg border border-slate-100 dark:border-[#232428] shadow-sm bg-white dark:bg-neutral-900 overflow-hidden'>
                  <InboxSidebar
                    loading={isLoading}
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
                <div className='h-full rounded-lg border border-slate-100 dark:border-[#232428] shadow-sm bg-white dark:bg-neutral-900 overflow-scroll min-h-[calc(100vh-100px)]'>
                  {children}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </EmailChainProvider>
  );
};

export default InboxLayout;
