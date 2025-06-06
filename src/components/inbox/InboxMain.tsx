import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { useEmailChain } from '@/hooks/use-email-chain';
import '@/styles/email.css';
import { formatDistanceToNow } from 'date-fns';
import { ChevronDown, ChevronUp, MoreVertical, Paperclip, X } from 'lucide-react';
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

const AttachmentList = ({ attachments }: { attachments: Attachment[] }) => {
  if (!attachments.length) return null;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('sheet')) return '📊';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📑';
    return '📎';
  };

  return (
    <div className=''>
      <div className='flex items-center gap-2 mb-3'>
        <Paperclip className='h-4 w-4 text-muted-foreground' />
        <h3 className='text-sm font-medium'>Attachments ({attachments.length})</h3>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
        {attachments.map((attachment) => {
          return (
            <a
              key={attachment.attachmentId}
              href={attachment.storageUrl}
              target='_blank'
              rel='noopener noreferrer'
              className='flex items-center gap-3 p-3 rounded-lg border border-slate-100 dark:border-[#232428] hover:bg-slate-50 dark:hover:bg-[#1a1b1e] transition-colors'
            >
              <div className='flex-shrink-0 w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-[#232428] rounded-lg'>
                <span className='text-lg'>{getFileIcon(attachment.mimeType)}</span>
              </div>
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium truncate' title={attachment.filename}>
                  {attachment.filename}
                </p>
                <p className='text-xs text-muted-foreground'>{formatFileSize(attachment.size)}</p>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
};

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

      // Scroll to bottom after a short delay to ensure content is rendered
      containerRef.current?.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'instant',
      });
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
              <div className='p-4'>
                <EmailContent
                  html={emailContent.html}
                  isBodyExpanded={isBodyExpanded}
                  containsQuotedContent={containsQuotedContent}
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
            </div>
          </>
        )}
      </div>
    );
  };

  // Get all attachments from all emails
  const getAllAttachments = () => {
    if (!emailChain?.emails) return [];

    // Get all attachments and filter out duplicates based on attachmentId
    const seenAttachments = new Set<string>();
    return emailChain.emails
      .flatMap((email) => {
        return email.attachments || [];
      })
      .filter((attachment) => {
        if (seenAttachments.has(attachment.attachmentId)) {
          return false;
        }
        seenAttachments.add(attachment.attachmentId);
        return true;
      });
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
      <div className='p-4 h-full overflow-hidden flex flex-col'>
        <div className='flex justify-between items-center mb-4'>
          <Skeleton className='h-8 w-64' />
        </div>
        <div className='flex flex-col gap-0 overflow-y-auto flex-1'>
          <EmailSkeleton />
        </div>
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
      <InboxHeader
        subject={emailChain.subject}
        threadId={emailChain.threadId}
        isUnread={!emailChain.isRead}
        hasAttachments={emailChain.emails.some((email) => {
          return email.attachments?.length > 0;
        })}
        status={emailChain.stage}
      />
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
