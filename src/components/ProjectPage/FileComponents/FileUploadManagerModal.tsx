'use client';

import { formatDistanceToNow } from 'date-fns';
import { Download, File, MoreVertical, Trash2, Upload } from 'lucide-react';
import { useState } from 'react';

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

// Sample data
const storageData = {
  used: 128,
  total: 512,
  percentage: 25,
};

const fileTypes = [
  { type: 'PDF', count: 24 },
  { type: 'DOC', count: 18 },
  { type: 'PNG', count: 42 },
  { type: 'ZIP', count: 7 },
  { type: 'MP3', count: 13 },
  { type: 'MP4', count: 9 },
  { type: 'CODE', count: 31 },
];

const recentFiles = [
  {
    id: 1,
    name: 'Project Proposal.pdf',
    type: 'PDF',
    size: '2.4 MB',
    modified: new Date(2023, 3, 1),
  },
  {
    id: 2,
    name: 'Vacation Photos.zip',
    type: 'ZIP',
    size: '128 MB',
    modified: new Date(2023, 3, 2),
  },
  {
    id: 3,
    name: 'Financial Report.xlsx',
    type: 'XLSX',
    size: '1.8 MB',
    modified: new Date(2023, 3, 3),
  },
  {
    id: 4,
    name: 'Meeting Recording.mp3',
    type: 'MP3',
    size: '24 MB',
    modified: new Date(2023, 3, 4),
  },
];

const allFiles = [
  {
    id: 1,
    name: 'Project Proposal.pdf',
    type: 'PDF',
    size: '2.4 MB',
    modified: new Date(2023, 3, 1),
  },
  {
    id: 2,
    name: 'Vacation Photos.zip',
    type: 'ZIP',
    size: '128 MB',
    modified: new Date(2023, 3, 2),
  },
  {
    id: 3,
    name: 'Financial Report.xlsx',
    type: 'XLSX',
    size: '1.8 MB',
    modified: new Date(2023, 3, 3),
  },
  {
    id: 4,
    name: 'Meeting Recording.mp3',
    type: 'MP3',
    size: '24 MB',
    modified: new Date(2023, 3, 4),
  },
  { id: 5, name: 'Product Demo.mp4', type: 'MP4', size: '156 MB', modified: new Date(2023, 3, 5) },
  { id: 6, name: 'User Manual.docx', type: 'DOCX', size: '3.2 MB', modified: new Date(2023, 3, 6) },
  { id: 7, name: 'Logo Design.png', type: 'PNG', size: '4.7 MB', modified: new Date(2023, 3, 7) },
  { id: 8, name: 'Source Code.zip', type: 'ZIP', size: '42 MB', modified: new Date(2023, 3, 8) },
  {
    id: 9,
    name: 'Presentation.pptx',
    type: 'PPTX',
    size: '8.1 MB',
    modified: new Date(2023, 3, 9),
  },
  { id: 10, name: 'Budget.xlsx', type: 'XLSX', size: '1.2 MB', modified: new Date(2023, 3, 10) },
];

export default function FileUploadManagerModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [files, setFiles] = useState(allFiles);

  const handleRemoveFile = (id: number) => {
    setFiles(
      files.filter((file) => {
        return file.id !== id;
      }),
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side='bottom'
        className='h-[90vh] max-h-[90vh] w-screen flex flex-col rounded-t-2xl'
      >
        <CardHeader className='flex flex-row items-center justify-between shrink-0 pb-0'>
          <CardTitle className='text-lg font-bold'>My Storage</CardTitle>
          <Button size='sm' className='gap-1 mb-2' variant='outline'>
            <Upload className='h-4 w-4' />
            Upload File
          </Button>
        </CardHeader>

        {/* Recent Files */}
        <CardHeader className='pb-2 shrink-0'>
          <div className='text-sm font-medium'>Recent Files</div>
        </CardHeader>
        <CardContent className='shrink-0'>
          {recentFiles.length > 0 ? (
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
              {recentFiles.map((file) => {
                return (
                  <div
                    key={file.id}
                    className='flex flex-col items-center p-3 border rounded-lg hover:bg-muted/50 transition-colors'
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
              <Button className='gap-2'>
                <Upload className='h-4 w-4' />
                Upload Your First File
              </Button>
            </div>
          )}
        </CardContent>
      </SheetContent>
    </Sheet>
  );
}
