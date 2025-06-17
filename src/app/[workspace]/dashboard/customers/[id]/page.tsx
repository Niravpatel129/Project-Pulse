'use client';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { newRequest } from '@/utils/newRequest';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { FiSidebar } from 'react-icons/fi';

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
      <div className='flex items-center justify-between px-4 pb-2 pt-3 border-b border-[#E4E4E7] dark:border-[#232428] bg-background'>
        <div className='flex items-center gap-2'>
          <Button variant='ghost' size='icon' onClick={toggleSidebar}>
            <FiSidebar size={20} className='text-muted-foreground' />
          </Button>
          <h1 className='text-lg font-semibold'>{customer?.user.name || 'Customer'}</h1>
        </div>
      </div>

      <div className='p-4'>
        <div className='rounded-lg border bg-card h-[250px] overflow-hidden'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Preview</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {FAKE_EMAILS.map((email) => {
                return (
                  <TableRow key={email.id}>
                    <TableCell className='font-medium'>{email.subject}</TableCell>
                    <TableCell>{formatDate(email.date)}</TableCell>
                    <TableCell>{email.status}</TableCell>
                    <TableCell className='text-muted-foreground truncate max-w-[400px]'>
                      {email.snippet}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailsPage;
