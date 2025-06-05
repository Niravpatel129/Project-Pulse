import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

export default function EmailSkeleton() {
  return (
    <div className='border border-slate-100 dark:border-[#232428] rounded-lg mb-4'>
      <div className='flex items-center gap-4 p-4 justify-between w-full'>
        <div className='flex items-start gap-4 w-full'>
          <Avatar className='h-7 w-7'>
            <AvatarFallback className='bg-[#656973] text-white dark:text-white dark:bg-[#656973]'>
              <Skeleton className='h-4 w-4 rounded-full' />
            </AvatarFallback>
          </Avatar>
          <div className='flex-1'>
            <div className='flex justify-between items-start'>
              <div className='space-y-2'>
                <div className='flex items-center gap-2'>
                  <Skeleton className='h-4 w-32' />
                  <Skeleton className='h-4 w-48' />
                </div>
                <Skeleton className='h-4 w-64' />
                <Skeleton className='h-4 w-72' />
              </div>
              <div className='flex items-center gap-2'>
                <Skeleton className='h-4 w-24' />
                <Skeleton className='h-8 w-8 rounded-full' />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='border-t border-slate-100 dark:border-[#232428] h-[1px]' />
      <div className='p-4 space-y-3'>
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-4 w-3/4' />
        <Skeleton className='h-4 w-5/6' />
        <Skeleton className='h-4 w-2/3' />
      </div>
    </div>
  );
}
