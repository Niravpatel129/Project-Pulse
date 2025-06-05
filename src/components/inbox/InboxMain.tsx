import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface InboxMainProps {
  selectedThreadId?: string;
}

export default function InboxMain({ selectedThreadId }: InboxMainProps) {
  const renderThread = () => {
    return (
      <div className='border border-slate-100 dark:border-[#232428] rounded-lg'>
        <div className='flex items-center gap-4 p-4 justify-between w-full'>
          {/* Avatar  */}
          <div className='flex items-start gap-4 mt-2 mb-4 w-full'>
            <Avatar className='h-8 w-8'>
              <AvatarFallback className='bg-[#656973] text-white dark:text-white dark:bg-[#656973] text-xs'>
                HH
              </AvatarFallback>
            </Avatar>
            <div className='flex-1'>
              <div className='flex justify-between items-start'>
                <div>
                  <div className='font-medium text-sm text-[#121212] dark:text-white leading-tight'>
                    Heather Hahnenberg{' '}
                    <span className='text-muted-foreground text-sm'>&lt;someone@email.com&gt;</span>
                  </div>

                  <div className='text-sm text-muted-foreground'>To: Nirav Patel</div>
                  <div className='text-sm text-muted-foreground'>Subject: Random Subject</div>
                </div>
                <div className='text-sm text-muted-foreground'>1 week ago</div>
              </div>
            </div>
          </div>
        </div>
        <div className='border-t border-slate-100 dark:border-[#232428] h-[1px]' />
        <div className='p-4 min-h-[100px]'>
          <div className='text-sm mt-2 '>
            hi. iam not sure cause iam working . but i call you afternoon around 3.30 to see if you
            are in the store
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className='p-4'>
      <h2 className='text-xl font-bold mb-2'>
        Heroku app &quot;toastify&quot; log data transfer notification
      </h2>

      <div className='flex flex-col gap-4'>
        {renderThread()}
        {renderThread()}
      </div>
    </div>
  );
}
