import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { newRequest } from '@/utils/newRequest';
import { Calendar, Check, Mail, Search, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

// Interface for email objects
export interface EmailItem {
  id: string;
  subject: string;
  sender: string;
  snippet: string;
  date: string;
}

interface EmailPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectEmail: (email: EmailItem) => void;
  selectedEmails: EmailItem[];
  mockEmails?: EmailItem[]; // For development/testing
}

export function EmailPickerDialog({
  open,
  onOpenChange,
  onSelectEmail,
  selectedEmails,
  mockEmails = [],
}: EmailPickerDialogProps) {
  const [emailSearchQuery, setEmailSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isGmailConnected, setIsGmailConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emails, setEmails] = useState<EmailItem[]>([]);

  // Mock emails data for development
  const MOCK_EMAILS: EmailItem[] =
    mockEmails.length > 0
      ? mockEmails
      : [
          {
            id: 'email-1',
            subject: 'Project proposal for Q3',
            sender: 'alice@example.com',
            snippet:
              'I wanted to follow up on our conversation about the Q3 project plan. As discussed...',
            date: '2023-09-15T10:30:00Z',
          },
          {
            id: 'email-2',
            subject: 'Invoice #3892 - Payment confirmation',
            sender: 'billing@acmecorp.com',
            snippet: 'This is a confirmation that payment for invoice #3892 has been received...',
            date: '2023-09-14T08:15:00Z',
          },
          {
            id: 'email-3',
            subject: 'Meeting notes from product review',
            sender: 'product-team@example.com',
            snippet:
              "Attached are the notes from yesterday's product review meeting. Key points discussed were...",
            date: '2023-09-13T16:45:00Z',
          },
          {
            id: 'email-4',
            subject: 'New client onboarding - XYZ Corp',
            sender: 'sales@example.com',
            snippet:
              "We've successfully signed XYZ Corp as a new client. Please find their requirements attached...",
            date: '2023-09-12T14:20:00Z',
          },
          {
            id: 'email-5',
            subject: 'Quarterly budget review',
            sender: 'finance@example.com',
            snippet:
              'Please review the attached quarterly budget report before our meeting on Thursday...',
            date: '2023-09-11T11:00:00Z',
          },
          {
            id: 'email-6',
            subject: 'Website redesign feedback',
            sender: 'design@example.com',
            snippet:
              "Based on user testing, we've made the following adjustments to the website redesign...",
            date: '2023-09-10T09:30:00Z',
          },
          {
            id: 'email-7',
            subject: 'Contract renewal - Urgent',
            sender: 'legal@example.com',
            snippet:
              'The contract with ABC Inc is up for renewal next week. We need to finalize the terms...',
            date: '2023-09-09T15:45:00Z',
          },
          {
            id: 'email-8',
            subject: 'Team lunch - Friday',
            sender: 'office-admin@example.com',
            snippet:
              "We're organizing a team lunch this Friday at 12:30. Please let me know your food preferences...",
            date: '2023-09-08T10:15:00Z',
          },
          {
            id: 'email-9',
            subject: 'API integration issue resolution',
            sender: 'tech-support@example.com',
            snippet: "We've identified the issue with the API integration. The root cause was...",
            date: '2023-09-07T17:00:00Z',
          },
          {
            id: 'email-10',
            subject: 'Performance review - Scheduling',
            sender: 'hr@example.com',
            snippet:
              "It's time for the annual performance reviews. Please select a time slot from the calendar...",
            date: '2023-09-06T13:20:00Z',
          },
        ];

  // Check Gmail connection status when dialog opens
  useEffect(() => {
    if (open) {
      checkGmailStatus();
    }
  }, [open]);

  // Fetch Gmail connection status
  const checkGmailStatus = async () => {
    try {
      const response = await newRequest.get('/gmail/status');
      setIsGmailConnected(response.data.connected);

      if (response.data.connected) {
        fetchEmails();
      }
    } catch (error) {
      console.error('Failed to check Gmail status:', error);
      setIsGmailConnected(false);
    }
  };

  // Fetch emails from Gmail
  const fetchEmails = async () => {
    try {
      const response = await newRequest.get('/gmail/emails');
      if (response.data.emails) {
        setEmails(response.data.emails);
      }
    } catch (error) {
      console.error('Failed to fetch emails:', error);
      // Fall back to mock emails if API fails
      setEmails(MOCK_EMAILS);
    }
  };

  // Handle Gmail connection
  const handleConnectGmail = async () => {
    setIsLoading(true);
    try {
      // Get the OAuth URL
      const response = await newRequest.get('/gmail/auth-url');

      // Create authorization URL with required parameters if not provided by backend
      let authUrl = response.data.authUrl;

      if (authUrl) {
        // Ensure the URL has the required response_type parameter
        const url = new URL(authUrl);
        if (!url.searchParams.has('response_type')) {
          url.searchParams.append('response_type', 'code');
        }

        // Add state parameter to identify this as a gmail request
        if (!url.searchParams.has('state')) {
          url.searchParams.append('state', 'gmail_auth');
        }

        authUrl = url.toString();

        // Create a popup window for authentication
        const width = 600;
        const height = 600;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;

        const popup = window.open(
          authUrl,
          'gmailAuth',
          `width=${width},height=${height},left=${left},top=${top}`,
        );

        // Set up message listener for communication from the popup
        const messageHandler = (event: MessageEvent) => {
          // Validate origin for security
          if (event.origin !== window.location.origin) return;

          // Handle the auth success message
          if (event.data?.type === 'GMAIL_AUTH_SUCCESS') {
            window.removeEventListener('message', messageHandler);
            setIsLoading(false);
            checkGmailStatus();
          }

          // Handle auth error message
          if (event.data?.type === 'GMAIL_AUTH_ERROR') {
            window.removeEventListener('message', messageHandler);
            setIsLoading(false);
            console.error('Gmail auth error:', event.data.error);
          }
        };

        window.addEventListener('message', messageHandler);

        // Also check if popup was closed manually
        const checkPopupClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkPopupClosed);
            window.removeEventListener('message', messageHandler);
            setIsLoading(false);
          }
        }, 500);
      } else {
        throw new Error('No authorization URL provided');
      }
    } catch (error) {
      console.error('Failed to connect Gmail:', error);
      setIsLoading(false);
    }
  };

  // Filter emails based on search query
  const filteredEmails = (emails.length > 0 ? emails : MOCK_EMAILS).filter((email) => {
    if (!emailSearchQuery) return true;

    const search = emailSearchQuery.toLowerCase();
    return (
      email.subject.toLowerCase().includes(search) ||
      email.sender.toLowerCase().includes(search) ||
      email.snippet.toLowerCase().includes(search)
    );
  });

  // Format date to readable string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays < 7) {
      const options: Intl.DateTimeFormatOptions = { weekday: 'short' };
      return date.toLocaleDateString(undefined, options);
    } else {
      const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
      return date.toLocaleDateString(undefined, options);
    }
  };

  // Handle dialog open state change
  const handleOpenChange = (openState: boolean) => {
    onOpenChange(openState);

    if (!openState) {
      // Clear search query when closing
      setEmailSearchQuery('');
    }
  };

  // Focus the search input when the dialog opens
  useEffect(() => {
    if (open && isGmailConnected) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);

      return () => {
        return clearTimeout(timer);
      };
    }
  }, [open, isGmailConnected]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-[625px] p-0 gap-0 bg-white dark:bg-[#141414] border-[#E4E4E7] dark:border-[#232428]'>
        <div className='p-4 border-b border-[#E4E4E7] dark:border-[#232428]'>
          <DialogTitle className='text-lg font-medium text-[#3F3F46] dark:text-[#fafafa]'>
            {isGmailConnected ? 'Select Emails' : 'Connect Gmail'}
          </DialogTitle>
          {isGmailConnected && (
            <div className='relative mt-3'>
              <Search className='absolute left-2 top-2.5 h-4 w-4 text-[#3F3F46]/60 dark:text-[#8C8C8C]' />
              <input
                ref={searchInputRef}
                className='w-full border border-[#E4E4E7] dark:border-[#232428] rounded-md py-2 pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8b5df8]/20 focus:border-[#8b5df8] bg-white dark:bg-[#141414] text-[#3F3F46] dark:text-[#fafafa]'
                placeholder='Search emails...'
                value={emailSearchQuery}
                onChange={(e) => {
                  return setEmailSearchQuery(e.target.value);
                }}
                autoFocus
              />
            </div>
          )}
        </div>
        <div className='overflow-y-auto max-h-[350px] p-0'>
          {!isGmailConnected ? (
            <div className='p-8 flex flex-col items-center justify-center'>
              <Mail className='h-12 w-12 text-[#8b5df8] mb-4' />
              <h3 className='text-base font-medium text-[#3F3F46] dark:text-[#fafafa] mb-2'>
                Gmail Connection Required
              </h3>
              <p className='text-sm text-[#3F3F46]/60 dark:text-[#8C8C8C] text-center mb-4'>
                Connect your Gmail account to select emails for your projects.
              </p>
              <Button
                onClick={handleConnectGmail}
                className='bg-[#8b5df8] hover:bg-[#7c3aed]'
                disabled={isLoading}
              >
                {isLoading ? 'Connecting...' : 'Connect Gmail Account'}
              </Button>
            </div>
          ) : filteredEmails.length === 0 ? (
            <div className='p-4 text-center text-[#3F3F46]/60 dark:text-[#8C8C8C] text-sm'>
              No emails found.
            </div>
          ) : (
            <div className='divide-y divide-[#E4E4E7] dark:divide-[#232428]'>
              {filteredEmails.map((email) => {
                const isSelected = selectedEmails.some((e) => {
                  return e.id === email.id;
                });
                return (
                  <div
                    key={email.id}
                    className={cn(
                      'p-3 cursor-pointer hover:bg-[#F4F4F5] dark:hover:bg-[#232428] transition-colors',
                      isSelected && 'bg-[#F4F4F5] dark:bg-[#232428]',
                    )}
                    onClick={() => {
                      return onSelectEmail(email);
                    }}
                  >
                    <div className='flex justify-between items-start'>
                      <div className='flex-1'>
                        <div className='flex items-center gap-2'>
                          <User className='w-3 h-3 text-[#8b5df8] flex-shrink-0' />
                          <span className='text-xs text-[#3F3F46]/60 dark:text-[#ABABAB]'>
                            {email.sender}
                          </span>
                        </div>
                        <div className='font-medium text-sm mt-1 text-[#3F3F46] dark:text-[#fafafa]'>
                          {email.subject}
                        </div>
                        <div className='text-xs text-[#3F3F46]/60 dark:text-[#8C8C8C] line-clamp-1 mt-1'>
                          {email.snippet}
                        </div>
                      </div>
                      <div className='flex flex-col items-end gap-2 flex-shrink-0 ml-3'>
                        <span className='text-xs text-[#3F3F46]/60 dark:text-[#8C8C8C] flex items-center'>
                          <Calendar className='w-3 h-3 mr-1' />
                          {formatDate(email.date)}
                        </span>
                        {isSelected && <Check className='h-3 w-3 text-[#8b5df8]' />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className='p-3 border-t border-[#E4E4E7] dark:border-[#232428] flex justify-between'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => {
              return onOpenChange(false);
            }}
            className='border-[#E4E4E7] dark:border-[#232428] text-[#3F3F46] dark:text-[#fafafa]'
          >
            Cancel
          </Button>
          {isGmailConnected && (
            <Button
              size='sm'
              onClick={() => {
                return onOpenChange(false);
              }}
              className='bg-[#8b5df8] hover:bg-[#7c3aed]'
            >
              Done
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
