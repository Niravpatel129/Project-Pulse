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
import { File, Image as ImageIcon, X } from 'lucide-react';
import Image from 'next/image';
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
                    <div key={`${file._id}-${index}`} className='relative w-24'>
                      {file.contentType?.startsWith('image/') ? (
                        <div className='relative w-24 h-24 rounded-md overflow-hidden border'>
                          <Image
                            src={file.downloadURL}
                            alt={file.originalName}
                            fill
                            className='object-cover'
                          />
                          <div className='absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] font-bold py-0.5 px-1 text-center'>
                            {file.contentType.split('/')[1]?.toUpperCase() || 'IMG'}
                          </div>
                          <button
                            onClick={() => {
                              return handleRemoveFile(file._id);
                            }}
                            className='absolute top-1 right-1 p-1 bg-black/40 rounded-full text-white -hover:opacity-100 transition-opacity z-10'
                          >
                            <X className='h-3 w-3' />
                          </button>
                        </div>
                      ) : (
                        <div className='relative w-24 h-24 rounded-md overflow-hidden border bg-gray-100 flex flex-col items-center justify-center p-2 group'>
                          <File className='h-6 w-6 text-gray-500' />
                          <span className='text-xs text-center text-gray-700 mt-1 line-clamp-2'>
                            {file.originalName}
                          </span>
                          <div className='absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] font-bold py-0.5 px-1 text-center'>
                            {file.contentType.split('/')[1]?.toUpperCase() || 'FILE'}
                          </div>
                          <button
                            onClick={() => {
                              return handleRemoveFile(file._id);
                            }}
                            className='absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity z-10'
                          >
                            <X className='h-3 w-3' />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : value ? (
                <div key={`${value._id}-single`} className='relative w-24'>
                  {value.contentType?.startsWith('image/') ? (
                    <div className='relative w-24 h-24 rounded-md overflow-hidden border group'>
                      <Image
                        src={value.downloadURL}
                        alt={value.originalName}
                        fill
                        className='object-cover'
                      />
                      <div className='absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] font-bold py-0.5 px-1 text-center'>
                        {value.contentType.split('/')[1]?.toUpperCase() || 'IMG'}
                      </div>
                      <button
                        onClick={() => {
                          return handleRemoveFile(value._id);
                        }}
                        className='absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white opacity-100 transition-opacity z-10'
                      >
                        <X className='h-3 w-3' />
                      </button>
                    </div>
                  ) : (
                    <div className='relative w-24 h-24 rounded-md overflow-hidden border bg-gray-100 flex flex-col items-center justify-center p-2 group'>
                      <File className='h-6 w-6 text-gray-500' />
                      <span className='text-xs text-center text-gray-700 mt-1 line-clamp-2'>
                        {value.originalName}
                      </span>
                      <div className='absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] font-bold py-0.5 px-1 text-center'>
                        {value.contentType.split('/')[1]?.toUpperCase() || 'FILE'}
                      </div>
                      <button
                        onClick={() => {
                          return handleRemoveFile(value._id);
                        }}
                        className='absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white opacity-100 transition-opacity z-10'
                      >
                        <X className='h-3 w-3' />
                      </button>
                    </div>
                  )}
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
