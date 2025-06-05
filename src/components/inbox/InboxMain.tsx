import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useEmailChain } from '@/hooks/use-email-chain';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import InboxReply from './InboxReply';

interface InboxMainProps {
  selectedThreadId?: string;
}

interface Email {
  _id: string;
  from: {
    name: string;
    email: string;
    avatar: string;
    initials: string;
  };
  to: Array<{
    name: string;
    email: string;
  }>;
  subject: string;
  body: {
    text: string;
    html: string;
  };
  internalDate: string;
  isRead: boolean;
}

export default function InboxMain({ selectedThreadId }: InboxMainProps) {
  const [expandedThreads, setExpandedThreads] = useState<Set<string>>(new Set());
  const { data: emailChain, isLoading, error } = useEmailChain(selectedThreadId);

  // Set the latest email as expanded when emailChain data is available
  useEffect(() => {
    if (emailChain?.emails?.length > 0) {
      const latestEmailId = emailChain.emails[emailChain.emails.length - 1]._id;
      setExpandedThreads(new Set([latestEmailId]));
    }
  }, [emailChain]);

  const toggleThread = (threadId: string) => {
    setExpandedThreads((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(threadId)) {
        newSet.delete(threadId);
      } else {
        newSet.add(threadId);
      }
      return newSet;
    });
  };

  const renderThread = (email: Email) => {
    const isExpanded = expandedThreads.has(email._id);
    const recipients = email.to
      .map((t) => {
        return t.email;
      })
      .join(', ');

    return (
      <div
        key={email._id}
        className='border border-slate-100 dark:border-[#232428] rounded-lg mb-4'
      >
        <div
          className='flex items-center gap-4 p-4 justify-between w-full cursor-pointer transition-colors'
          onClick={() => {
            return toggleThread(email._id);
          }}
        >
          {/* Avatar  */}
          <div className='flex items-start gap-4 w-full'>
            <Avatar className='h-7 w-7'>
              <AvatarFallback className='bg-[#656973] text-white dark:text-white dark:bg-[#656973] text-[10px]'>
                {email.from.initials}
              </AvatarFallback>
            </Avatar>
            <div className='flex-1'>
              <div className='flex justify-between items-start'>
                <div>
                  <div className='font-medium text-sm text-[#121212] dark:text-white leading-tight'>
                    {email.from.name}{' '}
                    <span className='text-muted-foreground text-sm'>
                      &lt;{email.from.email}&gt;
                    </span>
                  </div>
                  <div
                    className='text-sm text-muted-foreground'
                    style={{
                      display: isExpanded ? 'block' : 'none',
                    }}
                  >
                    To: {recipients}
                  </div>
                  <div
                    className='text-sm text-muted-foreground'
                    style={{
                      display: isExpanded ? 'block' : 'none',
                    }}
                  >
                    Subject: {email.subject}
                  </div>
                  <div
                    className='text-sm text-muted-foreground'
                    style={{
                      display: !isExpanded ? 'block' : 'none',
                    }}
                  >
                    {email.body.text.length > 100
                      ? `${email.body.text.substring(0, 100)}...`
                      : email.body.text}
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='text-sm text-muted-foreground'>
                    {new Date(email.internalDate).toLocaleString()}
                  </div>
                  {isExpanded ? (
                    <ChevronUp className='h-4 w-4 text-muted-foreground' />
                  ) : (
                    <ChevronDown className='h-4 w-4 text-muted-foreground' />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        {isExpanded && (
          <>
            <div className='border-t border-slate-100 dark:border-[#232428] h-[1px]' />
            <div className='p-4 min-h-[100px]'>
              <div className='text-sm mt-2 text-[#121212] dark:text-white'>{email.body.text}</div>
            </div>
          </>
        )}
      </div>
    );
  };

  if (!selectedThreadId) {
    return (
      <div className='flex items-center justify-center h-full'>
        <p className='text-muted-foreground'>Select a thread to view its contents</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-full'>
        <p className='text-muted-foreground'>Loading thread...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex items-center justify-center h-full'>
        <p className='text-red-500'>Error loading thread: {(error as Error).message}</p>
      </div>
    );
  }

  if (!emailChain) {
    return (
      <div className='flex items-center justify-center h-full'>
        <p className='text-muted-foreground'>No thread data available</p>
      </div>
    );
  }

  return (
    <div className='p-4'>
      <h2 className='text-xl font-bold mb-4 text-[#121212] dark:text-white'>
        {emailChain.subject}
      </h2>

      <div className='flex flex-col gap-0'>
        {emailChain.emails.map((email) => {
          return renderThread(email);
        })}
        <InboxReply />
      </div>
    </div>
  );
}
