'use client';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useSidebar } from '@/components/ui/sidebar';
import { newRequest } from '@/utils/newRequest';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { FiRefreshCw, FiSearch, FiSidebar } from 'react-icons/fi';
import { IoPerson } from 'react-icons/io5';
import { toast } from 'sonner';

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'bg-green-500/10 text-green-500';
    case 'failed':
      return 'bg-red-500/10 text-red-500';
    case 'pending':
      return 'bg-yellow-500/10 text-yellow-500';
    default:
      return 'bg-gray-500/10 text-gray-500';
  }
};

export default function PaymentsPage() {
  const { toggleSidebar } = useSidebar();
  const [selectedPayment, setSelectedPayment] = useState<any | null>(null);
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);

  const {
    data: payments,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      const response = await newRequest.get('/payments');
      return response.data.data;
    },
  });

  const handleSendReceipt = (payment: any) => {
    setSelectedPayment(payment);
    setIsReceiptDialogOpen(true);
  };

  return (
    <motion.div
      className='flex h-full'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      }}
    >
      <div className='flex-1 flex flex-col'>
        <motion.div
          className='flex items-center justify-between px-4 py-2 border-b border-[#232428]'
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            duration: 0.6,
            ease: [0.4, 0, 0.2, 1],
            delay: 0.1,
          }}
        >
          <div className='flex items-center gap-2'>
            <Button
              variant='ghost'
              size='icon'
              className='text-[#8b8b8b] hover:text-white'
              onClick={toggleSidebar}
            >
              <FiSidebar size={20} />
            </Button>
            <h1 className='text-lg font-semibold text-white'>Payments</h1>
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant='ghost'
              size='icon'
              className='text-[#8b8b8b] hover:text-white'
              onClick={() => {
                // Add refresh functionality
              }}
            >
              <FiRefreshCw size={20} />
            </Button>
          </div>
        </motion.div>

        <motion.div
          className='px-4 py-2'
          initial={{ y: -5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            duration: 0.6,
            ease: [0.4, 0, 0.2, 1],
            delay: 0.2,
          }}
        >
          <div className='relative'>
            <FiSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8C8C8C]' />
            <Input
              type='text'
              placeholder='Search payments...'
              className='w-full pl-9 bg-[#141414] border-[#232428] text-[#fafafa] placeholder:text-[#8C8C8C] focus-visible:ring-1 focus-visible:ring-[#8C8C8C]'
            />
          </div>
        </motion.div>

        <div className='flex-1 overflow-y-auto px-1 scrollbar-hide'>
          <AnimatePresence mode='popLayout'>
            {payments?.map((payment, index) => {
              return (
                <motion.div
                  key={payment._id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 25,
                    mass: 0.8,
                    opacity: {
                      duration: 0.3,
                      ease: [0.4, 0, 0.2, 1],
                    },
                    delay: index * 0.03,
                  }}
                  className={`group relative flex items-center px-3 py-2 my-2 rounded-lg hover:bg-[#252525] transition-all duration-300 ease-in-out cursor-pointer ${
                    selectedPayment?._id === payment._id ? 'bg-[#252525]' : ''
                  }`}
                  onClick={() => {
                    return setSelectedPayment(payment);
                  }}
                >
                  <div className='relative mr-3'>
                    <Avatar className='h-8 w-8'>
                      <AvatarFallback className='bg-[#373737] text-[#9f9f9f] text-xs font-semibold capitalize'>
                        {payment.invoice?.client?.user?.name?.[0] || <IoPerson />}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <span className='font-semibold text-[#fafafa] text-[14px] truncate'>
                          {payment.invoice?.client?.user?.name || 'Unknown Customer'}
                        </span>
                      </div>
                    </div>

                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <span className='text-[#8C8C8C] text-sm truncate md:max-w-[300px] max-w-[180px] hover:text-white transition-colors'>
                          {payment.invoice?.invoiceNumber || 'No invoice number'}
                        </span>
                        <span className='text-[#8C8C8C] text-sm'>
                          •{' '}
                          {payment.amount.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}{' '}
                          {payment.invoice?.currency}
                        </span>
                        <Badge
                          variant='secondary'
                          className={`${getStatusColor(payment.status)} text-xs px-2 py-0.5`}
                        >
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className='flex items-center gap-2 ml-4'>
                    <div className='text-xs text-[#8C8C8C] ml-0 whitespace-nowrap'>
                      {(() => {
                        const date = new Date(payment.date);
                        const today = new Date();
                        const isToday = date.toDateString() === today.toDateString();
                        const isThisYear = date.getFullYear() === today.getFullYear();

                        if (isToday) {
                          return format(date, 'h:mm a');
                        } else if (!isThisYear) {
                          return format(date, 'MMM d, yyyy');
                        } else {
                          return format(date, 'MMM d');
                        }
                      })()}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Payment Preview Panel */}
      {selectedPayment && (
        <div className='w-[500px] border-l border-[#232428] bg-background overflow-hidden'>
          <div className='sticky top-0 z-10 bg-background border-b border-[#232428] p-4'>
            <div className='flex items-center justify-between'>
              <h2 className='text-lg font-semibold text-white'>Payment Details</h2>
              <Button
                variant='ghost'
                size='icon'
                className='text-[#8b8b8b] hover:text-white'
                onClick={() => {
                  return setSelectedPayment(null);
                }}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='24'
                  height='24'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  className='lucide lucide-x'
                >
                  <path d='M18 6 6 18' />
                  <path d='m6 6 12 12' />
                </svg>
              </Button>
            </div>
          </div>

          <div className='overflow-y-auto h-[calc(100vh-4rem)]'>
            <div className='p-4 space-y-6'>
              {/* Payment Info Section */}
              <div className='flex flex-col space-y-6 pb-6 border-b border-[#232323] rounded-t-lg'>
                <div className='flex flex-col border-b border-[#232323]'>
                  <div className='flex items-center'>
                    <span className='text-[14px] font-medium text-white'>
                      Payment #{selectedPayment.paymentNumber}
                    </span>
                    <Badge className='ml-2'>{selectedPayment.status}</Badge>
                  </div>
                  <div className='flex flex-col sm:flex-row gap-4 mt-2'>
                    <div className='flex items-center gap-0'>
                      <span className='text-sm text-[#8C8C8C]'>Customer:</span>
                      <Button variant='link' size='sm'>
                        {selectedPayment.invoice?.client?.user?.name || 'N/A'}
                      </Button>
                    </div>
                    <div className='flex items-center gap-0'>
                      <span className='text-sm text-[#8C8C8C]'>Invoice:</span>
                      <Button variant='link' size='sm'>
                        {selectedPayment.invoice?.invoiceNumber || 'N/A'}
                      </Button>
                    </div>
                  </div>
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='flex flex-col'>
                    <span className='text-sm text-[#8C8C8C] mb-2'>Amount</span>
                    <span className='text-[14px] font-bold text-white'>
                      {selectedPayment.amount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{' '}
                      {selectedPayment.invoice?.currency}
                    </span>
                  </div>
                  <div className='flex flex-col'>
                    <span className='text-sm text-[#8C8C8C] mb-2'>Method</span>
                    <span className='text-[14px] font-medium text-white capitalize'>
                      {selectedPayment.method.replace('-', ' ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Timeline Section */}
              <div className='bg-[#141414] rounded-lg border border-[#232323] p-6'>
                <div className='flex flex-col space-y-6'>
                  {/* Payment */}
                  <div className='flex flex-col sm:flex-row sm:items-center gap-4'>
                    <div className='flex items-center gap-4'>
                      <span className='inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#22c55e]/20 shrink-0'>
                        <svg width='20' height='20' fill='none' viewBox='0 0 24 24'>
                          <circle cx='12' cy='12' r='10' fill='#22c55e' />
                          <path
                            d='M16 10l-4.5 4.5L8 11'
                            stroke='white'
                            strokeWidth='2'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                          />
                        </svg>
                      </span>
                      <div>
                        <div className='font-semibold text-white text-[14px] mb-1'>Payment</div>
                        <div className='text-sm text-[#8C8C8C]'>
                          {new Date(selectedPayment.date).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  {selectedPayment.type === 'credit' && (
                    <>
                      <Separator className='bg-[#232323]' />
                      <div className='flex flex-col sm:flex-row sm:items-center gap-4'>
                        <div className='flex items-center gap-4'>
                          <span className='inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#3b82f6]/20 shrink-0'>
                            <svg width='20' height='20' fill='none' viewBox='0 0 24 24'>
                              <circle cx='12' cy='12' r='10' fill='#3b82f6' />
                              <path
                                d='M8 12l2 2 4-4'
                                stroke='white'
                                strokeWidth='2'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                              />
                            </svg>
                          </span>
                          <div>
                            <div className='font-semibold text-white text-[14px] mb-1'>Credit</div>
                            <div className='text-sm text-[#8C8C8C]'>
                              Credit from overpayment of{' '}
                              {selectedPayment.previousPayment?.amount.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}{' '}
                              {selectedPayment.invoice?.currency}
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Additional Info Panel */}
              <div className='bg-[#141414] rounded-lg border border-[#232323] p-6'>
                <h3 className='text-[14px] font-semibold text-white mb-5'>
                  Additional Information
                </h3>
                <div className='grid grid-cols-1 gap-6'>
                  <div>
                    <div className='text-sm text-[#8C8C8C] mb-2'>Memo</div>
                    <div className='text-[14px] text-white'>
                      {selectedPayment.memo || 'No memo'}
                    </div>
                  </div>
                  <div>
                    <div className='text-sm text-[#8C8C8C] mb-2'>Payment ID</div>
                    <div className='text-[14px] text-white'>{selectedPayment._id}</div>
                  </div>
                  <div>
                    <div className='text-sm text-[#8C8C8C] mb-2'>Created At</div>
                    <div className='text-[14px] text-white'>
                      {new Date(selectedPayment.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className='flex justify-end gap-2'>
                <Button
                  variant='outline'
                  className='bg-[#232323] border-[#333] text-white'
                  onClick={() => {
                    return handleSendReceipt(selectedPayment);
                  }}
                >
                  Send Receipt
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Dialog */}
      <Dialog open={isReceiptDialogOpen} onOpenChange={setIsReceiptDialogOpen}>
        <DialogContent className='sm:max-w-[450px]'>
          <DialogHeader>
            <DialogTitle>Send Payment Receipt</DialogTitle>
            <DialogDescription>
              Share the payment receipt for $
              {selectedPayment?.amount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{' '}
              with {selectedPayment?.invoice?.client?.user?.name}
            </DialogDescription>
          </DialogHeader>
          <div className='flex flex-col items-center justify-center py-10'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='40'
              height='40'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
              className='lucide lucide-link mb-4 text-purple-600'
            >
              <path d='M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71' />
              <path d='M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71' />
            </svg>
            <div className='font-bold text-lg mb-1 text-center'>Copy link</div>
            <div className='text-center text-muted-foreground text-base mb-4'>
              A link to your payment receipt with all details included
            </div>
            <Button
              variant='outline'
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success('Receipt link copied!');
              }}
            >
              Copy link
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
