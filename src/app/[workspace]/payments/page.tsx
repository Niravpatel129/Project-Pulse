'use client';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSidebar } from '@/components/ui/sidebar';
import { format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { FiRefreshCw, FiSearch, FiSidebar } from 'react-icons/fi';
import { IoPerson } from 'react-icons/io5';

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
  const [payments, setPayments] = useState<any[]>([]); // Replace with actual data fetching
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);

  return (
    <motion.div
      className='flex flex-col h-full'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      }}
    >
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
                  selectedPayment === payment._id ? 'bg-[#252525]' : ''
                }`}
                onClick={() => {
                  return setSelectedPayment(payment._id);
                }}
              >
                <div className='relative mr-3'>
                  <Avatar className='h-8 w-8'>
                    <AvatarFallback className='bg-[#373737] text-[#9f9f9f] text-xs font-semibold capitalize'>
                      {payment.customer?.name?.[0] || <IoPerson />}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className='flex-1 min-w-0'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <span className='font-semibold text-[#fafafa] text-[14px] truncate'>
                        {payment.customer?.name || 'Unknown Customer'}
                      </span>
                    </div>
                  </div>

                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <span className='text-[#8C8C8C] text-sm truncate md:max-w-[300px] max-w-[180px] hover:text-white transition-colors'>
                        {payment.description || 'No description'}
                      </span>
                      <span className='text-[#8C8C8C] text-sm'>
                        •{' '}
                        {payment.amount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{' '}
                        {payment.currency}
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
                      const date = new Date(payment.createdAt);
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
    </motion.div>
  );
}
