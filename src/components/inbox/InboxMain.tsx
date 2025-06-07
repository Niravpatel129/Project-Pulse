import AttachmentList from '@/components/AttachmentList';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useEmailChainContext } from '@/contexts/EmailChainContext';
import '@/styles/email.css';
import { newRequest } from '@/utils/newRequest';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { ChevronDown, ChevronUp, MoreHorizontal, MoreVertical, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import EmailContent from './EmailContent';
import EmailSkeleton from './EmailSkeleton';
import InboxHeader from './InboxHeader';
import InboxReply from './InboxReply';

interface InboxMainProps {
  selectedThreadId?: string;
}

interface Email {
  _id: string;
  gmailMessageId: string;
  threadId: string;
  userId: string;
  workspaceId: string;
  from: {
    id: number;
    avatar_type: string;
    class: string;
    source: string;
    url: string;
    namespace: string;
    name: string;
    card_name: string;
    handle: string;
    email: string;
    display_name: string;
    description: string | null;
    avatar: string;
    initials: string;
    role: string;
    is_spammer: boolean;
    recipient_url: string;
  };
  to: Array<{
    id: number;
    avatar_type: string;
    class: string;
    source: string;
    url: string;
    namespace: string;
    name: string;
    card_name: string;
    handle: string;
    email: string;
    display_name: string;
    description: string | null;
    avatar: string;
    initials: string;
    role: string;
    is_spammer: boolean;
    recipient_url: string;
  }>;
  cc: Array<{
    id: number;
    avatar_type: string;
    class: string;
    source: string;
    url: string;
    namespace: string;
    name: string;
    card_name: string;
    handle: string;
    email: string;
    display_name: string;
    description: string | null;
    avatar: string;
    initials: string;
    role: string;
    is_spammer: boolean;
    recipient_url: string;
  }>;
  bcc: Array<{
    id: number;
    avatar_type: string;
    class: string;
    source: string;
    url: string;
    namespace: string;
    name: string;
    card_name: string;
    handle: string;
    email: string;
    display_name: string;
    description: string | null;
    avatar: string;
    initials: string;
    role: string;
    is_spammer: boolean;
    recipient_url: string;
  }>;
  subject: string;
  body: {
    mimeType: string;
    parts: {
      mimeType: string;
      filename: string;
      headers: Array<{
        name: string;
        value: string;
      }>;
      parts?: Array<{
        mimeType: string;
        filename: string;
        headers: Array<{
          name: string;
          value: string;
        }>;
        content: string;
      }>;
    }[];
    structure: {
      mimeType: string;
      contentId: string | null;
      filename: string;
      headers: Array<{
        name: string;
        value: string;
      }>;
      parts: Array<{
        mimeType: string;
        contentId: string | null;
        filename: string;
        headers: Array<{
          name: string;
          value: string;
        }>;
        content: string;
      }>;
    };
  };
  internalDate: string;
  attachments: any[];
  inlineImages: any[];
  historyId: string;
  direction: string;
  status: string;
  sentAt: string;
  isSpam: boolean;
  stage: string;
  threadPart: number;
  messageReferences: Array<{
    messageId: string;
    inReplyTo: string;
    references: string[];
    type?: string;
    position?: number;
    _id?: string;
    id?: string;
  }>;
  labels: Array<{
    name: string;
    color: string;
    _id: string;
    id: string;
  }>;
  headers: Array<{
    name: string;
    value: string;
    _id: string;
    id: string;
  }>;
  createdAt: string;
  updatedAt: string;
  __v: number;
  id: string;
}

interface Attachment {
  filename: string;
  mimeType: string;
  size: number;
  attachmentId: string;
  storageUrl: string;
  headers: any[];
}

export default function InboxMain() {
  const [expandedThreads, setExpandedThreads] = useState<Set<string>>(new Set());
  const [expandedBodies, setExpandedBodies] = useState<Set<string>>(new Set());
  const [isReplying, setIsReplying] = useState(false);
  const [replyToEmail, setReplyToEmail] = useState<Email | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasMarkedAsReadRef = useRef<boolean>(false);
  const { emailChain, isLoading, error } = useEmailChainContext();

  const queryClient = useQueryClient();

  const markAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!emailChain?.threadId) return;
      const response = await newRequest.post(`/inbox/${emailChain.threadId}/read-status`, {
        isUnread: false,
      });
      return response.data;
    },
    onMutate: async () => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['email-chain', emailChain?.threadId] });
      await queryClient.cancelQueries({ queryKey: ['inbox-threads'] });

      // Snapshot the previous value
      const previousEmailChain = queryClient.getQueryData(['email-chain', emailChain?.threadId]);
      const previousInboxThreads = queryClient.getQueryData(['inbox-threads']);

      // Optimistically update the cache
      queryClient.setQueryData(['email-chain', emailChain?.threadId], (old: any) => {
        return {
          ...old,
          isRead: true,
        };
      });

      queryClient.setQueryData(['inbox-threads'], (old: any) => {
        if (!old) return old;
        return old.map((thread: any) => {
          return thread.id === emailChain?.threadId ? { ...thread, isRead: true } : thread;
        });
      });

      queryClient.invalidateQueries({ queryKey: ['inbox-headers'] });

      return { previousEmailChain, previousInboxThreads };
    },
    onError: (err, newTodo, context) => {
      // Rollback on error
      if (context?.previousEmailChain) {
        queryClient.setQueryData(['email-chain', emailChain?.threadId], context.previousEmailChain);
      }
      if (context?.previousInboxThreads) {
        queryClient.setQueryData(['inbox-threads'], context.previousInboxThreads);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['email-chain', emailChain?.threadId] });
      queryClient.invalidateQueries({ queryKey: ['inbox-threads'] });
    },
  });

  // Reset the ref when selectedThreadId changes
  useEffect(() => {
    hasMarkedAsReadRef.current = false;
  }, [emailChain?.threadId]);

  // Add effect to mark as read when thread is selected
  useEffect(() => {
    if (emailChain?.threadId && !emailChain?.isRead && !hasMarkedAsReadRef.current) {
      hasMarkedAsReadRef.current = true;
      markAsReadMutation.mutate();
    }
  }, [emailChain?.threadId, emailChain?.isRead]);

  useEffect(() => {
    if (emailChain?.emails?.length > 0) {
      const latestEmail = emailChain.emails[emailChain.emails.length - 1];
      setExpandedThreads(new Set([latestEmail._id]));

      // Scroll to bottom after a short delay to ensure content is rendered
      // containerRef.current?.scrollTo({
      //   top: containerRef.current.scrollHeight,
      //   behavior: 'instant',
      // });
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

  const getEmailContent = (email: Email) => {
    const findContentParts = (parts: any[]): { text: string; html: string } => {
      let text = '';
      let html = '';

      for (const part of parts) {
        if (part.mimeType === 'text/plain') {
          text += part.content || '';
        } else if (part.mimeType === 'text/html') {
          html += part.content || '';
        } else if (part.parts) {
          const nestedContent = findContentParts(part.parts);
          text += nestedContent.text;
          html += nestedContent.html;
        }
      }

      return { text, html };
    };

    // First try to get content from the structure
    if (email.body.structure?.parts) {
      const content = findContentParts(email.body.structure.parts);
      if (content.text || content.html) {
        return content;
      }
    }

    // Fallback to the parts array if structure doesn't have content
    if (email.body.parts) {
      const content = findContentParts(email.body.parts);
      if (content.text || content.html) {
        return content;
      }
    }

    return { text: '', html: '' };
  };

  const renderThread = (email: Email) => {
    const isExpanded = expandedThreads.has(email._id);
    const isBodyExpanded = expandedBodies.has(email._id);
    const recipients = email.to
      .map((t) => {
        return t.email;
      })
      .join(', ');

    const emailContent = getEmailContent(email);
    const containsQuotedContent = hasQuotedContent(emailContent.html);

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
                    {emailContent.text.length > 100
                      ? `${emailContent.text.substring(0, 100)}...`
                      : emailContent.text}
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='text-sm text-muted-foreground'>
                    {formatDistanceToNow(new Date(email.internalDate), { addSuffix: false })}
                  </div>
                  <DropdownMenu modal={false}>
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
                    <DropdownMenuContent
                      align='end'
                      onCloseAutoFocus={(e) => {
                        return e.preventDefault();
                      }}
                    >
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();

                          containerRef.current?.scrollTo({
                            top: containerRef.current.scrollHeight,
                            behavior: 'smooth',
                          });
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
            <div className='min-h-[100px]'>
              {email.attachments && email.attachments.length > 0 && (
                <>
                  <div className='p-4'>
                    <AttachmentList attachments={email.attachments} />
                  </div>
                  <div className='border-t border-slate-100 dark:border-[#232428] h-[1px]' />
                </>
              )}
              <div className='p-4 min-h-[200px]'>
                <EmailContent
                  html={emailContent.html}
                  isBodyExpanded={isBodyExpanded}
                  containsQuotedContent={containsQuotedContent}
                />
                {containsQuotedContent && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='mt-2 text-muted-foreground hover:text-foreground'
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBody(email._id);
                          }}
                        >
                          <MoreHorizontal className='h-4 w-4' />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Toggle message quote</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                <div className='mt-4 flex justify-end'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={(e) => {
                      e.stopPropagation();
                      setReplyToEmail(email);
                      setIsReplying(true);
                      containerRef.current?.scrollTo({
                        top: containerRef.current.scrollHeight,
                        behavior: 'smooth',
                      });
                    }}
                  >
                    Reply
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className='p-4 h-full overflow-hidden flex flex-col scrollbar-hide'>
        <div className='flex justify-between items-center mb-6'>
          <Skeleton className='h-8 w-64' />
        </div>
        <div className='flex flex-col gap-0 overflow-y-auto flex-1'>
          <EmailSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return <div className='flex items-center justify-center h-full'></div>;
  }

  if (!emailChain) {
    return (
      <div className='flex items-center justify-center h-full'>
        <p className='text-muted-foreground'>No thread data available</p>
      </div>
    );
  }

  return (
    <div className='p-4 h-full overflow-hidden flex flex-col scrollbar-hide'>
      <InboxHeader
        subject={emailChain.subject}
        threadId={emailChain.threadId}
        isUnread={!emailChain.isRead}
        hasAttachments={emailChain?.emails?.some((email) => {
          return email.attachments?.length > 0;
        })}
        status={emailChain.stage}
      />
      <div ref={containerRef} className='flex flex-col gap-0 overflow-y-auto flex-1 scrollbar-hide'>
        {emailChain?.emails?.map((email) => {
          return renderThread(email);
        })}

        {isReplying && replyToEmail && (
          <div className='relative pb-40'>
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
              inReplyToEmailId={replyToEmail._id}
              onSend={() => {
                setIsReplying(false);
                setReplyToEmail(null);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
