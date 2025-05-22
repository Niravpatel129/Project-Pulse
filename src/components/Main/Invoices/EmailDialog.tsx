import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { newRequest } from '@/utils/newRequest';
import { ChevronDown, ChevronUp, FileText, Paperclip } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

// Interface for email objects
interface EmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  labelIds: string[];
  from: string;
  to: string;
  cc: string;
  subject: string;
  date: string;
  messageId: string;
  inReplyTo: string;
  references: string;
  hasAttachment: boolean;
  body?: string;
  bodyType?: string;
  attachments?: {
    id: string;
    filename: string;
    mimeType: string;
    size: number;
    isInline: boolean;
    downloadUrl: string;
  }[];
  inlineImages?: {
    id: string;
    contentId: string;
    filename: string;
    mimeType: string;
    size: number;
    dataUrl: string;
    downloadUrl: string;
  }[];
}

interface EmailThread {
  threadId: string;
  messages: EmailMessage[];
  subject: string;
  snippet: string;
  date: string;
  participants: string[];
  hasAttachment: boolean;
  labelIds: string[];
  messageCount: number;
}

interface EmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  thread: EmailThread | null;
}

// Add formatFileSize utility function
const formatFileSize = (size: number) => {
  const sizeInMB = (size / (1024 * 1024)).toFixed(2);
  return sizeInMB === '0.00' ? '' : `${sizeInMB} MB`;
};

// Add getFileIcon utility function
const getFileIcon = (filename: string) => {
  const extension = filename.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'pdf':
      return <FileText className='h-4 w-4 text-[#F43F5E]' />;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
      return <FileText className='h-4 w-4 text-[#8B5CF6]' />;
    case 'docx':
      return <FileText className='h-4 w-4 text-[#3B82F6]' />;
    default:
      return <FileText className='h-4 w-4 text-[#8B5CF6]' />;
  }
};

// Add MailIframe component
function MailIframe({ html, senderEmail }: { html: string; senderEmail: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(0);
  const { resolvedTheme } = useTheme();

  const calculateAndSetHeight = useCallback(() => {
    if (!iframeRef.current?.contentWindow?.document.body) return;

    const body = iframeRef.current.contentWindow.document.body;
    const boundingRectHeight = body.getBoundingClientRect().height;
    const scrollHeight = body.scrollHeight;

    // Use the larger of the two values to ensure all content is visible
    setHeight(Math.max(boundingRectHeight, scrollHeight));
    if (body.innerText.trim() === '') {
      setHeight(0);
    }
  }, [iframeRef, setHeight]);

  useEffect(() => {
    if (!iframeRef.current) return;

    // Create a basic HTML document with the email content
    const htmlDoc = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              line-height: 1.5;
              color: ${resolvedTheme === 'dark' ? '#fafafa' : '#3F3F46'};
              background-color: ${resolvedTheme === 'dark' ? '#141414' : '#ffffff'};
            }
            img {
              max-width: 100%;
              height: auto;
            }
            table {
              border-collapse: collapse;
              width: 100%;
            }
            td, th {
              border: 1px solid ${resolvedTheme === 'dark' ? '#232428' : '#E4E4E7'};
              padding: 8px;
            }
            a {
              color: ${resolvedTheme === 'dark' ? '#3B82F6' : '#2563EB'};
            }
            blockquote {
              border-left: 4px solid ${resolvedTheme === 'dark' ? '#232428' : '#E4E4E7'};
              margin: 0;
              padding-left: 1rem;
              color: ${resolvedTheme === 'dark' ? '#fafafa' : '#3F3F46'};
            }
            pre {
              background-color: ${resolvedTheme === 'dark' ? '#1a1a1a' : '#fafafa'};
              padding: 1rem;
              border-radius: 0.375rem;
              overflow-x: auto;
            }
            code {
              background-color: ${resolvedTheme === 'dark' ? '#1a1a1a' : '#fafafa'};
              padding: 0.2rem 0.4rem;
              border-radius: 0.25rem;
            }
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `;

    const url = URL.createObjectURL(new Blob([htmlDoc], { type: 'text/html' }));
    iframeRef.current.src = url;

    const handler = () => {
      if (iframeRef.current?.contentWindow?.document.body) {
        calculateAndSetHeight();
      }
      // Recalculate after a slight delay to catch any late-loading content
      setTimeout(calculateAndSetHeight, 500);
    };
    iframeRef.current.onload = handler;

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [calculateAndSetHeight, html, resolvedTheme]);

  return (
    <iframe
      height={height}
      ref={iframeRef}
      className={cn('!min-h-0 w-full flex-1 overflow-hidden px-4 transition-opacity duration-200')}
      title='Email Content'
      sandbox='allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-scripts'
      style={{
        width: '100%',
        overflow: 'hidden',
      }}
    />
  );
}

// Format date utility function
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const now = new Date();

    if (isNaN(date.getTime())) {
      return 'Unknown date';
    }

    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    const isCurrentYear = date.getFullYear() === now.getFullYear();

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays < 7) {
      const options: Intl.DateTimeFormatOptions = { weekday: 'short' };
      return date.toLocaleDateString(undefined, options);
    } else {
      const options: Intl.DateTimeFormatOptions = {
        month: 'short',
        day: 'numeric',
        year: isCurrentYear ? undefined : 'numeric',
      };
      return date.toLocaleDateString(undefined, options);
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Unknown date';
  }
};

export function EmailDialog({ open, onOpenChange, thread }: EmailDialogProps) {
  const { theme } = useTheme();
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

  // Set mounted state after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Return null during server-side rendering or before mounting
  if (!mounted) {
    return null;
  }

  if (!thread) return null;

  // Sort messages by date, newest first
  const sortedMessages = [...thread.messages].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const toggleMessage = (messageId: string) => {
    setExpandedMessages((prev) => {
      const next = new Set(prev);
      if (next.has(messageId)) {
        next.delete(messageId);
      } else {
        next.add(messageId);
      }
      return next;
    });
  };

  const handleDownloadAttachment = async (
    messageId: string,
    attachmentId: string,
    filename: string,
  ) => {
    console.log('Downloading attachment:', { messageId, attachmentId, filename });

    setIsDownloading(attachmentId);
    try {
      const response = await newRequest.get(
        `/gmail/messages/${messageId}/attachments/${attachmentId}`,
        {
          responseType: 'blob',
        },
      );

      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Attachment downloaded successfully');
    } catch (error) {
      console.error('Failed to download attachment:', error);
      toast.error('Failed to download attachment');
    } finally {
      setIsDownloading(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-3xl max-h-[80vh] overflow-y-auto bg-white dark:bg-[#141414] text-[#3F3F46] dark:text-[#fafafa] p-0'>
        <DialogHeader className='px-6 py-4 border-b border-[#E4E4E7] dark:border-[#232428]'>
          <DialogTitle className='text-lg text-[#3F3F46] dark:text-[#fafafa]'>
            {thread.subject}
          </DialogTitle>
        </DialogHeader>

        <div className='divide-y divide-[#E4E4E7] dark:divide-[#232428]'>
          {sortedMessages.map((message, index) => {
            const isExpanded = expandedMessages.has(message.id);
            const isLatest = index === 0;

            if (!isLatest && !isExpanded) {
              return (
                <div
                  key={message.id}
                  className='px-6 py-3 bg-[#fafafa] dark:bg-[#1a1a1a] border-b border-[#E4E4E7] dark:border-[#232428]'
                >
                  <Button
                    variant='ghost'
                    className='w-full justify-between text-[#3F3F46]/60 dark:text-[#fafafa]/60 hover:text-[#3F3F46] dark:hover:text-[#fafafa]'
                    onClick={() => {
                      return toggleMessage(message.id);
                    }}
                  >
                    <div className='flex items-center gap-2'>
                      <span className='text-sm'>From: {message.from}</span>
                      <span className='text-xs'>•</span>
                      <span className='text-sm'>{formatDate(message.date)}</span>
                    </div>
                    <ChevronDown className='h-4 w-4' />
                  </Button>
                </div>
              );
            }

            return (
              <div
                key={message.id}
                className={`px-6 py-4 ${!isLatest ? 'bg-[#fafafa] dark:bg-[#1a1a1a]' : ''}`}
              >
                <div className='flex justify-between items-start mb-3'>
                  <div>
                    <p className='text-sm text-[#3F3F46]/60 dark:text-[#fafafa]/60'>
                      From: {message.from}
                    </p>
                    <p className='text-sm text-[#3F3F46]/60 dark:text-[#fafafa]/60'>
                      To: {message.to}
                      {message.cc && `, CC: ${message.cc}`}
                    </p>
                  </div>
                  <div className='flex items-center gap-2'>
                    <p className='text-sm text-[#3F3F46]/60 dark:text-[#fafafa]/60'>
                      {formatDate(message.date)}
                    </p>
                    {!isLatest && (
                      <Button
                        variant='ghost'
                        size='sm'
                        className='h-6 w-6 p-0 text-[#3F3F46] dark:text-[#fafafa] hover:bg-[#eaeaea] dark:hover:bg-white/10'
                        onClick={() => {
                          return toggleMessage(message.id);
                        }}
                      >
                        <ChevronUp className='h-4 w-4' />
                      </Button>
                    )}
                  </div>
                </div>

                {message.attachments && message.attachments.length > 0 && (
                  <div className='mb-4'>
                    <div className='flex items-center gap-2 mb-2'>
                      <Paperclip className='w-4 h-4 text-[#3F3F46]/60 dark:text-[#fafafa]/60' />
                      <span className='text-sm font-medium text-[#3F3F46] dark:text-[#fafafa]'>
                        Attachments
                      </span>
                    </div>
                    <div className='flex flex-wrap gap-2'>
                      {message.attachments.map((attachment) => {
                        return (
                          <Button
                            key={attachment.id}
                            variant='outline'
                            size='sm'
                            className='flex items-center gap-2 border-[#E4E4E7] dark:border-[#232428] text-[#3F3F46] dark:text-[#fafafa] hover:bg-[#eaeaea] dark:hover:bg-white/10'
                            onClick={() => {
                              return handleDownloadAttachment(
                                message.id,
                                attachment.id,
                                attachment.filename,
                              );
                            }}
                            disabled={isDownloading === attachment.id}
                          >
                            {isDownloading === attachment.id ? (
                              <>
                                <div className='animate-spin rounded-full h-3 w-3 border-b-2 border-[#3F3F46] dark:border-[#fafafa]'></div>
                                <span>Downloading...</span>
                              </>
                            ) : (
                              <>
                                {getFileIcon(attachment.filename)}
                                <span className='truncate max-w-[200px]'>
                                  {attachment.filename}
                                </span>
                                <span className='text-xs text-[#3F3F46]/60 dark:text-[#fafafa]/60'>
                                  {formatFileSize(attachment.size)}
                                </span>
                              </>
                            )}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className='prose dark:prose-invert max-w-none'>
                  {message.body ? (
                    <div className='grid overflow-hidden transition-all duration-200 grid-rows-[1fr]'>
                      <div className='min-h-0 overflow-hidden'>
                        <div className='h-fit w-full p-0'>
                          <MailIframe html={message.body} senderEmail={message.from} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className='whitespace-pre-wrap text-[#3F3F46] dark:text-[#fafafa]'>
                      {message.snippet}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className='flex justify-end gap-2 p-4 border-t border-[#E4E4E7] dark:border-[#232428]'>
          <Button
            variant='outline'
            className='text-[#3F3F46] dark:text-[#fafafa] border-[#E4E4E7] dark:border-[#232428] hover:bg-[#eaeaea] dark:hover:bg-white/10'
            onClick={() => {
              return onOpenChange(false);
            }}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
