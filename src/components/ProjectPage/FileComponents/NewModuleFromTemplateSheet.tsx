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

export default function NewModuleFromTemplateSheet({
  isOpen,
  onClose,
  template,
  templateName,
}: NewModuleFromTemplateSheetProps) {
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [moduleName, setModuleName] = useState(templateName || template.name);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [sections, setSections] = useState<TemplateSection[]>([
    {
      templateId: template._id,
      templateName: template.name,
      templateDescription: template.description,
      fields: [],
    },
  ]);
  const queryClient = useQueryClient();
  const { project } = useProject();

  // Fetch all available templates for the dropdown
  const { data: availableTemplates } = useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const response = await newRequest.get('/module-templates');
      return response.data.data; // Access the data array from the response
    },
    enabled: isOpen,
  });

  // Fetch full template data for each section
  const templateQueries = useQuery({
    queryKey: [
      'templates',
      sections.map((s) => {
        return s.templateId;
      }),
    ],
    queryFn: async () => {
      const responses = await Promise.all(
        sections.map((section) => {
          return newRequest.get(`/module-templates/${section.templateId}`);
        }),
      );
      return responses.map((r) => {
        return r.data;
      });
    },
    enabled: sections.length > 0 && isOpen,
  });

  // Initialize form values when template data is fetched
  useEffect(() => {
    if (templateQueries.data) {
      const initialValues: Record<string, any> = {};
      templateQueries.data.forEach((templateData) => {
        templateData.data.fields.forEach((field: ExtendedTemplateField) => {
          initialValues[field._id] = field.multiple ? [] : '';
        });
      });
      setFormValues(initialValues);
    }
  }, [templateQueries.data]);

  // Mutation for creating a module
  const createModuleMutation = useMutation({
    mutationFn: async (moduleData: ModuleData) => {
      const response = await newRequest.post(
        `/project-modules/templated-module/${project?._id}`,
        moduleData,
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projectModules'] });
      toast.success('Module created successfully');
      onClose();
      setFormValues({});
      setSections([
        {
          templateId: template._id,
          templateName: template.name,
          templateDescription: template.description,
          fields: [],
        },
      ]);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!templateQueries.data) return;

    const updatedSections = sections.map((section, index) => {
      const templateData = templateQueries.data[index];
      const fields: FormFieldValue[] = templateData.data.fields.map((field) => {
        const fieldValue = formValues[field._id];

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

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormValues((prev) => {
      return {
        ...prev,
        [fieldId]: value,
      };
    });
  };

  const handleAddTemplate = (templateId: string) => {
    const selectedTemplate = availableTemplates?.find((t) => {
      return t._id === templateId;
    });
    if (!selectedTemplate) return;

    setSections((prev) => {
      return [
        ...prev,
        {
          templateId: selectedTemplate._id,
          templateName: selectedTemplate.name,
          templateDescription: selectedTemplate.description,
          fields: [],
        },
      ];
    });
    setIsPopoverOpen(false);
  };

  const renderField = (field: ExtendedTemplateField) => {
    switch (field.type) {
      case 'text':
        return (
          <Input
            id={field._id}
            value={formValues[field._id] || ''}
            onChange={(e) => {
              return handleFieldChange(field._id, e.target.value);
            }}
            placeholder={`Enter ${field.name}`}
            required={field.required}
          />
        );
      case 'relation':
        return (
          <Select
            value={formValues[field._id] || ''}
            onValueChange={(value) => {
              return handleFieldChange(field._id, value);
            }}
            required={field.required}
          >
            <SelectTrigger>
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
        );
      default:
        return null;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className='sm:max-w-md h-full overflow-scroll'>
        <SheetHeader>
          <SheetTitle>Create from Template</SheetTitle>
          <SheetDescription>Create a new module by combining multiple templates.</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className='space-y-4 py-4'>
          <div className='space-y-2'>
            <Label htmlFor='moduleName'>Module Name</Label>
            <Input
              id='moduleName'
              value={moduleName}
              onChange={(e) => {
                return setModuleName(e.target.value);
              }}
              placeholder='Enter module name'
            />
          </div>

          {sections.map((section, sectionIndex) => {
            return (
              <div
                key={`section-${sectionIndex}-template-${section.templateId}`}
                className='space-y-4'
              >
                {sectionIndex > 0 && <Separator className='my-4' />}
                <div className='space-y-2'>
                  <h3 className='text-lg font-semibold'>{section.templateName}</h3>
                  {section.templateDescription && (
                    <p className='text-sm text-gray-500'>{section.templateDescription}</p>
                  )}
                </div>

                {templateQueries.data?.[sectionIndex]?.data.fields.map(
                  (field: ExtendedTemplateField) => {
                    return (
                      <div key={`section-${sectionIndex}-field-${field._id}`} className='space-y-2'>
                        <div className='flex items-center gap-2'>
                          {getFieldIcon(field.type)}
                          <Label htmlFor={field._id}>{field.name}</Label>
                        </div>
                        {field.description && (
                          <p className='text-sm text-gray-500'>{field.description}</p>
                        )}
                        {renderField(field)}
                      </div>
                    );
                  },
                )}
              </div>
            );
          })}

          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <Button type='button' variant='outline' className='w-full justify-start'>
                <Plus className='mr-2 h-4 w-4' />
                Add another template
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

          <SheetFooter>
            <Button
              type='submit'
              disabled={createModuleMutation.isPending || templateQueries.isLoading}
            >
              {createModuleMutation.isPending ? 'Creating...' : 'Create Module'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
