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
import {
  InventoryItem,
  ProjectFile,
  Template,
  TemplateField,
  TemplateFieldValue,
} from '@/lib/mock/projectFiles';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, DollarSign, FileUp, Link2, Package, Search } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface TemplateItemModalProps {
  template: Template;
  onClose: () => void;
  onSave: (item: ProjectFile) => void;
  existingItem?: ProjectFile;
  inventoryItems?: InventoryItem[];
  updateInventoryStock?: (itemId: string, quantity: number) => InventoryItem | undefined;
  trackInventoryUsage?: (
    templateItemId: string,
    inventoryItemId: string,
    projectId?: string,
  ) => void;
}

const TemplateItemModal: React.FC<TemplateItemModalProps> = ({
  template,
  onClose,
  onSave,
  existingItem,
  inventoryItems = [],
  updateInventoryStock,
  trackInventoryUsage,
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
  const [inventorySearch, setInventorySearch] = useState('');

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
    if (!validateFields()) return;

    const requiredFields = template.fields.filter((field) => field.required);
    for (const field of requiredFields) {
      const value = getFieldValue(field.id);
      if (value === undefined || value === null || value === '') {
        alert(`Please fill in the required field: ${field.name}`);
        return;
      }
    }

    const newItem: ProjectFile = {
      id: existingItem?.id || `template-item-${Date.now()}`,
      name: itemName || template.name,
      type: 'custom_template_item',
      dateUploaded: existingItem?.dateUploaded || new Date().toISOString(),
      lastModified: existingItem ? new Date().toISOString() : undefined,
      size: '0 KB',
      uploadedBy: 'Current User',
      templateId: template.id,
      templateValues: fieldValues,
      attachments: [],
      comments: [],
      versions: existingItem?.versions || [],
    };

    // Track inventory usage and update stock for any inventory item fields
    fieldValues.forEach((fieldValue) => {
      if (fieldValue.inventoryItemId) {
        // Track usage if function is provided
        if (trackInventoryUsage) {
          trackInventoryUsage(newItem.id, fieldValue.inventoryItemId);
        }

        // Update stock if function is provided (reduce by 1 for demonstration)
        if (updateInventoryStock) {
          updateInventoryStock(fieldValue.inventoryItemId, 1);
        }
      }
    });

    // Create a version entry when editing an existing item
    if (existingItem) {
      const versionEntry = {
        id: `v-${Date.now()}`,
        date: new Date().toISOString(),
        createdBy: 'Current User',
        changes: 'Updated template item values',
        data: { ...existingItem, templateValues: [...(existingItem.templateValues || [])] },
      };

      newItem.versions = [...(existingItem.versions || []), versionEntry];
    }

    onSave(newItem);
    onClose();
  };

  const findInventoryItem = (itemId: string): InventoryItem | undefined => {
    return inventoryItems.find((item) => item.id === itemId);
  };

  const filteredInventoryItems = inventoryItems.filter(
    (item) =>
      item.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
      item.sku.toLowerCase().includes(inventorySearch.toLowerCase()) ||
      item.category.toLowerCase().includes(inventorySearch.toLowerCase()),
  );

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

      case 'inventory_item':
        const selectedItemId = getFieldValue(field.id) as string;
        const selectedItem = selectedItemId ? findInventoryItem(selectedItemId) : undefined;

        return (
          <div className='space-y-3'>
            <div className='relative'>
              <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Search inventory items...'
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
                className='pl-8'
              />
            </div>

            {selectedItem && (
              <div className='flex items-center p-2 bg-muted rounded-md gap-2'>
                {selectedItem.imageUrl && (
                  <img
                    src={selectedItem.imageUrl}
                    alt={selectedItem.name}
                    className='h-10 w-10 rounded-md object-cover border'
                  />
                )}
                <div className='flex-1'>
                  <div className='font-medium'>{selectedItem.name}</div>
                  <div className='text-xs text-muted-foreground'>SKU: {selectedItem.sku}</div>
                </div>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => handleFieldChange(field.id, null)}
                  className='text-red-500 hover:text-red-700 hover:bg-red-50'
                >
                  Remove
                </Button>
              </div>
            )}

            <div className='max-h-64 overflow-y-auto border rounded-md'>
              {filteredInventoryItems.length === 0 ? (
                <div className='p-4 text-center text-sm text-muted-foreground'>No items found</div>
              ) : (
                <div className='divide-y'>
                  {filteredInventoryItems.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        'flex items-center p-2 hover:bg-muted cursor-pointer gap-2',
                        selectedItemId === item.id && 'bg-blue-50',
                      )}
                      onClick={() => handleFieldChange(field.id, item.id)}
                    >
                      <Package className='h-4 w-4 text-muted-foreground' />
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className='h-8 w-8 rounded-md object-cover border'
                        />
                      )}
                      <div className='flex-1'>
                        <div className='font-medium'>{item.name}</div>
                        <div className='text-xs text-muted-foreground'>
                          SKU: {item.sku} | {item.category}
                        </div>
                      </div>
                      <div className='text-xs text-right'>
                        <div>${item.price.toFixed(2)}</div>
                        <div className='text-muted-foreground'>Stock: {item.stock}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
