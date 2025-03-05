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
import { Plus } from 'lucide-react';
import React, { useState } from 'react';

interface CreateModuleDialogProps {
  onClose: () => void;
  onCreateModule: (moduleData: {
    name: string;
    description: string;
    status: 'draft' | 'active' | 'completed' | 'archived';
    isTemplate: boolean;
  }) => void;
}

const CreateModuleDialog: React.FC<CreateModuleDialogProps> = ({ onClose, onCreateModule }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'draft' | 'active' | 'completed' | 'archived'>('draft');
  const [isTemplate, setIsTemplate] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateModule({
      name,
      description,
      status,
      isTemplate,
    });
    onClose();
  };

  return (
    <DialogContent className='sm:max-w-[500px]'>
      <DialogHeader>
        <DialogTitle>Create New Module</DialogTitle>
        <DialogDescription>
          Create a new module to organize your project components and workflows.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className='space-y-4 py-4'>
        <div className='space-y-2'>
          <Label htmlFor='module-name'>Module Name</Label>
          <Input
            id='module-name'
            placeholder='e.g., Design Review, Client Approval, Production'
            value={name}
            onChange={(e) => {
              return setName(e.target.value);
            }}
            required
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='module-description'>Description</Label>
          <Textarea
            id='module-description'
            placeholder='Describe the purpose and scope of this module...'
            value={description}
            onChange={(e) => {
              return setDescription(e.target.value);
            }}
            rows={3}
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='module-status'>Status</Label>
          <Select
            value={status}
            onValueChange={(value: any) => {
              return setStatus(value);
            }}
          >
            <SelectTrigger id='module-status'>
              <SelectValue placeholder='Select status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='draft'>Draft</SelectItem>
              <SelectItem value='active'>Active</SelectItem>
              <SelectItem value='completed'>Completed</SelectItem>
              <SelectItem value='archived'>Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='flex items-center space-x-2'>
          <Switch id='is-template' checked={isTemplate} onCheckedChange={setIsTemplate} />
          <Label htmlFor='is-template'>Save as Template</Label>
        </div>
      </form>

      <DialogFooter>
        <Button variant='outline' onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={!name.trim()}>
          <Plus className='mr-2 h-4 w-4' />
          Create Module
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default CreateModuleDialog;
