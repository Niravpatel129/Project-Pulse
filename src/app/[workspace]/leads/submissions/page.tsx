'use client';

import SubmissionsTable from '@/app/[workspace]/leads/components/SubmissionsTable';
import { Badge } from '@/components/ui/badge';
import { newRequest } from '@/utils/newRequest';
import { useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SubmissionsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const formId = searchParams.get('form');

  // Fetch form details if we have a form filter
  const { data: formData } = useQuery({
    queryKey: ['form', formId],
    queryFn: async () => {
      if (!formId) return null;
      const res = await newRequest.get(`/lead-forms/${formId}`);
      return res.data;
    },
    enabled: !!formId,
  });

  // Function to clear the form filter
  const clearFormFilter = () => {
    router.push('./submissions');
  };

  return (
    <div className='container mx-auto px-4 py-6'>
      {/* Filter badges */}
      {formId && (
        <div className='mb-4 flex gap-2 items-center'>
          <span className='text-sm text-muted-foreground'>Filters:</span>
          <Badge variant='secondary' className='flex items-center gap-1 px-3 py-1'>
            Form: {formData?.title || 'Loading...'}
            <button
              onClick={clearFormFilter}
              className='ml-1 rounded-full hover:bg-muted p-0.5'
              aria-label='Clear form filter'
            >
              <X className='h-3 w-3' />
            </button>
          </Badge>
        </div>
      )}

      <SubmissionsTable formIdFilter={formId} />
    </div>
  );
}
