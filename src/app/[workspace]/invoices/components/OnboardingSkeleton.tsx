import { Skeleton } from '@/components/ui/skeleton';

export const OnboardingSkeleton = () => {
  return (
    <div className='flex justify-center items-center relative z-10'>
      <div className='flex flex-col justify-center p-6 max-w-2xl text-center mt-[50px]'>
        <div className='relative mb-4'>
          <div className='absolute inset-0 bg-gradient-to-r from-green-100 to-blue-100 rounded-full opacity-30 blur-md'></div>
          <div className='relative flex items-center justify-center'>
            <Skeleton className='h-16 w-16 rounded-full' />
          </div>
        </div>
        <div className='mx-auto'>
          <Skeleton className='h-8 w-64 mx-auto mb-6' />
          <Skeleton className='h-4 w-3/4 mx-auto mb-8' />
          <Skeleton className='h-4 w-1/2 mx-auto mb-8' />
          <div className='mb-8 flex justify-center'>
            <Skeleton className='h-10 w-48' />
          </div>
        </div>
      </div>
    </div>
  );
};
