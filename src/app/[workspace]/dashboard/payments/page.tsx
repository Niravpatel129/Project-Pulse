'use client';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useSidebar } from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import { newRequest } from '@/utils/newRequest';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { FiRefreshCw, FiSearch, FiSidebar } from 'react-icons/fi';
import { IoPerson } from 'react-icons/io5';
import { PaymentPreview } from './components/PaymentPreview';

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

interface Payment {
  _id: string;
  amount: number;
  status: string;
  method: string;
  date: string;
  memo?: string;
  invoice?: {
    _id: string;
    invoiceNumber: string;
    currency: string;
    client?: {
      _id: string;
      user?: {
        name: string;
      };
    };
  };
}

interface ApiResponse {
  status: string;
  results: number;
  data: Payment[];
}

export default function PaymentsPage() {
  const isMobile = useIsMobile();
  const { toggleSidebar } = useSidebar();
  const [showPreview, setShowPreview] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | undefined>();
  const queryClient = useQueryClient();

  const {
    data: paymentsData,
    isLoading: isLoadingPayments,
    error: paymentsError,
  } = useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      const response = await newRequest.get<ApiResponse>('/payments');
      return response.data.data.sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
    },
  });

  const handlePreviewClick = (payment: Payment | null) => {
    if (payment) {
      setSelectedPayment(payment);
      setShowPreview(true);
    } else {
      setSelectedPayment(undefined);
      setShowPreview(false);
    }
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setSelectedPayment(undefined);
    handlePreviewClick(null);
  };

  return (
    <main className='flex-1 w-full overflow-auto bg-background h-screen'>
      <div className='flex h-full'>
        <div className='w-full h-full overflow-auto'>
          <div className='flex items-center justify-between px-4 py-2 border-b border-[#232428]'>
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
                  return queryClient.invalidateQueries();
                }}
              >
                <FiRefreshCw size={20} />
              </Button>
            </div>
          </div>

          <div className='px-4 py-2'>
            <div className='relative'>
              <FiSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8C8C8C]' />
              <Input
                type='text'
                placeholder='Search payments...'
                className='w-full pl-9 bg-[#141414] border-[#232428] text-[#fafafa] placeholder:text-[#8C8C8C] focus-visible:ring-1 focus-visible:ring-[#8C8C8C]'
              />
            </div>
          </div>

          <div className='flex-1 overflow-y-auto px-1 scrollbar-hide'>
            <AnimatePresence mode='popLayout'>
              {paymentsData?.map((payment, index) => {
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
                      return handlePreviewClick(payment);
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
                          <TooltipProvider delayDuration={0}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className='text-[#8C8C8C] text-sm truncate md:max-w-[300px] max-w-[180px] hover:text-white transition-colors'>
                                  {payment.invoice?.invoiceNumber || 'No invoice number'}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent className='w-80 p-4 bg-[#232323] border border-[#313131] shadow-lg'>
                                <div className='space-y-2'>
                                  <h4 className='font-medium text-white mb-2'>Payment Details</h4>
                                  <div className='text-sm'>
                                    <p className='text-white'>
                                      Invoice: {payment.invoice?.invoiceNumber}
                                    </p>
                                    <p className='text-[#8C8C8C] text-xs'>
                                      Amount:{' '}
                                      {payment?.amount?.toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      })}{' '}
                                      {payment.invoice?.currency}
                                    </p>
                                    <p className='text-[#8C8C8C] text-xs'>
                                      Method: {payment.method.replace('-', ' ')}
                                    </p>
                                    {payment.memo && (
                                      <p className='text-[#8C8C8C] text-xs mt-2'>
                                        Memo: {payment.memo}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <span className='text-[#8C8C8C] text-sm'>
                            •{' '}
                            {payment?.amount?.toLocaleString(undefined, {
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

        {isMobile ? (
          <Sheet open={showPreview} onOpenChange={setShowPreview}>
            <SheetContent side='right' className='w-full sm:max-w-lg p-0'>
              <SheetHeader className='sr-only'>
                <SheetTitle>Payment Preview</SheetTitle>
              </SheetHeader>
              {selectedPayment && (
                <PaymentPreview payment={selectedPayment} onClose={handleClosePreview} />
              )}
            </SheetContent>
          </Sheet>
        ) : (
          <div className='w-full border-l overflow-hidden'>
            {selectedPayment ? (
              <PaymentPreview payment={selectedPayment} onClose={handleClosePreview} />
            ) : (
              <div className='flex flex-col items-center justify-center h-full w-full bg-background'>
                <div className='flex flex-col items-center justify-center'>
                  <div className='flex items-center justify-center rounded-full border-2 border-dashed border-[#444] w-32 h-32 mb-6'>
                    {/* Envelope Icon */}
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      width='56'
                      height='56'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='#aaabfa'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      className='lucide lucide-mail'
                    >
                      <rect width='20' height='16' x='2' y='4' rx='2' />
                      <path d='m22 6-8.97 6.48a2 2 0 0 1-2.06 0L2 6' />
                    </svg>
                  </div>
                  <div className='text-white text-xl font-semibold mb-2'>It&apos;s empty here</div>
                  <div className='text-[#8C8C8C] text-base'>Choose a payment to view details</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
