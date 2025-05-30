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
        <Button className='bg-blue-600 hover:bg-blue-700 text-white'>Send Invoice</Button>
      </DialogTrigger>
      <DialogContent className='w-[95vw] sm:w-[90vw] md:w-[85vw] lg:max-w-4xl xl:max-w-5xl h-[95vh] sm:h-[90vh] md:h-[85vh] p-0 border-slate-200 shadow-md'>
        {/* Proper Dialog Header */}
        <DialogHeader className='px-4 sm:px-5 py-3 border-b border-slate-100'>
          <div className='flex items-center justify-between'>
            <DialogTitle className='text-lg font-medium text-slate-800'>Send invoice</DialogTitle>
            {/* Mobile Preview Toggle */}
            <Button
              variant='outline'
              size='sm'
              onClick={togglePreview}
              className='lg:hidden h-8 px-3 text-sm border-slate-200 text-slate-700 hover:bg-slate-50'
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
        </DialogHeader>

        {/* Tabs */}
        <div className=''>
          <div className='flex flex-col lg:flex-row h-[calc(95vh-160px)] sm:h-[calc(90vh-160px)] md:h-[calc(85vh-160px)]'>
            {/* Form Section */}
            <div className={`flex-1 ${showPreview ? 'hidden lg:block' : 'block'}  overflow-y-auto`}>
              <div className='p-4 sm:p-5'>
                <div className='space-y-4'>
                  <div className='space-y-1'>
                    <Label htmlFor='from' className='text-sm font-medium text-slate-700'>
                      From
                    </Label>
                    <div className='relative'>
                      <Input
                        id='from'
                        value='testingnirav@gmail.com'
                        readOnly
                        className='h-9 sm:h-10 pr-8 border-slate-200 bg-white text-sm focus-visible:ring-0 focus-visible:border-slate-300'
                      />
                      <div className='absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none'>
                        <svg
                          className='h-4 w-4 text-slate-400'
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

                  <div className='space-y-1'>
                    <Label htmlFor='to' className='text-sm font-medium text-slate-700'>
                      To
                    </Label>
                    <div className='relative'>
                      <Input
                        id='to'
                        value={toEmail}
                        onChange={(e) => {
                          return setToEmail(e.target.value);
                        }}
                        className='h-9 sm:h-10 pr-8 border-slate-200 bg-white text-sm focus-visible:ring-0 focus-visible:border-slate-300'
                        placeholder='customer@email.com'
                      />
                      <Button
                        variant='ghost'
                        size='sm'
                        className='absolute inset-y-0 right-0 h-full px-2 text-slate-400 hover:text-slate-600'
                      >
                        <Plus className='h-4 w-4' />
                        <span className='sr-only'>Add recipient</span>
                      </Button>
                    </div>
                    {!isEmailValid && toEmail.length > 0 && (
                      <p className='text-xs text-red-500'>Enter an email address.</p>
                    )}
                  </div>

                  <div className='py-1'>
                    <p className='text-xs text-slate-600 leading-tight'>
                      Changes made here will only be applied to this individual email. To edit the
                      default template for future use, go to{' '}
                      <a href='#' className='text-blue-600 hover:text-blue-700 font-medium'>
                        Email templates
                      </a>
                      <span className='inline-flex items-center justify-center ml-1 px-1 py-0.5 text-xs font-medium bg-blue-50 text-blue-600 rounded'>
                        New
                      </span>
                    </p>
                  </div>

                  <div className='space-y-1'>
                    <Label htmlFor='subject' className='text-sm font-medium text-slate-700'>
                      Subject
                    </Label>
                    <Input
                      id='subject'
                      value={subject}
                      onChange={(e) => {
                        return setSubject(e.target.value);
                      }}
                      className='h-9 sm:h-10 border-slate-200 bg-white text-sm focus-visible:ring-0 focus-visible:border-slate-300'
                    />
                  </div>

                  <div className='space-y-1'>
                    <Label htmlFor='message' className='text-sm font-medium text-slate-700'>
                      Message
                    </Label>
                    <Textarea
                      id='message'
                      value={message}
                      onChange={(e) => {
                        return setMessage(e.target.value);
                      }}
                      className='min-h-[80px] sm:min-h-[100px] md:min-h-[120px] border-slate-200 bg-white text-sm focus-visible:ring-0 focus-visible:border-slate-300 resize-none'
                    />
                  </div>

                  <div className='space-y-3 pt-1'>
                    <h3 className='text-sm font-medium text-slate-700'>Send settings</h3>
                    <div className='space-y-2'>
                      <div className='flex items-start'>
                        <Checkbox id='copy' className='mt-0.5 h-4 w-4 border-slate-300 rounded' />
                        <Label
                          htmlFor='copy'
                          className='ml-2 text-sm text-slate-600 font-normal leading-tight'
                        >
                          Send a copy to myself at testingnirav@gmail.com
                        </Label>
                      </div>
                      <div className='flex items-start'>
                        <Checkbox id='pdf' className='mt-0.5 h-4 w-4 border-slate-300 rounded' />
                        <Label
                          htmlFor='pdf'
                          className='ml-2 text-sm text-slate-600 font-normal leading-tight'
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
              className={`w-full lg:w-[320px] xl:w-[360px] bg-slate-50 ${
                showPreview ? 'block' : 'hidden lg:block'
              } overflow-y-auto`}
            >
              <div className='p-4'>
                <div className='space-y-4'>
                  <div className='flex items-start justify-between'>
                    <div>
                      <h3 className='text-sm font-medium text-slate-700'>Preview</h3>
                      <p className='text-xs text-slate-500 leading-tight'>
                        You are previewing what your customer will see in their inbox.
                      </p>
                    </div>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='h-6 w-6 p-0 rounded-full hover:bg-slate-200'
                    >
                      <HelpCircle className='h-3 w-3 text-slate-400' />
                      <span className='sr-only'>Help</span>
                    </Button>
                  </div>

                  <div className='bg-white rounded-md border border-slate-200 p-3 sm:p-4 shadow-sm'>
                    <div className='text-center mb-3 sm:mb-4'>
                      <h2 className='text-base sm:text-lg font-medium text-slate-800 mb-1'>
                        {customerName}
                      </h2>
                      <div className='space-y-0.5'>
                        <p className='text-sm text-slate-600'>
                          Invoice for <span className='font-medium text-slate-800'>$1,200.00</span>{' '}
                          due by <span className='font-medium text-slate-800'>May 29, 2025</span>
                        </p>
                      </div>
                    </div>

                    <div className='flex justify-center mb-3 sm:mb-4'>
                      <Button
                        size='sm'
                        className='bg-blue-600 hover:bg-blue-700 text-white font-medium h-8 px-4 text-sm'
                      >
                        View Invoice
                      </Button>
                    </div>

                    <div className='space-y-2 text-sm text-slate-600'>
                      {message.split('\n').map((line, i) => {
                        return (
                          <p key={i} className='leading-tight'>
                            {line || '\u00A0'}
                          </p>
                        );
                      })}
                    </div>

                    <div className='mt-3 sm:mt-4 pt-3 border-t border-slate-100 text-center space-y-1'>
                      <p className='text-xs text-slate-400'>Invoice 8</p>
                      <a href='#' className='text-sm text-blue-600 hover:text-blue-700'>
                        View invoice
                      </a>
                      <p className='text-xs text-slate-400'>{customerName}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Proper Dialog Footer */}
        <DialogFooter className='px-4 sm:px-5 py-3 border-t border-slate-100 bg-white'>
          <div className='flex flex-col-reverse sm:flex-row justify-between sm:justify-end items-center gap-3 w-full'>
            <p className='text-xs sm:text-sm text-slate-600 sm:hidden'>
              Changes apply to this email only
            </p>
            <div className='flex gap-3 w-full sm:w-auto'>
              <Button
                variant='outline'
                onClick={handleClose}
                className='flex-1 sm:flex-none h-9 sm:h-8 px-3 text-sm font-medium border-slate-200 text-slate-700 hover:bg-slate-50'
              >
                Cancel
              </Button>
              <Button
                onClick={handleSend}
                disabled={!isEmailValid}
                className='flex-1 sm:flex-none h-9 sm:h-8 px-3 text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white'
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
