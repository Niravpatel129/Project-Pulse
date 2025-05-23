import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';

const InvoiceSheet = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='fixed right-4 top-4 bottom-4 w-[400px] sm:w-[540px] p-6 border rounded-lg shadow-lg bg-background max-h-[calc(100vh-2rem)] overflow-y-auto'>
        <SheetHeader>
          <SheetTitle>Invoice</SheetTitle>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};

export default InvoiceSheet;
