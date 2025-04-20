import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormFieldType } from '@/components/ui/form-field';
import { Separator } from '@/components/ui/separator';
import React, { useState } from 'react';
import { toast } from 'sonner';

export interface FormElement {
  id: string;
  type: string; // Changed from FormFieldType to string to accept API types
  title?: string;
  description?: string;
  required?: boolean;
  order?: number;
  showWhen?: 'always' | 'all' | 'any';
  options?: Array<{ label: string; value: string }>;
  conditions?: any[];
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
  [key: string]: any;
}

export interface FormData {
  id: string;
  title: string;
  description?: string;
  elements: FormElement[];
  status: 'draft' | 'published' | 'archived';
  [key: string]: any;
}

interface FormBuilderProps {
  formData: FormData;
  onSubmit?: (data: any) => Promise<void>;
  isPreview?: boolean;
  isLoading?: boolean;
  className?: string;
}

// Map API field types to our component field types
const mapFieldType = (apiType: string): FormFieldType => {
  const typeMap: Record<string, FormFieldType> = {
    'Text Block': 'textBlock',
    'Client Details': 'clientDetails',
    'Long Answer': 'textarea',
    'Short Answer': 'text',
    Email: 'email',
    Phone: 'phone',
    Number: 'number',
    Date: 'date',
    Dropdown: 'select',
    'Multiple Choice': 'radio',
    Checkbox: 'checkbox',
    'File Upload': 'file',
    Switch: 'switch',
    'Radio Buttons': 'radio',
    Checkboxes: 'checkbox',
    Rating: 'rating',
  };

  return typeMap[apiType] || 'text';
};

// Transform string options to required { label, value } format
const transformOptions = (options: any[] | undefined) => {
  if (!options) return [];

  // If options are already in the correct format, return them
  if (
    options.length > 0 &&
    typeof options[0] === 'object' &&
    'label' in options[0] &&
    'value' in options[0]
  ) {
    return options;
  }

  // Transform string options to the required format
  return options.map((option) => {
    // If option is already an object but doesn't have label/value format
    if (typeof option === 'object' && option !== null) {
      return {
        label: option.text || option.name || option.label || String(option),
        value: option.id || option.value || String(option),
      };
    }

    // If option is a string or number
    return {
      label: String(option),
      value: String(option),
    };
  });
};

export function FormBuilder({
  formData,
  onSubmit,
  isPreview = false,
  isLoading = false,
  className = '',
}: FormBuilderProps) {
  const [values, setValues] = useState<Record<string, any>>({});
  const [files, setFiles] = useState<Record<string, File>>({});
  const [submitting, setSubmitting] = useState(false);

  // Sort elements by order if available
  const sortedElements = [...formData.elements].sort((a, b) => {
    return (a.order || 0) - (b.order || 0);
  });

  const handleFieldChange = (elementId: string, value: any) => {
    // Handle file uploads separately
    if (value instanceof File) {
      setFiles((prev) => {
        return {
          ...prev,
          [elementId]: value,
        };
      });
    }

    setValues((prev) => {
      return {
        ...prev,
        [elementId]: value,
      };
    });
  };

  // Transform collected form data to the desired format
  const transformFormData = () => {
    const formId = formData.id;
    const formFields = [];

    // Process form values
    for (const elementId in values) {
      // Find the element that corresponds to this value
      const element = formData.elements.find((el) => {
        return el.id === elementId;
      });

      if (element) {
        formFields.push({
          id: elementId,
          label: element.title || elementId, // Use title as label or fall back to ID
          value: values[elementId],
          type: element.type,
        });
      } else if (
        elementId === 'email' ||
        elementId === 'name' ||
        elementId === 'phone' ||
        elementId === 'company' ||
        elementId === 'address'
      ) {
        // Handle client detail fields that might not have a direct element
        formFields.push({
          id: elementId,
          label: elementId.charAt(0).toUpperCase() + elementId.slice(1),
          value: values[elementId],
        });
      }
    }

    return {
      formId,
      fields: formFields,
      files,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!onSubmit) return;

    try {
      setSubmitting(true);

      // Transform to the desired format before submission
      const formattedData = transformFormData();

      await onSubmit(formattedData);

      // Reset form after successful submission
      setValues({});
      setFiles({});

      toast.success('Form submitted successfully');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to submit form');
    } finally {
      setSubmitting(false);
    }
  };

  // Check if an element should be visible based on its conditions
  const shouldShowElement = (element: FormElement): boolean => {
    if (!element.conditions || element.conditions.length === 0) {
      return true;
    }

    // Logic for showing/hiding based on conditions
    // This is a simple implementation - expand as needed
    if (element.showWhen === 'all') {
      return element.conditions.every((condition) => {
        const fieldValue = values[condition.fieldId];
        return condition.operator === 'equals'
          ? fieldValue === condition.value
          : fieldValue !== condition.value;
      });
    } else {
      // 'any' or default
      return element.conditions.some((condition) => {
        const fieldValue = values[condition.fieldId];
        return condition.operator === 'equals'
          ? fieldValue === condition.value
          : fieldValue !== condition.value;
      });
    }
  };

  return (
    <Card className={`shadow-sm ${className}`}>
      <CardHeader className='bg-primary/5 border-b'>
        <CardTitle className='text-xl md:text-2xl'>{formData.title || 'Untitled Form'}</CardTitle>
        {formData.description && (
          <CardDescription className='mt-2'>{formData.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className='p-6'>
        <form onSubmit={handleSubmit} className='space-y-8'>
          {sortedElements.map((element) => {
            // Skip if element shouldn't be shown based on conditions
            if (!shouldShowElement(element)) {
              return null;
            }

            // Map API type to component type
            const fieldType = mapFieldType(element.type);

            return (
              <div key={element.id} className='space-y-4'>
                <FormField
                  id={element.id}
                  type={fieldType}
                  label={element.title}
                  description={element.description}
                  placeholder={element.placeholder}
                  required={element.required}
                  disabled={isLoading || submitting || isPreview}
                  value={fieldType === 'clientDetails' ? values : values[element.id]}
                  onChange={
                    fieldType === 'clientDetails'
                      ? (value) => {
                          return setValues((prev) => {
                            return { ...prev, ...value };
                          });
                        }
                      : (value) => {
                          return handleFieldChange(element.id, value);
                        }
                  }
                  options={transformOptions(element.options)}
                  clientFields={element.clientFields}
                />
                {element !== sortedElements[sortedElements.length - 1] && (
                  <Separator className='my-2' />
                )}
              </div>
            );
          })}

          {!isPreview && onSubmit && (
            <div className='pt-4'>
              <Button type='submit' className='w-full py-6' disabled={isLoading || submitting}>
                {submitting ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
