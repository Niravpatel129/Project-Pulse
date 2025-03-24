import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useProject } from '@/contexts/ProjectContext';
import { useEmails } from '@/hooks/useEmails';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import parse from 'html-react-parser';
import {
  ChevronDown,
  ChevronUp,
  Download,
  FileIcon,
  ImageIcon,
  Mail,
  MailOpen,
  PaperclipIcon,
  Reply,
  Send,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { Descendant } from 'slate';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { EmailEditor } from './EmailComponents/EmailEditor';

interface Attachment {
  name: string;
  size: number;
  type: string;
  url: string;
}

interface EmailData {
  id: string;
  from: {
    name: string;
    email: string;
  };
  to: string;
  subject: string;
  content: string;
  date: string;
  attachments?: Attachment[];
  messageCount?: number;
  replies?: EmailData[];
  direction?: 'inbound' | 'outbound';
  messageId?: string;
  sentBy?: {
    name: string;
    email: string;
  };
  references?: string[];
  trackingData?: {
    shortProjectId: string;
    shortThreadId: string;
    shortUserId: string;
  };
  shortEmailId?: string;
  isLatestInThread?: boolean;
  threadId?: string | null;
  isRead?: boolean;
  status?: 'pending' | 'resolved' | 'urgent' | 'blocked';
  decisionRequired?: boolean;
  participants?: {
    name: string;
    email: string;
    role?: string;
  }[];
  lastAction?: {
    type: 'reply' | 'decision' | 'update';
    timestamp: string;
    user: string;
  };
  markAsRead?: (emailId: string, isRead: boolean) => Promise<void>;
}

interface EmailCardProps {
  email?: EmailData;
  depth?: number;
}

export function EmailCard({
  email = {
    id: '1',
    from: {
      name: 'Nirav Patel',
      email: 'mailman@email.com',
    },
    to: 'asd',
    subject: 'New Email',
    content:
      'Hi, I hope this email finds you well! I want to follow up regarding the email I sent you about the information you requested...',
    date: 'Thu, Mar 6, 2025',
    attachments: [],
  },
  depth = 0,
}: EmailCardProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [isThreadExpanded, setIsThreadExpanded] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [isHovering, setIsHovering] = useState(false);
  const [editorValue, setEditorValue] = useState<Descendant[]>([
    {
      type: 'paragraph',
      children: [{ text: '' }],
    },
  ]);
  const { project } = useProject();
  const { sendEmail, toggleReadStatus } = useEmails(project?._id || '');

  const handleReply = async () => {
    if (!replyContent.trim()) {
      toast.error('Message required', {
        description: 'Please add a message to your reply.',
      });
      return;
    }

    try {
      await sendEmail({
        to: [email.from.email],
        subject: `Re: ${email.subject}`,
        body: replyContent,
        projectId: project?._id || '',
        inReplyTo: email.messageId,
        references: email.references || [],
        trackingData: email.trackingData,
        shortEmailId: email.shortEmailId,
        emailId: email.id,
      });

      toast.success('Reply sent', {
        description: 'Your reply has been sent successfully.',
      });

      setIsReplying(false);
      setReplyContent('');
      setEditorValue([
        {
          type: 'paragraph',
          children: [{ text: '' }],
        },
      ]);
    } catch (error) {
      toast.error('Failed to send reply', {
        description: 'There was an error sending your reply. Please try again.',
      });
    }
  };

  const handleMarkReadUnread = async () => {
    try {
      await toggleReadStatus(email.id);
      toast.success(email.isRead ? 'Marked as read' : 'Marked as unread');
    } catch (error) {
      toast.error('Failed to update email status');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image')) {
      return <ImageIcon className='h-4 w-4 text-blue-500' />;
    }
    return <FileIcon className='h-4 w-4 text-gray-500' />;
  };

  // Function to check if content is HTML
  const isHTML = (str: string) => {
    return /<[a-z][\s\S]*>/i.test(str);
  };

  // Recursive function to check if there are any replies in the chain
  const hasReplies = (email: EmailData): boolean => {
    if (!email.replies || email.replies.length === 0) {
      return false;
    }
    return true;
  };

  // Check if this is an outbound email (sent by the current user)
  const isOutboundEmail = email.direction === 'outbound';

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'urgent':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'blocked':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'resolved':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  console.log('🚀 email:', email);

  return (
    <div className='relative'>
      <div className='flex gap-4'>
        {/* Timeline connector for replies */}
        {depth > 0 && (
          <div className='relative flex-shrink-0 w-8'>
            <div className='absolute left-4 top-0 bottom-0 w-[1px] bg-gray-200' />
            <div className='sticky top-0 flex flex-col items-center'>
              {email.decisionRequired && (
                <div className='mt-1 w-2 h-2 rounded-full bg-yellow-400 border-2 border-white relative z-10' />
              )}
            </div>
          </div>
        )}

        {/* Email content */}
        <div className='flex-1 min-w-0'>
          <Card
            className={cn(
              'border border-gray-200 bg-white shadow-sm transition-all duration-200',
              email.isRead ? 'bg-white' : 'bg-gray-50/80',
              email.status === 'urgent' && 'border-l-4 border-red-500',
              email.status === 'blocked' && 'border-l-4 border-orange-500',
              email.status === 'resolved' && 'border-l-4 border-green-500',
            )}
          >
            {/* Header with metadata */}
            <div className='flex items-start justify-between p-4 border-b border-gray-100'>
              <div className='flex items-center gap-3'>
                <Avatar className='h-8 w-8'>
                  <AvatarFallback
                    className={cn(
                      'bg-gray-100',
                      email.direction === 'inbound' ? 'bg-gray-100 text-gray-600' : 'bg-gray-100',
                    )}
                  >
                    {email.from?.name
                      ?.split(' ')
                      .map((n) => {
                        return n[0];
                      })
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className='flex items-center gap-2'>
                    <span
                      className={cn(
                        'font-medium',
                        email.isRead ? 'text-gray-900' : 'text-gray-900',
                      )}
                    >
                      {email.sentBy?.name || email.sentBy?.email.split('@')[0]}
                    </span>
                    <span className='text-xs text-gray-500'>
                      {formatDistanceToNow(new Date(email.date), { addSuffix: true })}
                    </span>
                  </div>
                  <div className='text-xs text-gray-500'>To: {email.to}</div>
                </div>
              </div>
              <div className='flex items-center gap-2'>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='h-8 px-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                      onClick={handleMarkReadUnread}
                    >
                      {email.isRead ? (
                        <MailOpen className='h-4 w-4' />
                      ) : (
                        <Mail className='h-4 w-4' />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {email.isRead ? 'Mark as unread' : 'Mark as read'}
                  </TooltipContent>
                </Tooltip>
                {/* {email.messageCount && email.messageCount > 1 && (
                  <span className='text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-full'>
                    {email.messageCount} messages
                  </span>
                )} */}
                {(email.messageCount && email.messageCount > 1) || hasReplies(email) ? (
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-8 px-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                    onClick={() => {
                      return setIsThreadExpanded(!isThreadExpanded);
                    }}
                  >
                    {isThreadExpanded ? (
                      <ChevronUp className='h-4 w-4' />
                    ) : (
                      <ChevronDown className='h-4 w-4' />
                    )}
                  </Button>
                ) : null}
              </div>
            </div>

            {/* Subject and status */}
            <div className='px-4 py-3 border-b border-gray-100'>
              <div className='flex items-center gap-2'>
                <h3
                  className={cn(
                    'text-base font-medium',
                    email.isRead ? 'text-gray-900' : 'text-gray-900',
                  )}
                >
                  {email.subject}
                </h3>
                {email.status && (
                  <span
                    className={cn(
                      'px-2 py-0.5 text-xs font-medium rounded-full border',
                      getStatusColor(email.status),
                    )}
                  >
                    {email.status.charAt(0).toUpperCase() + email.status.slice(1)}
                  </span>
                )}
              </div>
            </div>

            {/* Content */}
            <div className='px-4 py-3'>
              {isHTML(email.content) ? (
                <div
                  className={cn(
                    'text-sm email-content prose prose-sm max-w-none',
                    email.isRead ? 'text-gray-900' : 'text-gray-900',
                  )}
                >
                  {parse(email.content)}
                </div>
              ) : (
                <p className={cn('text-sm', email.isRead ? 'text-gray-900' : 'text-gray-900')}>
                  {email.content}
                </p>
              )}
            </div>

            {/* Attachments */}
            {email.attachments && email.attachments.length > 0 && (
              <div className='px-4 py-3 border-t border-gray-100'>
                <div className='flex items-center gap-2 mb-2'>
                  <PaperclipIcon className='h-4 w-4 text-gray-500' />
                  <span className='text-sm font-medium'>
                    Attachments ({email.attachments.length})
                  </span>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                  {email.attachments.map((attachment, index) => {
                    return (
                      <div
                        key={`${email.id}-attachment-${index}`}
                        className='flex items-center gap-2 p-2 rounded-md border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors'
                      >
                        {attachment.type.startsWith('image') ? (
                          <div className='w-8 h-8 flex-shrink-0 rounded overflow-hidden'>
                            <Image
                              src={attachment.url}
                              alt={attachment.name}
                              className='w-full h-full object-cover'
                              width={32}
                              height={32}
                            />
                          </div>
                        ) : (
                          getFileIcon(attachment.type)
                        )}
                        <div className='flex-1 min-w-0'>
                          <div className='text-sm font-medium truncate'>{attachment.name}</div>
                          <div className='text-xs text-gray-500'>
                            {formatFileSize(attachment.size)}
                          </div>
                        </div>
                        <a
                          href={attachment.url}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='p-1 rounded-full hover:bg-gray-200'
                          title='Download attachment'
                        >
                          <Download className='h-4 w-4 text-gray-600' />
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Reply button */}
            {!isOutboundEmail && (
              <div className='px-4 py-3 border-t border-gray-100'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsReplying(!isReplying);
                  }}
                  className={cn(
                    'transition-opacity duration-200',
                    isHovering || isReplying ? 'opacity-100' : 'opacity-0',
                  )}
                >
                  <Reply className='h-4 w-4 mr-2' />
                  {isReplying ? 'Cancel Reply' : 'Reply'}
                </Button>
              </div>
            )}
          </Card>

          {/* Reply Editor */}
          {isReplying && (
            <div className='mt-4'>
              <Card className='border-2 border-gray-200'>
                <div className='p-4 space-y-4'>
                  <div className='flex justify-between items-center'>
                    <div>
                      <div className='text-sm text-gray-500'>
                        To: {email.from.name} ({email.from.email})
                      </div>
                      <div className='text-sm font-medium'>Re: {email.subject}</div>
                    </div>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => {
                        return setIsReplying(false);
                      }}
                    >
                      <X className='h-4 w-4' />
                    </Button>
                  </div>
                  <div className='border rounded-md mt-2'>
                    <EmailEditor
                      initialValue={editorValue}
                      onChange={(value, plainText) => {
                        setEditorValue(value);
                        setReplyContent(plainText);
                      }}
                      height='150px'
                    />
                  </div>
                  <div className='flex justify-end'>
                    <Button onClick={handleReply}>
                      <Send className='h-4 w-4 mr-2' />
                      Send Reply
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Nested Replies */}
          {email.replies && email.replies.length > 0 && isThreadExpanded && (
            <div className='mt-4 space-y-4'>
              {email.replies.map((reply) => {
                return <EmailCard key={reply.id} email={reply} depth={depth + 1} />;
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
