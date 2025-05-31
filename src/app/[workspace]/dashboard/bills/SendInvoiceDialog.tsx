'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { newRequest } from '@/utils/newRequest';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Eye, EyeOff, HelpCircle, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

interface GmailStatus {
  connected: boolean;
  message: string;
  primaryEmail: string | null;
  integrations: Array<{
    email: string;
    isPrimary: boolean;
    isActive: boolean;
    lastSynced: string;
    isExpired: boolean;
    connectedAt: string;
  }>;
}

export function SendInvoiceDialog({
  isOpen,
  onClose,
  invoice = {
    id: '1',
    name: 'Invoice #1',
    amount: 100,
    dueDate: '2025-01-01',
  },
}: {
  isOpen: boolean;
  onClose: () => void;
  invoice: any;
}) {
  console.log('🚀 invoice:', invoice);
  const [open, setOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [toEmail, setToEmail] = useState(invoice.customer?.email || '');
  const [fromEmail, setFromEmail] = useState('testingnirav@gmail.com');
  const [subject, setSubject] = useState(
    `Invoice ${invoice.invoiceNumber} from ${invoice.from.split('\n')[0]}`,
  );
  const [message, setMessage] = useState(`Hi ${invoice.customer?.name},

Here's Invoice ${invoice.invoiceNumber} for the amount of ${
    invoice.settings?.currency
  } ${invoice.totals?.total.toFixed(2)}.

If you have any questions, feel free to reach out.

Thank you,
${invoice.from.split('\n')[0]}`);
  const [isSending, setIsSending] = useState(false);
  const [sendCopy, setSendCopy] = useState(false);
  const [attachPdf, setAttachPdf] = useState(true);

  // Fetch Gmail status
  const { data: gmailStatus } = useQuery<GmailStatus>({
    queryKey: ['gmail-status'],
    queryFn: async () => {
      const response = await newRequest.get('/gmail/status');
      return response.data;
    },
  });

  // Set initial from email to primary email if available
  useEffect(() => {
    if (gmailStatus?.primaryEmail) {
      setFromEmail(gmailStatus.primaryEmail);
    }
  }, [gmailStatus?.primaryEmail]);

  const handleClose = useCallback(() => {
    setOpen(false);
    onClose();
  }, [onClose]);

  const isEmailValid = useMemo(() => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(toEmail);
  }, [toEmail]);

  // Add mutation for sending invoice
  const sendInvoiceMutation = useMutation({
    mutationFn: (data: {
      to: string;
      from: string;
      subject: string;
      message: string;
      sendCopy: boolean;
      attachPdf: boolean;
    }) => {
      return newRequest.post(`/invoices2/${invoice._id}/send`, data);
    },
    onSuccess: () => {
      toast.success('Invoice sent successfully!');
      handleClose();
    },
    onError: (error) => {
      console.error('Failed to send invoice:', error);
      toast.error('Failed to send invoice. Please try again.');
    },
  });

  const handleSend = useCallback(() => {
    if (!isEmailValid) return;

    sendInvoiceMutation.mutate({
      to: toEmail,
      from: fromEmail,
      subject,
      message,
      sendCopy,
      attachPdf,
    });
  }, [
    toEmail,
    fromEmail,
    subject,
    message,
    sendCopy,
    attachPdf,
    isEmailValid,
    sendInvoiceMutation,
  ]);

  const customerName = useMemo(() => {
    const match = message.match(/Hi\s+(\w+),/);
    return match ? match[1] : 'asd';
  }, [message]);

  const togglePreview = useCallback(() => {
    setShowPreview(!showPreview);
  }, [showPreview]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        handleSend();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      return window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleClose, handleSend]);

  const messageLength = message.length;
  const maxLength = 1000;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          handleClose();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button className='bg-black hover:bg-neutral-800 text-white font-medium rounded-none w-32 h-10'>
          Send Invoice
        </Button>
      </DialogTrigger>
      <DialogContent className='w-screen h-screen max-w-none p-0 border-0 bg-white dark:bg-neutral-900 flex flex-col'>
        {/* Proper Dialog Header */}
        <DialogHeader className='px-8 py-5 border-b border-gray-100 dark:border-neutral-800 flex-shrink-0'>
          <div className='flex items-center justify-between max-w-7xl w-full'>
            <DialogTitle className='text-xl font-semibold text-gray-900 dark:text-gray-100'>
              Send invoice
            </DialogTitle>
            <div className='flex items-center gap-4'>
              <Button
                variant='outline'
                size='sm'
                onClick={togglePreview}
                className='lg:hidden h-10 px-4 text-sm border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-800 rounded-none w-36'
              >
                {showPreview ? (
                  <>
                    <EyeOff className='h-4 w-4 mr-2' />
                    Hide Preview
                  </>
                ) : (
                  <>
                    <Eye className='h-4 w-4 mr-2' />
                    Show Preview
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Main Content */}
        <div className='flex flex-col lg:flex-row flex-1 min-h-0'>
          {/* Form Section */}
          <div
            className={`w-full lg:w-1/2 ${
              showPreview ? 'hidden lg:block' : 'block'
            } overflow-y-auto`}
          >
            <div className='w-full px-8 py-6'>
              <div className='max-w-7xl'>
                <div className='space-y-8'>
                  <div className='space-y-1.5'>
                    <Label
                      htmlFor='from'
                      className='text-sm font-medium text-gray-700 dark:text-gray-200'
                    >
                      From
                    </Label>
                    <Select value={fromEmail} onValueChange={setFromEmail}>
                      <SelectTrigger className='h-9 sm:h-10 border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-gray-300 dark:focus:ring-neutral-700'>
                        <SelectValue placeholder='Select email' />
                      </SelectTrigger>
                      <SelectContent>
                        {gmailStatus?.integrations?.map((integration) => {
                          return (
                            <SelectItem
                              key={integration.email}
                              value={integration.email}
                              disabled={!integration.isActive || integration.isExpired}
                            >
                              {integration.email}
                              {integration.isPrimary && ' (Primary)'}
                              {integration.isExpired && ' (Expired)'}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='space-y-1.5'>
                    <Label
                      htmlFor='to'
                      className='text-sm font-medium text-gray-700 dark:text-gray-200'
                    >
                      To
                    </Label>
                    <div className='relative'>
                      <Input
                        id='to'
                        value={toEmail}
                        onChange={(e) => {
                          return setToEmail(e.target.value);
                        }}
                        className='h-9 sm:h-10 border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm text-gray-900 dark:text-gray-100 focus-visible:ring-1 focus-visible:ring-gray-300 dark:focus-visible:ring-neutral-700'
                        placeholder='customer@email.com'
                      />
                      {!isEmailValid && toEmail.length > 0 && (
                        <p className='text-xs text-red-500 dark:text-red-400'>
                          Please enter a valid email address
                        </p>
                      )}
                    </div>
                  </div>

                  <div className='space-y-1.5'>
                    <Label
                      htmlFor='subject'
                      className='text-sm font-medium text-gray-700 dark:text-gray-200'
                    >
                      Subject
                    </Label>
                    <Input
                      id='subject'
                      value={subject}
                      onChange={(e) => {
                        return setSubject(e.target.value);
                      }}
                      className='h-9 sm:h-10 border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm text-gray-900 dark:text-gray-100 focus-visible:ring-1 focus-visible:ring-gray-300 dark:focus-visible:ring-neutral-700'
                    />
                  </div>

                  <div className='space-y-1.5'>
                    <div className='flex justify-between items-center'>
                      <Label
                        htmlFor='message'
                        className='text-sm font-medium text-gray-700 dark:text-gray-200'
                      >
                        Message
                      </Label>
                      <span className='text-xs text-gray-500 dark:text-gray-400'>
                        {messageLength}/{maxLength}
                      </span>
                    </div>
                    <Textarea
                      id='message'
                      value={message}
                      onChange={(e) => {
                        if (e.target.value.length <= maxLength) {
                          setMessage(e.target.value);
                        }
                      }}
                      className='min-h-[120px] sm:min-h-[160px] border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm text-gray-900 dark:text-gray-100 focus-visible:ring-1 focus-visible:ring-gray-300 dark:focus-visible:ring-neutral-700 resize-none'
                    />
                  </div>

                  <div className='space-y-3 pt-1'>
                    <h3 className='text-sm font-medium text-gray-700 dark:text-gray-200'>
                      Send settings
                    </h3>
                    <div className='space-y-2'>
                      <div className='flex items-start'>
                        <Checkbox
                          id='copy'
                          checked={sendCopy}
                          onCheckedChange={(checked) => {
                            return setSendCopy(checked as boolean);
                          }}
                          className='mt-0.5 h-4 w-4 border-gray-300 dark:border-neutral-600 rounded'
                        />
                        <Label
                          htmlFor='copy'
                          className='ml-2 text-sm text-gray-600 dark:text-gray-300 font-normal leading-tight'
                        >
                          Send a copy to myself at testingnirav@gmail.com
                        </Label>
                      </div>
                      <div className='flex items-start'>
                        <Checkbox
                          id='pdf'
                          checked={attachPdf}
                          onCheckedChange={(checked) => {
                            return setAttachPdf(checked as boolean);
                          }}
                          className='mt-0.5 h-4 w-4 border-gray-300 dark:border-neutral-600 rounded'
                        />
                        <Label
                          htmlFor='pdf'
                          className='ml-2 text-sm text-gray-600 dark:text-gray-300 font-normal leading-tight'
                        >
                          Attach the invoice as a PDF
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div
            className={`w-full lg:w-1/2 ${
              showPreview ? 'block' : 'hidden lg:block'
            } overflow-y-auto bg-gray-50 dark:bg-neutral-800/50`}
          >
            <div className='px-8 py-6'>
              <div className='max-w-7xl'>
                <div className='space-y-6'>
                  <div className='flex items-start justify-between'>
                    <div>
                      <h3 className='text-sm font-medium text-gray-700 dark:text-gray-200'>
                        Preview
                      </h3>
                      <p className='text-xs text-gray-500 dark:text-gray-400 leading-tight'>
                        You are previewing what your customer will see in their inbox.
                      </p>
                    </div>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='h-10 w-10 p-0 rounded-none hover:bg-gray-100 dark:hover:bg-neutral-700'
                    >
                      <HelpCircle className='h-3 w-3 text-gray-400 dark:text-gray-500' />
                      <span className='sr-only'>Help</span>
                    </Button>
                  </div>
                  <div className=''>
                    <div className='bg-white dark:bg-neutral-900 rounded-md border border-gray-200 dark:border-neutral-700 p-4 shadow-sm'>
                      <div className='text-center mb-4'>
                        <h2 className='text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100 mb-1 border-b border-gray-200 dark:border-neutral-700 pb-2 mb-4'>
                          {invoice.customer?.name}
                        </h2>
                        <div className='space-y-0.5'>
                          <p className='text-sm text-gray-600 dark:text-gray-300'>
                            Invoice for{' '}
                            <span className='font-medium text-gray-900 dark:text-gray-100'>
                              {invoice.settings?.currency} {invoice.totals?.total.toFixed(2)}
                            </span>{' '}
                            due by{' '}
                            <span className='font-medium text-gray-900 dark:text-gray-100'>
                              {new Date(invoice.dueDate).toLocaleDateString()}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className='flex justify-center mb-4'>
                        <Button
                          size='sm'
                          className='bg-black hover:bg-neutral-800 text-white font-medium h-10 px-4 text-sm rounded-none w-32'
                        >
                          View Invoice
                        </Button>
                      </div>

                      <div className='space-y-2 text-sm text-gray-600 dark:text-gray-300'>
                        {message.split('\n').map((line, i) => {
                          return (
                            <p key={i} className='leading-tight'>
                              {line || '\u00A0'}
                            </p>
                          );
                        })}
                      </div>

                      <div className='mt-4 pt-3 border-t border-gray-100 dark:border-neutral-800 text-center space-y-1'>
                        <p className='text-xs text-gray-400 dark:text-gray-500'>Invoice 8</p>
                        <a
                          href='#'
                          className='text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300'
                        >
                          View invoice
                        </a>
                        <p className='text-xs text-gray-400 dark:text-gray-500'>{customerName}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Proper Dialog Footer */}
        <DialogFooter className='px-8 py-5 border-t border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex-shrink-0'>
          <div className='flex flex-col-reverse sm:flex-row justify-end items-center gap-4 w-full max-w-7xl'>
            <p className='text-sm text-gray-500 dark:text-gray-400 sm:hidden'>
              Changes apply to this email only
            </p>
            <div className='flex gap-4 w-full sm:w-auto justify-end'>
              <Button
                variant='outline'
                onClick={handleClose}
                className='h-11 px-6 text-sm font-medium border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-800 rounded-none w-36'
              >
                Cancel
              </Button>
              <Button
                onClick={handleSend}
                disabled={!isEmailValid || isSending}
                className='h-11 px-6 text-sm font-medium bg-black hover:bg-neutral-800 disabled:bg-gray-200 dark:disabled:bg-neutral-800 disabled:text-gray-400 dark:disabled:text-gray-500 text-white rounded-none w-36'
              >
                {isSending ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Sending...
                  </>
                ) : (
                  'Send'
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
