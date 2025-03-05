import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ProjectFile } from '@/lib/mock/projectFiles';
import { FileIcon, FilePlus, ImageIcon, PaperclipIcon, X } from 'lucide-react';
import { useState } from 'react';

interface AddFileModalProps {
  selectedFile: ProjectFile;
  handleFileUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploadedFiles?: File[];
  handleAddAttachmentToFileItem?: (fileItemId: string) => void;
  onClose: () => void;
}

const AddFileModal: React.FC<AddFileModalProps> = ({
  selectedFile,
  handleFileUpload,
  uploadedFiles = [],
  handleAddAttachmentToFileItem,
  onClose,
}) => {
  const [fileDetails, setFileDetails] = useState({
    category: '',
    description: '',
    tags: '',
  });
  const [showModal, setShowModal] = useState(true);

  const fileCategories = [
    'Mockup',
    'Revision',
    'Final',
    'Source File',
    'Reference',
    'Client Approval',
    'Other',
  ];

  const handleClose = () => {
    setShowModal(false);
    onClose();
  };

  const handleAddFiles = () => {
    if (uploadedFiles.length > 0 && handleAddAttachmentToFileItem) {
      // In a real implementation, we would include the category, description, and tags
      // with the file upload. For this simplified version, we just call the handler.
      handleAddAttachmentToFileItem(selectedFile.id);
      handleClose();
    }
  };

  const getFileIcon = (fileName: string) => {
    if (fileName.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      return <ImageIcon className='h-5 w-5 text-blue-500' />;
    } else if (fileName.match(/\.(pdf)$/i)) {
      return <FileIcon className='h-5 w-5 text-red-500' />;
    } else {
      return <PaperclipIcon className='h-5 w-5 text-gray-500' />;
    }
  };

  const clearFiles = () => {
    // In a real implementation, we would clear the uploaded files.
    // For this demo, this would need to be handled by the parent component.
  };

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Add Files</DialogTitle>
          <DialogDescription>Upload files to attach to {selectedFile.name}</DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          <div className='border border-dashed rounded-md p-6 flex flex-col items-center justify-center'>
            <FilePlus className='h-10 w-10 text-gray-400 mb-2' />
            <h3 className='font-medium'>Upload Files</h3>
            <p className='text-sm text-gray-500 text-center mt-1 mb-4'>
              Drag and drop files here or click to browse
            </p>
            <input
              id='file-upload-modal'
              type='file'
              className='hidden'
              onChange={handleFileUpload}
              multiple
            />
            <Button
              variant='outline'
              onClick={() => {return document.getElementById('file-upload-modal')?.click()}}
            >
              Browse Files
            </Button>
          </div>

          {uploadedFiles.length > 0 && (
            <>
              <div className='border rounded-md p-4 space-y-4'>
                <div className='flex justify-between items-center'>
                  <h4 className='font-medium'>File Details</h4>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={clearFiles}
                    className='text-destructive'
                  >
                    Clear All
                  </Button>
                </div>

                <div className='space-y-3'>
                  <div className='space-y-2'>
                    <Label htmlFor='file-category'>Category</Label>
                    <Select
                      value={fileDetails.category}
                      onValueChange={(value) => {return setFileDetails({ ...fileDetails, category: value })}}
                    >
                      <SelectTrigger id='file-category'>
                        <SelectValue placeholder='Select a category' />
                      </SelectTrigger>
                      <SelectContent>
                        {fileCategories.map((category) => {return (
                          <SelectItem key={category} value={category.toLowerCase()}>
                            {category}
                          </SelectItem>
                        )})}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='file-description'>Description</Label>
                    <Textarea
                      id='file-description'
                      placeholder='Add a description for these files...'
                      value={fileDetails.description}
                      onChange={(e) =>
                        {return setFileDetails({ ...fileDetails, description: e.target.value })}
                      }
                      rows={2}
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='file-tags'>Tags (comma separated)</Label>
                    <Input
                      id='file-tags'
                      placeholder='mockup, draft, client-review'
                      value={fileDetails.tags}
                      onChange={(e) => {return setFileDetails({ ...fileDetails, tags: e.target.value })}}
                    />
                  </div>
                </div>
              </div>

              <div className='border rounded-md'>
                <div className='p-3 border-b'>
                  <h4 className='font-medium'>Files to Upload ({uploadedFiles.length})</h4>
                </div>
                <div className='max-h-60 overflow-y-auto'>
                  {uploadedFiles.map((file, index) => {return (
                    <div
                      key={index}
                      className='flex justify-between items-center py-2 px-3 border-b last:border-b-0'
                    >
                      <div className='flex items-center'>
                        {getFileIcon(file.name)}
                        <span className='ml-2 text-sm'>{file.name}</span>
                      </div>
                      <div className='flex items-center'>
                        <span className='text-xs text-gray-500 mr-3'>
                          {Math.round(file.size / 1024)} KB
                        </span>
                        <Button variant='ghost' size='icon' className='h-7 w-7'>
                          <X className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                  )})}
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className='pt-4 space-x-2'>
          <Button variant='outline' onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleAddFiles} disabled={uploadedFiles.length === 0}>
            Add {uploadedFiles.length} {uploadedFiles.length === 1 ? 'File' : 'Files'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddFileModal;
