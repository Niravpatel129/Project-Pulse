import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { Download, FileText, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { FileElement } from './types';

interface FileElementDetailsDialogProps {
  element: FileElement;
  isOpen: boolean;
  onClose: () => void;
}

export function FileElementDetailsDialog({
  element,
  isOpen,
  onClose,
}: FileElementDetailsDialogProps) {
  const handleDownload = (url: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-3xl'>
        <DialogHeader>
          <DialogTitle>{element.name}</DialogTitle>
          {element.description && (
            <p className='text-sm text-gray-500 mt-2'>{element.description}</p>
          )}
        </DialogHeader>

        <div className='mt-6'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-[50px]'></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead className='w-[100px]'></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {element.files.map((file, index) => {
                return (
                  <TableRow key={index}>
                    <TableCell>
                      {file.type === 'image' ? (
                        <ImageIcon className='h-4 w-4 text-gray-500' />
                      ) : (
                        <FileText className='h-4 w-4 text-gray-500' />
                      )}
                    </TableCell>
                    <TableCell className='font-medium'>
                      {file.type === 'image' ? (
                        <div className='flex items-center gap-2'>
                          <span>{file.name}</span>
                          <Image
                            src={file.url}
                            alt={file.name}
                            className='h-8 w-8 rounded object-cover'
                          />
                        </div>
                      ) : (
                        file.name
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant='secondary' className='capitalize'>
                        {file.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{(file.size / 1024 / 1024).toFixed(2)} MB</TableCell>
                    <TableCell>
                      {(() => {
                        try {
                          const date = new Date(file.uploadedAt);
                          if (isNaN(date.getTime())) {
                            return 'Invalid date';
                          }
                          return format(date, 'MMM d, h:mm a');
                        } catch (error) {
                          return 'Invalid date';
                        }
                      })()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='flex items-center gap-2'
                        onClick={() => {
                          return handleDownload(file.url, file.name);
                        }}
                      >
                        <Download className='h-4 w-4' />
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
