import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ExternalLink, File } from 'lucide-react';
import { useState } from 'react';
import { Attachment } from './AttachmentCellEditor';

interface ViewAttachmentsButtonProps {
  attachments: Attachment[];
}

export function ViewAttachmentsButton({ attachments }: ViewAttachmentsButtonProps) {
  const [open, setOpen] = useState(false);

  // Format file size for display if available
  const formatSize = (size?: string) => {
    if (!size) return '';
    return `(${size})`;
  };

  return (
    <>
      <Button
        variant='ghost'
        size='sm'
        className='text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1 h-auto text-xs'
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
      >
        View {attachments.length > 1 ? `(${attachments.length})` : ''}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='sm:max-w-[500px]'>
          <DialogHeader>
            <DialogTitle>Attachments</DialogTitle>
          </DialogHeader>

          <div className='py-4'>
            <div className='max-h-[60vh] overflow-y-auto space-y-2'>
              {attachments.map((attachment, index) => {
                return (
                  <div
                    key={attachment.id || index}
                    className='flex items-center justify-between p-3 rounded border bg-gray-50'
                  >
                    <div className='flex items-center gap-2'>
                      <File className='h-5 w-5 text-blue-500' />
                      <div>
                        <p className='text-sm font-medium'>{attachment.name}</p>
                        {attachment.size && (
                          <p className='text-xs text-gray-500'>{attachment.size}</p>
                        )}
                      </div>
                    </div>

                    <a
                      href={attachment.url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-blue-500 hover:text-blue-700'
                      onClick={(e) => {
                        return e.stopPropagation();
                      }}
                    >
                      <ExternalLink className='h-4 w-4' />
                    </a>
                  </div>
                );
              })}
            </div>
          </div>

          <div className='flex justify-end'>
            <DialogClose asChild>
              <Button variant='outline'>Close</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
