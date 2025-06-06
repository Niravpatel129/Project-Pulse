'use client';

import { useInbox } from '@/hooks/use-inbox';
import { redirect } from 'next/navigation';

const InboxPage = () => {
  const { data: threads, error } = useInbox();

  redirect(`/dashboard/inbox/unassigned/${threads?.pages[0]?.data[0]?.threadId || '0'}`);
};

export default InboxPage;
