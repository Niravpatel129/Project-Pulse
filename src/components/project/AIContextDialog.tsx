import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DocumentUpload } from './DocumentUpload';

interface AIContextDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AIContextDialog({ open, onOpenChange }: AIContextDialogProps) {
  const handleUploadSuccess = (response: any) => {
    // Handle successful upload
    console.log('Document uploaded successfully:', response);
  };

  const handleUploadError = (error: any) => {
    // Handle upload error
    console.error('Error uploading document:', error);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='bg-[#141414] border-[#232428] text-[#fafafa]'>
        <DialogHeader>
          <DialogTitle className='text-lg font-medium'>AI Context</DialogTitle>
        </DialogHeader>
        <ScrollArea className='h-[400px] pr-4'>
          <div className='space-y-4'>
            <DocumentUpload
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
            />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
