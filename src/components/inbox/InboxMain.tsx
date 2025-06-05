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
import Color from 'color';
import { ChevronDown, ChevronUp, MoreVertical, X } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useRef, useState } from 'react';
import EmailSkeleton from './EmailSkeleton';
import InboxHeader from './InboxHeader';
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

const EmailContent = ({
  html,
  isBodyExpanded,
  containsQuotedContent,
}: {
  html: string;
  isBodyExpanded: boolean;
  containsQuotedContent: boolean;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const shadowRootRef = useRef<ShadowRoot | null>(null);
  const { theme } = useTheme();

  // Initialize shadow DOM
  useEffect(() => {
    if (!containerRef.current || shadowRootRef.current) return;

    try {
      shadowRootRef.current = containerRef.current.attachShadow({ mode: 'open' });

      // Create wrapper for content
      const wrapper = document.createElement('div');
      wrapper.className = 'email-content';
      wrapper.innerHTML = html;

      // Add styles
      const styleSheet = document.createElement('style');
      styleSheet.textContent = `
        .email-content {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.3;
          font-size: 14px;
        }
        .email-content a {
          color: #1a73e8;
          text-decoration: none;
        }
        .email-content a:hover {
          text-decoration: underline;
        }
        .email-content img {
          border: 0;
          height: auto;
          line-height: 100%;
          outline: none;
          text-decoration: none;
          -ms-interpolation-mode: bicubic;
          max-width: 100%;
        }
        .email-content table {
          border-collapse: collapse !important;
          width: 100%;
        }
        .email-content td {
          padding: 0;
          vertical-align: top;
        }
        .hide-quotes blockquote,
        .hide-quotes div:has(blockquote) {
          display: none;
        }
        ${
          theme === 'dark'
            ? `
          .email-content {
            color-scheme: dark;
            color: #e8eaed;
            background-color: transparent;
          }
          .email-content a {
            color: #8ab4f8;
          }
          .email-content img {
            filter: brightness(0.8) contrast(1.2);
          }
          .email-content * {
            background-color: transparent !important;
          }
          .email-content * {
            color: #e8eaed !important;
          }
          .email-content [style*="color"] {
            color: #e8eaed !important;
          }
          .email-content h1,
          .email-content h2,
          .email-content h3,
          .email-content h4,
          .email-content h5,
          .email-content h6 {
            color: #ffffff !important;
          }
          .email-content a[href] {
            color: #8ab4f8 !important;
          }
          .email-content blockquote {
            border-left-color: #5f6368 !important;
            color: #9aa0a6 !important;
          }
          .email-content pre,
          .email-content code {
            background-color: rgba(255, 255, 255, 0.1) !important;
            color: #e8eaed !important;
          }
          .email-content table {
            border-color: #5f6368 !important;
          }
          .email-content th,
          .email-content td {
            border-color: #5f6368 !important;
          }
          .email-content hr {
            border-color: #5f6368 !important;
          }
        `
            : `
          .email-content {
            color-scheme: light;
            color: #202124;
            background-color: transparent;
          }
          .email-content a {
            color: #1a73e8;
          }
        `
        }
      `;

      // Append elements to shadow root
      shadowRootRef.current.appendChild(styleSheet);
      shadowRootRef.current.appendChild(wrapper);

      // Initial color sanitization
      sanitizeColors(wrapper);
    } catch (error) {
      console.error('Error setting up shadow DOM:', error);
      if (containerRef.current) {
        containerRef.current.innerHTML = html;
      }
    }

    return () => {
      if (shadowRootRef.current) {
        shadowRootRef.current.innerHTML = '';
        shadowRootRef.current = null;
      }
    };
  }, []); // Only run once on mount

  // Update content and styles when dependencies change
  useEffect(() => {
    if (!shadowRootRef.current) return;

    const wrapper = shadowRootRef.current.querySelector('.email-content');
    if (!wrapper) return;

    // Update content
    wrapper.innerHTML = html;

    // Update classes
    if (!isBodyExpanded && containsQuotedContent) {
      wrapper.classList.add('hide-quotes');
    } else {
      wrapper.classList.remove('hide-quotes');
    }

    // Update styles
    const styleSheet = shadowRootRef.current.querySelector('style');
    if (styleSheet) {
      styleSheet.textContent = `
        .email-content {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.3;
          font-size: 14px;
        }
        .email-content a {
          color: #1a73e8;
          text-decoration: none;
        }
        .email-content a:hover {
          text-decoration: underline;
        }
        .email-content img {
          border: 0;
          height: auto;
          line-height: 100%;
          outline: none;
          text-decoration: none;
          -ms-interpolation-mode: bicubic;
          max-width: 100%;
        }
        .email-content table {
          border-collapse: collapse !important;
          width: 100%;
        }
        .email-content td {
          padding: 0;
          vertical-align: top;
        }
        .hide-quotes blockquote,
        .hide-quotes div:has(blockquote) {
          display: none;
        }
        ${
          theme === 'dark'
            ? `
          .email-content {
            color-scheme: dark;
            color: #e8eaed;
            background-color: transparent;
          }
          .email-content a {
            color: #8ab4f8;
          }
          .email-content img {
            filter: brightness(0.8) contrast(1.2);
          }
          .email-content * {
            background-color: transparent !important;
          }
          .email-content * {
            color: #e8eaed !important;
          }
          .email-content [style*="color"] {
            color: #e8eaed !important;
          }
          .email-content h1,
          .email-content h2,
          .email-content h3,
          .email-content h4,
          .email-content h5,
          .email-content h6 {
            color: #ffffff !important;
          }
          .email-content a[href] {
            color: #8ab4f8 !important;
          }
          .email-content blockquote {
            border-left-color: #5f6368 !important;
            color: #9aa0a6 !important;
          }
          .email-content pre,
          .email-content code {
            background-color: rgba(255, 255, 255, 0.1) !important;
            color: #e8eaed !important;
          }
          .email-content table {
            border-color: #5f6368 !important;
          }
          .email-content th,
          .email-content td {
            border-color: #5f6368 !important;
          }
          .email-content hr {
            border-color: #5f6368 !important;
          }
        `
            : `
          .email-content {
            color-scheme: light;
            color: #202124;
            background-color: transparent;
          }
          .email-content a {
            color: #1a73e8;
          }
        `
        }
      `;
    }

    // Update colors
    sanitizeColors(wrapper);
  }, [html, isBodyExpanded, containsQuotedContent, theme]);

  // Helper function for color sanitization
  const sanitizeColors = (wrapper: Element) => {
    const elements = wrapper.getElementsByTagName('*');

    for (const element of elements) {
      try {
        // Handle background colors
        const computedBg = getComputedStyle(element as HTMLElement).backgroundColor;
        if (computedBg && computedBg !== 'transparent' && computedBg !== 'rgba(0, 0, 0, 0)') {
          if (theme === 'dark') {
            const bg = Color(computedBg);
            const rgb = bg.rgb();
            (
              element as HTMLElement
            ).style.backgroundColor = `rgba(${rgb.red()}, ${rgb.green()}, ${rgb.blue()}, 0.1)`;
          } else {
            const bg = Color(computedBg);
            if (bg.alpha() >= 1) {
              (element as HTMLElement).style.backgroundColor = bg.rgb().toString();
            }
          }
        }

        // Handle text colors in dark mode
        if (theme === 'dark') {
          const computedColor = getComputedStyle(element as HTMLElement).color;
          if (computedColor && computedColor !== 'rgba(0, 0, 0, 0)') {
            const color = Color(computedColor);
            const rgb = color.rgb();
            // Adjust color brightness for dark mode
            const brightness = (rgb.red() * 299 + rgb.green() * 587 + rgb.blue() * 114) / 1000;
            if (brightness < 128) {
              // Dark colors become light
              (element as HTMLElement).style.color = '#e8eaed';
            } else {
              // Light colors become slightly dimmer
              (
                element as HTMLElement
              ).style.color = `rgba(${rgb.red()}, ${rgb.green()}, ${rgb.blue()}, 0.8)`;
            }
          }
        }
      } catch (error) {
        console.warn('Error parsing colors:', error);
      }
    }
  };

  return <div ref={containerRef} className='email-wrapper' />;
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
            <div className='p-4 min-h-[100px]'>
              <EmailContent
                html={email.body.html}
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
