import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface InboxMainProps {
  selectedThreadId?: string;
}

export default function InboxMain({ selectedThreadId }: InboxMainProps) {
  return (
    <div className='p-4'>
      <h2 className='text-xl font-bold'>
        Heroku app &quot;toastify&quot; log data transfer notification
      </h2>
      <div className='border border-slate-100 dark:border-[#232428] rounded-lg p-4'>
        {/* Avatar  */}
        <div className='flex items-start gap-4 mt-2 mb-4'>
          <Avatar className='h-8 w-8'>
            <AvatarFallback className='bg-gray-200 text-gray-600 text-xs'>HH</AvatarFallback>
          </Avatar>
          <div>
            <div className='font-medium text-sm text-[#121212] dark:text-white leading-tight'>
              Heather Hahnenberg (LinkedIn Supplier)
            </div>
            <div className='text-sm text-muted-foreground'>&lt;hhahnenberg@linkedin.com&gt;</div>
            <div className='text-sm text-muted-foreground'>To: Nirav Patel</div>
            <div className='text-sm mt-2'>
              <span className='font-medium'>Subject:</span> [YOU&apos;RE INVITED!] LinkedIn
              Marketing Targeting Webinar - Smarter Targeting, Stronger Results
            </div>
            <div className='text-sm text-muted-foreground mt-1'>1 week ago</div>
          </div>
        </div>
      </div>
    </div>
  );
}
