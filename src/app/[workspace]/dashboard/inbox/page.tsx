'use client';

import InboxMain from '@/components/inbox/InboxMain';
import InboxSidebar from '@/components/inbox/InboxSidebar';
import { useState } from 'react';

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

const InboxPage = () => {
  const [selectedThreadId, setSelectedThreadId] = useState<string | undefined>();

  return (
    <div className='flex h-screen w-full overflow-hidden p-4 gap-4'>
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
  );
};

export default InboxPage;
