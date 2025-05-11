'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useEffect, useState } from 'react';

interface AddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
  } | null;
  onSave: (item: {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
  }) => void;
  projectOptions?: any[];
  modules?: any[];
  currency?: string;
}

export default function AddItemDialog({
  open,
  onOpenChange,
  item,
  onSave,
  projectOptions = [],
  modules = [],
  currency = 'usd',
}: AddItemDialogProps) {
  const [formData, setFormData] = useState({
    id: '',
    description: '',
    quantity: 1,
    unitPrice: 0,
    discount: 0,
  });

  useEffect(() => {
    if (item) {
      setFormData({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount || 0,
      });
    } else {
      setFormData({
        id: `item-${Date.now()}`,
        description: '',
        quantity: 1,
        unitPrice: 0,
        discount: 0,
      });
    }
  }, [item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{item ? 'Edit Item' : 'Add New Item'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <Label htmlFor='description'>Description</Label>
            <Textarea
              id='description'
              value={formData.description}
              onChange={(e) => {
                return setFormData({ ...formData, description: e.target.value });
              }}
              placeholder='Enter item description'
              required
            />
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Label htmlFor='quantity'>Quantity</Label>
              <Input
                id='quantity'
                type='number'
                min='1'
                value={formData.quantity}
                onChange={(e) => {
                  return setFormData({ ...formData, quantity: Number(e.target.value) });
                }}
                required
              />
            </div>
            <div>
              <Label htmlFor='unitPrice'>Unit Price</Label>
              <Input
                id='unitPrice'
                type='number'
                min='0'
                step='0.01'
                value={formData.unitPrice}
                onChange={(e) => {
                  return setFormData({ ...formData, unitPrice: Number(e.target.value) });
                }}
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor='discount'>Discount (%)</Label>
            <Input
              id='discount'
              type='number'
              min='0'
              max='100'
              step='0.01'
              value={formData.discount}
              onChange={(e) => {
                return setFormData({ ...formData, discount: Number(e.target.value) });
              }}
            />
          </div>
          <div className='flex justify-end gap-2'>
            <Button
              type='button'
              variant='outline'
              onClick={() => {
                return onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button type='submit'>Save Item</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
