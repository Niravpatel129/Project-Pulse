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
import { Textarea } from '@/components/ui/textarea';
import { Eye, EyeOff, HelpCircle, Plus } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

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
  const [open, setOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [toEmail, setToEmail] = useState('customer@email.com');
  const [subject, setSubject] = useState('Invoice #8 from asd');
  const [message, setMessage] = useState(`Hi asd,

Here's Invoice #8 for the amount of $1,200.00.

If you have any questions, feel free to reach out.

Thank you,
asd`);

  const handleClose = useCallback(() => {
    return setOpen(false);
  }, []);
  const isEmailValid = useMemo(() => {
    return toEmail.includes('@') && toEmail.includes('.');
  }, [toEmail]);

  const handleSend = useCallback(() => {
    if (!isEmailValid) return;
    console.log('Sending invoice to:', toEmail);
    setOpen(false);
  }, [toEmail, isEmailValid]);

  const customerName = useMemo(() => {
    const match = message.match(/Hi\s+(\w+),/);
    return match ? match[1] : 'asd';
  }, [message]);

  const togglePreview = useCallback(() => {
    setShowPreview(!showPreview);
  }, [showPreview]);

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className='bg-black hover:bg-neutral-800 text-white font-medium rounded-none w-32 h-10'>
          Send Invoice
        </Button>
      </DialogTrigger>
      <DialogContent className='w-screen h-screen max-w-none p-0 border-0 bg-white dark:bg-neutral-900 flex flex-col'>
        {/* Proper Dialog Header */}
        <DialogHeader className='px-6 py-4 border-b border-gray-100 dark:border-neutral-800 flex-shrink-0'>
          <div className='flex items-center justify-between max-w-7xl w-full'>
            <DialogTitle className='text-lg font-medium text-gray-900 dark:text-gray-100'>
              Send invoice
            </DialogTitle>
            <div className='flex items-center gap-3'>
              {/* Mobile Preview Toggle */}
              <Button
                variant='outline'
                size='sm'
                onClick={togglePreview}
                className='lg:hidden h-10 px-3 text-sm border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-800 rounded-none w-32'
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
          <div className={`w-1/2 ${showPreview ? 'hidden lg:block' : 'block'} overflow-y-auto`}>
            <div className='w-full px-6'>
              <div className='space-y-6'>
                <div className='space-y-1.5'>
                  <Label
                    htmlFor='from'
                    className='text-sm font-medium text-gray-700 dark:text-gray-200'
                  >
                    From
                  </Label>
                  <div className='relative'>
                    <Input
                      id='from'
                      value='testingnirav@gmail.com'
                      readOnly
                      className='h-9 sm:h-10 pr-8 border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm text-gray-900 dark:text-gray-100 focus-visible:ring-1 focus-visible:ring-gray-300 dark:focus-visible:ring-neutral-700'
                    />
                    <div className='absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none'>
                      <svg
                        className='h-4 w-4 text-gray-400 dark:text-gray-500'
                        xmlns='http://www.w3.org/2000/svg'
                        viewBox='0 0 20 20'
                        fill='currentColor'
                      >
                        <path
                          fillRule='evenodd'
                          d='M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z'
                          clipRule='evenodd'
                        />
                      </svg>
                    </div>
                  </div>
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
                      className='h-9 sm:h-10 pr-8 border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm text-gray-900 dark:text-gray-100 focus-visible:ring-1 focus-visible:ring-gray-300 dark:focus-visible:ring-neutral-700'
                      placeholder='customer@email.com'
                    />
                    <Button
                      variant='ghost'
                      size='sm'
                      className='absolute inset-y-0 right-0 h-10 px-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded-none'
                    >
                      <Plus className='h-4 w-4' />
                      <span className='sr-only'>Add recipient</span>
                    </Button>
                  </div>
                  {!isEmailValid && toEmail.length > 0 && (
                    <p className='text-xs text-red-500 dark:text-red-400'>
                      Enter an email address.
                    </p>
                  )}
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
                  <Label
                    htmlFor='message'
                    className='text-sm font-medium text-gray-700 dark:text-gray-200'
                  >
                    Message
                  </Label>
                  <Textarea
                    id='message'
                    value={message}
                    onChange={(e) => {
                      return setMessage(e.target.value);
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

          {/* Preview Section */}
          <div
            className={`w-full lg:w-1/2 ${
              showPreview ? 'block' : 'hidden lg:block'
            } overflow-y-auto`}
          >
            <div className='p-6'>
              <div className='space-y-4'>
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
                <div className='w-full bg-gray-50 dark:bg-neutral-800 p-3 rounded-md border border-gray-200 dark:border-neutral-700'>
                  <div className='bg-white dark:bg-neutral-900 rounded-md border border-gray-200 dark:border-neutral-700 p-4 shadow-sm'>
                    <div className='text-center mb-4'>
                      <h2 className='text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100 mb-1 border-b border-gray-200 dark:border-neutral-700 pb-2 mb-4'>
                        {customerName}
                      </h2>
                      <div className='space-y-0.5'>
                        <p className='text-sm text-gray-600 dark:text-gray-300'>
                          Invoice for{' '}
                          <span className='font-medium text-gray-900 dark:text-gray-100'>
                            $1,200.00
                          </span>{' '}
                          due by{' '}
                          <span className='font-medium text-gray-900 dark:text-gray-100'>
                            May 29, 2025
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

        {/* Proper Dialog Footer */}
        <DialogFooter className='px-6 py-4 border-t border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex-shrink-0'>
          <div className='flex flex-col-reverse sm:flex-row justify-end items-center gap-3 w-full max-w-7xl'>
            <p className='text-xs sm:text-sm text-gray-500 dark:text-gray-400 sm:hidden'>
              Changes apply to this email only
            </p>
            <div className='flex gap-3 w-full sm:w-auto justify-end'>
              <Button
                variant='outline'
                onClick={handleClose}
                className='h-10 px-3 text-sm font-medium border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-800 rounded-none w-32'
              >
                Cancel
              </Button>
              <Button
                onClick={handleSend}
                disabled={!isEmailValid}
                className='h-10 px-3 text-sm font-medium bg-black hover:bg-neutral-800 disabled:bg-gray-200 dark:disabled:bg-neutral-800 disabled:text-gray-400 dark:disabled:text-gray-500 text-white rounded-none w-32'
              >
                Send
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
