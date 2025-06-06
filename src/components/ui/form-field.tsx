import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from './button';
import { Calendar } from './calendar';
import { Checkbox } from './checkbox';
import { Input } from './input';
import { Label } from './label';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { RadioGroup, RadioGroupItem } from './radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Switch } from './switch';
import { Textarea } from './textarea';

export type FormFieldType =
  | 'text'
  | 'textarea'
  | 'email'
  | 'phone'
  | 'number'
  | 'date'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'switch'
  | 'address'
  | 'file'
  | 'textBlock'
  | 'clientDetails'
  | 'rating'
  | 'checkboxGroup';

export interface SelectOption {
  label: string;
  value: string;
}

export interface RadioOption {
  label: string;
  value: string;
}

export interface FormFieldProps {
  id: string;
  type: FormFieldType;
  label?: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  value?: any;
  onChange?: (value: any) => void;
  options?: SelectOption[] | RadioOption[];
  min?: number;
  max?: number;
  step?: number;
  clientFields?: {
    email?: boolean;
    name?: boolean;
    phone?: boolean;
    address?: boolean;
    company?: boolean;
    custom?: Array<{
      id: string;
      label: string;
      placeholder?: string;
    }>;
  };
  className?: string;
}

export function FormField({
  id,
  type,
  label,
  description,
  placeholder,
  required,
  disabled,
  value,
  onChange,
  options = [],
  min,
  max,
  step = 1,
  clientFields,
  className,
}: FormFieldProps) {
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);

  // Handle client details - collects various client information fields
  if (type === 'clientDetails') {
    return (
      <div className={cn('space-y-4', className)}>
        <div className='flex items-start gap-2'>
          <CheckCircle2 className='h-5 w-5 text-primary mt-0.5' />
          <div>
            <h3 className='text-lg font-medium'>{label || 'Client Details'}</h3>
            {description && <p className='text-sm text-muted-foreground'>{description}</p>}
          </div>
        </div>

        <hr className='my-3' />

        {clientFields?.email && (
          <div className='space-y-2'>
            <Label htmlFor={`${id}-email`} className='font-medium'>
              Email{required && <span className='text-destructive ml-1'>*</span>}
            </Label>
            <Input
              id={`${id}-email`}
              type='email'
              placeholder='your@email.com'
              required={required}
              disabled={disabled}
              value={value?.email || ''}
              onChange={(e) => {
                return onChange?.({ ...value, email: e.target.value });
              }}
              className='w-full'
            />
          </div>
        )}

        {clientFields?.name && (
          <div className='space-y-2'>
            <Label htmlFor={`${id}-name`} className='font-medium'>
              Name{required && <span className='text-destructive ml-1'>*</span>}
            </Label>
            <Input
              id={`${id}-name`}
              placeholder='Your name'
              required={required}
              disabled={disabled}
              value={value?.name || ''}
              onChange={(e) => {
                return onChange?.({ ...value, name: e.target.value });
              }}
              className='w-full'
            />
          </div>
        )}

        {clientFields?.phone && (
          <div className='space-y-2'>
            <Label htmlFor={`${id}-phone`} className='font-medium'>
              Phone{required && <span className='text-destructive ml-1'>*</span>}
            </Label>
            <Input
              id={`${id}-phone`}
              type='tel'
              placeholder='Your phone number'
              required={required}
              disabled={disabled}
              value={value?.phone || ''}
              onChange={(e) => {
                return onChange?.({ ...value, phone: e.target.value });
              }}
              className='w-full'
            />
          </div>
        )}

        {clientFields?.company && (
          <div className='space-y-2'>
            <Label htmlFor={`${id}-company`} className='font-medium'>
              Company{required && <span className='text-destructive ml-1'>*</span>}
            </Label>
            <Input
              id={`${id}-company`}
              placeholder='Your company name'
              required={required}
              disabled={disabled}
              value={value?.company || ''}
              onChange={(e) => {
                return onChange?.({ ...value, company: e.target.value });
              }}
              className='w-full'
            />
          </div>
        )}

        {clientFields?.address && (
          <div className='space-y-2'>
            <Label htmlFor={`${id}-address`} className='font-medium'>
              Address{required && <span className='text-destructive ml-1'>*</span>}
            </Label>
            <Textarea
              id={`${id}-address`}
              placeholder='Your address'
              required={required}
              disabled={disabled}
              value={value?.address || ''}
              onChange={(e) => {
                return onChange?.({ ...value, address: e.target.value });
              }}
              className='w-full'
            />
          </div>
        )}

        {clientFields?.custom?.length > 0 &&
          clientFields.custom.map((customField) => {
            return (
              <div key={customField.id} className='space-y-2'>
                <Label htmlFor={`${id}-${customField.id}`} className='font-medium'>
                  {customField.label}
                  {required && <span className='text-destructive ml-1'>*</span>}
                </Label>
                <Input
                  id={`${id}-${customField.id}`}
                  placeholder={customField.placeholder || `Enter ${customField.label}`}
                  required={required}
                  disabled={disabled}
                  value={value?.[customField.id] || ''}
                  onChange={(e) => {
                    return onChange?.({ ...value, [customField.id]: e.target.value });
                  }}
                  className='w-full'
                />
              </div>
            );
          })}
      </div>
    );
  }

  // Text block - displays text content
  if (type === 'textBlock') {
    return (
      <div className={cn('prose max-w-none', className)}>
        <h3 className='text-lg font-medium'>{label}</h3>
        {description && <p className='text-muted-foreground'>{description}</p>}
      </div>
    );
  }

  // Regular form field rendering
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label htmlFor={id} className='font-medium'>
          {label}
          {required && <span className='text-destructive ml-1'>*</span>}
        </Label>
      )}

      {description && <p className='text-sm text-muted-foreground mb-2'>{description}</p>}

      {type === 'text' && (
        <Input
          id={id}
          type='text'
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          value={value || ''}
          onChange={(e) => {
            return onChange?.(e.target.value);
          }}
          className='w-full'
        />
      )}

      {type === 'email' && (
        <Input
          id={id}
          type='email'
          placeholder={placeholder || 'your@email.com'}
          required={required}
          disabled={disabled}
          value={value || ''}
          onChange={(e) => {
            return onChange?.(e.target.value);
          }}
          className='w-full'
        />
      )}

      {type === 'phone' && (
        <Input
          id={id}
          type='tel'
          placeholder={placeholder || 'Your phone number'}
          required={required}
          disabled={disabled}
          value={value || ''}
          onChange={(e) => {
            return onChange?.(e.target.value);
          }}
          className='w-full'
        />
      )}

      {type === 'number' && (
        <Input
          id={id}
          type='number'
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          value={value || ''}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            return onChange?.(e.target.value);
          }}
          className='w-full'
        />
      )}

      {type === 'textarea' && (
        <Textarea
          id={id}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          value={value || ''}
          onChange={(e) => {
            return onChange?.(e.target.value);
          }}
          className='w-full min-h-[100px]'
        />
      )}

      {type === 'date' && (
        <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant='outline'
              className={cn(
                'w-full justify-start text-left font-normal',
                !value && 'text-muted-foreground',
              )}
            >
              <CalendarIcon className='mr-2 h-4 w-4' />
              {value ? format(value, 'PPP') : placeholder || 'Select a date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-auto p-0 min-w-[400px]'>
            <Calendar
              mode='single'
              selected={value}
              onSelect={(date) => {
                onChange?.(date);
                if (date) {
                  setDatePopoverOpen(false);
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      )}

      {type === 'select' && (
        <Select value={value} onValueChange={onChange} disabled={disabled}>
          <SelectTrigger className='w-full'>
            <SelectValue placeholder={placeholder || 'Select an option'} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => {
              return (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      )}

      {type === 'checkbox' && (
        <div className='flex items-center space-x-2'>
          <Checkbox id={id} checked={!!value} onCheckedChange={onChange} disabled={disabled} />
          {label && (
            <label htmlFor={id} className='text-sm font-medium leading-none cursor-pointer'>
              {label}
            </label>
          )}
        </div>
      )}

      {type === 'checkboxGroup' && (
        <div className='space-y-3'>
          <div className='space-y-2'>
            {options.map((option) => {
              // Initialize value as an array if it's not already
              const selectedValues = Array.isArray(value) ? value : value ? [value] : [];
              const isChecked = selectedValues.includes(option.value);

              return (
                <div key={option.value} className='flex items-center space-x-2'>
                  <Checkbox
                    id={`${id}-${option.value}`}
                    checked={isChecked}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        // Add to selected values
                        onChange?.([...selectedValues, option.value]);
                      } else {
                        // Remove from selected values
                        onChange?.(
                          selectedValues.filter((v) => {
                            return v !== option.value;
                          }),
                        );
                      }
                    }}
                    disabled={disabled}
                  />
                  <label
                    htmlFor={`${id}-${option.value}`}
                    className='text-sm font-medium leading-none cursor-pointer'
                  >
                    {option.label}
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {type === 'switch' && (
        <div className='flex items-center space-x-2'>
          <Switch id={id} checked={!!value} onCheckedChange={onChange} disabled={disabled} />
          {label && (
            <label htmlFor={id} className='text-sm font-medium leading-none cursor-pointer'>
              {label}
            </label>
          )}
        </div>
      )}

      {type === 'radio' && (
        <RadioGroup
          value={value}
          onValueChange={onChange}
          disabled={disabled}
          className='space-y-2'
        >
          {options.map((option) => {
            return (
              <div key={option.value} className='flex items-center space-x-2'>
                <RadioGroupItem value={option.value} id={`${id}-${option.value}`} />
                <label
                  htmlFor={`${id}-${option.value}`}
                  className='text-sm font-medium leading-none cursor-pointer'
                >
                  {option.label}
                </label>
              </div>
            );
          })}
        </RadioGroup>
      )}

      {type === 'file' && (
        <div className='space-y-3'>
          <Input
            id={id}
            type='file'
            required={required}
            disabled={disabled}
            multiple={true}
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                // Create an array of files from the FileList
                const filesArray = Array.from(e.target.files);
                return onChange?.(filesArray);
              }
              return onChange?.(null);
            }}
            className='w-full'
          />

          {Array.isArray(value) && value.length > 0 && (
            <div className='mt-2 space-y-2'>
              <div className='flex items-center justify-between'>
                <p className='text-sm text-gray-500'>Selected files: {value.length}</p>
                {value.length > 1 && (
                  <button
                    type='button'
                    className='text-xs text-red-500 hover:text-red-700'
                    onClick={() => {
                      return onChange?.(null);
                    }}
                  >
                    Clear all
                  </button>
                )}
              </div>
              <div className='space-y-1'>
                {value.map((file: File, index: number) => {
                  return (
                    <div
                      key={index}
                      className='flex items-center justify-between bg-gray-50 p-2 rounded text-sm'
                    >
                      <span className='truncate max-w-[250px]'>{file.name}</span>
                      <button
                        type='button'
                        className='text-gray-500 hover:text-red-500'
                        onClick={() => {
                          // Remove this file from the array
                          const newFiles = [...value];
                          newFiles.splice(index, 1);
                          // If we removed all files, return null or empty array based on your preference
                          onChange?.(newFiles.length > 0 ? newFiles : null);
                        }}
                      >
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='h-4 w-4'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M6 18L18 6M6 6l12 12'
                          />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {type === 'rating' && (
        <div className='flex gap-2 mt-2'>
          {[1, 2, 3, 4, 5].map((rating) => {
            return (
              <Button
                key={rating}
                type='button'
                variant={value === rating ? 'default' : 'outline'}
                size='icon'
                className='h-10 w-10'
                onClick={() => {
                  return onChange?.(rating);
                }}
                disabled={disabled}
              >
                {rating}
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}
