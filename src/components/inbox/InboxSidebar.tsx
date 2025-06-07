import { useEmailChainContext } from '@/contexts/EmailChainContext';
import { AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import EmailSkeleton from './EmailSkeleton';

interface EmailThread {
  threadId: string;
  subject: string;
  participants: string[];
  snippet: string;
  timestamp: Date;
  isUnread: boolean;
  emails: any[];
}

interface InboxSidebarProps {
  threads?: EmailThread[];
  loading?: boolean;
  hasNextPage?: boolean;
  fetchNextPage?: () => void;
  isFetchingNextPage?: boolean;
}

const ThreadItem = ({
  thread,
  onClick,
  onMouseEnter,
}: {
  thread: EmailThread;
  onClick: () => void;
  onMouseEnter: () => void;
}) => {
  const pathname = usePathname();
  const isSelected = pathname.includes(thread.threadId);
  const params = useParams();

  return (
    <Link
      href={`/dashboard/inbox/${params.state}/${thread.threadId}`}
      className='w-full'
      prefetch={true}
    >
      <div
        className={`p-4 border-b border-slate-100 dark:border-[#232428] hover:bg-slate-50 dark:hover:bg-neutral-800 cursor-pointer ${
          isSelected ? 'bg-slate-50 dark:bg-neutral-800' : ''
        }`}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
      >
        <div className='flex-1 min-w-0'>
          <div className='flex items-center justify-between mb-1'>
            <div className='flex items-center gap-2'>
              {thread.isUnread && <div className='w-2 h-2 rounded-full bg-blue-500' />}
              <div className='font-medium text-sm text-[#121212] dark:text-white truncate'>
                {thread.participants[0]}
              </div>
            </div>
            <div className='text-xs text-muted-foreground'>
              {thread.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
          <div className='text-sm text-[#121212] dark:text-white truncate'>{thread.subject}</div>
          <div className='text-sm text-muted-foreground truncate'>{thread.snippet}</div>
        </div>
      </div>
    </Link>
  );
};

export default function InboxSidebar({
  threads = [],
  loading = false,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
}: InboxSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [localThreads, setLocalThreads] = useState(threads);
  const previousThreadsRef = useRef<EmailThread[]>([]);
  const { prefetchEmailChain } = useEmailChainContext();
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (localThreads.length === 0) {
      setLocalThreads(threads);
      previousThreadsRef.current = threads;
    } else {
      // Check for new messages
      const newThreads = threads.filter((thread) => {
        return !previousThreadsRef.current.some((prevThread) => {
          return prevThread.threadId === thread.threadId;
        });
      });

      setLocalThreads(threads);
      previousThreadsRef.current = threads;
    }
  }, [threads]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage?.();
        }
      },
      { threshold: 0.1 },
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleThreadSelect = (threadId: string) => {
    // Handle thread selection
  };

  const filteredThreads = localThreads.filter((thread) => {
    const matchesSearch = searchQuery
      ? thread.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        thread.participants.some((p) => {
          return p.toLowerCase().includes(searchQuery.toLowerCase());
        }) ||
        thread.snippet.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    return matchesSearch;
  });

  if (loading) {
    return (
      <div className='flex flex-col h-full'>
        <div className='p-4 border-b border-slate-100 dark:border-[#232428]'>
          <div className='relative'>
            <input
              type='text'
              placeholder='Search threads...'
              className='w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-[#232428] bg-white dark:bg-neutral-900 text-sm'
              value={searchQuery}
              onChange={(e) => {
                return setSearchQuery(e.target.value);
              }}
            />
          </div>
        </div>
        <div className='flex-1 overflow-y-auto'>
          <EmailSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col h-full'>
      <div className='p-4 border-b border-slate-100 dark:border-[#232428]'>
        <div className='relative'>
          <input
            type='text'
            placeholder='Search threads...'
            className='w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-[#232428] bg-white dark:bg-neutral-900 text-sm'
            value={searchQuery}
            onChange={(e) => {
              return setSearchQuery(e.target.value);
            }}
          />
        </div>
      </div>
      <div className='flex-1 overflow-y-auto'>
        <AnimatePresence mode='popLayout'>
          {filteredThreads.map((thread) => {
            return (
              <ThreadItem
                key={thread.threadId}
                thread={thread}
                onClick={() => {
                  return handleThreadSelect(thread.threadId);
                }}
                onMouseEnter={() => {
                  return prefetchEmailChain(thread.threadId);
                }}
              />
            );
          })}
        </AnimatePresence>
        {hasNextPage && (
          <div ref={loadMoreRef} className='p-4 text-center'>
            {isFetchingNextPage ? (
              <div className='flex items-center justify-center'>
                <div className='w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin' />
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
