'use client';

import { formatDistanceToNow } from 'date-fns';
import { Download, File, Info, MoreVertical, Trash2, Upload } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { useFileUploadManager } from './useFileUploadManager';

function FileTypeIcon({ type, url }: { type: string; url?: string }) {
  // Check if the file is an image
  const isImage = type.startsWith('image/');

  if (isImage && url) {
    return (
      <div className='relative w-14 h-14'>
        <Image src={url} alt='File preview' fill className='object-contain rounded-sm' />
        <div className='absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] font-bold py-1 px-1 rounded-sm text-center'>
          {type.split('/')[1]?.toUpperCase() || 'IMG'}
        </div>
      </div>
    );
  }

  // Extract file extension from content type or name
  const fileType =
    type.split('/')[1]?.toUpperCase() || type.split('.').pop()?.toUpperCase() || 'UNKNOWN';

  const color =
    {
      PDF: 'bg-red-500',
      DOC: 'bg-blue-500',
      DOCX: 'bg-blue-500',
      IMG: 'bg-purple-500',
      PNG: 'bg-purple-500',
      JPG: 'bg-purple-500',
      JPEG: 'bg-purple-500',
      ZIP: 'bg-yellow-500',
      MP3: 'bg-green-500',
      MP4: 'bg-pink-500',
      XLSX: 'bg-emerald-500',
      PPTX: 'bg-orange-500',
      CODE: 'bg-slate-500',
      ICO: 'bg-purple-500',
    }[fileType] || 'bg-gray-500';

  return (
    <div className='relative'>
      <div className={`bg-slate-50 rounded-sm flex flex-col w-12 h-14`}>
        <div className='flex-1 px-2 pt-1'>
          <div className='w-full h-1 bg-red-400 rounded-sm mb-1'></div>
          <div className='w-full h-1 bg-red-400 rounded-sm mb-1'></div>
          <div className='w-full h-1 bg-red-400 rounded-sm mb-1'></div>
          <div className='w-2/3 h-1 bg-red-400 rounded-sm'></div>
        </div>
        <div
          className={`${color} text-white text-[10px] font-bold py-1 px-1 rounded-sm mt-auto text-center`}
        >
          .{fileType}
        </div>
      </div>
      <div className='absolute top-0 right-0 w-3 h-3 bg-slate-200 rounded-bl-md'></div>
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function FileUploadManagerModal({
  isOpen,
  onClose,
  handleAddFileToProject,
}: {
  isOpen: boolean;
  onClose: () => void;
  handleAddFileToProject;
}) {
  const {
    files,
    isUploading,
    selectedFile,
    showDetails,
    fileInputRef,
    handleRemoveFile,
    handleViewDetails,
    handleFileUpload,
    triggerFileUpload,
  } = useFileUploadManager();

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side='bottom'
        className='h-[90vh] max-h-[90vh] w-screen flex flex-col rounded-t-2xl'
      >
        <VisuallyHidden>
          <SheetTitle>My Storage</SheetTitle>
          <SheetDescription>Storage</SheetDescription>
        </VisuallyHidden>
        <div className='px-6 flex h-full'>
          <div className={`flex-1 flex flex-col ${showDetails ? 'pr-4' : ''}`}>
            <CardHeader className='flex flex-row items-center justify-between shrink-0 pb-0'>
              <CardTitle className='text-lg font-bold'>My Storage</CardTitle>
              <input
                type='file'
                ref={fileInputRef}
                onChange={handleFileUpload}
                className='hidden'
                multiple
              />
              <Button
                size='sm'
                className='gap-1 mb-2'
                variant='outline'
                onClick={triggerFileUpload}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <div className='h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className='h-4 w-4' />
                    Upload File
                  </>
                )}
              </Button>
            </CardHeader>

            {/* Recent Files */}
            {files.length > 0 && (
              <>
                <CardHeader className='pb-2 shrink-0'>
                  <div className='text-sm font-medium'>Recent Files</div>
                </CardHeader>
                <CardContent className='shrink-0'>
                  {files.length > 0 ? (
                    <div className='grid grid-cols-2 sm:grid-cols-3 gap-4'>
                      {files.slice(0, 4).map((file) => {
                        return (
                          <div
                            key={file._id}
                            className='flex flex-col items-center p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer'
                            onClick={() => {
                              return handleAddFileToProject(file);
                            }}
                          >
                            <FileTypeIcon type={file.contentType} url={file.downloadURL} />
                            <span className='mt-2 text-xs font-medium text-muted-foreground'>
                              {file.contentType.split('/')[1]?.toUpperCase() || 'UNKNOWN'}
                            </span>
                            <span className='mt-1 text-sm font-medium text-center truncate w-full'>
                              {file.originalName}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className='flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-muted/10'>
                      <File className='h-10 w-10 text-muted-foreground mb-2' />
                      <h3 className='text-sm font-medium'>No recent files</h3>
                      <p className='text-xs text-muted-foreground mt-1'>
                        Upload files to see them appear here
                      </p>
                    </div>
                  )}
                </CardContent>
              </>
            )}

            {/* All Files */}
            <CardHeader className='pb-2 shrink-0'>
              <CardTitle className='text-sm font-medium'>All Files</CardTitle>
            </CardHeader>
            <CardContent className='flex-1 overflow-auto'>
              {files.length > 0 ? (
                <Table>
                  <TableHeader className='sticky top-0 bg-background z-10'>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className='hidden sm:table-cell'>Type</TableHead>
                      <TableHead className='hidden md:table-cell'>Size</TableHead>
                      <TableHead className='hidden md:table-cell'>Modified</TableHead>
                      <TableHead className='w-[50px]'></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {files.map((file) => {
                      return (
                        <TableRow
                          key={file._id}
                          className='cursor-pointer'
                          onClick={() => {
                            return handleAddFileToProject(file);
                          }}
                        >
                          <TableCell>
                            <div className='flex items-center gap-2'>
                              <span className='font-medium'>{file.originalName}</span>
                            </div>
                          </TableCell>
                          <TableCell className='hidden sm:table-cell'>
                            {file.contentType.split('/')[1]?.toUpperCase() || 'UNKNOWN'}
                          </TableCell>
                          <TableCell className='hidden md:table-cell'>
                            {formatFileSize(file.size)}
                          </TableCell>
                          <TableCell className='hidden md:table-cell'>
                            {formatDistanceToNow(new Date(file.updatedAt), { addSuffix: true })}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant='ghost' size='icon'>
                                  <MoreVertical className='h-4 w-4' />
                                  <span className='sr-only'>Actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align='end'>
                                <DropdownMenuItem
                                  onClick={() => {
                                    return handleViewDetails(file);
                                  }}
                                >
                                  <Info className='h-4 w-4 mr-2' />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className='h-4 w-4 mr-2' />
                                  Download
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    return handleRemoveFile(file._id);
                                  }}
                                >
                                  <Trash2 className='h-4 w-4 mr-2' />
                                  Remove
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className='flex flex-col items-center justify-center h-full p-8 text-center'>
                  <div className='bg-muted/20 p-4 rounded-full mb-4'>
                    <File className='h-12 w-12 text-muted-foreground' />
                  </div>
                  <h3 className='text-lg font-medium mb-2'>No files uploaded yet</h3>
                  <p className='text-sm text-muted-foreground mb-4 max-w-md'>
                    Upload files to your storage to manage and organize them in one place.
                  </p>
                  <Button className='gap-2' onClick={triggerFileUpload}>
                    <Upload className='h-4 w-4' />
                    Upload Your First File
                  </Button>
                </div>
              )}
            </CardContent>
          </div>

          {/* File Details Sidebar */}
          {showDetails && selectedFile && (
            <div className='w-80 border-l pl-4 flex flex-col h-full'>
              <CardHeader className='pb-2'>
                <div className='flex gap-1 items-center'>
                  <CardTitle className='text-sm font-medium'>File Details</CardTitle>
                </div>
              </CardHeader>
              <CardContent className='flex-1'>
                <div className='flex flex-col items-center mb-6 pt-4'>
                  {selectedFile.contentType.startsWith('image/') ? (
                    <div className='relative w-full aspect-square max-w-[200px] mb-4'>
                      <Image
                        src={selectedFile.downloadURL}
                        alt={selectedFile.originalName}
                        fill
                        className='object-contain rounded-md'
                      />
                    </div>
                  ) : (
                    <FileTypeIcon type={selectedFile.contentType} url={selectedFile.downloadURL} />
                  )}
                  <h3 className='mt-4 font-medium text-center break-all'>
                    {selectedFile.originalName}
                  </h3>
                </div>

                <div className='space-y-4'>
                  <div>
                    <h4 className='text-xs font-medium text-muted-foreground mb-1'>Type</h4>
                    <p className='text-sm'>{selectedFile.contentType}</p>
                  </div>

                  <div>
                    <h4 className='text-xs font-medium text-muted-foreground mb-1'>Size</h4>
                    <p className='text-sm'>{formatFileSize(selectedFile.size)}</p>
                  </div>

                  <div>
                    <h4 className='text-xs font-medium text-muted-foreground mb-1'>Created</h4>
                    <p className='text-sm'>
                      {formatDistanceToNow(new Date(selectedFile.createdAt), { addSuffix: true })}
                    </p>
                  </div>

                  <div>
                    <h4 className='text-xs font-medium text-muted-foreground mb-1'>Modified</h4>
                    <p className='text-sm'>
                      {formatDistanceToNow(new Date(selectedFile.updatedAt), { addSuffix: true })}
                    </p>
                  </div>

                  <div>
                    <h4 className='text-xs font-medium text-muted-foreground mb-1'>Uploaded By</h4>
                    <p className='text-sm'>{selectedFile.uploadedBy.name}</p>
                  </div>

                  <div>
                    <h4 className='text-xs font-medium text-muted-foreground mb-1'>Full Path</h4>
                    <p className='text-sm break-all'>{selectedFile.storagePath}</p>
                  </div>
                </div>

                <div className='mt-8 space-y-2'>
                  <Button
                    className='w-full gap-2'
                    size='sm'
                    onClick={() => {
                      return window.open(selectedFile.downloadURL, '_blank');
                    }}
                  >
                    <Download className='h-4 w-4' />
                    Download
                  </Button>
                </div>
              </CardContent>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
