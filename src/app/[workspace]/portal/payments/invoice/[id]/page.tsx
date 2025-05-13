import { newRequest } from '@/utils/newRequest';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';

export default function InvoicePage() {
  const { id } = useParams();

  const { data: invoice } = useQuery({
    queryKey: ['invoice', id],
    queryFn: () => {
      return newRequest.get(`/invoices/${id}`);
    },
  });

  console.log('🚀 invoice:', invoice);

  return <div>Invoice {id}</div>;
}
