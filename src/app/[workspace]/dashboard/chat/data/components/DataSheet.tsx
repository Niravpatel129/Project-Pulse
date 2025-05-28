'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import React, { useEffect, useState } from 'react';

interface DataEntry {
  _id: string;
  name: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface DataSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingData: DataEntry | null;
}

const DataSheet: React.FC<DataSheetProps> = ({ open, onOpenChange, existingData }) => {
  const [name, setName] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (existingData) {
      setName(existingData.name);
      setContent(existingData.content);
    } else {
      setName('');
      setContent('');
    }
  }, [existingData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement API call to save data
    console.log('Saving data:', { name, content });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='sm:max-w-[600px]'>
        <SheetHeader>
          <SheetTitle>{existingData ? 'Edit Data' : 'Add New Data'}</SheetTitle>
          <SheetDescription>
            {existingData
              ? 'Edit your existing data entry.'
              : 'Create a new data entry for your AI agents.'}
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className='space-y-6 mt-6'>
          <div className='space-y-2'>
            <Label htmlFor='name'>Name</Label>
            <Input
              id='name'
              value={name}
              onChange={(e) => {
                return setName(e.target.value);
              }}
              placeholder='Enter a name for this data'
              required
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='content'>Content</Label>
            <Textarea
              id='content'
              value={content}
              onChange={(e) => {
                return setContent(e.target.value);
              }}
              placeholder='Enter your data content here...'
              className='min-h-[300px]'
              required
            />
          </div>
          <div className='flex justify-end space-x-2'>
            <Button
              variant='outline'
              onClick={() => {
                return onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button type='submit'>Save</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default DataSheet;
