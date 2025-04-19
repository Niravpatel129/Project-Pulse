import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { AlertCircle, Copy, Edit2, Eye, FileUp, MoreHorizontal, Trash2, X } from 'lucide-react';
import React from 'react';
import { FormElement as FormElementType, FormValues } from '../types';
import { getElementIcon } from '../utils';

interface FormElementProps {
  element: FormElementType;
  selectedElementId: string | null;
  previewMode: boolean;
  formValues: FormValues;
  validationError: string | null;
  openElementEditor: (element: FormElementType) => void;
  selectElement: (id: string) => void;
  duplicateElement: (id: string) => void;
  deleteElement: (id: string) => void;
  removeCondition: (elementId: string, conditionId: string) => void;
  handleFormValueChange: (elementId: string, value: string | string[] | boolean | number) => void;
  getOperatorText: (operator: string) => string;
  formElements: FormElementType[];
  handleDragStart: (e: React.DragEvent, elementId: string) => void;
  handleDragOver: (e: React.DragEvent, elementId: string) => void;
  handleDrop: (e: React.DragEvent, targetElementId: string) => void;
}

const FormElement: React.FC<FormElementProps> = ({
  element,
  selectedElementId,
  previewMode,
  formValues,
  validationError,
  openElementEditor,
  selectElement,
  duplicateElement,
  deleteElement,
  removeCondition,
  handleFormValueChange,
  getOperatorText,
  formElements,
  handleDragStart,
  handleDragOver,
  handleDrop,
}) => {
  return (
    <div
      id={`form-element-${element.id}`}
      key={element.id}
      className={cn(
        'border rounded-xl p-3 md:p-5 transition-all duration-200 hover:shadow-md overflow-hidden',
        selectedElementId === element.id && !previewMode
          ? 'border-2 border-gray-400 shadow-md'
          : '',
        element.conditions && element.conditions.length > 0 && !previewMode
          ? 'border-blue-200 bg-blue-50/30'
          : '',
        validationError ? 'border-red-300 bg-red-50/30' : '',
      )}
      onClick={() => {
        return !previewMode && selectElement(element.id);
      }}
      draggable={!previewMode}
      onDragStart={(e) => {
        return handleDragStart(e, element.id);
      }}
      onDragOver={(e) => {
        return handleDragOver(e, element.id);
      }}
      onDrop={(e) => {
        return handleDrop(e, element.id);
      }}
    >
      <div className='flex items-center justify-between mb-2'>
        <div className='flex items-center gap-2 overflow-hidden'>
          {getElementIcon(element.type)}
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
                      console.log('add condition');
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

      {/* Render different form elements based on type */}
      {element.type === 'Text Block' && (
        <Textarea
          className='w-full mt-2 min-h-[100px]'
          placeholder='Enter text block content'
          value={
            previewMode
              ? (formValues[element.id] as string) || element.content || ''
              : element.content || ''
          }
          onChange={(e) => {
            return previewMode && handleFormValueChange(element.id, e.target.value);
          }}
        />
      )}

      {element.type === 'Single Response' && (
        <Input
          placeholder={element.placeholder || 'Enter your answer'}
          className='mt-2'
          value={previewMode ? (formValues[element.id] as string) || '' : ''}
          onChange={(e) => {
            return previewMode && handleFormValueChange(element.id, e.target.value);
          }}
        />
      )}

      {element.type === 'Long Answer' && (
        <Textarea
          className='w-full mt-2 min-h-[100px]'
          placeholder={element.placeholder || 'Enter your answer'}
          value={previewMode ? (formValues[element.id] as string) || '' : ''}
          onChange={(e) => {
            return previewMode && handleFormValueChange(element.id, e.target.value);
          }}
        />
      )}

      {element.type === 'Short Answer' && (
        <Input
          placeholder={element.placeholder || 'Enter your answer'}
          className='mt-2'
          value={previewMode ? (formValues[element.id] as string) || '' : ''}
          onChange={(e) => {
            return previewMode && handleFormValueChange(element.id, e.target.value);
          }}
        />
      )}

      {element.type === 'Phone Number' && (
        <Input
          placeholder={element.placeholder || 'Enter phone number'}
          className='mt-2'
          value={previewMode ? (formValues[element.id] as string) || '' : ''}
          onChange={(e) => {
            return previewMode && handleFormValueChange(element.id, e.target.value);
          }}
          type='tel'
          required={previewMode && element.required}
          aria-required={element.required}
        />
      )}

      {element.type === 'Email' && (
        <Input
          type='email'
          placeholder={element.placeholder || 'Enter email address'}
          className='mt-2'
          value={previewMode ? (formValues[element.id] as string) || '' : ''}
          onChange={(e) => {
            return previewMode && handleFormValueChange(element.id, e.target.value);
          }}
          required={previewMode && element.required}
          aria-required={element.required}
        />
      )}

      {element.type === 'URL' && (
        <Input
          type='url'
          placeholder={element.placeholder || 'Enter URL (https://example.com)'}
          className='mt-2'
          value={previewMode ? (formValues[element.id] as string) || '' : ''}
          onChange={(e) => {
            return previewMode && handleFormValueChange(element.id, e.target.value);
          }}
          required={previewMode && element.required}
          aria-required={element.required}
        />
      )}

      {element.type === 'Number' && (
        <Input
          type='number'
          placeholder={element.placeholder || 'Enter a number'}
          className='mt-2'
          value={previewMode ? (formValues[element.id] as string) || '' : ''}
          onChange={(e) => {
            return previewMode && handleFormValueChange(element.id, e.target.value);
          }}
        />
      )}

      {element.type === 'Date' && (
        <Input
          type='date'
          className='mt-2'
          value={previewMode ? (formValues[element.id] as string) || '' : ''}
          onChange={(e) => {
            return previewMode && handleFormValueChange(element.id, e.target.value);
          }}
        />
      )}

      {element.type === 'Rating' && (
        <div className='flex gap-2 mt-2'>
          {[1, 2, 3, 4, 5].map((rating) => {
            return (
              <Button
                key={rating}
                variant={previewMode && formValues[element.id] === rating ? 'default' : 'outline'}
                size='icon'
                className='h-10 w-10'
                onClick={() => {
                  return previewMode && handleFormValueChange(element.id, rating);
                }}
              >
                {rating}
              </Button>
            );
          })}
        </div>
      )}

      {element.type === 'Dropdown' && (
        <select
          className='w-full mt-2 p-2 border rounded-md'
          value={previewMode ? (formValues[element.id] as string) || '' : ''}
          onChange={(e) => {
            return previewMode && handleFormValueChange(element.id, e.target.value);
          }}
        >
          <option value='' disabled>
            Select an option
          </option>
          {element.options?.map((option, i) => {
            return (
              <option key={i} value={option}>
                {option}
              </option>
            );
          })}
        </select>
      )}

      {element.type === 'Radio Buttons' && (
        <RadioGroup
          className='mt-2 space-y-2'
          value={previewMode ? (formValues[element.id] as string) || '' : ''}
          onValueChange={(value) => {
            return previewMode && handleFormValueChange(element.id, value);
          }}
        >
          {element.options?.map((option, i) => {
            return (
              <div key={i} className='flex items-center space-x-2'>
                <RadioGroupItem value={option} id={`radio-${element.id}-${i}`} />
                <Label htmlFor={`radio-${element.id}-${i}`}>{option}</Label>
              </div>
            );
          })}
        </RadioGroup>
      )}

      {element.type === 'Checkboxes' && (
        <div className='mt-2 space-y-2'>
          {element.options?.map((option, i) => {
            return (
              <div key={i} className='flex items-center space-x-2'>
                <Checkbox
                  id={`checkbox-${element.id}-${i}`}
                  checked={
                    previewMode ? (formValues[element.id] as string[])?.includes(option) : false
                  }
                  onCheckedChange={(checked) => {
                    if (!previewMode) return;
                    const currentValues = (formValues[element.id] as string[]) || [];
                    if (checked) {
                      handleFormValueChange(element.id, [...currentValues, option]);
                    } else {
                      handleFormValueChange(
                        element.id,
                        currentValues.filter((val) => {
                          return val !== option;
                        }),
                      );
                    }
                  }}
                />
                <Label htmlFor={`checkbox-${element.id}-${i}`}>{option}</Label>
              </div>
            );
          })}
        </div>
      )}

      {element.type === 'File Upload' && (
        <div className='mt-2 border-2 border-dashed border-gray-300 rounded-md p-6 text-center'>
          <FileUp className='h-8 w-8 mx-auto text-gray-400 mb-2' />
          <p className='text-sm text-gray-500'>Drag and drop files here or click to browse</p>
          <Button variant='outline' className='mt-2'>
            Browse Files
          </Button>
        </div>
      )}

      {element.type === 'Client Details' && (
        <div className='mt-2 space-y-4 border rounded-lg p-4 bg-gray-50/50'>
          <div className='flex items-center justify-between border-b pb-2'>
            <span className='font-medium text-gray-700'>Client Information</span>
            {!previewMode && (
              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  return openElementEditor(element);
                }}
                className='text-xs'
              >
                <Edit2 className='h-3 w-3 mr-1' />
                Configure Fields
              </Button>
            )}
          </div>

          <div className='grid gap-3 md:grid-cols-2'>
            {element.clientFields?.email && (
              <div className='space-y-1'>
                <Label htmlFor={`client-email-${element.id}`} className='flex items-center'>
                  Email <span className='text-red-500 ml-1'>*</span>
                  {!previewMode && (
                    <Badge className='ml-2 text-xs bg-blue-100 text-blue-700 border-blue-200'>
                      Required
                    </Badge>
                  )}
                </Label>
                <Input
                  id={`client-email-${element.id}`}
                  type='email'
                  placeholder='client@example.com'
                  value={previewMode ? (formValues[`${element.id}-email`] as string) || '' : ''}
                  onChange={(e) => {
                    return (
                      previewMode && handleFormValueChange(`${element.id}-email`, e.target.value)
                    );
                  }}
                  required
                />
              </div>
            )}

            {element.clientFields?.name && (
              <div className='space-y-1'>
                <Label htmlFor={`client-name-${element.id}`}>Full Name</Label>
                <Input
                  id={`client-name-${element.id}`}
                  placeholder='John Doe'
                  value={previewMode ? (formValues[`${element.id}-name`] as string) || '' : ''}
                  onChange={(e) => {
                    return (
                      previewMode && handleFormValueChange(`${element.id}-name`, e.target.value)
                    );
                  }}
                />
              </div>
            )}

            {element.clientFields?.phone && (
              <div className='space-y-1'>
                <Label htmlFor={`client-phone-${element.id}`}>Phone Number</Label>
                <Input
                  id={`client-phone-${element.id}`}
                  placeholder='(123) 456-7890'
                  value={previewMode ? (formValues[`${element.id}-phone`] as string) || '' : ''}
                  onChange={(e) => {
                    return (
                      previewMode && handleFormValueChange(`${element.id}-phone`, e.target.value)
                    );
                  }}
                />
              </div>
            )}

            {element.clientFields?.company && (
              <div className='space-y-1'>
                <Label htmlFor={`client-company-${element.id}`}>Company</Label>
                <Input
                  id={`client-company-${element.id}`}
                  placeholder='Acme Inc.'
                  value={previewMode ? (formValues[`${element.id}-company`] as string) || '' : ''}
                  onChange={(e) => {
                    return (
                      previewMode && handleFormValueChange(`${element.id}-company`, e.target.value)
                    );
                  }}
                />
              </div>
            )}

            {element.clientFields?.address && (
              <div className='space-y-1 md:col-span-2'>
                <Label htmlFor={`client-address-${element.id}`}>Address</Label>
                <Textarea
                  id={`client-address-${element.id}`}
                  placeholder='123 Main St, City, State, ZIP'
                  value={previewMode ? (formValues[`${element.id}-address`] as string) || '' : ''}
                  onChange={(e) => {
                    return (
                      previewMode && handleFormValueChange(`${element.id}-address`, e.target.value)
                    );
                  }}
                />
              </div>
            )}

            {element.clientFields?.custom &&
              element.clientFields.custom.map((field, index) => {
                return (
                  <div key={index} className='space-y-1'>
                    <Label htmlFor={`client-custom-${element.id}-${index}`}>{field}</Label>
                    <Input
                      id={`client-custom-${element.id}-${index}`}
                      placeholder={`Enter ${field.toLowerCase()}`}
                      value={
                        previewMode
                          ? (formValues[`${element.id}-custom-${index}`] as string) || ''
                          : ''
                      }
                      onChange={(e) => {
                        return (
                          previewMode &&
                          handleFormValueChange(`${element.id}-custom-${index}`, e.target.value)
                        );
                      }}
                    />
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Validation error message */}
      {validationError && (
        <div className='mt-2 text-sm text-red-500 flex items-center gap-1'>
          <AlertCircle className='h-4 w-4' />
          {validationError}
        </div>
      )}

      {/* Conditional logic indicator (only in edit mode) */}
      {!previewMode && element.conditions && element.conditions.length > 0 && (
        <div className='mt-3 pt-3 border-t border-blue-200'>
          <div className='flex items-center gap-2 text-sm text-blue-600'>
            <Eye className='h-4 w-4' />
            <span>This element is shown conditionally</span>
          </div>
          <div className='mt-1 text-xs text-gray-500'>
            {element.showWhen === 'all' ? 'All' : 'Any'} of these conditions must be met:
          </div>
          <div className='mt-2 space-y-2'>
            {element.conditions.map((condition) => {
              const sourceElement = formElements.find((el) => {
                return el.id === condition.sourceElementId;
              });
              return (
                <div
                  key={condition.id}
                  className='text-xs bg-gray-50 p-2 rounded flex items-center justify-between'
                >
                  <span>
                    <span className='font-medium'>{sourceElement?.title || 'Unknown element'}</span>{' '}
                    {getOperatorText(condition.operator)}{' '}
                    {condition.operator !== 'is_empty' && condition.operator !== 'is_not_empty' && (
                      <span className='font-medium'>{condition.value || '(empty)'}</span>
                    )}
                  </span>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-6 w-6 text-gray-400 hover:text-red-500'
                    onClick={() => {
                      return removeCondition(element.id, condition.id);
                    }}
                  >
                    <X className='h-4 w-4' />
                  </Button>
                </div>
              );
            })}
          </div>
          <Button
            variant='outline'
            size='sm'
            className='mt-2 text-xs'
            onClick={() => {
              openElementEditor(element);
            }}
          >
            <Edit2 className='h-3 w-3 mr-1' />
            Edit Conditions
          </Button>
        </div>
      )}
    </div>
  );
};

export default FormElement;
