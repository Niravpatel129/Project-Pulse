import { Skeleton } from '@/components/ui/skeleton';

export const InvoiceSkeleton = () => {
  return (
    <div className='space-y-4'>
      <div className='flex justify-between items-center'>
        <Skeleton className='h-8 w-32' />
        <Skeleton className='h-10 w-40' />
      </div>
      <div className='space-y-2'>
        {Array.from({ length: 5 }).map((_, i) => {
          return (
            <div key={i} className='flex items-center space-x-4 p-4 border rounded-lg'>
              <Skeleton className='h-12 w-12 rounded-full' />
              <div className='space-y-2 flex-1'>
                <Skeleton className='h-4 w-3/4' />
                <Skeleton className='h-4 w-1/2' />
              </div>
              <Skeleton className='h-8 w-24' />
            </div>
          );
        })}
      </div>
    </div>
  );
};
