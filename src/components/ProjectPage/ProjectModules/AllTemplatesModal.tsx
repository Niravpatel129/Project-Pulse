'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { newRequest } from '@/utils/newRequest';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, File, Grid, MoreVertical, Search, Text, X } from 'lucide-react';
import { useState } from 'react';

interface AllTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTemplateSelect: (template: any) => void;
  onEdit: (template: any) => void;
}

export default function AllTemplatesModal({
  isOpen,
  onClose,
  onTemplateSelect,
  onEdit,
}: AllTemplatesModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const { data: templates, refetch } = useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const response = await newRequest.get('/module-templates');
      return response.data.data;
    },
    enabled: isOpen,
  });

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      await newRequest.delete(`/module-templates/${templateId}`);
      toast({
        title: 'Success',
        description: 'Template deleted successfully',
      });
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete template',
        variant: 'destructive',
      });
    }
  };

  const getFieldTypeIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <Text className='h-3 w-3 text-blue-500' />;
      case 'number':
        return <span className='text-xs text-blue-500 font-medium'>#</span>;
      case 'date':
        return <Calendar className='h-3 w-3 text-blue-500' />;
      case 'files':
        return <File className='h-3 w-3 text-blue-500' />;
      case 'relation':
        return <span className='text-xs text-blue-500 font-medium'>↔</span>;
      default:
        return <span className='text-xs text-blue-500 font-medium'>•</span>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const filteredTemplates =
    templates?.filter((template) => {
      return template.name.toLowerCase().includes(searchTerm.toLowerCase());
    }) || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-4xl p-0 gap-0'>
        <DialogTitle className='sr-only'>All Templates</DialogTitle>
        <motion.button
          onClick={onClose}
          className='absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground'
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <X className='h-4 w-4' />
          <span className='sr-only'>Close</span>
        </motion.button>

        <motion.div
          className='flex w-full overflow-hidden rounded-lg bg-white'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className='w-full p-5'>
            <motion.div
              className='mb-6'
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className='text-2xl font-semibold text-gray-900'>All Templates</h1>
              <p className='mt-1 text-sm text-gray-500'>Select a template to create a new module</p>
            </motion.div>

            <motion.div
              className='mb-4'
              initial={{ y: -5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
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
            </motion.div>

            <motion.div
              className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              layout
              transition={{
                layout: { duration: 0.3, type: 'spring' },
              }}
            >
              <AnimatePresence mode='popLayout'>
                {filteredTemplates.map((template) => {
                  return (
                    <motion.div
                      key={template._id}
                      className='flex flex-col p-4 border border-gray-200 rounded-lg hover:border-blue-500 transition-colors cursor-pointer relative group'
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                      whileHover={{ scale: 1.02, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => {
                        return onTemplateSelect(template);
                      }}
                    >
                      <div className='flex items-center gap-2 mb-2'>
                        <motion.div
                          className='flex h-8 w-8 items-center justify-center rounded bg-blue-500 text-white'
                          whileHover={{ rotate: 5 }}
                        >
                          <Grid className='h-4 w-4' />
                        </motion.div>
                        <h3 className='text-sm font-medium text-gray-900'>{template.name}</h3>
                      </div>

                      <p className='text-sm text-gray-500 line-clamp-2 mb-3'>
                        {template.description}
                      </p>

                      <div className='mt-auto'>
                        <div className='flex flex-wrap gap-1 mb-2'>
                          <AnimatePresence>
                            {template.fields.slice(0, 3).map((field) => {
                              return (
                                <motion.div
                                  key={field._id}
                                  className='flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded text-xs'
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  {getFieldTypeIcon(field.type)}
                                  <span className='truncate max-w-[80px]'>{field.name}</span>
                                </motion.div>
                              );
                            })}
                            {template.fields.length > 3 && (
                              <motion.div
                                className='bg-gray-100 px-2 py-0.5 rounded text-xs'
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                +{template.fields.length - 3} more
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        <div className='text-xs text-gray-400 mt-1'>
                          Updated {formatDate(template.updatedAt)}
                        </div>
                      </div>

                      <motion.div className='absolute top-2 right-2'>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='h-8 w-8'
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                            >
                              <MoreVertical className='h-4 w-4' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end'>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(template);
                              }}
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTemplate(template._id);
                              }}
                              className='text-red-600'
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </motion.div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
