'use client';

import InboxMain from '@/components/inbox/InboxMain';
import InboxSidebar from '@/components/inbox/InboxSidebar';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FiSettings, FiSidebar } from 'react-icons/fi';

// Sample email threads
const sampleThreads = [
  {
    threadId: '1',
    subject: 'Project Update: Q2 Goals',
    participants: ['john.doe@company.com'],
    messageCount: 3,
    snippet: 'Hi team, I wanted to share our progress on the Q2 goals...',
    timestamp: new Date('2024-03-15T10:30:00'),
    isUnread: true,
  },
  {
    threadId: '2',
    subject: 'Meeting Notes: Client Presentation',
    participants: ['sarah.smith@company.com'],
    messageCount: 1,
    snippet: "Here are the key points from today's client presentation...",
    timestamp: new Date('2024-03-14T15:45:00'),
    isUnread: false,
  },
  {
    threadId: '3',
    subject: 'Invoice #1234 Payment Confirmation',
    participants: ['finance@client.com'],
    messageCount: 2,
    snippet: 'We have received your payment for invoice #1234...',
    timestamp: new Date('2024-03-14T09:15:00'),
    isUnread: true,
  },
  {
    threadId: '4',
    subject: 'New Feature Request',
    participants: ['product@company.com'],
    messageCount: 5,
    snippet: 'The client has requested a new feature for the dashboard...',
    timestamp: new Date('2024-03-13T16:20:00'),
    isUnread: false,
  },
  {
    threadId: '5',
    subject: 'Weekly Team Sync',
    participants: ['team@company.com'],
    messageCount: 1,
    snippet: "Agenda for tomorrow's team sync meeting...",
    timestamp: new Date('2024-03-13T11:00:00'),
    isUnread: false,
  },
  {
    threadId: '6',
    subject: 'Contract Renewal Discussion',
    participants: ['legal@client.com'],
    messageCount: 4,
    snippet: 'Regarding the upcoming contract renewal, we would like to discuss...',
    timestamp: new Date('2024-03-12T14:30:00'),
    isUnread: true,
  },
  {
    threadId: '7',
    subject: 'Bug Report: Dashboard Loading Issue',
    participants: ['support@company.com'],
    messageCount: 2,
    snippet: 'Users are reporting slow loading times on the dashboard...',
    timestamp: new Date('2024-03-12T10:15:00'),
    isUnread: false,
  },
  {
    threadId: '8',
    subject: 'New Client Onboarding',
    participants: ['onboarding@company.com'],
    messageCount: 1,
    snippet: "Welcome to our platform! Here's what you need to know...",
    timestamp: new Date('2024-03-11T13:45:00'),
    isUnread: false,
  },
];

const TABS = ['Unassigned', 'Assigned', 'Archived', 'Snoozed', 'Trash', 'Spam'];

const InboxPage = () => {
  const [selectedThreadId, setSelectedThreadId] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState('Unassigned');
  const isMobile = useIsMobile();
  const { toggleSidebar } = useSidebar();
  const router = useRouter();

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
                return (
                  <button
                    key={tab}
                    className={`text-sm transition-colors duration-150 pb-1 border-b-2 whitespace-nowrap ${
                      activeTab === tab
                        ? 'font-semibold text-black dark:text-white border-black dark:border-white'
                        : 'font-normal text-gray-400 border-transparent hover:text-black dark:hover:text-white'
                    }`}
                    onClick={() => {
                      return setActiveTab(tab);
                    }}
                  >
                    {tab}
                  </button>
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
              threads={sampleThreads}
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
