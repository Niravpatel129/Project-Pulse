import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
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

  const currencySymbol =
    {
      usd: '$',
      cad: 'C$',
      eur: '€',
      gbp: '£',
    }[currency] || '$';

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
        <DialogTitle>
          {item ? 'Edit Item' : 'Add New Item'}
          <div className='text-sm text-gray-500 font-normal'>
            {currencySymbol}
            {formData.unitPrice.toFixed(2)} x {formData.quantity} = {currencySymbol}
            {(formData.unitPrice * formData.quantity).toFixed(2)}
          </div>
        </DialogTitle>
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
                step='any'
                value={
                  formData.quantity === 0 &&
                  document.activeElement === document.getElementById('quantity')
                    ? ''
                    : formData.quantity
                }
                onChange={(e) => {
                  const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                  return setFormData({ ...formData, quantity: value });
                }}
                className='[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='unitPrice'>Unit Price</Label>
              <div className='relative'>
                <span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500'>
                  {currencySymbol}
                </span>
                <Input
                  id='unitPrice'
                  type='number'
                  className='pl-7 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
                  value={
                    formData.unitPrice === 0 &&
                    document.activeElement === document.getElementById('unitPrice')
                      ? ''
                      : formData.unitPrice
                  }
                  onChange={(e) => {
                    const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                    return setFormData({ ...formData, unitPrice: value });
                  }}
                />
              </div>
            </div>
          </div>

          <div className='space-y-2'>
            <Label>Modules</Label>
            <div className='border rounded-md p-2 h-[200px] overflow-y-auto bg-muted/5'>
              {modules.length === 0 ? (
                <div className='h-full flex items-center justify-center text-sm text-muted-foreground'>
                  No modules available
                </div>
              ) : (
                <div className='space-y-1'>
                  {modules.map((module) => {
                    return (
                      <div
                        key={module._id}
                        className='flex items-center space-x-2 py-1.5 px-2 rounded-md hover:bg-muted/50 transition-colors'
                      >
                        <Checkbox
                          id={`module-${module._id}`}
                          checked={formData.moduleIds.includes(module._id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData({
                                ...formData,
                                moduleIds: [...formData.moduleIds, module._id],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                moduleIds: formData.moduleIds.filter((id) => {
                                  return id !== module._id;
                                }),
                              });
                            }
                          }}
                        />
                        <label
                          htmlFor={`module-${module._id}`}
                          className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1'
                        >
                          {module.name}
                        </label>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className='min-h-[32px]'>
              {formData.moduleIds.length > 0 && (
                <div className='flex flex-wrap gap-2'>
                  {formData.moduleIds.map((moduleId) => {
                    const selectedModule = modules.find((m) => {
                      return m._id === moduleId;
                    });
                    return (
                      <Badge
                        key={moduleId}
                        variant='secondary'
                        className='flex items-center gap-1 transition-all hover:bg-secondary/80'
                      >
                        {selectedModule?.name}
                        <button
                          onClick={() => {
                            setFormData({
                              ...formData,
                              moduleIds: formData.moduleIds.filter((id) => {
                                return id !== moduleId;
                              }),
                            });
                          }}
                          className='ml-1 hover:text-destructive transition-colors'
                        >
                          <X className='h-3 w-3' />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>
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
