'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Copy, Edit2, Eye, MoreHorizontal, Trash2 } from 'lucide-react';
import { FC, ReactNode } from 'react';
import { FormElementProps } from '../../types/formTypes';

interface FormElementWrapperProps extends FormElementProps {
  children: ReactNode;
}

export const FormElementWrapper: FC<FormElementWrapperProps> = ({
  element,
  isSelected,
  formValues,
  previewMode,
  handleFormValueChange,
  selectElement,
  openElementEditor,
  deleteElement,
  duplicateElement,
  addCondition,
  getValidationErrorMessage,
  children,
}) => {
  // Get validation error if any
  const validationError =
    previewMode && formValues[element.id]
      ? getValidationErrorMessage(element, formValues[element.id])
      : null;

  return (
    <div
      id={`form-element-${element.id}`}
      className={cn(
        'border rounded-xl p-3 md:p-5 transition-all duration-200 hover:shadow-md overflow-hidden',
        isSelected && !previewMode ? 'border-2 border-gray-400 shadow-md' : '',
        element.conditions && element.conditions.length > 0 && !previewMode
          ? 'border-blue-200 bg-blue-50/30'
          : '',
        validationError ? 'border-red-300 bg-red-50/30' : '',
      )}
      onClick={() => {
        return !previewMode && selectElement(element.id);
      }}
    >
      <div className='flex items-center justify-between mb-2'>
        <div className='flex items-center gap-2 overflow-hidden'>
          {/* Title and badges */}
          <span className='text-xs md:text-sm font-medium truncate max-w-[120px] md:max-w-[200px]'>
            {element.title}
          </span>
          {element.required && <span className='text-red-500 flex-shrink-0'>*</span>}

          {/* Conditional indicator (only in edit mode) */}
          {element.conditions && element.conditions.length > 0 && !previewMode && (
            <Badge
              variant='outline'
              className='ml-1 text-xs bg-blue-50 text-blue-600 border-blue-200 hidden sm:inline-flex'
            >
              Conditional
            </Badge>
          )}
        </div>

        {/* Action buttons when not in preview mode */}
        {!previewMode && (
          <div className='flex items-center gap-1'>
            <Button
              variant='ghost'
              size='icon'
              className='h-7 w-7'
              onClick={(e) => {
                e.stopPropagation();
                openElementEditor(element);
              }}
            >
              <Edit2 className='h-4 w-4' />
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant='ghost' size='icon' className='h-7 w-7'>
                  <MoreHorizontal className='h-4 w-4' />
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-56' align='end'>
                <div className='grid gap-1'>
                  <Button
                    variant='ghost'
                    className='justify-start text-sm'
                    onClick={() => {
                      return duplicateElement(element.id);
                    }}
                  >
                    <Copy className='h-4 w-4 mr-2' />
                    Duplicate
                  </Button>
                  <Button
                    variant='ghost'
                    className='justify-start text-sm'
                    onClick={() => {
                      return addCondition(element.id);
                    }}
                  >
                    <Eye className='h-4 w-4 mr-2' />
                    Add Condition
                  </Button>
                  <Button
                    variant='ghost'
                    className='justify-start text-sm text-red-500 hover:text-red-600 hover:bg-red-50'
                    onClick={() => {
                      return deleteElement(element.id);
                    }}
                  >
                    <Trash2 className='h-4 w-4 mr-2' />
                    Delete
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>

      {/* Element description */}
      {element.description && (
        <div className='text-xs md:text-sm text-gray-500 mb-2'>{element.description}</div>
      )}

      {/* Render the actual form element content */}
      {children}

      {/* Validation error message */}
      {validationError && (
        <div className='mt-2 text-sm text-red-500 flex items-center gap-1'>
          <span>{validationError}</span>
        </div>
      )}
    </div>
  );
};
