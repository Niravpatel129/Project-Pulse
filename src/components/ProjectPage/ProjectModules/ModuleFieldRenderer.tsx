import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { motion } from 'framer-motion';
import { Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import FileUploadManagerModal from '../FileComponents/FileUploadManagerModal';
import FilePreview from './FilePreview';
import RelationFieldRenderer from './RelationFieldRenderer';

interface ModuleFieldRendererProps {
  field: {
    _id: string;
    name: string;
    type: string;
    required?: boolean;
    description?: string;
    options?: string[];
    selectOptions?: { label: string; value: string }[];
    multiple?: boolean;
    min?: number;
    max?: number;
    step?: number;
    fieldSettings?: {
      multipleFiles?: boolean;
    };
  };
  value: any;
  onChange: (value: any) => void;
}

export default function ModuleFieldRenderer({ field, value, onChange }: ModuleFieldRendererProps) {
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);

  const handleAddFileToProject = (file) => {
    if (field.fieldSettings?.multipleFiles) {
      const currentFiles = Array.isArray(value) ? value : [];
      // Check if file already exists in the array
      const fileExists = currentFiles.some((existingFile) => {
        return existingFile._id === file._id;
      });

      if (fileExists) {
        // Show toast message for duplicate file
        toast.info('File already added', {
          description: 'This file has already been added to the field.',
        });
        return;
      }

      onChange([...currentFiles, file]);
    } else {
      onChange(file);
    }
    setIsFileModalOpen(false);
  };

  const handleRemoveFile = (fileId) => {
    if (field.fieldSettings?.multipleFiles) {
      const currentFiles = Array.isArray(value) ? value : [];
      onChange(
        currentFiles.filter((file) => {
          return file._id !== fileId;
        }),
      );
    } else {
      onChange(null);
    }
  };

  const renderField = () => {
    switch (field.type) {
      case 'text':
        return (
          <Input
            id={field._id}
            placeholder={`Enter ${field.name}`}
            className='mt-1 h-9 border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm transition-all focus-visible:border-gray-300 focus-visible:ring-1 focus-visible:ring-gray-300'
            value={value || ''}
            onChange={(e) => {
              return onChange(e.target.value);
            }}
          />
        );

      case 'number':
        return (
          <Input
            id={field._id}
            type='number'
            min={field.min}
            max={field.max}
            step={field.step}
            placeholder={`Enter ${field.name}`}
            className='mt-1 h-9 border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm transition-all focus-visible:border-gray-300 focus-visible:ring-1 focus-visible:ring-gray-300'
            value={value || ''}
            onChange={(e) => {
              return onChange(e.target.value);
            }}
          />
        );

      case 'select':
      case 'relation':
        if (field.type === 'relation') {
          return <RelationFieldRenderer field={field} value={value} onChange={onChange} />;
        }

        return (
          <Select
            value={
              field.multiple ? undefined : value ? field.options?.indexOf(value).toString() : ''
            }
            onValueChange={(newValue) => {
              if (field.multiple) {
                const currentValues = Array.isArray(value) ? value : [];
                const optionIndex = parseInt(newValue);
                const optionValue = field.options?.[optionIndex];

                if (currentValues.includes(optionValue)) {
                  onChange(
                    currentValues.filter((v) => {
                      return v !== optionValue;
                    }),
                  );
                } else {
                  onChange([...currentValues, optionValue]);
                }
              } else {
                const optionIndex = parseInt(newValue);
                const optionValue = field.options?.[optionIndex];
                onChange(optionValue);
              }
            }}
          >
            <SelectTrigger className='mt-1 h-9 border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm transition-all focus-visible:border-gray-300 focus-visible:ring-1 focus-visible:ring-gray-300'>
              <SelectValue placeholder={`Select ${field.name}`}>
                {field.multiple
                  ? Array.isArray(value) && value.length > 0
                    ? value.join(', ')
                    : ''
                  : value}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, index) => {
                return (
                  <SelectItem key={`${option}-${index}`} value={index.toString()}>
                    {option}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        );

      case 'date':
        return (
          <Input
            id={field._id}
            type='date'
            placeholder={`Select ${field.name}`}
            className='mt-1 h-9 border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm transition-all focus-visible:border-gray-300 focus-visible:ring-1 focus-visible:ring-gray-300'
            value={value || ''}
            onChange={(e) => {
              return onChange(e.target.value);
            }}
          />
        );

      case 'datetime':
        return (
          <Input
            id={field._id}
            type='datetime-local'
            placeholder={`Select ${field.name}`}
            className='mt-1 h-9 border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm transition-all focus-visible:border-gray-300 focus-visible:ring-1 focus-visible:ring-gray-300'
            value={value || ''}
            onChange={(e) => {
              return onChange(e.target.value);
            }}
          />
        );

      case 'time':
        return (
          <Input
            id={field._id}
            type='time'
            placeholder={`Select ${field.name}`}
            className='mt-1 h-9 border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm transition-all focus-visible:border-gray-300 focus-visible:ring-1 focus-visible:ring-gray-300'
            value={value || ''}
            onChange={(e) => {
              return onChange(e.target.value);
            }}
          />
        );

      case 'textarea':
        return (
          <textarea
            id={field._id}
            placeholder={`Enter ${field.name}`}
            className='mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm transition-all focus-visible:border-gray-300 focus-visible:ring-1 focus-visible:ring-gray-300'
            value={value || ''}
            onChange={(e) => {
              return onChange(e.target.value);
            }}
            rows={3}
          />
        );

      case 'files':
        return (
          <div className='space-y-2'>
            <div className='flex flex-wrap gap-2'>
              {Array.isArray(value) ? (
                value.map((file, index) => {
                  return (
                    <FilePreview
                      key={`${file._id}-${index}`}
                      file={file}
                      onRemove={handleRemoveFile}
                    />
                  );
                })
              ) : value ? (
                <FilePreview key={`${value._id}-single`} file={value} onRemove={handleRemoveFile} />
              ) : null}
            </div>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => {
                return setIsFileModalOpen(true);
              }}
              className='gap-2'
            >
              {field.fieldSettings?.multipleFiles ? (
                <>
                  <ImageIcon className='h-4 w-4' />
                  Add Images
                </>
              ) : (
                <>
                  <ImageIcon className='h-4 w-4' />
                  Add Image
                </>
              )}
            </Button>
            <FileUploadManagerModal
              isOpen={isFileModalOpen}
              onClose={() => {
                return setIsFileModalOpen(false);
              }}
              handleAddFileToProject={handleAddFileToProject}
            />
          </div>
        );

      default:
        return (
          <Input
            id={field._id}
            placeholder={`Enter ${field.name}`}
            className='mt-1 h-9 border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm transition-all focus-visible:border-gray-300 focus-visible:ring-1 focus-visible:ring-gray-300'
            value={value || ''}
            onChange={(e) => {
              return onChange(e.target.value);
            }}
          />
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: 0.1 }}
    >
      <Label htmlFor={field._id} className='text-xs font-medium text-gray-700'>
        {field.name}
        {field.required && <span className='text-red-500 ml-1'>*</span>}
      </Label>
      {renderField()}
      {field.description && <p className='mt-1 text-xs text-gray-500'>{field.description}</p>}
    </motion.div>
  );
}
