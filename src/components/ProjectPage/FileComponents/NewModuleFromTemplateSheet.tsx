import { Template, TemplateField } from '@/api/models';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { useProject } from '@/contexts/ProjectContext';
import { newRequest } from '@/utils/newRequest';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Calendar, CheckSquare, Database, File, FileText, Hash, Plus, Type } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface NewModuleFromTemplateSheetProps {
  isOpen: boolean;
  onClose: () => void;
  template: Template;
  templateName?: string;
}

// Extend the TemplateField type to include the API response structure
interface ExtendedTemplateField extends Omit<TemplateField, 'id' | 'relationType'> {
  _id: string; // This is the fieldId from Mongoose
  selectOptions?: Array<{
    value: string;
    label: string;
    rowData: Record<string, any>;
  }>;
  relationType?: {
    _id: string;
    name: string;
  };
  relationTable?: {
    _id: string;
    name: string;
  };
  lookupFields?: string[];
}

interface ApiResponse {
  success: boolean;
  data: {
    _id: string;
    name: string;
    description: string;
    fields: ExtendedTemplateField[];
    workspace: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  message: string;
}

interface FormFieldValue {
  fieldName: string;
  fieldType: string;
  fieldValue: string | string[] | { rowId: string; displayValues: Record<string, any> } | null;
  templateFieldId: string;
  isRequired: boolean;
  description?: string;
  relationType?: {
    _id: string;
    name: string;
  };
  relationTable?: {
    _id: string;
    name: string;
  };
  lookupFields?: string[];
  multiple?: boolean;
}

interface TemplateSection {
  templateId: string;
  templateName: string;
  templateDescription: string;
  fields: FormFieldValue[];
  sectionId: string;
}

interface ModuleData {
  sections: TemplateSection[];
}

const getFieldIcon = (type: string) => {
  switch (type) {
    case 'text':
      return <Type className='h-4 w-4 text-gray-500' />;
    case 'relation':
      return <Database className='h-4 w-4 text-gray-500' />;
    case 'number':
      return <Hash className='h-4 w-4 text-gray-500' />;
    case 'date':
      return <Calendar className='h-4 w-4 text-gray-500' />;
    case 'select':
      return <CheckSquare className='h-4 w-4 text-gray-500' />;
    case 'file':
      return <File className='h-4 w-4 text-gray-500' />;
    case 'longtext':
      return <FileText className='h-4 w-4 text-gray-500' />;
    default:
      return <Type className='h-4 w-4 text-gray-500' />;
  }
};

const validateField = (field: ExtendedTemplateField, value: any): string | null => {
  if (field.required && (!value || (Array.isArray(value) && value.length === 0))) {
    return `${field.name} is required`;
  }

  if (field.validations) {
    if (
      field.validations.minLength &&
      typeof value === 'string' &&
      value.length < field.validations.minLength
    ) {
      return `${field.name} must be at least ${field.validations.minLength} characters`;
    }
    if (
      field.validations.maxLength &&
      typeof value === 'string' &&
      value.length > field.validations.maxLength
    ) {
      return `${field.name} must be at most ${field.validations.maxLength} characters`;
    }
    if (
      field.validations.pattern &&
      typeof value === 'string' &&
      !new RegExp(field.validations.pattern).test(value)
    ) {
      return `${field.name} must match the required pattern`;
    }
    if (
      field.validations.minItems &&
      Array.isArray(value) &&
      value.length < field.validations.minItems
    ) {
      return `${field.name} must have at least ${field.validations.minItems} items`;
    }
    if (
      field.validations.maxItems &&
      Array.isArray(value) &&
      value.length > field.validations.maxItems
    ) {
      return `${field.name} must have at most ${field.validations.maxItems} items`;
    }
  }

  return null;
};

export default function NewModuleFromTemplateSheet({
  isOpen,
  onClose,
  template,
  templateName,
}: NewModuleFromTemplateSheetProps) {
  const [moduleName, setModuleName] = useState(templateName || template.name);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [sections, setSections] = useState<TemplateSection[]>([
    {
      templateId: template._id,
      templateName: template.name,
      templateDescription: template.description,
      fields: [],
      sectionId: `${template._id}-0`,
    },
  ]);
  const [templateDataMap, setTemplateDataMap] = useState<Record<string, ApiResponse>>({});
  const [sectionFormValues, setSectionFormValues] = useState<Record<string, Record<string, any>>>(
    {},
  );
  const [sectionFieldErrors, setSectionFieldErrors] = useState<
    Record<string, Record<string, string>>
  >({});
  const queryClient = useQueryClient();
  const { project } = useProject();

  // Fetch all available templates for the dropdown
  const { data: availableTemplates } = useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const response = await newRequest.get('/module-templates');
      return response.data.data;
    },
    enabled: isOpen,
  });

  // Fetch initial template data
  useEffect(() => {
    if (isOpen) {
      newRequest.get(`/module-templates/${template._id}`).then((response) => {
        setTemplateDataMap((prev) => {
          return {
            ...prev,
            [template._id]: response.data,
          };
        });
        // Initialize form values for the first section
        const initialValues: Record<string, any> = {};
        response.data.data.fields.forEach((field: ExtendedTemplateField) => {
          initialValues[field._id] = field.multiple ? [] : '';
        });
        setSectionFormValues((prev) => {
          return {
            ...prev,
            [template._id]: initialValues,
          };
        });
      });
    }
  }, [isOpen, template._id]);

  // Mutation for creating a module
  const createModuleMutation = useMutation({
    mutationFn: async (moduleData: ModuleData) => {
      const response = await newRequest.post(
        `/project-modules/templated-module/${project?._id}`,
        moduleData,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectModules'] });
      toast.success('Module created successfully');
      onClose();
      setSectionFormValues({});
      setSections([
        {
          templateId: template._id,
          templateName: template.name,
          templateDescription: template.description,
          fields: [],
          sectionId: `${template._id}-0`,
        },
      ]);
    },
  });

  const handleAddTemplate = (templateId: string) => {
    const selectedTemplate = availableTemplates?.find((t) => {
      return t._id === templateId;
    });
    if (!selectedTemplate) return;

    // Count existing sections with this template to create unique sectionId
    const existingSectionsCount = sections.filter((s) => {
      return s.templateId === templateId;
    }).length;
    const newSectionId = `${templateId}-${existingSectionsCount}`;

    // Add new section
    setSections((prev) => {
      return [
        ...prev,
        {
          templateId: selectedTemplate._id,
          templateName: selectedTemplate.name,
          templateDescription: selectedTemplate.description,
          fields: [],
          sectionId: newSectionId,
        },
      ];
    });

    // Fetch and add new template data if not already in map
    if (!templateDataMap[templateId]) {
      newRequest.get(`/module-templates/${templateId}`).then((response) => {
        const templateData = response.data;
        setTemplateDataMap((prev) => {
          return {
            ...prev,
            [templateId]: templateData,
          };
        });
        // Initialize form values for the new section
        const initialValues: Record<string, any> = {};
        templateData.data.fields.forEach((field: ExtendedTemplateField) => {
          initialValues[field._id] = field.multiple ? [] : '';
        });
        setSectionFormValues((prev) => {
          return {
            ...prev,
            [newSectionId]: initialValues,
          };
        });
      });
    } else {
      // If template data already exists, just initialize the form values
      const templateData = templateDataMap[templateId];
      const initialValues: Record<string, any> = {};
      templateData.data.fields.forEach((field: ExtendedTemplateField) => {
        initialValues[field._id] = field.multiple ? [] : '';
      });
      setSectionFormValues((prev) => {
        return {
          ...prev,
          [newSectionId]: initialValues,
        };
      });
    }

    setIsPopoverOpen(false);
  };

  const handleFieldChange = (templateId: string, fieldId: string, value: any) => {
    setSectionFormValues((prev) => {
      const newValues = {
        ...prev,
        [templateId]: {
          ...prev[templateId],
          [fieldId]: value,
        },
      };

      // Validate the field
      const templateData = templateDataMap[templateId];
      const field = templateData?.data.fields.find((f) => {
        return f._id === fieldId;
      });

      if (field) {
        const error = validateField(field, value);
        setSectionFieldErrors((prev) => {
          return {
            ...prev,
            [templateId]: {
              ...prev[templateId],
              [fieldId]: error || '',
            },
          };
        });
      }

      return newValues;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const errors: Record<string, Record<string, string>> = {};
    let hasErrors = false;

    sections.forEach((section) => {
      const templateData = templateDataMap[section.templateId];
      if (!templateData?.data?.fields) return;

      const sectionErrors: Record<string, string> = {};
      templateData.data.fields.forEach((field) => {
        const error = validateField(field, sectionFormValues[section.sectionId]?.[field._id]);
        if (error) {
          sectionErrors[field._id] = error;
          hasErrors = true;
        }
      });
      errors[section.sectionId] = sectionErrors;
    });

    if (hasErrors) {
      setSectionFieldErrors(errors);
      toast.error('Please fix the errors in the form');
      return;
    }

    const updatedSections = sections.map((section) => {
      const templateData = templateDataMap[section.templateId];
      if (!templateData?.data?.fields) return section;

      const fields: FormFieldValue[] = templateData.data.fields.map((field) => {
        const fieldValue = sectionFormValues[section.sectionId]?.[field._id];

        if (field.type === 'relation') {
          const selectedOption = field.selectOptions?.find((opt) => {
            return opt.value === fieldValue;
          });

          return {
            fieldName: field.name,
            fieldType: field.type,
            fieldValue: selectedOption
              ? {
                  rowId: selectedOption.value,
                  displayValues: selectedOption.rowData,
                }
              : null,
            templateFieldId: field._id,
            isRequired: field.required || false,
            description: field.description || '',
            relationType: field.relationType,
            relationTable: field.relationTable,
            lookupFields: field.lookupFields,
            multiple: field.multiple || false,
          };
        }

        return {
          fieldName: field.name,
          fieldType: field.type,
          fieldValue: fieldValue || '',
          templateFieldId: field._id,
          isRequired: field.required || false,
          description: field.description || '',
          relationType: field.relationType,
          relationTable: field.relationTable,
          lookupFields: field.lookupFields,
          multiple: field.multiple || false,
        };
      });

      return {
        ...section,
        fields,
      };
    });

    const moduleData: ModuleData = {
      sections: updatedSections,
    };

    createModuleMutation.mutate(moduleData);
  };

  const renderField = (templateId: string, field: ExtendedTemplateField) => {
    const error = sectionFieldErrors[templateId]?.[field._id];
    const value = sectionFormValues[templateId]?.[field._id];

    switch (field.type) {
      case 'text':
        return (
          <div className='space-y-1'>
            <Input
              id={field._id}
              value={value || ''}
              onChange={(e) => {
                return handleFieldChange(templateId, field._id, e.target.value);
              }}
              placeholder={`Enter ${field.name}`}
              required={field.required}
              className={error ? 'border-red-500' : ''}
            />
            {error && <p className='text-sm text-red-500'>{error}</p>}
          </div>
        );
      case 'longtext':
        return (
          <div className='space-y-1'>
            <Textarea
              id={field._id}
              value={value || ''}
              onChange={(e) => {
                return handleFieldChange(templateId, field._id, e.target.value);
              }}
              placeholder={`Enter ${field.name}`}
              required={field.required}
              className={error ? 'border-red-500' : ''}
            />
            {error && <p className='text-sm text-red-500'>{error}</p>}
          </div>
        );
      case 'number':
        return (
          <div className='space-y-1'>
            <Input
              id={field._id}
              type='number'
              value={value || ''}
              onChange={(e) => {
                return handleFieldChange(templateId, field._id, e.target.valueAsNumber);
              }}
              placeholder={`Enter ${field.name}`}
              required={field.required}
              className={error ? 'border-red-500' : ''}
            />
            {error && <p className='text-sm text-red-500'>{error}</p>}
          </div>
        );
      case 'date':
        return (
          <div className='space-y-1'>
            <Input
              id={field._id}
              type='date'
              value={value || ''}
              onChange={(e) => {
                return handleFieldChange(templateId, field._id, e.target.value);
              }}
              placeholder={`Enter ${field.name}`}
              required={field.required}
              className={error ? 'border-red-500' : ''}
            />
            {error && <p className='text-sm text-red-500'>{error}</p>}
          </div>
        );
      case 'relation':
        return (
          <div className='space-y-1'>
            <Select
              value={value || ''}
              onValueChange={(value) => {
                return handleFieldChange(templateId, field._id, value);
              }}
              required={field.required}
            >
              <SelectTrigger className={error ? 'border-red-500' : ''}>
                <SelectValue placeholder={`Select ${field.name}`} />
              </SelectTrigger>
              <SelectContent>
                {field.selectOptions?.map((option) => {
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {error && <p className='text-sm text-red-500'>{error}</p>}
          </div>
        );
      case 'select':
        return (
          <div className='space-y-1'>
            <Select
              value={value || ''}
              onValueChange={(value) => {
                return handleFieldChange(templateId, field._id, value);
              }}
              required={field.required}
            >
              <SelectTrigger className={error ? 'border-red-500' : ''}>
                <SelectValue placeholder={`Select ${field.name}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option, index) => {
                  return (
                    <SelectItem key={`${option}-${index}`} value={option}>
                      {option}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {error && <p className='text-sm text-red-500'>{error}</p>}
          </div>
        );
      default:
        return null;
    }
  };

  const renderSection = (section: TemplateSection, index: number) => {
    const templateData = templateDataMap[section.templateId];
    if (!templateData?.data?.fields) return null;

    return (
      <div key={section.sectionId} className='space-y-4'>
        {index > 0 && <Separator className='my-4' />}
        <div className='space-y-2'>
          <h3 className='text-lg font-semibold'>{section.templateName}</h3>
          {section.templateDescription && (
            <p className='text-sm text-gray-500'>{section.templateDescription}</p>
          )}
        </div>

        {templateData.data.fields.map((field: ExtendedTemplateField) => {
          return (
            <div key={`${section.sectionId}-field-${field._id}`} className='space-y-2'>
              <div className='flex items-center gap-2'>
                {getFieldIcon(field.type)}
                <Label htmlFor={field._id}>{field.name}</Label>
                {field.required && <span className='text-red-500'>*</span>}
              </div>
              {field.description && <p className='text-sm text-gray-500'>{field.description}</p>}
              {renderField(section.sectionId, field)}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className='sm:max-w-md h-full flex flex-col min-w-[650px]'>
        <SheetHeader>
          <SheetTitle>Create from Template</SheetTitle>
          <SheetDescription>Create a new module by combining multiple templates.</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className='flex-1 flex flex-col min-h-0 scrollbar-hide'>
          <div className='flex-1 overflow-y-auto space-y-4 py-4 scrollbar-hide'>
            <div className='space-y-2'>
              <Label htmlFor='moduleName'>Module Name</Label>
              <Input
                id='moduleName'
                value={moduleName}
                onChange={(e) => {
                  return setModuleName(e.target.value);
                }}
                placeholder='Enter module name'
                required
              />
            </div>

            {sections.map((section, index) => {
              return renderSection(section, index);
            })}

            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild>
                <Button type='button' variant='outline' className='w-full justify-start'>
                  <Plus className='mr-2 h-4 w-4' />
                  Append from another template
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-[var(--radix-popover-trigger-width)] p-0' align='start'>
                <div className='grid gap-2 p-4'>
                  {availableTemplates?.map((template) => {
                    return (
                      <Button
                        key={template._id}
                        variant='ghost'
                        className='w-full justify-start'
                        onClick={() => {
                          return handleAddTemplate(template._id);
                        }}
                      >
                        {template.name}
                      </Button>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <SheetFooter className='flex-none border-t pt-4 pb-0'>
            <Button type='submit' disabled={createModuleMutation.isPending}>
              {createModuleMutation.isPending ? 'Creating...' : 'Create Module'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
