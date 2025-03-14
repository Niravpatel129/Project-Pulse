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
import { useState } from 'react';

interface InvoiceElement {
  type: 'invoice';
  name: string;
  description?: string;
  status: string;
  clientName: string;
  clientEmail: string;
  dueDate: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
}

interface InvoiceElementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (element: InvoiceElement) => void;
}

export function InvoiceElementModal({ isOpen, onClose, onAdd }: InvoiceElementModalProps) {
  const [formData, setFormData] = useState<Partial<InvoiceElement>>({
    name: '',
    description: '',
    status: 'draft',
    clientName: '',
    clientEmail: '',
    dueDate: '',
    items: [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.clientName || !formData.clientEmail || !formData.dueDate)
      return;

    onAdd(formData as InvoiceElement);
    setFormData({
      name: '',
      description: '',
      status: 'draft',
      clientName: '',
      clientEmail: '',
      dueDate: '',
      items: [],
    });
    onClose();
  };

  const addItem = () => {
    setFormData((prev) => {
      return {
        ...prev,
        items: [...(prev.items || []), { description: '', quantity: 1, unitPrice: 0 }],
      };
    });
  };

  const updateItem = (
    index: number,
    field: keyof InvoiceElement['items'][0],
    value: string | number,
  ) => {
    setFormData((prev) => {
      return {
        ...prev,
        items: prev.items?.map((item, i) => {
          return i === index ? { ...item, [field]: value } : item;
        }),
      };
    });
  };

  const removeItem = (index: number) => {
    setFormData((prev) => {
      return {
        ...prev,
        items: prev.items?.filter((_, i) => {
          return i !== index;
        }),
      };
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-3xl'>
        <DialogHeader>
          <DialogTitle>Add Invoice Element</DialogTitle>
          <DialogDescription>Create a new invoice for this module</DialogDescription>
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
              <Label>Client Name</Label>
              <Input
                value={formData.clientName}
                onChange={(e) => {
                  return setFormData({ ...formData, clientName: e.target.value });
                }}
                placeholder='Enter client name'
              />
            </div>

            <div className='space-y-2'>
              <Label>Client Email</Label>
              <Input
                type='email'
                value={formData.clientEmail}
                onChange={(e) => {
                  return setFormData({ ...formData, clientEmail: e.target.value });
                }}
                placeholder='Enter client email'
              />
            </div>

            <div className='space-y-2'>
              <Label>Due Date</Label>
              <Input
                type='date'
                value={formData.dueDate}
                onChange={(e) => {
                  return setFormData({ ...formData, dueDate: e.target.value });
                }}
              />
            </div>

            <div className='space-y-2'>
              <div className='flex justify-between items-center'>
                <Label>Invoice Items</Label>
                <Button type='button' variant='outline' size='sm' onClick={addItem}>
                  Add Item
                </Button>
              </div>
              <div className='space-y-4'>
                {formData.items?.map((item, index) => {
                  return (
                    <div key={index} className='flex gap-4 items-start'>
                      <div className='flex-1'>
                        <Input
                          value={item.description}
                          onChange={(e) => {
                            return updateItem(index, 'description', e.target.value);
                          }}
                          placeholder='Item description'
                        />
                      </div>
                      <div className='w-24'>
                        <Input
                          type='number'
                          value={item.quantity}
                          onChange={(e) => {
                            return updateItem(index, 'quantity', parseInt(e.target.value));
                          }}
                          placeholder='Qty'
                        />
                      </div>
                      <div className='w-32'>
                        <Input
                          type='number'
                          value={item.unitPrice}
                          onChange={(e) => {
                            return updateItem(index, 'unitPrice', parseFloat(e.target.value));
                          }}
                          placeholder='Price'
                        />
                      </div>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        onClick={() => {
                          return removeItem(index);
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
