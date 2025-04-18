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
import React, { useState } from 'react';

interface CustomField {
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'file';
  required: boolean;
}

interface CustomElementData {
  name: string;
  description: string;
  status: string;
  fields: CustomField[];
}

interface CustomElementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (element) => void;
}

export function CustomElementModal({ isOpen, onClose, onAdd }: CustomElementModalProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState<CustomElementData>({
    name: '',
    description: '',
    status: 'draft',
    fields: [],
  });

  // Update local state when prop changes
  React.useEffect(() => {
    if (isOpen) {
      setShowDialog(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    setShowDialog(false);
    // Wait for animation to finish before calling onClose
    setTimeout(() => {
      onClose();
    }, 300); // Adjust this value to match your animation duration
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.fields?.length) return;

    const customElement = {
      type: 'custom',
      name: formData.name,
      description: formData.description,
      content: JSON.stringify(formData.fields),
      version: 1,
      moduleId: '',
      _id: '',
      createdAt: new Date().toISOString(),
      addedBy: {
        _id: '',
        name: 'Current User',
        email: 'user@example.com',
      },
    };

    onAdd(customElement);
    setFormData({
      name: '',
      description: '',
      status: 'draft',
      fields: [],
    });
    handleClose();
  };

  const addField = () => {
    setFormData((prev) => {
      return {
        ...prev,
        fields: [...(prev.fields || []), { name: '', type: 'text', required: false }],
      };
    });
  };

  const updateField = (index: number, field: keyof CustomField, value: string | boolean) => {
    setFormData((prev) => {
      return {
        ...prev,
        fields: prev.fields?.map((f, i) => {
          return i === index ? { ...f, [field]: value } : f;
        }),
      };
    });
  };

  const removeField = (index: number) => {
    setFormData((prev) => {
      return {
        ...prev,
        fields: prev.fields?.filter((_, i) => {
          return i !== index;
        }),
      };
    });
  };

  return (
    <Dialog open={showDialog} onOpenChange={handleClose}>
      <DialogContent className='max-w-3xl'>
        <DialogHeader>
          <DialogTitle>Add Custom Element</DialogTitle>
          <DialogDescription>Create a custom element with custom fields</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label>Element Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => {
                  return setFormData({ ...formData, name: e.target.value });
                }}
                placeholder='Enter element name'
              />
            </div>

            <div className='space-y-2'>
              <div className='flex justify-between items-center'>
                <Label>Custom Fields</Label>
                <Button type='button' variant='outline' size='sm' onClick={addField}>
                  Add Field
                </Button>
              </div>
              <div className='space-y-4'>
                {formData.fields?.map((field, index) => {
                  return (
                    <div key={index} className='flex gap-4 items-start'>
                      <div className='flex-1'>
                        <Input
                          value={field.name}
                          onChange={(e) => {
                            return updateField(index, 'name', e.target.value);
                          }}
                          placeholder='Field name'
                        />
                      </div>
                      <div className='w-32'>
                        <Select
                          value={field.type}
                          onValueChange={(value) => {
                            return updateField(index, 'type', value);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='text'>Text</SelectItem>
                            <SelectItem value='number'>Number</SelectItem>
                            <SelectItem value='date'>Date</SelectItem>
                            <SelectItem value='select'>Select</SelectItem>
                            <SelectItem value='file'>File</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className='flex items-center'>
                        <input
                          type='checkbox'
                          checked={field.required}
                          onChange={(e) => {
                            return updateField(index, 'required', e.target.checked);
                          }}
                          className='mr-2'
                        />
                        <Label>Required</Label>
                      </div>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        onClick={() => {
                          return removeField(index);
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type='button' variant='outline' onClick={handleClose}>
              Cancel
            </Button>
            <Button type='submit'>Add Element</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
