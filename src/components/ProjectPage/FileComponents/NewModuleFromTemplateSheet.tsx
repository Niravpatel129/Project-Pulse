import { Template, TemplateField } from '@/api/models';
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
import { Calendar, CheckSquare, Database, File, FileText, Hash, Type } from 'lucide-react';
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

interface ModuleData {
  templateId: string;
  templateName: string;
  templateDescription: string;
  fields: FormFieldValue[];
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
  const queryClient = useQueryClient();
  const { project } = useProject();

  // Fetch full template data when template ID is available
  const { data: fullTemplateData, isLoading } = useQuery<ApiResponse>({
    queryKey: ['template', template?._id],
    queryFn: async () => {
      if (!template?._id) return null;
      const response = await newRequest.get(`/module-templates/${template._id}`);
      return response.data;
    },
    enabled: !!template?._id && isOpen,
  });

  // Initialize form values when template data is fetched
  useEffect(() => {
    if (fullTemplateData?.data) {
      const initialValues: Record<string, any> = {};
      fullTemplateData.data.fields.forEach((field: ExtendedTemplateField) => {
        initialValues[field._id] = field.multiple ? [] : '';
      });
      setFormValues(initialValues);
    }
  }, [fullTemplateData]);

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
      // invalidate the query
      queryClient.invalidateQueries({ queryKey: ['projectModules'] });
      // Reset form
      toast.success('Module created successfully');
      onClose();
      setFormValues({});
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullTemplateData?.data) return;

    const fields: FormFieldValue[] = fullTemplateData.data.fields.map((field) => {
      const fieldValue = formValues[field._id];

      // Handle relation fields differently
      if (field.type === 'relation') {
        // Find the selected option's data
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

      // Handle non-relation fields normally
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

    const moduleData: ModuleData = {
      templateId: template._id,
      templateName: moduleName,
      templateDescription: fullTemplateData.data.description,
      fields,
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
      <SheetContent className='sm:max-w-md'>
        <SheetHeader>
          <SheetTitle>Create from Template</SheetTitle>
          <SheetDescription>
            Create a new module based on the template &ldquo;{template?.name}&rdquo;.
          </SheetDescription>
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

          {fullTemplateData?.data.fields.map((field: ExtendedTemplateField) => {
            return (
              <div key={field._id} className='space-y-2'>
                <div className='flex items-center gap-2'>
                  {getFieldIcon(field.type)}
                  <Label htmlFor={field._id}>{field.name}</Label>
                </div>
                {field.description && <p className='text-sm text-gray-500'>{field.description}</p>}
                {renderField(field)}
              </div>
            );
          })}

          <SheetFooter>
            <Button type='submit' disabled={createModuleMutation.isPending || isLoading}>
              {createModuleMutation.isPending ? 'Creating...' : 'Create Module'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
