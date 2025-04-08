'use client';

import { formatDistanceToNow } from 'date-fns';
import { ExternalLink, File, Info, MoreVertical, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
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
import { useFigmaManager } from './useFigmaManager';

export default function FigmaManagerModal({
  isOpen,
  onClose,
  handleAddFigmaToProject,
  isReplacing = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  handleAddFigmaToProject: (file: any) => void;
  isReplacing?: boolean;
}) {
  const {
    files,
    isLoading,
    selectedFile,
    showDetails,
    handleAddFigmaFile,
    handleRemoveFile,
    handleViewDetails,
    setShowDetails,
  } = useFigmaManager();

  const [newFigmaUrl, setNewFigmaUrl] = useState('');

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side='bottom'
        className='h-[90vh] max-h-[90vh] w-screen flex flex-col rounded-t-2xl'
      >
        <VisuallyHidden>
          <SheetTitle>{isReplacing ? 'Replace Figma File' : 'Figma Files'}</SheetTitle>
          <SheetDescription>
            {isReplacing
              ? 'Select a new Figma file to replace the current one'
              : 'Manage your Figma files'}
          </SheetDescription>
        </VisuallyHidden>
        <div className='px-6 flex h-full'>
          <div className={`flex-1 flex flex-col ${showDetails ? 'pr-4' : ''}`}>
            <CardHeader className='flex flex-row items-center justify-between shrink-0 pb-0'>
              <CardTitle className='text-lg font-bold'>
                {isReplacing ? 'Replace Figma File' : 'Figma Files'}
              </CardTitle>
              <div className='flex gap-2'>
                <Input
                  placeholder='Paste Figma URL'
                  value={newFigmaUrl}
                  onChange={(e) => {
                    return setNewFigmaUrl(e.target.value);
                  }}
                  className='w-64'
                />
                <Button
                  size='sm'
                  className='gap-1 mb-2'
                  variant='outline'
                  onClick={() => {
                    handleAddFigmaFile(newFigmaUrl);
                    setNewFigmaUrl('');
                  }}
                  disabled={!newFigmaUrl}
                >
                  <Plus className='h-4 w-4' />
                  Add Figma
                </Button>
              </div>
            </CardHeader>

            {/* Recent Figma Files */}
            {files.length > 0 && (
              <>
                <CardHeader className='pb-2 shrink-0'>
                  <div className='text-sm font-medium'>
                    {isReplacing ? 'Select a File' : 'Recent Figma Files'}
                  </div>
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
                              return handleAddFigmaToProject(file);
                            }}
                          >
                            <div className='relative w-full aspect-video mb-2'>
                              <iframe
                                src={`https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(
                                  file.figmaUrl,
                                )}`}
                                className='w-full h-full rounded-md'
                                allowFullScreen
                              />
                            </div>
                            <span className='text-sm font-medium text-center truncate w-full'>
                              {file.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className='flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-muted/10'>
                      <File className='h-10 w-10 text-muted-foreground mb-2' />
                      <h3 className='text-sm font-medium'>No Figma files</h3>
                      <p className='text-xs text-muted-foreground mt-1'>
                        Add Figma files to see them appear here
                      </p>
                    </div>
                  )}
                </CardContent>
              </>
            )}

            {/* All Figma Files */}
            <CardHeader className='pb-2 shrink-0'>
              <CardTitle className='text-sm font-medium'>All Figma Files</CardTitle>
            </CardHeader>
            <CardContent className='flex-1 overflow-y-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Added By</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {files.map((file) => {
                    return (
                      <TableRow key={file._id}>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            <div className='relative w-10 h-10 bg-muted rounded-md flex items-center justify-center'>
                              <File className='h-5 w-5 text-muted-foreground' />
                            </div>
                            <span className='font-medium'>{file.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{file.addedBy.name}</TableCell>
                        <TableCell>
                          {formatDistanceToNow(new Date(file.createdAt), { addSuffix: true })}
                        </TableCell>
                        <TableCell className='text-right'>
                          <div className='flex items-center justify-end gap-2'>
                            <Button
                              variant='ghost'
                              size='icon'
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(file.figmaUrl, '_blank');
                              }}
                            >
                              <ExternalLink className='h-4 w-4' />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant='ghost' size='icon'>
                                  <MoreVertical className='h-4 w-4' />
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
                                <DropdownMenuItem
                                  onClick={() => {
                                    return handleRemoveFile(file._id);
                                  }}
                                  className='text-red-600'
                                >
                                  <Trash2 className='h-4 w-4 mr-2' />
                                  Remove
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </div>

          {/* Details Panel */}
          {showDetails && selectedFile && (
            <div className='w-80 border-l pl-4 flex flex-col'>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-medium'>File Details</CardTitle>
              </CardHeader>
              <CardContent className='flex-1 overflow-y-auto'>
                <div className='space-y-4'>
                  <div className='relative w-full aspect-video'>
                    <iframe
                      src={`https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(
                        selectedFile.figmaUrl,
                      )}`}
                      className='w-full h-full rounded-md'
                      allowFullScreen
                    />
                  </div>
                  <div>
                    <h3 className='font-medium'>{selectedFile.name}</h3>
                    <p className='text-sm text-muted-foreground'>
                      Added by {selectedFile?.addedBy?.name}
                    </p>
                    <p className='text-sm text-muted-foreground'>
                      {formatDistanceToNow(new Date(selectedFile.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  <div className='mt-8 space-y-2'>
                    <Button
                      className='w-full gap-2'
                      size='sm'
                      onClick={() => {
                        return window.open(selectedFile.figmaUrl, '_blank');
                      }}
                    >
                      Open in Figma
                    </Button>
                  </div>
                </div>
              </CardContent>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
