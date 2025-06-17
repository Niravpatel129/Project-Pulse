'use client';
import NewTable from '@/components/NewTable/NewTable';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';
import { newRequest } from '@/utils/newRequest';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { FiSidebar } from 'react-icons/fi';
import { TbLabelImportantFilled, TbMail } from 'react-icons/tb';

// Fake email data
const FAKE_EMAILS = [
  {
    id: '1',
    subject: 'Welcome to our platform',
    date: '2024-03-20',
    status: 'Sent',
    snippet: 'Thank you for joining our platform. We are excited to have you...',
  },
  {
    id: '2',
    subject: 'Your recent order #123',
    date: '2024-03-18',
    status: 'Received',
    snippet: 'We have received your order and are processing it...',
  },
  {
    id: '3',
    subject: 'Invoice for March 2024',
    date: '2024-03-15',
    status: 'Sent',
    snippet: 'Please find attached your invoice for services rendered...',
  },
  {
    id: '4',
    subject: 'Product update notification',
    date: '2024-03-10',
    status: 'Sent',
    snippet: 'We have made some exciting updates to our products...',
  },
];

const CustomerDetailsPage = () => {
  const { toggleSidebar } = useSidebar();

  const { id } = useParams();

  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
      const res = await newRequest.get(`/clients/${id}`);
      return res.data.data;
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  console.log('🚀 customer:', customer);
  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {/* Header */}
      <div className='flex items-center justify-between px-4 pb-2 pt-3 border-b border-[#E4E4E7] dark:border-[#232428] bg-background'>
        <div className='flex items-center gap-2'>
          <Button variant='ghost' size='icon' onClick={toggleSidebar}>
            <FiSidebar size={20} className='text-muted-foreground' />
          </Button>
          <h1 className='text-lg font-semibold'>{customer?.user.name || 'Customer'}</h1>
        </div>
      </div>
      {/* Content */}
      <div className='flex flex-col gap-4 p-3'>
        <div className='p-4'>
          <h2 className='text-lg font-bold mb-2 flex items-center gap-2'>
            <TbMail /> Customer Emails
          </h2>
          <div className=' overflow-hidden'>
            <NewTable />
          </div>
        </div>
        <div className='p-4'>
          <h2 className='text-lg font-bold mb-2 flex items-center gap-2'>
            <TbLabelImportantFilled /> Customer Invoices
          </h2>
          <div className=' overflow-hidden'>
            <NewTable />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailsPage;
