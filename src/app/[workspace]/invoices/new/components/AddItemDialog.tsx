import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useProject } from '@/contexts/ProjectContext';
import { useProjectModules } from '@/hooks/useProjectModules';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface AddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    projectIds: string[];
    moduleIds: string[];
    options: Record<string, any>;
    currency: string;
  };
  onSave: (item: {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    projectIds: string[];
    moduleIds: string[];
    options: Record<string, any>;
    currency: string;
  }) => void;
  projectOptions: { label: string; value: string }[];
  modules: any[];
  currency: string;
}

export default function AddItemDialog({
  open,
  onOpenChange,
  item,
  onSave,
  projectOptions,
  modules,
  currency,
}: AddItemDialogProps) {
  const { project } = useProject();
  const { modules: projectModules } = useProjectModules();
  const [formData, setFormData] = useState({
    id: '',
    description: '',
    quantity: 1,
    unitPrice: 0,
    projectIds: [] as string[],
    moduleIds: [] as string[],
    options: {} as Record<string, any>,
    currency: currency || 'usd',
  });

  // Initialize form data when item changes or dialog opens
  useEffect(() => {
    if (open) {
      if (item) {
        // Edit mode
        setFormData({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          projectIds: item.projectIds || [],
          moduleIds: item.moduleIds || [],
          options: item.options || {},
          currency: item.currency || currency || 'usd',
        });
      } else {
        // Create mode
        setFormData({
          id: '',
          description: '',
          quantity: 1,
          unitPrice: 0,
          projectIds: [],
          moduleIds: [],
          options: {},
          currency: currency || 'usd',
        });
      }
    }
  }, [open, item, currency]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.description.trim()) {
      toast.error('Description is required');
      return;
    }
    if (formData.quantity <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }
    if (formData.unitPrice < 0) {
      toast.error('Unit price cannot be negative');
      return;
    }

    // Call the save handler with the form data
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogTitle>{item ? 'Edit Item' : 'Add New Item'}</DialogTitle>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='description'>Description</Label>
            <Input
              id='description'
              value={formData.description}
              onChange={(e) => {
                return setFormData({ ...formData, description: e.target.value });
              }}
              placeholder='Enter item description'
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='quantity'>Quantity</Label>
              <Input
                id='quantity'
                type='number'
                min='1'
                value={formData.quantity}
                onChange={(e) => {
                  return setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 });
                }}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='unitPrice'>Unit Price</Label>
              <Input
                id='unitPrice'
                type='number'
                min='0'
                step='0.01'
                value={formData.unitPrice}
                onChange={(e) => {
                  return setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 });
                }}
              />
            </div>
          </div>

          <div className='space-y-2'>
            <Label>Modules</Label>
            <Select
              value={formData.moduleIds[0] || ''}
              onValueChange={(value) => {
                return setFormData({ ...formData, moduleIds: [value] });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder='Select module' />
              </SelectTrigger>
              <SelectContent>
                {modules.map((module) => {
                  return (
                    <SelectItem key={module._id} value={module._id}>
                      {module.name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className='flex justify-end space-x-2'>
            <Button
              type='button'
              variant='outline'
              onClick={() => {
                return onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button type='submit'>{item ? 'Update' : 'Add'} Item</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
