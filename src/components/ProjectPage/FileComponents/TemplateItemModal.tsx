import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { ProjectFile, Template, TemplateField, TemplateFieldValue } from '@/lib/mock/projectFiles';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, DollarSign, FileUp, Link2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface TemplateItemModalProps {
  template: Template;
  onClose: () => void;
  onSave: (item: ProjectFile) => void;
  existingItem?: ProjectFile;
}

const TemplateItemModal: React.FC<TemplateItemModalProps> = ({
  template,
  onClose,
  onSave,
  existingItem,
}) => {
  const [itemName, setItemName] = useState(existingItem?.name || '');
  const [fieldValues, setFieldValues] = useState<TemplateFieldValue[]>(
    existingItem?.templateValues ||
      template.fields.map((field) => ({
        fieldId: field.id,
        value: field.defaultValue || null,
        fileUrl: '',
      })),
  );
  const [files, setFiles] = useState<{ [key: string]: File | null }>({});

  // Initialize with existing values if in edit mode
  useEffect(() => {
    if (existingItem) {
      setItemName(existingItem.name);
      if (existingItem.templateValues) {
        setFieldValues(existingItem.templateValues);
      }
    }
  }, [existingItem]);

  const handleFieldChange = (fieldId: string, value: string | number | null, fileUrl?: string) => {
    setFieldValues(
      fieldValues.map((field) =>
        field.fieldId === fieldId ? { ...field, value, fileUrl: fileUrl || field.fileUrl } : field,
      ),
    );
  };

  const handleFileChange = (fieldId: string, file: File | null) => {
    if (file) {
      const updatedFiles = { ...files, [fieldId]: file };
      setFiles(updatedFiles);

      // Create a temporary URL for preview
      const fileUrl = URL.createObjectURL(file);
      handleFieldChange(fieldId, file.name, fileUrl);
    }
  };

  const getFieldValue = (fieldId: string) => {
    return fieldValues.find((field) => field.fieldId === fieldId)?.value || '';
  };

  const getFieldFileUrl = (fieldId: string) => {
    return fieldValues.find((field) => field.fieldId === fieldId)?.fileUrl || '';
  };

  const validateFields = () => {
    for (const field of template.fields) {
      if (field.required) {
        const value = getFieldValue(field.id);
        if (!value && value !== 0) {
          return `Field "${field.name}" is required`;
        }
      }
    }
    return null;
  };

  const handleSave = () => {
    if (!itemName.trim()) {
      alert('Please enter an item name');
      return;
    }

    const validationError = validateFields();
    if (validationError) {
      alert(validationError);
      return;
    }

    // Calculate total size of files
    let totalSize = 0;
    Object.values(files).forEach((file) => {
      if (file) totalSize += file.size;
    });

    // If we're editing, we need to use the existing size and just add any new files
    let formattedSize = existingItem?.size || '1.0 KB';

    if (totalSize > 0) {
      formattedSize =
        totalSize > 1024 * 1024
          ? `${(totalSize / (1024 * 1024)).toFixed(1)} MB`
          : `${(totalSize / 1024).toFixed(1)} KB`;
    }

    const newItem: ProjectFile = {
      id: existingItem?.id || `item-${Date.now()}`,
      name: itemName,
      type: 'custom_template_item',
      dateUploaded: existingItem?.dateUploaded || new Date().toISOString(),
      size: formattedSize,
      status: existingItem?.status || 'active',
      uploadedBy: existingItem?.uploadedBy || 'Current User', // Would come from auth in a real app
      templateId: template.id,
      templateValues: fieldValues,
      attachments: existingItem?.attachments || [],
      comments: existingItem?.comments || [],
      // If this is an edit, preserve version history
      versions: existingItem?.versions || [],
    };

    // If we're editing, create a new version
    if (existingItem) {
      const currentDate = new Date().toISOString();

      // Create a version of the previous state if versions don't exist yet
      if (!newItem.versions || newItem.versions.length === 0) {
        newItem.versions = [
          {
            id: `v1-${existingItem.id}`,
            date: existingItem.dateUploaded,
            createdBy: existingItem.uploadedBy,
            changes: 'Initial version',
            data: { ...existingItem },
          },
        ];
      }

      // Add the current state as a new version
      newItem.versions.push({
        id: `v${newItem.versions.length + 1}-${newItem.id}`,
        date: currentDate,
        createdBy: 'Current User',
        changes: 'Updated template item values',
        data: { ...existingItem },
      });

      // Update the last modified date
      newItem.lastModified = currentDate;
    }

    onSave(newItem);
    onClose();
  };

  const renderFieldInput = (field: TemplateField) => {
    switch (field.type) {
      case 'text':
        return (
          <Input
            id={`field-${field.id}`}
            placeholder={`Enter ${field.name.toLowerCase()}`}
            value={(getFieldValue(field.id) as string) || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
          />
        );

      case 'number':
        return (
          <Input
            id={`field-${field.id}`}
            type='number'
            placeholder={`Enter ${field.name.toLowerCase()}`}
            value={(getFieldValue(field.id) as string) || ''}
            onChange={(e) =>
              handleFieldChange(field.id, e.target.value ? Number(e.target.value) : null)
            }
          />
        );

      case 'file':
        return (
          <div className='space-y-2'>
            <div className='flex items-center gap-2'>
              <Input
                id={`field-${field.id}`}
                type='file'
                accept={field.fileTypes?.map((type) => `.${type}`).join(',')}
                className='hidden'
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  handleFileChange(field.id, file);
                }}
              />
              <Button
                type='button'
                variant='outline'
                onClick={() => document.getElementById(`field-${field.id}`)?.click()}
                className='flex items-center gap-2'
              >
                <FileUp className='h-4 w-4' />
                Choose file
              </Button>
              <span className='text-sm text-muted-foreground'>
                {getFieldValue(field.id) || 'No file selected'}
              </span>
            </div>
            {getFieldFileUrl(field.id) && (
              <div className='mt-2'>
                {['png', 'jpg', 'jpeg', 'gif', 'svg'].some((ext) =>
                  ((getFieldValue(field.id) as string) || '').toLowerCase().endsWith(ext),
                ) ? (
                  <img
                    src={getFieldFileUrl(field.id)}
                    alt='Preview'
                    className='max-h-32 rounded-md border'
                  />
                ) : (
                  <div className='p-4 bg-muted rounded-md text-center'>
                    File preview not available
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'enum':
        return (
          <Select
            value={(getFieldValue(field.id) as string) || ''}
            onValueChange={(value) => handleFieldChange(field.id, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${field.name.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'link':
        return (
          <div className='relative'>
            <Link2 className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              id={`field-${field.id}`}
              placeholder='https://...'
              value={(getFieldValue(field.id) as string) || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              className='pl-8'
            />
          </div>
        );

      case 'date':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !getFieldValue(field.id) && 'text-muted-foreground',
                )}
              >
                <CalendarIcon className='mr-2 h-4 w-4' />
                {getFieldValue(field.id) ? (
                  format(new Date(getFieldValue(field.id) as string), 'PPP')
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-0'>
              <Calendar
                mode='single'
                selected={
                  getFieldValue(field.id) ? new Date(getFieldValue(field.id) as string) : undefined
                }
                onSelect={(date) => handleFieldChange(field.id, date ? date.toISOString() : null)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );

      case 'price':
        return (
          <div className='relative'>
            <DollarSign className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              id={`field-${field.id}`}
              type='number'
              step='0.01'
              placeholder='0.00'
              value={(getFieldValue(field.id) as string) || ''}
              onChange={(e) =>
                handleFieldChange(field.id, e.target.value ? Number(e.target.value) : null)
              }
              className='pl-8'
            />
          </div>
        );

      case 'dimension':
        return (
          <div className='flex items-center gap-2'>
            <Input
              id={`field-${field.id}`}
              type='number'
              step='0.1'
              placeholder='0'
              value={(getFieldValue(field.id) as string) || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value ? e.target.value : null)}
              className='flex-1'
            />
            {field.unit && <span className='text-sm text-muted-foreground w-16'>{field.unit}</span>}
          </div>
        );

      default:
        return (
          <Input
            id={`field-${field.id}`}
            placeholder={`Enter ${field.name.toLowerCase()}`}
            value={(getFieldValue(field.id) as string) || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
          />
        );
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[600px] max-h-[90vh] overflow-auto'>
        <DialogHeader>
          <DialogTitle>
            {existingItem ? `Edit ${template.name} Item` : `Create ${template.name} Item`}
          </DialogTitle>
          <DialogDescription>
            {existingItem
              ? `Update the details for this ${template.name.toLowerCase()}.`
              : `Fill in the details for this ${template.name.toLowerCase()}.`}
          </DialogDescription>
        </DialogHeader>

        <div className='flex flex-col space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='item-name'>Item Name</Label>
            <Input
              id='item-name'
              placeholder={`Enter ${template.name.toLowerCase()} name`}
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
          </div>

          <div className='space-y-4 pt-2'>
            {template.fields.map((field) => (
              <div key={field.id} className='space-y-2'>
                <Label htmlFor={`field-${field.id}`} className='flex items-center'>
                  {field.name}
                  {field.required && <span className='text-destructive ml-1'>*</span>}
                </Label>
                {field.description && (
                  <p className='text-xs text-muted-foreground mb-1'>{field.description}</p>
                )}
                {renderFieldInput(field)}
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' type='button' onClick={onClose}>
            Cancel
          </Button>
          <Button type='button' onClick={handleSave}>
            {existingItem ? 'Save Changes' : 'Create Item'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateItemModal;
