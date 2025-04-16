import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { File, PlusCircle, Upload, X } from 'lucide-react';
import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';

// Interface for attachment object
export interface Attachment {
  name: string;
  url: string;
  size?: string;
  id: string;
  fileRef?: any;
}

// Interface for the cell editor params
interface IAttachmentCellEditorParams {
  value?: Attachment | Attachment[];
  stopEditing?: (suppressNavigate?: boolean) => void;
  api?: any;
  column?: any;
  node?: any;
  data?: any;
  rowIndex?: number;
  colDef?: any;
}

// Maximum allowed file size in bytes (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Supported file types
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
  'text/plain',
];

const AttachmentCellEditor = forwardRef<any, IAttachmentCellEditorParams>((props, ref) => {
  const [isDialogOpen, setIsDialogOpen] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const valueChanged = useRef(false);

  // Initialize attachments from props.value if it exists
  React.useEffect(() => {
    // Initialize attachments only once when the editor first opens
    if (props.value && attachments.length === 0) {
      if (Array.isArray(props.value)) {
        setAttachments(props.value);
      } else {
        setAttachments([props.value]);
      }
    }
  }, [props.value, attachments.length]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        setError(`File is too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`);
        return;
      }

      // Check file type
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        setError('Invalid file type. Please upload a supported file type.');
        return;
      }

      setError(null);
      setSelectedFile(file);
    }
  };

  // Format file size for display
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Remove selected file
  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove an attachment
  const removeAttachment = (index: number) => {
    setAttachments((prevAttachments) => {
      const newAttachments = [...prevAttachments];
      newAttachments.splice(index, 1);
      valueChanged.current = true;
      return newAttachments;
    });
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setIsDialogOpen(false);
    // Close the cell editor and cancel editing if no changes were made
    if (props.stopEditing && !valueChanged.current) {
      setTimeout(() => {
        props.stopEditing(true); // Pass true to suppress navigation
      }, 0);
    } else if (props.stopEditing) {
      setTimeout(() => {
        props.stopEditing(); // Normal stop editing
      }, 0);
    }
  };

  // Add the current file to attachments
  const addAttachment = () => {
    if (!selectedFile) return;

    // Create URL for the file
    const fileUrl = URL.createObjectURL(selectedFile);

    // Create a new attachment
    const newAttachment: Attachment = {
      name: selectedFile.name,
      size: formatFileSize(selectedFile.size),
      url: fileUrl,
      id: `attachment-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    };

    // Add to list of attachments
    setAttachments((prev) => {
      return [...prev, newAttachment];
    });

    // Clear current file
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    valueChanged.current = true;
  };

  // Handle file upload and save
  const handleSave = () => {
    valueChanged.current = true;
    setIsDialogOpen(false);

    // Stop editing and save the value
    if (props.stopEditing) {
      props.stopEditing();
    }
  };

  // Trigger file selection dialog
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  // Expose AG Grid-required methods
  useImperativeHandle(ref, () => {
    return {
      // Return the current value
      getValue() {
        return attachments.length > 0 ? attachments : null;
      },

      // Initialize the editor
      afterGuiAttached() {
        // Nothing to do here since we're using a dialog
      },

      // Return the DOM element for the editor
      getGui() {
        return document.createElement('div'); // Placeholder element
      },

      // Tell AG Grid this is a popup editor
      isPopup() {
        return true;
      },

      // Don't cancel editing before it starts
      isCancelBeforeStart() {
        return false;
      },

      // If no value changed, cancel the edit
      isCancelAfterEnd() {
        return !valueChanged.current;
      },
    };
  });

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>Manage Attachments</DialogTitle>
        </DialogHeader>

        <div className='grid gap-4 py-4'>
          {error && <div className='text-red-500 text-sm bg-red-50 p-2 rounded'>{error}</div>}

          {/* File upload area */}
          <div className='border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center'>
            <input type='file' ref={fileInputRef} onChange={handleFileChange} className='hidden' />
            {!selectedFile ? (
              <>
                <File className='h-10 w-10 text-gray-400 mb-2' />
                <p className='text-sm text-gray-700 mb-2'>
                  Drag and drop a file here, or click to browse
                </p>
                <Button variant='outline' size='sm' onClick={triggerFileUpload}>
                  Browse Files
                </Button>
                <p className='text-xs text-gray-500 mt-2'>Max file size: 5MB</p>
              </>
            ) : (
              <div className='w-full'>
                <div className='flex items-center justify-between bg-gray-50 p-3 rounded'>
                  <div className='flex items-center gap-2'>
                    <File className='h-5 w-5 text-blue-500' />
                    <div>
                      <p className='text-sm font-medium'>{selectedFile.name}</p>
                      <p className='text-xs text-gray-500'>{formatFileSize(selectedFile.size)}</p>
                    </div>
                  </div>
                  <div className='flex gap-2'>
                    <Button variant='ghost' size='sm' onClick={removeFile} className='h-8 w-8 p-0'>
                      <X className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={addAttachment}
                      className='h-8 flex gap-1 items-center'
                    >
                      <PlusCircle className='h-4 w-4' />
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Current attachments list */}
          {attachments.length > 0 && (
            <div className='mt-4'>
              <h3 className='text-sm font-medium mb-2'>Current Attachments</h3>
              <div className='max-h-60 overflow-y-auto space-y-2'>
                {attachments.map((attachment, index) => {
                  return (
                    <div
                      key={attachment.id || index}
                      className='flex items-center justify-between bg-gray-50 p-3 rounded'
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
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => {
                          return removeAttachment(index);
                        }}
                        className='h-8 w-8 p-0'
                      >
                        <X className='h-4 w-4' />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={handleDialogClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className='gap-1'>
            <Upload className='h-4 w-4' />
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

AttachmentCellEditor.displayName = 'AttachmentCellEditor';

export default AttachmentCellEditor;
