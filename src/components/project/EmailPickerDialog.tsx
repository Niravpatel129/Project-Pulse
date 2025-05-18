import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { newRequest } from '@/utils/newRequest';
import { Calendar, Check, ChevronLeft, ChevronRight, Mail, Search, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

// Interface for email objects
export interface EmailItem {
  id: string;
  subject: string;
  sender: string;
  snippet: string;
  date: string;
}

// Gmail API response interface
interface GmailApiEmail {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  payload: {
    headers: {
      name: string;
      value: string;
    }[];
    body: {
      size: number;
      data?: string;
    };
    parts?: {
      mimeType: string;
      body: {
        size: number;
        data?: string;
      };
    }[];
  };
  sizeEstimate: number;
  historyId: string;
  internalDate: string;
}

// Gmail API pagination response interface
interface GmailApiResponse {
  success: boolean;
  data: {
    emails: GmailApiEmail[];
    nextPageToken: string | null;
    resultSizeEstimate: number;
    page: number;
    pageSize: number;
    query: string;
  };
}

// Parse Gmail API response to EmailItem format
const parseGmailApiResponse = (emails: GmailApiEmail[]): EmailItem[] => {
  return emails.map((email) => {
    // Extract subject from headers
    const subjectHeader = email.payload.headers.find((header) => {
      return header.name.toLowerCase() === 'subject';
    });
    const subject = subjectHeader?.value || 'No Subject';

    // Extract sender from headers
    const fromHeader = email.payload.headers.find((header) => {
      return header.name.toLowerCase() === 'from';
    });
    const sender = fromHeader?.value || 'Unknown Sender';

    // Extract date from headers or use internalDate
    const dateHeader = email.payload.headers.find((header) => {
      return header.name.toLowerCase() === 'date';
    });
    const date = dateHeader?.value || new Date(parseInt(email.internalDate)).toISOString();

    return {
      id: email.id,
      subject,
      sender,
      snippet: email.snippet,
      date,
    };
  });
};

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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [prevPageTokens, setPrevPageTokens] = useState<string[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (open) {
      checkGmailStatus();
    }
  }, [open]);

  // Fetch Gmail connection status
  const checkGmailStatus = async () => {
    setIsLoading(true);
    try {
      const response = await newRequest.get('/gmail/status');
      const isConnected = response.data?.connected === true;
      setIsGmailConnected(isConnected);

      if (isConnected) {
        await fetchEmails();
      } else {
        // Not connected, use mock emails
      }
    } catch (error) {
      console.error('Failed to check Gmail status:', error);
      setIsGmailConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search input changes with debounce
  useEffect(() => {
    if (isGmailConnected) {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      const timeout = setTimeout(() => {
        // Reset pagination when search changes
        setCurrentPage(1);
        setPrevPageTokens([]);
        setNextPageToken(null);
        fetchEmails();
      }, 500);

      setSearchTimeout(timeout);
    }

    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [emailSearchQuery, isGmailConnected]);

  // Fetch emails from Gmail
  const fetchEmails = async (pageToken?: string) => {
    setIsLoading(true);
    try {
      // Build query params
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
      });

      // Add search query if present
      if (emailSearchQuery) {
        params.append('query', emailSearchQuery);
      }

      // Add page token if present
      if (pageToken) {
        params.append('pageToken', pageToken);
      }

      const response = await newRequest.get(`/gmail/emails?${params.toString()}`);

      if (response.data?.success && response.data?.data?.emails) {
        const apiResponse = response.data as GmailApiResponse;
        const parsedEmails = parseGmailApiResponse(apiResponse.data.emails);
        setEmails(parsedEmails);
        setNextPageToken(apiResponse.data.nextPageToken);
        setTotalResults(apiResponse.data.resultSizeEstimate);
      } else {
        console.warn('Unexpected email response format:', response.data);
      }
    } catch (error) {
      console.error('Failed to fetch emails:', error);
      // Fall back to mock emails if API fails
    } finally {
      setIsLoading(false);
    }
  };

  // Handle pagination - next page
  const handleNextPage = () => {
    if (nextPageToken) {
      setPrevPageTokens([...prevPageTokens, nextPageToken]);
      setCurrentPage(currentPage + 1);
      fetchEmails(nextPageToken);
    }
  };

  // Handle pagination - previous page
  const handlePrevPage = () => {
    if (prevPageTokens.length > 0) {
      const newPrevTokens = [...prevPageTokens];
      const prevToken = newPrevTokens.pop();
      setPrevPageTokens(newPrevTokens);
      setCurrentPage(currentPage - 1);
      fetchEmails(prevToken);
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

  // Format date to readable string
  const formatDate = (dateString: string) => {
    try {
      // Handle Gmail API date formats which can be ISO strings or various other formats
      const date = new Date(dateString);

      // Check if the date is valid
      if (isNaN(date.getTime())) {
        // If invalid, try parsing as Unix timestamp (Gmail internalDate is in milliseconds)
        const timestamp = parseInt(dateString);
        if (!isNaN(timestamp)) {
          const timestampDate = new Date(timestamp);
          if (!isNaN(timestampDate.getTime())) {
            return formatDateDisplay(timestampDate);
          }
        }
        return 'Unknown date';
      }

      return formatDateDisplay(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown date';
    }
  };

  // Helper to format the date for display
  const formatDateDisplay = (date: Date) => {
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
      setCurrentPage(1);
      setPrevPageTokens([]);
      setNextPageToken(null);
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
          ) : isLoading ? (
            <div className='p-8 flex flex-col items-center justify-center'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-[#8b5df8] mb-4'></div>
              <h3 className='text-base font-medium text-[#3F3F46] dark:text-[#fafafa]'>
                Loading Emails...
              </h3>
            </div>
          ) : emails.length === 0 ? (
            <div className='p-4 text-center text-[#3F3F46]/60 dark:text-[#8C8C8C] text-sm'>
              No emails found.
            </div>
          ) : (
            <div className='divide-y divide-[#E4E4E7] dark:divide-[#232428]'>
              {emails.map((email) => {
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
        {isGmailConnected && emails.length > 0 && (
          <div className='px-3 py-2 border-t border-[#E4E4E7] dark:border-[#232428] flex justify-center items-center gap-4'>
            <Button
              variant='outline'
              size='sm'
              onClick={handlePrevPage}
              disabled={prevPageTokens.length === 0 || isLoading}
              className='p-1 h-8 w-8'
            >
              <ChevronLeft className='h-4 w-4' />
            </Button>
            <span className='text-xs text-[#3F3F46]/80 dark:text-[#ABABAB]'>
              Page {currentPage}
            </span>
            <Button
              variant='outline'
              size='sm'
              onClick={handleNextPage}
              disabled={!nextPageToken || isLoading}
              className='p-1 h-8 w-8'
            >
              <ChevronRight className='h-4 w-4' />
            </Button>
          </div>
        )}
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
