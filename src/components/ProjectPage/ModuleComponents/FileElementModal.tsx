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
import { format } from 'date-fns';
import { FileText, X } from 'lucide-react';
import { useState } from 'react';

interface FileElement {
  type: 'file';
  name: string;
  description?: string;
  status: string;
  files: Array<{
    name: string;
    type: 'document' | 'image' | '3d';
    size: number;
    comment?: string;
    uploadedAt: string;
  }>;
}

interface FileElementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (element: FileElement) => void;
}

export function FileElementModal({ isOpen, onClose, onAdd }: FileElementModalProps) {
  const [formData, setFormData] = useState<Partial<FileElement>>({
    name: '',
    description: '',
    status: 'draft',
    files: [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.files?.length) return;

    onAdd(formData as FileElement);
    setFormData({
      name: '',
      description: '',
      status: 'draft',
      files: [],
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
              <Label>Upload Files</Label>
              <div className='border-2 border-dashed rounded-lg p-4 text-center min-h-[150px] flex items-center justify-center'>
                <input
                  type='file'
                  multiple
                  className='hidden'
                  id='file-upload'
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    const newFiles = files.map((file) => {
                      return {
                        name: file.name,
                        type: (file.type.startsWith('image/')
                          ? 'image'
                          : file.type.includes('pdf') || file.type.includes('doc')
                          ? 'document'
                          : '3d') as 'document' | 'image' | '3d',
                        size: file.size,
                        uploadedAt: new Date().toISOString(),
                      };
                    });

                    setFormData((prev) => {
                      return {
                        ...prev,
                        files: [...(prev.files || []), ...newFiles],
                      };
                    });
                  }}
                />
                <label
                  htmlFor='file-upload'
                  className='cursor-pointer flex flex-col items-center gap-2'
                >
                  <FileText className='h-8 w-8 text-gray-400' />
                  <span className='text-sm text-gray-500'>
                    Drag and drop files here, or click to select files
                  </span>
                </label>
              </div>
            </div>

            {formData.files?.length > 0 && (
              <div className='space-y-2'>
                <Label>Uploaded Files</Label>
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
                    {formData.files.map((file, index) => {
                      return (
                        <TableRow key={index}>
                          <TableCell className='font-medium'>{file.name}</TableCell>
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
                              }}
                            >
                              <X className='h-4 w-4' />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type='button' variant='outline' onClick={onClose}>
              Cancel
            </Button>
            <Button type='submit'>Add Element</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
