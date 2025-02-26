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
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { FileType } from '@/lib/mock/projectFiles';
import { FolderPlus, Paperclip } from 'lucide-react';
import React, { useState } from 'react';

interface UploadFileDialogProps {
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAddFile: () => void;
  uploadedFiles: File[];
  onClose: () => void;
  selectedFileType: FileType;
  setSelectedFileType: (type: FileType) => void;
}

const UploadFileDialog: React.FC<UploadFileDialogProps> = ({
  handleFileUpload,
  handleAddFile,
  uploadedFiles,
  onClose,
}) => {
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [notifyClient, setNotifyClient] = useState(false);

  return (
    <DialogContent className='max-w-md'>
      <DialogHeader>
        <DialogTitle>Create File Item</DialogTitle>
        <DialogDescription>
          Create a container that can hold files, products, services, invoices, and more.
        </DialogDescription>
      </DialogHeader>
      <div className='space-y-4 py-4'>
        <div className='space-y-2'>
          <Label htmlFor='item-name' className='font-medium'>
            File Item Name*
          </Label>
          <Input
            id='item-name'
            placeholder='e.g., Wedding Contract Documents'
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            required
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='description'>Description (Optional)</Label>
          <Textarea
            id='description'
            placeholder='Brief description of what this collection will contain...'
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className='border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center'>
          <FolderPlus className='h-10 w-10 text-gray-400 mb-2' />
          <p className='text-base font-medium text-gray-700 mb-1'>Start with optional files</p>
          <p className='text-sm text-gray-500 mb-3 text-center'>
            Drag files here or click to browse
          </p>
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
            <Label>Files to Include</Label>
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

        <div className='flex items-center space-x-2'>
          <Switch id='send-email' checked={notifyClient} onCheckedChange={setNotifyClient} />
          <Label htmlFor='send-email'>Notify client when created</Label>
        </div>
      </div>
      <DialogFooter>
        <Button variant='outline' onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleAddFile} disabled={!itemName.trim()}>
          Create File Item
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default UploadFileDialog;
