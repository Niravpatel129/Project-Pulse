import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SeamlessInput } from '@/components/ui/seamless-input';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface InvoiceHeaderProps {
  dateFormat?: string;
}

export default function InvoiceHeader({ dateFormat = 'MM/dd/yyyy' }: InvoiceHeaderProps) {
  const formatDate = (date: Date) => {
    // Convert from MM/DD/YYYY or DD/MM/YYYY to date-fns format
    const formatMap: Record<string, string> = {
      'MM/DD/YYYY': 'MM/dd/yyyy',
      'DD/MM/YYYY': 'dd/MM/yyyy',
    };
    return format(date, formatMap[dateFormat] || 'MM/dd/yyyy');
  };

  return (
    <div>
      <div className='flex justify-between mt-12'>
        <>
          <div>
            <div className='relative mb-1'>
              <SeamlessInput
                className='!text-[21px] font-medium'
                defaultValue='INV-0002'
                name='invoice_number'
              />
            </div>
            <div className='flex flex-col gap-0.5'>
              <div className=''>
                <div className='flex space-x-1 items-center'>
                  <div className='flex items-center flex-shrink-0'>
                    <span
                      className='text-xs text-[#878787] min-w-10 font-mono outline-none truncate'
                      id='template.invoice_no_label'
                    >
                      Invoice No
                    </span>
                    <span className='text-xs text-[#878787] font-mono flex-shrink-0'>:</span>
                  </div>
                  <div className='relative'>
                    <SeamlessInput
                      className='!text-[11px] !h-5'
                      defaultValue='INV-0002'
                      name='invoice_number'
                    />
                  </div>
                </div>
              </div>
              <div className='mb-[2px]'>
                <div className='flex space-x-1 items-center'>
                  <div className='flex items-center'>
                    <span
                      className='text-xs text-[#878787] min-w-10 font-mono outline-none'
                      id='template.issue_date_label'
                    >
                      Issue Date
                    </span>
                    <span className='text-xs text-[#878787] font-mono'>:</span>
                  </div>
                  <div className=''>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant='ghost'
                          className={cn(
                            'text-primary text-xs font-mono whitespace-nowrap flex h-auto p-0 hover:bg-transparent',
                          )}
                        >
                          <span className='flex overflow-hidden shadow-none focus:border-none active:border-none focus-visible:ring-0 focus-visible:ring-offset-0 border-0 p-0 !text-[11px] border-none bg-transparent'>
                            {formatDate(new Date('2025-05-23'))}
                          </span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className='w-auto p-0' align='start'>
                        <Calendar
                          mode='single'
                          selected={new Date('2025-05-23')}
                          onSelect={() => {}}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
              <div className=''>
                <div className='flex space-x-1 items-center'>
                  <div className='flex items-center'>
                    <span
                      className='text-xs text-[#878787] min-w-10 font-mono outline-none'
                      id='template.due_date_label'
                    >
                      Due Date
                    </span>
                    <span className='text-xs text-[#878787] font-mono'>:</span>
                  </div>
                  <Popover modal>
                    <PopoverTrigger asChild>
                      <Button
                        variant='ghost'
                        className={cn(
                          'text-primary text-xs font-mono whitespace-nowrap flex h-auto p-0 hover:bg-transparent',
                        )}
                      >
                        <span className='flex overflow-hidden shadow-none focus:border-none active:border-none focus-visible:ring-0 focus-visible:ring-offset-0 border-0 p-0 !text-[11px] border-none bg-transparent'>
                          {formatDate(new Date('2025-06-23'))}
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-auto p-0' align='start'>
                      <Calendar
                        mode='single'
                        selected={new Date('2025-06-23')}
                        onSelect={() => {}}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </div>
        </>
        <div className='relative group'>
          <label htmlFor='logo-upload' className='block h-full'>
            <div className='h-[80px] w-[80px] bg-[repeating-linear-gradient(-60deg,#DBDBDB,#DBDBDB_1px,transparent_1px,transparent_5px)] dark:bg-[repeating-linear-gradient(-60deg,#2C2C2C,#2C2C2C_1px,transparent_1px,transparent_5px)] hover:cursor-pointer' />
          </label>
          <input
            id='logo-upload'
            accept='image/jpeg,image/jpg,image/png'
            className='hidden'
            type='file'
          />
        </div>
      </div>
    </div>
  );
}
