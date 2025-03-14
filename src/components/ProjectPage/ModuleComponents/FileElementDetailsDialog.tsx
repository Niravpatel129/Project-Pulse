import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import {
  Download,
  Edit,
  FileText,
  History,
  Image as ImageIcon,
  MoreVertical,
  RotateCcw,
} from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { FileElementModal } from './FileElementModal';
import { Element } from './types';
interface FileElementDetailsDialogProps {
  element?: Element;
  isOpen: boolean;
  onClose: () => void;
}

export function FileElementDetailsDialog({
  element,
  isOpen,
  onClose,
}: FileElementDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState('files');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Version history data
  const versionHistory = [
    {
      version: 'v1.3',
      changeId: '8f7e6d5c4b3a2',
      message: 'Updated file content and metadata',
      author: 'Jane Smith',
      date: new Date(2023, 11, 15, 14, 30),
      changes: '+24 -12',
    },
    {
      version: 'v1.2',
      changeId: '1a2b3c4d5e6f7',
      message: 'Fixed formatting issues',
      author: 'John Doe',
      date: new Date(2023, 11, 10, 9, 45),
      changes: '+5 -8',
    },
    {
      version: 'v1.1',
      changeId: '7g6f5e4d3c2b',
      message: 'Added additional content',
      author: 'Jane Smith',
      date: new Date(2023, 11, 5, 16, 20),
      changes: '+45 -2',
    },
    {
      version: 'v1.0',
      changeId: '0z9y8x7w6v5u',
      message: 'Initial upload',
      author: 'John Doe',
      date: new Date(2023, 11, 1, 10, 0),
      changes: '+120 -0',
    },
  ];

  const handleDownload = (url: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEditElement = () => {
    setIsEditModalOpen(true);
  };

  const handleEditComplete = (updatedElement: Element) => {
    // In a real app, you would update the element in the database
    // and then update the local state
    console.log('Element updated:', updatedElement);
    setIsEditModalOpen(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose} key={'element-details-dialog'}>
        <DialogContent className='max-w-4xl' aria-describedby='file-element-description'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <FileText className='h-5 w-5' />
              {element?.name}
            </DialogTitle>
            {element?.description && (
              <p className='text-sm text-gray-500 mt-2' id='file-element-description'>
                {element?.description}
              </p>
            )}
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
            <TabsList className='mb-4'>
              <TabsTrigger value='files'>Files</TabsTrigger>
              <TabsTrigger value='history'>Version History</TabsTrigger>
            </TabsList>

            <TabsContent value='files'>
              <div className='grid grid-cols-2 gap-4 py-4'>
                <div className='space-y-1'>
                  <p className='text-sm font-medium text-gray-500'>Element Type </p>
                  <p className='capitalize'>{element?.elementType}</p>
                </div>
                <div className='space-y-1'>
                  <p className='text-sm font-medium text-gray-500'>Created</p>
                  <p>
                    {element?.createdAt ? format(new Date(element?.createdAt), 'PPP') : 'Unknown'}
                  </p>
                </div>
                <div className='space-y-1'>
                  <p className='text-sm font-medium text-gray-500'>Element ID</p>
                  <p className='text-xs font-mono'>{element?._id}</p>
                </div>
                <div className='space-y-1'>
                  <p className='text-sm font-medium text-gray-500'>Module ID</p>
                  <p className='text-xs font-mono'>{element?.moduleId}</p>
                </div>
                <div className='space-y-1 col-span-2'>
                  <p className='text-sm font-medium text-gray-500'>Added By</p>
                  <div className='flex items-center gap-2'>
                    <p>{element?.addedBy?.name || 'Unknown'}</p>
                    {element?.addedBy?.email && (
                      <p className='text-sm text-gray-500'>({element?.addedBy?.email})</p>
                    )}
                  </div>
                </div>
                {element?.uploadedAt && (
                  <div className='space-y-1'>
                    <p className='text-sm font-medium text-gray-500'>Uploaded</p>
                    <p>{format(new Date(element?.uploadedAt), 'PPP')}</p>
                  </div>
                )}
                <div className='space-y-1'>
                  <p className='text-sm font-medium text-gray-500'>Latest Version</p>
                  <div className='flex items-center gap-2'>
                    <History className='h-4 w-4 text-gray-500' />
                    <p>v1.3</p>
                    <Badge variant='outline' className='ml-2'>
                      current
                    </Badge>
                  </div>
                </div>
                <div className='space-y-1'>
                  <p className='text-sm font-medium text-gray-500'>Last Change</p>
                  <div className='flex items-center gap-2'>
                    <p className='text-xs'>Updated file content and metadata</p>
                  </div>
                </div>
              </div>

              <div className='mt-3'>
                <h3 className='text-lg font-medium mb-3'>Files ({element?.files?.length})</h3>
                {element?.files?.length > 0 ? (
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
                      {element?.files?.map((file, index) => {
                        const fileType = file?.mimeType?.split('/')[0] || 'document';
                        const fileName = file?.originalName || `File ${index + 1}`;

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
            </TabsContent>

            <TabsContent value='history'>
              <div className='mt-3'>
                <h3 className='text-lg font-medium mb-3'>Version History</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='w-[80px]'>Version</TableHead>
                      <TableHead className='w-[120px]'>Change ID</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Changes</TableHead>
                      <TableHead className='w-[100px]'>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {versionHistory.map((version, index) => {
                      return (
                        <TableRow key={index}>
                          <TableCell className='font-medium'>{version.version}</TableCell>
                          <TableCell className='font-mono text-xs'>
                            {version.changeId.substring(0, 7)}
                          </TableCell>
                          <TableCell>{version.message}</TableCell>
                          <TableCell>{version.author}</TableCell>
                          <TableCell>{format(version.date, 'MMM d, h:mm a')}</TableCell>
                          <TableCell className='font-mono text-xs'>
                            <span className='text-green-600'>{version.changes.split(' ')[0]}</span>{' '}
                            <span className='text-red-600'>{version.changes.split(' ')[1]}</span>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant='ghost' size='sm'>
                                  <MoreVertical className='h-4 w-4' />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align='end'>
                                <DropdownMenuItem>View this version</DropdownMenuItem>
                                <DropdownMenuItem>
                                  <RotateCcw className='h-4 w-4 mr-2' />
                                  Restore this version
                                </DropdownMenuItem>
                                <DropdownMenuItem>Download</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>

          <div className='flex justify-end gap-2 mt-4'>
            <Button variant='outline' onClick={onClose}>
              Close
            </Button>
            <Button variant='outline' onClick={handleEditElement}>
              <Edit className='h-4 w-4 mr-2' />
              Edit
            </Button>
            <Button
              variant='default'
              onClick={() => {
                if (element?.files?.length > 0) {
                  handleDownload(element?.files[0]?.url, element?.files[0]?.originalName || 'file');
                }
              }}
              disabled={element?.files?.length === 0}
            >
              <Download className='h-4 w-4 mr-2' />
              Download
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {isEditModalOpen && (
        <FileElementModal
          isOpen={isEditModalOpen}
          onClose={() => {
            return setIsEditModalOpen(false);
          }}
          onSave={handleEditComplete}
          initialData={element as any}
          isEditing={true}
        />
      )}
    </>
  );
}
