import { Skeleton } from '@/components/ui/skeleton';

export default function EmailSkeleton() {
  return (
    <div className='flex items-center px-4 py-3'>
      <div className='flex-1 min-w-0'>
        <div className='flex items-center gap-2 mb-2'>
          <Skeleton className='h-4 w-32' />
          <Skeleton className='h-4 w-16 ml-auto' />
        </div>
        <Skeleton className='h-4 w-48' />
      </div>
    </div>
  );
}
