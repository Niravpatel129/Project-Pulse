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
import { newRequest } from '@/utils/newRequest';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface DataSheetEntry {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface DataSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingData: DataSheetEntry | null;
}

const DataSheet: React.FC<DataSheetProps> = ({ open, onOpenChange, existingData }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    if (existingData) {
      setTitle(existingData.title);
      setContent(existingData.content);
    } else {
      setTitle('');
      setContent('');
    }
  }, [existingData]);

  const saveDataMutation = useMutation({
    mutationFn: async (data: { title: string; content: string }) => {
      const payload = {
        data: {
          title: data.title,
          text: data.content,
          metadata: {
            type: 'workspace_data',
            source: 'manual_entry',
          },
        },
        storeText: false,
      };

      if (existingData) {
        const response = await newRequest.put(`/new-ai/embed/${existingData._id}`, payload);
        return response.data;
      } else {
        const response = await newRequest.post('/new-ai/embed', payload);
        return response.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['embeddings'] });
      toast.success(existingData ? 'Data updated successfully' : 'Data created successfully');
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error('Failed to save data');
      console.error('Error saving data:', error);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    saveDataMutation.mutate({ title, content });
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
            <Label htmlFor='title'>Title</Label>
            <Input
              id='title'
              value={title}
              onChange={(e) => {
                return setTitle(e.target.value);
              }}
              placeholder='Enter a title for this data'
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
              disabled={saveDataMutation.isPending}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={saveDataMutation.isPending}>
              {saveDataMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default DataSheet;
