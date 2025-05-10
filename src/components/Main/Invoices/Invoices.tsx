import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useSidebar } from '@/components/ui/sidebar';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { FaBell, FaBolt } from 'react-icons/fa';
import { FiRefreshCw, FiSearch, FiSidebar } from 'react-icons/fi';
import { IoPerson } from 'react-icons/io5';

interface InvoicesProps {
  invoices: any[];
  onPreviewClick?: () => void;
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

export default function Invoices({ invoices, onPreviewClick }: InvoicesProps) {
  const { toggleSidebar } = useSidebar();

  return (
    <div className='bg-background h-full flex flex-col'>
      <div className='sticky top-0 bg-background z-10'>
        <div className='flex justify-between items-center px-4 py-2'>
          <Button variant='ghost' size='icon' onClick={toggleSidebar}>
            <FiSidebar className='text-[#8C8C8C] ' />
          </Button>
          <Button variant='ghost' size='icon'>
            <FiRefreshCw className='text-[#8C8C8C]' size={16} />
          </Button>
        </div>
        <Separator className='bg-[#232428] mb-3' />
        <div className='px-4 mb-3'>
          <div className='relative'>
            <FiSearch
              className='absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8C8C8C]'
              size={16}
            />
            <Input
              type='text'
              placeholder='Search...'
              className='w-full pl-9 bg-[#141414] border-[#232428] text-[#fafafa] placeholder:text-[#8C8C8C] focus-visible:ring-1 focus-visible:ring-[#8C8C8C]'
            />
          </div>
        </div>
      </div>
      <div className='flex-1 overflow-y-auto px-1 scrollbar-hide'>
        {invoices?.map((invoice) => {
          return (
            <div
              key={invoice._id}
              className='group relative flex items-center px-3 py-2 my-2 rounded-lg hover:bg-[#232428] transition-colors cursor-pointer'
              onClick={onPreviewClick}
            >
              <div className='absolute right-2 z-[25] flex -translate-y-1/2 items-center gap-1 rounded-xl border bg-white p-1 shadow-sm dark:bg-[#1A1A1A] top-[-1] opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className='inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-6 w-6 overflow-visible [&_svg]:size-3.5'
                  data-state='closed'
                >
                  <svg
                    className='h-4 w-4 fill-transparent stroke-[#9D9D9D] dark:stroke-[#9D9D9D]'
                    width='16'
                    height='16'
                    viewBox='0 0 16 16'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path
                      fillRule='evenodd'
                      clipRule='evenodd'
                      d='M7.99934 1.75C8.30229 1.75 8.57549 1.93226 8.69183 2.21198L10.1029 5.60466L13.7656 5.8983C14.0676 5.92251 14.3254 6.12601 14.419 6.41413C14.5126 6.70226 14.4237 7.01841 14.1936 7.21549L11.403 9.60592L12.2556 13.1801C12.3259 13.4748 12.212 13.7828 11.9669 13.9609C11.7218 14.1389 11.3936 14.1521 11.1351 13.9942L7.99934 12.0788L4.86357 13.9942C4.60503 14.1521 4.27688 14.1389 4.03179 13.9609C3.7867 13.7828 3.6728 13.4748 3.7431 13.1801L4.59566 9.60592L1.80508 7.21549C1.57501 7.01841 1.48609 6.70226 1.57971 6.41413C1.67333 6.12601 1.93109 5.92251 2.23307 5.8983L5.89575 5.60466L7.30685 2.21198C7.42319 1.93226 7.69639 1.75 7.99934 1.75Z'
                    ></path>
                  </svg>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className='inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-6 w-6 [&_svg]:size-3.5'
                  data-state='closed'
                >
                  <svg
                    className='fill-[#9D9D9D]'
                    width='16'
                    height='16'
                    viewBox='0 0 16 16'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path d='M3 2C2.44772 2 2 2.44772 2 3V4C2 4.55228 2.44772 5 3 5H13C13.5523 5 14 4.55228 14 4V3C14 2.44772 13.5523 2 13 2H3Z'></path>
                    <path
                      fillRule='evenodd'
                      clipRule='evenodd'
                      d='M3 6H13V12C13 13.1046 12.1046 14 11 14H5C3.89543 14 3 13.1046 3 12V6ZM6 8.75C6 8.33579 6.33579 8 6.75 8H9.25C9.66421 8 10 8.33579 10 8.75C10 9.16421 9.66421 9.5 9.25 9.5H6.75C6.33579 9.5 6 9.16421 6 8.75Z'
                    ></path>
                  </svg>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className='inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 hover:text-accent-foreground h-6 w-6 hover:bg-[#FDE4E9] dark:hover:bg-[#411D23] [&_svg]:size-3.5'
                  data-state='closed'
                >
                  <svg
                    className='fill-[#F43F5E]'
                    width='16'
                    height='16'
                    viewBox='0 0 16 16'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path
                      fillRule='evenodd'
                      clipRule='evenodd'
                      d='M5 3.25V4H2.75C2.33579 4 2 4.33579 2 4.75C2 5.16421 2.33579 5.5 2.75 5.5H3.05L3.86493 13.6493C3.94161 14.4161 4.58685 15 5.35748 15H10.6425C11.4131 15 12.0584 14.4161 12.1351 13.6493L12.95 5.5H13.25C13.6642 5.5 14 5.16421 14 4.75C14 4.33579 13.6642 4 13.25 4H11V3.25C11 2.00736 9.99264 1 8.75 1H7.25C6.00736 1 5 2.00736 5 3.25ZM7.25 2.5C6.83579 2.5 6.5 2.83579 6.5 3.25V4H9.5V3.25C9.5 2.83579 9.16421 2.5 8.75 2.5H7.25ZM6.05044 6.00094C6.46413 5.98025 6.81627 6.29885 6.83696 6.71255L7.11195 12.2125C7.13264 12.6262 6.81404 12.9784 6.40034 12.9991C5.98665 13.0197 5.63451 12.7011 5.61383 12.2875L5.33883 6.78745C5.31814 6.37376 5.63674 6.02162 6.05044 6.00094ZM9.95034 6.00094C10.364 6.02162 10.6826 6.37376 10.662 6.78745L10.387 12.2875C10.3663 12.7011 10.0141 13.0197 9.60044 12.9991C9.18674 12.9784 8.86814 12.6262 8.88883 12.2125L9.16383 6.71255C9.18451 6.29885 9.53665 5.98025 9.95034 6.00094Z'
                    ></path>
                  </svg>
                </motion.button>
              </div>
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
                  <span className='text-xs text-[#8C8C8C] ml-2 whitespace-nowrap'>
                    {format(new Date(invoice.createdAt), 'h:mm a')}
                  </span>
                </div>

                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <span className='text-[#8C8C8C] text-sm truncate max-w-[300px]'>
                      {invoice.items[0]?.description || 'No description'}
                    </span>
                    <span className='text-[#8C8C8C] text-sm'>
                      • {invoice.total.toFixed(2)} {invoice.currency}
                    </span>
                    <Badge
                      variant='secondary'
                      className={`${getStatusColor(invoice.status)} text-xs px-2 py-0.5`}
                    >
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </Badge>
                  </div>
                  <div className='flex items-center gap-2 ml-2'>
                    <FaBolt className='text-[#eea01a]' />
                    <FaBell className='text-[#8b5df8]' />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
