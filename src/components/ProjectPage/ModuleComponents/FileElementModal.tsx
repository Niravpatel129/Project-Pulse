import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { newRequest } from '@/utils/newRequest';
import { format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, FileText, Pencil, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { FileElement } from './types';

interface FileElementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (element: FileElement) => void;
  moduleId: string;
}

export function FileElementModal({ isOpen, onClose, onAdd, moduleId }: FileElementModalProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState<Partial<FileElement>>({
    name: '',
    description: '',
    files: [],
  });
  const [error, setError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [editingFileIndex, setEditingFileIndex] = useState<number | null>(null);
  const [editedFileName, setEditedFileName] = useState<string>('');

  // Constants for file limitations
  const MAX_FILES = 5;
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
  const ALLOWED_FILE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ];

  // Update local state when prop changes
  useEffect(() => {
    if (isOpen) {
      setShowDialog(true);
    }
  }, [isOpen]);

  // Reset form data when modal is opened
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        description: '',
        files: [],
      });
      setUploadedFiles([]);
      setError(null);
      setEditingFileIndex(null);
      setEditedFileName('');
    }
  }, [isOpen]);

  const handleClose = () => {
    setShowDialog(false);
    // Wait for animation to finish before calling onClose
    setTimeout(() => {
      onClose();
    }, 300); // Adjust this value to match your animation duration
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    try {
      // Create FormData for multipart/form-data submission
      const formDataToSubmit = new FormData();
      formDataToSubmit.append('name', formData.name);
      if (formData.description) {
        formDataToSubmit.append('description', formData.description);
      }
      formDataToSubmit.append('type', 'file');
      formDataToSubmit.append('moduleId', moduleId);

      // Add each file to the FormData
      uploadedFiles.forEach((file, index) => {
        // Use the custom file name if it was edited
        if (formData.files && formData.files[index]) {
          formDataToSubmit.append('fileNames', formData.files[index].name);
        }
        formDataToSubmit.append('files', file);
      });

      // Make API call with newRequest
      const response = await newRequest.post(
        `/elements/modules/file-element/${moduleId}`,
        formDataToSubmit,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      // Create file elements from the response
      const fileElements = uploadedFiles.map((file, index) => {
        return {
          name: formData.files?.[index]?.name || file.name,
          type: (file.type.startsWith('image/')
            ? 'image'
            : file.type.includes('pdf') || file.type.includes('doc')
            ? 'document'
            : 'other') as 'document' | 'image' | 'other',
          size: file.size,
          uploadedAt: response.data.createdAt,
          url: response.data.data.files[index],
        };
      });

      onAdd(response.data.data);

      setFormData({
        name: '',
        description: '',
        files: [],
      });
      setUploadedFiles([]);
      handleClose();
    } catch (error) {
      console.error('Error adding file element:', error);
      setError('Failed to add file element. Please try again.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Check if adding these files would exceed the limit
    if ((formData.files?.length || 0) + files.length > MAX_FILES) {
      setError(`You can only upload up to ${MAX_FILES} files.`);
      e.target.value = '';
      return;
    }

    // Check file sizes and types
    const oversizedFiles = files.filter((file) => {
      return file.size > MAX_FILE_SIZE;
    });
    if (oversizedFiles.length > 0) {
      setError(
        `${
          oversizedFiles.length === 1 ? 'One file exceeds' : `${oversizedFiles.length} files exceed`
        } the 5MB limit: ${oversizedFiles
          .map((f) => {
            return f.name;
          })
          .join(', ')}`,
      );
      e.target.value = '';
      return;
    }

    // Check file types
    const invalidTypeFiles = files.filter((file) => {
      return !ALLOWED_FILE_TYPES.includes(file.type);
    });
    if (invalidTypeFiles.length > 0) {
      setError(
        `${
          invalidTypeFiles.length === 1 ? 'One file has' : `${invalidTypeFiles.length} files have`
        } an invalid file type: ${invalidTypeFiles
          .map((f) => {
            return f.name;
          })
          .join(', ')}`,
      );
      e.target.value = '';
      return;
    }

    setError(null);

    // Store the actual File objects for later upload

    setUploadedFiles((prev) => {
      return [...prev, ...files];
    });

    // Create display metadata for the UI
    const newFiles = files.map((file) => {
      return {
        name: file.name,
        type: (file.type.startsWith('image/')
          ? 'image'
          : file.type.includes('pdf') || file.type.includes('doc')
          ? 'document'
          : 'other') as 'document' | 'image' | 'other',
        size: file.size,
        uploadedAt: new Date().toISOString(),
        url: '', // Add empty URL that will be populated after upload
      };
    });

    setFormData((prev) => {
      return {
        ...prev,
        files: [...(prev.files || []), ...newFiles],
      };
    });

    // Reset the file input so the same files can be selected again
    e.target.value = '';
  };

  const startEditingFileName = (index: number) => {
    if (formData.files && formData.files[index]) {
      setEditingFileIndex(index);
      setEditedFileName(formData.files[index].name);
    }
  };

  const saveEditedFileName = () => {
    if (editingFileIndex !== null && formData.files) {
      const newFiles = [...formData.files];
      newFiles[editingFileIndex] = {
        ...newFiles[editingFileIndex],
        name: editedFileName,
      };
      setFormData({ ...formData, files: newFiles });
      setEditingFileIndex(null);
    }
  };

  const isNameValid = Boolean(formData.name && formData.name.trim());
  const remainingFiles = MAX_FILES - (formData.files?.length || 0);

  return (
    <Dialog open={showDialog} onOpenChange={handleClose}>
      <DialogContent className='max-w-3xl'>
        <DialogHeader>
          <DialogTitle>Add File Element</DialogTitle>
          <DialogDescription>Upload files and add them to this module</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label>Element Name</Label>
              <input
                type='text'
                className='w-full p-2 border rounded-md'
                value={formData.name}
                onChange={(e) => {
                  return setFormData({ ...formData, name: e.target.value });
                }}
                placeholder='Enter element name'
              />
            </div>

            <div className='space-y-2'>
              <div className='flex justify-between'>
                <Label>Upload Files</Label>
                {formData.files && formData.files.length > 3 && (
                  <span className='text-xs text-gray-500'>
                    {formData.files.length}/{MAX_FILES} files
                  </span>
                )}
              </div>
              {error && (
                <div className='text-red-500 text-sm flex items-center gap-2 bg-red-50 p-2 rounded'>
                  <AlertCircle className='h-4 w-4' />
                  {error}
                </div>
              )}
              <div className='border-2 border-dashed rounded-lg p-4 text-center min-h-[150px] flex items-center justify-center'>
                <input
                  type='file'
                  multiple
                  className='hidden'
                  id='file-upload'
                  onChange={handleFileUpload}
                  disabled={formData.files?.length === MAX_FILES}
                />
                <label
                  htmlFor='file-upload'
                  className={`cursor-pointer flex flex-col items-center gap-2 ${
                    formData.files?.length === MAX_FILES ? 'opacity-50' : ''
                  }`}
                >
                  <FileText className='h-8 w-8 text-gray-400' />
                  <span className='text-sm text-gray-500'>
                    {formData.files?.length === MAX_FILES
                      ? 'Maximum number of files reached'
                      : 'Drag and drop files here, or click to select files'}
                  </span>
                  <span className='text-xs text-gray-400'>max 5MB</span>
                  <span className='text-xs text-gray-400'>
                    Allowed types: images, PDF, Word, Excel, PowerPoint
                  </span>
                </label>
              </div>
            </div>

            {formData.files?.length > 0 && (
              <div className='space-y-2'>
                <Label>Uploaded Files</Label>
                <div className='max-h-[300px] overflow-y-auto border rounded-md'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Uploaded</TableHead>
                        <TableHead className=''></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence initial={false}>
                        {formData.files.map((file, index) => {
                          return (
                            <motion.tr
                              key={`${file.name}-${index}`}
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className='border-b'
                            >
                              <TableCell className='font-medium'>
                                {editingFileIndex === index ? (
                                  <div className='flex items-center'>
                                    <input
                                      type='text'
                                      value={editedFileName}
                                      onChange={(e) => {
                                        return setEditedFileName(e.target.value);
                                      }}
                                      onBlur={saveEditedFileName}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          e.preventDefault();
                                          saveEditedFileName();
                                        }
                                      }}
                                      className='p-1 border rounded-md w-full'
                                      autoFocus
                                    />
                                  </div>
                                ) : (
                                  <div className='flex items-center gap-2'>
                                    {file.name}
                                    <Button
                                      variant='ghost'
                                      size='icon'
                                      onClick={() => {
                                        return startEditingFileName(index);
                                      }}
                                      className='h-6 w-6'
                                    >
                                      <Pencil className='h-3 w-3' />
                                    </Button>
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge variant='secondary' className='capitalize'>
                                  {file.type}
                                </Badge>
                              </TableCell>
                              <TableCell>{(file.size / 1024 / 1024).toFixed(2)} MB</TableCell>
                              <TableCell>
                                {format(new Date(file.uploadedAt), 'MMM d, h:mm a')}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant='ghost'
                                  size='icon'
                                  onClick={() => {
                                    const newFiles = [...formData.files];
                                    newFiles.splice(index, 1);
                                    setFormData({ ...formData, files: newFiles });

                                    // Also remove from uploadedFiles array
                                    const newUploadedFiles = [...uploadedFiles];
                                    newUploadedFiles.splice(index, 1);
                                    setUploadedFiles(newUploadedFiles);

                                    setError(null);
                                  }}
                                >
                                  <X className='h-4 w-4' />
                                </Button>
                              </TableCell>
                            </motion.tr>
                          );
                        })}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type='button' variant='outline' onClick={handleClose}>
              Cancel
            </Button>
            <Button type='submit' disabled={!isNameValid}>
              Add Element
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
