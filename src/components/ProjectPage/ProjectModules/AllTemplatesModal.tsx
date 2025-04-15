'use client';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { newRequest } from '@/utils/newRequest';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Grid, Search, X } from 'lucide-react';
import { useState } from 'react';

interface AllTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTemplateSelect: (template: any) => void;
}

export default function AllTemplatesModal({
  isOpen,
  onClose,
  onTemplateSelect,
}: AllTemplatesModalProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: templates } = useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const response = await newRequest.get('/module-templates');
      return response.data.data;
    },
    enabled: isOpen,
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-4xl p-0 gap-0'>
        <DialogTitle className='sr-only'>All Templates</DialogTitle>
        <button
          onClick={onClose}
          className='absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground'
        >
          <X className='h-4 w-4' />
          <span className='sr-only'>Close</span>
        </button>

        <div className='flex w-full overflow-hidden rounded-lg bg-white'>
          <div className='w-full p-5'>
            <div className='mb-6'>
              <h1 className='text-2xl font-semibold text-gray-900'>All Templates</h1>
              <p className='mt-1 text-sm text-gray-500'>Select a template to create a new module</p>
            </div>

            <div className='mb-4'>
              <div className='relative'>
                <Search className='absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                <input
                  type='text'
                  placeholder='Search templates...'
                  className='w-full pl-8 pr-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500'
                  value={searchTerm}
                  onChange={(e) => {
                    return setSearchTerm(e.target.value);
                  }}
                />
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {templates
                ?.filter((template) => {
                  return template.name.toLowerCase().includes(searchTerm.toLowerCase());
                })
                .map((template) => {
                  return (
                    <motion.div
                      key={template._id}
                      className='flex flex-col p-4 border border-gray-200 rounded-lg hover:border-blue-500 transition-colors cursor-pointer'
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        return onTemplateSelect(template);
                      }}
                    >
                      <div className='flex items-center gap-2 mb-2'>
                        <div className='flex h-8 w-8 items-center justify-center rounded bg-blue-500 text-white'>
                          <Grid className='h-4 w-4' />
                        </div>
                        <h3 className='text-sm font-medium text-gray-900'>{template.name}</h3>
                      </div>
                      <p className='text-sm text-gray-500 line-clamp-2'>{template.description}</p>
                    </motion.div>
                  );
                })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
