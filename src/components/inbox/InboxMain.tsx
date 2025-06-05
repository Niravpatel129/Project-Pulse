import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useEmailChain } from '@/hooks/use-email-chain';
import '@/styles/email.css';
import { ChevronDown, ChevronUp, MoreVertical, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
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
  const [expandedBodies, setExpandedBodies] = useState<Set<string>>(new Set());
  const [isReplying, setIsReplying] = useState(false);
  const [replyToEmail, setReplyToEmail] = useState<Email | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { data: emailChain, isLoading, error } = useEmailChain(selectedThreadId);

  // Add effect to expand latest email when emailChain loads
  useEffect(() => {
    if (emailChain?.emails?.length > 0) {
      const latestEmail = emailChain.emails[emailChain.emails.length - 1];
      setExpandedThreads(new Set([latestEmail._id]));
    }
  }, [emailChain]);

  // Add effect to scroll to bottom when reply box opens
  useEffect(() => {
    if (isReplying && containerRef.current) {
      setTimeout(() => {
        containerRef.current?.scrollTo({
          top: containerRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }, 100);
    }
  }, [isReplying, replyToEmail]);

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

  const toggleBody = (emailId: string) => {
    setExpandedBodies((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(emailId)) {
        newSet.delete(emailId);
      } else {
        newSet.add(emailId);
      }
      return newSet;
    });
  };

  const hasQuotedContent = (html: string) => {
    // Check for common email quote patterns
    const quotePatterns = [
      /On .* wrote:/i,
      /From:.*\n.*\n.*\n.*\n/i,
      /Sent from my iPhone/i,
      /Sent from my mobile/i,
      /gmail_quote/i,
      /blockquote/i,
    ];

    return quotePatterns.some((pattern) => {
      return pattern.test(html);
    });
  };

  const renderThread = (email: Email) => {
    const isExpanded = expandedThreads.has(email._id);
    const isBodyExpanded = expandedBodies.has(email._id);
    const recipients = email.to
      .map((t) => {
        return t.email;
      })
      .join(', ');

    // Check if email contains quoted content using the new function
    const containsQuotedContent = hasQuotedContent(email.body.html);

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
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      asChild
                      onClick={(e) => {
                        return e.stopPropagation();
                      }}
                    >
                      <Button variant='ghost' size='icon' className='h-8 w-8'>
                        <MoreVertical className='h-4 w-4' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setReplyToEmail(email);
                          setIsReplying(true);
                        }}
                      >
                        Reply
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setReplyToEmail(email);
                          setIsReplying(true);
                        }}
                      >
                        Reply All
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setReplyToEmail(email);
                          setIsReplying(true);
                        }}
                      >
                        Forward
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
              <div
                className={`email-content ${
                  !isBodyExpanded && containsQuotedContent
                    ? '[&_blockquote]:hidden [&_div]:has(blockquote):hidden'
                    : ''
                }`}
                dangerouslySetInnerHTML={{ __html: email.body.html }}
              />
              {containsQuotedContent && (
                <Button
                  variant='ghost'
                  size='sm'
                  className='mt-2 text-muted-foreground hover:text-foreground'
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleBody(email._id);
                  }}
                >
                  {isBodyExpanded ? 'Show less' : 'Show more'}
                </Button>
              )}
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
    <div className='p-4 h-full overflow-hidden flex flex-col'>
      <h2 className='text-xl font-bold mb-4 text-[#121212] dark:text-white'>
        {emailChain.subject}
      </h2>

      <div ref={containerRef} className='flex flex-col gap-0 overflow-y-auto flex-1'>
        {emailChain.emails.map((email) => {
          return renderThread(email);
        })}
        {isReplying && replyToEmail && (
          <div className='relative'>
            <Button
              variant='ghost'
              size='icon'
              className='absolute right-2 top-2 z-10'
              onClick={() => {
                return setIsReplying(false);
              }}
            >
              <X className='h-4 w-4' />
            </Button>
            <InboxReply
              initialValue={[
                {
                  type: 'paragraph',
                  children: [{ text: '' }],
                },
              ]}
              height='200px'
              email={replyToEmail}
              isReply={true}
            />
          </div>
        )}
      </div>
    </div>
  );
}
