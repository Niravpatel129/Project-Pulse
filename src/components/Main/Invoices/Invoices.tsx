import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSidebar } from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { newRequest } from '@/utils/newRequest';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { BsStarFill } from 'react-icons/bs';
import { FiRefreshCw, FiSearch, FiSidebar } from 'react-icons/fi';
import { IoPerson } from 'react-icons/io5';
import { toast } from 'sonner';

interface InvoicesProps {
  invoices: any[];
  onPreviewClick?: (invoice: any) => void;
  isPreviewOpen?: boolean;
  showStarredOnly?: boolean;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'paid':
      return 'bg-green-500/10 text-green-500';
    case 'overdue':
      return 'bg-red-500/10 text-red-500';
    case 'sent':
    case 'pending':
      return 'bg-yellow-500/10 text-yellow-500';
    default:
      return 'bg-gray-500/10 text-gray-500';
  }
};

export default function Invoices({
  invoices,
  onPreviewClick,
  isPreviewOpen,
  showStarredOnly = false,
}: InvoicesProps) {
  const { toggleSidebar } = useSidebar();
  const queryClient = useQueryClient();
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);

  // Filter invoices based on starred status
  const filteredInvoices = showStarredOnly
    ? invoices.filter((invoice) => {
        return invoice.starred;
      })
    : invoices;

  // Star mutation
  const starMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      const invoice = invoices.find((inv) => {
        return inv._id === invoiceId;
      });
      return newRequest.put(`/invoices/${invoiceId}/star`, {
        starred: !invoice?.starred,
      });
    },
    onMutate: async (invoiceId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['invoices'] });

      // Snapshot the previous value
      const previousInvoices = queryClient.getQueryData(['invoices']);

      // Optimistically update to the new value
      queryClient.setQueryData(['invoices'], (old: any) => {
        return old.map((invoice: any) => {
          if (invoice._id === invoiceId) {
            return { ...invoice, starred: !invoice.starred };
          }
          return invoice;
        });
      });

      // Return a context object with the snapshotted value
      return { previousInvoices };
    },
    onError: (err, newInvoice, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(['invoices'], context?.previousInvoices);
      toast.error('Failed to update star status');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });

  // Add effect to clear selection when preview is closed
  useEffect(() => {
    if (!isPreviewOpen) {
      console.log('Clearing selected invoice state');
      setSelectedInvoice(null);
    }
  }, [isPreviewOpen]);

  return (
    <motion.div
      className='flex flex-col h-full'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1], // Custom easing for smoother fade
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
          <h1 className='text-lg font-semibold text-white'>
            {showStarredOnly ? 'Starred Invoices' : 'Invoices'}
          </h1>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            variant='ghost'
            size='icon'
            className='text-[#8b8b8b] hover:text-white'
            onClick={() => {
              return queryClient.invalidateQueries({ queryKey: ['invoices'] });
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
            placeholder='Search...'
            className='w-full pl-9 bg-[#141414] border-[#232428] text-[#fafafa] placeholder:text-[#8C8C8C] focus-visible:ring-1 focus-visible:ring-[#8C8C8C]'
          />
        </div>
      </motion.div>
      <div className='flex-1 overflow-y-auto px-1 scrollbar-hide'>
        <AnimatePresence mode='popLayout'>
          {filteredInvoices?.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className='flex flex-col items-center justify-center h-full text-[#8C8C8C] py-8'
            >
              <p className='text-lg'>No invoices found</p>
              <p className='text-sm mt-2'>
                {showStarredOnly
                  ? "You haven't starred any invoices yet"
                  : 'Create your first invoice to get started'}
              </p>
            </motion.div>
          ) : (
            filteredInvoices?.map((invoice, index) => {
              return (
                <motion.div
                  key={invoice._id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{
                    type: 'spring',
                    stiffness: 300, // Reduced stiffness for softer motion
                    damping: 25, // Reduced damping for smoother motion
                    mass: 0.8, // Added mass for more natural movement
                    opacity: {
                      duration: 0.3,
                      ease: [0.4, 0, 0.2, 1],
                    },
                    delay: index * 0.03, // Staggered animation for list items
                  }}
                  className={`group relative flex items-center px-3 py-2 my-2 rounded-lg hover:bg-[#252525] transition-all duration-300 ease-in-out cursor-pointer ${
                    selectedInvoice === invoice._id ? 'bg-[#252525]' : ''
                  }`}
                  onClick={(e) => {
                    console.log('Invoice clicked:', invoice._id);
                    console.log('Current selectedInvoice:', selectedInvoice);
                    if (onPreviewClick) {
                      setSelectedInvoice(invoice._id);
                      console.log('Setting selectedInvoice to:', invoice._id);
                      onPreviewClick(invoice);
                    }
                  }}
                >
                  <div className='relative mr-3'>
                    <Avatar className='h-8 w-8'>
                      <AvatarFallback className='bg-[#373737] text-[#9f9f9f] text-xs font-semibold capitalize'>
                        {invoice.client?.contact.firstName[0] || <IoPerson />}
                        {invoice.client?.contact.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <span className='font-semibold text-[#fafafa] text-[14px] truncate'>
                          {invoice.client?.user.name || 'Unnamed'}
                        </span>
                      </div>
                    </div>

                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <TooltipProvider delayDuration={0}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className='text-[#8C8C8C] text-sm truncate md:max-w-[300px]  max-w-[180px]  hover:text-white transition-colors'>
                                {invoice.items[0]?.description || 'No description'}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent className='w-80 p-4 bg-[#232323] border border-[#313131] shadow-lg'>
                              <div className='space-y-2'>
                                <h4 className='font-medium text-white mb-2'>Invoice Items</h4>
                                {invoice.items.map((item: any, index: number) => {
                                  return (
                                    <div key={index} className='flex items-start gap-2 text-sm'>
                                      <span className='text-[#8C8C8C] min-w-[20px]'>
                                        {index + 1}.
                                      </span>
                                      <div className='flex-1'>
                                        <p className='text-white'>{item.description}</p>
                                        <p className='text-[#8C8C8C] text-xs'>
                                          {item.quantity} ×{' '}
                                          {item.price.toLocaleString(undefined, {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                          })}{' '}
                                          {invoice.currency}
                                        </p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <span className='text-[#8C8C8C] text-sm'>
                          •{' '}
                          {invoice.total.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}{' '}
                          {invoice.currency}
                        </span>
                        <Badge
                          variant='secondary'
                          className={`${getStatusColor(invoice.status)} text-xs px-2 py-0.5`}
                        >
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className='flex items-center gap-2 ml-4'>
                    {invoice.starred && (
                      <Button
                        variant='ghost'
                        size='icon'
                        className='text-[#f5a623] hover:text-white'
                        onClick={(e) => {
                          e.stopPropagation();
                          starMutation.mutate(invoice._id);
                        }}
                        disabled={starMutation.isPending}
                      >
                        {starMutation.isPending ? (
                          <div className='w-4 h-4 border-2 border-[#8b8b8b] border-t-transparent rounded-full animate-spin' />
                        ) : (
                          <BsStarFill size={14} />
                        )}
                      </Button>
                    )}
                    <div className='text-xs text-[#8C8C8C] ml-0 whitespace-nowrap'>
                      {(() => {
                        const date = new Date(invoice.createdAt);
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
            })
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

const labelColors = [
  '#fff', // white
  '#f44336', // red
  '#ff9800', // orange
  '#ffc107', // yellow
  '#4caf50', // green
  '#2196f3', // blue
  '#9c27b0', // purple
  '#e91e63', // pink
];

interface Note {
  _id: string;
  text: string;
  label: string;
  createdAt: string;
  invoice: string;
  createdBy: {
    _id: string;
    name: string;
  };
}
