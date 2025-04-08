'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import { useState } from 'react';

interface AddLeadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLeadAdded: () => void;
}

export function AddLeadModal({ open, onOpenChange, onLeadAdded }: AddLeadModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
    status: 'new',
    project: '',
    tags: '',
    source: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement API call to add lead
    console.log('Adding lead:', formData);
    onLeadAdded();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>Add New Lead</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='name'>Name</Label>
              <Input
                id='name'
                value={formData.name}
                onChange={(e) => {
                  return setFormData({ ...formData, name: e.target.value });
                }}
                required
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                type='email'
                value={formData.email}
                onChange={(e) => {
                  return setFormData({ ...formData, email: e.target.value });
                }}
                required
              />
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='phone'>Phone</Label>
              <Input
                id='phone'
                type='tel'
                value={formData.phone}
                onChange={(e) => {
                  return setFormData({ ...formData, phone: e.target.value });
                }}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='status'>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => {
                  return setFormData({ ...formData, status: value });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select status' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='new'>New</SelectItem>
                  <SelectItem value='contacted'>Contacted</SelectItem>
                  <SelectItem value='qualified'>Qualified</SelectItem>
                  <SelectItem value='lost'>Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='project'>Project</Label>
            <Select
              value={formData.project}
              onValueChange={(value) => {
                return setFormData({ ...formData, project: value });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder='Select project' />
              </SelectTrigger>
              <SelectContent>{/* Add project options here */}</SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='notes'>Notes</Label>
            <Textarea
              id='notes'
              value={formData.notes}
              onChange={(e) => {
                return setFormData({ ...formData, notes: e.target.value });
              }}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='tags'>Tags</Label>
            <Input
              id='tags'
              value={formData.tags}
              onChange={(e) => {
                return setFormData({ ...formData, tags: e.target.value });
              }}
              placeholder='Comma-separated tags'
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='source'>Source</Label>
            <Input
              id='source'
              value={formData.source}
              onChange={(e) => {
                return setFormData({ ...formData, source: e.target.value });
              }}
              placeholder='How did you find this lead?'
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
            <Button type='submit'>Add Lead</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
