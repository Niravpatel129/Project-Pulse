import { useState } from 'react';
import { Button } from '../../ui/button';

interface InvoiceSheetFooterProps {
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    price: string;
  }>;
  onValidate: () => boolean;
  onCreate: () => void;
  isEditing?: boolean;
}

const InvoiceSheetFooter = ({
  items,
  onValidate,
  onCreate,
  isEditing,
}: InvoiceSheetFooterProps) => {
  const [editedTime] = useState('just now');

  const handleCreate = () => {
    if (!onValidate()) {
      return;
    }
    onCreate();
  };

  return (
    <div className='sticky bottom-0 left-0 right-0 bg-background pb-3 pr-4 flex items-center justify-end z-10 px-0'>
      <Button
        className='w-[100px] h-10 text-[12px] font-medium rounded-none bg-[#18181b] hover:bg-[#232326] dark:bg-[#fff] dark:hover:bg-[#f1f1f1] dark:text-[#18181b]'
        onClick={handleCreate}
      >
        {isEditing ? 'Update' : 'Create'}
      </Button>
    </div>
  );
};

export default InvoiceSheetFooter;
