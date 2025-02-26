import { Button } from '@/components/ui/button';
import {
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
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { FileType } from '@/lib/mock/projectFiles';
import { Paperclip, Upload } from 'lucide-react';
import React from 'react';

interface UploadFileDialogProps {
  selectedFileType: FileType;
  setSelectedFileType: (type: FileType) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAddFile: () => void;
  uploadedFiles: File[];
  onClose: () => void;
}

const UploadFileDialog: React.FC<UploadFileDialogProps> = ({
  selectedFileType,
  setSelectedFileType,
  handleFileUpload,
  handleAddFile,
  uploadedFiles,
  onClose,
}) => {
  return (
    <DialogContent className='max-w-md'>
      <DialogHeader>
        <DialogTitle>Add New File</DialogTitle>
        <DialogDescription>
          Choose a file type and upload or create a new document.
        </DialogDescription>
      </DialogHeader>
      <div className='space-y-4 py-4'>
        <div className='space-y-2'>
          <Label htmlFor='file-type'>File Type</Label>
          <Select
            value={selectedFileType}
            onValueChange={(val) => setSelectedFileType(val as FileType)}
          >
            <SelectTrigger id='file-type'>
              <SelectValue placeholder='Select file type' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='upload'>Upload Files</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='file-upload'>Upload Files</Label>
          <div className='border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center'>
            <Upload className='h-8 w-8 text-gray-400 mb-2' />
            <p className='text-sm text-gray-500 mb-2'>Drag and drop your files here</p>
            <Input
              id='file-upload'
              type='file'
              className='hidden'
              multiple
              onChange={handleFileUpload}
            />
            <Button
              size='sm'
              variant='outline'
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              Browse Files
            </Button>
          </div>

          {uploadedFiles.length > 0 && (
            <div className='mt-4'>
              <Label>Selected Files</Label>
              <div className='mt-2 space-y-2 max-h-40 overflow-y-auto p-2 border rounded'>
                {uploadedFiles.map((file, index) => (
                  <div key={index} className='flex justify-between items-center text-sm'>
                    <div className='flex items-center'>
                      <Paperclip className='h-4 w-4 text-gray-500 mr-2' />
                      <span>{file.name}</span>
                    </div>
                    <span className='text-gray-500'>{Math.round(file.size / 1024)} KB</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className='space-y-2'>
          <Label htmlFor='doc-name'>File Group Name</Label>
          <Input id='doc-name' placeholder='Wedding Venue Photos' />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='description'>Description (Optional)</Label>
          <Textarea id='description' placeholder='Add a description of these files...' rows={3} />
        </div>

        <div className='flex items-center space-x-2'>
          <Switch id='send-email' />
          <Label htmlFor='send-email'>Send email notification to client</Label>
        </div>
      </div>
      <DialogFooter>
        <Button variant='outline' onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleAddFile} disabled={uploadedFiles.length === 0}>
          Upload Files
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default UploadFileDialog;
