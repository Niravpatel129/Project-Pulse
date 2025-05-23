import { useState } from 'react';
import { Button } from '../../ui/button';

const InvoiceSheetFooter = () => {
  const [editedTime] = useState('just now');

  return (
    <div className='sticky bottom-0 left-0 right-0 bg-background pt-6 flex items-center justify-end z-10 px-0'>
      <Button className='w-[100px] h-10 text-[12px] font-medium rounded-none bg-[#18181b] hover:bg-[#232326]'>
        Create
      </Button>
    </div>
  );
};

export default InvoiceSheetFooter;
