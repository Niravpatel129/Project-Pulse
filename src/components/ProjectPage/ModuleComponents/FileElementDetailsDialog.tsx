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
import { useState } from 'react';
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
  const [isStorageInfoOpen, setIsStorageInfoOpen] = useState(false);

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
      <DialogContent className='max-w-4xl' aria-describedby='file-element-description'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <FileText className='h-5 w-5' />
            {element.name}
          </DialogTitle>
          {element.description && (
            <p className='text-sm text-gray-500 mt-2' id='file-element-description'>
              {element.description}
            </p>
          )}
        </DialogHeader>

        <div className='grid grid-cols-2 gap-4 py-4'>
          <div className='space-y-1'>
            <p className='text-sm font-medium text-gray-500'>Element Type</p>
            <p className='capitalize'>{element.elementType}</p>
          </div>
          <div className='space-y-1'>
            <p className='text-sm font-medium text-gray-500'>Created</p>
            <p>{element.createdAt ? format(new Date(element.createdAt), 'PPP') : 'Unknown'}</p>
          </div>
          <div className='space-y-1'>
            <p className='text-sm font-medium text-gray-500'>Element ID</p>
            <p className='text-xs font-mono'>{element._id}</p>
          </div>
          <div className='space-y-1'>
            <p className='text-sm font-medium text-gray-500'>Module ID</p>
            <p className='text-xs font-mono'>{element.moduleId}</p>
          </div>
          <div className='space-y-1 col-span-2'>
            <p className='text-sm font-medium text-gray-500'>Added By</p>
            <div className='flex items-center gap-2'>
              <p>{element.addedBy?.name || 'Unknown'}</p>
              {element.addedBy?.email && (
                <p className='text-sm text-gray-500'>({element.addedBy.email})</p>
              )}
            </div>
          </div>
          {element.uploadedAt && (
            <div className='space-y-1'>
              <p className='text-sm font-medium text-gray-500'>Uploaded</p>
              <p>{format(new Date(element.uploadedAt), 'PPP')}</p>
            </div>
          )}
        </div>

        <div className='mt-3'>
          <h3 className='text-lg font-medium mb-3'>Files ({element.files.length})</h3>
          {element.files.length > 0 ? (
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
                  const fileType = file.mimeType?.split('/')[0] || 'document';
                  const fileName = file.originalName || `File ${index + 1}`;

                  return (
                    <TableRow key={index}>
                      <TableCell>
                        {fileType === 'image' ? (
                          <ImageIcon className='h-4 w-4 text-gray-500' />
                        ) : (
                          <FileText className='h-4 w-4 text-gray-500' />
                        )}
                      </TableCell>
                      <TableCell className='font-medium'>
                        {fileType === 'image' ? (
                          <div className='flex items-center gap-2'>
                            <span>{fileName}</span>
                            <Image
                              src={file.url}
                              alt={fileName}
                              width={32}
                              height={32}
                              className='h-8 w-8 rounded object-cover'
                            />
                          </div>
                        ) : (
                          fileName
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant='secondary' className='capitalize'>
                          {fileType}
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
                            return handleDownload(file.url, fileName);
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
          ) : (
            <div className='text-center py-8 border rounded-md bg-gray-50'>
              <p className='text-gray-500'>No files available</p>
            </div>
          )}
        </div>

        <div className='flex justify-end gap-2 mt-4'>
          <Button variant='outline' onClick={onClose}>
            Close
          </Button>
          <Button
            variant='default'
            onClick={() => {
              if (element.files.length > 0) {
                handleDownload(element.files[0].url, element.files[0].originalName || 'file');
              }
            }}
            disabled={element.files.length === 0}
          >
            <Download className='h-4 w-4 mr-2' />
            Download
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
