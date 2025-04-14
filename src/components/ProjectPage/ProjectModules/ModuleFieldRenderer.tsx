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
import { File } from 'lucide-react';
import { useState } from 'react';
import FileUploadManagerModal from '../FileComponents/FileUploadManagerModal';

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
          return (
            <Select value={value || ''} onValueChange={onChange}>
              <SelectTrigger className='mt-1 h-9 border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm transition-all focus-visible:border-gray-300 focus-visible:ring-1 focus-visible:ring-gray-300'>
                <SelectValue placeholder={`Select ${field.name}`} />
              </SelectTrigger>
              <SelectContent>
                {field.selectOptions?.map((option, index) => {
                  return (
                    <SelectItem key={`${option.value}-${index}`} value={option.value}>
                      {option.label}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          );
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
                    <div
                      key={`${file._id}-${index}`}
                      className='flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-md'
                    >
                      <File className='h-4 w-4' />
                      <span className='text-sm'>{file.originalName}</span>
                      <button
                        onClick={() => {
                          return handleRemoveFile(file._id);
                        }}
                        className='text-gray-500 hover:text-gray-700'
                      >
                        ×
                      </button>
                    </div>
                  );
                })
              ) : value ? (
                <div
                  key={`${value._id}-single`}
                  className='flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-md'
                >
                  <File className='h-4 w-4' />
                  <span className='text-sm'>{value.originalName}</span>
                  <button
                    onClick={() => {
                      return handleRemoveFile(value._id);
                    }}
                    className='text-gray-500 hover:text-gray-700'
                  >
                    ×
                  </button>
                </div>
              ) : null}
            </div>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => {
                return setIsFileModalOpen(true);
              }}
            >
              {field.fieldSettings?.multipleFiles ? 'Add Files' : 'Add File'}
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
