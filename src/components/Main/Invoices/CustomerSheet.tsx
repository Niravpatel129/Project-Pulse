import { AddCustomerDialog } from '@/app/customers/components/AddCustomerDialog';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { newRequest } from '@/utils/newRequest';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Mail, MapPin, Paperclip, PencilIcon, Phone, User } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useRef, useState } from 'react';
import { Letter } from 'react-letter';
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

interface EmailResponse {
  success: boolean;
  data: {
    clientId: string;
    clientEmail: string;
    threads: EmailThread[];
    nextPageToken?: string;
    resultSizeEstimate: number;
    page: number;
    pageSize: number;
  };
}

interface CustomerSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string;
  customerName: string;
  currency: string;
}

// Add helper function to extract email name from full email string
function getEmailName(email: string): string {
  const match = email.match(/^([^<]+)\s*<([^>]+)>$/);
  return match ? match[1].trim() : email;
}

// Add helper function to check if email is from the customer
function isFromCustomer(email: string, customerEmail: string): boolean {
  return email.toLowerCase().includes(customerEmail.toLowerCase());
}

export function CustomerSheet({
  open,
  onOpenChange,
  customerId,
  customerName,
  currency,
}: CustomerSheetProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [emailThreads, setEmailThreads] = useState<EmailThread[]>([]);
  const [isLoadingEmails, setIsLoadingEmails] = useState(false);
  const [selectedThread, setSelectedThread] = useState<EmailThread | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { theme } = useTheme();

  // Add useEffect to fetch emails when sheet opens
  useEffect(() => {
    if (open && customerId) {
      setPage(1);
      setEmailThreads([]);
      fetchCustomerEmails(1);
    }
  }, [open, customerId]);

  // Add intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && !isLoadingEmails) {
          loadMoreEmails();
        }
      },
      { threshold: 0.1 },
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [hasMore, isLoadingMore, isLoadingEmails]);

  // Customer data fetch
  const { data: customerData, isLoading: customerLoading } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: async () => {
      if (!customerId) return null;
      const response = await newRequest.get(`/clients/${customerId}`);
      return response.data.data;
    },
    enabled: !!customerId && open,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Fetch customer emails from API
  const fetchCustomerEmails = async (pageNum: number) => {
    if (!customerId) return;

    setIsLoadingEmails(true);
    try {
      const response = await newRequest.get(`/gmail/client/${customerId}/emails`, {
        params: {
          page: pageNum,
          pageSize: 10,
        },
      });
      const data = response.data as EmailResponse;

      if (data.success && Array.isArray(data.data.threads)) {
        if (pageNum === 1) {
          setEmailThreads(data.data.threads);
        } else {
          setEmailThreads((prev) => {
            return [...prev, ...data.data.threads];
          });
        }
        setHasMore(!!data.data.nextPageToken);
      } else {
        console.warn('Unexpected email response format:', data);
        if (pageNum === 1) {
          setEmailThreads([]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch customer emails:', error);
      toast.error('Failed to load customer emails');
      if (pageNum === 1) {
        setEmailThreads([]);
      }
    } finally {
      setIsLoadingEmails(false);
    }
  };

  const loadMoreEmails = async () => {
    if (!hasMore || isLoadingMore) return;

    setIsLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchCustomerEmails(nextPage);
    setIsLoadingMore(false);
  };

  // Format date similar to EmailPickerDialog
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);

      if (isNaN(date.getTime())) {
        return 'Unknown date';
      }

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
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown date';
    }
  };

  const handleEditCustomer = (updatedCustomer: any) => {
    // Transform the data from the form format to API format
    const clientData = {
      user: {
        name: updatedCustomer.name,
        email: updatedCustomer.contactEmail,
      },
      phone: updatedCustomer.contactPhone,
      address: updatedCustomer.address,
      shippingAddress: updatedCustomer.shippingAddress,
      contact: {
        firstName: updatedCustomer.contactName.split(' ')[0] || '',
        lastName: updatedCustomer.contactName.split(' ').slice(1).join(' ') || '',
      },
      industry: updatedCustomer.industry,
      type: updatedCustomer.type,
      status: updatedCustomer.status,
      website: updatedCustomer.website,
      internalNotes: updatedCustomer.internalNotes,
    };

    // Update the customer
    newRequest
      .put(`/clients/${customerId}`, clientData)
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ['customer', customerId] });
        toast.success('Customer updated successfully');
      })
      .catch((error) => {
        toast.error(error.message || 'Failed to update customer');
      });
  };

  // Transform customer data for edit dialog
  const transformCustomerForEdit = () => {
    if (!customerData) return null;

    return {
      name: customerData.user?.name || '',
      contactName: `${customerData.contact?.firstName || ''} ${
        customerData.contact?.lastName || ''
      }`.trim(),
      contactEmail: customerData.user?.email || '',
      contactPhone: customerData.phone || '',
      industry: customerData.industry || '',
      type: customerData.type || 'Individual',
      status: customerData.status || 'Active',
      address: {
        street: customerData.address?.street || '',
        city: customerData.address?.city || '',
        state: customerData.address?.state || '',
        country: customerData.address?.country || '',
        zip: customerData.address?.zip || '',
      },
      shippingAddress: {
        street: customerData.shippingAddress?.street || '',
        city: customerData.shippingAddress?.city || '',
        state: customerData.shippingAddress?.state || '',
        country: customerData.shippingAddress?.country || '',
        zip: customerData.shippingAddress?.zip || '',
      },
      website: customerData.website || '',
      internalNotes: customerData.internalNotes || '',
    };
  };

  // Add EmailViewModal component
  function EmailViewModal({
    open,
    onOpenChange,
    thread,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    thread: EmailThread | null;
  }) {
    const { theme } = useTheme();
    if (!thread) return null;

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='max-w-3xl max-h-[80vh] overflow-y-auto bg-background text-foreground p-0'>
          <DialogHeader className='px-6 py-4 border-b border-border'>
            <DialogTitle className='text-lg'>{thread.subject}</DialogTitle>
          </DialogHeader>

          <div className='divide-y divide-border'>
            {thread.messages.map((message, index) => {
              return (
                <div key={message.id} className={`px-6 py-4 ${index > 0 ? 'bg-muted/30' : ''}`}>
                  <div className='flex justify-between items-start mb-3'>
                    <div>
                      <p className='font-medium text-foreground'>{getEmailName(message.from)}</p>
                      <p className='text-sm text-muted-foreground'>
                        To: {message.to}
                        {message.cc && `, CC: ${message.cc}`}
                      </p>
                    </div>
                    <p className='text-sm text-muted-foreground'>{formatDate(message.date)}</p>
                  </div>
                  <div className='prose dark:prose-invert max-w-none'>
                    {message.body ? (
                      <Letter
                        html={message.body}
                        text={message.snippet}
                        className='email-content'
                        rewriteExternalResources={(url) => {
                          return url;
                        }}
                        rewriteExternalLinks={(url) => {
                          return url;
                        }}
                        allowedSchemas={['http', 'https', 'mailto']}
                      />
                    ) : (
                      <div className='whitespace-pre-wrap text-foreground'>{message.snippet}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className='flex justify-end gap-2 p-4 border-t border-border'>
            <Button
              variant='outline'
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

  // Helper to check if any message in thread has attachment
  function threadHasAttachment(thread: EmailThread) {
    return thread.messages.some((m) => {
      return m.hasAttachment;
    });
  }
  // Helper to get all attachment filenames in thread
  function getAttachmentFilenames(thread: EmailThread) {
    // If you have filenames in your data, extract here. For now, just show 'Attachment' as placeholder.
    // If you have message.attachments, map and join their filenames.
    return thread.messages
      .filter((m) => {
        return m.hasAttachment;
      })
      .map((m) => {
        // If you have m.attachments, return their filenames. Otherwise, fallback:
        return 'Attachment';
      });
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className='sm:max-w-[800px] md:max-w-[1000px] lg:max-w-[1200px] h-full overflow-y-auto p-6 bg-background text-foreground'>
          <SheetHeader className='mb-6'>
            <SheetTitle className='text-2xl'>Customer Details</SheetTitle>
            <SheetDescription className='text-base'>
              Information about {customerName || 'customer'}
            </SheetDescription>
          </SheetHeader>

          <div className='mt-6 space-y-6'>
            {customerLoading ? (
              <div className='text-center py-4'>Loading customer information...</div>
            ) : customerData ? (
              <>
                <div className='border border-border rounded-lg p-6 space-y-4 bg-background text-foreground'>
                  <div className='flex items-center space-x-3'>
                    <div className='h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center'>
                      <User className='h-5 w-5 text-purple-600 dark:text-purple-400' />
                    </div>
                    <div className='flex-1'>
                      <div className='flex items-center gap-2'>
                        <h3 className='text-foreground font-medium'>{customerData.user?.name}</h3>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => {
                            return setIsEditDialogOpen(true);
                          }}
                          className='h-3 w-3'
                        >
                          <PencilIcon className='h-1 w-1' />
                        </Button>
                      </div>
                      <p className='text-muted-foreground text-sm'>Primary Contact</p>
                    </div>
                  </div>

                  <Separator className='my-4' />

                  <div className='space-y-3'>
                    <div className='flex items-start space-x-3'>
                      <Mail className='h-4 w-4 text-muted-foreground mt-0.5' />
                      <div>
                        <p className='text-sm font-medium text-foreground'>
                          {customerData.user?.email}
                        </p>
                        <p className='text-xs text-muted-foreground'>Email Address</p>
                      </div>
                    </div>

                    {customerData.phone && (
                      <div className='flex items-start space-x-3'>
                        <Phone className='h-4 w-4 text-muted-foreground mt-0.5' />
                        <div>
                          <p className='text-sm font-medium text-foreground'>
                            {customerData.phone}
                          </p>
                          <p className='text-xs text-muted-foreground'>Phone Number</p>
                        </div>
                      </div>
                    )}

                    {customerData.address && (
                      <div className='flex items-start space-x-3'>
                        <MapPin className='h-4 w-4 text-muted-foreground mt-0.5' />
                        <div>
                          <p className='text-sm font-medium text-foreground'>
                            {customerData.address.street && `${customerData.address.street}, `}
                            {customerData.address.city && `${customerData.address.city}, `}
                            {customerData.address.state && `${customerData.address.state}, `}
                            {customerData.address.country && `${customerData.address.country} `}
                            {customerData.address.zip && customerData.address.zip}
                          </p>
                          <p className='text-xs text-muted-foreground'>Billing Address</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Gmail-like Email Thread List */}
                <div className='border border-border rounded-lg p-0 overflow-hidden bg-background text-foreground'>
                  <div className='flex justify-between items-center px-6 py-4 border-b border-border bg-background text-foreground'>
                    <h3 className='text-sm font-medium'>Customer Emails</h3>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => {
                        setPage(1);
                        setEmailThreads([]);
                        fetchCustomerEmails(1);
                      }}
                      disabled={isLoadingEmails}
                    >
                      {emailThreads.length === 0 ? 'Load Emails' : 'Refresh'}
                    </Button>
                  </div>
                  <div className='max-h-[400px] overflow-y-auto'>
                    {isLoadingEmails && page === 1 ? (
                      <div className='text-center py-4'>
                        <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto'></div>
                        <p className='text-sm text-muted-foreground mt-2'>Loading emails...</p>
                      </div>
                    ) : emailThreads.length === 0 ? (
                      <div className='text-center py-4 text-muted-foreground text-sm'>
                        No emails available. Click &quot;Load Emails&quot; to fetch customer emails.
                      </div>
                    ) : (
                      <div>
                        {emailThreads.map((thread) => {
                          const isUnread = false; // You can add logic if you have unread info
                          return (
                            <div
                              key={thread.threadId}
                              className={`flex items-center px-6 py-3 border-b last:border-b-0 cursor-pointer transition-colors
                                ${
                                  isUnread
                                    ? 'bg-gray-50 dark:bg-zinc-900 font-bold'
                                    : 'bg-white dark:bg-background'
                                }
                                hover:bg-gray-100 dark:hover:bg-zinc-800
                                border-border text-foreground dark:text-foreground`}
                              onClick={() => {
                                setSelectedThread(thread);
                                setIsEmailModalOpen(true);
                              }}
                            >
                              {/* Sender and message count */}
                              <span className='mr-3 min-w-[120px] truncate font-medium'>
                                {getEmailName(thread.participants[0])}
                                {thread.messageCount > 1 && (
                                  <span className='ml-1 text-xs text-gray-500 dark:text-gray-400 align-top'>
                                    {thread.messageCount}
                                  </span>
                                )}
                              </span>
                              {/* Subject and snippet */}
                              <span className='flex-1 truncate'>
                                <span className='mr-2 font-medium'>{thread.subject}</span>
                                <span className='text-gray-500 dark:text-gray-400'>
                                  {thread.snippet}
                                </span>
                              </span>
                              {/* Attachments */}
                              {threadHasAttachment(thread) && (
                                <span className='flex items-center mx-2'>
                                  <Paperclip className='w-4 h-4 text-gray-400 dark:text-gray-300 mr-1' />
                                  {getAttachmentFilenames(thread).map((name, idx) => {
                                    return (
                                      <span
                                        key={idx}
                                        className='text-xs bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded mr-1 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-zinc-700'
                                      >
                                        {name}
                                      </span>
                                    );
                                  })}
                                </span>
                              )}
                              {/* Time */}
                              <span className='ml-2 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap'>
                                {formatDate(thread.date)}
                              </span>
                            </div>
                          );
                        })}
                        {/* Loading indicator for infinite scroll */}
                        {isLoadingMore && (
                          <div className='text-center py-2'>
                            <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mx-auto'></div>
                          </div>
                        )}
                        {/* Intersection observer target */}
                        <div ref={loadMoreRef} className='h-4' />
                      </div>
                    )}
                  </div>
                </div>

                {/* Invoice Summary for this customer */}
                <div className='border border-border rounded-lg p-6 bg-background text-foreground'>
                  <h3 className='text-sm font-medium mb-4'>Invoice Summary</h3>
                  <div className='space-y-2'>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground text-sm'>Total Invoices</span>
                      <span className='text-foreground text-sm font-medium'>
                        {customerData.invoiceStats?.totalInvoices || 0}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground text-sm'>Outstanding</span>
                      <span className='text-foreground text-sm font-medium'>
                        {customerData.invoiceStats?.outstandingAmount?.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }) || 0}{' '}
                        {currency || 'USD'}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground text-sm'>Total Paid</span>
                      <span className='text-foreground text-sm font-medium'>
                        {customerData.invoiceStats?.paidAmount?.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }) || 0}{' '}
                        {currency || 'USD'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className='flex justify-end'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => {
                      return onOpenChange(false);
                    }}
                  >
                    Close
                  </Button>
                </div>
              </>
            ) : (
              <div className='text-center py-4 text-muted-foreground'>
                No customer information available
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit Customer Dialog */}
      <AddCustomerDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onEdit={handleEditCustomer}
        initialData={transformCustomerForEdit()}
      />

      {/* Email View Modal */}
      <EmailViewModal
        open={isEmailModalOpen}
        onOpenChange={setIsEmailModalOpen}
        thread={selectedThread}
      />
    </>
  );
}
