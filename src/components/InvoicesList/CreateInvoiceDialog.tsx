import ProjectManagement from '@/components/project/ProjectManagement';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';

interface CreateInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showButton?: boolean;
  buttonClassName?: string;
}

export default function CreateInvoiceDialog({
  open,
  onOpenChange,
  showButton = false,
  buttonClassName = 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 px-5 py-2.5 rounded-xl flex items-center gap-2.5 transition-all duration-200 shadow-sm hover:shadow',
}: CreateInvoiceDialogProps) {
  const queryClient = useQueryClient();

  const handleClose = () => {
    onOpenChange(false);
    queryClient.invalidateQueries({ queryKey: ['invoices'] });
  };

  const dialogContent = (
    <DialogContent className='max-w-[90vw] h-[90vh] p-0 overflow-hidden flex flex-col'>
      <DialogTitle className='sr-only'>Create New Invoice</DialogTitle>
      <div className='flex-1 min-h-0'>
        <ProjectManagement onClose={handleClose} initialStatus='draft' />
      </div>
    </DialogContent>
  );

  if (showButton) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
          <Button variant='outline' className={buttonClassName}>
            <Plus className='w-4 h-4' />
            Create an invoice
          </Button>
        </DialogTrigger>
        {dialogContent}
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {dialogContent}
    </Dialog>
  );
}
