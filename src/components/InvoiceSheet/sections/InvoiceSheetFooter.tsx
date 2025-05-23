import { ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../ui/button';

const InvoiceSheetFooter = () => {
  const [editedTime] = useState('just now');

  return (
    <div className='sticky bottom-0 left-0 right-0 bg-background pt-6 flex items-center justify-between z-10 px-0'>
      <div className='flex items-center gap-2 text-muted-foreground text-[11px]'>
        <ExternalLink className='h-4 w-4 mr-1' />
        <span className='hover:underline cursor-pointer'>Preview invoice</span>
        <span className='mx-2'>-</span>
        <span className='text-[11px]'>Edited {editedTime}</span>
      </div>
      <Button className='w-[100px] h-10 text-[12px] font-medium rounded-none bg-[#18181b] hover:bg-[#232326]'>
        Create
      </Button>
    </div>
  );
};

export default InvoiceSheetFooter;
