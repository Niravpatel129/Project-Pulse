'use client';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';
import { newRequest } from '@/utils/newRequest';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { FiSidebar } from 'react-icons/fi';

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
    </div>
  );
};

export default CustomerDetailsPage;
