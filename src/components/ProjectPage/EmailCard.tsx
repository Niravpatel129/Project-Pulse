import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useProject } from '@/contexts/ProjectContext';
import { useEmails } from '@/hooks/useEmails';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import parse from 'html-react-parser';
import {
  ChevronDown,
  ChevronUp,
  Download,
  FileIcon,
  ImageIcon,
  PaperclipIcon,
  Reply,
  Send,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { Descendant } from 'slate';
import { toast } from 'sonner';
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
  const { sendEmail } = useEmails(project?._id || '');

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

  return (
    <div className='space-y-4'>
      <div className='space-y-0'>
        <Card
          key={email.id}
          className={cn(
            'p-4 transition-all duration-200',
            email.messageCount && email.messageCount > 1 && '',
            depth > 0 && 'border-l-2 mt-2',
          )}
          onMouseEnter={() => {
            return setIsHovering(true);
          }}
          onMouseLeave={() => {
            return setIsHovering(false);
          }}
        >
          <div className='flex items-start gap-4'>
            <Avatar className='h-10 w-10'>
              <AvatarFallback
                className={cn(
                  'bg-gray-100',
                  email.direction === 'inbound' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100',
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
            <div className='flex-1 min-w-0'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <span className='font-medium'>
                    {email.sentBy?.name || email.sentBy?.email.split('@')[0]}
                  </span>
                  <span className='text-gray-500'>({email.sentBy?.email})</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Tooltip>
                    <TooltipTrigger>
                      <span className='text-sm text-gray-500'>
                        {formatDistanceToNow(new Date(email.date), { addSuffix: true })}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <span>{format(new Date(email.date), 'MMM d, yyyy hh:mm a')}</span>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              <div className='flex items-center gap-2 mt-1'>
                <h3 className='text-base font-medium'>{email.subject}</h3>
                {(email.messageCount && email.messageCount > 1) || hasReplies(email) ? (
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-6 px-2'
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
              <div className='mt-4'>
                {isHTML(email.content) ? (
                  <div
                    className='text-sm text-gray-600 email-content'
                    style={{
                      position: 'relative',
                      zIndex: 1,
                    }}
                  >
                    {parse(email.content)}
                  </div>
                ) : (
                  <p className='text-sm text-gray-600'>{email.content}</p>
                )}
              </div>

              {/* Attachments section */}
              {email.attachments && email.attachments.length > 0 && (
                <div className='mt-4 border-t pt-4'>
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
                            <div className='w-10 h-10 flex-shrink-0 rounded overflow-hidden'>
                              <Image
                                src={attachment.url}
                                alt={attachment.name}
                                className='w-full h-full object-cover'
                                width={40}
                                height={40}
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

              {/* Only show reply button for inbound emails */}
              {!isOutboundEmail && (
                <div className='flex justify-end mt-4 h-8'>
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
                      'invisible',
                    )}
                    aria-hidden='true'
                  >
                    <Reply className='h-4 w-4 mr-2' />
                    {isReplying ? 'Cancel Reply' : 'Reply'}
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsReplying(!isReplying);
                    }}
                    className={cn(
                      'transition-opacity duration-200 absolute',
                      isHovering || isReplying ? 'opacity-100' : 'opacity-0',
                    )}
                  >
                    <Reply className='h-4 w-4 mr-2' />
                    {isReplying ? 'Cancel Reply' : 'Reply'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Nested Replies - Recursively render all replies */}
        {email.replies && email.replies.length > 0 && isThreadExpanded && (
          <div className='ml-8 mt-2 space-y-4'>
            {email.replies.map((reply) => {
              return <EmailCard key={reply.id} email={reply} depth={depth + 1} />;
            })}
          </div>
        )}

        {isReplying && (
          <div className='relative'>
            <Card className='mt-4'>
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
      </div>
    </div>
  );
}
