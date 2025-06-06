'use client';

import InboxMain from '@/components/inbox/InboxMain';
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

  return (
    <div className='flex-1 h-full min-w-0'>
      <div className='h-full rounded-lg overflow-hidden'>
        <InboxMain />
      </div>
    </div>
  );
};

export default InboxPage;
