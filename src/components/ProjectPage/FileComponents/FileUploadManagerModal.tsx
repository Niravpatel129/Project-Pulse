'use client';

import { formatDistanceToNow } from 'date-fns';
import { Download, File, Info, MoreVertical, Trash2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from '@/components/ui/use-toast';

function FileTypeIcon({ type }: { type: string }) {
  const color =
    {
      PDF: 'bg-red-500',
      DOC: 'bg-blue-500',
      DOCX: 'bg-blue-500',
      IMG: 'bg-purple-500',
      PNG: 'bg-purple-500',
      JPG: 'bg-purple-500',
      ZIP: 'bg-yellow-500',
      MP3: 'bg-green-500',
      MP4: 'bg-pink-500',
      XLSX: 'bg-emerald-500',
      PPTX: 'bg-orange-500',
      CODE: 'bg-slate-500',
    }[type] || 'bg-gray-500';

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
          .{type}
        </div>
      </div>
      <div className='absolute top-0 right-0 w-3 h-3 bg-slate-200 rounded-bl-md'></div>
    </div>
  );
}

export default function FileUploadManagerModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [files, setFiles] = useState<
    Array<{
      id: number;
      name: string;
      type: string;
      size: string;
      modified: Date;
    }>
  >([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{
    id: number;
    name: string;
    type: string;
    size: string;
    modified: Date;
  } | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRemoveFile = (id: number) => {
    setFiles(
      files.filter((file) => {
        return file.id !== id;
      }),
    );

    if (selectedFile && selectedFile.id === id) {
      setSelectedFile(null);
      setShowDetails(false);
    }
  };

  const handleViewDetails = (file: {
    id: number;
    name: string;
    type: string;
    size: string;
    modified: Date;
  }) => {
    setSelectedFile(file);
    setShowDetails(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    setIsUploading(true);

    // Simulate upload delay
    setTimeout(() => {
      const uploadedFiles = Array.from(e.target.files || []).map((file, index) => {
        // Get file extension
        const fileExtension = file.name.split('.').pop()?.toUpperCase() || '';

        // Format file size
        const sizeInBytes = file.size;
        let formattedSize = '';
        if (sizeInBytes < 1024 * 1024) {
          formattedSize = `${(sizeInBytes / 1024).toFixed(1)} KB`;
        } else if (sizeInBytes < 1024 * 1024 * 1024) {
          formattedSize = `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
        } else {
          formattedSize = `${(sizeInBytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
        }

        return {
          id:
            Math.max(
              ...files.map((f) => {
                return f.id;
              }),
              0,
            ) +
            index +
            1,
          name: file.name,
          type: fileExtension,
          size: formattedSize,
          modified: new Date(),
        };
      });

      setFiles((prevFiles) => {
        return [...uploadedFiles, ...prevFiles];
      });
      setIsUploading(false);

      toast({
        title: 'Files uploaded successfully',
        description: `${uploadedFiles.length} file${
          uploadedFiles.length > 1 ? 's' : ''
        } added to your storage.`,
      });

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }, 1500);
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side='bottom'
        className='h-[90vh] max-h-[90vh] w-screen flex flex-col rounded-t-2xl'
      >
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
                    <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
                      {files.slice(0, 4).map((file) => {
                        return (
                          <div
                            key={file.id}
                            className='flex flex-col items-center p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer'
                            onClick={() => {
                              return handleViewDetails(file);
                            }}
                          >
                            <FileTypeIcon type={file.type} />
                            <span className='mt-2 text-xs font-medium text-muted-foreground'>
                              {file.type}
                            </span>
                            <span className='mt-1 text-sm font-medium text-center truncate w-full'>
                              {file.name}
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
                        <TableRow key={file.id}>
                          <TableCell>
                            <div className='flex items-center gap-2'>
                              <span className='font-medium'>{file.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className='hidden sm:table-cell'>{file.type}</TableCell>
                          <TableCell className='hidden md:table-cell'>{file.size}</TableCell>
                          <TableCell className='hidden md:table-cell'>
                            {formatDistanceToNow(file.modified, { addSuffix: true })}
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
                                    return handleRemoveFile(file.id);
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
                <div className='flex justify-between items-center'>
                  <CardTitle className='text-sm font-medium'>File Details</CardTitle>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => {
                      return setShowDetails(false);
                    }}
                    className='h-8 w-8 p-0'
                  >
                    ×
                  </Button>
                </div>
              </CardHeader>
              <CardContent className='flex-1'>
                <div className='flex flex-col items-center mb-6 pt-4'>
                  <FileTypeIcon type={selectedFile.type} />
                  <h3 className='mt-4 font-medium text-center break-all'>{selectedFile.name}</h3>
                </div>

                <div className='space-y-4'>
                  <div>
                    <h4 className='text-xs font-medium text-muted-foreground mb-1'>Type</h4>
                    <p className='text-sm'>{selectedFile.type} file</p>
                  </div>

                  <div>
                    <h4 className='text-xs font-medium text-muted-foreground mb-1'>Size</h4>
                    <p className='text-sm'>{selectedFile.size}</p>
                  </div>

                  <div>
                    <h4 className='text-xs font-medium text-muted-foreground mb-1'>Created</h4>
                    <p className='text-sm'>
                      {formatDistanceToNow(selectedFile.modified, { addSuffix: true })}
                    </p>
                  </div>

                  <div>
                    <h4 className='text-xs font-medium text-muted-foreground mb-1'>Full Path</h4>
                    <p className='text-sm break-all'>/storage/{selectedFile.name}</p>
                  </div>
                </div>

                <div className='mt-8 space-y-2'>
                  <Button className='w-full gap-2' size='sm'>
                    <Download className='h-4 w-4' />
                    Download
                  </Button>
                  <Button
                    className='w-full gap-2'
                    variant='destructive'
                    size='sm'
                    onClick={() => {
                      return handleRemoveFile(selectedFile.id);
                    }}
                  >
                    <Trash2 className='h-4 w-4' />
                    Delete
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
