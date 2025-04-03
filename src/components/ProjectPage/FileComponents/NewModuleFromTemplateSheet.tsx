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
import { newRequest } from '@/utils/newRequest';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

interface NewModuleFromTemplateSheetProps {
  isOpen: boolean;
  onClose: () => void;
  template: Template;
  onSave: (moduleData: any) => void;
}

// Extend the TemplateField type to include the API response structure
interface ExtendedTemplateField extends Omit<TemplateField, 'id'> {
  _id: string;
  selectOptions?: Array<{
    value: string;
    label: string;
    rowData: Record<string, any>;
  }>;
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

export default function NewModuleFromTemplateSheet({
  isOpen,
  onClose,
  template,
  onSave,
}: NewModuleFromTemplateSheetProps) {
  const [formValues, setFormValues] = useState<Record<string, any>>({});

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
    mutationFn: async (moduleData: any) => {
      const response = await newRequest.post('/project-modules', moduleData);
      return response.data;
    },
    onSuccess: (data) => {
      onSave(data);
      // Reset form
      setFormValues({});
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const moduleData = {
      templateId: template._id,
      fields: Object.entries(formValues).map(([fieldId, value]) => {
        return {
          fieldId,
          value,
        };
      }),
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
          {fullTemplateData?.data.fields.map((field: ExtendedTemplateField) => {
            return (
              <div key={field._id} className='space-y-2'>
                <Label htmlFor={field._id}>{field.name}</Label>
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
