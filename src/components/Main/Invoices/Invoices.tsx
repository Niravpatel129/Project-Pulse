import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useSidebar } from '@/components/ui/sidebar';
import { format } from 'date-fns';
import { FaBell, FaBolt } from 'react-icons/fa';
import { FiRefreshCw, FiSearch, FiSidebar } from 'react-icons/fi';

const mockInvoices = [
  {
    id: '1',
    clientName: 'John Smith',
    createdAt: '2024-03-15T22:24:00',
    status: 'paid',
    total: 1250.0,
    items: [{ description: 'Website Development - Homepage Design' }],
    unread: true,
    avatarUrl: null,
  },
  {
    id: '2',
    clientName: 'Sarah Johnson',
    createdAt: '2024-03-14T18:10:00',
    status: 'overdue',
    total: 850.5,
    items: [{ description: 'Mobile App Development - Phase 1' }],
    unread: false,
    avatarUrl: null,
  },
  {
    id: '3',
    clientName: 'Michael Brown',
    createdAt: '2024-03-13T09:30:00',
    status: 'pending',
    total: 2100.0,
    items: [{ description: 'E-commerce Platform Integration' }],
    unread: true,
    avatarUrl: null,
  },
  {
    id: '4',
    clientName: 'Emily Davis',
    createdAt: '2024-03-12T15:45:00',
    status: 'paid',
    total: 450.75,
    items: [{ description: 'SEO Optimization Package' }],
    unread: false,
    avatarUrl: null,
  },
];

export default function Invoices() {
  const { toggleSidebar } = useSidebar();

  return (
    <div className='bg-background '>
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
      <div className='px-1'>
        {mockInvoices.map((invoice) => {
          return (
            <div
              key={invoice.id}
              className='flex items-center px-3 py-2 my-2 rounded-lg hover:bg-[#232428] transition-colors cursor-pointer'
            >
              <div className='relative mr-3'>
                <Avatar className='h-8 w-8'>
                  {invoice.avatarUrl ? (
                    <AvatarImage src={invoice.avatarUrl} alt={invoice.clientName} />
                  ) : (
                    <AvatarFallback className='bg-[#373737] text-[#9f9f9f] text-xs font-semibold'>
                      {invoice.clientName
                        .split(' ')
                        .map((n) => {
                          return n[0];
                        })
                        .join('')}
                    </AvatarFallback>
                  )}
                </Avatar>
              </div>

              <div className='flex-1 min-w-0'>
                <div className='flex items-center justify-between'>
                  <span className='font-semibold text-[#fafafa] text-[14px] truncate'>
                    {invoice.clientName}
                  </span>
                  <span className='text-xs text-[#8C8C8C] ml-2 whitespace-nowrap'>
                    {format(new Date(invoice.createdAt), 'h:mm a')}
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-[#8C8C8C] text-sm truncate'>
                    {invoice.items[0]?.description || 'No description'}
                  </span>
                  <span className='flex items-center gap-2 ml-2'>
                    <FaBolt className='text-[#eea01a]' />
                    <FaBell className='text-[#8b5df8]' />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
