'use client';
import { useInbox } from '@/hooks/use-inbox';
import { redirect, useParams } from 'next/navigation';

const InboxPage = () => {
  const params = useParams();
  const { data: threads, error } = useInbox();

  redirect(`/dashboard/inbox/${params.state}/${threads?.pages[0]?.data[0]?.threadId || '0'}`);
};

export default InboxPage;
